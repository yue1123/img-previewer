import { readFileSync } from 'node:fs'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8')

// shorten private members in the min build, except names that are also option or hook context keys
const publicKeys = new Set(Array.from(read('./src/types.ts').matchAll(/^\s*(\w+)\??:/gm), (m) => m[1]))
const privates = Array.from(read('./src/index.ts').matchAll(/^\s*private (\w+)/gm), (m) => m[1]).filter(
	(name) => !publicKeys.has(name)
)

// drop the line breaks and indentation of the html template, runs on the compiled js
// where they are escaped as \n and \t inside string literals
const compactTemplate = {
	name: 'compact-template',
	transform(code, id) {
		if (!id.endsWith('template.ts')) return null
		return { code: code.replace(/\\n(\\t)*/g, ''), map: null }
	}
}

const name = 'ImgPreviewer'
const banner = `/*!
 * ${name} v${pkg.version}
 * ${pkg.homepage}
 *
 * Copyright 2021-present ${pkg.author.name}
 * Released under the ${pkg.license} license
 */`

export default {
	input: 'src/bundle.ts',
	output: [
		{ banner, name, file: 'dist/img-previewer.js', format: 'umd', exports: 'default' },
		{
			banner,
			name,
			file: 'dist/img-previewer.min.js',
			format: 'umd',
			exports: 'default',
			plugins: [
				terser({
					compress: { passes: 3 },
					// DOM property names are kept by terser even if listed here
					mangle: { properties: { regex: new RegExp(`^(${privates.join('|')})$`) } }
				})
			]
		},
		{ banner, file: 'dist/img-previewer.esm.js', format: 'es' }
	],
	plugins: [
		typescript({ outDir: 'dist', declaration: false }),
		compactTemplate,
		replace({ preventAssignment: true, __VERSION__: JSON.stringify(pkg.version) }),
		postcss({ extract: 'index.css', minimize: true })
	]
}

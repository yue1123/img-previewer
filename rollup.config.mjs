import { readFileSync } from 'node:fs'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
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
		{ banner, name, file: 'dist/img-previewer.min.js', format: 'umd', exports: 'default', plugins: [terser()] },
		{ banner, file: 'dist/img-previewer.esm.js', format: 'es' }
	],
	plugins: [
		typescript({ outDir: 'dist', declaration: false }),
		replace({ preventAssignment: true, __VERSION__: JSON.stringify(pkg.version) }),
		postcss({ extract: 'index.css', minimize: true })
	]
}

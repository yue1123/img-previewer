const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const changeCase = require('change-case')
const createBanner = require('create-banner')
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');
const less = require('rollup-plugin-less')
const { terser } = require('rollup-plugin-terser')
const pkg = require('./package')
const json = require('@rollup/plugin-json');

const name = changeCase.pascalCase(pkg.name)
const banner = createBanner({
    data: {
        name,
        year: '2021-present'
    }
})

module.exports = {
	input: 'src/index.ts',
	output: [
		{
			banner,
			name,
			file: `dist/${pkg.name}.js`,
			format: 'umd'
		},
		{
			banner,
			name,
			file: `dist/${pkg.name}.min.js`,
			format: 'umd',
			plugins: [terser()]
		}
	],
	plugins: [
		nodeResolve(),
		commonjs(),
		typescript(),
		babel({
			exclude: 'node_modules/**'
		}),
		less({
			output: './dist/index.css',
			option: { compress: true }
		}),
		json()
	]
}

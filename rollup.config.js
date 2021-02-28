const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const changeCase = require('change-case')
const createBanner = require('create-banner')
const { terser } = require('rollup-plugin-terser')
const pkg = require('./package')

const name = changeCase.pascalCase(pkg.name)
const banner = createBanner({
	data: {
		name,
		year: '2021-present'
	}
})

module.exports = {
	input: 'src/index.js',
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
		},
		{
			banner,
			name,
			file: `demo/js/${pkg.name}.min.js`,
			format: 'umd',
			plugins: [terser()]
		}
	],
	plugins: [
		nodeResolve(),
		babel({
			exclude: 'node_modules/**'
		})
	]
}

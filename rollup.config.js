const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const changeCase = require('change-case')
const createBanner = require('create-banner')
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');

const { terser } = require('rollup-plugin-terser')
const pkg = require('./package')

import css from 'rollup-plugin-css-only'
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
        // {
        //     banner,
        //     name,
        //     file: `dist/${pkg.name}.min.js`,
        //     format: 'umd',
        //     plugins: [terser()]
        // },
        // {
        //     banner,
        //     name,
        //     file: `demo/js/${pkg.name}.min.js`,
        //     format: 'umd',
        //     plugins: [terser()]
        // }
    ],
    plugins: [
        nodeResolve(),

        // css({
        //     output: 'index.css'
        // })
        commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
        typescript(), // 解析TypeScript
        babel({
            exclude: 'node_modules/**'
        }),
        // // 热更新 默认监听根文件夹
        // livereload(),
        // // 本地服务器
        // serve({
        // 	open: true, // 自动打开页面
        // 	port: 8000,
        // 	openPage: '/demo/index.html', // 打开的页面
        // 	contentBase: ''
        // })
    ]
}

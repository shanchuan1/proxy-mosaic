/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-28 20:18:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-28 22:14:28
 */
const {createVuePlugin} = require('vite-plugin-vue2');
const commonjs = require('vite-plugin-commonjs');
// const server = require('./vue.develop.config');
const path = require('path');
// const {createStyleImportPlugin} = require('vite-plugin-style-import');
// const { viteSvgPlugin, vitePluginRaw } = require('./vite-plugin');
const viteRequireContext = require('@originjs/vite-plugin-require-context');
const server = require('./vue.develop.config')


const extensions = ['.js', '.jsx', '.json', '.ts', '.tsx', '.vue']

let config = {
    base: '/doc-manage-web',
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.join(__dirname, 'apps/doc-manage-web/src'),
        },
        {
          find: /^~.+/,
          replacement: val => val.replace(/^~/, ''),
        },
        {
          find: '@root',
          replacement: path.join(__dirname, 'apps/doc-manage-web'),
        },
        {
          find: '@template',
          replacement: path.join(__dirname, 'apps/doc-manage-web/src/pages/template-manage'),
        },
        {
          find: 'static',
          replacement: path.join(__dirname, 'apps/doc-manage-web/public/static'),
        },
        // {
        //   find: 'plugins',
        //   replacement: path.join(__dirname, 'apps/doc-manage-web/plugins'),
        // },
      ],
      extensions,
    },
    assetsInclude: ['**/*.html'],
    plugins: [
      createVuePlugin(),
      commonjs.default({ extensions }),
      // 按需引入
      // createStyleImportPlugin({
      //   libs: [
      //     {
      //       libraryName: 'mint-ui',
      //       resolveStyle: name => `mint-ui/lib/${name}/style.css`,
      //     },
      //   ],
      // }),
    //   viteSvgPlugin([
    //     { path: 'src/assets/svg/', idPrefix: 'icon' },
    //     { path: 'src/assets/text-control-svg/', idPrefix: 'icon' },
    //   ]),
      // viteRequireContext.default({projectBasePath: path.join(__dirname, './apps/doc-manage-web')}),
      viteRequireContext.default()
    //   vitePluginRaw({
    //     match: /\.html$/,
    //   }),
    ],
    define: {
      'process.env': process.env,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/constant.scss";`
        },
      },
    },
    server
  }

module.exports = config
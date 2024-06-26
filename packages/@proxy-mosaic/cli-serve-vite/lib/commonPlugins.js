/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-06-01 13:00:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-17 10:43:58
 */
const { createVuePlugin } = require('vite-plugin-vue2');
const commonjs = require('vite-plugin-commonjs');
const viteRequireContext = require('@originjs/vite-plugin-require-context');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const { createStyleImportPlugin } = require('vite-plugin-style-import');
const { viteControlPlugin, tryCatchWrapperPlugin, transformScss } = require('./vitePlugins')
const extensions = [
  '.mjs',
  '.js',
  '.mts',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
  '.vue',
];
const commonPlugins = [
  createVuePlugin(), // v2 or v3
  commonjs.default({ extensions }),
  viteRequireContext.default(),// 兼容webpack使用 require.context() 来动态查找文件内容
  viteCommonjs(), // 兼容 commonjs 语法
  // viteControlPlugin(),
  tryCatchWrapperPlugin('vite:import-analysis'),
  transformScss()
  // createStyleImportPlugin()
];

module.exports = commonPlugins;

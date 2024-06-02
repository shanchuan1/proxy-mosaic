/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-06-01 13:00:54
 * @LastEditors:
 * @LastEditTime: 2024-06-02 13:33:50
 */
const { createVuePlugin } = require('vite-plugin-vue2');
const commonjs = require('vite-plugin-commonjs');
const viteRequireContext = require('@originjs/vite-plugin-require-context');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const { createStyleImportPlugin } = require('vite-plugin-style-import');
const { viteControlPlugin, tryCatchWrapperPlugin } = require('./vitePlugins')
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
  viteRequireContext.default(),
  viteCommonjs(),
  // viteControlPlugin(),
  tryCatchWrapperPlugin('vite:import-analysis'),
  // createStyleImportPlugin()
];

module.exports = commonPlugins;

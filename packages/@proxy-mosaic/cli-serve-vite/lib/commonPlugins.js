const { createVuePlugin } = require('vite-plugin-vue2');
const commonjs = require('vite-plugin-commonjs');
const viteRequireContext = require('@originjs/vite-plugin-require-context');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const { createStyleImportPlugin } = require('vite-plugin-style-import');
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
  // createStyleImportPlugin()
];

module.exports = commonPlugins;

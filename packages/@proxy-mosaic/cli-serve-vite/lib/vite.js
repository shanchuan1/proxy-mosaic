// import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
const { createVuePlugin } = require('vite-plugin-vue2');
const commonjs = require('vite-plugin-commonjs');
const viteRequireContext = require('@originjs/vite-plugin-require-context');
const { createStyleImportPlugin } = require('vite-plugin-style-import');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const path = require('path');

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

// 通用默认抹平webpack to vite 配置项
const initialConfig = {
  configFile: false,
  base: '',
  assetsInclude: ['**/*.html'],
  plugins: [
    createVuePlugin(),
    commonjs.default({ extensions }),
    viteRequireContext.default(),
    viteCommonjs(),
    // createStyleImportPlugin()
  ],
  server: {
    open: true,
    host: '0.0.0.0',
    port: 3000,
    https: false,
    hotOnly: false,
    quiet: false,
    stats: 'errors-only',
    clientLogLevel: 'none',
  },
  css: {},
  resolve: {
    alias: [],
    extensions,
  },
  define: {
    'process.env': process.env,
  },
};

class ViteConfigManager {
  constructor(initialConfig) {
    this.config = { ...initialConfig };
  }

  // 获取配置的只读副本
  getConfig() {
    return { ...this.config };
  }

  // 设置或更新配置的某个属性
  setProperty(path, value) {
    const keys = path.split('.');
    let current = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    if (typeof value === 'string') {
      current[keys[keys.length - 1]] = value;
    } else {
      current[keys[keys.length - 1]] = Array.isArray(value)
        ? [...current[keys[keys.length - 1]], ...value]
        : { ...current[keys[keys.length - 1]], ...value };
    }
  }

  // 获取配置的某个属性
  getProperty(path) {
    const keys = path.split('.');
    let current = this.config;
    for (const key of keys) {
      if (current.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }
}

module.exports = new ViteConfigManager(initialConfig);

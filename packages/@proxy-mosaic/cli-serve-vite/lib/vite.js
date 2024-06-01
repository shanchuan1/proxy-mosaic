/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-29 19:37:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-01 23:01:37
 */
const commonPlugins = require('./commonPlugins');

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
    ...commonPlugins,
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

  getConfig() {
    return { ...this.config };
  }

  setProperty(path, value) {
    const segments = path.split('.');
    let current = this.config;

    for (let i = 0; i < segments.length; i++) {
      if (i === segments.length - 1) {
        if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          // 对象
          current[segments[i]] = current[segments[i]]
            ? { ...current[segments[i]], ...value }
            : value;
        } else if (Array.isArray(value)) {
          // 数组
          current[segments[i]] = current[segments[i]]
            ? current[segments[i]].concat(value)
            : value;
        } else {
          current[segments[i]] = value;
        }
      } else {
        if (!current[segments[i]]) current[segments[i]] = {};
        current = current[segments[i]];
      }
    }
  }

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

  mergeConfig(defineConfig) {
    const mergeDeep = (target, source) => {
      Object.keys(source).forEach((key) => {
        if (
          source[key] instanceof Object &&
          source[key].constructor === Object
        ) {
          if (!target[key]) target[key] = {};
          mergeDeep(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
          if (!target[key]) target[key] = [];
          source[key].forEach((item) => {
            if (!target[key].includes(item)) {
              target[key].push(item);
            }
          });
        } else {
          target[key] = source[key];
        }
      });
    };

    mergeDeep(this.config, defineConfig);
  }
}

module.exports = new ViteConfigManager(initialConfig);

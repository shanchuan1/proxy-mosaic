// import { createHtmlPlugin } from 'vite-plugin-html'
// import { createVuePlugin} from "vite-plugin-vue2";
// import ViteRequireContext from '@originjs/vite-plugin-require-context'
// import { viteCommonjs } from '@originjs/vite-plugin-commonjs'


const initialConfig = {
  base: "",
  assetsInclude: ["**/*.html"],
  plugins: [
    // createVuePlugin(),
    // createHtmlPlugin({
    //   minify: true,
    //   entry: "src/main.js",
    //   template: "public/index.vite.html",
    // }),
    // ViteRequireContext(),
    // viteCommonjs(),
  ],
  server: {},
  css: {},
  resolve: {
    alias: [],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  define: {
    'process.env': process.env
  },
}


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
    current[keys[keys.length - 1]] = value;
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

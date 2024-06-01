const { createServer } = require('vite');
const path = require('path');
const fs = require('fs').promises;
// const viteDynamicHtmlPlugin = require('./vite-dynamic-html-plugin');
const { viteDynamicHtmlPlugin } = require('./vitePlugins');

const defaultAliasConfig = [
  {
    find: /^~.+/,
    replacement: (val) => val.replace(/^~/, ''),
  },
];

const transAliasConfig = (config) => {
  const transArr = Object.entries(config)
    .map(([k, v]) => {
      return {
        find: k,
        replacement: v,
      };
    })
    .filter((v) => v.replacement.includes('\\'));
  return defaultAliasConfig.concat(transArr);
};

class viteServerManager {
  constructor() {
    this.viteConfigManager = require('./vite');
  }

  async transformWebpackToVite(dest) {
    const vueConfig = require(`${dest}/vue.config.js`);

    this.viteConfigManager.setProperty('base', vueConfig.publicPath);
    this.viteConfigManager.setProperty('server', vueConfig.devServer);
    this.viteConfigManager.setProperty(
      'resolve.alias',
      transAliasConfig(vueConfig.configureWebpack.resolve.alias),
    );
    this.viteConfigManager.setProperty(
      'css.preprocessorOptions.scss.additionalData',
      vueConfig.css.loaderOptions.sass.prependData.replace(/~/g, ''),
    );

    // 由于文件操作涉及异步，这部分可以单独处理或移到外部调用时执行
    // await this.processHtmlFile(dest);
  }

  async processHtmlFile(dest) {
    const vueCliHtml = await fs.promises.readFile(
      `${dest}/public/index.html`,
      'utf8',
    );
    console.log('🚀 ~ processHtmlFile ~ vueCLiHtml:', vueCLiHtml);
    this.viteConfigManager.setProperty('plugins', [
      viteDynamicHtmlPlugin({
        inputHtml: vueCLiHtml,
        params: {
          '/doc-manage-web/static/favicon.ico': '/public/static/favicon.ico',
          '/doc-manage-web/static/polyfills/object.js':
            '/public/static/polyfills/object.js',
        },
        additionalScripts: ['src/main.js'],
        newTitle: vueConfig.publicPath,
        rootDir: dest,
      }),
    ]);
  }

  async transInputViteConfig() {
    const mosaicViteConfig = require(`${process.cwd()}/mosaic.config.js`).viteConfig;
    const { innerConfig, defineConfig } = mosaicViteConfig;

    this.viteConfigManager.mergeConfig(defineConfig);

    for (const key in innerConfig) {
      if (key === 'plugins') {
        let plugins = [];
        innerConfig[key].forEach((it) => {
          for (const pluginName in it) {
            const plugin = require('./vitePlugins')[pluginName](it[pluginName]);
            plugins.push(plugin);
          }
        });
        this.viteConfigManager.setProperty(key, plugins);
      }
    }
  }

  async startViteServer(options) {
    const { dest, repos } = options;
    await this.transformWebpackToVite(dest);
    await this.transInputViteConfig();

    try {
      const config = this.viteConfigManager.getConfig();
      // console.log('🚀 ~ startViteServer ~ config:', config);

      const server = await createServer(config);
      console.log('🚀 ~ viteServerManager ~ startViteServer ~ css:', server.config.css)
      await server.listen();
      server.printUrls();
    } catch (error) {
      console.error(`startViteServer ~ error: ${error}`);
      process.exit(0);
    }
  }
}
module.exports = {
  viteServerManager: async(options) => await new viteServerManager().startViteServer(options),
};

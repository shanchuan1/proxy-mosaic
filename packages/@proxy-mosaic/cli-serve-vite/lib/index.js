const { createServer } = require('vite');
const ViteConfigManager = require('./vite');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');
const dynamicHtmlPlugin = require('./vite-dynamic-html-plugin');



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

const transformWebpackToVite = async (dest) => {
  console.log('🚀 ~ transformWebpackToVite ~ dest:', dest);
  const vueConfig = require(`${dest}/vue.config.js`);
  ViteConfigManager.setProperty('base', vueConfig.publicPath);
  ViteConfigManager.setProperty('server', vueConfig.devServer);
  ViteConfigManager.setProperty(
    'resolve.alias',
    transAliasConfig(vueConfig.configureWebpack.resolve.alias),
  );
  ViteConfigManager.setProperty(
    'css.preprocessorOptions.scss.additionalData',
    vueConfig.css.loaderOptions.sass.prependData.replace(/~/g, ''),
  );
  // const vueCLiHtml = await fs.readFile(`${dest}\\public\\index.html`, 'utf8');
  // console.log('🚀 ~ transformWebpackToVite ~ vueCLiHtml:', vueCLiHtml);
  // ViteConfigManager.setProperty('plugins', [
  //   dynamicHtmlPlugin({
  //     inputHtml: vueCLiHtml,
  //     params: {
  //       '/doc-manage-web/static/favicon.ico':
  //         '/public/static/favicon.ico',
  //       '/doc-manage-web/static/polyfills/object.js':
  //         '/public/static/polyfills/object.js',
  //     },
  //     additionalScripts: ['src/main.js'],
  //     newTitle: vueConfig.publicPath,
  //     rootDir: dest,
  //   }),
  // ]);
};

const viteServerManager = async (dest) => {
  await transformWebpackToVite(dest);
  try {
    const config = ViteConfigManager.getConfig();
    // console.log('🚀 ~ viteServerManager ~ config:', config)
    // process.chdir(path.join(__dirname))

    const server = await createServer(config);
    await server.listen();
    server.printUrls();
  } catch (error) {
    console.error(`processStart ~ error: ${error}`);
    process.exit(0);
  }
};

module.exports = {
  viteServerManager,
};

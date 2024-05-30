const { createServer } = require('vite');
const ViteConfigManager = require('./vite');
const path = require('path');
const http = require('http');
const { createHtmlPlugin } = require('vite-plugin-html');


const rootPath = path.join(__dirname, './index.html')

const defaultAliasConfig = [
  {
    find: /^~.+/,
    replacement: val => val.replace(/^~/, ''),
  },
]

const transAliasConfig = (config) => {
  const transArr =  Object.entries(config).map(([k,v])=>{
    return {
      find: k,
      replacement: v,
    }
  }).filter(v=> v.replacement.includes('\\'))
  return defaultAliasConfig.concat(transArr)
}


const transformWebpackToVite = (dest) => {
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
  // ViteConfigManager.setProperty(
  //   'plugins',
  //   [
  //     createHtmlPlugin({
  //       minify: true,
  //       entry: `${dest}/src/main.js`,
  //       template: rootPath,
  //     }),
  //   ],
  // );
};

const viteServerManager = async (dest) => {
  transformWebpackToVite(dest);
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
  viteServerManager
}

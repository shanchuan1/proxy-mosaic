/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-06-01 12:46:53
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-17 10:41:45
 */
const fs = require('fs').promises;
const path = require('path');
const { createHtml } = require('./html-generator');
const { findEntryPaths, getExtraPart } = require('./utils');

exports.viteDynamicHtmlPlugin = (options = {}) => ({
  name: 'vite-dynamic-html-plugin',
  async configResolved(config) {
    // 改变服务器根目录（如果需要）
    if (options.rootDir) {
      config.root = path.resolve(options.rootDir);
      console.log('🚀 ~ configResolved ~ options:', options);
    }
  },
  configureServer(server) {
    console.log('🚀 ~ configureServer ~ server:', server);
    const base = server.config.base || '/';

    server.middlewares.use(async (req, res, next) => {
      // 当请求根目录或直接请求 /index.html 时，返回动态生成的 index.html
      if (req.url === base || req.url === `${base}index.html`) {
        try {
          // 使用自定义函数生成HTML内容
          const htmlTemp = createHtml(
            options.inputHtml,
            options.params,
            options.additionalScripts,
            options.newTitle,
          );
          const html = await server.transformIndexHtml(
            req.url,
            htmlTemp,
            req.originalUrl,
          );
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(html);
        } catch (err) {
          console.error(`Failed to generate dynamic index.html: ${err}`);
          res.statusCode = 500;
          res.end('Error generating index.html');
        }
      } else {
        next();
      }
    });
  },
});

const SecFetchDestMap = {
  document: '.html',
  script: '.js',
  font: '.font',
  image: ['.jpp', '.png'],
  style: '.css',
};
/*
示例：
viteRedirectPlugin({fromPrefix: '/plugins', toPrefix: '/apps/doc-manage-web/plugins'})
viteRedirectPlugin({ fromPrefix: '/plugins' }),
*/
exports.viteRedirectPlugin = (options = {}) => ({
  name: 'vite-redirect-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const { fromPrefix, toPrefix } = options;
      const urlPath = req.url;
      const rootDirectory = server.config.root.replace(/\//g, '\\');
      const base = server.config.base.replace(/\//g, '');

      if (urlPath.startsWith(fromPrefix)) {
        let filepath;
        let newPath;
        if (fromPrefix && toPrefix) {
          newPath = `${toPrefix}${urlPath.replace(fromPrefix, '')}`;
          filepath = `${path.resolve(server.config.root, '.' + newPath)}`;
        } else {
          filepath = (await findEntryPaths(rootDirectory, base)) + urlPath.replace(/\//g, '\\');
          newPath = getExtraPart(filepath, rootDirectory);
        }
        const resolvedPath = `${filepath}${
          SecFetchDestMap[req.headers['sec-fetch-dest']]
        }`;
        try {
          await fs.access(resolvedPath, 0);
          // 文件存在，模拟重定向
          res.statusCode = 302;
          res.setHeader('Location', newPath);
          res.end();
        } catch (err) {
          next();
        }
      } else {
        next();
      }
    });
  },
});


exports.viteControlPlugin = () => ({
    name: 'vite-control-plugin',
    configResolved(config) {
      if (config.plugins.some(p => p.name === 'vite:import-analysis')) {
        config.plugins.map(v=> {
          if (v.name === 'vite:import-analysis') {
            v.transform = (async() => {try{ await v.transform() }catch(e){}})
            v.configureServer = (() => {try{  v.configureServer() }catch(e){}})
          }
        })
      }
    },
})


let originalTransform;
exports.tryCatchWrapperPlugin = (targetPluginName) => (
  {
    name: 'try-catch-transform-wrapper',
    enforce: 'pre', // 尝试在目标插件之前执行
    configResolved(config) {
      // 在配置解析完毕后查找目标插件，并保存其transform方法
      const targetPlugin = config.plugins.find(plugin => plugin.name === targetPluginName);
      if (targetPlugin && typeof targetPlugin.transform === 'function') {
        originalTransform = targetPlugin.transform.bind(targetPlugin);
        delete targetPlugin.transform; // 移除原始transform，以防止直接调用
      } else {
        console.warn(`Unable to find or wrap transform for plugin named "${targetPluginName}".`);
      }
    },
    transform(code, id) {
      try {
        // 尝试执行原始transform方法（如果找到的话）
        if (originalTransform) {
          return originalTransform(code, id);
        }
      } catch (error) {
        console.error(`Error caught during transformation by ${targetPluginName}:`, error);
        // 可以选择处理错误，比如返回一个备份的处理结果或空的处理结果
        return null; // 或者根据需要返回一个合适的错误处理结果
      }
    },
}
)


// wepack中使用的node-sass，深度选择器为/deep/，在sass中不兼容，需要使用自定义插件将 /deep/ 替换为 ::v-deep
exports.transformScss = () => {
  return {
    name: 'vite-plugin-transform-scss',
    enforce: 'pre',
    transform(src, id) {
      if (
        /\.(js|ts|tsx|vue)(\?)*/.test(id) &&
        id.includes('lang.scss') &&
        !id.includes('node_modules')
      ) {
        return {
          code: src.replace(/\/deep\//gi, '::v-deep'),
        };
      }
    },
  };
}

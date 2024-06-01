/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-06-01 12:46:53
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-01 14:39:09
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

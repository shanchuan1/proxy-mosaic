/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-30 20:48:51
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-31 18:37:19
 */
const { createHtml } = require('./html-generator');
const { resolve } = require('path');

module.exports = (options = {}) => ({
  name: 'vite-dynamic-html-plugin',
  async configResolved(config) {
    // 改变服务器根目录（如果需要）
    if (options.rootDir) {
      config.root = resolve(options.rootDir);
    }
  },
  configureServer(server) {
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
            options.newTitle
          );
          const html = await server.transformIndexHtml(req.url, htmlTemp, req.originalUrl);
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

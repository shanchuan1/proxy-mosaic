/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-30 20:48:51
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-30 22:20:10
 */
const { createHtml } = require('./html-generator'); // 假设这里有一个生成HTML的函数
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
          const html = createHtml(
            options.inputHtml,
            options.params,
            options.additionalScripts,
            options.newTitle
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
        next(); // 其他请求正常处理
      }
    });
  },
});


/* 使用此插件
const params = {
  "/doc-manage-web/static/favicon.ico": "/new-path/favicon.ico",
  "/apps/doc-manage-web/public/static/polyfills/object.js": "/new-path/object.js",
  "/apps/doc-manage-web/src/main.js": "/new-path/main.js"
};

const additionalScripts = ["/new-script1.js", "/new-script2.js"];
const newTitle = "新的文档中心";

module.exports = defineConfig({
  base: '/doc', // Set the base URL
  plugins: [
    dynamicHtmlPlugin({
      inputHtml,
      params,
      additionalScripts,
      newTitle,
      rootDir: 'new-root-directory' // 设置新的根目录
    })
  ]
})


*/

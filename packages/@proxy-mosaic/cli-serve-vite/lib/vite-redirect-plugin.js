/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-29 20:57:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-29 21:57:49
 */
// customRedirectPlugin.js
const fs = require('fs').promises;
const path = require('path');

module.exports = (options = {}) => ({
  name: 'vite-redirect-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const { fromPrefix, toPrefix } = options;
      const urlPath = req.url;
      if (urlPath.startsWith(fromPrefix)) {
        const newPath = `${toPrefix}${urlPath.replace(fromPrefix, '')}`;
        const resolvedPath = `${path.resolve(
          server.config.root,
          '.' + newPath,
        )}.js`;
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

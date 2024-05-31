/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-28 20:04:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-29 14:09:29
 */
const { createServer } = require('vite');
const viteConfig = require('./vite-config');

const { server, ...OtherConfig} = viteConfig


// 自定义Vite配置项
const customViteConfig = {
  configFile: false,
  server: {
    open: true,
    host: '0.0.0.0',
    port: 3000,
    https: false,
    hotOnly: false,
    quiet: false,
    stats: 'errors-only',
    clientLogLevel: 'none',
    ...server
  },
  ...OtherConfig
};

async function startDevServer() {
  try {
    const server = await createServer(customViteConfig);
    await server.listen();
    server.printUrls();

  } catch (e) {
    console.error('Failed to start server:', e);
  }
}

startDevServer();

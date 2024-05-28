/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-28 20:04:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-28 21:58:24
 */
const { createServer } = require('vite');
const viteConfig = require('./vite')

// 自定义Vite配置项
const customViteConfig = {
  // 你的自定义配置
  // root: './apps/doc-manage-web', // 指定工作根目录
  configFile: false,
  server: {
    port: 3000, // 自定义端口号
    open: true, // 自动打开浏览器
    // 其他server配置...
  },
  ...viteConfig
  // 其它Vite配置项...
};

async function startDevServer() {
  try {
    const server = await createServer(customViteConfig);
    await server.listen();
    server.printUrls();
    server.transformRequest('/plugin');
    console.log('🚀 ~ startDevServer ~ server:', server)

  } catch (e) {
    console.error('Failed to start server:', e);
  }
}

startDevServer();
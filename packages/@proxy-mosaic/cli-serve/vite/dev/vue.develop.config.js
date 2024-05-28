/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-28 21:13:05
 * @LastEditors: 
 * @LastEditTime: 2024-05-28 22:21:12
 */
// const targetProxy = 'https://tianyin6-dev.tsign.cn/'

const targetProxy = 'http://tianyin6-stable.tsign.cn/'

// const targetProxy = 'http://lp-6-0-9-0-beta-4-esn.projectk8s.tsign.cn/'

// 测试：'http://tianyin6-stable.tsign.cn/'
// 开发： http://tianyin6-dev.tsign.cn/

const otherWebProxy = {
  '/main-login-web/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/main-index-web/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/sso/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/portal/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/seal/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/esign-docs/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/file/': {
    target: targetProxy,
    changeOrigin: true,
  },
  '/esign-signs/': {
    target: targetProxy,
    changeOrigin: true,
  },
}

module.exports = {
  open: true,
  host: '0.0.0.0',
  port: 5000,
  https: false,
  hotOnly: false,
  quiet: false,
  stats: 'errors-only',
  clientLogLevel: 'none',
  proxy: {
    [`${process.argv.includes('mock') ? '/test/' : '/esign-docs/'}`]: {
      target: targetProxy,
      changeOrigin: true,
      secure: false,
    },
    ...otherWebProxy,
    '/plugins': {
      target: 'http://localhost:5001/doc-manage-web/apps/doc-manage-web/plugins'
    }
  },
  after: process.argv.includes('mock') ? require('./src/mock/mock-server.js') : () => {},
}

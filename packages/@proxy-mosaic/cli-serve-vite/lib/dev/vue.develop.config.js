/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-27 14:19:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-29 17:23:56
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
  '/plugins': {
    target: 'http://localhost:5000/apps/doc-manage-web/',
    changeOrigin: true,
  }
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
  },
  after: () => {},
}

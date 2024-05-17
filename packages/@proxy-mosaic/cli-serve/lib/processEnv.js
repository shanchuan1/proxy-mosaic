/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 13:49:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 14:14:56
 */

const path = require("path");

// console.log('🚀 ~ global.cwd:', path.resolve(process.cwd(), 'mosaic.config.js'))
// console.log('🚀 ~ global.cwd:', path.join(process.cwd(), 'mosaic.config.js'))
// console.log('process.env.MOSAIC_CLI_CONTEXT', process.env.MOSAIC_CLI_CONTEXT);


// 设置环境变量
// process.env.SHARED_DATA = JSON.stringify({ name: 'zhangsan' });
// 或使用cross-env跨平台设置环境变量
// require('cross-env').env.SHARED_DATA = JSON.stringify({ key: 'value' });
// const sharedData = JSON.parse(process.env.SHARED_DATA);


process.env.SHARED_DATA

const setProcessEnv = (...arg) => {
    process.env.SHARED_DATA = JSON.stringify(...arg)
}

const getProcessEnv = () => {
    return JSON.parse(process.env.SHARED_DATA)
}

module.exports = {
    setProcessEnv,
    getProcessEnv
}
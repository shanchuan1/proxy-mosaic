/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-16 18:17:21
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 10:16:48
 */
[
    'env',
    'pkg',
    'ora'
  ].forEach(m => {
    Object.assign(exports, require(`./lib/${m}`))
  })
  
  exports.chalk = require('chalk')
  exports.execa = require('execa')
  exports.semver = require('semver')
  

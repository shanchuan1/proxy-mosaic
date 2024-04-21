#!/usr/bin/env node
const { commandOptions } = require('../src/actuator/commander');
const { actuator, checkNodeVersion } = require('../src/actuator/index');

// 执行命令的当前路径
global.LocalPathCWD = process.cwd()
console.log('🚀 ~ global.LocalPathCWD:', global.LocalPathCWD)


checkNodeVersion()

// 统一执行器
actuator(commandOptions)
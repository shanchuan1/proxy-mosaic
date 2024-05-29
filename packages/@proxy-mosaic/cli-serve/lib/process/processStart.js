/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-29 11:15:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-29 11:30:17
 */

const { viteServerManager } = require('@proxy-mosaic/cli-serve-vite')
const ReposConfigurator = require("../mosaicConfig");



/**
 * @description: app的统一冷服务启动
 * @param {*} params
 * @return {*}
 */
module.exports = processExecStart = async (params) => {
   const Repos = new ReposConfigurator(params.paths);
   let repos = await Repos.getRepos("start");

   //TODO: 校验是否vue2+cli，则vite冷服务启动
   for (const repo of repos) {
    await viteServerManager(repo.dest)
   }

};

/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-14 17:11:21
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 11:05:49
 */
const ReposConfigurator = require("../mosaicConfig");
const { chalk } = require("@proxy-mosaic/cli-shared-utils");

/**
 * @description: 检查仓库信息
 * @param {*} processExecInspect
 * @return {*}
 */
module.exports = processExecInspect = async (configs) => {
  const { paths, options } = configs;

  const Repos = new ReposConfigurator(paths);
  const repos = await Repos.show(options);
  
  console.log(
    `${chalk.green("[INFO]")} Inspect the ${chalk.blue(
      options.branch ? "branch" : "repos"
    )} information of the apps `
  );
  console.log(repos);
  process.exit(0);
};
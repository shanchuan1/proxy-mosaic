/*
 * @Description: 服务器部署模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 16:50:34
 */
const chalk = require("chalk");
const path = require("path");
const ReposConfigurator = require("../mosaicConfig");
const SSHLoader = require("../ssh");
const { validateServerConfig } = require("../utils");
const { spinner_fail } = require("../actuator/ora").processOra();

const packagesOutputPath = `${
  process.env.MOSAIC_CLI_CONTEXT || process.cwd()
}\\packages`;

/**
 * @description: 服务器部署执行
 * @param {*} configs
 * @return {*}
 */
module.exports = processExecDeploy = async (configs) => {
  const {
    paths,
    options: { serverConfig },
  } = configs;
  const Repos = new ReposConfigurator(paths, { serverConfig });
  const repos = await Repos.getRepos();
  const currentBranch = repos[0].branches.current;
  validateServerConfig(serverConfig);

  const sshOptions = {
    localPath: packagesOutputPath,
    zipName: `${path.basename(packagesOutputPath)}_${currentBranch
      .split("/")
      .join("_")}`,
    remotePath: serverConfig.deployDirectory,
    host: serverConfig.ip,
    username: serverConfig.username,
    password: serverConfig.password,
  };

  const sshLoader = new SSHLoader({ ...sshOptions });

  if (paths[0] === "all") {
    sshLoader.deploymentManager();
  } else {
    const needToDeployArray = repos.reduce((array, repo) => {
      const outputPath = repo.packages.packageInputPath;
      if (!outputPath) {
        spinner_fail(
          `Unable to find corresponding path configuration:${chalk.blue(
            repo.name
          )}`
        );
        process.exit(0);
      }
      array.push(outputPath);
      return array;
    }, []);
    sshLoader.deploymentManager(needToDeployArray);
  }
};

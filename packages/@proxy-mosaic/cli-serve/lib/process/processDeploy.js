/*
 * @Description: 服务器部署模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 18:07:52
 */
const path = require("path");
const ReposConfigurator = require("../mosaicConfig");
const SSHLoader = require("../ssh");
const { validateServerConfig } = require("../utils");
const { chalk, processOra } = require("@proxy-mosaic/cli-shared-utils");
const { spinner_fail } = processOra();
const { checkDirEmpty } = require("./processFile");


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
    remotePath: serverConfig.remotePath,
    host: serverConfig.host,
    username: serverConfig.username,
    password: serverConfig.password,
  };

  const sshLoader = new SSHLoader({ ...sshOptions });

  if (paths[0] === "all") {
    const isEmpty = await checkDirEmpty(sshOptions.localPath)
    if (isEmpty) {
      console.log(
        `${chalk.red(
          "[ERROR]"
        )} You need to first execute build to build the front-end package!`
      );
      process.exit(0);
    }
    await sshLoader.deploymentManager();
  } else {
    const needToDeployArray = await repos.reduce(async (array, repo) => {
      const outputPath = repo.packages.packageInputPath;
      if (!outputPath) {
        spinner_fail(
          `Unable to find corresponding path configuration:${chalk.blue(
            repo.name
          )}`
        );
        process.exit(0);
      }
      const isEmpty = await checkDirEmpty(outputPath)
      if (isEmpty) {
        console.log(
          `${chalk.red(
            "[ERROR]"
          )} You need to first execute build to build this resource of ${chalk.blue(
            path.basename(outputPath)
          )}!`
        );
        process.exit(0);
      }
      array.push(outputPath);
      return array;
    }, []);
    await sshLoader.deploymentManager(needToDeployArray);
  }
};

/*
 * @Description: 部署模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-13 17:49:45
 */
const chalk = require("chalk");
const path = require("path");
const { exec } = require("child_process");
const ReposConfigurator = require("../mosaicConfig");
const SSHLoader = require("../ssh");
const { validateServerConfig } = require("../utils");
const execShellFunc = require("../shell/shell");
const { spinner_start, spinner_succeed, spinner_fail } =
  require("../actuator/ora").processOra();

const packagesOutputPath = `${
  process.env.MOSAIC_CLI_CONTEXT || process.cwd()
}\\packages`;

let id_rsa_path = "-i ~/.ssh/id_rsa"; // -i 参数指定本地私钥文件的位置

// 获取拷贝远程服务器的执行命令
const getScpCommand = (localPath, serverConfig) => {
  validateServerConfig(serverConfig);
  return `scp -r ${id_rsa_path} ${localPath} ${serverConfig.username}@${serverConfig.ip}:${serverConfig.deployDirectory}`;
};

/**
 * @description: 执行服务器部署
 * @param {*} configs
 * @return {*}
 */
const processExecDeploy = async (configs) => {
  const {
    paths,
    options: { serverConfig },
  } = configs;
  const Repos = new ReposConfigurator(paths, { serverConfig });
  const repos = await Repos.getRepos();
  const currentBranch = repos[0].branches.current;

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

  console.log("🚀 ~ processExecDeploy ~ sshOptions:", sshOptions);
  console.log("🚀 ~ processExecDeploy ~ paths:", paths);

  const sshLoader = new SSHLoader({ ...sshOptions });

  if (paths[0] === "all") {
    // TODO:部署全部app暂时默认走压缩部署模式
    // const shellOptions = {
    //   localPath: packagesOutputPath,
    //   zipName: `${path.basename(packagesOutputPath)}_${currentBranch.split('/').join('_')}`,
    //   remoteUser: serverConfig.username,
    //   remoteIP: serverConfig.ip,
    //   remotePath: serverConfig.deployDirectory,
    // };
    // execShellFunc(shellOptions);
    sshLoader.compressAndUpload();
  } else {
    // for (const repo of repos) {
    //   const outputPath = repo.packages.packageInputPath;
    //   if (!outputPath) {
    //     spinner_fail(
    //       `Unable to find corresponding path configuration:${chalk.blue(
    //         repo.name
    //       )}`
    //     );
    //     process.exit(0);
    //   }
    //   const scpCommand = getScpCommand(outputPath, serverConfig);
    //   spinner_start(
    //     `Deploying ${chalk.blue(repo.name)} to ${serverConfig.ip} Server`
    //   );
    //   await executeSCPCommand(scpCommand)
    //     .then((stdout) => {
    //       spinner_succeed(
    //         `${chalk.blue(repo.name)} deployed successfully：${stdout}`
    //       );
    //       if (repo.isLastRepo) {
    //         process.exit(0);
    //       }
    //     })
    //     .catch((error) => {
    //       spinner_fail(`Failed to execute SSH command：${chalk.gray(error)}`);
    //       process.exit(0);
    //     });
    // }
    let needToDeployArray = [];
    repos.forEach((repo) => {
      const outputPath = repo.packages.packageInputPath;
      if (!outputPath) {
        spinner_fail(
          `Unable to find corresponding path configuration:${chalk.blue(
            repo.name
          )}`
        );
        process.exit(0);
      }
      needToDeployArray.push(outputPath);
    });
    sshLoader.compressAndUpload(needToDeployArray);
  }
};

/**
 * @description: 执行SCP拷贝命令的函数脚本
 * @param {*} scpCommand
 * @return {*}
 */
const executeSCPCommand = async (scpCommand) => {
  return new Promise((resolve, reject) => {
    exec(scpCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Deployment failed: ${error}`));
        return;
      }

      resolve(stdout);
      if (stderr) {
        console.warn(`Warning message: ${stderr}`);
      }
    });
  });
};

// 重启服务器上的服务（比如Nginx），
const executeSSHCommand = async (command) => {
  const serverConfig = getHandleServerConfig();
  const sshCommand = `ssh ${serverConfig.username}@${serverConfig.ip} "${command}"`;

  return new Promise((resolve, reject) => {
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute SSH command: ${error}`));
        return;
      }

      resolve(stdout);
      if (stderr) {
        console.warn(`Warning message: ${stderr}`);
      }
    });
  });
};

module.exports = {
  processExecDeploy,
};

/*
 * @Description: 部署模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-12 19:22:11
 */
const chalk = require("chalk");
const path = require("path");
const { exec } = require("child_process");
const ReposConfigurator = require("../mosaicConfig");
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
    shellType = "zip",
  } = configs;
  const Repos = new ReposConfigurator(paths, { serverConfig });
  const repos = await Repos.getRepos();
  console.log("🚀 ~ processExecDeploy ~ repos:", repos);
  const currentBranch = repos[0].branches.current;

  if (paths[0] === "all") {
    // TODO:部署全部app暂时默认走压缩部署模式
    if (shellType) {
      const shellOptions = {
        localPath: packagesOutputPath,
        zipName: `${path.basename(packagesOutputPath)}_${currentBranch}`,
        remoteUser: serverConfig.username,
        remoteIP: serverConfig.ip,
        remotePath: serverConfig.deployDirectory,
      };
      execShellFunc(shellOptions);
    }
  } else {
    for (const repo of repos) {
      const outputPath = repo.packages.packageInputPath;
      if (!outputPath) {
        spinner_fail(
          `Unable to find corresponding path configuration:${chalk.blue(
            repo.name
          )}`
        );
        process.exit(0);
      }
      const scpCommand = getScpCommand(outputPath, serverConfig);
      spinner_start(
        `Deploying ${chalk.blue(repo.name)} to ${serverConfig.ip} Server`
      );
      await executeSCPCommand(scpCommand)
        .then((stdout) => {
          spinner_succeed(
            `${chalk.blue(repo.name)} deployed successfully：${stdout}`
          );
          if (repo.isLastRepo) {
            process.exit(0);
          }
        })
        .catch((error) => {
          spinner_fail(`Failed to execute SSH command：${chalk.gray(error)}`);
          process.exit(0);
        });
    }
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

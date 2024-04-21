const { exec } = require("child_process");
const { readFromJs } = require("./temp/index");
const { getHandleServerConfig, getHandleRepos } = require("./getMosaicConfig");


// 获取执行命令
const getScpCommand = (localPath) => {
  const serverConfig = getHandleServerConfig();
  return `scp -r ${localPath} ${serverConfig.username}@${serverConfig.ip}:${serverConfig.deployDirectory}`;
};

// 执行部署
const processExecDeploy = async (paths) => {
  const { newResourceOutPutPath: localPath, ...otherPathConfig } = readFromJs('data');
  //TODO: 动画
  if (paths[0] === "all") {
    const scpCommand = getScpCommand(localPath);
    console.log("🚀 ~ processExecDeploy ~ scpCommand:", scpCommand);
    await executeSCPCommand(scpCommand);
  } else {
    const repos = getHandleRepos(paths);
    console.log("🚀 ~ processExecDeploy ~ repos:", repos);
    await Promise.all(
      repos.map(async (repo) => {
        const outputPath = otherPathConfig[repo.name];
        if (!outputPath) {
          console.error(
            `Unable to find corresponding path configuration:${repo.name}`
          );
          return;
        }
        const scpCommand = getScpCommand(outputPath);
        console.log("🚀 ~ processExecDeploy ~ scpCommand:", scpCommand);
        await executeSCPCommand(scpCommand).catch((error) => {
          console.error(`Failed to execute SSH command：${error}`);
        });;
      })
    );
  }
};

// 执行SCP命令的函数
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
  executeSSHCommand
};

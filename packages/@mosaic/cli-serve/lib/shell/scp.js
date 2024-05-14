const { exec } = require("child_process");
const { validateServerConfig } = require("../utils");


let id_rsa_path = "-i ~/.ssh/id_rsa"; // -i 参数指定本地私钥文件的位置

// 获取拷贝远程服务器的执行命令
const getScpCommand = (localPath, serverConfig) => {
  validateServerConfig(serverConfig);
  return `scp -r ${id_rsa_path} ${localPath} ${serverConfig.username}@${serverConfig.ip}:${serverConfig.deployDirectory}`;
};



/* 调用示例
 const scpCommand = getScpCommand(outputPath, serverConfig);
 await executeSCPCommand(scpCommand)
    .then((stdout) => {
    })
    .catch((error) => {
        process.exit(0);
    });
}


*/


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

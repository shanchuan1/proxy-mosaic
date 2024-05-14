/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:13:07
 * @LastEditors: 
 * @LastEditTime: 2024-05-13 10:03:36
 */
const { spawn } = require("child_process");
const path = require("path");
const fse = require("fs-extra");
const { spinner_succeed, spinner_fail } = require("../actuator/ora").processOra();

const execShellFunc = (options) => {
  const scriptPath = path.join(__dirname, "deploy.sh");

  const { localPath, zipName, remoteUser, remoteIP, remotePath } = options;

  const deletePath = `${localPath}/${zipName}.tar.gz`;

  // spawn执行Shell脚本，并传递参数
  const child = spawn(
    "bash",
    [scriptPath, localPath, zipName, remoteUser, remoteIP, remotePath],  // [deploy.sh, ...参数]
    {
      stdio: "inherit", // 继承标准输入输出，以便在Node.js进程中直接看到脚本的输出
      shell: true, // 在Windows环境下，确保使用shell模式执行
    }
  );

  child.on("error", (error) => {
    spinner_fail(`Failed to execute SSH command：${error}`);
    process.exit(0);
  });

  child.on("exit", async (code) => {
    if (code !== 0) {
      console.error("Script execution failed with exit code:", code);
    } else {
      await fse.remove(deletePath);
      spinner_succeed(`Deployed all apps successfully`);
    }
    process.exit(0);
  });
};

module.exports = execShellFunc;


/* 调用示例

const shellOptions = {
  localPath: packagesOutputPath,
  zipName: `${path.basename(packagesOutputPath)}_${currentBranch.split('/').join('_')}`,
  remoteUser: serverConfig.username,
  remoteIP: serverConfig.ip,
  remotePath: serverConfig.deployDirectory,
};
execShellFunc(shellOptions);

*/
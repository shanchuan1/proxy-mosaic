/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-13 10:26:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 18:22:51
 */
const fs = require("fs");
const archiver = require("archiver");
const path = require("path");
const chalk = require("chalk");
const Client = require("ssh2").Client;
const { spinner_succeed } = require("../actuator/ora").processOra();

class SSHLoader {
  constructor(options) {
    this.localPath = options.localPath;
    this.zipName = options.zipName || "packages.zip";
    this.remotePath = options.remotePath;
    this.host = options.host;
    this.username = options.username || "root";
    this.password = options.password;
  }

  async compressDirectory(directoryPath, outputFilePath) {
    try {
      // The complete output path of the ZIP file
      const output = fs.createWriteStream(outputFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
          console.warn(err);
        } else {
          throw err;
        }
      });

      archive.on("error", function (err) {
        throw err;
      });

      // Processing upon completion of filing
      output.on("close", function () {
        // console.log(`${archive.pointer()} total bytes written.`);
        // console.log(`ZIP file created at: ${outputFilePath}`);
      });

      archive.pipe(output);
      archive.directory(
        directoryPath,
        path.basename(directoryPath) === "packages"
          ? false
          : path.basename(directoryPath)
      );
      await archive.finalize();

      console.log(`${chalk.green("[INFO]")} Compression process completed!`);

      return outputFilePath;
    } catch (error) {
      console.error("Failed to compress directory:", error);
    }
  }

  async clearRemoteDirectory(conn, remoteFileName, remotePath) {
    const clearCmd = remoteFileName.includes("packages")
      ? `rm -rf ${remotePath}/*`
      : `rm -rf ${remotePath}/${
          remoteFileName.split(".")[0]
        } ${remotePath}/${remoteFileName}`;
    return new Promise((resolve, reject) => {
      conn.exec(clearCmd, (clearErr, clearStream) => {
        if (clearErr) return reject(clearErr);
        clearStream
          .on("exit", (code) =>
            code === 0 ? resolve() : reject(`Exit code ${code}`)
          )
          .stderr.on("data", (data) => reject(`Stderr: ${data}`));
      });
    });
  }

  async executeCommand(conn, command) {
    return new Promise((resolve, reject) => {
      conn.exec(command, (execErr, stream) => {
        if (execErr) return reject(execErr);
        stream
          .on("exit", (code) =>
            code === 0 ? resolve() : reject(`Exit code ${code}`)
          )
          .stderr.on("data", (data) => reject(`Stderr: ${data}`));
      });
    });
  }

  async establishSftpSession(conn) {
    return new Promise((resolve, reject) => {
      conn.sftp((err, sftpSession) =>
        err ? reject(err) : resolve(sftpSession)
      );
    });
  }

  // ssh连接
  async performSSH(compressedFilePath, remoteFileName) {
    return new Promise(async (resolve, reject) => {
      const conn = new Client();

      conn
        .on("ready", async () => {
          try {
            console.log(
              `${chalk.green(
                "[INFO]"
              )} SSH client successfully connected and ready!`
            );
            await this.clearRemoteDirectory(
              conn,
              remoteFileName,
              this.remotePath
            );
            console.log(
              `${chalk.green("[INFO]")} Remote directory successfully cleared!`
            );

            const sftp = await this.establishSftpSession(conn);

            const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
            await new Promise((resolveUpload, rejectUpload) => {
              sftp.fastPut(compressedFilePath, remoteFilePath, (err) => {
                if (err) rejectUpload(err);
                sftp.end();
                resolveUpload();
              });
            });
            console.log(`${chalk.green("[INFO]")} File uploaded seamlessly!`);

            await this.executeCommand(
              conn,
              `unzip ${remoteFilePath} -d ${path.dirname(remoteFilePath)}`
            );
            console.log(
              `${chalk.green("[INFO]")} Unzip process completed successfully!`
            );

            // End SSH connection
            conn.end();
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .on("error", reject)
        .connect({
          host: this.host,
          port: 22,
          username: this.username,
          password: this.password,
          // TODO:
          // privateKey: readFileSync('/path/to/my/key')
        });
    });
  }

  async deleteLocalFile(filePath) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error(`Error occurred while deleting the file: ${error.message}`);
    }
  }

  async deploySingleApp(target) {
    console.log(
      `${chalk.green("[INFO]")} Deploying the app of ${chalk.green(
        path.basename(target)
      )} to ${this.host} server!`
    );
    const remoteFileName = `${path.basename(target)}.zip`;
    const compressedFilePath = await this.compressDirectory(
      target,
      `${process.cwd()}\\packages\\${remoteFileName}`
    );

    await this.performSSH(compressedFilePath, remoteFileName);
    await this.deleteLocalFile(compressedFilePath);
  }

  async deployAllApps() {
    console.log(
      `${chalk.green("[INFO]")} Deploying all apps to ${this.host} server!`
    );
    const remoteFileName = `${this.zipName}.zip`;
    const compressedFilePath = await this.compressDirectory(
      this.localPath,
      `${process.cwd()}/${remoteFileName}`
    );
    await this.performSSH(compressedFilePath, remoteFileName);
    await this.deleteLocalFile(compressedFilePath);
  }

  async deploymentManager(needToDeployArray) {
    try {
      const isDirectory = (
        await fs.promises.stat(this.localPath)
      ).isDirectory();
      if (!isDirectory) {
        throw new Error("The provided path is not a directory.");
      }
      const deploymentTasks = needToDeployArray?.map(async (target) =>
        this.deploySingleApp(target)
      ) || [this.deployAllApps()];

      await Promise.all(deploymentTasks);

      spinner_succeed(
        "All deployment operations have been successfully executed!"
      );
      process.exit(0);
    } catch (error) {
      console.log("compressAndUpload ~ error:", error);
    }
  }
}

module.exports = SSHLoader;

/* TODO: 避免硬编码密码，后续考虑使用密钥对认证
let isUseSecretkey = false;
const sshConfig = {
  host: "192.168.22.1",
  port: 22,
  username: "root",
  password: "your_password_here", 
};
if (isUseSecretkey) {
  sshConfig.privateKey = fs.readFileSync("/path/to/my/key");
}
*/

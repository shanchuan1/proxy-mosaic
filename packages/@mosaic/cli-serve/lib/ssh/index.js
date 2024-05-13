const fs = require("fs");
const archiver = require("archiver");
const path = require("path");
const chalk = require("chalk");
const Client = require("ssh2").Client;
const { spinner_succeed } = require("../actuator/ora").processOra();

let isUseSecretkey = false;

const sshConfig = {
  host: "192.168.22.1",
  port: 22,
  username: "root",
  password: "your_password_here", // 实际操作中避免硬编码密码，考虑使用密钥对认证
};

if (isUseSecretkey) {
  sshConfig.privateKey = fs.readFileSync("/path/to/my/key");
}

class SSHLoader {
  constructor(options) {
    this.localPath = options.localPath;
    this.zipName = options.zipName || "packages.zip";
    this.remotePath = options.remotePath;
    this.host = options.host;
    this.username = options.username || "root";
    // this.password = options.password || "Timevale#123"; // TODO:实际使用时使用环境变量或更安全的方式存储
    this.password = options.password;
  }

  async compressDirectory(directoryPath) {
    try {
      // The complete output path of the ZIP file
      const outputFilePath = `${process.cwd()}/${this.zipName}.zip`;
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
      archive.directory(directoryPath, false);
      await archive.finalize();

      console.log(`${chalk.green(["INFO"])} Compression process completed!`);

      return outputFilePath;
    } catch (error) {
      console.error("Failed to compress directory:", error);
    }
  }

  async initClient(callback) {
    return (args) =>
      new Promise(async (resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", async () => {
            console.log(
              `${chalk.green([
                "INFO",
              ])} SSH client successfully connected and ready!`
            );
            // Create SFTP session
            const sftp = await new Promise((resolveSftp, rejectSftp) => {
              conn.sftp((err, sftpSession) => {
                if (err) return rejectSftp(err);
                resolveSftp(sftpSession);
              });
            });
            callback && callback({ resolve, reject, conn, sftp, ...args });
          })
          .on("error", reject)
          .connect({
            host: this.host,
            port: 22,
            username: this.username,
            password: this.password,
          });
      });
  }

  //   async uploadAndUnzipFile(compressedFilePath, remoteFileName) {
  //     return new Promise(async (resolve, reject) => {
  //       const conn = new Client();

  //       conn
  //         .on("ready", async () => {
  //           console.log(
  //             `${chalk.green([
  //               "INFO",
  //             ])} SSH client successfully connected and ready!`
  //           );

  //           try {
  //             if (this.isDeployAllApps) {
  //               // Clear remote directory before upload
  //               const clearCmd = `rm -rf ${this.remotePath}/* `;
  //               await new Promise((resolveClear, rejectClear) => {
  //                 conn.exec(clearCmd, (clearErr, clearStream) => {
  //                   if (clearErr) return rejectClear(clearErr);

  //                   clearStream
  //                     .on("exit", (code) => {
  //                       if (code === 0) {
  //                         resolveClear();
  //                       } else {
  //                         rejectClear(
  //                           new Error(
  //                             `Clear directory command failed with exit code ${code}`
  //                           )
  //                         );
  //                       }
  //                     })
  //                     .stderr.on("data", (data) => {
  //                       rejectClear(new Error(`Clear directory stderr: ${data}`));
  //                     });
  //                 });
  //               });
  //               console.log(
  //                 `${chalk.green([
  //                   "INFO",
  //                 ])} Remote directory successfully cleared!`
  //               );
  //             }

  //             // Create SFTP session
  //             const sftp = await new Promise((resolveSftp, rejectSftp) => {
  //               conn.sftp((err, sftpSession) => {
  //                 if (err) return rejectSftp(err);
  //                 resolveSftp(sftpSession);
  //               });
  //             });

  //             // Upload the file
  //             const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
  //             await new Promise((resolveUpload, rejectUpload) => {
  //               sftp.fastPut(compressedFilePath, remoteFilePath, (err) => {
  //                 if (err) return rejectUpload(err);
  //                 sftp.end(); // Close SFTP session after upload
  //                 resolveUpload();
  //               });
  //             });
  //             console.log(`${chalk.green(["INFO"])} File uploaded seamlessly!`);

  //             if (this.isDeployAllApps) {
  //                 // Execute unzip command
  //             const unzipCmd = `unzip ${remoteFilePath} -d ${path.dirname(
  //                 remoteFilePath
  //               )}`;
  //               await new Promise((resolveExec, rejectExec) => {
  //                 conn.exec(unzipCmd, (execErr, stream) => {
  //                   if (execErr) return rejectExec(execErr);

  //                   stream
  //                     .on("exit", (code) => {
  //                       if (code === 0) {
  //                         resolveExec(); // Unzip successful
  //                       } else {
  //                         rejectExec(
  //                           new Error(`Unzip command failed with exit code ${code}`)
  //                         );
  //                       }
  //                     })
  //                     .stderr.on("data", (data) => {
  //                       rejectExec(new Error(`Unzip stderr: ${data}`));
  //                     });
  //                 });
  //               });
  //               console.log(
  //                 `${chalk.green(["INFO"])} Unzip process completed successfully!`
  //               );
  //             }

  //             // End SSH connection
  //             conn.end();
  //             resolve();
  //           } catch (err) {
  //             reject(err);
  //           }
  //         })
  //         .on("error", reject)
  //         .connect({
  //           host: this.host,
  //           port: 22,
  //           username: this.username,
  //           password: this.password,
  //         });
  //     });
  //   }
  async uploadAndUnzipFile({ compressedFilePath, remoteFileName }) {
    const uploadFunction = async (options) => {
      const {
        resolve,
        reject,
        conn,
        sftp,
        compressedFilePath,
        remoteFileName,
      } = options;
      try {
        // Clear remote directory before upload
        const clearCmd = `rm -rf ${this.remotePath}/* `;
        await new Promise((resolveClear, rejectClear) => {
          conn.exec(clearCmd, (clearErr, clearStream) => {
            if (clearErr) return rejectClear(clearErr);

            clearStream
              .on("exit", (code) => {
                if (code === 0) {
                  resolveClear();
                } else {
                  rejectClear(
                    new Error(
                      `Clear directory command failed with exit code ${code}`
                    )
                  );
                }
              })
              .stderr.on("data", (data) => {
                rejectClear(new Error(`Clear directory stderr: ${data}`));
              });
          });
        });
        console.log(
          `${chalk.green(["INFO"])} Remote directory successfully cleared!`
        );

        // Upload the file
        const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
        await new Promise((resolveUpload, rejectUpload) => {
          sftp.fastPut(compressedFilePath, remoteFilePath, (err) => {
            if (err) return rejectUpload(err);
            sftp.end(); // Close SFTP session after upload
            resolveUpload();
          });
        });
        console.log(`${chalk.green(["INFO"])} File uploaded seamlessly!`);

        // Execute unzip command
        const unzipCmd = `unzip ${remoteFilePath} -d ${path.dirname(
          remoteFilePath
        )}`;
        await new Promise((resolveExec, rejectExec) => {
          conn.exec(unzipCmd, (execErr, stream) => {
            if (execErr) return rejectExec(execErr);

            stream
              .on("exit", (code) => {
                if (code === 0) {
                  resolveExec(); // Unzip successful
                } else {
                  rejectExec(
                    new Error(`Unzip command failed with exit code ${code}`)
                  );
                }
              })
              .stderr.on("data", (data) => {
                rejectExec(new Error(`Unzip stderr: ${data}`));
              });
          });
        });
        console.log(
          `${chalk.green(["INFO"])} Unzip process completed successfully!`
        );

        // End SSH connection
        conn.end();
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    await (
      await this.initClient(uploadFunction)
    )({ compressedFilePath, remoteFileName });
  }

  async deleteFile(filePath) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error(`Error occurred while deleting the file: ${error.message}`);
    }
  }

  // 上传指定apps资源
  async uploadDirectory({ localDirPath, remoteBasePath }) {
    const uploadDirectoryFunction = async (options) => {
      const { sftp, localDirPath, remoteBasePath } = options;
      return new Promise((resolve, reject) => {
        fs.readdir(
          localDirPath,
          { withFileTypes: true },
          async (err, files) => {
            if (err) return reject(err);

            //   const uploadTasks = files.map((file) => {
            //     const localFilePath = path.join(localDirPath, file.name);
            //     const remoteFilePath = path.join(remoteBasePath, file.name);

            //     if (file.isDirectory()) {
            //       // 递归上传子目录
            //      return uploadDirectoryFunction({sftp, localDirPath: localFilePath, remoteBasePath: remoteFilePath});
            //     //   return Promise.resolve();
            //     } else {
            //       return new Promise((resolveFile, rejectFile) => {
            //         sftp.fastPut(localFilePath, remoteFilePath, (err) => {
            //           if (err) return rejectFile(err);
            //           resolveFile();
            //         });
            //       });
            //     }
            //   });

            const uploadTasks = [];

            for (const file of files) {
              const localFilePath = path.join(localDirPath, file.name);
              const remoteFilePath = path.join(remoteBasePath, file.name);

              if (file.isDirectory()) {
                // 如果是目录，则在远程创建对应目录并递归上传其内容
                try {
                  await sftp.mkdir(remoteFilePath, true); // mkdir with recursive option if supported by your SFTP library
                  console.log(
                    `Creating directory on remote: ${remoteFilePath}`
                  );
                  // 递归上传子目录
                  await uploadDirectoryFunction({
                    sftp,
                    localDirPath: localFilePath,
                    remoteBasePath: remoteFilePath,
                  });
                } catch (mkdirErr) {
                  return reject(mkdirErr);
                }
              } else {
                // 如果是文件，则上传
                uploadTasks.push(
                  new Promise((resolveFile, rejectFile) => {
                    sftp.fastPut(localFilePath, remoteFilePath, (err) => {
                      if (err) return rejectFile(err);
                      resolveFile();
                    });
                  })
                );
              }
            }
            try {
              await Promise.all(uploadTasks);
              resolve();
            } catch (allErr) {
              reject(allErr);
            }
          }
        );
      });
    };
    await (
      await this.initClient(uploadDirectoryFunction)
    )({ localDirPath, remoteBasePath });
  }

  async compressAndUpload(needToDeployArray) {
    try {
      const isDirectory = (
        await fs.promises.stat(this.localPath)
      ).isDirectory();
      if (!isDirectory) {
        throw new Error("The provided path is not a directory.");
      }

      console.log(
        "🚀 ~ SSHLoader ~ compressAndUpload ~ needToDeployArray:",
        needToDeployArray
      );

      console.log(
        `${chalk.green(["INFO"])} Deploying the all apps to ${
          this.host
        } server!`
      );
      if (needToDeployArray && needToDeployArray.length) {
        await Promise.all(
          needToDeployArray.map(async (v) => {
            await this.uploadDirectory({
              localDirPath: v,
              remoteBasePath: path.basename(v),
            });
          })
        );
      } else {
        const compressedFilePath = await this.compressDirectory(this.localPath);
        await this.uploadAndUnzipFile({
          compressedFilePath,
          remoteFileName: `${this.zipName}.zip`,
        });
        await this.deleteFile(`${process.cwd()}\\${this.zipName}.zip`);
      }

      spinner_succeed(
        "all operations of Deploy have been successfully executed!"
      );

      process.exit(0);
    } catch (error) {
      console.log("compressAndUpload ~ error:", error);
    }
  }
}

module.exports = SSHLoader;

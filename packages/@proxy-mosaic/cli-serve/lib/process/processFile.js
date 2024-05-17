/*
 * @Description: 模板创建模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 18:09:16
 */
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const fsPromises = fs.promises;
const { processOra, chalk } = require("@proxy-mosaic/cli-shared-utils");
const { spinner_succeed } = processOra();


// 检查目录是否存在并创建
const checkDir = async (dirPath) => {
  try {
    await fsPromises.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    console.log(
      `${chalk.green("[INFO]")} The directory: ${chalk.blue(`<< ${path.basename(dirPath)} >>`)} already exists!`
    );
    return true;
  } catch (accessErr) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      console.log(
        `${chalk.green("[INFO]")} The directory: ${chalk.blue(`<< ${path.basename(
          dirPath
        )} >>`)}  created successfully!`
      );
      return false;
    } catch (mkdirErr) {
      console.error(`Failed to create directory: ${mkdirErr}`);
      return false;
    }
  }
};

// 获取指定文件内容
const getFileContent = (dirPath) => {
  const fileContent = require(dirPath);
  return fileContent;
};

// 校验某个文件是否存在
const doesFileExist = (filePath) => {
  return fs.existsSync(filePath)
    ? filePath
    : new Error("The file does not exist.");
};

// 拷贝文件夹至指定目录
const copyDirContents = async (src, dest) => {
  try {
    await fse.copy(src, dest, { overwrite: true });
    spinner_succeed(
      `Front end resources << ${path.basename(dest)} >> are ready`
    );
  } catch (err) {
    console.error("An error occurred during the moving process:", err);
  }
};

// 校验目录是否为空
const checkDirEmpty = async (dirPath) => {
  try {
    // 获取目录下的文件和子目录列表
    const files = await fsPromises.readdir(dirPath);

    // 如果列表为空，则目录为空
    return files.length === 0;
  } catch (err) {
    return true;
  }
};



module.exports = {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
  checkDirEmpty,
};

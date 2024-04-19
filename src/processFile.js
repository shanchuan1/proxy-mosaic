const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const fsPromises = fs.promises;
const { greenLog } = require("./terminalLog");

// 获取文件夹名称
const getLastFolderFromPath = (filePath) => {
  return path.basename(filePath);
};

// 检查目录是否存在
const checkDir = async (dirPath) => {
  console.log("🚀 ~ checkDir ~ dirPath:", dirPath);

  try {
    await fsPromises.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    greenLog(`目录: << ${getLastFolderFromPath(dirPath)} >> 已存在`);
    return true;
  } catch (accessErr) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      greenLog(`目录:  << ${getLastFolderFromPath(dirPath)} >> 已成功创建`);
      return false;
    } catch (mkdirErr) {
      console.error(`创建目录失败: ${mkdirErr}`);
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

// 复制内容操作
const copyDirContents = async (src, dest) => {
  try {
    await fse.copy(src, dest, { overwrite: true });
    greenLog(
      `Front end resources << ${getLastFolderFromPath(dest)} >> are ready`
    );
  } catch (err) {
    console.error("An error occurred during the copying process:", err);
  }
};

const checkDirEmpty = async (dirPath) => {
  try {
    // 获取目录下的文件和子目录列表
    const files = await fsPromises.readdir(dirPath);

    // 如果列表为空，则目录为空
    return files.length === 0;
  } catch (err) {
    // 如果目录不存在或读取目录时出错，也返回true表示认为该路径为空（可根据需求调整）
    console.error(`检查目录是否为空时发生错误: ${err.message}`);
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

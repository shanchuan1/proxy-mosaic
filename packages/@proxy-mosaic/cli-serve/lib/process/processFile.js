/*
 * @Description: 模板创建模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-12 12:30:32
 */
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const fsPromises = fs.promises;
// const downgit = require("download-git-repo");
const rimraf = require("rimraf");
const { greenLog } = require("../terminalLog");
const { appendToJs } = require("../temp/index");
const { spinner_start, spinner_succeed, spinner_fail } = require("../actuator/ora").processOra();

// 获取文件夹名称
const getLastFolderFromPath = (filePath) => {
  return path.basename(filePath);
};

// 检查目录是否存在并创建
const checkDir = async (dirPath) => {
  try {
    await fsPromises.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    greenLog(
      `Directory: << ${getLastFolderFromPath(dirPath)} >> already exists`
    );
    return true;
  } catch (accessErr) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      greenLog(
        `Directory:  << ${getLastFolderFromPath(
          dirPath
        )} >> created successfully `
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
    // 如果目录不存在或读取目录时出错，也返回true表示认为该路径为空（可根据需求调整）
    console.error(`Error checking if directory is empty: ${err.message}`);
    return true;
  }
};

// 拷贝模板内容
const copyTemplateContents = async (options) => {
  const {
    currentTemplatePath: srcDir,
    currentLocalPathCWD: destDir,
    projectName = "front",
  } = options;
  try {
    // 首先将模板目录下的所有内容拷贝到目标目录
    await fse.copy(srcDir, destDir, { overwrite: true });

    const outPutEdPath = `${destDir}/mosaic_project`;

    const renamingMap = {
      front_output: `${projectName}_output`,
      front_pro: `${projectName}_pro`,
    };

    // 根据重置映射表，在目标目录下进行重置操作
    await renameDirectoriesSerially(outPutEdPath, renamingMap);
    appendToJs("currentMosaicProjectPath", outPutEdPath, "data");
    await spinner_succeed(
      `mosaic_project project has been created and completed`
    );
    greenLog(`Templates resource << mosaic_project >> have been ready.`);
    process.exit(0);
  } catch (err) {
    console.error(
      "An error occurred during the copying and/or renaming process:",
      err
    );
  }
};

// 重置目录操作
const renameDirectoriesSerially = async (dir, renamingMap) => {
  const entries = await fse.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const itemPath = path.join(dir, entry.name);
    const newName = renamingMap[entry.name];

    if (newName) {
      const newItemPath = path.join(dir, newName);
      await fse.mkdir(newItemPath, { recursive: true });

      newName.split("_")[1] === "output" &&
        appendToJs("newResourceOutPutPath", newItemPath, "data");
      newName.split("_")[1] === "pro" &&
        appendToJs("newProjectPath", newItemPath, "data");

      // 使用move方法替代单独的创建和删除操作
      await fse.move(itemPath, newItemPath, {
        overwrite: true,
        recursive: true,
      });
    }
  }
};

// 从远程仓库下载模板
const getOriginTemplate = async ({
  currentLocalPathCWD: destDir,
  projectName = "front",
}) => {
  const renamingMap = {
    front_output: `${projectName}_output`,
    front_pro: `${projectName}_pro`,
  };
  const gitHubPath = "github:shanchuan1/template-proxy-mosaic";
  spinner_start("Creating Mosaic project ...");
  await downgit(gitHubPath, destDir, { clone: false }, async (err) => {
    if (err) {
      rimraf(destDir, (error) => {
        if (error) console.error(error);
      });
      spinner_fail("Mosaic project creation failed:", err);
      process.exit(0);
    }
    // 根据重置映射表，在目标目录下进行重置操作
    await renameDirectoriesSerially(`${destDir}/mosaic_project`, renamingMap);
    appendToJs("currentMosaicProjectPath", `${destDir}/mosaic_project`, "data");
    spinner_succeed("Mosaic project created successfully");
    process.exit(0);
  });
};

module.exports = {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
  checkDirEmpty,
  copyTemplateContents,
  getOriginTemplate,
  getLastFolderFromPath
};
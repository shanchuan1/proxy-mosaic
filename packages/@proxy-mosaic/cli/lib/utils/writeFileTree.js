/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-10 11:02:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-11 10:42:48
 */
const fs = require("fs-extra");
const path = require("path");
const { chalk } = require('@proxy-mosaic/cli-shared-utils')

function deleteRemovedFiles(directory, newFiles, previousFiles) {
  // get all files that are not in the new filesystem and are still existing
  const filesToDelete = Object.keys(previousFiles).filter(
    (filename) => !newFiles[filename]
  );

  // delete each of these files
  return Promise.all(
    filesToDelete.map((filename) => {
      return fs.unlink(path.join(directory, filename));
    })
  );
}

/**
 *
 * @param {string} dir
 * @param {Record<string,string|Buffer>} files
 * @param {Record<string,string|Buffer>} [previousFiles]
 * @param {Set<string>} [include]
 */
module.exports = writeFileTree = async (dir, files, previousFiles, include) => {
  if (previousFiles) {
    await deleteRemovedFiles(dir, files, previousFiles);
  }
  Object.entries(files).forEach(([name, content]) => {
    if (include && !include.has(name)) return;

    const filePath = path.join(dir, name);

    if (content === null) {
      fs.ensureDirSync(filePath); // 直接创建目录，无需检查dirname
      console.log(`mosaic ${chalk.green('info')} Creating ${name} directory`);
    } else {
      fs.ensureDirSync(path.dirname(filePath)); // 确保父目录存在
      fs.writeFileSync(filePath, content);
      console.log(`mosaic ${chalk.green('info')} Creating ${name}`);
    }
  });
};

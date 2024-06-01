/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-06-01 14:04:00
 * @LastEditors:
 * @LastEditTime: 2024-06-01 14:04:22
 */
const fs = require('fs');
const path = require('path');

/**
 * 异步查找指定名称的子文件或文件夹路径。
 * @param {string} rootDir - 根目录路径。
 * @param {string} targetName - 要查找的文件或文件夹名称。
 * @param {boolean} [isFile] - 是否查找文件，默认为false，表示查找文件夹。
 * @returns {Promise<string[]>} - 匹配的路径数组。
 */
async function findEntryPaths(rootDir, targetName, isFile = false) {
  let results = [];
  async function traverse(dir) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!isFile) {
            if (entry.name === targetName) {
              results.push(fullPath);
            }
            await traverse(fullPath); // 继续遍历子目录
          }
        } else if (isFile && entry.name === targetName) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error reading directory: ${dir}`, err);
    }
  }

  try {
    await traverse(rootDir);
  } catch (err) {
    console.error(`Error starting traversal from directory: ${rootDir}`, err);
  }
  return results;
}

function getExtraPart(str1, str2) {
  const index = str1.indexOf(str2);
  if (index !== -1) {
      return str1.slice(index + str2.length);
  }
  return str1;
}

module.exports = {
  findEntryPaths,
  getExtraPart
};

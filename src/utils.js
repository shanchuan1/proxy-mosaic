/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-04-19 21:02:10
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-08 22:51:20
 */
const fs = require("fs");
const path = require("path");
const { appendToJs } = require("./temp/index");

// mosaic配置项repos的校验
const validateRepos = (repos) => {
  for (const repo of repos) {
    if (
      typeof repo.url !== "string" ||
      repo.url.trim() === "" ||
      typeof repo.name !== "string" ||
      repo.name.trim() === ""
    ) {
      const invalidKey = !repo.url || repo.url.trim() === "" ? "url" : "name";
      throw new Error(
        `Invalid or missing '${invalidKey}' in repository: ${JSON.stringify(
          repo
        )}.`
      );
    }
  }
  return true;
};

// mosaic配置项serverConfig的校验
const validateServerConfig = (serverConfig) => {
  if (
    typeof serverConfig.username !== "string" ||
    serverConfig.username.trim() === "" ||
    !isValidIP(serverConfig.ip) ||
    typeof serverConfig.deployDirectory !== "string" ||
    serverConfig.deployDirectory.trim() === ""
  ) {
    throw new Error(
      `Invalid server configuration:\n${JSON.stringify(serverConfig, null, 2)}`
    );
  }
  return true;
};

const isValidIP = (ipAndPortString) => {
  const [ipAddress, port] = ipAndPortString.split(":");
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipAddress)) return false;
  return true;
};

// 删除非空文件夹及其内部所有文件
const deleteFolderRecursive = async (folderPath) => {
  // 判断路径是否存在
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder ${folderPath} not exist`);
    return;
  }

  // 读取文件夹内容
  const items = await fs.promises.readdir(folderPath, { withFileTypes: true });

  // 遍历文件夹内容并递归删除子文件和子文件夹
  for (const item of items) {
    const itemPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      await deleteFolderRecursive(itemPath);
    } else {
      await fs.promises.unlink(itemPath);
    }
  }

  // 删除空文件夹
  await fs.promises.rmdir(folderPath);
};

// 校验对象是否为空
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

// 给数组对象最后一项设置属性
const setPropertyInLast = (array, property) => {
  return array.map((v, i) => {
    if (i === array.length - 1 && !v.hasOwnProperty(property)) {
      v[property] = true;
    }
    return v;
  });
};

// 给数组对象设置build属性
const setBuildPropertyInRepos = (array, property, hasBuild) => {
  if (Array.isArray(array)) {
    return array.map((v) => {
      if (!v.hasOwnProperty(property)) {
        v[property] = {
          current: v.branch,
          hasBuilded: hasBuild,
        };
      }
      return v;
    });
  } else {
    array[property] = {
      current: array.branch,
      hasBuilded: hasBuild,
    };
    return array
  }
};

// 合并两个对象相同key的值
const mergeObjectsByKeys = (obj1, obj2) => {
  const mergedObject = {};
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (obj2.hasOwnProperty(key)) {
        mergedObject[key] = {
          ...obj2[key],
          ...obj1[key],
        };
      } else {
        mergedObject[key] = obj1[key];
      }
    }
  }

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!mergedObject.hasOwnProperty(key)) {
        mergedObject[key] = obj2[key];
      }
    }
  }

  return mergedObject;
};

// 合并仓库新状态
const mergedObjectNewReposToTemp = (leftObj, rightObj) => {
  const mergedObject = mergeObjectsByKeys(leftObj, rightObj);
  for (const key in mergedObject) {
    appendToJs(key, mergedObject[key], "repos");
  }
};

module.exports = {
  validateRepos,
  validateServerConfig,
  deleteFolderRecursive,
  isEmptyObject,
  setPropertyInLast,
  mergedObjectNewReposToTemp,
  setBuildPropertyInRepos,
};

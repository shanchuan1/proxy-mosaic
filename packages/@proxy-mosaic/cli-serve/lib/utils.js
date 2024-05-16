/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-04-19 21:02:10
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 17:50:06
 */
const fs = require("fs");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);


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


// 删除操作
const clearOperation = async (dest) => {
  await exec(`rm -rf ${dest}`)
}


// 过滤对象内空属性值的key
const removeEmptyProperties = (obj) => {
  const isEmpty = (value) => (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 0 ||
    value === false ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );

  return Object.entries(obj)
    .filter(([key, value]) => !isEmpty(value))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};


module.exports = {
  validateServerConfig,
  deleteFolderRecursive,
  isEmptyObject,
  clearOperation,
  removeEmptyProperties,
};

const fs = require("fs");
const path = require("path");

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
  // 分离IP地址和端口
  const [ipAddress, port] = ipAndPortString.split(":");
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipAddress)) return false;

  // 端口验证
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort) || parsedPort < 0 || parsedPort > 65535) return false;

  return true;
};

// 删除非空文件夹及其内部所有文件
const deleteFolderRecursive = async (folderPath) => {
  // 判断路径是否存在
  if (!fs.existsSync(folderPath)) {
    console.error(`文件夹 ${folderPath} 不存在`);
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

module.exports = {
  validateRepos,
  validateServerConfig,
  deleteFolderRecursive,
  isEmptyObject
};

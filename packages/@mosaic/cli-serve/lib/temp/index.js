/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:05:15
 * @LastEditors: 
 * @LastEditTime: 2024-05-14 18:03:00
 */
const fs = require("fs");
const path = require("path");
const fileDataPath = path.resolve(__dirname, "../temp/tempFiles/data.js");
const serverConfigPath = path.resolve(
  __dirname,
  "../temp/tempFiles/serverConfig.js"
);
const buildModePath = path.resolve(__dirname, "../temp/tempFiles/buildMode.js");

const fileMap = {
  data: fileDataPath,
  server: serverConfigPath,
  build: buildModePath,
};

// 尝试读取并解析JS文件中的对象
const readFromJs = (type) => {
  try {
    const jsData = fs.readFileSync(fileMap[type], "utf8");
    // 尝试以JSON格式解析
    const data = JSON.parse(jsData.trim());
    return data;
  } catch (error) {
    console.log('readFromJs ~ error:', error)
    return {}; // 初始化为空对象
  }
};

// 将数据追加到JS文件中的对象（假设为JSON格式）
const appendToJs = (key, value, type) => {
  // 读取现有对象
  let existingData = readFromJs(type);

  // 将新的数据项追加到对象中
  existingData[key] = value;

  // 更新文件内容（以JSON格式写入）
  const updatedJsData = JSON.stringify(existingData, null, 2);
  fs.writeFileSync(fileMap[type], updatedJsData, "utf8");
};

// 删除js文件中的对象
const deleteFromJs = (key, type) => {
  // 读取现有对象
  let existingData = readFromJs(type);

  if (!Object.keys(existingData).length) {
    return
  }

  if (key) {
    // 校验现有对象存在并删除
    existingData[key] && delete existingData[key];
  } else {
    // 清空对象所有数据
    existingData = {}
  }

  // 更新文件内容（以JSON格式写入）
  const updatedJsData = JSON.stringify(existingData, null, 2);
  fs.writeFileSync(fileMap[type], updatedJsData, "utf8");
};

module.exports = {
  readFromJs,
  appendToJs,
  deleteFromJs,
};

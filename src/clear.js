const fs = require("fs");
const path = require("path");

// 删除非空文件夹及其内部所有文件
async function deleteFolderRecursive(folderPath) {
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
}




module.exports = {
    deleteFolderRecursive
}
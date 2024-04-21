const path = require("path");
const { getHandleRepos } = require("./getMosaicConfig");
const { readFromJs, appendToJs } = require("./temp/index");
const { execProcess } = require("./exec");
const {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
} = require("./processFile");

/* 模拟build操作 */
const processExecBuild = async (paths) => {
  try {
    const { newResourceOutPutPath } = readFromJs('data');
    const repos = getHandleRepos(paths);
    console.log("🚀 ~ processExecBuild ~ repos:", repos);
    await Promise.all(
      repos.map(async (repo) => {
        // TODO: 动画
        console.log("开始执行build操作");
        await execProcess("BUILD", repo);

        const content = await getFileContent(
          doesFileExist(`${repo.dest}/vue.config.js`)
        );
        const outputPath = `${repo.dest}/${content.outputDir}`;
        const inputPath =
          content.outputDir === "dist"
            ? `${newResourceOutPutPath}/${repo.name}`
            : `${newResourceOutPutPath}/${content.outputDir}`;
        appendToJs(repo.name, inputPath, 'data');
        await checkDir(newResourceOutPutPath);
        await checkDir(inputPath);
        await copyDirContents(outputPath, inputPath);
        console.log("🚀 ~ buildExecProcess ~ outputPath:", outputPath);
      })
    );
  } catch (error) {}
};

module.exports = {
  processExecBuild,
};

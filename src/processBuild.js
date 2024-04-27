const path = require("path");
const { getHandleRepos, getScriptsForBuild } = require("./getMosaicConfig");
const { readFromJs, appendToJs } = require("./temp/index");
const { execProcess } = require("./exec");
const {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
} = require("./processFile");

/* 模拟build操作 */
const processExecBuild = async (params) => {
  try {
    const {
      paths,
      options: { configBuildMode, mode },
    } = params;
    const { newResourceOutPutPath } = readFromJs("data");
    const repos = getHandleRepos(paths);
    let build_Mode;
    if (!mode) {
      const { build } = getScriptsForBuild(configBuildMode);
      build_Mode = build;
    } else {
      build_Mode = mode;
    }

    // 循环执行build
    for (const repo of repos) {
      await execProcess("BUILD", { repo, build_Mode });
      const content = await getFileContent(
        doesFileExist(`${repo.dest}/vue.config.js`)
      );
      const outputPath = `${repo.dest}/${content.outputDir}`;
      const inputPath =
        content.outputDir === "dist"
          ? `${newResourceOutPutPath}/${repo.name}`
          : `${newResourceOutPutPath}/${content.outputDir}`;
      appendToJs(repo.name, inputPath, "data");
      await checkDir(newResourceOutPutPath);
      await checkDir(inputPath);
      await copyDirContents(outputPath, inputPath);
    }
  } catch (error) {}
};

module.exports = {
  processExecBuild,
};

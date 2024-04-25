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
    const { paths, options:{configBuildMode, mode}} = params
    const { newResourceOutPutPath } = readFromJs('data');
    const repos = getHandleRepos(paths);
    console.log('🚀 ~ processExecBuild ~ repos:', repos)
    let build_Mode;
    if (!mode) {
      const {build} = getScriptsForBuild(configBuildMode)
      build_Mode = build
    } else { 
      build_Mode = mode
    }
    console.log('🚀 ~ processExecBuild ~ build_Mode:', build_Mode)
    // return
    await Promise.all(
      repos.map(async (repo) => {
        // TODO: 动画
        console.log("开始执行build操作");
        await execProcess("BUILD", {repo, build_Mode});
        console.log('build操作执行完成');
        
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

/*
 * @Description: TODO:优化打包性能
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-08 22:56:33
 */
const chalk = require("chalk");
const { getHandleRepos, getScriptsForBuild } = require("./getMosaicConfig");
const { readFromJs, appendToJs } = require("./temp/index");
const { execProcess } = require("./exec");
const {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
} = require("./processFile");
const { setPropertyInLast, setBuildPropertyInRepos } = require("./utils");
const { processOra } = require("./actuator/ora");
const { spinner_fail } = processOra();

/* 模拟build操作 */
const processExecBuild = async (params) => {
  try {
    const {
      paths,
      options: { configBuildMode, mode },
    } = params;
    const { newResourceOutPutPath } = readFromJs("data");
    let repos = [];
    if (paths.length > 0) {
      // repos = setPropertyInLast(getHandleRepos(paths), "isLastRepo");
      const tempRepos = readFromJs("repos");
      const hasSetLastRepos = setPropertyInLast(
        Object.values(tempRepos),
        "isLastRepo"
      );
      repos = setBuildPropertyInRepos(hasSetLastRepos, "build", false);
    }
    let build_Mode;
    if (!mode) {
      const { build } = getScriptsForBuild(configBuildMode);
      build_Mode = build;
    } else {
      const { build, ...otherRepos } = getScriptsForBuild(mode);
      if (!build) {
        spinner_fail(
          `The current input build mode does not exist in the project: ${chalk.blue(
            Object.keys(otherRepos).join(",")
          )}`
        );
        process.exit(1);
      }
      build_Mode = build;
    }

    // 循环执行build
    for (const repo of repos) {
      // 仅对未打包过的app打包
      // if (!repo.build.hasBuilded) {
      //   await execProcess("BUILD", { repo, build_Mode });
      //   const hasBuildSuccess = setBuildPropertyInRepos(repo, "build", true);
      //   console.log(
      //     "🚀 ~ processExecBuild ~ hasBuildSuccess:",
      //     hasBuildSuccess
      //   );
      //   appendToJs(hasBuildSuccess.name, hasBuildSuccess, "repos");
      // }

      await execProcess("BUILD", { repo, build_Mode });

      // TODO:目前默认是识别vue项目的配置
      let content = {};
      let outputPath = null;
      let inputPath = null;
      if (repo.frame && Object.keys(repo.frame)[0] === "vue") {
        content = await getFileContent(
          doesFileExist(`${repo.dest}/vue.config.js`)
        );
        outputPath = `${repo.dest}/${content?.outputDir || "dist"}`;
        inputPath =
          content.outputDir === "dist"
            ? `${newResourceOutPutPath}\\${repo.name}`
            : `${newResourceOutPutPath}\\${content?.outputDir || "dist"}`;
      } else {
        // TODO:非vue项目暂时默认是dist,且以项目名为命名
        outputPath = `${repo.dest}/dist`;
        inputPath = `${newResourceOutPutPath}\\${repo.name}`;
      }
      appendToJs(repo.name, inputPath, "data");

      // TODO: 后面考虑要不要保留这一层校验
      await checkDir(newResourceOutPutPath);
      await checkDir(inputPath);
      await copyDirContents(outputPath, inputPath);
      if (repo.isLastRepo) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.log("processExecBuild -- error:", error);
    process.exit(1);
  }
};

module.exports = {
  processExecBuild,
};

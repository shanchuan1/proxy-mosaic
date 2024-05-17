/*
 * @Description: TODO:优化打包性能
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 13:47:45
 */
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const execProcess = require("./execProcess");
const { copyDirContents } = require("./processFile");
const ReposConfigurator = require("../mosaicConfig");

const packagesOutputPath = `${
  process.env.MOSAIC_CLI_CONTEXT || process.cwd()
}\\packages`;

/**
 * @description: build之前清理操作
 * @param {*} repos
 * @return {*}
 */
const beforeExecBuild = async ({ paths, repos }) => {
  if (paths[0] === "all") {
    await exec(`rm -rf ${packagesOutputPath}/*`);
  } else {
    for (const { packages } of repos) {
      packages.packageInputPath &&
        (await exec(`rm -rf ${packages.packageInputPath}`));
    }
  }
};

/**
 * @description: app的统一build操作
 * @param {*} params
 * @return {*}
 */
module.exports = processExecBuild = async (params) => {
  try {
    const {
      paths,
      options: { configBuildMode, mode },
    } = params;

    const Repos = new ReposConfigurator(paths, {
      buildMode: configBuildMode || mode,
    });
    let repos = await Repos.getRepos("build");

    await beforeExecBuild({ paths, repos });


    // 循环执行build
    for (const repo of repos) {
      await execProcess("BUILD", repo);

      const {
        packages: { appOutputPath, packageInputPath },
      } = repo;
      await copyDirContents(appOutputPath, packageInputPath);

      if (repo.isLastRepo) {
        process.exit(0);
      }
    }
  } catch (error) {
    console.log("processExecBuild -- error:", error);
    process.exit(0);
  }
};

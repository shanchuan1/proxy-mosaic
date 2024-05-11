/*
 * @Description: TODO:优化打包性能
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-11 17:01:46
 */
const chalk = require("chalk");
const path = require("path");
const { getScriptsForBuild } = require("../mosaicConfig");
const { readFromJs } = require("../temp/index");
const { execProcess } = require("../exec");
const {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
} = require("./processFile");
const {
  getReposByPathsAndSetLast,
  mergedObjectNewReposToTemp,
  clearOperation,
} = require("../utils");
const { spinner_fail } = require("../actuator/ora").processOra();

// 缓存的仓库数据
const tempRepos = readFromJs("repos");
let inputPathArray = [];

const packagesOutputPath = `${process.env.MOSAIC_CLI_CONTEXT || process.cwd()}\\packages`

console.log('🚀 ~ packagesOutputPath:', packagesOutputPath)
/**
 * @description: app的统一build操作
 * @param {*} params
 * @return {*}
 */
const processExecBuild = async (params) => {
  try {
    const { repos, build_Mode } = getBuildExecOptions(params);

    await beforeExecBuild(repos);

    // 循环执行build
    for (const repo of repos) {
      await execProcess("BUILD", { repo, build_Mode });

      const { inputPath } = await getResourceFromBuild(repo);
      inputPathArray.push(inputPath);

      if (repo.isLastRepo) {
        await afterExecBuild({ repos, build_Mode });
        process.exit(0);
      }
    }
  } catch (error) {
    console.log("processExecBuild -- error:", error);
    process.exit(0);
  }
};

/**
 * @description: 获取执行build操作的配置
 * @param {*} params
 * @return {*}
 */
const getBuildExecOptions = (params) => {
  const {
    paths,
    options: { configBuildMode, mode },
  } = params;
  let repos = [];
  if (paths.length > 0) {
    repos = getReposByPathsAndSetLast(paths, "isLastRepo");
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
      process.exit(0);
    }
    build_Mode = build;
  }
  return {
    repos,
    build_Mode,
  };
};

/**
 * @description: build之前清理操作
 * @param {*} repos
 * @return {*}
 */
const beforeExecBuild = async (repos) => {
  if (Object.keys(tempRepos).length === repos.length) {
    await clearOperation(`${packagesOutputPath}/*`);
  } else {
    for (const key of repos) {
      key.outPut && (await clearOperation(`${key.outPut.path}`));
    }
  }
};

/**
 * @description: build后的资源输出
 * @param {*} repo
 * @return {*}
 */
const getResourceFromBuild = (repo) => {
  return new Promise(async (resolve, reject) => {
    // TODO:目前默认是识别vue项目的配置
    let content = {};
    let outputPath = null;
    let inputPath = null;
    if (repo.frame && Object.keys(repo.frame)[0] === "vue") {
      // 获取app内配置文件信息
      content = await getFileContent(
        doesFileExist(`${repo.dest}/vue.config.js`)
      );
      outputPath = `${repo.dest}/${content?.outputDir || "dist"}`;
      inputPath =
        content.outputDir === "dist"
          ? `${packagesOutputPath}\\${repo.name}`
          : `${packagesOutputPath}\\${content?.outputDir || "dist"}`;
    } else {
      // TODO:非vue项目暂时默认是dist,且以项目名为命名
      outputPath = `${repo.dest}/dist`;
      inputPath = `${packagesOutputPath}\\${repo.name}`;
    }

    // TODO: 后面考虑要不要保留这一层校验
    await checkDir(packagesOutputPath);
    await checkDir(inputPath);
    await copyDirContents(outputPath, inputPath);
    resolve({ inputPath });
  });
};

/**
 * @description: build之后缓存数据操作
 * @param {*} repos
 * @param {*} inputPath
 * @param {*} content
 * @param {*} build_Mode
 * @return {*}
 */
const afterExecBuild = async ({ repos, build_Mode }) => {
  // 合并输出数据至repos
  let outputObj = {};
  for (const [i, repo] of repos.entries()) {
    outputObj[repo.name] = {
      outPut: {
        path: inputPathArray[i],
        outputName: path.basename(inputPathArray[i]),
      },
      build: {
        buildMode: build_Mode,
        current: repo.branch || repo.branches.current,
        hasBuild: true,
      },
    };
  }
  inputPathArray = []
  await mergedObjectNewReposToTemp(outputObj, tempRepos);
};

module.exports = {
  processExecBuild,
};

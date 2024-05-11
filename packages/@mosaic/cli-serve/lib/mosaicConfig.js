const path = require("path");
const chalk = require("chalk");
const { readFromJs, appendToJs } = require("./temp/index");
const { validateRepos, mergedObjectNewReposToTemp, removeEmptyProperties } = require("./utils");

const currentMosaicProjectPath =
  process.env.MOSAIC_CLI_CONTEXT || process.cwd();

/**
 * @description: 获取创建的项目主题name
 * @return {*}
 */
const getCreatedProName = () => {
  const packName = require(`${currentMosaicProjectPath}\\package.json`).name;
  return packName.split("_")[0];
};

// 1process.env.MOSAIC_CLI_CONTEXT

class ReposConfigurator {
  constructor(paths, config) {
    this.paths = paths;
    this.config = config;
    this.cwd = currentMosaicProjectPath;
    this.mosaicConfig = require(`${this.cwd}\\mosaic.config.js`);
    this.destProPath = `${this.cwd}\\apps`;
    this.commonRepos = [];

    this.validateRepos(this.mosaicConfig.repos);
  }

  async init(paths) {
    this.commonRepos = this.mosaicConfig.repos
      .map((v, index) => ({
        ...v,
        dest: `${this.destProPath}\\${v.name}`,
        byName: v.name.split("-")[v.name.split("-").length - 1],
        // ...(branch ? {branch} : {}),
      }))
      .filter((v) => {
        if (Array.isArray(paths) && paths.length > 0 && paths[0] !== "all") {
          return paths.includes(v.name) || paths.includes(v.byName);
        }
        return v;
      });
  }

  // mosaic配置项repos的校验
  validateRepos(repos) {
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
  }

  appendToJs(name, item, key) {
    // Assuming appendToJs is a function defined elsewhere
    // Implement appending to JS file logic here
  }

  // 校验命令传入的paths项目是否为配置文件内存在的
  validatePaths(projectNames, projectsList) {
    const matchedNames = new Set();
    for (const project of projectsList) {
      if (project.byName) matchedNames.add(project.byName);
      if (project.name) matchedNames.add(project.name);
    }
    const unmatchedProjectNames = projectNames.filter(
      (name) => !matchedNames.has(name)
    );
    unmatchedProjectNames?.forEach((v, i) => {
      console.log(`${chalk.red(`The project ${chalk.blue(v)} does not exist in the mosaic.config.js`)} `);
      i === unmatchedProjectNames.length - 1 && process.exit(0);
    });
  }

  // 校验所有app的所属框架
  validateFrame() {
    const repos = this.commonRepos
    const frames = ["vue", "react"];
    let scriptsMap = {};
    for (const key in repos) {
      scriptsMap[key] = {
        pureNative: "html",
      };
      const dependencies =
        require(`${repos[key].dest}\\package.json`).dependencies || {};
      for (const depName in dependencies) {
        if (frames.includes(depName)) {
          scriptsMap[key] = {
            frame: {
              [depName]: dependencies[depName],
            },
          };
        }
      }
    }
  }

  // 设置reps属性值
  setPropertyToRepo(arg) {
    return this.commonRepos.map((v,index)=> ({
      ...v,
      ...(index === this.commonRepos.length - 1
        ? { isLastRepo: true }
        : {}),
        ...(removeEmptyProperties(arg))
    }))
  }

  // 返回处理后的仓库
  async getRepos(operation) {
    await this.init(this.paths);
    console.log("🚀 ~ getRepos ~ destProPath:", this.destProPath);

    const arrayRepos = this.commonRepos;
    if (this.paths.length > arrayRepos.length) {
      this.validatePaths(this.paths, arrayRepos);
    }

    if (operation === 'build') {
      this.validateFrame()
    }

    // arrayRepos.forEach((item) => this.appendToJs(item.name, item, "repos"));
    return this.setPropertyToRepo({ ...this.config });
  }
}

/**
 * @description: 匹配得出仓库的数据结构
 * @param {*} paths 当前项目名称(name或者byName)
 * @param {*} branch 当前项目的需切换的分支
 * @return {*} arrayRepos
 */
const getReposConfig = (paths, branch) => {
  const mosaicConfig = require(`${process.env.MOSAIC_CLI_CONTEXT}\\mosaic.config.js`);
  const destProPath = `${process.env.MOSAIC_CLI_CONTEXT}\\apps`;
  // repos的校验
  console.log("🚀 ~ getReposConfig ~ destProPath:", destProPath);
  validateRepos(mosaicConfig.repos);
  const arrayRepos = mosaicConfig.repos
    .map((v, index) => {
      const item = {
        ...v,
        dest: `${destProPath}\\${v.name}`,
        byName: v.name.split("-")[v.name.split("-").length - 1],
      };
      if (index === mosaicConfig.repos.length - 1) {
        item.isLastRepo = true;
      }
      if (branch) {
        item.branch = branch;
      }
      appendToJs(item.name, item, "repos");
      return item;
    })
    .filter((v) => {
      if (Array.isArray(paths) && paths.length > 0 && paths[0] !== "all") {
        return paths.includes(v.name) || paths.includes(v.byName);
      }
      return v;
    });
  if (paths.length > arrayRepos.length) {
    // 说明存在还有未匹配到的项目, 输出未匹配上的appName
    const unmatchedProjectNames = validatePaths(paths, arrayRepos);
    unmatchedProjectNames?.forEach((v) => {
      console.log(`The project ${v} does not exist in the mosaic.config.js`);
    });
  }
  arrayRepos.forEach((item) => {
    appendToJs(item.name, item, "repos");
  });
  return arrayRepos;
};

/**
 * @description: 校验命令传入的paths项目是否为配置文件内存在的
 * @param {*} projectNames  传入的项目名
 * @param {*} projectsList  配置文件内已配置的项目
 * @return {*} Boolean
 */
const validatePaths = (projectNames, projectsList) => {
  const matchedNames = new Set();
  for (const project of projectsList) {
    if (project.byName) matchedNames.add(project.byName);
    if (project.name) matchedNames.add(project.name);
  }
  return projectNames.filter((name) => !matchedNames.has(name));
};

/**
 * @description: 获取仓库项目内package.json文件的scripts脚本内容
 * @return {*} scriptsMap
 */
const getReposPackageScripts = () => {
  const repos = readFromJs("repos");
  let scriptsMap = {};
  for (const key in repos) {
    scriptsMap[key] = require(`${repos[key].dest}/package.json`).scripts || {};
  }
  return scriptsMap;
};

/**
 * @description: 获取仓库配置的build基本模式脚本
 * @param {*} mode
 * @return {*} buildMap
 */
const getScriptsForBuild = (mode) => {
  const scripts = getReposPackageScripts();
  let buildMap = {};
  for (const key in scripts) {
    if (["dev", "test", "sml", "prod"].includes(mode)) {
      const build_mode = Object.keys(scripts[key]).find((v) =>
        [`build:${mode}`, `build_${mode}`].includes(v)
      );
      buildMap[key] = build_mode;
      buildMap.build = build_mode;
    } else {
      const build_mode = Object.keys(scripts[key]).find((v) => v === mode);
      buildMap[key] = build_mode;
      buildMap.build = build_mode;
    }
  }
  return buildMap;
};

/**
 * @description: 校验所有app的所属框架
 * @return {*}
 */
const validateFrame = async () => {
  const repos = readFromJs("repos");
  const frames = ["vue", "react"];
  let scriptsMap = {};
  for (const key in repos) {
    scriptsMap[key] = {
      pureNative: "html",
    };
    const dependencies =
      require(`${repos[key].dest}\\package.json`).dependencies || {};
    for (const depName in dependencies) {
      if (frames.includes(depName)) {
        scriptsMap[key] = {
          frame: {
            [depName]: dependencies[depName],
          },
        };
      }
    }
  }
  await mergedObjectNewReposToTemp(scriptsMap, repos);
};

module.exports = {
  getReposConfig,
  validatePaths,
  getScriptsForBuild,
  validateFrame,
};

module.exports = ReposConfigurator;

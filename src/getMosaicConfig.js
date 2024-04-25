const { readFromJs, appendToJs } = require("./temp/index");
const { validateRepos } = require("./utils");

// example:
// const repos = [
// {
//   url: "git@git.timevale.cn:public_health/esign-certification-h5.git",
//   dest: `${newProjectPath}/esign-certification-h5`,
//   name: 'esign-certification-h5'
//   byName: 'h5',
//   branch: 'master',
// },
// ];


/**
 * @description: 匹配得出仓库的数据结构
 * @param {*} paths 当前项目名称(name或者byName)
 * @param {*} branch 当前项目的需切换的分支
 * @return {*} arrayRepos
 */
const getHandleRepos = (paths, branch) => {
  const mosaicConfig = require(`${process.cwd()}/mosaic_project/mosaic.config.js`);
  // repos的校验
  validateRepos(mosaicConfig.repos);
  const { newProjectPath } = readFromJs("data");
  const arrayRepos = mosaicConfig.repos
    .map((v) => {
      const item = {
        ...v,
        dest: `${newProjectPath}/${v.name}`,
        byName: v.name.split("-")[v.name.split("-").length - 1],
      };
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
  console.log("🚀 ~ getScriptsForBuild ~ scripts:", scripts);
  console.log("🚀 ~ getScriptsForBuild ~ mode:", mode);

  let buildMap = {};
  for (const key in scripts) {
    if (["dev", "test", "sml", "prod"].includes(mode)) {
      const build_mode = Object.keys(scripts[key]).find((v) =>
        [`build:${mode}`, `build_${mode}`].includes(v)
      );
      buildMap[key] = build_mode;
      buildMap.build = build_mode;
    } else {
      buildMap[key] = mode;
      buildMap.build = mode;
    }
  }
  console.log("buildMap", buildMap);
  return buildMap;
};

module.exports = {
  getHandleRepos,
  validatePaths,
  getScriptsForBuild,
};

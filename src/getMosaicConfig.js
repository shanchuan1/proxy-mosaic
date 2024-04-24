const { readFromJs, appendToJs } = require("./temp/index");
const { validateRepos, validateServerConfig } = require("./utils");

// example:
// const repos = [
// {
//   url: "git@git.timevale.cn:public_health/esign-certification-h5.git",
//   dest: `${proPath}/esign-certification-h5`,
//   name: 'esign-certification-h5'
// },
// {
//   url: "git@git.timevale.cn:public_health/esign-hospital-ppm.git",
//   dest: `${proPath}/esign-hospital-ppm`,
//   name: 'esign-hospital-ppm'
// },
// {
//   url: "git@git.timevale.cn:public_health/esign-hospital-localsign.git",
//   dest: `${proPath}/esign-hospital-localsign`,
//   name: 'esign-hospital-localsign'
// },
// ];

// paths ：数组  ===> 应用名字
// paths ：字符串  ===> 分支

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

const getHandleServerConfig = () => {
  const mosaicConfig = require(`${process.cwd()}/mosaic_project/mosaic.config.js`);
  // serverConfig的校验
  validateServerConfig(mosaicConfig.serverConfig);
  return {
    ...mosaicConfig.serverConfig,
  };
};

const validatePaths = (projectNames, projectsList) => {
  const matchedNames = new Set();
  for (const project of projectsList) {
    if (project.byName) matchedNames.add(project.byName);
    if (project.name) matchedNames.add(project.name);
  }
  return projectNames.filter((name) => !matchedNames.has(name));
};

// 获取仓库项目内package.json文件的scripts脚本内容
const getReposPackageScripts = () => {
  const repos = readFromJs("repos");
  let scriptsMap = {}
  for (const key in repos) {
    scriptsMap[key] = require(`${repos[key].dest}/package.json`).scripts || {}
  }
  return scriptsMap
}


const getScriptsForBuild = (mode) => {
  const scripts = getReposPackageScripts()
  console.log('🚀 ~ getScriptsForBuild ~ scripts:', scripts)
  console.log('🚀 ~ getScriptsForBuild ~ mode:', mode)

  let buildMap = {}
  for (const key in scripts) {
    if (['dev', 'test', 'sml', 'prod'].includes(mode)) {
      buildMap[key] = Object.keys(scripts[key]).find(v=> [`build:${mode}`,`build_${mode}`].includes(v))
      buildMap.build = Object.keys(scripts[key]).find(v=> [`build:${mode}`,`build_${mode}`].includes(v))
    } else {
      buildMap[key] = mode
      buildMap.build = mode
    }
    
  }
  console.log('buildMap', buildMap);
  return buildMap
}

module.exports = {
  getHandleRepos,
  getHandleServerConfig,
  validatePaths,
  getScriptsForBuild,
};

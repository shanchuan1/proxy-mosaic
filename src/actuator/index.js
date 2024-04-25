const requiredVersion = require("../../package.json").engines.node;
const {
  copyTemplateContents: createTemplateProject,
} = require("../processFile");
const { processRepositories, getReposStatus } = require("../processGit");
const { OPERATIONS } = require("../constant");
const { processExecBuild } = require("../processBuild");
const { processExecDeploy } = require("../processDeploy");
const { isEmptyObject } = require("../utils");

// 校验node执行版本
const checkNodeVersion = (wanted = requiredVersion, id = "proxy-mosaic") => {
  if (process.version < wanted) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version."
      )
    );
    process.exit(1);
  }
};

// 执行器事件
const actuatorEvents = {
  create: async (params) => await createTemplateProject(params),
  clone: async (params) =>
    await processRepositories(OPERATIONS.CLONE, params.paths),
  build: async (params) => await processExecBuild(params),
  deploy: async (params) => await processExecDeploy(params),
  checkout: async (params) => {
    console.log('params', params);
    await processRepositories(OPERATIONS.CHECKOUT, params.paths, params.branch)
  },
  'show_branch': async (params) => {
   const reposStatus = getReposStatus(params)
   console.log('The current status of the warehouse being queried', reposStatus)
  }
};

// 统一执行器
const actuator = async (actOptions) => {
  console.log("🚀 ~ actuator ~ actOptions:", actOptions);
  if (isEmptyObject(actOptions)) return;
  const { key, value } = getFirstLevelKeyValue(actOptions);
  console.log('🚀 ~ actuator ~ key, value:', key, value)

  try {
    await actuatorEvents[key](value);
  } catch (error) {
    console.log("🚀 ~ actuator ~ error:", error);
  }
};

const getFirstLevelKeyValue = (actOptions) => {
  for (let key in actOptions) {
    return { key, value: actOptions[key] };
  }
};

module.exports = {
  checkNodeVersion,
  actuator,
};

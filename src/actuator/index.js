const isOnline = require("is-online");
const requiredVersion = require("../../package.json").engines.node;
const {
  copyTemplateContents: createTemplateProject,
  getOriginTemplate,
} = require("../processFile");
const { processRepositories, getReposStatus } = require("../processGit");
const { OPERATIONS } = require("../constant");
const { processExecBuild } = require("../processBuild");
const { processExecDeploy } = require("../processDeploy");
const { processExecClean } = require("../processClean");
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
  create: async (params) => {
    const online = await isOnline();
    ((await online) && getOriginTemplate(params)) ||
      createTemplateProject(params);
  },
  clone: async (params) =>
    await processRepositories(OPERATIONS.CLONE, params.paths),
  build: async (params) => await processExecBuild(params),
  deploy: async (params) => await processExecDeploy(params),
  checkout: async (params) =>
    await processRepositories(OPERATIONS.CHECKOUT, params.paths, params.branch),
  show_branch: async (params) => await getReposStatus(params),
  clean: async (params) => await processExecClean(params),
};

// 统一执行器
const actuator = async (actOptions) => {
  if (isEmptyObject(actOptions)) return;
  const { key, value } = getFirstLevelKeyValue(actOptions);

  try {
    await actuatorEvents[key](value);
  } catch (error) {
    console.log("actuator -- error:", error);
    process.exit(1);
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

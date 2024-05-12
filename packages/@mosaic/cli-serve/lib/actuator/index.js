/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:01:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-12 18:15:33
 */
const { OPERATIONS } = require("../constant");
const {
  processRepositories, 
  getReposStatus,
  processExecBuild,
  processExecDeploy,
  processExecClean
} = require('../process/index')
const { isEmptyObject } = require("../utils");



// 执行器事件
const actuatorEvents = {
  generate: async (params) =>
    await processRepositories(OPERATIONS.CLONE, params.paths),
  build: async (params) => await processExecBuild(params),
  deploy: async (params) => await processExecDeploy(params),
  checkout: async (params) =>
    await processRepositories(OPERATIONS.CHECKOUT, params.paths, params.branch),
  show_branch: async (params) => await getReposStatus(params),
  clean: async (params) => await processExecClean(params),
};


const getFirstLevelKeyValue = (actOptions) => {
  for (let key in actOptions) {
    return { key, value: actOptions[key] };
  }
};

// 统一执行器
module.exports = actuator = async (actOptions) => {
  if (isEmptyObject(actOptions)) return;
  const { key, value } = getFirstLevelKeyValue(actOptions);

  try {
    await actuatorEvents[key](value);
  } catch (error) {
    console.log("actuator -- error:", error);
    process.exit(0);
  }
};

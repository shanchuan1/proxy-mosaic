const Git = require("simple-git");
const chalk = require("chalk");
const { getHandleRepos, validateFrame } = require("./getMosaicConfig");
const { checkDir, checkDirEmpty } = require("./processFile");
const { execProcess } = require("./exec");
const { readFromJs } = require("./temp/index");
const { processOra } = require("./actuator/ora");
const { setPropertyInLast, mergedObjectNewReposToTemp } = require("./utils");
const { spinner_start, spinner_succeed, spinner_fail } = processOra();

// 定义GIT对应的操作事件
const OPERATION_FUNCTIONS = {
  clone: async (repo, gitInstance) => {
    await gitInstance.clone(repo.url, repo.dest);
    await spinner_succeed(`${repo.name} CLONE operation has been completed`);
    await execProcess("INSTALL", { repo });
    if (repo.isLastRepo) {
      validateFrame(); // 校验所有app使用的框架
      process.exit(1);
    }
  },
  pull: async (repo, gitInstance) => {
    gitInstance.pull() &&
      console.log(
        `\n Repository << ${repo.name} >> have already pulled the latest`
      );
    await spinner_succeed(`${repo.name} PULL operation has been completed`);
    if (repo.isLastRepo) {
      process.exit(0);
    }
  },
  checkout: async (repo, gitInstance) => {
    if ("branch" in repo) {
      try {
        await gitInstance.checkout([repo.branch]);
        await spinner_succeed(
          `${chalk.blue(
            repo.name
          )} CHECKOUT operation has been completed, and it has been checked out to branch ${chalk.blue(
            repo.branch
          )}`
        );
      } catch (err) {
        spinner_fail(
          `Error ${chalk.blue(
            repo.name
          )} switching branches of the ${chalk.blue(repo.branch)} :${err}`
        );
        process.exit(1);
      }
    }
    // TODO: 保留后续优化
    // console.warn(
    //   `Repository ${repo.name} does not contain a branch property, skipping branch switch.`
    // );
  },
};

/**
 * @description: 统一处理git仓库操作
 * @param {*} operation
 * @param {*} paths
 * @param {*} branch
 * @return {*}
 */
const processRepositories = async (operation, paths, branch) => {
  try {
    let getRepos = [];
    if (operation === "clone") {
      getRepos = getHandleRepos(paths, branch);
    } else {
      const tempRepos = readFromJs("repos");
      getRepos = Object.values(tempRepos)
        .map((v) => ({ ...v, branch }))
        .filter((v) => {
          if (Array.isArray(paths) && paths.length > 0 && paths[0] !== "all") {
            return paths.includes(v.name) || paths.includes(v.byName);
          }
          return v;
        });
    }
    const repos = setPropertyInLast(getRepos, "isLastRepo");
    for (const repo of repos) {
      const isHasDir = await checkDir(repo.dest);
      const isDirEmpty = await checkDirEmpty(repo.dest);

      const gitInstance = Git(repo.dest);

      /* 如过本地仓库不存在 */
      if (!isHasDir || isDirEmpty) {
        // 只能执行clone操作
        operation = "clone";
      }

      if (isHasDir && !isDirEmpty && operation === "clone") {
        operation = "pull";
      }
      // TODO: 动画
      await spinner_start(
        `${repo.name} executing git ${operation.toUpperCase()} operation...\n`
      );
      // 克隆或拉取操作
      await OPERATION_FUNCTIONS[operation](repo, gitInstance).catch((err) => {
        console.error(
          `Operation "${operation}" for repository ${repo.url} failed:`,
          err
        );
        throw err;
      });
    }
    // checkout完成统一添加仓库分支状态
    if (operation === "checkout") {
      await getReposStatus({ paths: ["all"] }, false);
      process.exit(1);
    }
  } catch (err) {
    console.log("err:", err);
    process.exit(1);
  }
};

let allReposBranches = null;
let specifyReposBranches = null;

/**
 * @description: 获取所有仓库分支状态
 * @param {*} options
 * @param {*} isLog
 * @return {*}
 */
const getReposStatus = async (options, isLog = true) => {
  const repos = readFromJs("repos");
  // TODO: 仓库状态取值后续再考虑
  // const output = [...await getCurrentBranch(options, repos)].filter(Boolean);
  // console.log("The current status of the repos being queried\n", output);
  await getCurrentBranch(options, repos);
  if (isLog) {
    console.log(
      "The current status of the repos being queried\n",
      options.paths[0] === "all" ? allReposBranches : specifyReposBranches
    );
    process.exit(1);
  }
};

/**
 * @description: 获取当前分支状态
 * @param {*} options
 * @param {*} repos
 * @return {*} 暂不设置返回值,保证控制台可以完整输出
 */
const getCurrentBranch = async (options, repos) => {
  const outputObj = {};
  return Promise.all(
    Object.entries(repos).map(async (repo) => {
      const key = repo[0];
      const item = repo[1];
      const gitInstance = Git(item.dest);
      const branches = await gitInstance
        .branch(["-v", "--verbose"])
        .catch((err) => {
          console.error("Error fetching branch information:", err);
          process.exit(1);
        });

      if (branches) {
        outputObj[key] = {};
        outputObj[key].all = branches.all;
        outputObj[key].current = branches.current;
        if (options.paths[0] === "all" && item.isLastRepo) {
          allReposBranches = outputObj;
          let allReposBranchesObject = {};
          for (const key in allReposBranches) {
            allReposBranchesObject[key] = {
              branches: allReposBranches[key],
            };
          }
          mergedObjectNewReposToTemp(allReposBranchesObject, repos);
          // TODO: 保留后续优化
          // return outputObj;
        } else {
          let obj = {};
          options.paths.forEach((v) => {
            const key = findMatchedKey(v, repos);
            obj[key] = outputObj[key];
          });
          if (item.isLastRepo) {
            specifyReposBranches = obj;
            let specifyReposBranchesObject = {};
            for (const key in specifyReposBranches) {
              specifyReposBranchesObject[key] = {
                branches: specifyReposBranches[key],
              };
            }
            mergedObjectNewReposToTemp(specifyReposBranchesObject, repos);
            // TODO: 保留后续优化
            // return obj;
          }
        }
      }
    })
  );
};

/**
 * @description: 匹配app全名或别名
 * @param {*} targetValue
 * @param {*} obj
 * @return {*}
 */
const findMatchedKey = (targetValue, obj) => {
  for (const key in obj) {
    const item = obj[key];
    if (item.name === targetValue || item.byName === targetValue) {
      return key;
    }
  }
  return null; // 如果没有找到匹配项，返回null
};

/**
 * @description: 校验当前分支是否统一
 * @return {*} referenceValue 分支别名
 */
const checkCurrentConsistency = async () => {
  await getReposStatus({ paths: ["all"] }, false);
  const branches = readFromJs("branch");
  const referenceValue = Object.values(branches)[0].current;

  for (const key in branches) {
    if (branches.hasOwnProperty(key)) {
      if (branches[key].current !== referenceValue) {
        return false;
      }
    }
  }

  return referenceValue.split("/").join("_");
};

module.exports = {
  processRepositories,
  getReposStatus,
  checkCurrentConsistency,
};

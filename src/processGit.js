const Git = require("simple-git");
const { getHandleRepos } = require("./getMosaicConfig");
const { checkDir, checkDirEmpty } = require("./processFile");
const { execProcess } = require("./exec");
const { readFromJs } = require("./temp/index");
const { processOra } = require("./actuator/ora");
const { spinner_start, spinner_succeed } = processOra();
const chalk = require("chalk");


// 定义对应的操作函数
const OPERATION_FUNCTIONS = {
  clone: async (repo, gitInstance) => {
    await gitInstance.clone(repo.url, repo.dest);
    await spinner_succeed(`${repo.name} CLONE operation has been completed`);
    await execProcess("INSTALL", { repo });
  },
  pull: async (repo, gitInstance) =>{
    gitInstance.pull() &&
    console.log(`\n Repository << ${repo.name} >> have already pulled the latest`)
    await spinner_succeed(`${repo.name} PULL operation has been completed`);
  },
  checkout: async (repo, gitInstance) => {
    if ("branch" in repo) {
      gitInstance.checkout(repo.branch);
      await spinner_succeed(`${chalk.blue(repo.name)} CHECKOUT operation has been completed, and it has been checked out to branch ${chalk.blue(repo.branch)}`);
      if (repo.isLastRepo) {
        process.exit(1);
      }
      return;
    }
    console.warn(
      `Repository ${repo.name} does not contain a branch property, skipping branch switch.`
    );
  },
};

// 处理git仓库操作
const processRepositories = async (operation, paths, branch) => {
  try {
    const repos = getHandleRepos(paths, branch);
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
      await spinner_start(`${repo.name}executing git ${operation.toUpperCase()} operation...`);
      // 克隆或拉取操作
      await OPERATION_FUNCTIONS[operation](repo, gitInstance).catch((err) => {
        console.error(
          `Operation "${operation}" for repository ${repo.url} failed:`,
          err
        );
        throw err;
      });

    }
  } catch (err) {
    console.log("err:", err);
  }
};

// 获取仓库状态
const getReposStatus = (options) => {
  // TODO：paths内容在repos内不存在需友好提示
  const repos = readFromJs("repos");
  const outputObj = {};
  for (const key in repos) {
    const item = repos[key];
    outputObj[key] = item.branch || "master";
  }
  if (options.paths[0] === "all") {
    return outputObj;
  } else {
    let obj = {};
    options.paths.forEach((v) => {
      const key = findMatchedKey(v, repos);
      obj = {
        [key]: outputObj[key],
      };
    });
    return obj;
  }
};

const findMatchedKey = (targetValue, obj) => {
  for (const key in obj) {
    const item = obj[key];
    if (item.name === targetValue || item.byName === targetValue) {
      return key;
    }
  }
  return null; // 如果没有找到匹配项，返回null
};

module.exports = {
  processRepositories,
  getReposStatus,
};

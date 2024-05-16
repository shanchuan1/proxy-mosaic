/*
 * @Description: GIt操作模块
 * @Author: shanchuan
 * @Date: 2024-04-22 14:37:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 18:10:18
 */
const Git = require("simple-git");
const chalk = require("chalk");
const ReposConfigurator = require("../mosaicConfig");
const { checkDir, checkDirEmpty } = require("./processFile");
const  execProcess  = require("./execProcess");
const { spinner_start, spinner_succeed, spinner_fail } =
  require("../actuator/ora").processOra();

// 定义GIT对应的操作事件
const OPERATION_FUNCTIONS = {
  clone: async (repo, gitInstance) => {
    await gitInstance.clone(repo.url, repo.dest);
    await spinner_succeed(`${repo.name} CLONE operation has been completed`);
    await execProcess("INSTALL", { repo });
    if (repo.isLastRepo) {
      process.exit(0);
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
          `${chalk.blue(repo.name)}: The ${chalk.blue(
            "checkout"
          )} operation has been completed, and it has been checked out to branch ${chalk.blue(
            repo.branch
          )}`
        );
        if (repo.isLastRepo) {
          process.exit(0);
        }
      } catch (err) {
        spinner_fail(
          `Error ${chalk.blue(
            repo.name
          )} switching branches of the ${chalk.blue(repo.branch)} :${err}`
        );
        process.exit(0);
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
module.exports = processRepositories = async (operation, paths, branch) => {
  try {
    // 此branch只做切换分支
    const Repos = new ReposConfigurator(paths, { branch });
    const repos = await Repos.getRepos(operation);

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
  } catch (err) {
    console.log("processRepositories ~ err:", err);
    process.exit(0);
  }
};

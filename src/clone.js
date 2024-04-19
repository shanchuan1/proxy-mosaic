const Git = require("simple-git");
const repos = require("./repos");
const { checkDir, checkDirEmpty } = require("./processFile");
const { execProcess } = require("./exec");

// 定义Git操作常量
const OPERATIONS = {
  CLONE: "clone",
  PULL: "pull",
  SWITCH_BRANCH: "switch_branch",
};

// 定义对应的操作函数
const OPERATION_FUNCTIONS = {
  [OPERATIONS.CLONE]: async (repo, gitInstance) => {
    await gitInstance.clone(repo.url, repo.dest);
    await execProcess("INSTALL", repo);
  },
  [OPERATIONS.PULL]: async (repo, gitInstance) =>
    gitInstance.pull() &&
    console.log(`Repository << ${repo.name} >> have already pulled the latest`),
  [OPERATIONS.SWITCH_BRANCH]: async (repo, gitInstance) => {
    if ("branch" in repo) {
      return gitInstance.checkout(repo.branch);
    }
    console.warn(
      `Repository ${repo.url} does not contain a branch property, skipping branch switch.`
    );
  },
};

/* 校验本地仓库是否存在 */
const getHasLocalRepos = async (gitInstance) => {
  const status = await gitInstance.revparse(["--show-toplevel"]);
  if (!status.trim()) {
    throw new Error("Repository does not exist locally.");
  }
  return !!status.trim();
};

/* 处理git仓库操作 */
const processRepositories = async (
  repos,
  operation,
  errorMessageOnFailure,
  successMessage
) => {
  try {
    await Promise.all(
      repos.map(async (repo) => {
        const isHasDir = await checkDir(repo.dest);
        const isDirEmpty = await checkDirEmpty(repo.dest);
        console.log("🚀 ~ repos.map ~ isDirEmpty:", isDirEmpty);
        console.log("🚀 ~ repos.map ~ isHasDir:", isHasDir);

        const gitInstance = Git(repo.dest);

        const isHasLocalRepos = await getHasLocalRepos(gitInstance);
        console.log("🚀 ~ repos.map ~ isHasLocalRepos:", isHasLocalRepos);

        /* 如过本地仓库不存在 */
        if (!isHasLocalRepos || isDirEmpty) {
          // 只能执行clone操作
          operation = OPERATIONS.CLONE;
        }

        if (isHasDir && !isDirEmpty && operation === OPERATIONS.CLONE) {
          // return console.log(`项目: <<${repo.name}>> 已经存在`);
          operation = OPERATIONS.PULL;
        }
        // 克隆或拉取操作
        await OPERATION_FUNCTIONS[operation](repo, gitInstance).catch((err) => {
          console.error(
            `Operation "${operation}" for repository ${repo.url} failed:`,
            err
          );
          throw err;
        });

        // 克隆完成后，进入仓库目录并执行 yarn 命令
        // if (operation === OPERATIONS.CLONE) {
        //   const yarnInstallCommand = `cd ${repo.dest} && yarn`;
        //   await execProcess(yarnInstallCommand, repo);
        //   console.log('🚀 ~ repos.map ~ repo:', repo)
        //   console.log('🚀 ~ repos.map ~ yarnInstallCommand:', yarnInstallCommand)
        // }

        // 特殊处理分支切换成功的输出
        if (operation === OPERATIONS.SWITCH_BRANCH && "branch" in repo) {
          console.log(
            `Repository ${repo.url} has been checked out to branch ${repo.branch}.`
          );
        }
      })
    );

    console.log(successMessage);
  } catch (err) {
    console.error(errorMessageOnFailure, err);
  }
};

// 统一切换分支
const switchBranchMessageSuccess =
  "All repositories have been switched to their respective branches.";
const switchBranchMessageFailure =
  "One or more repositories failed during branch cloning.";

processRepositories(
  repos,
  OPERATIONS.CLONE,
  switchBranchMessageFailure,
  switchBranchMessageSuccess
);

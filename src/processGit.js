const Git = require("simple-git");
const { getHandleRepos } = require("./getMosaicConfig");
const { checkDir, checkDirEmpty } = require("./processFile");
const { execProcess } = require("./exec");
const { readFromJs } = require("./temp/index");

// 定义对应的操作函数
const OPERATION_FUNCTIONS = {
  clone: async (repo, gitInstance) => {
    await gitInstance.clone(repo.url, repo.dest);
    await execProcess("INSTALL", {repo});
  },
  pull: async (repo, gitInstance) =>
    gitInstance.pull() &&
    console.log(`Repository << ${repo.name} >> have already pulled the latest`),
  checkout: async (repo, gitInstance) => {
    if ("branch" in repo) {
      gitInstance.checkout(repo.branch);
      console.log(
        `Repository ${repo.url} has been checked out to branch ${repo.branch}.`
      );
      return;
    }
    console.warn(
      `Repository ${repo.url} does not contain a branch property, skipping branch switch.`
    );
  },
};

// 处理git仓库操作
const processRepositories = async (operation, paths, branch) => {
  console.log("🚀 ~ operation:", operation);
  try {
    const repos = getHandleRepos(paths, branch);
    console.log("🚀 ~ repos:", repos);
    // return;
    await Promise.all(
      repos.map(async (repo) => {
        const isHasDir = await checkDir(repo.dest);
        const isDirEmpty = await checkDirEmpty(repo.dest);
        console.log("🚀 ~ repos.map ~ isDirEmpty:", isDirEmpty);
        console.log("🚀 ~ repos.map ~ isHasDir:", isHasDir);

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
        console.log("开始执行git操作");
        // 克隆或拉取操作
        await OPERATION_FUNCTIONS[operation](repo, gitInstance).catch((err) => {
          console.error(
            `Operation "${operation}" for repository ${repo.url} failed:`,
            err
          );
          throw err;
        });

        // 特殊处理分支切换成功的输出
        if (operation === "checkout" && "branch" in repo) {
          console.log(
            `Repository ${repo.url} has been checked out to branch ${repo.branch}.`
          );
        }
      })
    );

    // console.log(successMessage);
  } catch (err) {
    console.log("err:", err);
  }
};

// 获取仓库状态
const getReposStatus = (options) => {
  console.log("🚀 ~ getReposStatus ~ options:", options);
  // TODO：paths内容在repos内不存在需友好提示
  const repos = readFromJs("repos");
  const outputObj = {};
  for (const key in repos) {
    const item = repos[key];
    outputObj[key] = item.branch || 'master';
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

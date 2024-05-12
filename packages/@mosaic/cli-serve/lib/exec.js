const util = require("util");
const exec = util.promisify(require("child_process").exec);
const chalk = require("chalk");
const { spinner_start, spinner_succeed } =
  require("./actuator/ora").processOra();

global.DEFAULT_PACKAGE_MANAGER = "yarn";

const packManager = {
  yarn: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && yarn`,
    // BUILD: ({ repo, build_Mode }) => `cd ${repo.dest} && yarn ${build_Mode}`,
    BUILD: ({ repo, build_Mode }) => `yarn --cwd "${repo.dest}" ${build_Mode}`,
  },
  npm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && npm run install`,
    BUILD: ({ repo, build_Mode }) =>
      `npm run --cwd "${repo.dest}" ${build_Mode}`,
  },
  pnpm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && pnpm install`,
    BUILD: ({ repo, build_Mode }) =>
      `pnpm run --cwd "${repo.dest}" ${build_Mode}`,
  },
};

const execLog = async (command, repo) => {
  return (stdout, stderr) => {
    command === "INSATLL" &&
      spinner_succeed(
        `<<${repo.name}>> dependency has been installed and completed`
      );
    command === "BUILD" &&
      spinner_succeed(
        `<<${
          repo.name
        }>> has been packaged with ${`built in buildMode: ${chalk.blue(
          repo.buildMode
        )} and branch in current: ${chalk.blue(repo.branches.current)}`} `
      );

    if (JSON.parse(process.env.IS_LOG_STDOUT).log) {
      stdout && console.log("📦 ~ stdout:", stdout);
      stderr && console.error(`An error occurred for ${repo.url}: ${stderr}`);
    }
  };
};

/* 执行shell脚本 */
const execProcess = async (command, repo) => {
  try {
    const build_Mode = repo.buildMode;
    const currentBranch = repo.branches.current;
    const bashCommand = packManager[global.DEFAULT_PACKAGE_MANAGER][command]({
      repo,
      build_Mode,
    });

    await spinner_start(
      `${repo.name}: Executing operation with ${
        command === "BUILD"
          ? `build mode of ${chalk.green(build_Mode)}`
          : command
      } and current branch as ${chalk.green(currentBranch)} ...`
    );

    const { stdout, stderr } = await exec(bashCommand);

    await (
      await execLog(command, repo)
    )(stdout, stderr);
  } catch (error) {
    console.log(" execProcess -- error:", error);
    process.exit(0);
  }
};

module.exports = {
  execProcess,
};

/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-11 11:02:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 13:12:56
 */
const {
  chalk,
  processOra,
  execa,
  hasYarn,
} = require("@proxy-mosaic/cli-shared-utils");
const { spinner_start, spinner_succeed } = processOra();


const packManager = {
  yarn: {
    INSTALL: () => `yarn`,
    BUILD: (build_Mode) => `yarn  ${build_Mode}`,
  },
  npm: {
    INSTALL: () => `npm run install`,
    BUILD: (build_Mode) => `npm run ${build_Mode}`,
  },
  pnpm: {
    INSTALL: () => ` pnpm install`,
    BUILD: (build_Mode) => `pnpm run ${build_Mode}`,
  },
};


const execLog = async (command, repo, stdout, stderr) => {
  if (command === "INSTALL") {
    spinner_succeed(`${repo.name} dependencies installed successfully`);
  } else if (command === "BUILD") {
    spinner_succeed(
      `<<${repo.name}>> packaged in ${chalk.blue(
        repo.buildMode
      )} build mode, branch: ${chalk.blue(repo.branches?.current || "master")}`
    );
  }
  if (JSON.parse(process.env.IS_LOG_STDOUT).log) {
    stdout && console.log("📦 ~ stdout:", stdout);
    stderr && console.error(`An error occurred for ${repo.url}: ${stderr}`);
  }
};

/* 执行shell脚本 */
module.exports = execProcess = async (command, repo) => {
  try {
    const build_Mode = repo.buildMode;
    const currentBranch = repo.branches?.current || "master";
    const bashCommand =
      packManager[`${hasYarn() && "yarn"}`][command](build_Mode);

    await spinner_start(
      `${repo.name}: Executing operation with ${
        command === "BUILD"
          ? `build mode of ${chalk.green(build_Mode)}`
          : command
      } and current branch as ${chalk.green(currentBranch)} ...\n`
    );

    const { stdout, stderr } = await execa(bashCommand, {
      shell: true,
      cwd: repo.dest,
    });

    await execLog(command, repo, stdout, stderr);
  } catch (error) {
    console.log(" execProcess -- error:", error);
    process.exit(0);
  }
};

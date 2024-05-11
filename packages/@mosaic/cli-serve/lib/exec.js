const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { spinner_start,  spinner_succeed } = require("./actuator/ora").processOra();
const { greenLog } = require("./terminalLog");

global.DEFAULT_PACKAGE_MANAGER = "yarn";

const packManager = {
  yarn: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && yarn`,
    // BUILD: ({ repo, build_Mode }) => `cd ${repo.dest} && yarn ${build_Mode}`,
    BUILD: ({ repo, build_Mode }) => `yarn --cwd "${repo.dest}" ${build_Mode}`,
  },
  npm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && npm run install`,
    BUILD: ({ repo, build_Mode }) => `npm run --cwd "${repo.dest}" ${build_Mode}`,
  },
  pnpm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && pnpm install`,
    BUILD: ({ repo, build_Mode }) =>
      `pnpm run --cwd "${repo.dest}" ${build_Mode}`,
  },
};

const execLog = (command, repo) => {
  return (stdout) => {
    command === "INSATLL" &&
      greenLog(`<<${repo.name}>> dependency has been installed and completed`);
    command === "BUILD" &&
      greenLog(`<<${repo.name}>> has been packaged and built`);
    console.log("stdout", stdout);
  };
};

/* 执行shell脚本 */
const execProcess = async (command, options) => {
  try {
    const { repo, build_Mode } = options;
    const bashCommand = packManager[global.DEFAULT_PACKAGE_MANAGER][command]({
      repo,
      build_Mode,
    });

    await spinner_start(
      `${repo.name}: Executing ${
        command === "BUILD" ? build_Mode : command
      } operation...\n`
    );
    const { stdout, stderr } = await exec(bashCommand);
    execLog(command, repo)(stdout);

    if (stderr) {
      console.error(`An error occurred for ${repo.url}: ${stderr}`);
    }
    await spinner_succeed(
      `The ${repo.name} of ${
        command === "BUILD" ? build_Mode : command
      } operation has been completed`
    );
  } catch (error) {
    console.log(' execProcess -- error:', error)
    process.exit(0);
  }
};

module.exports = {
  execProcess,
};

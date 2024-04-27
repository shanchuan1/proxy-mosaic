const { greenLog } = require("./terminalLog");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { processOra } = require('./actuator/ora')

global.DEFAULT_PACKAGE_MANAGER = "yarn";

const packManager = {
  yarn: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && yarn`,
    BUILD: ({ repo, build_Mode }) => `cd ${repo.dest} && yarn ${build_Mode}`,
  },
  npm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && npm run install`,
    BUILD: ({ repo, build_Mode }) => `cd ${repo.dest} && npm run ${build_Mode}`,
  },
  pnpm: {
    INSTALL: ({ repo }) => `cd ${repo.dest} && pnpm install`,
    BUILD: ({ repo, build_Mode }) =>
      `cd ${repo.dest} && pnpm run ${build_Mode}`,
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
    const { spinner_start, spinner_succeed } = processOra()

    await spinner_start(`${repo.name}: Executing ${build_Mode} operation...`)
    const { stdout, stderr } = await exec(bashCommand);

    execLog(command, repo)(stdout);

    if (stderr) {
      console.error(`Yarn install errors for ${repo.url}: ${stderr}`);
    }
    await spinner_succeed(`The ${repo.name} of ${build_Mode} operation has been completed`)
    if (repo.isLastRepo) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Failed to run '${command}' in ${repo.url}:`, error);
    throw error; 
  }
};

module.exports = {
  execProcess,
};

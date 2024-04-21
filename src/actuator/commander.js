const { Command } = require("commander");
const packageJson = require("../../package.json");
const minimist = require("minimist");
const path = require("path");

// const leven = require('leven')
const program = new Command();

let commandOptions = {};
const getCommandOptions = (options) => {
  const { type, ...rest } = options;
  commandOptions = {
    [type]: { ...rest },
  };
};

// 先定义全局选项
program.option("-v, --version", "显示版本信息", () => {
  console.log(`version: ${packageJson.version}`);
  process.exit(0); // 退出程序
});

// 定义命令行选项和参数
program
  .command("create <app-name>")
  .description("create a new project powered by proxy-mosaic")
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      );
    }
    const commandArgs = {
      type: "create",
      currentTemplatePath: path.resolve(__dirname, "../../template"),
      currentLocalPathCWD: process.cwd(),
      projectName: name,
      options,
    };
    getCommandOptions(commandArgs);
  });

program
  .command("clone [paths...]")
  .description("create a new project powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to clone")
  .action((paths, options) => handleCommand("clone", paths, options));

program
  .command("build [paths...]")
  .description("build a new project resource re powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to build")
  .action((paths, options) => handleCommand("build", paths, options));

program
  .command("deploy [paths...]")
  .description("deploy a new project resource powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to deploy")
  .action((paths, options) => handleCommand("deploy", paths, options));

program
  .command("checkout <branch> [projects...]")
  .description("checkout a branch in your project powered by proxy-mosaic")
  .action((branch, projects) =>  handleCommand("checkout", projects, branch));

program
  .command("show")
  .command("branch")
  .arguments("[projects...]", "The list of projects to show branches for")
  .description("show a branch in your project powered by proxy-mosaic")
  .action((projects) =>  {
    console.log('🚀 ~ .action ~ projects:', projects)
    handleCommand("show_branch", projects, {})
  });

  


const handleCommand = (type, paths, options) => {
  console.log(`🚀 ~ handleCommand ~ options for ${type}:`, options);
  console.log(`🚀 ~ handleCommand ~ paths for ${type}:`, paths);

  if (!paths.length) {
    paths = ["all"];
  }

  // 获取-p选项的值
  const npmRegistryPath = options.path;

  const commandArgs = {
    type,
    paths,
    options: {
      ...options,
      npmRegistryPath,
    },
  };

  if (type === 'checkout' ) {
    commandArgs.branch = options
    delete commandArgs.options
  }

  getCommandOptions(commandArgs);
};


// 执行命令行解析
program.parse(process.argv);

module.exports = {
  commandOptions,
};

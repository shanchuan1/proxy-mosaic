#!/usr/bin/env node
const { Command } = require("commander");
const packageJson = require("../package.json");
const minimist = require("minimist");
const path = require("path");
const { buildInquirer } = require("../src/actuator/inquirer");
const { actuator, checkNodeVersion } = require("../src/actuator/index");

// const leven = require('leven')
const program = new Command();

// 校验node版本
checkNodeVersion();

// 执行命令的当前路径
global.LocalPathCWD = process.cwd();
// console.log('🚀 ~ global.LocalPathCWD:', global.LocalPathCWD)

// 先定义全局选项
program.option("-v, --version", "output the version number", () => {
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
    create: {
        currentTemplatePath: path.resolve(__dirname, "../template"),
        currentLocalPathCWD: process.cwd(),
        projectName: name,
        options,
      },
    };
    actuator(commandArgs);
  });

program
  .command("clone [paths...]")
  .description("clone the specify project powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to clone")
  .action((paths, options) => getCommandParams("clone", paths, options));

program
  .command("build [paths...]")
  .description("build a new project resource re powered by proxy-mosaic")
  .option("-d, --dev ", "Development mode")
  .option("-t, --test ", "Test mode")
  .option("-s, --sml ", "Simulation mode")
  .option("-p, --prod ", "Production mode")
  .option("-c, --config ", "configs for build mode")
  .option("-a, --add ", "add the configs for build mode")
  .action((paths, options) => {
    getInquirerOperation("build", options).then((res) => {
      const buildMode = res.buildMode || "build";
      // 只有默认与指定模式后才会向下执行
      if (options.config || buildMode === "build") {
        getCommandParams("build", paths, { ...options, buildMode });
      }
    });
  });

program
  .command("deploy [paths...]")
  .description("deploy a new project resource powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to deploy")
  .action((paths, options) => getCommandParams("deploy", paths, options));

program
  .command("checkout <branch> [projects...]")
  .description("checkout a branch in your project powered by proxy-mosaic")
  .action((branch, projects) => getCommandParams("checkout", projects, branch));

program
  .command("show")
  .command("branch")
  .arguments("[projects...]", "The list of projects to show branches for")
  .description("show a branch in your project powered by proxy-mosaic")
  .action((projects) => {
    console.log("🚀 ~ .action ~ projects:", projects);
    getCommandParams("show_branch", projects, {});
  });

// 获取特定的交互
const getInquirerOperation = async (type, options) => {
  console.log("🚀 ~ getInquirerOperation ~ options:", options);
  if (type === "build") {
    return await buildInquirer(options);
  }
};

const getCommandParams = (type, paths, options) => {
  console.log(`🚀 ~ getCommandParams ~ options for ${type}:`, options);
  console.log(`🚀 ~ getCommandParams ~ paths for ${type}:`, paths);

  if (!paths.length) {
    paths = ["all"];
  }

  const commandArgs = {
    [type]: {
      paths,
      options,
    },
  };

  if (type === "checkout") {
    commandArgs[type].branch = options;
    delete commandArgs[type].options;
  }

  // 统一执行器
  actuator(commandArgs);
};

// 执行命令行解析
program.parse(process.argv);

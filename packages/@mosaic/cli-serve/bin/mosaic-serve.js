#!/usr/bin/env node
const { Command } = require("commander");
const packageJson = require("../package.json");
const {
  buildInquirer,
  deployInquirer,
  cleanInquirer,
} = require("../lib/actuator/inquirer");
const actuator = require("../lib/actuator");
const chalk = require("chalk");

process.env.MOSAIC_CLI_CONTEXT = process.cwd();

const { setProcessEnv } = require("../lib/processEnv");

// const leven = require('leven')
const program = new Command();

// 校验node执行版本
const checkNodeVersion = (wanted = requiredVersion, id = "proxy-mosaic") => {
  if (process.version < wanted) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version."
      )
    );
    process.exit(0);
  }
};


setProcessEnv({
  cwd: process.cwd(),
});

// 先定义全局选项
program.option("-v, --version", "output the version number", () => {
  console.log(`version: ${packageJson.version}`);
  process.exit(0); // 退出程序
});

// 定义命令行选项和参数
program
  .command("generate [paths...]")
  .description("generate the specify project powered by proxy-mosaic")
  .option("-p, --path <path>", "Specify the project you need to clone")
  .option("-l, --log", "The console expand dependent output")
  .action((paths, options) => getCommandParams("generate", paths, options));

program
  .command("build [paths...]")
  .description("build a new project resource re powered by proxy-mosaic")
  .option("-d, --dev ", "development mode")
  .option("-t, --test ", "test mode")
  .option("-s, --sml ", "simulation mode")
  .option("-p, --prod ", "production mode")
  .option("-c, --config ", "configs for build mode")
  .option("-a, --add ", "add the configs for build mode")
  .option("-m, --mode <mode> ", "specify a build mode")
  .option("-l, --log", "The console expand dependent output")
  .action(async (paths, options) => {
    // -c 选择配置 -a 新增配置 走交互命令 获取打包模式
    const res =
      ((options.config || options.add) &&
        (await getInquirerOperation("build", options))) ||
      {};
    const matchingOption = ["dev", "test", "sml", "prod"].find(
      (option) => options[option]
    );
    let configBuildMode =
      matchingOption || res.buildMode || options.mode || "build";

    getCommandParams("build", paths, { ...options, configBuildMode });
  });

program
  .command("deploy [paths...]")
  .description("deploy a new project resource powered by proxy-mosaic")
  .option("-c, --config ", "configs for the server")
  .option("-a, --add ", "add the configs for the server")
  .action(async (paths, options) => {
    if (!(options.config || options.add)) {
      // 默认要部署服务器，必需携带-c，或-a参数指定
      console.log(
        `the server must be specified, You need to specify or configure a server through '-c' or '-a'`
      );
      process.exit(0);
    }
    const res = await getInquirerOperation("deploy", options);
    getCommandParams("deploy", paths, { ...options, serverConfig: res });
  });

program
  .command("clean [paths...]")
  .description("deploy a new project resource powered by proxy-mosaic")
  .option("-c, --config ", "configs for the server")
  .action(async (paths, options) => {
    const res = await getInquirerOperation("clean", options);
    getCommandParams("clean", paths, { ...options, cleanConfig: res });
  });

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
    getCommandParams("show_branch", projects, {});
  });

program
  .command("inspect")
  .command("branch")
  .arguments("[projects...]", "The list of projects to show branches for")
  .description("show a branch in your project powered by proxy-mosaic")
  .action((projects) => {
    getCommandParams("inspect", projects, {});
  });

// 获取特定的交互
const getInquirerOperation = async (type, options) => {
  const operationMap = {
    build: async (options) => await buildInquirer(options),
    deploy: async (options) => await deployInquirer(options),
    clean: async (options) => await cleanInquirer(options),
  };
  return operationMap[type](options);
};

// 通用获取命令参数
const getCommandParams = (type, paths, options) => {
  console.log('🚀 ~ getCommandParams ~ options:', options)
  const { log } = options
  process.env.IS_LOG_STDOUT = JSON.stringify({ log })
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

  if (type === "build") {
    // 如果 -c配置的模式与 -m指定的模式都存在 删除-c配置模式
    options.mode &&
      options.configBuildMode &&
      delete commandArgs[type].options.configBuildMode;
  }

  console.log(`mosaic ${chalk.blue('notice')} ${chalk.magenta('mosaic-serve')} v${packageJson.version}`);
  // 统一执行器
  actuator(commandArgs);
};

// 执行命令行解析
program.parse(process.argv);

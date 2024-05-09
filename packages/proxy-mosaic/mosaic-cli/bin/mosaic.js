#!/usr/bin/env node
const { Command } = require("commander");
const minimist = require("minimist");
const path = require("path");
const chalk = require("chalk")
const packageJson = require("../package.json");
const program = new Command();

program.option("-v, --version", "output the version number", () => {
  console.log(`version: ${packageJson.version}`);
  process.exit(0); // 退出程序
});

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
      currentTemplatePath: path.resolve(__dirname, "../template"),
      currentLocalPathCWD: process.cwd(),
      projectName: name,
      options,
    };
    // actuator(commandArgs);
    require("../lib/create")(commandArgs);
  });

program.parse(process.argv);

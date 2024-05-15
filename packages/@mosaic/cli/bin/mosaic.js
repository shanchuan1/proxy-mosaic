#!/usr/bin/env node
const { Command } = require("commander");
const minimist = require("minimist");
const chalk = require("chalk")
const leven = require('leven')
const packageJson = require("../package.json");
const requiredVersion = require('../package.json').engines.node
const program = new Command();
const semver = require('semver')

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@mosaic/cli')

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
      projectName: name,
      options,
    };
    console.log(`mosaic ${chalk.blue('notice')} ${chalk.magenta('cli')} v${packageJson.version}`);
    require("../lib/create")(commandArgs);
  });

  program.on('command:*', ([cmd]) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    suggestCommands(cmd)
    process.exitCode = 1
  })


program.parse(process.argv);


const suggestCommands = (unknownCommand) => {
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
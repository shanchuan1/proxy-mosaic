/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-10 10:34:32
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-15 16:30:25
 */
const path = require("path");
const chalk = require("chalk");
const validateProjectName = require("validate-npm-package-name");
const writeFileTree = require("./utils/writeFileTree");
const {hasYarn, hasPnpm3OrLater } = require('./utils/env')
const PackageManager = require('./utils/projectPackageManager')
const {clearConsole } = require('./utils')
const packageJson = require("../package.json").version;

process.env.MOSAIC_CLI_CONTEXT;

const create = async (options) => {
  const { name, context, proNameByMosaic } = getCurrentProInfo(options);

  const pkg = {
    name: proNameByMosaic,
    version: "0.1.0",
    private: true,
    scripts: {
      gen: "mosaic-serve generate",
      build: "mosaic-serve build",
      deploy: "mosaic-serve deploy -c",
      checkout: "mosaic-serve checkout",
      inspect: "mosaic-serve inspect -b",
    },
    devDependencies: {},
  };

  const deps = ["@proxy-mosaic/cli-serve"];
  deps.forEach((dep) => {
    version = packageJson;
    pkg.devDependencies[dep] = version;
  });

  await writeFileTree(proNameByMosaic, {
    apps: null,
    packages: null,
    "package.json": JSON.stringify(pkg, null, 2),
    "mosaic.config.js": require("../template/mosaic.config.js"),
  });
  console.log(`mosaic ${chalk.green.bold("success")} Initialized Mosaic files`);

  const packageManager = (
    (hasYarn() ? 'yarn' : null) ||
    (hasPnpm3OrLater() ? 'pnpm' : 'npm')
  )

  await clearConsole()
  const pm = new PackageManager({ context, forcePackageManager: packageManager })
  // console.log('🚀 ~ create ~ pm:', pm)
  pm.install()
  // process.exit(0);
};

const getCurrentProInfo = (options) => {
  const { projectName } = options;
  getValidateProjectName(projectName);
  const cwd = process.cwd();
  const proNameByMosaic = `${projectName}_mosaic`;
  // const targetDir = path.resolve(cwd, projectName || ".");
  // 使用mosaic别名标志项目名
  const targetDir = path.resolve(cwd, proNameByMosaic || ".");
  process.env.MOSAIC_CLI_CONTEXT = targetDir;

  const inCurrent = projectName === ".";
  const name = inCurrent ? path.relative("../", cwd) : projectName;

  return {
    name,
    context: targetDir,
    proNameByMosaic,
  };
};

// 校验输入的projectName是否合规
const getValidateProjectName = (name) => {
  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
      process.exit(1);
  }
};

module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log('create ~ err:', err)
    if (!process.env.MOSAIC_CLI_CONTEXT) {
      process.exit(1);
    }
  });
};

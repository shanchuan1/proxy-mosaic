/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-10 10:34:32
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-01 19:03:14
 */
const path = require("path");
const validateProjectName = require("validate-npm-package-name");
const { chalk, hasYarn, hasPnpm3OrLater } = require('@proxy-mosaic/cli-shared-utils')
const writeFileTree = require("./utils/writeFileTree");
const PackageManager = require('./utils/projectPackageManager')
const {clearConsole } = require('./utils')
const packageJson = require("../package.json").version;
const template = require("../template")


process.env.MOSAIC_CLI_CONTEXT;

const create = async (options) => {
  const { name, context, proNameByMosaic } = getCurrentProInfo(options);

  const pkg = {
    name: proNameByMosaic,
    version: "0.1.0",
    private: true,
    scripts: {
      gen: "mosaic-serve generate",
      start: "mosaic-serve start",
      pull: "mosaic-serve git pull",
      checkout: "mosaic-serve git checkout",
      build: "mosaic-serve build",
      deploy: "mosaic-serve deploy -c",
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
    "mosaic.config.js": template.mosaicConfig,
    ".env":  template.env,
    ".gitignore": template.gitignore,
    "index.html": template.html,
  });
  console.log(`mosaic ${chalk.green.bold("success")} Initialized Mosaic files`);

  const packageManager = (
    (hasYarn() ? 'yarn' : null) ||
    (hasPnpm3OrLater() ? 'pnpm' : 'npm')
  )

  await clearConsole()
  const pm = new PackageManager({ context, forcePackageManager: packageManager })
  pm.install()
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

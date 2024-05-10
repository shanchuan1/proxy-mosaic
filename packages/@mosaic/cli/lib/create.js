/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-10 10:34:32
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-10 15:51:30
 */
const isOnline = require("is-online");
const downgit = require("download-git-repo");
const path = require("path");
const { spinner_start, spinner_succeed, spinner_fail } =
  require("./utils/ora").processOra();
const writeFileTree = require("./utils/writeFileTree");


process.env.MOSAIC_CLI_CONTEXT;

const create = async (options) => {
  console.log("🚀 ~ create ~ options:", options);
  const { name, context, proNameByMosaic } = getCurrentProInfo(options);

  // TODO:获取线上最新版本
  // const { latestMinor } = await getVersions()

  const pkg = {
    name: proNameByMosaic,
    version: "0.1.0",
    private: true,
    scripts: {
      'clone': 'mosaic-serve clone',
      'build': 'mosaic-serve build',
      'deploy': 'mosaic-serve deploy -c',
      'checkout': 'mosaic-serve checkout ',
    },
    devDependencies: {},
    // ...resolvePkg(context)
  };

  const deps = ["mosaic-serve"];
  deps.forEach((dep) => {
    // version = `~${latestMinor}`;
    version = `~0.0.1`;
    pkg.devDependencies[dep] = version;
  });

  await writeFileTree(proNameByMosaic, {
    [`${name}_output`]: null,
    [`${name}_pro`]: null,
    "package.json": JSON.stringify(pkg, null, 2),
    "mosaic.config.js": require('../template/mosaic.config.js')
  });
  return 
 

  // (await isOnline())) && getOriginTemplate(options);
};




const getCurrentProInfo = (options) => {
  const { projectName } = options;
  const cwd = process.cwd();
  const proNameByMosaic = `${projectName}_mosaic`;
  // const targetDir = path.resolve(cwd, projectName || ".");
  // 使用mosaic别名标志项目名
  const targetDir = path.resolve(cwd, proNameByMosaic || ".");
  process.env.MOSAIC_CLI_CONTEXT = targetDir;

  const inCurrent = projectName === ".";
  const name = inCurrent ? path.relative("../", cwd) : projectName;

  console.log("🚀 ~ create ~ name:", name);
  console.log("🚀 ~ create ~ process.env.:", process.env.MOSAIC_CLI_CONTEXT);
  return {
    name,
    context: targetDir,
    proNameByMosaic,
  };
};

const getOriginTemplate = async ({
  currentLocalPathCWD: destDir,
  projectName = "front",
}) => {
  const renamingMap = {
    front_output: `${projectName}_output`,
    front_pro: `${projectName}_pro`,
  };
  const gitHubPath = "github:shanchuan1/template-proxy-mosaic";
  spinner_start("Creating Mosaic project ...");
  await downgit(gitHubPath, destDir, { clone: false }, async (err) => {
    if (err) {
      rimraf(destDir, (error) => {
        if (error) console.error(error);
      });
      spinner_fail("Mosaic project creation failed:", err);
      process.exit(1);
    }
    // 根据重置映射表，在目标目录下进行重置操作
    await renameDirectoriesSerially(`${destDir}/mosaic_project`, renamingMap);
    appendToJs("currentMosaicProjectPath", `${destDir}/mosaic_project`, "data");
    spinner_succeed("Mosaic project created successfully");
    process.exit(1);
  });
};

module.exports = (...args) => {
  return create(...args).catch((err) => {
    spinner_fail(err);
    if (!process.env.MOSAIC_CLI_CONTEXT) {
      process.exit(1);
    }
  });
};

const downgit = require("download-git-repo");
const isOnline = require("is-online");
const { spinner_start, spinner_succeed, spinner_fail } =
  require("./ora").processOra();

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

module.exports = async(options) =>{
    (await isOnline()) && getOriginTemplate(options)
};

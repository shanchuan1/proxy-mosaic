/* 模拟相关操作 */
const repos = require("./repos");
const { execProcess } = require("./exec");
const { checkDir, getFileContent, doesFileExist, copyDirContents } = require("./processFile");
const path = require("path");

/* 模拟build操作 */
const buildExecProcess = async (repo, distPath) => {
    await execProcess("BUILD", repo);
  const content = await getFileContent(doesFileExist(`${repo.dest}/vue.config.js`));
  const outputPath = `${repo.dest}/${content.outputDir}`
  const inputPath = content.outputDir === 'dist' ? `${distPath}/${repo.name}` : `${distPath}/${content.outputDir}`

  await checkDir(distPath);
  await checkDir(inputPath);
  await copyDirContents(outputPath, inputPath)
  console.log('🚀 ~ buildExecProcess ~ outputPath:', outputPath)
};

const distPath = path.resolve(__dirname, "../distPro");
buildExecProcess(repos[2], distPath);

/* 模拟 */

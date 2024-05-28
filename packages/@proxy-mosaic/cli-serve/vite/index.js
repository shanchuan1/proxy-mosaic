const {
  execa,
} = require("@proxy-mosaic/cli-shared-utils");
const ReposConfigurator = require("../lib/mosaicConfig");
const ViteConfigManager = require('./vite')
const { createServer } = require('vite');
const path = require('path');


const transformWebpackToVite = (dest) => {
  const vueConfig = require(`${dest}/vue.config.js`)
  ViteConfigManager.setProperty('base', vueConfig.publicPath)
  ViteConfigManager.setProperty('server', vueConfig.devServer)
  ViteConfigManager.setProperty('resolve.alias', vueConfig.configureWebpack.resolve.alias)
  ViteConfigManager.setProperty('css.preprocessorOptions.scss.additionalData', vueConfig.css.loaderOptions.sass.prependData.replace(/~/g, ''))
}


module.exports = processStart = async (params) => {
  const Repos = new ReposConfigurator(params.paths);
  let repos = await Repos.getRepos("start");
  console.log('🚀 ~ module.exports=processStart= ~ repos:', repos)

  const viteConfigPath = './vite.config.js'


  for (const repo of repos) {
    transformWebpackToVite(repo.dest)
    process.chdir(repo.dest);
    // return
    try {
      // 执行 vite 开发服务器命令
      // const childProcess = execa('vite', ['serve', repo.dest, '--config', viteConfigPath], {
      //   cwd: repo.dest, // 如果 vite 命令需要在特定目录下执行，指定工作目录
      //   stdio: 'inherit', // 让子进程的输出直接显示在终端上，保持与直接执行命令一致的体验
      //   shell: true, // 在Windows环境下可能需要开启这个选项来支持命令的执行
      // });
      // await childProcess;

      const config = ViteConfigManager.getConfig()
      // console.log('🚀 ~ module.exports=processStart= ~ config:', config)
      const vite = await createServer(config);
      await vite.listen();
    } catch (error) {
      console.error(`执行 vite 命令出错: ${error}`);
      process.exit(1); // 如果命令执行失败，退出进程
    }
  }

}

const {
  execa,
} = require("@proxy-mosaic/cli-shared-utils");

(async () => {
  try {
    // 执行 vite 开发服务器命令
    const childProcess = execa('vite', [], {
      cwd: './your_project_directory', // 如果 vite 命令需要在特定目录下执行，指定工作目录
      stdio: 'inherit', // 让子进程的输出直接显示在终端上，保持与直接执行命令一致的体验
      shell: true, // 在Windows环境下可能需要开启这个选项来支持命令的执行
    });

    // 等待 vite 进程结束
    await childProcess;
  } catch (error) {
    console.error(`执行 vite 命令出错: ${error}`);
    process.exit(1); // 如果命令执行失败，退出进程
  }
})();

# proxy-mosaic
- 本地CICD流水线工程 （暂时只为本地，云端不考虑）
1. 手动执行触发
2. lint规范校验
3. unit单元测试
4. build构建打包
5. 传送服务器
6. nginx配置


# 功能
- 1. 拉取所有项目到本地
- - 1.1 拉取单个项目 
- 2. 执行所有项目的打包构建 lint build
- - 2.2 执行单个项目打包构建 lint build
- 2. 将所有资源部署到指定服务器
- - 2.2 将单个项目部署到指定服务器
- - 3.服务器nginx配置


# 扩展
- 部署log日志形式
    1. 本地文件式？
    2. 可视化界面？
- 控制台样式
    1. 动画
    2. log颜色
- 模板数据校验
- 脚本命令校验
- 友好提示 (命令执行顺序先后？)
- node命令 yarn npm pnpm ？
- 查看当前仓库的现处分支情况
- 开放一套纯命令形式交互实现，不只模板
- 应用代理功能接入
- 目前只能按顺序执行，错乱顺序需友好提示
- 仓库状态信息需记录



# mosaic.config.js配置项
```js
const repos = [
  {
    url: "git@git.timevale.cn:public_health/esign-certification-h5.git",
    name: "esign-certification-h5",
  },
  {
    url: "git@git.timevale.cn:public_health/esign-hospital-localsign.git",
    name: "esign-hospital-localsign",
  },
];

const serverConfig = {
  username: 'root',
  ip: "192.168.23.191:22",
  deployDirectory: "/user/local/esign/apps/front",
}
module.exports = {
  repos,
  serverConfig
};

```
---
nav:
  title: 指南
  order: 0
toc: menu
---
# 介绍

proxy-mosaic 是一个本地化前端工程的代理服务工具,包括但不限于CICD, 本地nginx, 一键化指令操作



## 使用

安装：

```bash
npm install -g @proxy-mosaic/cli
# OR
yarn global add @proxy-mosaic/cli
```

创建一个代理工程：

```bash
mosaic create project
```

## 目录结构
```
project_mosaic
├─ .env
├─ .gitignore
├─ apps
├─ mosaic.config.js
├─ package.json
├─ packages
├─ README.md
└─ yarn.lock
```


## 脚本
```js

// 切换分支
yarn checkout 'branch' // 默认即为 yarn checkout 'branch' all  ===>  统一切换指定分支
yarn checkout 'branch' '[appName...]' // 指定切换分支的应用

// 打包
yarn build  // 默认即为 yarn build all  ===>  构建全部应用  默认模式为：build
yarn build  '[appName...]' // 指定打包的app应用  默认模式为：build


// 指定打包模式
yarn build '[appName...]' -c // 选择配置的打包模式
yarn build '[appName...]' -m  //自定义打包模式
// 如：
// yarn build h5 -m build:plugin  // 打包h5项目并自定义打包模式

// 新增配置打包模式
yarn build -a 

// 默认配置的几个打包模式
yarn build -d    // --dev dev模式
yarn build -t    // --test test模式
yarn build -s    // --sml  sml模式
yarn build -p    // --pro pro模式


// 部署
yarn deploy // 默认即为 yarn deploy all   ===>  部署全部应用
yarn deploy  '[appName...]' // 指定部署的app
yarn deploy '[appName...]' -c //选择所需部署的服务器
```



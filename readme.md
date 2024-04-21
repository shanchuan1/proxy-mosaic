# proxy-mosaic

# 安装
```js
npm install -g proxy-mosaic
// 或者
yarn add proxy-mosaic -g
```

# 使用
```js
// 创建mosaic工程
mosaic create 'projectName' 

// 克隆所需管理的前端应用
mosaic clone  // 默认即为 mosaic clone all  ===>  克隆全部应用
mosaic clone '[appName...]' // 指定clone的app应用

// 切换分支
mosaic checkout 'branch' // 默认即为 mosaic checkout 'branch' all  ===>  统一切换指定分支
mosaic checkout 'branch' '[appName...]' // 指定切换分支的应用

// 打包构建前端应用
mosaic build  // 默认即为 mosaic build all  ===>  构建全部应用
mosaic build  '[appName...]' // 指定打包的app应用


// 部署
mosaic deploy // 默认即为 mosaic build all   ===>  部署全部应用
mosaic deploy  '[appName...]' // 指定部署的app应用
```
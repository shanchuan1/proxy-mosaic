---
nav:
  title: 配置项
  order: 1
toc: menu
mobile: false
---

## mosaic.config.js

```js
const repos = [
  {
    url: 'Git repository URL',
    name: 'Project name',
  },
];

module.exports = {
  repos,
};
```

repos 为管理前端应用群的数组配置项

## .env

```js
SERVER_NAME = 'Server Username';
IP = 'Server IP Address';
DEPLOY_PATH = 'Frontend Deployment Path';
PASSWORD = 'Password';
```

服务器部署配置环境变量

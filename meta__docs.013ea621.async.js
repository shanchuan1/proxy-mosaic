"use strict";(self.webpackChunkproxy_mosaic=self.webpackChunkproxy_mosaic||[]).push([[904],{88797:function(o,a,n){n.r(a),n.d(a,{demos:function(){return d}});var e=n(62435),d={}},49878:function(o,a,n){n.r(a),n.d(a,{demos:function(){return d}});var e=n(62435),d={}},15561:function(o,a,n){n.r(a),n.d(a,{demos:function(){return d}});var e=n(62435),d={}},30419:function(o,a,n){n.r(a),n.d(a,{texts:function(){return e}});const e=[{value:`const repos = [
  {
    url: 'Git repository URL',
    name: 'Project name',
  },
];

module.exports = {
  repos,
};
`,paraId:0,tocIndex:0},{value:"repos \u4E3A\u7BA1\u7406\u524D\u7AEF\u5E94\u7528\u7FA4\u7684\u6570\u7EC4\u914D\u7F6E\u9879",paraId:1,tocIndex:0},{value:`SERVER_NAME = 'Server Username';
IP = 'Server IP Address';
DEPLOY_PATH = 'Frontend Deployment Path';
PASSWORD = 'Password';
`,paraId:2,tocIndex:1},{value:"\u670D\u52A1\u5668\u90E8\u7F72\u914D\u7F6E\u73AF\u5883\u53D8\u91CF",paraId:3,tocIndex:1}]},70332:function(o,a,n){n.r(a),n.d(a,{texts:function(){return e}});const e=[{value:"proxy-mosaic \u662F\u4E00\u4E2A\u672C\u5730\u5316\u524D\u7AEF\u5DE5\u7A0B\u7684\u4EE3\u7406\u670D\u52A1\u5DE5\u5177,\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E CICD, \u672C\u5730 nginx, \u4E00\u952E\u5316\u6307\u4EE4\u64CD\u4F5C",paraId:0,tocIndex:0},{value:"\u5B89\u88C5\uFF1A",paraId:1,tocIndex:1},{value:`npm install -g @proxy-mosaic/cli
# OR
yarn global add @proxy-mosaic/cli
`,paraId:2,tocIndex:1},{value:"\u521B\u5EFA\u4E00\u4E2A\u4EE3\u7406\u5DE5\u7A0B\uFF1A",paraId:3,tocIndex:1},{value:`mosaic create project
`,paraId:4,tocIndex:1},{value:`project_mosaic
\u251C\u2500 .env
\u251C\u2500 .gitignore
\u251C\u2500 apps
\u251C\u2500 mosaic.config.js
\u251C\u2500 package.json
\u251C\u2500 packages
\u251C\u2500 README.md
\u2514\u2500 yarn.lock

mosaic.config.js\u6587\u4EF6\u914D\u7F6E
`,paraId:5,tocIndex:2},{value:`"scripts": {
  "gen": "mosaic-serve generate",
  "pull": "mosaic-serve git pull",
  "checkout": "mosaic-serve git checkout",
  "build": "mosaic-serve build",
  "deploy": "mosaic-serve deploy -c",
  "inspect": "mosaic-serve inspect -b"
},

`,paraId:6,tocIndex:3},{value:`// \u521D\u59CB\u5316  \u524D\u7F6Emosaic.config.js\u914D\u7F6E\u5B8C\u4F60\u7684\u9879\u76EE \u6267\u884C\u521D\u59CB\u5316
yarn gen

// pull  \u66F4\u65B0\u6240\u6709\u4ED3\u5E93\u5F53\u524D\u5206\u652F\u7684\u4EE3\u7801
yarn pull

// \u5207\u6362\u5206\u652F
yarn checkout 'branch' // \u9ED8\u8BA4\u5373\u4E3A yarn checkout 'branch' all  ===>  \u7EDF\u4E00\u5207\u6362\u6307\u5B9A\u5206\u652F
yarn checkout 'branch' '[appName...]' // \u6307\u5B9A\u5207\u6362\u5206\u652F\u7684\u5E94\u7528

// \u6253\u5305
yarn build  // \u9ED8\u8BA4\u5373\u4E3A yarn build all  ===>  \u6784\u5EFA\u5168\u90E8\u5E94\u7528  \u9ED8\u8BA4\u6A21\u5F0F\u4E3A\uFF1Abuild
yarn build  '[appName...]' // \u6307\u5B9A\u6253\u5305\u7684app\u5E94\u7528  \u9ED8\u8BA4\u6A21\u5F0F\u4E3A\uFF1Abuild


// \u6307\u5B9A\u6253\u5305\u6A21\u5F0F
yarn build '[appName...]' -c // \u9009\u62E9\u914D\u7F6E\u7684\u6253\u5305\u6A21\u5F0F
yarn build '[appName...]' -m  //\u81EA\u5B9A\u4E49\u6253\u5305\u6A21\u5F0F
// \u5982\uFF1A
// yarn build h5 -m build:plugin  // \u6253\u5305h5\u9879\u76EE\u5E76\u81EA\u5B9A\u4E49\u6253\u5305\u6A21\u5F0F

// \u65B0\u589E\u914D\u7F6E\u6253\u5305\u6A21\u5F0F
yarn build -a

// \u9ED8\u8BA4\u914D\u7F6E\u7684\u51E0\u4E2A\u6253\u5305\u6A21\u5F0F
yarn build -d    // --dev dev\u6A21\u5F0F
yarn build -t    // --test test\u6A21\u5F0F
yarn build -s    // --sml  sml\u6A21\u5F0F
yarn build -p    // --pro pro\u6A21\u5F0F


// \u90E8\u7F72
yarn deploy // \u9ED8\u8BA4\u5373\u4E3A yarn deploy all   ===>  \u90E8\u7F72\u5168\u90E8\u5E94\u7528
yarn deploy  '[appName...]' // \u6307\u5B9A\u90E8\u7F72\u7684app
yarn deploy '[appName...]' -c //\u9009\u62E9\u6240\u9700\u90E8\u7F72\u7684\u670D\u52A1\u5668

`,paraId:7,tocIndex:3}]},2687:function(o,a,n){n.r(a),n.d(a,{texts:function(){return e}});const e=[]}}]);

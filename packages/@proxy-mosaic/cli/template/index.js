exports.env = `
SERVER_NAME= 'Server Username'
IP= 'Server IP Address'
DEPLOY_PATH= 'Frontend Deployment Path'
PASSWORD= 'Password'
`;

exports.gitignore = `
apps
node_modules
packages
mosaic.config.js
.env
yarn.lock
package.json
`;

exports.html = `
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <title></title>
    <link rel="shortcut icon" type="image/x-icon" href="/static/favicon.ico">
  </head>
  <body>
    <div id="app"></div>
    <div >proxy-mosaic</div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`
exports.mosaicConfig = `
const repos = [
  {
    url: "Git repository URL",
    name: "Project name",
  },
];

const viteConfig = {
  innerConfig: {
    plugins: [{ viteRedirectPlugin: { fromPrefix: "" } }],
  },
  defineConfig: {
    // vite.config.js
  },
};

module.exports = {
  repos,
  viteConfig
};
`;

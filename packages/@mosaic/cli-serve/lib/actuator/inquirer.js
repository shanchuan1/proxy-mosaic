const inquirer = require("inquirer");
const { readFromJs, appendToJs } = require("../temp/index");

const chooseBuildModePrompt = {
  type: "list",
  message: "select a build mode that you want",
  name: "buildMode",
  choices: ["dev", "test", "sml", "prod"],
  // 目前模式会覆盖此命名写法
  // choices: [
  //   "dev ===> build:dev || build_dev",
  //   "test ===> build:test || build:test",
  //   "sml ===> build:sml || build_sml",
  //   "prod ===> build:prod || build_prod",
  // ],
};

const addBuildModePrompt = {
  type: "input",
  message: "add a new build mode that you want",
  name: "newBuildMode",
};

const buildInquirer = (options) => {
  let promptList = [];
  const { buildModeList } = readFromJs("build");
  if (options.config) {
    if (buildModeList?.length) {
      chooseBuildModePrompt.choices = buildModeList;
    }
    promptList = [chooseBuildModePrompt];
  } else if (options.add) {
    promptList = [addBuildModePrompt];
  }
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(promptList)
      .then((answers) => {
        console.log("🚀 ~ .then ~ answers:", answers);
        if (options.add) {
          if (buildModeList?.length) {
            chooseBuildModePrompt.choices = buildModeList;
          }
          const newBuildMode = answers.newBuildMode;
          chooseBuildModePrompt.choices.push(newBuildMode);
          appendToJs("buildModeList", chooseBuildModePrompt.choices, "build");
        } else {
          resolve(answers);
        }
      })
      .catch(reject);
  });
};

const deployServerList = {
  type: "list",
  message: "select a server that you need to deploy",
  name: "server",
  choices: [],
};

const addServerList = [
  {
    type: "input",
    message: "enter one user name",
    name: "username",
  },
  {
    type: "input",
    message: "enter one server address",
    name: "ip",
  },
  {
    type: "input",
    message: "enter the front resource path ",
    name: "deployDirectory",
  },
  {
    type: 'password',
    name: 'password',
    message: 'enter your password for connect to the server',
  },
];

const deployInquirer = (options) => {
  let promptList = [];
  const server = readFromJs("server");
  if (options.config) {
    deployServerList.choices = Object.keys(server);
    if (Object.keys(server).length > 0) {
      promptList = [deployServerList];
    } else {
      console.log(
        "There is currently no server configuration. Please add a new server configuration."
      );
      options.add = true;
    }
  }
  if (options.add) {
    promptList = addServerList;
  }
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(promptList)
      .then((answers) => {
        if (options.add) {
          appendToJs(answers.ip, answers, "server");
          resolve(answers);
        } else {
          resolve(server[answers.server]);
        }
      })
      .catch(reject);
  });
};

const cleanAppList = {
  type: "list",
  message: "select a app that you need to delete",
  name: "app",
  choices: [],
};
const cleanInquirer = (options) => {
  const repos = readFromJs("repos");
  let promptList = [];
  if (options.config) {
    cleanAppList.choices = Object.keys(repos);
    if (Object.keys(repos).length > 0) {
      promptList = [cleanAppList];
    } else {
      console.log(
        "There is currently no app configuration. Please execute mosaic clone script."
      );
      process.exit(0);
    }
  }
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(promptList)
      .then((answers) => {
        resolve(answers.app);
      })
      .catch(reject);
  });
};

module.exports = {
  buildInquirer,
  deployInquirer,
  cleanInquirer,
};


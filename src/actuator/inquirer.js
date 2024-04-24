const inquirer = require("inquirer");

const chooseBuildModePrompt = {
  type: "list",
  message: "Choose the build mode you want",
  name: "buildMode",
//   choices: ["[build:dev,build_dev]", "build:sml/build_sml", "build:prod/build_prod"],
  choices: ["dev","test", "sml", "prod"],
};

const addBuildModePrompt = {
  type: "input",
  message: "Add the build mode you want",
  name: "newBuildMode",
};

const buildInquirer = (options) => {
  console.log("🚀 ~ options:", options);
  let promptList = [];
  if (options.config) {
    promptList = [chooseBuildModePrompt];
  } else if (options.add) {
    promptList = [addBuildModePrompt];
  }
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(promptList)
      .then((res) => {
        if (options.add) {
          const newBuildMode = res.newBuildMode;
          chooseBuildModePrompt.choices.push(newBuildMode);
        }

        resolve(res);
      })
      .catch(reject);
  });
};

module.exports = {
  buildInquirer,
};

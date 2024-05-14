/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:01:24
 * @LastEditors: 
 * @LastEditTime: 2024-05-14 16:52:11
 */
const ora = require("ora");
const chalk = require("chalk");

const processOra = () => {
  const Spinner = ora();
  const colorList = [
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "gray",
  ];
  let colorIndex = 0;
  setInterval(() => {
    Spinner.color = colorList[colorIndex];
    colorIndex++;
    if (colorIndex > 7) {
      colorIndex = 0;
    }
  }, 3000);

  return {
    spinner_start: async (text) => await Spinner.start(chalk.blue(`${text}`)),
    spinner_stop: () => Spinner.stop(),
    spinner_succeed: async (text) =>
      await Spinner.succeed(chalk.green(`${text}`)),
    spinner_fail: (text) => Spinner.fail(chalk.red(`${text}`)),
  };
};

module.exports = {
  processOra,
};

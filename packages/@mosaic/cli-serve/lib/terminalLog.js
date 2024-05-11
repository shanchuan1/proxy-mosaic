const chalk = require("chalk")
const log = console.log;

const commonLog = (front, end) => {
    return log(chalk.green(` ${front} : ${chalk.blue.underline(`${end}`)} `));
}
const greenLog = (text) => {
    return log(chalk.green(text));
}
const blueLog = (text) => {
    return log(chalk.blue(text));
}
const redLog = (text) => {
    return log(chalk.red.bold(text));
}
const magentaLog = (text) => {
    return log(chalk.magenta(text));
}

module.exports = {
    commonLog,
    greenLog,
    blueLog,
    redLog,
    magentaLog
}
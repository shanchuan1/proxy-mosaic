/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:02:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 18:31:20
 */
const { chalk } = require("@proxy-mosaic/cli-shared-utils");
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
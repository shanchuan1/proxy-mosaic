/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-15 14:38:13
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-15 14:59:44
 */
const readline = require("readline");


exports.clearConsole = (title) => {
  if (process.stdout.isTTY) {
    const blank = "\n".repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (title) {
      console.log(title);
    }
  }
};


  
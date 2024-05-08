// 定义Git操作常量
const OPERATIONS = {
    CLONE: "clone",
    PULL: "pull",
    CHECKOUT: "checkout",
};

const FRAMECONFIG = {
    vue: 'vue.config.js' || 'vite.config.js',
    gulp: 'gulpfile.js'
}

module.exports = {
    OPERATIONS,
    FRAMECONFIG
}
/*
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-11 11:08:01
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-14 18:31:44
 */
module.exports = {
    processExecBuild: require('./processBuild'),
    ...require('./processClean'),
    processExecDeploy: require('./processDeploy'),
    ...require('./processFile'),
    processRepositories: require('./processGit'),
    processExecInspect: require('./processInspect'),
}
module.exports = {
    ...require('./processBuild'),
    ...require('./processClean'),
    ...require('./processDeploy'),
    ...require('./processFile'),
    ...require('./processGit'),
}
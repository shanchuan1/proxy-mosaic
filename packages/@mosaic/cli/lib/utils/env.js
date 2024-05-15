const { execSync } = require("child_process");
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const semver = require('semver')

let _hasYarn;
let _pnpmVersion;
const _yarnProjects = new LRU({
    max: 10,
    maxAge: 1000
  })



exports.hasYarn = () => {
  if (process.env.MOSAIC_CLI_TEST) {
    return true;
  }
  if (_hasYarn != null) {
    return _hasYarn;
  }
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return (_hasYarn = true);
  } catch (e) {
    return (_hasYarn = false);
  }
};

function getPnpmVersion() {
  if (_pnpmVersion != null) {
    return _pnpmVersion;
  }
  try {
    _pnpmVersion = execSync("pnpm --version", {
      stdio: ["pipe", "pipe", "ignore"],
    }).toString();
    // there's a critical bug in pnpm 2
    // https://github.com/pnpm/pnpm/issues/1678#issuecomment-469981972
    // so we only support pnpm >= 3.0.0
    _hasPnpm = true;
  } catch (e) {}
  return _pnpmVersion || "0.0.0";
}

exports.hasPnpm3OrLater = () => {
  return this.hasPnpmVersionOrLater("3.0.0");
};

exports.hasPnpmVersionOrLater = (version) => {
  if (process.env.MOSAIC_CLI_TEST) {
    return true;
  }
  return semver.gte(getPnpmVersion(), version);
};


exports.hasPnpmVersionOrLater = (version) => {
    if (process.env.MOSAIC_CLI_TEST) {
      return true
    }
    return semver.gte(getPnpmVersion(), version)
  }


  function checkYarn (result) {
    if (result && !exports.hasYarn()) throw new Error(`The project seems to require yarn but it's not installed.`)
    return result
  }

  exports.hasProjectYarn = (cwd) => {
    if (_yarnProjects.has(cwd)) {
      return checkYarn(_yarnProjects.get(cwd))
    }
  
    const lockFile = path.join(cwd, 'yarn.lock')
    const result = fs.existsSync(lockFile)
    _yarnProjects.set(cwd, result)
    return checkYarn(result)
  }


  const _npmProjects = new LRU({
    max: 10,
    maxAge: 1000
  })
  exports.hasProjectNpm = (cwd) => {
    if (_npmProjects.has(cwd)) {
      return _npmProjects.get(cwd)
    }
  
    const lockFile = path.join(cwd, 'package-lock.json')
    const result = fs.existsSync(lockFile)
    _npmProjects.set(cwd, result)
    return result
  }
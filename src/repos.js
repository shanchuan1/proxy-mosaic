const path = require("path");
const proPath = path.resolve(__dirname, '../hospital')
console.log('🚀 ~ proPath:', proPath)


const repos = [
  {
    url: "git@git.timevale.cn:public_health/esign-certification-h5.git",
    dest: `${proPath}/esign-certification-h5`,
    name: 'esign-certification-h5'
  },
  {
    url: "git@git.timevale.cn:public_health/esign-hospital-ppm.git",
    dest: `${proPath}/esign-hospital-ppm`,
    name: 'esign-hospital-ppm'
  },
  {
    url: "git@git.timevale.cn:public_health/esign-hospital-localsign.git",
    dest: `${proPath}/esign-hospital-localsign`,
    name: 'esign-hospital-localsign'
  },
];

module.exports = repos;

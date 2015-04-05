require('es6-promise').polyfill();
var globby = require('globby');

module.exports = function (args) {
  return new Promise(function (resolve, reject) {
    globby(args, function (err, res) {
      if (err) { return reject(err); }
      resolve(res);
    });
  });
};

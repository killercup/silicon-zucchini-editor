var l = require('lodash');

module.exports = function defaultKeyAndClass(moduleName, baseOpts) {
  baseOpts = baseOpts || {};
  if (!moduleName) {
    throw new Error('No Module Name Given');
  }
  return function (itemName, opts) {
    opts = opts || {};
    var cx = [];
    if (!itemName) {
      cx = ["" + moduleName];
    } else {
      cx = ["" + moduleName + "-" + itemName];
    }
    if (opts.className) {
      cx.push(opts.className);
    }
    return l.defaults({}, {
      className: cx.join(' ')
    }, opts, {
      key: itemName
    }, baseOpts);
  };
};

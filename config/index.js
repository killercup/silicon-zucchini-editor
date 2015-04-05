var assign = require('lodash').merge;

var defaultConfig = require('./env/default.json');
var envConfig = {};

if (process.env.NODE_ENV === 'production') {
  envConfig = require('./env/production.json');
} else if (process.env.NODE_ENV === 'development') {
  envConfig = require('./env/development.json');
} else if (process.env.NODE_ENV === 'test') {
  envConfig = require('./env/test.json');
}

module.exports = assign({}, defaultConfig, envConfig);

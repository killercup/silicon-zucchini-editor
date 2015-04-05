/**
 * # Build Frontend Modules
 */

var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var _ = require('lodash');
require('es6-promise').polyfill();

var compileScripts = require('./scripts/webpack-setup');
var exec = require('./scripts/exec');
var globby = require('./scripts/globby');

/**
 * ## Configuration
 */

var PATH = {
  src: path.resolve('./src'),
  dest: path.resolve('./build'),
  entries: {
    app: './src/index.jsx',
    vendor: './src/vendor.js'
  },
  compressFiletypes: ['js', 'html', 'css', 'svg'],
  assetFiletypes: ['png', 'jpg', 'jpeg', 'svg', 'otf', 'woff', 'ttf', 'eot']
};

var ENTRIES = {
  // App entry point
  app: PATH.entries.app,
  styleguide: PATH.entries.styleguide,
  // The vendor file is just a JS file that exports an array of names of
  // external depencies, e.g, `require(PATH.entries.vendor) == ['lodash']`.
  vendor: require(PATH.entries.vendor)
};

var ALIAS = {
  'Promise': 'es6-promise',
  'plexus-form': 'plexus-form/lib/index'
};

var DEFAULT_OPTS = {
  entries: ENTRIES,
  dest: PATH.dest,
  env: {
    name: 'development',
    debug: true,
    compress: false,
    watch: true,
    dev_server: true,
    dev_server_port: process.env.NODE_PORT || 3000,
    watch_delay: 200,
    profile: true
  },
  alias: ALIAS,
  stats_settings: {
    chunks: false,
    colors: true,
    warnings: false,
    children: false
  },
  html: {
    template: path.join(PATH.src, 'index.html')
  },
  htmls: [
    {filename: 'index.html', chunks: ['vendor', 'app']},
    {filename: 'styleguide.html', chunks: ['vendor', 'styleguide']},
    {filename: 'template.html', chunks: ['vendor', 'app'],
      serverRenderedContent: true, prefixAssets: 'static/'}
  ]
};

/**
 * ## Gulp Tasks
 */

// ### Helper Tasks

gulp.task('clean', function (callback) {
  require('del')([PATH.dest + "/**/*"], callback);
});

gulp.task('gzip', ['compile:all'], function () {
  return gulp.src(PATH.dest + "/*.{" + PATH.compressFiletypes.join(',') + "}")
  .pipe(require('gulp-gzip')({
    gzipOptions: { level: 9 }
  }))
  .pipe(gulp.dest(PATH.dest));
});

// ### Webpack

gulp.task('webpack:build', ['clean'], function (done) {
  var opts = _.merge({}, DEFAULT_OPTS, {env: {
    debug: false, watch: false, dev_server: false
  }});

  compileScripts(opts, function (err, stats) {
    if (err) { return done(err); }
    fs.writeFile('webpack-stats.json', JSON.stringify(stats.toJson()), done);
  });
});

gulp.task('webpack:compile', ['clean'], function (done) {
  var opts = _.merge({}, DEFAULT_OPTS, {env: {
    name: 'production', debug: false, compress: true,
    watch: false, dev_server: false, bundleCSS: true
  }});

  compileScripts(opts, function (err, stats) {
    if (err) { return done(err); }
    fs.writeFile('webpack-stats.json', JSON.stringify(stats.toJson()), done);
  });
});

gulp.task('webpack:watch', function (callback) {
  var opts = _.merge({}, DEFAULT_OPTS, {
    env: {watch: true, dev_server: true, profile: false}
  });

  compileScripts(opts, callback);
});

// ### Tests

function callLinter(linterCmd) {
  return globby(['*.{js,jsx}', 'src/**/*.{js,jsx}'])
  .then(function (paths) {
    if (paths.length) {
      return exec(linterCmd, paths);
    }
    console.log("No files to lint.");
  });
}

gulp.task('eslint', callLinter.bind(null, 'eslint'));

gulp.task('mocha', ['lint', 'compile'], function () {
  return globby(['src/test.js', 'src/**/*test.{js,jsx}', 'server/*test.js'])
  .then(function (paths) {
    if (paths.length) {
      return exec('mocha', paths);
    }
    console.log("No tests found.");
  });
});

gulp.task('stats', ['compile'], function () {
  return exec('ls', ['-lah', PATH.dest]);
});

/**
 * ### 'Root Level' Tasks
 */

gulp.task('build', ['clean', 'webpack:build']);
gulp.task('watch', ['clean', 'webpack:watch']);

gulp.task('compile:all', ['clean', 'webpack:compile']);
gulp.task('compile', ['compile:all', 'gzip']);

gulp.task('lint', ['eslint']);
gulp.task('test', ['lint', 'mocha', 'stats']);

gulp.task('default', ['build']);

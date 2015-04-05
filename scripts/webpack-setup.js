var l = require("lodash");
var webpack = require("webpack");
var outputHtml = require('./webpack-html');

/**
 * # Webpack Setup Helpers
 */

function setupWebpack (opts) {
  var env = opts.env;

  var svgoConfig = JSON.stringify({
    plugins: [
      {removeTitle: true},
      {convertColors: {shorthex: true}},
      {convertPathData: true}
    ]
  });

  var config = {
    // Input files -> Output files
    entry: opts.entries,
    output: {
      filename: "[name]-[chunkhash].js",
      path: opts.dest
    },

    // Dev env
    debug: env.debug,
    devtool: env.debug ? 'eval-source-map' : 'source-map',
    profile: env.profile,

    // `require` config
    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: opts.alias
    },
    target: env.target || 'web',

    // Loaders
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
        {
          test: /\.jsx$/,
          loader: (env.dev_server ? 'react-hot!' : '') + "babel-loader"
        },
        { test: /\.json$/, loader: "json-loader" },
        {
          test: /\.(png|gif|eot|ttf|woff|woff2)$/,
          loader: "url-loader?limit=4000"
        },
        { test: /\.jpe?g$/, loader: "file-loader" },
        {
          test: /\.svg$/i,
          loader: 'url-loader?limit=2000' +
            (env.debug ? 'svgo-loader?' + svgoConfig : '')
        }
      ]
    },

    // Default Post-processing plugins
    plugins: [
      // Define global variables
      new webpack.DefinePlugin({
        "process.env": {
          'NODE_ENV': JSON.stringify(env.name),
          'BROWSER': JSON.stringify(true)
        }
      }),
      // 'Vendor' bundle, containing external dependencies
      new webpack.optimize.CommonsChunkPlugin(
        'vendor', 'vendor-[chunkhash].js', Infinity
      )
    ]
  };

  // Handle CSS
  if (env.bundleCSS) {
    var ExtractTextPlugin = require("extract-text-webpack-plugin");
    config.module.loaders.push({
      test: /\.(less|css)$/,
      loader: ExtractTextPlugin.extract(
        'css-loader?sourceMap!autoprefixer-loader!less-loader'
      )
    });
    config.plugins.push(new ExtractTextPlugin("app-[hash].css", {
      allChunks: true
    }));
  } else {
    config.module.loaders.push({
      test: /\.(less|css)$/,
      loader: 'style-loader!css-loader!autoprefixer-loader!less-loader'
    });
  }

  opts.htmls.forEach(function (html) {
    config.plugins.push(
      outputHtml(l.defaults({}, html, {
        template: opts.html.template,
        env: env
      }))
    );
  });

  if (env.compress) {
    // Append some minification plugins
    config.plugins = config.plugins.concat([
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(true),
      new webpack.optimize.UglifyJsPlugin({
        compress: {warnings: false},
        comments: /\@license|\@preserv/gi
      })
    ]);
  }

  if (env.dev_server) {
    // Run development server, enable hot module replacement
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.entry.hot = [
      "webpack-dev-server/client?http://localhost:" + env.dev_server_port,
      "webpack/hot/dev-server"
    ];
  }

  return webpack(config);
}

function compileScripts (opts, callback) {
  var env = opts.env;
  var compiler = setupWebpack(opts);

  if (env.watch) {
    if (env.dev_server) {
      var DevServer = require("webpack-dev-server");

      var server = new DevServer(compiler, {
        contentBase: opts.dest,
        hot: true,
        watchDelay: env.watch_delay,
        stats: opts.stats_settings
      });

      server.listen(env.dev_server_port, function () {
        console.log(
          "Dev server started on http://localhost:" + env.dev_server_port + "/"
        );
      });
    } else {
      compiler.watch(env.watch_delay, callback);
    }
  } else {
    compiler.run(callback);
  }
}

module.exports = compileScripts;

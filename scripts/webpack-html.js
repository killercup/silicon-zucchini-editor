var l = require('lodash');

function includeAssetsByChunkname (opts, assetsByChunkName, chunk, filetype) {
  var assets, filetypeCheck, filetypeMap, prefixAssets;
  assets = assetsByChunkName[chunk];
  if (l.isString(assets)) {
    assets = [assets];
  }
  if (!l.isArray(assets) || !assets.length) {
    return "";
  }
  prefixAssets = (function () {
    if (opts.prefixAssets) {
      return function (src) {
        return "" + opts.prefixAssets + src;
      };
    }
    return function (src) {
      return src;
    };
  }());

  filetypeCheck = new RegExp("\." + filetype + "$");
  if (filetype === 'js') {
    filetypeMap = function (src) {
      return "<script src=\"" + src + "\"></script>";
    };
  } else if (filetype === 'css') {
    filetypeMap = function (src) {
      return "<link rel=\"stylesheet\" href=\"" + src + "\"/>";
    };
  } else {
    filetypeMap = function () {
      return "";
    };
  }

  return assets
  .filter(function (name) {return filetypeCheck.test(name); })
  .map(prefixAssets)
  .map(filetypeMap)
  .join('\n');
}

function outputHTML (opts) {
  var HtmlWebpackPlugin = require('html-webpack-plugin');
  var config = {
    filename: 'index.html',
    template: 'src/index.html',
    include: includeAssetsByChunkname.bind(null, opts)
  };

  return new HtmlWebpackPlugin(l.defaults({}, opts, config));
}

module.exports = outputHTML;

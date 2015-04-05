var l = require('lodash');
var request = require('superagent');

var CONFIG = require('../config').api;

var bus = require('./bus');
var Auth = require('./auth');

function makeApiRequest(opts) {
  var settings = l.defaults({}, opts, {
    baseUrl: CONFIG.baseUrl,
    withAuth: 'optional', // Options: true, false, 'optional'
    method: 'get'
  });

  return new Promise(function (resolve, reject) {
    var method = settings.method.toLowerCase();
    var r = request[method](settings.baseUrl + settings.url)
      .set('Accept', 'application/json');

    if (settings.data) { r = r.send(settings.data); }
    if (settings.query) { r = r.query(settings.query); }
    if (settings.withAuth) {
      var token = Auth.get('token');
      if (token) {
        r = r.set('Authorization', 'Bearer ' + token);
      } else if (settings.withAuth === true) {
        return reject(new Error("No auth token present."));
      }
    }

    r.end(function (err, res) {
      if (err) { reject(err); }
      else if (res.error) {
        var resErr = res.error;
        if (l.isObject(res.body)) { resErr.data = res.body; }
        reject(resErr);
      }
      else { resolve(res); }
    });
  });
}

function makeListRequest(name, _opts) {
  if (!l.isString(name)) {
    throw new Error("No api resource name given");
  }
  var opts = _opts || {};
  var pluralName = opts.pluralName || name + 's';
  var contentField = opts.fieldName || pluralName;
  var actions = l.defaults({}, opts.actions, {
    SUCCESS: pluralName.toUpperCase() + '_FETCHED',
    FAILURE: pluralName.toUpperCase() + '_FAILURE'
  });

  return function list(data) {
    data = data || {};
    var query = l.defaults({}, data.query, opts.query);

    return makeApiRequest({
      url: data.url || opts.url || '/' + pluralName,
      query: query
    })
    .then(function (res) {
      var resData = res.body[contentField];
      if (!l.isArray(resData)) {
        throw new Error(
          "API response for resource list was not an array (field " +
          contentField + ")"
        );
      }
      if (l.isFunction(opts.processResponse)) {
        opts.processResponse(res);
      }
      bus.dispatch({type: actions.SUCCESS, data: resData});
    })
    .catch(function (err) {
      bus.dispatch({type: actions.FAILURE, data: err});
    });
  };
}

function makeDetailRequest(name, _opts) {
  if (!l.isString(name)) {
    throw new Error("No api resource name given");
  }
  var opts = _opts || {};
  var pluralName = opts.pluralName || name + 's';
  var contentField = opts.fieldName || pluralName;
  var actions = {
    SUCCESS: name.toUpperCase() + '_FETCHED',
    FAILURE: name.toUpperCase() + '_FAILURE'
  };

  return function detail(data) {
    data = data || {};
    if (!data.id) {
      var noIdErr = new Error("Can't load " + name + " without ID");
      bus.dispatch({type: actions.FAILURE, data: noIdErr});
      return Promise.reject(noIdErr);
    }

    return makeApiRequest({url: '/' + pluralName + '/' + data.id})
    .then(function (res) {
      var resData = res.body[contentField];
      if (!l.isObject(resData)) {
        return Promise.reject(new Error(
          "API response for resource detail was not an object (field " +
          contentField + ")"
        ));
      }
      if (l.isFunction(opts.processResponse)) {
        opts.processResponse(res);
      }
      bus.dispatch({type: actions.SUCCESS, data: resData});
    })
    .catch(function (err) {
      bus.dispatch({type: actions.FAILURE, data: err});
    });
  };
}

module.exports = {
  config: CONFIG,
  request: makeApiRequest,
  makeListRequest: makeListRequest,
  makeDetailRequest: makeDetailRequest
};

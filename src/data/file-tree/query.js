var bus = require('../bus');
var API = require('../api');

var actions = require('./actions');

function query() {
  return API.request({
    url: '/files', method: 'get', withAuth: false
  })
  .then(function (res) {
    bus.dispatch({type: actions.SUCCESS, data: res.body.tree});
    return res;
  })
  .catch(function (err) {
    return bus.dispatch({
      type: actions.FAILURE, data: err
    });
  });
}

bus.getEvents(actions.TRIGGER).onValue(query);

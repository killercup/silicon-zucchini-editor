var l = require('lodash');

var bus = require('../bus');
var API = require('../api');

var actions = {
  TRIGGER: 'LOGIN',
  FAILURE: 'LOGIN_FAILURE',
  SUCCESS: 'LOGIN_SUCCESS'
};

function login(data) {
  data = data || {};

  if (!data.email || !data.password) {
    return bus.dispatch({
      type: actions.FAILURE,
      err: new Error("Data missing")
    });
  }

  return API.request({
    url: '/auth', method: 'post', withAuth: false,
    data: l.pick(data, 'email', 'password')
  })
  .then(function (res) {
    if (typeof res.body.token !== 'string') {
      throw new Error("No token in login response.");
    }
    bus.dispatch({type: actions.SUCCESS, data: res.body});
  })
  .catch(function (err) {
    return bus.dispatch({
      type: actions.FAILURE, data: err
    });
  });
}

// Handle stuff like this: `{type: 'LOGIN', data: {email, password}}`
bus.getEvents(actions.TRIGGER).onValue(login);

module.exports = {
  login: login
};

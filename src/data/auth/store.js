var l = require('lodash');

var bus = require('../bus');

var auth = {token: null};

if (process.env.BROWSER) {
  try {
    if (localStorage.auth) {
      auth = JSON.parse(localStorage.auth);
    }
  } catch (e) {}
}

if (process.env.NODE_ENV !== 'production') {
  try { window.auth = auth; } catch (e) {}
}

bus.getEvents('LOGIN_SUCCESS')
.onValue(function (data) {
  // Update auth/current user data
  auth.token = data.token;
  auth.id = data.id;
  auth.email = data.email;
  auth.name = data.name;

  try {
    localStorage.auth = JSON.stringify(auth);
  } catch (e) {}

  bus.dispatch({type: 'LOGGED_IN'});
});

bus.getEvents('USER_UPDATE_SUCCESS')
.onValue(function (data) {
  auth.id = data.id;
  auth.email = data.email;
  auth.name = data.name;

  try {
    localStorage.auth = JSON.stringify(auth);
  } catch (e) {}

  bus.dispatch({type: 'USER_UPDATED'});
});

module.exports = {
  exists: function () {
    return !!auth.token;
  },
  get: function (field) {
    return field ? auth[field] : l.pick(auth, 'id', 'email', 'name');
  },
  destroy: function () {
    auth.token = name;
    auth.email = name;
    auth.name = name;
    try {
      localStorage.removeItem('auth');
    } catch (e) {}
    bus.dispatch({type: 'LOGGED_OUT'});
  }
};

var React = require('react');
var {Route, DefaultRoute, NotFoundRoute} = require('react-router');

module.exports = (
  <Route name="index" path="/" handler={require('./pages/_base')}>
    <DefaultRoute name="start"
      handler={require('./pages/start')} />

    <Route name="edit-file" path="/edit/*"
      handler={require('./pages/edit-file')} />

    <NotFoundRoute
      handler={require('./pages/error404')} />
  </Route>
);

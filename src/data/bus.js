var l = require('lodash');
var Kefir = require('kefir');

var eventBus = Kefir.bus();
if (process.env.NODE_ENV !== 'production') {
  eventBus.log();
}

function isType(type) {
  if (l.isArray(type)) {
    return function (e) { return type.indexOf(e.type) >= 0; };
  }
  return function (e) { return e.type === type; };
}

module.exports = {
  events: eventBus,
  plug: eventBus.plug.bind(eventBus),
  dispatch: eventBus.emit.bind(eventBus),
  isType: isType,
  getEvents: function (type) {
    return eventBus.filter(isType(type)).map(ev => ev.data);
  }
};

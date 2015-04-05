/* eslint no-underscore-dangle:0 */

var {getEvents} = require('../../data');

module.exports = {
  getInitialState() {
    return {};
  },

  componentWillMount() {
    this._fancyEvents = this._fancyEvents || {};

    Object.keys(this.events || {}).forEach((event) => {
      var stream = getEvents(event);

      this._fancyEvents[event] = {
        action: this.events[event].bind(this)
      };

      // Since each time we call `getEvents`, a new stream gets created, we need
      // to create and save an unsub handler as well. This should not cause any
      // problems, the number of event handlers in a component should be quite
      // small (<10).
      this._fancyEvents[event].unsub = () => {
        stream.offValue(this._fancyEvents[event].action);
      };

      stream.onValue(this._fancyEvents[event].action);
    });
  },

  componentWillUnmount() {
    Object.keys(this._fancyEvents || {}).forEach((event) => {
      this._fancyEvents[event].unsub();
    });
  }
};

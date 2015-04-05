var Bus = require('../bus');
var actions = require('./actions');

var data = {};

var store = {
  get() { return data; },
  set(newData) {
    data = newData;
    Bus.dispatch({
      type: 'FILE_TREE_UPDATED',
      data: data
    });
    return data;
  }
};

Bus.getEvents(actions.SUCCESS)
.onValue(store.set);

module.exports = store;

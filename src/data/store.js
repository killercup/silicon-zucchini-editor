var l = require('lodash');
var Kefir = require('kefir');
var bus = require('./bus');

function updateItem(list, item) {
  var oldItem = l.findWhere(list, {id: item.id});
  if (oldItem) {
    l.assign(oldItem, item);
  } else {
    list.push(item);
  }
}

function updateList(list, newList) {
  newList.forEach(updateItem.bind(null, list));
}

module.exports = class Store {
  constructor(name, opts) {
    if (l.isString(name)) {
      this.name = name;
    } else {
      throw new Error("No store name given");
    }

    this.opts = opts || {};

    this.pluralName = this.opts.pluralName || this.name + 's';

    this.store = [];
    this.events = Kefir.emitter();
    this.actions = l.defaults({}, this.opts.actions, {
      UPDATED: this.pluralName.toUpperCase() + '_UPDATED',
      LIST_FETCH: this.pluralName.toUpperCase() + '_FETCH',
      LIST_FETCHED: this.pluralName.toUpperCase() + '_FETCHED',
      DETAIL_FETCH: this.name.toUpperCase() + '_FETCH',
      DETAIL_FETCHED: this.name.toUpperCase() + '_FETCHED',
      CREATED: this.name.toUpperCase() + '_CREATED'
    });

    // Bind Events
    bus.plug(this.events.throttle(this.opts.throttle || 100));
    bus.getEvents(this.actions.LIST_FETCHED)
    .onValue(data => {
      updateList(this.store, data);
      this.events.emit({type: this.actions.UPDATED});
    });

    bus.getEvents([this.actions.DETAIL_FETCHED, this.actions.CREATED])
    .onValue(item => {
      updateItem(this.store, item);
      this.events.emit({type: this.actions.UPDATED});
    });
  }

  find(query) {
    return l.where(this.store, query);
  }

  findIds(ids, field) {
    field = field || 'id';
    return l.filter(this.store, function (item) {
      return l.contains(ids, item[field]);
    });
  }

  findOne(query) {
    return l.findWhere(this.store, query);
  }
};

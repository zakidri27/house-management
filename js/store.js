(function () {
  var M = (window.Manzil = window.Manzil || {});
  var KEY = 'manzil_data_v1';

  var DEFAULTS = {
    version: 1,
    settings: { currency: 'دج', name: 'منزل', theme: 'light' },
    monthly: [],   // { id, month:'YYYY-MM', amount, note, date }
    groceries: [], // { id, mode:'short'|'detail', name, amount, items:[{name,qty,price}], date, note }
    bills: [],     // { id, category, amount, date, note }
    debts: [],     // { id, side:'lana'|'alayna', person, amount, paid, date, note }
    prices: [],    // { id, name, price, unit, date, note }
    other: [],     // { id, name, amount, date, note }
    savings: [],   // مهمَل (الادخار الآن محسوب من الباقي)
    goals: []      // { id, title, target, saved, note, date }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // تحويل البيانات القديمة: الديون تستعمل paid بدل settled
  function migrate(d) {
    (d.debts || []).forEach(function (debt) {
      if (debt.paid === undefined || debt.paid === null) {
        debt.paid = debt.settled ? Number(debt.amount) || 0 : 0;
      }
      delete debt.settled;
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      var parsed = JSON.parse(raw);
      var out = clone(DEFAULTS);
      Object.keys(out).forEach(function (k) {
        if (parsed[k] !== undefined) out[k] = parsed[k];
      });
      out.settings = Object.assign({}, DEFAULTS.settings, parsed.settings || {});
      migrate(out);
      return out;
    } catch (e) {
      console.warn('manzil: failed to load, starting fresh', e);
      return clone(DEFAULTS);
    }
  }

  var data = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.error('manzil: failed to save', e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  var store = {
    KEY: KEY,
    DEFAULTS: DEFAULTS,
    get data() { return data; },
    save: save,
    uid: uid,
    reset: function () { data = clone(DEFAULTS); save(); },
    export: function () { return JSON.stringify(data, null, 2); },
    import: function (json) {
      var parsed = JSON.parse(json);
      data = Object.assign(clone(DEFAULTS), parsed);
      data.settings = Object.assign({}, DEFAULTS.settings, parsed.settings || {});
      migrate(data);
      save();
    },
    list: function (col) { return data[col] || (data[col] = []); },
    add: function (col, item) {
      item.id = item.id || uid();
      item.createdAt = item.createdAt || Date.now();
      data[col].unshift(item);
      save();
      return item;
    },
    update: function (col, id, patch) {
      var it = data[col].filter(function (x) { return x.id === id; })[0];
      if (it) { Object.assign(it, patch); save(); }
      return it;
    },
    remove: function (col, id) {
      data[col] = data[col].filter(function (x) { return x.id !== id; });
      save();
    },
    byId: function (col, id) {
      return data[col].filter(function (x) { return x.id === id; })[0];
    }
  };

  M.store = store;
})();

(function () {
  var M = (window.Manzil = window.Manzil || {});
  var S = M.store;

  var AR_MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  function num(n) { var v = Number(n); return isNaN(v) ? 0 : v; }

  var RE_ESC = /[&<>"']/g;
  var MAP_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(RE_ESC, function (c) { return MAP_ESC[c]; }); }

  function money(n) {
    var v = num(n);
    var cur = (S.data.settings && S.data.settings.currency) || '';
    return v.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + cur;
  }

  function money0(n) {
    var v = num(n);
    var cur = (S.data.settings && S.data.settings.currency) || '';
    return Math.round(v).toLocaleString('en-US') + ' ' + cur;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function monthKey(d) {
    var dt = d ? new Date(d) : new Date();
    if (isNaN(dt.getTime())) dt = new Date();
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1);
  }

  function monthLabel(key) {
    if (!key) return '';
    var p = String(key).split('-');
    var mi = num(p[1]) - 1;
    return (AR_MONTHS[mi] || p[1]) + ' ' + p[0];
  }

  function fmtDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.getDate() + ' ' + (AR_MONTHS[dt.getMonth()] || '') + ' ' + dt.getFullYear();
  }

  // month key for any entry: explicit .month or derived from .date
  function entryMonth(x) {
    if (x && x.month && String(x.month).length === 7) return x.month;
    if (x && x.date) return String(x.date).slice(0, 7);
    return '';
  }

  function sum(arr, get) {
    return (arr || []).reduce(function (a, b) { return a + num(get ? get(b) : b.amount); }, 0);
  }

  function inMonth(arr, mk) {
    return (arr || []).filter(function (x) { return entryMonth(x) === mk; });
  }

  var util = {
    num: num, esc: esc, money: money, money0: money0,
    today: today, monthKey: monthKey, monthLabel: monthLabel, fmtDate: fmtDate,
    entryMonth: entryMonth, sum: sum, inMonth: inMonth,
    AR_MONTHS: AR_MONTHS,

    // ---- analytics ----
    income: function (mk) { return sum(inMonth(S.data.monthly, mk)); },
    groceriesTotal: function (mk) { return sum(inMonth(S.data.groceries, mk)); },
    billsTotal: function (mk) { return sum(inMonth(S.data.bills, mk)); },
    otherTotal: function (mk) { return sum(inMonth(S.data.other, mk)); },
    expenses: function (mk) {
      return util.groceriesTotal(mk) + util.billsTotal(mk) + util.otherTotal(mk);
    },
    remainder: function (mk) { return util.income(mk) - util.expenses(mk); },

    // debt helpers
    debtPaid: function (d) { return num(d.paid); },
    debtOutstanding: function (d) { return Math.max(0, num(d.amount) - num(d.paid)); },
    debtsLana: function () {
      return S.data.debts.filter(function (d) { return d.side === 'lana'; })
        .reduce(function (a, d) { return a + util.debtOutstanding(d); }, 0);
    },
    debtsAlayna: function () {
      return S.data.debts.filter(function (d) { return d.side === 'alayna'; })
        .reduce(function (a, d) { return a + util.debtOutstanding(d); }, 0);
    },
    goalsSaved: function () { return sum(S.data.goals, function (g) { return g.saved; }); },
    totalIncome: function () { return sum(S.data.monthly); },
    totalSpent: function () {
      return sum(S.data.groceries) + sum(S.data.bills) + sum(S.data.other);
    },

    // المال المتوفر = المداخيل − المصاريف + ديون علينا(متبقية) − ديون لنا(متبقية) − المخصص للأهداف
    available: function () {
      return util.totalIncome() - util.totalSpent() + util.debtsAlayna() - util.debtsLana() - util.goalsSaved();
    },
    // رصيد الادخار = الباقي المتراكم (عرض فقط)
    savingsBalance: function () { return util.available(); },
    // all month keys that have any data, newest first
    allMonths: function () {
      var set = {};
      ['monthly', 'groceries', 'bills', 'other'].forEach(function (col) {
        S.data[col].forEach(function (x) {
          var mk = entryMonth(x); if (mk) set[mk] = 1;
        });
      });
      var now = monthKey();
      set[now] = 1;
      return Object.keys(set).sort().reverse();
    },
    // كل الأعوام (الحالي + أي عام فيه بيانات)، الأحدث أولاً
    years: function () {
      var set = {};
      util.allMonths().forEach(function (m) { set[String(m).slice(0, 4)] = 1; });
      set[String(new Date().getFullYear())] = 1;
      return Object.keys(set).sort().reverse();
    },
    // كل أشهر عام معيّن، الأحدث أولاً
    monthsOfYear: function (year) {
      year = String(year);
      var out = [];
      for (var i = 12; i >= 1; i--) out.push(year + '-' + pad(i));
      return out;
    },
    // كل أشهر العام الحالي + أي شهر فيه بيانات، الأحدث أولاً
    monthChoices: function () {
      var set = {};
      util.allMonths().forEach(function (m) { set[m] = 1; });
      util.monthsOfYear(new Date().getFullYear()).forEach(function (m) { set[m] = 1; });
      return Object.keys(set).sort().reverse();
    }
  };

  M.util = util;
})();

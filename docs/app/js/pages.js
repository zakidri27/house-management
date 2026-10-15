(function () {
  var M = window.Manzil;
  var S = M.store, U = M.util, I = M.icon;

  // ---------- shared helpers ----------
  function orb(name, cat) {
    return '<span class="orb ' + (cat || '') + '">' + I(name) + '</span>';
  }
  function stat(label, value, name, cat) {
    return '<div class="stat ' + (cat || '') + '">' + orb(name) +
      '<div class="stat-txt"><label>' + U.esc(label) + '</label><b>' + U.esc(value) + '</b></div></div>';
  }
  function emptyBox(name, text) {
    return '<div class="empty"><div class="orb">' + I(name) + '</div><p>' + U.esc(text) + '</p></div>';
  }
  function section(t) { return '<div class="section-title">' + U.esc(t) + '</div>'; }

  function field(f) {
    var req = f.required ? ' required' : '';
    var val = f.value != null ? U.esc(f.value) : '';
    var input = '';
    if (f.type === 'select') {
      input = '<select name="' + f.name + '"' + req + '>';
      if (f.placeholder) input += '<option value="">' + U.esc(f.placeholder) + '</option>';
      (f.options || []).forEach(function (o) {
        var ov = (o.value != null) ? o.value : o;
        var ol = (o.label != null) ? o.label : o;
        input += '<option value="' + U.esc(ov) + '"' + (String(ov) === String(f.value) ? ' selected' : '') + '>' + U.esc(ol) + '</option>';
      });
      input += '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea name="' + f.name + '"' + req + ' placeholder="' + U.esc(f.placeholder || '') + '">' + val + '</textarea>';
    } else {
      input = '<input type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + val + '"' +
        (f.step ? ' step="' + f.step + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') +
        req + ' placeholder="' + U.esc(f.placeholder || '') + '">';
    }
    return '<label class="field"><span class="field-label">' + U.esc(f.label) + '</span>' + input + '</label>';
  }
  function fields(arr) { return '<div class="fields">' + arr.map(field).join('') + '</div>'; }

  function deleteBtn(col, id) {
    return '<button class="del" data-del="' + col + '|' + id + '" aria-label="حذف">' + I('trash') + '</button>';
  }

  // يمنع أي عملية تتجاوز المال المتوفر
  function blocked(amount) {
    var avail = U.available();
    if (U.num(amount) > avail + 0.0001) {
      M.ui.toast('المبلغ غير متوفر! المتاح: ' + U.money0(avail) + ' — أضف مالاً في الشهرية أو ديناً علينا.');
      return true;
    }
    return false;
  }

  // bill categories
  var BILL_CATS = [
    { id: 'غاز', label: 'غاز', icon: 'flame' },
    { id: 'ماء', label: 'ماء', icon: 'droplet' },
    { id: 'كهرباء', label: 'كهرباء', icon: 'bolt' },
    { id: 'وقود السيارة', label: 'وقود السيارة', icon: 'fuel' },
    { id: 'الإنترنت', label: 'الإنترنت', icon: 'wifi' },
    { id: 'كراء', label: 'كراء', icon: 'home2' },
    { id: 'أخرى', label: 'أخرى', icon: 'box' }
  ];
  function billIcon(cat) {
    for (var i = 0; i < BILL_CATS.length; i++) if (BILL_CATS[i].id === cat) return BILL_CATS[i].icon;
    return 'box';
  }
  function billCatList() {
    var out = BILL_CATS.map(function (c) { return { value: c.id, label: c.label }; });
    S.data.bills.forEach(function (b) {
      if (b.category && !BILL_CATS.some(function (c) { return c.id === b.category; })) {
        out.push({ value: b.category, label: b.category });
      }
    });
    return out;
  }

  var Pages = {};

  // ============================================================ HOME
  Pages.home = {
    title: 'الرئيسية', icon: 'home', cat: 'a',
    render: function (view) {
      var mk = U.monthKey();
      var inc = U.income(mk), exp = U.expenses(mk), rem = inc - exp;
      var alayna = U.debtsAlayna(), lana = U.debtsLana();
      var sav = U.savingsBalance();
      var goalCount = S.data.goals.length;

      var quick = (M.NAV || []).reduce(function (a, g) { return a.concat(g.pages); }, [])
        .filter(function (id) { return id !== 'home' && Pages[id]; });

      var html = '';
      html += '<div class="card hero cat-a">' +
        '<div class="hero-top"><div><div class="hero-month">' + U.esc(U.monthLabel(mk)) + '</div>' +
        '<div class="hero-big">' + U.esc(U.money0(rem)) + '</div>' +
        '<div class="hero-sub">الباقي من الشهرية</div></div>' +
        '<span class="hero-chip">' + I('coins') + '</span></div>' +
        '<div class="hero-grid">' +
        '<div class="hero-cell"><label>الدخل</label><b>' + U.esc(U.money0(inc)) + '</b></div>' +
        '<div class="hero-cell"><label>المصاريف</label><b>' + U.esc(U.money0(exp)) + '</b></div>' +
        '</div></div>';

      html += '<div class="card tight cat-c"><div class="kv" style="border:none"><span>المال المتوفر لديك الآن</span><b style="font-size:1.2rem">' + U.esc(U.money0(sav)) + '</b></div></div>';

      html += '<div class="stats">' +
        stat('ديون لنا', U.money0(lana), 'arrowUp', 'cat-c') +
        stat('ديون علينا', U.money0(alayna), 'arrowDown', 'cat-b') +
        stat('الأهداف', goalCount + ' هدف', 'target', 'cat-a') +
        stat('أسعار مسجّلة', S.data.prices.length + '', 'tag', 'cat-a') +
        '</div>';

      html += section('كل الصفحات');
      html += '<div class="card tight"><div class="quick">' +
        quick.map(function (id) {
          var p = Pages[id];
          return '<button class="qb ' + p.cat + '" data-go="' + id + '">' +
            '<span class="orb">' + I(p.icon) + '</span><small>' + U.esc(p.title) + '</small></button>';
        }).join('') +
        '</div></div>';

      html += section('آخر الحركات');
      html += renderFeed();

      view.innerHTML = html;

      view.querySelectorAll('[data-go]').forEach(function (b) {
        b.addEventListener('click', function () { M.show(b.getAttribute('data-go')); });
      });
    }
  };

  function feedItems() {
    var items = [];
    S.data.monthly.forEach(function (x) {
      items.push({ icon: 'calendar', cat: 'a', title: 'شهرية ' + U.monthLabel(x.month), sub: x.note || 'دخل', amount: x.amount, date: x.month + '-01' });
    });
    S.data.groceries.forEach(function (x) {
      items.push({ icon: 'cart', cat: 'b', title: x.mode === 'detail' ? 'بقالة (تفصيل)' : (x.name || 'بقالة'), sub: U.fmtDate(x.date), amount: -x.amount, date: x.date });
    });
    S.data.bills.forEach(function (x) {
      items.push({ icon: billIcon(x.category), cat: 'b', title: x.category, sub: U.fmtDate(x.date), amount: -x.amount, date: x.date });
    });
    S.data.other.forEach(function (x) {
      items.push({ icon: 'grid', cat: 'b', title: x.name || 'أخرى', sub: U.fmtDate(x.date), amount: -x.amount, date: x.date });
    });
    S.data.debts.forEach(function (x) {
      items.push({ icon: 'users', cat: x.side === 'lana' ? 'c' : 'b', title: (x.side === 'lana' ? 'لنا · ' : 'علينا · ') + (x.person || ''), sub: U.fmtDate(x.date), amount: x.side === 'lana' ? -U.num(x.amount) : U.num(x.amount), date: x.date });
    });
    items.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    return items;
  }

  function renderFeed() {
    var items = feedItems().slice(0, 6);
    if (!items.length) return emptyBox('info', 'لا توجد حركات بعد. ابدأ بإضافة شهرية.');
    return '<div class="list">' + items.map(function (it) {
      return '<div class="row cat-' + it.cat + '">' + orb(it.icon) +
        '<div class="row-main"><b>' + U.esc(it.title) + '</b><small>' + U.esc(it.sub) + '</small></div>' +
        '<div class="row-amt ' + (it.amount >= 0 ? 'pos' : 'neg') + '">' + (it.amount >= 0 ? '+' : '-') + U.esc(U.money0(Math.abs(it.amount))) + '</div></div>';
    }).join('') + '</div>';
  }

  // ============================================================ MONTHLY
  Pages.monthly = {
    title: 'الشهرية', icon: 'calendar', cat: 'a',
    render: function (view) {
      var mk = U.monthKey();
      var cur = U.income(mk);
      var list = S.data.monthly.slice().sort(function (a, b) { return String(b.month).localeCompare(String(a.month)); });

      var html = '';
      html += '<div class="card hero cat-a"><div class="hero-top">' +
        '<div><div class="hero-month">دخل ' + U.esc(U.monthLabel(mk)) + '</div>' +
        '<div class="hero-big">' + U.esc(U.money0(cur)) + '</div>' +
        '<div class="hero-sub">مجموع دخل هذا الشهر</div></div></div></div>';

      html += '<button class="btn block cat-a" id="addMonthly">' + I('plus') + ' إضافة شهرية</button>';

      html += section('سجل الأشهر');
      if (!list.length) {
        html += emptyBox('calendar', 'لا يوجد سجل بعد.');
      } else {
        html += '<div class="list">' + list.map(function (x) {
          return '<div class="row cat-a">' + orb('calendar') +
            '<div class="row-main"><b>' + U.esc(U.monthLabel(x.month)) + '</b><small>' + U.esc(x.note || 'دخل شهري') + '</small></div>' +
            '<div class="row-amt pos">+' + U.esc(U.money0(x.amount)) + '</div>' +
            deleteBtn('monthly', x.id) + '</div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;

      view.querySelector('#addMonthly').addEventListener('click', function () {
        M.ui.sheet({
          title: 'إضافة شهرية', sub: 'أدخل دخل الشهر',
          html: fields([
            { name: 'month', label: 'الشهر', type: 'month', value: mk, required: true },
            { name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text', placeholder: 'مثال: راتب' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!v.month || !(U.num(v.amount) > 0)) { M.ui.toast('أدخل الشهر والمبلغ'); return false; }
            S.add('monthly', { month: v.month, amount: U.num(v.amount), note: v.note || '', date: v.month + '-01' });
            M.ui.toast('تمت إضافة الشهرية');
          }
        });
      });
    }
  };

  // ============================================================ REPORTS
  var reportMonth = null;

  var pickerYear = null;

  function monthCells(year) {
    return U.monthsOfYear(year).map(function (m) {
      var active = m === reportMonth ? ' active' : '';
      return '<button type="button" class="month-cell' + active + '" data-mk="' + U.esc(m) + '">' +
        '<b>' + U.esc(U.monthLabel(m).split(' ')[0]) + '</b><small>' + U.esc(year) + '</small>' +
        (active ? '<span class="month-check">' + I('check') + '</span>' : '') +
        '</button>';
    }).join('');
  }

  function openMonthPicker() {
    var years = U.years();
    if (!pickerYear || years.indexOf(pickerYear) === -1) pickerYear = String(reportMonth || U.monthKey()).slice(0, 4);
    var yearRow = years.map(function (y) {
      return '<button type="button" class="year-chip' + (y === pickerYear ? ' active' : '') + '" data-year="' + U.esc(y) + '">' + U.esc(y) + '</button>';
    }).join('');
    M.ui.sheet({
      title: 'اختر الشهر', sub: 'التقارير', submit: false, cancel: 'إغلاق',
      html: '<div class="year-row">' + yearRow + '</div><div class="month-grid" id="monthGrid">' + monthCells(pickerYear) + '</div>',
      after: function (container, close) {
        var grid = container.querySelector('#monthGrid');
        function bindMonths() {
          Array.prototype.forEach.call(grid.querySelectorAll('.month-cell'), function (b) {
            b.addEventListener('click', function () {
              reportMonth = b.getAttribute('data-mk');
              close();
              M.show('reports');
            });
          });
        }
        Array.prototype.forEach.call(container.querySelectorAll('.year-chip'), function (c) {
          c.addEventListener('click', function () {
            pickerYear = c.getAttribute('data-year');
            Array.prototype.forEach.call(container.querySelectorAll('.year-chip'), function (x) {
              x.classList.toggle('active', x.getAttribute('data-year') === pickerYear);
            });
            grid.innerHTML = monthCells(pickerYear);
            bindMonths();
          });
        });
        bindMonths();
      }
    });
  }

  Pages.reports = {
    title: 'التقارير', icon: 'chart', cat: 'a',
    render: function (view) {
      if (!reportMonth || !/^\d{4}-\d{2}$/.test(reportMonth)) reportMonth = U.monthKey();

      var cats = [
        { label: 'بقالة', value: U.groceriesTotal(reportMonth), color: '#f43f5e' },
        { label: 'فواتير', value: U.billsTotal(reportMonth), color: '#fb923c' },
        { label: 'أخرى', value: U.otherTotal(reportMonth), color: '#a855f7' }
      ];

      var html = '';
      html += '<button type="button" class="month-trigger" id="monthTrigger">' +
        orb('calendar', 'cat-a') +
        '<span class="month-trigger-txt"><small>الشهر المختار</small><b>' + U.esc(U.monthLabel(reportMonth)) + '</b></span>' +
        '<span class="month-trigger-arrow">' + I('chevron') + '</span></button>';

      html += '<div class="card"><div class="section-title" style="margin-top:0">مصاريف حسب التصنيف</div><div class="chart-holder"><canvas class="chart" id="cBar"></canvas></div>' + legend(cats) + '</div>';

      html += '<div class="card"><div class="section-title" style="margin-top:0">توزيع المصاريف</div><div class="chart-holder"><canvas class="chart" id="cPie" style="height:200px"></canvas></div>' + legend(cats) + '</div>';

      html += '<div class="card"><div class="section-title" style="margin-top:0">الدخل مقابل المصاريف</div><div class="chart-holder"><canvas class="chart" id="cLine" style="height:200px"></canvas></div>' +
        '<div class="legend"><span><i style="background:#10b981"></i>دخل</span><span><i style="background:#f43f5e"></i>مصاريف</span></div></div>';

      html += '<div class="card"><div class="kv"><span>دخل ' + U.esc(U.monthLabel(reportMonth)) + '</span><b>' + U.esc(U.money0(U.income(reportMonth))) + '</b></div>' +
        '<div class="kv"><span>مجموع المصاريف</span><b>' + U.esc(U.money0(U.expenses(reportMonth))) + '</b></div>' +
        '<div class="kv"><span>الباقي</span><b style="color:#059669">' + U.esc(U.money0(U.remainder(reportMonth))) + '</b></div></div>';

      view.innerHTML = html;

      var trig = view.querySelector('#monthTrigger');
      if (trig) trig.addEventListener('click', openMonthPicker);

      requestAnimationFrame(function () {
        var cb = view.querySelector('#cBar'); if (cb) M.charts.bar(cb, cats);
        var cp = view.querySelector('#cPie'); if (cp) M.charts.pie(cp, cats);
        var nowKey = U.monthKey();
        var trendMonths = U.monthChoices().filter(function (m) { return m <= nowKey; }).slice(0, 6).reverse();
        var cl = view.querySelector('#cLine');
        if (cl) M.charts.line(cl, {
          labels: trendMonths.map(function (m) { return U.monthLabel(m).split(' ')[0]; }),
          series: [
            { color: '#10b981', values: trendMonths.map(U.income) },
            { color: '#f43f5e', values: trendMonths.map(U.expenses) }
          ]
        });
      });
    }
  };
  function legend(cats) {
    return '<div class="legend">' + cats.map(function (c) {
      return '<span><i style="background:' + c.color + '"></i>' + U.esc(c.label) + '</span>';
    }).join('') + '</div>';
  }

  // ============================================================ PRICES
  Pages.prices = {
    title: 'الأسعار', icon: 'tag', cat: 'a',
    render: function (view) {
      var list = S.data.prices.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var html = '';
      html += '<div class="card tight"><div class="muted" style="font-size:.82rem; line-height:1.7">' +
        'صفحة مستقلة لمعرفة أسعار المشتريات (سعر السكر، سعر اللتر من البنزين...).</div></div>';
      html += '<button class="btn block cat-a" id="addPrice">' + I('plus') + ' إضافة سعر</button>';
      html += section('قائمة الأسعار');
      if (!list.length) { html += emptyBox('tag', 'لا توجد أسعار مسجلة.'); }
      else {
        html += '<div class="list">' + list.map(function (x) {
          return '<div class="row cat-a">' + orb('tag') + '<div class="row-main"><b>' + U.esc(x.name) +
            '</b><small>' + U.esc(U.fmtDate(x.date)) + (x.note ? ' · ' + U.esc(x.note) : '') + '</small></div>' +
            '<div class="row-amt">' + U.esc(U.money0(x.price)) + (x.unit ? ' <small class="muted">/' + U.esc(x.unit) + '</small>' : '') + '</div>' +
            deleteBtn('prices', x.id) + '</div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;
      view.querySelector('#addPrice').addEventListener('click', function () {
        M.ui.sheet({
          title: 'إضافة سعر', sub: 'سعر منتج أو خدمة',
          html: fields([
            { name: 'name', label: 'المنتج', type: 'text', required: true, placeholder: 'مثال: سكر' },
            { name: 'price', label: 'السعر', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'unit', label: 'الوحدة (اختياري)', type: 'text', placeholder: 'كغ / لتر / ...' },
            { name: 'date', label: 'التاريخ', type: 'date', value: U.today() },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!v.name || !(U.num(v.price) > 0)) { M.ui.toast('أدخل اسم المنتج والسعر'); return false; }
            S.add('prices', { name: v.name, price: U.num(v.price), unit: v.unit || '', date: v.date || U.today(), note: v.note || '' });
            M.ui.toast('تم حفظ السعر');
          }
        });
      });
    }
  };

  // ============================================================ GROCERIES
  Pages.groceries = {
    title: 'بقالة', icon: 'cart', cat: 'b',
    render: function (view) {
      var mk = U.monthKey();
      var list = S.data.groceries.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var html = '';
      html += '<div class="card hero cat-b"><div class="hero-top"><div><div class="hero-month">بقالة ' + U.esc(U.monthLabel(mk)) + '</div>' +
        '<div class="hero-big">' + U.esc(U.money0(U.groceriesTotal(mk))) + '</div><div class="hero-sub">مجموع هذا الشهر</div></div></div></div>';

      html += '<div class="two">' +
        '<button class="btn block cat-b" id="gShort">' + I('bolt') + ' اختصار</button>' +
        '<button class="btn block soft cat-b" id="gDetail">' + I('box') + ' تفصيل</button></div>';

      html += section('المشتريات');
      if (!list.length) html += emptyBox('cart', 'لا توجد مشتريات.');
      else {
        html += '<div class="list">' + list.map(function (x) {
          var itemsTxt = (x.mode === 'detail' && x.items && x.items.length) ?
            x.items.map(function (i) { return i.name + (i.qty ? ' ×' + i.qty : '') + (i.unit ? ' ' + i.unit : ''); }).join('، ') : (x.note || 'اختصار');
          return '<div class="row cat-b">' + orb('cart') + '<div class="row-main"><b>' + U.esc(x.name || 'بقالة') +
            ' <span class="tag">' + (x.mode === 'detail' ? 'تفصيل' : 'اختصار') + '</span></b>' +
            '<small>' + U.esc(U.fmtDate(x.date)) + ' · ' + U.esc(itemsTxt) + '</small></div>' +
            '<div class="row-amt neg">-' + U.esc(U.money0(x.amount)) + '</div>' + deleteBtn('groceries', x.id) + '</div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;

      view.querySelector('#gShort').addEventListener('click', function () {
        M.ui.sheet({
          title: 'بقالة · اختصار', sub: 'سجّل الثمن فقط',
          html: fields([
            { name: 'name', label: 'الاسم (اختياري)', type: 'text', value: 'بقالة' },
            { name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'date', label: 'التاريخ', type: 'date', value: U.today() },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!(U.num(v.amount) > 0)) { M.ui.toast('أدخل المبلغ'); return false; }
            if (blocked(v.amount)) return false;
            S.add('groceries', { mode: 'short', name: v.name || 'بقالة', amount: U.num(v.amount), items: [], date: v.date || U.today(), note: v.note || '' });
            M.ui.toast('تم الحفظ');
          }
        });
      });

      view.querySelector('#gDetail').addEventListener('click', function () { detailSheet(); });
    }
  };

  function detailSheet() {
    function rowHtml(it) {
      return '<div class="item-row">' +
        '<input class="in-name" placeholder="سكر" value="' + U.esc(it.name) + '">' +
        '<input class="in-qty" type="number" step="any" min="0" placeholder="كمية" value="' + U.esc(it.qty) + '">' +
        '<input class="in-unit" placeholder="وحدة" value="' + U.esc(it.unit) + '">' +
        '<input class="in-price" type="number" step="any" min="0" placeholder="سعر" value="' + U.esc(it.price) + '">' +
        '<button type="button" class="rm">' + I('close') + '</button></div>';
    }
    M.ui.sheet({
      title: 'بقالة · تفصيل', sub: 'اكتب كل المشتريات',
      html: '<div class="fields">' +
        field({ name: 'date', label: 'التاريخ', type: 'date', value: U.today() }) +
        '</div>' +
        '<div class="field-label" style="margin:6px 0">المواد</div>' +
        '<div id="gItems">' + rowHtml({ name: '', qty: '', unit: '', price: '' }) + '</div>' +
        '<button type="button" class="btn soft cat-b sm" id="addItem" style="margin-top:6px">' + I('plus') + ' إضافة مادة</button>' +
        '<div class="item-total"><span>المجموع</span><b id="gTotal">0</b></div>',
      submit: 'حفظ',
      after: function (container) {
        var itemsEl = container.querySelector('#gItems');
        var totalEl = container.querySelector('#gTotal');
        function recalc() {
          var t = 0;
          itemsEl.querySelectorAll('.item-row').forEach(function (r) {
            var q = U.num(r.querySelector('.in-qty').value) || 1;
            var p = U.num(r.querySelector('.in-price').value);
            t += q * p;
          });
          totalEl.textContent = U.money(t);
        }
        container.addEventListener('input', recalc);
        itemsEl.addEventListener('click', function (e) {
          var rm = e.target.closest('.rm');
          if (rm) { rm.closest('.item-row').remove(); recalc(); }
        });
        container.querySelector('#addItem').addEventListener('click', function () {
          var d = document.createElement('div');
          d.innerHTML = rowHtml({ name: '', qty: '', unit: '', price: '' });
          itemsEl.appendChild(d.firstChild);
          recalc();
        });
        recalc();
      },
      onSubmit: function (v, form) {
        var items = [];
        form.querySelectorAll('.item-row').forEach(function (r) {
          var name = r.querySelector('.in-name').value.trim();
          var unit = r.querySelector('.in-unit').value.trim();
          var qty = U.num(r.querySelector('.in-qty').value);
          var price = U.num(r.querySelector('.in-price').value);
          if (name || price) items.push({ name: name || 'مادة', qty: qty, unit: unit, price: price });
        });
        var total = items.reduce(function (a, i) { return a + (i.qty || 1) * i.price; }, 0);
        if (!items.length || !(total > 0)) { M.ui.toast('أضف مادة واحدة على الأقل بسعر'); return false; }
        if (blocked(total)) return false;
        S.add('groceries', { mode: 'detail', name: 'بقالة (تفصيل)', amount: total, items: items, date: v.date || U.today(), note: '' });
        M.ui.toast('تم حفظ التفصيل');
      }
    });
  }

  // ============================================================ BILLS
  Pages.bills = {
    title: 'فواتير', icon: 'receipt', cat: 'b',
    render: function (view) {
      var mk = U.monthKey();
      var list = S.data.bills.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var byCat = {};
      U.inMonth(S.data.bills, mk).forEach(function (b) { byCat[b.category] = (byCat[b.category] || 0) + U.num(b.amount); });

      var html = '';
      html += '<div class="card hero cat-b"><div class="hero-top"><div><div class="hero-month">فواتير ' + U.esc(U.monthLabel(mk)) + '</div>' +
        '<div class="hero-big">' + U.esc(U.money0(U.billsTotal(mk))) + '</div><div class="hero-sub">مجموع هذا الشهر</div></div></div></div>';

      html += '<div class="card tight"><div class="two">' + BILL_CATS.slice(0, 6).map(function (c) {
        return stat(c.label, U.money0(byCat[c.id] || 0), c.icon, 'cat-b');
      }).join('') + '</div></div>';

      html += '<button class="btn block cat-b" id="addBill">' + I('plus') + ' إضافة فاتورة</button>';
      html += section('كل الفواتير');
      if (!list.length) html += emptyBox('receipt', 'لا توجد فواتير.');
      else {
        html += '<div class="list">' + list.map(function (x) {
          return '<div class="row cat-b">' + orb(billIcon(x.category)) + '<div class="row-main"><b>' + U.esc(x.category) +
            '</b><small>' + U.esc(U.fmtDate(x.date)) + (x.note ? ' · ' + U.esc(x.note) : '') + '</small></div>' +
            '<div class="row-amt neg">-' + U.esc(U.money0(x.amount)) + '</div>' + deleteBtn('bills', x.id) + '</div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;

      view.querySelector('#addBill').addEventListener('click', function () {
        M.ui.sheet({
          title: 'إضافة فاتورة', sub: 'غاز، ماء، كهرباء...',
          html: fields([
            { name: 'category', label: 'التصنيف', type: 'select', required: true, value: 'غاز', options: billCatList() },
            { name: 'custom', label: 'تصنيف جديد (اختياري)', type: 'text', placeholder: 'اكتب تصنيفاً غير موجود' },
            { name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'date', label: 'التاريخ', type: 'date', value: U.today() },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!(U.num(v.amount) > 0)) { M.ui.toast('أدخل المبلغ'); return false; }
            if (blocked(v.amount)) return false;
            var cat = (v.custom && v.custom.trim()) ? v.custom.trim() : v.category;
            S.add('bills', { category: cat, amount: U.num(v.amount), date: v.date || U.today(), note: v.note || '' });
            M.ui.toast('تمت إضافة الفاتورة');
          }
        });
      });
    }
  };

  // ============================================================ DEBTS
  var debtTab = 'lana';
  Pages.debts = {
    title: 'ديون', icon: 'users', cat: 'b',
    render: function (view) {
      var lana = S.data.debts.filter(function (d) { return d.side === 'lana'; });
      var alayna = S.data.debts.filter(function (d) { return d.side === 'alayna'; });
      var isLana = debtTab === 'lana';
      var list = (isLana ? lana : alayna).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

      var html = '';
      html += '<div class="tabs cat-' + (isLana ? 'c' : 'b') + '">' +
        '<button class="tab ' + (isLana ? 'active' : '') + '" data-tab="lana">لنا (' + lana.length + ')</button>' +
        '<button class="tab ' + (!isLana ? 'active' : '') + '" data-tab="alayna">علينا (' + alayna.length + ')</button></div>';

      html += '<div class="two" style="margin-top:12px">' +
        stat('متبقٍ لنا', U.money0(U.debtsLana()), 'arrowUp', 'cat-c') +
        stat('متبقٍ علينا', U.money0(U.debtsAlayna()), 'arrowDown', 'cat-b') + '</div>';

      html += '<div class="card tight" style="margin-top:12px"><div class="kv" style="border:none"><span>المال المتوفر لديك</span><b>' + U.esc(U.money0(U.available())) + '</b></div></div>';

      html += '<button class="btn block ' + (isLana ? 'cat-c' : 'cat-b') + '" id="addDebt">' +
        I('plus') + ' ' + (isLana ? 'إقراض (دين لنا)' : 'اقتراض (دين علينا)') + '</button>';

      html += section(isLana ? 'أموال أقرضناها (ستعود)' : 'أموال علينا (ندفعها)');
      if (!list.length) html += emptyBox('users', 'لا يوجد سجل.');
      else {
        html += '<div class="list">' + list.map(function (x) {
          var out = U.debtOutstanding(x);
          var done = out <= 0.0001;
          var pct = U.num(x.amount) > 0 ? Math.min(100, (U.debtPaid(x) / U.num(x.amount)) * 100) : 0;
          return '<div class="card ' + (isLana ? 'cat-c' : 'cat-b') + '" style="margin-bottom:12px;' + (done ? 'opacity:.6;' : '') + '">' +
            '<div style="display:flex;align-items:center;gap:12px">' + orb(isLana ? 'arrowUp' : 'arrowDown') +
            '<div class="row-main" style="flex:1"><b>' + U.esc(x.person) + '</b><small>' + U.esc(U.fmtDate(x.date)) + (x.note ? ' · ' + U.esc(x.note) : '') + '</small></div>' +
            '<div class="row-amt ' + (isLana ? 'pos' : 'neg') + '">' + (isLana ? '+' : '-') + U.esc(U.money0(U.num(x.amount))) + '</div></div>' +
            '<div class="bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
            '<div class="kv" style="border:none;padding:8px 0 0"><span>دُفع ' + U.esc(U.money0(U.debtPaid(x))) + ' من ' + U.esc(U.money0(x.amount)) + '</span><b>' + (done ? 'مكتمل' : 'متبقٍ ' + U.esc(U.money0(out))) + '</b></div>' +
            '<div class="btn-row" style="margin-top:10px">' +
            '<button class="btn soft ' + (isLana ? 'cat-c' : 'cat-b') + ' sm" data-pay="' + x.id + '">' + I('check') + ' ' + (isLana ? 'استلام دفعة' : 'تسديد دفعة') + '</button>' +
            '<button class="btn soft sm" data-del="debts|' + x.id + '" style="background:rgba(225,29,72,.08);color:#e11d48">' + I('trash') + '</button>' +
            '</div></div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;

      view.querySelectorAll('[data-tab]').forEach(function (b) {
        b.addEventListener('click', function () { debtTab = b.getAttribute('data-tab'); M.show('debts'); });
      });

      view.querySelector('#addDebt').addEventListener('click', function () {
        M.ui.sheet({
          title: isLana ? 'إقراض (دين لنا)' : 'اقتراض (دين علينا)',
          sub: isLana ? 'لا يمكنك إقراض أكثر من المال المتوفر' : 'يمكنك الاقتراض كما تريد',
          html: fields([
            { name: 'person', label: 'الاسم / الجهة', type: 'text', required: true },
            { name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'date', label: 'التاريخ', type: 'date', value: U.today() },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!v.person || !(U.num(v.amount) > 0)) { M.ui.toast('أدخل الاسم والمبلغ'); return false; }
            if (isLana && blocked(v.amount)) return false;
            S.add('debts', { side: debtTab, person: v.person, amount: U.num(v.amount), paid: 0, date: v.date || U.today(), note: v.note || '' });
            M.ui.toast('تم الحفظ');
          }
        });
      });

      view.querySelectorAll('[data-pay]').forEach(function (b) {
        b.addEventListener('click', function () {
          var d = S.byId('debts', b.getAttribute('data-pay'));
          var out = U.debtOutstanding(d);
          M.ui.sheet({
            title: (d.side === 'lana' ? 'استلام من ' : 'تسديد إلى ') + d.person,
            sub: 'المتبقي: ' + U.money0(out),
            html: fields([{ name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' }]),
            submit: 'تأكيد',
            onSubmit: function (v) {
              var a = U.num(v.amount);
              if (!(a > 0)) { M.ui.toast('أدخل المبلغ'); return false; }
              if (a > out + 0.0001) { M.ui.toast('أكبر من المتبقي: ' + U.money0(out)); return false; }
              if (d.side === 'alayna' && blocked(a)) return false;
              S.update('debts', d.id, { paid: U.num(d.paid) + a });
              M.ui.toast('تم التسجيل');
            }
          });
        });
      });
    }
  };

  // ============================================================ OTHER
  Pages.other = {
    title: 'أخرى', icon: 'grid', cat: 'b',
    render: function (view) {
      var mk = U.monthKey();
      var list = S.data.other.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var html = '';
      html += '<div class="card hero cat-b"><div class="hero-top"><div><div class="hero-month">أخرى ' + U.esc(U.monthLabel(mk)) + '</div>' +
        '<div class="hero-big">' + U.esc(U.money0(U.otherTotal(mk))) + '</div><div class="hero-sub">مصاريف متفرقة هذا الشهر</div></div></div></div>';
      html += '<button class="btn block cat-b" id="addOther">' + I('plus') + ' إضافة مصروف</button>';
      html += section('المصاريف');
      if (!list.length) html += emptyBox('grid', 'لا توجد مصاريف.');
      else {
        html += '<div class="list">' + list.map(function (x) {
          return '<div class="row cat-b">' + orb('grid') + '<div class="row-main"><b>' + U.esc(x.name) +
            '</b><small>' + U.esc(U.fmtDate(x.date)) + (x.note ? ' · ' + U.esc(x.note) : '') + '</small></div>' +
            '<div class="row-amt neg">-' + U.esc(U.money0(x.amount)) + '</div>' + deleteBtn('other', x.id) + '</div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;
      view.querySelector('#addOther').addEventListener('click', function () {
        M.ui.sheet({
          title: 'مصروف آخر', sub: 'أي مصروف غير مصنّف',
          html: fields([
            { name: 'name', label: 'البيان', type: 'text', required: true },
            { name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'date', label: 'التاريخ', type: 'date', value: U.today() },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!v.name || !(U.num(v.amount) > 0)) { M.ui.toast('أدخل البيان والمبلغ'); return false; }
            if (blocked(v.amount)) return false;
            S.add('other', { name: v.name, amount: U.num(v.amount), date: v.date || U.today(), note: v.note || '' });
            M.ui.toast('تم الحفظ');
          }
        });
      });
    }
  };

  // ============================================================ SAVINGS (عرض فقط)
  Pages.savings = {
    title: 'ادخار', icon: 'piggy', cat: 'c',
    render: function (view) {
      var balance = U.available();
      var months = U.allMonths();
      var html = '';
      html += '<div class="card hero cat-c"><div class="hero-top"><div><div class="hero-month">رصيد الادخار</div>' +
        '<div class="hero-big">' + U.esc(U.money0(balance)) + '</div>' +
        '<div class="hero-sub">باقي الشهرية المتراكم · عرض فقط</div></div></div></div>';

      html += '<div class="card"><div class="section-title" style="margin-top:0">كيف تكوّن الرصيد</div>' +
        '<div class="kv"><span>مجموع المداخيل (الشهرية)</span><b style="color:#059669">+' + U.esc(U.money0(U.totalIncome())) + '</b></div>' +
        '<div class="kv"><span>مجموع المصاريف</span><b style="color:#e11d48">-' + U.esc(U.money0(U.totalSpent())) + '</b></div>' +
        '<div class="kv"><span>ديون علينا (متبقية)</span><b style="color:#059669">+' + U.esc(U.money0(U.debtsAlayna())) + '</b></div>' +
        '<div class="kv"><span>ديون لنا (متبقية)</span><b style="color:#e11d48">-' + U.esc(U.money0(U.debtsLana())) + '</b></div>' +
        '<div class="kv"><span>المخصص للأهداف</span><b style="color:#e11d48">-' + U.esc(U.money0(U.goalsSaved())) + '</b></div>' +
        '<div class="kv"><span>رصيد الادخار</span><b>' + U.esc(U.money0(balance)) + '</b></div></div>';

      html += section('باقي كل شهر');
      if (!months.length) {
        html += emptyBox('piggy', 'لا توجد بيانات بعد.');
      } else {
        html += '<div class="list">' + months.map(function (m) {
          var inc = U.income(m), exp = U.expenses(m), r = inc - exp;
          return '<div class="row cat-c">' + orb('calendar') +
            '<div class="row-main"><b>' + U.esc(U.monthLabel(m)) + '</b><small>دخل ' + U.esc(U.money0(inc)) + ' · مصاريف ' + U.esc(U.money0(exp)) + '</small></div>' +
            '<div class="row-amt ' + (r >= 0 ? 'pos' : 'neg') + '">' + (r >= 0 ? '+' : '-') + U.esc(U.money0(Math.abs(r))) + '</div></div>';
        }).join('') + '</div>';
      }

      view.innerHTML = html;
    }
  };

  // ============================================================ GOALS
  Pages.goals = {
    title: 'أهداف', icon: 'target', cat: 'c',
    render: function (view) {
      var list = S.data.goals.slice();
      var html = '';
      html += '<div class="card tight"><div class="muted" style="font-size:.82rem; line-height:1.7">' +
        'ماذا تريد أن تفعل بالباقي من الشهرية؟ حدّد أهدافاً وتابع تقدّمك.</div></div>';
      html += '<div class="card tight cat-c"><div class="kv" style="border:none"><span>رصيد الادخار المتاح للتمويل</span><b>' + U.esc(U.money0(U.available())) + '</b></div></div>';
      html += '<button class="btn block cat-c" id="addGoal">' + I('plus') + ' إضافة هدف</button>';
      html += section('أهدافي');
      if (!list.length) html += emptyBox('target', 'لا توجد أهداف بعد.');
      else {
        html += '<div class="list">' + list.map(function (g) {
          var pct = g.target > 0 ? Math.min(100, (U.num(g.saved) / g.target) * 100) : 0;
          return '<div class="card goal-card cat-c" style="margin-bottom:12px">' +
            '<h4>' + U.esc(g.title) + '</h4>' +
            '<div class="goal-meta">' + U.esc(U.money0(g.saved)) + ' من ' + U.esc(U.money0(g.target)) + '</div>' +
            '<div class="bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
            '<div class="btn-row" style="margin-top:12px">' +
            '<button class="btn soft cat-c sm" data-fund="' + g.id + '">' + I('plus') + ' تمويل</button>' +
            '<button class="btn soft sm" data-goaldel="' + g.id + '" style="background:rgba(225,29,72,.08);color:#e11d48">' + I('trash') + ' حذف</button>' +
            '</div></div>';
        }).join('') + '</div>';
      }
      view.innerHTML = html;

      view.querySelector('#addGoal').addEventListener('click', function () {
        M.ui.sheet({
          title: 'هدف جديد', sub: 'لماذا تدّخر؟',
          html: fields([
            { name: 'title', label: 'الهدف', type: 'text', required: true, placeholder: 'مثال: شراء سيارة' },
            { name: 'target', label: 'المبلغ المطلوب', type: 'number', step: 'any', required: true, placeholder: '0' },
            { name: 'note', label: 'ملاحظة (اختياري)', type: 'text' }
          ]),
          submit: 'حفظ',
          onSubmit: function (v) {
            if (!v.title || !(U.num(v.target) > 0)) { M.ui.toast('أدخل الهدف والمبلغ'); return false; }
            S.add('goals', { title: v.title, target: U.num(v.target), saved: 0, note: v.note || '', date: U.today() });
            M.ui.toast('تم إنشاء الهدف');
          }
        });
      });
      view.querySelectorAll('[data-fund]').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = S.byId('goals', b.getAttribute('data-fund'));
          M.ui.sheet({
            title: 'تمويل: ' + g.title, sub: 'المتاح من الادخار: ' + U.money0(U.available()),
            html: fields([{ name: 'amount', label: 'المبلغ', type: 'number', step: 'any', required: true, placeholder: '0' }]),
            submit: 'إضافة',
            onSubmit: function (v) {
              if (!(U.num(v.amount) > 0)) { M.ui.toast('أدخل المبلغ'); return false; }
              if (blocked(v.amount)) return false;
              S.update('goals', g.id, { saved: U.num(g.saved) + U.num(v.amount) });
              M.ui.toast('تم التمويل');
            }
          });
        });
      });
      view.querySelectorAll('[data-goaldel]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-goaldel');
          M.ui.confirm('حذف هذا الهدف؟', function () { S.remove('goals', id); M.ui.toast('تم الحذف'); M.show('goals'); });
        });
      });
    }
  };

  M.pages = Pages;
})();

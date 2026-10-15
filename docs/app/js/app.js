(function () {
  var M = window.Manzil;
  var S = M.store, U = M.util, I = M.icon;

  M.NAV = [
    { id: 'a', name: 'الشهرية', cat: 'a', pages: ['home', 'monthly', 'reports', 'prices'] },
    { id: 'b', name: 'المصاريف', cat: 'b', pages: ['groceries', 'bills', 'debts', 'other'] },
    { id: 'c', name: 'الباقي', cat: 'c', pages: ['savings', 'goals'] }
  ];

  var DOCK = [
    { id: 'menu', icon: 'menu', label: 'القائمة' },
    { id: 'home', icon: 'home', label: 'الرئيسية' },
    { id: 'add', icon: 'plus', label: '', add: true },
    { id: 'reports', icon: 'chart', label: 'التقارير' },
    { id: 'monthly', icon: 'calendar', label: 'الشهرية' }
  ];

  var current = 'home';
  var phone = document.getElementById('phone');
  var view = document.getElementById('view');
  var sheetWrap = document.getElementById('sheetWrap');
  var sheetEl = document.getElementById('sheet');
  var toastEl = document.getElementById('toast');

  // ---------- toast ----------
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  M.ui = { toast: toast };

  // ---------- theme ----------
  function currentTheme() {
    return (S.data.settings && S.data.settings.theme) === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = I(theme === 'dark' ? 'sun' : 'moon');
  }
  function toggleTheme() {
    var t = currentTheme() === 'dark' ? 'light' : 'dark';
    S.data.settings.theme = t;
    S.save();
    applyTheme(t);
    toast(t === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري');
  }

  // ---------- sheet ----------
  function openSheet() {
    sheetWrap.classList.add('open');
    sheetWrap.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() {
    sheetWrap.classList.remove('open');
    sheetWrap.setAttribute('aria-hidden', 'true');
  }
  function sheet(cfg) {
    var html = '<div class="grab"></div>' +
      '<h3>' + U.esc(cfg.title || '') + '</h3>' +
      (cfg.sub ? '<div class="sheet-sub">' + U.esc(cfg.sub) + '</div>' : '') +
      '<form id="sheetForm" novalidate>' + (cfg.html || '') +
      '<div class="btn-row" style="margin-top:18px">' +
      '<button type="button" class="btn ghostline" data-close="1">' + U.esc(cfg.cancel || 'إلغاء') + '</button>' +
      (cfg.submit === false ? '' : '<button type="submit" class="btn">' + U.esc(cfg.submit || 'حفظ') + '</button>') +
      '</div></form>';
    sheetEl.innerHTML = html;
    openSheet();
    var form = sheetEl.querySelector('#sheetForm');
    if (cfg.after) cfg.after(sheetEl, closeSheet);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {};
      new FormData(form).forEach(function (val, key) { values[key] = val; });
      var res = cfg.onSubmit ? cfg.onSubmit(values, form) : true;
      if (res !== false) { closeSheet(); M.rerender(); }
    });
    var first = form.querySelector('input,select,textarea');
    if (first) setTimeout(function () { try { first.focus(); } catch (e) { } }, 320);
  }

  function confirmSheet(msg, onYes) {
    sheetEl.innerHTML = '<div class="grab"></div><h3>تأكيد</h3>' +
      '<div class="sheet-sub">' + U.esc(msg) + '</div>' +
      '<div class="btn-row" style="margin-top:12px">' +
      '<button type="button" class="btn ghostline" data-close="1">إلغاء</button>' +
      '<button type="button" class="btn" id="cfYes" style="background:linear-gradient(135deg,#f43f5e,#e11d48)">تأكيد</button>' +
      '</div>';
    openSheet();
    sheetEl.querySelector('#cfYes').addEventListener('click', function () { closeSheet(); onYes && onYes(); });
  }

  M.ui.sheet = sheet;
  M.ui.confirm = confirmSheet;

  // close handlers
  sheetWrap.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]') || e.target.classList.contains('sheet-scrim')) closeSheet();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSheet(); closeDrawer(); } });

  // ---------- drawer ----------
  function openDrawer() { phone.classList.add('drawer-open'); }
  function closeDrawer() { phone.classList.remove('drawer-open'); }

  // ---------- router ----------
  function render() {
    var page = M.pages[current] || M.pages.home;
    document.getElementById('pageTitle').textContent = page.title;

    document.querySelectorAll('#sideNav .nav-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-page') === current);
    });
    document.querySelectorAll('#dock .dockb').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-page') === current);
    });

    view.scrollTop = 0;
    view.innerHTML = '';
    var holder = document.createElement('div');
    holder.className = 'page-in';
    view.appendChild(holder);
    page.render(holder);
  }

  var suppressHash = false;
  function show(id) {
    if (!M.pages[id]) id = 'home';
    current = id;
    render();
    var target = '#/' + id;
    try {
      if (location.hash !== target) { suppressHash = true; location.hash = target; }
    } catch (e) { /* ignore */ }
  }
  M.show = show;
  M.rerender = render;

  window.addEventListener('hashchange', function () {
    if (suppressHash) { suppressHash = false; return; }
    current = (location.hash || '').replace(/^#\/?/, '') || 'home';
    if (!M.pages[current]) current = 'home';
    render();
  });

  // ---------- build sidebar ----------
  function buildSidebar() {
    var nav = document.getElementById('sideNav');
    nav.innerHTML = (M.NAV || []).map(function (grp) {
      var items = grp.pages.filter(function (id) { return M.pages[id]; }).map(function (id) {
        var p = M.pages[id];
        return '<button class="nav-item ' + grp.cat + '" data-page="' + id + '">' +
          '<span class="orb">' + I(p.icon) + '</span><span>' + U.esc(p.title) + '</span></button>';
      }).join('');
      return '<div class="folder"><div class="folder-head ' + grp.cat + '">' +
        '<span class="dot"></span>' + U.esc(grp.name) +
        '<span class="folder-count">' + grp.pages.length + '</span></div>' + items + '</div>';
    }).join('');
    nav.querySelectorAll('[data-page]').forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-page')); closeDrawer(); });
    });
  }

  // ---------- build dock ----------
  function buildDock() {
    var dock = document.getElementById('dock');
    dock.innerHTML = DOCK.map(function (d) {
      var cls = 'dockb' + (d.add ? ' dock-add' : '');
      var pageAttr = d.add ? '' : ' data-page="' + d.id + '"';
      return '<button class="' + cls + '" data-dock="' + d.id + '"' + pageAttr + '>' +
        I(d.icon) + (d.label ? '<small>' + U.esc(d.label) + '</small>' : '') + '</button>';
    }).join('');
    dock.querySelectorAll('[data-dock]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-dock');
        if (id === 'menu') openDrawer();
        else if (id === 'add') quickAdd();
        else show(id);
      });
    });
  }

  // ---------- quick add ----------
  function quickAdd() {
    var opts = [
      { id: 'monthly', label: 'شهرية', icon: 'calendar' },
      { id: 'groceries', label: 'بقالة', icon: 'cart' },
      { id: 'bills', label: 'فاتورة', icon: 'receipt' },
      { id: 'debts', label: 'دين', icon: 'users' },
      { id: 'other', label: 'مصروف آخر', icon: 'grid' },
      { id: 'prices', label: 'سعر', icon: 'tag' },
      { id: 'savings', label: 'ادخار', icon: 'piggy' },
      { id: 'goals', label: 'هدف', icon: 'target' }
    ];
    var html = '<div class="sheet-sub">ماذا تريد أن تضيف؟</div><div class="quick" style="grid-template-columns:repeat(3,1fr)">' +
      opts.map(function (o) {
        var p = M.pages[o.id];
        return '<button type="button" class="qb ' + (p ? p.cat : 'a') + '" data-quick="' + o.id + '">' +
          '<span class="orb">' + I(o.icon) + '</span><small>' + U.esc(o.label) + '</small></button>';
      }).join('') + '</div>';
    sheet({ title: 'إضافة سريعة', sub: 'اختر نوع العملية', html: html, submit: null, onSubmit: function () { } });
    // remove submit row for chooser
    var btns = sheetEl.querySelector('.btn-row'); if (btns) btns.remove();
    sheetEl.querySelectorAll('[data-quick]').forEach(function (b) {
      b.addEventListener('click', function () { closeSheet(); show(b.getAttribute('data-quick')); });
    });
  }

  // ---------- settings ----------
  function settingsSheet() {
    var html = '<div class="fields">' +
      '<label class="field"><span class="field-label">العملة</span>' +
      '<input type="text" name="currency" value="' + U.esc(S.data.settings.currency || '') + '" placeholder="دج"></label>' +
      '<label class="field"><span class="field-label">المظهر</span>' +
      '<select name="theme">' +
      '<option value="light"' + (currentTheme() === 'light' ? ' selected' : '') + '>نهاري</option>' +
      '<option value="dark"' + (currentTheme() === 'dark' ? ' selected' : '') + '>ليلي</option>' +
      '</select></label>' +
      '</div>' +
      '<div class="btn-row" style="margin-top:14px">' +
      '<button type="button" class="btn ghostline" id="expBtn">' + I('download') + ' نسخ احتياطي</button>' +
      '<button type="button" class="btn ghostline" id="impBtn">' + I('upload') + ' استرجاع</button>' +
      '</div>' +
      '<button type="button" class="btn sm" id="resetBtn" style="width:100%;margin-top:10px;background:linear-gradient(135deg,#f43f5e,#e11d48)">' + I('trash') + ' حذف كل البيانات</button>' +
      '<input type="file" id="impFile" accept="application/json" class="hidden">';
    sheet({
      title: 'الإعدادات', sub: 'عام · نسخ احتياطي', html: html, submit: 'حفظ', onSubmit: function (v) {
        S.data.settings.currency = (v.currency || '').trim() || 'دج';
        S.data.settings.theme = v.theme === 'dark' ? 'dark' : 'light';
        applyTheme(S.data.settings.theme);
        S.save();
        toast('تم الحفظ');
      }
    });
    var themeSel = sheetEl.querySelector('select[name="theme"]');
    if (themeSel) themeSel.addEventListener('change', function () { applyTheme(themeSel.value); });
    sheetEl.querySelector('#expBtn').addEventListener('click', function () {
      var blob = new Blob([S.export()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'manzil-backup-' + U.today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      toast('تم إنشاء النسخة');
    });
    var fileInput = sheetEl.querySelector('#impFile');
    sheetEl.querySelector('#impBtn').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { S.import(reader.result); closeSheet(); toast('تم الاسترجاع'); show(current); }
        catch (e) { toast('ملف غير صالح'); }
      };
      reader.readAsText(f);
    });
    sheetEl.querySelector('#resetBtn').addEventListener('click', function () {
      confirmSheet('سيتم حذف كل البيانات نهائياً. متأكد؟', function () {
        S.reset();
        show('home');
        toast('تم حذف البيانات');
      });
    });
  }

  // ---------- delegated delete ----------
  // أثر الحذف على الخزينة: income/borrow reduces it, others increase it
  function deleteDelta(col, id) {
    var it = S.byId(col, id);
    if (!it) return 0;
    if (col === 'monthly') return -U.num(it.amount);
    if (col === 'debts') return it.side === 'alayna' ? -U.debtOutstanding(it) : U.debtOutstanding(it);
    return 0;
  }
  view.addEventListener('click', function (e) {
    var d = e.target.closest('[data-del]');
    if (!d) return;
    var parts = d.getAttribute('data-del').split('|');
    var col = parts[0], id = parts[1];
    if (U.available() + deleteDelta(col, id) < -0.0001) {
      toast('لا يمكن الحذف: ستجعل الخزينة بالسالب.');
      return;
    }
    confirmSheet('حذف هذه العملية؟', function () {
      S.remove(col, id);
      toast('تم الحذف');
      render();
    });
  });

  // ---------- background bubbles ----------
  function buildBubbles() {
    var host = document.getElementById('bgBubbles');
    var colors = [
      ['#a78bfa', '#60a5fa'], ['#f9a8d4', '#fb923c'], ['#6ee7b7', '#38bdf8'],
      ['#c4b5fd', '#f0abfc'], ['#93c5fd', '#5eead4']
    ];
    var n = 6;
    var out = '';
    for (var i = 0; i < n; i++) {
      var size = 90 + Math.random() * 150;
      var left = Math.random() * 100;
      var top = Math.random() * 100;
      var c = colors[i % colors.length];
      out += '<i style="width:' + size + 'px;height:' + size + 'px;left:' + left + '%;top:' + top + '%;' +
        'background:radial-gradient(circle at 30% 30%,' + c[0] + ',' + c[1] + ');"></i>';
    }
    host.innerHTML = out;
  }

  // ---------- wire chrome ----------
  document.getElementById('brandLogo').innerHTML = M.logo(46);
  document.getElementById('menuBtn').innerHTML = I('menu');
  document.getElementById('settingsBtn').innerHTML = I('settings');
  document.getElementById('closeSidebar').innerHTML = I('close');
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('closeSidebar').addEventListener('click', closeDrawer);
  document.getElementById('scrim').addEventListener('click', closeDrawer);
  document.getElementById('menuBtn').addEventListener('click', openDrawer);
  document.getElementById('settingsBtn').addEventListener('click', settingsSheet);
  document.getElementById('settingsBtn2').innerHTML = I('settings') + '<span>الإعدادات</span>';
  document.getElementById('settingsBtn2').addEventListener('click', settingsSheet);
  document.getElementById('backupBtn').innerHTML = I('download') + '<span>نسخة</span>';
  document.getElementById('backupBtn').addEventListener('click', settingsSheet);

  // ---------- init ----------
  applyTheme(currentTheme());
  buildBubbles();
  buildSidebar();
  buildDock();
  current = (location.hash || '').replace(/^#\/?/, '') || 'home';
  if (!M.pages[current]) current = 'home';
  render();
  if (!location.hash) location.hash = '#/home';
})();

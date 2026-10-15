(function () {
  var M = (window.Manzil = window.Manzil || {});
  var U = M.util;

  function setup(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || canvas.clientWidth || 300;
    var h = rect.height || canvas.clientHeight || 180;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / pow;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
  }

  var charts = {
    bar: function (canvas, data, opts) {
      opts = opts || {};
      var r = setup(canvas), ctx = r.ctx, w = r.w, h = r.h;
      data = (data || []).filter(function (d) { return d; });
      if (!data.length) { empty(ctx, w, h); return; }
      var pad = { t: 18, r: 10, b: 40, l: 10 };
      var cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
      var max = niceMax(Math.max.apply(null, data.map(function (d) { return U.num(d.value); })));
      var n = data.length;
      var slot = cw / n;
      var bw = Math.min(slot * 0.55, 54);
      data.forEach(function (d, i) {
        var v = U.num(d.value);
        var bh = ch * (v / max);
        var x = pad.l + i * slot + (slot - bw) / 2;
        var y = pad.t + ch - bh;
        var g = ctx.createLinearGradient(0, y, 0, y + Math.max(bh, 4));
        g.addColorStop(0, d.color || '#7c3aed');
        g.addColorStop(1, d.color2 || hexA(d.color || '#7c3aed', 0.28));
        roundRect(ctx, x, y, bw, Math.max(bh, 3), Math.min(bw / 2, 12));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.font = '600 11px "Segoe UI",Tahoma,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || '', x + bw / 2, h - 20);
        if (v > 0) {
          ctx.fillStyle = '#374151';
          ctx.font = '800 11px "Segoe UI",Tahoma,sans-serif';
          ctx.fillText(shortNum(v), x + bw / 2, y - 6);
        }
      });
      // baseline
      ctx.strokeStyle = 'rgba(120,120,170,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t + ch);
      ctx.lineTo(w - pad.r, pad.t + ch);
      ctx.stroke();
    },

    pie: function (canvas, data) {
      var r = setup(canvas), ctx = r.ctx, w = r.w, h = r.h;
      data = (data || []).filter(function (d) { return U.num(d.value) > 0; });
      var total = data.reduce(function (a, b) { return a + U.num(b.value); }, 0);
      if (!total) { empty(ctx, w, h); return; }
      var cx = w / 2, cy = h / 2, rad = Math.min(w, h) / 2 - 6;
      var start = -Math.PI / 2;
      data.forEach(function (d) {
        var ang = 2 * Math.PI * (U.num(d.value) / total);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, rad, start, start + ang);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        start += ang;
      });
      // donut hole
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.56, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#1e1b3a';
      ctx.font = '900 13px "Segoe UI",Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('المجموع', cx, cy - 2);
      ctx.fillStyle = '#6d28d9';
      ctx.font = '800 12px "Segoe UI",Tahoma,sans-serif';
      ctx.fillText(shortNum(total), cx, cy + 14);
    },

    line: function (canvas, cfg) {
      var r = setup(canvas), ctx = r.ctx, w = r.w, h = r.h;
      var labels = cfg.labels || [];
      var series = (cfg.series || []).filter(function (s) { return s && s.values; });
      if (!labels.length || !series.length) { empty(ctx, w, h); return; }
      var pad = { t: 18, r: 12, b: 34, l: 12 };
      var cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
      var all = [];
      series.forEach(function (s) { s.values.forEach(function (v) { all.push(U.num(v)); }); });
      var max = niceMax(Math.max.apply(null, all.concat([1])));
      var n = labels.length;
      var stepX = n > 1 ? cw / (n - 1) : 0;
      function X(i) { return pad.l + (n > 1 ? i * stepX : cw / 2); }
      function Y(v) { return pad.t + ch - ch * (U.num(v) / max); }
      // grid
      ctx.strokeStyle = 'rgba(120,120,170,.16)';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 3; g++) {
        var gy = pad.t + (ch / 3) * g;
        ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke();
      }
      series.forEach(function (s) {
        // area fill
        if (s.fill !== false) {
          var grd = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
          grd.addColorStop(0, hexA(s.color, 0.28));
          grd.addColorStop(1, hexA(s.color, 0));
          ctx.beginPath();
          ctx.moveTo(X(0), pad.t + ch);
          s.values.forEach(function (v, i) { ctx.lineTo(X(i), Y(v)); });
          ctx.lineTo(X(n - 1), pad.t + ch);
          ctx.closePath();
          ctx.fillStyle = grd;
          ctx.fill();
        }
        ctx.beginPath();
        s.values.forEach(function (v, i) {
          var px = X(i), py = Y(v);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
        s.values.forEach(function (v, i) {
          ctx.beginPath();
          ctx.arc(X(i), Y(v), 3.6, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2.4;
          ctx.stroke();
        });
      });
      ctx.fillStyle = '#6b7280';
      ctx.font = '600 10px "Segoe UI",Tahoma,sans-serif';
      ctx.textAlign = 'center';
      labels.forEach(function (lb, i) { ctx.fillText(lb, X(i), h - 14); });
    }
  };

  function shortNum(v) {
    v = U.num(v);
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'م';
    if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'ك';
    return String(Math.round(v));
  }

  function hexA(hex, a) {
    if (!hex) hex = '#7c3aed';
    if (hex[0] !== '#') return hex;
    var x = hex.slice(1);
    if (x.length === 3) x = x.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(x.slice(0, 2), 16), g = parseInt(x.slice(2, 4), 16), b = parseInt(x.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function empty(ctx, w, h) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '700 13px "Segoe UI",Tahoma,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('لا توجد بيانات', w / 2, h / 2);
    ctx.textBaseline = 'alphabetic';
  }

  charts.hexA = hexA;
  charts.shortNum = shortNum;
  M.charts = charts;
})();

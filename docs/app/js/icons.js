(function () {
  var M = (window.Manzil = window.Manzil || {});

  var P = {
    home: '<path d="M3 9.6 12 3l9 6.6V20a1.6 1.6 0 0 1-1.6 1.6h-4.2v-6.4H8.8v6.4H4.6A1.6 1.6 0 0 1 3 20z"/>',
    calendar: '<rect x="3.2" y="4.6" width="17.6" height="16.6" rx="3"/><path d="M16 2.8v3.6M8 2.8v3.6M3.4 9.8h17.2"/>',
    chart: '<path d="M4 20.4V13M10 20.4V4.2M16 20.4v-9.6M22 20.4H2"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2.4 12.4V2.4h10l8.2 8.2a2 2 0 0 1 0 2.8z"/><circle cx="7.2" cy="7.2" r="1.6"/>',
    cart: '<circle cx="9" cy="20.4" r="1.4"/><circle cx="18.4" cy="20.4" r="1.4"/><path d="M2.2 2.6h3.3l2.4 12.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L22 6.4H6"/>',
    receipt: '<path d="M6 2.4h12a1.6 1.6 0 0 1 1.6 1.6v17l-2.6-1.8-2.6 1.8-2.6-1.8L9.2 21l-2.8-1.8V4A1.6 1.6 0 0 1 8 2.4z"/><path d="M8.6 7.4h6.8M8.6 11h6.8M8.6 14.6h4"/>',
    users: '<path d="M16.5 21v-1.8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21"/><circle cx="9.2" cy="7.4" r="3.8"/><path d="M22 21v-1.8a4 4 0 0 0-3-3.8M15.6 3.6a4 4 0 0 1 0 7.6"/>',
    grid: '<rect x="3" y="3" width="7.2" height="7.2" rx="2.2"/><rect x="13.8" y="3" width="7.2" height="7.2" rx="2.2"/><rect x="3" y="13.8" width="7.2" height="7.2" rx="2.2"/><rect x="13.8" y="13.8" width="7.2" height="7.2" rx="2.2"/>',
    piggy: '<path d="M20.8 12.4V8.2a1.8 1.8 0 0 0-1.8-1.8H6.6A3.6 3.6 0 0 0 3 10"/><path d="M3 6.4v12.8a1.8 1.8 0 0 0 1.8 1.8H5v1.6h3.4V21h6.4v1.6H18V21h.8a1.8 1.8 0 0 0 1.8-1.8v-4.4"/><path d="M21.4 11.4a1.6 1.6 0 0 0 0 3.2h.4v-3.2z"/><circle cx="15.6" cy="11" r=".8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    wallet: '<path d="M20.4 12V7.6a1.8 1.8 0 0 0-1.8-1.8H5.4a2 2 0 0 1 0-4h13.2v3.4"/><path d="M3.6 5.6v13a2 2 0 0 0 2 2h14.8a1.8 1.8 0 0 0 1.8-1.8V12"/><path d="M17.6 12.4a1.6 1.6 0 0 0 0 3.2h4.4v-3.2z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M3.4 6.4h17.2M3.4 12h17.2M3.4 17.6h17.2"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M3.4 6.2h17.2M8.4 6.2V4.4A1.8 1.8 0 0 1 10.2 2.6h3.6a1.8 1.8 0 0 1 1.8 1.8v1.8M18.6 6.2 17.7 20a1.8 1.8 0 0 1-1.8 1.7H8.1A1.8 1.8 0 0 1 6.3 20L5.4 6.2"/>',
    check: '<path d="M20 6.4 9.2 17.2l-5.2-5.2"/>',
    settings: '<circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    arrowUp: '<path d="M12 19V5M5.6 11.4 12 5l6.4 6.4"/>',
    arrowDown: '<path d="M12 5v14M5.6 12.6 12 19l6.4-6.4"/>',
    arrowLeft: '<path d="M19 12H5M11.6 5.6 5 12l6.6 6.4"/>',
    arrowRight: '<path d="M5 12h14M12.4 5.6 19 12l-6.6 6.4"/>',
    edit: '<path d="M11 4.4H4.6A1.8 1.8 0 0 0 2.8 6.2v13.2a1.8 1.8 0 0 0 1.8 1.8h13.2a1.8 1.8 0 0 0 1.8-1.8V13"/><path d="M17.9 2.9a2 2 0 0 1 2.8 2.8L11.4 15l-3.8 1 1-3.8z"/>',
    download: '<path d="M21 15.4v3.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.6v-3.2M7.4 10.6 12 15.2l4.6-4.6M12 15.2V3"/>',
    upload: '<path d="M21 15.4v3.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.6v-3.2M7.4 8 12 3.4 16.6 8M12 3.4v12"/>',
    coins: '<circle cx="8.4" cy="8.4" r="5.4"/><path d="M18.6 15.6a5.4 5.4 0 1 1-9.6-2.8M15 17.6a5.4 5.4 0 1 0 2.4-8.6"/>',
    fuel: '<path d="M4 21.4V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16.4"/><path d="M2.6 21.4h11.8"/><path d="M13 8.4h3.4a1.8 1.8 0 0 1 1.8 1.8v6.6a1.6 1.6 0 0 0 3.2 0V9.6l-2.6-2.6"/>',
    droplet: '<path d="M12 2.6c3.4 4 6.2 7 6.2 10.4A6.2 6.2 0 1 1 5.8 13C5.8 9.6 8.6 6.6 12 2.6z"/>',
    bolt: '<path d="M13.4 2.4 4.6 13.4h6l-1.4 8.2 8.8-11h-6z"/>',
    flame: '<path d="M12 21.6a6.6 6.6 0 0 0 6.6-6.6c0-4.4-4.4-6.2-3.4-11.4-2.6 1.2-4.4 3.4-4.4 6.2 0 1.4-.8 2.2-1.8 2.2S7.2 11 7.2 10c-1.2 1.4-1.8 3.4-1.8 5.2a6.6 6.6 0 0 0 6.6 6.4z"/>',
    wifi: '<path d="M2.4 8.8a16 16 0 0 1 19.2 0M5.6 12.4a11 11 0 0 1 12.8 0M8.8 15.9a6 6 0 0 1 6.4 0"/><circle cx="12" cy="19.4" r="1.2"/>',
    home2: '<path d="M3 9.6 12 3l9 6.6V20a1.6 1.6 0 0 1-1.6 1.6h-4.2v-6.4H8.8v6.4H4.6A1.6 1.6 0 0 1 3 20z"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.4 7.4 8.6 5 8.6-5M12 22V12.4"/>',
    info: '<circle cx="12" cy="12" r="9.4"/><path d="M12 16.4v-4.8M12 7.8h.02"/>',
    moon: '<path d="M21 12.9A9 9 0 1 1 11.1 3a7 7 0 0 0 9.9 9.9z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    chevron: '<path d="m6 9.4 6 6 6-6"/>'
  };

  function icon(name, size) {
    var path = P[name] || P.grid;
    var s = size ? ' width="' + size + '" height="' + size + '"' : '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"' + s + '>' + path + '</svg>';
  }

  // app logo (self-contained, gradient + house + coin)
  var logoSeg = 0;
  function logo(size) {
    var id = 'manzilGrad' + (logoSeg++);
    var s = size ? ' width="' + size + '" height="' + size + '"' : '';
    return '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"' + s + '>' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>' +
      '<rect x="1.5" y="1.5" width="45" height="45" rx="14" fill="url(#' + id + ')"/>' +
      '<path d="M24 9.6 36.6 21a1.6 1.6 0 0 1 .5 1.15V36a2.2 2.2 0 0 1-2.2 2.2H13.1A2.2 2.2 0 0 1 10.9 36V22.15A1.6 1.6 0 0 1 11.4 21Z" fill="#ffffff"/>' +
      '<path d="M24 15.6 31.8 22.6v10.2a1.7 1.7 0 0 1-1.7 1.7H17.9a1.7 1.7 0 0 1-1.7-1.7V22.6Z" fill="url(#' + id + ')"/>' +
      '<circle cx="24" cy="29.4" r="2.2" fill="#ffffff"/>' +
      '</svg>';
  }

  M.icon = icon;
  M.logo = logo;
  M.iconNames = P;
})();

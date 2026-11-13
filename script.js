// Lost in Perfection – Landing Page
document.addEventListener('DOMContentLoaded', function () {
  // Safari often handles mailto more reliably via JS navigation than default <a> alone.
  document.querySelectorAll('a.mailto-native[href^="mailto:"]').forEach(function (a) {
    a.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        var href = a.getAttribute('href');
        if (!href) return;
        window.location.href = href;
      },
      false
    );
  });

  document.querySelectorAll('[data-copy-email]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy-email');
      if (!text) return;
      var label = btn.textContent;
      function done() {
        btn.textContent = 'Kopiert!';
        setTimeout(function () {
          btn.textContent = label;
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  // Handy: alle Termine beider Orte in EINER Liste, nach Datum sortiert, mit kleinem Ort-Etikett.
  // Desktop zeigt weiter die zwei Spalten (Umschalten per CSS, max-width 680px).
  (function chronologischeHandyListe() {
    var wrap = document.querySelector('.workshop-locations');
    if (!wrap) return;
    var eintraege = [];
    wrap.querySelectorAll('.workshop-location').forEach(function (loc, i) {
      var name = (loc.querySelector('.workshop-location-name') || {}).textContent || '';
      var addr = (loc.querySelector('.workshop-location-addr') || {}).textContent || '';
      loc.querySelectorAll('.workshop-ticket-slot').forEach(function (slot) {
        var kopie = slot.cloneNode(true);
        var info = kopie.querySelector('.workshop-ticket-slot-info');
        var ort = document.createElement('span');
        ort.className = 'workshop-ticket-slot-line workshop-ticket-slot-ortlabel workshop-ticket-slot-ortlabel--' + (i + 1);
        ort.innerHTML = '<span class="ortlabel-name"></span><span class="ortlabel-addr"></span>';
        ort.querySelector('.ortlabel-name').textContent = name.trim();
        ort.querySelector('.ortlabel-addr').textContent = addr.trim();
        if (info) info.insertBefore(ort, info.firstChild);
        eintraege.push({ start: Date.parse(slot.getAttribute('data-start')) || 0, el: kopie });
      });
    });
    eintraege.sort(function (a, b) { return a.start - b.start; });
    var liste = document.createElement('ul');
    liste.className = 'workshop-ticket-list workshop-ticket-list--chrono';
    liste.setAttribute('aria-label', 'Alle Termine nach Datum');
    eintraege.forEach(function (e) { liste.appendChild(e.el); });
    wrap.parentNode.insertBefore(liste, wrap.nextSibling);
  })();

  // Buchungsschluss: 3 Stunden vor Workshop-Beginn (data-start) wird „Jetzt buchen" durch „Buchung geschlossen" ersetzt
  var BUCHUNGSSCHLUSS_MS = 3 * 60 * 60 * 1000;
  function buchungsschlussPruefen() {
    var jetzt = Date.now();
    document.querySelectorAll('.workshop-ticket-slot[data-start]').forEach(function (slot) {
      var start = Date.parse(slot.getAttribute('data-start'));
      if (isNaN(start) || jetzt < start - BUCHUNGSSCHLUSS_MS) return;
      var btn = slot.querySelector('a.workshop-ticket-soon');
      if (!btn) return;
      var badge = document.createElement('span');
      badge.className = 'workshop-ticket-soldout-badge';
      badge.textContent = 'Buchung geschlossen';
      (slot.querySelector('.workshop-ticket-slot-action') || btn).replaceWith(badge);
    });
  }
  buchungsschlussPruefen();
  setInterval(buchungsschlussPruefen, 60 * 1000);
  document.addEventListener('visibilitychange', buchungsschlussPruefen);

  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Danke!';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    });
  }
});

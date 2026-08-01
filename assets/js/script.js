(function () {
  'use strict';

  var WA_NUMBER = '524461028254';

  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    var scrim = document.querySelector('.nav-scrim');
    if (!toggle || !nav) return;

    function close() {
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      if (scrim) scrim.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function open() {
      toggle.classList.add('is-open');
      nav.classList.add('is-open');
      if (scrim) scrim.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) close(); else open();
    });
    if (scrim) scrim.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });

    // Safety net: if a target never intersects (odd layout, fast crawler
    // render, tooling that doesn't scroll) content must not stay invisible.
    setTimeout(function () {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
    }, 2500);
  }

  function initEquipoTabs() {
    var tabBar = document.querySelector('[data-tabs]');
    if (!tabBar) return;
    var buttons = tabBar.querySelectorAll('.tab-btn');
    var cards = document.querySelectorAll('[data-equipo-card]');

    function applyFilter(cat) {
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-cat') === cat);
      });
      cards.forEach(function (c) {
        var show = cat === 'todos' || c.getAttribute('data-categoria') === cat;
        c.classList.toggle('is-hidden', !show);
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat');
        applyFilter(cat);
        history.replaceState(null, '', cat === 'todos' ? location.pathname : '#' + cat);
      });
    });

    var initial = (location.hash || '').replace('#', '') || 'todos';
    var known = Array.prototype.some.call(buttons, function (b) { return b.getAttribute('data-cat') === initial; });
    applyFilter(known ? initial : 'todos');
    if (known) {
      var target = tabBar.querySelector('[data-cat="' + initial + '"]');
      if (target) target.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var panel = form.closest('.contact-form-panel');
    var successEl = panel ? panel.querySelector('.form-success') : null;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.nombre.value.trim();
      var telefono = form.telefono.value.trim();
      var servicio = form.servicio.value;
      var mensaje = form.mensaje.value.trim();
      if (!nombre || !telefono || !mensaje) return;

      var text = 'Hola, soy ' + nombre + '.\n' +
        'Servicio de interes: ' + servicio + '\n' +
        'Telefono: ' + telefono + '\n' +
        'Mensaje: ' + mensaje;

      window.open(waLink(text), '_blank', 'noopener');

      form.classList.add('hidden');
      if (successEl) successEl.classList.remove('hidden');
    });
  }

  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      pre.classList.add('is-hidden');
    }
    if (document.readyState === 'complete') {
      setTimeout(hide, 200);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 200); });
    }
    setTimeout(hide, 4000);
  }

  function initWaLinks() {
    document.querySelectorAll('[data-wa-message]').forEach(function (el) {
      el.setAttribute('href', waLink(el.getAttribute('data-wa-message')));
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress span');
    if (!bar) return;
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function initTilt() {
    if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var els = document.querySelectorAll('.cat-card, .equipo-card, .venta-card, .mv-card');
    els.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        var rx = (-y * 8).toFixed(2);
        var ry = (x * 10).toFixed(2);
        el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  function initCounters() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initNav();
    initStickyHeader();
    initReveal();
    initEquipoTabs();
    initContactForm();
    initWaLinks();
    initScrollProgress();
    initTilt();
    initCounters();
  });
})();

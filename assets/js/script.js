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
    var ticking = false;
    function apply() {
      var y = window.scrollY;
      if (y > 60) header.classList.add('is-scrolled');
      else if (y < 20) header.classList.remove('is-scrolled');
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }
    apply();
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

  function initCursor() {
    var fine = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!fine || reduced) return;

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('has-cursor');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () {
      dot.classList.add('is-hidden');
      ring.classList.add('is-hidden');
    });
    document.addEventListener('mouseenter', function () {
      dot.classList.remove('is-hidden');
      ring.classList.remove('is-hidden');
    });

    var HOVER_SEL = 'a, button, .btn, .cat-card, .equipo-card, .venta-card, .value-card, .mv-card, .contact-card, .tab-btn';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SEL)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SEL)) ring.classList.remove('is-hover');
    });
  }

  function initHeroCanvas() {
    if (typeof THREE === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return;

    var canvases = document.querySelectorAll('.hero-canvas, .page-hero-canvas');
    canvases.forEach(function (canvas) {
      try {
        setupParticleField(canvas);
      } catch (err) {
        canvas.style.display = 'none';
      }
    });

    function setupParticleField(canvas) {
      var wrap = canvas.parentElement;
      var isMain = canvas.classList.contains('hero-canvas');
      var count = isMain ? 260 : 130;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = isMain ? 22 : 18;

      var positions = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      var material = new THREE.PointsMaterial({
        color: 0xf7941d,
        size: isMain ? 0.11 : 0.09,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
      });
      var points = new THREE.Points(geometry, material);
      scene.add(points);

      var material2 = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMain ? 0.06 : 0.05,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true
      });
      var points2 = new THREE.Points(geometry, material2);
      points2.rotation.z = 0.4;
      scene.add(points2);

      function resize() {
        var w = wrap.clientWidth || window.innerWidth;
        var h = wrap.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      resize();
      window.addEventListener('resize', resize);

      var running = true;
      document.addEventListener('visibilitychange', function () {
        running = !document.hidden;
        if (running) requestAnimationFrame(animate);
      });

      function animate() {
        if (!running) return;
        points.rotation.y += 0.0006;
        points2.rotation.y -= 0.0004;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    }
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

  var AI_NODES = {
    start: {
      text: '¡Hola! Soy el asistente virtual de SERMAQ. Puedo contarte sobre nuestros equipos, precios y zona de cobertura. ¿Qué te gustaría saber?',
      options: [
        { label: 'Equipos en renta', next: 'renta' },
        { label: 'Equipos en venta', next: 'venta' },
        { label: 'Precios y modalidades', next: 'precios' },
        { label: 'Zona de cobertura', next: 'zona' },
        { label: 'Hablar con un asesor', wa: 'Hola, quisiera hablar con un asesor de SERMAQ.' }
      ]
    },
    renta: {
      text: 'Rentamos maquinaria ligera por día, semana o mes, con entrega y recolección incluida. Estas son nuestras categorías:',
      options: [
        { label: 'Compactación', next: 'cat_compactacion' },
        { label: 'Demolición', next: 'cat_demolicion' },
        { label: 'Máquinas para concreto', next: 'cat_concreto' },
        { label: 'Generadores', next: 'cat_generadores' },
        { label: 'Soldadoras', next: 'cat_soldadoras' },
        { label: 'Elevación', next: 'cat_elevacion' },
        { label: 'Regresar al menú', next: 'start' }
      ]
    },
    cat_compactacion: {
      text: 'Compactación: placas vibratorias, rodillos y compactadoras/bailarinas, desde $550 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#compactacion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de compactación.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    cat_demolicion: {
      text: 'Demolición: martillos rompedores y demoledores de 15, 25 y 30 kg, desde $550 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#demolicion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de demolición.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    cat_concreto: {
      text: 'Máquinas para concreto: vibradores, allanadoras, revolvedora y cortadoras, desde $500 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#concreto' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar máquinas para concreto.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    cat_generadores: {
      text: 'Generadores: plantas de luz de 5,500W a 13,000W, desde $600 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#generadores' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar un generador.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    cat_soldadoras: {
      text: 'Soldadoras: equipo Bronco de 160 Amp, ideal para obra y taller, desde $770 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#soldadoras' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar una soldadora.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    cat_elevacion: {
      text: 'Elevación: plataformas de tijera, articuladas, andamios y escaleras. Se cotizan según la altura que necesites.',
      link: { label: 'Ver equipos disponibles', href: '/equipos-renta#elevacion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de elevación.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    venta: {
      text: 'Vendemos maquinaria nueva y seminueva en las mismas categorías que rentamos, con garantía, revisión técnica previa y asesoría para elegir el equipo ideal.',
      link: { label: 'Ver equipos en venta', href: '/equipos-venta' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa comprar equipo. ¿Me pueden compartir opciones disponibles?', cls: 'wa-option' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    precios: {
      text: 'Rentamos por día, semana o mes: entre más tiempo rentes, mejor precio por día te sale. El costo exacto depende del equipo, desde $500 al día. Dime qué necesitas y te ayudo a ubicar el precio, o te paso directo con un asesor.',
      options: [
        { label: 'Ver categorías de renta', next: 'renta' },
        { label: 'Cotizar por WhatsApp', wa: 'Hola, quisiera una cotización de renta.', cls: 'wa-option' },
        { label: 'Menú principal', next: 'start' }
      ]
    },
    zona: {
      text: 'Damos servicio en Querétaro y toda la zona del Bajío, con entrega y recolección incluida. Estamos ubicados en Carretera a los Cues Km 1.2, El Colorado, El Marqués, Querétaro.',
      link: { label: 'Ver ubicación en el mapa', href: 'https://maps.app.goo.gl/o31nXRbfgL2trr4u9', external: true },
      options: [
        { label: 'Preguntar por WhatsApp', wa: 'Hola, quisiera saber si dan servicio en mi zona.', cls: 'wa-option' },
        { label: 'Menú principal', next: 'start' }
      ]
    }
  };

  function initAiChat() {
    var toggle = document.querySelector('.ai-chat-toggle');
    var panel = document.querySelector('.ai-chat-panel');
    var messages = document.querySelector('.ai-chat-messages');
    var optionsWrap = document.querySelector('.ai-chat-options');
    if (!toggle || !panel || !messages || !optionsWrap) return;

    var started = false;

    function scrollDown() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(text, who) {
      var div = document.createElement('div');
      div.className = 'ai-msg ' + who;
      div.textContent = text;
      messages.appendChild(div);
      scrollDown();
    }

    function addLink(link) {
      var a = document.createElement('a');
      a.className = 'ai-msg-link';
      a.href = link.href;
      a.textContent = link.label + ' →';
      if (link.external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      messages.appendChild(a);
      scrollDown();
    }

    function renderOptions(node) {
      optionsWrap.innerHTML = '';
      node.options.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.label;
        if (opt.cls) btn.className = opt.cls;
        btn.addEventListener('click', function () {
          addMessage(opt.label, 'user');
          if (opt.wa) {
            showTyping(function () {
              addMessage('Te abrimos WhatsApp para continuar con un asesor.', 'bot');
              window.open(waLink(opt.wa), '_blank', 'noopener');
            });
            return;
          }
          goTo(opt.next);
        });
        optionsWrap.appendChild(btn);
      });
    }

    function showTyping(cb) {
      optionsWrap.innerHTML = '';
      var typing = document.createElement('div');
      typing.className = 'ai-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typing);
      scrollDown();
      setTimeout(function () {
        typing.remove();
        cb();
      }, 550);
    }

    function goTo(key) {
      var node = AI_NODES[key];
      if (!node) return;
      showTyping(function () {
        addMessage(node.text, 'bot');
        if (node.link) addLink(node.link);
        renderOptions(node);
      });
    }

    function openChat() {
      toggle.classList.add('is-open');
      panel.classList.add('is-open');
      if (!started) {
        started = true;
        goTo('start');
      }
    }
    function closeChat() {
      toggle.classList.remove('is-open');
      panel.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) closeChat(); else openChat();
    });
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
    initAiChat();
    initCursor();
    initHeroCanvas();
  });
})();

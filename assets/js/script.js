(function () {
  'use strict';

  var WA_NUMBER = '524461028254';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }

  /* ------------------------------------------------------------ nav ----- */
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
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) close();
    });
  }

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function apply() {
      var y = window.scrollY;
      if (y > 40) header.classList.add('is-scrolled');
      else if (y < 12) header.classList.remove('is-scrolled');
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

  /* -------------------------------------------- índice de maquinaria --- */
  function initHeroIndex() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = hero.querySelectorAll('.hero-slide');
    var buttons = hero.querySelectorAll('.rail-list button');
    var plate = hero.querySelector('[data-hero-plate]');
    var counter = hero.querySelector('[data-hero-index]');
    var ghost = hero.querySelector('[data-hero-ghost]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
      buttons.forEach(function (b, idx) {
        if (idx === current) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = pad(current + 1);
      if (ghost) ghost.textContent = pad(current + 1);
      var specs = slides[current].querySelector('.slide-specs');
      if (plate && specs) plate.innerHTML = specs.innerHTML;
    }

    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function startAuto() {
      if (reduced || timer) return;
      timer = setInterval(function () { go(current + 1); }, 7000);
    }

    buttons.forEach(function (b, idx) {
      b.addEventListener('click', function () { stopAuto(); go(idx); });
    });
    if (prev) prev.addEventListener('click', function () { stopAuto(); go(current - 1); });
    if (next) next.addEventListener('click', function () { stopAuto(); go(current + 1); });

    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { stopAuto(); go(current - 1); }
      else if (e.key === 'ArrowRight') { stopAuto(); go(current + 1); }
    });
    hero.addEventListener('mouseenter', stopAuto);

    // arranca la rotación solo cuando el hero está a la vista
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startAuto(); else stopAuto();
        });
      }, { threshold: 0.4 });
      io.observe(hero);
    } else {
      startAuto();
    }

    go(0);
  }

  /* ------------------------------ flotantes fuera del camino del hero -- */
  function initFloatVisibility() {
    var hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) return;
    document.body.classList.add('hero-visible');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        document.body.classList.toggle('hero-visible', entry.intersectionRatio > 0.35);
      });
    }, { threshold: [0, 0.35, 0.7] });
    io.observe(hero);
  }

  /* -------------------------------------------------------- reveals ---- */
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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });

    // red de seguridad: nada debe quedarse invisible si nunca intersecta
    setTimeout(function () {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
    }, 2500);
  }

  /* ------------------------------------------------- filtros de renta -- */
  function initEquipoTabs() {
    var tabBar = document.querySelector('[data-tabs]');
    if (!tabBar) return;
    var buttons = tabBar.querySelectorAll('.tab-btn');
    var cards = document.querySelectorAll('[data-equipo-card]');
    var count = document.querySelector('[data-equipo-count]');

    function applyFilter(cat) {
      var shown = 0;
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-cat') === cat);
      });
      cards.forEach(function (c) {
        var show = cat === 'todos' || c.getAttribute('data-categoria') === cat;
        c.classList.toggle('is-hidden', !show);
        if (show) shown++;
      });
      if (count) count.textContent = (shown < 10 ? '0' : '') + shown;
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

  /* ---------------------------------------------------------- formulario */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var panel = form.closest('.contact-form-panel');
    var successEl = panel ? panel.querySelector('.form-success') : null;
    var successText = successEl ? successEl.querySelector('[data-success-text]') : null;
    var errorEl = form.querySelector('[data-form-error]');
    var waBtn = form.querySelector('[data-send="whatsapp"]');
    var emailBtn = form.querySelector('[data-send="email"]');

    form.addEventListener('submit', function (e) { e.preventDefault(); });

    function getValues() {
      return {
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        servicio: form.servicio.value,
        mensaje: form.mensaje.value.trim(),
        empresa: form.empresa ? form.empresa.value.trim() : ''
      };
    }

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }

    function clearError() {
      if (errorEl) errorEl.classList.add('hidden');
    }

    function showSuccess(msg) {
      if (successText) successText.textContent = msg;
      form.classList.add('hidden');
      if (successEl) successEl.classList.remove('hidden');
    }

    function setBtnLabel(btn, text) {
      var label = btn.querySelector('[data-btn-label]');
      if (label) label.textContent = text;
    }

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var v = getValues();
        clearError();
        if (!v.nombre || !v.telefono || !v.mensaje) { showError('Completa nombre, teléfono y mensaje.'); return; }

        var text = 'Hola, soy ' + v.nombre + '.\n' +
          'Servicio de interes: ' + v.servicio + '\n' +
          'Telefono: ' + v.telefono + '\n' +
          'Mensaje: ' + v.mensaje;

        window.open(waLink(text), '_blank', 'noopener');
        showSuccess('Gracias por escribirnos. Te abrimos WhatsApp con tu mensaje listo para enviar — solo confírmalo y un asesor de SERMAQ te contactará en breve.');
      });
    }

    if (emailBtn) {
      emailBtn.addEventListener('click', function () {
        var v = getValues();
        clearError();
        if (!v.nombre || !v.telefono || !v.mensaje) { showError('Completa nombre, teléfono y mensaje.'); return; }

        emailBtn.disabled = true;
        setBtnLabel(emailBtn, 'Enviando…');

        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v)
        })
          .then(function (r) { return r.json().then(function (data) { return { ok: r.ok && data && data.ok }; }); })
          .then(function (res) {
            if (res.ok) {
              showSuccess('Gracias por escribirnos. Recibimos tu mensaje por correo y un asesor de SERMAQ te contactará en breve.');
            } else {
              showError('No pudimos enviar el correo. Intenta por WhatsApp o llámanos directamente.');
            }
          })
          .catch(function () {
            showError('No pudimos enviar el correo. Intenta por WhatsApp o llámanos directamente.');
          })
          .then(function () {
            emailBtn.disabled = false;
            setBtnLabel(emailBtn, 'Enviar por correo');
          });
      });
    }
  }

  /* ---------------------------------------------------------- preloader */
  var PRELOADER_KEY = 'sermaqPreloaderShown';

  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    if (pre.hasAttribute('data-skip')) { pre.remove(); return; }

    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      pre.classList.add('is-hidden');
      try { localStorage.setItem(PRELOADER_KEY, '1'); } catch (e) {}
    }
    if (document.readyState === 'complete') setTimeout(hide, 180);
    else window.addEventListener('load', function () { setTimeout(hide, 180); });
    setTimeout(hide, 3500);
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

  /* --------------------------------------------- parallax del video ---- */
  function initParallax() {
    if (reduced) return;
    var video = document.querySelector('.hero-bg video');
    var hero = document.querySelector('.hero');
    if (!hero || !video) return;
    var ticking = false;
    function apply() {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var progress = -rect.top / (rect.height || 1);
        video.style.transform = 'translateY(' + (progress * 48).toFixed(1) + 'px) scale(1.06)';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  }

  /* ------------------------------------------------------- contadores -- */
  function initCounters() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    if (reduced) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = 1300;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------ asistente ---- */
  var AI_NODES = {
    start: {
      text: '¡Hola! Soy el asistente de SERMAQ. Puedo contarte sobre equipos, precios y zona de cobertura. ¿Qué necesitas?',
      options: [
        { label: 'Equipos en renta', next: 'renta' },
        { label: 'Equipos en venta', next: 'venta' },
        { label: 'Precios', next: 'precios' },
        { label: 'Zona de cobertura', next: 'zona' },
        { label: 'Hablar con un asesor', wa: 'Hola, quisiera hablar con un asesor de SERMAQ.', cls: 'wa-option' }
      ]
    },
    renta: {
      text: 'Rentamos maquinaria ligera por día, semana o mes, con entrega y recolección incluida. Estas son las categorías:',
      options: [
        { label: 'Compactación', next: 'cat_compactacion' },
        { label: 'Demolición', next: 'cat_demolicion' },
        { label: 'Concreto', next: 'cat_concreto' },
        { label: 'Generadores', next: 'cat_generadores' },
        { label: 'Soldadoras', next: 'cat_soldadoras' },
        { label: 'Elevación', next: 'cat_elevacion' },
        { label: 'Regresar', next: 'start' }
      ]
    },
    cat_compactacion: {
      text: 'Compactación: placas vibratorias, rodillos y compactadoras/bailarinas, desde $550 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#compactacion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de compactación.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    cat_demolicion: {
      text: 'Demolición: martillos rompedores y demoledores de 15, 25 y 30 kg, desde $550 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#demolicion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de demolición.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    cat_concreto: {
      text: 'Máquinas para concreto: vibradores, allanadoras, revolvedora y cortadoras, desde $500 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#concreto' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar máquinas para concreto.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    cat_generadores: {
      text: 'Generadores: plantas de luz de 5,500 W a 13,000 W, desde $600 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#generadores' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar un generador.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    cat_soldadoras: {
      text: 'Soldadoras: equipo Bronco de 160 A, para obra y taller, desde $770 al día.',
      link: { label: 'Ver equipos y precios', href: '/equipos-renta#soldadoras' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar una soldadora.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    cat_elevacion: {
      text: 'Elevación: plataformas de tijera, articuladas, andamios y escaleras. El precio depende de la altura que necesites.',
      link: { label: 'Ver equipos disponibles', href: '/equipos-renta#elevacion' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa cotizar equipo de elevación.', cls: 'wa-option' },
        { label: 'Ver otra categoría', next: 'renta' },
        { label: 'Menú', next: 'start' }
      ]
    },
    venta: {
      text: 'Vendemos maquinaria nueva y seminueva en las mismas categorías que rentamos, con garantía y revisión técnica previa.',
      link: { label: 'Ver equipos en venta', href: '/equipos-venta' },
      options: [
        { label: 'Cotizar por WhatsApp', wa: 'Hola, me interesa comprar equipo. ¿Me pueden compartir opciones disponibles?', cls: 'wa-option' },
        { label: 'Menú', next: 'start' }
      ]
    },
    precios: {
      text: 'Rentamos por día, semana o mes: entre más tiempo, mejor precio por día. Los equipos arrancan en $500 al día. Dime qué necesitas y te ubico el precio.',
      options: [
        { label: 'Ver categorías', next: 'renta' },
        { label: 'Cotizar por WhatsApp', wa: 'Hola, quisiera una cotización de renta.', cls: 'wa-option' },
        { label: 'Menú', next: 'start' }
      ]
    },
    zona: {
      text: 'Damos servicio en Querétaro y la zona del Bajío, con entrega y recolección incluida. Estamos en Carretera a los Cues Km 1.2, El Colorado, El Marqués.',
      link: { label: 'Ver ubicación en el mapa', href: 'https://maps.app.goo.gl/o31nXRbfgL2trr4u9', external: true },
      options: [
        { label: 'Preguntar por WhatsApp', wa: 'Hola, quisiera saber si dan servicio en mi zona.', cls: 'wa-option' },
        { label: 'Menú', next: 'start' }
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

    function scrollDown() { messages.scrollTop = messages.scrollHeight; }

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
      if (link.external) { a.target = '_blank'; a.rel = 'noopener'; }
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
              addMessage('Te abrimos WhatsApp para seguir con un asesor.', 'bot');
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
      setTimeout(function () { typing.remove(); cb(); }, 480);
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
      if (!started) { started = true; goTo('start'); }
    }
    function closeChat() {
      toggle.classList.remove('is-open');
      panel.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) closeChat(); else openChat();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closeChat();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initNav();
    initStickyHeader();
    initHeroIndex();
    initFloatVisibility();
    initReveal();
    initEquipoTabs();
    initContactForm();
    initWaLinks();
    initScrollProgress();
    initParallax();
    initCounters();
    initAiChat();
  });
})();

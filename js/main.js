document.documentElement.classList.add('js');

/* ═══════════════════════════════════════
   HERO BACKGROUND — Vanta NET
   ═══════════════════════════════════════ */

(function () {
  var hero = document.getElementById('hero');
  if (!hero || !window.VANTA || !window.VANTA.NET) return;

  var vantaEffect = null;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function getThemeOptions() {
    if (isDark()) {
      return {
        color: 0x00d4ff,
        backgroundColor: 0x0a0e17
      };
    }
    return {
      color: 0x0284c7,
      backgroundColor: 0xf8fafc
    };
  }

  function initVanta() {
    var theme = getThemeOptions();
    vantaEffect = window.VANTA.NET({
      el: "#hero",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      points: 11.0,
      maxDistance: 22.0,
      spacing: 17.0,
      color: theme.color,
      backgroundColor: theme.backgroundColor
    });
  }

  function refreshVantaTheme() {
    if (!vantaEffect) return;
    var theme = getThemeOptions();
    if (typeof vantaEffect.setOptions === "function") {
      vantaEffect.setOptions(theme);
    }
  }

  try {
    initVanta();
  } catch (error) {
    vantaEffect = null;
  }

  window._heroCanvasRedraw = refreshVantaTheme;
})();

/* ═══════════════════════════════════════
   NAVBAR — Scroll & Active Link
   ═══════════════════════════════════════ */

(function () {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ═══════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════ */

(function () {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ═══════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════ */

(function () {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');

  if (stored) {
    root.setAttribute('data-theme', stored);
    icon.className = stored === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }

  toggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    icon.className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    if (window._heroCanvasRedraw) window._heroCanvasRedraw();
  });
})();

/* ═══════════════════════════════════════
   SCROLL REVEAL — Intersection Observer
   ═══════════════════════════════════════ */

(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('active'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();

/* ═══════════════════════════════════════
   PUBLICATIONS FILTER
   ═══════════════════════════════════════ */

(function () {
  var filters = document.querySelectorAll('.pub-filter');
  var cards = document.querySelectorAll('.pub-card');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var year = btn.getAttribute('data-year');
      cards.forEach(function (card) {
        if (year === 'all' || card.getAttribute('data-year') === year) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ═══════════════════════════════════════
   SCROLL TO TOP
   ═══════════════════════════════════════ */

(function () {
  var btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════
   HERO CANVAS — Neural Network Particle Animation
   ═══════════════════════════════════════ */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function getParticleCount() {
    return window.innerWidth < 768 ? 40 : 70;
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function createParticles() {
    const count = getParticleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const dark = isDark();
    const accentR = dark ? 0 : 2;
    const accentG = dark ? 212 : 132;
    const accentB = dark ? 255 : 199;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentR}, ${accentG}, ${accentB}, 0.5)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${0.12 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    animationId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createParticles();
    draw();
  }

  let resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      resize();
      createParticles();
    }, 200);
  });

  init();

  window._heroCanvasRedraw = function () {
    cancelAnimationFrame(animationId);
    draw();
  };
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

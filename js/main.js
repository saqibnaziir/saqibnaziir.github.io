/* ═══════════════════════════════════════
   HERO CANVAS — Interactive 3D Face
   ═══════════════════════════════════════ */

(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  var THREE = window.THREE;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.2, 6);

  var controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.minDistance = 4.2;
  controls.maxDistance = 8.2;
  controls.minPolarAngle = Math.PI * 0.35;
  controls.maxPolarAngle = Math.PI * 0.65;

  var faceGroup = new THREE.Group();
  scene.add(faceGroup);

  var ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  var key = new THREE.DirectionalLight(0x80dfff, 0.85);
  key.position.set(3, 4, 6);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x4cc9f0, 0.45);
  rim.position.set(-4, -1, -3);
  scene.add(rim);

  function createFaceGeometry() {
    var geo = new THREE.SphereGeometry(1.35, 72, 72);
    var pos = geo.attributes.position;

    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var z = pos.getZ(i);

      // Flatten back of head and shape jaw/chin.
      if (z < -0.6) z *= 0.86;
      if (y < -0.5) x *= 0.88;
      if (y < -0.92) {
        x *= 0.72;
        z *= 0.88;
      }

      // Nose bridge and tip.
      if (Math.abs(x) < 0.22 && y > -0.05 && y < 0.45 && z > 0.1) z += 0.18;
      if (Math.abs(x) < 0.12 && y > -0.02 && y < 0.13 && z > 0.25) z += 0.18;

      // Eye sockets.
      if (Math.abs(x) > 0.24 && Math.abs(x) < 0.66 && y > 0.05 && y < 0.34 && z > 0.45) z -= 0.15;

      // Cheek structure.
      if (Math.abs(x) > 0.52 && Math.abs(x) < 0.98 && y > -0.25 && y < 0.22 && z > 0.25) z += 0.08;

      // Mouth dip.
      if (Math.abs(x) < 0.45 && y > -0.45 && y < -0.2 && z > 0.38) z -= 0.07;

      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  var faceGeometry = createFaceGeometry();
  var faceMaterial = new THREE.MeshStandardMaterial({
    color: 0x5bd9ff,
    metalness: 0.2,
    roughness: 0.48,
    transparent: true,
    opacity: 0.2
  });
  var faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
  faceGroup.add(faceMesh);

  var wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(faceGeometry),
    new THREE.LineBasicMaterial({ color: 0x57d8ff, transparent: true, opacity: 0.65 })
  );
  faceGroup.add(wire);

  // A subtle point cloud halo for depth-map / CV feel.
  var cloudGeo = new THREE.BufferGeometry();
  var cloudCount = 500;
  var cloudArray = new Float32Array(cloudCount * 3);
  for (var p = 0; p < cloudCount; p++) {
    var t = Math.random() * Math.PI * 2;
    var u = Math.random() * Math.PI;
    var r = 2.2 + Math.random() * 0.9;
    cloudArray[p * 3] = r * Math.sin(u) * Math.cos(t);
    cloudArray[p * 3 + 1] = r * Math.cos(u) * 0.85;
    cloudArray[p * 3 + 2] = r * Math.sin(u) * Math.sin(t);
  }
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudArray, 3));
  var cloudMat = new THREE.PointsMaterial({ color: 0x31c9f8, size: 0.02, transparent: true, opacity: 0.5 });
  var cloud = new THREE.Points(cloudGeo, cloudMat);
  faceGroup.add(cloud);

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function refreshTheme() {
    var dark = isDark();
    renderer.setClearColor(dark ? 0x070b12 : 0xf3f8fc, 0);
    faceMaterial.color.setHex(dark ? 0x69ddff : 0x1f8abf);
    wire.material.color.setHex(dark ? 0x56d8ff : 0x2187b4);
    cloud.material.color.setHex(dark ? 0x35cbf8 : 0x2a87b7);
    cloud.material.opacity = dark ? 0.52 : 0.34;
  }

  function resize() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);
    faceGroup.rotation.y += 0.0014;
    faceGroup.rotation.x = Math.sin(Date.now() * 0.00025) * 0.04;
    cloud.rotation.y -= 0.0006;
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resize);
  resize();
  refreshTheme();
  animate();

  window._heroCanvasRedraw = refreshTheme;
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

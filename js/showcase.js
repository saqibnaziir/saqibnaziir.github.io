/* ════════════════════════════════════════════════════════════════
   INTERACTIVE SHOWCASE
   1. Before/after comparison slider (defocus deblurring).
   2. Lazy-loaded WebGL 3D face mesh viewer (Three.js, loaded only
      when the viewer scrolls into view to keep the page light).
   ════════════════════════════════════════════════════════════════ */

/* ── Before / after comparison slider ── */
(function () {
  var sliders = document.querySelectorAll('[data-ba]');
  sliders.forEach(function (s) {
    var range = s.querySelector('.ba-range');
    if (!range) return;
    function update() { s.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', update);
    update();
  });
})();

/* ── 3D face mesh viewer (lazy) ── */
(function () {
  var mount = document.getElementById('face-viewer');
  if (!mount) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        io.disconnect();
        init().catch(function () {
          var l = document.getElementById('viewer3d-loading');
          if (l) l.textContent = '3D viewer unavailable';
        });
      }
    });
  }, { rootMargin: '250px' });
  io.observe(mount);

  async function init() {
    var THREE = await import('three');
    var plyMod = await import('three/addons/loaders/PLYLoader.js');
    var ctrlMod = await import('three/addons/controls/OrbitControls.js');

    var width = mount.clientWidth;
    var height = mount.clientHeight;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(1, 1.2, 2);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x6ea8ff, 0.6);
    rim.position.set(-2, 0.5, -1);
    scene.add(rim);

    var controls = new ctrlMod.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 1.1;

    var loader = new plyMod.PLYLoader();
    loader.load('images/projects/depth/3D_face.ply', function (geometry) {
      geometry.computeVertexNormals();
      geometry.center();
      geometry.computeBoundingSphere();
      var r = geometry.boundingSphere.radius || 1;

      var material = new THREE.MeshStandardMaterial({
        color: 0xcdd6e6,
        metalness: 0.15,
        roughness: 0.55,
        flatShading: false
      });
      var mesh = new THREE.Mesh(geometry, material);
      // PLY faces face away by default for this scan; show both sides.
      material.side = THREE.DoubleSide;
      mesh.rotation.x = -Math.PI / 2; // orient upright
      scene.add(mesh);

      camera.position.set(0, 0, r * 3.0);
      controls.target.set(0, 0, 0);
      controls.update();

      var loading = document.getElementById('viewer3d-loading');
      if (loading) loading.style.display = 'none';
    });

    function onResize() {
      var w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    (function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();
  }
})();

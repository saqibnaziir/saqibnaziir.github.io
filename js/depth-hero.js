/* ════════════════════════════════════════════════════════════════
   DEPTH-PARALLAX HERO
   A single RGB photo given true 3D parallax using the predicted
   depth map from my monocular depth model. Per-pixel UV displacement
   in a WebGL fragment shader, eased toward the cursor / device tilt.
   Falls back silently to the static <img> if WebGL is unavailable
   or the user prefers reduced motion.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var canvas = document.getElementById('depth-canvas');
  if (!canvas) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // keep static fallback image

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return; // fallback image stays visible

  var VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uImage;',
    'uniform sampler2D uDepth;',
    'uniform vec2 uOffset;',
    'void main(){',
    // viridis colormap is monotonic in luminance, so luminance ~= depth
    '  vec3 dc = texture2D(uDepth, vUv).rgb;',
    '  float depth = dot(dc, vec3(0.299, 0.587, 0.114));',
    // near (dark / low depth) and far (bright) move in opposite directions -> parallax
    '  float amt = 0.5 - depth;',
    '  vec2 disp = uOffset * amt * 0.06;',
    '  vec2 uv = clamp(vUv + disp, 0.002, 0.998);',
    '  gl_FragColor = texture2D(uImage, uv);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uImage = gl.getUniformLocation(prog, 'uImage');
  var uDepth = gl.getUniformLocation(prog, 'uDepth');
  var uOffset = gl.getUniformLocation(prog, 'uOffset');
  gl.uniform1i(uImage, 0);
  gl.uniform1i(uDepth, 1);

  function makeTexture(url, unit, onLoad) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 16, 24, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var img = new Image();
    img.onload = function () {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      onLoad();
    };
    img.src = url;
  }

  var tx = 0, ty = 0, cx = 0, cy = 0; // target & current offsets

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Drive parallax from cursor anywhere over the hero, and device tilt on mobile.
  var hero = document.getElementById('hero') || document;
  hero.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 2;
    ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * 2;
    tx = Math.max(-1.4, Math.min(1.4, tx));
    ty = Math.max(-1.4, Math.min(1.4, ty));
  });
  hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      tx = Math.max(-1.2, Math.min(1.2, e.gamma / 30));
      ty = Math.max(-1.2, Math.min(1.2, (e.beta - 45) / 30));
    });
  }

  var ready = 0;
  function start() {
    if (++ready < 2) return;
    var img = document.querySelector('.depth-demo-fallback');
    if (img) img.style.opacity = '0'; // canvas now covers it
    resize();
    requestAnimationFrame(loop);
  }

  function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    gl.uniform2f(uOffset, cx, cy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  makeTexture('images/projects/depth/RGB.png', 0, start);
  makeTexture('images/projects/depth/Depth.png', 1, start);
})();

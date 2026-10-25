"use strict";
// 3D dice (three.js r128): each die tumbles and lands with the rolled face toward the viewer.
// Returns null when WebGL is unavailable, so the page falls back to plain numbers.
function createDice3D() {
  if (!window.THREE || !window.WebGLRenderingContext) return null;
  var T3 = window.THREE, V3 = T3.Vector3, cv = $("dice3d"), renderer;
  try { renderer = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var scene = new T3.Scene(), camera = new T3.PerspectiveCamera(32, 1, .1, 200);
  scene.add(new T3.AmbientLight(0xb9acd9, .42));
  var key = new T3.DirectionalLight(0xffe4b8, .72); key.position.set(3, 6, 7); scene.add(key);
  var rim = new T3.DirectionalLight(0xa77bff, .85); rim.position.set(-6, -1, 2); scene.add(rim);
  var warm = new T3.PointLight(0xf08bb4, .5, 40); warm.position.set(5, -4, 6); scene.add(warm);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var geoCache = {}, texCache = {}, dice = [], anim = null, lastSpecs = null;
  var LABEL = { 4: .66, 6: .92, 8: .64, 10: .52, 12: .66, 20: .56 };

  function d10Geometry() {
    var h = 1.12, e = h * (1 - Math.cos(Math.PI / 5)) / (1 + Math.cos(Math.PI / 5)), top = new V3(0, h, 0), bot = new V3(0, -h, 0), U = [], Lw = [], pos = [];
    for (var k = 0; k < 5; k++) {
      var a = k * 2 * Math.PI / 5, b = a + Math.PI / 5;
      U.push(new V3(Math.cos(a), e, Math.sin(a))); Lw.push(new V3(Math.cos(b), -e, Math.sin(b)));
    }
    function tri(a, b, c) { pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); }
    for (k = 0; k < 5; k++) {
      var n = (k + 1) % 5;
      tri(top, U[n], Lw[k]); tri(top, Lw[k], U[k]);
      tri(bot, Lw[k], U[n]); tri(bot, Lw[n], U[n]);
    }
    var g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return g;
  }
  function baseGeometry(s) {
    var g;
    if (s === 4) g = new T3.TetrahedronGeometry(1.25);
    else if (s === 6) g = new T3.BoxGeometry(1.45, 1.45, 1.45);
    else if (s === 8) g = new T3.OctahedronGeometry(1.15);
    else if (s === 10) g = d10Geometry();
    else if (s === 12) g = new T3.DodecahedronGeometry(1.12);
    else g = new T3.IcosahedronGeometry(1.15);
    return g.index ? g.toNonIndexed() : g;
  }
  function facesOf(g, s) {
    var p = g.attributes.position, groups = [];
    for (var i = 0; i < p.count; i += 3) {
      var a = new V3().fromBufferAttribute(p, i), b = new V3().fromBufferAttribute(p, i + 1), c = new V3().fromBufferAttribute(p, i + 2);
      var n = new V3().subVectors(c, b).cross(new V3().subVectors(a, b)).normalize(), f = null;
      if (n.dot(new V3().add(a).add(b).add(c)) < 0) n.negate();
      for (var k = 0; k < groups.length; k++) if (Math.abs(groups[k].n.dot(n)) > .999 && groups[k].n.dot(n) > 0) { f = groups[k]; break; }
      if (!f) { f = { n: n, v: [] }; groups.push(f); }
      [a, b, c].forEach(function (v) { if (!f.v.some(function (w) { return w.distanceTo(v) < 1e-4; })) f.v.push(v); });
    }
    groups.forEach(function (f) {
      f.c = new V3(); f.v.forEach(function (v) { f.c.add(v); }); f.c.divideScalar(f.v.length);
      if (f.n.dot(f.c) < 0) f.n.negate();
      var up;
      if (s === 6) { var ref = Math.abs(f.n.y) < .9 ? new V3(0, 1, 0) : new V3(0, 0, 1); up = ref.sub(f.n.clone().multiplyScalar(ref.dot(f.n))); }
      else { var far = f.v[0]; f.v.forEach(function (v) { if (v.distanceTo(f.c) > far.distanceTo(f.c) + 1e-4) far = v; }); up = far.clone().sub(f.c); }
      up.normalize();
      var x = new V3().crossVectors(up, f.n).normalize();
      f.q = new T3.Quaternion().setFromRotationMatrix(new T3.Matrix4().makeBasis(x, up, f.n));
    });
    return groups;
  }
  function tex(text) {
    if (texCache[text]) return texCache[text];
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var x = c.getContext("2d"), size = text.length > 1 ? 66 : 84;
    x.font = "800 " + size + "px 'Grenze Gotisch', Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.lineJoin = "round"; x.lineWidth = 8; x.strokeStyle = "rgba(30,18,8,.85)"; x.strokeText(text, 64, 68);
    x.fillStyle = "#f3dda4"; x.fillText(text, 64, 68);
    if (text === "6" || text === "9") { x.fillRect(46, 104, 36, 6); }
    var t3 = new T3.CanvasTexture(c); t3.anisotropy = 4; texCache[text] = t3; return t3;
  }
  function labelsFor(kind) {
    var out = [], i;
    if (kind === "tens") for (i = 0; i < 10; i++) out.push(i === 0 ? "00" : String(i * 10));
    else if (kind === "units") for (i = 0; i < 10; i++) out.push(String(i));
    else for (i = 1; i <= kind; i++) out.push(String(i));
    return out;
  }
  function build(spec) {
    var s = spec.kind === "tens" || spec.kind === "units" ? 10 : spec.kind;
    if (!geoCache[s]) { var g = baseGeometry(s); geoCache[s] = { g: g, faces: facesOf(g, s), edges: new T3.EdgesGeometry(g, 10) }; }
    var G = geoCache[s], grp = new T3.Group(), labels = labelsFor(spec.kind);
    var body = new T3.MeshStandardMaterial({ color: 0x4d6189, metalness: .4, roughness: .52, flatShading: true, side: T3.DoubleSide, transparent: !!spec.dim, opacity: 1 });
    grp.add(new T3.Mesh(G.g, body));
    var edge = new T3.LineBasicMaterial({ color: 0xd8b46a, transparent: true, opacity: 1 });
    grp.add(new T3.LineSegments(G.edges, edge));
    var mats = [body, edge], plates = [];
    G.faces.forEach(function (f, i) {
      var m = new T3.MeshBasicMaterial({ map: tex(labels[i]), transparent: true, depthWrite: false, opacity: 1 });
      var pl = new T3.Mesh(new T3.PlaneGeometry(LABEL[s], LABEL[s]), m);
      pl.position.copy(f.c).add(f.n.clone().multiplyScalar(.004)); pl.quaternion.copy(f.q); grp.add(pl); mats.push(m); plates.push(pl);
    });
    return { grp: grp, faces: G.faces, labels: labels, mats: mats, plates: plates };
  }
  var TILT = new T3.Quaternion(), TILT_FLAT = new T3.Quaternion().setFromEuler(new T3.Euler(-.2, .2, 0));
  function finalQuat(d, label) {
    var i = d.labels.indexOf(label); if (i < 0) i = 0;
    return (d.faces.length <= 6 ? TILT_FLAT : TILT).clone().multiply(d.faces[i].q.clone().conjugate());
  }
  function layout(n) {
    var cols = n <= 3 ? n : n <= 4 ? 2 : n <= 9 ? 3 : n <= 12 ? 4 : 5, rows = Math.ceil(n / cols), sp = 2.75;
    var w = cv.clientWidth || 400, h = cv.clientHeight || 340, asp = w / h;
    camera.aspect = asp;
    var half = Math.tan(camera.fov * Math.PI / 360), needH = rows * sp + .6, needW = cols * sp + .6;
    camera.position.set(0, 0, Math.max(needH / (2 * half), needW / (2 * half * asp)) + 1.6);
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    return function (i) {
      var r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), c = i - r * cols;
      return new V3((c - (inRow - 1) / 2) * sp, ((rows - 1) / 2 - r) * sp, 0);
    };
  }
  function size() {
    var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
  }
  function render() { renderer.render(scene, camera); }
  function set(specs, animate) {
    lastSpecs = specs;
    dice.forEach(function (d) { scene.remove(d.grp); });
    size();
    var at = layout(specs.length);
    dice = specs.map(function (sp, i) {
      var d = build(sp); d.home = at(i); d.end = finalQuat(d, sp.label); d.dim = !!sp.dim; d.hit = Math.max(0, d.labels.indexOf(sp.label));
      d.axis = new V3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
      d.spin = Math.PI * (3 + Math.random() * 2); d.delay = i * 55; d.drift = new V3((Math.random() - .5) * 3, 0, 0);
      scene.add(d.grp); return d;
    });
    if (!animate || reduce) { dice.forEach(function (d) { pose(d, 1); }); render(); return; }
    var t0 = performance.now(), dur = 1150;
    if (anim) cancelAnimationFrame(anim);
    (function step(now) {
      var done = true;
      dice.forEach(function (d) {
        var p = Math.min(1, Math.max(0, (now - t0 - d.delay) / dur)); if (p < 1) done = false; pose(d, p);
      });
      render(); anim = done ? null : requestAnimationFrame(step);
    })(t0);
  }
  function bounce(p) { var n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + .75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + .9375; return n * (p -= 2.625 / d) * p + .984375; }
  function pose(d, p) {
    var e = 1 - Math.pow(1 - p, 3);
    d.grp.quaternion.setFromAxisAngle(d.axis, d.spin * (1 - e)).multiply(d.end);
    d.grp.position.copy(d.home).add(d.drift.clone().multiplyScalar(1 - e));
    d.grp.position.y += (1 - bounce(p)) * 3.2;
    var op = d.dim ? 1 - .7 * e : 1;
    d.mats.forEach(function (m, k) { m.opacity = op * (k >= 2 && k - 2 !== d.hit ? 1 - .5 * e : 1); });
    var big = 1 + .45 * e; d.plates[d.hit].scale.set(big, big, 1); d.plates[d.hit].position.copy(d.faces[d.hit].c).add(d.faces[d.hit].n.clone().multiplyScalar(.004 + .02 * e));
  }
  if (window.ResizeObserver) new ResizeObserver(function () { if (dice.length && !anim) { var specs = dice; size(); var at = layout(specs.length); specs.forEach(function (d, i) { d.home = at(i); pose(d, 1); }); render(); } }).observe(cv);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { texCache = {}; if (lastSpecs && !anim) set(lastSpecs, false); });
  return { set: set };
}

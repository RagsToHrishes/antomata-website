// Background: a small swarm of unit robots drifting and linking up when they come close.
(function () {
  var canvas = document.getElementById('swarm');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMBER = '242,107,29', LIGHT = '255,178,102', BONE = '244,239,230', CARBON = '11,11,11';
  var LINK = 170;
  var w, h, dpr, units = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(14, Math.min(46, Math.round(w * h / 30000)));
    while (units.length < n) units.push(spawn());
    units.length = n;
  }

  function spawn() {
    var a = Math.random() * Math.PI * 2, s = 0.12 + Math.random() * 0.22;
    return {
      x: Math.random() * w, y: Math.random() * h,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      size: 7 + Math.random() * 7,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2,
      scout: Math.random() < 0.2
    };
  }

  function step(t) {
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      u.x += u.vx; u.y += u.vy + Math.sin(t / 1800 + u.phase) * 0.06; u.rot += u.vr;
      var m = 30;
      if (u.x < -m) u.x = w + m; else if (u.x > w + m) u.x = -m;
      if (u.y < -m) u.y = h + m; else if (u.y > h + m) u.y = -m;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (var i = 0; i < units.length; i++) {
      for (var j = i + 1; j < units.length; j++) {
        var a = units[i], b = units[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(' + BONE + ',' + (0.22 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (var k = 0; k < units.length; k++) {
      var u = units[k];
      var low = u.y > h * 0.8; // over the ember glow: carbon units, like the logo
      ctx.save();
      ctx.translate(u.x, u.y);
      if (u.scout) {
        ctx.fillStyle = low ? 'rgba(' + BONE + ',.8)' : 'rgba(' + LIGHT + ',.75)';
        ctx.beginPath(); ctx.arc(0, 0, u.size * 0.42, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.rotate(u.rot);
        ctx.fillStyle = low ? 'rgba(' + CARBON + ',.85)' : 'rgba(' + EMBER + ',.8)';
        var s = u.size, r = s * 0.22;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, r); else ctx.rect(-s / 2, -s / 2, s, s);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function loop(t) { step(t); draw(); requestAnimationFrame(loop); }

  resize();
  window.addEventListener('resize', resize);
  if (reduce) draw(); else requestAnimationFrame(loop);
})();

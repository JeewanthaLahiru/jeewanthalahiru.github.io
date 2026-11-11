/*
 * Interactive particle network ("plexus" / constellation effect) for the home hero.
 * Nodes drift around, nearby nodes are joined by edges, and the mouse cursor
 * draws links to nearby nodes and gently pushes them away.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-network');
  if (!canvas || !canvas.getContext) { return; }

  var ctx = canvas.getContext('2d');
  var section = canvas.closest('.animated-section');
  var host = canvas.parentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLOR = '9, 174, 234';      // theme accent #09aeea
  var LINK_DIST = 140;            // max distance for node-to-node edges
  var MOUSE_DIST = 190;           // radius of mouse influence
  var REPEL = 0.9;                // strength of the push away from the cursor
  var MAX_SPEED = 0.6;

  var dpr = 1, width = 0, height = 0;
  var nodes = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var rafId = null;

  function resize() {
    var rect = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // density scales with area, clamped for performance
    var target = Math.max(35, Math.min(120, Math.round((width * height) / 9000)));
    while (nodes.length < target) { nodes.push(makeNode()); }
    if (nodes.length > target) { nodes.length = target; }
    nodes.forEach(function (n) {
      if (n.x > width) { n.x = Math.random() * width; }
      if (n.y > height) { n.y = Math.random() * height; }
    });
  }

  function makeNode() {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.15 + Math.random() * 0.35;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1 + Math.random() * 1.8
    };
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];

      if (mouse.active) {
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_DIST && d > 0.01) {
          var f = (1 - d / MOUSE_DIST) * REPEL * 0.08;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }

      // clamp speed, with slight damping back toward a cruise speed
      var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (sp > MAX_SPEED) { n.vx *= 0.96; n.vy *= 0.96; }

      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); }
      if (n.x > width) { n.x = width; n.vx = -Math.abs(n.vx); }
      if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy); }
      if (n.y > height) { n.y = height; n.vy = -Math.abs(n.vy); }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    var i, j, a, b, dx, dy, d2, alpha;
    var link2 = LINK_DIST * LINK_DIST;
    var mouse2 = MOUSE_DIST * MOUSE_DIST;

    // node-to-node edges
    ctx.lineWidth = 0.8;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y;
        d2 = dx * dx + dy * dy;
        if (d2 < link2) {
          alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.45;
          ctx.strokeStyle = 'rgba(' + COLOR + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // cursor-to-node edges
    if (mouse.active) {
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        d2 = dx * dx + dy * dy;
        if (d2 < mouse2) {
          alpha = (1 - Math.sqrt(d2) / MOUSE_DIST) * 0.8;
          ctx.strokeStyle = 'rgba(' + COLOR + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
      }
    }

    // vertices
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      ctx.fillStyle = 'rgba(' + COLOR + ',0.9)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function isVisible() {
    return !section || section.classList.contains('section-active');
  }

  function loop() {
    rafId = null;
    if (!isVisible() || document.hidden) { return; } // paused until home is shown again
    step();
    draw();
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion) { draw(); return; }
    if (rafId === null) { rafId = window.requestAnimationFrame(loop); }
  }

  function setMouse(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
    if (reduceMotion) { draw(); }
  }

  // listen on the section so the text on top doesn't block interaction
  host.addEventListener('mousemove', function (e) { setMouse(e.clientX, e.clientY); });
  host.addEventListener('mouseleave', function () { mouse.active = false; });
  host.addEventListener('touchmove', function (e) {
    if (e.touches[0]) { setMouse(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: true });
  host.addEventListener('touchend', function () { mouse.active = false; });

  window.addEventListener('resize', function () { resize(); if (reduceMotion) { draw(); } });
  document.addEventListener('visibilitychange', start);

  // resume when navigating back to the home section
  if (section && window.MutationObserver) {
    new MutationObserver(function () { resize(); start(); })
      .observe(section, { attributes: true, attributeFilter: ['class'] });
  }

  resize();
  start();
})();

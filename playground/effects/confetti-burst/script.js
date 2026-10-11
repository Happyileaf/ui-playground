(function () {
  "use strict";

  var canvas = document.getElementById("confettiCanvas");
  var ctx = canvas.getContext("2d");

  var burstBtn = document.getElementById("burstBtn");
  var cannonBtn = document.getElementById("cannonBtn");
  var tripleBtn = document.getElementById("tripleBtn");
  var soundToggle = document.getElementById("soundToggle");

  var COLORS = ["#f43f5e", "#f59e0b", "#2fd6a8", "#38bdf8", "#a78bfa", "#fbbf24"];
  var MAX_PARTICLES = 600;

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var dpr = 1;
  var width = 0;
  var height = 0;

  var particles = [];
  var rafId = null;
  var lastTime = 0;

  var audioCtx = null;
  var soundEnabled = true;
  var lastPopAt = 0;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function spawnParticle(x, y, angle, speed) {
    if (particles.length >= MAX_PARTICLES) {
      return;
    }
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: rand(8, 10),
      h: rand(12, 16),
      color: pick(COLORS),
      rotationX: rand(0, Math.PI * 2),
      rotationY: rand(0, Math.PI * 2),
      spinX: rand(-7, 7),
      spinY: rand(-7, 7),
      swayAmp: rand(26, 72),
      swayFreq: rand(1.6, 3.4),
      swayPhase: rand(0, Math.PI * 2),
      gravity: rand(900, 1200),
      age: 0
    });
  }

  function burst(x, y, count) {
    if (reducedMotion) {
      count = 12;
    }
    for (var i = 0; i < count; i++) {
      var angle = -Math.PI / 2 + rand(-1.05, 1.05);
      var speed = rand(260, 720);
      spawnParticle(x + rand(-8, 8), y + rand(-8, 8), angle, speed);
    }
    playPop();
    kick();
  }

  function cannonBurst() {
    var count = reducedMotion ? 6 : Math.round(rand(70, 82));
    for (var side = 0; side < 2; side++) {
      var originX = side === 0 ? -12 : width + 12;
      var originY = height + 24;
      for (var i = 0; i < count; i++) {
        var angle = side === 0
          ? -Math.PI / 3 + rand(-0.28, 0.16)
          : -Math.PI * 2 / 3 + rand(-0.16, 0.28);
        var speed = rand(640, 1050);
        spawnParticle(originX, originY, angle, speed);
      }
    }
    playPop();
    kick();
  }

  function update(dt) {
    var dragFactor = Math.pow(0.985, dt * 60);
    var floor = height + 60;

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.age += dt;

      p.vy += (reducedMotion ? 1350 : p.gravity) * dt;
      p.vx *= dragFactor;
      p.vy *= Math.pow(0.995, dt * 60);

      var sway = Math.sin(p.age * p.swayFreq * Math.PI + p.swayPhase) * p.swayAmp * dt;
      p.x += p.vx * dt + sway;
      p.y += p.vy * dt;

      p.rotationX += p.spinX * dt;
      p.rotationY += p.spinY * dt;

      if (p.x < -60 && p.vx < 0) {
        p.vx = Math.abs(p.vx) * 0.4;
      } else if (p.x > width + 60 && p.vx > 0) {
        p.vx = -Math.abs(p.vx) * 0.4;
      }

      if (p.y > floor) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var scaleX = Math.cos(p.rotationX);
      var scaleY = Math.cos(p.rotationY);
      var w = Math.max(0.6, Math.abs(scaleX) * p.w);
      var h = Math.max(0.6, Math.abs(scaleY) * p.h);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotationY * 0.4);
      ctx.globalAlpha = scaleY < -0.4 ? 0.65 : 1;
      ctx.fillStyle = p.color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  function frame(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }
    var dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt > 0.05) {
      dt = 0.05;
    }

    update(dt);
    draw();

    if (particles.length === 0) {
      rafId = null;
      lastTime = 0;
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function kick() {
    if (rafId === null && particles.length > 0) {
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }
  }

  function initAudio() {
    if (audioCtx) {
      return;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return;
    }
    try {
      audioCtx = new Ctor();
    } catch (err) {
      audioCtx = null;
    }
  }

  function playPop() {
    if (!soundEnabled || !audioCtx) {
      return;
    }
    var now = audioCtx.currentTime;
    if (now - lastPopAt < 0.07) {
      return;
    }
    lastPopAt = now;

    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = "sine";
      var startFreq = rand(420, 520);
      var endFreq = rand(760, 980);
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (err) {
    }
  }

  function unlockAudio() {
    initAudio();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function centerPoint() {
    var rect = burstBtn.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  burstBtn.addEventListener("click", function () {
    var p = centerPoint();
    burst(p.x, p.y, Math.round(rand(120, 160)));
  });

  cannonBtn.addEventListener("click", function () {
    cannonBurst();
  });

  tripleBtn.addEventListener("click", function () {
    var p = centerPoint();
    burst(p.x, p.y, Math.round(rand(120, 150)));
    setTimeout(function () {
      burst(p.x, p.y, Math.round(rand(120, 150)));
    }, 280);
    setTimeout(function () {
      burst(p.x, p.y, Math.round(rand(120, 160)));
    }, 560);
  });

  soundToggle.addEventListener("change", function () {
    soundEnabled = soundToggle.checked;
  });

  window.addEventListener("pointerdown", unlockAudio, { once: false });

  document.addEventListener("pointerdown", function (event) {
    if (event.target.closest && event.target.closest("button, label, .celebrate-card")) {
      return;
    }
    burst(event.clientX, event.clientY, reducedMotion ? 12 : 60);
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
})();

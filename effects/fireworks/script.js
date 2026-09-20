(function () {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  const autoToggle = document.getElementById('autoToggle');
  const soundToggle = document.getElementById('soundToggle');
  const clearBtn = document.getElementById('clearBtn');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const fireworks = [];
  const particles = [];
  let autoMode = true;
  let soundMode = false;
  let timer = 0;
  let animId = null;

  // Sound synthesis using Web Audio API
  let audioCtx = null;
  function playBoomSound() {
    if (!soundMode) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + Math.random() * 80, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  class Firework {
    constructor(sx, sy, tx, ty) {
      this.x = sx;
      this.y = sy;
      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.atan2(ty - sy, tx - sx);
      this.speed = 2;
      this.acceleration = 1.04;
      this.brightness = Math.random() * 30 + 70;
      this.targetRadius = 1;
      this.hue = Math.floor(Math.random() * 360);
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      this.speed *= this.acceleration;
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      this.distanceTraveled = Math.hypot(this.x - this.sx, this.y - this.sy);

      if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty, this.hue);
        fireworks.splice(index, 1);
        playBoomSound();
      } else {
        this.x += vx;
        this.y += vy;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  class Particle {
    constructor(x, y, hue) {
      this.x = x;
      this.y = y;
      this.coordinates = [];
      this.coordinateCount = 5;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 9 + 1.5;
      this.friction = 0.95;
      this.gravity = 0.98;
      this.hue = hue + (Math.random() * 40 - 20);
      this.brightness = Math.random() * 40 + 60;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.012;
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;

      if (this.alpha <= this.decay) {
        particles.splice(index, 1);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function createParticles(x, y, hue) {
    let particleCount = 45;
    while (particleCount--) {
      particles.push(new Particle(x, y, hue));
    }
  }

  function loop() {
    animId = requestAnimationFrame(loop);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
      particles[j].draw();
      particles[j].update(j);
    }

    if (autoMode) {
      timer++;
      if (timer % 32 === 0) {
        const sx = width / 2 + (Math.random() * 300 - 150);
        const sy = height;
        const tx = Math.random() * (width - 160) + 80;
        const ty = Math.random() * (height * 0.5) + 60;
        fireworks.push(new Firework(sx, sy, tx, ty));
      }
    }
  }

  function launchAt(targetX, targetY) {
    const sx = width / 2 + (Math.random() * 100 - 50);
    const sy = height;
    fireworks.push(new Firework(sx, sy, targetX, targetY));
  }

  canvas.addEventListener('pointerdown', (e) => {
    launchAt(e.clientX, e.clientY);
  });

  autoToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    autoMode = !autoMode;
    autoToggle.textContent = `Auto Launch: ${autoMode ? 'ON' : 'OFF'}`;
    autoToggle.classList.toggle('active', autoMode);
  });

  if (soundToggle) {
    soundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      soundMode = !soundMode;
      soundToggle.textContent = `Sound: ${soundMode ? 'ON' : 'OFF'}`;
      soundToggle.classList.toggle('active', soundMode);
      if (soundMode && !audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (err) {}
      }
    });
  }

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fireworks.length = 0;
    particles.length = 0;
    ctx.clearRect(0, 0, width, height);
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (animId) cancelAnimationFrame(animId);
    if (audioCtx) {
      audioCtx.close().catch(() => {});
    }
  });

  loop();
})();

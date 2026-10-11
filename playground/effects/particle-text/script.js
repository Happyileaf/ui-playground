(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const textInput = document.getElementById('textInput');
  const renderBtn = document.getElementById('renderBtn');
  const colorBtns = document.querySelectorAll('.color-btn');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let currentPalette = 'cyber';

  const mouse = {
    x: null,
    y: null,
    radius: 90,
  };

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('pointerleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  let particles = [];

  class Particle {
    constructor(x, y, color) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.destX = x;
      this.destY = y;
      this.size = 2.2;
      this.baseColor = color;
      this.color = color;
      this.vx = 0;
      this.vy = 0;
      this.density = Math.random() * 20 + 10;
      this.friction = 0.88;
      this.ease = 0.08;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = (dx / distance) * force * this.density;
          const directionY = (dy / distance) * force * this.density;
          this.vx -= directionX;
          this.vy -= directionY;
        }
      }

      // Spring back to destination
      const dxOrigin = this.destX - this.x;
      const dyOrigin = this.destY - this.y;
      this.vx += dxOrigin * this.ease;
      this.vy += dyOrigin * this.ease;

      this.vx *= this.friction;
      this.vy *= this.friction;

      this.x += this.vx;
      this.y += this.vy;
    }
  }

  function getPaletteColor(x, y, totalW) {
    const ratio = Math.max(0, Math.min(1, x / totalW));
    if (currentPalette === 'cyber') {
      return ratio < 0.5 ? '#38bdf8' : '#818cf8';
    } else if (currentPalette === 'fire') {
      return ratio < 0.5 ? '#fbbf24' : '#f43f5e';
    } else {
      const hue = Math.floor(ratio * 360);
      return `hsl(${hue}, 85%, 65%)`;
    }
  }

  function initParticles() {
    particles = [];
    const text = (textInput.value || 'NATIVE WEB').trim().toUpperCase();

    // Offscreen canvas to rasterize text
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    offCanvas.width = width;
    offCanvas.height = height;

    const fontSize = Math.min(width / (text.length * 0.7), 130);
    offCtx.fillStyle = '#ffffff';
    offCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, width / 2, height / 2);

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const step = Math.max(3, Math.floor(fontSize / 25));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = imgData[index + 3];
        if (alpha > 128) {
          const color = getPaletteColor(x, y, width);
          particles.push(new Particle(x, y, color));
        }
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(9, 13, 22, 0.35)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
      particles[i].update();
    }
  }

  renderBtn.addEventListener('click', initParticles);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') initParticles();
  });

  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentPalette = btn.dataset.palette;
      initParticles();
    });
  });

  initParticles();
  animate();
})();

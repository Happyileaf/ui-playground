(function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let mouseX = 0;
  let mouseY = 0;

  // Perlin Noise implementation
  class PerlinNoise {
    constructor() {
      this.p = new Array(512);
      this.permutation = [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233,140,163,
        27,146,16,182,171,130,179,234,37,25,
        197,26,196,108,135,4,192,210,145,45,
        59,164,172,112,141,60,68,30,61,173,
        199,67,237,155,124,107,127,114,15,198,
        17,134,7,102,31,25,107,154,21,129,150,
        148,109,42,221,222,158,64,139,87,40,
        34,177,223,191,125,26,196,168,74,252,
        216,117,95,162,85,156,100,108,165,30,
        161,19,212,200,109,25,106,57,142,167,
        30,231,129,23,103,96,128,139,178,185,
        149,34,17,26,142,199,107,160,164,46,
        31,135,129,137,93,9,62,167,143,196,
        110,188,139,152,142,127,108,166,48,
        146,75,186,128,59,146,61,97,181,131,
        123,122,19,139,158,4,151,117,73,89,
        174,19,206,140,12,154,165,20,145,251,
        79,147,10,146,58,10,161,138,129,223,
        195,178,108,163,156,203,113,185,167,
        58,191,1,83,49,112,68,172,99,63,
        158,170,98,163,150,101,103,82,153,
        140,211,110,128,109,180,166,104,230,
        52,71,140,171,129,119,168,172,158,
        201,194,188,101,106,198,199,195,193,
        218,147,149,152,144,172,12,173,145,
        229,239,17,160,203,111,141,83,110,
        170,159,116,131,234,206,151,93,152,
        148,157,165,176,152,132,145,168,166,
        170,16,190,219,150,173,190,176,122,
        137,171,136,173,154,149,84,115,99,
        22,156,60,65,89,13,172,18,157,88,
        208,220,146,130,197,225,31,82,170,
        170,126,129,146,26,163,59,165,129,
        10,174,56,42,139,196,173,47,184,
        106,208,162,123,91,219,190,238,164,
        79,145,189,199,200,196];
      for (let i = 0; i < 256; i++) {
        this.p[256 + i] = this.p[i] = this.permutation[i];
      }
    }

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
      return a + t * (b - a);
    }

    grad(hash, x, y) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const u = this.fade(x);
      const v = this.fade(y);
      const A = this.p[X] + Y;
      const B = this.p[X + 1] + Y;
      return this.lerp(v,
        this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
        this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
      );
    }
  }

  const perlin = new PerlinNoise();
  let time = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  function getNoiseValue(x, y, scale) {
    return (perlin.noise(x * scale, y * scale) + 1) * 0.5;
  }

  function animate() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const numWaves = 8;
    const baseSpacing = height / (numWaves + 1);

    for (let wave = 0; wave < numWaves; wave++) {
      const yBase = (wave + 1) * baseSpacing;
      const amplitude = 20 + wave * 8;
      const frequency = 0.005 + wave * 0.001;
      const hue = 200 + wave * 20;
      const alpha = 0.3 + (wave / numWaves) * 0.5;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
      ctx.lineWidth = 2 + wave * 0.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let firstPoint = true;
      for (let x = 0; x <= width; x += 2) {
        const dx = (x - mouseX) * 0.01;
        const dy = (yBase - mouseY) * 0.01;
        const distanceFactor = Math.max(0.2, 1 - Math.sqrt(dx * dx + dy * dy) * 0.1);
        const noiseValue = getNoiseValue(x, time + wave * 10, frequency);
        const y = yBase + (noiseValue - 0.5) * amplitude * 2 * distanceFactor;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    time += 0.05;
    animationFrameId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resize();
  animate();

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
})();

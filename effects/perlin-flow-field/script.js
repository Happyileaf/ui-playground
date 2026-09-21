// Perlin Noise Flow Field - Interactive Particle Animation
// Based on improved Perlin noise algorithm

// Improved Perlin Noise implementation
class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,127,32,147,29,1,219,
      148,65,47,146,145,95,234,176,123,114,52,125,245,
      171,109,105,63,22,196,108,110,211,104,102,150,146,
      43,172,9,99,38,140,16,36,133,34,227,47,73,168,
      41,24,140,176,137,54,235,77,52,21,206,113,90,96,
      120,150,151,64,23,141,87,17,109,213,116,241,91,
      46,229,103,96,207,142,74,45,103,52,179,121,61,
      156,181,108,175,198,58,51,171,17,87,165,196,
      126,64,183,104,125,122,28,109,196,118,111,79,
      109,95,168,64,198,112,135,75,16,123,12,168,58,
      220,106,126,90,80,150,184,114,176,151,195,126,
      128,195,112,60,210,108,191,175,100,105,154,137,
      42,177,176,121,125,64,87,25,209,110,55,216,193,
      126,117,236,77,161,142,147,196,184,177,205,97,
      127,155,161,139,1,163,179,131,34,25,141,14,200,
      70,105,88,41,221,159,56,61,75,137,107,199,103,
      135,194,119,175,48,35,192,213,212,188,90,188,
      46,122,102,208,230,215,150,160,82,59,71,149,
      180,168,140,149,192,164,110,182,82,78,250,
      79,186,42,197,26,68,2,190,95,87,47,14,120,
      70,125,241,169,59,185,29,80,158,68,100,26,
      36,61,70,27,124,92,50,96,120,150,165,32,
      63,93,25,141,11,133,29,103,96,52,140,250,
      136,123,9,110,98,111,106,208,215,114,148,
      101,141,42,184,102,166,195,90,184,81,121,
      68,221,142,153,224,200,180,135,114,125,142,
      158,230,205,130,155,161,167,131,209,206,
      108,114,59,123,63,25,240,169,66,51,69,5,
      193,168,94,93,68,68,190,150,98,132,143,
      220,196,171,138,150,142,20,166,140,203,
      135,190,161,139,100,43,52,50,154,109,131,
      157,201,139,178,169,141,159,176,122,129,
      140,95,113,207,179,141,115,119,126,160,
      99,5,101,117,156,105,173,131,207,151,127,
      194,143,144,150,151,187,28,149,195,154,
      171,124,23,101,122,90,190,167,152,60,214,
      128,113,20,192,138,163,104,163,150,210,
      142,98,143,138,100,83,111,115,111,158,
      102,16,92,25,142,152,81,141,121,189,142,
      152,147,188,190,209,176,188,180,151,118,
      149,200,132,178,147,109,109,181,168,145,
      143,210,156,129,142,141,115,186,150,201,
      128,147,185,122,165,205,153,84,118,72,
      161,181,179,103,218,120,168,113,100,108,
      163,105,161,143,65,138,136,100,188,152,
      206,173,6,119,116,214,50,68,114,63,116,
      207,8,112,114,86,113,116,73,103,155,112,
      61,145,205,141,118,164,191,172,158,143,
      112,144,218,222,171,156,105,92,146,43,
      250,170,147,169,2,210,129,142,184,199,
      137,63,197,27,100,155,41,77,148,155,
      151,200,166,199,190,149,200,141,175,149,
      45,67,130,154,59,166,69,67,160,12,103,
      108,181,138,131,182,166,149,141,188,
      191,100,176,130,151,156,128,55,181,148,
      133,141,197,177,101,166,191,46,144,220,
      180,158,108,112,149,123,142,150,143,
      152,171,136,122,123,129,98,144,177,203,
      188,100,218,166,141,147,205,126,63,56,
      153,139,222,169,121,142,148,150,149,
      167,163,150,96,149,163,58,204,189,153,
      187,103,203,113,113,164,165,80,84,181,
      153,182,163,117,131,184,166,156,108,
      76,112,158,144,137,44,181,181,85,5,
      145,188,145,104,123,105,187,75,136,
      120,111,131,171,149,152,136,159,198,
      176,160,171,151,154,100,169,154,238,
      163,150,101,160,139,70,149,210,106,
      139,152,166,177,226,152,150,97,161,
      179,121,149,184,143,115,170,159,166,
      190,190,162,151,153,130,105,160,169,
      162,158,10,143,62,140,119,110,139,
      109,170,164,184,180,216,119,113,141,
      171,114,209,146,151,158,153,200,166,
      148,174,156,151,161,127,126,100,131,
      135,61,80,98,99,168,205,113,147,16,
      143,19,100,113,207,206,186,161,147,
      105,141,162,199,178,186,134,194,205,
      138,144,225,182,146,139,196,173,127,
      95,222,170,131,148,155,149,65,229,
      156,117,119,196,128,190,195,130,151,
      48,147,127,31,110,61,231,24,180,181,
      181,124,111,146,41,230,151,191,79,
      131,112,103,155,44,112,108,159,65,
      134,248,170,146,117,113,211,193,122,
      156,199,171,157,212,170,208,200,181,
      150,203,162,168,125,210,128,145,165,
      182,187,208,215,193,211,170,142,166,
      152,180,178,158,200,165,119,148,146,
      198,191,169,121,139,90,156,77,145,
      132,209,144,121,108,146,40,80,81,
      137,126,110,119,112,91,183,126,112,
      165,119,108,108,222,100,102,108,109,
      150,189,115,98,137,140,140,169,124,
      29,144,92,107,127,161,153,155,160,
      193,145,142,140,161,159,199,201,197,
      120,36,143,87,174,145,165,208,175,
      115,121,225,203,176,151,201,129,147,
      156,57,158,139,176,182,125,164,214,
      186,183,189,119,160,190,132,156,170,
      144,109,118,138,139,190,209,141,150,
      109,166,89,147,182,146,203,115,159,
      76,150,211,136,120,154,159,191,198,
      190,205,180,43,188,63,201,146,159,
      83,177,25,151,155,104,89,121,174,
      129,150,142,99,210,164,76,102,108,
      173,64,190,192,175,112,103,152,16,
      120,93,188,105,109,171,146,139,119,
      193,195,186,178,75,180,111,161,126,
      156,203,111,29,149,158,124,89,173,
      122,112,214,172,125,152,159,153,150,
      162,126,141,185,165,198,219,180,
      193,145,206,163,157,170,112,103,
      152,134,149,213,176,168,134,159,
      147,62,100,118,185,154,162,119,115,
      134,116,175,155,210,130,102,186,
      157,192,120,135,158,144,171,147,
      94,128,71,153,186,190,178,187,141,
      117,129,143,148,99,110,100,121,
      99,4,92,105,108,106,208,87,110,
      114,197,114,214,117,88,111,85,
      4,132,109,152,41,201,143,147,
      194,188,153,115,125,2,192,140,
      120,145,165,138,200,90,69,150,
      105,91,198,176,148,152,150,183,
      190,219,122,59,76,81,196,61,
      231,72,124,159,105,207,142,113,
      131,11,133,52,28,104,155,31,
      26,156,171,198,42,229,200,192,
      85,157,141,195,115,136,134,183,
      184,207,206,156,117,187,224,148,
      102,119,159,158,154,169,163,102,
      196,172,95,182,143,157,137,172,
      88,122,195,168,174,171,39,120,
      113,192,173,209,66,102,96,52,
      132,132,164,91,140,217,139,66,
      127,45,180,163,107,112,179,32,
      133,33,89,180,159,195,112,92,
      143,105,164,70,167,58,191,196,
      168,124,151,160,85,83,104,122,
      170,33,167,54,93,180,118,159,
      204,110,153,116,204,15,189,153,
      78,83,161,96,103,100,196,192,
      210,125,81,171,147,182,101,149,
      159,103,165,48,144,230,225,218,
      125,146,58,100,133,130,200,108,
      158,125,128,159,200,173,144,188,
      101,104,38,80,39,181,93,55,171,
      93,156,123,167,34,24,140,169,
      152,60,208,110,155,44,181,149,
      179,109,52,167,53,146,180,188,
      41,83,195,101,226,76,8,193,
      152,13,101,25,169,146,152,149,
      200,144,142,138,189,173,186,
      182,165,75,203,111,2,139,91,
      58,158,138,133,168,118,109,195,
      140,208,189,69,29,90,158,203,
      166,170,125,149,213,199,68,
      179,111,149,213,146,63,168,
      129,91,180,156,102,136,164,
      191,152,163,122,67,32,139,
      59,144,19,200,29,95,167,135,
      120,160,129,148,169,87,20,
      52,113,119,122,159,163,159,
      79,165,104,180,41,29,22,
      143,29,107,160,71,142,38,
      198,189,154,128,163,158,109,
      160,161,161,145,144,235,169,
      159,202,113,129,111,97,160,
      55,170,211,129,62,135,107,
      164,194,128,174,150,151,199,
      93,142,190,158,131,201,160,
      191,107,194,180,130,131,148,
      176,105,161,110,124,51,120,
      102,164,130,100,120,142,209,
      179,175,108,191,174,169,141,
      115,159,156,100,66,178,116,
      223,229,65,110,12,79,92,
      141,95,126,164,109,131,60,
      139,110,161,131,102,218,209,
      152,100,221,123,82,115,96,
      173,215,163,51,94,150,218,
      169,145,155,143,84,198,143,
      227,203,111,171,112,171,177,
      181,107,201,142,156,162,113,
      140,6,223,130,196,129,48,
      144,132,59,206,209,64,147,
      202,125,80,218,201,134,126,
      2,137,180,94,241,150,109,
      176,158,153,200,96,111,84,
      172,110,229,30,148,135,94,
      48,70,119,158,184,150,165,
      208,206,186,111,112,56,203,
      194,156,102,117,95,127,138,
      114,184,138,101,158,220,134,
      106,152,124,107,19,163,53,
      226,139,55,29,148,114,166,
      75,204,55,131,84,58,152,
      109,181,198,127,190,188,
      151,64];

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

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
      this.grad(this.p[BA], x - 1, y, z)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
        this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
        this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }
}

// Particle definition
class Particle {
  constructor(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = 0;
    this.vy = 0;
    this.history = [];
    this.maxHistory = 20;
  }

  update(angle, speed) {
    this.vx += Math.cos(angle) * speed * 0.1;
    this.vy += Math.sin(angle) * speed * 0.1;

    // Limit velocity
    const maxSpeed = 4;
    const speedMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speedMag > maxSpeed) {
      this.vx = (this.vx / speedMag) * maxSpeed;
      this.vy = (this.vy / speedMag) * maxSpeed;
    }

    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  wrap(width, height) {
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
}

// Main application
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const perlin = new PerlinNoise();

let particles = [];
let animationFrameId = null;
let config = {
  particleCount: 3000,
  noiseScale: 0.005,
  speed: 1.0,
  zOffset: 0,
  zIncrement: 0.002
};

// High DPI canvas setup
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  // Reinitialize particles after resize
  initParticles();
}

function initParticles() {
  particles = [];
  const width = window.innerWidth;
  const height = window.innerHeight;
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle(width, height));
  }
}

function animate() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Semi-transparent fade for trail effect
  ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    // Get Perlin noise angle
    const angle = perlin.noise(
      particle.x * config.noiseScale,
      particle.y * config.noiseScale,
      config.zOffset
    ) * Math.PI * 4;

    particle.update(angle, config.speed);
    particle.wrap(width, height);

    // Gradient color based on position
    const hue = (particle.x / width * 360 + config.zOffset * 1000) % 360;
    const alpha = 0.4 + (Math.sin(config.zOffset + particle.x * 0.01) + 1) * 0.3;
    ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
    ctx.lineWidth = 1.5;

    // Draw trail
    if (particle.history.length > 1) {
      ctx.beginPath();
      for (let j = 0; j < particle.history.length; j++) {
        const p = particle.history[j];
        if (j === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }
  }

  config.zOffset += config.zIncrement;
  animationFrameId = requestAnimationFrame(animate);
}

function resetAnimation() {
  config.zOffset = 0;
  initParticles();
}

// Event listeners for controls
const particleCountSlider = document.getElementById('particleCount');
const noiseScaleSlider = document.getElementById('noiseScale');
const speedSlider = document.getElementById('speed');
const resetBtn = document.getElementById('resetBtn');

const particleCountValue = document.getElementById('particleCountValue');
const noiseScaleValue = document.getElementById('noiseScaleValue');
const speedValue = document.getElementById('speedValue');

particleCountSlider.addEventListener('input', (e) => {
  config.particleCount = parseInt(e.target.value);
  particleCountValue.textContent = config.particleCount;
  initParticles();
});

noiseScaleSlider.addEventListener('input', (e) => {
  config.noiseScale = parseFloat(e.target.value);
  noiseScaleValue.textContent = config.noiseScale.toFixed(3);
});

speedSlider.addEventListener('input', (e) => {
  config.speed = parseFloat(e.target.value);
  speedValue.textContent = config.speed.toFixed(1);
});

resetBtn.addEventListener('click', resetAnimation);

window.addEventListener('resize', resize);

// Initialize
resize();
initParticles();
animationFrameId = requestAnimationFrame(animate);

// Cleanup when iframe unmounts
window.addEventListener('beforeunload', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

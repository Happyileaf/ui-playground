// Perlin Noise Flow Field
// Based on the 3D Perlin Noise algorithm by Ken Perlin

class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,147,47,2,192,213,11,
      192,255,156,38,174,220,76,130,110,101,47,149,
      168,16,104,150,45,10,126,127,168,33,231,39,
      180,172,98,114,172,187,147,87,247,162,5,219,
      211,68,82,40,240,22,191,175,88,237,149,56,
      117,121,99,114,106,15,32,54,42,165,63,56,
      65,126,115,6,183,179,0,196,31,125,52,174,
      66,141,71,90,168,147,84,174,164,48,44,
      212,140,85,186,79,134,162,9,213,14,165,
      189,199,14,42,150,77,71,124,216,188,
      141,134,236,156,127,19,166,37,23,
      146,203,191,137,109,128,103,152,
      14,217,206,105,92,20,219,105,128,
      195,78,60,211,129,133,31,41,
      152,145,94,159,17,216,55,58,
      181,146,13,49,69,29,170,201,
      129,107,72,103,139,158,177,36,
      134,151,27,65,156,182,123,30,
      212,97,218,119,111,14,103,102,
      159,162,59,25,80,135,208,198,
      128,124,232,17,90,102,108,110,
      166,40,80,150,193,9,79,198,15,
      196,171,143,10,199,35,50,145,
      244,165,70,39,129,14,128,113,
      158,102,221,154,21,205,142,
      190,224,195,220,71,140,185,
      168,109,161,156,64,143,167,
      92,146,116,119,153,142,18,
      200,215,108,118,206,164,145,
      165,32,12,203,83,90,28,180,
      71,11,129,162,64,176,100,
      210,75,13,141,207,109,101,
      193,135,186,7,81,194,215,
      15,191,143,14,197,16,138,
      50,59,29,170,208,186,20,
      149,136,160,181,85,161,20,
      157,181,64,9,46,33,101,116,
      129,210,90,236,76,63,133,
      114,155,55,121,81,144,137,
      128,110,148,131,34,176,
      159,19,89,98,108,100,130,
      187,169,190,124,31,61,175,
      2,200,140,57,72,171,159,
      83,78,107,192,158,194,175,
      187,34,171,138,169,128,150,
      98,189,173,218,122,109,200,
      100,91,159,59,105,153,140,
      201,129,86,196,51,64,147,
      209,218,25,66,52,138,149,
      84,171,14,140,213,26,120,
      55,170,182,112,126,154,
      165,56,198,178,188,203,
      111,209,150,160,179,67,
      2,240,184,91,129,78,142,
      209,102,100,107,33,156,
      82,142,21,29,97,35,48,
      207,25,120,113,212,137,
      188,127,126,114,161,149,
      226,202,131,66,104,96,
      240,10,86,171,160,214,
      162,158,109,148,203,141,
    ];

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

// Main Flow Field Implementation
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const perlin = new PerlinNoise();
let animationFrameId = null;

// Configuration
const config = {
  particleCount: 2000,
  noiseScale: 0.003,
  noiseZIncrement: 0.002,
  speedMultiplier: 1.2,
  lineWidth: 0.8,
  fadeAlpha: 0.02
};

let particles = [];
let zOffset = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  // Reinitialize particles on resize
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0
    });
  }
}

function draw() {
  // Fade out previous frame for trailing effect
  ctx.fillStyle = `rgba(10, 10, 10, ${config.fadeAlpha})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach(particle => {
    // Get angle from Perlin noise
    const angle = perlin.noise(
      particle.x * config.noiseScale,
      particle.y * config.noiseScale,
      zOffset
    ) * Math.PI * 2;

    // Update velocity based on noise direction
    particle.vx = Math.cos(angle) * config.speedMultiplier;
    particle.vy = Math.sin(angle) * config.speedMultiplier;

    // Draw particle trail
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    particle.x += particle.vx;
    particle.y += particle.vy;
    ctx.lineTo(particle.x, particle.y);

    // Color based on angle
    const hue = ((angle / (Math.PI * 2)) * 360 + Date.now() / 100) % 360;
    ctx.strokeStyle = `hsla(${hue}, 85%, 65%, 0.8)`;
    ctx.lineWidth = config.lineWidth;
    ctx.stroke();

    // Wrap around edges
    if (particle.x < 0) particle.x = window.innerWidth;
    if (particle.x > window.innerWidth) particle.x = 0;
    if (particle.y < 0) particle.y = window.innerHeight;
    if (particle.y > window.innerHeight) particle.y = 0;
  });

  zOffset += config.noiseZIncrement;
  animationFrameId = requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
animationFrameId = requestAnimationFrame(draw);

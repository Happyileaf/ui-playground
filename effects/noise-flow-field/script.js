// Perlin Noise Flow Field with Interactive Particles
// Based on the principles of algorithmic art and flow field dynamics

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let animationFrameId = null;
let particles = [];
let flowField = [];
let cols = 0;
let rows = 0;
const resolution = 20;
let zOffset = 0;
const zIncrement = 0.002;
const particleCount = 1200;

// Perlin Noise implementation (improved)
class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 127, 32, 140, 47, 231, 117,
      146, 158, 204, 176, 123, 130, 28, 162, 125, 141, 50, 227, 170,
      225, 198, 121, 51, 103, 154, 159, 46, 129, 128, 60, 171, 175,
      152, 166, 140, 85, 63, 173, 139, 80, 147, 101, 42, 164, 145,
      142, 150, 161, 137, 63, 181, 165, 99, 109, 169, 129, 123, 88,
      99, 104, 109, 211, 153, 88, 111, 122, 149, 100, 105, 41, 158,
      213, 158, 141, 164, 194, 116, 145, 30, 110, 45, 82, 179, 121,
      195, 136, 156, 171, 134, 144, 178, 182, 184, 198, 108, 109,
      172, 146, 152, 162, 156, 126, 113, 196, 55, 46, 101, 114, 48,
      155, 140, 105, 129, 49, 156, 68, 127, 144, 105, 133, 150, 152,
      136, 158, 149, 144, 160, 139, 110, 146, 149, 152, 154, 107,
      113, 158, 167, 152, 94, 166, 129, 100, 95, 128, 119, 123, 172,
      159, 167, 43, 172, 142, 156, 85, 128, 106, 149, 160, 139, 199,
      143, 181, 183, 189, 192, 152, 147, 127, 168, 179, 156, 163,
      169, 177, 122, 171, 141, 41, 193, 159, 174, 192, 205, 148,
      182, 143, 188, 114, 152, 110, 162, 157, 158, 189, 176, 164,
      128, 147, 132, 157, 153, 154, 176, 180, 133, 149, 172, 164,
      190, 175, 187, 168, 170, 185, 184, 175, 145, 194, 156, 150,
      148, 135, 168, 144, 176, 165, 164, 104, 148, 163, 33, 117,
      49, 161, 144, 80, 169, 183, 144, 156, 122, 105, 161, 31, 160,
      130, 188, 159, 160, 169, 145, 183, 196, 148, 152, 140, 129,
      156, 88, 124, 61, 143, 159, 174, 179, 153, 187, 36, 25, 101,
      157, 161, 135, 142, 54, 48, 146, 161, 71, 158, 159, 162, 175,
      141, 163, 151, 187, 35, 153, 145, 113, 60, 148, 159, 155, 140,
      142, 153, 156, 127, 128, 195, 148, 149, 154, 140, 203, 168,
      141, 144, 164, 172, 185, 147, 188, 186, 208, 178, 136, 143,
      189, 199, 157, 178, 160, 133, 126, 146, 152, 150, 158, 159,
      186, 190, 153, 165, 170, 151, 155, 158, 179, 156, 134, 160,
      169, 152, 167, 141, 125, 156, 180, 138, 153, 151, 161, 162,
      150, 165, 170, 156, 199, 155, 119, 143, 160, 170, 153, 174,
      152, 140, 158, 141, 150, 105, 134, 162, 167, 136, 147, 156,
      172, 152, 159, 139, 145, 158, 152, 138, 150, 149, 153, 166,
      178, 159, 148, 149, 144, 138, 171, 153, 156, 158, 156, 128,
      120, 135, 150, 148, 159, 163, 150, 147, 152, 151, 149, 169,
      149, 163, 156, 161, 144, 140, 158, 131, 144, 142, 143, 126,
      151, 159, 161, 143, 158, 160, 167, 131, 140, 148, 163, 160,
      151, 145, 144, 188, 169, 158, 156, 162, 153, 159, 152, 162,
      168, 157, 126, 143, 163, 159, 165, 154, 129, 152, 159, 148,
      154, 157, 155, 136, 157, 163, 139, 158, 149, 146, 164, 162,
      149, 152, 144, 159, 166, 159, 146, 149, 150, 142
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

const perlin = new PerlinNoise();

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  cols = Math.floor(window.innerWidth / resolution);
  rows = Math.floor(window.innerHeight / resolution);
  initFlowField();
  initParticles();
}

function initFlowField() {
  flowField = [];
  let xOff = 0;
  for (let x = 0; x < cols; x++) {
    flowField[x] = [];
    let yOff = 0;
    for (let y = 0; y < rows; y++) {
      const angle = perlin.noise(xOff, yOff, zOffset) * Math.PI * 4;
      const vector = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      flowField[x][y] = vector;
      yOff += 0.1;
    }
    xOff += 0.1;
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      prevX: 0,
      prevY: 0,
      maxSpeed: 1.5 + Math.random() * 1.5
    });
  }
}

function updateFlowField() {
  let xOff = 0;
  for (let x = 0; x < cols; x++) {
    let yOff = 0;
    for (let y = 0; y < rows; y++) {
      const angle = perlin.noise(xOff, yOff, zOffset) * Math.PI * 4;
      flowField[x][y].x = Math.cos(angle);
      flowField[x][y].y = Math.sin(angle);
      yOff += 0.1;
    }
    xOff += 0.1;
  }
  zOffset += zIncrement;
}

class Particle {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.prevX = this.x;
    this.prevY = this.y;
    this.maxSpeed = 1.5 + Math.random() * 1.5;
  }

  follow(flowField) {
    const col = Math.floor(this.x / resolution);
    const row = Math.floor(this.y / resolution);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const force = flowField[col][row];
      this.x += force.x * this.maxSpeed;
      this.y += force.y * this.maxSpeed;
    }
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
  }

  edges() {
    if (this.x > window.innerWidth) {
      this.x = 0;
      this.prevX = this.x;
    }
    if (this.x < 0) {
      this.x = window.innerWidth;
      this.prevX = this.x;
    }
    if (this.y > window.innerHeight) {
      this.y = 0;
      this.prevY = this.y;
    }
    if (this.y < 0) {
      this.y = window.innerHeight;
      this.prevY = this.y;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function draw() {
  // Semi-transparent background for trail effect
  ctx.fillStyle = 'rgba(10, 10, 18, 0.1)';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  updateFlowField();

  particles.forEach(particle => {
    particle.update();
    particle.follow(flowField);
    particle.edges();
    particle.draw();
  });

  animationFrameId = requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
initFlowField();

// Initialize particles array with Particle instances
particles = [];
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

ctx.fillStyle = '#0a0a12';
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
animationFrameId = requestAnimationFrame(draw);

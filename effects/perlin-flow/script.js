// Perlin Noise Flow Field
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let animationFrameId = null;

// Improved Perlin Noise implementation
class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,127,32,240,
      161,12,247,157,187,134,140,47,227,147,
      26,102,117,20,125,211,63,88,253,
      48,171,12,82,149,218,158,217,24,
      172,132,140,207,16,216,28,59,200,
      145,13,123,177,0,160,149,61,
      109,89,18,165,162,150,104,112,
      92,46,203,190,110,198,108,100,
      159,181,116,231,56,148,174,128,
      103,73,153,88,101,155,167,4,
      234,170,188,111,54,221,17,
      164,29,236,202,219,26,113,28,
      121,3,90,212,209,182,146,176,
      180,120,230,45,105,92,239,
      205,210,148,144,173,85,129,2,
      197,76,62,250,204,224,107,
      192,57,74,106,166,30,67,126,
      183,156,206,196,124,136,195,
      84,208,2,182,110,147,238,
      168,139,175,18,163,237,15,
      213,152,135,226,200,66,52,
      133,69,241,154,169,70,179,
      40,208,222,138,141,178,186,
      3,100,109,250,199,34,25,
      130,114,184,146,42,172,9,
      222,159,14,87,2,120,61,
      235,50,143,129,229,94,193,
      214,150,12,243,191,29,185,
      79,60,139,194,213,99,142,70,
      12,189,138,18,158,228,152,
      84,122,40,169,72,180,198,
      68,156,107,114,41,19,105,
      127,45,184,140,211,153,51,
      98,162,231,19,215,142,123,
      44,97,79,10,166,35,64,57,
      232,108,212,115,24,201,126,
      52,163,69,246,124,80,237,
      38,167,49,248,63,145,75,
      83,195,39,44,55,119,17,
      65,153,143,89,29,169,210,
      199,122,234,178,188,32,148,
      94,93,205,11,214,58,220,
      234,108,169,48,126,172,37,
      21,189,106,214,74,219,76,
      26,207,145,41,99,198,81,
      184,170,108,115,4,69,52,
      158,116,141,211,129,140,202,
      196,128,204,64,223,212,192,
      141,125,109,171,248,155,111,
      22,143,86,118,186,234,225,
      112,107,3,215,154,35,168,
      226,120,216,119,245,80,181,
      163,220,77,206,205,189,65,
      5,170,241,96,110,188,1,
      250,60,130,43,182,179,252,
      77,185,102,119,122,159,150,
      251,118,164,7,238,149,23,
      217,207,31,135,200,16,225,
      249,254,142,187,49,16,144,
      190,213,208,244,65,229,247,
      180,132,166,113,43,141,221,
      204,150,218,105,242,117,
      193,226,35,203,232,192,107,
      219,22,75,85,191,243,55,
      231,34,116,228,253,224,129,
      14,201,29,101,123,91,24,
      236,151,78,209,15,100,90,
      6,0,81,168,251,127,
      112,58,47,11,134,70,245,
      78,152,31,244,215,146,194,
      16,208,185,94,37,98,248,
      200,67,104,88,148,1,65,
      49,103,83,156,240,227,230,
      115,10,188,106,162,36,
      210,203,246,225,183,33,
      39,154,180,109,176,191,
      93,218,11,197,237,42,
      121,252,157,206,173,151,
      114,239,202,144,100,62,
      51,177,231,3,105,97,
      80,224,27,55,104,87,
      137,36,217,171,129,199,
      182,136,68,105,3,85,
      42,28,11,15,25,70,
      82,146,134,248,180,190,
      210,108,175,196,43,59,
      193,211,147,241,222,142,
      100,189,161,150,21,239,
      233,242,245,185,72,64,
      118,140,214,165,247,50,
      198,110,208,99,55,223,
      179,167,174,124,189,204,
      152,71,169,144,202,177,
      138,252,2,122,38,73,
      95,54,86,183,63,145,
      130,196,188,24,199,171,
      72,163,45,226,6,102,
      83,159,119,139,192,142,
      207,98,28,166,170,213,
      212,220,251,165,158,64,
      4,104,53,30,228,186,
      194,9,71,57,239,128,
      195,81,131,185,221,124,
      75];
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

  octaveNoise(x, y, octaves, persistence, scale) {
    let total = 0;
    let frequency = scale;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, 0) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxValue;
  }
}

// Particle class for flow field
class Particle {
  constructor(x, y) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.maxSpeed = 2;
    this.hue = Math.random() * 360;
  }

  follow(flowField, cols, rows, scale) {
    const x = Math.floor(this.pos.x / scale);
    const y = Math.floor(this.pos.y / scale);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      const force = flowField[y * cols + x];
      this.applyForce(force);
    }
  }

  applyForce(force) {
    this.acc.x += force.x;
    this.acc.y += force.y;
  }

  update() {
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    if (this.vel.x > this.maxSpeed) this.vel.x = this.maxSpeed;
    if (this.vel.y > this.maxSpeed) this.vel.y = this.maxSpeed;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  edges(width, height) {
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, 0.6)`;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Flow Field setup
const perlin = new PerlinNoise();
let particles = [];
let flowField = [];
let cols, rows;
const scl = 10; // scale of each grid cell
const zoffIncrement = 0.003; // how fast the flow animates
let zoff = 0;

let mousePos = { x: 0, y: 0 };
let isMouseDown = false;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  cols = Math.floor(window.innerWidth / scl);
  rows = Math.floor(window.innerHeight / scl);

  // Clear and recreate particles
  particles = [];
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 12);
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    particles.push(new Particle(x, y));
  }
}

function updateFlowField() {
  flowField = [];
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      const angle = perlin.octaveNoise(xoff, yoff + zoff, 4, 0.5, 0.1) * Math.PI * 2;
      const length = 1.5;
      const vx = Math.cos(angle) * length;
      const vy = Math.sin(angle) * length;

      // Add mouse influence when dragging
      if (isMouseDown) {
        const cellX = x * scl + scl / 2;
        const cellY = y * scl + scl / 2;
        const dx = cellX - mousePos.x;
        const dy = cellY - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100 * 0.8;
          const repelX = dx / dist * force;
          const repelY = dy / dist * force;
          flowField.push({ x: vx + repelX, y: vy + repelY });
        } else {
          flowField.push({ x: vx, y: vy });
        }
      } else {
        flowField.push({ x: vx, y: vy });
      }
      xoff += 0.1;
    }
    yoff += 0.1;
  }
  zoff += zoffIncrement;
}

function animate() {
  // Semi-transparent background for trail effect
  ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  updateFlowField();

  // Update and draw particles
  particles.forEach(particle => {
    particle.follow(flowField, cols, rows, scl);
    particle.update();
    particle.edges(window.innerWidth, window.innerHeight);
    particle.draw(ctx);
  });

  animationFrameId = requestAnimationFrame(animate);
}

// Event listeners
window.addEventListener('resize', resize);

canvas.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// Touch support for mobile
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  mousePos.x = touch.clientX;
  mousePos.y = touch.clientY;
  isMouseDown = true;
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  mousePos.x = touch.clientX;
  mousePos.y = touch.clientY;
  isMouseDown = true;
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isMouseDown = false;
});

// Initialize and start
resize();
animate();

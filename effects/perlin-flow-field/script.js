// Perlin Noise Flow Field Particle Animation
// Pure native JavaScript - no external dependencies
// Based on improved Perlin noise implementation

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

// Improved Perlin Noise implementation
class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 127, 32, 147, 29, 1, 4,
      149, 248, 12, 239, 175, 37, 165, 146, 60, 218, 206, 140, 86, 198, 124, 17,
      182, 189, 172, 223, 219, 117, 26, 118, 107, 112, 90, 103, 190, 123, 10,
      190, 138, 163, 246, 170, 231, 152, 102, 167, 157, 199, 121, 196, 178,
      175, 121, 158, 164, 114, 141, 41, 237, 215, 122, 191, 179, 131, 111,
      178, 170, 134, 102, 108, 109, 104, 171, 245, 145, 146, 151, 186, 77,
      200, 193, 119, 111, 144, 190, 15, 160, 140, 128, 204, 88, 4, 146, 48,
      134, 72, 90, 180, 56, 136, 80, 139, 101, 189, 31, 141, 55, 148, 127,
      40, 172, 93, 146, 158, 82, 148, 234, 177, 62, 94, 172, 213, 114, 124,
      218, 48, 108, 111, 104, 43, 52, 161, 133, 226, 69, 152, 43, 251, 199,
      178, 186, 85, 160, 214, 72, 89, 255, 98, 112, 180, 146, 108, 152, 64,
      220, 193, 175, 74, 165, 149, 141, 41, 145, 66, 230, 157, 191, 149,
      162, 176, 125, 185, 241, 96, 5, 204, 150, 208, 166, 198, 92, 146, 240,
      63, 161, 164, 68, 109, 154, 42, 109, 223, 196, 122, 95, 126, 118, 255,
      82, 121, 179, 106, 100, 108, 186, 90, 149, 211, 144, 209, 171, 146,
      165, 200, 181, 192, 81, 16, 78, 239, 132, 116, 29, 66, 137, 114, 122,
      128, 151, 203, 219, 55, 210, 148, 144, 50, 139, 132, 85, 69, 203, 145
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
    z = z || 0;
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
    const B = this.p[X + 1] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.maxSpeed = 2;
    this.color = this.getRandomColor();
  }

  getRandomColor() {
    const hue = Math.random() * 360;
    const saturation = 60 + Math.random() * 30;
    const lightness = 50 + Math.random() * 20;
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
  }

  update(flowField, noise, time) {
    const angle = noise.noise(this.x / 40, this.y / 40, time / 10) * Math.PI * 2;
    this.accelerationX = Math.cos(angle) * 0.3;
    this.accelerationY = Math.sin(angle) * 0.3;

    this.velocityX += this.accelerationX;
    this.velocityY += this.accelerationY;

    // Dampen velocity
    this.velocityX *= 0.98;
    this.velocityY *= 0.98;

    // Clamp max speed
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    if (speed > this.maxSpeed) {
      this.velocityX = (this.velocityX / speed) * this.maxSpeed;
      this.velocityY = (this.velocityY / speed) * this.maxSpeed;
    }

    this.x += this.velocityX;
    this.y += this.velocityY;

    // Wrap around edges
    if (this.x < 0) this.x = canvas.width / dpr;
    if (this.x > canvas.width / dpr) this.x = 0;
    if (this.y < 0) this.y = canvas.height / dpr;
    if (this.y > canvas.height / dpr) this.y = 0;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const noise = new PerlinNoise();
let particles = [];
let time = 0;
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  // Reinitialize particles on resize
  particles = [];
  const spacing = 8;
  const cols = Math.floor(window.innerWidth / spacing);
  const rows = Math.floor(window.innerHeight / spacing);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * spacing + spacing / 2;
      const y = j * spacing + spacing / 2;
      particles.push(new Particle(x, y));
    }
  }
}

function animate() {
  // Semi-transparent background for trail effect
  ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
  ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  // Update and draw all particles
  for (const particle of particles) {
    particle.update(noise, noise, time);
    particle.draw(ctx);
  }

  time++;
  animationFrameId = requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animationFrameId = requestAnimationFrame(animate);

// Cleanup when iframe is unmounted
window.addEventListener('beforeunload', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

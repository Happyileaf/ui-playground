const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

// Wave simulation parameters
let waves = [];
let particles = [];
const maxWaves = 12;

// High DPI support
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

// Wave class for ripple propagation
class Wave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.4;
    this.opacity = 1;
    this.speed = 2;
    this.createdAt = Date.now();
  }

  update() {
    this.radius += this.speed;
    this.opacity = 1 - (this.radius / this.maxRadius);
    return this.opacity > 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x / (window.devicePixelRatio || 1), this.y / (window.devicePixelRatio || 1), this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(99, 102, 241, ${this.opacity * 0.6})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x / (window.devicePixelRatio || 1), this.y / (window.devicePixelRatio || 1), this.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(139, 92, 246, ${this.opacity * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Particle for enhanced visual effect
class Particle {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
    this.baseY = this.y;
  }

  update(waves) {
    // Apply wave influence
    for (const wave of waves) {
      const dx = this.x - wave.x / (window.devicePixelRatio || 1);
      const dy = this.y - wave.y / (window.devicePixelRatio || 1);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - Math.abs(dist - wave.radius) / 40) * wave.opacity * 10;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * influence * 0.3;
      this.y += Math.sin(angle) * influence * 0.3;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around
    if (this.x < 0) this.x = window.innerWidth;
    if (this.x > window.innerWidth) this.x = 0;
    if (this.y < 0) this.y = window.innerHeight;
    if (this.y > window.innerHeight) this.y = 0;
  }

  draw() {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize particles
function initParticles() {
  particles = [];
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
  for (let i = 0; i < Math.min(particleCount, 200); i++) {
    particles.push(new Particle());
  }
}

initParticles();
window.addEventListener('resize', initParticles);

// Create new wave on click/tap
function createWave(x, y) {
  if (waves.length >= maxWaves) {
    waves.shift();
  }
  waves.push(new Wave(x * (window.devicePixelRatio || 1), y * (window.devicePixelRatio || 1)));
}

canvas.addEventListener('click', (e) => {
  createWave(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  createWave(touch.clientX, touch.clientY);
});

// Animation loop
function animate() {
  // Clear with slight fade for trail effect
  ctx.fillStyle = 'rgba(10, 14, 39, 0.15)';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Update and draw particles
  for (const particle of particles) {
    particle.update(waves);
    particle.draw();
  }

  // Update and draw waves
  waves = waves.filter(wave => {
    const alive = wave.update();
    if (alive) {
      wave.draw();
    }
    return alive;
  });

  animationFrameId = requestAnimationFrame(animate);
}

// Start animation
animationFrameId = requestAnimationFrame(animate);

// Cleanup when iframe unmounts
window.addEventListener('beforeunload', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

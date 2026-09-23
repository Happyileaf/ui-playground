// Perlin Noise Implementation
class PerlinNoise {
  constructor() {
    this.p = new Array(512);
    this.permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 190, 6,
      147, 103, 30, 1, 149, 18, 165, 156, 137, 135, 249, 124, 20, 150, 141, 70, 180,
      181, 154, 87, 164, 27, 90, 156, 54, 5, 216, 185, 148, 169, 121, 192, 210, 108,
      102, 51, 5, 48, 177, 31, 28, 72, 156, 179, 201, 138, 140, 159, 117, 136, 1, 209,
      63, 56, 86, 53, 147, 172, 114, 169, 174, 43, 172, 109, 165, 158, 92, 161, 50,
      133, 231, 41, 55, 210, 171, 157, 167, 4, 234, 177, 101, 213, 139, 151, 25, 163,
      93, 152, 167, 123, 114, 51, 125, 163, 153, 117, 16, 128, 105, 92, 50, 228, 146,
      152, 148, 44, 170, 132, 171, 102, 150, 145, 230, 65, 146, 149, 204, 205, 152, 196,
      90, 221, 111, 140, 199, 35, 134, 78, 172, 188, 142, 234, 19, 109, 176, 56, 81, 168,
      59, 144, 2, 164, 65, 19, 101, 129, 45, 168, 32, 118, 156, 102, 164, 97, 0, 192,
      62, 100, 90, 161, 91, 198, 159, 56, 113, 140, 149, 45, 80, 161, 125, 54, 180,
      173, 119, 23, 119, 141, 114, 129, 120, 145, 90, 135, 110, 121, 70, 101, 116,
      139, 50, 153, 109, 117, 211, 136, 120, 73, 116, 249, 120, 191, 105, 124, 90, 68, 109,
      130, 172, 175, 152, 163, 76, 103, 170, 98, 157, 160, 197, 176, 35, 171, 171, 205,
      95, 208, 198, 102, 108, 166, 172, 207, 201, 56, 200, 161, 136, 131, 18, 204, 177, 194,
      175, 158, 211, 166, 151, 105, 12, 92, 48, 142, 145, 165, 29, 136, 105, 141, 59, 132,
      47, 139, 55, 149, 167, 156, 6, 170, 61, 151, 141, 85, 137, 126, 109, 115, 150, 153,
      157, 190, 164, 100, 99, 145, 232, 17, 38, 49, 21, 111, 146, 35, 103, 149, 58, 174,
      69, 134, 178, 184, 208, 72, 170, 189, 141, 198, 120, 3, 195, 190, 126, 206, 186, 185,
      141, 105, 201, 129, 34, 252, 185, 162, 59, 82, 154, 201, 121, 165, 165, 214, 173,
      145, 135, 167, 5, 193, 171, 152, 145, 208, 154, 96, 102, 108, 194, 232, 180, 137, 134,
      194, 101, 148, 153, 140, 207, 156, 132, 162, 163, 214, 215, 205, 125, 81, 127, 131, 21,
      150, 102, 164, 92, 181, 179, 168, 208, 110, 208, 202, 107, 204, 116, 70, 227, 200,
      138, 213, 95, 96, 53, 4, 129, 22, 140, 67, 19, 160, 35, 130, 113, 100, 203, 65, 156,
      115, 5, 206, 190, 143, 193, 123, 31, 218, 146, 152, 173, 187, 37, 15, 171, 170, 124,
      150, 148, 31, 209, 134, 152, 104, 107, 176, 130, 50, 167, 133, 148, 182, 156, 16, 100,
      145, 219, 229, 105, 123, 171, 45, 182, 138, 173, 183, 185, 205, 95, 107, 159, 136, 186,
      150, 212, 100, 109, 177, 111, 199, 130, 20, 190, 163, 188, 102, 160, 203, 194, 214, 198,
      157, 28, 128, 155, 224, 245, 34, 247, 191, 127, 111, 191, 156, 19, 126, 110, 93, 180,
      190, 183, 179, 105, 188, 179, 142, 136, 182, 155, 213, 196, 123, 248, 203, 191, 213, 220,
      130, 115, 96, 124, 195, 219, 165, 152, 218, 134, 233, 100, 131, 104, 123, 1, 196, 0, 192,
      171, 251, 196, 125, 158, 238, 149, 151, 194, 219, 215, 160, 185, 17, 42, 140, 199, 115, 159,
      88, 83, 147, 141, 110, 131, 158, 170, 112, 88, 183, 175, 95, 214, 196, 42, 127, 122, 95,
      218, 191, 242, 75, 206, 138, 176, 120, 196, 226, 119, 113, 181, 164, 179, 153, 176, 171,
      225, 121, 229, 155, 108, 211, 158, 104, 163, 50, 137, 224, 127, 34, 142, 157, 181, 191,
      199, 135, 141, 38, 144, 171, 119, 186, 172, 163, 220, 212, 150, 77, 82, 145, 241, 154,
      165, 181, 230, 205, 90, 65, 89, 168, 210, 216, 126, 157, 168, 165, 204, 109, 149, 210,
      102, 168, 157, 227, 55, 64, 106, 162, 3, 118, 161, 67, 103, 68, 240, 128, 133, 102, 210, 66,
      120, 38, 184, 228, 94, 118, 126, 102, 208, 156, 201, 154, 98, 193, 170, 149, 210, 107,
      218, 201, 51, 127, 190, 168, 139, 178, 106, 110, 214, 158, 66, 134, 67, 207, 221, 158,
      200, 119, 154, 109, 133, 140, 159, 164, 175, 200, 189, 124, 131, 146, 158, 185, 193,
      201, 167, 108, 179, 64, 184, 209, 134, 183, 106, 153, 90, 184, 199, 125, 46, 33, 25,
      101, 133, 161, 1, 109, 162, 100, 151, 89, 163, 227, 189, 197, 170, 88, 160, 141, 209, 207,
      156, 132, 108, 148, 136, 101, 140, 22, 145, 208, 109, 121, 51, 84, 53, 159, 169, 152,
      62, 143, 15, 161, 113, 181, 10, 140, 159, 203, 194, 216, 59, 84, 89, 195, 117, 147,
      203, 112, 183, 200, 157, 7, 186, 168, 170, 240, 143, 141, 55, 170, 164, 43, 202, 120,
      175, 210, 100, 131, 67, 135, 181, 124, 103, 172, 199, 112, 151, 221, 196, 168, 140, 181,
      184, 180, 131, 114, 122, 140, 159, 163, 158, 231, 214, 180, 124, 37, 4, 92, 203, 150,
      141, 110, 159, 134, 154, 140, 235, 170, 165, 19, 69, 189, 188, 63, 208, 207, 144, 202,
      162, 121, 157, 187, 223, 174, 185, 114, 161, 159, 205, 182, 183, 136, 134, 169, 178,
      126, 111, 179, 189, 147, 198, 192, 155, 161, 175, 114, 111, 170, 98, 205, 144, 88, 241,
      136, 223, 118, 145, 130, 155, 173, 188, 166, 190, 149, 226, 150, 103, 146, 209, 203, 138,
      226, 150, 165, 192, 146, 91, 234, 30, 181, 162, 153, 156, 76, 200, 211, 193, 180, 147,
      105, 169, 191, 156, 115, 110, 169, 150, 170, 215, 193, 189, 139, 146, 128, 162, 35, 149,
      198, 211, 136, 148, 149, 156, 162, 117, 115, 110, 99, 198, 161, 2, 56, 88, 98, 40, 121,
      64, 52, 210, 105, 59, 152, 34, 248, 170, 209, 108, 155, 131, 212, 152, 124, 236, 235, 180,
      163, 150, 149, 222, 179, 107, 148, 153, 191, 143, 141, 118, 212, 159, 160, 87, 174, 249,
      210, 181, 159, 127, 2, 121, 33, 225, 248, 170, 100, 219, 183, 18, 158, 154, 19, 106,
      169, 25, 108, 231, 94, 160, 244, 208, 240, 36, 147, 199, 169, 48, 113, 204, 221, 204, 80,
      81, 126, 145, 218, 221, 139, 217, 29, 165, 52, 146, 210, 182, 186, 179, 234, 90, 188, 118,
      199, 136, 209, 219, 113, 91, 180, 139, 175, 104, 165, 31, 148, 161, 179, 82, 186, 90, 147,
      41, 150, 221, 164, 219, 21, 68, 150, 226, 165, 214, 152, 163, 164, 179, 183, 81, 12, 104,
      76, 52, 44, 217, 203, 155, 33, 80, 159, 82, 112, 63, 175, 14, 211, 140, 197, 16, 15, 22, 144,
      216, 183, 62, 44, 101, 117, 164, 4, 127, 115, 6, 20, 219, 152, 85, 232, 118, 212, 167, 20,
      155, 111, 91, 56, 181, 46, 2, 127, 153, 187, 101, 153, 137, 126, 100, 108, 163, 15, 188,
      208, 196, 143, 145, 117, 153, 178, 138, 109, 123, 91, 110, 90, 180, 120, 140, 0, 126, 104,
      100, 231, 111, 90, 136, 139, 129, 149, 176, 165, 184, 107, 104, 109, 189, 178, 113, 197, 189,
      141, 160, 188, 139, 101, 106, 163, 205];

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

  grad(hash, x) {
    let h = hash & 15;
    let grad = 1 + (h & 7);
    if ((h & 1) !== 0) grad = -grad;
    return grad * x;
  }

  noise(x) {
    let X = Math.floor(x) & 255;
    x -= Math.floor(x);
    let u = this.fade(x);
    return this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1));
  }

  noise2D(x, y) {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    let u = this.fade(x);
    let v = this.fade(y);
    let A = this.p[X] + Y;
    let B = this.p[X + 1] + Y;
    return this.lerp(v,
      this.lerp(u, this.grad(this.p[A], x), this.grad(this.p[B], x - 1)),
      this.lerp(u, this.grad(this.p[A + 1], x), this.grad(this.p[B + 1], x - 1))
    );
  }
}

// Main Application
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const perlin = new PerlinNoise();

// Settings
let config = {
  lineCount: 12,
  amplitude: 80,
  frequency: 0.05,
  speed: 0.003
};

let animationFrameId = null;
let time = 0;

// Canvas responsive resize
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

// Draw animated wavy lines
function draw() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Clear canvas
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, width, height);

  const stepY = height / (config.lineCount + 1);

  for (let lineIndex = 0; lineIndex < config.lineCount; lineIndex++) {
    const baseY = stepY * (lineIndex + 1);
    const hue = 220 + (lineIndex * 10);
    const saturation = 80;
    const lightness = 40 + (lineIndex * 3);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;

    for (let x = 0; x <= width; x += 2) {
      const noiseValue = perlin.noise2D(x * config.frequency, (lineIndex * 10) + (time * 100));
      const y = baseY + noiseValue * config.amplitude;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Add glow effect
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.1)`;
    ctx.stroke();
  }

  time += config.speed;
  animationFrameId = requestAnimationFrame(draw);
}

// Start animation
animationFrameId = requestAnimationFrame(draw);

// Control Panel Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const controlDock = document.querySelector('.control-dock');
  const lineCountEl = document.getElementById('lineCount');
  const amplitudeEl = document.getElementById('amplitude');
  const frequencyEl = document.getElementById('frequency');
  const speedEl = document.getElementById('speed');
  const resetBtn = document.getElementById('resetBtn');

  const lineCountValue = document.getElementById('lineCountValue');
  const amplitudeValue = document.getElementById('amplitudeValue');
  const frequencyValue = document.getElementById('frequencyValue');
  const speedValue = document.getElementById('speedValue');

  // Toggle panel visibility with H/Esc
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlDock.classList.toggle('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H' || e.key === 'Escape') {
      controlDock.classList.toggle('hidden');
    }
  }, { passive: true });

  // Update parameters
  function updateDisplay() {
    lineCountValue.textContent = config.lineCount;
    amplitudeValue.textContent = config.amplitude;
    frequencyValue.textContent = config.frequency.toFixed(2);
    speedValue.textContent = config.speed.toFixed(3);
  }

  lineCountEl.addEventListener('input', () => {
    config.lineCount = parseInt(lineCountEl.value);
    updateDisplay();
  });

  amplitudeEl.addEventListener('input', () => {
    config.amplitude = parseInt(amplitudeEl.value);
    updateDisplay();
  });

  frequencyEl.addEventListener('input', () => {
    config.frequency = parseFloat(frequencyEl.value);
    updateDisplay();
  });

  speedEl.addEventListener('input', () => {
    config.speed = parseFloat(speedEl.value);
    updateDisplay();
  });

  resetBtn.addEventListener('click', () => {
    config.lineCount = 12;
    config.amplitude = 80;
    config.frequency = 0.05;
    config.speed = 0.003;
    lineCountEl.value = 12;
    amplitudeEl.value = 80;
    frequencyEl.value = 0.05;
    speedEl.value = 0.003;
    updateDisplay();
  });

  updateDisplay();
});

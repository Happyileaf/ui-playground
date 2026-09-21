(function() {
  // Configurable parameters
  let amplitude = 30;
  let frequency = 0.02;
  let speed = 0.005;
  let time = 0;
  let animationFrameId = null;

  // Perlin Noise Implementation
  class PerlinNoise {
    constructor() {
      this.p = new Array(256);
      for (let i = 0; i < 256; i++) {
        this.p[i] = Math.floor(Math.random() * 256);
      }
      for (let i = 0; i < 256; i++) {
        const j = Math.floor(Math.random() * 256);
        [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
      }
    }

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
      return a + t * (b - a);
    }

    grad(hash, x) {
      const h = hash & 15;
      const grad = 1 + (h & 7);
      return ((h & 1) === 0 ? grad : -grad) * x;
    }

    noise(x) {
      const X = Math.floor(x) & 255;
      x -= Math.floor(x);
      const u = this.fade(x);
      return this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1));
    }
  }

  const perlin = new PerlinNoise();

  function getWavyTransform(x, time) {
    return perlin.noise((x * frequency) + (time * speed * 1000)) * amplitude;
  }

  function updateWavyText(element) {
    const text = element.dataset.text;
    const topHalf = element.querySelector('.top-half');
    const bottomHalf = element.querySelector('.bottom-half');
    
    if (!topHalf || !bottomHalf) return;
    
    const characters = text.split('');
    let offset = 0;
    let topTransform = '';
    let bottomTransform = '';
    
    characters.forEach((char, index) => {
      const distortion = getWavyTransform(offset, time);
      topTransform += `translateY(${distortion}px) `;
      bottomTransform += `translateY(${-distortion}px) `;
      offset += 1;
    });
    
    if (topHalf && topHalf.style) {
      topHalf.style.transform = topTransform;
    }
    if (bottomHalf && bottomHalf.style) {
      bottomHalf.style.transform = bottomTransform;
    }
  }

  function initWavyText() {
    const elements = document.querySelectorAll('.wavy-text');
    elements.forEach(element => {
      const text = element.dataset.text;
      element.innerHTML = '';
      
      const topSpan = document.createElement('span');
      topSpan.className = 'top-half';
      topSpan.textContent = text;
      
      const bottomSpan = document.createElement('span');
      bottomSpan.className = 'bottom-half';
      bottomSpan.textContent = text;
      
      element.appendChild(topSpan);
      element.appendChild(bottomSpan);
    });
  }

  function animate() {
    time += 1;
    document.querySelectorAll('.wavy-text').forEach(el => updateWavyText(el, time));
    animationFrameId = requestAnimationFrame(animate);
  }

  function setupControls() {
    const amplitudeInput = document.getElementById('amplitude');
    const frequencyInput = document.getElementById('frequency');
    const speedInput = document.getElementById('speed');
    
    document.getElementById('amplitudeValue').textContent = amplitudeInput.value;
    document.getElementById('frequencyValue').textContent = parseFloat(frequencyInput.value).toFixed(3);
    document.getElementById('speedValue').textContent = parseFloat(speedInput.value).toFixed(3);
    
    amplitudeInput.addEventListener('input', (e) => {
      amplitude = parseFloat(e.target.value);
      document.getElementById('amplitudeValue').textContent = e.target.value;
    });
    
    frequencyInput.addEventListener('input', (e) => {
      frequency = parseFloat(e.target.value);
      document.getElementById('frequencyValue').textContent = parseFloat(frequency).toFixed(3);
    });
    
    speedInput.addEventListener('input', (e) => {
      speed = parseFloat(e.target.value);
      document.getElementById('speedValue').textContent = parseFloat(speed).toFixed(3);
    });
  }

  // Cleanup for iframe unload
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  // Initialize
  initWavyText();
  setupControls();
  animate();
})();

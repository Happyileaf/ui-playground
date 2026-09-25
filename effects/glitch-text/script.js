(function() {
  'use strict';

  // Configuration
  let config = {
    speed: 0.5,
    intensity: 0.3,
    frequency: 0.15,
    colorShift: true
  };

  const glitchText = document.getElementById('glitchText');
  const originalText = glitchText.textContent;
  
  // Create glitch layers
  const cyan = document.createElement('div');
  const magenta = document.createElement('div');
  const yellow = document.createElement('div');
  
  cyan.className = 'glitch-text glitch-layer cyan';
  magenta.className = 'glitch-text glitch-layer magenta';
  yellow.className = 'glitch-text glitch-layer yellow';
  
  cyan.textContent = originalText;
  magenta.textContent = originalText;
  yellow.textContent = originalText;
  
  glitchText.appendChild(cyan);
  glitchText.appendChild(magenta);
  glitchText.appendChild(yellow);

  // Animation state
  let lastTime = 0;
  let glitchState = 0;
  let nextGlitchTime = 0;

  // Glitch effect function
  function glitch(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const baseSpeed = 60 * config.speed;
    const maxOffset = 8 * config.intensity;

    // Randomly trigger glitch effects based on frequency
    if (currentTime > nextGlitchTime) {
      glitchState = Math.random() > config.frequency ? 0 : 1;
      nextGlitchTime = currentTime + (Math.random() * 100 + 50);
    }

    if (glitchState) {
      const offsetX = (Math.random() * 2 - 1) * maxOffset;
      const offsetY = (Math.random() * 2 - 1) * maxOffset * 0.5;

      cyan.style.opacity = '1';
      magenta.style.opacity = '1';
      yellow.style.opacity = '0.8';

      cyan.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      magenta.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
      yellow.style.transform = `translate(${offsetY}px, ${-offsetX}px)`;

      if (config.colorShift) {
        const hue = Math.floor(Math.random() * 360);
        document.documentElement.style.setProperty('--glitch-cyan', `hsl(${hue}, 100%, 50%)`);
        document.documentElement.style.setProperty('--glitch-magenta', `hsl(${(hue + 180) % 360}, 100%, 50%)`);
      }
    } else {
      cyan.style.opacity = '0';
      magenta.style.opacity = '0';
      yellow.style.opacity = '0';
    }

    requestAnimationFrame(glitch);
  }

  // Start animation
  requestAnimationFrame(glitch);

  // --- Micro-HUD Controls ---
  const hudToggle = document.getElementById('hudToggle');
  const controlDock = document.getElementById('controlDock');
  const speedRange = document.getElementById('speedRange');
  const intensityRange = document.getElementById('intensityRange');
  const frequencyRange = document.getElementById('frequencyRange');
  const colorCheckbox = document.getElementById('colorCheckbox');
  const speedValue = document.getElementById('speedValue');
  const intensityValue = document.getElementById('intensityValue');
  const frequencyValue = document.getElementById('frequencyValue');

  function toggleControls(e) {
    e.stopPropagation();
    controlDock.classList.toggle('hidden');
  }

  hudToggle.addEventListener('click', toggleControls);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'Escape') {
      if (!controlDock.classList.contains('hidden')) {
        toggleControls(e);
      }
    }
  });

  // Update values from UI
  speedRange.addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    speedValue.textContent = config.speed.toFixed(2);
  });

  intensityRange.addEventListener('input', (e) => {
    config.intensity = parseFloat(e.target.value);
    intensityValue.textContent = config.intensity.toFixed(2);
  });

  frequencyRange.addEventListener('input', (e) => {
    config.frequency = parseFloat(e.target.value);
    frequencyValue.textContent = config.frequency.toFixed(2);
  });

  colorCheckbox.addEventListener('change', (e) => {
    config.colorShift = e.target.checked;
    if (!config.colorShift) {
      // Reset to default colors
      document.documentElement.style.setProperty('--glitch-cyan', '#0ff');
      document.documentElement.style.setProperty('--glitch-magenta', '#f0f');
    }
  });
})();

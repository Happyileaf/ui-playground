(function() {
  // Configuration
  let config = {
    intensity: 0.5,
    speed: 0.5,
    colorShift: true
  };

  // DOM Elements
  const glitchText = document.getElementById('glitchText');
  const intensitySlider = document.getElementById('intensity');
  const speedSlider = document.getElementById('speed');
  const intensityValue = document.getElementById('intensityValue');
  const speedValue = document.getElementById('speedValue');
  const colorShiftCheckbox = document.getElementById('colorShift');
  const colorShiftValue = document.getElementById('colorShiftValue');
  const toggleButton = document.querySelector('.hud-toggle');
  const controlDock = document.querySelector('.control-dock');

  // Animation frame ID for cleanup
  let animationId = null;
  let baseText = 'GLITCH';
  let originalText = 'GLITCH';

  // Glitch character set for random replacement
  const glitchChars = '!<>[]₩€¥£$@#%&*()_+-=~|`;:,.?';

  function getRandomGlitchChar() {
    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }

  function applyGlitchEffect() {
    if (!glitchText) return;

    const textArr = originalText.split('');
    const glitchCount = Math.floor(config.intensity * textArr.length);

    for (let i = 0; i < glitchCount; i++) {
      const pos = Math.floor(Math.random() * textArr.length);
      textArr[pos] = getRandomGlitchChar();
    }

    glitchText.setAttribute('data-text', textArr.join(''));
    glitchText.textContent = textArr.join('');

    const duration = 50 + (1 - config.speed) * 200;
    animationId = setTimeout(applyGlitchEffect, duration);
  }

  function updateColorShift() {
    if (config.colorShift) {
      glitchText.style.color = '#fff';
    } else {
      glitchText.style.color = 'transparent';
    }
    colorShiftValue.textContent = config.colorShift ? 'On' : 'Off';
  }

  // Event Handlers
  intensitySlider.addEventListener('input', (e) => {
    config.intensity = parseFloat(e.target.value);
    intensityValue.textContent = config.intensity.toFixed(2);
  });

  speedSlider.addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    speedValue.textContent = config.speed.toFixed(2);
  });

  colorShiftCheckbox.addEventListener('change', (e) => {
    config.colorShift = e.target.checked;
    updateColorShift();
  });

  toggleButton.addEventListener('click', (e) => {
    e.stopPropagation();
    controlDock.classList.toggle('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'Escape') {
      controlDock.classList.toggle('hidden');
    }
  });

  document.addEventListener('click', () => {
    if (!controlDock.classList.contains('hidden')) {
      controlDock.classList.add('hidden');
    }
  });

  controlDock.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Start glitch effect
  applyGlitchEffect();
  updateColorShift();

  // Cleanup when iframe is unloaded
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      clearTimeout(animationId);
    }
  });
})();

// Interactive Glitch Text Effect
(function() {
  const glitchText = document.getElementById('glitchCanvas');
  const intensitySlider = document.getElementById('intensitySlider');
  const speedSlider = document.getElementById('speedSlider');
  const intensityValue = document.getElementById('intensityValue');
  const speedValue = document.getElementById('speedValue');

  let intensity = parseFloat(intensitySlider.value);
  let speed = parseFloat(speedSlider.value);
  let animationFrameId = null;
  let isActive = false;
  let lastTime = 0;

  // Set initial text content
  glitchText.setAttribute('data-text', glitchText.textContent.trim());

  // Apply CSS animation duration based on speed
  function updateAnimationSpeed() {
    const duration = (1 - speed + 0.1).toFixed(2);
    glitchText.style.setProperty('--glitch-duration', `${duration}s`);
  }

  // Toggle glitch effect on click
  function toggleGlitch() {
    isActive = !isActive;
    if (isActive) {
      glitchText.classList.add('active');
    } else {
      glitchText.classList.remove('active');
    }
  }

  // Update intensity display
  intensitySlider.addEventListener('input', (e) => {
    intensity = parseFloat(e.target.value);
    intensityValue.textContent = intensity.toFixed(1);
    // Intensity affects the offset
    document.documentElement.style.setProperty('--glitch-offset', `${intensity}px`);
  });

  // Update speed display
  speedSlider.addEventListener('input', (e) => {
    speed = parseFloat(e.target.value);
    speedValue.textContent = speed.toFixed(2);
    updateAnimationSpeed();
  });

  // Click to toggle effect
  glitchText.addEventListener('click', toggleGlitch);

  // Also toggle on body click anywhere
  document.body.addEventListener('click', (e) => {
    if (e.target !== glitchText && !isActive) {
      toggleGlitch();
    }
  });

  // Initialize
  updateAnimationSpeed();
  document.documentElement.style.setProperty('--glitch-offset', `${intensity}px`);

  // Cleanup when iframe unmounts
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
})();

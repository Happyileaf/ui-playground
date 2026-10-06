// Glitch Text - Interactive CSS + JavaScript Glitch Effect
// Pure native JavaScript, zero dependencies

(function() {
  'use strict';

  // DOM Elements
  const glitchElements = document.querySelectorAll('.glitch, .glitch-sub');
  const controlDock = document.querySelector('.control-dock');
  const toggleBtn = document.querySelector('.control-toggle');
  const intensityInput = document.getElementById('intensity');
  const speedInput = document.getElementById('speed');
  const intensityValue = document.getElementById('intensityValue');
  const speedValue = document.getElementById('speedValue');
  const autoplayCheckbox = document.getElementById('autoplay');

  // State
  let isPanelOpen = false;
  let intensity = parseInt(intensityInput.value, 10);
  let speed = parseInt(speedInput.value, 10);
  let autoplay = autoplayCheckbox.checked;
  let animationFrameId = null;
  let hoverTimeout = null;

  // Get computed animation duration from CSS and map to our speed setting
  function updateAnimationSpeed(newSpeed) {
    speed = newSpeed;
    speedValue.textContent = speed;

    // Map our 1-30 speed to 0.5s - 3s animation duration
    const durationFactor = (30 - speed) / 30 * 2.5 + 0.5;

    glitchElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (el.classList.contains('glitch')) {
        el.style.setProperty('--dur', `${durationFactor * 2}s`);
        el.style.animationDuration = `${durationFactor * 2}s, ${durationFactor * 3}s`;
      } else {
        el.style.animationDuration = `${durationFactor * 2.5}s, ${durationFactor * 2.5}s`;
      }
    });
  }

  function updateIntensity(newIntensity) {
    intensity = newIntensity;
    intensityValue.textContent = intensity;

    const offset = intensity / 4;
    glitchElements.forEach(el => {
      if (el.classList.contains('glitch')) {
        el.querySelector('::before').style.left = `${offset}px`;
        el.querySelector('::after').style.left = `-${offset}px`;
      }
      // Use CSS custom properties for dynamic offsets
      el.style.setProperty('--offset', `${offset}px`);
    });
  }

  // Interactive glitch on hover
  function handleMouseEnter() {
    if (!autoplay) {
      glitchElements.forEach(el => el.classList.add('manual-glitch'));
    }
  }

  function handleMouseLeave() {
    if (!autoplay) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      hoverTimeout = setTimeout(() => {
        glitchElements.forEach(el => el.classList.remove('manual-glitch'));
      }, 100);
    }
  }

  // Toggle control panel visibility
  function togglePanel() {
    isPanelOpen = !isPanelOpen;
    controlDock.classList.toggle('hidden', !isPanelOpen);
  }

  // Keyboard shortcuts: H to toggle panel, Esc to close
  function handleKeyDown(e) {
    if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      e.stopPropagation();
      togglePanel();
    } else if (e.key === 'Escape' && isPanelOpen) {
      togglePanel();
    }
  }

  // Event listeners
  glitchElements.forEach(el => {
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
  });

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Prevent clicks on panel from propagating to body
  document.querySelector('.control-panel').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  intensityInput.addEventListener('input', (e) => {
    updateIntensity(parseInt(e.target.value, 10));
  });

  speedInput.addEventListener('input', (e) => {
    updateAnimationSpeed(parseInt(e.target.value, 10));
  });

  autoplayCheckbox.addEventListener('change', (e) => {
    autoplay = e.target.checked;
    if (!autoplay) {
      glitchElements.forEach(el => el.classList.remove('manual-glitch'));
    }
  });

  document.addEventListener('keydown', handleKeyDown);

  // Initialize
  updateAnimationSpeed(speed);
  updateIntensity(intensity);

})();

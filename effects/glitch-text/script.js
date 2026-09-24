const root = document.documentElement;
const glitchElements = document.querySelectorAll('[data-text]');
const controlDock = document.querySelector('.control-dock');
const controlToggle = document.querySelector('.control-toggle');
const intensityRange = document.getElementById('intensityRange');
const speedRange = document.getElementById('speedRange');
const intensityValue = document.getElementById('intensityValue');
const speedValue = document.getElementById('speedValue');
const colorShiftToggle = document.getElementById('colorShiftToggle');

let glitchIntensity = parseInt(intensityRange.value);
let glitchSpeed = parseInt(speedRange.value);
let colorShiftEnabled = colorShiftToggle.checked;

// Configuration
const config = {
  intensity: glitchIntensity,
  speed: glitchSpeed,
  colorShift: colorShiftEnabled
};

// Toggle control panel
function toggleControls(e) {
  e.stopPropagation();
  controlDock.classList.toggle('hidden');
}

controlToggle.addEventListener('click', toggleControls);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'Escape') {
    e.preventDefault();
    toggleControls(e);
  }
}, { passive: false });

// Update config from controls
intensityRange.addEventListener('input', (e) => {
  config.intensity = parseInt(e.target.value);
  intensityValue.textContent = e.target.value;
});

speedRange.addEventListener('input', (e) => {
  config.speed = parseInt(e.target.value);
  speedValue.textContent = e.target.value;
});

colorShiftToggle.addEventListener('change', (e) => {
  config.colorShift = e.target.checked;
});

// Apply glitch effect
function applyGlitch() {
  const intensity = config.intensity;
  const speed = config.speed / 10;
  
  glitchElements.forEach((el, idx) => {
    const offsetX = (Math.random() - 0.5) * intensity;
    const offsetY = (Math.random() - 0.5) * intensity;

    if (config.colorShift) {
      el.style.textShadow = `
        ${offsetX}px ${offsetY}px 0 rgba(255, 0, 64, 0.6),
        ${-offsetX}px ${-offsetY * 0.5}px 0 rgba(0, 255, 255, 0.6)
      `;
    } else {
      el.style.textShadow = `
        ${offsetX}px ${offsetY}px 0 rgba(255, 255, 255, 0.8)
      `;
    }
  });
  
  setTimeout(applyGlitch, 1000 / (speed * 10));
}

// Add pointer movement interaction
document.addEventListener('pointermove', (e) => {
  const intensity = config.intensity * 0.3;
  const rect = document.body.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const offsetX = (e.clientX - centerX) / centerX * intensity;
  const offsetY = (e.clientY - centerY) / centerY * intensity;
  
  glitchElements.forEach((el) => {
    if (!config.colorShift) {
      el.style.textShadow = `
        ${offsetX}px ${offsetY}px 0 rgba(255, 0, 64, 0.6),
        ${-offsetX * 0.5}px ${-offsetY}px 0 rgba(0, 255, 255, 0.6)
      `;
    }
  });
});

// Start animation
applyGlitch();

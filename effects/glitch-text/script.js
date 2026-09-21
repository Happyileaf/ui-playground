// Glitch Text Effect
// Pure native CSS + JavaScript implementation
// Based on CSS clip-path animation with dynamic randomization

const glitchElement = document.getElementById('glitchText');
const intensitySlider = document.getElementById('intensitySlider');
const speedSlider = document.getElementById('speedSlider');
const intensityValue = document.getElementById('intensityValue');
const speedValue = document.getElementById('speedValue');

let glitchIntensity = parseFloat(intensitySlider.value);
let glitchSpeed = parseInt(speedSlider.value);
let animationId = null;

// Initialize
glitchElement.dataset.text = glitchElement.textContent.trim();
glitchElement.classList.add('active');

// Update CSS variables with random clip positions
function updateGlitchPositions() {
  const intensityPx = glitchIntensity;
  const height = glitchElement.offsetHeight;
  
  // Random clip regions based on intensity
  const clipTop1 = Math.random() * (height - intensityPx);
  const clipBottom1 = clipTop1 + intensityPx;
  const clipTop2 = Math.random() * (height - intensityPx);
  const clipBottom2 = clipTop2 + intensityPx;
  
  document.documentElement.style.setProperty('--clip-top', `${clipTop1}px`);
  document.documentElement.style.setProperty('--clip-bottom', `${clipBottom1}px`);
  document.documentElement.style.setProperty('--clip-top2', `${clipTop2}px`);
  document.documentElement.style.setProperty('--clip-bottom2', `${clipBottom2}px`);
}

// Animation loop with controlled speed
function animate() {
  updateGlitchPositions();
  animationId = requestAnimationFrame(() => {
    setTimeout(animate, 1000 / glitchSpeed);
  });
}

// Start animation
animate();

// Event listeners for controls
intensitySlider.addEventListener('input', (e) => {
  glitchIntensity = parseFloat(e.target.value);
  intensityValue.textContent = glitchIntensity.toFixed(1);
});

speedSlider.addEventListener('input', (e) => {
  glitchSpeed = parseInt(e.target.value);
  speedValue.textContent = glitchSpeed;
  // Restart animation with new speed
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animate();
});

// Click to toggle glitch effect
glitchElement.addEventListener('click', () => {
  glitchElement.classList.toggle('active');
  if (!glitchElement.classList.contains('active')) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  } else {
    animate();
  }
});

// Hover tilt effect (subtle parallax)
glitchElement.addEventListener('pointermove', (e) => {
  const rect = glitchElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const tiltX = (y - centerY) / centerY * 2;
  const tiltY = (centerX - x) / centerX * 2;
  
  glitchElement.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

glitchElement.addEventListener('pointerleave', () => {
  glitchElement.style.transform = 'rotateX(0) rotateY(0)';
});

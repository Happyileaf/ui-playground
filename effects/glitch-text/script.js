// Glitch Text Effect
// Adds random glitch intensity on mouse move

const glitchTexts = document.querySelectorAll('.glitch-text');

document.addEventListener('pointermove', (e) => {
  const intensity = (e.clientX / window.innerWidth - 0.5) * 4;
  glitchTexts.forEach(text => {
    text.style.textIndent = `${intensity}px`;
  });
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  // No cleanup needed for this simple CSS-based effect
});

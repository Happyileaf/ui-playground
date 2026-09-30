// Glitch Text Effect
// Pure native JavaScript implementation
document.addEventListener('DOMContentLoaded', () => {
  const glitchTexts = document.querySelectorAll('.glitch-text');
  
  // Add interactive RGB shift on hover/click
  glitchTexts.forEach(text => {
    // Pointer down for press activation
    text.addEventListener('pointerdown', () => {
      text.classList.add('active');
    });
    
    // Pointer up/leave for deactivation
    text.addEventListener('pointerup', () => {
      text.classList.remove('active');
    });
    text.addEventListener('pointerleave', () => {
      text.classList.remove('active');
    });
  });
  
  // Handle resize for DPR scaling (already handled in CSS, but keep for future extension)
  let animationFrameId = null;
  const handleResize = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(() => {
      // No action needed for CSS version, kept for consistent structure
    });
  };
  
  window.addEventListener('resize', handleResize);
});

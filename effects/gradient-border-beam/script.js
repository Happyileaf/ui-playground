// Gradient Border Beam - Interactive Toggle
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.gradient-border-card');

  // Add interactive toggle on click
  cards.forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('paused');
    });

    // Add interactive class for hover pause
    card.classList.add('interactive');
  });

  // Handle visibility change to pause animation when tab is hidden
  // Improves performance when not visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cards.forEach(card => card.classList.add('paused'));
    }
  });

  // Resize observer for responsive handling (cleanup example)
  const resizeObserver = new ResizeObserver(entries => {
    // No specific action needed but demonstrates proper observer pattern
    for (let entry of entries) {
      // Could adjust border thickness based on size here if needed
    }
  });

  cards.forEach(card => resizeObserver.observe(card));
});

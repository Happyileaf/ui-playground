(function () {
  const cards = document.querySelectorAll('.flip-card');

  cards.forEach((card) => {
    function toggleFlip() {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-flip-action]')) {
        e.stopPropagation();
        return;
      }
      toggleFlip();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });
})();

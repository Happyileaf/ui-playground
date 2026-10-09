(function () {
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('timelineProgress');
  const items = Array.from(timeline.querySelectorAll('.tl-item'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateProgress() {
    const rect = timeline.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const passed = Math.min(Math.max(viewportH * 0.62 - rect.top, 0), total);
    const ratio = total > 0 ? passed / total : 0;
    progress.style.height = (ratio * 100).toFixed(2) + '%';
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
  }

  function toggleCard(card, force) {
    const open = typeof force === 'boolean' ? force : !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    card.setAttribute('aria-expanded', String(open));
  }

  items.forEach((item) => {
    const card = item.querySelector('.tl-card');
    card.addEventListener('click', () => toggleCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add('is-visible'));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateProgress();
})();

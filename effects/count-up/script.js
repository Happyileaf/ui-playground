(function () {
  const numbers = Array.from(document.querySelectorAll('.stat-number'));
  const replayBtn = document.getElementById('replayBtn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function format(value, el) {
    const decimals = Number(el.dataset.decimals || 0);
    const fixed = value.toFixed(decimals);
    let text = fixed;
    if (el.dataset.separator === 'true') {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      text = parts.join('.');
    }
    return `${el.dataset.prefix || ''}${text}${el.dataset.suffix || ''}`;
  }

  function stop(el) {
    const state = running.get(el);
    if (state) {
      cancelAnimationFrame(state.raf);
      running.delete(el);
    }
  }

  function run(el) {
    stop(el);
    const target = Number(el.dataset.target || 0);
    const duration = Number(el.dataset.duration || 1800);
    const card = el.closest('.stat-card');

    if (card) card.classList.remove('is-done');

    if (reduceMotion.matches) {
      el.textContent = format(target, el);
      if (card) card.classList.add('is-done');
      return;
    }

    el.textContent = format(0, el);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * easeOutExpo(progress);
      el.textContent = format(value, el);
      if (progress < 1) {
        running.set(el, { raf: requestAnimationFrame(tick) });
      } else {
        el.textContent = format(target, el);
        running.delete(el);
        if (card) card.classList.add('is-done');
      }
    };

    running.set(el, { raf: requestAnimationFrame(tick) });
  }

  function playAll() {
    numbers.forEach(run);
  }

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    numbers.forEach((el) => observer.observe(el));

    replayBtn.addEventListener('click', () => {
      numbers.forEach((el) => observer.unobserve(el));
      playAll();
    });
  } else {
    playAll();
    replayBtn.addEventListener('click', playAll);
  }

  reduceMotion.addEventListener?.('change', () => {
    numbers.forEach(stop);
    playAll();
  });
})();

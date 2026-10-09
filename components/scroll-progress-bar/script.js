(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressFill = document.getElementById('progressFill');
  const backTop = document.getElementById('backTop');
  const backTopPercent = document.getElementById('backTopPercent');
  const navDots = Array.from(document.querySelectorAll('.chapter-dot'));
  const sections = navDots
    .map(dot => document.getElementById(dot.dataset.target))
    .filter(Boolean);

  let ticking = false;
  let currentActive = null;

  function setActive(id) {
    if (currentActive === id) return;
    currentActive = id;
    navDots.forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.target === id);
      if (dot.dataset.target === id) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function update() {
    ticking = false;

    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    progressFill.style.transform = `scaleX(${ratio})`;

    const percent = Math.round(ratio * 100);
    backTopPercent.textContent = `${percent}%`;
    backTop.classList.toggle('visible', scrollTop > window.innerHeight * 0.4);

    const midLine = window.innerHeight * 0.4;
    let activeId = sections.length ? sections[0].id : null;

    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= midLine) activeId = sections[i].id;
      if (rect.bottom < midLine && i === sections.length - 1) {
        activeId = sections[i].id;
      }
    }

    setActive(activeId);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  backTop.addEventListener('click', () => {
    if (reduceMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  navDots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.target);
      if (!target) return;
      if (reduceMotion) {
        target.scrollIntoView();
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  update();
})();

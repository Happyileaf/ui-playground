(function () {
  const W = 300;
  const H = 72;
  const PAD = 6;
  const cards = document.querySelectorAll('.metric-card');
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildSvg(card) {
    const values = card.dataset.values.split(',').map(Number);
    const isUp = card.querySelector('.metric-delta').classList.contains('up');
    const color = isUp ? '#34d399' : '#f87171';
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const range = max - min || 1;

    const points = values.map((v, i) => ({
      x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
      y: PAD + (1 - (v - min) / range) * (H - PAD * 2),
      value: v
    }));

    const lineD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaD = `${lineD} L${points[points.length - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`;
    const gradId = `grad-${Math.random().toString(36).slice(2, 9)}`;

    const wrap = card.querySelector('.spark-wrap');
    wrap.innerHTML = `
      <svg class="spark-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path class="spark-area" d="${areaD}" fill="url(#${gradId})"></path>
        <line class="cross-line" y1="2" y2="${H - 2}"></line>
        <path class="spark-line" d="${lineD}" stroke="${color}" vector-effect="non-scaling-stroke"></path>
        <circle class="hover-dot" r="3.5" fill="${color}" stroke="#0a0c14" stroke-width="2"></circle>
      </svg>
      <div class="spark-tip"></div>
    `;

    const svg = wrap.querySelector('.spark-svg');
    const line = wrap.querySelector('.spark-line');
    const cross = wrap.querySelector('.cross-line');
    const dot = wrap.querySelector('.hover-dot');
    const tip = wrap.querySelector('.spark-tip');

    if (!reduceMotion) {
      const len = line.getTotalLength();
      line.style.setProperty('--len', len);
      line.classList.add('draw');
    }

    function showPoint(index) {
      const p = points[index];
      cross.setAttribute('x1', p.x);
      cross.setAttribute('x2', p.x);
      cross.style.visibility = 'visible';
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.style.visibility = 'visible';

      const scaleX = svg.getBoundingClientRect().width / W;
      const scaleY = svg.getBoundingClientRect().height / H;
      tip.textContent = p.value;
      tip.style.left = `${p.x * scaleX}px`;
      tip.style.top = `${p.y * scaleY}px`;
      tip.classList.add('show');
    }

    function hidePoint() {
      cross.style.visibility = 'hidden';
      dot.style.visibility = 'hidden';
      tip.classList.remove('show');
    }

    svg.addEventListener('pointermove', (e) => {
      const rect = svg.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      const index = Math.round(fraction * (points.length - 1));
      showPoint(Math.max(0, Math.min(index, points.length - 1)));
    });

    svg.addEventListener('pointerleave', hidePoint);
  }

  function countUp(el, target) {
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function activate(card) {
    buildSvg(card);
    const valueEl = card.querySelector('[data-countup]');
    countUp(valueEl, Number(valueEl.dataset.countup));
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach(activate);
  }
})();

(function () {
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#01アカサタナハマヤラワ';
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let frame = null;

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function scramble(el, duration) {
    const target = el.dataset.text || el.textContent;
    el.dataset.text = target;

    if (reduceMotion) {
      el.textContent = target;
      return;
    }

    if (frame) cancelAnimationFrame(frame);

    const chars = Array.from(target).map((ch) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = CJK.test(ch) ? ch : ch === ' ' ? ' ' : randomGlyph();
      if (ch !== ' ') span.classList.add('scrambling');
      el.appendChild(span);
      return { ch, span, isSpace: ch === ' ' };
    });

    const start = performance.now();
    const total = chars.length;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      let settledCount = Math.floor(progress * total * 1.15);

      chars.forEach((c, idx) => {
        if (c.isSpace) return;
        if (idx < settledCount) {
          c.span.textContent = c.ch;
          c.span.classList.remove('scrambling');
        } else if (Math.random() < 0.3) {
          c.span.textContent = randomGlyph();
        }
      });

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        chars.forEach(c => {
          c.span.textContent = c.ch;
          c.span.classList.remove('scrambling');
        });
        frame = null;
      }
    }

    frame = requestAnimationFrame(tick);
  }

  const target = document.querySelector('.scramble-target');
  const replay = document.getElementById('replayBtn');

  setTimeout(() => scramble(target, 1100), 350);

  replay.addEventListener('click', () => scramble(target, 900));

  document.querySelectorAll('.scramble-hover').forEach((el) => {
    el.dataset.text = el.textContent;
    el.addEventListener('mouseenter', () => scramble(el, 520));
    el.addEventListener('focus', () => scramble(el, 520));
  });
})();

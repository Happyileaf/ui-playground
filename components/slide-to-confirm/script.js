(function () {
  'use strict';

  const slider = document.getElementById('slider');
  const knob = document.getElementById('knob');
  const fill = document.getElementById('fill');
  const resetBtn = document.getElementById('resetBtn');

  const KNOB = 48;
  const EDGE = 5;
  const THRESHOLD = 6;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let x = 0;
  let dragging = false;
  let confirmed = false;
  let startPointerX = 0;
  let startX = 0;
  let activeAnims = [];

  function maxX() {
    return Math.max(0, slider.clientWidth - KNOB - EDGE * 2);
  }

  function setX(next) {
    x = next;
    knob.style.left = EDGE + x + 'px';
    fill.style.width = EDGE + x + KNOB + 'px';
  }

  function cancelAnims() {
    activeAnims.forEach(function (a) {
      if (a && a.playState === 'running') a.cancel();
    });
    activeAnims = [];
  }

  function moveTo(target, duration, easing, onDone) {
    cancelAnims();
    if (reduceMotion || !duration) {
      setX(target);
      if (onDone) onDone();
      return;
    }
    const kAnim = knob.animate(
      { left: [knob.style.left || EDGE + 'px', EDGE + target + 'px'] },
      { duration: duration, easing: easing, fill: 'forwards' }
    );
    const fAnim = fill.animate(
      { width: [fill.style.width || KNOB + EDGE + 'px', EDGE + target + KNOB + 'px'] },
      { duration: duration, easing: easing, fill: 'forwards' }
    );
    activeAnims = [kAnim, fAnim];
    Promise.all([kAnim.finished, fAnim.finished]).then(function () {
      setX(target);
      activeAnims = [];
      if (onDone) onDone();
    }).catch(function () {});
  }

  function setConfirmed(value) {
    confirmed = value;
    slider.classList.toggle('is-confirmed', value);
    knob.setAttribute('aria-checked', value ? 'true' : 'false');
    resetBtn.hidden = !value;
  }

  function lock() {
    moveTo(maxX(), 360, 'cubic-bezier(0.22, 1, 0.36, 1)', function () {
      setConfirmed(true);
    });
  }

  function release() {
    dragging = false;
    slider.classList.remove('is-dragging');
    try { knob.releasePointerCapture(knob._pid); } catch (err) {}
    knob._pid = null;

    if (x >= maxX() - THRESHOLD) {
      lock();
    } else {
      moveTo(0, 520, 'cubic-bezier(0.34, 1.45, 0.4, 1)');
    }
  }

  knob.addEventListener('pointerdown', function (e) {
    if (confirmed) return;
    dragging = true;
    slider.classList.add('is-dragging');
    startPointerX = e.clientX;
    startX = x;
    knob._pid = e.pointerId;
    knob.setPointerCapture(e.pointerId);
    cancelAnims();
    e.preventDefault();
  });

  knob.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const next = Math.max(0, Math.min(maxX(), startX + e.clientX - startPointerX));
    setX(next);
  });

  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);

  knob.addEventListener('keydown', function (e) {
    if (confirmed) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      lock();
    }
  });

  resetBtn.addEventListener('click', function () {
    setConfirmed(false);
    moveTo(0, 420, 'cubic-bezier(0.34, 1.45, 0.4, 1)');
    knob.focus();
  });

  window.addEventListener('resize', function () {
    if (confirmed) {
      setX(maxX());
    } else {
      setX(Math.min(x, maxX()));
    }
  });

  setX(0);
})();

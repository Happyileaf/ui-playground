(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = document.getElementById('settingsList');
  const countEl = document.getElementById('settingsCount');
  const buttons = Array.from(document.querySelectorAll('.tilt-switch'));

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playBlink(isOn) {
    if (reduceMotion) return;
    const soundSwitch = buttons[3];
    if (!soundSwitch || !soundSwitch.__state.on) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isOn ? 520 : 360, now);
    osc.frequency.exponentialRampToValueAtTime(isOn ? 720 : 300, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  const states = buttons.map((btn) => {
    const track = btn.querySelector('.switch-track');
    const on = btn.getAttribute('aria-checked') === 'true';
    const state = {
      btn,
      track,
      on,
      progress: on ? 1 : 0,
      velocity: 0,
      tiltX: 0,
      tiltY: 0,
      targetTiltX: 0,
      targetTiltY: 0,
      dragging: false,
      moved: false,
      suppressClick: false,
      startX: 0,
      startY: 0,
      baseProgress: 0
    };
    btn.__state = state;
    return state;
  });

  let rafId = null;

  function writeState(state) {
    state.track.style.setProperty('--progress', state.progress.toFixed(4));
    state.track.style.setProperty('--tilt-x', state.tiltX.toFixed(2));
    state.track.style.setProperty('--tilt-y', state.tiltY.toFixed(2));
  }

  function isSettled(state) {
    const target = state.on ? 1 : 0;
    return Math.abs(state.progress - target) < 0.002 && Math.abs(state.velocity) < 0.002
      && Math.abs(state.tiltX) < 0.05 && Math.abs(state.tiltY) < 0.05;
  }

  function tick() {
    let alive = false;

    states.forEach((state) => {
      if (state.dragging) {
        state.tiltX += (state.targetTiltX - state.tiltX) * 0.25;
        state.tiltY += (state.targetTiltY - state.tiltY) * 0.25;
        writeState(state);
        alive = true;
        return;
      }

      const target = state.on ? 1 : 0;
      const acceleration = (target - state.progress) * 0.32;
      state.velocity += acceleration;
      state.velocity *= 0.7;
      state.progress += state.velocity;

      if (state.progress > 1) {
        state.progress = 1;
        state.velocity *= -0.35;
      } else if (state.progress < 0) {
        state.progress = 0;
        state.velocity *= -0.35;
      }

      state.tiltX += (0 - state.tiltX) * 0.18;
      state.tiltY += (0 - state.tiltY) * 0.18;

      writeState(state);

      if (!isSettled(state)) alive = true;
    });

    if (alive) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      states.forEach((state) => {
        const target = state.on ? 1 : 0;
        state.progress = target;
        state.velocity = 0;
        state.tiltX = 0;
        state.tiltY = 0;
        writeState(state);
      });
    }
  }

  function ensureLoop() {
    if (reduceMotion) {
      states.forEach((state) => {
        state.progress = state.on ? 1 : 0;
        state.tiltX = 0;
        state.tiltY = 0;
        writeState(state);
      });
      return;
    }
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function applyOn(state, on) {
    if (state.on === on) return;
    state.on = on;
    state.btn.setAttribute('aria-checked', String(on));
    state.btn.classList.toggle('is-on', on);
    const row = state.btn.closest('.setting-row');
    if (row) row.classList.toggle('is-on', on);
    updateCount();
    playBlink(on);
  }

  function updateCount() {
    if (!countEl) return;
    const total = states.length;
    const onCount = states.filter(s => s.on).length;
    countEl.textContent = `${onCount} / ${total} 已开启`;
  }

  states.forEach((state) => {
    state.btn.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      state.dragging = true;
      state.moved = false;
      state.suppressClick = false;
      state.startX = e.clientX;
      state.startY = e.clientY;
      state.baseProgress = state.progress;
      state.btn.classList.add('is-pressing');
      state.btn.setPointerCapture(e.pointerId);
      ensureLoop();
    });

    state.btn.addEventListener('pointermove', (e) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        if (!state.moved) state.moved = true;
      }

      if (state.moved) {
        state.progress = Math.min(1, Math.max(0, state.baseProgress + dx / 22));
        state.velocity = 0;
        state.targetTiltX = Math.min(14, Math.max(-14, dx / 4));
        state.targetTiltY = Math.min(10, Math.max(-10, dy / 6));
      }
    });

    function endDrag(e) {
      if (!state.dragging) return;
      state.dragging = false;
      state.btn.classList.remove('is-pressing');
      state.targetTiltX = 0;
      state.targetTiltY = 0;

      if (state.moved) {
        state.suppressClick = true;
        applyOn(state, state.progress >= 0.5);
      }
      ensureLoop();
    }

    state.btn.addEventListener('pointerup', endDrag);
    state.btn.addEventListener('pointercancel', endDrag);

    state.btn.addEventListener('click', () => {
      if (state.suppressClick) {
        state.suppressClick = false;
        return;
      }
      applyOn(state, !state.on);
      ensureLoop();
    });
  });

  function init() {
    states.forEach((state) => {
      state.btn.classList.toggle('is-on', state.on);
      const row = state.btn.closest('.setting-row');
      if (row) row.classList.toggle('is-on', state.on);
      writeState(state);
    });
    updateCount();
  }

  window.addEventListener('pagehide', () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  init();
})();

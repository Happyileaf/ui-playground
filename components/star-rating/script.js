(function () {
  const block = document.getElementById('ratingBlock');
  const starRow = document.getElementById('starRow');
  const stars = Array.from(starRow.querySelectorAll('.star'));
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreText = document.getElementById('scoreText');
  const clearBtn = document.getElementById('clearBtn');
  const precisionBtns = Array.from(document.querySelectorAll('.precision-btn'));
  const srLive = document.getElementById('srLive');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LABELS = {
    0: '点击星星进行评分',
    1: '很不满意，差距很大',
    2: '不太满意，有待改善',
    3: '中规中矩，基本达标',
    4: '比较满意，值得推荐',
    5: '非常满意，远超预期'
  };

  const state = {
    value: 0,
    step: 1,
    preview: null,
    lastTickValue: 0
  };

  let audioCtx = null;

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return null;
    }
    audioCtx = new Ctx();
    return audioCtx;
  }

  function playTone(frequency, start, duration, volume) {
    const ctx = audioCtx;
    if (!ctx) {
      return;
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + start);
    oscillator.stop(ctx.currentTime + start + duration + 0.02);
  }

  function tickHover(value) {
    if (value === state.lastTickValue) {
      return;
    }
    ensureAudio();
    playTone(880 + value * 60, 0, 0.06, 0.05);
    state.lastTickValue = value;
  }

  function chimeConfirm(value) {
    ensureAudio();
    const base = 620 + value * 70;
    playTone(base, 0, 0.12, 0.07);
    playTone(base * 1.5, 0.07, 0.16, 0.05);
  }

  function clamp(value) {
    return Math.min(5, Math.max(0, value));
  }

  function valueFromPointer(event) {
    const star = event.target.closest('.star');
    if (!star) {
      return 0;
    }
    const rect = star.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const starIndex = stars.indexOf(star) + 1;
    let value;
    if (state.step === 0.5) {
      value = ratio < 0.5 ? starIndex - 0.5 : starIndex;
    } else {
      value = starIndex;
    }
    return clamp(value);
  }

  function render() {
    const shown = state.preview !== null ? state.preview : state.value;
    stars.forEach((star, index) => {
      const fill = star.querySelector('.star-fill');
      const portion = clamp(shown - index);
      fill.style.width = `${portion * 100}%`;
    });
    scoreNumber.textContent = shown.toFixed(1);
    if (state.preview !== null && state.preview !== state.value) {
      scoreText.textContent = state.preview === 0 ? LABELS[0] : `预览 ${state.preview.toFixed(1)} 分 · 松开确认`;
    } else {
      scoreText.textContent = state.value === 0 ? LABELS[0] : LABELS[Math.round(state.value)];
    }
    block.setAttribute('aria-valuenow', String(state.value));
    block.setAttribute('aria-valuetext', state.value === 0 ? '未评分' : `${state.value} 分，${LABELS[Math.round(state.value)]}`);
  }

  function popStars(value) {
    if (reduceMotion) {
      return;
    }
    stars.forEach((star, index) => {
      if (index < Math.round(value)) {
        star.classList.remove('is-pop');
        void star.offsetWidth;
        star.classList.add('is-pop');
      }
    });
  }

  function announce(message) {
    srLive.textContent = '';
    window.setTimeout(() => {
      srLive.textContent = message;
    }, 30);
  }

  function commit(value) {
    state.value = clamp(value);
    state.preview = null;
    state.lastTickValue = value;
    render();
    popStars(value);
    chimeConfirm(value);
    announce(`已评分 ${value.toFixed(1)} 分，${LABELS[Math.round(value)]}`);
  }

  starRow.addEventListener('pointermove', (event) => {
    const value = valueFromPointer(event);
    if (value <= 0) {
      state.preview = null;
    } else {
      state.preview = value;
      tickHover(value);
    }
    render();
  });

  starRow.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    const value = valueFromPointer(event);
    if (value > 0) {
      commit(value);
      event.preventDefault();
    }
  });

  starRow.addEventListener('pointerleave', () => {
    state.preview = null;
    state.lastTickValue = 0;
    render();
  });

  precisionBtns.forEach((button) => {
    button.addEventListener('click', () => {
      state.step = Number(button.dataset.step);
      precisionBtns.forEach((item) => item.classList.toggle('is-active', item === button));
      announce(state.step === 0.5 ? '已切换为半星精度' : '已切换为整星精度');
    });
  });

  clearBtn.addEventListener('click', () => {
    state.value = 0;
    state.preview = null;
    render();
    announce('已清除评分');
    block.focus();
  });

  block.addEventListener('keydown', (event) => {
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = clamp((state.value || 0) + state.step);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = clamp((state.value || 0) - state.step);
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = 5;
    } else if (/^[1-5]$/.test(event.key)) {
      next = Number(event.key);
    }
    if (next !== null) {
      event.preventDefault();
      if (next !== state.value) {
        commit(next);
      }
    }
  });

  render();
})();

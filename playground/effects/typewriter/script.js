(function () {
  const PHRASES = [
    '用原生代码，敲出第一行星光',
    '逐字浮现的，不只是文字',
    '没有框架，也能有呼吸感',
    '删除，是为了下一次开始'
  ];

  const textEl = document.getElementById('typeText');
  const caret = document.querySelector('.caret');
  const replayBtn = document.getElementById('replayBtn');
  const dotsWrap = document.getElementById('phraseDots');
  const dock = document.getElementById('controlDock');
  const dockClose = document.getElementById('dockClose');
  const speedRange = document.getElementById('speedRange');
  const speedOut = document.getElementById('speedOut');
  const loopToggle = document.getElementById('loopToggle');
  const caretToggle = document.getElementById('caretToggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let phraseIndex = 0;
  let charCount = 0;
  let deleting = false;
  let timer = null;
  let typing = false;
  let typeSpeed = parseInt(speedRange.value, 10);

  PHRASES.forEach((phrase, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', '跳到第 ' + (i + 1) + ' 段：' + phrase);
    dot.addEventListener('click', () => {
      startFrom(i);
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === phraseIndex && typing));
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(fn, delay) {
    clearTimer();
    timer = setTimeout(fn, delay);
  }

  function currentPhrase() {
    return PHRASES[phraseIndex];
  }

  function render() {
    textEl.textContent = currentPhrase().slice(0, charCount);
  }

  function tick() {
    const phrase = currentPhrase();
    if (!deleting) {
      charCount += 1;
      render();
      if (charCount === phrase.length) {
        deleting = true;
        schedule(tick, reduceMotion ? 350 : 1500);
        return;
      }
      schedule(tick, typeSpeed);
    } else {
      charCount -= 1;
      render();
      if (charCount === 0) {
        deleting = false;
        if (phraseIndex === PHRASES.length - 1 && !loopToggle.checked) {
          stop(false);
          return;
        }
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        updateDots();
        schedule(tick, reduceMotion ? 200 : 420);
        return;
      }
      schedule(tick, Math.max(28, Math.round(typeSpeed * 0.45)));
    }
  }

  function stop(clear) {
    clearTimer();
    typing = false;
    deleting = false;
    if (clear) {
      charCount = 0;
      render();
    }
    updateDots();
  }

  function startFrom(index) {
    clearTimer();
    phraseIndex = index % PHRASES.length;
    charCount = 0;
    deleting = false;
    typing = true;
    render();
    updateDots();
    schedule(tick, reduceMotion ? 60 : 260);
  }

  function restart() {
    startFrom(0);
  }

  function toggleDock(force) {
    const open = typeof force === 'boolean' ? force : !dock.classList.contains('is-open');
    dock.classList.toggle('is-open', open);
    dock.setAttribute('aria-hidden', String(!open));
  }

  replayBtn.addEventListener('click', restart);

  document.querySelector('.stage-inner').addEventListener('click', (e) => {
    if (e.target.closest('.replay-btn') || e.target.closest('.phrases')) return;
    restart();
  });

  speedRange.addEventListener('input', () => {
    typeSpeed = parseInt(speedRange.value, 10);
    speedOut.textContent = typeSpeed + 'ms';
  });

  caretToggle.addEventListener('change', () => {
    caret.classList.toggle('is-hidden', !caretToggle.checked);
  });

  dockClose.addEventListener('click', () => toggleDock(false));

  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key === 'h' || e.key === 'H') {
      toggleDock();
    } else if (e.key === 'Escape') {
      toggleDock(false);
    }
  });

  if (reduceMotion) {
    textEl.textContent = PHRASES[0];
    charCount = PHRASES[0].length;
    typing = true;
    updateDots();
  } else {
    restart();
  }
})();

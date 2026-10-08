(function () {
  const stack = document.getElementById('deckStack');
  const deckEmpty = document.getElementById('deckEmpty');
  const deckCount = document.getElementById('deckCount');
  const liveStatus = document.getElementById('liveStatus');
  const btnLike = document.getElementById('btnLike');
  const btnNope = document.getElementById('btnNope');
  const btnRewind = document.getElementById('btnRewind');
  const btnRestart = document.getElementById('btnRestart');
  const btnSound = document.getElementById('btnSound');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const profiles = [
    {
      name: 'Aurora',
      family: 'Chen',
      age: 24,
      initial: 'A',
      tags: ['胶片摄影', '手冲咖啡', '山野徒步'],
      bio: '周末在山野和暗房之间来回切换，收集清晨的光。',
      g1: '#2dd4bf',
      g2: '#0d9488'
    },
    {
      name: 'Leo',
      family: 'Martin',
      age: 28,
      initial: 'L',
      tags: ['爵士萨克斯', '黑胶唱片', '单一麦芽'],
      bio: '相信凌晨三点的即兴演奏永远最诚实。',
      g1: '#fbbf24',
      g2: '#d97706'
    },
    {
      name: 'Mei',
      family: 'Sato',
      age: 26,
      initial: 'M',
      tags: ['陶艺工作室', '两只橘猫', '独立电影'],
      bio: '手上的陶土比任何滤镜都更有温度。',
      g1: '#fb7185',
      g2: '#be123c'
    },
    {
      name: 'Jonas',
      family: 'Weber',
      age: 31,
      initial: 'J',
      tags: ['户外攀岩', '极简设计', '酸面包'],
      bio: '在岩壁上寻找专注，在厨房里寻找秩序。',
      g1: '#818cf8',
      g2: '#4338ca'
    },
    {
      name: 'Ines',
      family: 'García',
      age: 27,
      initial: 'I',
      tags: ['弗拉门戈', '旅行插画', '清晨冲浪'],
      bio: '把沿途的风都画进速写本里带走。',
      g1: '#4ade80',
      g2: '#15803d'
    }
  ];

  let queue = profiles.slice();
  let discarded = [];
  let view = [];

  let phase = 'idle';
  let x = 0;
  let y = 0;
  let rot = 0;
  let vx = 0;
  let vy = 0;
  let tx = 0;
  let ty = 0;
  let tr = 0;
  let progress = 0;
  let flyDir = 1;

  let dragging = false;
  let activePointer = null;
  let downX = 0;
  let downY = 0;
  let lastMX = 0;
  let lastMY = 0;
  let lastMT = 0;
  let dragVx = 0;
  let dragVy = 0;

  let rafId = null;
  let lastTs = 0;

  let soundOn = true;
  let audioCtx = null;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function unlockAudio() {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function tone(opts) {
    if (!soundOn || !audioCtx) return;
    const t0 = audioCtx.currentTime + (opts.when || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freq2) osc.frequency.exponentialRampToValueAtTime(opts.freq2, t0 + opts.dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(opts.gain, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  function playLike() {
    tone({ type: 'triangle', freq: 540, freq2: 830, dur: 0.16, gain: 0.1 });
  }

  function playNope() {
    tone({ type: 'sawtooth', freq: 240, freq2: 150, dur: 0.15, gain: 0.05 });
  }

  function playRewind() {
    tone({ type: 'sine', freq: 430, freq2: 380, dur: 0.07, gain: 0.07 });
    tone({ type: 'sine', freq: 590, freq2: 540, dur: 0.09, gain: 0.07, when: 0.08 });
  }

  function playGrab() {
    tone({ type: 'sine', freq: 320, freq2: 280, dur: 0.05, gain: 0.03 });
  }

  function announce(msg) {
    liveStatus.textContent = msg;
  }

  function createCardEl(p) {
    const el = document.createElement('article');
    el.className = 'tcard';
    el.innerHTML =
      '<div class="tcard-stamp like">Like</div>' +
      '<div class="tcard-stamp nope">Nope</div>' +
      '<div class="tcard-photo">' +
        '<div class="tcard-ring"></div>' +
        '<span class="tcard-monogram">' + p.initial + '</span>' +
      '</div>' +
      '<div class="tcard-body">' +
        '<div class="tcard-name-row">' +
          '<span class="tcard-name">' + p.name + ' ' + p.family + '</span>' +
          '<span class="tcard-age">' + p.age + '</span>' +
        '</div>' +
        '<div class="tcard-tags">' +
          p.tags.map(tag => '<span class="tcard-tag">' + tag + '</span>').join('') +
        '</div>' +
        '<p class="tcard-bio">' + p.bio + '</p>' +
      '</div>';
    el.querySelector('.tcard-photo').style.background =
      'linear-gradient(150deg, ' + p.g1 + ', ' + p.g2 + ')';
    return el;
  }

  function layout() {
    view.forEach((v, i) => {
      if (i === 0) {
        v.el.style.transform =
          'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
        v.stampLike.style.opacity = x > 0 ? clamp((x - 24) / 90, 0, 1).toFixed(3) : '0';
        v.stampNope.style.opacity = x < 0 ? clamp((-x - 24) / 90, 0, 1).toFixed(3) : '0';
      } else {
        const d = Math.max(i - progress, 0);
        const scale = 1 - d * 0.045;
        const tyPx = d * 14;
        v.el.style.transform =
          'translate3d(0,' + tyPx.toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
      }
    });
  }

  function updateUI() {
    deckCount.textContent = queue.length + ' / ' + profiles.length;
    deckEmpty.hidden = queue.length !== 0;
    const busy = phase !== 'idle';
    btnRewind.disabled = discarded.length === 0 || busy;
    btnLike.disabled = queue.length === 0 || busy;
    btnNope.disabled = queue.length === 0 || busy;
  }

  function renderStack() {
    stack.innerHTML = '';
    view = queue.slice(0, 3).map((p, i) => {
      const el = createCardEl(p);
      el.style.zIndex = String(3 - i);
      stack.appendChild(el);
      return {
        el,
        stampLike: el.querySelector('.tcard-stamp.like'),
        stampNope: el.querySelector('.tcard-stamp.nope')
      };
    });
    layout();
    updateUI();
  }

  function ensureLoop() {
    if (rafId === null) {
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
    }
  }

  function loop(ts) {
    const dt = lastTs ? clamp((ts - lastTs) / 16.67, 0.4, 2) : 1;
    lastTs = ts;

    if (phase === 'return' || phase === 'enter') {
      const k = reduceMotion ? 0.28 : (phase === 'enter' ? 0.09 : 0.11);
      const d = reduceMotion ? 0.6 : 0.55;
      vx += ((tx - x) * k - vx * d) * dt;
      vy += ((ty - y) * k - vy * d) * dt;
      rot += ((tr - rot) * k) * dt;
      x += vx * dt;
      y += vy * dt;
      progress = clamp(Math.abs(x) / 220, 0, 1);

      if (Math.abs(x - tx) < 0.4 && Math.abs(y - ty) < 0.4 && Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
        x = 0;
        y = 0;
        rot = 0;
        vx = 0;
        vy = 0;
        progress = 0;
        phase = 'idle';
        updateUI();
      }
    } else if (phase === 'fly') {
      const pk = reduceMotion ? 0.25 : 0.045;
      const pd = reduceMotion ? 0.6 : 0.12;
      vx += ((tx - x) * pk - vx * pd) * dt;
      vy += ((ty - y) * pk - vy * pd) * dt;
      rot += ((tr - rot) * 0.08) * dt;
      x += vx * dt;
      y += vy * dt;
      progress = clamp(Math.abs(x) / 220, 0, 1);

      if (Math.abs(x) >= window.innerWidth / 2 + 140) {
        queue.shift();
        x = 0;
        y = 0;
        rot = 0;
        vx = 0;
        vy = 0;
        progress = 0;
        phase = 'idle';
        renderStack();
      }
    }

    layout();

    if (phase === 'idle') {
      rafId = null;
    } else {
      rafId = requestAnimationFrame(loop);
    }
  }

  function startReturn() {
    phase = 'return';
    tx = 0;
    ty = 0;
    tr = 0;
    vx *= 0.2;
    vy *= 0.2;
    updateUI();
    ensureLoop();
  }

  function startFly(dir, initVx, initVy) {
    phase = 'fly';
    flyDir = dir;
    if (Math.abs(x) < 8) x = dir * 8;
    if (Math.sign(x) !== dir) x = dir * Math.abs(x);
    vx = initVx || dir * 14;
    vy = initVy || 0;
    tx = dir * (window.innerWidth / 2 + 380);
    ty = clamp(y + vy * 200, -260, 320);
    tr = reduceMotion ? 0 : dir * 26;

    discarded.push({ profile: queue[0], dir });
    announce((dir > 0 ? '喜欢了 ' : '跳过了 ') + queue[0].name);
    if (dir > 0) playLike(); else playNope();
    updateUI();
    ensureLoop();
  }

  function undo() {
    if (phase !== 'idle' || discarded.length === 0) return;
    const item = discarded.pop();
    queue.unshift(item.profile);
    renderStack();

    phase = 'enter';
    x = item.dir * (reduceMotion ? 40 : 320);
    rot = reduceMotion ? 0 : item.dir * 24;
    vx = 0;
    vy = 0;
    tx = 0;
    ty = 0;
    tr = 0;

    announce('撤回了 ' + item.profile.name);
    playRewind();
    updateUI();
    ensureLoop();
  }

  function restart() {
    queue = profiles.slice();
    discarded = [];
    x = 0;
    y = 0;
    rot = 0;
    vx = 0;
    vy = 0;
    progress = 0;
    phase = 'idle';
    renderStack();
  }

  stack.addEventListener('pointerdown', (e) => {
    if (phase !== 'idle' || queue.length === 0) return;
    const el = e.target.closest('.tcard');
    if (!el || !view.length || view[0].el !== el) return;

    x = 0;
    y = 0;
    rot = 0;
    vx = 0;
    vy = 0;
    downX = e.clientX;
    downY = e.clientY;
    lastMX = e.clientX;
    lastMY = e.clientY;
    lastMT = performance.now();
    dragVx = 0;
    dragVy = 0;

    dragging = true;
    activePointer = e.pointerId;
    phase = 'drag';
    try {
      stack.setPointerCapture(e.pointerId);
    } catch (err) {}
    view[0].el.classList.add('dragging');

    unlockAudio();
    playGrab();

    updateUI();
    ensureLoop();
  });

  stack.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== activePointer) return;

    const now = performance.now();
    const dtm = Math.max(now - lastMT, 1);
    const ivx = ((e.clientX - lastMX) / dtm) * 16.67;
    const ivy = ((e.clientY - lastMY) / dtm) * 16.67;
    dragVx = dragVx * 0.6 + ivx * 0.4;
    dragVy = dragVy * 0.6 + ivy * 0.4;

    x = e.clientX - downX;
    y = e.clientY - downY;
    rot = reduceMotion ? 0 : x * 0.09;
    progress = clamp(Math.abs(x) / 220, 0, 1);
    layout();

    lastMX = e.clientX;
    lastMY = e.clientY;
    lastMT = now;
  });

  function endDrag(cancel) {
    if (!dragging) return;
    dragging = false;
    activePointer = null;
    if (view.length) view[0].el.classList.remove('dragging');

    if (cancel) {
      startReturn();
      return;
    }

    const flick =
      Math.abs(dragVx) > 10 &&
      Math.sign(dragVx) === Math.sign(x) &&
      Math.abs(x) > 48;

    if (Math.abs(x) > 110 || flick) {
      startFly(Math.sign(x), dragVx, dragVy);
    } else {
      startReturn();
    }
  }

  stack.addEventListener('pointerup', (e) => {
    if (e.pointerId !== activePointer) return;
    endDrag(false);
  });

  stack.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== activePointer) return;
    endDrag(true);
  });

  btnLike.addEventListener('click', () => {
    unlockAudio();
    if (phase === 'idle' && queue.length) startFly(1, 14, 0);
  });

  btnNope.addEventListener('click', () => {
    unlockAudio();
    if (phase === 'idle' && queue.length) startFly(-1, -14, 0);
  });

  btnRewind.addEventListener('click', () => {
    unlockAudio();
    undo();
  });

  btnRestart.addEventListener('click', () => {
    unlockAudio();
    restart();
  });

  btnSound.addEventListener('click', () => {
    unlockAudio();
    soundOn = !soundOn;
    btnSound.setAttribute('aria-pressed', String(soundOn));
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const target = e.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    unlockAudio();

    if (e.key === 'ArrowRight') {
      if (phase === 'idle' && queue.length) {
        e.preventDefault();
        startFly(1, 14, 0);
      }
    } else if (e.key === 'ArrowLeft') {
      if (phase === 'idle' && queue.length) {
        e.preventDefault();
        startFly(-1, -14, 0);
      }
    } else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      undo();
    }
  });

  window.addEventListener('pagehide', () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  renderStack();
})();

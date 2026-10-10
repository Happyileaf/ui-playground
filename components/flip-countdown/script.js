(function () {
  'use strict';

  var FLIP_MS = 620;
  var HALF_MS = FLIP_MS / 2;

  var units = {};
  document.querySelectorAll('.flip-unit').forEach(function (el) {
    var name = el.getAttribute('data-unit');
    var halves = el.querySelectorAll('.card-half');
    units[name] = {
      card: el.querySelector('.flip-card'),
      staticTop: halves[0],
      staticBottom: halves[1],
      topFlap: halves[2],
      bottomFlap: halves[3],
      current: null
    };
  });

  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

  function setStatic(unit, value) {
    unit.staticTop.textContent = value;
    unit.staticBottom.textContent = value;
    unit.topFlap.textContent = value;
    unit.bottomFlap.textContent = value;
    unit.topFlap.style.opacity = '0';
    unit.bottomFlap.style.opacity = '0';
    unit.current = value;
  }

  function flipTo(unit, value) {
    if (unit.current === value) return;
    var old = unit.current === null ? value : unit.current;

    if (unit.current === null) {
      setStatic(unit, value);
      return;
    }

    unit.card.classList.toggle('wide', value.length > 2);
    unit.staticTop.textContent = value;
    unit.staticBottom.textContent = old;

    unit.topFlap.textContent = old;
    unit.bottomFlap.textContent = value;
    unit.topFlap.style.opacity = '1';
    unit.bottomFlap.style.opacity = '1';

    if (unit.topAnim) unit.topAnim.cancel();
    if (unit.bottomAnim) unit.bottomAnim.cancel();

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setStatic(unit, value);
      return;
    }

    unit.topAnim = unit.topFlap.animate(
      [
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(-90deg)' }
      ],
      { duration: HALF_MS, easing: 'ease-in', fill: 'forwards', iterations: 1 }
    );

    unit.bottomFlap.style.transform = 'rotateX(90deg)';

    unit.topAnim.onfinish = function () {
      unit.topFlap.style.opacity = '0';
      playTick(0.025);

      unit.bottomAnim = unit.bottomFlap.animate(
        [
          { transform: 'rotateX(90deg)' },
          { transform: 'rotateX(0deg)' }
        ],
        { duration: HALF_MS, easing: 'ease-out', fill: 'forwards', iterations: 1 }
      );

      unit.bottomAnim.onfinish = function () {
        unit.staticBottom.textContent = value;
        unit.bottomFlap.style.opacity = '0';
        unit.bottomFlap.style.transform = '';
        unit.current = value;
      };
    };
  }

  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTick(volume) {
    var ctx = audioCtx;
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1900;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  function playChime() {
    var ctx = audioCtx;
    if (!ctx) return;
    [880, 1108.73, 1318.51].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var t = ctx.currentTime + i * 0.16;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  var startBtn = document.getElementById('startBtn');
  var resetBtn = document.getElementById('resetBtn');
  var targetLine = document.getElementById('targetLine');
  var presetBtns = document.querySelectorAll('.preset-btn');

  var state = {
    pendingMs: 300000,
    targetTs: 0,
    running: false,
    timer: null,
    lastSec: -1,
    chimePlayed: false
  };

  function formatTarget(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function partsFromSec(sec) {
    var days = Math.floor(sec / 86400);
    var hours = Math.floor((sec % 86400) / 3600);
    var mins = Math.floor((sec % 3600) / 60);
    var secs = sec % 60;
    return { days: pad(days), hours: pad(hours), minutes: pad(mins), seconds: pad(secs) };
  }

  function renderParts(sec, animate) {
    var parts = partsFromSec(sec);
    Object.keys(parts).forEach(function (key) {
      if (animate) flipTo(units[key], parts[key]);
      else setStatic(units[key], parts[key]);
    });
  }

  function stopTimer() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  }

  function tick() {
    var remainMs = state.targetTs - Date.now();
    if (remainMs <= 0) {
      if (state.lastSec !== 0) {
        renderParts(0, true);
        state.lastSec = 0;
      }
      stopTimer();
      state.running = false;
      startBtn.textContent = '开始';
      document.body.classList.add('finished');
      if (!state.chimePlayed) {
        playChime();
        state.chimePlayed = true;
      }
      return;
    }

    var sec = Math.ceil(remainMs / 1000);
    if (sec !== state.lastSec) {
      renderParts(sec, true);
      state.lastSec = sec;
    }
  }

  function start() {
    ensureAudio();
    document.body.classList.remove('finished');
    state.chimePlayed = false;

    if (state.lastSec <= 0 && state.pendingMs > 0) {
      state.targetTs = Date.now() + state.pendingMs;
      state.lastSec = Math.ceil(state.pendingMs / 1000);
    } else if (!state.running && state.targetTs > Date.now()) {
      // continue from paused state
    } else {
      state.targetTs = Date.now() + state.pendingMs;
      state.lastSec = Math.ceil(state.pendingMs / 1000);
    }

    targetLine.textContent = '目标时刻 ' + formatTarget(state.targetTs);
    state.running = true;
    startBtn.textContent = '暂停';
    stopTimer();
    tick();
    state.timer = setInterval(tick, 200);
  }

  function pause() {
    if (!state.running) return;
    state.pendingMs = Math.max(0, state.targetTs - Date.now());
    state.running = false;
    stopTimer();
    startBtn.textContent = '继续';
  }

  function reset() {
    stopTimer();
    state.running = false;
    state.targetTs = 0;
    state.chimePlayed = false;
    document.body.classList.remove('finished');
    startBtn.textContent = '开始';
    targetLine.textContent = '目标时刻 ——';
    var sec = Math.ceil(state.pendingMs / 1000);
    state.lastSec = sec;
    renderParts(sec, false);
  }

  function loadPreset(seconds) {
    stopTimer();
    state.running = false;
    state.pendingMs = seconds * 1000;
    state.targetTs = 0;
    state.chimePlayed = false;
    document.body.classList.remove('finished');
    startBtn.textContent = '开始';
    targetLine.textContent = '目标时刻 ——';
    state.lastSec = seconds;
    renderParts(seconds, false);
  }

  function loadNewYear() {
    stopTimer();
    var now = new Date();
    var target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0).getTime();
    state.running = true;
    state.targetTs = target;
    state.chimePlayed = false;
    document.body.classList.remove('finished');
    startBtn.textContent = '暂停';
    targetLine.textContent = '目标时刻 ' + formatTarget(target);
    var sec = Math.ceil((target - Date.now()) / 1000);
    state.lastSec = sec;
    renderParts(sec, false);
    state.timer = setInterval(tick, 200);
  }

  startBtn.addEventListener('click', function () {
    if (state.running) pause();
    else start();
  });

  resetBtn.addEventListener('click', reset);

  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      presetBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ensureAudio();
      if (btn.hasAttribute('data-newyear')) {
        loadNewYear();
      } else {
        loadPreset(parseInt(btn.getAttribute('data-seconds'), 10));
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      if (state.running) pause();
      else start();
    } else if (e.code === 'KeyR') {
      reset();
    }
  });

  renderParts(300, false);
})();

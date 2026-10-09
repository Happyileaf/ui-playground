(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fields = Array.from(document.querySelectorAll('.copy-field'));
  const defaultStatus = document.getElementById('copyStatus');

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

  function playTone() {
    if (reduceMotion) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.top = '-1000px';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (e) {
      succeeded = false;
    }
    document.body.removeChild(temp);
    return succeeded;
  }

  function getValue(field) {
    if (field.dataset.copyValue) return field.dataset.copyValue;
    const input = field.querySelector('.copy-input');
    const code = field.querySelector('.copy-code');
    if (input) return input.value;
    if (code) return code.textContent.trim();
    return '';
  }

  let rafId = null;
  const magneticItems = [];

  fields.forEach((field) => {
    const btn = field.querySelector('.copy-btn');
    const item = { field, btn, mx: 0, my: 0, tMx: 0, tMy: 0, hovering: false };
    magneticItems.push(item);

    field.addEventListener('pointermove', (e) => {
      if (reduceMotion) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      item.tMx = Math.min(10, Math.max(-10, (e.clientX - cx) * 0.28));
      item.tMy = Math.min(7, Math.max(-7, (e.clientY - cy) * 0.28));
      item.hovering = true;
      ensureLoop();
    });

    field.addEventListener('pointerleave', () => {
      item.hovering = false;
      item.tMx = 0;
      item.tMy = 0;
      ensureLoop();
    });

    let resetTimer = null;

    btn.addEventListener('click', async () => {
      const value = getValue(field);
      let ok = false;
      try {
        ok = await copyText(value);
      } catch (e) {
        ok = false;
      }

      if (ok) {
        btn.classList.add('is-done', 'is-flashing');
        field.classList.add('is-copied');
        playTone();

        if (field.id === 'copyField' && defaultStatus) {
          defaultStatus.textContent = '链接已复制到剪贴板，快去分享吧';
          defaultStatus.className = 'copy-status is-success';
        }

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          btn.classList.remove('is-done');
          field.classList.remove('is-copied');
          if (field.id === 'copyField' && defaultStatus) {
            defaultStatus.textContent = '链接已生成，点击右侧按钮复制';
            defaultStatus.className = 'copy-status';
          }
        }, 2200);
      } else if (field.id === 'copyField' && defaultStatus) {
        defaultStatus.textContent = '复制失败，请手动选中链接后复制';
        defaultStatus.className = 'copy-status is-error';
      }
    });
  });

  function writeItem(item) {
    item.btn.style.transform = `translate3d(${item.mx.toFixed(2)}px, ${item.my.toFixed(2)}px, 0)`;
  }

  function tick() {
    let alive = false;
    magneticItems.forEach((item) => {
      item.mx += (item.tMx - item.mx) * 0.22;
      item.my += (item.tMy - item.my) * 0.22;

      const settled = Math.abs(item.tMx - item.mx) < 0.05 && Math.abs(item.tMy - item.my) < 0.05;
      if (settled && !item.hovering) {
        item.mx = 0;
        item.my = 0;
      } else {
        alive = true;
      }
      writeItem(item);
    });

    if (alive) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function ensureLoop() {
    if (reduceMotion) return;
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('pagehide', () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  magneticItems.forEach(writeItem);
})();

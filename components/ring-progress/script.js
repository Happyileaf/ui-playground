(function () {
  const wrap = document.getElementById('ringWrap');
  const valueCircle = document.getElementById('ringValue');
  const percentEl = document.getElementById('ringPercent');
  const stateEl = document.getElementById('ringState');
  const knobZone = document.getElementById('knobZone');
  const startBtn = document.getElementById('startBtn');
  const setHalfBtn = document.getElementById('setHalfBtn');
  const resetBtn = document.getElementById('resetBtn');

  const CIRC = 2 * Math.PI * 84;
  valueCircle.style.strokeDasharray = String(CIRC);

  let value = 0;
  let timer = null;
  let dragging = false;

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function render() {
    const v = Math.round(value);
    valueCircle.style.strokeDashoffset = String(CIRC * (1 - value / 100));
    percentEl.textContent = v;
    wrap.classList.toggle('is-complete', v >= 100);
    knobZone.setAttribute('aria-valuenow', String(v));
    knobZone.setAttribute('aria-valuetext', `百分之 ${v}`);

    if (v <= 0) stateEl.textContent = '待开始';
    else if (v < 100) stateEl.textContent = timer !== null ? '进行中' : '已暂停';
    else stateEl.textContent = '已完成';
  }

  function setValue(v) {
    value = Math.max(0, Math.min(100, v));
    render();
  }

  function valueFromPoint(clientX, clientY) {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let angle = Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return Math.round((angle / 360) * 100);
  }

  knobZone.addEventListener('pointerdown', (e) => {
    stopTimer();
    dragging = true;
    wrap.classList.add('is-dragging');
    knobZone.setPointerCapture(e.pointerId);
    setValue(valueFromPoint(e.clientX, e.clientY));
  });

  knobZone.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setValue(valueFromPoint(e.clientX, e.clientY));
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
  }

  knobZone.addEventListener('pointerup', endDrag);
  knobZone.addEventListener('pointercancel', endDrag);

  knobZone.addEventListener('keydown', (e) => {
    let handled = true;
    stopTimer();
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setValue(value + (e.shiftKey ? 10 : 1));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setValue(value - (e.shiftKey ? 10 : 1));
    else if (e.key === 'Home') setValue(0);
    else if (e.key === 'End') setValue(100);
    else handled = false;
    if (handled) e.preventDefault();
  });

  startBtn.addEventListener('click', () => {
    stopTimer();
    if (value >= 100) value = 0;
    render();
    timer = setInterval(() => {
      const step = Math.random() * 9 + 3;
      if (value + step >= 100) {
        setValue(100);
        stopTimer();
      } else {
        setValue(value + step);
      }
    }, 220);
  });

  setHalfBtn.addEventListener('click', () => {
    stopTimer();
    setValue(50);
  });

  resetBtn.addEventListener('click', () => {
    stopTimer();
    setValue(0);
  });

  render();
})();

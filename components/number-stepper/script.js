(function () {
  function initStepper(root) {
    const input = root.querySelector('.stepper-input');
    const buttons = Array.from(root.querySelectorAll('.stepper-btn'));
    const readout = document.querySelector('[data-readout]');

    const min = parseFloat(root.dataset.min);
    const max = parseFloat(root.dataset.max);
    const step = parseFloat(root.dataset.step);
    const precision = parseInt(root.dataset.precision || '0', 10);
    const unit = root.dataset.unit || '';
    const prefix = root.dataset.prefix || '';

    let value = clamp(parseFloat(input.value));
    let timers = { hold: null, repeat: null };

    function clamp(v) {
      if (Number.isNaN(v)) v = min;
      v = Math.min(max, Math.max(min, v));
      const factor = Math.pow(10, precision);
      return Math.round(v * factor) / factor;
    }

    function format(v) {
      return v.toFixed(precision);
    }

    function render(shake) {
      input.value = format(value);
      input.setAttribute('aria-valuenow', String(value));
      input.setAttribute('aria-valuetext', `${prefix}${format(value)}${unit ? ' ' + unit : ''}`);
      buttons.forEach((btn) => {
        const dir = parseInt(btn.dataset.dir, 10);
        const atEdge = (dir < 0 && value <= min) || (dir > 0 && value >= max);
        btn.classList.toggle('is-disabled', atEdge);
        btn.setAttribute('aria-disabled', String(atEdge));
        btn.tabIndex = atEdge ? -1 : 0;
      });
      if (readout && root.closest('.featured')) {
        readout.textContent = `${format(value)} ${unit}`;
      }
      if (shake) {
        input.classList.remove('is-invalid');
        void input.offsetWidth;
        input.classList.add('is-invalid');
      }
    }

    function setValue(v, shake) {
      const next = clamp(v);
      if (next !== value) {
        value = next;
        render(false);
      } else if (shake) {
        render(true);
      }
    }

    function nudge(dir) {
      setValue(value + dir * step, true);
    }

    function clearTimers() {
      if (timers.hold) { clearTimeout(timers.hold); timers.hold = null; }
      if (timers.repeat) { clearTimeout(timers.repeat); timers.repeat = null; }
    }

    function startRepeat(dir) {
      let gap = 130;
      const tick = () => {
        nudge(dir);
        if (value <= min || value >= max) return;
        gap = Math.max(48, gap - 9);
        timers.repeat = setTimeout(tick, gap);
      };
      timers.repeat = setTimeout(tick, gap);
    }

    buttons.forEach((btn) => {
      const dir = parseInt(btn.dataset.dir, 10);

      btn.addEventListener('pointerdown', (e) => {
        if (btn.classList.contains('is-disabled')) return;
        e.preventDefault();
        clearTimers();
        nudge(dir);
        timers.hold = setTimeout(() => startRepeat(dir), 380);
      });

      ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
        btn.addEventListener(evt, clearTimers);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          nudge(dir);
        }
      });
    });

    input.addEventListener('keydown', (e) => {
      let handled = true;
      switch (e.key) {
        case 'ArrowUp': nudge(1); break;
        case 'ArrowDown': nudge(-1); break;
        case 'PageUp': setValue(value + step * 10, true); break;
        case 'PageDown': setValue(value - step * 10, true); break;
        case 'Home': setValue(min, true); break;
        case 'End': setValue(max, true); break;
        default: handled = false;
      }
      if (handled) e.preventDefault();
    });

    function commit() {
      const raw = input.value.trim();
      const parsed = parseFloat(raw);
      if (raw === '' || Number.isNaN(parsed)) {
        render(false);
        return;
      }
      const next = clamp(parsed);
      value = next;
      render(parsed !== next && parseFloat(raw) !== next);
    }

    input.addEventListener('change', commit);
    input.addEventListener('blur', commit);

    input.addEventListener('focus', () => {
      input.select();
    });

    render(false);
  }

  document.querySelectorAll('.stepper').forEach(initStepper);
})();

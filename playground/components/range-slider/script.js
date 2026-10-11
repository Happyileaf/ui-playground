const sliderConfigs = {
  price: {
    min: 0,
    max: 10000,
    step: 100,
    gap: 500,
    valueMin: 500,
    valueMax: 8000,
    format: (v) => `¥${v.toLocaleString('zh-CN')}`,
    output: document.getElementById('priceValue'),
    tips: [document.getElementById('priceTipMin'), document.getElementById('priceTipMax')],
    summary: (lo, hi) => `¥${lo.toLocaleString('zh-CN')} — ¥${hi.toLocaleString('zh-CN')}`
  },
  age: {
    min: 0,
    max: 20,
    step: 1,
    gap: 1,
    valueMin: 1,
    valueMax: 8,
    format: (v) => `${v} 年`,
    output: document.getElementById('ageValue'),
    tips: [document.getElementById('ageTipMin'), document.getElementById('ageTipMax')],
    summary: (lo, hi) => `${lo} — ${hi} 年`
  }
};

function snap(value, config) {
  const { min, max, step } = config;
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

function createDualRange(rootId, config) {
  const root = document.getElementById(rootId);
  const fill = root.querySelector('.slider-fill');
  const thumbMin = root.querySelector('.thumb-min');
  const thumbMax = root.querySelector('.thumb-max');

  let minVal = config.valueMin;
  let maxVal = config.valueMax;

  function percent(value) {
    return ((value - config.min) / (config.max - config.min)) * 100;
  }

  function render() {
    const pMin = percent(minVal);
    const pMax = percent(maxVal);
    thumbMin.style.left = `${pMin}%`;
    thumbMax.style.left = `${pMax}%`;
    fill.style.left = `${pMin}%`;
    fill.style.width = `${pMax - pMin}%`;

    thumbMin.setAttribute('aria-valuenow', String(minVal));
    thumbMax.setAttribute('aria-valuenow', String(maxVal));
    thumbMin.setAttribute('aria-valuetext', config.format(minVal));
    thumbMax.setAttribute('aria-valuetext', config.format(maxVal));

    config.tips[0].textContent = config.format(minVal);
    config.tips[1].textContent = config.format(maxVal);
    config.output.textContent = config.summary(minVal, maxVal);

    if (typeof config.onChange === 'function') config.onChange(minVal, maxVal);
  }

  function setValues(nextMin, nextMax) {
    minVal = snap(nextMin, config);
    maxVal = snap(nextMax, config);

    if (minVal + config.gap > maxVal) {
      if (minVal !== snap(nextMin, config)) {
        maxVal = Math.min(config.max, minVal + config.gap);
      } else {
        minVal = Math.max(config.min, maxVal - config.gap);
      }
    }
    render();
  }

  function valueFromEvent(e) {
    const rect = root.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return config.min + ratio * (config.max - config.min);
  }

  function bindDrag(thumb, which) {
    thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      thumb.classList.add('is-active');
      thumb.setPointerCapture(e.pointerId);

      const move = (ev) => {
        const value = valueFromEvent(ev);
        if (which === 'min') {
          setValues(Math.min(value, maxVal - config.gap), maxVal);
        } else {
          setValues(minVal, Math.max(value, minVal + config.gap));
        }
      };
      const up = () => {
        thumb.classList.remove('is-active');
        thumb.removeEventListener('pointermove', move);
        thumb.removeEventListener('pointerup', up);
        thumb.removeEventListener('pointercancel', up);
      };
      thumb.addEventListener('pointermove', move);
      thumb.addEventListener('pointerup', up);
      thumb.addEventListener('pointercancel', up);
    });
  }

  function bindKeyboard(thumb, which) {
    thumb.addEventListener('keydown', (e) => {
      const bigStep = Math.max(config.step * 10, (config.max - config.min) / 10);
      let delta = 0;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          delta = e.shiftKey ? -bigStep : -config.step;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          delta = e.shiftKey ? bigStep : config.step;
          break;
        case 'PageUp':
          delta = bigStep;
          break;
        case 'PageDown':
          delta = -bigStep;
          break;
        case 'Home':
          if (which === 'min') {
            setValues(config.min, Math.max(maxVal, config.min + config.gap));
          } else {
            setValues(Math.min(minVal, config.max - config.gap), config.max);
          }
          e.preventDefault();
          return;
        case 'End':
          if (which === 'min') {
            setValues(Math.min(maxVal - config.gap, config.max - config.gap), maxVal);
          } else {
            setValues(minVal, Math.max(minVal + config.gap, config.max));
          }
          e.preventDefault();
          return;
        default:
          return;
      }

      e.preventDefault();
      if (which === 'min') {
        setValues(minVal + delta, maxVal);
      } else {
        setValues(minVal, maxVal + delta);
      }
    });
  }

  bindDrag(thumbMin, 'min');
  bindDrag(thumbMax, 'max');
  bindKeyboard(thumbMin, 'min');
  bindKeyboard(thumbMax, 'max');
  render();

  return {
    setRange(lo, hi) {
      setValues(lo, hi);
    },
    getRange() {
      return [minVal, maxVal];
    }
  };
}

const resultCount = document.getElementById('resultCount');
const priceSlider = createDualRange('priceSlider', sliderConfigs.price);
createDualRange('ageSlider', sliderConfigs.age);

function updateResultCount() {
  const [lo, hi] = priceSlider.getRange();
  const span = hi - lo;
  const ratio = span / 10000;
  const count = Math.round(42 + ratio * 430 + ((lo + hi) % 17) * 3);
  resultCount.textContent = String(count);
}

sliderConfigs.price.onChange = updateResultCount;
updateResultCount();

document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.target === 'price') {
      priceSlider.setRange(Number(btn.dataset.min), Number(btn.dataset.max));
      document.querySelectorAll('.preset-btn[data-target="price"]').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
      });
    }
  });
});

(function () {
  'use strict';

  var state = { h: 219, s: 82, l: 65 };

  var preview = document.getElementById('preview');
  var nativeColor = document.getElementById('nativeColor');
  var outHex = document.getElementById('outHex');
  var outRgb = document.getElementById('outRgb');
  var outHsl = document.getElementById('outHsl');

  var hueRange = document.getElementById('hueRange');
  var satRange = document.getElementById('satRange');
  var ligRange = document.getElementById('ligRange');
  var hueVal = document.getElementById('hueVal');
  var satVal = document.getElementById('satVal');
  var ligVal = document.getElementById('ligVal');

  var presetsBox = document.getElementById('presets');
  var harmonyBox = document.getElementById('harmony');
  var toast = document.getElementById('toast');

  var PRESETS = [
    ['#5b8def', '晴空蓝'], ['#8b5cf6', '紫罗兰'], ['#ec4899', '樱花粉'],
    ['#f43f5e', '玫瑰红'], ['#f97316', '落日橙'], ['#f7b955', '琥珀'],
    ['#22c55e', '翠绿'], ['#14b8a6', '青松'], ['#06b6d4', '青色'],
    ['#64748b', '岩灰'], ['#f8fafc', '近白'], ['#0f172a', '墨蓝']
  ];

  var HARMONY = [
    { label: '互补', dh: 180, ds: 0, dl: 0 },
    { label: '邻近 -', dh: -30, ds: 0, dl: 0 },
    { label: '邻近 +', dh: 30, ds: 0, dl: 0 },
    { label: '三角 -', dh: -120, ds: 0, dl: 0 },
    { label: '三角 +', dh: 120, ds: 0, dl: 0 },
    { label: '浅色', dh: 0, ds: -10, dl: 18 },
    { label: '深色', dh: 0, ds: 8, dl: -20 }
  ];

  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
    }, 1600);
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    if (s === 0) {
      var g = Math.round(l * 255);
      return [g, g, g];
    }

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    ];
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var h = 0;
    var s = 0;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map(function (v) {
      return clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    }).join('').toUpperCase();
  }

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
    if (!m) return null;
    var raw = m[1];
    if (raw.length === 3) {
      raw = raw.split('').map(function (c) { return c + c; }).join('');
    }
    return [0, 2, 4].map(function (i) {
      return parseInt(raw.slice(i, i + 2), 16);
    });
  }

  function hslString(h, s, l) {
    return 'hsl(' + Math.round(h) + ', ' + clamp(s, 0, 100) + '%, ' + clamp(l, 0, 100) + '%)';
  }

  function swatchEl(color, tip, onClick) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'swatch';
    el.style.background = color;
    el.setAttribute('aria-label', tip);
    var tipEl = document.createElement('span');
    tipEl.className = 'tip';
    tipEl.textContent = tip;
    el.appendChild(tipEl);
    el.addEventListener('click', onClick);
    return el;
  }

  function renderHarmony() {
    harmonyBox.innerHTML = '';
    HARMONY.forEach(function (rule) {
      var h = state.h + rule.dh;
      var s = clamp(state.s + rule.ds, 0, 100);
      var l = clamp(state.l + rule.dl, 0, 100);
      var rgb = hslToRgb(h, s, l);
      var hex = rgbToHex(rgb);
      harmonyBox.appendChild(swatchEl(hex, rule.label + ' ' + hex, function () {
        applyColor({ h: h, s: s, l: l }, true);
      }));
    });
  }

  function render() {
    var rgb = hslToRgb(state.h, state.s, state.l);
    var hex = rgbToHex(rgb);
    var hsl = hslString(state.h, state.s, state.l);

    preview.style.background = hsl;
    nativeColor.value = hex.toLowerCase();
    outHex.textContent = hex;
    outRgb.textContent = rgb.join(', ');
    outHsl.textContent = Math.round(state.h) + '°, ' + state.s + '%, ' + state.l + '%';

    hueRange.value = state.h;
    satRange.value = state.s;
    ligRange.value = state.l;
    hueVal.textContent = state.h + '°';
    satVal.textContent = state.s + '%';
    ligVal.textContent = state.l + '%';

    satRange.style.background = 'linear-gradient(90deg, '
      + hslString(state.h, 0, state.l) + ', '
      + hslString(state.h, 100, state.l) + ')';
    ligRange.style.background = 'linear-gradient(90deg, #000, '
      + hslString(state.h, state.s, 50) + ', #fff)';

    renderHarmony();
  }

  function applyColor(next, announce) {
    state.h = Math.round(next.h) % 360;
    state.s = clamp(Math.round(next.s), 0, 100);
    state.l = clamp(Math.round(next.l), 0, 100);
    render();
    if (announce) showToast('已应用 ' + rgbToHex(hslToRgb(state.h, state.s, state.l)));
  }

  hueRange.addEventListener('input', function () {
    state.h = Number(hueRange.value);
    render();
  });
  satRange.addEventListener('input', function () {
    state.s = Number(satRange.value);
    render();
  });
  ligRange.addEventListener('input', function () {
    state.l = Number(ligRange.value);
    render();
  });

  nativeColor.addEventListener('input', function () {
    var rgb = hexToRgb(nativeColor.value);
    if (rgb) applyColor(rgbToHsl(rgb[0], rgb[1], rgb[2]), false);
  });

  PRESETS.forEach(function (pair) {
    var rgb = hexToRgb(pair[0]);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    presetsBox.appendChild(swatchEl(pair[0], pair[1] + ' ' + pair[0], function () {
      applyColor(hsl, true);
    }));
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('已复制 ' + text);
      }).catch(function () {
        legacyCopy(text);
      });
    } else {
      legacyCopy(text);
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('已复制 ' + text);
    } catch (err) {
      showToast('复制失败，请手动选择');
    }
    document.body.removeChild(ta);
  }

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-copy');
      var text = '';
      if (kind === 'hex') text = outHex.textContent;
      if (kind === 'rgb') text = 'rgb(' + outRgb.textContent + ')';
      if (kind === 'hsl') text = 'hsl(' + outHsl.textContent.replace(/°/g, '') + ')';
      copyText(text);
    });
  });

  render();
})();

(function () {
  'use strict';

  const trigger = document.getElementById('trigger');
  const triggerText = document.getElementById('triggerText');
  const clearBtn = document.getElementById('clearBtn');
  const panel = document.getElementById('panel');
  const calGrids = document.getElementById('calGrids');
  const calMeta = document.getElementById('calMeta');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const resetBtn = document.getElementById('resetBtn');
  const applyBtn = document.getElementById('applyBtn');
  const qdStart = document.getElementById('qdStart');
  const qdEnd = document.getElementById('qdEnd');
  const summary = document.getElementById('summary');
  const sumStart = document.getElementById('sumStart');
  const sumEnd = document.getElementById('sumEnd');
  const sumNights = document.getElementById('sumNights');

  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();

  let draftStart = null;
  let draftEnd = null;
  let hoverTs = null;

  let appliedStart = null;
  let appliedEnd = null;

  function dayStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function addMonths(y, m, delta) {
    return { year: y + Math.floor((m + delta) / 12), month: ((m + delta) % 12 + 12) % 12 };
  }

  function fmt(ts) {
    if (ts == null) return '—';
    const d = new Date(ts);
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
  }

  function fmtCN(ts) {
    if (ts == null) return '—';
    const d = new Date(ts);
    return d.getMonth() + 1 + '月' + d.getDate() + '日';
  }

  function monthLabel(y, m) {
    return y + '年 ' + (m + 1) + '月';
  }

  function previewRange() {
    if (draftStart != null && draftEnd == null && hoverTs != null) {
      return hoverTs < draftStart
        ? { lo: hoverTs, hi: draftStart, preview: true }
        : { lo: draftStart, hi: hoverTs, preview: true };
    }
    if (draftStart != null && draftEnd != null) {
      return { lo: Math.min(draftStart, draftEnd), hi: Math.max(draftStart, draftEnd), preview: false };
    }
    if (draftStart != null) {
      return { lo: draftStart, hi: draftStart, preview: false };
    }
    return null;
  }

  function buildMonth(year, month) {
    const cal = document.createElement('div');
    cal.className = 'calendar';

    const title = document.createElement('p');
    title.className = 'cal-title';
    title.textContent = monthLabel(year, month);
    cal.appendChild(title);

    const week = document.createElement('div');
    week.className = 'cal-week';
    WEEK.forEach(function (w) {
      const s = document.createElement('span');
      s.textContent = w;
      week.appendChild(s);
    });
    cal.appendChild(week);

    const first = new Date(year, month, 1);
    const lead = first.getDay();
    const gridStart = new Date(year, month, 1 - lead);
    const todayTs = dayStart(new Date());
    const range = previewRange();
    const focusedKey = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.ts : null;

    for (let r = 0; r < 6; r++) {
      const row = document.createElement('div');
      row.className = 'cal-row';
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c;
        const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + idx);
        const ts = dayStart(d);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day';
        btn.textContent = d.getDate();
        btn.dataset.ts = ts;

        const inMonth = d.getMonth() === month;
        if (!inMonth) btn.classList.add('is-muted');
        if (ts === todayTs) btn.classList.add('is-today');

        if (range) {
          if (ts > range.lo && ts < range.hi) {
            btn.classList.add(range.preview ? 'is-preview' : 'is-range');
          }
          if (ts === range.lo) btn.classList.add('is-start');
          if (ts === range.hi) btn.classList.add('is-end');
        }

        btn.addEventListener('click', function () {
          pickDate(ts);
        });
        btn.addEventListener('mouseenter', function () {
          if (draftStart != null && draftEnd == null) {
            hoverTs = ts;
            render();
          }
        });
        btn.addEventListener('focus', function () {
          hoverTs = ts;
          if (draftStart != null && draftEnd == null) render();
        });

        if (String(ts) === focusedKey) {
          requestAnimationFrame(function () { btn.focus({ preventScroll: true }); });
        }
        row.appendChild(btn);
      }
      cal.appendChild(row);
    }
    return cal;
  }

  function render() {
    calMeta.textContent = '';
    const left = document.createElement('span');
    left.textContent = monthLabel(viewYear, viewMonth);
    const next = addMonths(viewYear, viewMonth, 1);
    const right = document.createElement('span');
    right.textContent = monthLabel(next.year, next.month);
    calMeta.appendChild(left);
    calMeta.appendChild(right);

    calGrids.textContent = '';
    calGrids.appendChild(buildMonth(viewYear, viewMonth));
    calGrids.appendChild(buildMonth(next.year, next.month));

    qdStart.textContent = fmtCN(draftStart);
    qdEnd.textContent = fmtCN(draftEnd);
    applyBtn.disabled = !(draftStart != null && draftEnd != null);

    document.querySelectorAll('.preset').forEach(function (b) { b.classList.remove('is-on'); });
  }

  function pickDate(ts) {
    if (draftStart == null || (draftStart != null && draftEnd != null)) {
      draftStart = ts;
      draftEnd = null;
    } else if (ts < draftStart) {
      draftStart = ts;
    } else if (ts === draftStart) {
      draftEnd = ts;
    } else {
      draftEnd = ts;
    }
    hoverTs = ts;
    render();
    if (draftStart != null && draftEnd != null) {
      applyBtn.focus();
    }
  }

  function openPanel() {
    draftStart = appliedStart;
    draftEnd = appliedEnd;
    hoverTs = null;
    if (appliedStart != null) {
      const d = new Date(appliedStart);
      viewYear = d.getFullYear();
      viewMonth = d.getMonth();
    }
    panel.hidden = false;
    trigger.classList.add('is-active');
    trigger.setAttribute('aria-expanded', 'true');
    render();
  }

  function closePanel() {
    panel.hidden = true;
    trigger.classList.remove('is-active');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function commit() {
    appliedStart = Math.min(draftStart, draftEnd);
    appliedEnd = Math.max(draftStart, draftEnd);

    triggerText.textContent = fmt(appliedStart) + '  —  ' + fmt(appliedEnd);
    trigger.classList.remove('is-empty');
    clearBtn.hidden = false;

    sumStart.textContent = fmtCN(appliedStart);
    sumEnd.textContent = fmtCN(appliedEnd);
    sumNights.textContent = Math.round((appliedEnd - appliedStart) / 86400000);
    summary.hidden = false;

    closePanel();
  }

  function clearAll() {
    appliedStart = null;
    appliedEnd = null;
    draftStart = null;
    draftEnd = null;
    triggerText.textContent = '选择入住 — 退房日期';
    trigger.classList.add('is-empty');
    clearBtn.hidden = true;
    summary.hidden = true;
  }

  function applyPreset(days, mode) {
    const todayTs = dayStart(new Date());
    if (mode === 'thisMonth') {
      const d = new Date();
      draftStart = dayStart(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      draftStart = todayTs - (days - 1) * 86400000;
    }
    draftEnd = todayTs;
    const d = new Date(draftStart);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    commit();
  }

  trigger.addEventListener('click', function (e) {
    if (e.target.closest('#clearBtn')) return;
    if (panel.hidden) openPanel();
    else closePanel();
  });

  clearBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    clearAll();
  });

  prevBtn.addEventListener('click', function () {
    const p = addMonths(viewYear, viewMonth, -1);
    viewYear = p.year;
    viewMonth = p.month;
    render();
  });

  nextBtn.addEventListener('click', function () {
    const p = addMonths(viewYear, viewMonth, 1);
    viewYear = p.year;
    viewMonth = p.month;
    render();
  });

  resetBtn.addEventListener('click', function () {
    draftStart = null;
    draftEnd = null;
    hoverTs = null;
    render();
  });

  applyBtn.addEventListener('click', function () {
    if (draftStart != null && draftEnd != null) commit();
  });

  document.querySelectorAll('.preset').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const v = btn.dataset.preset;
      if (v === 'thisMonth') applyPreset(0, 'thisMonth');
      else applyPreset(parseInt(v, 10), 'days');
    });
  });

  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closePanel();
      trigger.focus();
    } else if (e.key === 'ArrowLeft' && !e.target.classList.contains('day')) {
      prevBtn.click();
    } else if (e.key === 'ArrowRight' && !e.target.classList.contains('day')) {
      nextBtn.click();
    }
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) {
      closePanel();
    }
  });

  trigger.classList.add('is-empty');
})();

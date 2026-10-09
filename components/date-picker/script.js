(function () {
  'use strict';

  var MONTHS = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];

  var dateInput = document.getElementById('dateInput');
  var trigger = dateInput.closest('.date-trigger');
  var clearDate = document.getElementById('clearDate');
  var panel = document.getElementById('dpPanel');
  var prevMonthBtn = document.getElementById('prevMonth');
  var nextMonthBtn = document.getElementById('nextMonth');
  var monthLabel = document.getElementById('monthLabel');
  var dayGrid = document.getElementById('dayGrid');
  var todayBtn = document.getElementById('todayBtn');
  var closeBtn = document.getElementById('closeBtn');
  var resultLine = document.getElementById('resultLine');

  var today = startOfDay(new Date());
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var cursor = new Date(today);
  var selected = null;

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(a, b) {
    return !!a && !!b
      && a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function isBeforeDay(a, b) {
    return a.getTime() < b.getTime();
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function formatChinese(d) {
    var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · ' + week;
  }

  function render() {
    monthLabel.textContent = viewYear + ' 年 ' + MONTHS[viewMonth];
    dayGrid.innerHTML = '';

    var first = new Date(viewYear, viewMonth, 1);
    var startOffset = first.getDay();
    var gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

    for (var i = 0; i < 42; i++) {
      (function (i) {
        var d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-cell';
        btn.setAttribute('role', 'gridcell');
        btn.textContent = String(d.getDate());

        if (d.getMonth() !== viewMonth) btn.classList.add('is-muted');
        if (isSameDay(d, today)) btn.classList.add('is-today');
        if (isSameDay(d, selected)) btn.classList.add('is-selected');
        if (isBeforeDay(d, today)) btn.disabled = true;

        btn.dataset.index = String(i);
        btn.addEventListener('click', function () {
          chooseDate(d);
        });
        dayGrid.appendChild(btn);
      })(i);
    }
  }

  function focusCursor() {
    var first = new Date(viewYear, viewMonth, 1);
    var gridStart = new Date(viewYear, viewMonth, 1 - first.getDay());
    var targetIndex = Math.round((cursor - gridStart) / 86400000);
    var cell = dayGrid.querySelectorAll('.day-cell')[targetIndex];
    if (cell) cell.focus();
  }

  function shiftMonth(delta) {
    viewMonth += delta;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    } else if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
    cursor = new Date(viewYear, viewMonth, Math.min(cursor.getDate(), daysInMonth(viewYear, viewMonth)));
    render();
    focusCursor();
  }

  function daysInMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }

  function moveCursor(days) {
    var next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + days);
    if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
      viewYear = next.getFullYear();
      viewMonth = next.getMonth();
      render();
    }
    cursor = next;
    focusCursor();
  }

  function openPanel() {
    if (!panel.hidden) return;
    panel.hidden = false;
    trigger.classList.add('is-active');
    dateInput.setAttribute('aria-expanded', 'true');
    if (selected) {
      viewYear = selected.getFullYear();
      viewMonth = selected.getMonth();
      cursor = new Date(selected);
    } else {
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      cursor = new Date(today);
    }
    render();
    requestAnimationFrame(function () {
      focusCursor();
    });
    document.addEventListener('mousedown', onOutside, true);
  }

  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.classList.remove('is-active');
    dateInput.setAttribute('aria-expanded', 'false');
    document.removeEventListener('mousedown', onOutside, true);
    dateInput.focus();
  }

  function onOutside(e) {
    if (!panel.contains(e.target) && !trigger.contains(e.target)) {
      closePanel();
    }
  }

  function chooseDate(d) {
    if (isBeforeDay(d, today)) return;
    selected = new Date(d);
    cursor = new Date(d);
    dateInput.value = formatDate(d);
    clearDate.hidden = false;
    resultLine.hidden = false;
    resultLine.innerHTML = '已预约 <strong>' + formatChinese(d) + '</strong>';
    render();
    closePanel();
  }

  dateInput.addEventListener('click', openPanel);
  trigger.addEventListener('click', function (e) {
    if (e.target === clearDate || clearDate.contains(e.target)) return;
    openPanel();
  });

  prevMonthBtn.addEventListener('click', function () { shiftMonth(-1); });
  nextMonthBtn.addEventListener('click', function () { shiftMonth(1); });
  closeBtn.addEventListener('click', closePanel);

  todayBtn.addEventListener('click', function () {
    chooseDate(new Date(today));
  });

  clearDate.addEventListener('click', function () {
    selected = null;
    dateInput.value = '';
    clearDate.hidden = true;
    resultLine.hidden = true;
    if (!panel.hidden) render();
  });

  panel.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveCursor(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveCursor(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveCursor(-7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveCursor(7);
        break;
      case 'PageUp':
        e.preventDefault();
        shiftMonth(e.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        e.preventDefault();
        shiftMonth(e.shiftKey ? 12 : 1);
        break;
      case 'Home':
        e.preventDefault();
        cursor = new Date(viewYear, viewMonth, 1);
        focusCursor();
        break;
      case 'End':
        e.preventDefault();
        cursor = new Date(viewYear, viewMonth, daysInMonth(viewYear, viewMonth));
        focusCursor();
        break;
      case 'Enter':
        e.preventDefault();
        if (!isBeforeDay(cursor, today)) {
          chooseDate(new Date(cursor));
        }
        break;
      case 'Escape':
        e.preventDefault();
        closePanel();
        break;
      case 'Tab':
        e.preventDefault();
        break;
    }
  });

  render();
})();

(function () {
  'use strict';

  var openBtn = document.getElementById('openDeleteBtn');
  var overlay = document.getElementById('dialogOverlay');
  var dialog = overlay.querySelector('.dialog');
  var input = document.getElementById('confirmInput');
  var holdBtn = document.getElementById('holdBtn');
  var holdLabel = document.getElementById('holdLabel');
  var ringFill = document.getElementById('ringFill');
  var cancelBtn = document.getElementById('cancelBtn');
  var panel = document.getElementById('projectPanel');
  var toast = document.getElementById('toast');
  var toastText = document.getElementById('toastText');
  var undoBtn = document.getElementById('undoBtn');

  var WORD = 'DELETE';
  var HOLD_MS = 1200;
  var RING_LEN = 276.5;
  var UNDO_MS = 6000;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastFocused = null;
  var holding = false;
  var holdStart = 0;
  var rafId = null;
  var undoTimer = null;
  var toastTimer = null;

  function setHoldEnabled(enabled) {
    holdBtn.disabled = !enabled;
    holdBtn.setAttribute('aria-disabled', String(!enabled));
  }

  function openDialog() {
    lastFocused = document.activeElement;
    resetHold();
    input.value = '';
    input.classList.remove('is-match');
    setHoldEnabled(false);
    overlay.hidden = false;
    void overlay.offsetHeight;
    overlay.classList.add('is-open');
    setTimeout(function () { input.focus(); }, reduced ? 0 : 120);
  }

  function closeDialog() {
    resetHold();
    overlay.classList.remove('is-open');
    var done = function () {
      overlay.hidden = true;
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    };
    if (reduced) {
      done();
    } else {
      setTimeout(done, 280);
    }
  }

  function resetHold() {
    holding = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    holdBtn.classList.remove('is-holding', 'is-complete');
    holdLabel.textContent = '长按确认';
    ringFill.style.strokeDashoffset = RING_LEN;
  }

  function startHold() {
    if (holdBtn.disabled) return;
    holding = true;
    holdStart = performance.now();
    holdBtn.classList.add('is-holding');

    var tick = function (now) {
      if (!holding) return;
      var progress = Math.min(1, (now - holdStart) / HOLD_MS);
      ringFill.style.strokeDashoffset = String(RING_LEN * (1 - progress));
      var remain = Math.ceil((HOLD_MS - (now - holdStart)) / 1000);
      holdLabel.textContent = remain > 0 ? '继续按住 ' + remain : '确认中…';
      if (progress >= 1) {
        finishHold();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (!holding) return;
    holding = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    holdBtn.classList.remove('is-holding');
    holdLabel.textContent = '长按确认';
    ringFill.style.transition = 'stroke-dashoffset .25s ease';
    ringFill.style.strokeDashoffset = RING_LEN;
    setTimeout(function () { ringFill.style.transition = ''; }, 260);
  }

  function finishHold() {
    holding = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    ringFill.style.strokeDashoffset = 0;
    holdBtn.classList.remove('is-holding');
    holdBtn.classList.add('is-complete');
    holdLabel.textContent = '已确认';
    setTimeout(function () {
      executeDelete();
    }, reduced ? 0 : 320);
  }

  function executeDelete() {
    overlay.classList.remove('is-open');
    setTimeout(function () {
      overlay.hidden = true;
      panel.style.transition = 'opacity .3s ease, transform .3s ease';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(10px)';
      setTimeout(function () { panel.hidden = true; }, reduced ? 0 : 300);
      showToast();
    }, reduced ? 0 : 200);
  }

  function showToast() {
    toastText.textContent = '项目已删除';
    undoBtn.style.display = '';
    toast.hidden = false;
    void toast.offsetHeight;
    toast.classList.add('is-open');
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(expireToast, UNDO_MS);
  }

  function expireToast() {
    toast.classList.remove('is-open');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 320);
  }

  function undoDelete() {
    if (undoTimer) clearTimeout(undoTimer);
    panel.hidden = false;
    void panel.offsetHeight;
    panel.style.opacity = '';
    panel.style.transform = '';
    toastText.textContent = '已恢复项目';
    undoBtn.style.display = 'none';
    setTimeout(expireToast, 1800);
  }

  openBtn.addEventListener('click', openDialog);
  cancelBtn.addEventListener('click', closeDialog);

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeDialog();
  });

  input.addEventListener('input', function () {
    var match = input.value.trim().toUpperCase() === WORD;
    input.classList.toggle('is-match', match);
    setHoldEnabled(match);
    if (!match && holding) cancelHold();
  });

  holdBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    startHold();
  });
  holdBtn.addEventListener('pointerup', cancelHold);
  holdBtn.addEventListener('pointerleave', cancelHold);
  holdBtn.addEventListener('pointercancel', cancelHold);
  holdBtn.addEventListener('contextmenu', function (event) { event.preventDefault(); });

  undoBtn.addEventListener('click', undoDelete);

  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    } else if (event.key === 'Tab') {
      var focusables = overlay.querySelectorAll('input, button:not([disabled])');
      if (!focusables.length) return;
      var nodes = Array.prototype.filter.call(focusables, function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('pagehide', function () {
    if (rafId) cancelAnimationFrame(rafId);
    if (undoTimer) clearTimeout(undoTimer);
    if (toastTimer) clearTimeout(toastTimer);
  });
})();

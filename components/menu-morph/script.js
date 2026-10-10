(function () {
  'use strict';

  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('fullscreenMenu');

  if (!toggle || !menu) return;

  var CLOSE_MS = 320;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var closeTimer = null;
  var lastFocused = null;

  function isOpen() {
    return document.body.classList.contains('menu-open');
  }

  function openMenu() {
    if (isOpen()) return;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    lastFocused = document.activeElement;
    menu.hidden = false;
    void menu.offsetHeight;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '关闭菜单');
    var firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus) {
    if (!isOpen()) return;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开菜单');
    var wait = reduced ? 0 : CLOSE_MS;
    closeTimer = setTimeout(function () {
      menu.hidden = true;
      closeTimer = null;
      if (restoreFocus !== false && lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    }, wait);
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  menu.addEventListener('click', function (event) {
    if (event.target === menu || event.target.classList.contains('menu-backdrop')) {
      closeMenu(true);
      return;
    }
    var link = event.target.closest('a');
    if (link) closeMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === 'Tab') {
      var focusables = menu.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
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
    if (closeTimer) clearTimeout(closeTimer);
  });
})();

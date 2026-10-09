const overlay = document.getElementById('drawerOverlay');
const drawer = document.getElementById('drawer');
const sideLabel = document.getElementById('drawerSideLabel');
const closeBtn = document.getElementById('drawerClose');
const cancelBtn = document.getElementById('drawerCancel');
const confirmBtn = document.getElementById('drawerConfirm');

let lastFocused = null;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusable() {
  return Array.from(drawer.querySelectorAll(focusableSelector))
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function openDrawer(side, trigger) {
  lastFocused = trigger || document.activeElement;
  drawer.dataset.side = side;
  sideLabel.textContent = `${side.toUpperCase()} PANEL`;
  overlay.hidden = false;
  document.body.classList.add('scroll-locked');

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    const focusable = getFocusable();
    (focusable[0] || drawer).focus();
  });
}

function closeDrawer() {
  overlay.classList.remove('is-open');
  document.body.classList.remove('scroll-locked');

  const onEnd = () => {
    overlay.hidden = true;
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    overlay.removeEventListener('transitionend', onEnd);
  };
  overlay.addEventListener('transitionend', onEnd);
  setTimeout(onEnd, 380);
}

document.querySelectorAll('.dir-card').forEach((card) => {
  card.addEventListener('click', () => {
    openDrawer(card.dataset.side, card);
  });
});

closeBtn.addEventListener('click', closeDrawer);
cancelBtn.addEventListener('click', closeDrawer);
confirmBtn.addEventListener('click', closeDrawer);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeDrawer();
});

document.addEventListener('keydown', (e) => {
  if (overlay.hidden) return;

  if (e.key === 'Escape') {
    closeDrawer();
    return;
  }

  if (e.key === 'Tab') {
    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

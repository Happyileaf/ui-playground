(function () {
  const root = document.getElementById('speedDial');
  const fab = document.getElementById('dialFab');
  const list = document.getElementById('dialList');
  const actions = Array.from(list.querySelectorAll('.dial-action'));
  const segBtns = Array.from(document.querySelectorAll('.seg-btn'));
  const log = document.getElementById('actionLog');

  let open = false;
  let direction = 'up';

  const fanRadius = 96;
  const fanStart = -70;
  const fanStep = 24;

  function applyFanVars() {
    actions.forEach((btn, idx) => {
      const item = btn.closest('.dial-item');
      const angle = fanStart + idx * fanStep;
      item.style.setProperty('--a', angle + 'deg');
      item.style.setProperty('--r', -fanRadius + 'px');
    });
  }

  function setDirection(dir) {
    direction = dir;
    root.classList.remove('dir-up', 'dir-left', 'dir-fan');
    root.classList.add('dir-' + dir);
    if (dir === 'fan') applyFanVars();
  }

  function setOpen(next) {
    open = next;
    root.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open && actions.length) {
      setTimeout(() => actions[0].focus(), direction === 'fan' ? 220 : 60);
    } else {
      fab.focus();
    }
  }

  function writeLog(label) {
    log.innerHTML = '';
    const stamp = document.createElement('span');
    stamp.className = 'log-placeholder';
    stamp.textContent = '已执行：';
    const value = document.createElement('strong');
    value.textContent = label;
    value.style.color = 'var(--accent-strong)';
    value.style.marginLeft = '6px';
    log.appendChild(stamp);
    log.appendChild(value);
  }

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!open);
  });

  actions.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      writeLog(btn.dataset.label);
      setOpen(false);
    });
  });

  segBtns.forEach((s) => {
    s.addEventListener('click', () => {
      segBtns.forEach(b => b.classList.remove('is-active'));
      s.classList.add('is-active');
      if (open) setOpen(false);
      setDirection(s.dataset.dir);
    });
  });

  document.addEventListener('click', (e) => {
    if (open && !root.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
    const idx = actions.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1 + actions.length) % actions.length;
      actions[next].focus();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + actions.length) % actions.length;
      actions[prev].focus();
    }
  });

  setDirection('up');
})();

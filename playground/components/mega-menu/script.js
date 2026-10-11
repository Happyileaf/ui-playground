(function () {
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const triggers = navItems.map((item) => item.querySelector('.nav-trigger'));
  const layer = document.getElementById('megaLayer');
  const panels = Array.from(document.querySelectorAll('.mega-panel'));

  let openItem = null;
  let closeTimer = null;
  let openTimer = null;

  function getPanel(item) {
    return document.getElementById('panel-' + item.dataset.menu);
  }

  function show(item) {
    clearTimeout(closeTimer);
    clearTimeout(openTimer);
    if (openItem === item) return;
    hide(true);
    openItem = item;
    item.classList.add('open');
    const trigger = item.querySelector('.nav-trigger');
    trigger.setAttribute('aria-expanded', 'true');
    const panel = getPanel(item);
    panel.classList.add('show');
    layer.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add('visible'));
    });
  }

  function hide(instant) {
    if (!openItem) {
      layer.hidden = true;
      return;
    }
    const item = openItem;
    const panel = getPanel(item);
    item.classList.remove('open');
    item.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    panel.classList.remove('visible');

    const finish = () => {
      panel.classList.remove('show');
      if (!panels.some((p) => p.classList.contains('show'))) {
        layer.hidden = true;
      }
    };

    if (instant) finish();
    else setTimeout(finish, 180);

    openItem = null;
  }

  function scheduleShow(item) {
    clearTimeout(closeTimer);
    clearTimeout(openTimer);
    openTimer = setTimeout(() => show(item), 70);
  }

  function scheduleHide() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => hide(false), 120);
  }

  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => scheduleShow(item));
    item.addEventListener('mouseleave', scheduleHide);

    const trigger = item.querySelector('.nav-trigger');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (openItem === item) hide(false);
      else show(item);
    });

    trigger.addEventListener('keydown', (e) => {
      const idx = navItems.indexOf(item);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        show(item);
        const firstLink = getPanel(item).querySelector('.mega-link');
        if (firstLink) firstLink.focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = navItems[(idx + 1) % navItems.length];
        next.querySelector('.nav-trigger').focus();
        show(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = navItems[(idx - 1 + navItems.length) % navItems.length];
        prev.querySelector('.nav-trigger').focus();
        show(prev);
      } else if (e.key === 'Escape') {
        hide(true);
        trigger.focus();
      }
    });
  });

  layer.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  layer.addEventListener('mouseleave', scheduleHide);

  panels.forEach((panel) => {
    const focusables = Array.from(panel.querySelectorAll('a'));
    focusables.forEach((link, i) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          const item = navItems.find((it) => getPanel(it) === panel);
          hide(true);
          if (item) item.querySelector('.nav-trigger').focus();
        } else if (e.key === 'Tab' && !e.shiftKey && i === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      });
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (openItem && !layer.contains(e.target) && !openItem.contains(e.target)) {
      hide(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openItem) hide(true);
  });

  layer.hidden = true;
})();

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(document.querySelectorAll('.spot-card'));

  const items = cards.map((el) => {
    if (el.dataset.accent) el.style.setProperty('--accent', el.dataset.accent);
    return {
      el,
      tx: 50,
      ty: 50,
      x: 50,
      y: 50,
      targetActive: 0,
      active: 0,
      moving: false
    };
  });

  let rafId = null;

  function updatePosition(item, clientX, clientY) {
    const rect = item.el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    item.tx = ((clientX - rect.left) / rect.width) * 100;
    item.ty = ((clientY - rect.top) / rect.height) * 100;
  }

  function write(item) {
    item.el.style.setProperty('--mx', item.x.toFixed(2) + '%');
    item.el.style.setProperty('--my', item.y.toFixed(2) + '%');
    item.el.style.setProperty('--active', item.active.toFixed(3));
  }

  function snap(item) {
    item.x = item.tx;
    item.y = item.ty;
    item.active = item.targetActive;
    write(item);
    item.moving = false;
  }

  function start() {
    if (reduceMotion) {
      items.forEach((item) => {
        if (item.moving) snap(item);
      });
      return;
    }
    if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function tick() {
    rafId = null;
    let anyMoving = false;
    const positionEase = 0.18;
    const activeEase = 0.14;

    items.forEach((item) => {
      if (!item.moving) return;

      item.x += (item.tx - item.x) * positionEase;
      item.y += (item.ty - item.y) * positionEase;
      item.active += (item.targetActive - item.active) * activeEase;

      const settled =
        Math.abs(item.tx - item.x) < 0.02 &&
        Math.abs(item.ty - item.y) < 0.02 &&
        Math.abs(item.targetActive - item.active) < 0.005;

      if (settled) {
        snap(item);
      } else {
        anyMoving = true;
        write(item);
      }
    });

    if (anyMoving) {
      rafId = requestAnimationFrame(tick);
    }
  }

  items.forEach((item) => {
    item.el.addEventListener('pointerenter', (e) => {
      item.targetActive = 1;
      updatePosition(item, e.clientX, e.clientY);
      item.moving = true;
      start();
    });

    item.el.addEventListener('pointermove', (e) => {
      if (item.targetActive !== 1) item.targetActive = 1;
      updatePosition(item, e.clientX, e.clientY);
      item.moving = true;
      start();
    });

    item.el.addEventListener('pointerleave', () => {
      item.targetActive = 0;
      item.tx = 50;
      item.ty = 50;
      item.moving = true;
      start();
    });

    item.el.addEventListener('pointercancel', () => {
      item.targetActive = 0;
      item.tx = 50;
      item.ty = 50;
      item.moving = true;
      start();
    });
  });

  window.addEventListener('pagehide', () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  items.forEach((item) => write(item));
})();

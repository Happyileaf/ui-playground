(function () {
  const frame = document.getElementById('zoomFrame');
  const lens = document.getElementById('lens');
  const badge = document.getElementById('zoomBadge');
  const seg = document.getElementById('zoomSeg');

  const levels = [2, 3, 4];
  let zoom = levels[1];
  const lensSize = 150;
  let pos = null;
  let rect = null;

  function measure() {
    rect = frame.getBoundingClientRect();
  }

  function applyPosition() {
    if (!rect || !pos) return;

    const half = lensSize / 2;
    const x = Math.max(half, Math.min(rect.width - half, pos.x));
    const y = Math.max(half, Math.min(rect.height - half, pos.y));

    lens.style.transform = `translate(${x - half}px, ${y - half}px)`;
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    lens.style.backgroundPosition = `${-(x * zoom - half)}px ${-(y * zoom - half)}px`;
  }

  function show() {
    lens.classList.add('visible');
  }

  function hide() {
    lens.classList.remove('visible');
  }

  frame.addEventListener('pointerenter', () => {
    measure();
    if (!pos) pos = { x: rect.width / 2, y: rect.height / 2 };
    show();
    applyPosition();
  });

  frame.addEventListener('pointermove', (e) => {
    measure();
    pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    show();
    applyPosition();
  });

  frame.addEventListener('pointerleave', hide);

  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    zoom = levels[Number(btn.dataset.level)];
    badge.textContent = `${zoom}×`;
    seg.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
    applyPosition();
  });

  frame.addEventListener('keydown', (e) => {
    const step = 14;
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    measure();
    if (!pos) pos = { x: rect.width / 2, y: rect.height / 2 };
    if (e.key === 'ArrowUp') pos.y -= step;
    if (e.key === 'ArrowDown') pos.y += step;
    if (e.key === 'ArrowLeft') pos.x -= step;
    if (e.key === 'ArrowRight') pos.x += step;
    show();
    applyPosition();
  });

  frame.addEventListener('blur', hide);

  window.addEventListener('resize', () => {
    measure();
    applyPosition();
  });

  measure();
})();

(function () {
  function init(options) {
    const container = options.container;
    const splitter = options.splitter;
    const firstPane = options.firstPane;
    const badge = options.badge;
    const min = options.min;
    const max = options.max;
    const vertical = options.vertical;
    const key = options.key;
    const initial = options.initial;

    let percent = initial;

    function apply(value, updateAria) {
      percent = Math.min(max, Math.max(min, value));
      firstPane.style.flex = '0 0 ' + percent + '%';
      if (badge) badge.textContent = Math.round(percent) + '%';
      if (updateAria) splitter.setAttribute('aria-valuenow', String(Math.round(percent)));
    }

    function fromPointer(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      if (vertical) {
        return ((clientY - rect.top) / rect.height) * 100;
      }
      return ((clientX - rect.left) / rect.width) * 100;
    }

    let dragging = false;

    splitter.addEventListener('pointerdown', (e) => {
      dragging = true;
      splitter.classList.add('dragging');
      splitter.setPointerCapture(e.pointerId);
      document.body.classList.add(vertical ? 'resizing-v' : 'resizing-h');
      e.preventDefault();
    });

    splitter.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      apply(fromPointer(e.clientX, e.clientY), true);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      splitter.classList.remove('dragging');
      document.body.classList.remove('resizing-v', 'resizing-h');
    }

    splitter.addEventListener('pointerup', endDrag);
    splitter.addEventListener('pointercancel', endDrag);

    splitter.addEventListener('dblclick', () => apply(initial, true));

    splitter.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 5 : 2;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        apply(percent - step, true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        apply(percent + step, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        apply(min, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        apply(max, true);
      }
    });

    apply(percent, true);

    return {
      set(value) {
        apply(value, true);
      },
      reset() {
        apply(initial, true);
      },
      get() {
        return percent;
      }
    };
  }

  const horizontal = init({
    container: document.getElementById('splitHorizontal'),
    splitter: document.querySelector('#splitHorizontal > .splitter'),
    firstPane: document.querySelector('#splitHorizontal > .pane-sidebar'),
    badge: document.getElementById('leftPercent'),
    min: 15,
    max: 60,
    vertical: false,
    initial: 24
  });

  const vertical = init({
    container: document.getElementById('splitVertical'),
    splitter: document.querySelector('#splitVertical > .h-splitter'),
    firstPane: document.querySelector('#splitVertical > .pane-editor'),
    badge: document.getElementById('topPercent'),
    min: 25,
    max: 80,
    vertical: true,
    initial: 62
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    horizontal.reset();
    vertical.reset();
  });

  document.getElementById('evenBtn').addEventListener('click', () => {
    horizontal.set(38);
    vertical.set(50);
  });
})();

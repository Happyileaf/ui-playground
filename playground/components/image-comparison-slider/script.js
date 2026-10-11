(function () {
  const stage = document.getElementById('compareStage');
  const layerBefore = document.getElementById('layerBefore');
  const dividerLine = document.getElementById('dividerLine');
  const handle = document.getElementById('dividerHandle');
  const presetBtns = Array.from(document.querySelectorAll('.preset-btn'));

  let position = 50;
  let dragging = false;

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function render() {
    const value = position + '%';
    stage.style.setProperty('--pos', value);
    layerBefore.style.setProperty('--pos', value);
    dividerLine.style.setProperty('--pos', value);
    handle.style.setProperty('--pos', value);
    handle.setAttribute('aria-valuenow', String(Math.round(position)));
  }

  function setPosition(value) {
    position = clamp(value);
    render();
    presetBtns.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.pos) === Math.round(position));
    });
  }

  function positionFromPointer(clientX) {
    const rect = stage.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    stage.classList.add('is-dragging');
    try {
      stage.setPointerCapture(event.pointerId);
    } catch (err) {}
    setPosition(positionFromPointer(event.clientX));
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragging) return;
    setPosition(positionFromPointer(event.clientX));
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    try {
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    } catch (err) {}
  }

  function onKeyDown(event) {
    const key = event.key;
    let next = null;

    if (key === 'ArrowLeft') {
      next = position - (event.shiftKey ? 10 : 2);
    } else if (key === 'ArrowRight') {
      next = position + (event.shiftKey ? 10 : 2);
    } else if (key === 'Home') {
      next = 0;
    } else if (key === 'End') {
      next = 100;
    }

    if (next !== null) {
      setPosition(next);
      event.preventDefault();
    }
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  handle.addEventListener('keydown', onKeyDown);

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setPosition(Number(btn.dataset.pos));
    });
  });

  window.addEventListener('pagehide', function cleanup() {
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', endDrag);
    stage.removeEventListener('pointercancel', endDrag);
    handle.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pagehide', cleanup);
  });

  render();
})();

(function () {
  const list = document.getElementById('taskList');
  const previewList = document.getElementById('previewList');
  const countBadge = document.getElementById('countBadge');
  const resetBtn = document.getElementById('resetBtn');
  const srLive = document.getElementById('srLive');

  const initialHTML = list.innerHTML;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ACTIVATE_DISTANCE = 6;
  const EDGE_ZONE = 72;
  const SCROLL_SPEED = 12;

  let drag = null;
  let autoScrollDir = 0;
  let autoScrollFrame = null;

  function getItems() {
    return Array.from(list.querySelectorAll('.task-item'));
  }

  function syncIndexes() {
    getItems().forEach((item, index) => {
      item.querySelector('.task-index').textContent = String(index + 1);
    });
  }

  function renderPreview() {
    previewList.innerHTML = '';
    getItems().forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${item.querySelector('.task-name').textContent}`;
      previewList.appendChild(li);
    });
  }

  function announce(message) {
    srLive.textContent = '';
    window.setTimeout(() => {
      srLive.textContent = message;
    }, 30);
  }

  function clearDropMarks() {
    getItems().forEach((item) => {
      item.classList.remove('is-drop-before', 'is-drop-after');
    });
  }

  function updateDropMark(referenceItem, placeBefore) {
    clearDropMarks();
    if (!referenceItem) {
      return;
    }
    referenceItem.classList.add(placeBefore ? 'is-drop-before' : 'is-drop-after');
  }

  function captureRects(items) {
    return items.map((item) => item.getBoundingClientRect());
  }

  function playFlip(items, firstRects) {
    if (reduceMotion) {
      return;
    }
    items.forEach((item, index) => {
      const lastRect = item.getBoundingClientRect();
      const firstRect = firstRects[index];
      const deltaY = firstRect.top - lastRect.top;
      if (Math.abs(deltaY) < 1) {
        return;
      }
      item.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: 'translateY(0)' }
        ],
        {
          duration: 260,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
        }
      );
    });
  }

  function startAutoScroll() {
    if (autoScrollFrame) {
      return;
    }
    const step = () => {
      if (drag && autoScrollDir !== 0) {
        window.scrollBy(0, autoScrollDir * SCROLL_SPEED);
        autoScrollFrame = window.requestAnimationFrame(step);
      } else {
        autoScrollFrame = null;
      }
    };
    autoScrollFrame = window.requestAnimationFrame(step);
  }

  function stopAutoScroll() {
    autoScrollDir = 0;
    if (autoScrollFrame) {
      window.cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
  }

  function resolveDropTarget(clientY) {
    const others = getItems().filter((item) => item !== drag.item);
    for (const item of others) {
      const rect = item.getBoundingClientRect();
      const middle = rect.top + rect.height / 2;
      if (clientY < middle) {
        return { item, placeBefore: true };
      }
    }
    const last = others[others.length - 1];
    return last ? { item: last, placeBefore: false } : null;
  }

  function moveItem(clientY) {
    const target = resolveDropTarget(clientY);
    if (!target) {
      clearDropMarks();
      return;
    }
    updateDropMark(target.item, target.placeBefore);
    const firstRects = captureRects(getItems());
    if (target.placeBefore) {
      list.insertBefore(drag.item, target.item);
    } else if (target.item.nextSibling) {
      list.insertBefore(drag.item, target.item.nextSibling);
    } else {
      list.appendChild(drag.item);
    }
    playFlip(getItems(), firstRects);
  }

  function activateDrag(event) {
    drag.active = true;
    drag.item.classList.add('is-dragging');
    document.body.classList.add('is-dragging');
    try {
      drag.handle.setPointerCapture(event.pointerId);
    } catch (error) {
      return;
    }
    announce('已拾起任务，上下移动选择新位置，松开完成排序');
  }

  function endDrag(event) {
    const handle = drag.handle;
    const item = drag.item;
    if (event && handle.hasPointerCapture && handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    if (drag.active) {
      stopAutoScroll();
      clearDropMarks();
      item.classList.remove('is-dragging');
      document.body.classList.remove('is-dragging');
      syncIndexes();
      renderPreview();
      announce(`已移动到第 ${getItems().indexOf(item) + 1} 位`);
    }
    drag = null;
  }

  function initDrag(handle) {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 && event.pointerType === 'mouse') {
        return;
      }
      drag = {
        handle,
        item: handle.closest('.task-item'),
        startX: event.clientX,
        startY: event.clientY,
        active: false
      };
      event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
      if (!drag || drag.handle !== handle) {
        return;
      }
      if (!drag.active) {
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dy) > ACTIVATE_DISTANCE || Math.abs(dx) > ACTIVATE_DISTANCE) {
          activateDrag(event);
        } else {
          return;
        }
      }
      moveItem(event.clientY);
      if (event.clientY < EDGE_ZONE) {
        autoScrollDir = -1;
        startAutoScroll();
      } else if (event.clientY > window.innerHeight - EDGE_ZONE) {
        autoScrollDir = 1;
        startAutoScroll();
      } else {
        autoScrollDir = 0;
      }
    });

    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  function moveByKeyboard(item, direction) {
    const items = getItems();
    const from = items.indexOf(item);
    const to = from + direction;
    if (to < 0 || to >= items.length) {
      announce(direction < 0 ? '已经是第一位了' : '已经是最后一位了');
      return;
    }
    const firstRects = captureRects(items);
    if (direction < 0) {
      list.insertBefore(item, items[to]);
    } else if (items[to].nextSibling) {
      list.insertBefore(item, items[to].nextSibling);
    } else {
      list.appendChild(item);
    }
    playFlip(getItems(), firstRects);
    syncIndexes();
    renderPreview();
    item.querySelector('.drag-handle').focus();
    announce(`已移动到第 ${to + 1} 位`);
  }

  list.addEventListener('keydown', (event) => {
    if (!event.altKey) {
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }
    const item = event.target.closest('.task-item');
    if (!item) {
      return;
    }
    event.preventDefault();
    moveByKeyboard(item, event.key === 'ArrowUp' ? -1 : 1);
  });

  resetBtn.addEventListener('click', () => {
    const items = getItems();
    const firstRects = captureRects(items);
    list.innerHTML = initialHTML;
    const restored = getItems();
    playFlip(restored, firstRects);
    syncIndexes();
    renderPreview();
    restored.forEach((item) => initDrag(item.querySelector('.drag-handle')));
    announce('已恢复默认顺序');
  });

  window.addEventListener('blur', () => {
    if (drag && drag.active) {
      stopAutoScroll();
    }
  });

  getItems().forEach((item) => initDrag(item.querySelector('.drag-handle')));
  syncIndexes();
  renderPreview();
  countBadge.textContent = `${getItems().length} 项`;
})();

(() => {
  const list = document.getElementById('swipeList');
  const countEl = document.getElementById('listCount');

  const COMPLETE_WIDTH = 76;
  const DELETE_WIDTH = 88;
  const OPEN_COMPLETE_AT = 38;
  const OPEN_DELETE_AT = -44;

  const AVATAR_COLORS = [
    '#a78bfa', '#f0abfc', '#7dd3fc', '#fda4af',
    '#86efac', '#fcd34d', '#fdba74', '#67e8f9'
  ];

  const todos = [
    { name: '重构着陆页 Hero 动效', note: '替换为 transform 合成动画，提升滚动帧率', done: false },
    { name: '评审设计系统 v2 令牌', note: '补齐暗色模式下的语义色阶', done: false },
    { name: '回复客户反馈邮件', note: '关于导出 PDF 排版错位的三个问题', done: true },
    { name: '准备周会演示数据', note: '整理本周转化率与留存曲线截图', done: false },
    { name: '升级依赖并跑回归测试', note: '关注 Vite 与 TypeScript 的 Breaking Change', done: false },
    { name: '整理灵感收集箱', note: '归档本周收藏的 23 个交互参考', done: true }
  ];

  let openItem = null;
  let toastEl = null;
  let toastTimer = null;
  let lastDeleted = null;

  const ICON_CHECK = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;

  const ICON_TRASH = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>`;

  todos.forEach((todo, i) => {
    todo.color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    todo.id = i;
  });

  function render() {
    list.innerHTML = '';

    todos.forEach((todo) => {
      const item = document.createElement('li');
      item.className = 'swipe-item' + (todo.done ? ' done' : '');
      item.dataset.id = todo.id;

      const actionLayer = document.createElement('div');
      actionLayer.className = 'action-layer';

      const completeBtn = document.createElement('button');
      completeBtn.type = 'button';
      completeBtn.className = 'action-complete';
      completeBtn.setAttribute('aria-label', todo.done ? '取消完成' : '标记完成');
      completeBtn.innerHTML = `${ICON_CHECK}<span>${todo.done ? '取消' : '完成'}</span>`;
      completeBtn.addEventListener('click', () => toggleComplete(todo, item));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'action-delete';
      deleteBtn.setAttribute('aria-label', '删除');
      deleteBtn.innerHTML = `${ICON_TRASH}<span>删除</span>`;
      deleteBtn.addEventListener('click', () => removeItem(todo, item));

      actionLayer.append(completeBtn, deleteBtn);

      const content = document.createElement('div');
      content.className = 'item-content';
      content.dataset.snap = '0';

      const avatar = document.createElement('div');
      avatar.className = 'item-avatar';
      avatar.style.background = todo.color;
      avatar.textContent = todo.name.slice(0, 1);

      const body = document.createElement('div');
      body.className = 'item-body';

      const name = document.createElement('div');
      name.className = 'item-name';
      name.textContent = todo.name;

      const note = document.createElement('div');
      note.className = 'item-note';
      note.textContent = todo.note;

      body.append(name, note);
      content.append(avatar, body);

      if (todo.done) {
        const chip = document.createElement('div');
        chip.className = 'done-chip';
        chip.textContent = '已完成';
        content.append(chip);
      }

      attachGesture(content, item);

      item.append(actionLayer, content);
      list.append(item);
    });

    if (!todos.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = '列表已经清空，所有任务都处理完了';
      list.append(empty);
    }

    updateCount();
  }

  function updateCount() {
    const pending = todos.filter((t) => !t.done).length;
    const done = todos.length - pending;
    countEl.textContent = done
      ? `${pending} 项待办 · ${done} 已完成`
      : `${pending} 项待办`;
  }

  function setTranslate(content, x) {
    content.style.transform = `translateX(${x}px)`;
  }

  function snapTo(content, item, x) {
    content.classList.remove('dragging');
    content.dataset.snap = String(x);
    setTranslate(content, x);

    if (x !== 0) {
      openItem = item;
    } else if (openItem === item) {
      openItem = null;
    }
  }

  function closeOpen(except) {
    if (openItem && openItem !== except) {
      const content = openItem.querySelector('.item-content');
      if (content) snapTo(content, openItem, 0);
    }
    if (except) openItem = except;
  }

  function attachGesture(content, item) {
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let dragging = false;
    let decided = false;
    let horizontal = false;
    let pointerId = null;

    content.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;

      startX = e.clientX;
      startY = e.clientY;
      baseX = Number(content.dataset.snap) || 0;
      dragging = true;
      decided = false;
      horizontal = false;
      pointerId = e.pointerId;
    });

    content.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== pointerId) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        decided = true;
        horizontal = Math.abs(dx) > Math.abs(dy);
        if (horizontal) {
          content.classList.add('dragging');
          closeOpen(item);
          try { content.setPointerCapture(pointerId); } catch (_) {}
        }
      }

      if (!horizontal) return;
      e.preventDefault();

      let next = baseX + dx;
      const maxRight = COMPLETE_WIDTH + 24;
      const maxLeft = -(DELETE_WIDTH + 24);

      if (next > maxRight) {
        next = maxRight + (next - maxRight) * 0.25;
      } else if (next < maxLeft) {
        next = maxLeft + (next - maxLeft) * 0.25;
      }

      setTranslate(content, next);
    });

    const finish = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;

      if (!horizontal) return;

      const current = Number(getComputedStyle(content).transform
        .split(',')[4] || 0) || 0;
      const fallback = baseX + (e.clientX - startX);
      const x = Number.isFinite(current) && Math.abs(current) > 0 ? current : fallback;

      if (x >= OPEN_COMPLETE_AT) {
        snapTo(content, item, COMPLETE_WIDTH);
      } else if (x <= OPEN_DELETE_AT) {
        snapTo(content, item, -DELETE_WIDTH);
      } else {
        snapTo(content, item, 0);
      }
    };

    content.addEventListener('pointerup', finish);
    content.addEventListener('pointercancel', finish);

    content.addEventListener('click', (e) => {
      const snap = Number(content.dataset.snap) || 0;
      if (snap !== 0) {
        e.preventDefault();
        snapTo(content, item, 0);
      }
    });
  }

  function toggleComplete(todo, item) {
    todo.done = !todo.done;
    const content = item.querySelector('.item-content');
    if (content) snapTo(content, item, 0);
    item.classList.toggle('done', todo.done);

    const existingChip = item.querySelector('.done-chip');
    if (todo.done && !existingChip) {
      const chip = document.createElement('div');
      chip.className = 'done-chip';
      chip.textContent = '已完成';
      content.append(chip);
    } else if (!todo.done && existingChip) {
      existingChip.remove();
    }

    const completeBtn = item.querySelector('.action-complete');
    if (completeBtn) {
      completeBtn.setAttribute('aria-label', todo.done ? '取消完成' : '标记完成');
      completeBtn.querySelector('span').textContent = todo.done ? '取消' : '完成';
    }

    updateCount();
  }

  function removeItem(todo, item) {
    dismissToast();

    const index = todos.indexOf(todo);
    if (index === -1) return;
    todos.splice(index, 1);

    lastDeleted = { todo, index };
    item.classList.add('removing');
    if (openItem === item) openItem = null;

    const cleanup = () => {
      item.remove();
      updateCount();
      if (!todos.length) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = '列表已经清空，所有任务都处理完了';
        list.append(empty);
      }
    };

    if (item.getAnimations().length) {
      Promise.all(item.getAnimations().map((a) => a.finished.catch(() => {})))
        .then(cleanup);
    } else {
      setTimeout(cleanup, 300);
    }

    showToast();
  }

  function showToast() {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'undo-toast';

      const text = document.createElement('span');
      text.className = 'undo-text';
      text.textContent = '已删除一条待办';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'undo-btn';
      btn.textContent = '撤销';
      btn.addEventListener('click', undoDelete);

      toastEl.append(text, btn);
      document.body.append(toastEl);
    }

    requestAnimationFrame(() => toastEl.classList.add('show'));

    toastTimer = setTimeout(() => {
      lastDeleted = null;
      hideToast();
    }, 5000);
  }

  function hideToast() {
    if (toastEl) toastEl.classList.remove('show');
  }

  function dismissToast() {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
    lastDeleted = null;
    hideToast();
  }

  function undoDelete() {
    if (!lastDeleted) return;
    const { todo, index } = lastDeleted;
    todos.splice(Math.min(index, todos.length), 0, todo);
    lastDeleted = null;
    if (toastTimer) clearTimeout(toastTimer);
    render();
    hideToast();
  }

  render();
})();

(function () {
  var boardEl = document.getElementById('board');
  var resetBtn = document.getElementById('resetBtn');
  var srLive = document.getElementById('srLive');
  var boardScroll = document.querySelector('.board-scroll');

  var TAG_COLORS = {
    design: { color: '#c4b5fd', bg: 'rgba(139,92,246,.16)' },
    frontend: { color: '#93c5fd', bg: 'rgba(59,130,246,.15)' },
    backend: { color: '#6ee7b7', bg: 'rgba(16,185,129,.14)' },
    bug: { color: '#fca5a5', bg: 'rgba(239,68,68,.15)' },
    docs: { color: '#fcd34d', bg: 'rgba(217,119,6,.14)' },
    test: { color: '#7dd3fc', bg: 'rgba(14,165,233,.14)' },
    ops: { color: '#a5b4fc', bg: 'rgba(99,102,241,.15)' }
  };

  var PRIORITY_CLASS = {
    high: 'priority-high',
    mid: 'priority-mid',
    low: 'priority-low'
  };

  var initialColumns = [
    {
      name: '待办',
      en: 'TO DO',
      cards: [
        { id: 'K-101', title: '梳理登录模块异常边界与提示文案', tag: { key: 'bug', label: '缺陷' }, priority: 'high' },
        { id: 'K-102', title: '首页暗黑模式视觉走查与对齐', tag: { key: 'design', label: '设计' }, priority: 'mid' },
        { id: 'K-103', title: '看板导出 PDF 功能方案调研', tag: { key: 'docs', label: '文档' }, priority: 'low' },
        { id: 'K-104', title: '补齐列表与空状态插画资源', tag: { key: 'design', label: '设计' }, priority: 'mid' }
      ]
    },
    {
      name: '进行中',
      en: 'IN PROGRESS',
      cards: [
        { id: 'K-201', title: '拖拽排序改用 Pointer Events 重构', tag: { key: 'frontend', label: '前端' }, priority: 'high' },
        { id: 'K-202', title: '支付接口幂等性改造', tag: { key: 'backend', label: '后端' }, priority: 'high' },
        { id: 'K-203', title: '通知中心实时推送联调', tag: { key: 'frontend', label: '前端' }, priority: 'mid' }
      ]
    },
    {
      name: '评审',
      en: 'REVIEW',
      cards: [
        { id: 'K-301', title: '权限中间件合并请求代码评审', tag: { key: 'backend', label: '后端' }, priority: 'mid' },
        { id: 'K-302', title: '组件库 v1.4 变更文档校对', tag: { key: 'docs', label: '文档' }, priority: 'low' },
        { id: 'K-303', title: '结算页回归测试用例评审', tag: { key: 'test', label: '测试' }, priority: 'mid' }
      ]
    },
    {
      name: '已完成',
      en: 'DONE',
      cards: [
        { id: 'K-401', title: 'CI 流水线依赖缓存优化', tag: { key: 'ops', label: '运维' }, priority: 'low' },
        { id: 'K-402', title: '修复移动端输入框抖动问题', tag: { key: 'bug', label: '缺陷' }, priority: 'high' }
      ]
    }
  ];

  var columns = cloneData(initialColumns);
  var drag = null;
  var rafId = null;

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    columns.forEach(function (col, colIndex) {
      var column = document.createElement('div');
      column.className = 'kanban-column';
      column.dataset.col = String(colIndex);

      var head = document.createElement('div');
      head.className = 'column-head';

      var name = document.createElement('span');
      name.className = 'column-name';
      name.textContent = col.name;

      var nameEn = document.createElement('span');
      nameEn.className = 'column-name-en';
      nameEn.textContent = col.en;

      var badge = document.createElement('span');
      badge.className = 'count-badge';

      head.appendChild(name);
      head.appendChild(nameEn);
      head.appendChild(badge);

      var list = document.createElement('div');
      list.className = 'card-list';

      col.cards.forEach(function (card) {
        list.appendChild(createCard(card));
      });

      column.appendChild(head);
      column.appendChild(list);
      boardEl.appendChild(column);
      updateBadge(colIndex);
    });
  }

  function createCard(card) {
    var el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = card.id;
    el.setAttribute('tabindex', '0');
    el.setAttribute('draggable', 'false');

    var titleRow = document.createElement('div');
    titleRow.className = 'card-title-row';

    var title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = card.title;
    titleRow.appendChild(title);

    if (card.priority) {
      var dot = document.createElement('span');
      dot.className = 'priority-dot ' + PRIORITY_CLASS[card.priority];
      titleRow.appendChild(dot);
    }

    el.appendChild(titleRow);

    var meta = document.createElement('div');
    meta.className = 'card-meta';

    if (card.tag) {
      var tag = document.createElement('span');
      tag.className = 'card-tag';
      var conf = TAG_COLORS[card.tag.key] || { color: '#9aa3b8', bg: 'rgba(148,163,184,.12)' };
      tag.style.color = conf.color;
      tag.style.background = conf.bg;
      tag.textContent = card.tag.label;
      meta.appendChild(tag);
    }

    var code = document.createElement('span');
    code.className = 'card-code';
    code.textContent = card.id;
    meta.appendChild(code);
    el.appendChild(meta);

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('keydown', onCardKeydown);
    return el;
  }

  function getColIndex(listEl) {
    return Number(listEl.closest('.kanban-column').dataset.col);
  }

  function findCardEl(id) {
    return boardEl.querySelector('.card[data-id="' + id + '"]');
  }

  function updateBadge(colIndex) {
    var badge = boardEl.children[colIndex].querySelector('.count-badge');
    badge.textContent = String(columns[colIndex].cards.length);
  }

  function refreshAllBadges() {
    columns.forEach(function (_, i) {
      updateBadge(i);
    });
  }

  function updateDragBadges() {
    var placeholderCol = -1;
    if (drag.placeholder.parentElement) {
      placeholderCol = getColIndex(drag.placeholder.parentElement);
    }
    columns.forEach(function (_, i) {
      var count = columns[i].cards.length;
      if (i === drag.sourceCol) count -= 1;
      if (i === placeholderCol) count += 1;
      boardEl.children[i].querySelector('.count-badge').textContent = String(count);
    });
  }

  function setCardLabel(el, colIndex) {
    var list = el.parentElement;
    var index = Array.prototype.indexOf.call(list.children, el);
    var title = el.querySelector('.card-title').textContent;
    el.setAttribute('aria-label', title + '，' + columns[colIndex].name + '，第 ' + (index + 1) + ' 项');
  }

  function refreshLabels() {
    var cols = boardEl.children;
    for (var i = 0; i < cols.length; i++) {
      var cards = cols[i].querySelectorAll('.card');
      for (var j = 0; j < cards.length; j++) {
        setCardLabel(cards[j], i);
      }
    }
  }

  function announce(msg) {
    srLive.textContent = '';
    setTimeout(function () {
      srLive.textContent = msg;
    }, 30);
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button')) return;

    var cardEl = e.currentTarget;
    var listEl = cardEl.parentElement;

    drag = {
      card: cardEl,
      sourceCol: getColIndex(listEl),
      sourceIndex: Array.prototype.indexOf.call(listEl.children, cardEl),
      startX: e.clientX,
      startY: e.clientY,
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
      active: false,
      clone: null,
      placeholder: null,
      overCol: -1,
      offsetX: 0,
      offsetY: 0
    };

    try {
      cardEl.setPointerCapture(e.pointerId);
    } catch (err) {}

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    drag.clientX = e.clientX;
    drag.clientY = e.clientY;

    if (!drag.active) {
      var dx = e.clientX - drag.startX;
      var dy = e.clientY - drag.startY;
      if (dx * dx + dy * dy < 16) return;
      startDrag();
    }

    positionClone();
    updateDropTarget();
  }

  function startDrag() {
    drag.active = true;
    document.body.classList.add('is-dragging');

    var rect = drag.card.getBoundingClientRect();
    drag.offsetX = drag.clientX - rect.left;
    drag.offsetY = drag.clientY - rect.top;

    var placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';
    drag.placeholder = placeholder;

    drag.card.classList.add('card-lifted');
    drag.card.parentElement.insertBefore(placeholder, drag.card);

    var clone = drag.card.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.width = rect.width + 'px';
    clone.removeAttribute('tabindex');
    document.body.appendChild(clone);
    drag.clone = clone;

    positionClone();
    updateDropTarget();
    startAutoScroll();
  }

  function positionClone() {
    drag.clone.style.left = (drag.clientX - drag.offsetX) + 'px';
    drag.clone.style.top = (drag.clientY - drag.offsetY) + 'px';
  }

  function hitTest() {
    var lists = boardEl.querySelectorAll('.card-list');
    var i;
    for (i = 0; i < lists.length; i++) {
      var rect = lists[i].getBoundingClientRect();
      if (drag.clientX >= rect.left && drag.clientX <= rect.right &&
          drag.clientY >= rect.top && drag.clientY <= rect.bottom) {
        return lists[i];
      }
    }
    var cols = boardEl.querySelectorAll('.kanban-column');
    for (i = 0; i < cols.length; i++) {
      var colRect = cols[i].getBoundingClientRect();
      if (drag.clientX >= colRect.left && drag.clientX <= colRect.right &&
          drag.clientY >= colRect.top && drag.clientY <= colRect.bottom) {
        return cols[i].querySelector('.card-list');
      }
    }
    return null;
  }

  function updateDropTarget() {
    var list = hitTest();
    if (!list) {
      setOverColumn(-1);
      return;
    }

    var cards = Array.prototype.filter.call(list.children, function (node) {
      return node.classList.contains('card') && !node.classList.contains('card-lifted');
    });

    var insertIndex = cards.length;
    for (var i = 0; i < cards.length; i++) {
      var rect = cards[i].getBoundingClientRect();
      if (drag.clientY < rect.top + rect.height / 2) {
        insertIndex = i;
        break;
      }
    }

    var refNode = cards[insertIndex] || null;
    if (drag.placeholder.parentElement !== list ||
        drag.placeholder.nextElementSibling !== refNode) {
      list.insertBefore(drag.placeholder, refNode);
    }

    setOverColumn(getColIndex(list));
    updateDragBadges();
  }

  function setOverColumn(colIndex) {
    if (drag.overCol === colIndex) return;
    if (drag.overCol >= 0) {
      boardEl.children[drag.overCol].classList.remove('drag-over');
    }
    drag.overCol = colIndex;
    if (colIndex >= 0) {
      boardEl.children[colIndex].classList.add('drag-over');
    }
  }

  function onPointerUp(e) {
    detachWindowPointers();
    if (!drag || !drag.active) {
      drag = null;
      return;
    }
    stopAutoScroll();
    if (e.type === 'pointercancel') {
      cancelDrag();
      return;
    }
    finishDrag();
  }

  function detachWindowPointers() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  function getPlaceholderModelIndex(targetList) {
    var index = 0;
    var node = targetList.firstChild;
    while (node && node !== drag.placeholder) {
      if (node.classList && node.classList.contains('card') &&
          !node.classList.contains('card-lifted')) {
        index += 1;
      }
      node = node.nextSibling;
    }
    return index;
  }

  function finishDrag() {
    var targetList = drag.placeholder.parentElement;
    var targetCol = getColIndex(targetList);
    var insertIndex = getPlaceholderModelIndex(targetList);

    var model = columns[drag.sourceCol].cards.splice(drag.sourceIndex, 1)[0];
    columns[targetCol].cards.splice(insertIndex, 0, model);

    targetList.insertBefore(drag.card, drag.placeholder);
    drag.card.classList.remove('card-lifted');

    cleanupDragNodes();
    refreshAllBadges();
    refreshLabels();
    announce(model.title + '，已移动到 ' + columns[targetCol].name + '，第 ' + (insertIndex + 1) + ' 项');
    drag.card.focus({ preventScroll: true });
    drag = null;
  }

  function cancelDrag() {
    var sourceList = boardEl.children[drag.sourceCol].querySelector('.card-list');
    var realCards = Array.prototype.filter.call(sourceList.children, function (node) {
      return node.classList.contains('card') && !node.classList.contains('card-lifted');
    });

    sourceList.insertBefore(drag.card, realCards[drag.sourceIndex] || null);
    drag.card.classList.remove('card-lifted');

    cleanupDragNodes();
    refreshAllBadges();
    refreshLabels();
    announce('已取消拖拽');
    drag.card.focus({ preventScroll: true });
    drag = null;
  }

  function cleanupDragNodes() {
    setOverColumn(-1);
    document.body.classList.remove('is-dragging');
    if (drag.clone) drag.clone.remove();
    if (drag.placeholder) drag.placeholder.remove();
  }

  function startAutoScroll() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(autoScrollTick);
  }

  function stopAutoScroll() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function autoScrollTick() {
    if (!drag || !drag.active) {
      rafId = null;
      return;
    }

    var edge = 56;
    var step = 12;

    if (drag.clientY < edge) {
      drag.placeholder.parentElement.scrollTop -= step;
    } else if (drag.clientY > window.innerHeight - edge) {
      drag.placeholder.parentElement.scrollTop += step;
    }

    if (drag.clientX < edge) {
      boardScroll.scrollLeft -= step;
    } else if (drag.clientX > window.innerWidth - edge) {
      boardScroll.scrollLeft += step;
    }

    positionClone();
    updateDropTarget();
    rafId = requestAnimationFrame(autoScrollTick);
  }

  function onCardKeydown(e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    var dirMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    };
    var dir = dirMap[e.key];
    if (!dir) return;

    var cardEl = e.currentTarget;
    var colIndex = getColIndex(cardEl.parentElement);
    var index = -1;
    columns[colIndex].cards.forEach(function (card, i) {
      if (card.id === cardEl.dataset.id) index = i;
    });

    var targetCol = colIndex;
    var targetIndex = index;

    if (dir === 'up' && index > 0) {
      targetIndex = index - 1;
    } else if (dir === 'down' && index < columns[colIndex].cards.length - 1) {
      targetIndex = index + 1;
    } else if (dir === 'left' && colIndex > 0) {
      targetCol = colIndex - 1;
      targetIndex = columns[targetCol].cards.length;
    } else if (dir === 'right' && colIndex < columns.length - 1) {
      targetCol = colIndex + 1;
      targetIndex = columns[targetCol].cards.length;
    } else {
      return;
    }

    e.preventDefault();

    var model = columns[colIndex].cards.splice(index, 1)[0];
    columns[targetCol].cards.splice(targetIndex, 0, model);

    var targetList = boardEl.children[targetCol].querySelector('.card-list');
    var nextModel = columns[targetCol].cards[targetIndex + 1];
    var refNode = nextModel ? findCardEl(nextModel.id) : null;
    targetList.insertBefore(cardEl, refNode);

    refreshAllBadges();
    refreshLabels();
    cardEl.focus();
    announce('已移动到 ' + columns[targetCol].name + '，第 ' + (targetIndex + 1) + ' 项');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drag && drag.active) {
      e.preventDefault();
      detachWindowPointers();
      stopAutoScroll();
      cancelDrag();
    }
  });

  resetBtn.addEventListener('click', function () {
    stopAutoScroll();
    columns = cloneData(initialColumns);
    renderBoard();
    announce('看板已重置为初始状态');
  });

  renderBoard();
})();

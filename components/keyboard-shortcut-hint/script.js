(function () {
  'use strict';

  var ACTIONS = [
    {
      id: 'global-search',
      name: '全局搜索',
      desc: '在任意页面唤起搜索面板',
      combo: ['Ctrl', 'K']
    },
    {
      id: 'quick-save',
      name: '快速保存',
      desc: '保存当前正在编辑的内容',
      combo: ['Ctrl', 'S']
    },
    {
      id: 'new-task',
      name: '新建任务',
      desc: '在当前清单中创建一条任务',
      combo: ['Ctrl', 'Alt', 'N']
    },
    {
      id: 'toggle-theme',
      name: '切换深浅色',
      desc: '在浅色与深色外观之间切换',
      combo: ['Ctrl', 'Alt', 'T']
    },
    {
      id: 'pin-item',
      name: '置顶当前项',
      desc: '将选中的项目固定到顶部',
      combo: ['Ctrl', 'Shift', 'P']
    },
    {
      id: 'export-data',
      name: '导出数据',
      desc: '将当前视图导出为文件',
      combo: null
    }
  ];

  var MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta'];

  var listEl = document.getElementById('shortcutList');
  var captureCard = document.getElementById('captureCard');
  var captureTitle = document.getElementById('captureTitle');
  var captureSub = document.getElementById('captureSub');
  var captureZone = document.getElementById('captureZone');
  var captureKeys = document.getElementById('captureKeys');
  var captureMessage = document.getElementById('captureMessage');
  var cancelCapture = document.getElementById('cancelCapture');
  var clearBinding = document.getElementById('clearBinding');
  var saveBinding = document.getElementById('saveBinding');

  captureMessage.setAttribute('aria-live', 'polite');

  var editingId = null;
  var draftCombo = null;
  var flashTimers = {};

  function comboId(combo) {
    return combo ? combo.join('+') : '';
  }

  function keycap(label) {
    var span = document.createElement('span');
    span.className = 'keycap';
    span.textContent = label;
    return span;
  }

  function renderBinding(combo) {
    var frag = document.createDocumentFragment();
    if (!combo || combo.length === 0) {
      var unbound = document.createElement('span');
      unbound.className = 'unbound';
      unbound.textContent = '未绑定';
      frag.appendChild(unbound);
      return frag;
    }
    combo.forEach(function (part, index) {
      if (index > 0) {
        var sep = document.createElement('span');
        sep.className = 'key-sep';
        sep.textContent = '+';
        frag.appendChild(sep);
      }
      frag.appendChild(keycap(part));
    });
    return frag;
  }

  function renderList() {
    listEl.innerHTML = '';
    ACTIONS.forEach(function (action) {
      var item = document.createElement('div');
      item.className = 'shortcut-item';
      item.dataset.actionId = action.id;

      var main = document.createElement('div');
      main.className = 'action-main';
      var name = document.createElement('span');
      name.className = 'action-name';
      name.textContent = action.name;
      var desc = document.createElement('span');
      desc.className = 'action-desc';
      desc.textContent = action.desc;
      main.appendChild(name);
      main.appendChild(desc);

      var right = document.createElement('div');
      right.className = 'key-binding';
      var bindingWrap = document.createElement('span');
      bindingWrap.className = 'key-binding-current';
      bindingWrap.appendChild(renderBinding(action.combo));
      right.appendChild(bindingWrap);

      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'edit-binding-btn';
      editBtn.textContent = action.combo ? '修改' : '添加';
      editBtn.addEventListener('click', function () {
        startCapture(action.id);
      });
      right.appendChild(editBtn);

      item.appendChild(main);
      item.appendChild(right);
      listEl.appendChild(item);
    });
  }

  function findConflict(combo, ignoreId) {
    var id = comboId(combo);
    for (var i = 0; i < ACTIONS.length; i += 1) {
      var action = ACTIONS[i];
      if (action.id !== ignoreId && comboId(action.combo) === id) {
        return action;
      }
    }
    return null;
  }

  function setMessage(text, level) {
    captureMessage.textContent = text || '';
    captureMessage.className = 'capture-message' + (level ? ' ' + level : '');
  }

  function renderDraft() {
    captureKeys.innerHTML = '';
    if (!draftCombo) {
      var placeholder = document.createElement('span');
      placeholder.className = 'capture-placeholder';
      placeholder.textContent = '按下组合键…';
      captureKeys.appendChild(placeholder);
      return;
    }
    captureKeys.appendChild(renderBinding(draftCombo));
  }

  function startCapture(actionId) {
    var action = null;
    for (var i = 0; i < ACTIONS.length; i += 1) {
      if (ACTIONS[i].id === actionId) {
        action = ACTIONS[i];
        break;
      }
    }
    if (!action) return;

    editingId = actionId;
    draftCombo = null;
    captureTitle.textContent = '录制：' + action.name;
    captureSub.textContent = '请按下包含 Ctrl / Alt / Shift 的组合键，Esc 取消';
    captureCard.hidden = false;
    saveBinding.disabled = true;
    clearBinding.disabled = !action.combo;
    setMessage('');
    renderDraft();
    captureZone.focus();
  }

  function closeCapture() {
    captureCard.hidden = true;
    editingId = null;
    draftCombo = null;
  }

  function normalizeEvent(event) {
    var parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');

    var rawKey = event.key;
    if (MODIFIER_ORDER.indexOf(rawKey) !== -1) {
      return { modifiers: parts, mainKey: null };
    }

    var mainKey;
    if (rawKey === ' ') {
      mainKey = 'Space';
    } else if (rawKey.length === 1) {
      mainKey = rawKey.toUpperCase();
    } else {
      mainKey = rawKey;
    }
    return { modifiers: parts, mainKey: mainKey };
  }

  function handleCaptureKeydown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      closeCapture();
      return;
    }

    var normalized = normalizeEvent(event);
    if (!normalized.mainKey) {
      setMessage('继续按住修饰键，再按下要组合的字符键…', 'warn');
      return;
    }

    if (normalized.modifiers.length === 0) {
      draftCombo = null;
      renderDraft();
      saveBinding.disabled = true;
      setMessage('快捷键必须包含至少一个修饰键（Ctrl / Alt / Shift）', 'warn');
      return;
    }

    draftCombo = normalized.modifiers.concat([normalized.mainKey]);
    renderDraft();

    var conflict = findConflict(draftCombo, editingId);
    if (conflict) {
      saveBinding.disabled = true;
      setMessage('与「' + conflict.name + '」的现有快捷键冲突，请换一个组合', 'error');
      return;
    }

    saveBinding.disabled = false;
    setMessage('组合键有效，点击保存即可生效', 'ok');
  }

  function flashAction(actionId) {
    var item = listEl.querySelector('.shortcut-item[data-action-id="' + actionId + '"]');
    if (!item) return;
    item.classList.add('flash');
    if (flashTimers[actionId]) {
      clearTimeout(flashTimers[actionId]);
    }
    flashTimers[actionId] = setTimeout(function () {
      item.classList.remove('flash');
    }, 900);
  }

  function handleGlobalKeydown(event) {
    var normalized = normalizeEvent(event);
    if (!normalized.mainKey || normalized.modifiers.length === 0) return;
    var pressed = normalized.modifiers.concat([normalized.mainKey]);
    var pressedId = comboId(pressed);

    for (var i = 0; i < ACTIONS.length; i += 1) {
      var action = ACTIONS[i];
      if (action.combo && comboId(action.combo) === pressedId) {
        event.preventDefault();
        flashAction(action.id);
        break;
      }
    }
  }

  cancelCapture.addEventListener('click', closeCapture);

  clearBinding.addEventListener('click', function () {
    if (!editingId) return;
    draftCombo = [];
    renderDraft();
    saveBinding.disabled = false;
    setMessage('已清除该动作的快捷键，点击保存后生效', 'warn');
    captureZone.focus();
  });

  saveBinding.addEventListener('click', function () {
    if (!editingId || draftCombo === null) return;
    for (var i = 0; i < ACTIONS.length; i += 1) {
      if (ACTIONS[i].id === editingId) {
        ACTIONS[i].combo = draftCombo.length ? draftCombo.slice() : null;
        break;
      }
    }
    closeCapture();
    renderList();
  });

  captureZone.addEventListener('keydown', handleCaptureKeydown);
  document.addEventListener('keydown', function (event) {
    if (!captureCard.hidden) return;
    handleGlobalKeydown(event);
  });

  renderList();
})();

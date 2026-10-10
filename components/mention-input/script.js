(function () {
  var MEMBERS = [
    { id: 'u1', name: '王梓萱', handle: 'wangzixuan', en: 'wangzixuan', color: '#f472b6' },
    { id: 'u2', name: '陈牧', handle: 'chenmu', en: 'chenmu', color: '#60a5fa' },
    { id: 'u3', name: '林夏', handle: 'linxia', en: 'linxia', color: '#34d399' },
    { id: 'u4', name: '赵一鸣', handle: 'zhaoyiming', en: 'zhaoyiming', color: '#fbbf24' },
    { id: 'u5', name: 'Alice Wang', handle: 'alicew', en: 'alicew', color: '#a78bfa' },
    { id: 'u6', name: 'Bruce Li', handle: 'brucel', en: 'brucel', color: '#fb923c' },
    { id: 'u7', name: '周清', handle: 'zhouqing', en: 'zhouqing', color: '#22d3ee' },
    { id: 'u8', name: '高远', handle: 'gaoyuan', en: 'gaoyuan', color: '#f87171' },
    { id: 'u9', name: 'Nora Kim', handle: 'norakim', en: 'norakim', color: '#4ade80' }
  ];

  var editor = document.getElementById('editor');
  var mentionMenu = document.getElementById('mentionMenu');
  var mentionOptions = document.getElementById('mentionOptions');
  var atTrigger = document.getElementById('atTrigger');
  var publishBtn = document.getElementById('publishBtn');
  var previewCard = document.getElementById('previewCard');
  var previewBody = document.getElementById('previewBody');
  var previewMentions = document.getElementById('previewMentions');
  var previewTime = document.getElementById('previewTime');

  var menuState = {
    open: false,
    active: 0,
    items: [],
    queryStart: null
  };

  function getCaretNode() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
  }

  function textBeforeCaret() {
    var range = getCaretNode();
    if (!range) return '';
    var before = range.cloneRange();
    before.selectNodeContents(editor);
    before.setEnd(range.endContainer, range.endOffset);
    return before.toString();
  }

  function detectQuery() {
    var text = textBeforeCaret();
    var match = text.match(/(^|\s)@([\w\u4e00-\u9fa5]*)$/);
    if (!match) return null;
    var atIndex = text.length - match[2].length - 1;
    return { query: match[2], start: atIndex };
  }

  function filterMembers(query) {
    var q = query.trim().toLowerCase();
    var filtered = MEMBERS.filter(function (m) {
      if (!q) return true;
      return m.name.toLowerCase().indexOf(q) !== -1 ||
        m.en.indexOf(q) !== -1 ||
        m.handle.toLowerCase().indexOf(q) !== -1;
    });
    return filtered.slice(0, 7);
  }

  function renderOptions() {
    mentionOptions.innerHTML = '';
    if (menuState.items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'option-empty';
      empty.textContent = '没有匹配的成员';
      mentionOptions.appendChild(empty);
      return;
    }
    menuState.items.forEach(function (m, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mention-option' + (idx === menuState.active ? ' active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', idx === menuState.active ? 'true' : 'false');
      btn.dataset.index = String(idx);
      btn.innerHTML =
        '<span class="option-avatar" style="background:' + m.color + '">' + m.name.slice(0, 1) + '</span>' +
        '<span class="option-main"><span class="option-name">' + m.name + '</span><br>' +
        '<span class="option-handle">@' + m.handle + '</span></span>';
      mentionOptions.appendChild(btn);
    });
  }

  function openMenu(info) {
    menuState.open = true;
    menuState.active = 0;
    menuState.queryStart = info.start;
    menuState.items = filterMembers(info.query);
    mentionMenu.hidden = false;
    editor.setAttribute('aria-expanded', 'true');
    renderOptions();
  }

  function closeMenu() {
    menuState.open = false;
    menuState.items = [];
    mentionMenu.hidden = true;
    editor.setAttribute('aria-expanded', 'false');
  }

  function updateMenu(info) {
    menuState.items = filterMembers(info.query);
    if (menuState.items.length === 0 && !info.query) {
      closeMenu();
      return;
    }
    if (menuState.active >= menuState.items.length) menuState.active = 0;
    renderOptions();
  }

  function placeCaretAfter(node) {
    var range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function deleteMentionRange() {
    var range = getCaretNode();
    var queryLength = editor.textContent.length - menuState.queryStart;
    var node = range.endContainer;
    var offset = range.endOffset;
    if (node.nodeType === Node.TEXT_NODE) {
      var removeFrom = Math.max(0, offset - queryLength);
      node.textContent = node.textContent.slice(0, removeFrom) + node.textContent.slice(offset);
      range.setStart(node, removeFrom);
      range.collapse(true);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function selectMember(member) {
    deleteMentionRange();

    var chip = document.createElement('span');
    chip.className = 'mention-chip';
    chip.contentEditable = 'false';
    chip.dataset.memberId = member.id;
    chip.dataset.name = member.name;
    chip.textContent = '@' + member.name;

    var range = getCaretNode();
    range.insertNode(chip);

    var space = document.createTextNode('\u00A0');
    chip.parentNode.insertBefore(space, chip.nextSibling);
    placeCaretAfter(space);

    closeMenu();
    editor.focus();
  }

  function onInput() {
    var info = detectQuery();
    if (info) {
      if (menuState.open) {
        updateMenu(info);
      } else {
        openMenu(info);
      }
    } else if (menuState.open) {
      closeMenu();
    }
  }

  function scrollActiveIntoView() {
    var activeEl = mentionOptions.querySelector('.mention-option.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  editor.addEventListener('keydown', function (e) {
    if (!menuState.open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (menuState.items.length) {
        menuState.active = (menuState.active + 1) % menuState.items.length;
        renderOptions();
        scrollActiveIntoView();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (menuState.items.length) {
        menuState.active = (menuState.active - 1 + menuState.items.length) % menuState.items.length;
        renderOptions();
        scrollActiveIntoView();
      }
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      var member = menuState.items[menuState.active];
      if (member) selectMember(member);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  });

  mentionOptions.addEventListener('mousedown', function (e) {
    e.preventDefault();
    var option = e.target.closest('.mention-option');
    if (!option) return;
    var idx = Number(option.dataset.index);
    selectMember(menuState.items[idx]);
  });

  mentionOptions.addEventListener('mouseover', function (e) {
    var option = e.target.closest('.mention-option');
    if (!option) return;
    menuState.active = Number(option.dataset.index);
    renderOptions();
  });

  atTrigger.addEventListener('click', function () {
    editor.focus();
    var needsSpace = editor.textContent.length > 0 && !/\s$/.test(editor.textContent);
    var node = document.createTextNode((needsSpace ? ' ' : '') + '@');
    var range = getCaretNode() || document.createRange();
    if (!getCaretNode()) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    openMenu({ query: '', start: menuState.queryStart !== null ? menuState.queryStart : editor.textContent.length - 1 });
    menuState.queryStart = editor.textContent.length - 1;
  });

  editor.addEventListener('blur', function () {
    setTimeout(function () {
      if (!mentionMenu.contains(document.activeElement)) closeMenu();
    }, 120);
  });

  function collectMentions() {
    return Array.prototype.slice.call(editor.querySelectorAll('.mention-chip')).map(function (chip) {
      return { id: chip.dataset.memberId, name: chip.dataset.name };
    });
  }

  publishBtn.addEventListener('click', function () {
    var text = editor.textContent.trim();
    if (!text) {
      editor.focus();
      return;
    }
    var clone = editor.cloneNode(true);
    clone.querySelectorAll('.mention-chip').forEach(function (chip) {
      chip.setAttribute('contenteditable', 'false');
    });
    previewBody.innerHTML = clone.innerHTML;
    var mentions = collectMentions();
    previewMentions.textContent = mentions.length
      ? '已通知：' + mentions.map(function (m) { return m.name; }).join('、')
      : '本次评论未提及成员';
    var now = new Date();
    previewTime.textContent = '刚刚 · ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    previewCard.hidden = false;
    previewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    editor.innerHTML = '';
    closeMenu();
  });

  editor.focus();
})();

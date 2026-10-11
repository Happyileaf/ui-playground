(function () {
  'use strict';

  var toolbar = document.getElementById('toolbar');
  var editor = document.getElementById('editor');
  var colorBtn = document.getElementById('colorBtn');
  var colorPanel = document.getElementById('colorPanel');
  var linkBtn = document.getElementById('linkBtn');
  var linkPanel = document.getElementById('linkPanel');
  var linkInput = document.getElementById('linkInput');
  var applyLinkBtn = document.getElementById('applyLinkBtn');
  var unlinkBtn = document.getElementById('unlinkBtn');
  var charCount = document.getElementById('charCount');
  var selectionInfo = document.getElementById('selectionInfo');
  var htmlToggle = document.getElementById('htmlToggle');
  var htmlOutput = document.getElementById('htmlOutput');
  var htmlPre = document.getElementById('htmlPre');

  var savedRange = null;

  function focusEditor() {
    editor.focus();
  }

  function exec(command, value) {
    focusEditor();
    document.execCommand(command, false, value || null);
    syncState();
    updateStats();
  }

  function formatBlock(tag) {
    focusEditor();
    document.execCommand('formatBlock', false, '<' + tag + '>');
    syncState();
    updateStats();
  }

  function saveSelection() {
    var selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      savedRange = selection.getRangeAt(0).cloneRange();
    } else {
      savedRange = null;
    }
  }

  function restoreSelection() {
    if (!savedRange) return false;
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  }

  function closePanels() {
    colorPanel.hidden = true;
    linkPanel.hidden = true;
    colorBtn.setAttribute('aria-expanded', 'false');
    linkBtn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel(panel, button) {
    var willOpen = panel.hidden;
    closePanels();
    if (willOpen) {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      if (panel === linkPanel) {
        saveSelection();
        linkInput.value = '';
        setTimeout(function () { linkInput.focus(); }, 0);
      }
    }
  }

  function syncState() {
    var commandButtons = toolbar.querySelectorAll('[data-command]');
    commandButtons.forEach(function (btn) {
      var command = btn.dataset.command;
      var active = false;
      try {
        active = document.queryCommandState(command);
      } catch (err) {
        active = false;
      }
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var blockValue = '';
    try {
      blockValue = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    } catch (err) {
      blockValue = '';
    }
    toolbar.querySelectorAll('[data-block]').forEach(function (btn) {
      btn.classList.toggle('active', blockValue === btn.dataset.block);
    });
  }

  function updateStats() {
    var text = editor.innerText || '';
    var total = text.replace(/\s/g, '').length;
    charCount.textContent = total + ' 字';

    var selected = '';
    var selection = window.getSelection();
    if (selection && editor.contains(selection.anchorNode)) {
      selected = selection.toString().trim();
    }
    selectionInfo.textContent = selected ? '已选中 ' + selected.length + ' 个字符' : '未选中文字';
  }

  toolbar.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-command], [data-block]');
    if (!btn) return;
    if (btn.dataset.command) {
      exec(btn.dataset.command);
    } else if (btn.dataset.block) {
      formatBlock(btn.dataset.block);
    }
  });

  colorBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    togglePanel(colorPanel, colorBtn);
  });

  colorPanel.addEventListener('click', function (event) {
    var swatch = event.target.closest('.color-swatch');
    if (!swatch) return;
    focusEditor();
    if (!restoreSelection()) {
      closePanels();
      return;
    }
    document.execCommand('foreColor', false, swatch.dataset.color);
    closePanels();
    syncState();
    updateStats();
  });

  linkBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    togglePanel(linkPanel, linkBtn);
  });

  applyLinkBtn.addEventListener('click', function () {
    var url = linkInput.value.trim();
    if (!url) {
      linkInput.focus();
      return;
    }
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      url = 'https://' + url;
    }
    focusEditor();
    restoreSelection();
    var selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      document.execCommand('createLink', false, url);
    } else {
      var link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      insertNodeAtCaret(link);
    }
    closePanels();
    syncState();
    updateStats();
  });

  unlinkBtn.addEventListener('click', function () {
    focusEditor();
    restoreSelection();
    document.execCommand('unlink', false, null);
    closePanels();
    syncState();
    updateStats();
  });

  function insertNodeAtCaret(node) {
    var selection = window.getSelection();
    if (!selection.rangeCount) {
      editor.appendChild(node);
      return;
    }
    var range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  linkInput.addEventListener('keydown', function (event) {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      applyLinkBtn.click();
    } else if (event.key === 'Escape') {
      closePanels();
      editor.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest('.dropdown-wrap')) return;
    closePanels();
  });

  editor.addEventListener('keyup', function () {
    syncState();
    updateStats();
  });
  editor.addEventListener('mouseup', function () {
    syncState();
    updateStats();
  });
  document.addEventListener('selectionchange', function () {
    syncState();
    updateStats();
  });

  htmlToggle.addEventListener('click', function () {
    var showing = htmlOutput.hidden;
    htmlOutput.hidden = !showing;
    htmlToggle.classList.toggle('active', showing);
    htmlToggle.setAttribute('aria-pressed', showing ? 'true' : 'false');
    if (showing) {
      htmlPre.textContent = editor.innerHTML;
    }
  });

  editor.addEventListener('input', function () {
    updateStats();
    if (!htmlOutput.hidden) {
      htmlPre.textContent = editor.innerHTML;
    }
  });

  syncState();
  updateStats();
})();

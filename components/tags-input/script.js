(function () {
  const box = document.getElementById('tagsBox');
  const list = document.getElementById('tagList');
  const input = document.getElementById('tagInput');
  const suggestions = document.getElementById('suggestions');
  const countLine = document.getElementById('countLine');
  const clearBtn = document.getElementById('clearBtn');
  const sendBtn = document.getElementById('sendBtn');
  const toast = document.getElementById('toast');

  const MAX = 8;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const SPLIT_RE = /[\s,;，；、\n\r]+/;

  const CONTACTS = [
    { name: '韩梅梅', email: 'meimei@studio.com' },
    { name: '林涛', email: 'lintao@studio.com' },
    { name: '王小明', email: 'xiaoming@studio.com' },
    { name: 'Emma', email: 'emma@design.io' },
    { name: 'Noah', email: 'noah@lab.dev' }
  ];

  const tags = [];
  let activeSug = -1;
  let toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function normalize(value) {
    return value.trim().toLowerCase();
  }

  function initials(name) {
    return name.slice(0, 1).toUpperCase();
  }

  function addTag(raw) {
    const value = normalize(raw);
    if (!value) return false;
    if (!EMAIL_RE.test(value)) {
      box.classList.add('is-invalid');
      showToast('“' + value + '” 不是有效邮箱');
      setTimeout(() => box.classList.remove('is-invalid'), 700);
      return false;
    }
    if (tags.includes(value)) {
      showToast('该邮箱已添加');
      return false;
    }
    if (tags.length >= MAX) {
      showToast('最多邀请 ' + MAX + ' 人');
      return false;
    }
    tags.push(value);
    render();
    return true;
  }

  function removeTag(value) {
    const idx = tags.indexOf(value);
    if (idx !== -1) {
      tags.splice(idx, 1);
      render();
    }
  }

  function parseBulk(text) {
    return text.split(SPLIT_RE).map(normalize).filter(Boolean);
  }

  function render() {
    list.innerHTML = '';
    tags.forEach((tag, i) => {
      const li = document.createElement('li');
      li.className = 'tag' + (i === tags.length - 1 ? ' is-last' : '');
      const span = document.createElement('span');
      span.className = 'tag-text';
      span.textContent = tag;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-remove';
      btn.setAttribute('aria-label', '移除 ' + tag);
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>';
      btn.addEventListener('click', () => removeTag(tag));
      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
    countLine.textContent = '已添加 ' + tags.length + ' / ' + MAX + ' 人';
  }

  function renderSuggestions() {
    const q = input.value.trim().toLowerCase();
    const matches = CONTACTS.filter((c) => {
      if (tags.includes(c.email)) return false;
      return !q || c.name.toLowerCase().includes(q) || c.email.includes(q);
    }).slice(0, 5);

    suggestions.innerHTML = '';
    if (!matches.length || (q && q.includes('@') === false && q.length > 12)) {
      suggestions.hidden = true;
      activeSug = -1;
      return;
    }
    matches.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = 'suggestion' + (i === activeSug ? ' is-active' : '');
      li.setAttribute('role', 'option');
      li.dataset.email = c.email;
      li.innerHTML = '<span class="avatar">' + initials(c.name) + '</span><span>' + c.name + '</span><span class="sug-mail">' + c.email + '</span>';
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addTag(c.email);
        input.value = '';
        suggestions.hidden = true;
      });
      suggestions.appendChild(li);
    });
    suggestions.hidden = false;
  }

  input.addEventListener('focus', () => {
    box.classList.add('is-focused');
    renderSuggestions();
  });

  input.addEventListener('blur', () => {
    box.classList.remove('is-focused');
    setTimeout(() => { suggestions.hidden = true; }, 120);
  });

  input.addEventListener('input', () => {
    activeSug = -1;
    box.classList.remove('is-invalid');
    renderSuggestions();
  });

  input.addEventListener('keydown', (e) => {
    const options = suggestions.querySelectorAll('.suggestion');
    if ((e.key === 'Enter' || e.key === ',' || e.key === '，') && activeSug >= 0 && options[activeSug]) {
      e.preventDefault();
      addTag(options[activeSug].dataset.email);
      input.value = '';
      suggestions.hidden = true;
      activeSug = -1;
      return;
    }
    if (e.key === 'Enter' || e.key === ',' || e.key === '，' || e.key === ';' || e.key === '；') {
      e.preventDefault();
      if (addTag(input.value)) input.value = '';
      suggestions.hidden = true;
      return;
    }
    if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      render();
      return;
    }
    if (!suggestions.hidden) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSug = (activeSug + 1) % options.length;
        renderSuggestions();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSug = (activeSug - 1 + options.length) % options.length;
        renderSuggestions();
      } else if (e.key === 'Escape') {
        suggestions.hidden = true;
      }
    }
  });

  input.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (SPLIT_RE.test(text.trim())) {
      e.preventDefault();
      const parts = parseBulk(text);
      let added = 0;
      parts.forEach((p) => { if (addTag(p)) added += 1; });
      input.value = '';
      if (added) showToast('已添加 ' + added + ' 个邮箱');
    }
  });

  box.addEventListener('click', () => input.focus());

  clearBtn.addEventListener('click', () => {
    if (!tags.length) return;
    tags.length = 0;
    render();
    input.focus();
  });

  sendBtn.addEventListener('click', () => {
    if (!tags.length) {
      showToast('请至少添加一位成员');
      input.focus();
      return;
    }
    showToast('已向 ' + tags.length + ' 位成员发送邀请');
  });

  render();
})();

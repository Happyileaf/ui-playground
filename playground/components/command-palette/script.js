(function () {
  const openBtn = document.getElementById('openPaletteBtn');
  const backdrop = document.getElementById('paletteBackdrop');
  const palette = backdrop.querySelector('.palette');
  const input = document.getElementById('paletteInput');
  const resultsEl = document.getElementById('paletteResults');
  const previewEl = document.getElementById('commandPreview');

  const ICONS = {
    home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };

  const commands = [
    { id: 'goto-home', group: '导航', name: '回到首页', icon: 'home', shortcut: ['G', 'H'], keywords: 'home dashboard 首页 主页' },
    { id: 'goto-inbox', group: '导航', name: '打开收件箱', icon: 'inbox', shortcut: ['G', 'I'], keywords: 'inbox 收件箱 消息 messages' },
    { id: 'goto-profile', group: '导航', name: '查看个人资料', icon: 'user', shortcut: ['G', 'P'], keywords: 'profile 资料 账户 account' },

    { id: 'new-post', group: '创建', name: '新建文章', icon: 'edit', shortcut: ['C'], keywords: 'new post create write 新建 文章 写' },
    { id: 'new-item', group: '创建', name: '新建项目', icon: 'plus', shortcut: ['N'], keywords: 'new project item 新建 项目 创建' },
    { id: 'upload-file', group: '创建', name: '上传文件', icon: 'upload', shortcut: ['U'], keywords: 'upload file 上传 文件' },

    { id: 'toggle-theme', group: '偏好', name: '切换深浅色主题', icon: 'moon', shortcut: ['T'], keywords: 'theme dark light 主题 深色 浅色 夜间' },
    { id: 'toggle-notif', group: '偏好', name: '开关通知提醒', icon: 'bell', shortcut: [], keywords: 'notification bell 通知 提醒 铃铛' },
    { id: 'open-settings', group: '偏好', name: '打开设置', icon: 'settings', shortcut: [','], keywords: 'settings config 设置 偏好 配置' },

    { id: 'export-data', group: '数据', name: '导出数据', icon: 'download', shortcut: ['E'], keywords: 'export download 导出 下载 数据' },
    { id: 'clear-cache', group: '数据', name: '清除缓存', icon: 'trash', shortcut: [], keywords: 'clear cache delete 清除 缓存 删除' },
    { id: 'lock-screen', group: '数据', name: '锁定屏幕', icon: 'lock', shortcut: ['L'], keywords: 'lock screen 锁定 屏幕 安全' },

    { id: 'global-search', group: '其他', name: '全局搜索', icon: 'search', shortcut: ['/'], keywords: 'search find 搜索 查找 全局' },
    { id: 'sign-out', group: '其他', name: '退出登录', icon: 'logout', shortcut: [], keywords: 'logout signout 退出 登出' },
    { id: 'help', group: '其他', name: '帮助与快捷键', icon: 'help', shortcut: ['?'], keywords: 'help shortcut 帮助 快捷键 文档 docs' }
  ];

  let recent = [];
  let rendered = [];
  let activeIndex = 0;

  function highlight(text, query) {
    if (!query) return text;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    let result = '';
    let last = 0;
    let idx = lower.indexOf(q);
    while (idx !== -1) {
      result += text.slice(last, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>';
      last = idx + q.length;
      idx = lower.indexOf(q, last);
    }
    result += text.slice(last);
    return result;
  }

  function score(cmd, query) {
    if (!query) return 1;
    const q = query.toLowerCase();
    const name = cmd.name.toLowerCase();
    if (name.startsWith(q)) return 100;
    if (name.includes(q)) return 60;
    if (cmd.keywords.toLowerCase().includes(q)) return 30;
    let qi = 0;
    for (let i = 0; i < name.length && qi < q.length; i++) {
      if (name[i] === q[qi]) qi++;
    }
    return qi === q.length ? 15 : -1;
  }

  function render() {
    const query = input.value.trim();
    const scored = commands
      .map(cmd => ({ cmd, s: score(cmd, query) }))
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s);

    rendered = scored.map(x => x.cmd);

    if (!query && recent.length) {
      const recentItems = recent
        .map(id => commands.find(c => c.id === id))
        .filter(Boolean);
      rendered = recentItems.concat(rendered.filter(c => recent.indexOf(c.id) === -1));
    }

    resultsEl.innerHTML = '';
    activeIndex = 0;

    if (rendered.length === 0) {
      resultsEl.innerHTML = '<div class="no-results">没有匹配的命令，换个关键词试试。</div>';
      return;
    }

    let lastGroup = null;
    rendered.forEach((cmd, index) => {
      const showGroup = !query && cmd.group !== lastGroup;
      if (showGroup) {
        lastGroup = cmd.group;
        const label = document.createElement('div');
        label.className = 'result-group-label';
        label.textContent = (!query && recent.length && index === 0) ? '最近使用' : cmd.group;
        resultsEl.appendChild(label);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'result-item' + (index === 0 ? ' active' : '');
      btn.dataset.index = index;

      const shortcutHtml = cmd.shortcut
        .map(k => `<kbd>${k}</kbd>`)
        .join('');

      btn.innerHTML = `
        <span class="item-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[cmd.icon] || ICONS.help}</svg>
        </span>
        <span class="item-text">
          <span class="item-name">${highlight(cmd.name, query)}</span>
          <span class="item-hint">${cmd.group}</span>
        </span>
        <span class="item-shortcut">${shortcutHtml}</span>
      `;

      btn.addEventListener('click', () => execute(cmd));
      btn.addEventListener('mouseenter', () => setActive(index));
      resultsEl.appendChild(btn);
    });
  }

  function setActive(index) {
    if (rendered.length === 0) return;
    activeIndex = (index + rendered.length) % rendered.length;
    const items = resultsEl.querySelectorAll('.result-item');
    items.forEach((el, i) => {
      el.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function execute(cmd) {
    recent = [cmd.id].concat(recent.filter(id => id !== cmd.id)).slice(0, 4);
    previewEl.innerHTML = `<span class="exec-label">已执行：</span>${cmd.name}`;
    close();
  }

  function open() {
    backdrop.hidden = false;
    input.value = '';
    render();
    setTimeout(() => input.focus(), 0);
    document.addEventListener('keydown', onKeydown, true);
  }

  function close() {
    backdrop.hidden = true;
    document.removeEventListener('keydown', onKeydown, true);
  }

  function onKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rendered[activeIndex]) execute(rendered[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  input.addEventListener('input', render);
  openBtn.addEventListener('click', open);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.hidden) open();
      else close();
    }
  });
})();

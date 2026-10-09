(function () {
  document.querySelectorAll('[data-noop]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  const FOLDER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>';
  const FILE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>';

  const FS = {
    name: '我的空间',
    children: [
      { name: '设计稿', children: [
        { name: '移动端', children: [
          { name: '首页改版.fig' },
          { name: '组件规范.fig' }
        ]},
        { name: '桌面端', children: [
          { name: '官网首页.fig' }
        ]},
        { name: '灵感收集.fig' }
      ]},
      { name: '开发文档', children: [
        { name: 'API 说明', children: [
          { name: '接口列表.md' },
          { name: '鉴权流程.md' }
        ]},
        { name: 'README.md' }
      ]},
      { name: '照片', children: [
        { name: '2026 旅行', children: [
          { name: '海边.jpg' },
          { name: '山顶.jpg' }
        ]}
      ]},
      { name: '简历.pdf' }
    ]
  };

  const bcNav = document.getElementById('explorerBc');
  const body = document.getElementById('explorerBody');
  let trail = [FS];
  let menuOpen = false;

  function currentNode() {
    return trail[trail.length - 1];
  }

  function range(start, end) {
    const arr = [];
    for (let i = start; i <= end; i += 1) arr.push(i);
    return arr;
  }

  function renderExplorer() {
    body.innerHTML = '';
    const children = currentNode().children || [];
    if (children.length === 0) {
      const empty = document.createElement('p');
      empty.style.cssText = 'grid-column:1/-1;text-align:center;color:var(--text-faint);font-size:.82rem;padding:2rem 0';
      empty.textContent = '这个文件夹是空的';
      body.appendChild(empty);
      return;
    }
    children.forEach((child) => {
      const isFolder = Array.isArray(child.children);
      const el = document.createElement(isFolder ? 'button' : 'div');
      if (isFolder) el.type = 'button';
      el.className = 'entry ' + (isFolder ? 'entry-folder' : 'entry-file');
      el.innerHTML = (isFolder ? FOLDER_SVG : FILE_SVG) + '<span class="entry-name"></span>';
      el.querySelector('.entry-name').textContent = child.name;
      if (isFolder) {
        el.addEventListener('click', () => {
          trail.push(child);
          render();
        });
      }
      body.appendChild(el);
    });
  }

  function makeSeparator() {
    const li = document.createElement('li');
    li.className = 'bc-item';
    li.setAttribute('aria-hidden', 'true');
    const s = document.createElement('span');
    s.style.cssText = 'display:inline-block;width:6px;height:6px;margin:0 5px;border-top:1.6px solid var(--text-faint);border-right:1.6px solid var(--text-faint);transform:rotate(45deg)';
    li.appendChild(s);
    return li;
  }

  function makeLinkCrumb(index) {
    const li = document.createElement('li');
    li.className = 'bc-item';
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = trail[index].name;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      trail = trail.slice(0, index + 1);
      render();
    });
    li.appendChild(a);
    return li;
  }

  function makeCurrentCrumb() {
    const li = document.createElement('li');
    li.className = 'bc-item is-current';
    li.setAttribute('aria-current', 'page');
    li.textContent = currentNode().name;
    return li;
  }

  function closeMenu() {
    menuOpen = false;
    document.querySelectorAll('.bc-overflow.is-open').forEach((w) => w.classList.remove('is-open'));
  }

  function makeOverflowCrumb(hiddenIndices) {
    const li = document.createElement('li');
    li.className = 'bc-item';
    const wrap = document.createElement('span');
    wrap.className = 'bc-overflow';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bc-overflow-btn';
    btn.setAttribute('aria-label', '展开折叠的层级');
    btn.textContent = '…';
    const menu = document.createElement('span');
    menu.className = 'bc-overflow-menu';
    hiddenIndices.forEach((idx) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = trail[idx].name;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        trail = trail.slice(0, idx + 1);
        render();
      });
      menu.appendChild(item);
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOpen = !menuOpen;
      wrap.classList.toggle('is-open', menuOpen);
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    li.appendChild(wrap);
    return li;
  }

  function renderBreadcrumb() {
    closeMenu();
    bcNav.innerHTML = '';
    const ol = document.createElement('ol');
    const n = trail.length;
    let hiddenStart = -1;
    let hiddenEnd = -1;
    if (n > 4 && bcNav.clientWidth < 480) {
      hiddenStart = 1;
      hiddenEnd = n - 3;
    }
    for (let i = 0; i < n; i += 1) {
      if (i > 0) ol.appendChild(makeSeparator());
      if (i >= hiddenStart && i <= hiddenEnd) {
        if (i === hiddenStart) ol.appendChild(makeOverflowCrumb(range(hiddenStart, hiddenEnd)));
      } else if (i === n - 1) {
        ol.appendChild(makeCurrentCrumb());
      } else {
        ol.appendChild(makeLinkCrumb(i));
      }
    }
    bcNav.appendChild(ol);
  }

  function render() {
    renderExplorer();
    renderBreadcrumb();
  }

  document.addEventListener('click', closeMenu);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderBreadcrumb, 120);
  });

  render();
})();

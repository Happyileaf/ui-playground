(function () {
  const root = document.getElementById('treeRoot');
  const searchInput = document.getElementById('treeSearch');
  const selectionPath = document.getElementById('selectionPath');
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');

  const ICONS = {
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    css: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"></path></svg>',
    js: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M9 9h6v6H9z"></path></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
  };

  const data = [
    { name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [
        { name: 'Button.js', type: 'js' },
        { name: 'Card.css', type: 'css' },
        { name: 'Modal.html', type: 'html' }
      ] },
      { name: 'assets', type: 'folder', children: [
        { name: 'logo.svg', type: 'image' },
        { name: 'hero.png', type: 'image' }
      ] },
      { name: 'index.js', type: 'js' },
      { name: 'styles.css', type: 'css' }
    ] },
    { name: 'public', type: 'folder', children: [
      { name: 'favicon.ico', type: 'file' },
      { name: 'robots.txt', type: 'file' }
    ] },
    { name: 'index.html', type: 'html' },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  const nodes = [];
  let idSeq = 0;

  function iconFor(node) {
    if (node.type === 'folder') return { cls: 'folder', svg: ICONS.folder };
    const key = ['html', 'css', 'js', 'image'].includes(node.type) ? node.type : 'file';
    return { cls: key, svg: ICONS[key] };
  }

  function register(node, depth, parent) {
    node.id = idSeq++;
    node.depth = depth;
    node.parent = parent;
    node.expanded = depth === 0 && node.type === 'folder';
    nodes.push(node);
    if (node.children) node.children.forEach(c => register(c, depth + 1, node));
  }

  data.forEach(n => register(n, 0, null));

  let focusedId = nodes[0].id;

  function visibleNodes(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      nodes.forEach(n => { n.match = n.type !== 'folder'; n.forceOpen = false; });
      return nodes.filter(isVisibleByExpansion);
    }

    nodes.forEach(n => { n.match = n.name.toLowerCase().includes(q); n.forceOpen = false; });

    nodes.forEach((n) => {
      if (n.match) {
        let p = n.parent;
        while (p) {
          p.match = true;
          p.forceOpen = true;
          p = p.parent;
        }
      }
    });

    return nodes.filter(n => n.match && isVisibleByExpansion(n));
  }

  function isVisibleByExpansion(node) {
    let p = node.parent;
    while (p) {
      const open = p.forceOpen || p.expanded;
      if (!open) return false;
      p = p.parent;
    }
    return true;
  }

  function nextSibling(node) {
    if (!node.parent) {
      const i = data.indexOf(node);
      return data[i + 1] || null;
    }
    const list = node.parent.children;
    const i = list.indexOf(node);
    return list[i + 1] || null;
  }

  function prevSibling(node) {
    if (!node.parent) {
      const i = data.indexOf(node);
      return i > 0 ? data[i - 1] : null;
    }
    const list = node.parent.children;
    const i = list.indexOf(node);
    return i > 0 ? list[i - 1] : null;
  }

  function lastVisibleDescendant(node) {
    if (node.type === 'file' || !node.expanded || !node.children.length) return node;
    const lastChild = node.children[node.children.length - 1];
    return lastVisibleDescendant(lastChild);
  }

  function render() {
    root.innerHTML = '';
    const visible = visibleNodes(searchInput.value);

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'tree-empty';
      empty.textContent = '没有匹配的文件或文件夹';
      root.appendChild(empty);
      return;
    }

    if (!visible.some(n => n.id === focusedId)) focusedId = visible[0].id;

    visible.forEach((node) => {
      const row = document.createElement('div');
      row.className = `tree-row${node.id === focusedId ? ' focused' : ''}`;
      row.dataset.id = node.id;
      row.style.paddingLeft = `${0.6 + node.depth * 1.1}rem`;
      row.setAttribute('role', 'treeitem');
      row.setAttribute('aria-selected', node.id === focusedId ? 'true' : 'false');
      if (node.type === 'folder') {
        row.setAttribute('aria-expanded', node.expanded ? 'true' : 'false');
      }
      row.setAttribute('aria-level', String(node.depth + 1));

      const isFolder = node.type === 'folder';
      const caretSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      row.innerHTML = `
        <span class="caret ${isFolder ? (node.expanded ? 'open' : '') : 'leaf'}">${caretSvg}</span>
        <span class="node-icon ${iconFor(node).cls}">${iconFor(node).svg}</span>
        <span class="node-label"></span>
      `;
      row.querySelector('.node-label').textContent = node.name;

      row.addEventListener('click', () => {
        focusedId = node.id;
        activate(node);
        render();
      });

      root.appendChild(row);
    });
  }

  function activate(node) {
    if (node.type === 'folder') {
      node.expanded = !node.expanded;
    } else {
      const parts = [];
      let p = node;
      while (p) {
        parts.unshift(p.name);
        p = p.parent;
      }
      selectionPath.textContent = `/${parts.join('/')}`;
    }
  }

  function focusNode(node) {
    if (!node) return;
    focusedId = node.id;
    render();
  }

  root.addEventListener('keydown', (e) => {
    const node = nodes.find(n => n.id === focusedId);
    if (!node) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (node.type === 'folder' && !node.expanded) {
          node.expanded = true;
          render();
        } else if (node.type === 'folder' && node.children.length) {
          focusNode(node.children[0]);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (node.type === 'folder' && node.expanded) {
          node.expanded = false;
          render();
        } else if (node.parent) {
          focusNode(node.parent);
        }
        break;
      case 'ArrowDown':
        e.preventDefault(); {
          const visible = visibleNodes(searchInput.value);
          const idx = visible.findIndex(n => n.id === focusedId);
          focusNode(visible[idx + 1] || node);
        }
        break;
      case 'ArrowUp':
        e.preventDefault(); {
          const visible = visibleNodes(searchInput.value);
          const idx = visible.findIndex(n => n.id === focusedId);
          focusNode(visible[idx - 1] || node);
        }
        break;
      case 'Home':
        e.preventDefault();
        focusNode(visibleNodes(searchInput.value)[0]);
        break;
      case 'End':
        e.preventDefault(); {
          const visible = visibleNodes(searchInput.value);
          focusNode(visible[visible.length - 1]);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activate(node);
        render();
        break;
      default:
        break;
    }
  });

  searchInput.addEventListener('input', render);

  expandAllBtn.addEventListener('click', () => {
    nodes.forEach(n => { if (n.type === 'folder') n.expanded = true; });
    render();
  });

  collapseAllBtn.addEventListener('click', () => {
    nodes.forEach(n => { if (n.type === 'folder') n.expanded = false; });
    focusedId = nodes[0].id;
    render();
  });

  render();
})();

const ICONS = {
  'folder-plus': '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
  'file-plus': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  'scissors': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'arrows-up-down': '<polyline points="17 20 21 16 17 12"/><line x1="21" y1="16" x2="9" y2="16"/><polyline points="7 4 3 8 7 12"/><line x1="3" y1="8" x2="15" y2="8"/>',
  'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
  'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  'layout-grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  'grid': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>',
  'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'hard-drive': '<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>',
  'eye-off': '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>'
};

const state = {
  viewMode: 'medium',
  sortBy: 'name',
  showHidden: false
};

const menuTree = [
  {
    id: 'new', label: '新建', icon: 'folder-plus',
    children: [
      { id: 'new-folder', label: '文件夹', icon: 'folder-plus', shortcut: 'Ctrl+Shift+N', action: logAction },
      { id: 'new-file', label: '新建文件', icon: 'file-plus', shortcut: 'Ctrl+N', action: logAction },
      { separator: true },
      {
        id: 'new-doc', label: '文档', icon: 'file-text',
        children: [
          { id: 'doc-txt', label: '文本文档 (.txt)', icon: 'file-text', action: logAction },
          { id: 'doc-md', label: 'Markdown 文档', icon: 'file-text', action: logAction },
          { id: 'doc-sheet', label: '电子表格', icon: 'file-text', action: logAction }
        ]
      },
      { id: 'new-shortcut', label: '快捷方式', icon: 'link', action: logAction }
    ]
  },
  { separator: true },
  {
    id: 'open-with', label: '打开方式', icon: 'globe',
    children: [
      { id: 'open-browser', label: '浏览器', icon: 'globe', action: logAction },
      { id: 'open-editor', label: '代码编辑器', icon: 'code', action: logAction },
      { id: 'open-terminal', label: '终端', icon: 'terminal', action: logAction }
    ]
  },
  { separator: true },
  { id: 'cut', label: '剪切', icon: 'scissors', shortcut: 'Ctrl+X', action: logAction },
  { id: 'copy', label: '复制', icon: 'copy', shortcut: 'Ctrl+C', action: logAction },
  { id: 'paste', label: '粘贴', icon: 'clipboard', shortcut: 'Ctrl+V', disabled: true },
  { separator: true },
  {
    id: 'view', label: '查看', icon: 'eye',
    children: [
      { id: 'view-large', label: '大图标', icon: 'layout-grid', group: 'viewMode', value: 'large' },
      { id: 'view-medium', label: '中等图标', icon: 'grid', group: 'viewMode', value: 'medium' },
      { id: 'view-small', label: '小图标', icon: 'list', group: 'viewMode', value: 'small' },
      { separator: true },
      { id: 'toggle-hidden', label: '显示隐藏文件', icon: 'eye-off', toggle: 'showHidden' }
    ]
  },
  {
    id: 'sort', label: '排序方式', icon: 'arrows-up-down',
    children: [
      { id: 'sort-name', label: '名称', icon: 'list', group: 'sortBy', value: 'name' },
      { id: 'sort-date', label: '修改日期', icon: 'clock', group: 'sortBy', value: 'date' },
      { id: 'sort-size', label: '大小', icon: 'hard-drive', group: 'sortBy', value: 'size' }
    ]
  },
  { separator: true },
  { id: 'rename', label: '重命名', icon: 'pencil', shortcut: 'F2', action: logAction },
  { id: 'delete', label: '删除', icon: 'trash', shortcut: 'Del', danger: true, action: logAction }
];

const workspace = document.getElementById('workspace');
const eventLog = document.getElementById('eventLog');
const focusIndex = new Map();
let rootMenu = null;

function svg(name) {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

function logAction(label) {
  eventLog.textContent = `已执行：${label}`;
}

function isItemChecked(item) {
  if (item.group) return state[item.group] === item.value;
  if (item.toggle) return state[item.toggle];
  return false;
}

function buildMenu(items, level, parentMenuEl) {
  const menuEl = document.createElement('div');
  menuEl.className = 'ctx-menu';
  menuEl.setAttribute('role', 'menu');
  menuEl.dataset.level = String(level);

  items.forEach((item) => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'ctx-separator';
      sep.setAttribute('role', 'separator');
      menuEl.appendChild(sep);
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ctx-item';
    btn.setAttribute('role', 'menuitem');
    btn.tabIndex = -1;
    btn.dataset.id = item.id;
    if (item.danger) btn.classList.add('is-danger');
    if (item.disabled) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }
    if (isItemChecked(item)) btn.classList.add('is-checked');

    const iconHtml = item.icon
      ? `<span class="item-icon">${svg(item.icon)}</span>`
      : '<span class="item-icon"></span>';
    btn.innerHTML = `
      ${iconHtml}
      <span class="item-label">${item.label}</span>
      <span class="item-check">${svg('check')}</span>
      ${item.shortcut ? `<span class="item-shortcut">${item.shortcut}</span>` : ''}
      ${item.children ? `<span class="item-arrow">${svg('chevron-right')}</span>` : ''}
    `;

    if (item.children) {
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      const submenu = buildMenu(item.children, level + 1, menuEl);
      submenu.classList.add('ctx-submenu');
      submenu.dataset.parentItem = item.id;
      document.body.appendChild(submenu);
      btn.dataset.submenuId = submenu.dataset.menuId;
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activateItem(item, btn, menuEl);
    });

    btn.addEventListener('pointerenter', () => {
      setFocus(menuEl, itemIndex(menuEl, btn));
      if (item.children) {
        openSubmenu(btn);
      } else {
        closeChildChain(menuEl);
      }
    });

    menuEl.appendChild(btn);
  });

  menuEl.dataset.menuId = `m-${Math.random().toString(36).slice(2, 9)}`;
  menuEl.id = menuEl.dataset.menuId;
  focusIndex.set(menuEl, -1);
  return menuEl;
}

function itemIndex(menuEl, btn) {
  return getItems(menuEl).indexOf(btn);
}

function getItems(menuEl) {
  return Array.from(menuEl.querySelectorAll(':scope > .ctx-item'));
}

function setFocus(menuEl, index) {
  const items = getItems(menuEl);
  focusIndex.set(menuEl, index);
  items.forEach((el, i) => {
    el.classList.toggle('is-focused', i === index);
    if (i === index && menuIsOpen(menuEl)) el.focus();
  });
}

function menuIsOpen(menuEl) {
  return menuEl.classList.contains('is-open');
}

function moveFocus(menuEl, dir) {
  const items = getItems(menuEl);
  let index = focusIndex.get(menuEl);
  for (let step = 0; step < items.length; step += 1) {
    index = (index + dir + items.length) % items.length;
    if (!items[index].disabled) {
      setFocus(menuEl, index);
      return items[index];
    }
  }
  return null;
}

function placeMenu(menuEl, x, y) {
  menuEl.classList.add('is-open');
  const width = menuEl.offsetWidth;
  const height = menuEl.offsetHeight;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const left = Math.max(8, Math.min(x, viewW - width - 8));
  const top = Math.max(8, Math.min(y, viewH - height - 8));
  menuEl.style.left = `${left}px`;
  menuEl.style.top = `${top}px`;
}

function openRoot(x, y) {
  closeAllMenus();
  placeMenu(rootMenu, x, y);
  focusIndex.set(rootMenu, -1);
}

function openSubmenu(parentBtn) {
  const menuEl = parentBtn.parentElement;
  const expandedBtn = menuEl.querySelector(':scope > .ctx-item.is-open-parent');
  if (expandedBtn === parentBtn) return;
  if (expandedBtn) closeChildChain(menuEl);

  const submenu = document.getElementById(parentBtn.dataset.submenuId);
  parentBtn.classList.add('is-open-parent');
  parentBtn.setAttribute('aria-expanded', 'true');

  const rect = parentBtn.getBoundingClientRect();
  placeMenu(submenu, rect.right - 4, rect.top - 4);

  if (submenu.offsetLeft + submenu.offsetWidth > window.innerWidth - 8) {
    submenu.style.left = `${Math.max(8, rect.left - submenu.offsetWidth + 4)}px`;
  }
  if (submenu.offsetTop + submenu.offsetHeight > window.innerHeight - 8) {
    const top = Math.min(rect.top - 4, window.innerHeight - submenu.offsetHeight - 8);
    submenu.style.top = `${Math.max(8, top)}px`;
  }

  focusIndex.set(submenu, -1);
}

function closeChildChain(menuEl) {
  const expandedBtn = menuEl.querySelector(':scope > .ctx-item.is-open-parent');
  if (!expandedBtn) return;
  const submenu = document.getElementById(expandedBtn.dataset.submenuId);
  closeChildChain(submenu);
  submenu.classList.remove('is-open');
  expandedBtn.classList.remove('is-open-parent');
  expandedBtn.setAttribute('aria-expanded', 'false');
}

function closeAllMenus() {
  document.querySelectorAll('.ctx-menu.is-open').forEach((menuEl) => {
    closeChildChain(menuEl);
    menuEl.classList.remove('is-open');
    focusIndex.set(menuEl, -1);
    getItems(menuEl).forEach((el) => el.classList.remove('is-focused'));
  });
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

function activateItem(item, btn, menuEl) {
  if (item.disabled) return;
  if (item.children) {
    openSubmenu(btn);
    const first = moveFocus(menuEl, 0);
    if (first) {
      const submenu = document.getElementById(btn.dataset.submenuId);
      setFocus(submenu, getItems(submenu).indexOf(first));
    }
    return;
  }

  if (item.group) {
    state[item.group] = item.value;
    syncCheckedItems();
    logAction(`${menuLabel(menuEl)}：${item.label}`);
    return;
  }
  if (item.toggle) {
    state[item.toggle] = !state[item.toggle];
    syncCheckedItems();
    logAction(`${item.label}：${state[item.toggle] ? '开' : '关'}`);
    return;
  }
  if (item.action) {
    item.action(item.label);
    closeAllMenus();
  }
}

function menuLabel(menuEl) {
  const parentItemId = menuEl.dataset.parentItem;
  if (parentItemId) {
    const parentBtn = document.querySelector(`.ctx-item[data-id="${parentItemId}"]`);
    return parentBtn ? parentBtn.querySelector('.item-label').textContent : '';
  }
  return '';
}

function syncCheckedItems() {
  document.querySelectorAll('.ctx-item').forEach((btn) => {
    const item = findItemById(menuTree, btn.dataset.id);
    if (item && (item.group || item.toggle)) {
      btn.classList.toggle('is-checked', isItemChecked(item));
    }
  });
}

function findItemById(items, id) {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getDeepestOpenMenu() {
  const openMenus = Array.from(document.querySelectorAll('.ctx-menu.is-open'));
  if (!openMenus.length) return null;
  return openMenus.reduce((deepest, menuEl) =>
    Number(menuEl.dataset.level) > Number(deepest.dataset.level) ? menuEl : deepest
  );
}

document.addEventListener('keydown', (e) => {
  const menuEl = getDeepestOpenMenu();
  if (!menuEl) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      moveFocus(menuEl, 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      moveFocus(menuEl, -1);
      break;
    case 'ArrowRight': {
      e.preventDefault();
      const index = focusIndex.get(menuEl);
      const items = getItems(menuEl);
      const item = items[index];
      if (item && item.dataset.submenuId) {
        openSubmenu(item);
        const submenu = document.getElementById(item.dataset.submenuId);
        moveFocus(submenu, 1);
      }
      break;
    }
    case 'ArrowLeft': {
      e.preventDefault();
      if (Number(menuEl.dataset.level) > 0) {
        const parentBtn = document.querySelector(
          `.ctx-item[data-submenu-id="${menuEl.dataset.menuId}"]`
        );
        if (parentBtn) {
          const parentMenu = parentBtn.parentElement;
          closeChildChain(parentMenu);
          setFocus(parentMenu, itemIndex(parentMenu, parentBtn));
        }
      }
      break;
    }
    case 'Enter':
    case ' ': {
      e.preventDefault();
      const index = focusIndex.get(menuEl);
      const items = getItems(menuEl);
      const btn = items[index];
      if (btn) btn.click();
      break;
    }
    case 'Escape':
      e.preventDefault();
      closeAllMenus();
      break;
    case 'Home': {
      e.preventDefault();
      const items = getItems(menuEl);
      setFocus(menuEl, items.findIndex((el) => !el.disabled));
      break;
    }
    case 'End': {
      e.preventDefault();
      const items = getItems(menuEl);
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (!items[i].disabled) {
          setFocus(menuEl, i);
          break;
        }
      }
      break;
    }
    default:
      break;
  }
});

let pressTimer = null;
let longPressAt = 0;

workspace.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (Date.now() - longPressAt < 600) return;
  openRoot(e.clientX, e.clientY);
});

workspace.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch') return;
  const startX = e.clientX;
  const startY = e.clientY;
  pressTimer = setTimeout(() => {
    longPressAt = Date.now();
    openRoot(startX, startY);
    pressTimer = null;
  }, 480);

  const cancel = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    cleanup();
  };
  const move = (ev) => {
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 10) cancel();
  };
  const cleanup = () => {
    workspace.removeEventListener('pointermove', move);
    workspace.removeEventListener('pointerup', cancel);
    workspace.removeEventListener('pointercancel', cancel);
  };
  workspace.addEventListener('pointermove', move);
  workspace.addEventListener('pointerup', cancel);
  workspace.addEventListener('pointercancel', cancel);
});

document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.ctx-menu')) closeAllMenus();
}, true);

window.addEventListener('resize', closeAllMenus);
window.addEventListener('blur', closeAllMenus);
document.addEventListener('scroll', closeAllMenus, true);

rootMenu = buildMenu(menuTree, 0);
rootMenu.setAttribute('aria-label', '上下文菜单');
document.body.appendChild(rootMenu);

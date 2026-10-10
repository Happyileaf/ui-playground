(function () {
  'use strict';

  const USERS = [
    { id: 1, name: '林晓彤', dept: '产品部', role: '产品经理' },
    { id: 2, name: '陈志远', dept: '技术部', role: '前端工程师' },
    { id: 3, name: '王雅琴', dept: '市场部', role: '市场专员' },
    { id: 4, name: '赵子墨', dept: '技术部', role: '后端工程师' },
    { id: 5, name: '周明轩', dept: '设计部', role: 'UI 设计师' },
    { id: 6, name: '吴佳怡', dept: '人力资源部', role: 'HRBP' },
    { id: 7, name: '郑凯文', dept: '技术部', role: '测试工程师' },
    { id: 8, name: '孙若曦', dept: '产品部', role: '交互设计师' },
    { id: 9, name: '冯浩然', dept: '技术部', role: '系统架构师' },
    { id: 10, name: '许静怡', dept: '市场部', role: '品牌经理' },
    { id: 11, name: '何俊熙', dept: '技术部', role: '移动端工程师' },
    { id: 12, name: '罗欣妍', dept: '人力资源部', role: '薪酬专员' },
    { id: 13, name: '高泽宇', dept: '设计部', role: '视觉设计师' },
    { id: 14, name: '唐雨薇', dept: '人力资源部', role: '招聘专员' },
    { id: 15, name: '邓子轩', dept: '技术部', role: '运维工程师' },
    { id: 16, name: '韩梦琪', dept: '产品部', role: '数据分析师' },
    { id: 17, name: '曹睿博', dept: '技术部', role: '算法工程师' },
    { id: 18, name: '谢婉婷', dept: '市场部', role: '内容运营' },
    { id: 19, name: '彭俊杰', dept: '市场部', role: '商务专员' },
    { id: 20, name: '吕思辰', dept: '产品部', role: '项目经理' },
    { id: 21, name: '苏映雪', dept: '设计部', role: '设计主管' }
  ];

  const INITIAL_RIGHT = [1, 5, 9, 13, 17, 20, 21];

  const state = {
    side: {
      left: USERS.map((u) => u.id).filter((id) => INITIAL_RIGHT.indexOf(id) === -1),
      right: INITIAL_RIGHT.slice()
    },
    query: { left: '', right: '' },
    selected: new Set()
  };

  const els = {
    transfer: document.getElementById('transfer'),
    list: {
      left: document.getElementById('leftList'),
      right: document.getElementById('rightList')
    },
    allBox: {
      left: document.getElementById('leftAll'),
      right: document.getElementById('rightAll')
    },
    count: {
      left: document.getElementById('leftCount'),
      right: document.getElementById('rightCount')
    },
    search: {
      left: document.getElementById('leftSearch'),
      right: document.getElementById('rightSearch')
    },
    moveAllRight: document.getElementById('moveAllRight'),
    moveRight: document.getElementById('moveRight'),
    moveLeft: document.getElementById('moveLeft'),
    moveAllLeft: document.getElementById('moveAllLeft'),
    chips: document.getElementById('chips'),
    memberCount: document.getElementById('memberCount'),
    saveBtn: document.getElementById('saveBtn'),
    saveLabel: document.getElementById('saveLabel'),
    saveStatus: document.getElementById('saveStatus')
  };

  const userMap = {};
  USERS.forEach((u) => {
    userMap[u.id] = u;
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function hueFor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
  }

  function avatarStyle(name) {
    return 'background:hsl(' + hueFor(name) + ',58%,52%)';
  }

  function getFiltered(side) {
    const q = state.query[side];
    return state.side[side]
      .map((id) => userMap[id])
      .filter(function (u) {
        if (!q) return true;
        return u.name.toLowerCase().indexOf(q) !== -1 || u.dept.toLowerCase().indexOf(q) !== -1;
      });
  }

  function rowHtml(u) {
    const checked = state.selected.has(u.id);
    return (
      '<li>' +
        '<label class="checkbox-row' + (checked ? ' is-checked' : '') + '" title="' + escapeHtml(u.role) + '">' +
          '<input type="checkbox" class="row-box" data-id="' + u.id + '"' + (checked ? ' checked' : '') + ' aria-label="选择 ' + escapeHtml(u.name) + '">' +
          '<span class="avatar" style="' + avatarStyle(u.name) + '">' + escapeHtml(u.name.charAt(0)) + '</span>' +
          '<span class="user-info">' +
            '<span class="user-name">' + escapeHtml(u.name) + '</span>' +
            '<span class="user-meta">' +
              '<span class="dept-tag">' + escapeHtml(u.dept) + '</span>' +
              '<span class="user-role">' + escapeHtml(u.role) + '</span>' +
            '</span>' +
          '</span>' +
        '</label>' +
      '</li>'
    );
  }

  function renderPanel(side) {
    const users = getFiltered(side);
    const selectedCount = users.reduce(function (n, u) {
      return n + (state.selected.has(u.id) ? 1 : 0);
    }, 0);

    els.count[side].textContent = '已选 ' + selectedCount + ' / 共 ' + users.length;

    const allBox = els.allBox[side];
    allBox.disabled = users.length === 0;
    allBox.checked = users.length > 0 && selectedCount === users.length;
    allBox.indeterminate = selectedCount > 0 && selectedCount < users.length;

    els.list[side].innerHTML = users.length
      ? users.map(rowHtml).join('')
      : '<li class="empty-tip">' + (state.query[side] ? '未找到匹配的用户' : '暂无用户') + '</li>';
  }

  function renderControls() {
    const leftUsers = getFiltered('left');
    const rightUsers = getFiltered('right');

    const leftChecked = leftUsers.some((u) => state.selected.has(u.id));
    const rightChecked = rightUsers.some((u) => state.selected.has(u.id));

    els.moveAllRight.disabled = leftUsers.length === 0;
    els.moveRight.disabled = !leftChecked;
    els.moveLeft.disabled = !rightChecked;
    els.moveAllLeft.disabled = rightUsers.length === 0;
  }

  function renderResult() {
    const members = state.side.right.map((id) => userMap[id]);
    els.memberCount.textContent = members.length;

    if (members.length === 0) {
      els.chips.innerHTML = '<span class="chip-empty">暂未选择成员</span>';
      return;
    }

    els.chips.innerHTML = members.map(function (u) {
      return (
        '<span class="chip">' +
          '<span class="chip-avatar" style="' + avatarStyle(u.name) + '">' + escapeHtml(u.name.charAt(0)) + '</span>' +
          '<span class="chip-name">' + escapeHtml(u.name) + '</span>' +
          '<button type="button" class="chip-close" data-id="' + u.id + '" aria-label="移除 ' + escapeHtml(u.name) + '">&times;</button>' +
        '</span>'
      );
    }).join('');
  }

  function render() {
    const active = document.activeElement;
    const keepId = active && active.classList && active.classList.contains('row-box') ? active.getAttribute('data-id') : null;

    renderPanel('left');
    renderPanel('right');
    renderControls();
    renderResult();

    if (keepId) {
      const box = els.transfer.querySelector('.row-box[data-id="' + keepId + '"]');
      if (box) box.focus();
    }
  }

  function transferIds(ids, from, to) {
    if (ids.length === 0) return;
    const moved = new Set(ids);
    state.side[from] = state.side[from].filter((id) => !moved.has(id));
    state.side[to] = ids.concat(state.side[to]);
    ids.forEach((id) => state.selected.delete(id));
  }

  function moveSelected(from, to) {
    const ids = getFiltered(from).map((u) => u.id).filter((id) => state.selected.has(id));
    transferIds(ids, from, to);
    render();
  }

  function moveAll(from, to) {
    const ids = getFiltered(from).map((u) => u.id);
    transferIds(ids, from, to);
    render();
  }

  els.search.left.addEventListener('input', function (e) {
    state.query.left = e.target.value.trim().toLowerCase();
    render();
  });

  els.search.right.addEventListener('input', function (e) {
    state.query.right = e.target.value.trim().toLowerCase();
    render();
  });

  els.allBox.left.addEventListener('change', function () {
    const ids = getFiltered('left').map((u) => u.id);
    ids.forEach((id) => els.allBox.left.checked ? state.selected.add(id) : state.selected.delete(id));
    render();
  });

  els.allBox.right.addEventListener('change', function () {
    const ids = getFiltered('right').map((u) => u.id);
    ids.forEach((id) => els.allBox.right.checked ? state.selected.add(id) : state.selected.delete(id));
    render();
  });

  els.list.left.addEventListener('change', function (e) {
    if (!e.target.classList.contains('row-box')) return;
    const id = Number(e.target.getAttribute('data-id'));
    e.target.checked ? state.selected.add(id) : state.selected.delete(id);
    render();
  });

  els.list.right.addEventListener('change', function (e) {
    if (!e.target.classList.contains('row-box')) return;
    const id = Number(e.target.getAttribute('data-id'));
    e.target.checked ? state.selected.add(id) : state.selected.delete(id);
    render();
  });

  els.list.left.addEventListener('dblclick', function (e) {
    const row = e.target.closest('.checkbox-row');
    if (!row) return;
    transferIds([Number(row.querySelector('.row-box').getAttribute('data-id'))], 'left', 'right');
    render();
  });

  els.list.right.addEventListener('dblclick', function (e) {
    const row = e.target.closest('.checkbox-row');
    if (!row) return;
    transferIds([Number(row.querySelector('.row-box').getAttribute('data-id'))], 'right', 'left');
    render();
  });

  els.moveAllRight.addEventListener('click', function () {
    moveAll('left', 'right');
  });

  els.moveRight.addEventListener('click', function () {
    moveSelected('left', 'right');
  });

  els.moveLeft.addEventListener('click', function () {
    moveSelected('right', 'left');
  });

  els.moveAllLeft.addEventListener('click', function () {
    moveAll('right', 'left');
  });

  els.chips.addEventListener('click', function (e) {
    const btn = e.target.closest('.chip-close');
    if (!btn) return;
    transferIds([Number(btn.getAttribute('data-id'))], 'right', 'left');
    render();
  });

  els.saveBtn.addEventListener('click', function () {
    if (els.saveBtn.disabled) return;
    els.saveBtn.disabled = true;
    els.saveBtn.classList.add('is-loading');
    els.saveLabel.textContent = '保存中…';
    els.saveStatus.textContent = '';

    setTimeout(function () {
      els.saveBtn.disabled = false;
      els.saveBtn.classList.remove('is-loading');
      els.saveLabel.textContent = '保存配置';
      els.saveStatus.textContent = '配置已保存，共 ' + state.side.right.length + ' 名成员';
    }, 1200);
  });

  render();
})();

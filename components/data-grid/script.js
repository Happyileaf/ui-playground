(function () {
  const FIRST = ['陈', '李', '王', '张', '刘', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '林'];
  const GIVEN = ['子涵', '雨桐', '浩然', '欣怡', '宇航', '诗琪', '俊杰', '思远', '嘉怡', '志强', '雅静', '明轩', '若曦', '建国', '晓彤', '一凡', '梦琪', '天佑'];
  const DEPTS = ['工程', '设计', '产品', '市场', '运营', '人事'];
  const DOMAINS = ['example.com', 'company.io', 'mail.cn', 'team.dev'];
  const STATUSES = [
    { key: 'active', label: '在职' },
    { key: 'away', label: '休假' },
    { key: 'off', label: '离职' }
  ];

  let seed = 20261010;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  let uid = 1;
  const data = [];
  const usedNames = {};
  while (data.length < 42) {
    const name = FIRST[Math.floor(rand() * FIRST.length)] + GIVEN[Math.floor(rand() * GIVEN.length)];
    if (usedNames[name]) continue;
    usedNames[name] = true;
    const pinyin = 'user' + uid;
    data.push({
      uid: uid++,
      name,
      email: pinyin + '@' + DOMAINS[Math.floor(rand() * DOMAINS.length)],
      dept: DEPTS[Math.floor(rand() * DEPTS.length)],
      salary: 9000 + Math.floor(rand() * 31) * 1000,
      status: STATUSES[Math.floor(rand() * STATUSES.length)].key
    });
  }

  const searchInput = document.getElementById('searchInput');
  const deptFilter = document.getElementById('deptFilter');
  const pageSizeSel = document.getElementById('pageSize');
  const tbody = document.getElementById('tableBody');
  const paginationEl = document.getElementById('pagination');
  const selectAll = document.getElementById('selectAll');
  const bulkBar = document.getElementById('bulkBar');
  const selectedCount = document.getElementById('selectedCount');

  let sortKey = null;
  let sortDir = 1;
  let page = 1;
  let selected = new Set();

  DEPTS.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    deptFilter.appendChild(opt);
  });

  function formatSalary(v) {
    return '¥' + v.toLocaleString('zh-CN');
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const dept = deptFilter.value;
    let rows = data.filter((r) => {
      const matchDept = dept === 'all' || r.dept === dept;
      const matchQuery = !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.dept.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });

    if (sortKey) {
      rows = rows.slice().sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === 'number') return (va - vb) * sortDir;
        return String(va).localeCompare(String(vb), 'zh-CN') * sortDir;
      });
    }
    return rows;
  }

  function statusInfo(key) {
    return STATUSES.find(s => s.key === key) || STATUSES[2];
  }

  function render() {
    const rows = getFiltered();
    const pageSize = Number(pageSizeSel.value);
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    tbody.innerHTML = '';
    if (pageRows.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">没有符合条件的记录</td></tr>';
    }

    pageRows.forEach((r) => {
      const tr = document.createElement('tr');
      if (selected.has(r.uid)) tr.classList.add('selected');
      const st = statusInfo(r.status);
      tr.innerHTML = `
        <td class="col-check"><input type="checkbox" ${selected.has(r.uid) ? 'checked' : ''} data-uid="${r.uid}" aria-label="选择 ${r.name}"></td>
        <td>${r.name}</td>
        <td><span class="cell-email">${r.email}</span></td>
        <td>${r.dept}</td>
        <td class="num-cell">${formatSalary(r.salary)}</td>
        <td><span class="status-pill ${r.status === 'active' ? 'active-status' : r.status}">${st.label}</span></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = Number(cb.dataset.uid);
        if (cb.checked) selected.add(id);
        else selected.delete(id);
        render();
      });
    });

    const pageIds = pageRows.map(r => r.uid);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
    const someSelected = pageIds.some(id => selected.has(id));
    selectAll.checked = allSelected;
    selectAll.indeterminate = !allSelected && someSelected;

    renderBulk();
    renderPagination(totalPages);
  }

  function renderBulk() {
    const count = selected.size;
    bulkBar.hidden = count === 0;
    selectedCount.textContent = `已选 ${count} 项`;
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = '';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'page-btn';
    prev.textContent = '‹';
    prev.disabled = page === 1;
    prev.addEventListener('click', () => { page--; render(); });
    paginationEl.appendChild(prev);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }

    pages.forEach((p) => {
      if (p === '…') {
        const span = document.createElement('span');
        span.className = 'page-ellipsis';
        span.textContent = '…';
        paginationEl.appendChild(span);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn' + (p === page ? ' current' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => { page = p; render(); });
        paginationEl.appendChild(btn);
      }
    });

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'page-btn';
    next.textContent = '›';
    next.disabled = page === totalPages;
    next.addEventListener('click', () => { page++; render(); });
    paginationEl.appendChild(next);
  }

  document.querySelectorAll('.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (sortKey === key) {
        sortDir *= -1;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      document.querySelectorAll('.sortable').forEach(el => el.classList.remove('asc', 'desc'));
      th.classList.add(sortDir === 1 ? 'asc' : 'desc');
      render();
    });
  });

  searchInput.addEventListener('input', () => { page = 1; render(); });
  deptFilter.addEventListener('change', () => { page = 1; render(); });
  pageSizeSel.addEventListener('change', () => { page = 1; render(); });

  selectAll.addEventListener('change', () => {
    const rows = getFiltered();
    const pageSize = Number(pageSizeSel.value);
    const pageRows = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    if (selectAll.checked) {
      pageRows.forEach(r => selected.add(r.uid));
    } else {
      pageRows.forEach(r => selected.delete(r.uid));
    }
    render();
  });

  document.getElementById('bulkActive').addEventListener('click', () => {
    selected.forEach((id) => {
      const row = data.find(r => r.uid === id);
      if (row) row.status = 'active';
    });
    render();
  });

  document.getElementById('bulkDelete').addEventListener('click', () => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (selected.has(data[i].uid)) data.splice(i, 1);
    }
    selected.clear();
    render();
  });

  document.getElementById('clearSelection').addEventListener('click', () => {
    selected.clear();
    render();
  });

  render();
})();

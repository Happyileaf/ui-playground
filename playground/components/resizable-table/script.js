(function () {
  var COLUMNS = [
    { key: 'task', label: '任务', width: 220, min: 120 },
    { key: 'owner', label: '负责人', width: 120, min: 84 },
    { key: 'status', label: '状态', width: 110, min: 90 },
    { key: 'progress', label: '进度', width: 150, min: 100 },
    { key: 'due', label: '截止日期', width: 120, min: 90 },
    { key: 'priority', label: '优先级', width: 96, min: 76 }
  ];

  var DATA = [
    { task: '重构沙箱生命周期', sub: 'iframe 销毁时回收音频上下文', owner: '林夏', status: 'done', progress: 100, due: '10-08', priority: '高' },
    { task: '命令面板模糊检索', sub: '支持分组与最近使用记录', owner: '陈牧', status: 'progress', progress: 68, due: '10-12', priority: '高' },
    { task: '导出 ZIP 源码', sub: '客户端 JSZip 打包案例文件', owner: 'Alice Wang', status: 'progress', progress: 45, due: '10-15', priority: '中' },
    { task: '移动端视口模拟', sub: '桌面 / 平板 / 手机三档切换', owner: '高远', status: 'done', progress: 100, due: '10-05', priority: '中' },
    { task: '代码高亮检查器', sub: 'Prism 风格 HTML/CSS/JS 着色', owner: '王梓萱', status: 'pending', progress: 12, due: '10-20', priority: '低' },
    { task: '案例搜索过滤', sub: '标题描述标签多字段命中', owner: '周清', status: 'done', progress: 100, due: '10-03', priority: '中' },
    { task: 'Web Audio 手势解锁', sub: '首次 pointerdown 恢复上下文', owner: 'Bruce Li', status: 'progress', progress: 80, due: '10-11', priority: '高' },
    { task: '暗色主题配色系统', sub: '统一设计令牌与色阶', owner: '赵一鸣', status: 'pending', progress: 5, due: '10-25', priority: '低' },
    { task: '设备 DPR 高清适配', sub: 'Canvas 限制最大缩放比为 2', owner: 'Nora Kim', status: 'progress', progress: 55, due: '10-14', priority: '中' },
    { task: '画廊卡片交互', sub: '点击进入工作台并隔离运行', owner: '林夏', status: 'done', progress: 100, due: '10-02', priority: '中' },
    { task: '键盘快捷键体系', sub: 'Cmd+K 与 Esc 全局处理', owner: '陈牧', status: 'pending', progress: 25, due: '10-18', priority: '低' },
    { task: '离线自包含校验', sub: '零 CDN 双击 index.html 运行', owner: 'Alice Wang', status: 'progress', progress: 90, due: '10-10', priority: '高' }
  ];

  var STATUS_LABEL = { done: '已完成', progress: '进行中', pending: '待开始' };

  var colgroup = document.getElementById('colgroup');
  var headRow = document.getElementById('headRow');
  var tableBody = document.getElementById('tableBody');
  var tableScroll = document.getElementById('tableScroll');
  var rowCount = document.getElementById('rowCount');
  var tableSearch = document.getElementById('tableSearch');
  var resetColsBtn = document.getElementById('resetColsBtn');

  var widths = COLUMNS.map(function (c) { return c.width; });
  var sortState = { key: null, desc: false };
  var currentRows = DATA.slice();

  function buildColgroup() {
    colgroup.innerHTML = '';
    widths.forEach(function (w) {
      var col = document.createElement('col');
      col.style.width = w + 'px';
      colgroup.appendChild(col);
    });
  }

  function setWidth(index, value) {
    var col = COLUMNS[index];
    widths[index] = Math.max(col.min, Math.round(value));
    colgroup.children[index].style.width = widths[index] + 'px';
  }

  function buildHeader() {
    headRow.innerHTML = '';
    COLUMNS.forEach(function (column, idx) {
      var th = document.createElement('th');
      th.dataset.index = String(idx);
      th.dataset.key = column.key;

      var inner = document.createElement('span');
      inner.className = 'th-inner';
      inner.tabIndex = 0;
      inner.setAttribute('role', 'button');
      inner.setAttribute('aria-label', column.label + '，按 Enter 排序');
      inner.innerHTML = column.label + '<span class="sort-arrow" aria-hidden="true">▲</span>';

      var resizer = document.createElement('span');
      resizer.className = 'col-resizer';
      resizer.tabIndex = -1;
      resizer.setAttribute('aria-hidden', 'true');
      resizer.dataset.colIndex = String(idx);

      th.appendChild(inner);
      th.appendChild(resizer);
      headRow.appendChild(th);

      inner.addEventListener('click', function () { toggleSort(column.key); });
      inner.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSort(column.key);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setWidth(idx, widths[idx] - 8);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setWidth(idx, widths[idx] + 8);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setWidth(idx, column.width);
        }
      });

      resizer.addEventListener('pointerdown', function (e) { startResize(e, idx); });
      resizer.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        setWidth(idx, column.width);
      });
    });
  }

  function renderRows() {
    tableBody.innerHTML = '';
    currentRows.forEach(function (row) {
      var tr = document.createElement('tr');

      COLUMNS.forEach(function (column) {
        var td = document.createElement('td');
        if (column.key === 'task') {
          td.className = 'cell-task';
          td.innerHTML = row.task + '<span class="cell-sub">' + row.sub + '</span>';
        } else if (column.key === 'status') {
          td.innerHTML = '<span class="status-pill status-' + row.status + '">' + STATUS_LABEL[row.status] + '</span>';
        } else if (column.key === 'progress') {
          td.innerHTML =
            '<span class="progress-cell"><span class="mini-track">' +
            '<span class="mini-fill" style="width:' + row.progress + '%"></span></span>' +
            '<span class="progress-num">' + row.progress + '%</span></span>';
        } else {
          td.textContent = row[column.key];
        }
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
    rowCount.textContent = String(currentRows.length);
  }

  function applySort() {
    if (!sortState.key) {
      currentRows = currentRows.sort(function (a, b) {
        return DATA.indexOf(a) - DATA.indexOf(b);
      });
      return;
    }
    var key = sortState.key;
    currentRows.sort(function (a, b) {
      var va = a[key];
      var vb = b[key];
      if (typeof va === 'number') {
        return sortState.desc ? vb - va : va - vb;
      }
      var cmp = String(va).localeCompare(String(vb), 'zh-CN');
      return sortState.desc ? -cmp : cmp;
    });
  }

  function toggleSort(key) {
    if (sortState.key === key) {
      if (sortState.desc) {
        sortState = { key: null, desc: false };
      } else {
        sortState.desc = true;
      }
    } else {
      sortState = { key: key, desc: false };
    }
    headRow.querySelectorAll('th').forEach(function (th) {
      th.classList.remove('sorted', 'desc');
      if (sortState.key && th.dataset.key === sortState.key) {
        th.classList.add('sorted');
        if (sortState.desc) th.classList.add('desc');
      }
    });
    applySort();
    renderRows();
  }

  function applySearch() {
    var q = tableSearch.value.trim().toLowerCase();
    currentRows = DATA.filter(function (row) {
      if (!q) return true;
      return row.task.toLowerCase().indexOf(q) !== -1 ||
        row.sub.toLowerCase().indexOf(q) !== -1 ||
        row.owner.toLowerCase().indexOf(q) !== -1;
    });
    applySort();
    renderRows();
  }

  function startResize(e, colIndex) {
    e.preventDefault();
    e.stopPropagation();
    var resizer = e.currentTarget;
    var startX = e.clientX;
    var startWidth = widths[colIndex];

    resizer.classList.add('active');
    tableScroll.classList.add('resizing');
    resizer.setPointerCapture(e.pointerId);

    function onMove(ev) {
      var delta = ev.clientX - startX;
      setWidth(colIndex, startWidth + delta);
    }

    function onUp(ev) {
      resizer.classList.remove('active');
      tableScroll.classList.remove('resizing');
      resizer.releasePointerCapture(ev.pointerId);
      resizer.removeEventListener('pointermove', onMove);
      resizer.removeEventListener('pointerup', onUp);
      resizer.removeEventListener('pointercancel', onUp);
    }

    resizer.addEventListener('pointermove', onMove);
    resizer.addEventListener('pointerup', onUp);
    resizer.addEventListener('pointercancel', onUp);
  }

  resetColsBtn.addEventListener('click', function () {
    COLUMNS.forEach(function (c, idx) { setWidth(idx, c.width); });
  });

  tableSearch.addEventListener('input', applySearch);

  buildColgroup();
  buildHeader();
  renderRows();
})();

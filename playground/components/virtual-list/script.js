(function () {
  'use strict';

  var TOTAL = 10000;
  var ROW_H = 44;
  var BUFFER = 4;

  var MESSAGES = [
    '用户登录成功',
    '用户登出，会话已销毁',
    '缓存命中率下降到 72%',
    '缓存预热完成，共加载 4096 个键',
    '数据库连接池耗尽',
    '慢查询耗时 3842ms，已记录执行计划',
    '主从同步延迟 12.4 秒',
    '定时任务执行完成，耗时 210ms',
    '定时任务执行失败，将在 60 秒后重试',
    '磁盘使用率达到 87%',
    '内存占用超过阈值 85%',
    'CPU 负载持续偏高，触发扩容',
    '网关请求超时，上游服务无响应',
    '服务健康检查通过',
    '检测到异常登录尝试，已封禁来源 IP',
    '消息队列积压 12,000 条，消费者扩容中',
    '配置中心推送新配置，已热更新',
    'SSL 证书将在 15 天后过期',
    '节点 node-07 心跳丢失，已从集群摘除',
    '接口 /api/v1/orders 返回 500，错误码 E5021'
  ];

  var LEVEL_WEIGHTS = [
    { level: 'INFO', weight: 60 },
    { level: 'WARN', weight: 20 },
    { level: 'ERROR', weight: 10 },
    { level: 'DEBUG', weight: 10 }
  ];

  function pad(num, len) {
    var str = String(num);
    while (str.length < len) str = '0' + str;
    return str;
  }

  function formatTime(ts) {
    var d = new Date(ts);
    return (
      d.getFullYear() + '-' +
      pad(d.getMonth() + 1, 2) + '-' +
      pad(d.getDate(), 2) + ' ' +
      pad(d.getHours(), 2) + ':' +
      pad(d.getMinutes(), 2) + ':' +
      pad(d.getSeconds(), 2)
    );
  }

  function pickLevel() {
    var r = Math.random() * 100;
    var acc = 0;
    for (var i = 0; i < LEVEL_WEIGHTS.length; i++) {
      acc += LEVEL_WEIGHTS[i].weight;
      if (r < acc) return LEVEL_WEIGHTS[i].level;
    }
    return 'INFO';
  }

  function generateLogs() {
    var base = new Date();
    base.setHours(8, 0, 0, 0);
    var cursor = base.getTime();
    var list = new Array(TOTAL);
    for (var i = 0; i < TOTAL; i++) {
      cursor += 1000 + Math.floor(Math.random() * 29000);
      list[i] = {
        index: pad(i + 1, 5),
        timestamp: formatTime(cursor),
        level: pickLevel(),
        message: MESSAGES[(Math.random() * MESSAGES.length) | 0]
      };
    }
    return list;
  }

  var logs = generateLogs();

  var state = {
    level: 'ALL',
    keyword: '',
    filtered: logs,
    selectedIndex: -1,
    startIndex: -1,
    endIndex: -1,
    ticking: false
  };

  var viewport = document.getElementById('viewport');
  var phantom = document.getElementById('phantom');
  var content = document.getElementById('content');
  var empty = document.getElementById('empty');
  var searchInput = document.getElementById('searchInput');
  var jumpInput = document.getElementById('jumpInput');
  var jumpBtn = document.getElementById('jumpBtn');
  var jumpHint = document.getElementById('jumpHint');
  var statCount = document.getElementById('statCount');
  var statDom = document.getElementById('statDom');
  var detailTitle = document.getElementById('detailTitle');
  var detailJson = document.getElementById('detailJson');

  function levelClass(level) {
    return {
      INFO: 'is-info',
      WARN: 'is-warn',
      ERROR: 'is-error',
      DEBUG: 'is-debug'
    }[level] || 'is-info';
  }

  function applyFilter() {
    var kw = state.keyword.trim();
    var result = logs;
    if (state.level !== 'ALL' || kw) {
      result = [];
      for (var i = 0; i < logs.length; i++) {
        var item = logs[i];
        if (state.level !== 'ALL' && item.level !== state.level) continue;
        if (kw && item.message.indexOf(kw) === -1) continue;
        result.push(item);
      }
    }
    state.filtered = result;
    phantom.style.height = result.length * ROW_H + 'px';
  }

  function updateStats(domRows) {
    statCount.textContent = '当前过滤后 ' + state.filtered.length.toLocaleString('en-US') +
      ' 条 / 总计 10,000 条';
    statDom.textContent = '可视 DOM ' + domRows + ' 行';
  }

  function highlightJson(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/("(\\.|[^"\\])*")(\s*:)/g, '<span class="j-key">$1</span>$3')
      .replace(/:\s*("(\\.|[^"\\])*")/g, ': <span class="j-string">$1</span>')
      .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="j-number">$1</span>');
  }

  function renderRows() {
    var scrollTop = viewport.scrollTop;
    var viewH = viewport.clientHeight;
    var total = state.filtered.length;

    var start = Math.floor(scrollTop / ROW_H) - BUFFER;
    var end = Math.ceil((scrollTop + viewH) / ROW_H) + BUFFER;
    if (start < 0) start = 0;
    if (end > total) end = total;

    empty.hidden = total !== 0;

    if (start === state.startIndex && end === state.endIndex) {
      updateStats(end - start);
      return;
    }

    state.startIndex = start;
    state.endIndex = end;
    content.style.transform = 'translate3d(0,' + start * ROW_H + 'px,0)';

    var html = '';
    for (var i = start; i < end; i++) {
      var item = state.filtered[i];
      var selected = i === state.selectedIndex ? ' is-selected' : '';
      html +=
        '<div class="vl-row' + selected + '" data-index="' + i + '" role="button" tabindex="0" aria-label="第 ' +
        item.index + ' 条日志">' +
        '<span class="col-index">#' + item.index + '</span>' +
        '<span class="col-time">' + item.timestamp + '</span>' +
        '<span class="col-level"><span class="level-pill ' + levelClass(item.level) + '">' +
        item.level + '</span></span>' +
        '<span class="col-message">' + item.message + '</span>' +
        '</div>';
    }
    content.innerHTML = html;
    updateStats(end - start);
  }

  function requestRender() {
    if (state.ticking) return;
    state.ticking = true;
    window.requestAnimationFrame(function () {
      state.ticking = false;
      renderRows();
    });
  }

  function resetScrollAndRender() {
    viewport.scrollTop = 0;
    state.startIndex = -1;
    state.endIndex = -1;
    renderRows();
  }

  var filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      state.level = btn.getAttribute('data-level');
      state.selectedIndex = -1;
      applyFilter();
      resetScrollAndRender();
    });
  });

  var searchTimer = null;
  searchInput.addEventListener('input', function () {
    var value = searchInput.value;
    if (searchTimer) window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () {
      state.keyword = value;
      state.selectedIndex = -1;
      applyFilter();
      resetScrollAndRender();
    }, 200);
  });

  var hintTimer = null;
  function showHint(msg) {
    jumpHint.textContent = msg;
    jumpHint.classList.add('is-show');
    if (hintTimer) window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(function () {
      jumpHint.classList.remove('is-show');
    }, 2200);
  }

  function jumpToRow() {
    var raw = jumpInput.value.trim();
    var num = Number(raw);

    if (!raw || !Number.isInteger(num) || num < 1 || num > 10000) {
      showHint('请输入 1–10000 之间的行号');
      jumpInput.focus();
      return;
    }

    var pos = -1;
    for (var i = 0; i < state.filtered.length; i++) {
      if (Number(state.filtered[i].index) === num) {
        pos = i;
        break;
      }
    }

    if (pos === -1) {
      showHint('第 ' + num + ' 行在当前过滤条件下不存在');
      return;
    }

    viewport.scrollTop = pos * ROW_H;
    state.startIndex = -1;
    state.endIndex = -1;
    renderRows();
  }

  jumpBtn.addEventListener('click', jumpToRow);
  jumpInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') jumpToRow();
  });

  function syncSelectedClass() {
    var rows = content.children;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (Number(row.getAttribute('data-index')) === state.selectedIndex) {
        row.classList.add('is-selected');
      } else {
        row.classList.remove('is-selected');
      }
    }
  }

  function showDetail(pos) {
    var item = state.filtered[pos];
    if (!item) return;
    state.selectedIndex = pos;
    detailTitle.textContent = '完整 JSON · 原始序号 #' + item.index;
    var json = JSON.stringify(item, null, 2);
    detailJson.innerHTML = highlightJson(json);
    syncSelectedClass();
  }

  content.addEventListener('click', function (e) {
    var row = e.target.closest('.vl-row');
    if (!row) return;
    showDetail(Number(row.getAttribute('data-index')));
  });

  content.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var row = e.target.closest('.vl-row');
    if (!row) return;
    e.preventDefault();
    showDetail(Number(row.getAttribute('data-index')));
  });

  viewport.addEventListener('scroll', requestRender, { passive: true });

  if (typeof ResizeObserver === 'function') {
    var resizeObserver = new ResizeObserver(function () {
      state.startIndex = -1;
      state.endIndex = -1;
      renderRows();
    });
    resizeObserver.observe(viewport);
  } else {
    window.addEventListener('resize', function () {
      state.startIndex = -1;
      state.endIndex = -1;
      renderRows();
    });
  }

  applyFilter();
  renderRows();
})();

const TOTAL_ITEMS = 128;
const names = [
  '晨曦项目档案', '海蓝设计稿', '林间数据报告', '星河迭代记录', '云端配置备份',
  '青野用户调研', '潮汐周报汇总', '流光产品原型', '远山资源清单', '琥珀会议纪要',
  '风铃接口文档', '墨石测试用例', '白鹭发布日志', '苔藓运维手册', '潮汐需求池'
];

const dataList = document.getElementById('dataList');
const pageNumbers = document.getElementById('pageNumbers');
const rangeStart = document.getElementById('rangeStart');
const rangeEnd = document.getElementById('rangeEnd');
const totalItemsEl = document.getElementById('totalItems');
const pageSizeSelect = document.getElementById('pageSize');
const jumpInput = document.getElementById('jumpInput');

totalItemsEl.textContent = TOTAL_ITEMS;

let currentPage = 1;
let pageSize = Number(pageSizeSelect.value);

function totalPages() {
  return Math.max(1, Math.ceil(TOTAL_ITEMS / pageSize));
}

function renderList() {
  const pages = totalPages();
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, TOTAL_ITEMS);
  rangeStart.textContent = start + 1;
  rangeEnd.textContent = end;

  dataList.innerHTML = '';
  for (let i = start; i < end; i++) {
    const li = document.createElement('li');
    li.className = 'data-item';
    li.style.animationDelay = `${(i - start) * 30}ms`;
    li.innerHTML = `
      <span class="item-index">${i + 1}</span>
      <span class="item-name">${names[i % names.length]} #${String(i + 1).padStart(3, '0')}</span>
      <span class="item-meta">更新于 ${(i % 28) + 1} 小时前</span>
    `;
    dataList.appendChild(li);
  }
}

function buildRange() {
  const pages = totalPages();
  const items = [];

  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) items.push(i);
    return items;
  }

  items.push(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(pages - 1, currentPage + 1);

  if (left > 2) items.push('...');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < pages - 1) items.push('...');

  items.push(pages);
  return items;
}

function renderPagination() {
  const pages = totalPages();
  pageNumbers.innerHTML = '';

  buildRange().forEach((item) => {
    if (item === '...') {
      const span = document.createElement('span');
      span.className = 'page-ellipsis';
      span.textContent = '···';
      pageNumbers.appendChild(span);
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `page-btn${item === currentPage ? ' is-active' : ''}`;
    btn.textContent = item;
    btn.setAttribute('aria-label', `第 ${item} 页`);
    if (item === currentPage) btn.setAttribute('aria-current', 'page');
    btn.addEventListener('click', () => goToPage(item));
    pageNumbers.appendChild(btn);
  });

  document.getElementById('firstBtn').disabled = currentPage === 1;
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === pages;
  document.getElementById('lastBtn').disabled = currentPage === pages;
  jumpInput.max = pages;
}

function goToPage(page) {
  const pages = totalPages();
  currentPage = Math.min(pages, Math.max(1, page));
  renderList();
  renderPagination();
}

document.getElementById('firstBtn').addEventListener('click', () => goToPage(1));
document.getElementById('lastBtn').addEventListener('click', () => goToPage(totalPages()));
document.getElementById('prevBtn').addEventListener('click', () => goToPage(currentPage - 1));
document.getElementById('nextBtn').addEventListener('click', () => goToPage(currentPage + 1));

document.getElementById('jumpBtn').addEventListener('click', () => {
  const value = Number(jumpInput.value);
  if (value) goToPage(value);
});
jumpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goToPage(Number(jumpInput.value));
});

pageSizeSelect.addEventListener('change', () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  renderList();
  renderPagination();
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
  else if (e.key === 'ArrowRight') goToPage(currentPage + 1);
  else if (e.key === 'Home') goToPage(1);
  else if (e.key === 'End') goToPage(totalPages());
});

renderList();
renderPagination();

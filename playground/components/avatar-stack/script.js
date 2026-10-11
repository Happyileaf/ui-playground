(function () {
  'use strict';

  const stack = document.getElementById('avatarStack');
  const summary = document.getElementById('summary');
  const addBtn = document.getElementById('addBtn');
  const profileDetail = document.getElementById('profileDetail');
  const pdAvatar = document.getElementById('pdAvatar');
  const pdName = document.getElementById('pdName');
  const pdRole = document.getElementById('pdRole');
  const pdBio = document.getElementById('pdBio');
  const pdClose = document.getElementById('pdClose');

  const cardPop = document.getElementById('cardPop');
  const cpAvatar = document.getElementById('cpAvatar');
  const cpName = document.getElementById('cpName');
  const cpRole = document.getElementById('cpRole');
  const cpStatus = document.getElementById('cpStatus');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const members = [
    { initial: '阿', name: '陈屿安', role: '产品设计负责人', bio: '主导 Aurora 视觉体系与设计系统，痴迷光影与细节。', status: '正在编辑「色彩规范 v3」', bg: 'linear-gradient(135deg,#f472b6,#8b5cf6)' },
    { initial: 'L', name: 'Luna Wei', role: '前端工程师', bio: '专注动效工程化与可访问性，相信动效应服务于体验。', status: '2 分钟前在线', bg: 'linear-gradient(135deg,#38bdf8,#6366f1)' },
    { initial: '野', name: '野村健', role: '交互设计师', bio: '负责微交互与手势原型，喜欢用纸笔记录灵感。', status: '正在评审「导航动效」', bg: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
    { initial: 'M', name: 'Mira Chen', role: '视觉设计师', bio: '擅长品牌与插画，为产品注入情绪与温度。', status: '忙碌中', bg: 'linear-gradient(135deg,#fbbf24,#fb7185)' },
    { initial: 'K', name: 'Kai Mori', role: '动效工程师', bio: '研究弹簧物理与实时渲染，追求 60fps 的丝滑。', status: '今天 09:12 在线', bg: 'linear-gradient(135deg,#a78bfa,#ec4899)' },
    { initial: '苏', name: '苏映雪', role: '用户研究员', bio: '用访谈与数据连接产品与真实用户。', status: '离线', bg: 'linear-gradient(135deg,#64748b,#334155)' }
  ];

  let activeId = null;
  let hoveredId = null;

  function initials(m) {
    return m.initial;
  }

  function buildStack() {
    stack.innerHTML = '';
    members.forEach(function (m, index) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar' + (activeId === index ? ' is-active' : '');
      btn.dataset.index = index;
      btn.setAttribute('aria-label', m.name + '，' + m.role);
      btn.setAttribute('aria-haspopup', 'dialog');

      const face = document.createElement('span');
      face.className = 'av-face';
      face.style.setProperty('--av-bg', m.bg);
      face.textContent = initials(m);
      btn.appendChild(face);

      btn.addEventListener('mouseenter', function () { showPop(index, btn); });
      btn.addEventListener('focus', function () { showPop(index, btn); });
      btn.addEventListener('mouseleave', hidePop);
      btn.addEventListener('blur', hidePop);
      btn.addEventListener('click', function () { toggleDetail(index); });

      stack.appendChild(btn);
    });
  }

  function positionPop(anchor) {
    const popW = 224;
    const popH = 104;
    const gap = 12;
    const rect = anchor.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - popW / 2;
    let top = rect.top - popH - gap;

    left = Math.max(12, Math.min(window.innerWidth - popW - 12, left));
    if (top < 12) {
      top = rect.bottom + gap;
    }
    cardPop.style.left = left + 'px';
    cardPop.style.top = top + 'px';
  }

  function showPop(index, anchor) {
    if (reduceMotion) {
      // still display for discoverability
    }
    hoveredId = index;
    const m = members[index];
    cpAvatar.textContent = initials(m);
    cpAvatar.style.setProperty('--cp-bg', m.bg);
    cpName.textContent = m.name;
    cpRole.textContent = m.role;
    cpStatus.textContent = m.status;
    cardPop.hidden = false;
    positionPop(anchor);
    cardPop.classList.remove('show');
    void cardPop.offsetWidth;
    cardPop.classList.add('show');
  }

  function hidePop() {
    hoveredId = null;
    cardPop.hidden = true;
    cardPop.classList.remove('show');
  }

  function toggleDetail(index) {
    if (activeId === index) {
      closeDetail();
      return;
    }
    activeId = index;
    const m = members[index];
    pdAvatar.textContent = initials(m);
    pdAvatar.style.setProperty('--pd-bg', m.bg);
    pdName.textContent = m.name;
    pdRole.textContent = m.role;
    pdBio.textContent = m.bio;
    profileDetail.hidden = false;
    buildStack();
  }

  function closeDetail() {
    activeId = null;
    profileDetail.hidden = true;
    buildStack();
  }

  pdClose.addEventListener('click', closeDetail);

  addBtn.addEventListener('click', function () {
    summary.textContent = '邀请链接已复制，等待新成员加入';
  });

  window.addEventListener('resize', function () {
    if (hoveredId !== null) {
      const anchor = stack.querySelectorAll('.avatar')[hoveredId];
      if (anchor) positionPop(anchor);
    }
  });

  buildStack();
})();

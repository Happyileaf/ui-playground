(function () {
  const overlay = document.getElementById('overlay');
  const spotlight = document.getElementById('spotlight');
  const tourPop = document.getElementById('tourPop');
  const stepPill = document.getElementById('stepPill');
  const titleEl = document.getElementById('tourTitle');
  const descEl = document.getElementById('tourDesc');
  const closeBtn = document.getElementById('tourClose');
  const skipBtn = document.getElementById('tourSkip');
  const prevBtn = document.getElementById('tourPrev');
  const nextBtn = document.getElementById('tourNext');
  const restartBtn = document.getElementById('restartBtn');

  const PADDING = 10;
  const POP_GAP = 16;
  const POP_W = 330;

  const STEPS = [
    {
      target: document.getElementById('demoSidebar'),
      title: '侧边导航',
      desc: '这里是应用的主导航，点击图标在不同模块间切换，当前所在模块会以高亮圆点标出。',
    },
    {
      target: document.getElementById('demoSearch'),
      title: '全局搜索',
      desc: '任意页面都能从这里唤起搜索，输入关键词即可快速跳转到功能、页面或数据记录。',
    },
    {
      target: document.getElementById('demoStat'),
      title: '核心指标卡',
      desc: '指标卡展示关键业务数据与环比变化，绿色表示上升、红色表示下降，一眼看清趋势。',
    },
    {
      target: document.getElementById('demoChart'),
      title: '趋势图表',
      desc: '图表汇总近 7 天的访问情况，把鼠标悬停在柱子上可以查看每一天的具体数值。',
    },
  ];

  let index = 0;
  let isRunning = false;
  let lastFocused = null;

  function place() {
    const step = STEPS[index];
    const rect = step.target.getBoundingClientRect();

    spotlight.style.top = `${rect.top - PADDING}px`;
    spotlight.style.left = `${rect.left - PADDING}px`;
    spotlight.style.width = `${rect.width + PADDING * 2}px`;
    spotlight.style.height = `${rect.height + PADDING * 2}px`;

    const popW = Math.min(POP_W, window.innerWidth - 24);
    const popH = tourPop.offsetHeight || 220;

    let top = rect.bottom + PADDING + POP_GAP;
    if (top + popH > window.innerHeight - 12) {
      top = rect.top - PADDING - POP_GAP - popH;
    }
    if (top < 12) top = 12;

    let left = rect.left;
    if (left + popW > window.innerWidth - 12) {
      left = window.innerWidth - popW - 12;
    }
    if (left < 12) left = 12;

    tourPop.style.width = `${popW}px`;
    tourPop.style.top = `${top}px`;
    tourPop.style.left = `${left}px`;

    titleEl.textContent = step.title;
    descEl.textContent = step.desc;
    stepPill.textContent = `${index + 1} / ${STEPS.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === STEPS.length - 1 ? '完成' : '下一步';
  }

  function highlightTarget(on) {
    STEPS.forEach((s) => s.target.classList.remove('is-highlighted'));
    if (on) STEPS[index].target.classList.add('is-highlighted');
  }

  function start() {
    index = 0;
    isRunning = true;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    highlightTarget(true);
    place();
    nextBtn.focus();
  }

  function finish() {
    isRunning = false;
    overlay.hidden = true;
    highlightTarget(false);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    } else {
      restartBtn.focus();
    }
  }

  function go(next) {
    index = Math.min(Math.max(next, 0), STEPS.length - 1);
    highlightTarget(true);
    place();
    nextBtn.focus();
  }

  nextBtn.addEventListener('click', () => {
    if (index === STEPS.length - 1) {
      finish();
    } else {
      go(index + 1);
    }
  });

  prevBtn.addEventListener('click', () => go(index - 1));
  closeBtn.addEventListener('click', finish);
  skipBtn.addEventListener('click', finish);
  restartBtn.addEventListener('click', start);

  document.addEventListener('keydown', (e) => {
    if (!isRunning) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      finish();
    } else if (e.key === 'ArrowRight' && index < STEPS.length - 1) {
      go(index + 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      go(index - 1);
    }
  });

  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (!isRunning || resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = null;
      place();
    });
  });

  window.requestAnimationFrame(start);
})();

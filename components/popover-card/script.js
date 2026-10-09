(function () {
  const MARGIN = 12;
  const GAP = 10;
  const triggers = Array.from(document.querySelectorAll('.trigger-btn'));
  const popover = document.getElementById('popover');
  const closeBtn = document.getElementById('popClose');
  const primaryBtn = document.getElementById('popPrimary');
  const avatar = document.getElementById('popAvatar');
  const title = document.getElementById('popTitle');
  const sub = document.getElementById('popSub');
  const body = document.getElementById('popBody');

  const CONTENT = {
    top: {
      avatar: '通',
      title: '通知中心',
      sub: '3 条未读消息',
      body: '你关注的 Aurora Lab 刚刚发布了新作「极光渐变」，点开卡片即可前往查看。',
      primary: '查看',
    },
    bottom: {
      avatar: '分',
      title: '分享面板',
      sub: '选择分享方式',
      body: '把当前作品分享给队友，复制出的链接附带 7 天有效的预览权限，到期自动失效。',
      primary: '复制链接',
    },
    left: {
      avatar: '详',
      title: '详情卡片',
      sub: '作品信息',
      body: '原生 HTML / CSS / JS 单页案例，无构建步骤、零外部依赖，离线双击即可完整运行。',
      primary: '收藏',
    },
    right: {
      avatar: 'A',
      title: 'Aurora Lab',
      sub: '在线 · 刚刚活跃',
      body: '气泡卡片可承载头像、说明文本与操作按钮，适合在不离开当前上下文时展示富信息。',
      primary: '关注',
    },
  };

  let activeTrigger = null;
  let rafId = null;

  function applyContent(placement) {
    const data = CONTENT[placement] || CONTENT.right;
    avatar.textContent = data.avatar;
    title.textContent = data.title;
    sub.textContent = data.sub;
    body.textContent = data.body;
    primaryBtn.textContent = data.primary;
  }

  function resolveSide(placement, rect, size) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (placement === 'top' || placement === 'bottom') {
      const spaceTop = rect.top - GAP;
      const spaceBottom = vh - rect.bottom - GAP;
      if (placement === 'top' && spaceTop < size.h && spaceBottom > spaceTop) return 'bottom';
      if (placement === 'bottom' && spaceBottom < size.h && spaceTop > spaceBottom) return 'top';
      return placement;
    }
    const spaceLeft = rect.left - GAP;
    const spaceRight = vw - rect.right - GAP;
    if (placement === 'left' && spaceLeft < size.w && spaceRight > spaceLeft) return 'right';
    if (placement === 'right' && spaceRight < size.w && spaceLeft > spaceRight) return 'left';
    return placement;
  }

  function position(trigger) {
    const placement = trigger.dataset.placement;
    const rect = trigger.getBoundingClientRect();
    const size = { w: popover.offsetWidth, h: popover.offsetHeight };
    const side = resolveSide(placement, rect, size);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x;
    let y;
    if (side === 'top' || side === 'bottom') {
      x = Math.min(Math.max(rect.left + rect.width / 2 - size.w / 2, MARGIN), vw - size.w - MARGIN);
      y = side === 'top' ? rect.top - size.h - GAP : rect.bottom + GAP;
      const arrowX = Math.min(Math.max(rect.left + rect.width / 2 - x, 22), size.w - 22);
      popover.style.setProperty('--arrow-x', `${arrowX}px`);
      popover.style.setProperty('--arrow-y', '');
      popover.style.setProperty('--origin-x', `${arrowX}px`);
      popover.style.setProperty('--origin-y', side === 'top' ? '100%' : '0%');
    } else {
      x = side === 'left' ? rect.left - size.w - GAP : rect.right + GAP;
      y = Math.min(Math.max(rect.top + rect.height / 2 - size.h / 2, MARGIN), vh - size.h - MARGIN);
      const arrowY = Math.min(Math.max(rect.top + rect.height / 2 - y, 22), size.h - 22);
      popover.style.setProperty('--arrow-x', '');
      popover.style.setProperty('--arrow-y', `${arrowY}px`);
      popover.style.setProperty('--origin-x', side === 'left' ? '100%' : '0%');
      popover.style.setProperty('--origin-y', `${arrowY}px`);
    }

    x = Math.min(Math.max(x, MARGIN), vw - size.w - MARGIN);
    y = Math.min(Math.max(y, MARGIN), vh - size.h - MARGIN);

    popover.dataset.side = side;
    popover.style.left = `${x}px`;
    popover.style.top = `${y}px`;
  }

  function scheduleReposition() {
    if (!activeTrigger || rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      if (activeTrigger) position(activeTrigger);
    });
  }

  function open(trigger) {
    applyContent(trigger.dataset.placement);
    popover.hidden = false;
    activeTrigger = trigger;
    triggers.forEach((btn) => btn.classList.toggle('is-active', btn === trigger));
    position(trigger);
    popover.classList.remove('is-open');
    void popover.offsetWidth;
    popover.classList.add('is-open');
    closeBtn.focus();
  }

  function close(restoreFocus) {
    if (!activeTrigger) return;
    const trigger = activeTrigger;
    popover.classList.remove('is-open');
    popover.hidden = true;
    activeTrigger = null;
    triggers.forEach((btn) => btn.classList.remove('is-active'));
    if (restoreFocus !== false) trigger.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeTrigger === trigger) {
        close();
        return;
      }
      if (activeTrigger) close(false);
      open(trigger);
    });
  });

  closeBtn.addEventListener('click', () => close());

  primaryBtn.addEventListener('click', () => close());

  document.addEventListener('pointerdown', (e) => {
    if (!activeTrigger) return;
    if (popover.contains(e.target) || activeTrigger.contains(e.target)) return;
    close(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeTrigger) close();
  });

  window.addEventListener('resize', scheduleReposition);
  window.addEventListener('scroll', scheduleReposition, true);
})();

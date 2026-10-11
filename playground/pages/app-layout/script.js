// APP LAYOUT SHELL ENGINE
// 纯粹的通用布局骨架交互逻辑：侧边栏折叠、移动端抽屉、顶部栏路由响应、Cmd+K 检索与布局模式切换

(function () {
  'use strict';

  // =========================================================================
  // 1. Web Audio 原生交互音效反馈
  // =========================================================================
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.05, gainVal = 0.03) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio not permitted
    }
  }

  // =========================================================================
  // 2. 侧边栏折叠与响应式抽屉
  // =========================================================================
  const appLayout = document.getElementById('appLayout');
  const appSidebar = document.getElementById('appSidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const mobileDrawerBtn = document.getElementById('mobileDrawerBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // 桌面端：展开 vs 紧凑导轨 (Rail)
  function toggleSidebar() {
    if (!appLayout) return;
    const isCollapsed = appLayout.classList.toggle('sidebar-collapsed');
    playTone(isCollapsed ? 440 : 560, 'sine', 0.06);
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
  }

  // 快捷键 '[' 切换侧边栏
  window.addEventListener('keydown', (e) => {
    if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleSidebar();
    }
    if (e.key === 'Escape') {
      closeMobileDrawer();
    }
  });

  // 移动端：滑出抽屉
  function openMobileDrawer() {
    if (appSidebar) appSidebar.classList.add('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
    playTone(520, 'sine', 0.06);
  }

  function closeMobileDrawer() {
    if (appSidebar) appSidebar.classList.remove('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
    playTone(380, 'sine', 0.05);
  }

  if (mobileDrawerBtn) mobileDrawerBtn.addEventListener('click', openMobileDrawer);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileDrawer);

  // =========================================================================
  // 3. 导航项切换联动（更新顶部栏面包屑与页面标题）
  // =========================================================================
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const crumbTitle = document.getElementById('crumbTitle');
  const pageTitle = document.getElementById('pageTitle');

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const title = btn.getAttribute('data-title') || btn.querySelector('.nav-label')?.textContent || '';
      const crumb = btn.getAttribute('data-crumb') || title;

      if (crumbTitle) crumbTitle.textContent = crumb;
      if (pageTitle) pageTitle.textContent = title;

      playTone(480, 'triangle', 0.04);

      // 如果在移动端，点击导航后自动关闭抽屉
      if (window.innerWidth <= 768) {
        closeMobileDrawer();
      }
    });
  });

  // =========================================================================
  // 4. 顶部栏交互（搜索框快捷键 Cmd+K、通知提示、CTA 按钮）
  // =========================================================================
  const globalSearchInput = document.getElementById('globalSearchInput');

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (globalSearchInput) {
        globalSearchInput.focus();
        globalSearchInput.select();
        playTone(600, 'sine', 0.06);
      }
    }
  });

  const bellBtn = document.getElementById('bellBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      playTone(540, 'triangle', 0.06);
      const badge = bellBtn.querySelector('.notice-badge');
      if (badge) badge.style.display = 'none';
      alert('已触发通知中心面板 (Layout Header 交互模拟)');
    });
  }

  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      playTone(500, 'sine', 0.06);
      alert('已打开通用帮助中心 (Layout Header 交互模拟)');
    });
  }

  const primaryCtaBtn = document.getElementById('primaryCtaBtn');
  if (primaryCtaBtn) {
    primaryCtaBtn.addEventListener('click', () => {
      playTone(640, 'triangle', 0.08);
      alert('点击了顶部主操作按钮：+ 新建项目');
    });
  }

  // =========================================================================
  // 5. HUD 音效开关
  // =========================================================================
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      const onIcon = audioToggleBtn.querySelector('.icon-audio-on');
      const offIcon = audioToggleBtn.querySelector('.icon-audio-off');
      if (audioEnabled) {
        if (onIcon) onIcon.style.display = 'block';
        if (offIcon) offIcon.style.display = 'none';
        playTone(600, 'sine', 0.08);
      } else {
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = 'block';
      }
    });
  }
})();

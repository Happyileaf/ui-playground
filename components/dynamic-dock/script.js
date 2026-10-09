/**
 * Dynamic Magnification Dock · 动态鱼眼浮动坞台
 * 100% Native ES6+ JavaScript · Zero External Libraries
 */

(function () {
  'use strict';

  // --- Configuration & Physics State ---
  const DEFAULT_CONFIG = {
    baseSize: 54,
    maxScale: 1.85,
    spread: 160,
    position: 'bottom', // 'bottom' | 'island' | 'left'
    theme: 'obsidian',
    soundEnabled: true
  };

  const state = { ...DEFAULT_CONFIG };

  // DOM Elements
  const dockContainer = document.getElementById('dockContainer');
  const dockNav = document.getElementById('dockNav');
  const dockItems = Array.from(document.querySelectorAll('.dock-item'));
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const btnResetParams = document.getElementById('btnResetParams');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const activeAppCard = document.getElementById('activeAppCard');
  const btnCloseApp = document.getElementById('btnCloseApp');
  const appCardTitle = document.getElementById('appCardTitle');
  const appCardBody = document.getElementById('appCardBody');
  const stageKicker = document.getElementById('stageKicker');

  // HUD Sliders & Chips
  const rangeMaxScale = document.getElementById('rangeMaxScale');
  const valMaxScale = document.getElementById('valMaxScale');
  const rangeSpread = document.getElementById('rangeSpread');
  const valSpread = document.getElementById('valSpread');
  const rangeBaseSize = document.getElementById('rangeBaseSize');
  const valBaseSize = document.getElementById('valBaseSize');
  const posChips = document.querySelectorAll('.dock-quick-actions [data-pos]');
  const themeChips = document.querySelectorAll('.palette-grid [data-theme]');

  // Animation & Physics Variables
  let isPointerOverDock = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastHoveredItemIndex = -1;
  let lastSoundTickTime = 0;

  // Store per-item current & target scales for Lerp
  const itemScales = dockItems.map(() => ({ current: 1, target: 1 }));

  // --- Web Audio Synthesizer (Haptic Feedback) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && typeof window.AudioContext !== 'undefined') {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playHoverTick(scaleRatio) {
    if (!state.soundEnabled || !audioCtx) return;
    const now = Date.now();
    if (now - lastSoundTickTime < 45) return; // Debounce rapid ticks
    lastSoundTickTime = now;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Frequency rises slightly with scale (440Hz -> 620Hz)
      const freq = 440 + Math.min(Math.max(scaleRatio - 1, 0), 1) * 180;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch {
      // Audio fallback silent
    }
  }

  function playBouncePop() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch {
      // Audio fallback silent
    }
  }

  // --- Fisheye Gaussian Magnification Engine ---
  function updateTargetScales() {
    const isVertical = state.position === 'left';

    if (!isPointerOverDock) {
      for (let i = 0; i < itemScales.length; i++) {
        itemScales[i].target = 1;
      }
      return;
    }

    const sigma = state.spread / 2.4;
    const twoSigmaSq = 2 * sigma * sigma;
    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < dockItems.length; i++) {
      const item = dockItems[i];
      const rect = item.getBoundingClientRect();

      let dist = 0;
      if (isVertical) {
        const itemCenterY = rect.top + rect.height / 2;
        dist = Math.abs(pointerY - itemCenterY);
      } else {
        const itemCenterX = rect.left + rect.width / 2;
        dist = Math.abs(pointerX - itemCenterX);
      }

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }

      // Continuous Gaussian Function: s = 1 + (maxScale - 1) * exp(-d^2 / (2 * sigma^2))
      const factor = Math.exp(-(dist * dist) / twoSigmaSq);
      const targetScale = 1 + (state.maxScale - 1) * factor;
      itemScales[i].target = targetScale;
    }

    // Trigger subtle haptic sound when crossing into a new icon center
    if (closestIndex !== -1 && closestIndex !== lastHoveredItemIndex && minDistance < state.baseSize) {
      lastHoveredItemIndex = closestIndex;
      playHoverTick(itemScales[closestIndex].target);
    }
  }

  // Physics animation loop using smooth Lerp
  function renderFrame() {
    const isVertical = state.position === 'left';
    let needsUpdate = false;

    for (let i = 0; i < dockItems.length; i++) {
      const item = dockItems[i];
      const scaleObj = itemScales[i];

      // Spring-like lerp factor
      const diff = scaleObj.target - scaleObj.current;
      if (Math.abs(diff) > 0.001) {
        scaleObj.current += diff * 0.24;
        needsUpdate = true;
      } else {
        scaleObj.current = scaleObj.target;
      }

      const s = scaleObj.current;
      const iconWrapper = item.querySelector('.dock-icon-wrapper');

      if (iconWrapper && !item.classList.contains('is-bouncing')) {
        if (isVertical) {
          iconWrapper.style.transform = `scale(${s})`;
          item.style.margin = `${(s - 1) * 8}px 0`;
        } else {
          iconWrapper.style.transform = `scale(${s})`;
          item.style.margin = `0 ${(s - 1) * 8}px`;
        }
      }
    }

    requestAnimationFrame(renderFrame);
  }

  // --- Pointer & Touch Event Handlers ---
  function onPointerMove(e) {
    initAudio();
    isPointerOverDock = true;
    pointerX = e.clientX;
    pointerY = e.clientY;
    updateTargetScales();
  }

  function onPointerLeave() {
    isPointerOverDock = false;
    lastHoveredItemIndex = -1;
    updateTargetScales();
  }

  dockNav.addEventListener('pointerenter', onPointerMove, { passive: true });
  dockNav.addEventListener('pointermove', onPointerMove, { passive: true });
  dockNav.addEventListener('pointerleave', onPointerLeave, { passive: true });
  dockNav.addEventListener('pointercancel', onPointerLeave, { passive: true });

  // Prevent page scroll when touching dock
  dockNav.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  // --- App Launcher & Interactive Mock Card ---
  const APP_CONTENTS = {
    terminal: {
      title: '终端 · Terminal (~/workspace/playground)',
      html: `
        <div class="terminal-window">
          <div class="term-line"><span class="term-green">sys@darwin-arm64</span>:<span class="term-blue">~</span>$ uname -a</div>
          <div class="term-line term-dim">Darwin Kernel Version 24.2.0: Root:xnu-11215/RELEASE_ARM64</div>
          <div class="term-line"><span class="term-green">sys@darwin-arm64</span>:<span class="term-blue">~</span>$ node --version</div>
          <div class="term-line term-dim">v22.12.0 (Zero Frameworks, Native First)</div>
          <div class="term-line"><span class="term-green">sys@darwin-arm64</span>:<span class="term-blue">~</span>$ status</div>
          <div class="term-line" style="color: #38bdf8;">✔ Fisheye Engine: 60 FPS Gaussian Active</div>
          <div class="term-line" style="color: #38bdf8;">✔ Web Audio Synthesis: Ready</div>
        </div>
      `
    },
    music: {
      title: '流媒体音频 · Obsidian Resonance',
      html: `
        <div class="player-wrap">
          <div class="player-track-info">
            <div class="player-thumb">♫</div>
            <div class="player-meta">
              <h4>Neon Waves & Horizon</h4>
              <p>Haptic Ambient Soundscape · 24-bit FLAC</p>
            </div>
          </div>
          <div class="player-progress-bar">
            <div class="player-progress-fill"></div>
          </div>
          <div class="player-controls">
            <button type="button" class="btn-playback" aria-label="上一曲">⏮</button>
            <button type="button" class="btn-playback" aria-label="播放" style="background: #38bdf8; color: #020617; font-size: 16px;">▶</button>
            <button type="button" class="btn-playback" aria-label="下一曲">⏭</button>
          </div>
        </div>
      `
    },
    files: {
      title: '访达资源库 · Files & Documents',
      html: `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,0.04); border-radius: 6px;">
            <span>📄 index.html</span>
            <span style="color: #64748b;">4.8 KB</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,0.04); border-radius: 6px;">
            <span>🎨 style.css</span>
            <span style="color: #64748b;">8.2 KB</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,0.04); border-radius: 6px;">
            <span>⚡ script.js</span>
            <span style="color: #64748b;">7.1 KB</span>
          </div>
        </div>
      `
    },
    browser: {
      title: '浏览器 · Web Browser',
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
            <span>🔍</span>
            <span style="color: #f8fafc;">https://ui-playground.local/components/dynamic-dock</span>
          </div>
          <p style="font-size: 12px; line-height: 1.6; color: #cbd5e1;">原生 Web 标准技术栈，无须任何 Webpack/Vite 运行时打包或前端框架胶水代码即可独立执行。</p>
        </div>
      `
    },
    launchpad: {
      title: '启动台中心 · Launchpad Services',
      html: `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; font-size: 11px;">
          <div style="padding: 10px 4px; background: rgba(255,255,255,0.04); border-radius: 8px;">⚡ 性能</div>
          <div style="padding: 10px 4px; background: rgba(255,255,255,0.04); border-radius: 8px;">🎮 画布</div>
          <div style="padding: 10px 4px; background: rgba(255,255,255,0.04); border-radius: 8px;">🌐 网络</div>
          <div style="padding: 10px 4px; background: rgba(255,255,255,0.04); border-radius: 8px;">📦 归档</div>
        </div>
      `
    },
    photos: {
      title: '照片图库 · Canvas Gallery',
      html: `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <div style="height: 64px; border-radius: 6px; background: linear-gradient(135deg, #38bdf8, #6366f1);"></div>
          <div style="height: 64px; border-radius: 6px; background: linear-gradient(135deg, #f59e0b, #ec4899);"></div>
          <div style="height: 64px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #06b6d4);"></div>
        </div>
      `
    },
    settings: {
      title: '系统设置 · Settings',
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>触感音效合成</span>
            <span style="color: #38bdf8; font-weight: 600;">已激活</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>高斯鱼眼插值算法</span>
            <span style="color: #22c55e; font-weight: 600;">自适应 60fps</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>高分屏 DPI 缩放</span>
            <span style="color: #94a3b8;">自动检测 (1x / 2x)</span>
          </div>
        </div>
      `
    },
    trash: {
      title: '废纸篓 · Trash',
      html: `
        <div style="text-align: center; padding: 12px 0;">
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">废纸篓内没有未决文件。</p>
          <span style="font-size: 11px; color: #64748b;">双击或拖拽可在此归档缓存。</span>
        </div>
      `
    }
  };

  function openAppWindow(appKey) {
    const appInfo = APP_CONTENTS[appKey] || {
      title: `应用程序 · ${appKey}`,
      html: `<p>应用已启动。</p>`
    };

    appCardTitle.textContent = appInfo.title;
    appCardBody.innerHTML = appInfo.html;
    activeAppCard.classList.remove('hidden');

    // Softly fade background kicker text to keep focus
    if (stageKicker) {
      stageKicker.style.opacity = '0.2';
    }
  }

  function closeAppWindow() {
    activeAppCard.classList.add('hidden');
    if (stageKicker) {
      stageKicker.style.opacity = '1';
    }
  }

  btnCloseApp.addEventListener('click', closeAppWindow);

  // Click on dock item: trigger bounce + open app
  dockItems.forEach((item) => {
    item.addEventListener('click', () => {
      initAudio();
      playBouncePop();

      // Bounce jump animation
      item.classList.remove('is-bouncing');
      void item.offsetWidth; // Trigger reflow for re-animation
      item.classList.add('is-bouncing');

      // Update active indicator
      dockItems.forEach((d) => d.classList.remove('is-active'));
      item.classList.add('is-active');

      const appKey = item.getAttribute('data-app');
      openAppWindow(appKey);

      setTimeout(() => {
        item.classList.remove('is-bouncing');
      }, 750);
    });

    // Keyboard navigation (Enter / Space)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // --- HUD Controls & State Sync ---
  function updateBaseSize(newSize) {
    state.baseSize = Number(newSize);
    document.documentElement.style.setProperty('--dock-base-size', `${state.baseSize}px`);
    valBaseSize.textContent = `${state.baseSize}px`;
    updateTargetScales();
  }

  function updateMaxScale(newScale) {
    state.maxScale = Number(newScale);
    valMaxScale.textContent = `${state.maxScale.toFixed(2)}x`;
    updateTargetScales();
  }

  function updateSpread(newSpread) {
    state.spread = Number(newSpread);
    valSpread.textContent = `${state.spread}px`;
    updateTargetScales();
  }

  function updatePosition(pos) {
    state.position = pos;
    dockContainer.classList.remove('pos-bottom', 'pos-island', 'pos-left');
    dockContainer.classList.add(`pos-${pos}`);

    posChips.forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-pos') === pos);
    });

    // Reset margins and scales
    dockItems.forEach((item) => {
      item.style.margin = '';
      const wrapper = item.querySelector('.dock-icon-wrapper');
      if (wrapper) wrapper.style.transform = '';
    });
    itemScales.forEach((s) => {
      s.current = 1;
      s.target = 1;
    });
  }

  function updateTheme(themeName) {
    state.theme = themeName;
    document.body.className = `theme-${themeName}`;
    themeChips.forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-theme') === themeName);
    });
  }

  // Sliders input events
  rangeMaxScale.addEventListener('input', (e) => updateMaxScale(e.target.value));
  rangeSpread.addEventListener('input', (e) => updateSpread(e.target.value));
  rangeBaseSize.addEventListener('input', (e) => updateBaseSize(e.target.value));

  // Position chips
  posChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      updatePosition(chip.getAttribute('data-pos'));
    });
  });

  // Theme chips
  themeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      updateTheme(chip.getAttribute('data-theme'));
    });
  });

  // Sound toggle button
  btnToggleSound.addEventListener('click', () => {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    btnToggleSound.textContent = `音效: ${state.soundEnabled ? '开启' : '静音'}`;
    btnToggleSound.classList.toggle('active', state.soundEnabled);
  });

  // Reset defaults button
  btnResetParams.addEventListener('click', () => {
    updateBaseSize(DEFAULT_CONFIG.baseSize);
    updateMaxScale(DEFAULT_CONFIG.maxScale);
    updateSpread(DEFAULT_CONFIG.spread);
    updatePosition(DEFAULT_CONFIG.position);
    updateTheme(DEFAULT_CONFIG.theme);

    rangeBaseSize.value = DEFAULT_CONFIG.baseSize;
    rangeMaxScale.value = DEFAULT_CONFIG.maxScale;
    rangeSpread.value = DEFAULT_CONFIG.spread;

    state.soundEnabled = true;
    btnToggleSound.textContent = '音效: 开启';
    btnToggleSound.classList.add('active');
  });

  // Toggle HUD visibility
  function toggleHud() {
    controlDock.classList.toggle('hidden');
  }

  btnToggleHud.addEventListener('click', toggleHud);

  // Global hotkeys (H to toggle HUD, Escape to close HUD / App window)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'h' || e.key === 'H') {
      toggleHud();
    } else if (e.key === 'Escape') {
      if (!controlDock.classList.contains('hidden')) {
        controlDock.classList.add('hidden');
      } else if (!activeAppCard.classList.contains('hidden')) {
        closeAppWindow();
      }
    }
  });

  // Prevent dock mouseover triggering when interacting with HUD controls (Defensive event hygiene)
  controlDock.addEventListener('pointerdown', (e) => e.stopPropagation());
  controlDock.addEventListener('pointermove', (e) => e.stopPropagation());
  document.querySelector('.hud-actions').addEventListener('pointerdown', (e) => e.stopPropagation());

  // First interaction gesture to unlock Web Audio
  window.addEventListener('pointerdown', initAudio, { once: true });

  // Initialize and start animation loop
  updateBaseSize(state.baseSize);
  updateMaxScale(state.maxScale);
  updateSpread(state.spread);
  renderFrame();
})();

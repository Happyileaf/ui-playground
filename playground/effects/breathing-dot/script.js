/**
 * Breathing Dot & Status Indicator - Master Controller
 * 100% Native Vanilla ES6+ - Zero Framework Dependencies
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State Machine
  // ---------------------------------------------------------------------------
  const state = {
    mode: 'radar',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.8)',
    speed: 2.0,
    size: 8,
    glowIntensity: 1.0,
    soundEnabled: true,
    audioCtx: null
  };

  const MODES_DATA = {
    soft: {
      id: 'soft',
      name: '柔光脉动 (Count Up 机制)',
      desc: 'Count Up 同款：平滑的正弦缩放与明暗渐变，温和自然，适用于数据统计卡片与柔性环境监控。',
      cssClass: 'effect-soft'
    },
    radar: {
      id: 'radar',
      name: '声呐雷达 (Scroll Reveal 机制)',
      desc: 'Scroll Reveal 同款：核心实体恒定，外层涟漪光环向外扩散并淡出消失，常用于状态探活与信号广播。',
      cssClass: 'effect-radar'
    },
    multiwave: {
      id: 'multiwave',
      name: '三重交错涟漪',
      desc: '双伪元素与核心三层错峰动画，形成持续外扩的同心圆能量波，用于高可用集群心跳。',
      cssClass: 'effect-multiwave'
    },
    heartbeat: {
      id: 'heartbeat',
      name: '双击心跳 (REC 录制)',
      desc: '经典生理双峰弹性脉冲（噗通-噗通-间歇），专为 LIVE 直播、视频录制中 (REC) 设计。',
      cssClass: 'effect-heartbeat'
    },
    quantum: {
      id: 'quantum',
      name: '量子高能耀斑',
      desc: '核心高频微扰抖动与超宽径向辉光融合，呈现超导计算核心与充沛算力涌动。',
      cssClass: 'effect-quantum'
    },
    orbital: {
      id: 'orbital',
      name: '天体微轨伴星',
      desc: '中央稳定光核外侧，伴星沿几何微轨持续旋转巡航，呈现航天器轨道同步美感。',
      cssClass: 'effect-orbital'
    },
    bio: {
      id: 'bio',
      name: '深海生物荧光',
      desc: '非线性有机舒缓呼吸曲线与色温微幅渐变交融，模拟深海发光水母的沉浮。',
      cssClass: 'effect-bio'
    },
    beacon: {
      id: 'beacon',
      name: '灯塔信标骤亮',
      desc: '极速陡峭点亮后随负指数曲线漫长衰减，模拟航海灯塔与远距离无线信标。',
      cssClass: 'effect-beacon'
    }
  };

  // ---------------------------------------------------------------------------
  // DOM Elements
  // ---------------------------------------------------------------------------
  const root = document.documentElement;
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const btnResetParams = document.getElementById('btnResetParams');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundLabel = document.getElementById('soundLabel');
  const btnTriggerPulse = document.getElementById('btnTriggerPulse');

  const sliderSpeed = document.getElementById('sliderSpeed');
  const sliderSize = document.getElementById('sliderSize');
  const sliderGlow = document.getElementById('sliderGlow');
  const valSpeed = document.getElementById('valSpeed');
  const valSize = document.getElementById('valSize');
  const valGlow = document.getElementById('valGlow');

  const paletteGrid = document.getElementById('paletteGrid');
  const heroDot = document.getElementById('heroDot');
  const macroDotContainer = document.getElementById('macroDotContainer');
  const heroModeTitle = document.getElementById('heroModeTitle');
  const heroModeDesc = document.getElementById('heroModeDesc');
  const heroPillDot = document.querySelector('.hero-mode-pill .pill-dot');
  const heroModeIndex = document.getElementById('heroModeIndex');
  const glowOrb = document.getElementById('glowOrb');

  const badgeCards = document.querySelectorAll('.badge-item-card');

  const btnCopyCss = document.getElementById('btnCopyCss');
  const btnCopyHtml = document.getElementById('btnCopyHtml');
  const btnCopySnippet = document.getElementById('btnCopySnippet');
  const codeOutput = document.getElementById('codeOutput');
  const currentCodeLabel = document.getElementById('currentCodeLabel');
  const toastPopup = document.getElementById('toastPopup');

  // ---------------------------------------------------------------------------
  // Web Audio Synth Engine (Zero External Dependencies)
  // ---------------------------------------------------------------------------
  function initAudio() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playModeChime(mode) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!state.audioCtx) return;

      const now = state.audioCtx.currentTime;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      if (mode === 'soft') {
        // Warm gentle sine chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (mode === 'radar') {
        // Classic sonar ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.41);
      } else if (mode === 'multiwave') {
        // Cascading blips
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(650, now + 0.08);
        osc.frequency.setValueAtTime(780, now + 0.16);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.39);
      } else if (mode === 'heartbeat') {
        // Double heartbeat thump
        osc.type = 'sine';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        // Second beat
        const osc2 = state.audioCtx.createOscillator();
        const gain2 = state.audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(state.audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, now + 0.16);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.26);
        gain2.gain.setValueAtTime(0.07, now + 0.16);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        osc.start(now);
        osc.stop(now + 0.15);
        osc2.start(now + 0.16);
        osc2.stop(now + 0.33);
      } else if (mode === 'quantum') {
        // High frequency shimmer
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1040, now);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.08);
        osc.frequency.linearRampToValueAtTime(980, now + 0.18);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.31);
      } else if (mode === 'orbital') {
        // Crystalline orbital tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
      } else if (mode === 'bio') {
        // Organic gentle breath
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(277.18, now + 0.25);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.51);
      } else if (mode === 'beacon') {
        // Sudden ping spike
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.22);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (_) {
      // Audio context policy safe ignore
    }
  }

  // ---------------------------------------------------------------------------
  // UI & Param Sync
  // ---------------------------------------------------------------------------
  function syncCSSVars() {
    root.style.setProperty('--dot-color', state.color);
    root.style.setProperty('--dot-glow', state.glow);
    root.style.setProperty('--dot-speed', `${state.speed}s`);
    root.style.setProperty('--dot-size', `${state.size}px`);
    root.style.setProperty('--glow-intensity', `${state.glowIntensity}`);
  }

  function applyMode(modeKey, playSound = true) {
    const modeConfig = MODES_DATA[modeKey] || MODES_DATA.radar;
    state.mode = modeKey;

    // Remove all previous effect classes
    Object.values(MODES_DATA).forEach((m) => {
      heroDot.classList.remove(m.cssClass);
      if (heroPillDot) heroPillDot.classList.remove(m.cssClass);
    });
    heroDot.classList.add(modeConfig.cssClass);
    if (heroPillDot) heroPillDot.classList.add(modeConfig.cssClass);

    // Update text
    heroModeTitle.textContent = modeConfig.name;
    heroModeDesc.textContent = modeConfig.desc;
    const modeKeys = Object.keys(MODES_DATA);
    const modeIndex = modeKeys.indexOf(modeKey) + 1;
    if (heroModeIndex) {
      heroModeIndex.textContent = `${String(modeIndex).padStart(2, '0')} / ${String(modeKeys.length).padStart(2, '0')}`;
    }
    currentCodeLabel.textContent = `当前选中：${modeConfig.name}`;

    // Update active control dock chips
    document.querySelectorAll('.mode-chip').forEach((chip) => {
      if (chip.dataset.mode === modeKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Update Code Snippet
    renderCodeSnippet();

    if (playSound) {
      playModeChime(modeKey);
    }
  }

  function setColor(hex, glow, chipEl) {
    state.color = hex;
    state.glow = glow;
    syncCSSVars();

    if (chipEl) {
      document.querySelectorAll('.palette-chip').forEach((c) => c.classList.remove('active'));
      chipEl.classList.add('active');
    }
    renderCodeSnippet();
  }

  // ---------------------------------------------------------------------------
  // Code Snippet Generator (Minimal, Pure Native CSS)
  // ---------------------------------------------------------------------------
  function generateCSSSnippet() {
    const m = state.mode;
    const c = state.color;
    const g = state.glow;
    const speed = `${state.speed}s`;
    const size = `${state.size}px`;

    let specificKeyframes = '';
    let specificRules = '';

    if (m === 'soft') {
      specificRules = `/* 柔光收缩脉动 (Count Up 同款) */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  box-shadow: 0 0 10px 2px ${g};
  animation: pulseSoft ${speed} ease-in-out infinite;
}`;
      specificKeyframes = `@keyframes pulseSoft {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.72);
    opacity: 0.65;
  }
}`;
    } else if (m === 'radar') {
      specificRules = `/* 声呐雷达扩散 (Scroll Reveal 同款) */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  box-shadow: 0 0 0 0 ${g};
  animation: pulseRadar ${speed} cubic-bezier(0.16, 1, 0.3, 1) infinite;
}`;
      specificKeyframes = `@keyframes pulseRadar {
  0% {
    box-shadow: 0 0 0 0 ${g};
  }
  70% {
    box-shadow: 0 0 0 9px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}`;
    } else if (m === 'multiwave') {
      specificRules = `/* 三重交错涟漪 */
.breathing-dot {
  position: relative;
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  box-shadow: 0 0 6px ${g};
}
.breathing-dot::before,
.breathing-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid ${c};
  opacity: 0;
  animation: pulseMultiWave ${speed} cubic-bezier(0.2, 0.8, 0.3, 1) infinite;
}
.breathing-dot::after {
  animation-delay: calc(${speed} * 0.45);
}`;
      specificKeyframes = `@keyframes pulseMultiWave {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(2.8); opacity: 0; }
}`;
    } else if (m === 'heartbeat') {
      specificRules = `/* 双击心跳 (REC 录制) */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  animation: pulseHeartbeat ${speed} ease-in-out infinite;
}`;
      specificKeyframes = `@keyframes pulseHeartbeat {
  0%, 28%, 56%, 100% {
    transform: scale(1);
    box-shadow: 0 0 4px ${g};
  }
  14% {
    transform: scale(1.38);
    box-shadow: 0 0 16px 4px ${g};
  }
  42% {
    transform: scale(1.24);
    box-shadow: 0 0 12px 2px ${g};
  }
}`;
    } else if (m === 'quantum') {
      specificRules = `/* 量子高能耀斑 */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  box-shadow: 0 0 6px ${c}, 0 0 16px ${g}, 0 0 28px ${g};
  animation: pulseQuantum ${speed} ease-in-out infinite alternate;
}`;
      specificKeyframes = `@keyframes pulseQuantum {
  0% { transform: scale(0.92); filter: brightness(0.95); }
  65% { transform: scale(0.98); filter: brightness(1.25); }
  100% { transform: scale(1.15); filter: brightness(1.4); }
}`;
    } else if (m === 'orbital') {
      const orbitDist = Math.max(8, Math.round(state.size * 1.25));
      specificRules = `/* 天体微轨伴星 (优雅轨道环绕) */
.breathing-dot {
  position: relative;
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  box-shadow: 0 0 8px ${g};
}
.breathing-dot::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${orbitDist * 2}px;
  height: ${orbitDist * 2}px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  pointer-events: none;
}
.breathing-dot::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 5px #ffffff, 0 0 8px ${c};
  animation: pulseOrbital ${speed} linear infinite;
}`;
      specificKeyframes = `@keyframes pulseOrbital {
  from { transform: translate(-50%, -50%) rotate(0deg) translateX(${orbitDist}px) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg) translateX(${orbitDist}px) rotate(-360deg); }
}`;
    } else if (m === 'bio') {
      specificRules = `/* 深海生物荧光 */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  animation: pulseBio ${speed} ease-in-out infinite;
}`;
      specificKeyframes = `@keyframes pulseBio {
  0%, 100% {
    transform: scale(0.85);
    filter: hue-rotate(0deg) brightness(0.9);
    box-shadow: 0 0 6px ${g};
  }
  50% {
    transform: scale(1.18);
    filter: hue-rotate(35deg) brightness(1.2);
    box-shadow: 0 0 18px 4px ${g};
  }
}`;
    } else if (m === 'beacon') {
      specificRules = `/* 灯塔信标骤亮 */
.breathing-dot {
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${c};
  animation: pulseBeacon ${speed} cubic-bezier(0.05, 0.9, 0.2, 1) infinite;
}`;
      specificKeyframes = `@keyframes pulseBeacon {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.5;
    box-shadow: 0 0 2px ${g};
  }
  12% {
    transform: scale(1.35);
    opacity: 1;
    box-shadow: 0 0 20px 5px ${g};
  }
  35% {
    transform: scale(1.05);
    opacity: 0.85;
    box-shadow: 0 0 10px ${g};
  }
}`;
    }

    return `${specificRules}\n\n${specificKeyframes}`;
  }

  function renderCodeSnippet() {
    if (!codeOutput) return;
    codeOutput.textContent = generateCSSSnippet();
  }

  function showToast(msg) {
    if (!toastPopup) return;
    toastPopup.textContent = msg;
    toastPopup.classList.add('visible');
    clearTimeout(toastPopup._timer);
    toastPopup._timer = setTimeout(() => {
      toastPopup.classList.remove('visible');
    }, 2200);
  }

  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(successMsg),
        () => fallbackCopy(text, successMsg)
      );
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (_) {
      showToast('复制失败，请手动选取');
    }
    document.body.removeChild(ta);
  }

  // ---------------------------------------------------------------------------
  // Event Listeners & Wiring
  // ---------------------------------------------------------------------------
  function attachEvents() {
    // 1. First user interaction unlocks Web Audio
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    // 2. Micro-HUD Open/Close Toggle
    btnToggleHud.addEventListener('click', (e) => {
      e.stopPropagation();
      controlDock.classList.toggle('hidden');
    });

    // Prevent click bleed from HUD
    controlDock.addEventListener('click', (e) => e.stopPropagation());
    document.querySelector('.hud-actions').addEventListener('click', (e) => e.stopPropagation());

    // Close HUD on outside click
    document.addEventListener('click', () => {
      if (!controlDock.classList.contains('hidden')) {
        controlDock.classList.add('hidden');
      }
    });

    // Keyboard Shortcuts: H to toggle, Escape to close
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        controlDock.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        controlDock.classList.add('hidden');
      }
    });

    // 3. Sound Toggle & Pulse Trigger
    btnToggleSound.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundLabel.textContent = `合成音效: ${state.soundEnabled ? '开启' : '关闭'}`;
      btnToggleSound.style.opacity = state.soundEnabled ? '1' : '0.6';
      if (state.soundEnabled) {
        playModeChime(state.mode);
      }
    });

    btnTriggerPulse.addEventListener('click', () => {
      playModeChime(state.mode);
      // Retrigger animation
      heroDot.style.animation = 'none';
      void heroDot.offsetHeight; // reflow
      heroDot.style.animation = '';
    });

    // 4. Color Palette Chips
    paletteGrid.addEventListener('click', (e) => {
      const chip = e.target.closest('.palette-chip');
      if (!chip) return;
      const color = chip.dataset.color;
      const glow = chip.dataset.glow;
      setColor(color, glow, chip);
      playModeChime(state.mode);
    });

    // 5. Sliders
    sliderSpeed.addEventListener('input', (e) => {
      state.speed = parseFloat(e.target.value);
      valSpeed.textContent = `${state.speed.toFixed(1)}s`;
      syncCSSVars();
      renderCodeSnippet();
    });

    sliderSize.addEventListener('input', (e) => {
      state.size = parseInt(e.target.value, 10);
      valSize.textContent = `${state.size}px`;
      syncCSSVars();
      renderCodeSnippet();
    });

    sliderGlow.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.glowIntensity = val / 100;
      valGlow.textContent = `${val}%`;
      syncCSSVars();
      renderCodeSnippet();
    });

    // 6. Reset Params
    btnResetParams.addEventListener('click', () => {
      state.speed = 2.0;
      state.size = 8;
      state.glowIntensity = 1.0;
      sliderSpeed.value = '2.0';
      sliderSize.value = '8';
      sliderGlow.value = '100';
      valSpeed.textContent = '2.0s';
      valSize.textContent = '8px';
      valGlow.textContent = '100%';
      syncCSSVars();
      renderCodeSnippet();
      showToast('已恢复默认参数');
      playModeChime('soft');
    });

    // 7. Click on Hero Macro Dot Container
    macroDotContainer.addEventListener('click', () => {
      playModeChime(state.mode);
      // Toggle to next mode seamlessly
      const modeKeys = Object.keys(MODES_DATA);
      const currentIndex = modeKeys.indexOf(state.mode);
      const nextIndex = (currentIndex + 1) % modeKeys.length;
      applyMode(modeKeys[nextIndex]);
    });

    // 8. Control Dock Selector
    const modeSelectorGrid = document.getElementById('modeSelectorGrid');
    if (modeSelectorGrid) {
      modeSelectorGrid.addEventListener('click', (e) => {
        const chip = e.target.closest('.mode-chip');
        if (!chip) return;
        const mode = chip.dataset.mode;
        applyMode(mode);
      });
    }

    // 9. Real-World Badges Grid
    badgeCards.forEach((b) => {
      b.addEventListener('click', () => {
        const targetMode = b.dataset.targetMode;
        const targetColor = b.dataset.targetColor;
        if (targetMode) {
          applyMode(targetMode, false);
        }
        if (targetColor) {
          // Find matching chip or apply color directly
          const chip = document.querySelector(`.palette-chip[data-color="${targetColor}"]`);
          if (chip) {
            setColor(targetColor, chip.dataset.glow, chip);
          } else {
            setColor(targetColor, `${targetColor}99`, null);
          }
        }
        playModeChime(targetMode);
        showToast(`已激活 ${MODES_DATA[targetMode].name}`);
      });
    });

    // 10. Copy Actions
    if (btnCopyCss) {
      btnCopyCss.addEventListener('click', () => {
        const css = generateCSSSnippet();
        copyTextToClipboard(css, '已复制当前动效的纯 CSS 代码！');
      });
    }

    if (btnCopyHtml) {
      btnCopyHtml.addEventListener('click', () => {
        const htmlSkeleton = `<div class="hud-brand">\n  <span class="breathing-dot"></span>\n  <span class="hud-title">状态标识 · STATUS</span>\n</div>`;
        copyTextToClipboard(htmlSkeleton, '已复制 HTML 徽章结构代码！');
      });
    }

    btnCopySnippet.addEventListener('click', () => {
      const css = generateCSSSnippet();
      copyTextToClipboard(css, '已复制代码片段！');
    });
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  syncCSSVars();
  applyMode('radar', false);
  attachEvents();
})();

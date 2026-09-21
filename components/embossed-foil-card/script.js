/**
 * 3D Embossed Collectible Card · Interactive Physics & Optical Engine
 * Native-First, Zero-Bloat, 100% Self-Contained
 * Flat Planar Outer Frame with Deep Multi-Layer Internal 3D Relief
 */

(function () {
  'use strict';

  // Master Collectible Card Dataset (6 Artwork Assets)
  const CARDS = [
    {
      id: 'card-1',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/20cf88980d05c56bce6722f7b58c16d2.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '苍穹圣武 · 炽羽战神',
      titleEn: 'ASTRID · SERAPHIC WARRIOR',
      series: 'MYTHIC ARCHIVES · 1ST EDITION',
      rarity: 'DIVINE MYTHIC COLLECTIBLE',
      serial: '#01 / 06 ED.',
      auraColor: 'rgba(212, 175, 55, 0.45)'
    },
    {
      id: 'card-2',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/f638790060d6dd046b77bf865c6ab59f.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '灵魅幽梦 · 幻月狐仙',
      titleEn: 'DORIAN · SPECTRAL FOX',
      series: 'CELESTIAL REALMS · SPECIAL ED.',
      rarity: 'ETHEREAL LEGENDARY',
      serial: '#02 / 06 ED.',
      auraColor: 'rgba(56, 189, 248, 0.45)'
    },
    {
      id: 'card-3',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/0b5eff454fd807e88407bddfddefdcb4.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '幻月双生 · 秘境星使',
      titleEn: 'LUNA · CELESTIAL ENVOY',
      series: 'ASTRAL SANCTUM · MASTER PIECE',
      rarity: 'TRANSCENDENT ULTRA RARE',
      serial: '#03 / 06 ED.',
      auraColor: 'rgba(244, 63, 94, 0.45)'
    },
    {
      id: 'card-4',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/6b68df61b0e4bb5836b9c116af0d1364.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '赤焰龙尊 · 烈炎武者',
      titleEn: 'IGNIS · FLAME DRAGON LORD',
      series: 'DRAGON EMPIRE · WAR CHRONICLE',
      rarity: 'SUPREME APEX COLLECTOR',
      serial: '#04 / 06 ED.',
      auraColor: 'rgba(245, 158, 11, 0.45)'
    },
    {
      id: 'card-5',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/4d394465cbc065557182ff72d16a2a81.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '极光冰皇 · 霜雪圣裁',
      titleEn: 'FROST · GLACIAL SOVEREIGN',
      series: 'ETERNAL FROST · PRIME VAULT',
      rarity: 'ROYAL CORONET MINT',
      serial: '#05 / 06 ED.',
      auraColor: 'rgba(16, 185, 129, 0.45)'
    },
    {
      id: 'card-6',
      image: 'https://game-1255653016.file.myqcloud.com/manage/compress/custom_wzry_A1/e6980c6cce10c61058e9af78572b3d95.jpg?imageMogr2/crop/1920x882/gravity/center',
      titleCn: '渊夜魔影 · 虚空刺客',
      titleEn: 'NYX · ABYSSAL REAPER',
      series: 'VOID ECLIPSE · SECRET RARE',
      rarity: 'ABYSSAL CROWN COLLECTOR',
      serial: '#06 / 06 ED.',
      auraColor: 'rgba(168, 85, 247, 0.45)'
    }
  ];

  // DOM Elements
  const viewport = document.getElementById('cardViewport');
  const cardSlab = document.getElementById('cardSlab');
  const cardWindow = document.getElementById('cardWindow');
  const spotlight = document.getElementById('spotlight');
  const thumbnailTrack = document.getElementById('thumbnailTrack');
  const btnNavPrev = document.getElementById('btnNavPrev');
  const btnNavNext = document.getElementById('btnNavNext');

  // Dynamic Content Elements
  const artworkBgImg = document.getElementById('artworkBgImg');
  const artworkFocalImg = document.getElementById('artworkFocalImg');
  const cardSeriesText = document.getElementById('cardSeriesText');
  const cardRarityBadge = document.getElementById('cardRarityBadge');
  const cardTitleCn = document.getElementById('cardTitleCn');
  const cardTitleEn = document.getElementById('cardTitleEn');
  const cardSerialId = document.getElementById('cardSerialId');
  const characterAuraGlow = document.getElementById('characterAuraGlow');

  // HUD & Controls
  const btnToggleHud = document.getElementById('btnToggleHud');
  const controlDock = document.getElementById('controlDock');
  const btnAutoOrbit = document.getElementById('btnAutoOrbit');
  const orbitLabel = document.getElementById('orbitLabel');
  const btnMacroInspect = document.getElementById('btnMacroInspect');
  const inspectLabel = document.getElementById('inspectLabel');
  const inspectIcon = document.getElementById('inspectIcon');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundLabel = document.getElementById('soundLabel');
  const soundIcon = document.getElementById('soundIcon');
  const btnGalleryAutoPlay = document.getElementById('btnGalleryAutoPlay');
  const autoPlayLabel = document.getElementById('autoPlayLabel');
  const autoPlayIcon = document.getElementById('autoPlayIcon');
  const btnResetParams = document.getElementById('btnResetParams');

  // Sliders & Customizers
  const depthRange = document.getElementById('depthRange');
  const depthVal = document.getElementById('depthVal');
  const reliefRange = document.getElementById('reliefRange');
  const reliefVal = document.getElementById('reliefVal');
  const sheenRange = document.getElementById('sheenRange');
  const sheenVal = document.getElementById('sheenVal');
  const sensitivityRange = document.getElementById('sensitivityRange');
  const sensitivityVal = document.getElementById('sensitivityVal');
  const finishChips = document.querySelectorAll('.shape-chip');

  // Physics & Engine State
  const state = {
    activeIndex: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    lerpFactor: 0.08,
    
    // Multipliers
    depthMultiplier: 1.0,
    reliefMultiplier: 1.0,
    sheenPower: 0.9,
    sensitivityMultiplier: 1.0,
    
    // Modes
    isAutoOrbit: false,
    isInspectMacro: false,
    isSoundEnabled: false,
    isAutoPlay: false,
    isPointerActive: false,
    
    // Auto timer
    orbitTime: 0,
    autoPlayTimer: null
  };

  // Web Audio Context Synthesizer (Lazy initialized on first gesture)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playFoilChime(freq = 920, duration = 0.2) {
    if (!state.isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + duration);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function playSwitchSound() {
    if (!state.isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.22);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch (e) {}
  }

  // Preload all 6 Images
  function preloadImages() {
    CARDS.forEach(card => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = card.image;
    });
  }

  // Build Thumbnail Navigation Track
  function buildThumbnailTrack() {
    thumbnailTrack.innerHTML = '';
    CARDS.forEach((card, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `thumb-item ${index === state.activeIndex ? 'active' : ''}`;
      btn.setAttribute('aria-label', `查看卡片 ${index + 1}: ${card.titleCn}`);
      btn.innerHTML = `
        <img src="${card.image}" alt="${card.titleCn}" referrerpolicy="no-referrer" loading="lazy">
        <span class="thumb-badge">0${index + 1}</span>
      `;
      btn.addEventListener('click', () => {
        selectCard(index);
      });
      thumbnailTrack.appendChild(btn);
    });
  }

  // Select and Switch Card
  function selectCard(index) {
    if (index < 0) index = CARDS.length - 1;
    if (index >= CARDS.length) index = 0;
    if (state.activeIndex === index && artworkBgImg.src) return;

    state.activeIndex = index;
    const card = CARDS[index];

    // Smooth transition
    artworkBgImg.style.opacity = '0.3';
    artworkFocalImg.style.opacity = '0.3';

    setTimeout(() => {
      artworkBgImg.src = card.image;
      artworkFocalImg.src = card.image;
      cardSeriesText.textContent = card.series;
      cardRarityBadge.textContent = card.rarity;
      cardTitleCn.textContent = card.titleCn;
      cardTitleEn.textContent = card.titleEn;
      cardSerialId.textContent = card.serial;
      characterAuraGlow.style.background = `radial-gradient(ellipse at center, ${card.auraColor} 0%, rgba(212, 175, 55, 0.1) 50%, transparent 75%)`;

      artworkBgImg.style.opacity = '1';
      artworkFocalImg.style.opacity = '1';
    }, 120);

    // Update thumbnail active states
    const thumbs = thumbnailTrack.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    playSwitchSound();
  }

  // Pointer Interaction Handling
  function onPointerMove(e) {
    state.isPointerActive = true;
    const rect = viewport.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    state.targetX = Math.max(-1.3, Math.min(1.3, x));
    state.targetY = Math.max(-1.3, Math.min(1.3, y));

    initAudio();
  }

  function onPointerLeave() {
    state.isPointerActive = false;
    state.targetX = 0;
    state.targetY = 0;
  }

  // Animation Loop (High-Performance 60FPS)
  function animate() {
    requestAnimationFrame(animate);

    // Auto-Orbit calculation when idle or in orbit mode
    if (state.isAutoOrbit || (!state.isPointerActive && !state.isInspectMacro)) {
      state.orbitTime += 0.015;
      const autoX = Math.sin(state.orbitTime) * 0.7;
      const autoY = Math.cos(state.orbitTime * 0.8) * 0.5;

      if (state.isAutoOrbit) {
        state.targetX = autoX;
        state.targetY = autoY;
      } else {
        state.targetX = state.targetX * 0.95 + autoX * 0.05;
        state.targetY = state.targetY * 0.95 + autoY * 0.05;
      }
    }

    // Lerp Physics Smoothing
    state.currentX += (state.targetX - state.currentX) * state.lerpFactor;
    state.currentY += (state.targetY - state.currentY) * state.lerpFactor;

    // Derived Visual Parameters
    // 3D Card Rotation angles (deg): the entire card tilts and rotates smoothly in 3D perspective
    const rotX = (-state.currentY * 18 * state.sensitivityMultiplier).toFixed(2);
    const rotY = (state.currentX * 18 * state.sensitivityMultiplier).toFixed(2);

    // Parallax displacement (px): moves internal multi-layers inside the 3D space
    const px = state.currentX * 14;
    const py = state.currentY * 14;

    // Light position & angle for metallic foil sweeping reflection
    const lightNormX = (state.currentX + 1) / 2;
    const lightNormY = (state.currentY + 1) / 2;
    const lightXPercent = `${(lightNormX * 80 + 10).toFixed(1)}%`;
    const lightYPercent = `${(lightNormY * 80 + 10).toFixed(1)}%`;
    
    // Light angle in degrees
    const lightAngleDeg = `${(Math.atan2(state.currentY, state.currentX) * (180 / Math.PI) + 180).toFixed(1)}deg`;
    const foilSheenPos = `${(lightNormX * 100).toFixed(1)}%`;

    // Apply CSS Variables to Root (Clean, hardware-accelerated batch styling)
    const root = document.documentElement;
    root.style.setProperty('--pointer-x', state.currentX.toFixed(3));
    root.style.setProperty('--pointer-y', state.currentY.toFixed(3));
    root.style.setProperty('--rotate-x', `${rotX}deg`);
    root.style.setProperty('--rotate-y', `${rotY}deg`);
    root.style.setProperty('--parallax-x', `${px.toFixed(2)}px`);
    root.style.setProperty('--parallax-y', `${py.toFixed(2)}px`);
    root.style.setProperty('--light-x', lightXPercent);
    root.style.setProperty('--light-y', lightYPercent);
    root.style.setProperty('--light-deg', lightAngleDeg);
    root.style.setProperty('--foil-sheen-pos', foilSheenPos);
  }

  // Keyboard Shortcuts
  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is inside an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      // Navigation
      if (e.key === 'ArrowLeft') {
        selectCard(state.activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        selectCard(state.activeIndex + 1);
      } else if (key >= '1' && key <= '6') {
        const idx = parseInt(key, 10) - 1;
        selectCard(idx);
      }

      // HUD Toggle
      if (key === 'h') {
        toggleHud();
      } else if (e.key === 'Escape') {
        controlDock.classList.add('hidden');
      }
    });
  }

  // HUD & Tool Handlers
  function toggleHud() {
    controlDock.classList.toggle('hidden');
  }

  function setupControls() {
    btnToggleHud.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHud();
    });

    controlDock.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Navigation Buttons
    btnNavPrev.addEventListener('click', () => {
      selectCard(state.activeIndex - 1);
    });

    btnNavNext.addEventListener('click', () => {
      selectCard(state.activeIndex + 1);
    });

    // Auto-Orbit Toggle
    btnAutoOrbit.addEventListener('click', () => {
      state.isAutoOrbit = !state.isAutoOrbit;
      btnAutoOrbit.classList.toggle('active', state.isAutoOrbit);
      orbitLabel.textContent = `光影漫游: ${state.isAutoOrbit ? '开' : '关'}`;
      if (state.isAutoOrbit) initAudio();
    });

    // Macro Inspect Toggle
    btnMacroInspect.addEventListener('click', () => {
      state.isInspectMacro = !state.isInspectMacro;
      btnMacroInspect.classList.toggle('active', state.isInspectMacro);
      inspectLabel.textContent = `微距浮雕: ${state.isInspectMacro ? '开' : '关'}`;
      document.documentElement.style.setProperty('--stage-zoom', state.isInspectMacro ? '1.22' : '1');
      if (state.isInspectMacro) {
        state.targetX = 0.2;
        state.targetY = -0.3;
      }
    });

    // Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
      initAudio();
      state.isSoundEnabled = !state.isSoundEnabled;
      btnSoundToggle.classList.toggle('active', state.isSoundEnabled);
      soundLabel.textContent = `触觉音效: ${state.isSoundEnabled ? '开' : '关'}`;
      soundIcon.textContent = state.isSoundEnabled ? '🔊' : '🔈';
      if (state.isSoundEnabled) playFoilChime(1040);
    });

    // Auto Gallery Play Tour
    btnGalleryAutoPlay.addEventListener('click', () => {
      state.isAutoPlay = !state.isAutoPlay;
      btnGalleryAutoPlay.classList.toggle('active', state.isAutoPlay);
      autoPlayLabel.textContent = `自动巡演: ${state.isAutoPlay ? '开' : '关'}`;
      autoPlayIcon.textContent = state.isAutoPlay ? '⏸️' : '▶️';

      if (state.isAutoPlay) {
        state.autoPlayTimer = setInterval(() => {
          selectCard(state.activeIndex + 1);
        }, 4000);
      } else {
        clearInterval(state.autoPlayTimer);
      }
    });

    // Material Finishes
    finishChips.forEach(chip => {
      chip.addEventListener('click', () => {
        finishChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const finish = chip.getAttribute('data-finish');
        document.body.setAttribute('data-finish', finish);
        playFoilChime(880);
      });
    });

    // Sliders
    depthRange.addEventListener('input', (e) => {
      state.depthMultiplier = parseFloat(e.target.value) / 100;
      depthVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--depth-multiplier', state.depthMultiplier);
    });

    reliefRange.addEventListener('input', (e) => {
      state.reliefMultiplier = parseFloat(e.target.value) / 100;
      reliefVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--relief-multiplier', state.reliefMultiplier);
    });

    sheenRange.addEventListener('input', (e) => {
      state.sheenPower = parseFloat(e.target.value) / 100;
      sheenVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--foil-sheen-opacity', state.sheenPower);
    });

    sensitivityRange.addEventListener('input', (e) => {
      state.sensitivityMultiplier = parseFloat(e.target.value) / 100;
      sensitivityVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--sensitivity-multiplier', state.sensitivityMultiplier);
    });

    // Reset Button
    btnResetParams.addEventListener('click', () => {
      state.depthMultiplier = 1.0;
      state.reliefMultiplier = 1.0;
      state.sheenPower = 0.9;
      state.sensitivityMultiplier = 1.0;
      state.isAutoOrbit = false;
      state.isInspectMacro = false;
      state.isAutoPlay = false;

      clearInterval(state.autoPlayTimer);

      depthRange.value = 100; depthVal.textContent = '100%';
      reliefRange.value = 100; reliefVal.textContent = '100%';
      sheenRange.value = 90; sheenVal.textContent = '90%';
      sensitivityRange.value = 100; sensitivityVal.textContent = '100%';

      btnAutoOrbit.classList.remove('active'); orbitLabel.textContent = '光影漫游: 关';
      btnMacroInspect.classList.remove('active'); inspectLabel.textContent = '微距浮雕: 关';
      btnGalleryAutoPlay.classList.remove('active'); autoPlayLabel.textContent = '自动巡演: 关'; autoPlayIcon.textContent = '▶️';

      const root = document.documentElement;
      root.style.setProperty('--depth-multiplier', 1);
      root.style.setProperty('--relief-multiplier', 1);
      root.style.setProperty('--foil-sheen-opacity', 0.9);
      root.style.setProperty('--sensitivity-multiplier', 1);
      root.style.setProperty('--stage-zoom', 1);

      finishChips.forEach((c, idx) => c.classList.toggle('active', idx === 0));
      document.body.removeAttribute('data-finish');

      playFoilChime(760);
    });
  }

  // Pointer Event Listeners
  function setupPointerEvents() {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', () => initAudio(), { once: true });
  }

  // Initialize Component
  function init() {
    preloadImages();
    buildThumbnailTrack();
    setupPointerEvents();
    setupKeyboard();
    setupControls();
    selectCard(0);
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

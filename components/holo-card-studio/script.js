/**
 * HOLO CARD STUDIO · 3D 全息典藏卡工坊
 * Inspired by EverettFish/holo-card-studio
 * Native Web Standards · 100% Zero-Framework
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. COLLECTIBLE CARD CATALOG (3 Distinct Holo Studio Cards)
  // ---------------------------------------------------------------------------
  const CARDS = [
    {
      id: 'valkyrie',
      titleCn: '炽光机能女武神',
      titleEn: 'CYBERNETIC VALKYRIE · ASTRA',
      edition: 'HOLO STUDIO · 1ST EDITION',
      rarity: 'SSR · DIVINE PRISMATIC',
      rarityStars: '★★★★★',
      gems: 5,
      atk: '9850',
      def: '9400',
      serial: '#01 / 03',
      grade: 'GEM MINT 10',
      seal: 'LUMEN-99',
      image: './assets/valkyrie.jpg',
      defaultFoil: 'rainbow'
    },
    {
      id: 'dragon',
      titleCn: '虚空时空神龙',
      titleEn: 'CELESTIAL CHRONO-DRAGON · OMEGA',
      edition: 'MYTHIC ARCHIVES · CHRONO ED.',
      rarity: 'UR · CELESTIAL STARDUST',
      rarityStars: '★★★★★★',
      gems: 6,
      atk: '9990',
      def: '9800',
      serial: '#02 / 03',
      grade: 'PRISTINE 10',
      seal: 'CHRONO-08',
      image: './assets/dragon.jpg',
      defaultFoil: 'starlight'
    },
    {
      id: 'alchemist',
      titleCn: '星界秘术导师',
      titleEn: 'ASTRAL ALCHEMIST · CIRCE',
      edition: 'ARCANE CODEX · MASTER ED.',
      rarity: 'SP · ARCANE OBSIDIAN GOLD',
      rarityStars: '★★★★★',
      gems: 4,
      atk: '9200',
      def: '9650',
      serial: '#03 / 03',
      grade: 'GEM MINT 9.8',
      seal: 'RUNIC-77',
      image: './assets/alchemist.jpg',
      defaultFoil: 'gold'
    }
  ];

  let currentCardIndex = 0;

  // ---------------------------------------------------------------------------
  // 2. STATE & PARAMETERS
  // ---------------------------------------------------------------------------
  const state = {
    isFlipped: false,
    isExploded: false,
    autoOrbit: false,
    soundEnabled: false,
    activeFoil: 'rainbow',
    depthMult: 1.0,
    sparkleDensity: 0.9,
    rainbowSat: 0.85,
    layerSpacing: 60,
    maxTilt: 22,
    // Physics & Lerp
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    targetLightX: 50,
    targetLightY: 50,
    currentLightX: 50,
    currentLightY: 50,
    isPointerDown: false,
    pointerStartX: 0,
    pointerStartY: 0
  };

  // ---------------------------------------------------------------------------
  // 3. DOM ELEMENTS
  // ---------------------------------------------------------------------------
  const cardViewport = document.getElementById('cardViewport');
  const cardAssembly = document.getElementById('cardAssembly');
  const holoCard = document.getElementById('holoCard');
  const astrolabeSvg = document.getElementById('astrolabeSvg');
  const stageSpotlight = document.getElementById('stageSpotlight');
  const sparklesCanvas = document.getElementById('sparklesCanvas');
  const ctx = sparklesCanvas ? sparklesCanvas.getContext('2d') : null;

  // Card Content Nodes
  const imgBg = document.getElementById('imgBg');
  const imgSubject = document.getElementById('imgSubject');
  const editionText = document.getElementById('editionText');
  const cardRarityBadge = document.getElementById('cardRarityBadge');
  const cardTitleCn = document.getElementById('cardTitleCn');
  const cardTitleEn = document.getElementById('cardTitleEn');
  const statAtk = document.getElementById('statAtk');
  const statDef = document.getElementById('statDef');
  const cardSerial = document.getElementById('cardSerial');
  const sealCode = document.getElementById('sealCode');
  const costGems = document.getElementById('costGems');

  // Gallery Carousel
  const thumbnailsRow = document.getElementById('thumbnailsRow');
  const btnPrevCard = document.getElementById('btnPrevCard');
  const btnNextCard = document.getElementById('btnNextCard');

  // HUD & Controls
  const btnToggleHud = document.getElementById('btnToggleHud');
  const controlDock = document.getElementById('controlDock');
  const btnExplodedView = document.getElementById('btnExplodedView');
  const explodedLabel = document.getElementById('explodedLabel');
  const explodedIcon = document.getElementById('explodedIcon');
  const btnFlipCard = document.getElementById('btnFlipCard');
  const btnAutoOrbit = document.getElementById('btnAutoOrbit');
  const orbitLabel = document.getElementById('orbitLabel');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundLabel = document.getElementById('soundLabel');
  const soundIcon = document.getElementById('soundIcon');
  const foilChips = document.querySelectorAll('.shape-chip[data-foil]');

  // Sliders
  const depthRange = document.getElementById('depthRange');
  const depthVal = document.getElementById('depthVal');
  const sparkleRange = document.getElementById('sparkleRange');
  const sparkleVal = document.getElementById('sparkleVal');
  const rainbowRange = document.getElementById('rainbowRange');
  const rainbowVal = document.getElementById('rainbowVal');
  const spacingRange = document.getElementById('spacingRange');
  const spacingVal = document.getElementById('spacingVal');
  const btnResetParams = document.getElementById('btnResetParams');

  // ---------------------------------------------------------------------------
  // 4. WEB AUDIO SOUND ENGINE (Tactile Hologram Synthesis)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  let lastChimeTime = 0;

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

  // Shimmering harmonic chime when card tilts across light
  function playHoloChime(freqMultiplier = 1.0) {
    if (!state.soundEnabled || !audioCtx) return;
    const now = performance.now();
    if (now - lastChimeTime < 140) return; // rate limit
    lastChimeTime = now;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      const baseFreq = 880 * freqMultiplier;
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
      filter.Q.setValueAtTime(4, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Audio fallback
    }
  }

  // Metallic snap sound on card flip
  function playFlipSound() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.17);
    } catch (e) {}
  }

  // Mechanical servo slide sound on exploded view
  function playServoSound() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(330, audioCtx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 5. VORONOI STARLIGHT DIAMOND SPARKLES CANVAS ENGINE
  // ---------------------------------------------------------------------------
  const sparkles = [];
  const SPARKLE_COUNT = 65;

  function initSparkles() {
    if (!sparklesCanvas) return;
    const rect = sparklesCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sparklesCanvas.width = (rect.width || 320) * dpr;
    sparklesCanvas.height = (rect.height || 480) * dpr;

    sparkles.length = 0;
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      sparkles.push({
        x: Math.random() * sparklesCanvas.width,
        y: Math.random() * sparklesCanvas.height,
        size: (Math.random() * 4 + 2) * dpr,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI
      });
    }
  }

  function renderSparkles() {
    if (!ctx || !sparklesCanvas) return;
    ctx.clearRect(0, 0, sparklesCanvas.width, sparklesCanvas.height);

    const time = performance.now() * 0.002;
    const lightPixelX = (state.currentLightX / 100) * sparklesCanvas.width;
    const lightPixelY = (state.currentLightY / 100) * sparklesCanvas.height;
    const maxDist = sparklesCanvas.width * 0.55;

    for (let i = 0; i < sparkles.length; i++) {
      const p = sparkles[i];
      // Distance to specular beam hotspot
      const dx = p.x - lightPixelX;
      const dy = p.y - lightPixelY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Light proximity booster
      const proximity = Math.max(0, 1 - dist / maxDist);
      const twinkle = (Math.sin(time * p.twinkleSpeed + p.phase) + 1) * 0.5;
      const brightness = (twinkle * 0.35 + Math.pow(proximity, 2.5) * 0.85) * state.sparkleDensity;

      if (brightness > 0.05) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Core star shape
        const currentSize = p.size * (0.8 + brightness * 0.8);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, brightness)})`;

        // 4-Point Starlight Flare
        ctx.beginPath();
        ctx.moveTo(0, -currentSize);
        ctx.quadraticCurveTo(0, 0, currentSize * 0.25, 0);
        ctx.quadraticCurveTo(0, 0, 0, currentSize);
        ctx.quadraticCurveTo(0, 0, -currentSize * 0.25, 0);
        ctx.quadraticCurveTo(0, 0, 0, -currentSize);
        ctx.fill();

        // Cross rays
        ctx.beginPath();
        ctx.moveTo(-currentSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, currentSize * 0.25);
        ctx.quadraticCurveTo(0, 0, currentSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, -currentSize * 0.25);
        ctx.quadraticCurveTo(0, 0, -currentSize, 0);
        ctx.fill();

        // Shimmering diamond halo
        if (brightness > 0.5) {
          ctx.beginPath();
          ctx.arc(0, 0, currentSize * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${brightness * 0.4})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. 3D ORIENTATION & TILT PHYSICS LOOP
  // ---------------------------------------------------------------------------
  let animId = null;

  function updatePhysics() {
    // If auto-orbiting, calculate smooth Lissajous curve
    if (state.autoOrbit && !state.isPointerDown) {
      const t = performance.now() * 0.0012;
      state.targetTiltX = Math.sin(t * 1.5) * 16;
      state.targetTiltY = Math.cos(t * 2.1) * 20;
      state.targetLightX = 50 + Math.cos(t * 1.8) * 40;
      state.targetLightY = 50 + Math.sin(t * 1.4) * 40;
    }

    // Lerp damping
    const lerpFactor = 0.085;
    state.currentTiltX += (state.targetTiltX - state.currentTiltX) * lerpFactor;
    state.currentTiltY += (state.targetTiltY - state.currentTiltY) * lerpFactor;
    state.currentLightX += (state.targetLightX - state.currentLightX) * lerpFactor;
    state.currentLightY += (state.targetLightY - state.currentLightY) * lerpFactor;

    // Apply CSS custom properties to root
    document.documentElement.style.setProperty('--tilt-x', `${state.currentTiltX.toFixed(2)}deg`);
    document.documentElement.style.setProperty('--tilt-y', `${state.currentTiltY.toFixed(2)}deg`);
    document.documentElement.style.setProperty('--light-x', `${state.currentLightX.toFixed(2)}%`);
    document.documentElement.style.setProperty('--light-y', `${state.currentLightY.toFixed(2)}%`);

    // Ambient stage spotlight follow
    if (stageSpotlight) {
      const spotX = (state.currentLightX - 50) * 1.2;
      const spotY = (state.currentLightY - 50) * 1.2;
      stageSpotlight.style.transform = `translate(calc(-50% + ${spotX}px), calc(-50% + ${spotY}px))`;
    }

    // Astrolabe SVG rotation based on tilt
    if (astrolabeSvg) {
      const rot = (state.currentTiltX + state.currentTiltY) * 0.6;
      astrolabeSvg.style.transform = `rotate(${rot.toFixed(1)}deg)`;
    }

    // Trigger subtle audio chime when crossing center specular zone
    if (state.soundEnabled) {
      const speed = Math.abs(state.targetTiltX - state.currentTiltX) + Math.abs(state.targetTiltY - state.currentTiltY);
      const isNearCenter = Math.abs(state.currentTiltX) < 6 && Math.abs(state.currentTiltY) < 6;
      if (speed > 1.2 && isNearCenter) {
        playHoloChime(1.0 + (state.currentTiltX + state.currentTiltY) * 0.02);
      }
    }

    // Render Canvas Sparkles
    renderSparkles();

    animId = requestAnimationFrame(updatePhysics);
  }

  // ---------------------------------------------------------------------------
  // 7. CARD SWITCHER & RENDERING
  // ---------------------------------------------------------------------------
  function renderThumbnails() {
    if (!thumbnailsRow) return;
    thumbnailsRow.innerHTML = '';

    CARDS.forEach((card, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb-card-item ${idx === currentCardIndex ? 'active' : ''}`;
      thumb.title = `${card.titleCn} (${card.serial})`;
      thumb.innerHTML = `
        <img src="${card.image}" alt="${card.titleCn}" onerror="this.src='./assets/valkyrie.jpg'">
      `;
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCard(idx);
      });
      thumbnailsRow.appendChild(thumb);
    });
  }

  function selectCard(idx) {
    if (idx < 0) idx = CARDS.length - 1;
    if (idx >= CARDS.length) idx = 0;
    currentCardIndex = idx;
    const card = CARDS[idx];

    initAudio();

    // Fade out and in smoothly
    if (imgBg) {
      imgBg.style.opacity = '0.4';
      imgBg.src = card.image;
      setTimeout(() => imgBg.style.opacity = '1', 120);
    }
    if (imgSubject) {
      imgSubject.style.opacity = '0.4';
      imgSubject.src = card.image;
      setTimeout(() => imgSubject.style.opacity = '1', 120);
    }

    if (cardTitleCn) cardTitleCn.textContent = card.titleCn;
    if (cardTitleEn) cardTitleEn.textContent = card.titleEn;
    if (editionText) editionText.textContent = card.edition;
    if (cardRarityBadge) cardRarityBadge.textContent = card.rarity;
    if (statAtk) statAtk.textContent = card.atk;
    if (statDef) statDef.textContent = card.def;
    if (cardSerial) cardSerial.textContent = card.serial;
    if (sealCode) sealCode.textContent = card.seal;

    if (costGems) {
      costGems.innerHTML = Array(card.gems).fill('<span class="gem-point">◆</span>').join('');
    }

    // Switch material foil
    setFoilMaterial(card.defaultFoil);

    // Update thumbnails active state
    renderThumbnails();

    playHoloChime(1.2);
  }

  function setFoilMaterial(foilName) {
    state.activeFoil = foilName;
    document.body.setAttribute('data-foil', foilName);
    foilChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.foil === foilName);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. INTERACTIVE MODES (Exploded View & 3D Flip)
  // ---------------------------------------------------------------------------
  function toggleExplodedView() {
    initAudio();
    state.isExploded = !state.isExploded;
    cardAssembly.classList.toggle('exploded', state.isExploded);
    btnExplodedView.classList.toggle('active', state.isExploded);
    explodedLabel.textContent = `图层分解: ${state.isExploded ? '开' : '关'}`;
    explodedIcon.textContent = state.isExploded ? '📂' : '📑';
    playServoSound();
  }

  function toggleCardFlip() {
    initAudio();
    state.isFlipped = !state.isFlipped;
    holoCard.classList.toggle('flipped', state.isFlipped);
    playFlipSound();
  }

  function toggleAutoOrbit() {
    initAudio();
    state.autoOrbit = !state.autoOrbit;
    btnAutoOrbit.classList.toggle('active', state.autoOrbit);
    orbitLabel.textContent = `光影漫游: ${state.autoOrbit ? '开' : '关'}`;
  }

  function toggleSound() {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    btnSoundToggle.classList.toggle('active', state.soundEnabled);
    soundLabel.textContent = `触觉音效: ${state.soundEnabled ? '开' : '关'}`;
    soundIcon.textContent = state.soundEnabled ? '🔊' : '🔈';
    if (state.soundEnabled) playHoloChime(1.0);
  }

  // ---------------------------------------------------------------------------
  // 9. POINTER & TOUCH GESTURES
  // ---------------------------------------------------------------------------
  function handlePointerMove(e) {
    if (state.autoOrbit) return;

    const rect = cardViewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    // Calculate normalized coords [-1, 1] relative to center
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

    state.targetTiltY = normX * state.maxTilt;
    state.targetTiltX = -normY * state.maxTilt;

    // Specular light point [0, 100]%
    state.targetLightX = ((clientX - rect.left) / rect.width) * 100;
    state.targetLightY = ((clientY - rect.top) / rect.height) * 100;
  }

  function handlePointerDown(e) {
    initAudio();
    state.isPointerDown = true;
    state.pointerStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    state.pointerStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  }

  function handlePointerUp(e) {
    if (!state.isPointerDown) return;
    state.isPointerDown = false;

    const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
    const endY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
    const delta = Math.hypot(endX - state.pointerStartX, endY - state.pointerStartY);

    // If it was a quick click on the card, toggle 3D flip!
    if (delta < 8 && e.target.closest('#holoCard') && !e.target.closest('button')) {
      toggleCardFlip();
    }
  }

  // ---------------------------------------------------------------------------
  // 10. HUD CONTROLLER DOCK
  // ---------------------------------------------------------------------------
  function toggleHud() {
    initAudio();
    controlDock.classList.toggle('hidden');
  }

  function closeHud() {
    controlDock.classList.add('hidden');
  }

  function resetParams() {
    initAudio();
    state.depthMult = 1.0;
    state.sparkleDensity = 0.9;
    state.rainbowSat = 0.85;
    state.layerSpacing = 60;
    state.isExploded = false;
    state.isFlipped = false;
    state.autoOrbit = false;

    cardAssembly.classList.remove('exploded');
    holoCard.classList.remove('flipped');
    btnExplodedView.classList.remove('active');
    explodedLabel.textContent = '图层分解: 关';
    explodedIcon.textContent = '📑';
    btnAutoOrbit.classList.remove('active');
    orbitLabel.textContent = '光影漫游: 关';

    depthRange.value = 100;
    depthVal.textContent = '100%';
    sparkleRange.value = 90;
    sparkleVal.textContent = '90%';
    rainbowRange.value = 85;
    rainbowVal.textContent = '85%';
    spacingRange.value = 60;
    spacingVal.textContent = '60px';

    document.documentElement.style.setProperty('--depth-mult', '1');
    document.documentElement.style.setProperty('--sparkle-opacity', '0.9');
    document.documentElement.style.setProperty('--rainbow-opacity', '0.85');
    document.documentElement.style.setProperty('--layer-spacing', '60px');

    state.targetTiltX = 0;
    state.targetTiltY = 0;
    playHoloChime(0.8);
  }

  // ---------------------------------------------------------------------------
  // 11. EVENT REGISTRATIONS
  // ---------------------------------------------------------------------------
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  cardViewport.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointerup', handlePointerUp);

  // Gallery Navigation Buttons
  if (btnPrevCard) btnPrevCard.addEventListener('click', () => selectCard(currentCardIndex - 1));
  if (btnNextCard) btnNextCard.addEventListener('click', () => selectCard(currentCardIndex + 1));

  // Quick Action Buttons
  if (btnExplodedView) btnExplodedView.addEventListener('click', toggleExplodedView);
  if (btnFlipCard) btnFlipCard.addEventListener('click', toggleCardFlip);
  if (btnAutoOrbit) btnAutoOrbit.addEventListener('click', toggleAutoOrbit);
  if (btnSoundToggle) btnSoundToggle.addEventListener('click', toggleSound);

  // Material Chips
  foilChips.forEach(chip => {
    chip.addEventListener('click', () => {
      initAudio();
      setFoilMaterial(chip.dataset.foil);
      playHoloChime(1.1);
    });
  });

  // Sliders
  if (depthRange) {
    depthRange.addEventListener('input', (e) => {
      state.depthMult = parseInt(e.target.value, 10) / 100;
      depthVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--depth-mult', state.depthMult);
    });
  }

  if (sparkleRange) {
    sparkleRange.addEventListener('input', (e) => {
      state.sparkleDensity = parseInt(e.target.value, 10) / 100;
      sparkleVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--sparkle-opacity', state.sparkleDensity);
    });
  }

  if (rainbowRange) {
    rainbowRange.addEventListener('input', (e) => {
      state.rainbowSat = parseInt(e.target.value, 10) / 100;
      rainbowVal.textContent = `${e.target.value}%`;
      document.documentElement.style.setProperty('--rainbow-opacity', state.rainbowSat);
    });
  }

  if (spacingRange) {
    spacingRange.addEventListener('input', (e) => {
      state.layerSpacing = parseInt(e.target.value, 10);
      spacingVal.textContent = `${state.layerSpacing}px`;
      document.documentElement.style.setProperty('--layer-spacing', `${state.layerSpacing}px`);
    });
  }

  if (btnResetParams) btnResetParams.addEventListener('click', resetParams);

  // HUD Toggle
  if (btnToggleHud) btnToggleHud.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHud();
  });

  // Stop propagation on HUD and dock to prevent pointer events bubbling to canvas/card
  if (controlDock) {
    controlDock.addEventListener('pointerdown', (e) => e.stopPropagation());
    controlDock.addEventListener('click', (e) => e.stopPropagation());
  }
  const hudActions = document.querySelector('.hud-actions');
  if (hudActions) {
    hudActions.addEventListener('pointerdown', (e) => e.stopPropagation());
    hudActions.addEventListener('click', (e) => e.stopPropagation());
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
      toggleHud();
    } else if (e.key === 'Escape') {
      closeHud();
    } else if (e.key === 'ArrowLeft') {
      selectCard(currentCardIndex - 1);
    } else if (e.key === 'ArrowRight') {
      selectCard(currentCardIndex + 1);
    } else if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
      toggleCardFlip();
    } else if (e.key === 'e' || e.key === 'E') {
      toggleExplodedView();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleSound();
    }
  });

  // Resize handler for Canvas DPI
  window.addEventListener('resize', () => {
    initSparkles();
  });

  // ---------------------------------------------------------------------------
  // 12. INITIALIZATION
  // ---------------------------------------------------------------------------
  renderThumbnails();
  selectCard(0);
  initSparkles();
  updatePhysics();

})();

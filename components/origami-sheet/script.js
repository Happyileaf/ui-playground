(function () {
  const sheetWrapper = document.getElementById('sheetWrapper');
  const paperBase = document.getElementById('paperBase');
  const peelOverlay = document.getElementById('peelOverlay');
  const peelShadow = document.getElementById('peelShadow');
  const peelFlap = document.getElementById('peelFlap');
  const sheetId = document.getElementById('sheetId');
  const sheetDate = document.getElementById('sheetDate');
  const noteEditor = document.getElementById('noteEditor');

  // HUD & Controls
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const hudActions = document.querySelector('.hud-actions');

  const btnTearSheet = document.getElementById('btnTearSheet');
  const btnNewSheet = document.getElementById('btnNewSheet');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const btnAutoPeelDemo = document.getElementById('btnAutoPeelDemo');
  const btnResetParams = document.getElementById('btnResetParams');

  const shapeChips = document.querySelectorAll('.shape-chip');
  const stiffnessRange = document.getElementById('stiffnessRange');
  const stiffnessVal = document.getElementById('stiffnessVal');
  const shadowRange = document.getElementById('shadowRange');
  const shadowVal = document.getElementById('shadowVal');
  const tearThreshRange = document.getElementById('tearThreshRange');
  const tearThreshVal = document.getElementById('tearThreshVal');

  // State
  let noteIndex = 42;
  const config = {
    texture: 'noir',
    stiffness: 0.18,
    shadowDepth: 0.8,
    tearThreshold: 0.55,
    soundEnabled: false
  };

  // Drag & Physics State
  let isDragging = false;
  let activeCorner = null; // 'tr', 'br', 'tl', 'bl'
  let dragOriginX = 0;
  let dragOriginY = 0;
  let targetPeel = 0; // 0 to 1
  let currentPeel = 0;
  let peelAngle = 45;
  let peelTargetX = '100%';
  let peelTargetY = '0%';
  let isTearing = false;

  // Web Audio Synth for Paper Sounds (Peeling & Tearing)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      try {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      } catch (e) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playPaperNoise(duration = 0.25, isTear = false) {
    if (!config.soundEnabled || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Procedural White/Pink Noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * (isTear ? 1.5 : 0.8);
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = isTear ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(isTear ? 1800 : 800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(isTear ? 3200 : 300, audioCtx.currentTime + duration);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(isTear ? 0.25 : 0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {}
  }

  // =========================================================================
  // Peeling Simulation & Geometry Math
  // =========================================================================

  function updatePeelGeometry() {
    if (isTearing) return;

    // Smooth Spring Snapping Lerp
    currentPeel += (targetPeel - currentPeel) * config.stiffness;

    if (currentPeel > 0.01) {
      peelOverlay.style.pointerEvents = 'auto';
      peelShadow.style.opacity = (currentPeel * config.shadowDepth).toFixed(2);
      peelFlap.style.opacity = Math.min(1, currentPeel * 1.5).toFixed(2);

      // Dynamic Clip-Path calculation for 3D folded corner flap
      const peelPx = Math.round(currentPeel * 340);
      let clipBase = '';
      let clipFlap = '';

      if (activeCorner === 'tr') {
        clipBase = `polygon(0 0, calc(100% - ${peelPx}px) 0, 100% ${peelPx}px, 100% 100%, 0 100%)`;
        clipFlap = `polygon(calc(100% - ${peelPx}px) 0, 100% ${peelPx}px, calc(100% - ${peelPx * 0.7}px) ${peelPx * 0.7}px)`;
        peelTargetX = '100%';
        peelTargetY = '0%';
        peelAngle = 45;
      } else if (activeCorner === 'tl') {
        clipBase = `polygon(${peelPx}px 0, 100% 0, 100% 100%, 0 100%, 0 ${peelPx}px)`;
        clipFlap = `polygon(0 ${peelPx}px, ${peelPx}px 0, ${peelPx * 0.7}px ${peelPx * 0.7}px)`;
        peelTargetX = '0%';
        peelTargetY = '0%';
        peelAngle = 135;
      } else if (activeCorner === 'br') {
        clipBase = `polygon(0 0, 100% 0, 100% calc(100% - ${peelPx}px), calc(100% - ${peelPx}px) 100%, 0 100%)`;
        clipFlap = `polygon(100% calc(100% - ${peelPx}px), calc(100% - ${peelPx}px) 100%, calc(100% - ${peelPx * 0.7}px) calc(100% - ${peelPx * 0.7}px))`;
        peelTargetX = '100%';
        peelTargetY = '100%';
        peelAngle = 315;
      } else if (activeCorner === 'bl') {
        clipBase = `polygon(0 0, 100% 0, 100% 100%, ${peelPx}px 100%, 0 calc(100% - ${peelPx}px))`;
        clipFlap = `polygon(0 calc(100% - ${peelPx}px), ${peelPx}px 100%, ${peelPx * 0.7}px calc(100% - ${peelPx * 0.7}px))`;
        peelTargetX = '0%';
        peelTargetY = '100%';
        peelAngle = 225;
      }

      paperBase.style.clipPath = clipBase;
      peelFlap.style.clipPath = clipFlap;
      document.documentElement.style.setProperty('--peel-amount', currentPeel.toFixed(2));
      document.documentElement.style.setProperty('--peel-x', peelTargetX);
      document.documentElement.style.setProperty('--peel-y', peelTargetY);
      document.documentElement.style.setProperty('--crease-angle', `${peelAngle}deg`);
    } else {
      paperBase.style.clipPath = 'none';
      peelFlap.style.clipPath = 'none';
      peelShadow.style.opacity = '0';
      peelFlap.style.opacity = '0';
    }

    requestAnimationFrame(updatePeelGeometry);
  }
  requestAnimationFrame(updatePeelGeometry);

  // Tear-off Current Sheet & Instantiate New One
  function tearCurrentSheet() {
    if (isTearing) return;
    isTearing = true;
    initAudio();
    playPaperNoise(0.5, true);

    sheetWrapper.classList.add('tearing');

    setTimeout(() => {
      // Increment Note
      noteIndex++;
      if (sheetId) sheetId.textContent = `NOTE · #${String(noteIndex).padStart(3, '0')}`;

      // Reset state
      targetPeel = 0;
      currentPeel = 0;
      activeCorner = null;
      paperBase.style.clipPath = 'none';
      sheetWrapper.classList.remove('tearing');
      isTearing = false;

      // Soft rustle on new sheet land
      playPaperNoise(0.2, false);
    }, 450);
  }

  // =========================================================================
  // Pointer Event Listeners
  // =========================================================================
  const handles = document.querySelectorAll('.peel-handle');

  handles.forEach((handle) => {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      initAudio();
      isDragging = true;
      activeCorner = handle.dataset.corner || 'tr';
      dragOriginX = e.clientX;
      dragOriginY = e.clientY;
      playPaperNoise(0.15, false);
    });
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging || isTearing) return;

    const dx = e.clientX - dragOriginX;
    const dy = e.clientY - dragOriginY;
    const distance = Math.hypot(dx, dy);
    const maxDrag = 380;

    targetPeel = Math.max(0, Math.min(1.0, distance / maxDrag));

    // Subtle drag audio
    if (Math.random() < 0.1) {
      playPaperNoise(0.08, false);
    }
  });

  window.addEventListener('pointerup', () => {
    if (!isDragging || isTearing) return;
    isDragging = false;

    if (targetPeel >= config.tearThreshold) {
      // Trigger Tear-off
      tearCurrentSheet();
    } else {
      // Snap back
      targetPeel = 0;
      initAudio();
      playPaperNoise(0.18, false);
    }
  });

  // =========================================================================
  // Control Panel Event Bindings
  // =========================================================================

  if (btnTearSheet) {
    btnTearSheet.addEventListener('click', tearCurrentSheet);
  }

  if (btnNewSheet) {
    btnNewSheet.addEventListener('click', () => {
      noteIndex++;
      if (sheetId) sheetId.textContent = `NOTE · #${String(noteIndex).padStart(3, '0')}`;
      if (noteEditor) {
        noteEditor.value = `◈ NOTE #${String(noteIndex).padStart(3, '0')} · 新灵感备忘
────────────────────────
• 在此记录新概念或设计线索...`;
      }
      initAudio();
      playPaperNoise(0.25, false);
    });
  }

  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      config.soundEnabled = !config.soundEnabled;
      btnToggleSound.classList.toggle('active', config.soundEnabled);
      if (soundIcon) soundIcon.textContent = config.soundEnabled ? '🔊' : '🔈';
      if (soundLabel) soundLabel.textContent = `纸张音效: ${config.soundEnabled ? '开' : '关'}`;
      if (config.soundEnabled) {
        initAudio();
        playPaperNoise(0.3, true);
      }
    });
  }

  if (btnAutoPeelDemo) {
    btnAutoPeelDemo.addEventListener('click', () => {
      if (isDragging || isTearing) return;
      activeCorner = 'tr';
      initAudio();
      playPaperNoise(0.2, false);
      targetPeel = 0.42;

      setTimeout(() => {
        targetPeel = 0;
        playPaperNoise(0.15, false);
      }, 900);
    });
  }

  // Texture Selector
  shapeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      shapeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const texture = chip.dataset.texture;
      if (texture) {
        config.texture = texture;
        paperBase.setAttribute('data-texture', texture);
        initAudio();
        playPaperNoise(0.15, false);
      }
    });
  });

  // Sliders
  if (stiffnessRange) {
    stiffnessRange.addEventListener('input', (e) => {
      config.stiffness = parseFloat(e.target.value);
      if (stiffnessVal) stiffnessVal.textContent = config.stiffness.toFixed(2);
    });
  }

  if (shadowRange) {
    shadowRange.addEventListener('input', (e) => {
      config.shadowDepth = parseInt(e.target.value, 10) / 100;
      if (shadowVal) shadowVal.textContent = `${e.target.value}%`;
    });
  }

  if (tearThreshRange) {
    tearThreshRange.addEventListener('input', (e) => {
      config.tearThreshold = parseInt(e.target.value, 10) / 100;
      if (tearThreshVal) tearThreshVal.textContent = `${e.target.value}%`;
    });
  }

  // Reset Parameters
  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      config.texture = 'noir';
      config.stiffness = 0.18;
      config.shadowDepth = 0.8;
      config.tearThreshold = 0.55;
      config.soundEnabled = false;

      paperBase.setAttribute('data-texture', 'noir');
      shapeChips.forEach(c => c.classList.toggle('active', c.dataset.texture === 'noir'));

      if (btnToggleSound) {
        btnToggleSound.classList.remove('active');
        if (soundIcon) soundIcon.textContent = '🔈';
        if (soundLabel) soundLabel.textContent = '纸张音效: 关';
      }

      if (stiffnessRange) stiffnessRange.value = 0.18;
      if (stiffnessVal) stiffnessVal.textContent = '0.18';
      if (shadowRange) shadowRange.value = 80;
      if (shadowVal) shadowVal.textContent = '80%';
      if (tearThreshRange) tearThreshRange.value = 55;
      if (tearThreshVal) tearThreshVal.textContent = '55%';
    });
  }

  // Panel Toggle & Keyboards
  function toggleHud() {
    if (controlDock) {
      controlDock.classList.toggle('hidden');
    }
  }

  if (btnToggleHud) {
    btnToggleHud.addEventListener('click', toggleHud);
  }

  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key.toLowerCase() === 'h') {
      toggleHud();
    } else if (e.key === 'Escape' && controlDock && !controlDock.classList.contains('hidden')) {
      controlDock.classList.add('hidden');
    }
  });

  // Stop propagation on HUD and Dock
  if (controlDock) {
    controlDock.addEventListener('pointerdown', (e) => e.stopPropagation());
    controlDock.addEventListener('click', (e) => e.stopPropagation());
  }
  if (hudActions) {
    hudActions.addEventListener('pointerdown', (e) => e.stopPropagation());
    hudActions.addEventListener('click', (e) => e.stopPropagation());
  }

  // Set today's date
  const now = new Date();
  if (sheetDate) {
    sheetDate.textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  }
})();

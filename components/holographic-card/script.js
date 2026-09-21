(function () {
  const card = document.getElementById('holoCard');
  const cardWrapper = document.getElementById('cardWrapper');
  const tierTag = document.getElementById('tierTag');

  // HUD & Dock Elements
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const hudActions = document.querySelector('.hud-actions');

  const btnFlipCard = document.getElementById('btnFlipCard');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const btnAutoTilt = document.getElementById('btnAutoTilt');
  const autoTiltLabel = document.getElementById('autoTiltLabel');
  const btnResetTilt = document.getElementById('btnResetTilt');
  const btnResetParams = document.getElementById('btnResetParams');

  const shapeChips = document.querySelectorAll('.shape-chip');
  const holoIntensityRange = document.getElementById('holoIntensityRange');
  const holoIntensityVal = document.getElementById('holoIntensityVal');
  const tiltMaxRange = document.getElementById('tiltMaxRange');
  const tiltMaxVal = document.getElementById('tiltMaxVal');
  const specularRange = document.getElementById('specularRange');
  const specularVal = document.getElementById('specularVal');

  // State
  const state = {
    finish: 'titanium',
    holoIntensity: 0.85,
    tiltMax: 24,
    specularSharpness: 90,
    isFlipped: false,
    soundEnabled: false,
    autoTilt: false
  };

  // Interpolation Physics
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let targetPx = 50;
  let targetPy = 50;
  let currentPx = 50;
  let currentPy = 50;
  let autoTiltTime = 0;

  // Web Audio Synth
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

  function playMetallicClick(freq = 1200, type = 'sine') {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  // 3D Flip Card Toggle
  function flipCard() {
    initAudio();
    state.isFlipped = !state.isFlipped;
    playMetallicClick(state.isFlipped ? 880 : 1320, 'triangle');
  }

  // Pointer Movement Tracking
  function handlePointerMove(e) {
    if (state.autoTilt) return;
    const rect = card.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const relX = clientX - (rect.left + rect.width / 2);
    const relY = clientY - (rect.top + rect.height / 2);

    const normX = Math.max(-1, Math.min(1, relX / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, relY / (rect.height / 2)));

    targetRotY = normX * state.tiltMax;
    targetRotX = -normY * state.tiltMax;

    // Specular focal point percentage
    targetPx = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    targetPy = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
  }

  function handlePointerLeave() {
    if (state.autoTilt) return;
    targetRotX = 0;
    targetRotY = 0;
    targetPx = 50;
    targetPy = 50;
  }

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerleave', handlePointerLeave);

  // Card Click to Flip
  cardWrapper.addEventListener('click', (e) => {
    if (e.target.closest('.hud-actions') || e.target.closest('.control-dock')) return;
    flipCard();
  });

  // Animation Loop for Smooth Physics Lerp
  let animId = null;

  function update() {
    animId = requestAnimationFrame(update);

    if (state.autoTilt) {
      autoTiltTime += 0.025;
      targetRotX = Math.sin(autoTiltTime) * (state.tiltMax * 0.7);
      targetRotY = Math.cos(autoTiltTime * 0.8) * (state.tiltMax * 0.85);
      targetPx = 50 + Math.sin(autoTiltTime * 0.9) * 35;
      targetPy = 50 + Math.cos(autoTiltTime * 0.7) * 35;
    }

    currentRotX += (targetRotX - currentRotX) * 0.12;
    currentRotY += (targetRotY - currentRotY) * 0.12;
    currentPx += (targetPx - currentPx) * 0.15;
    currentPy += (targetPy - currentPy) * 0.15;

    const effectiveRotY = state.isFlipped ? (currentRotY + 180) : currentRotY;
    const prismAngle = (currentPx * 3.6 + currentPy * 1.8) % 360;

    card.style.setProperty('--card-rotate-x', `${currentRotX.toFixed(2)}deg`);
    card.style.setProperty('--card-rotate-y', `${effectiveRotY.toFixed(2)}deg`);
    card.style.setProperty('--pointer-x', `${currentPx.toFixed(1)}%`);
    card.style.setProperty('--pointer-y', `${currentPy.toFixed(1)}%`);
    card.style.setProperty('--prism-angle', `${prismAngle.toFixed(1)}deg`);
    card.style.setProperty('--holo-opacity', state.holoIntensity);
    card.style.setProperty('--specular-sharpness', `${state.specularSharpness}%`);
  }

  // =========================================================================
  // Control Panel Event Bindings
  // =========================================================================

  if (btnFlipCard) {
    btnFlipCard.addEventListener('click', flipCard);
  }

  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      btnToggleSound.classList.toggle('active', state.soundEnabled);
      if (soundIcon) soundIcon.textContent = state.soundEnabled ? '🔊' : '🔈';
      if (soundLabel) soundLabel.textContent = `触觉音效: ${state.soundEnabled ? '开' : '关'}`;
      if (state.soundEnabled) {
        initAudio();
        playMetallicClick(1440, 'triangle');
      }
    });
  }

  if (btnAutoTilt) {
    btnAutoTilt.addEventListener('click', () => {
      state.autoTilt = !state.autoTilt;
      btnAutoTilt.classList.toggle('active', state.autoTilt);
      if (autoTiltLabel) autoTiltLabel.textContent = `自动摇摆: ${state.autoTilt ? '开' : '关'}`;
    });
  }

  if (btnResetTilt) {
    btnResetTilt.addEventListener('click', () => {
      targetRotX = 0;
      targetRotY = 0;
      state.isFlipped = false;
      state.autoTilt = false;
      if (btnAutoTilt) {
        btnAutoTilt.classList.remove('active');
        if (autoTiltLabel) autoTiltLabel.textContent = '自动摇摆: 关';
      }
    });
  }

  // Finish Selection
  shapeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      shapeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const finish = chip.dataset.finish;
      if (finish) {
        state.finish = finish;
        card.setAttribute('data-finish', finish);
        initAudio();
        playMetallicClick(1020);

        // Update Tier Tag text
        const tagMap = {
          titanium: 'TITANIUM PRIVILEGE',
          platinum: 'LIQUID PLATINUM PRISM',
          rosegold: 'LUMINARY ROSE GOLD',
          aurora: 'COSMIC AURORA FOIL'
        };
        if (tierTag && tagMap[finish]) {
          tierTag.textContent = tagMap[finish];
        }
      }
    });
  });

  // Sliders
  if (holoIntensityRange) {
    holoIntensityRange.addEventListener('input', (e) => {
      state.holoIntensity = parseInt(e.target.value, 10) / 100;
      if (holoIntensityVal) holoIntensityVal.textContent = `${e.target.value}%`;
    });
  }

  if (tiltMaxRange) {
    tiltMaxRange.addEventListener('input', (e) => {
      state.tiltMax = parseInt(e.target.value, 10);
      if (tiltMaxVal) tiltMaxVal.textContent = `${state.tiltMax}°`;
    });
  }

  if (specularRange) {
    specularRange.addEventListener('input', (e) => {
      state.specularSharpness = parseInt(e.target.value, 10);
      if (specularVal) specularVal.textContent = `${state.specularSharpness}%`;
    });
  }

  // Reset Parameters
  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      state.finish = 'titanium';
      state.holoIntensity = 0.85;
      state.tiltMax = 24;
      state.specularSharpness = 90;
      state.isFlipped = false;
      state.soundEnabled = false;
      state.autoTilt = false;

      targetRotX = 0;
      targetRotY = 0;

      card.setAttribute('data-finish', 'titanium');
      if (tierTag) tierTag.textContent = 'TITANIUM PRIVILEGE';

      shapeChips.forEach(c => c.classList.toggle('active', c.dataset.finish === 'titanium'));
      if (btnToggleSound) {
        btnToggleSound.classList.remove('active');
        if (soundIcon) soundIcon.textContent = '🔈';
        if (soundLabel) soundLabel.textContent = '触觉音效: 关';
      }
      if (btnAutoTilt) {
        btnAutoTilt.classList.remove('active');
        if (autoTiltLabel) autoTiltLabel.textContent = '自动摇摆: 关';
      }

      if (holoIntensityRange) holoIntensityRange.value = 85;
      if (holoIntensityVal) holoIntensityVal.textContent = '85%';
      if (tiltMaxRange) tiltMaxRange.value = 24;
      if (tiltMaxVal) tiltMaxVal.textContent = '24°';
      if (specularRange) specularRange.value = 90;
      if (specularVal) specularVal.textContent = '90%';
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
    } else if (e.code === 'Space') {
      flipCard();
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

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animId) cancelAnimationFrame(animId);
    if (audioCtx) audioCtx.close().catch(() => {});
  });

  // Start Animation
  update();
})();

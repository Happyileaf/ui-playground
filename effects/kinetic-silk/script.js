// Kinetic Silk Waves · 动能光织流体物理引擎
// 100% Pure Native JavaScript, Zero External Dependencies
(function () {
  'use strict';

  const canvas = document.getElementById('silkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animId = null;

  // Parameters State
  const state = {
    palette: 'atelier',
    strandCount: 44,
    warpFactor: 1.0,
    speedFactor: 1.0,
    amplitude: 85,
    enableRipples: true,
    enableGlow: true,
    autoCruise: true
  };

  // Color Palettes
  const palettes = {
    atelier: {
      strands: [
        { color: '226, 177, 112', alpha: 0.22, freq: 0.0028, speed: 0.013, ampMod: 1.0, phase: 0 },
        { color: '255, 255, 255', alpha: 0.12, freq: 0.0038, speed: 0.009, ampMod: 1.25, phase: 1.8 },
        { color: '16, 185, 129',  alpha: 0.10, freq: 0.0022, speed: 0.015, ampMod: 0.85, phase: 3.4 }
      ],
      poolColor: '226, 177, 112'
    },
    emerald: {
      strands: [
        { color: '16, 185, 129',  alpha: 0.25, freq: 0.0032, speed: 0.014, ampMod: 1.0, phase: 0 },
        { color: '52, 211, 153',  alpha: 0.14, freq: 0.0042, speed: 0.011, ampMod: 1.2, phase: 2.1 },
        { color: '6, 182, 212',   alpha: 0.10, freq: 0.0025, speed: 0.016, ampMod: 0.8, phase: 4.0 }
      ],
      poolColor: '16, 185, 129'
    },
    violet: {
      strands: [
        { color: '168, 85, 247', alpha: 0.24, freq: 0.0030, speed: 0.012, ampMod: 1.1, phase: 0 },
        { color: '59, 130, 246', alpha: 0.15, freq: 0.0040, speed: 0.015, ampMod: 0.9, phase: 1.9 },
        { color: '236, 72, 153', alpha: 0.10, freq: 0.0024, speed: 0.008, ampMod: 1.3, phase: 3.6 }
      ],
      poolColor: '168, 85, 247'
    },
    silver: {
      strands: [
        { color: '255, 255, 255', alpha: 0.26, freq: 0.0030, speed: 0.012, ampMod: 1.0, phase: 0 },
        { color: '148, 163, 184', alpha: 0.16, freq: 0.0045, speed: 0.010, ampMod: 1.2, phase: 2.3 },
        { color: '203, 213, 225', alpha: 0.10, freq: 0.0022, speed: 0.016, ampMod: 0.8, phase: 4.2 }
      ],
      poolColor: '255, 255, 255'
    },
    solar: {
      strands: [
        { color: '249, 115, 22', alpha: 0.25, freq: 0.0033, speed: 0.015, ampMod: 1.0, phase: 0 },
        { color: '244, 63, 94',  alpha: 0.16, freq: 0.0044, speed: 0.011, ampMod: 1.3, phase: 2.0 },
        { color: '251, 191, 36', alpha: 0.12, freq: 0.0024, speed: 0.018, ampMod: 0.75, phase: 3.8 }
      ],
      poolColor: '249, 115, 22'
    }
  };

  // Mouse / Pointer Physics State
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
    lastActiveTime: 0
  };

  // Ripples system (Shockwave bursts upon click)
  const ripples = [];

  function addRipple(x, y) {
    if (!state.enableRipples) return;
    ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(width, height) * 0.45,
      strength: 1.0,
      decay: 0.018,
      speed: 12
    });
  }

  // Canvas Resize
  function handleResize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (!pointer.isActive) {
      pointer.x = pointer.targetX = width * 0.5;
      pointer.y = pointer.targetY = height * 0.5;
    }
  }

  window.addEventListener('resize', handleResize);

  // Pointer Listeners
  window.addEventListener('pointermove', (e) => {
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
    pointer.isActive = true;
    pointer.lastActiveTime = performance.now();
  });

  window.addEventListener('pointerdown', (e) => {
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
    pointer.isActive = true;
    pointer.lastActiveTime = performance.now();
    addRipple(e.clientX, e.clientY);
  });

  // Render Loop
  let time = 0;

  function render() {
    time += 0.016 * state.speedFactor;

    // Handle Auto-Drift Cruise
    const now = performance.now();
    if (state.autoCruise && (!pointer.isActive || now - pointer.lastActiveTime > 4000)) {
      pointer.targetX = width * 0.5 + Math.sin(time * 0.8) * (width * 0.28);
      pointer.targetY = height * 0.52 + Math.cos(time * 1.1) * (height * 0.22);
    }

    // Smooth Lerp Pointer
    pointer.x += (pointer.targetX - pointer.x) * 0.05;
    pointer.y += (pointer.targetY - pointer.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const activePalette = palettes[state.palette] || palettes.atelier;

    // 1. Ambient Pointer Glow Pool
    if (state.enableGlow) {
      const grad = ctx.createRadialGradient(
        pointer.x, pointer.y, 20,
        pointer.x, pointer.y, Math.max(300, width * 0.35)
      );
      grad.addColorStop(0, `rgba(${activePalette.poolColor}, 0.07)`);
      grad.addColorStop(0.5, `rgba(${activePalette.poolColor}, 0.015)`);
      grad.addColorStop(1, 'rgba(8, 9, 13, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Update and Clean Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.strength -= r.decay;
      if (r.strength <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    // 3. Render Harmonic Kinetic Strands
    const centerY = height * 0.52;
    const strandGroups = activePalette.strands;
    const totalCount = state.strandCount;
    const countPerGroup = Math.ceil(totalCount / strandGroups.length);
    const influenceDist = 420;

    strandGroups.forEach((group, gIdx) => {
      const groupOffsetBase = (gIdx - 1) * 35;

      for (let i = 0; i < countPerGroup; i++) {
        const strandRatio = i / countPerGroup;
        const verticalSpread = (strandRatio - 0.5) * 80;
        const alpha = group.alpha * (1 - Math.abs(strandRatio - 0.5) * 0.65);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${group.color}, ${Math.max(0.02, alpha)})`;
        ctx.lineWidth = 1.25;

        // Trace across screen with continuous Bézier / line increments
        const step = 14;
        let isFirst = true;

        for (let x = 0; x <= width + step; x += step) {
          const nx = x * group.freq;
          const harmonic1 = Math.sin(nx + time * group.speed * 60 + group.phase + i * 0.09);
          const harmonic2 = Math.cos(nx * 1.8 - time * group.speed * 35 + i * 0.05);

          // Base Wave
          const baseHeight = (harmonic1 * state.amplitude * group.ampMod) + (harmonic2 * (state.amplitude * 0.35));

          // Pointer Gravity Warp
          const dx = x - pointer.x;
          const dist = Math.abs(dx);
          let warp = 0;
          if (dist < influenceDist) {
            const factor = 1 - dist / influenceDist;
            const smooth = factor * factor * (3 - 2 * factor); // smoothstep
            warp = (pointer.y - centerY) * smooth * 0.48 * state.warpFactor;
          }

          // Ripples Shockwave Influence
          let rippleWarp = 0;
          for (let rIdx = 0; rIdx < ripples.length; rIdx++) {
            const r = ripples[rIdx];
            const distToPoint = Math.hypot(x - r.x, centerY - r.y);
            const waveDelta = Math.abs(distToPoint - r.radius);
            if (waveDelta < 60) {
              const waveFactor = 1 - waveDelta / 60;
              rippleWarp += Math.sin(waveDelta * 0.2) * 28 * r.strength * waveFactor;
            }
          }

          const y = centerY + groupOffsetBase + verticalSpread + baseHeight + warp + rippleWarp;

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    });

    animId = requestAnimationFrame(render);
  }

  // =========================================================================
  // HUD Controls & Event Bindings
  // =========================================================================
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const btnAutoCruise = document.getElementById('btnAutoCruise');
  const btnRandomize = document.getElementById('btnRandomize');
  const btnResetParams = document.getElementById('btnResetParams');

  const paramStrands = document.getElementById('paramStrands');
  const paramWarp = document.getElementById('paramWarp');
  const paramSpeed = document.getElementById('paramSpeed');
  const paramAmp = document.getElementById('paramAmp');

  const valStrands = document.getElementById('valStrands');
  const valWarp = document.getElementById('valWarp');
  const valSpeed = document.getElementById('valSpeed');
  const valAmp = document.getElementById('valAmp');

  const checkRipples = document.getElementById('checkRipples');
  const checkGlow = document.getElementById('checkGlow');

  // Palette Chips
  const paletteChips = document.querySelectorAll('.palette-chip');
  paletteChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      paletteChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const pal = chip.dataset.palette;
      if (pal && palettes[pal]) {
        state.palette = pal;
      }
    });
  });

  // Slider Listeners
  if (paramStrands) {
    paramStrands.addEventListener('input', (e) => {
      state.strandCount = parseInt(e.target.value, 10);
      if (valStrands) valStrands.textContent = `${state.strandCount} 线束`;
    });
  }

  if (paramWarp) {
    paramWarp.addEventListener('input', (e) => {
      state.warpFactor = parseFloat(e.target.value);
      if (valWarp) valWarp.textContent = `${state.warpFactor.toFixed(1)}x`;
    });
  }

  if (paramSpeed) {
    paramSpeed.addEventListener('input', (e) => {
      state.speedFactor = parseFloat(e.target.value);
      if (valSpeed) valSpeed.textContent = `${state.speedFactor.toFixed(1)}x`;
    });
  }

  if (paramAmp) {
    paramAmp.addEventListener('input', (e) => {
      state.amplitude = parseInt(e.target.value, 10);
      if (valAmp) valAmp.textContent = `${state.amplitude}px`;
    });
  }

  if (checkRipples) {
    checkRipples.addEventListener('change', (e) => {
      state.enableRipples = e.target.checked;
    });
  }

  if (checkGlow) {
    checkGlow.addEventListener('change', (e) => {
      state.enableGlow = e.target.checked;
    });
  }

  // Auto Cruise Toggle
  if (btnAutoCruise) {
    btnAutoCruise.addEventListener('click', () => {
      state.autoCruise = !state.autoCruise;
      btnAutoCruise.querySelector('.tool-label').textContent = `自动漂移: ${state.autoCruise ? '开' : '关'}`;
      btnAutoCruise.style.opacity = state.autoCruise ? '1' : '0.65';
    });
  }

  // Randomize Parameters
  if (btnRandomize) {
    btnRandomize.addEventListener('click', () => {
      const paletteKeys = Object.keys(palettes);
      const randomPal = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
      state.palette = randomPal;
      paletteChips.forEach(c => c.classList.toggle('active', c.dataset.palette === randomPal));

      state.strandCount = Math.floor(Math.random() * 8) * 6 + 24;
      state.warpFactor = +(Math.random() * 1.8 + 0.5).toFixed(1);
      state.speedFactor = +(Math.random() * 1.8 + 0.4).toFixed(1);
      state.amplitude = Math.floor(Math.random() * 100) + 50;

      if (paramStrands) paramStrands.value = state.strandCount;
      if (paramWarp) paramWarp.value = state.warpFactor;
      if (paramSpeed) paramSpeed.value = state.speedFactor;
      if (paramAmp) paramAmp.value = state.amplitude;

      if (valStrands) valStrands.textContent = `${state.strandCount} 线束`;
      if (valWarp) valWarp.textContent = `${state.warpFactor.toFixed(1)}x`;
      if (valSpeed) valSpeed.textContent = `${state.speedFactor.toFixed(1)}x`;
      if (valAmp) valAmp.textContent = `${state.amplitude}px`;

      addRipple(width * 0.5, height * 0.5);
    });
  }

  // Reset Parameters
  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      state.palette = 'atelier';
      paletteChips.forEach(c => c.classList.toggle('active', c.dataset.palette === 'atelier'));

      state.strandCount = 44;
      state.warpFactor = 1.0;
      state.speedFactor = 1.0;
      state.amplitude = 85;
      state.enableRipples = true;
      state.enableGlow = true;

      if (paramStrands) paramStrands.value = 44;
      if (paramWarp) paramWarp.value = 1.0;
      if (paramSpeed) paramSpeed.value = 1.0;
      if (paramAmp) paramAmp.value = 85;
      if (checkRipples) checkRipples.checked = true;
      if (checkGlow) checkGlow.checked = true;

      if (valStrands) valStrands.textContent = '44 线束';
      if (valWarp) valWarp.textContent = '1.0x';
      if (valSpeed) valSpeed.textContent = '1.0x';
      if (valAmp) valAmp.textContent = '85px';
    });
  }

  // Toggle HUD
  function toggleHud() {
    if (controlDock) {
      controlDock.classList.toggle('hidden');
    }
  }

  if (btnToggleHud) {
    btnToggleHud.addEventListener('click', toggleHud);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      toggleHud();
    }
  });

  // Start Engine
  handleResize();
  render();
})();

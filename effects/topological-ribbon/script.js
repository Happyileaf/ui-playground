(function () {
  const canvas = document.getElementById('ribbonCanvas');
  const ctx = canvas.getContext('2d');

  // DOM Elements
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const hudActions = document.querySelector('.hud-actions');

  const btnAutoOrbit = document.getElementById('btnAutoOrbit');
  const autoOrbitLabel = document.getElementById('autoOrbitLabel');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const btnEnergyPulse = document.getElementById('btnEnergyPulse');
  const btnResetView = document.getElementById('btnResetView');
  const btnResetParams = document.getElementById('btnResetParams');

  const ribbonWidthRange = document.getElementById('ribbonWidthRange');
  const ribbonWidthVal = document.getElementById('ribbonWidthVal');
  const orbitSpeedRange = document.getElementById('orbitSpeedRange');
  const orbitSpeedVal = document.getElementById('orbitSpeedVal');
  const flowDensityRange = document.getElementById('flowDensityRange');
  const flowDensityVal = document.getElementById('flowDensityVal');

  const shapeChips = document.querySelectorAll('.shape-chip');
  const paletteChips = document.querySelectorAll('.palette-chip');

  // Configuration State
  const config = {
    form: 'mobius',
    palette: 'cyber',
    ribbonWidth: 60,
    orbitSpeed: 1.0,
    flowDensity: 80,
    autoOrbit: true,
    soundEnabled: false
  };

  // Dimensions & DPI
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  // 3D Camera & Rotation State
  let rotX = 0.45;
  let rotY = 0.6;
  let rotZ = 0.0;
  let targetRotX = 0.45;
  let targetRotY = 0.6;
  let zoom = 1.0;
  let targetZoom = 1.0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let animTime = 0;
  let pulseWave = 0; // 0 to 1 wave travel
  let pulseActive = false;

  // Web Audio Synthesizer (Harmonic Resonator)
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

  function playHarmonicTone(freq, duration = 0.8, type = 'sine') {
    if (!config.soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(freq, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function triggerEnergyPulse() {
    initAudio();
    pulseWave = 0.01;
    pulseActive = true;
    playHarmonicTone(440, 1.2, 'triangle');
  }

  // Color Palette Definitions
  const palettes = {
    cyber: {
      color1: [6, 182, 212],    // Cyan
      color2: [139, 92, 246],  // Purple
      highlight: [244, 63, 94], // Rose
      stream: 'rgba(56, 189, 248, '
    },
    gold: {
      color1: [245, 158, 11],   // Amber
      color2: [251, 191, 36],   // Gold
      highlight: [255, 255, 255],// White
      stream: 'rgba(251, 191, 36, '
    },
    neon: {
      color1: [244, 63, 94],    // Crimson Rose
      color2: [56, 189, 248],   // Cyan
      highlight: [168, 85, 247],// Violet
      stream: 'rgba(244, 63, 94, '
    },
    emerald: {
      color1: [16, 185, 129],   // Emerald
      color2: [6, 182, 212],    // Cyan
      highlight: [52, 211, 153],// Mint
      stream: 'rgba(52, 211, 153, '
    }
  };

  // Parametric Geometries
  // Return { x, y, z, nx, ny, nz } given (u in [0, 2π], v in [-1, 1])
  function evaluateTopology(u, v, form, widthScale, time) {
    const w = v * widthScale;
    let x = 0, y = 0, z = 0;
    const baseRadius = Math.min(width, height) * 0.26 * zoom;

    if (form === 'trefoil') {
      // Trefoil Knot 3-twist ribbon
      const t = u;
      const r = (Math.cos(2 * t) * 0.35 + 1.0) * baseRadius;
      const cx = r * Math.cos(3 * t) * 0.85;
      const cy = r * Math.sin(3 * t) * 0.85;
      const cz = -Math.sin(2 * t) * baseRadius * 0.65;

      // Normal twist along knot
      const twist = (3 * t) / 2 + time * 0.5;
      const nx = Math.cos(twist);
      const ny = Math.sin(twist);
      const nz = Math.sin(t * 3);

      x = cx + nx * w;
      y = cy + ny * w;
      z = cz + nz * (w * 0.5);
    } else if (form === 'double-twist') {
      // 2-twist Torus Strip (Orientable closed ribbon)
      const R = baseRadius * 1.1;
      const twist = u; // 2 half-twists = 1 full twist
      const r = R + w * Math.cos(twist);
      x = r * Math.cos(u);
      y = r * Math.sin(u);
      z = w * Math.sin(twist) + Math.sin(u * 2 + time) * 12;
    } else if (form === 'klein') {
      // Figure-8 Klein bottle cross-section
      const R = baseRadius * 0.95;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);
      const cosU2 = Math.cos(u / 2);
      const sinU2 = Math.sin(u / 2);

      const r = R + w * (cosU2 * cosU - sinU2 * sinU * 0.5);
      x = r * cosU;
      y = r * sinU * 1.1;
      z = w * (sinU2 * cosU + cosU2 * sinU) * 1.2 + Math.cos(u * 3 + time) * 10;
    } else {
      // Classic 1-twist Möbius Strip
      const R = baseRadius * 1.1;
      const twist = u / 2;
      const r = R + w * Math.cos(twist);
      x = r * Math.cos(u);
      y = r * Math.sin(u);
      z = w * Math.sin(twist);
    }

    return { x, y, z };
  }

  // 3D Rotation Matrix & Perspective Projection
  function project3D(p, cx, cy) {
    // 1. Rotate Y (Yaw)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    let x1 = p.x * cosY + p.z * sinY;
    let y1 = p.y;
    let z1 = -p.x * sinY + p.z * cosY;

    // 2. Rotate X (Pitch)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    let x2 = x1;
    let y2 = y1 * cosX - z1 * sinX;
    let z2 = y1 * sinX + z1 * cosX;

    // 3. Rotate Z (Roll subtle)
    const cosZ = Math.cos(rotZ);
    const sinZ = Math.sin(rotZ);
    let x3 = x2 * cosZ - y2 * sinZ;
    let y3 = x2 * sinZ + y2 * cosZ;
    let z3 = z2;

    // Camera perspective projection
    const fov = 750;
    const distance = 800;
    const pz = z3 + distance;
    const scale = fov / Math.max(10, pz);

    return {
      x: cx + x3 * scale,
      y: cy + y3 * scale,
      z: z3,
      scale: scale
    };
  }

  // Flowing Energy Stream Micro-Particles
  const streamParticles = [];
  const MAX_STREAMS = 150;

  function initStreamParticles() {
    streamParticles.length = 0;
    for (let i = 0; i < MAX_STREAMS; i++) {
      streamParticles.push({
        u: Math.random() * Math.PI * 4, // 2 full circuits for Mobius
        v: Math.random() * 1.8 - 0.9,
        speed: (Math.random() * 0.008 + 0.006),
        length: Math.random() * 0.15 + 0.05,
        alpha: Math.random() * 0.7 + 0.3,
        thickness: Math.random() * 1.5 + 1.0
      });
    }
  }
  initStreamParticles();

  // =========================================================================
  // Main Render Loop
  // =========================================================================
  let animId = null;

  function render() {
    animId = requestAnimationFrame(render);

    // Smooth Orbit & Inertia
    if (config.autoOrbit && !isDragging) {
      targetRotY += 0.004 * config.orbitSpeed;
      targetRotX = 0.45 + Math.sin(animTime * 0.3) * 0.15;
    }
    rotX += (targetRotX - rotX) * 0.08;
    rotY += (targetRotY - rotY) * 0.08;
    zoom += (targetZoom - zoom) * 0.1;
    animTime += 0.015 * config.orbitSpeed;

    // Handle Energy Pulse propagation
    if (pulseActive) {
      pulseWave += 0.02 * config.orbitSpeed;
      if (pulseWave > 1.2) {
        pulseActive = false;
        pulseWave = 0;
      }
    }

    // Clear Canvas with subtle trail
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const pal = palettes[config.palette] || palettes.cyber;

    // Grid Mesh Discretization
    const uSteps = 90;
    const vSteps = 6;
    const uMax = Math.PI * 2;
    const quads = [];

    // Evaluate 3D points
    const pointsGrid = [];
    for (let i = 0; i <= uSteps; i++) {
      pointsGrid[i] = [];
      const u = (i / uSteps) * uMax;
      for (let j = 0; j <= vSteps; j++) {
        const v = (j / vSteps) * 2 - 1; // [-1, 1]
        const p3d = evaluateTopology(u, v, config.form, config.ribbonWidth, animTime);
        pointsGrid[i][j] = project3D(p3d, cx, cy);
      }
    }

    // Create sorted quad polygons
    for (let i = 0; i < uSteps; i++) {
      const nextI = (i + 1) % uSteps;
      const uNorm = i / uSteps;

      for (let j = 0; j < vSteps; j++) {
        const nextJ = j + 1;
        const p00 = pointsGrid[i][j];
        const p10 = pointsGrid[nextI][j];
        const p11 = pointsGrid[nextI][nextJ];
        const p01 = pointsGrid[i][nextJ];

        const avgZ = (p00.z + p10.z + p11.z + p01.z) / 4;

        // Calculate pulse intensity at this segment
        let pulseBoost = 0;
        if (pulseActive) {
          const dist = Math.abs(uNorm - (pulseWave % 1.0));
          const wrappedDist = Math.min(dist, 1 - dist);
          if (wrappedDist < 0.12) {
            pulseBoost = (1 - wrappedDist / 0.12) * 0.8;
          }
        }

        quads.push({
          p0: p00,
          p1: p10,
          p2: p11,
          p3: p01,
          z: avgZ,
          uNorm: uNorm,
          vNorm: (j / vSteps),
          pulse: pulseBoost
        });
      }
    }

    // Depth Sort (Painter's Algorithm)
    quads.sort((a, b) => a.z - b.z);

    // Render Quads
    for (let q of quads) {
      const { p0, p1, p2, p3, z, uNorm, vNorm, pulse } = q;

      // Color interpolation based on uNorm (along loop) and vNorm (across strip)
      const t = (Math.sin(uNorm * Math.PI * 2 + animTime) + 1) / 2;
      const r = Math.round(pal.color1[0] * (1 - t) + pal.color2[0] * t + pulse * 120);
      const g = Math.round(pal.color1[1] * (1 - t) + pal.color2[1] * t + pulse * 120);
      const b = Math.round(pal.color1[2] * (1 - t) + pal.color2[2] * t + pulse * 120);

      // Depth fading
      const depthAlpha = Math.max(0.18, Math.min(0.85, (z + 400) / 700)) + pulse * 0.3;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      ctx.fillStyle = `rgba(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)}, ${Math.min(1, depthAlpha * 0.42)})`;
      ctx.fill();

      ctx.strokeStyle = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 60)}, ${Math.min(1, depthAlpha * 0.65)})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Render Flowing Energy Streams along the Geodesic Loop
    const activeStreams = Math.min(config.flowDensity, streamParticles.length);
    for (let s = 0; s < activeStreams; s++) {
      const st = streamParticles[s];
      st.u += st.speed * config.orbitSpeed;
      if (st.u > Math.PI * 4) st.u -= Math.PI * 4;

      const pHead = evaluateTopology(st.u, st.v, config.form, config.ribbonWidth, animTime);
      const pTail = evaluateTopology(st.u - st.length, st.v, config.form, config.ribbonWidth, animTime);

      const projHead = project3D(pHead, cx, cy);
      const projTail = project3D(pTail, cx, cy);

      const grad = ctx.createLinearGradient(projTail.x, projTail.y, projHead.x, projHead.y);
      grad.addColorStop(0, `${pal.stream}0)`);
      grad.addColorStop(1, `${pal.stream}${st.alpha})`);

      ctx.beginPath();
      ctx.moveTo(projTail.x, projTail.y);
      ctx.lineTo(projHead.x, projHead.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = st.thickness * projHead.scale;
      ctx.stroke();

      // Glowing Particle Head
      ctx.beginPath();
      ctx.arc(projHead.x, projHead.y, st.thickness * 1.5 * projHead.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  // =========================================================================
  // Pointer & Interactive Gestures
  // =========================================================================
  window.addEventListener('pointerdown', (e) => {
    // If clicking on HUD, ignore canvas drag
    if (e.target.closest('.hud-actions') || e.target.closest('.control-dock')) return;
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    initAudio();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    targetRotY += dx * 0.008;
    targetRotX += dy * 0.008;
    targetRotX = Math.max(-1.4, Math.min(1.4, targetRotX));
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Wheel Zoom
  window.addEventListener('wheel', (e) => {
    if (e.target.closest('.control-dock')) return;
    e.preventDefault();
    targetZoom += e.deltaY * -0.001;
    targetZoom = Math.max(0.5, Math.min(2.2, targetZoom));
  }, { passive: false });

  // Double Click / Tap Canvas for Energy Pulse
  canvas.addEventListener('dblclick', () => {
    triggerEnergyPulse();
  });

  // Stop propagation on controls
  if (controlDock) {
    controlDock.addEventListener('pointerdown', (e) => e.stopPropagation());
    controlDock.addEventListener('click', (e) => e.stopPropagation());
  }
  if (hudActions) {
    hudActions.addEventListener('pointerdown', (e) => e.stopPropagation());
    hudActions.addEventListener('click', (e) => e.stopPropagation());
  }

  // =========================================================================
  // Control Panel Event Bindings
  // =========================================================================

  // 1. Auto Orbit Toggle
  if (btnAutoOrbit) {
    btnAutoOrbit.addEventListener('click', () => {
      config.autoOrbit = !config.autoOrbit;
      btnAutoOrbit.classList.toggle('active', config.autoOrbit);
      if (autoOrbitLabel) autoOrbitLabel.textContent = `自动自转: ${config.autoOrbit ? '开' : '关'}`;
    });
  }

  // 2. Harmonic Sound Toggle
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      config.soundEnabled = !config.soundEnabled;
      btnToggleSound.classList.toggle('active', config.soundEnabled);
      if (soundIcon) soundIcon.textContent = config.soundEnabled ? '🔊' : '🔈';
      if (soundLabel) soundLabel.textContent = `谐波音效: ${config.soundEnabled ? '开' : '关'}`;
      if (config.soundEnabled) {
        initAudio();
        playHarmonicTone(520, 0.6);
      }
    });
  }

  // 3. Energy Pulse Action
  if (btnEnergyPulse) {
    btnEnergyPulse.addEventListener('click', () => {
      triggerEnergyPulse();
    });
  }

  // 4. Reset View
  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      targetRotX = 0.45;
      targetRotY = 0.6;
      targetZoom = 1.0;
    });
  }

  // 5. Form Selection
  shapeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      shapeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const form = chip.dataset.form;
      if (form) {
        config.form = form;
        triggerEnergyPulse();
      }
    });
  });

  // 6. Palette Selection
  paletteChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      paletteChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const palette = chip.dataset.palette;
      if (palette) {
        config.palette = palette;
      }
    });
  });

  // 7. Ribbon Width Slider
  if (ribbonWidthRange) {
    ribbonWidthRange.addEventListener('input', (e) => {
      config.ribbonWidth = parseFloat(e.target.value);
      if (ribbonWidthVal) ribbonWidthVal.textContent = `${config.ribbonWidth}px`;
    });
  }

  // 8. Orbit Speed Slider
  if (orbitSpeedRange) {
    orbitSpeedRange.addEventListener('input', (e) => {
      config.orbitSpeed = parseFloat(e.target.value);
      if (orbitSpeedVal) orbitSpeedVal.textContent = `${config.orbitSpeed.toFixed(1)}x`;
    });
  }

  // 9. Flow Density Slider
  if (flowDensityRange) {
    flowDensityRange.addEventListener('input', (e) => {
      config.flowDensity = parseInt(e.target.value, 10);
      if (flowDensityVal) flowDensityVal.textContent = `${config.flowDensity} 股`;
    });
  }

  // 10. Reset Parameters
  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      config.form = 'mobius';
      config.palette = 'cyber';
      config.ribbonWidth = 60;
      config.orbitSpeed = 1.0;
      config.flowDensity = 80;
      config.autoOrbit = true;
      config.soundEnabled = false;

      targetRotX = 0.45;
      targetRotY = 0.6;
      targetZoom = 1.0;

      if (btnAutoOrbit) {
        btnAutoOrbit.classList.add('active');
        if (autoOrbitLabel) autoOrbitLabel.textContent = '自动自转: 开';
      }
      if (btnToggleSound) {
        btnToggleSound.classList.remove('active');
        if (soundIcon) soundIcon.textContent = '🔈';
        if (soundLabel) soundLabel.textContent = '谐波音效: 关';
      }

      shapeChips.forEach(c => c.classList.toggle('active', c.dataset.form === 'mobius'));
      paletteChips.forEach(c => c.classList.toggle('active', c.dataset.palette === 'cyber'));

      if (ribbonWidthRange) ribbonWidthRange.value = 60;
      if (ribbonWidthVal) ribbonWidthVal.textContent = '60px';
      if (orbitSpeedRange) orbitSpeedRange.value = 1.0;
      if (orbitSpeedVal) orbitSpeedVal.textContent = '1.0x';
      if (flowDensityRange) flowDensityRange.value = 80;
      if (flowDensityVal) flowDensityVal.textContent = '80 股';
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

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animId) cancelAnimationFrame(animId);
    if (audioCtx) audioCtx.close().catch(() => {});
  });

  // Start Rendering
  render();
})();

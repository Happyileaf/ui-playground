(function () {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');

  // DOM 控件引用
  const controlDock = document.getElementById('controlDock');
  const btnToggleHud = document.getElementById('btnToggleHud');
  const hudActions = document.querySelector('.hud-actions');

  const btnAutoLaunch = document.getElementById('btnAutoLaunch');
  const autoLaunchLabel = document.getElementById('autoLaunchLabel');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const barrageBtn = document.getElementById('barrageBtn');
  const clearBtn = document.getElementById('clearBtn');
  const btnResetParams = document.getElementById('btnResetParams');

  const particleCountRange = document.getElementById('particleCountRange');
  const particleCountVal = document.getElementById('particleCountVal');
  const trailDecayRange = document.getElementById('trailDecayRange');
  const trailDecayVal = document.getElementById('trailDecayVal');
  const gravityRange = document.getElementById('gravityRange');
  const gravityVal = document.getElementById('gravityVal');

  const shapeChips = document.querySelectorAll('.shape-chip');
  const paletteChips = document.querySelectorAll('.palette-chip');

  // 运行参数配置对象 (统一受控状态)
  const config = {
    autoLaunch: true,
    soundEnabled: false,
    shape: 'classic',
    palette: 'rainbow',
    particleCount: 60,
    trailDecayLevel: 3,
    gravityMultiplier: 1.0,
  };

  // Trail clear alpha based on level (1 = 最长留光 0.12, 5 = 最短留光 0.38)
  const trailAlphaMap = {
    1: 0.12,
    2: 0.16,
    3: 0.22,
    4: 0.28,
    5: 0.38
  };
  const trailTextMap = {
    1: '超长',
    2: '较长',
    3: '适中',
    4: '较短',
    5: '极简'
  };

  // 高分屏 Canvas 尺寸自适应与重缩放
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const fireworks = [];
  const particles = [];
  let timer = 0;
  let animId = null;

  // =========================================================================
  // Web Audio API 拟真音频合成引擎 (纯前端原生，无需外部音效资产)
  // =========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      } catch (err) {
        // AudioContext 不受支持或安全沙箱限制
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  // 升空口哨音 (Launch Whoosh)
  function playLaunchSound() {
    if (!config.soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 200, now + 0.35);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 绽放爆炸轰鸣声与低频共振 (Burst Boom)
  function playBoomSound() {
    if (!config.soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // 1. 低频主冲击波 (Sine)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + Math.random() * 50, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // 2. 噪波炸裂爆裂声 (Crackles)
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {}
  }

  // =========================================================================
  // 色彩调色板生成器
  // =========================================================================
  function getPaletteHue() {
    switch (config.palette) {
      case 'gold':
        return { hue: Math.floor(Math.random() * 20 + 38), sat: 96, light: Math.random() * 20 + 75 };
      case 'cyber':
        return Math.random() > 0.5
          ? { hue: Math.floor(Math.random() * 20 + 175), sat: 100, light: 65 } // 赛博青
          : { hue: Math.floor(Math.random() * 30 + 300), sat: 100, light: 65 }; // 霓虹粉
      case 'aurora':
        return { hue: Math.floor(Math.random() * 45 + 140), sat: 95, light: Math.random() * 25 + 60 };
      case 'crimson':
        return { hue: (Math.floor(Math.random() * 24 + 350) + 360) % 360, sat: 100, light: Math.random() * 25 + 60 };
      case 'rainbow':
      default:
        return { hue: Math.floor(Math.random() * 360), sat: 100, light: Math.random() * 25 + 65 };
    }
  }

  // =========================================================================
  // 礼花发射火箭实体 (Rocket)
  // =========================================================================
  class Firework {
    constructor(sx, sy, tx, ty) {
      this.x = sx;
      this.y = sy;
      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.atan2(ty - sy, tx - sx);
      this.speed = 2.4;
      this.acceleration = 1.035;
      const colorSpec = getPaletteHue();
      this.hue = colorSpec.hue;
      this.sat = colorSpec.sat;
      this.light = colorSpec.light;
      this.shape = config.shape;
      playLaunchSound();
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      this.speed *= this.acceleration;
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      this.distanceTraveled = Math.hypot(this.x - this.sx, this.y - this.sy);

      if (this.distanceTraveled >= this.distanceToTarget) {
        createExplosion(this.tx, this.ty, this.hue, this.shape);
        fireworks.splice(index, 1);
        playBoomSound();
      } else {
        this.x += vx;
        this.y += vy;
      }
    }

    draw() {
      ctx.beginPath();
      const lastCoord = this.coordinates[this.coordinates.length - 1];
      ctx.moveTo(lastCoord[0], lastCoord[1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  // =========================================================================
  // 爆炸微粒实体 (Particle)
  // =========================================================================
  class Particle {
    constructor(x, y, hue, angle, speed, decayModifier, isWillow) {
      this.x = x;
      this.y = y;
      this.coordinates = [];
      this.coordinateCount = isWillow ? 6 : 4;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = angle;
      this.speed = speed;
      this.friction = isWillow ? 0.94 : 0.955;
      this.gravity = (isWillow ? 1.4 : 0.95) * config.gravityMultiplier;
      this.hue = (hue + (Math.random() * 30 - 15) + 360) % 360;
      this.brightness = Math.random() * 35 + 65;
      this.alpha = 1;
      this.decay = (Math.random() * 0.012 + 0.012) * (decayModifier || 1);
      this.isWillow = isWillow;
      this.flicker = Math.random() > 0.4;
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;

      if (this.alpha <= this.decay) {
        particles.splice(index, 1);
      }
    }

    draw() {
      ctx.beginPath();
      const lastCoord = this.coordinates[this.coordinates.length - 1];
      ctx.moveTo(lastCoord[0], lastCoord[1]);
      ctx.lineTo(this.x, this.y);

      const renderAlpha = this.flicker && Math.random() > 0.3 ? this.alpha * 0.6 : this.alpha;
      ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${renderAlpha})`;
      ctx.lineWidth = this.isWillow ? 1.5 : 2;
      ctx.stroke();
    }
  }

  // =========================================================================
  // 绽放形态算法解析 (支持 Classic, Heart, Ring, Spiral, Willow)
  // =========================================================================
  function createExplosion(x, y, hue, shape) {
    const totalCount = config.particleCount;

    if (shape === 'heart') {
      // 浪漫爱心极坐标参数方程
      for (let i = 0; i < totalCount; i++) {
        const t = (i / totalCount) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const angle = Math.atan2(hy, hx);
        const speed = (Math.hypot(hx, hy) / 16) * (Math.random() * 2 + 5);
        particles.push(new Particle(x, y, hue, angle, speed, 0.9, false));
      }
    } else if (shape === 'ring') {
      // 空心同心光环 (双层)
      for (let i = 0; i < totalCount; i++) {
        const angle = (i / totalCount) * Math.PI * 2;
        const isInner = i % 2 === 0;
        const speed = isInner ? 4.2 + (Math.random() * 0.4 - 0.2) : 6.8 + (Math.random() * 0.5 - 0.25);
        particles.push(new Particle(x, y, isInner ? hue : (hue + 40) % 360, angle, speed, 0.95, false));
      }
    } else if (shape === 'spiral') {
      // 银河旋转漩涡
      const arms = 3;
      for (let i = 0; i < totalCount; i++) {
        const progress = i / totalCount;
        const angle = progress * Math.PI * 2 * arms;
        const speed = progress * 7.5 + 2.0;
        particles.push(new Particle(x, y, (hue + progress * 80) % 360, angle, speed, 0.95, false));
      }
    } else if (shape === 'willow') {
      // 垂柳繁星漫散 (金光摇曳，寿命长，重力大)
      for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 1.2;
        particles.push(new Particle(x, y, hue, angle, speed, 0.55, true));
      }
    } else {
      // 经典全向发散 (Classic)
      for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8.5 + 1.8;
        particles.push(new Particle(x, y, hue, angle, speed, 1.0, false));
      }
    }
  }

  // =========================================================================
  // 主动画渲染循环 (Delta Time & Trail Persistence)
  // =========================================================================
  function loop() {
    animId = requestAnimationFrame(loop);

    const clearAlpha = trailAlphaMap[config.trailDecayLevel] || 0.22;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
      particles[j].draw();
      particles[j].update(j);
    }

    // 自动连续燃放判定
    if (config.autoLaunch) {
      timer++;
      if (timer % 34 === 0) {
        const sx = width / 2 + (Math.random() * 320 - 160);
        const sy = height;
        const tx = Math.random() * (width - 180) + 90;
        const ty = Math.random() * (height * 0.52) + 60;
        fireworks.push(new Firework(sx, sy, tx, ty));
      }
    }
  }

  // 指定目标位置发射礼花
  function launchAt(targetX, targetY) {
    initAudioContext();
    const sx = width / 2 + (Math.random() * 140 - 70);
    const sy = height;
    fireworks.push(new Firework(sx, sy, targetX, targetY));
  }

  // 齐发五枚礼花 (Barrage Volley)
  function launchBarrage() {
    initAudioContext();
    for (let k = 0; k < 5; k++) {
      setTimeout(() => {
        const sx = (width / 6) * (k + 1) + (Math.random() * 40 - 20);
        const tx = (width / 6) * (k + 1) + (Math.random() * 60 - 30);
        const ty = Math.random() * (height * 0.4) + 80;
        fireworks.push(new Firework(sx, height, tx, ty));
      }, k * 120);
    }
  }

  // =========================================================================
  // 事件交互与配置面板数据绑定
  // =========================================================================

  // 画布点击/触摸发射礼花
  let isPointerDown = false;
  let dragThrottle = 0;

  canvas.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    launchAt(e.clientX, e.clientY);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    dragThrottle++;
    if (dragThrottle % 6 === 0) {
      launchAt(e.clientX, e.clientY);
    }
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  // 阻止控制面板与顶栏内的点击穿透到画布
  if (controlDock) {
    controlDock.addEventListener('pointerdown', (e) => e.stopPropagation());
    controlDock.addEventListener('click', (e) => e.stopPropagation());
  }
  if (hudActions) {
    hudActions.addEventListener('pointerdown', (e) => e.stopPropagation());
    hudActions.addEventListener('click', (e) => e.stopPropagation());
  }

  // 1. 自动燃放开关
  if (btnAutoLaunch) {
    btnAutoLaunch.addEventListener('click', () => {
      config.autoLaunch = !config.autoLaunch;
      if (autoLaunchLabel) autoLaunchLabel.textContent = `自动连发: ${config.autoLaunch ? '开' : '关'}`;
      btnAutoLaunch.classList.toggle('active', config.autoLaunch);
    });
  }

  // 2. 音效模拟开关
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      config.soundEnabled = !config.soundEnabled;
      if (config.soundEnabled) {
        initAudioContext();
      }
      if (soundIcon) soundIcon.textContent = config.soundEnabled ? '🔊' : '🔈';
      if (soundLabel) soundLabel.textContent = `燃放音效: ${config.soundEnabled ? '开' : '关'}`;
      btnToggleSound.classList.toggle('active', config.soundEnabled);
    });
  }

  // 3. 齐发五枚
  if (barrageBtn) {
    barrageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchBarrage();
    });
  }

  // 4. 清空夜空
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fireworks.length = 0;
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
    });
  }

  // 5. 绽放形态选择
  shapeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      shapeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const shape = chip.dataset.shape;
      if (shape) {
        config.shape = shape;
      }
    });
  });

  // 6. 色彩方案选择
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

  // 7. 粒子密度滑块
  if (particleCountRange) {
    particleCountRange.addEventListener('input', (e) => {
      config.particleCount = parseInt(e.target.value, 10);
      if (particleCountVal) particleCountVal.textContent = `${config.particleCount} 颗`;
    });
  }

  // 8. 尾迹留光滑块
  if (trailDecayRange) {
    trailDecayRange.addEventListener('input', (e) => {
      config.trailDecayLevel = parseInt(e.target.value, 10);
      if (trailDecayVal) trailDecayVal.textContent = trailTextMap[config.trailDecayLevel] || '适中';
    });
  }

  // 9. 重力引力滑块
  if (gravityRange) {
    gravityRange.addEventListener('input', (e) => {
      config.gravityMultiplier = parseFloat(e.target.value);
      if (gravityVal) gravityVal.textContent = `${config.gravityMultiplier.toFixed(1)}x`;
    });
  }

  // 10. 重置参数
  if (btnResetParams) {
    btnResetParams.addEventListener('click', () => {
      config.autoLaunch = true;
      config.soundEnabled = false;
      config.shape = 'classic';
      config.palette = 'rainbow';
      config.particleCount = 60;
      config.trailDecayLevel = 3;
      config.gravityMultiplier = 1.0;

      if (btnAutoLaunch) {
        btnAutoLaunch.classList.add('active');
        if (autoLaunchLabel) autoLaunchLabel.textContent = '自动连发: 开';
      }
      if (btnToggleSound) {
        btnToggleSound.classList.remove('active');
        if (soundIcon) soundIcon.textContent = '🔈';
        if (soundLabel) soundLabel.textContent = '燃放音效: 关';
      }

      shapeChips.forEach(c => c.classList.toggle('active', c.dataset.shape === 'classic'));
      paletteChips.forEach(c => c.classList.toggle('active', c.dataset.palette === 'rainbow'));

      if (particleCountRange) particleCountRange.value = 60;
      if (particleCountVal) particleCountVal.textContent = '60 颗';
      if (trailDecayRange) trailDecayRange.value = 3;
      if (trailDecayVal) trailDecayVal.textContent = '适中';
      if (gravityRange) gravityRange.value = 1.0;
      if (gravityVal) gravityVal.textContent = '1.0x';
    });
  }

  // =========================================================================
  // 面板折叠/展开与快捷键支持 (H / ESC)
  // =========================================================================
  function toggleHud() {
    if (controlDock) {
      controlDock.classList.toggle('hidden');
    }
  }

  if (btnToggleHud) {
    btnToggleHud.addEventListener('click', toggleHud);
  }

  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    if (e.key.toLowerCase() === 'h') {
      toggleHud();
    } else if (e.key === 'Escape' && controlDock && !controlDock.classList.contains('hidden')) {
      controlDock.classList.add('hidden');
    }
  });

  // 卸载清理
  window.addEventListener('beforeunload', () => {
    if (animId) cancelAnimationFrame(animId);
    if (audioCtx) {
      audioCtx.close().catch(() => {});
    }
  });

  // 启动主循环
  loop();
})();

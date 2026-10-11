/**
 * Living Constellation · 活体星图深空视觉实验系统
 * 100% Native ES6+ JavaScript · Zero External Runtime Dependencies
 * Design Aesthetic: Haute-Design Obsidian HUD matching Kinetic Silk Waves
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Astronomical Constants & Star Catalog
  // ==========================================================================

  const MAJOR_STAR_CATALOG = [
    {
      name: '织女一 (Vega)',
      bayer: 'α Lyrae',
      spectral: 'A0V 蓝白主序星',
      distance: '25.04 ly',
      color: '#e0edff',
      haloColor: 'rgba(186, 215, 255, ',
      coreSize: 2.8,
      temperature: '9,602 K'
    },
    {
      name: '天狼星 (Sirius)',
      bayer: 'α Canis Majoris',
      spectral: 'A1V 纯白恒星',
      distance: '8.60 ly',
      color: '#ffffff',
      haloColor: 'rgba(255, 255, 255, ',
      coreSize: 3.2,
      temperature: '9,940 K'
    },
    {
      name: '参宿七 (Rigel)',
      bayer: 'β Orionis',
      spectral: 'B8Ia 蓝超巨星',
      distance: '860 ly',
      color: '#bfdbfe',
      haloColor: 'rgba(147, 197, 253, ',
      coreSize: 3.0,
      temperature: '12,100 K'
    },
    {
      name: '参宿四 (Betelgeuse)',
      bayer: 'α Orionis',
      spectral: 'M1-2Ia-ab 红超巨星',
      distance: '642.5 ly',
      color: '#fed7aa',
      haloColor: 'rgba(251, 146, 60, ',
      coreSize: 3.1,
      temperature: '3,500 K'
    },
    {
      name: '河鼓二 (Altair)',
      bayer: 'α Aquilae',
      spectral: 'A7V 快速自转星',
      distance: '16.73 ly',
      color: '#f1f5f9',
      haloColor: 'rgba(241, 245, 249, ',
      coreSize: 2.5,
      temperature: '7,700 K'
    },
    {
      name: '天津四 (Deneb)',
      bayer: 'α Cygni',
      spectral: 'A2Ia 白超巨星',
      distance: '2,615 ly',
      color: '#e2e8f0',
      haloColor: 'rgba(226, 232, 240, ',
      coreSize: 2.7,
      temperature: '8,525 K'
    },
    {
      name: '大角星 (Arcturus)',
      bayer: 'α Boötis',
      spectral: 'K0III 橙巨星',
      distance: '36.7 ly',
      color: '#fef08a',
      haloColor: 'rgba(250, 204, 21, ',
      coreSize: 2.9,
      temperature: '4,286 K'
    },
    {
      name: '心宿二 (Antares)',
      bayer: 'α Scorpii',
      spectral: 'M1.5Iab 巨型红星',
      distance: '550 ly',
      color: '#fca5a5',
      haloColor: 'rgba(239, 68, 68, ',
      coreSize: 3.0,
      temperature: '3,400 K'
    },
    {
      name: '勾陈一 (Polaris)',
      bayer: 'α Ursae Minoris',
      spectral: 'F7Ib 经典造父变星',
      distance: '433 ly',
      color: '#fef9c3',
      haloColor: 'rgba(254, 240, 138, ',
      coreSize: 2.6,
      temperature: '6,015 K'
    },
    {
      name: '角宿一 (Spica)',
      bayer: 'α Virginis',
      spectral: 'B1III-IV 蓝巨双星',
      distance: '250 ly',
      color: '#c7d2fe',
      haloColor: 'rgba(165, 180, 252, ',
      coreSize: 2.7,
      temperature: '25,300 K'
    },
    {
      name: '毕宿五 (Aldebaran)',
      bayer: 'α Tauri',
      spectral: 'K5+III 橙红巨星',
      distance: '65.3 ly',
      color: '#fdba74',
      haloColor: 'rgba(249, 115, 22, ',
      coreSize: 2.8,
      temperature: '3,910 K'
    },
    {
      name: '北落师门 (Fomalhaut)',
      bayer: 'α Piscis Austrini',
      spectral: 'A3V 尘埃环蓝星',
      distance: '25.13 ly',
      color: '#e0f2fe',
      haloColor: 'rgba(186, 230, 253, ',
      coreSize: 2.6,
      temperature: '8,590 K'
    }
  ];

  // Celestial Spectral Palettes
  const CELESTIAL_PALETTES = {
    cobalt: {
      id: 'cobalt',
      name: '深空钴蓝',
      bg: '#03050c',
      accent: '#38bdf8',
      nebulae: [
        { r: 14, g: 30, b: 65 },
        { r: 20, g: 15, b: 45 },
        { r: 10, g: 35, b: 50 },
        { r: 8,  g: 22, b: 52 }
      ],
      linkColor: 'rgba(186, 230, 253, '
    },
    vega: {
      id: 'vega',
      name: '织女冰白',
      bg: '#040712',
      accent: '#e0edff',
      nebulae: [
        { r: 18, g: 24, b: 48 },
        { r: 28, g: 36, b: 60 },
        { r: 12, g: 20, b: 38 },
        { r: 35, g: 42, b: 70 }
      ],
      linkColor: 'rgba(224, 237, 255, '
    },
    nebula: {
      id: 'nebula',
      name: '星云秘紫',
      bg: '#06040e',
      accent: '#c084fc',
      nebulae: [
        { r: 38, g: 14, b: 60 },
        { r: 20, g: 10, b: 45 },
        { r: 50, g: 18, b: 70 },
        { r: 18, g: 12, b: 35 }
      ],
      linkColor: 'rgba(216, 180, 254, '
    },
    amber: {
      id: 'amber',
      name: '猎户赤金',
      bg: '#080503',
      accent: '#fbbf24',
      nebulae: [
        { r: 55, g: 28, b: 10 },
        { r: 40, g: 18, b: 8 },
        { r: 60, g: 35, b: 15 },
        { r: 30, g: 14, b: 6 }
      ],
      linkColor: 'rgba(253, 224, 71, '
    },
    aurora: {
      id: 'aurora',
      name: '极光幽绿',
      bg: '#020906',
      accent: '#34d399',
      nebulae: [
        { r: 10, g: 45, b: 30 },
        { r: 6,  g: 30, b: 20 },
        { r: 15, g: 55, b: 38 },
        { r: 8,  g: 22, b: 18 }
      ],
      linkColor: 'rgba(110, 231, 183, '
    }
  };

  // ==========================================================================
  // 2. Space Audio Synthesizer (Serene Ambient Drone & Chimes)
  // ==========================================================================

  class CosmicAudio {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.filter = null;
      this.isEnabled = false;
      this.isInitialized = false;
    }

    init() {
      if (this.isInitialized) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      try {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        this.filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        // Low Sub-bass drone (55Hz / 55.4Hz subtle binaural frequency)
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = 'sine';
        this.droneOsc2.frequency.setValueAtTime(55.35, this.ctx.currentTime);

        const droneGain = this.ctx.createGain();
        droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        this.droneOsc1.connect(droneGain);
        this.droneOsc2.connect(droneGain);
        droneGain.connect(this.filter);
        this.filter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.droneOsc1.start();
        this.droneOsc2.start();
        this.isInitialized = true;
      } catch (e) {
        console.warn('AudioContext initialization deferred:', e);
      }
    }

    toggle() {
      if (!this.isInitialized) this.init();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isEnabled = !this.isEnabled;
      const targetGain = this.isEnabled ? 0.22 : 0.0001;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), this.ctx.currentTime + 1.2);
      return this.isEnabled;
    }

    playMeteorChime() {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();

        chimeOsc.type = 'sine';
        const startFreq = 880 + Math.random() * 440;
        chimeOsc.frequency.setValueAtTime(startFreq, now);
        chimeOsc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 1.2);

        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.filter);

        chimeOsc.start(now);
        chimeOsc.stop(now + 2.6);
      } catch (e) {
        // Safe failover
      }
    }

    playRippleChime() {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(165, now + 0.8);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.filter);

        osc.start(now);
        osc.stop(now + 1.0);
      } catch (e) {
        // Safe failover
      }
    }
  }

  // ==========================================================================
  // 3. Mathematical Helpers & Interpolation
  // ==========================================================================

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // ==========================================================================
  // 4. Cosmos Engine Architecture
  // ==========================================================================

  class CosmosEngine {
    constructor() {
      this.canvas = document.getElementById('spaceCanvas');
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.audio = new CosmicAudio();
      this.currentPalette = 'cobalt';
      this.palette = CELESTIAL_PALETTES.cobalt;

      // State & Parameters
      this.params = {
        timeScale: 1.0,
        affinity: 1.0,
        gravity: 1.0,
        nebulaAlpha: 0.55,
        showLabels: true,
        energyPulse: true,
        autoWander: true
      };

      // Pointer & Gravitational Perturbation
      this.pointer = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        targetX: this.width * 0.5,
        targetY: this.height * 0.5,
        vx: 0,
        vy: 0,
        isHovered: false,
        isActive: false,
        lastMoveTime: performance.now()
      };

      // Cosmic Waves (Ripples on click)
      this.ripples = [];

      // Meteor Event Queue
      this.meteors = [];
      this.nextMeteorTime = performance.now() + 8000;

      // Entities
      this.bgStars = [];
      this.midStars = [];
      this.majorStars = [];
      this.activeLinks = [];
      this.energyPulses = [];

      // Procedural Nebulae
      this.nebulae = [];

      // Animation & Timing
      this.lastTime = performance.now();
      this.globalTime = 0;
      this.rafId = null;
      this.isRunning = true;

      // Selected Star for Telemetry
      this.focusedStar = null;

      this.initDomElements();
      this.bindEvents();
      this.resize();
      this.initEntities();
      this.startLoop();
    }

    initDomElements() {
      this.dom = {
        controlDock: document.getElementById('controlDock'),
        btnToggleHud: document.getElementById('btnToggleHud'),
        btnToggleAudio: document.getElementById('btnToggleAudio'),
        audioIcon: document.getElementById('audioIcon'),
        audioLabel: document.getElementById('audioLabel'),
        btnSpawnMeteor: document.getElementById('btnSpawnMeteor'),
        btnRecluster: document.getElementById('btnRecluster'),
        btnStarWander: document.getElementById('btnStarWander'),
        wanderLabel: document.getElementById('wanderLabel'),
        btnResetParams: document.getElementById('btnResetParams'),
        paletteChips: Array.from(document.querySelectorAll('.palette-chip')),
        paramAffinity: document.getElementById('paramAffinity'),
        valAffinity: document.getElementById('valAffinity'),
        paramTimeScale: document.getElementById('paramTimeScale'),
        valTimeScale: document.getElementById('valTimeScale'),
        paramGravity: document.getElementById('paramGravity'),
        valGravity: document.getElementById('valGravity'),
        paramNebula: document.getElementById('paramNebula'),
        valNebula: document.getElementById('valNebula'),
        checkShowLabels: document.getElementById('checkShowLabels'),
        checkEnergyPulse: document.getElementById('checkEnergyPulse'),
        cosmicTelemetry: document.getElementById('cosmicTelemetry'),
        telemetryHeadline: document.getElementById('telemetryHeadline'),
        telemetryMeta: document.getElementById('telemetryMeta'),
        starTooltip: document.getElementById('starTooltip'),
        starTooltipName: document.getElementById('starTooltipName'),
        starTooltipType: document.getElementById('starTooltipType'),
        starTooltipLinks: document.getElementById('starTooltipLinks')
      };
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize());

      // Visibility Change (Pause/Resume loop to protect battery)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isRunning = false;
        } else {
          this.isRunning = true;
          this.lastTime = performance.now();
          this.startLoop();
        }
      });

      // Pointer tracking
      const updatePointer = (clientX, clientY, isDown = false) => {
        this.pointer.targetX = clientX;
        this.pointer.targetY = clientY;
        this.pointer.isHovered = true;
        this.pointer.isActive = isDown;
        this.pointer.lastMoveTime = performance.now();
      };

      window.addEventListener('pointermove', (e) => {
        updatePointer(e.clientX, e.clientY, e.buttons > 0);
      });

      window.addEventListener('pointerdown', (e) => {
        // Trigger audio initialization on gesture
        this.audio.init();

        // Check if clicking inside control dock or buttons
        if (e.target.closest('#controlDock') || e.target.closest('.hud-actions') || e.target.closest('.hud-brand')) return;

        updatePointer(e.clientX, e.clientY, true);
        this.emitGravitationalWave(e.clientX, e.clientY);
      });

      window.addEventListener('pointerup', () => {
        this.pointer.isActive = false;
      });

      window.addEventListener('pointerleave', () => {
        this.pointer.isHovered = false;
      });

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
          this.toggleDock();
        } else if (e.key === 'm' || e.key === 'M') {
          this.spawnMeteor();
        } else if (e.key === 'r' || e.key === 'R') {
          this.reclusterConstellations();
        }
      });

      // UI Controls
      if (this.dom.btnToggleHud) {
        this.dom.btnToggleHud.addEventListener('click', () => this.toggleDock());
      }

      if (this.dom.btnToggleAudio) {
        this.dom.btnToggleAudio.addEventListener('click', () => {
          const enabled = this.audio.toggle();
          if (this.dom.audioIcon) this.dom.audioIcon.textContent = enabled ? '🔊' : '🔈';
          if (this.dom.audioLabel) this.dom.audioLabel.textContent = enabled ? '宇宙微音: 开' : '宇宙微音: 关';
          this.dom.btnToggleAudio.classList.toggle('active', enabled);
        });
      }

      if (this.dom.btnSpawnMeteor) {
        this.dom.btnSpawnMeteor.addEventListener('click', () => {
          this.spawnMeteor();
        });
      }

      if (this.dom.btnRecluster) {
        this.dom.btnRecluster.addEventListener('click', () => {
          this.reclusterConstellations();
        });
      }

      if (this.dom.btnStarWander) {
        this.dom.btnStarWander.addEventListener('click', () => {
          this.params.autoWander = !this.params.autoWander;
          if (this.dom.wanderLabel) {
            this.dom.wanderLabel.textContent = `慢速漫游: ${this.params.autoWander ? '开' : '关'}`;
          }
          this.dom.btnStarWander.classList.toggle('active', this.params.autoWander);
        });
      }

      // Palette Switching
      this.dom.paletteChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const key = chip.dataset.palette;
          if (key && CELESTIAL_PALETTES[key]) {
            this.setPalette(key);
          }
        });
      });

      // Sliders
      if (this.dom.paramAffinity) {
        this.dom.paramAffinity.addEventListener('input', (e) => {
          this.params.affinity = parseFloat(e.target.value);
          const val = this.params.affinity;
          if (this.dom.valAffinity) {
            this.dom.valAffinity.textContent = val < 0.8 ? '稀疏' : val > 1.3 ? '致密' : '平衡';
          }
        });
      }

      if (this.dom.paramTimeScale) {
        this.dom.paramTimeScale.addEventListener('input', (e) => {
          this.params.timeScale = parseFloat(e.target.value);
          if (this.dom.valTimeScale) {
            this.dom.valTimeScale.textContent = `${this.params.timeScale.toFixed(1)}x`;
          }
        });
      }

      if (this.dom.paramGravity) {
        this.dom.paramGravity.addEventListener('input', (e) => {
          this.params.gravity = parseFloat(e.target.value);
          const val = this.params.gravity;
          if (this.dom.valGravity) {
            this.dom.valGravity.textContent = val < 0.6 ? '微弱' : val > 1.4 ? '显著' : '柔和';
          }
        });
      }

      if (this.dom.paramNebula) {
        this.dom.paramNebula.addEventListener('input', (e) => {
          this.params.nebulaAlpha = parseFloat(e.target.value);
          const val = this.params.nebulaAlpha;
          if (this.dom.valNebula) {
            this.dom.valNebula.textContent = val < 0.2 ? '极淡' : val > 0.7 ? '浓厚' : '适度';
          }
        });
      }

      if (this.dom.checkShowLabels) {
        this.dom.checkShowLabels.addEventListener('change', (e) => {
          this.params.showLabels = e.target.checked;
        });
      }

      if (this.dom.checkEnergyPulse) {
        this.dom.checkEnergyPulse.addEventListener('change', (e) => {
          this.params.energyPulse = e.target.checked;
        });
      }

      if (this.dom.btnResetParams) {
        this.dom.btnResetParams.addEventListener('click', () => this.resetParams());
      }
    }

    setPalette(key) {
      if (!CELESTIAL_PALETTES[key]) return;
      this.currentPalette = key;
      this.palette = CELESTIAL_PALETTES[key];

      // Update active chip state
      this.dom.paletteChips.forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.palette === key);
      });

      // Update CSS Variables for HUD accents & document background
      document.documentElement.style.setProperty('--accent-cyan', this.palette.accent);
      document.documentElement.style.setProperty('--bg-deep', this.palette.bg);

      // Re-seed nebulas with new palette hues
      this.initNebulae();
    }

    toggleDock() {
      if (this.dom.controlDock) {
        this.dom.controlDock.classList.toggle('hidden');
      }
    }

    resetParams() {
      this.params.timeScale = 1.0;
      this.params.affinity = 1.0;
      this.params.gravity = 1.0;
      this.params.nebulaAlpha = 0.55;
      this.params.showLabels = true;
      this.params.energyPulse = true;
      this.params.autoWander = true;

      if (this.dom.paramAffinity) {
        this.dom.paramAffinity.value = '1.0';
        if (this.dom.valAffinity) this.dom.valAffinity.textContent = '平衡';
      }
      if (this.dom.paramTimeScale) {
        this.dom.paramTimeScale.value = '1.0';
        if (this.dom.valTimeScale) this.dom.valTimeScale.textContent = '1.0x';
      }
      if (this.dom.paramGravity) {
        this.dom.paramGravity.value = '1.0';
        if (this.dom.valGravity) this.dom.valGravity.textContent = '柔和';
      }
      if (this.dom.paramNebula) {
        this.dom.paramNebula.value = '0.55';
        if (this.dom.valNebula) this.dom.valNebula.textContent = '适度';
      }
      if (this.dom.checkShowLabels) this.dom.checkShowLabels.checked = true;
      if (this.dom.checkEnergyPulse) this.dom.checkEnergyPulse.checked = true;
      if (this.dom.wanderLabel) this.dom.wanderLabel.textContent = '慢速漫游: 开';
      if (this.dom.btnStarWander) this.dom.btnStarWander.classList.add('active');

      this.setPalette('cobalt');
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(this.dpr, this.dpr);

      // Re-seed nebulas to match responsive dimensions
      this.initNebulae();
    }

    initNebulae() {
      this.nebulae = [];
      const count = 4;
      const hues = this.palette.nebulae;

      for (let i = 0; i < count; i++) {
        const x = (0.2 + 0.6 * (i / (count - 1))) * this.width + (Math.random() - 0.5) * 200;
        const y = (0.25 + 0.5 * Math.random()) * this.height;
        const radius = Math.max(this.width, this.height) * (0.35 + Math.random() * 0.25);
        this.nebulae.push({
          x,
          y,
          baseX: x,
          baseY: y,
          radius,
          color: hues[i % hues.length],
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.00015 + Math.random() * 0.0002
        });
      }
    }

    initEntities() {
      const isMobile = this.width < 768;

      // 1. Deep Background Stars (Far Field: dense, tiny, stable)
      const bgCount = isMobile ? 90 : 180;
      this.bgStars = [];
      for (let i = 0; i < bgCount; i++) {
        this.bgStars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 0.4 + Math.random() * 0.6,
          baseAlpha: 0.12 + Math.random() * 0.35,
          twinkleSpeed: 0.001 + Math.random() * 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          z: 0.1 + Math.random() * 0.25
        });
      }

      // 2. Midground Stars (Participate in organic linkages & subtle drift)
      const midCount = isMobile ? 32 : 65;
      this.midStars = [];
      for (let i = 0; i < midCount; i++) {
        this.midStars.push({
          id: `mid_${i}`,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          origX: 0,
          origY: 0,
          radius: 0.9 + Math.random() * 0.7,
          alpha: 0.35 + Math.random() * 0.45,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          phase: Math.random() * Math.PI * 2,
          wanderFactor: 0.0004 + Math.random() * 0.0006,
          connections: 0,
          z: 0.45 + Math.random() * 0.25,
          color: Math.random() > 0.4 ? '#e2e8f0' : '#bae6fd'
        });
      }

      // 3. Major Anchor Stars (Named prominent celestial bodies)
      const majorCount = isMobile ? 7 : 11;
      this.majorStars = [];

      const padding = 100;
      const stepX = (this.width - padding * 2) / (majorCount * 0.7);
      const stepY = (this.height - padding * 2) / 3;

      for (let i = 0; i < majorCount; i++) {
        const catalogData = MAJOR_STAR_CATALOG[i % MAJOR_STAR_CATALOG.length];
        const col = i % 4;
        const row = Math.floor(i / 4);

        const x = padding + (col + 0.3 + (Math.random() - 0.5) * 0.4) * stepX;
        const y = padding + (row + 0.4 + (Math.random() - 0.5) * 0.4) * stepY;

        this.majorStars.push({
          ...catalogData,
          id: `major_${i}`,
          x: clamp(x, padding, this.width - padding),
          y: clamp(y, padding, this.height - padding),
          origX: x,
          origY: y,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          phase: Math.random() * Math.PI * 2,
          pulseCycle: Math.random() * Math.PI * 2,
          flareIntensity: 0,
          activeDegree: 0,
          z: 0.85
        });
      }

      // Initial Constellation Graph Building
      this.reclusterConstellations();

      // Focus first prominent star
      if (this.majorStars.length > 0) {
        this.updateTelemetry(this.majorStars[0]);
      }
    }

    reclusterConstellations() {
      // Re-evaluate links: Form graceful asterisms
      this.activeLinks = [];

      const maxLinkDist = Math.min(this.width, this.height) * (this.width < 768 ? 0.32 : 0.24) * this.params.affinity;
      const allConnectable = [...this.majorStars, ...this.midStars];

      // Reset degrees
      allConnectable.forEach((s) => (s.connections = 0));

      for (let i = 0; i < allConnectable.length; i++) {
        const starA = allConnectable[i];
        const candidates = [];

        for (let j = i + 1; j < allConnectable.length; j++) {
          const starB = allConnectable[j];
          const d = dist(starA.x, starA.y, starB.x, starB.y);

          if (d < maxLinkDist) {
            // Prioritize links between major anchors or major-to-mid
            let weight = 1.0;
            if (starA.spectral && starB.spectral) weight = 0.65;
            else if (starA.spectral || starB.spectral) weight = 0.85;

            candidates.push({ target: starB, distance: d * weight, rawDist: d });
          }
        }

        candidates.sort((a, b) => a.distance - b.distance);
        const maxDegree = starA.spectral ? 3 : 2;

        for (let k = 0; k < candidates.length && starA.connections < maxDegree; k++) {
          const { target, rawDist } = candidates[k];
          if (target.connections < (target.spectral ? 3 : 2)) {
            starA.connections++;
            target.connections++;

            this.activeLinks.push({
              from: starA,
              to: target,
              maxDist: maxLinkDist,
              length: rawDist,
              currentAlpha: 0,
              targetAlpha: 0.15 + (1 - rawDist / maxLinkDist) * 0.45,
              phase: Math.random() * Math.PI * 2,
              pulseCooldown: performance.now() + Math.random() * 4000
            });
          }
        }
      }
    }

    emitGravitationalWave(x, y) {
      this.ripples.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.min(this.width, this.height) * 0.45,
        alpha: 0.6,
        speed: 3.5,
        decay: 0.985
      });
      this.audio.playRippleChime();

      let closestStar = null;
      let minD = Infinity;
      [...this.majorStars, ...this.midStars].forEach((s) => {
        const d = dist(x, y, s.x, s.y);
        if (d < minD) {
          minD = d;
          closestStar = s;
        }
      });

      if (closestStar && minD < 200 && closestStar.flareIntensity !== undefined) {
        closestStar.flareIntensity = 1.0;
      }
    }

    spawnMeteor() {
      const startX = Math.random() * (this.width * 0.85);
      const startY = -40;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
      const speed = 14 + Math.random() * 8;
      const length = 180 + Math.random() * 120;

      this.meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length,
        alpha: 1.0,
        headRadius: 1.6 + Math.random() * 0.8,
        color: Math.random() > 0.3 ? '#bae6fd' : '#ffffff',
        tailColor: 'rgba(186, 230, 253, ',
        age: 0,
        maxAge: 45 + Math.random() * 25
      });

      this.audio.playMeteorChime();
      this.nextMeteorTime = performance.now() + 18000 + Math.random() * 20000;
    }

    updateTelemetry(star) {
      this.focusedStar = star;
      if (this.dom.telemetryHeadline) {
        this.dom.telemetryHeadline.textContent = `${star.name} · ${star.bayer}`;
      }
      if (this.dom.telemetryMeta) {
        this.dom.telemetryMeta.textContent = `${star.spectral} · 距离 ${star.distance} · 温度 ${star.temperature}`;
      }
    }

    // ========================================================================
    // 5. Physics & Dynamic State Update
    // ========================================================================

    update(dt) {
      const scaledDt = dt * this.params.timeScale;
      this.globalTime += scaledDt * 0.001;

      // 1. Smooth Pointer Interpolation (Lerp)
      const pointerLerpFactor = 0.12;
      this.pointer.vx = (this.pointer.targetX - this.pointer.x) * pointerLerpFactor;
      this.pointer.vy = (this.pointer.targetY - this.pointer.y) * pointerLerpFactor;
      this.pointer.x += this.pointer.vx;
      this.pointer.y += this.pointer.vy;

      // 2. Gravitational Wave Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.speed * (scaledDt / 16.6);
        r.alpha *= Math.pow(r.decay, scaledDt / 16.6);
        if (r.alpha < 0.02 || r.radius > r.maxRadius) {
          this.ripples.splice(i, 1);
        }
      }

      // 3. Autonomous Meteor Spawning
      if (performance.now() > this.nextMeteorTime) {
        this.spawnMeteor();
      }

      // 4. Update Meteors
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += m.vx * (scaledDt / 16.6);
        m.y += m.vy * (scaledDt / 16.6);
        m.age += scaledDt / 16.6;
        m.alpha = 1.0 - m.age / m.maxAge;

        if (m.age >= m.maxAge || m.y > this.height + 100 || m.x > this.width + 100) {
          this.meteors.splice(i, 1);
        }
      }

      // 5. Background Stars subtle motion & twinkling
      this.bgStars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed * scaledDt;
        star.x += star.vx * (scaledDt / 16.6);
        star.y += star.vy * (scaledDt / 16.6);

        if (star.x < 0) star.x = this.width;
        else if (star.x > this.width) star.x = 0;
        if (star.y < 0) star.y = this.height;
        else if (star.y > this.height) star.y = 0;
      });

      // 6. Midground Stars & Major Stars Physics Simulation
      const allDynamicStars = [...this.majorStars, ...this.midStars];
      const gravRadius = 180 * this.params.gravity;
      const gravForce = 0.035 * this.params.gravity;

      let hoveredAnchor = null;

      allDynamicStars.forEach((star) => {
        // Natural Lissajous / Perlin-like slow organic wandering
        if (this.params.autoWander) {
          star.phase += 0.0006 * scaledDt;
          const wanderX = Math.sin(star.phase * 0.7) * 0.25;
          const wanderY = Math.cos(star.phase * 0.5) * 0.25;
          star.x += wanderX * (scaledDt / 16.6);
          star.y += wanderY * (scaledDt / 16.6);
        }

        // Pointer Gravitational Attract/Repel Soft Drift
        if (this.pointer.isHovered && this.params.gravity > 0) {
          const d = dist(this.pointer.x, this.pointer.y, star.x, star.y);
          if (d < gravRadius && d > 2) {
            const factor = (1 - d / gravRadius);
            const angle = Math.atan2(this.pointer.y - star.y, this.pointer.x - star.x);
            // Gentle orbital/gravitational pull
            const pull = factor * gravForce * (star.spectral ? 0.4 : 0.8);
            star.x += Math.cos(angle) * pull * (scaledDt / 16.6);
            star.y += Math.sin(angle) * pull * (scaledDt / 16.6);

            // Check tooltip hover
            if (d < 35 && star.spectral) {
              hoveredAnchor = star;
            }
          }
        }

        // Soft boundaries damping
        const margin = 40;
        if (star.x < margin) star.x += 0.2;
        else if (star.x > this.width - margin) star.x -= 0.2;
        if (star.y < margin) star.y += 0.2;
        else if (star.y > this.height - margin) star.y -= 0.2;

        // Flare decay on major stars
        if (star.flareIntensity > 0) {
          star.flareIntensity = Math.max(0, star.flareIntensity - 0.015 * (scaledDt / 16.6));
        }
      });

      // Update Tooltip Display
      if (hoveredAnchor) {
        this.showTooltip(hoveredAnchor);
        if (this.focusedStar !== hoveredAnchor) {
          this.updateTelemetry(hoveredAnchor);
        }
      } else {
        this.hideTooltip();
      }

      // 7. Update Active Link Lifecycles & Photon Pulses
      const now = performance.now();
      const maxDist = Math.min(this.width, this.height) * (this.width < 768 ? 0.32 : 0.24) * this.params.affinity;

      for (let i = this.activeLinks.length - 1; i >= 0; i--) {
        const link = this.activeLinks[i];
        const currentD = dist(link.from.x, link.from.y, link.to.x, link.to.y);

        if (currentD > maxDist * 1.15) {
          link.currentAlpha -= 0.01 * (scaledDt / 16.6);
          if (link.currentAlpha <= 0) {
            link.from.connections = Math.max(0, link.from.connections - 1);
            link.to.connections = Math.max(0, link.to.connections - 1);
            this.activeLinks.splice(i, 1);
            continue;
          }
        } else {
          link.targetAlpha = 0.12 + (1 - currentD / maxDist) * 0.4;
          link.currentAlpha = lerp(link.currentAlpha, link.targetAlpha, 0.04 * (scaledDt / 16.6));
        }

        // Spontaneous subtle photon pulse across star lines
        if (this.params.energyPulse && now > link.pulseCooldown && link.currentAlpha > 0.25) {
          if (Math.random() < 0.08) {
            this.energyPulses.push({
              link: link,
              progress: 0,
              speed: 0.008 + Math.random() * 0.006,
              alpha: 0.8
            });
            link.pulseCooldown = now + 4000 + Math.random() * 6000;
          }
        }
      }

      // 8. Update Energy Pulses
      for (let i = this.energyPulses.length - 1; i >= 0; i--) {
        const p = this.energyPulses[i];
        p.progress += p.speed * (scaledDt / 16.6);
        if (p.progress >= 1) {
          this.energyPulses.splice(i, 1);
        }
      }
    }

    showTooltip(star) {
      if (!this.dom.starTooltip) return;
      this.dom.starTooltip.classList.add('visible');
      this.dom.starTooltip.style.left = `${star.x}px`;
      this.dom.starTooltip.style.top = `${star.y}px`;
      if (this.dom.starTooltipName) this.dom.starTooltipName.textContent = star.name;
      if (this.dom.starTooltipType) this.dom.starTooltipType.textContent = `${star.spectral} · 光度等级`;
      if (this.dom.starTooltipLinks) this.dom.starTooltipLinks.textContent = `活跃连接: ${star.connections || 0} 条星座线`;
    }

    hideTooltip() {
      if (this.dom.starTooltip) {
        this.dom.starTooltip.classList.remove('visible');
      }
    }

    // ========================================================================
    // 6. High Fidelity Graphical Rendering
    // ========================================================================

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // 1. Clear Deep Space Canvas
      ctx.fillStyle = this.palette.bg;
      ctx.fillRect(0, 0, w, h);

      // 2. Procedural Deep Nebulae Fog Layers
      if (this.params.nebulaAlpha > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        this.nebulae.forEach((neb) => {
          neb.driftPhase += neb.driftSpeed * this.params.timeScale;
          const curX = neb.baseX + Math.sin(neb.driftPhase) * 60;
          const curY = neb.baseY + Math.cos(neb.driftPhase * 0.8) * 45;

          const grad = ctx.createRadialGradient(curX, curY, neb.radius * 0.05, curX, curY, neb.radius);
          const baseAlpha = 0.07 * this.params.nebulaAlpha;
          grad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${baseAlpha * 1.5})`);
          grad.addColorStop(0.45, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${baseAlpha * 0.7})`);
          grad.addColorStop(1, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, neb.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 3. Gravitational Wave Ripples
      if (this.ripples.length > 0) {
        ctx.save();
        this.ripples.forEach((r) => {
          ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha * 0.35})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. Background Far-Field Stars
      ctx.save();
      this.bgStars.forEach((star) => {
        const twinkle = 0.6 + 0.4 * Math.sin(star.twinklePhase);
        const alpha = star.baseAlpha * twinkle;
        ctx.fillStyle = `rgba(224, 237, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Constellation Lines
      if (this.activeLinks.length > 0) {
        ctx.save();
        this.activeLinks.forEach((link) => {
          if (link.currentAlpha <= 0.01) return;

          const grad = ctx.createLinearGradient(link.from.x, link.from.y, link.to.x, link.to.y);
          const col = this.palette.linkColor;
          grad.addColorStop(0, `${col} ${link.currentAlpha * 0.85})`);
          grad.addColorStop(0.5, `${col} ${link.currentAlpha * 0.4})`);
          grad.addColorStop(1, `${col} ${link.currentAlpha * 0.85})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(link.from.x, link.from.y);
          ctx.lineTo(link.to.x, link.to.y);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 6. Photon Pulses Flowing through Lines
      if (this.energyPulses.length > 0) {
        ctx.save();
        this.energyPulses.forEach((p) => {
          const startX = p.link.from.x;
          const startY = p.link.from.y;
          const endX = p.link.to.x;
          const endY = p.link.to.y;

          const px = lerp(startX, endX, p.progress);
          const py = lerp(startY, endY, p.progress);

          const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 6);
          pulseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          pulseGrad.addColorStop(0.5, `${this.palette.linkColor} 0.5)`);
          pulseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = pulseGrad;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 7. Midground Stars
      ctx.save();
      this.midStars.forEach((star) => {
        ctx.fillStyle = `rgba(203, 213, 225, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 8. Major Named Anchor Stars (Diffraction spikes, soft atmosphere halo, luminous core)
      ctx.save();
      this.majorStars.forEach((star) => {
        star.pulseCycle += 0.02 * this.params.timeScale;
        const breath = 0.85 + 0.15 * Math.sin(star.pulseCycle);
        const flare = star.flareIntensity || 0;
        const totalSize = star.coreSize * (breath + flare * 0.6);

        // Ambient Stellar Corona / Soft Halo
        const outerRadius = totalSize * (6.5 + flare * 4);
        const haloGrad = ctx.createRadialGradient(star.x, star.y, totalSize * 0.2, star.x, star.y, outerRadius);
        haloGrad.addColorStop(0, `${star.haloColor} ${0.45 + flare * 0.4})`);
        haloGrad.addColorStop(0.35, `${star.haloColor} ${0.15 + flare * 0.2})`);
        haloGrad.addColorStop(1, `${star.haloColor} 0)`);

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Optical Diffraction Cross Spike
        const spikeLen = totalSize * (3.8 + flare * 6);
        ctx.strokeStyle = `${star.haloColor} ${0.35 + flare * 0.45})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(star.x - spikeLen, star.y);
        ctx.lineTo(star.x + spikeLen, star.y);
        ctx.moveTo(star.x, star.y - spikeLen);
        ctx.lineTo(star.x, star.y + spikeLen);
        ctx.stroke();

        // Sharp Luminous Stellar Core
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, totalSize, 0, Math.PI * 2);
        ctx.fill();

        // Optional Star Label
        if (this.params.showLabels) {
          ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
          ctx.fillText(star.name.split(' ')[0], star.x + totalSize + 6, star.y + 3);
        }
      });
      ctx.restore();

      // 9. Render Meteors
      if (this.meteors.length > 0) {
        ctx.save();
        this.meteors.forEach((m) => {
          const headX = m.x;
          const headY = m.y;
          const tailAngle = Math.atan2(m.vy, m.vx);
          const tailX = headX - Math.cos(tailAngle) * m.length;
          const tailY = headY - Math.sin(tailAngle) * m.length;

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          grad.addColorStop(0, `${m.tailColor} 0)`);
          grad.addColorStop(0.7, `${m.tailColor} ${m.alpha * 0.35})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
          ctx.beginPath();
          ctx.arc(headX, headY, m.headRadius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 10. Pointer Gravitational Lens Indicator
      if (this.pointer.isHovered && this.params.showLabels && this.params.gravity > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.pointer.x, this.pointer.y, 44, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ========================================================================
    // 7. Core Loop Execution
    // ========================================================================

    startLoop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      const loop = (timestamp) => {
        if (!this.isRunning) return;

        const dt = Math.min(timestamp - this.lastTime, 64);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }
  }

  // Self-bootstrapping on DOM readiness
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CosmosEngine());
  } else {
    new CosmosEngine();
  }
})();

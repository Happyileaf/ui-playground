// LUMEN · Digital Studio Auth Engine
// Generative kinetic art, Web Audio haptics, and accessible form handling
(function () {
  'use strict';

  // =========================================================================
  // 1. Generative Kinetic Silk Wave Canvas (Living Ambient Art)
  // =========================================================================
  const canvas = document.getElementById('generativeCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animId = null;

  // Mouse physics with smooth Lerp
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false };

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    if (!mouse.isHovering) {
      mouse.x = mouse.targetX = width * 0.35;
      mouse.y = mouse.targetY = height * 0.5;
    }
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovering = true;
  });

  // Wave mathematical parameters
  let time = 0;
  const strands = [
    { count: 18, color: 'rgba(226, 177, 112, ', alphaBase: 0.18, freq: 0.003, speed: 0.012, amp: 75, phase: 0 },
    { count: 14, color: 'rgba(255, 255, 255, ', alphaBase: 0.09, freq: 0.004, speed: 0.009, amp: 95, phase: 1.8 },
    { count: 10, color: 'rgba(16, 185, 129, ', alphaBase: 0.08, freq: 0.0025, speed: 0.015, amp: 60, phase: 3.2 }
  ];

  function renderArt() {
    if (!ctx) return;

    // Smooth Lerp mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    ctx.clearRect(0, 0, width, height);

    // Subtle ambient gradient pool following cursor
    const poolGrad = ctx.createRadialGradient(mouse.x, mouse.y, 40, mouse.x, mouse.y, 520);
    poolGrad.addColorStop(0, 'rgba(226, 177, 112, 0.06)');
    poolGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
    poolGrad.addColorStop(1, 'rgba(9, 10, 15, 0)');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(0, 0, width, height);

    time += 0.016;

    // Render harmonic kinetic strands
    const centerY = height * 0.52;
    const influenceDist = 380;

    strands.forEach((strand) => {
      for (let i = 0; i < strand.count; i++) {
        const offset = (i / strand.count) * 60;
        const lineAlpha = strand.alphaBase * (1 - i / strand.count * 0.5);

        ctx.beginPath();
        ctx.strokeStyle = `${strand.color}${lineAlpha})`;
        ctx.lineWidth = 1.2;

        for (let x = 0; x <= width; x += 14) {
          // Base harmonic sine curves
          const nx = x * strand.freq;
          const baseSin = Math.sin(nx + time * strand.speed * 60 + strand.phase + i * 0.12);
          const harmonic = Math.cos(nx * 1.6 - time * strand.speed * 40);

          // Mouse gravitational warp
          const dx = x - mouse.x;
          const dist = Math.abs(dx);
          let warp = 0;
          if (dist < influenceDist) {
            const factor = 1 - dist / influenceDist;
            const curve = factor * factor * (3 - 2 * factor); // smoothstep
            warp = (mouse.y - centerY) * curve * 0.45;
          }

          const y = centerY + offset + (baseSin * strand.amp + harmonic * 25) + warp;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    });

    animId = requestAnimationFrame(renderArt);
  }

  resizeCanvas();
  renderArt();

  // =========================================================================
  // 2. Pure Web Audio Haptics (Precision Analog Micro-Clicks)
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playMicroClick() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.02);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {
      // Audio safety guard
    }
  }

  function playSuccessChord() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      // Elegant warm harmonic chord (E Major 9th: E4, G#4, B4, D#5)
      const freqs = [329.63, 415.30, 493.88, 622.25];

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const delay = idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.7);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.8);
      });
    } catch (e) {
      // Audio safety
    }
  }

  // Audio Toggle Button
  const audioToggle = document.getElementById('audioToggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      const onIcon = audioToggle.querySelector('.icon-audio-on');
      const offIcon = audioToggle.querySelector('.icon-audio-off');
      if (onIcon && offIcon) {
        onIcon.style.display = soundEnabled ? 'block' : 'none';
        offIcon.style.display = soundEnabled ? 'none' : 'block';
      }
      showToast(soundEnabled ? '已开启触感交互音效' : '已静音所有操作声效');
      if (soundEnabled) playMicroClick();
    });
  }

  // Toast System
  const lumenToast = document.getElementById('lumenToast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(text) {
    if (!lumenToast || !toastMsg) return;
    toastMsg.textContent = text;
    lumenToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      lumenToast.classList.remove('show');
    }, 2500);
  }

  // =========================================================================
  // 3. Tab Mode Switcher (Sign In / Sign Up)
  // =========================================================================
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const modeIndicator = document.getElementById('modeIndicator');
  const formSignIn = document.getElementById('formSignIn');
  const formSignUp = document.getElementById('formSignUp');

  function setMode(mode) {
    playMicroClick();
    clearAllErrors();
    if (mode === 'signin') {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('active');
      tabSignUp.setAttribute('aria-selected', 'false');

      if (modeIndicator) modeIndicator.style.transform = 'translateX(0%)';

      formSignIn.classList.add('active');
      formSignUp.classList.remove('active');
    } else {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'false');

      if (modeIndicator) modeIndicator.style.transform = 'translateX(100%)';

      formSignUp.classList.add('active');
      formSignIn.classList.remove('active');
    }
  }

  if (tabSignIn) tabSignIn.addEventListener('click', () => setMode('signin'));
  if (tabSignUp) tabSignUp.addEventListener('click', () => setMode('signup'));

  // Quick Preset Chips
  const presetDesigner = document.getElementById('presetDesigner');
  const presetEngineer = document.getElementById('presetEngineer');
  const signInEmail = document.getElementById('signInEmail');
  const signInPass = document.getElementById('signInPass');

  if (presetDesigner) {
    presetDesigner.addEventListener('click', () => {
      setMode('signin');
      signInEmail.value = 'clara.v@lumen.design';
      signInPass.value = 'AtelierLumen#2026';
      clearAllErrors();
      playMicroClick();
      showToast('已填入资深设计师凭证 Clara');
    });
  }

  if (presetEngineer) {
    presetEngineer.addEventListener('click', () => {
      setMode('signin');
      signInEmail.value = 'marcus.k@lumen.dev';
      signInPass.value = 'SystemsArchitect$88';
      clearAllErrors();
      playMicroClick();
      showToast('已填入工程总监凭证 Marcus');
    });
  }

  // =========================================================================
  // 4. Password Reveal Toggles
  // =========================================================================
  function bindPasswordToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';

      const eye = btn.querySelector('.icon-eye');
      const eyeOff = btn.querySelector('.icon-eye-off');
      if (eye && eyeOff) {
        eye.style.display = isPass ? 'none' : 'block';
        eyeOff.style.display = isPass ? 'block' : 'none';
      }
      playMicroClick();
    });
  }

  bindPasswordToggle('toggleSignInPass', 'signInPass');
  bindPasswordToggle('toggleSignUpPass', 'signUpPass');

  // Input typing sound
  const inputs = document.querySelectorAll('.field-input');
  inputs.forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' && e.key !== 'Shift') {
        playMicroClick();
      }
    });
  });

  // =========================================================================
  // 5. Password Spectrometer & Strength Meter
  // =========================================================================
  const signUpPass = document.getElementById('signUpPass');
  const meterFill = document.getElementById('meterFill');
  const strengthTag = document.getElementById('strengthTag');
  const ruleLen = document.getElementById('ruleLen');
  const ruleCase = document.getElementById('ruleCase');
  const ruleNum = document.getElementById('ruleNum');
  const ruleSym = document.getElementById('ruleSym');

  if (signUpPass) {
    signUpPass.addEventListener('input', () => {
      const val = signUpPass.value;
      const hasLen = val.length >= 8;
      const hasCase = /[a-z]/.test(val) && /[A-Z]/.test(val);
      const hasNum = /\d/.test(val);
      const hasSym = /[^A-Za-z0-9]/.test(val);

      if (ruleLen) ruleLen.classList.toggle('valid', hasLen);
      if (ruleCase) ruleCase.classList.toggle('valid', hasCase);
      if (ruleNum) ruleNum.classList.toggle('valid', hasNum);
      if (ruleSym) ruleSym.classList.toggle('valid', hasSym);

      const score = [hasLen, hasCase, hasNum, hasSym].filter(Boolean).length;
      const colors = ['#f43f5e', '#f59e0b', '#e2b170', '#10b981'];
      const labels = ['密码偏短', '基础安全', '良好加密', '至臻极密'];

      if (meterFill) {
        meterFill.style.width = `${(score / 4) * 100}%`;
        meterFill.style.backgroundColor = score > 0 ? colors[score - 1] : 'transparent';
      }

      if (strengthTag) {
        strengthTag.textContent = val.length === 0 ? '密码强度待输入' : labels[score - 1] || '尚未达标';
        strengthTag.style.color = score > 0 ? colors[score - 1] : 'var(--text-tertiary)';
      }
    });
  }

  // =========================================================================
  // 6. Form Validations & Submissions
  // =========================================================================
  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Modal Elements
  const modalSession = document.getElementById('modalSession');
  const closeSessionBtn = document.getElementById('closeSessionBtn');
  const btnGoDashboard = document.getElementById('btnGoDashboard');
  const sessionStatusText = document.getElementById('sessionStatusText');
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionDesc = document.getElementById('sessionDesc');
  const passEmail = document.getElementById('passEmail');
  const passToken = document.getElementById('passToken');
  const passRole = document.getElementById('passRole');

  // 1. Submit Sign In
  const btnSignInSubmit = document.getElementById('btnSignInSubmit');
  if (formSignIn) {
    formSignIn.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors();
      let hasError = false;

      const email = signInEmail.value.trim();
      const pass = signInPass.value;

      if (!email) {
        document.getElementById('signInEmailErr').textContent = '请输入您的工作邮箱或账号';
        hasError = true;
      } else if (!validateEmail(email)) {
        document.getElementById('signInEmailErr').textContent = '请输入格式规范的邮箱地址（如 name@studio.com）';
        hasError = true;
      }

      if (!pass) {
        document.getElementById('signInPassErr').textContent = '请输入账号密码';
        hasError = true;
      } else if (pass.length < 6) {
        document.getElementById('signInPassErr').textContent = '密码长度至少需为 6 位';
        hasError = true;
      }

      if (hasError) {
        playMicroClick();
        return;
      }

      btnSignInSubmit.classList.add('loading');
      playMicroClick();

      setTimeout(() => {
        btnSignInSubmit.classList.remove('loading');
        playSuccessChord();

        if (sessionStatusText) sessionStatusText.textContent = 'AUTHENTICATION GRANTED';
        if (sessionTitle) sessionTitle.textContent = '安全验证完成，欢迎返回 LUMEN';
        if (sessionDesc) sessionDesc.textContent = `已为账户 ${email} 签署当前工作站的高清创作会话。`;
        if (passEmail) passEmail.textContent = email;
        if (passToken) passToken.textContent = `LMN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        if (passRole) passRole.textContent = email.includes('marcus') ? 'ENGINEERING DIRECTOR' : 'SENIOR ATELIER DESIGNER';

        if (modalSession && typeof modalSession.showModal === 'function') {
          modalSession.showModal();
        }
      }, 700);
    });
  }

  // 2. Submit Sign Up
  const btnSignUpSubmit = document.getElementById('btnSignUpSubmit');
  const signUpName = document.getElementById('signUpName');
  const signUpEmail = document.getElementById('signUpEmail');
  const agreeCharter = document.getElementById('agreeCharter');

  if (formSignUp) {
    formSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors();
      let hasError = false;

      const name = signUpName.value.trim();
      const email = signUpEmail.value.trim();
      const pass = signUpPass.value;
      const agreed = agreeCharter ? agreeCharter.checked : true;

      if (!name) {
        document.getElementById('signUpNameErr').textContent = '请输入创作者姓名或工作代号';
        hasError = true;
      }

      if (!email) {
        document.getElementById('signUpEmailErr').textContent = '请输入登记邮箱';
        hasError = true;
      } else if (!validateEmail(email)) {
        document.getElementById('signUpEmailErr').textContent = '邮箱格式不规范，请核对后重试';
        hasError = true;
      }

      if (!pass) {
        document.getElementById('signUpPassErr').textContent = '请设定安全密码';
        hasError = true;
      } else if (pass.length < 8) {
        document.getElementById('signUpPassErr').textContent = '密码需至少达到 8 位长度';
        hasError = true;
      }

      if (!agreed) {
        showToast('请阅读并确认遵守《LUMEN 数字工作室准则》');
        hasError = true;
      }

      if (hasError) {
        playMicroClick();
        return;
      }

      btnSignUpSubmit.classList.add('loading');
      playMicroClick();

      setTimeout(() => {
        btnSignUpSubmit.classList.remove('loading');
        playSuccessChord();

        if (sessionStatusText) sessionStatusText.textContent = 'ATELIER INITIALIZED';
        if (sessionTitle) sessionTitle.textContent = `创作者空间已就绪，欢迎 ${name}`;
        if (sessionDesc) sessionDesc.textContent = '您的个人加密创意中枢配置完成，可立即开启组件化设计。';
        if (passEmail) passEmail.textContent = email;
        if (passToken) passToken.textContent = `INIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        if (passRole) passRole.textContent = 'STUDIO CREATOR';

        if (modalSession && typeof modalSession.showModal === 'function') {
          modalSession.showModal();
        }
      }, 800);
    });
  }

  // =========================================================================
  // 7. Modals Interactions (Recovery & Charter)
  // =========================================================================
  const modalRecovery = document.getElementById('modalRecovery');
  const btnForgotPass = document.getElementById('btnForgotPass');
  const closeRecoveryBtn = document.getElementById('closeRecoveryBtn');
  const formRecovery = document.getElementById('formRecovery');
  const recoveryEmail = document.getElementById('recoveryEmail');
  const recoveryEmailErr = document.getElementById('recoveryEmailErr');

  const modalCharter = document.getElementById('modalCharter');
  const btnOpenCharter = document.getElementById('btnOpenCharter');
  const closeCharterBtn = document.getElementById('closeCharterBtn');
  const btnAckCharter = document.getElementById('btnAckCharter');

  function closeAllModals() {
    [modalSession, modalRecovery, modalCharter].forEach((m) => {
      if (m && m.open) {
        m.close();
        playMicroClick();
      }
    });
  }

  if (closeSessionBtn) closeSessionBtn.addEventListener('click', closeAllModals);
  if (btnGoDashboard) {
    btnGoDashboard.addEventListener('click', () => {
      closeAllModals();
      showToast('正在为您无缝加载 LUMEN 实时协同画布...');
    });
  }

  if (btnForgotPass) {
    btnForgotPass.addEventListener('click', () => {
      playMicroClick();
      if (recoveryEmail) recoveryEmail.value = signInEmail.value || '';
      if (recoveryEmailErr) recoveryEmailErr.textContent = '';
      if (modalRecovery && typeof modalRecovery.showModal === 'function') {
        modalRecovery.showModal();
      }
    });
  }

  if (closeRecoveryBtn) closeRecoveryBtn.addEventListener('click', closeAllModals);

  if (formRecovery) {
    formRecovery.addEventListener('submit', (e) => {
      e.preventDefault();
      const mail = recoveryEmail.value.trim();
      if (!mail || !validateEmail(mail)) {
        if (recoveryEmailErr) recoveryEmailErr.textContent = '请输入有效的邮箱地址';
        playMicroClick();
        return;
      }
      playMicroClick();
      closeAllModals();
      showToast(`已向 ${mail} 发送专属秘钥重设指令`);
    });
  }

  if (btnOpenCharter) {
    btnOpenCharter.addEventListener('click', (e) => {
      e.preventDefault();
      playMicroClick();
      if (modalCharter && typeof modalCharter.showModal === 'function') {
        modalCharter.showModal();
      }
    });
  }

  if (closeCharterBtn) closeCharterBtn.addEventListener('click', closeAllModals);
  if (btnAckCharter) btnAckCharter.addEventListener('click', closeAllModals);

  // Federation / Passkey buttons
  const fedPasskey = document.getElementById('fedPasskey');
  const fedApple = document.getElementById('fedApple');
  const fedGoogle = document.getElementById('fedGoogle');
  const fedGithub = document.getElementById('fedGithub');

  if (fedPasskey) {
    fedPasskey.addEventListener('click', () => {
      playMicroClick();
      showToast('正在唤起系统级 Passkey 生物识别验证...');
    });
  }
  if (fedApple) {
    fedApple.addEventListener('click', () => {
      playMicroClick();
      showToast('正在调起 Apple ID 极简安全授权...');
    });
  }
  if (fedGoogle) {
    fedGoogle.addEventListener('click', () => {
      playMicroClick();
      showToast('正在连接 Google Workspace 身份通道...');
    });
  }
  if (fedGithub) {
    fedGithub.addEventListener('click', () => {
      playMicroClick();
      showToast('正在发起 GitHub OAuth 鉴权验证...');
    });
  }

})();

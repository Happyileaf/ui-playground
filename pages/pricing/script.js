// AURA PLATFORM · Standard SaaS Pricing Plans Logic
// 纯原生、无框架、标准 SaaS 订阅方案响应引擎

(function () {
  'use strict';

  // =========================================================================
  // 1. Web Audio Haptics (Subtle gentle feedback)
  // =========================================================================
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTick(freq = 480, dur = 0.03) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch {
      // Audio not permitted
    }
  }

  // =========================================================================
  // 2. Pricing State & Updates
  // =========================================================================
  // 2. Pricing State & Updates (RMB Only)
  // =========================================================================
  const state = {
    period: 'monthly', // 'monthly' | 'annual'
    selectedPlan: 'Pro'
  };

  // DOM Elements
  const switchOptions = document.querySelectorAll('#billingSwitcher .switch-opt');
  const switchSlider = document.getElementById('switchSlider');
  const priceNumbers = document.querySelectorAll('.price-num');
  const hintLite = document.getElementById('hintLite');
  const hintPro = document.getElementById('hintPro');

  function updatePrices() {
    const isAnnual = state.period === 'annual';

    // Update Numerical Values
    priceNumbers.forEach((el) => {
      const key = isAnnual ? 'a' : 'm';
      const val = el.dataset[key];
      if (val !== undefined) el.textContent = val;
    });

    // Update Hints
    if (hintLite) {
      hintLite.textContent = isAnnual ? '按年支付 ¥1,032 / 年 (享 20% 折扣)' : '按月自动续订';
    }

    if (hintPro) {
      hintPro.textContent = isAnnual ? '按年支付 ¥3,348 / 年 (享 20% 折扣)' : '按月自动续订';
    }
  }

  function updateSliderPosition(opt) {
    if (!opt || !switchSlider) return;
    const width = opt.offsetWidth;
    const left = opt.offsetLeft;
    switchSlider.style.width = `${width}px`;
    switchSlider.style.transform = `translateX(${left}px)`;
  }

  // Billing Period Switcher (Monthly vs Annual)
  switchOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      switchOptions.forEach((o) => {
        o.classList.remove('active');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('active');
      opt.setAttribute('aria-selected', 'true');

      state.period = opt.dataset.period || 'monthly';
      updateSliderPosition(opt);

      playTick(opt.dataset.period === 'annual' ? 520 : 440, 0.04);
      updatePrices();
    });
  });

  // =========================================================================
  // 3. Plan Confirmation Dialog
  // =========================================================================
  const planDialog = document.getElementById('planDialog');
  const dialogCloseBtn = document.getElementById('dialogCloseBtn');
  const dialogCancelBtn = document.getElementById('dialogCancelBtn');
  const dialogDoneBtn = document.getElementById('dialogDoneBtn');
  const subscribeForm = document.getElementById('subscribeForm');
  const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
  const dialogSuccess = document.getElementById('dialogSuccess');

  const dialogPlanName = document.getElementById('dialogPlanName');
  const sumPlan = document.getElementById('sumPlan');
  const sumPeriod = document.getElementById('sumPeriod');
  const sumTotal = document.getElementById('sumTotal');

  const planBaseRates = {
    Starter: { monthly: '¥0 / 免费体验', annual: '¥0 / 免费体验' },
    Lite: {
      monthly: '¥108 / 月',
      annual: '¥86 / 月 (年付 ¥1,032)'
    },
    Pro: {
      monthly: '¥349 / 月',
      annual: '¥279 / 月 (年付 ¥3,348)'
    },
    Enterprise: { monthly: '按需定制核算', annual: '按需定制核算' }
  };

  function openPlanDialog(planName) {
    state.selectedPlan = planName;
    const isAnnual = state.period === 'annual';

    if (dialogPlanName) dialogPlanName.textContent = `${planName} 计划`;
    if (sumPlan) sumPlan.textContent = `${planName} 方案`;
    if (sumPeriod) {
      sumPeriod.textContent = planName === 'Enterprise' ? '企业定制合约' : (isAnnual ? '按年计费 (立省 20%)' : '按月标准结算');
    }

    if (sumTotal) {
      const rateObj = planBaseRates[planName];
      if (rateObj) {
        sumTotal.textContent = isAnnual ? rateObj.annual : rateObj.monthly;
      }
    }

    if (subscribeForm) {
      subscribeForm.reset();
      subscribeForm.style.display = 'flex';
    }
    if (dialogSuccess) dialogSuccess.style.display = 'none';
    if (dialogConfirmBtn) dialogConfirmBtn.classList.remove('loading');

    if (planDialog) {
      planDialog.showModal();
      playTick(500, 0.04);
    }
  }

  function closePlanDialog() {
    if (planDialog) {
      planDialog.close();
      playTick(380, 0.03);
    }
  }

  // Bind Buttons
  document.querySelectorAll('.btn-tier[data-tier-name]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-tier-name') || 'Pro';
      openPlanDialog(name);
    });
  });

  if (dialogCloseBtn) dialogCloseBtn.addEventListener('click', closePlanDialog);
  if (dialogCancelBtn) dialogCancelBtn.addEventListener('click', closePlanDialog);
  if (dialogDoneBtn) dialogDoneBtn.addEventListener('click', closePlanDialog);

  if (planDialog) {
    planDialog.addEventListener('click', (e) => {
      if (e.target === planDialog) closePlanDialog();
    });
  }

  // Handle Form Submit
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (dialogConfirmBtn) dialogConfirmBtn.classList.add('loading');
      playTick(520, 0.04);

      setTimeout(() => {
        if (dialogConfirmBtn) dialogConfirmBtn.classList.remove('loading');
        if (subscribeForm) subscribeForm.style.display = 'none';
        if (dialogSuccess) dialogSuccess.style.display = 'block';
        playTick(600, 0.06);
      }, 500);
    });
  }

  // =========================================================================
  // 4. HUD Audio Toggle
  // =========================================================================
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      const onIcon = audioToggleBtn.querySelector('.icon-audio-on');
      const offIcon = audioToggleBtn.querySelector('.icon-audio-off');
      if (audioEnabled) {
        if (onIcon) onIcon.style.display = 'block';
        if (offIcon) offIcon.style.display = 'none';
        playTick(540, 0.04);
      } else {
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = 'block';
      }
    });
  }

  // Initialize view & tab slider
  updatePrices();

  const initActiveOpt = document.querySelector('#billingSwitcher .switch-opt.active') || switchOptions[0];
  if (initActiveOpt) {
    updateSliderPosition(initActiveOpt);
    // Double-check on next frame in case of layout settling
    requestAnimationFrame(() => updateSliderPosition(initActiveOpt));
    setTimeout(() => updateSliderPosition(initActiveOpt), 80);
  }

  window.addEventListener('resize', () => {
    const curActive = document.querySelector('#billingSwitcher .switch-opt.active');
    if (curActive) updateSliderPosition(curActive);
  });
})();

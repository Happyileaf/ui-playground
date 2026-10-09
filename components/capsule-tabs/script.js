/**
 * Capsule Tab Motion Design Gallery
 * 100% Native, Zero-Dependency Implementation
 */

(function () {
  'use strict';

  // --- Audio Synthesis Engine ---
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playHapticSound(schemeId) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      switch (schemeId) {
        case 'scheme-01':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;

        case 'scheme-02':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(740, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(620, now + 0.1);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'scheme-03':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.linearRampToValueAtTime(240, now + 0.08);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'scheme-04':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'scheme-05':
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
          osc.start(now);
          osc.stop(now + 0.025);
          break;

        case 'scheme-06':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
          break;

        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
      }
    } catch (_) {
      // Audio fallback
    }
  }

  // --- Slider Position Updater ---
  function updateSlider(slider, targetBtn) {
    if (!slider || !targetBtn) return;
    const left = targetBtn.offsetLeft;
    const width = targetBtn.offsetWidth;
    slider.style.transform = `translateX(${left}px)`;
    slider.style.width = `${width}px`;
  }

  // --- Initialize All Tab Containers ---
  const containers = document.querySelectorAll('.tab-container');

  containers.forEach(container => {
    const buttons = Array.from(container.querySelectorAll('.tab-btn'));
    const slider = container.querySelector('.slider');
    const schemeId = container.id;

    function activateTab(btn, shouldPlaySound = true) {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');

      if (slider) {
        updateSlider(slider, btn);
      }

      if (shouldPlaySound) {
        initAudio();
        playHapticSound(schemeId);
      }
    }

    // Initial position
    const activeBtn = container.querySelector('.tab-btn.active') || buttons[0];
    if (activeBtn && slider) {
      requestAnimationFrame(() => {
        updateSlider(slider, activeBtn);
      });
    }

    // Click handler
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        activateTab(btn, true);
      });

      // Keyboard navigation
      btn.addEventListener('keydown', e => {
        let targetIndex = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          targetIndex = (index + 1) % buttons.length;
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          targetIndex = (index - 1 + buttons.length) % buttons.length;
          e.preventDefault();
        } else if (e.key === 'Home') {
          targetIndex = 0;
          e.preventDefault();
        } else if (e.key === 'End') {
          targetIndex = buttons.length - 1;
          e.preventDefault();
        }

        if (targetIndex >= 0) {
          const nextBtn = buttons[targetIndex];
          nextBtn.focus();
          activateTab(nextBtn, true);
        }
      });
    });
  });

  // --- Window Resize Listener ---
  window.addEventListener('resize', () => {
    containers.forEach(container => {
      const slider = container.querySelector('.slider');
      const activeBtn = container.querySelector('.tab-btn.active');
      if (slider && activeBtn) {
        updateSlider(slider, activeBtn);
      }
    });
  });

  // --- Auto-cycle Demo ---
  const btnAutoCycle = document.getElementById('btnAutoCycle');
  let cycleInterval = null;
  const tabKeys = ['overview', 'projects', 'about', 'contact'];
  let currentCycleIdx = 0;

  if (btnAutoCycle) {
    btnAutoCycle.addEventListener('click', () => {
      initAudio();
      if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
        btnAutoCycle.style.opacity = '1';
        return;
      }

      btnAutoCycle.style.opacity = '0.7';
      let step = 0;
      const totalSteps = 8;

      cycleInterval = setInterval(() => {
        currentCycleIdx = (currentCycleIdx + 1) % tabKeys.length;
        const targetKey = tabKeys[currentCycleIdx];

        containers.forEach(container => {
          const targetBtn = container.querySelector(`[data-tab="${targetKey}"]`);
          const slider = container.querySelector('.slider');
          const buttons = container.querySelectorAll('.tab-btn');

          if (targetBtn) {
            buttons.forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-selected', 'false');
            });
            targetBtn.classList.add('active');
            targetBtn.setAttribute('aria-selected', 'true');
            if (slider) updateSlider(slider, targetBtn);
          }
        });

        playHapticSound('scheme-02');

        step++;
        if (step >= totalSteps) {
          clearInterval(cycleInterval);
          cycleInterval = null;
          btnAutoCycle.style.opacity = '1';
        }
      }, 700);
    });
  }

  // --- Slow Motion Mode Toggle ---
  const btnSlowMotion = document.getElementById('btnSlowMotion');
  if (btnSlowMotion) {
    btnSlowMotion.addEventListener('click', () => {
      document.body.classList.toggle('slow-motion');
      const isSlow = document.body.classList.contains('slow-motion');
      btnSlowMotion.classList.toggle('active', isSlow);
    });
  }

  // --- Audio Toggle ---
  const btnToggleAudio = document.getElementById('btnToggleAudio');
  if (btnToggleAudio) {
    const iconOn = btnToggleAudio.querySelector('.icon-sound-on');
    const iconOff = btnToggleAudio.querySelector('.icon-sound-off');

    btnToggleAudio.addEventListener('click', () => {
      initAudio();
      audioEnabled = !audioEnabled;
      if (iconOn && iconOff) {
        iconOn.classList.toggle('hidden', !audioEnabled);
        iconOff.classList.toggle('hidden', audioEnabled);
      }
      btnToggleAudio.classList.toggle('active', audioEnabled);
    });
  }

  // --- Theme Toggle ---
  const btnToggleTheme = document.getElementById('btnToggleTheme');
  if (btnToggleTheme) {
    const iconSun = btnToggleTheme.querySelector('.icon-sun');
    const iconMoon = btnToggleTheme.querySelector('.icon-moon');

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.setAttribute('data-theme', 'dark');
      if (iconSun && iconMoon) {
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
      }
    }

    btnToggleTheme.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        if (iconSun && iconMoon) {
          iconSun.classList.remove('hidden');
          iconMoon.classList.add('hidden');
        }
      } else {
        document.body.setAttribute('data-theme', 'dark');
        if (iconSun && iconMoon) {
          iconSun.classList.add('hidden');
          iconMoon.classList.remove('hidden');
        }
      }

      setTimeout(() => {
        containers.forEach(container => {
          const slider = container.querySelector('.slider');
          const activeBtn = container.querySelector('.tab-btn.active');
          if (slider && activeBtn) updateSlider(slider, activeBtn);
        });
      }, 50);
    });
  }

  // On page load
  window.addEventListener('load', () => {
    containers.forEach(container => {
      const slider = container.querySelector('.slider');
      const activeBtn = container.querySelector('.tab-btn.active');
      if (slider && activeBtn) {
        updateSlider(slider, activeBtn);
      }
    });
  });
})();

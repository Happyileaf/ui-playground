// Interactive Glitch Text Effect
// - Mouse position tracking for 3D tilt and RGB channel shift
// - Click to toggle random glitch intensity
// - Auto-reset glitch on mouse leave
// - Follows defensive coding patterns for Canvas and Web Audio

(function() {
  const texts = document.querySelectorAll('.glitch-text');
  const container = document.querySelector('.glitch-container');
  let glitchIntensity = 1;
  let autoGlitchTimer = null;

  // Defensive: get AudioContext for sound feedback
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Web Audio: play subtle noise glitch on interaction
  function playGlitchSound() {
    const ctx = getAudioContext();
    const bufferSize = 2 * Math.floor(ctx.sampleRate * 0.1);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    whiteNoise.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start();
  }

  document.addEventListener('pointerdown', () => {
    const ctx = getAudioContext();
  }, { once: true });

  // Track mouse movement for interactive distortion
  function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (mouseY / (rect.height / 2)) * -2 * glitchIntensity;
    const rotateY = (mouseX / (rect.width / 2)) * 2 * glitchIntensity;

    const offsetX = (mouseX / rect.width) * 8 * glitchIntensity;
    const offsetY = (mouseY / rect.height) * 4 * glitchIntensity;

    texts.forEach((text, index) => {
      // 3D perspective tilt
      text.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      // RGB channel offset based on mouse position
      const isEven = index % 2 === 0;
      const shiftX = isEven ? offsetX : -offsetX;
      const shiftY = isEven ? -offsetY : offsetY;
      text.style.textShadow = `
        ${shiftX}px ${shiftY}px rgba(255, 0, 76, ${0.6 * glitchIntensity}),
        ${-shiftX}px ${-shiftY}px rgba(0, 255, 249, ${0.6 * glitchIntensity})
      `;
    });
  }

  // Click to toggle random glitch bursts
  function handleClick() {
    playGlitchSound();
    if (autoGlitchTimer) {
      clearInterval(autoGlitchTimer);
      autoGlitchTimer = null;
      glitchIntensity = 1;
      document.body.style.backgroundColor = '#0a0a0a';
      return;
    }

    glitchIntensity = 2.5;
    let counter = 0;
    autoGlitchTimer = setInterval(() => {
      const r = Math.floor(Math.random() * 30);
      const g = Math.floor(Math.random() * 20);
      const b = Math.floor(Math.random() * 40);
      document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      counter++;
      if (counter > 15) {
        clearInterval(autoGlitchTimer);
        autoGlitchTimer = null;
        glitchIntensity = 1;
        document.body.style.backgroundColor = '#0a0a0a';
      }
    }, 80);
  }

  // Reset when mouse leaves container
  function handleMouseLeave() {
    texts.forEach(text => {
      text.style.transform = 'rotateX(0) rotateY(0)';
      text.style.textShadow = '';
    });
    if (autoGlitchTimer) {
      clearInterval(autoGlitchTimer);
      autoGlitchTimer = null;
    }
    glitchIntensity = 1;
    document.body.style.backgroundColor = '#0a0a0a';
  }

  // Event listeners
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseleave', handleMouseLeave);
  container.addEventListener('click', handleClick);

  // Touch support for mobile
  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove(touch);
  }, { passive: false });

  container.addEventListener('touchend', handleMouseLeave);
})();

// Interactive Piano Keyboard
// Pure Web Audio API implementation - no external dependencies

(function() {
  // Audio Context - lazy initialized on first interaction
  let audioCtx = null;
  let masterGain = null;
  let currentVolume = 0.5;
  
  // Note frequency mapping (equal temperament)
  const noteFrequencies = {
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,
    'C5': 523.25
  };

  // Currently playing oscillators
  const activeOscillators = new Map();

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = currentVolume;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playNote(note) {
    const ctx = getAudioContext();
    const freq = noteFrequencies[note];
    if (!freq) return;

    // Create oscillator
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    // Smooth attack
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.start();
    activeOscillators.set(note, { oscillator, gainNode });
  }

  function stopNote(note) {
    if (!activeOscillators.has(note)) return;
    
    const ctx = getAudioContext();
    const { oscillator, gainNode } = activeOscillators.get(note);
    
    // Smooth release
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.stop(ctx.currentTime + 0.15);
    activeOscillators.delete(note);
  }

  function stopAllNotes() {
    for (const note of activeOscillators.keys()) {
      stopNote(note);
    }
  }

  // Event binding
  const keys = document.querySelectorAll('.key');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

  keys.forEach(key => {
    const note = key.dataset.note;
    if (!note) return;

    // Mouse events
    key.addEventListener('mousedown', (e) => {
      e.preventDefault();
      key.classList.add('active');
      playNote(note);
    });

    key.addEventListener('mouseup', () => {
      key.classList.remove('active');
      stopNote(note);
    });

    key.addEventListener('mouseleave', () => {
      if (key.classList.contains('active')) {
        key.classList.remove('active');
        stopNote(note);
      }
    });

    // Touch events
    key.addEventListener('touchstart', (e) => {
      e.preventDefault();
      key.classList.add('active');
      playNote(note);
    });

    key.addEventListener('touchend', (e) => {
      e.preventDefault();
      key.classList.remove('active');
      stopNote(note);
    });
  });

  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    currentVolume = parseInt(e.target.value) / 100;
    volumeValue.textContent = `${e.target.value}%`;
    if (masterGain) {
      masterGain.gain.value = currentVolume;
    }
  });

  // Prevent unwanted scrolling on touch
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.piano')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Initialize audio context on first interaction (per browser requirements)
  document.addEventListener('pointerdown', () => {
    getAudioContext();
  }, { once: true });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopAllNotes();
    if (audioCtx) {
      audioCtx.close();
    }
  });
})();

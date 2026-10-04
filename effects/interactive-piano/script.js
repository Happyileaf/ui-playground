// Interactive Web Audio Piano
// Based on equal temperament 12-note scale

// Configuration
const baseFrequency = 261.63; // C4 (Middle C)
const numOctaves = 3;
const notes = [
  { name: 'C', isBlack: false },
  { name: 'C#', isBlack: true },
  { name: 'D', isBlack: false },
  { name: 'D#', isBlack: true },
  { name: 'E', isBlack: false },
  { name: 'F', isBlack: false },
  { name: 'F#', isBlack: true },
  { name: 'G', isBlack: false },
  { name: 'G#', isBlack: true },
  { name: 'A', isBlack: false },
  { name: 'A#', isBlack: true },
  { name: 'B', isBlack: false },
];

// Global state
let audioCtx = null;
let currentOscillators = new Map();
let waveform = 'sine';
let detune = 0;
let releaseTime = 0.2;

// Get audio context (lazy init on first user interaction)
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Calculate frequency for given semitone offset from C4
function getFrequency(semitoneOffset) {
  return baseFrequency * Math.pow(2, semitoneOffset / 12);
}

// Start playing a note
function noteOn(semitoneOffset, keyElement) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = waveform;
  oscillator.frequency.value = getFrequency(semitoneOffset);
  oscillator.detune.value = detune;

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Start with attack
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
  oscillator.start();

  // Store for later
  currentOscillators.set(semitoneOffset, { oscillator, gainNode });
  keyElement.classList.add('active');
}

// Stop playing a note
function noteOff(semitoneOffset, keyElement) {
  const ctx = getAudioContext();
  if (!ctx || !currentOscillators.has(semitoneOffset)) return;

  const { oscillator, gainNode } = currentOscillators.get(semitoneOffset);

  // Release envelope
  gainNode.gain.cancelScheduledValues(ctx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + releaseTime);
  oscillator.stop(ctx.currentTime + releaseTime);

  currentOscillators.delete(semitoneOffset);
  keyElement.classList.remove('active');
}

// Build piano keys
function buildPiano() {
  const container = document.getElementById('pianoContainer');
  let semitoneOffset = -12; // Start from C3

  for (let octave = 0; octave < numOctaves; octave++) {
    notes.forEach(note => {
      const key = document.createElement('div');
      key.className = `piano-key ${note.isBlack ? 'black' : 'white'}`;
      key.dataset.semitone = String(semitoneOffset);
      key.innerHTML = `<span class="key-label">${note.name}${octave + 3}</span>`;

      container.appendChild(key);
      if (!note.isBlack) {
        semitoneOffset++;
      } else {
        semitoneOffset++;
      }
    });
  }

  // Add pointer events
  container.addEventListener('pointerdown', (e) => {
    const key = e.target.closest('.piano-key');
    if (!key) return;
    const offset = Number(key.dataset.semitone);
    noteOn(offset, key);
    e.preventDefault();
  }, { passive: false });

  container.addEventListener('pointerup', (e) => {
    const key = e.target.closest('.piano-key');
    if (!key) return;
    const offset = Number(key.dataset.semitone);
    noteOff(offset, key);
    e.preventDefault();
  }, { passive: false });

  container.addEventListener('pointerleave', (e) => {
    const key = e.target.closest('.piano-key');
    if (!key) return;
    const offset = Number(key.dataset.semitone);
    noteOff(offset, key);
  });

  container.addEventListener('pointermove', (e) => {
    if (e.buttons !== 1) return; // Only when pointer is down
    const key = e.target.closest('.piano-key');
    if (!key) return;
    const offset = Number(key.dataset.semitone);
    if (!currentOscillators.has(offset)) {
      noteOn(offset, key);
    }
    e.preventDefault();
  }, { passive: false });
}

// Control panel toggle
function setupControls() {
  const toggleBtn = document.getElementById('hudToggle');
  const controlDock = document.getElementById('controlDock');
  const waveformSelect = document.getElementById('waveformSelect');
  const detuneSlider = document.getElementById('detuneSlider');
  const detuneValue = document.getElementById('detuneValue');
  const releaseSlider = document.getElementById('releaseSlider');
  const releaseValue = document.getElementById('releaseValue');

  // Toggle visibility
  function toggleControls() {
    controlDock.classList.toggle('hidden');
    event.stopPropagation();
  }

  toggleBtn.addEventListener('click', toggleControls);

  // Keyboard shortcut: H to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' || e.key === 'Escape') {
      if (!controlDock.classList.contains('hidden')) {
        toggleControls();
      }
    }
  });

  // Waveform change
  waveformSelect.addEventListener('change', (e) => {
    waveform = e.target.value;
  });

  // Detune change
  detuneSlider.addEventListener('input', (e) => {
    detune = Number(e.target.value);
    detuneValue.textContent = String(detune);
  });

  // Release change
  releaseSlider.addEventListener('input', (e) => {
    releaseTime = Number(e.target.value);
    releaseValue.textContent = String(releaseTime.toFixed(2));
  });

  // Prevent clicks on control dock from propagating to body
  controlDock.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Canvas resize handling (already handled by CSS but just in case)
window.addEventListener('resize', () => {
  // No action needed - CSS handles responsive sizing
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  buildPiano();
  setupControls();

  // Activate audio context on first user interaction (browser requirement)
  document.addEventListener('pointerdown', () => {
    getAudioContext();
  }, { once: true });
});

// Cleanup on unload (when running in iframe)
window.addEventListener('beforeunload', () => {
  if (audioCtx) {
    currentOscillators.forEach(({ oscillator }) => {
      oscillator.stop();
    });
    audioCtx.close();
  }
});

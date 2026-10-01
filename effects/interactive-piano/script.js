// Interactive Piano Keyboard
// Pure native Web Audio implementation with keyboard and mouse support

const piano = document.getElementById('piano');
const toggleLabels = document.getElementById('toggleLabels');

// Define piano keys configuration - one octave C4 to B4
const keys = [
  { note: 'C',  key: 'a', frequency: 261.63, type: 'white' },
  { note: 'C#', key: 'w', frequency: 277.18, type: 'black', offset: 7.14 },
  { note: 'D',  key: 's', frequency: 293.66, type: 'white' },
  { note: 'D#', key: 'e', frequency: 311.13, type: 'black', offset: 21.42 },
  { note: 'E',  key: 'd', frequency: 329.63, type: 'white' },
  { note: 'F',  key: 'f', frequency: 349.23, type: 'white' },
  { note: 'F#', key: 't', frequency: 369.99, type: 'black', offset: 49.98 },
  { note: 'G',  key: 'g', frequency: 392.00, type: 'white' },
  { note: 'G#', key: 'y', frequency: 415.30, type: 'black', offset: 64.26 },
  { note: 'A',  key: 'h', frequency: 440.00, type: 'white' },
  { note: 'A#', key: 'u', frequency: 466.16, type: 'black', offset: 78.54 },
  { note: 'B',  key: 'j', frequency: 493.88, type: 'white' },
];

// Web Audio context initialization (lazy activation per guidelines)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Active oscillators to manage sound
const activeOscillators = {};

function playNote(frequency, noteId) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Smooth attack
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start();
  activeOscillators[noteId] = { oscillator, gainNode, ctx };
}

function stopNote(noteId) {
  if (!activeOscillators[noteId]) return;
  
  const { oscillator, gainNode, ctx } = activeOscillators[noteId];
  // Smooth release
  gainNode.gain.cancelScheduledValues(ctx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  oscillator.stop(ctx.currentTime + 0.15);
  delete activeOscillators[noteId];
}

// Render all piano keys
keys.forEach((keyConfig, index) => {
  const keyElement = document.createElement('div');
  keyElement.classList.add('key', keyConfig.type);
  
  if (keyConfig.type === 'black') {
    keyElement.style.left = `${keyConfig.offset}%`;
  }
  
  const label = document.createElement('span');
  label.classList.add('key-label');
  label.textContent = `${keyConfig.note}\n[${keyConfig.key.toUpperCase()}]`;
  keyElement.appendChild(label);
  
  // Mouse events
  keyElement.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    keyElement.classList.add('active');
    playNote(keyConfig.frequency, `${keyConfig.note}-${index}`);
  });
  
  keyElement.addEventListener('pointerup', () => {
    keyElement.classList.remove('active');
    stopNote(`${keyConfig.note}-${index}`);
  });
  
  keyElement.addEventListener('pointerleave', () => {
    if (keyElement.classList.contains('active')) {
      keyElement.classList.remove('active');
      stopNote(`${keyConfig.note}-${index}`);
    }
  });
  
  piano.appendChild(keyElement);
  
  // Store reference for keyboard events
  keyConfig.element = keyElement;
  keyConfig.noteId = `${keyConfig.note}-${index}`;
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  
  const key = e.key.toLowerCase();
  const matchedKey = keys.find(k => k.key === key);
  if (!matchedKey) return;
  
  e.preventDefault();
  if (!matchedKey.element.classList.contains('active')) {
    matchedKey.element.classList.add('active');
    playNote(matchedKey.frequency, matchedKey.noteId);
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  const matchedKey = keys.find(k => k.key === key);
  if (!matchedKey) return;
  
  matchedKey.element.classList.remove('active');
  stopNote(matchedKey.noteId);
});

// Toggle key labels visibility
toggleLabels.addEventListener('change', (e) => {
  document.querySelectorAll('.key-label').forEach(label => {
    label.classList.toggle('show', e.target.checked);
  });
});

// Activate audio context on first user interaction (per Web Audio guidelines)
document.addEventListener('pointerdown', () => {
  getAudioContext();
}, { once: true });

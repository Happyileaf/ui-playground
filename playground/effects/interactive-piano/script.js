// Frequency table for piano notes (C4 to G5)
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
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99
};

// Web Audio Context setup
let audioCtx = null;
let gainNode = null;
let activeOscillators = new Map();
let sustainEnabled = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Initialize audio on first user interaction
document.addEventListener('pointerdown', () => {
  const ctx = getAudioContext();
}, { once: true });

function playNote(note) {
  const ctx = getAudioContext();
  const frequency = noteFrequencies[note];
  
  if (!frequency) return;
  
  // Create oscillator
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Create gain node for this note
  const noteGain = ctx.createGain();
  oscillator.connect(noteGain);
  noteGain.connect(gainNode);
  
  // Fade in
  noteGain.gain.setValueAtTime(0, ctx.currentTime);
  noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
  
  oscillator.start();
  
  activeOscillators.set(note, { oscillator, gain: noteGain, startTime: ctx.currentTime });
}

function stopNote(note) {
  if (!activeOscillators.has(note)) return;
  
  const { oscillator, gain, startTime } = activeOscillators.get(note);
  const ctx = getAudioContext();
  
  if (sustainEnabled) return;
  
  // Fade out
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  
  oscillator.stop(ctx.currentTime + 0.3);
  activeOscillators.delete(note);
}

function stopAllNotes() {
  for (const [note, data] of activeOscillators) {
    const ctx = getAudioContext();
    data.gain.gain.cancelScheduledValues(ctx.currentTime);
    data.gain.gain.setValueAtTime(data.gain.gain.value, ctx.currentTime);
    data.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    data.oscillator.stop(ctx.currentTime + 0.3);
  }
  activeOscillators.clear();
}

// Event listeners for piano keys
const keys = document.querySelectorAll('.key');
keys.forEach(key => {
  const note = key.dataset.note;
  
  const handleStart = (e) => {
    e.preventDefault();
    if (!key.classList.contains('active')) {
      key.classList.add('active');
      playNote(note);
    }
  };
  
  const handleEnd = (e) => {
    e.preventDefault();
    if (!sustainEnabled && key.classList.contains('active')) {
      key.classList.remove('active');
      stopNote(note);
    }
  };
  
  // Mouse events
  key.addEventListener('mousedown', handleStart);
  key.addEventListener('mouseup', handleEnd);
  key.addEventListener('mouseleave', handleEnd);
  
  // Touch events
  key.addEventListener('touchstart', handleStart);
  key.addEventListener('touchend', handleEnd);
});

// Sustain toggle
const sustainBtn = document.getElementById('toggleSustain');
sustainBtn.addEventListener('click', () => {
  sustainEnabled = !sustainEnabled;
  if (sustainEnabled) {
    sustainBtn.textContent = 'Sustain: On';
    sustainBtn.classList.add('active');
  } else {
    sustainBtn.textContent = 'Sustain: Off';
    sustainBtn.classList.remove('active');
    stopAllNotes();
    keys.forEach(key => {
      if (key.classList.contains('active')) {
        key.classList.remove('active');
      }
    });
  }
});

// Keyboard support
const noteKeyMap = {
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
  'k': 'C5',
  'o': 'C#5',
  'l': 'D5',
  'p': 'D#5',
  ';': 'E5',
  '\'': 'F5',
  ']': 'F#5',
  '\\': 'G5'
};

document.addEventListener('keydown', (e) => {
  const note = noteKeyMap[e.key.toLowerCase()];
  if (note) {
    const keyEl = document.querySelector(`[data-note="${note}"]`);
    if (keyEl && !keyEl.classList.contains('active')) {
      keyEl.classList.add('active');
      playNote(note);
    }
  }
});

document.addEventListener('keyup', (e) => {
  const note = noteKeyMap[e.key.toLowerCase()];
  if (note && !sustainEnabled) {
    const keyEl = document.querySelector(`[data-note="${note}"]`);
    if (keyEl) {
      keyEl.classList.remove('active');
      stopNote(note);
    }
  }
});

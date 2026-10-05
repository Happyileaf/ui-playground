// Interactive Piano Keyboard
// Pure native Web Audio implementation

// Constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_INDICES = [1, 3, 6, 8, 10];
const START_NOTE = 21; // A0
const END_NOTE = 108; // C8

// State
let audioCtx = null;
let activeOscillators = new Map();
let config = {
  octaves: 2,
  sustain: 0.5,
  waveform: 'sine'
};

// DOM Elements
const pianoContainer = document.getElementById('pianoContainer');
const controlDock = document.getElementById('controlDock');
const hudToggle = document.getElementById('hudToggle');
const octaveRange = document.getElementById('octaveRange');
const octaveValue = document.getElementById('octaveValue');
const sustainInput = document.getElementById('sustain');
const sustainValue = document.getElementById('sustainValue');
const waveformSelect = document.getElementById('waveform');

// Add current note name display
const noteNameDisplay = document.createElement('div');
noteNameDisplay.className = 'note-name';
document.body.appendChild(noteNameDisplay);

// Audio context initialization (defensive pattern)
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Initialize keyboard layout
function createPianoKeyboard() {
  const totalNotes = config.octaves * 12;
  let whiteKeyCount = 0;

  for (let i = 0; i < totalNotes; i++) {
    const noteIndex = i % 12;
    const isBlack = BLACK_KEY_INDICES.includes(noteIndex);

    if (!isBlack) {
      whiteKeyCount++;
      const whiteKey = document.createElement('div');
      whiteKey.className = 'piano-key white-key';
      whiteKey.dataset.note = i;
      whiteKey.dataset.noteName = NOTE_NAMES[noteIndex];
      const label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = NOTE_NAMES[noteIndex];
      whiteKey.appendChild(label);
      pianoContainer.appendChild(whiteKey);
    }
  }

  // Place black keys relative to white keys
  const whiteKeys = document.querySelectorAll('.white-key');
  whiteKeyCount = whiteKeys.length;
  let blackKeyIndex = 0;
  const blackKeyOffset = 40; // offset from first white key in pixels (depends on CSS)

  for (let i = 0; i < totalNotes; i++) {
    const noteIndex = i % 12;
    if (BLACK_KEY_INDICES.includes(noteIndex)) {
      const group = Math.floor(i / 12);
      let whiteIndex = i - blackKeyIndex - (group * 5);
      blackKeyIndex++;
      const leftPosition = (whiteIndex * 60) + 42; // responsive to CSS widths
      const blackKey = document.createElement('div');
      blackKey.className = 'piano-key black-key';
      blackKey.dataset.note = i;
      blackKey.dataset.noteName = NOTE_NAMES[noteIndex];
      blackKey.style.left = leftPosition + 'px';
      const label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = NOTE_NAMES[noteIndex];
      blackKey.appendChild(label);
      pianoContainer.appendChild(blackKey);
    }
  }

  // Add pointer event listeners
  document.querySelectorAll('.piano-key').forEach(key => {
    key.addEventListener('pointerdown', startNote);
    key.addEventListener('pointerenter', handlePointerEnter);
    key.addEventListener('pointerup', stopNote);
    key.addEventListener('pointerleave', stopNote);
  });

  // Set pointer capture to track drag outside key
  document.addEventListener('pointerup', () => {
    document.querySelectorAll('.piano-key.active').forEach(key => {
      stopNote({ target: key });
    });
  });
}

function handlePointerEnter(e) {
  if (e.buttons !== 1) return; // Only when primary button is down
  startNote(e);
}

function frequencyFromNoteNumber(note) {
  // Equal temperament tuning
  return 440 * Math.pow(2, (note + START_NOTE - 69) / 12);
}

function startNote(e) {
  e.stopPropagation();
  const key = e.target.closest('.piano-key');
  if (!key || key.classList.contains('active')) return;

  const ctx = getAudioContext();
  const noteIndex = parseInt(key.dataset.note, 10);
  const freq = frequencyFromNoteNumber(noteIndex);

  // Create oscillator and gain
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = config.waveform;
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  oscillator.start();

  // Track active notes
  key.classList.add('active');
  activeOscillators.set(key, { oscillator, gainNode });

  // Show note name
  noteNameDisplay.textContent = `${key.dataset.noteName}${Math.floor(noteIndex / 12)}`;
  noteNameDisplay.classList.add('active');
}

function stopNote(e) {
  const key = e.target.closest('.piano-key');
  if (!key || !activeOscillators.has(key)) return;

  const { oscillator, gainNode } = activeOscillators.get(key);
  const ctx = getAudioContext();

  // Apply release
  const currentTime = ctx.currentTime;
  gainNode.gain.cancelScheduledValues(currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + config.sustain);
  oscillator.stop(ctx.currentTime + config.sustain);

  activeOscillators.delete(key);
  key.classList.remove('active');

  // Hide note name if no active notes
  if (activeOscillators.size === 0) {
    noteNameDisplay.classList.remove('active');
  }
}

// Event bindings
function bindControls() {
  // Toggle control dock
  hudToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    controlDock.classList.toggle('hidden');
  });

  // Close control dock with H or Escape
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' || e.key === 'Escape') {
      controlDock.classList.add('hidden');
    }
  });

  // Prevent propagation on dock to avoid closing
  controlDock.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  octaveRange.addEventListener('input', (e) => {
    config.octaves = parseInt(e.target.value, 10);
    octaveValue.textContent = config.octaves;
    rebuildPiano();
  });

  sustainInput.addEventListener('input', (e) => {
    config.sustain = parseInt(e.target.value, 10) / 100;
    sustainValue.textContent = `${e.target.value}%`;
  });

  waveformSelect.addEventListener('change', (e) => {
    config.waveform = e.target.value;
  });
}

function rebuildPiano() {
  // Clear any active notes before rebuilding
  activeOscillators.forEach((data, key) => {
    const { oscillator } = data;
    oscillator.stop();
  });
  activeOscillators.clear();
  pianoContainer.innerHTML = '';
  createPianoKeyboard();
}

// Initialize
bindControls();
createPianoKeyboard();

// Web Audio gesture unlock
document.addEventListener('pointerdown', () => {
  getAudioContext();
}, { once: true });

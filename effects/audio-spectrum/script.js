// Audio Spectrum Visualizer
// Canvas-based Web Audio API frequency spectrum analyzer
// Uses built-in oscillator with periodic melody

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggleBtn');
const sensitivitySlider = document.getElementById('sensitivitySlider');
const barWidthSlider = document.getElementById('barWidthSlider');
const sensitivityValue = document.getElementById('sensitivityValue');
const barWidthValue = document.getElementById('barWidthValue');

let audioCtx = null;
let analyser = null;
let oscillator = null;
let gainNode = null;
let animationId = null;
let isPlaying = false;
let sensitivity = 1.5;
let barWidth = 5;

// Melody sequence in half-notes (C major scale)
const melody = [
  { note: 4, duration: 1 },
  { note: 4, duration: 1 },
  { note: 5, duration: 1 },
  { note: 7, duration: 2 },
  { note: 4, duration: 1 },
  { note: 5, duration: 1 },
  { note: 7, duration: 2 },
  { note: 7, duration: 1 },
  { note: 9, duration: 1 },
  { note: 8, duration: 1 },
  { note: 5, duration: 2 },
  { note: 4, duration: 1 },
  { note: 2, duration: 1 },
  { note: 4, duration: 2 },
  { pause: true, duration: 1 },
  { note: 4, duration: 1 },
  { note: 4, duration: 1 },
  { note: 5, duration: 1 },
  { note: 7, duration: 2 },
  { note: 4, duration: 1 },
  { note: 2, duration: 1 },
  { note: 1, duration: 3 },
];

const baseFrequency = 220; // A3
let currentNoteIndex = 0;
let noteStartTime = 0;

// Get audio context - follows defensive lazy activation
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    gainNode = audioCtx.createGain();
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.3;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Convert MIDI note number to frequency
function noteToFreq(note) {
  return baseFrequency * Math.pow(2, note / 12);
}

// Play next note in melody
function playNextNote() {
  if (!isPlaying || !oscillator) return;

  const current = melody[currentNoteIndex];
  currentNoteIndex = (currentNoteIndex + 1) % melody.length;

  // Cancel previous oscillator
  oscillator.stop();
  oscillator.disconnect();

  if (!current.pause) {
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = noteToFreq(current.note);
    oscillator.connect(analyser);
    oscillator.start();
  } else {
    oscillator = null;
  }

  // Schedule next note based on duration
  setTimeout(playNextNote, current.duration * 300);
}

// Start or restart audio
function startAudio() {
  const ctx = getAudioContext();
  isPlaying = true;
  oscillator = ctx.createOscillator();
  oscillator.type = 'sawtooth';
  currentNoteIndex = 0;
  playNextNote();
  animate();
}

// Stop audio
function stopAudio() {
  isPlaying = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

// Handle canvas resize for high DPR
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Animation loop
function animate() {
  if (!isPlaying) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Clear canvas
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  ctx.clearRect(0, 0, width, height);

  const barGap = 1;
  const numBars = Math.floor(width / (barWidth + barGap));
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, 'var(--bar-gradient-1)');
  gradient.addColorStop(1, 'var(--bar-gradient-2)');
  ctx.fillStyle = gradient;

  for (let i = 0; i < numBars; i++) {
    const percent = dataArray[i] / 255;
    const barHeight = percent * height * sensitivity;
    const x = i * (barWidth + barGap);
    const y = height - barHeight;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  animationId = requestAnimationFrame(animate);
}

// Event listeners
toggleBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopAudio();
  } else {
    startAudio();
  }
});

sensitivitySlider.addEventListener('input', (e) => {
  sensitivity = parseFloat(e.target.value);
  sensitivityValue.textContent = sensitivity.toFixed(1);
});

barWidthSlider.addEventListener('input', (e) => {
  barWidth = parseInt(e.target.value);
  barWidthValue.textContent = barWidth;
});

// Initialize with correct display values
sensitivityValue.textContent = sensitivity.toFixed(1);
barWidthValue.textContent = barWidth;

// Audio context must start on user interaction (browser policy)
document.addEventListener('pointerdown', () => {
  getAudioContext();
}, { once: true });

(function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;

  // Configurable parameters
  let params = {
    amplitude: 40,
    frequency: 3,
    speed: 2,
    layers: 3,
    time: 0
  };

  // Gradient colors for different layers (purple to blue to cyan)
  const layerColors = [
    { start: '#6366f1', end: '#8b5cf6', alpha: 0.8 },
    { start: '#8b5cf6', end: '#06b6d4', alpha: 0.6 },
    { start: '#06b6d4', end: '#3b82f6', alpha: 0.4 },
    { start: '#3b82f6', end: '#10b981', alpha: 0.3 },
    { start: '#10b981', end: '#6366f1', alpha: 0.2 }
  ];

  // Hex to RGB conversion for gradient work
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Resize canvas for high DPI
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  // Sine wave generator
  function getWaveY(x, time, layerIndex) {
    const { amplitude, frequency, speed } = params;
    const layerOffset = layerIndex * 0.5;
    const layerAmp = amplitude / (layerIndex + 1);
    
    // Combine multiple sine waves for more organic motion
    const primary = Math.sin((x * frequency * 0.01) + time + layerOffset) * layerAmp;
    const secondary = Math.sin((x * frequency * 0.02) + time * 1.5 + layerOffset * 2) * (layerAmp * 0.3);
    
    return window.innerHeight / 2 + primary + secondary;
  }

  // Draw one wave layer
  function drawWaveLayer(layerIndex) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const colorConfig = layerColors[layerIndex];
    
    // Create gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    const startRgb = hexToRgb(colorConfig.start);
    const endRgb = hexToRgb(colorConfig.end);
    
    grad.addColorStop(0, `rgba(${startRgb.r}, ${startRgb.g}, ${startRgb.b}, ${colorConfig.alpha})`);
    grad.addColorStop(1, `rgba(${endRgb.r}, ${endRgb.g}, ${endRgb.b}, ${colorConfig.alpha * 0.5})`);
    
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    // Plot wave points
    for (let x = 0; x <= width; x += 2) {
      const y = getWaveY(x, params.time, layerIndex);
      ctx.lineTo(x, y);
    }
    
    // Close the path to bottom-right corner
    ctx.lineTo(width, height);
    ctx.closePath();
    
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Main render loop
  function animate() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw all layers from back to front
    for (let i = params.layers - 1; i >= 0; i--) {
      drawWaveLayer(i);
    }
    
    // Update time for animation
    params.time += params.speed * 0.02;
    
    animationFrameId = requestAnimationFrame(animate);
  }

  // Control dock toggle logic
  const gearToggle = document.getElementById('gearToggle');
  const controlDock = document.querySelector('.control-dock');
  const amplitudeSlider = document.getElementById('amplitude');
  const frequencySlider = document.getElementById('frequency');
  const speedSlider = document.getElementById('speed');
  const layersSlider = document.getElementById('layers');
  const amplitudeValue = document.getElementById('amplitudeValue');
  const frequencyValue = document.getElementById('frequencyValue');
  const speedValue = document.getElementById('speedValue');
  const layersValue = document.getElementById('layersValue');

  function updateLabels() {
    amplitudeValue.textContent = amplitudeSlider.value;
    frequencyValue.textContent = frequencySlider.value;
    speedValue.textContent = speedSlider.value;
    layersValue.textContent = layersSlider.value;
  }

  gearToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    controlDock.classList.toggle('hidden');
  });

  // Prevent clicks on panel from closing it
  document.querySelector('.controls-panel').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Click outside to close
  document.addEventListener('click', () => {
    if (!controlDock.classList.contains('hidden')) {
      controlDock.classList.add('hidden');
    }
  });

  // Keyboard shortcuts: H or Esc toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H' || e.key === 'Escape') {
      controlDock.classList.toggle('hidden');
    }
  });

  // Slider event handlers
  amplitudeSlider.addEventListener('input', (e) => {
    params.amplitude = parseFloat(e.target.value);
    updateLabels();
  });

  frequencySlider.addEventListener('input', (e) => {
    params.frequency = parseFloat(e.target.value);
    updateLabels();
  });

  speedSlider.addEventListener('input', (e) => {
    params.speed = parseFloat(e.target.value);
    updateLabels();
  });

  layersSlider.addEventListener('input', (e) => {
    params.layers = parseInt(e.target.value);
    updateLabels();
  });

  // Initialize
  window.addEventListener('resize', resize);
  resize();
  updateLabels();
  animationFrameId = requestAnimationFrame(animate);

  // Cleanup function for when iframe unmounts
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
})();

// ========== Global Variables ==========
let controlDock, toggleControl, speedRange, opacityRange, brWidthRange, pulseToggle;
let speedValue, opacityValue, brWidthValue;
let root = document.documentElement;

// ========== DOM Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  controlDock = document.getElementById('controlDock');
  toggleControl = document.getElementById('toggleControl');
  speedRange = document.getElementById('speedRange');
  opacityRange = document.getElementById('opacityRange');
  brWidthRange = document.getElementById('brWidthRange');
  pulseToggle = document.getElementById('pulseToggle');
  speedValue = document.getElementById('speedValue');
  opacityValue = document.getElementById('opacityValue');
  brWidthValue = document.getElementById('brWidthValue');

  // Initialize controls from CSS variables
  initializeControls();

  // Bind event listeners
  bindEventListeners();
});

// ========== Initialize Control Values from Root ==========
function initializeControls() {
  // Get current computed values from root
  const styles = getComputedStyle(root);
  
  const currentSpeed = styles.getPropertyValue('--shimmer-animation-speed').trim();
  const currentOpacity = styles.getPropertyValue('--skeleton-opacity').trim();
  const currentBrWidth = styles.getPropertyValue('--shimmer-br-width').trim();
  const hasPulse = styles.getPropertyValue('--shimmer-enable-pulse').includes('shimmer-pulse');

  // Set input values
  if (currentSpeed) {
    speedRange.value = parseFloat(currentSpeed);
    speedValue.textContent = `${parseFloat(currentSpeed)}s`;
  }

  if (currentOpacity) {
    opacityRange.value = parseFloat(currentOpacity);
    opacityValue.textContent = `${parseFloat(currentOpacity)}`;
  }

  if (currentBrWidth) {
    const width = parseInt(currentBrWidth, 10);
    brWidthRange.value = width;
    brWidthValue.textContent = `${width}px`;
  }

  pulseToggle.checked = hasPulse;
}

// ========== Bind All Event Listeners ==========
function bindEventListeners() {
  // Toggle control panel visibility
  toggleControl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleControlPanel();
  });

  // Speed change
  speedRange.addEventListener('input', () => {
    const value = parseFloat(speedRange.value);
    root.style.setProperty('--shimmer-animation-speed', `${value}s`);
    speedValue.textContent = `${value}s`;
  });

  // Opacity change
  opacityRange.addEventListener('input', () => {
    const value = parseFloat(opacityRange.value);
    root.style.setProperty('--skeleton-opacity', value);
    opacityValue.textContent = `${value}`;
  });

  // Shimmer width change
  brWidthRange.addEventListener('input', () => {
    const value = parseInt(brWidthRange.value, 10);
    root.style.setProperty('--shimmer-br-width', `${value}px`);
    brWidthValue.textContent = `${value}px`;
  });

  // Pulse toggle
  pulseToggle.addEventListener('change', () => {
    if (pulseToggle.checked) {
      root.style.setProperty('--shimmer-enable-pulse', 'shimmer shimmer-pulse');
    } else {
      root.style.setProperty('--shimmer-enable-pulse', 'shimmer');
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);

  // Click outside to close
  document.addEventListener('click', handleClickOutside);
}

// ========== Control Panel Toggle ==========
function toggleControlPanel() {
  controlDock.classList.toggle('hidden');
}

// ========== Keyboard Shortcuts ==========
function handleKeyDown(e) {
  // H or ESC to close panel
  if (e.key.toLowerCase() === 'h' || e.key === 'Escape') {
    if (!controlDock.classList.contains('hidden')) {
      e.stopPropagation();
      toggleControlPanel();
    }
  }
}

// ========== Click Outside to Close ==========
function handleClickOutside(e) {
  if (controlDock && !controlDock.contains(e.target) && 
      toggleControl && !toggleControl.contains(e.target) &&
      !controlDock.classList.contains('hidden')) {
    toggleControlPanel();
  }
}

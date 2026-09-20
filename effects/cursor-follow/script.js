(function () {
  const dot = document.getElementById('cursorDot');
  const circle = document.getElementById('cursorCircle');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let circleX = mouseX;
  let circleY = mouseY;
  let prevCircleX = mouseX;
  let prevCircleY = mouseY;

  let isHovered = false;
  let hoverText = '';

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Attach hover triggers
  const interactiveCards = document.querySelectorAll('.interactive-card');
  interactiveCards.forEach((card) => {
    card.addEventListener('pointerenter', () => {
      isHovered = true;
      hoverText = card.dataset.cursorText || '';
      circle.classList.add('active');
      circle.textContent = hoverText;
      dot.style.opacity = '0';
    });
    card.addEventListener('pointerleave', () => {
      isHovered = false;
      circle.classList.remove('active');
      circle.textContent = '';
      dot.style.opacity = '1';
    });
  });

  const buttons = document.querySelectorAll('.action-btn, .action-link');
  buttons.forEach((btn) => {
    btn.addEventListener('pointerenter', () => {
      circle.style.transform = 'translate(-50%, -50%) scale(1.6)';
    });
    btn.addEventListener('pointerleave', () => {
      circle.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });

  // Lerp interpolation & velocity deformation loop
  function animate() {
    requestAnimationFrame(animate);

    // Lerp smoothing
    const ease = 0.16;
    circleX += (mouseX - circleX) * ease;
    circleY += (mouseY - circleY) * ease;

    // Calculate velocity for deformation
    const vx = circleX - prevCircleX;
    const vy = circleY - prevCircleY;
    const speed = Math.hypot(vx, vy);
    const maxSpeed = 30;
    const clampedSpeed = Math.min(speed, maxSpeed);
    const stretch = 1 + (clampedSpeed / maxSpeed) * 0.4;
    const squeeze = 1 - (clampedSpeed / maxSpeed) * 0.2;

    const angle = Math.atan2(vy, vx) * (180 / Math.PI);

    if (!isHovered) {
      circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squeeze})`;
    } else {
      circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%) scale(1)`;
    }

    prevCircleX = circleX;
    prevCircleY = circleY;
  }

  animate();
})();

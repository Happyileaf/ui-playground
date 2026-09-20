// Standalone Vanilla JS for Interactive Buttons
(function () {
  const rippleBtn = document.getElementById('rippleBtn');

  if (rippleBtn) {
    rippleBtn.addEventListener('click', function (e) {
      const rect = rippleBtn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const circle = document.createElement('span');
      circle.classList.add('ripple-circle');
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;

      const diameter = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.marginLeft = circle.style.marginTop = `-${diameter / 2}px`;

      rippleBtn.appendChild(circle);

      circle.addEventListener('animationend', () => {
        circle.remove();
      });
    });
  }
})();

// Standalone 3D Perspective Tilt Card Script
(function () {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    const maxTilt = parseFloat(card.dataset.tiltMax) || 18;
    const layers = card.querySelectorAll('.layer');

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) * 2 - 1; // -1 to 1
      const percentY = (y / rect.height) * 2 - 1; // -1 to 1

      const rotateY = percentX * maxTilt;
      const rotateX = -percentY * maxTilt;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      // Dynamic Glare
      card.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);

      // Parallax Depth on internal layers
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 20;
        const moveX = percentX * (depth * 0.4);
        const moveY = percentY * (depth * 0.4);
        layer.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth}px)`;
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      layers.forEach((layer) => {
        layer.style.transform = 'translate3d(0px, 0px, 0px)';
      });
    });
  });
})();

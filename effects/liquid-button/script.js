(function () {
  const btn = document.getElementById('liquidBtn');
  const container = document.getElementById('blobsContainer');

  function createSplash(e) {
    const rect = btn.getBoundingClientRect();
    const originX = (e ? e.clientX - rect.left : rect.width / 2);
    const originY = (e ? e.clientY - rect.top : rect.height / 2);

    const blobCount = 12;
    for (let i = 0; i < blobCount; i++) {
      const blob = document.createElement('div');
      blob.classList.add('blob');

      const size = Math.random() * 28 + 14;
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.left = `${originX - size / 2}px`;
      blob.style.top = `${originY - size / 2}px`;

      container.appendChild(blob);

      const angle = (Math.PI * 2 * i) / blobCount + (Math.random() * 0.4 - 0.2);
      const distance = Math.random() * 65 + 45;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      const animation = blob.animate([
        {
          transform: 'translate(0px, 0px) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(${targetX * 0.7}px, ${targetY * 0.7}px) scale(1.1)`,
          offset: 0.4,
          opacity: 1
        },
        {
          transform: `translate(${targetX}px, ${targetY}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 650 + Math.random() * 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      });

      animation.onfinish = () => {
        blob.remove();
      };
    }
  }

  btn.addEventListener('pointerdown', (e) => {
    createSplash(e);
  });
})();

(function () {
  'use strict';

  const media = document.getElementById('media');
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  const bigHeart = document.getElementById('bigHeart');
  const burstLayer = document.getElementById('burstLayer');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BASE_COUNT = 1204;
  const PIECE_COLORS = ['#fb4d6d', '#ff7a90', '#ffa63d', '#c084fc', '#ffffff', '#fb7185'];
  const PIECE_GLYPHS = ['\u2665', '\u2764', '\u2728', '\u2605', '\u25CF'];

  let liked = false;
  let count = BASE_COUNT;
  let lastTap = 0;
  let heartTimer = null;

  function formatCount(n) {
    return n.toLocaleString('en-US');
  }

  function renderState() {
    likeBtn.classList.toggle('liked', liked);
    likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    likeCount.textContent = formatCount(count);
  }

  function spawnBurst(originX, originY) {
    if (reduceMotion) return;
    const rect = media.getBoundingClientRect();
    const cx = typeof originX === 'number' ? originX - rect.left : rect.width / 2;
    const cy = typeof originY === 'number' ? originY - rect.top : rect.height / 2;

    const total = 14;
    for (let i = 0; i < total; i++) {
      const piece = document.createElement('span');
      piece.className = 'burst-piece';
      piece.textContent = PIECE_GLYPHS[i % PIECE_GLYPHS.length];

      const angle = (Math.PI * 2 * i) / total + (Math.random() - 0.5) * 0.5;
      const distance = 70 + Math.random() * 70;
      const dx = Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : 1);
      const dy = Math.sin(angle) * distance - 30;
      const size = 11 + Math.random() * 9;

      piece.style.left = cx + 'px';
      piece.style.top = cy + 'px';
      piece.style.setProperty('--dx', dx.toFixed(1) + 'px');
      piece.style.setProperty('--dy', dy.toFixed(1) + 'px');
      piece.style.setProperty('--rot', (Math.random() * 240 - 120).toFixed(0) + 'deg');
      piece.style.setProperty('--size', size.toFixed(0) + 'px');
      piece.style.setProperty('--color', PIECE_COLORS[i % PIECE_COLORS.length]);

      burstLayer.appendChild(piece);
      requestAnimationFrame(function () {
        piece.classList.add('fly');
      });

      piece.addEventListener('animationend', function () {
        piece.remove();
      });
    }
  }

  function flashBigHeart(x, y) {
    if (reduceMotion) return;
    if (heartTimer) {
      clearTimeout(heartTimer);
      heartTimer = null;
    }
    bigHeart.classList.remove('pop');
    void bigHeart.offsetWidth;
    bigHeart.classList.add('pop');
    heartTimer = setTimeout(function () {
      bigHeart.classList.remove('pop');
    }, 900);
  }

  function like(x, y) {
    if (!liked) {
      liked = true;
      count += 1;
      flashBigHeart(x, y);
      spawnBurst(x, y);
    } else {
      liked = false;
      count -= 1;
    }
    renderState();
  }

  media.addEventListener('click', function (e) {
    const now = Date.now();
    if (now - lastTap < 320) {
      like(e.clientX, e.clientY);
      lastTap = 0;
    } else {
      lastTap = now;
    }
  });

  likeBtn.addEventListener('click', function (e) {
    like(e.clientX, e.clientY);
  });

  renderState();
})();

(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  const title = document.getElementById('heroTitle');
  const replayBtn = document.getElementById('replayBtn');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TEXT = '让每一个字，都拥有呼吸的节奏';
  const ACCENT_WORDS = ['呼吸'];
  const STEP = 70;
  const START = 80;

  function splitText() {
    title.innerHTML = '';
    Array.from(TEXT).forEach(function (ch, i) {
      const wrap = document.createElement('span');
      wrap.className = 'word';
      if (ACCENT_WORDS.indexOf(ch) !== -1) wrap.classList.add('accent');

      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = ch;
      inner.style.setProperty('--d', START + i * STEP + 'ms');

      wrap.appendChild(inner);
      title.appendChild(wrap);
    });
  }

  function play() {
    hero.classList.remove('play');
    title.classList.remove('play');
    void hero.offsetWidth;
    void title.offsetWidth;
    hero.classList.add('play');
    title.classList.add('play');
  }

  splitText();

  if (reduceMotion) {
    hero.classList.add('play');
    title.classList.add('play');
  } else {
    play();
  }

  replayBtn.addEventListener('click', play);

  if ('IntersectionObserver' in window && !reduceMotion) {
    let wasVisible = true;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !wasVisible) {
          play();
        }
        wasVisible = entry.isIntersecting;
      });
    }, { threshold: 0.4 });
    observer.observe(hero);
  }
})();

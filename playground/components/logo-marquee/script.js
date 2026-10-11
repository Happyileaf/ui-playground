(function () {
  'use strict';

  var track = document.getElementById('marqueeTrack');
  var leftBtn = document.getElementById('leftBtn');
  var rightBtn = document.getElementById('rightBtn');
  var pauseBtn = document.getElementById('pauseBtn');

  var originals = Array.prototype.slice.call(track.children);
  originals.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    track.classList.add('is-paused');
  }

  function setDirection(dir) {
    var isLeft = dir === 'left';
    track.classList.toggle('dir-right', !isLeft);
    leftBtn.classList.toggle('is-active', isLeft);
    rightBtn.classList.toggle('is-active', !isLeft);
    leftBtn.setAttribute('aria-pressed', String(isLeft));
    rightBtn.setAttribute('aria-pressed', String(!isLeft));
  }

  function togglePause() {
    var paused = track.classList.toggle('is-paused');
    pauseBtn.classList.toggle('is-active', paused);
    pauseBtn.setAttribute('aria-pressed', String(paused));
  }

  leftBtn.addEventListener('click', function () {
    setDirection('left');
  });

  rightBtn.addEventListener('click', function () {
    setDirection('right');
  });

  pauseBtn.addEventListener('click', togglePause);
})();

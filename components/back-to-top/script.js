(function () {
  var backTop = document.getElementById('backTop');
  var ringProgress = document.getElementById('ringProgress');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SHOW_OFFSET = 400;
  var ticking = false;

  var radius = parseFloat(ringProgress.getAttribute('r')) || 0;
  var circumference = 2 * Math.PI * radius;

  ringProgress.style.strokeDasharray = String(circumference);
  ringProgress.style.strokeDashoffset = String(circumference);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function update() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var progress = scrollable > 0 ? clamp(scrollTop / scrollable, 0, 1) : 0;

    ringProgress.style.strokeDashoffset = String(circumference * (1 - progress));

    if (scrollTop > SHOW_OFFSET) {
      backTop.classList.add('is-visible');
    } else {
      backTop.classList.remove('is-visible');
    }

    ticking = false;
  }

  function requestTick() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  backTop.addEventListener('click', scrollToTop);

  update();
})();

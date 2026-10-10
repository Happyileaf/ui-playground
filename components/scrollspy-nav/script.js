(function () {
  'use strict';

  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var select = document.getElementById('tocSelect');
  var progressBar = document.getElementById('progressBar');
  var headerOffset = 88;

  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var linkById = {};
  var indexById = {};
  links.forEach(function (link, i) {
    var id = link.getAttribute('href').slice(1);
    linkById[id] = link;
    indexById[id] = i;
  });

  var activeId = null;
  var knownIds = sections.map(function (section) { return section.id; });

  function setActive(id) {
    if (id === activeId || !linkById[id]) return;
    activeId = id;

    links.forEach(function (link) {
      var on = link === linkById[id];
      link.classList.toggle('is-active', on);
      if (on) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (select) select.value = '#' + id;
  }

  /* ---------- IntersectionObserver 滚动追踪 ---------- */

  var candidateId = null;
  var lastScrollY = window.scrollY || window.pageYOffset || 0;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var scrollingDown = scrollY >= lastScrollY;
      lastScrollY = scrollY;

      var visible = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.push(entry.target.id);
      });

      if (visible.length === 0) return;

      visible.sort(function (a, b) {
        return indexById[a] - indexById[b];
      });

      candidateId = scrollingDown ? visible[visible.length - 1] : visible[0];
      setActive(candidateId);
    }, {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- 兜底：纯滚动位置计算 ---------- */

  function fallbackSync() {
    var marker = (window.scrollY || window.pageYOffset || 0) + headerOffset + 2;
    var current = knownIds[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= marker) current = sections[i].id;
    }
    setActive(current);
  }

  if (!('IntersectionObserver' in window)) {
    fallbackSync();
  }

  /* ---------- 阅读进度条（rAF 节流） ---------- */

  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || window.pageYOffset || doc.scrollTop || 0;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

    if (progressBar) {
      progressBar.style.transform = 'scaleX(' + ratio + ')';
    }
    ticking = false;
  }

  function onScroll() {
    lastScrollY = window.scrollY || window.pageYOffset || 0;
    if (!('IntersectionObserver' in window)) fallbackSync();
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- 锚点点击：平滑滚动 + pushState ---------- */

  function jumpTo(id, push) {
    var target = document.getElementById(id);
    if (!target) return;

    if (push !== false && window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + id);
    }

    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    } else {
      var top = target.getBoundingClientRect().top
        + (window.scrollY || window.pageYOffset || 0) - headerOffset;
      window.scrollTo(0, top);
    }

    setActive(id);
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      jumpTo(link.getAttribute('href').slice(1), true);
    });
  });

  if (select) {
    select.addEventListener('change', function () {
      var value = select.value;
      if (value && value.charAt(0) === '#') {
        jumpTo(value.slice(1), true);
      }
    });
  }

  /* ---------- hashchange / popstate / load 初始定位 ---------- */

  function syncFromHash(scroll) {
    var hash = window.location.hash;
    if (!hash) return false;
    var id = hash.slice(1);
    if (!document.getElementById(id)) return false;
    if (scroll) {
      jumpTo(id, false);
    } else {
      setActive(id);
    }
    return true;
  }

  window.addEventListener('hashchange', function () {
    syncFromHash(false);
  });

  window.addEventListener('popstate', function () {
    syncFromHash(!reduceMotion);
  });

  function init() {
    if (!syncFromHash(false)) {
      if ('IntersectionObserver' in window) {
        setActive(knownIds[0]);
      } else {
        fallbackSync();
      }
    }
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

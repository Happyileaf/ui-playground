(function () {
  'use strict';

  var scenes = [
    { cls: 'scene-aurora', title: '极光穹顶', caption: '北极圈上空流动的绿色光幕' },
    { cls: 'scene-dune', title: '黄昏沙丘', caption: '撒哈拉落日下的暖色褶皱' },
    { cls: 'scene-ocean', title: '深海月光', caption: '夜航海面升起的一轮明月' },
    { cls: 'scene-forest', title: '雾中松林', caption: '清晨薄雾里的垂直林线' },
    { cls: 'scene-sunset', title: '紫橙日落', caption: '地平线上最后一束光' },
    { cls: 'scene-mono', title: '斜纹构成', caption: '纯灰阶几何习作' },
    { cls: 'scene-neon', title: '霓虹脉冲', caption: '赛博夜色中的双色光晕' },
    { cls: 'scene-lava', title: '熔岩裂口', caption: '地壳深处透出的炽红光' }
  ];

  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lbArt = document.getElementById('lbArt');
  var lbCaption = document.getElementById('lbCaption');
  var lbCounter = document.getElementById('lbCounter');
  var btnClose = document.getElementById('lbClose');
  var btnPrev = document.getElementById('lbPrev');
  var btnNext = document.getElementById('lbNext');

  var current = 0;
  var opener = null;

  function zoomIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', '11');
    c.setAttribute('cy', '11');
    c.setAttribute('r', '6.5');
    var l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l1.setAttribute('x1', '11');
    l1.setAttribute('y1', '8.5');
    l1.setAttribute('x2', '11');
    l1.setAttribute('y2', '13.5');
    var l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l2.setAttribute('x1', '8.5');
    l2.setAttribute('y1', '11');
    l2.setAttribute('x2', '13.5');
    l2.setAttribute('y2', '11');
    var l3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l3.setAttribute('x1', '16');
    l3.setAttribute('y1', '16');
    l3.setAttribute('x2', '20.5');
    l3.setAttribute('y2', '20.5');
    svg.appendChild(c);
    svg.appendChild(l1);
    svg.appendChild(l2);
    svg.appendChild(l3);
    return svg;
  }

  scenes.forEach(function (scene, index) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb';
    btn.setAttribute('aria-label', '查看作品：' + scene.title);

    var frame = document.createElement('span');
    frame.className = 'thumb-frame';

    var art = document.createElement('span');
    art.className = 'art ' + scene.cls;

    var zoom = document.createElement('span');
    zoom.className = 'zoom';
    zoom.appendChild(zoomIcon());

    var title = document.createElement('span');
    title.className = 'thumb-title';
    title.textContent = scene.title;

    frame.appendChild(art);
    frame.appendChild(zoom);
    btn.appendChild(frame);
    btn.appendChild(title);
    btn.addEventListener('click', function () {
      open(index, btn);
    });
    gallery.appendChild(btn);
  });

  function paint(animate) {
    var scene = scenes[current];
    lbArt.className = 'lb-art ' + scene.cls;
    if (animate) {
      lbArt.classList.remove('is-swap');
      void lbArt.offsetWidth;
      lbArt.classList.add('is-swap');
    }
    lbCaption.textContent = scene.title + ' · ' + scene.caption;
    lbCounter.textContent = current + 1 + ' / ' + scenes.length;
  }

  function open(index, from) {
    current = index;
    opener = from || document.activeElement;
    paint(false);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (opener && typeof opener.focus === 'function') {
      opener.focus();
    }
    opener = null;
  }

  function go(step) {
    current = (current + step + scenes.length) % scenes.length;
    paint(true);
  }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { go(-1); });
  btnNext.addEventListener('click', function () { go(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  var focusables = [btnPrev, btnClose, btnNext];

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
      btnPrev.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
      btnNext.focus();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var idx = focusables.indexOf(document.activeElement);
      if (idx === -1) {
        btnClose.focus();
        return;
      }
      var next = e.shiftKey ? idx - 1 : idx + 1;
      next = (next + focusables.length) % focusables.length;
      focusables[next].focus();
    }
  });
})();

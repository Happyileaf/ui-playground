(function () {
  'use strict';

  var canvas = document.getElementById('signCanvas');
  var wrap = document.getElementById('canvasWrap');
  var placeholder = document.getElementById('canvasPlaceholder');
  var undoBtn = document.getElementById('undoBtn');
  var clearBtn = document.getElementById('clearBtn');
  var saveBtn = document.getElementById('saveBtn');
  var statusLine = document.getElementById('statusLine');
  var exportPreview = document.getElementById('exportPreview');
  var previewImg = document.getElementById('previewImg');
  var downloadBtn = document.getElementById('downloadBtn');

  var ctx = canvas.getContext('2d');
  var strokes = [];
  var current = null;
  var drawing = false;
  var inkColor = '#e2e8f0';
  var MIN_WIDTH = 1.4;
  var MAX_WIDTH = 4.2;

  function setStatus(text, idle) {
    statusLine.textContent = text;
    statusLine.classList.toggle('is-idle', !!idle);
  }

  function syncButtons() {
    var hasInk = strokes.length > 0;
    undoBtn.disabled = !hasInk;
    clearBtn.disabled = !hasInk;
    saveBtn.disabled = !hasInk;
    wrap.classList.toggle('has-ink', hasInk);
  }

  function resizeCanvas() {
    var rect = wrap.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var data = null;
    if (strokes.length > 0 && canvas.width > 0) {
      data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redraw();
  }

  function drawSegment(p0, p1, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  function drawStroke(stroke) {
    var pts = stroke.points;
    if (pts.length === 1) {
      var p = pts[0];
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    for (var i = 1; i < pts.length; i++) {
      drawSegment(pts[i - 1], pts[i], stroke.color, (pts[i - 1].w + pts[i].w) / 2);
    }
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < strokes.length; i++) {
      drawStroke(strokes[i]);
    }
    if (current) {
      drawStroke(current);
    }
  }

  function pointFromEvent(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: e.timeStamp || performance.now()
    };
  }

  function widthFor(last, point) {
    var dx = point.x - last.x;
    var dy = point.y - last.y;
    var dt = Math.max(point.t - last.t, 1);
    var speed = Math.sqrt(dx * dx + dy * dy) / dt;
    var target = MAX_WIDTH - Math.min(speed * 2.2, MAX_WIDTH - MIN_WIDTH);
    return last.w * 0.65 + target * 0.35;
  }

  function paintPoints(events, fallback) {
    var list = events && events.length ? events : [fallback];
    for (var i = 0; i < list.length; i++) {
      var point = pointFromEvent(list[i]);
      var pts = current.points;
      if (pts.length > 0) {
        var prev = pts[pts.length - 1];
        point.w = widthFor(prev, point);
        drawSegment(prev, point, current.color, (prev.w + point.w) / 2);
      } else {
        point.w = MAX_WIDTH * 0.8;
        ctx.fillStyle = current.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      pts.push(point);
    }
  }

  function onPointerDown(e) {
    if (drawing) return;
    drawing = true;
    current = { color: inkColor, points: [] };
    canvas.setPointerCapture(e.pointerId);
    paintPoints(null, e);
    setStatus('正在书写…');
  }

  function onPointerMove(e) {
    if (!drawing || !current) return;
    var events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
    paintPoints(events, e);
  }

  function endStroke(e) {
    if (!drawing || !current) return;
    drawing = false;
    if (e && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (current.points.length > 0) {
      strokes.push(current);
    }
    current = null;
    syncButtons();
    setStatus('已记录 ' + strokes.length + ' 笔 · 可继续书写', true);
  }

  undoBtn.addEventListener('click', function () {
    strokes.pop();
    redraw();
    syncButtons();
    if (strokes.length === 0) {
      setStatus('就绪 · 等待落笔', true);
    } else {
      setStatus('已撤销 · 剩余 ' + strokes.length + ' 笔', true);
    }
  });

  clearBtn.addEventListener('click', function () {
    strokes = [];
    current = null;
    drawing = false;
    redraw();
    syncButtons();
    exportPreview.hidden = true;
    setStatus('已清空 · 等待落笔', true);
  });

  saveBtn.addEventListener('click', function () {
    var url = canvas.toDataURL('image/png');
    previewImg.src = url;
    exportPreview.hidden = false;
    downloadBtn.dataset.url = url;
    setStatus('已导出 PNG 图像');
  });

  downloadBtn.addEventListener('click', function () {
    var link = document.createElement('a');
    link.href = downloadBtn.dataset.url;
    link.download = 'signature.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  document.querySelectorAll('.swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.swatch').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      inkColor = btn.dataset.color;
    });
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 120);
  });

  resizeCanvas();
  syncButtons();
  setStatus('就绪 · 等待落笔', true);
})();

(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvasWrap');
  const cropBox = document.getElementById('cropBox');
  const zoomRange = document.getElementById('zoomRange');
  const zoomVal = document.getElementById('zoomVal');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const previewFrame = document.getElementById('previewFrame');
  const downloadBtn = document.getElementById('downloadBtn');
  const ratioBtns = Array.from(document.querySelectorAll('.ratio-btn'));

  const MIN_SIZE = 36;
  let ratio = 0;
  let imgCanvas = null;
  let zoom = 1;
  let lastExport = null;

  function buildSample() {
    const w = 1200;
    const h = 800;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');

    const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, '#1e2a5e');
    sky.addColorStop(0.55, '#6d4a9e');
    sky.addColorStop(1, '#e8879f');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    const sun = g.createRadialGradient(w * 0.68, h * 0.42, 10, w * 0.68, h * 0.42, 120);
    sun.addColorStop(0, 'rgba(255,236,190,0.95)');
    sun.addColorStop(1, 'rgba(255,236,190,0)');
    g.fillStyle = sun;
    g.beginPath();
    g.arc(w * 0.68, h * 0.42, 120, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffe9bd';
    g.beginPath();
    g.arc(w * 0.68, h * 0.42, 46, 0, Math.PI * 2);
    g.fill();

    function ridge(base, amp, color, seed) {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, base);
      for (let x = 0; x <= w; x += 60) {
        const y = base - (Math.sin(x * 0.004 + seed) * 0.5 + 0.5) * amp - Math.sin(x * 0.013 + seed * 2) * amp * 0.25;
        g.lineTo(x, y);
      }
      g.lineTo(w, h);
      g.closePath();
      g.fill();
    }

    ridge(h * 0.66, 120, '#5a3f7d', 1.2);
    ridge(h * 0.76, 90, '#3c3160', 3.1);
    ridge(h * 0.86, 60, '#22213f', 5.4);

    const lake = g.createLinearGradient(0, h * 0.74, 0, h);
    lake.addColorStop(0, '#3a3f6e');
    lake.addColorStop(1, '#141a33');
    g.fillStyle = lake;
    g.fillRect(0, h * 0.78, w, h * 0.22);

    g.fillStyle = 'rgba(255,225,170,0.35)';
    g.beginPath();
    g.ellipse(w * 0.68, h * 0.84, 70, 12, 0, 0, Math.PI * 2);
    g.fill();

    return c;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function imageRect() {
    const rect = wrap.getBoundingClientRect();
    const scale = Math.min(rect.width / imgCanvas.width, rect.height / imgCanvas.height) * zoom;
    const dw = imgCanvas.width * scale;
    const dh = imgCanvas.height * scale;
    return {
      x: (rect.width - dw) / 2,
      y: (rect.height - dh) / 2,
      w: dw,
      h: dh,
      scale,
    };
  }

  function draw() {
    if (!imgCanvas) return;
    const rect = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const r = imageRect();
    ctx.fillStyle = '#05080b';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgCanvas, r.x, r.y, r.w, r.h);
  }

  function boxRect() {
    return {
      x: cropBox.offsetLeft,
      y: cropBox.offsetTop,
      w: cropBox.offsetWidth,
      h: cropBox.offsetHeight,
    };
  }

  function setBox(x, y, w, h) {
    const maxW = wrap.clientWidth;
    const maxH = wrap.clientHeight;
    cropBox.style.left = `${Math.min(Math.max(x, 0), maxW - w)}px`;
    cropBox.style.top = `${Math.min(Math.max(y, 0), maxH - h)}px`;
    cropBox.style.width = `${w}px`;
    cropBox.style.height = `${h}px`;
  }

  function clampBoxToImage() {
    const r = imageRect();
    const b = boxRect();
    const x1 = Math.max(b.x, r.x);
    const y1 = Math.max(b.y, r.y);
    const x2 = Math.min(b.x + b.w, r.x + r.w);
    const y2 = Math.min(b.y + b.h, r.y + r.h);
    let w = x2 - x1;
    let h = y2 - y1;
    if (w < MIN_SIZE || h < MIN_SIZE) return;
    if (ratio) {
      if (w / h > ratio) w = h * ratio;
      else h = w / ratio;
    }
    setBox(x1, y1, w, h);
  }

  let drag = null;

  function onPointerDown(e) {
    const handleEl = e.target.closest('.handle');
    const isMove = !handleEl;
    if (!handleEl && !cropBox.contains(e.target)) return;
    e.preventDefault();
    cropBox.setPointerCapture(e.pointerId);
    const b = boxRect();
    drag = {
      mode: handleEl ? handleEl.dataset.handle : 'move',
      startX: e.clientX,
      startY: e.clientY,
      box: b,
      isMove,
    };
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const b = drag.box;
    const r = imageRect();

    if (drag.mode === 'move') {
      let nx = b.x + dx;
      let ny = b.y + dy;
      nx = Math.min(Math.max(nx, r.x), r.x + r.w - b.w);
      ny = Math.min(Math.max(ny, r.y), r.y + r.h - b.h);
      setBox(nx, ny, b.w, b.h);
      return;
    }

    let left = b.x;
    let top = b.y;
    let right = b.x + b.w;
    let bottom = b.y + b.h;

    if (drag.mode.includes('w')) left = b.x + dx;
    if (drag.mode.includes('e')) right = b.x + b.w + dx;
    if (drag.mode.includes('n')) top = b.y + dy;
    if (drag.mode.includes('s')) bottom = b.y + b.h + dy;

    const bounds = {
      left: r.x,
      top: r.y,
      right: r.x + r.w,
      bottom: r.y + r.h,
    };

    if (ratio) {
      const anchorX = drag.mode.includes('w') ? right : left;
      const anchorY = drag.mode.includes('n') ? bottom : top;
      let rawW = right - left;
      let rawH = bottom - top;

      if (drag.mode.length === 2) {
        if (rawW >= rawH * ratio) rawH = rawW / ratio;
        else rawW = rawH * ratio;
      } else if (drag.mode === 'w' || drag.mode === 'e') {
        rawH = rawW / ratio;
      } else {
        rawW = rawH * ratio;
      }

      const maxW = drag.mode.includes('w')
        ? anchorX - bounds.left
        : bounds.right - anchorX;
      const maxH = drag.mode.includes('n')
        ? anchorY - bounds.top
        : bounds.bottom - anchorY;

      const fit = Math.min(1, maxW / rawW, maxH / rawH);
      rawW *= fit;
      rawH *= fit;

      left = anchorX - (drag.mode.includes('w') ? rawW : 0);
      right = anchorX + (drag.mode.includes('e') ? rawW : 0);
      top = anchorY - (drag.mode.includes('n') ? rawH : 0);
      bottom = anchorY + (drag.mode.includes('s') ? rawH : 0);
    } else {
      left = Math.max(left, bounds.left);
      top = Math.max(top, bounds.top);
      right = Math.min(right, bounds.right);
      bottom = Math.min(bottom, bounds.bottom);
    }

    if (right - left < MIN_SIZE) right = left + MIN_SIZE;
    if (bottom - top < MIN_SIZE) bottom = top + MIN_SIZE;

    setBox(left, top, right - left, bottom - top);
  }

  function onPointerUp(e) {
    if (!drag) return;
    drag = null;
    try {
      cropBox.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* pointer already released */
    }
  }

  cropBox.addEventListener('pointerdown', onPointerDown);
  cropBox.addEventListener('pointermove', onPointerMove);
  cropBox.addEventListener('pointerup', onPointerUp);
  cropBox.addEventListener('pointercancel', onPointerUp);

  ratioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const val = btn.dataset.ratio;
      ratio = val === 'free' ? 0 : parseFloat(val);
      if (ratio) {
        const b = boxRect();
        const centerX = b.x + b.w / 2;
        const centerY = b.y + b.h / 2;
        let nw = Math.min(b.w, wrap.clientWidth);
        let nh = nw / ratio;
        if (nh > wrap.clientHeight) {
          nh = wrap.clientHeight;
          nw = nh * ratio;
        }
        setBox(centerX - nw / 2, centerY - nh / 2, nw, nh);
        clampBoxToImage();
      }
    });
  });

  zoomRange.addEventListener('input', () => {
    zoom = parseFloat(zoomRange.value);
    zoomVal.textContent = `${Math.round(zoom * 100)}%`;
    draw();
    clampBoxToImage();
  });

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      imgCanvas = c;
      URL.revokeObjectURL(url);
      zoom = 1;
      zoomRange.value = '1';
      zoomVal.textContent = '100%';
      draw();
      resetDefaultBox();
    };
    img.src = url;
  });

  function resetDefaultBox() {
    const r = imageRect();
    const size = Math.min(r.w, r.h, 280);
    setBox(r.x + (r.w - size) / 2, r.y + (r.h - size) / 2, size, size);
  }

  confirmBtn.addEventListener('click', () => {
    const r = imageRect();
    const b = boxRect();
    const sx = (b.x - r.x) / r.scale;
    const sy = (b.y - r.y) / r.scale;
    const sw = b.w / r.scale;
    const sh = b.h / r.scale;

    const out = document.createElement('canvas');
    out.width = 512;
    out.height = Math.round(512 * (sh / sw));
    const octx = out.getContext('2d');
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(imgCanvas, sx, sy, sw, sh, 0, 0, out.width, out.height);

    lastExport = out.toDataURL('image/png');
    previewFrame.innerHTML = '';
    const imgEl = document.createElement('img');
    imgEl.src = lastExport;
    imgEl.alt = '裁剪结果预览';
    previewFrame.appendChild(imgEl);
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener('click', () => {
    if (!lastExport) return;
    const a = document.createElement('a');
    a.href = lastExport;
    a.download = 'cropped.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = null;
      resizeCanvas();
      clampBoxToImage();
    });
  });

  imgCanvas = buildSample();
  resizeCanvas();
  resetDefaultBox();
})();

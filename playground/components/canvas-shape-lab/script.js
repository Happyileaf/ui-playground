/* ============================================================
 * Canvas Shape Lab · 即时渲染图形实验室
 * 教学核心：Canvas 是 immediate-mode API ——
 * 图形的真相之源是 JS 数组 shapes[]，每次交互后整画布按数据重绘。
 * ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvasWrap');
  const emptyHint = document.getElementById('canvasEmpty');

  const inspector = document.getElementById('inspector');
  const inspectorSub = document.getElementById('inspectorSub');
  const shapeCountEl = document.getElementById('shapeCount');
  const frameCountEl = document.getElementById('frameCount');
  const statusLine = document.getElementById('statusLine');

  const addRectBtn = document.getElementById('addRectBtn');
  const addEllipseBtn = document.getElementById('addEllipseBtn');
  const duplicateBtn = document.getElementById('duplicateBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const resetBtn = document.getElementById('resetBtn');

  const PALETTE = [
    { fill: 'rgba(34, 211, 238, 0.78)', stroke: '#22d3ee' },  // cyan
    { fill: 'rgba(52, 211, 153, 0.72)', stroke: '#34d399' },  // emerald
    { fill: 'rgba(251, 191, 36, 0.72)', stroke: '#fbbf24' },  // amber
    { fill: 'rgba(244, 114, 182, 0.72)', stroke: '#f472b6' }, // pink
    { fill: 'rgba(167, 139, 250, 0.72)', stroke: '#a78bfa' }, // violet
    { fill: 'rgba(96, 165, 250, 0.78)', stroke: '#60a5fa' }   // blue
  ];

  // 8 个缩放手柄：[nx, ny]，分量取值 -1 / 0 / 1
  const HANDLES = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];
  const HANDLE_SIZE = 8;        // 手柄边长（CSS px）
  const MIN_SIZE = 24;          // 最小宽高

  // 初始布局按画布比例生成，窄屏下自动收缩，保证完整可见
  function createInitialShapes() {
    const W = canvas.clientWidth || 720;
    const H = canvas.clientHeight || 460;
    const rw = Math.min(W * 0.22, 160);
    const eh = Math.min(H * 0.32, 140);
    return [
      {
        id: 1, type: 'rect',
        x: W * 0.08, y: H * 0.16, w: rw, h: rw * 0.7,
        fill: PALETTE[5].fill, stroke: PALETTE[5].stroke
      },
      {
        id: 2, type: 'ellipse',
        x: W * 0.39, y: H * 0.34, w: eh * 1.35, h: eh,
        fill: PALETTE[1].fill, stroke: PALETTE[1].stroke
      },
      {
        id: 3, type: 'rect',
        x: W * 0.72, y: H * 0.14, w: rw * 0.82, h: rw,
        fill: PALETTE[2].fill, stroke: PALETTE[2].stroke
      }
    ];
  }

  // —— 真相之源：所有图形都只是 JS 对象 ——
  let shapes = [];
  let nextId = 4;

  let selectedId = null;
  let frameCount = 0;

  // 指针交互状态
  let interaction = null; // { mode: 'move' | 'resize', id, pointerId, offsetX?, offsetY?, handle?, start? }

  /* ---------------- 画布尺寸（DPR 高清渲染） ---------------- */

  let initialized = false;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 首次尺寸就绪后按当前视口生成初始数据；之后仅重绘，不覆盖用户操作
    if (!initialized && rect.width > 0) {
      shapes = createInitialShapes();
      initialized = true;
      updateInspector();
    }
    draw();
  }

  /* ---------------- 绘制（每次都全量重绘） ---------------- */

  function drawShapePath(s) {
    ctx.beginPath();
    if (s.type === 'ellipse') {
      ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
    } else {
      const r = Math.min(10, s.w / 4, s.h / 4);
      ctx.roundRect ? ctx.roundRect(s.x, s.y, s.w, s.h, r) : ctx.rect(s.x, s.y, s.w, s.h);
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // 图形按数组顺序绘制 —— 索引越靠后，层级越靠上
    for (const s of shapes) {
      const selected = s.id === selectedId;

      ctx.save();
      if (selected) {
        ctx.shadowColor = s.stroke;
        ctx.shadowBlur = 18;
      }
      drawShapePath(s);
      ctx.fillStyle = s.fill;
      ctx.fill();
      ctx.restore();

      drawShapePath(s);
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeStyle = selected ? s.stroke : 'rgba(226, 232, 240, 0.28)';
      ctx.stroke();

      // 标签
      ctx.fillStyle = 'rgba(226, 238, 246, 0.85)';
      ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${s.type === 'ellipse' ? 'ELLIPSE' : 'RECT'} #${s.id}`,
        s.x + s.w / 2,
        s.y + s.h / 2
      );

      // 选中框 + 8 向缩放手柄
      if (selected) {
        const bx = s.x - 5;
        const by = s.y - 5;
        const bw = s.w + 10;
        const bh = s.h + 10;

        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = s.stroke;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.restore();

        for (const [nx, ny] of HANDLES) {
          const hx = s.x + ((nx + 1) / 2) * s.w;
          const hy = s.y + ((ny + 1) / 2) * s.h;
          ctx.fillStyle = '#0b1014';
          ctx.strokeStyle = s.stroke;
          ctx.lineWidth = 1.6;
          ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
          ctx.strokeRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        }
      }
    }

    frameCount++;
    frameCountEl.textContent = String(frameCount);
  }

  /* ---------------- 命中检测 ---------------- */

  function getPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  }

  function pointInShape(p, s) {
    if (s.type === 'ellipse') {
      const rx = s.w / 2;
      const ry = s.h / 2;
      if (rx <= 0 || ry <= 0) return false;
      const dx = (p.x - (s.x + rx)) / rx;
      const dy = (p.y - (s.y + ry)) / ry;
      return dx * dx + dy * dy <= 1;
    }
    return p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h;
  }

  // 自顶向下命中：视觉最上层的图形优先
  function findShape(p) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (pointInShape(p, shapes[i])) return shapes[i];
    }
    return null;
  }

  function getHandle(s, p) {
    const half = HANDLE_SIZE; // 适当放大触摸热区
    for (const [nx, ny] of HANDLES) {
      const hx = s.x + ((nx + 1) / 2) * s.w;
      const hy = s.y + ((ny + 1) / 2) * s.h;
      if (
        p.x >= hx - half && p.x <= hx + half &&
        p.y >= hy - half && p.y <= hy + half
      ) {
        return { nx, ny };
      }
    }
    return null;
  }

  /* ---------------- 数据检查器 ---------------- */

  function publicShape(s) {
    return {
      id: s.id,
      type: s.type,
      x: Math.round(s.x),
      y: Math.round(s.y),
      w: Math.round(s.w),
      h: Math.round(s.h)
    };
  }

  function updateInspector() {
    shapeCountEl.textContent = String(shapes.length);
    emptyHint.hidden = shapes.length !== 0;

    const selected = shapes.find((s) => s.id === selectedId) || null;

    if (shapes.length === 0) {
      inspectorSub.textContent = '空数组';
      inspector.textContent = '// shapes = []\n// 画布上没有任何像素被 Canvas 记住';
      return;
    }

    // 完整渲染 shapes 数据，选中对象整段高亮
    const lines = ['// shapes = ['];
    shapes.forEach((s, i) => {
      const data = publicShape(s);
      const body =
        `  { id: ${data.id}, type: "${data.type}", ` +
        `x: ${data.x}, y: ${data.y}, w: ${data.w}, h: ${data.h} }` +
        (i < shapes.length - 1 ? ',' : '');
      lines.push(body);
    });
    lines.push(']');
    inspector.textContent = lines.join('\n');

    if (selected) {
      inspectorSub.textContent = `选中 #${selected.id} · ${selected.type === 'ellipse' ? '椭圆' : '矩形'}`;
      highlightSelectedInInspector(selected.id);
    } else {
      inspectorSub.textContent = `共 ${shapes.length} 个对象`;
      inspector.style.color = '';
    }
  }

  // 用高亮节点替换选中行（保持其余文本由 textContent 生成，安全无注入）
  function highlightSelectedInInspector(id) {
    const walker = document.createTreeWalker(inspector, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    const target = nodes.find((n) => new RegExp(`id: ${id}[,}]`).test(n.nodeValue));
    if (!target) return;

    const frag = document.createDocumentFragment();
    const lines = target.nodeValue.split('\n');
    lines.forEach((line, idx) => {
      if (new RegExp(`id: ${id}[,}]`).test(line)) {
        const mark = document.createElement('span');
        mark.className = 'is-active-line';
        mark.textContent = line;
        frag.appendChild(mark);
      } else {
        frag.appendChild(document.createTextNode(line));
      }
      if (idx < lines.length - 1) frag.appendChild(document.createTextNode('\n'));
    });
    target.replaceWith(frag);
  }

  function setStatus(text, idle) {
    statusLine.textContent = text;
    statusLine.classList.toggle('is-idle', !!idle);
  }

  /* ---------------- 选择与操作 ---------------- */

  function selectShape(id) {
    selectedId = id;
    syncButtons();
    updateInspector();
  }

  function bringToFront(s) {
    const idx = shapes.indexOf(s);
    if (idx === -1 || idx === shapes.length - 1) return;
    shapes.splice(idx, 1);
    shapes.push(s);
  }

  function addShape(type) {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const w = 110 + Math.round(Math.random() * 60);
    const h = 84 + Math.round(Math.random() * 60);
    const palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const shape = {
      id: nextId++,
      type,
      x: Math.round(24 + Math.random() * Math.max(1, cw - w - 48)),
      y: Math.round(20 + Math.random() * Math.max(1, ch - h - 40)),
      w,
      h,
      fill: palette.fill,
      stroke: palette.stroke
    };
    shapes.push(shape);
    selectShape(shape.id);
    setStatus(`已创建 ${type === 'ellipse' ? '椭圆' : '矩形'} #${shape.id}，并置于最上层`);
    draw();
  }

  function deleteSelected() {
    if (selectedId === null) return;
    const id = selectedId;
    shapes = shapes.filter((s) => s.id !== id);
    selectShape(null);
    setStatus(`已删除 #${id} —— 对象消失，下一次重绘便不再有它`, true);
    draw();
  }

  function duplicateSelected() {
    const src = shapes.find((s) => s.id === selectedId);
    if (!src) return;
    const copy = {
      ...src,
      id: nextId++,
      x: Math.min(src.x + 24, canvas.clientWidth - src.w - 12),
      y: Math.min(src.y + 24, canvas.clientHeight - src.h - 12)
    };
    shapes.push(copy);
    selectShape(copy.id);
    setStatus(`已复制为 #${copy.id}（新对象压入数组末尾，位于最上层）`);
    draw();
  }

  function nudgeSelected(dx, dy) {
    const s = shapes.find((sh) => sh.id === selectedId);
    if (!s) return;
    s.x += dx;
    s.y += dy;
    updateInspector();
    draw();
  }

  function resetLab() {
    shapes = createInitialShapes();
    nextId = 4;
    selectShape(null);
    setStatus('画布已重置为初始数据', true);
    draw();
  }

  function syncButtons() {
    const hasSelection = selectedId !== null;
    deleteBtn.disabled = !hasSelection;
    duplicateBtn.disabled = !hasSelection;
  }

  /* ---------------- 指针交互 ---------------- */

  canvas.addEventListener('pointerdown', (event) => {
    const p = getPoint(event);
    const selected = shapes.find((s) => s.id === selectedId) || null;

    // 1. 优先命中选中图形的缩放手柄
    if (selected) {
      const handle = getHandle(selected, p);
      if (handle) {
        interaction = {
          mode: 'resize',
          id: selected.id,
          pointerId: event.pointerId,
          handle,
          start: { x: p.x, y: p.y, w: selected.w, h: selected.h, sx: selected.x, sy: selected.y }
        };
        canvas.setPointerCapture(event.pointerId);
        setStatus('缩放中：对象的 w / h 正在被改写……');
        return;
      }
    }

    // 2. 命中图形 → 选中、置顶并准备拖动
    const target = findShape(p);
    if (target) {
      bringToFront(target);
      selectShape(target.id);
      interaction = {
        mode: 'move',
        id: target.id,
        pointerId: event.pointerId,
        offsetX: p.x - target.x,
        offsetY: p.y - target.y
      };
      canvas.setPointerCapture(event.pointerId);
      setStatus(`拖动 #${target.id}：每移动 1px，x / y 更新并重绘整帧`);
      draw();
      return;
    }

    // 3. 点空白 → 取消选中
    selectShape(null);
    setStatus('已取消选中', true);
    draw();
  });

  canvas.addEventListener('pointermove', (event) => {
    const p = getPoint(event);

    if (!interaction) {
      updateHoverCursor(p);
      return;
    }

    const s = shapes.find((sh) => sh.id === interaction.id);
    if (!s) {
      interaction = null;
      return;
    }

    if (interaction.mode === 'move') {
      s.x = clamp(p.x - interaction.offsetX, 0, canvas.clientWidth - s.w);
      s.y = clamp(p.y - interaction.offsetY, 0, canvas.clientHeight - s.h);
    } else {
      applyResize(s, interaction.handle, interaction.start, p);
    }

    updateInspector();
    draw();
  });

  function endInteraction(event) {
    if (!interaction) return;
    if (event && interaction.pointerId !== undefined && canvas.hasPointerCapture(interaction.pointerId)) {
      canvas.releasePointerCapture(interaction.pointerId);
    }
    interaction = null;
    setStatus('就绪 · 点击图形选中，拖动移动，拖手柄缩放', true);
  }

  canvas.addEventListener('pointerup', endInteraction);
  canvas.addEventListener('pointercancel', endInteraction);

  // 双击空白：按图形按钮顺序快速创建矩形
  canvas.addEventListener('dblclick', (event) => {
    const p = getPoint(event);
    if (findShape(p)) return;
    const shape = {
      id: nextId++,
      type: 'rect',
      x: Math.round(clamp(p.x - 60, 8, canvas.clientWidth - 128)),
      y: Math.round(clamp(p.y - 42, 8, canvas.clientHeight - 92)),
      w: 120,
      h: 84,
      ...PALETTE[Math.floor(Math.random() * PALETTE.length)]
    };
    shapes.push(shape);
    selectShape(shape.id);
    setStatus(`双击空白创建 #${shape.id}`);
    draw();
  });

  function applyResize(s, handle, start, p) {
    const [nx, ny] = [handle.nx, handle.ny];
    const dx = p.x - start.x;
    const dy = p.y - start.y;

    let newX = start.sx;
    let newY = start.sy;
    let newW = start.w;
    let newH = start.h;

    if (nx === 1) {
      newW = Math.max(MIN_SIZE, start.w + dx);
    } else if (nx === -1) {
      newW = Math.max(MIN_SIZE, start.w - dx);
      newX = start.sx + (start.w - newW);
    }

    if (ny === 1) {
      newH = Math.max(MIN_SIZE, start.h + dy);
    } else if (ny === -1) {
      newH = Math.max(MIN_SIZE, start.h - dy);
      newY = start.sy + (start.h - newH);
    }

    s.x = newX;
    s.y = newY;
    s.w = newW;
    s.h = newH;
  }

  function updateHoverCursor(p) {
    const selected = shapes.find((s) => s.id === selectedId);
    if (selected) {
      const handle = getHandle(selected, p);
      if (handle) {
        canvas.style.cursor = cursorForHandle(handle.nx, handle.ny);
        return;
      }
    }
    canvas.style.cursor = findShape(p) ? 'grab' : 'default';
  }

  function cursorForHandle(nx, ny) {
    if (nx === 0) return ny === -1 ? 'ns-resize' : 'ns-resize';
    if (ny === 0) return 'ew-resize';
    return (nx === ny) ? 'nwse-resize' : 'nesw-resize';
  }

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), Math.max(min, max));
  }

  /* ---------------- 键盘快捷键 ---------------- */

  window.addEventListener('keydown', (event) => {
    const meta = event.metaKey || event.ctrlKey;

    if (meta && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      duplicateSelected();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedId !== null) {
        event.preventDefault();
        deleteSelected();
      }
      return;
    }

    if (event.key === 'Escape') {
      selectShape(null);
      draw();
      return;
    }

    const step = event.shiftKey ? 10 : 1;
    const arrows = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step]
    };
    if (arrows[event.key] && selectedId !== null) {
      event.preventDefault();
      nudgeSelected(arrows[event.key][0], arrows[event.key][1]);
    }
  });

  /* ---------------- 工具栏 ---------------- */

  addRectBtn.addEventListener('click', () => addShape('rect'));
  addEllipseBtn.addEventListener('click', () => addShape('ellipse'));
  duplicateBtn.addEventListener('click', duplicateSelected);
  deleteBtn.addEventListener('click', deleteSelected);
  resetBtn.addEventListener('click', resetLab);

  /* ---------------- 启动 ---------------- */

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  syncButtons();
  updateInspector();
  setStatus('就绪 · 点击图形选中，拖动移动，拖手柄缩放', true);
})();

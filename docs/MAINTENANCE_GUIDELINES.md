# 维护规范、品质准则与故障排查

> 本文档规定了编写与维护案例时的 Native Web 编码标准、防 AI Slop 审美基准以及常见问题的排查与解决方法。

---

## 1. 原生 Web (Vanilla) 编码规范

在编写或修改 `/effects/` 与 `/components/` 案例时，请遵循以下规范：

### A. JavaScript 与事件处理规范
- **统一指针事件 (Pointer Events)**：优先使用 `pointerdown`、`pointermove`、`pointerup`，而不是分别编写 `mousedown` 和 `touchstart`，以实现鼠标与触屏设备的无缝统一支持。
- **高分屏 (DPI) Canvas 适配**：
  必须基于 `window.devicePixelRatio` 进行物理像素缩放，避免高清屏上画面模糊：
  ```javascript
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  ```
- **动画循环与帧率解耦**：
  始终使用 `requestAnimationFrame(animate)`，并通过 `timestamp` 计算帧间时间差（Delta Time），确保在不同刷新率的屏幕上运动速度一致。
- **Web Audio 交互激活规范**：
  浏览器的 `AudioContext` 必须在用户首次发生交互手势（点击或触摸）后才能正常播放声音。建议懒加载初始化或在交互事件中执行 `audioCtx.resume()`。

### B. CSS 样式规范
- **原生变量与主题体系**：使用原生 CSS 变量（如 `:root { --accent: #3b82f6; }`）。
- **现代布局优先**：优先使用 CSS Grid 与带 `gap` 的 Flexbox 布局。
- **零依赖泄露**：严禁在案例内通过 CDN 或 npm 引入外部庞大的 CSS 框架，确保每个案例的样式完全自成体系。

---

## 2. 防“AI 廉价感 (Anti-Slop)”设计准则

请严格遵循克制、典雅的设计规范，拒绝常见的 AI 模板套路：
- **配色克制**：
  - 严禁使用泛滥的蓝紫渐变、高饱和刺眼霓虹字。
  - 采用具有微弱色温倾向的精致暗色/中性色（例如 `#0b0f19`、`#0f172a`、`#1e293b`）。
- **排版与层次**：
  - 采用系统原生现代无衬线字体族（`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`）。
  - 文字与背景的对比度需严格达到 WCAG AA 标准（正文对比度 ≥ 4.5:1）。
- **触控与防换行**：
  - 移动端可点击区域最小尺寸不低于 `44px x 44px`。
  - 按钮内部文字必须始终保持单行，禁止出现尴尬折行。

---

## 3. 统一案例视觉 HUD 规范：强制 Title 模块与按需控制面板 (Title & Control Dock Standard)

为了让所有案例在独立运行与工作台沙箱中保持极致纯净、统一克制的高级感（Obsidian Micro-HUD），制定以下视觉与控制层标准：

### 核心铁律
1. **Title 品牌模块（强制必备，Mandatory）**：
   - **每个特效案例都必须包含右上角 Title 模块**，用于呈现当前案例的中文名与英文标识。
   - **位置规范**：固定在右上角 `.hud-actions` 容器中（若有设置按钮，则位于设置按钮左侧）。
   - **尺寸与对齐**：固定高度 `32px`（`box-sizing: border-box; padding: 0 14px;`），圆角胶囊 `border-radius: 999px`，背景为高质感毛玻璃（`background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(16px);`）。
   - **固定点阵指示灯**：左侧带有 6px 呼吸光点（`.hud-dot`）。**必须采用固定主题色**（如深空青 `#38bdf8`、金光 `#f59e0b` 或赤红 `#f43f5e`），**严禁随面板内部色彩参数切换而联动改变**，确保标识的视觉稳定性。
   - **防折行约束**：标题文字必须单行显示（`white-space: nowrap; line-height: 1;`），禁止任何换行。

2. **控制面板模块（按需引入，Optional）**：
   - **不是每个特效都必须有控制面板**。仅当判断该特效确实需要参数对比调谐（如物理重力、粒子密度、绽放形态、调色板预设）时，才按需引入。
   - **如果引入控制面板，必须严格遵循统一的 Micro-HUD 规范**：
     - **默认状态必须为收起**：初始加载时面板默认隐藏（赋予 `.control-dock.hidden` 类名），保证初次呈现给用户的是无遮挡的纯净视觉。
     - **唤醒与折叠交互**：
       - 点击右上角极简齿轮图标按钮（`#btnToggleHud`）触发展开/收起。
       - 支持键盘全局快捷键 **`H`** 切换显隐，支持 **`Escape`** 快捷键收起。
     - **标准结构**：
       - **顶部标题与快捷提示**：包含面板名称与 `按 H 收起` 提示。
       - **快捷演进操控区**（可选）：2 列网格（`.dock-quick-actions`），用于连发开关、音效开关、齐发或重置。
       - **形态/色彩选择晶片**（可选）：2 列网格（`.palette-grid`），使用 `.shape-chip` 与 `.palette-chip`。
       - **参数滑块组**（可选）：包含标签、实时数值胶囊（`.slider-val`）与轻量化 range 滑块。
       - **底部重置栏**：包含全宽边框风格的「重置默认参数」按钮（`.btn-reset`）。
     - **防穿透铁律**：必须在 JS 中为 `.control-dock` 与 `.hud-actions` 注册 `stopPropagation()`，禁止面板上的点击/拖拽穿透到底层 Canvas 触发意外的粒子发射或物理扰动。

3. **底部交互指引胶囊（建议按需配备）**：
   - 底部居中悬浮（`bottom: 20px; left: 50%; transform: translateX(-50%);`）。
   - 统一高度 `32px`、`padding: 0 16px`、圆角 `999px`、`pointer-events: none`。
   - 包含微光小圆点与单行简练的操作提示（例如：`点击画布释放引力波 · 按 H 切换控制台`）。

---

### 标准 DOM 骨架模板 (HTML)

```html
<!-- Top Floating Controls (Title 必须存在，设置按钮仅在有控制面板时存在) -->
<div class="hud-actions">
  <div class="hud-brand" id="hudBrand">
    <span class="hud-dot"></span>
    <span class="hud-title">案例名称 · ENGLISH SUBTITLE</span>
  </div>
  <!-- 仅当需要控制面板时添加下方按钮 -->
  <button type="button" class="btn-tool btn-icon-only" id="btnToggleHud" title="隐藏/显示控制台 (H)" aria-label="切换控制面板">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  </button>
</div>

<!-- Floating Parametric Controller Panel (HUD) - 仅在需要时引入，且默认 class="control-dock hidden" -->
<aside class="control-dock hidden" id="controlDock">
  <div class="dock-header">
    <span class="dock-heading">参数物理调谐器</span>
    <span class="dock-shortcut">按 H 收起</span>
  </div>
  <!-- 业务调谐项... -->
  <div class="dock-footer">
    <button type="button" class="btn-reset" id="btnResetParams">重置默认参数</button>
  </div>
</aside>

<!-- Bottom Interactive Helper Hint (按需配备) -->
<div class="bottom-hint" id="bottomHint">
  <span class="hint-dot"></span>
  <span class="hint-msg">交互提示文案 · 按 H 切换控制台</span>
</div>
```

---

### 标准 CSS 模板

```css
/* 右上角 HUD 工具栏 */
.hud-actions {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

/* 强制必备：Title 徽标 */
.hud-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0 14px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  line-height: 1;
}

.hud-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8; /* 固定主题色 */
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

.hud-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: #ffffff;
  line-height: 1;
  white-space: nowrap;
}

/* 齿轮触发按钮 (32px x 32px) */
.btn-tool.btn-icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  backdrop-filter: blur(16px);
  transition: all 0.2s ease;
}

.btn-tool.btn-icon-only:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

/* 控制面板主体 (默认 hidden) */
.control-dock {
  position: fixed;
  top: 64px;
  right: 24px;
  width: 310px;
  max-height: calc(100vh - 110px);
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 20px 48px -8px rgba(0, 0, 0, 0.65);
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px 18px;
  gap: 16px;
  transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              visibility 0.28s;
  transform-origin: top right;
}

.control-dock.hidden {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.96);
  pointer-events: none;
}
```

---

## 4. 常见问题排查与修复指南

### 问题 1：下载的 ZIP 解压后样式丢失（按钮无样式、布局错乱）
- **原因分析**：在 Vite 开发环境下，直接 `fetch('/.../style.css')` 获取的是带有热更新客户端代码的 JS 包装模块。
- **修复方案**：确保 `src/playground.js` 中的 `rawSources`（通过 `import.meta.glob(..., { query: '?raw' })`）覆盖了该文件路径，`loadFileContent` 会直接读取无污染的纯净文本。

### 问题 2：切换手机视口模拟时，Canvas 画布没有自适应变小
- **原因分析**：Canvas 尺寸仅在页面首次加载时读取了 `window.innerWidth`，未监听尺寸变化。
- **修复方案**：在案例脚本中添加 `window.addEventListener('resize', ...)` 监听，在尺寸改变时重新计算画布宽高并重绘。

### 问题 3：切换到其他案例后，上一个案例的背景音乐或音效仍在播放
- **原因分析**：音频实例被绑定到了顶层 `window`，或者在非 iframe 环境中运行。
- **修复方案**：所有 `AudioContext` 必须严格在案例自身的独立脚本中创建。外壳在切换案例时会注销并销毁旧的 `iframe`，浏览器将自动回收对应的音频线程与内存。

---

## 5. 任务交付前验证指令

在完成代码修改后，务必运行构建与类型检查以验证无语法或编译错误：
```bash
npm run build
npm run lint
```

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

## 3. 常见问题排查与修复指南

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

## 4. 任务交付前验证指令

在完成代码修改后，务必运行构建与类型检查以验证无语法或编译错误：
```bash
npm run build
npm run lint
```

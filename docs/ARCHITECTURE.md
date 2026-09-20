# 系统架构与技术原理深度剖析

> 本文档详细阐述 **UI Playground 工作台外壳** 的内部运行机制、其与独立案例的沙箱交互模型，以及客户端纯前端 ZIP 打包下载引擎的设计原理。

---

## 1. 双层架构体系

### 第 1 层：工作台外壳 (`/index.html`, `/src/playground.js`, `/src/playground.css`)
工作台外壳承担着应用宿主、开发者调试工具集与案例分发载体的职责。

核心子系统：
- **视图路由与状态机**：
  - `currentMode`：`'gallery'`（全案例卡片画廊网格）或 `'studio'`（单案例独立工作台，包含侧边栏导航、视口切换与代码抽屉）。
  - `activeViewport`：`'desktop'`（100% 宽度响应式）、`'tablet'`（768px 宽度约束）或 `'mobile'`（390px iPhone 视口约束）。
  - 实时搜索与分类过滤：支持按标题、描述与标签进行模糊检索，并支持全量（`all`）、特效（`effects`）、组件（`components`）分类切换。
  - 全局命令面板：支持通过 `Cmd+K` / `Ctrl+K` 快速呼出快捷搜索面板。
- **沙箱隔离执行环境 (`mountStudioIframe`)**：
  - 每次切换案例时，彻底重建/更新 `<iframe>` 实例，从而强行终止上一个案例可能正在运行的 `requestAnimationFrame` 动画循环、注销事件监听，并释放正在播放的 `AudioContext` 音频节点。
- **实时源码审查抽屉 (Code Inspector)**：
  - 支持多标签页切换查看文件（如 `index.html`、`style.css`、`script.js`）。
  - 基于 Prism.js 提供精确的语法高亮，并支持一键复制到剪贴板。
- **客户端纯前端 ZIP 打包导出器**：
  - 基于 `JSZip` 库，直接在用户浏览器内存中动态打包出 `${caseId}.zip`，无需经过任何后端服务器处理，实现零网络延迟导出。

### 第 2 层：独立原生案例 (`/effects/*`, `/components/*`)
- 存放于项目的根子目录中。
- 遵循 100% 纯原生 Web 标准（HTML5 / CSS3 / ES6+ JS）。
- 不包含对父级外壳资源的任何相对路径依赖。
- 确保可以直接从本地文件系统（`file://` 协议）或任何静态服务器双击运行。

---

## 2. 沙箱生命周期与隔离机制

```
[用户选择新案例] 
        │
        ▼
[执行 mountStudioIframe(url)]
        │
        ├─► 销毁旧 iframe DOM 节点（自动终止上个案例的动画与音频线程）
        ├─► 创建全新 <iframe src="url" sandbox="allow-scripts allow-same-origin allow-forms">
        ├─► 挂载至舞台容器 #stageFrameWrapper
        └─► 同步更新外壳 URL 地址栏与工作台元数据面板
```

**为什么必须采用 Iframe 隔离？**
1. **全局作用域防护**：避免各个案例定义的 `window` 全局变量、样式规则（如 `body` 背景色或通用类名）发生冲突污染。
2. **资源与动画销毁**：移除 iframe 能够让浏览器彻底垃圾回收该页面占用的 Canvas 渲染下文与 Web Audio 音频图谱，无需各案例手动编写复杂的卸载清理钩子。
3. **真实视口物理模拟**：外层容器设定不同尺寸（如 390px 模拟移动端）时，iframe 内部的 CSS `@media` 查询可以精确依据 frame 宽度进行响应式计算。

---

## 3. 客户端 ZIP 打包引擎原理

### Vite 开发环境 CSS 包装问题与解决方案
在 Vite 开发服务器环境下，直接通过 `fetch('/effects/fireworks/style.css')` 发起请求时，Vite 会自动将 CSS 内容转换为包含 HMR 客户端热更新逻辑的 JavaScript 模块（包含 `import { updateStyle } from "/@vite/client"`）。若直接打包，用户下载解压后浏览器将无法识别该 CSS 文件。

### 解决方案：Vite 原始文本导入 (Raw Glob) + 智能回退
```javascript
// 1. 在编译时通过 Vite 的 ?raw 查询预加载所有原生源码文本
const rawSources = import.meta.glob(['/effects/**/*', '/components/**/*'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// 2. 高保真内容加载器
async function loadFileContent(filePath) {
  // 命中内存缓存
  if (fileCache[filePath]) return fileCache[filePath];

  // 优先从 rawSources 查找真实文件原始文本
  if (rawSources && rawSources[filePath]) {
    return fileCache[filePath] = rawSources[filePath];
  }

  // 回退：若网络 fetch 拿到被 Vite 包装的代码，进行正则纯净内容提取
  ...
}

// 3. 利用 JSZip 在内存中组装并生成下载
async function downloadCaseZip(caseObj) {
  const zip = new JSZip();
  for (const file of caseObj.files) {
    const content = await loadFileContent(`/${caseObj.path}${file}`);
    zip.file(file, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  // 触发浏览器原生下载弹窗
}
```

---

## 4. 状态流转与交互事件

- **快捷键体系**：
  - `Cmd+K` / `Ctrl+K`：呼出/隐藏全局命令面板。
  - `Escape`：关闭代码抽屉、弹窗或命令面板。
- **URL Hash 状态持久化**：
  - 支持通过 Hash 直接深层链接到指定案例（如 `#studio?case=fireworks`），方便分享与刷新保持状态。
- **响应式断点规范**：
  - 画廊卡片网格：`< 640px` 为单列，`< 1024px` 为双列，`≥ 1024px` 为三列。
  - 侧边栏：移动端窄屏下自动收起为可折叠抽屉。

---

## 5. 平台层多语言 (i18n) 隔离边界铁律

若工作台外壳需要支持多语言（如中/英/日等全球化切换），必须严格遵守以下物理隔离原则：

1. **作用域严格受限在外壳层**：
   - 多语言词条字典仅用于外壳 UI 元素（顶栏导航、视口切换器、Cmd+K 命令面板、代码抽屉标签、复制/下载按钮、分类筛选器等）。
2. **绝对禁止侵入案例内部**：
   - 严禁通过 `postMessage`、DOM 注入或全局变量向 `<iframe>` 内部强行传递多语言指令。
   - 每一个案例（`/effects/*`、`/components/*`）的渲染逻辑、文字展现与视觉特效必须由案例本身 **100% 自包含与自维护**。
3. **保证案例脱离平台后的纯粹性**：
   - 任何案例通过 ZIP 导出并在本地独立打开时，绝不能含有任何依赖外部多语言上下文的未定义变量或破损逻辑。

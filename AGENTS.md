# AGENTS.md

> **目标受众**：AI Agent（编程助手、大语言模型）与维护本代码库的开发者。
> **项目名称**：UI Playground（原生优先交互视觉特效与 UI 组件工作台）。

---

## 1. 项目概述与核心心智模型

`UI Playground` 是一个采用**原生优先、零框架冗余（Native-First, Zero-Bloat）**理念构建的双层 Web 应用系统：

```
┌────────────────────────────────────────────────────────────────────────┐
│                   第 1 层：工作台外壳 (Workbench Shell)                 │
│  - 顶栏导航、双视图切换 (画廊 Gallery / 工作台 Studio)、Cmd+K 命令面板 │
│  - 多设备视口模拟器 (桌面 Desktop / 平板 Tablet / 手机 Mobile)         │
│  - 源码实时检查器 (Prism.js) 与 客户端纯前端 ZIP 打包引擎 (JSZip)      │
│  - 沙箱化 <iframe> 隔离容器 (零全局变量与样式污染执行)                  │
└──────────────────────────────────────────────────┬─────────────────────┘
                                                   │ 加载隔离 URL
                                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    第 2 层：独立案例模块 (Standalone Cases)            │
│  - 纯原生 Web：HTML5 + 现代 CSS3 + ES6+ JavaScript                     │
│  - 案例内 100% 零框架 (无 React / Vue / Tailwind / Babel 等运行时依赖)  │
│  - 100% 独立离线可用：双击 index.html 即可在任何浏览器完整运行          │
└────────────────────────────────────────────────────────────────────────┘
```

### 核心架构原则（铁律）
1. **案例独立性（黄金法则）**：
   `/effects/`（特效）与 `/components/`（组件）目录下的每一个案例，**必须**保持 100% 纯原生、无构建步骤、完全独立自包含。用户脱离当前平台下载后，直接双击打开 `index.html` 必须拥有 100% 完整的视觉效果与交互功能。
2. **外壳作为测试与分发沙箱**：
   外层应用（`/index.html`、`/src/playground.js`、`/src/playground.css`）负责提供开发者工作台能力（设备模拟、代码审查、实时搜索、一键导出 ZIP），并通过 `<iframe>` 挂载运行案例，以彻底隔绝各案例间的 CSS 样式冲突、音频上下文与全局 JS 变量污染。
3. **渐进式披露（Progressive Disclosure）**：
   文档按深度分层组织。日常迭代以本文件作为总入口与路由索引，在执行具体专项任务时，阅读对应的子文档。

---

## 2. 代码仓库目录结构速览

```text
/
├── AGENTS.md                  # 🌟 Agent 总入口指南（即本文档）
├── docs/                      # 📖 渐进式披露子文档库
│   ├── ARCHITECTURE.md        # 架构深度剖析（沙箱隔离、客户端 ZIP 打包机制）
│   ├── CASE_LIFECYCLE_SOP.md  # 案例全生命周期管理 SOP（增、删、改、重构与质量验收）
│   ├── AUTONOMOUS_ITERATION.md # 🚀 Agent 自主迭代与持续演进指南（生长闭环与技术域矩阵）
│   └── MAINTENANCE_GUIDELINES.md # 维护规范、防 AI Slop 审美标准与排错指南
├── effects/                   # 视觉与物理动画特效案例库 (100% 纯原生)
│   ├── fireworks/             # Canvas 烟花粒子与 Web Audio 音效
│   ├── magnetic-button/       # 弹性磁吸按钮 (单文件演示)
│   ├── particle-text/         # 文本光栅化粒子解构与弹性复原
│   ├── liquid-button/         # SVG 粘滞滤镜流动按钮
│   └── cursor-follow/         # 多层 Lerp 缓动跟随光标
├── components/                # 交互式 UI 组件案例库 (100% 纯原生)
│   ├── button/                # 现代按钮系统 (波纹/炫光/霓虹/毛玻璃)
│   ├── card/                  # 3D 视差透视卡片与全息光影
│   ├── modal/                 # 原生 <dialog> 弹窗与高斯模糊遮罩
│   ├── tooltip/               # 智能边缘碰撞检测提示框
│   └── navigation/            # 弹性滑动胶囊导航栏
├── src/                       # 工作台外壳核心代码
│   ├── playground.js          # 总案例元数据、状态机、iframe 沙箱与 ZIP 打包器
│   └── playground.css         # 暗黑风格工作台样式与代码高亮主题
├── index.html                 # 工作台 HTML 入口与结构
├── vite.config.ts             # 静态开发服务配置
└── package.json               # 开发依赖与 JSZip
```

---

## 3. Agent 任务操作速查表

| 任务类型 | 核心操作 | 关键文件 | 参考子文档 |
| :--- | :--- | :--- | :--- |
| **新增案例 (Create)** | 在 `effects/` 或 `components/` 编写自包含原生代码并在 `playground.js` 注册 | `effects/<id>/*` 或 `components/<id>/*`, `src/playground.js` | [`docs/CASE_LIFECYCLE_SOP.md`](./docs/CASE_LIFECYCLE_SOP.md) (第 1 节) |
| **修改案例 (Update)** | 调优动效/交互，或更新元数据与文件列表 | `effects/<id>/*`, `src/playground.js` | [`docs/CASE_LIFECYCLE_SOP.md`](./docs/CASE_LIFECYCLE_SOP.md) (第 2 节) |
| **重构/重命名案例** | 同步变更物理文件夹名、元数据 `id`、`path` 与 `url` | 案例目录, `src/playground.js` | [`docs/CASE_LIFECYCLE_SOP.md`](./docs/CASE_LIFECYCLE_SOP.md) (第 2 节) |
| **删除案例 (Delete)** | 移除 `playground.js` 中 `cases` 元数据项并安全删除对应文件夹 | 案例目录, `src/playground.js` | [`docs/CASE_LIFECYCLE_SOP.md`](./docs/CASE_LIFECYCLE_SOP.md) (第 3 节) |
| **自主迭代演进 (Autonomous Iteration)** | 执行 6 阶段闭环：盲区洞察、演进策划、精工写盘、原子注册、自愈验证、自动 Commit | `docs/AUTONOMOUS_ITERATION.md`, `src/playground.js` | [`docs/AUTONOMOUS_ITERATION.md`](./docs/AUTONOMOUS_ITERATION.md) |
| **维护工作台外壳 / ZIP** | 调整沙箱生命周期、搜索过滤或源码导出逻辑 | `src/playground.js`, `src/playground.css` | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| **代码自检与构建验证** | 运行语法检查与编译验证，确保零构建错误 | `package.json` | [`docs/MAINTENANCE_GUIDELINES.md`](./docs/MAINTENANCE_GUIDELINES.md) |

---

## 4. 渐进式披露子文档索引

当需要执行具体任务或深入了解技术细节时，请按需查阅对应文档：

1. 📖 [**`docs/ARCHITECTURE.md`（系统架构深度剖析）**](./docs/ARCHITECTURE.md)
   - Iframe 沙箱挂载与自动销毁机制。
   - 基于 `JSZip` 与 `import.meta.glob(..., { query: '?raw' })` 的纯前端源码打包导出原理。
   - 画廊视图与工作台视图的双状态机模型。
   - Prism.js 代码高亮与剪贴板引擎。

2. 🛠️ [**`docs/CASE_LIFECYCLE_SOP.md`（案例全生命周期管理 SOP）**](./docs/CASE_LIFECYCLE_SOP.md)
   - 物理文件层与元数据注册层的双层一致性模型。
   - 新增（Create）、修改（Update）、重命名重构（Refactor）、删除（Delete）与审查（Inspect）的标准操作流。
   - 全流程 6 项质量验收矩阵（QA Matrix）。

3. 🚀 [**`docs/AUTONOMOUS_ITERATION.md`（自主迭代与持续演进指南）**](./docs/AUTONOMOUS_ITERATION.md)
   - 适用于 Agent 定时与长效自主演进闭环。
   - 6 阶段生长飞轮（盲区洞察 ➔ 演进策划 ➔ 精工写盘 ➔ 原子注册 ➔ 编译自愈 ➔ 自动 Commit）。
   - 包含结构化 Commit 模板（动机、技术清单、健壮性防御、自愈报告）。
   - 涵盖 3 大演进模式（新领域拓展、现有案例体验升维、代码健康重构）与 9 大技术域矩阵。
   - 防崩溃防御性代码模板（Canvas 缩放、Web Audio 懒激活、零 CDN 引入）。

4. 🛡️ [**`docs/MAINTENANCE_GUIDELINES.md`（维护规范与排错指南）**](./docs/MAINTENANCE_GUIDELINES.md)
   - 原生 JS 编码规范（`requestAnimationFrame` 销毁、Web Audio 手势解锁、Pointer Events 统一事件）。
   - 响应式视口适配约束与移动端触控标准。
   - 拒绝“AI 廉价感（Anti-Slop）”的设计与审美准则。
   - 常见疑难问题排查手册。

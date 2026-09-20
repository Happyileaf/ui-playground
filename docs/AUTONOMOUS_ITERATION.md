# 自主迭代与持续演进指南 (Autonomous Continuous Iteration SOP)

> **适用场景**：AI Agent 独立或定时对项目进行持续迭代、有机演进与质量提升（涵盖新灵感演进、现有案例打磨、架构自愈与技术维度拓展）。

---

## 1. 自动化自主迭代飞轮 (Autonomous Growth Loop)

Agent 在执行独立迭代任务时，应遵循完整的**“洞察 ➔ 策划 ➔ 落地 ➔ 注册 ➔ 自愈”**闭环流程：

```
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 1：全局现状洞察与缺口分析 (Insight & Gap Analysis)                 │
│  - 读取 src/playground.js 中的 cases 注册列表                           │
│  - 评估已有案例的技术领域分布（Canvas、SVG、3D CSS、音频、组件等）        │
│  - 识别当前案例库的“视觉与交互盲区”或“待优化案例”                       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 2：制定本次演进方案 (Evolution Proposal)                          │
│  - 决定本次迭代动作：【创新拓展】/【体验升维】/【架构重构】             │
│  - 确定具体目标（案例 ID、标题、技术亮点、预期交互）                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 3：精工落地原生代码 (Craft & Implementation)                      │
│  - 遵循 100% 纯原生原则，落地 /effects/<id>/ 或 /components/<id>/      │
│  - 注入防御性代码（Canvas 高分屏自适应、Web Audio 懒激活、零 CDN 依赖） │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 4：双层强一致性注册 (Atomic Sync)                                 │
│  - 在 src/playground.js 中原子性更新 cases 元数据                       │
│  - 确保 files 列表与物理磁盘文件绝对 1:1 匹配                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 5：自愈校验与质量验收 (Validation & Self-Healing)                │
│  - 执行 npm run build 与 npm run lint 验证语法与类型                    │
│  - 若存在构建警告或报错，自动定位并完成即时修复                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  阶段 6：自动提交与详尽 Commit (Autonomous Commit & Changelog)         │
│  - 校验通过后自动执行 git 暂存与提交                                    │
│  - 严格按照「结构化 Commit 模板」生成包含动机、技术、防御与自愈的提交日志 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 持续迭代的三大演进模式 (3 Evolution Modes)

Agent 可根据当前的演进目标，自主选择以下一种或多种模式组合：

### 模式 A：探索新灵感与领域拓展 (Exploration)
- **目标**：填补尚未覆盖的技术领域或交互形式。
- **参考**：对照下文第 3 节的「九大技术域矩阵」，挑选当前库中较少的类别进行补充（例如：如果当前 Canvas 特效较多，则补充 SVG 粘滞流体或 Web Audio 交互组件）。

### 模式 B：现有案例体验升维 (Polish & Upgrade)
- **目标**：重构并提升已有案例的质感与细节。
- **手段**：
  - 为静态 UI 组件增加弹性微动效或视差光影。
  - 为视觉特效增加 Web Audio 交互音效反馈。
  - 增强移动端 touch/pointer 手势支持与高分屏渲染质量。

### 模式 C：代码健康度与自愈重构 (Refactoring & Health)
- **目标**：保证项目长久健壮运行。
- **手段**：
  - 检查并清理注册表与物理文件夹中不一致的孤立文件。
  - 优化 CSS 变量体系，消除不符合 Anti-Slop 规范的粗糙样式。

---

## 3. 技术域矩阵分类树 (9-Domain Taxonomy)

为确保项目生态丰富多元、避免同质化，迭代时可参考以下 9 大核心领域：

| 领域分类 | 核心技术要点 | 典型演进方向 |
| :--- | :--- | :--- |
| **1. Canvas 2D 物理粒子** | Canvas2D, Gravity, Collision, Spring | 重力沙漏、引力吸附场、星系轨道碰撞 |
| **2. SVG 滤镜与粘滞流体** | feGaussianBlur, feColorMatrix, Gooey | 粘滞液体按钮、融合水滴菜单、形态形变 |
| **3. 现代 CSS 3D 变换** | perspective, preserve-3d, Parallax | 3D 悬浮透视卡片、全息翻转书、视差画廊 |
| **4. 光标与指针动力学** | PointerEvents, Lerp, Velocity | 磁吸悬浮、多层拖尾光标、橡皮筋弹性拖拽 |
| **5. Web Audio 交互合成** | AudioContext, Oscillator, Synthesizer | 交互音阶键盘、音频波形频谱、打击音效按钮 |
| **6. 复杂排版与文字解构** | Rasterization, Glitch, SplitText | 字符爆炸破碎、代码雨、赛博朋克故障文字 |
| **7. 现代高可访问性 UI** | HTML5 Dialog, Popover API, Collision | 智能边缘检测 Tooltip、弹性抽屉、级联菜单 |
| **8. 微交互与光影动效** | Skeleton, Shimmer, Border Beam | 炫光边框卡片、波纹开关、弹性滑动胶囊 |
| **9. 数学曲线与生成艺术** | Perlin Noise, Voronoi, Fractal | 噪声流场、分形树、动态数学波浪线 |

---

## 4. 防御性编码铁律 (Defensive Engineering)

在自主迭代编写代码时，必须默认植入以下健壮性防御逻辑：

### 铁律 1：Canvas 自适应与防内存泄露
```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

function animate(timestamp) {
  // 渲染逻辑...
  animationFrameId = requestAnimationFrame(animate);
}
animationFrameId = requestAnimationFrame(animate);
```

### 铁律 2：Web Audio 手势解锁（防浏览器未交互报警）
```javascript
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 严格绑定在用户真实操作中触发
document.addEventListener('pointerdown', () => {
  const ctx = getAudioContext();
  // 触发音频振荡器或音效
}, { once: true });
```

### 铁律 3：零外部 CDN 引入（100% 本地离线可用）
- 严禁引入任何外部网络 CSS 或 JS CDN 链接（如 unpkg, cdnjs, tailwind cdn 等）。
- 所有样式与逻辑必须自包含在本地 `style.css` 或 `script.js` 中。

---

## 5. 闭环自愈机制 (Autonomous Self-Healing)

在每一次迭代操作结束后，必须执行自主验证与修复：
1. **自动构建与语法检查**：调用 `npm run build && npm run lint`。
2. **错误自愈与即时修正**：
   - 若出现语法报错，立即精准定位报错文件并修复；
   - 若出现注册表与物理路径不匹配，同步修正 `src/playground.js` 中的 `cases` 配置项；
3. **确认构建完全通过（Build Green）** 方可推进至提交阶段。

---

## 6. 自动提交与语义化 Commit 规范 (Autonomous Commit SOP)

在阶段 5 验证完全通过后，Agent 必须自动执行 Git 暂存与代码提交，并生成全面、结构化、富有技术细节的 Commit Message。

### 6.1 Git 自动化执行三部曲
```bash
# 1. 检查工作区变动状态
git status

# 2. 精确暂存本次迭代相关的文件
git add effects/ components/ src/playground.js docs/

# 3. 提交并附带详尽的结构化信息
git commit -m "<遵循下文规范的详细 Commit Message>"
```

### 6.2 详尽 Commit Message 模板与结构

提交信息必须遵循 **Conventional Commits 强化规范**，包含 Header、演进动机、技术细节、健壮性防御与验证报告 4 大核心维度：

```text
<type>(<scope>): <简明扼要的一句话中文总结 (不超过 50 字)>

[迭代背景与演进动机]
- 阐明本次迭代选择该特性的原因（如：填补 SVG 粘滞流体技术域盲区、提升移动端触控交互体验等）。

[核心技术实现清单]
- 新增/重构模块：<路径/案例名称>
- 视觉与渲染机制：<如 Canvas 2D 粒子重力场加速度计算、SVG feGaussianBlur + feColorMatrix 滤镜矩阵>
- 交互与物理动力学：<如 PointerEvents 统一指针捕获、Lerp 阻尼缓动插值、Spring 弹簧振子模型>
- 音频与微反馈：<如 Web Audio OscillatorNode 动态调频合成>

[防御性工程与健壮性]
- 高分屏支持：window.devicePixelRatio 像素缩放比适配
- 生命周期管理：requestAnimationFrame 与事件监听器跟随 iframe 销毁安全隔离
- 依赖纯净度：100% 原生零 CDN，离线解压即用

[质量验收与构建自愈报告]
- npm run build: SUCCESS (零构建错误)
- npm run lint: PASS (TypeScript 类型检查通过)
- 沙箱与 ZIP 打包验证: PASSED (独立运行与客户端动态打包 100% 一致)
```

### 6.3 Commit 提交示例 (Real-world Example)

```text
feat(effects): 新增流体漩涡粒子特效并完成沙箱元数据注册

[迭代背景与演进动机]
- 针对当前案例库中角动量物理场与连续流体动效的盲区，自主规划并演进流体漩涡粒子（Fluid Vortex）交互案例。

[核心技术实现清单]
- 新增独立案例模块：/effects/fluid-vortex/ (index.html, style.css, script.js)
- 物理渲染机制：构建 800+ 离散粒子场，基于切向加速度与径向向心力实时计算角动量漩涡
- 交互动力学：通过 Pointer Events 实现鼠标/触控交互式引力中心位移与脉冲扰动
- 元数据注册：在 src/playground.js 中完成 Schema 字段原子注入与标签索引

[防御性工程与健壮性]
- 高分屏支持：基于 window.devicePixelRatio 动态同步 Canvas 视口与逻辑分辨率
- 资源与帧循环隔离：所有 RAF 动画线程限制在 iframe 内部，切换即注销
- 零第三方依赖：纯原生 Canvas 2D API，离线双击即可完整运行

[质量验收与构建自愈报告]
- npm run build: SUCCESS
- npm run lint: PASS
- 质量验收矩阵：通过 6 项自检，ZIP 导出解压本地运行正常
```

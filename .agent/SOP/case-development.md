# 案例开发 SOP（Case Development）

> **适用场景**：AI Agent 独立或定时运行，从 Idea 池选取状态为 `Ready` 的 Idea，完成案例实现、验证、归档，并独立交付 PR。
>
> **边界声明**：本 SOP **不探索新 Idea**、不做选题评分、不绕过 Ready 门槛；可单独启动，不假定 Idea 探索 SOP（[idea-exploration.md](./idea-exploration.md)）同次运行。本 SOP 只消费已就绪的 Idea，产出可合并的案例代码 PR。

---

## 0. 可配置参数

本 SOP 所有可配置参数在此处**唯一集中定义**，全文一律引用参数名，不在其他章节另行赋值：

| 参数 | 默认值 | 含义 |
| :--- | :--- | :--- |
| `MAX_IMPLEMENTATIONS_PER_RUN` | `5` | 每轮运行最多开发（完成或判失败）的案例数量 |

---

## 1. 统一状态定义

Idea 状态机与 Idea 探索 SOP **完全一致**，两边对同一状态的含义与流转规则不得有分歧：

| 状态 | 含义 |
| :--- | :--- |
| `Candidate` | 初筛候选，仅有粗略创意，尚未深化 |
| `Refining` | 深化中，正在补全设计意图、历史对比与验收标准 |
| `Ready` | 已完成全部深化内容，验收标准可验证，**等待开发** |
| `In Progress` | 已被某轮开发认领，案例正在实现或验证中 |
| `Completed` | 案例实现、验证、归档全部完成 |
| `Rejected` | 在探索/筛选/深化/开发/验收阶段被淘汰或判定失败，已记录具体原因 |

**本 SOP 允许的流转只有**：

- `Ready → In Progress → Completed`（正常交付）
- `In Progress → Rejected`（开发或验收失败，须记录原因）

本 SOP **不得**把 `Candidate` / `Refining` 提升为 `Ready`——深化成熟是 Idea 探索 SOP 的职责。

**中断处理**：因运行时间限制等外部原因中断，**不判定为失败**：保留 `In Progress`（或尚未认领时保留 `Ready`）原状，在详情文档处理记录中写明已完成的进度与下一步，供后续轮次续做。

**容量与 ID 规则**：

- 活动池统计一律以 [../idea-pool.md](../idea-pool.md) 表格为准。
- `Completed` / `Rejected` 必须移出活动池并归档，不再占用容量。
- Idea ID 一经分配永久唯一、稳定，**不重新分配、不复用**。

---

## 2. Idea 选择规则

1. **用户明确指定某 Idea**：优先检查指定项。指定项**必须处于 `Ready`** 才能开发；若处于其他状态（含不存在），说明原因后结束本轮，不得绕过门槛、不得替用户提升状态。
2. **用户未指定**：严格按 [../idea-pool.md](../idea-pool.md) 表格**自上而下选取第一个 `Ready`**。表格行顺序即默认开发优先级，不引入额外评分、排序或偏好机制。
3. **池中没有 `Ready`**：立即结束本轮——不临时生成 Idea、不擅自提升 `Candidate` / `Refining`、不制造空提交或空 PR。
4. 单轮开发数量不超过 `MAX_IMPLEMENTATIONS_PER_RUN`；完成一个（含判失败并归档）再处理下一个，直到达上限或池中再无 `Ready`。

---

## 3. 开发流程

### 步骤 1：开工前检查

- 执行 `git status` 检查工作区与当前分支：工作区存在**他人未提交变更**时不得覆盖或混入本轮提交，应先报告并停止。
- 阅读 [../idea-pool.md](../idea-pool.md)，按第 2 节规则确定本轮候选；确认本轮数量上限 `MAX_IMPLEMENTATIONS_PER_RUN` 与用户是否有指定项。
- 总纲遵循 [../../AGENTS.md](../../AGENTS.md) 的案例独立性黄金法则。

### 步骤 2：读取 Idea 详情

完整读取所选 Idea 的详情文档 `../idea-details/IDEA-xxx.md`，逐条理解：创意概述、预期展示效果、动态与交互、核心亮点、历史案例对比、**实现约束**与**验收标准**。验收标准是后续步骤 6 的判定依据。

### 步骤 3：认领（Ready → In Progress）

- 将详情文档状态改为 `In Progress`，更新「更新时间」并在「处理记录」追加一条认领记录（时间、动作、认领轮次）。
- 同步更新 [../idea-pool.md](../idea-pool.md) 该行状态。
- 状态文件变更与后续案例代码在**同一轮提交、同一 PR** 交付，无需单独提前提交（也可先暂存，最终单提交即可）。

### 步骤 4：实现案例

在 `playground/effects/<kebab-case-id>/`、`playground/components/<kebab-case-id>/` 或 `playground/pages/<kebab-case-id>/` 下创建标准三件套：

```text
playground/<category>/<case-id>/
├── index.html   # 相对路径引入 ./style.css 与 ./script.js
├── style.css
└── script.js
```

- 创建流程、分类判定与目录结构遵循 [../../docs/CASE_LIFECYCLE_SOP.md](../../docs/CASE_LIFECYCLE_SOP.md) 第 1 节。
- 视觉、HUD、交互、响应式与审美规范遵循 [../../docs/MAINTENANCE_GUIDELINES.md](../../docs/MAINTENANCE_GUIDELINES.md)。

**ID 命名规范（硬性）**：

- 小写字母 + 连字符 kebab-case（如 `magnetic-button`），简洁准确地描述核心效果；
- 不与任何已有案例重名，也**不得复用已删除/废弃的旧 ID**（核对 `src/playground.js` 全部注册项及历史归档）。

**防御性编码铁律（硬性要求清单）**：

1. **Canvas 高分屏 dpr 自适应 + RAF 生命周期销毁**：基于 `devicePixelRatio`（封顶 2）做物理像素缩放并监听 `resize`；动画只通过 `requestAnimationFrame` 驱动，帧循环与事件监听随 iframe 销毁可被回收，杜绝泄漏：

   ```javascript
   const dpr = Math.min(window.devicePixelRatio || 1, 2);
   function resize() {
     canvas.width = window.innerWidth * dpr;
     canvas.height = window.innerHeight * dpr;
     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   }
   // 动画用 timestamp 计算 delta time，不同刷新率下速度一致
   rafId = requestAnimationFrame(function animate(ts) { /* ... */ rafId = requestAnimationFrame(animate); });
   ```

2. **Web Audio 手势懒激活**：`AudioContext` 严禁页面加载即创建；必须懒加载并在用户真实手势（pointerdown 等）中 `resume()`，全部音频对象限定在案例自身脚本内：

   ```javascript
   let audioCtx = null;
   function getAudioContext() {
     if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
     if (audioCtx.state === 'suspended') audioCtx.resume();
     return audioCtx;
   }
   ```

3. **零外部 CDN**：严禁任何 unpkg/cdnjs/tailwind cdn 等外链；所有样式与逻辑自包含于本地文件，双击 `index.html` 断网可用。
4. **强制 Title 胶囊 + 默认折叠 Micro-HUD**：
   - 每个案例必备右上角 Title 胶囊（`.hud-brand`，高 32px、圆角 999px、单行不换行），左侧呼吸光点（`.hud-dot`）使用**固定主题色**，禁止随面板参数变色；
   - 仅在需要参数调谐时配备 Micro-HUD，且**必须默认收起**（`.control-dock.hidden`），由齿轮按钮（`#btnToggleHud`）切换，并支持全局 `H` 切换、`Escape` 收起；
   - 必须为 `.control-dock` 与 `.hud-actions` 注册 `e.stopPropagation()`，防止点击/拖拽穿透到底层画布。

### 步骤 5：双层注册

在 [../../src/playground.js](../../src/playground.js) 的 `cases` 数组中**原子注入**一条元数据（`id`、`title`、`type`、`category`、`path`、`url`、`description`、`files`、`tags`）。`files` 列表必须与磁盘物理文件 **1:1 严格一致**（含大小写与扩展名）。元数据 schema、字段含义与注册细节以 [../../docs/CASE_LIFECYCLE_SOP.md](../../docs/CASE_LIFECYCLE_SOP.md) 第 1 节步骤 3 为准。

### 步骤 6：验证（全部实际执行）

1. 依赖与静态检查（依赖未安装时先执行 `pnpm install --frozen-lockfile`）：
   - `pnpm run lint`（即 `tsc --noEmit`）——零错误；
   - `pnpm run build`——零错误。
2. 报错即时定位修复（自愈）：语法/类型错误修复对应文件；注册表与物理路径不一致则同步修正 `src/playground.js`；修复后重跑直至全绿，方可进入下一步。
3. 人工 / 浏览器验证：
   - `index.html` 可经 `file://` 直接双击打开完整运行，亦可在工作台 iframe 内正常加载；
   - 视觉表现与交互**逐条满足详情文档的验收标准**（含核心亮点）；
   - 移动端触控（Pointer Events 统一）与 Desktop/Tablet/Mobile 响应式正常，触控目标 ≥ 44px；
   - 控制台零报错；切换案例后无残留音频/动画；
   - 如适用：画廊卡片渲染、Code 抽屉、ZIP 导出解压后与线上 100% 一致（对照 CASE_LIFECYCLE_SOP 第 5 节 QA 矩阵）。
4. **诚信要求**：只允许记录、声称实际执行过的验证；未执行的项目不得在 Commit / PR 中谎报通过。

### 步骤 7：验收通过（In Progress → Completed）

- 更新详情文档：状态 `Completed`、更新时间、处理记录（含最终案例路径、PR 链接，PR 创建后补登）。
- 从 [../idea-pool.md](../idea-pool.md) **删除该行**。
- 按 [../completed.md](../completed.md) 既有表格格式追加归档行：ID、名称、分类、完成结果（案例路径 / PR）、完成时间、详情链接（`./idea-details/IDEA-xxx.md`）。

### 步骤 8：验收失败（→ Rejected）

判定无法在本轮修复时，按第 5 节流转为 `Rejected` 并继续处理下一个候选；可在本轮修复的问题应直接修复，不轻易判失败。

### 步骤 9：循环

回到步骤 2 处理下一个 `Ready`，直到本轮实现数达到 `MAX_IMPLEMENTATIONS_PER_RUN` 或池中再无 `Ready`。

### 步骤 10：最终一致性检查与交付

逐条过一遍第 6 节验证清单，然后按第 7 节完成 Git/PR 交付闭环。

---

## 4. 项目约束

- 保持**纯 HTML/CSS/JS UI 案例集**定位，不偏离为其他类型产品。
- 每个案例必须可**独立运行**：优先保证 `file://` 双击 `index.html` 即拥有完整视觉与交互。
- 不引入强制构建步骤，不在案例内引入任何框架运行时依赖（React/Vue/Tailwind/Babel 等）。
- 第三方库仅可遵循项目现有约定引入，且必须满足独立运行要求：**零 CDN、本地自包含**。
- 不得因实现方便而改变 Idea 的核心设计目标与验收标准；实现约束有冲突时在详情中记录并反馈，不擅自降级。
- 本 SOP 不重构工作台/沙箱架构，不修改与本轮 Idea 无关的案例或文件。

---

## 5. 开发失败处理

`In Progress → Rejected` 时，以下信息**必须完整保留**，缺一不可：

- **Idea ID 与名称**；
- **失败阶段**：本 SOP 只可能产生「开发」或「验收」两个阶段（探索/筛选/深化阶段的淘汰由 Idea 探索 SOP 记录）；
- **具体原因**：如设计缺陷、实现不可行、视觉质量不达标、关键交互无法实现、与历史案例高度重复等——**禁止只写“失败”**，须具体到可避免后人重复踩坑；
- **处理时间**。

同步动作：

1. 更新详情文档状态为 `Rejected`，在处理记录写明阶段与具体原因；
2. 从 [../idea-pool.md](../idea-pool.md) 删除该行；
3. 按 [../rejected.md](../rejected.md) 表格格式追加：ID、名称、分类、阶段、具体原因、处理时间、详情链接；
4. 清理本轮为该失败案例产生的代码与注册项（不应把未通过验收的案例留在仓库中），随后继续下一个候选。

因**运行时间限制**临时中断不算失败：保留 `In Progress` / `Ready` 原状并记录进度（见第 1 节）。

---

## 6. 验证清单

交付前逐条勾选：

- [ ] 所选 Idea 确为 `Ready`（用户指定场景下，指定项也必须是 `Ready`）。
- [ ] 状态流转正确：仅发生 `Ready→In Progress→Completed/Rejected`，未越权提升 `Candidate/Refining`。
- [ ] [../idea-pool.md](../idea-pool.md) 行状态与各详情文档状态严格一致。
- [ ] 案例目录文件齐全（`index.html` / `style.css` / `script.js`），`index.html` 可独立运行，零 CDN、零框架。
- [ ] `src/playground.js` 已注册且 `files` 列表与磁盘文件 1:1，`path`/`url` 正确。
- [ ] `pnpm run lint` 与 `pnpm run build` 均实际执行并通过。
- [ ] 详情文档中的验收标准逐条满足，核心亮点可感知；移动端触控与响应式已验证。
- [ ] Title 胶囊必备；Micro-HUD（如有）默认折叠、齿轮 + `H`/`Esc` 可用、事件防穿透已注册。
- [ ] `Completed` / `Rejected` 归档行格式正确、已移出活动池；Rejected 含阶段与具体原因。
- [ ] 全部 Markdown 相对链接有效（含详情链接、归档链接）。
- [ ] `git diff` 仅含本轮案例目录、`src/playground.js` 注册与 `.agent/` 状态/归档文档，无无关变更、无他人改动。
- [ ] 本轮实现数量 ≤ `MAX_IMPLEMENTATIONS_PER_RUN`。

---

## 7. 独立 Git/PR 交付闭环

PR 是预期交付物，**本地 commit 完成 ≠ 交付完成**。

1. **最终变更检查**：`git status` 与 `git diff --stat` 确认改动只包含：本轮案例目录（`playground/effects|components|pages/<id>/`）、`src/playground.js`、`.agent/` 下的状态与归档文档。**精确指定路径暂存**，禁止 `git add -A` / `git add .`：

   ```bash
   git add playground/ src/playground.js .agent/
   ```

   不得混入用户未提交修改或其他任务的变更。

2. **分支策略**：从最新 `main` 创建本轮分支，单轮单提交，**不得直接提交 main**：

   ```bash
   git checkout main && git pull
   git checkout -b feat/autonomous-iteration/<时间戳或主题>
   ```

3. **Commit Message**：遵循 Conventional Commits 强化中文结构化模板，包含 Header 与四个固定维度，且**只填写实际执行的命令与结果**。案例开发类示例：

   ```text
   feat(components): 实现磁吸悬浮按钮案例并完成沙箱注册与 Idea 归档

   [迭代背景与演进动机]
   - 消费 Idea 池 IDEA-007（Ready）：磁吸悬浮按钮，填补 PointerEvents 磁吸微交互方向。

   [核心技术实现清单]
   - 新增独立案例：playground/components/magnetic-button/（index.html, style.css, script.js）
   - 交互机制：PointerEvents 统一指针捕获 + Lerp 阻尼跟随，离开时弹性回位
   - 视觉机制：CSS 变量主题体系、毛玻璃 Title 胶囊、微位移光影
   - 元数据注册：src/playground.js cases 原子注入，files 与磁盘 1:1

   [防御性工程与健壮性]
   - RAF/监听器随 iframe 销毁回收，无全局污染；触控目标 ≥44px
   - 100% 原生零 CDN，file:// 双击离线完整可用

   [质量验收与构建自愈报告]
   - pnpm install --frozen-lockfile: SUCCESS
   - pnpm run lint (tsc --noEmit): PASS
   - pnpm run build: SUCCESS
   - 人工验证：独立运行/iframe/移动端视口/零控制台报错/ZIP 导出均 PASSED
   ```

   Header scope 取 `effects` / `components` / `pages`；多个案例合并为一句不超过 50 字的总结。

4. **推送并创建 PR**：

   ```bash
   git push -u origin <branch>
   gh pr create --base main --title "<Header>" --body "<PR 正文>"
   ```

   PR body 必须包含：实现的 Idea ID 与名称、案例路径、技术要点、验证证据（lint/build 实际结果与人工验证项）、状态/归档变更（池、completed/rejected）、遗留问题（无则写“无”）。

   若 `gh` 未登录/无权限或创建失败：**保留本地 commit，如实报告阻塞原因与剩余手动命令**（含 commit hash），不得谎称 PR 已创建。

5. **CI 与 auto-merge**：
   - CI（`.github/workflows/ci.yml`，job 检查名固定为 `ci`，不可改）执行 `pnpm install --frozen-lockfile` + `lint` + `build`。
   - auto-merge workflow 对满足以下全部条件的 PR 自动启用 GitHub auto-merge，CI 绿后自动合并并删除分支：分支名匹配 `feat/autonomous-iteration/*`、非 draft、无 `no-auto-merge` label、**不触及受保护路径**（`.github/`、`AGENTS.md`、`package.json`、锁文件、`.env*`）。纯案例 + `.agent/` 文档 PR 通常满足条件，可自动合并。
   - Agent **不擅自手动合并**；CI 红灯时定位修复后推送新提交（auto-merge 保持有效，无需重建 PR）；命中熔断护栏时转人工并在结果报告中说明。

6. **结果报告**：PR 链接（或阻塞原因 + 已完成的 commit hash）、本轮实现内容（ID/路径/数量）、验证结果、归档情况与遗留问题。

---

## 8. 与 Idea 探索 SOP 的边界

- **探索与深化**（产生 Candidate、补全设计、历史对比、验收标准，推进到 `Ready`）由 [idea-exploration.md](./idea-exploration.md) 负责。
- **本 SOP 严格消费 `Ready`**：只做实现、验证、归档与 PR 交付，不反向产出或拔熟 Idea。
- 两个 SOP 可**独立启动、独立交付 PR**；共享同一套状态定义（第 1 节）与同一组 `.agent/` 数据文件（[../idea-pool.md](../idea-pool.md)、`idea-details/`、[../completed.md](../completed.md)、[../rejected.md](../rejected.md)），任一方写入后状态必须保持双边一致。

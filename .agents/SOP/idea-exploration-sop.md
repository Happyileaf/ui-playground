# Idea 探索 SOP（Idea Exploration）

> **适用场景**：AI Agent 独立或定时执行 Idea 的发现、筛选、深化、准入、记录与 PR 交付。
>
> **职责边界**：本 SOP 只负责探索和记录，产出高质量 Idea 与 `.agents/` 下的管理文档，**不编写任何案例代码**（不触碰 `playground/`、`src/playground.js` 等实现文件）。本 SOP 可被单独启动、独立交付 PR，不假定案例开发 SOP（[case-development-sop.md](./case-development-sop.md)）会在同一次运行中执行。

相关文件：

- 活动池索引：[idea-pool.md](../ideas/idea-pool.md)
- 详情模板：[_template.md](../ideas/idea-details/_template.md)
- 归档索引：[completed.md](../ideas/completed.md) / [rejected.md](../ideas/rejected.md)
- 项目总入口：[AGENTS.md](../../AGENTS.md)

---

## 1. 可配置参数

本 SOP 中所有可配置参数在此处**唯一定义**，正文一律引用参数名，不在任何章节重复硬编码数值。需要调参时只改本表：

| 参数 | 默认值 | 含义 |
| :--- | :--- | :--- |
| `IDEA_POOL_MAX_SIZE` | `50` | 未完成 Idea 硬上限 |
| `IDEA_POOL_WARNING_THRESHOLD` | `40` | 容量预警线 |
| `IDEA_EXPLORATION_READY_PER_ROUND` | `1` | 每轮必须**新推进至 `Ready`** 的 Idea 数量；优先消化池中存量草稿（`Candidate`/`Refining`），不足时再从零生成新候选补足，**严禁以降低准入标准的方式凑数** |

---

## 2. 统一状态定义

以下状态定义必须与案例开发 SOP（[case-development-sop.md](./case-development-sop.md)）保持严格一致，两边不得出现分歧：

| 状态 | 含义 | 维护方 |
| :--- | :--- | :--- |
| `Candidate` | 初步创意，描述可以不完整（仅基本信息 + 简述即可） | 本 SOP |
| `Refining` | 有潜力、正在完善中的 Idea | 本 SOP |
| `Ready` | 满足全部准入标准（见第 5 节），可被开发 | 本 SOP 准入 |
| `In Progress` | 开发中 | 案例开发 SOP |
| `Completed` | 已实现、验证并归档 | 案例开发 SOP |
| `Rejected` | 被淘汰或开发失败，需记录具体原因 | 两个 SOP 均可写入 |

状态流转：

- `Candidate → Refining`
- `Candidate / Refining → Ready`（须通过第 5 节全部准入标准）
- `Ready → In Progress`（由案例开发 SOP 负责）
- `In Progress → Completed`（由案例开发 SOP 负责）
- 任一未完成状态 `→ Rejected`（必须记录原因）

> 临时达到运行时间 / token 限制而中断，**不算失败**，保留当时实际状态（Candidate/Refining 等），不得因此进入 `Rejected`，下一次运行从断点继续深化。但**中断不等于轮次交付**：只有本轮 Ready 产出达到 `IDEA_EXPLORATION_READY_PER_ROUND` 后才允许走第 11 步交付闭环；中途的 Candidate/Refining 落盘是安全点，不是终点。

---

## 3. 容量规则

- `Candidate`、`Refining`、`Ready`、`In Progress` 均占用 Idea 池容量；`Completed`、`Rejected` 移出活动池、不占容量。
- 容量只统计 [idea-pool.md](../ideas/idea-pool.md) 表格中的行数，不以磁盘上的详情文件数计算。
- 达到 `IDEA_POOL_MAX_SIZE`：**停止新增** Idea，但仍可完善、深化、淘汰或推动已有 Idea（含将候选推进至 Ready、将无价值项淘汰归档）。
- 达到 `IDEA_POOL_WARNING_THRESHOLD`：本轮优先完善、推动开发或淘汰存量 Idea，而非继续扩张。
- **不得机械删除旧 Idea** 来腾容量；淘汰必须有具体原因并归档至 [rejected.md](../ideas/rejected.md)。
- 每次新增前必须再次检查当前容量（统计可能在本轮过程中发生变化）。
- 发现并发修改或 Git 冲突（如远端已有他人新增的 Idea）时，先协调、对齐 ID 序号与状态，**不得覆盖**他人修改。

---

## 4. 探索流程

按顺序执行以下步骤。**每轮的完成标准是：本轮新推进至 `Ready` 的 Idea 达到 `IDEA_EXPLORATION_READY_PER_ROUND` 指定的数量**。供给顺序固定为：

1. **先遍历活动池**：自上而下取出已有的 `Candidate`/`Refining` 草稿，按步骤 7–8 深化并申请准入；达到配额即完成本轮。
2. **不足再从零生成**：存量草稿全部处理完仍不足配额时，按步骤 5–8 生成、筛选、深化全新候选补足；新候选未通过准入则更换技术域继续生成，直到达标或确认客观阻塞（见第 8 节）。

Candidate/Refining 只是中间状态，不是轮次产出。每轮可在任何安全点中断，中断时保持文件处于一致状态即可，下次运行从断点继续直至达标交付。

### 步骤 1：检查仓库与 Git 状态

- 执行 `git status`，确认当前在合适的分支上、主分支为最新（必要时先同步 `main`）、工作区干净。
- 若工作区存在他人未提交的修改，不得覆盖、不得将其纳入本轮提交；先协调或等待。
- 后续在从最新 `main` 创建工作分支时再次确认基线（见第 9 节）。

### 步骤 2：读取规则上下文

- 必读：[AGENTS.md](../../AGENTS.md)（项目铁律：纯原生、零框架、零 CDN、案例独立离线运行）与本 SOP。
- 按需阅读：[MAINTENANCE_GUIDELINES.md](../../docs/MAINTENANCE_GUIDELINES.md)（Anti-Slop 审美、HUD 与交互规范）、[CASE_LIFECYCLE_SOP.md](../../docs/CASE_LIFECYCLE_SOP.md)（案例目录与注册约定）。
- **不要求**读完全部 Idea 详情文件；仅需读取本轮涉及的候选/存量详情，以及为查重而必要浏览的条目。

### 步骤 3：盘点现状

- 统计 [idea-pool.md](../ideas/idea-pool.md)：容量占用、各状态分布、处于 `Candidate`/`Refining` 等待处理的内容与排序——这些存量草稿是本轮 Ready 配额的**第一供给来源**，按表格顺序自上而下纳入深化。
- 盘点历史案例：通读 [src/playground.js](../../src/playground.js) 的全部注册案例（id / 标题 / 描述），并浏览 `playground/effects`、`playground/components`、`playground/pages` 目录，了解已有视觉风格与交互形式。
- 通读 [rejected.md](../ideas/rejected.md)，避免重复提出已淘汰且无实质改进的创意。

### 步骤 4：确定本轮探索方向

- 根据历史覆盖情况选择方向，**避免高度相似效果持续生成**：哪一技术域或交互形式覆盖薄弱，就优先补哪一类（例如 Canvas 粒子偏多，则转向可访问性组件、SVG 形变或 Web Audio 交互）。
- 本步骤仅在**需要从零生成新候选**时执行（存量草稿不足以补足配额）；生成数量以补足 `IDEA_EXPLORATION_READY_PER_ROUND` 缺口为度，不预生成用不上的候选。

#### 探索方向参考（9 大技术域）

| 领域分类 | 核心技术要点 | 典型实用方向 |
| :--- | :--- | :--- |
| **1. 现代高可访问性 UI 组件** | HTML5 Dialog, Popover API, Collision, ARIA | 智能边缘检测 Tooltip、弹性抽屉、级联下拉菜单、模态弹窗、侧边导航 |
| **2. 微交互与光影动效** | Skeleton, Shimmer, Border Beam, Transition | 波纹开关按钮、炫光边框卡片、弹性滑动胶囊、滚动视差、悬浮提升动效 |
| **3. 导航与页面切换** | CSS Transition, View Transitions, Scroll | 弹性胶囊导航、滚动驱动动画、页面过渡动效、面包屑动效、回到顶部按钮 |
| **4. 卡片与内容展示** | perspective, preserve-3d, Parallax, Filter | 3D 悬浮透视卡片、毛玻璃效果卡片、翻转卡片、hover 光影动效、图片画廊 |
| **5. 按钮与表单交互** | SVG Gooey, Clip-path, Transition | 粘滞液体按钮、点击波纹扩散、文字弹性微动、开关滑块、输入框聚焦动效 |
| **6. 光标与指针交互** | PointerEvents, Lerp, Velocity | 磁吸悬浮按钮、多层跟随光标、橡皮筋弹性拖拽、自定义光标样式 |
| **7. 文字排版与动效** | Rasterization, Glitch, SplitText, Clip-path | 文字入场动效、文字故障效果、文字线条动画、逐字显示效果、滚动文字视差 |
| **8. SVG 滤镜与形态形变** | feGaussianBlur, feColorMatrix, Gooey, Morph | 按钮融合形变、菜单水滴融合、图标路径形变、文字描边动效 |
| **9. Web Audio 交互反馈** | AudioContext, Oscillator, BiquadFilter | 点击音效反馈、键盘交互音效、滑动音阶按键、音量可视化频谱 |

> 💡 纯物理/数学类（Canvas 粒子、分形、噪声流场、流体动力学、引力场、元胞自动机等）**不作为优先方向**，仅在项目有明确需求时偶发生成。

### 步骤 5：生成初步候选（存量草稿不足时）

仅在步骤 7–8 处理完存量草稿、Ready 仍不足 `IDEA_EXPLORATION_READY_PER_ROUND` 时执行本步骤，按需生成新候选补足缺口。为每个候选记录：

- **ID**：`IDEA-001` 起的三位顺序号（`IDEA-001`、`IDEA-002`……）。ID 唯一、稳定、**永不重新分配**；分配前须核对活动池、[completed.md](../ideas/completed.md) 与 [rejected.md](../ideas/rejected.md)，不与历史（含已淘汰）ID 冲突。
- **名称**：简洁达意。
- **简述**：一两句话说明做什么。
- **分类**：`effects` / `components` / `pages` 之一。
- **状态**：统一先记为 `Candidate`。

**命名规则（沿用旧 SOP）**：

- Idea 自身用 `IDEA-xxx` 编号；其未来落地的**案例目录 id** 必须使用小写字母与连字符（kebab-case），例如 `magnetic-button`。
- 案例 id 必须简洁清晰、准确描述核心效果，避免过于笼统或冗长。
- 案例 id 不得与任何已有案例重名，也不得使用已删除/废弃的旧 id（可在深化阶段最终确定，但候选阶段即应规避明显冲突）。

### 步骤 6：筛选候选（逐一评审）

对每个候选**逐一**完成以下评审：

**(a) 重复性评审**

- 完整核对 [src/playground.js](../../src/playground.js) 中全部已注册案例的 `id`、标题、描述。
- 确认本轮候选彼此之间、以及与任何已有案例都**没有本质重复**。
- 仅属微调、体验优化的方向，应作为**已有案例的改进项**处理，而不是新 Idea（可记录为改进类候选并注明目标案例，或交由开发 SOP 的打磨流程处理）。

**(b) 内容方向评审（实用性优先）**

- 🎯 **第一优先级：实用可落地**——能直接用在实际网页中的交互组件、按钮特效、导航动效、页面过渡、卡片动效、增强体验的微交互等，优先满足设计师与开发者的日常需求。
- 🎯 **第二优先级：交互体验**——应包含可操作的用户交互（点击/悬停/拖拽/滚动/键盘），交互自然流畅有反馈。
- 🎯 **第三优先级：视觉美学**——美观现代、符合当前设计趋势，避免过于简陋或过于复杂。
- ⚠️ **严格限制纯物理/数学模拟**：纯粒子碰撞、流体动力学、引力场、分形、元胞自动机等纯学术/艺术方向从严控制，仅偶发生成。
- ❌ **绝对禁止**：
  - 无任何交互的纯自动播放动画；
  - 会导致浏览器卡顿的密集计算循环；
  - 纯展示性生成艺术（无实际使用价值）；
  - 与现有案例高度同质化的重复效果。

**实用性打分（1-5 分，三项优先级综合判断，任一维度低于 4 分即放弃重选）**：

- 5 分：可直接用于生产环境网页的 UI 组件或交互特效；
- 4 分：有明确使用场景，可作为网页创意元素使用；
- 3 分：有一定创意，但使用场景有限；
- 2 分：偏展示，实用性低；
- 1 分：纯学术/纯艺术展示，几乎无实用价值。

**淘汰处理**：缺乏价值或高度重复的候选予以淘汰，按 `Rejected` 记录到 [rejected.md](../ideas/rejected.md)，写清淘汰阶段（探索/筛选）与具体原因。探索阶段被否的候选**可以仅在 rejected.md 记录、不创建完整详情文件**；但**一旦为某候选创建了详情文件，该 ID 即永久保留**，淘汰时连同详情一并归档，不得删除或复用 ID。

### 步骤 7：深化（先存量草稿，后新候选）

- **先处理存量**：按活动池表格顺序逐个取出 `Candidate`/`Refining`，读取其详情与待澄清点，补充设计意图、预期展示效果（构图风格、视觉元素、层次材质光影细节）、动态与交互、核心亮点、实现约束与验收标准（复制 [_template.md](../ideas/idea-details/_template.md) 结构），随后进入步骤 8 申请准入；无价值或已被历史案例覆盖的草稿直接淘汰归档。存量草稿推进至 Ready 的数量计入本轮配额。
- **再处理新候选**：存量全部处理完仍不足 `IDEA_EXPLORATION_READY_PER_ROUND` 时，对步骤 5–6 新生成并通过筛选的候选执行同样的深化。
- 尚不成熟的可保留为 `Candidate` 或推进为 `Refining`，**必须如实记录具体的待澄清点**；没有明确待澄清点、只是未完成深化的候选不得停在草稿状态，应继续深化或直接淘汰。
- **草稿是中间态，不是产出**：本轮停留在 `Candidate`/`Refining` 的条目不计入轮次产出，轮次产出只看新 Ready 数量。
- **每轮 Ready 数量必须达标（`IDEA_EXPLORATION_READY_PER_ROUND`），但准入不降标**：存量草稿不足就从零生成新候选，新候选连续不通过就更换技术域继续，绝不以放宽第 5 节标准的方式凑数。

### 步骤 8：Ready 准入

对每个拟提升为 `Ready` 的 Idea，逐项核对第 5 节的四条准入标准；全部通过才允许置为 `Ready`，任一不满足则继续完善或保留 `Candidate`/`Refining`。不得因探索数量或运行时间压力降低标准。

盘点本轮 Ready 产出：未达到 `IDEA_EXPLORATION_READY_PER_ROUND` 时——若池中仍有存量草稿，回到步骤 7 继续深化下一个；存量已耗尽则回到步骤 4–5 更换技术域从零生成新候选，重复筛选、深化与准入，直到达标；若反复尝试仍无候选可通过准入，按第 8 节的客观阻塞处理，**不得**把不达标项强行置为 Ready。

### 步骤 9：容量复检与文档落盘

- 新增前再次统计容量，按第 3 节规则处理（达 `IDEA_POOL_MAX_SIZE` 只完善不新增；达 `IDEA_POOL_WARNING_THRESHOLD` 优先存量）。
- 创建/更新详情文档（基于 [_template.md](../ideas/idea-details/_template.md)），同步更新 [idea-pool.md](../ideas/idea-pool.md) 表格：新就绪的 `Ready` 放在符合默认开发顺序的合适位置（行顺序即默认开发顺序，不得随意打乱已有排序）。
- 发生归档时，同步更新 [completed.md](../ideas/completed.md) / [rejected.md](../ideas/rejected.md)，并将对应行移出活动池。
- 每次状态变化同步更新详情文件的「状态」「更新时间」与「处理记录」。

### 步骤 10：一致性验证

按第 7 节验证清单逐项自检，确认本轮文档与状态完全一致后再进入交付。

### 步骤 11：交付闭环

按第 9 节完成提交、推送与 PR 创建，并按 9.6 报告结果。

---

## 5. Ready 准入标准

一个 Idea 必须**同时**满足以下四条标准，才允许置为 `Ready`：

1. **明确的设计亮点**：在视觉创意、交互创意、表现形式、设计细节中，至少有一个方面具备值得展示的亮点。普通按钮、简单渐变背景、仅更换配色/文案/尺寸的方案不通过。
2. **与历史案例有实质差异**：判断前必须先检查历史案例（[src/playground.js](../../src/playground.js) 注册列表 + `playground/` 目录）与 [rejected.md](../ideas/rejected.md)。差异须体现在核心创意、视觉表达、交互方式或整体表现上；仅换颜色、文案或微调参数不构成新意。本项目**不引入查重算法**，由 Agent 依据上述维度人工判断，并在详情文档的「历史案例对比」中记录检查范围、相似案例与差异说明。
3. **设计描述足够具体**：至少说明创意概述、预期展示效果、构图与整体风格、主要视觉元素、层次材质光影关键细节、动态与交互（适用时）、核心亮点。除非属于创意不可缺少的约束，**不过早限定**具体算法、代码组织、精确尺寸或颜色值。
4. **可验收的完成标准**：定义可验证的验收标准，覆盖主要视觉特征、关键动画与交互、符合设计意图、独立运行与项目约束（双击 `index.html` 完整可用、零框架、零 CDN）。

任一不满足：继续完善，或保留 `Candidate`/`Refining`。**严禁**因探索数量、运行时间或任何进度压力放宽标准。

---

## 6. Idea 详情文档与索引维护规范

- [idea-pool.md](../ideas/idea-pool.md) 是**唯一活动索引**，表格列为 `| ID | 名称 | 状态 | 分类 | 详情 |`；只含 `Candidate`/`Refining`/`Ready`/`In Progress`。
- **行顺序 = 默认开发顺序**：案例开发 SOP 无特别指定时自上而下取第一个 `Ready`；调整排序须有理由，不随意打乱。
- 每行「状态」必须与对应详情文档中的状态严格一致；详情链接使用相对路径 `./idea-details/IDEA-xxx.md`，保持可解析。
- `Completed`/`Rejected` 必须移出活动池并归档至 [completed.md](../ideas/completed.md) / [rejected.md](../ideas/rejected.md)；归档保留原始 ID 与 `idea-details/` 中的详情文件，不占容量、不复用 ID。
- 详情字段以 [_template.md](../ideas/idea-details/_template.md) 为准：`Candidate` 允许仅填写基本信息 + 创意概述；进入 `Ready` 前必须补全设计内容、历史案例对比与验收标准。
- 归档至 [rejected.md](../ideas/rejected.md) 必须写明**具体原因**（不允许只写“失败/不合适”）与所处阶段。
- 更新时保持 Markdown 表格结构完整、相对链接有效。

---

## 7. 验证清单（提交前）

- [ ] 容量统计正确：未完成数量相对 `IDEA_POOL_MAX_SIZE` / `IDEA_POOL_WARNING_THRESHOLD` 的处理符合第 3 节（超限未新增、预警线优先存量）。
- [ ] 轮次达标：本轮新推进至 `Ready` 的数量达到 `IDEA_EXPLORATION_READY_PER_ROUND`，且供给顺序为「先存量草稿、后从零生成」；未达标的轮次必须符合第 8 节客观阻塞条件（容量阻塞 / 覆盖阻塞），且 PR 与提交信息已显著标注「本轮 Ready 未达标·阻塞轮次」。
- [ ] 每个 `Ready` 均满足第 5 节四条准入标准，且详情中含完整历史案例对比（检查范围、相似案例、差异说明）；无任何为凑数降标准准入的项。
- [ ] [idea-pool.md](../ideas/idea-pool.md) 中每行状态与各详情文档中的状态严格一致。
- [ ] 归档项已移出活动池；[completed.md](../ideas/completed.md) / [rejected.md](../ideas/rejected.md) 索引完整，淘汰项原因具体。
- [ ] Markdown 表格结构正确，所有相对链接均可解析。
- [ ] ID 唯一、无重复（含活动池、历史归档与已淘汰记录），序号连续无跳号冲突。
- [ ] `git diff` 仅涉及 `.agents/` 下本轮 Idea 管理文档；若确有必要触及其他管理文档（如入口文档），已在 PR 摘要中说明原因。
- [ ] **未编写任何案例代码**：未改 `playground/`、`src/`、`.github/` 及任何工程配置。

---

## 8. 轮次达标、中断续跑与阻塞处理

- **轮次达标的唯一判定**：本轮**新推进至 `Ready`** 的 Idea 数量达到 `IDEA_EXPLORATION_READY_PER_ROUND`。仅新增/深化草稿（Candidate/Refining）不算达标轮次，不得据此走第 11 步交付闭环；未深化完的草稿是下一轮的第一供给来源，而非本轮产出。
- **中断续跑**：在任何安全点中断时，保持文件一致即可；允许在当前工作分支上做中间提交以保存草稿（提交信息注明「WIP：本轮 Ready 尚未达标」），但**不创建 PR**。下次运行从断点继续（先池中存量草稿、后新生成候选），达标后再统一按第 9 节创建 PR（可与中间提交合并为单提交后推送）。
- **客观阻塞**：若存量草稿已全部处理、且已跨多个技术域从零生成尝试，仍无候选能通过第 5 节准入（不得降标），仅在以下客观条件之一成立时，允许以「未达标轮次」结束并报告阻塞，不得制造空 PR：
  1. **容量阻塞**：活动池已达 `IDEA_POOL_MAX_SIZE`，且池内没有可继续深化至 Ready 的草稿、也没有可淘汰项；
  2. **覆盖阻塞**：经核对全部 9 大技术域与历史案例，确无可形成实质差异的新方向（须在报告中列出已排查的方向与排除依据）。
- 阻塞轮次若已有真实的草稿落盘或淘汰归档变更，可正常提交并创建 PR，但必须在 PR 描述与提交信息中**显著标注「本轮 Ready 未达标·阻塞轮次」及具体阻塞类型、已尝试的技术域与方向**；不存在任何有效变更时，**不得**制造无意义改动、空提交或空 PR，直接向调用者报告阻塞原因与下一轮建议。

---

## 9. 独立 Git/PR 交付闭环

> **PR 是本 SOP 的预期交付物**。“完成本地提交”不等于“完成 PR 交付”；以下规则复用仓库既有 Git/PR 约定（分支前缀、CI、auto-merge 与熔断护栏），仅适配为文档类交付，不另起规则。

### 9.1 最终检查

- 执行 `git status` 与 `git diff --stat`，确认变更仅限本轮 `.agents/` 管理文档。
- 若必要时触及 `AGENTS.md` 等入口文档，须在 PR 摘要中显式说明（注意这会命中 auto-merge 熔断，见 9.5）。

### 9.2 分支与暂存

- 从最新 `main` 创建工作分支，命名沿用：`feat/autonomous-iteration/<时间戳或主题>`，例如 `feat/autonomous-iteration/20261011-idea-exploration`。
- **不得直接向 `main` 提交**。
- 只精确暂存本轮相关文件（写明路径，如 `git add .agents/ideas/idea-pool.md .agents/ideas/idea-details/ .agents/ideas/rejected.md`），**禁止 `git add -A` / `git add .`**，避免带入无关改动。

### 9.3 提交信息（Conventional Commits 强化规范，中文结构化）

- `type` 使用 `docs` 或 `chore`，`scope` 用 `ideas`；单轮单提交。
- 示例：

```text
docs(ideas): 本轮 Idea 探索新增 3 个候选并完善 2 个至 Ready

[本轮探索背景与方向]
- 基于 src/playground.js 历史盘点，当前 X 技术域覆盖薄弱，本轮重点补充 Y 类交互；当前容量 N（上限 IDEA_POOL_MAX_SIZE）。

[Idea 变更清单]
- 新增：IDEA-007 <名称>（Candidate）——理由
- 深化：IDEA-003 <名称>（Candidate→Refining）——补充内容
- Ready：IDEA-001 <名称>（Refining→Ready）——四项准入通过，差异点
- 淘汰：IDEA-005 <名称>（→Rejected）——具体原因，已归档 rejected.md

[准入与容量检查]
- Ready 四项标准逐项通过情况；本轮新 Ready 数是否达到 IDEA_EXPLORATION_READY_PER_ROUND，并注明来源（存量草稿深化 / 从零生成；未达标须为第 8 节客观阻塞并注明类型）；当前容量与阈值处理。

[验证结果]
- 仅如实声明实际执行的检查（状态一致性、链接、ID 唯一性等）；未运行或不适用的测试不得声称通过。
```

> 不得在提交信息中声称运行了未执行的测试或构建（文档-only 轮次通常不触发 lint/build 的必要性）。

### 9.4 推送并创建 PR

```bash
git push -u origin <branch>
gh pr create --base main --title "..." --body "..."
```

PR 标题简明（如 `docs(ideas): Idea 探索第 N 轮（新增 X / Ready Y / 淘汰 Z）`），描述包含：

1. **变更摘要**：本轮探索方向与涉及文件；
2. **Idea 统计表**：各状态（Candidate / Refining / Ready / In Progress / Completed / Rejected）本轮数量与池内总量；
3. **准入/容量验证说明**：本轮 Ready 产出相对 `IDEA_EXPLORATION_READY_PER_ROUND` 的达标结论与来源构成（存量草稿深化几个 / 从零生成几个；未达标须按第 8 节显著标注阻塞轮次与阻塞类型）、Ready 准入结论、容量相对阈值情况、第 7 节清单自检结果；
4. **遗留问题**：待澄清候选、下一轮建议方向等。

`gh` 未登录或无权限时：完成本地提交后**停止**，明确报告阻塞原因与剩余手动步骤（给出需手动执行的 `git push` 与 `gh pr create` 命令），**不得谎称 PR 已创建**。PR 创建失败时同样如实报告失败原因与已完成的 commit。

### 9.5 CI 与自动合并机制

- **CI 门禁**（[ci.yml](../../.github/workflows/ci.yml)）：PR 触发 `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm build`。
- **自动合并**（[auto-merge.yml](../../.github/workflows/auto-merge.yml)）：仅对 `feat/autonomous-iteration/*` 分支、非 draft、未带 `no-auto-merge` label、且**不触及受保护路径**（`.github/`、`AGENTS.md`、`package.json`、锁文件、`.env*`）的 PR 自动启用 GitHub auto-merge；CI 全绿后自动合并并删除远端分支。
- Idea 文档-only 变更（仅 `.agents/`）通常安全，可走自动合并；若本轮触及 `AGENTS.md` 等受保护路径，会熔断转人工审查——这是预期行为，须在结果报告中说明。
- **Agent 不得擅自合并 PR**，除非既有规则或用户授权允许。无需轮询合并状态；若 CI 红灯，定位原因修复后推送即可（文档-only 变更一般不会引发 CI 失败，若失败多为分支/基线问题）。

### 9.6 结果报告

向调用者报告：

- PR 链接（或阻塞原因与剩余手动步骤）；
- 本轮主要产出：各 ID、名称与状态变化（新增/深化/Ready/淘汰），并显式给出本轮新 Ready 数与 `IDEA_EXPLORATION_READY_PER_ROUND` 的达标结论与来源构成（存量深化 / 从零生成；未达标须说明阻塞类型）；
- 验证结果：容量、准入、一致性检查的实际结论；
- 尚未解决的问题与下一轮建议。

---

## 10. 与案例开发 SOP 的边界

- 本 SOP 只产出**高质量 Idea 与管理文档**，止步于 `Ready`；不编写案例代码、不改动 `playground/` 与 `src/playground.js`。
- `Ready` 之后的实现、注册、验证与归档由 [case-development-sop.md](./case-development-sop.md) 负责（`Ready → In Progress → Completed`）。
- 两个 SOP **独立启动、独立交付 PR**，互不假定对方同次运行。
- 第 2 节的状态定义与容量口径两边必须保持一致；任一方调整状态语义须同步另一方。

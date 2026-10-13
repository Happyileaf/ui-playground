# Idea 池（活动索引）

> 本文件是所有**未完成 Idea** 的唯一活动索引，由「Idea 探索 SOP」（`.agents/SOP/idea-exploration-sop.md`）与「案例开发 SOP」（`.agents/SOP/case-development-sop.md`）共同维护。

## 规则

- 只有状态为 `Candidate`、`Refining`、`Ready`、`In Progress` 的 Idea 出现在本表，并占用 Idea 池容量。
- `Completed` / `Rejected` 必须从本表移除，分别归档至 [completed.md](./completed.md) / [rejected.md](./rejected.md)，不再占用容量；详情文件保留在 `idea-details/` 中。
- **表格行顺序即默认开发顺序**：案例开发 SOP 在无用户指定时，自上而下选择第一个 `Ready`。新深化成熟、优先级更高的 Idea 可调整到表格上方，但不得随意打乱已有排序。
- 每行的「状态」必须与对应详情文档中的状态严格一致。
- 容量上限与预警线以 Idea 探索 SOP 开头声明的参数为准（`IDEA_POOL_MAX_SIZE` / `IDEA_POOL_WARNING_THRESHOLD`）。
- 详情链接使用相对路径 `./idea-details/IDEA-xxx.md`，新增或移动文件时必须保持链接有效。

## Idea 列表

| ID | 名称 | 状态 | 分类 | 详情 |
|---|---|---|---|---|
| IDEA-001 | 日历日期选择器（Date Picker） | Ready | components | [./idea-details/IDEA-001.md](./idea-details/IDEA-001.md) |
| IDEA-002 | 内容轮播（Carousel · Hero 展示轮播） | Ready | components | [./idea-details/IDEA-002.md](./idea-details/IDEA-002.md) |
| IDEA-003 | Toast 轻提示系统（Toast · 堆叠即时反馈通知） | Ready | components | [./idea-details/IDEA-003.md](./idea-details/IDEA-003.md) |
| IDEA-004 | 标签输入（Tags Input · 多值芯片输入） | Ready | components | [./idea-details/IDEA-004.md](./idea-details/IDEA-004.md) |
| IDEA-005 | 步骤向导（Step Wizard · 多步骤表单流程容器） | Ready | components | [./idea-details/IDEA-005.md](./idea-details/IDEA-005.md) |
| IDEA-006 | 极速拨号菜单（FAB Speed Dial · 展开式快捷操作菜单） | Ready | components | [./idea-details/IDEA-006.md](./idea-details/IDEA-006.md) |
| IDEA-007 | Gooey 液态下载按钮（Liquid Download Button · 多状态形变进度按钮） | Ready | components | [./idea-details/IDEA-007.md](./idea-details/IDEA-007.md) |
| IDEA-008 | 实时对话工作台（Chat Workspace · 拟真即时通讯界面） | Ready | pages | [./idea-details/IDEA-008.md](./idea-details/IDEA-008.md) |
| IDEA-009 | SVG 数据图表动效仪表盘（Animated SVG Charts · 描边生长数据看板） | Ready | components | [./idea-details/IDEA-009.md](./idea-details/IDEA-009.md) |
| IDEA-010 | 级联选择器（Cascader · 多列逐级联动选择框） | Ready | components | [./idea-details/IDEA-010.md](./idea-details/IDEA-010.md) |
| IDEA-011 | 星级评分（Star Rating · 半星精度的可访问评价组件） | Ready | components | [./idea-details/IDEA-011.md](./idea-details/IDEA-011.md) |
| IDEA-012 | 分页器（Pagination · 滑动胶囊指示的可访问数据分页组件） | Ready | components | [./idea-details/IDEA-012.md](./idea-details/IDEA-012.md) |
| IDEA-013 | 环形拨盘时间选择器（Time Picker · 拟真时钟表盘选时组件） | Ready | components | [./idea-details/IDEA-013.md](./idea-details/IDEA-013.md) |

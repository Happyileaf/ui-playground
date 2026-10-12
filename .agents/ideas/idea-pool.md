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
| IDEA-023 | Analog Dial Time Picker · 拟物表盘时间选择器（`time-picker`） | Ready | components | [IDEA-023.md](./idea-details/IDEA-023.md) |

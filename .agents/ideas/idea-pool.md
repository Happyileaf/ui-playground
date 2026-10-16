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
| IDEA-014 | 日夜形变开关合集（Toggle Switch Gallery · 主题叙事开关组） | Ready | components | [./idea-details/IDEA-014.md](./idea-details/IDEA-014.md) |
| IDEA-015 | 视图转场画廊（View Transition Gallery · 共享元素页面形变转场） | Ready | effects | [./idea-details/IDEA-015.md](./idea-details/IDEA-015.md) |
| IDEA-016 | 全屏图片灯箱（Image Lightbox · 沉浸式图集查看器） | Ready | components | [./idea-details/IDEA-016.md](./idea-details/IDEA-016.md) |
| IDEA-017 | CSS 贝塞尔缓动工坊（Cubic Bézier Easing Studio · 可拖拽缓动曲线实验室） | Ready | components | [./idea-details/IDEA-017.md](./idea-details/IDEA-017.md) |
| IDEA-018 | 机械翻页倒计时（Flip Countdown · Split-Flap 拟真翻牌计时器） | Ready | effects | [./idea-details/IDEA-018.md](./idea-details/IDEA-018.md) |
| IDEA-019 | 表情选择器（Emoji Picker · 可搜索分类的高可访问表情面板） | Ready | components | [./idea-details/IDEA-019.md](./idea-details/IDEA-019.md) |
| IDEA-020 | 提及输入（Mentions Input · 触发式联系人 @ 提及组件） | Ready | components | [./idea-details/IDEA-020.md](./idea-details/IDEA-020.md) |
| IDEA-021 | 滑动操作列表（Swipe Action List · 横滑露出操作的手势列表） | Ready | components | [./idea-details/IDEA-021.md](./idea-details/IDEA-021.md) |
| IDEA-022 | 滑块拼图验证码（Slider Puzzle CAPTCHA · 拖拽缺口对位人机校验） | Ready | components | [./idea-details/IDEA-022.md](./idea-details/IDEA-022.md) |
| IDEA-023 | 方向感知悬停图廊（Direction-Aware Hover Gallery · 随出入边缘滑入滑出的图卡遮罩） | Ready | components | [./idea-details/IDEA-023.md](./idea-details/IDEA-023.md) |
| IDEA-024 | 双栏穿梭选择框（Transfer · 候选到已选的穿梭选择器） | Ready | components | [./idea-details/IDEA-024.md](./idea-details/IDEA-024.md) |
| IDEA-025 | 刮刮乐涂层揭示卡（Scratch Card · 刮开银漆揭晓奖品的互动券卡） | Ready | components | [./idea-details/IDEA-025.md](./idea-details/IDEA-025.md) |
| IDEA-026 | 气泡确认框（Popconfirm · 锚定式轻量二次确认） | Ready | components | [./idea-details/IDEA-026.md](./idea-details/IDEA-026.md) |
| IDEA-027 | 弹性下拉刷新（Pull to Refresh · 阻尼拉伸手势刷新） | Ready | components | [./idea-details/IDEA-027.md](./idea-details/IDEA-027.md) |
| IDEA-028 | 行内原地编辑（Inline Edit · 点击即改的查看/编辑态无缝切换） | Ready | components | [./idea-details/IDEA-028.md](./idea-details/IDEA-028.md) |
| IDEA-029 | 幸运抽奖转盘（Lucky Wheel · 加权概率拟真幸运大转盘） | Ready | components | [./idea-details/IDEA-029.md](./idea-details/IDEA-029.md) |
| IDEA-030 | 音频反应频谱可视化（Audio Spectrum Visualizer · Web Audio 实时频谱律动可视化） | Ready | effects | [./idea-details/IDEA-030.md](./idea-details/IDEA-030.md) |
| IDEA-031 | 密码强度工坊（Password Strength Studio · 实时熵评估与破解耗时可视化注册表单） | Ready | components | [./idea-details/IDEA-031.md](./idea-details/IDEA-031.md) |
| IDEA-032 | 可视化节点流编辑器（Node Flow Editor · 拖拽节点与 SVG 贝塞尔连线的工作流编排画布） | Ready | components | [./idea-details/IDEA-032.md](./idea-details/IDEA-032.md) |
| IDEA-033 | 骨架屏加载系统（Skeleton Loading System · 多布局占位与异步状态切换组件） | Ready | components | [./idea-details/IDEA-033.md](./idea-details/IDEA-033.md) |
| IDEA-034 | 状态化形变图标按钮库（Stateful Morphing Icon Buttons · SVG 路径形变交互图标组） | Ready | components | [./idea-details/IDEA-034.md](./idea-details/IDEA-034.md) |
| IDEA-035 | 飞入购物车微交互（Fly to Cart · FLIP 抛物线加购反馈组件） | Ready | components | [./idea-details/IDEA-035.md](./idea-details/IDEA-035.md) |
| IDEA-036 | 快捷键录制器（Keyboard Shortcut Recorder · 捕获组合键与冲突检测的设置面板组件） | Ready | components | [./idea-details/IDEA-036.md](./idea-details/IDEA-036.md) |
| IDEA-037 | 文本乱码解码器（Text Scramble Decoder · 逐字符随机解码的终端美学标题动效） | Ready | effects | [./idea-details/IDEA-037.md](./idea-details/IDEA-037.md) |
| IDEA-038 | Bento 形变特性网格（Bento Feature Grid · FLIP 展开的非对称产品特性墙） | Ready | components | [./idea-details/IDEA-038.md](./idea-details/IDEA-038.md) |
| IDEA-039 | 步进鼓机音序器（Step Sequencer · 可编程节拍网格的合成鼓机） | Ready | effects | [./idea-details/IDEA-039.md](./idea-details/IDEA-039.md) |
| IDEA-040 | 滚动叙事产品页（Scroll-Scrubbed Product Story · 视口定格分层产品发布页） | Ready | pages | [./idea-details/IDEA-040.md](./idea-details/IDEA-040.md) |
| IDEA-041 | 交互式甘特排期图（Interactive Gantt Chart · 拖拽调度的可访问项目时间线） | Ready | components | [./idea-details/IDEA-041.md](./idea-details/IDEA-041.md) |
| IDEA-042 | 拟真旋转旋钮控制台（Rotary Knob Console · 径向拖拽的硬件感连续数值调节台） | Ready | components | [./idea-details/IDEA-042.md](./idea-details/IDEA-042.md) |
| IDEA-043 | 影院选座图（Cinema Seat Picker · 影厅座位图点选与订单联动） | Ready | components | [./idea-details/IDEA-043.md](./idea-details/IDEA-043.md) |

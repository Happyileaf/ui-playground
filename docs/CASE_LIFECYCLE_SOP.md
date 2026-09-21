# 案例全生命周期管理指南 (CRUD & Lifecycle SOP)

> **适用对象**：AI Agent 与维护开发者。
> **核心原则**：任何案例的操作都由 **「物理文件层」** 与 **「元数据注册层」** 两个维度构成，两层必须始终保持 100% 强一致性。

---

## 0. 案例双层映射模型

```text
┌──────────────────────────────────────────────────────────────────┐
│                   物理文件层 (Physical Files)                     │
│  /effects/<case-id>/   或   /components/<case-id>/               │
│  ├── index.html                                                  │
│  ├── style.css (可选)                                             │
│  └── script.js (可选)                                             │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ 必须完全一致
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                  元数据注册层 (Metadata Registry)                │
│  /src/playground.js -> const cases = [ ... ]                     │
│  { id, title, type, category, path, url, description, files, tags }│
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. ➕ 新增案例 SOP (Create)

### 步骤 1：决策分类与 ID 命名
- **特效分类 (`/effects/<id>/`)**：适用于 Canvas 动画、物理引擎、着色器、生成艺术、粒子系统、音频合成。
- **组件分类 (`/components/<id>/`)**：适用于 UI 控件、导航、弹窗、表单、微交互、卡片系统。
- **ID 命名规范**：必须使用小写 `kebab-case`（如 `particle-text`, `matrix-rain`），禁止使用下划线、大写字母或特殊字符。

### 步骤 2：创建原生文件
选择多文件结构（推荐）或单文件结构编写代码：
```text
effects/<case-id>/
├── index.html     # HTML 骨架（相对路径引入 ./style.css 与 ./script.js）
├── style.css      # 纯原生 CSS3（严禁引入外部框架）
└── script.js      # 纯原生 ES6+ JavaScript（自包含逻辑）
```

### 步骤 3：在 `src/playground.js` 注册元数据
将新的元数据对象追加至 `cases` 数组：
```javascript
{
  id: 'matrix-rain',
  title: '代码雨特效',
  type: 'effect',               // 'effect' | 'component'
  category: 'effects',          // 'effects' | 'components'
  path: 'effects/matrix-rain/', // 必须以 '/' 结尾
  url: '/effects/matrix-rain/index.html',
  description: 'Canvas 绿磷字符雨落动效，包含动态字符随机变换与透明渐隐拖尾。',
  files: ['index.html', 'style.css', 'script.js'], // 与实际物理文件列表严格一致
  tags: ['canvas', 'matrix', 'typography', 'cyber']
}
```

### 步骤 4：执行 5 项上线质量验收（见第 5 节）

---

## 2. ✏️ 修改与迭代案例 SOP (Update)

根据修改范围，分为以下三种场景：

### 场景 A：仅修改案例内部视觉/交互代码
- **操作范围**：直接编辑对应目录下的 `index.html`、`style.css` 或 `script.js`。
- **注意事项**：
  1. 严禁引入任何外层框架依赖或全局相对路径资源。
  2. 保持独立运行能力（脱离外壳直接打开依然 100% 正常）。
- **同步要求**：若文件增减（例如从单文件拆分为多文件，或新增本地 SVG/资产），**必须**同步更新 `cases` 数组中该项的 `files` 列表。

### 场景 B：仅更新案例元数据（文案/标签/分类）
- **操作范围**：编辑 `src/playground.js` 中对应案例的 `title`、`description`、`tags` 或 `category`。
- **注意事项**：
  - 若修改了 `category`（如从 `effects` 调整为 `components`），需同步调整其物理目录移动（见场景 C）。

### 场景 C：重构或重命名案例 (Rename / Refactor)
- **标准操作流**：
  1. **移动/重命名物理目录**：例如将 `effects/old-name/` 重命名为 `effects/new-name/`。
  2. **全局更新元数据**：
     - `id`: `'new-name'`
     - `path`: `'effects/new-name/'`
     - `url`: `'/effects/new-name/index.html'`
     - 检查 `files` 列表是否与新目录内文件完全匹配。
  3. **清理缓存与测试**：重启预览，验证画廊跳转、Studio 加载与 ZIP 下载名称是否同步更新为 `new-name.zip`。

---

## 3. 🗑️ 删除案例 SOP (Delete)

当需要下线或移除某个废弃案例时，请按顺序执行：

### 步骤 1：从注册表中移除元数据
在 `src/playground.js` 的 `cases` 数组中找到对应的对象，整块删除。

### 步骤 2：删除对应的物理文件夹
删除对应的整个案例目录（例如 `rm -rf effects/old-case/` 或使用对应工具）。

### 步骤 3：默认案例回退检查
如果被删除的案例是 `cases[0]`（默认选中的案例），确认 `currentCase = cases[0]` 能正常指向新的首个案例，避免页面初始化产生空指针。

### 步骤 4：构建与依赖校验
执行 `npm run build && npm run lint`，确保没有残留的引用或未闭合的代码块。

---

## 4. 🔍 检索与审查 SOP (Read & Inspect)

在维护或重构现有案例前，推荐按照以下流程进行审查：

1. **查阅元数据**：在 `src/playground.js` 中查找目标 `id`，了解其包含的 `files` 与 `tags`。
2. **独立预览测试**：直接在浏览器访问 `/effects/<id>/index.html` 查看原生表现。
3. **沙箱运行测试**：在 Playground 工作台中查看各视口尺寸下的响应式缩放与动画帧率表现。
4. **源码高亮审查**：在 Studio 中展开 Code 抽屉，检查各标签页内容是否为纯净的源代码。

---

## 5. ✅ 全生命周期质量验收清单 (QA Matrix)

无论执行了增、删、改哪类操作，交付前必须通过以下矩阵验收：

| 验收项 | 验证方法 | 预期结果 |
| :--- | :--- | :--- |
| **1. 独立运行** | 浏览器直接打开 `/<path>/index.html` | 脱离外壳仍能完整展示与交互，控制台零报错 |
| **2. HUD 与 Title 规范** | 检查案例右上角布局与交互 | **每个特效必须包含右上角 Title 胶囊**（固定主题色呼吸点、单行文字）；若包含控制面板，**必须默认收起 (`.hidden`)** 并支持齿轮按钮与 `H` 快捷键切换 |
| **3. 画廊网格** | 在首页 Gallery 查看对应卡片 | 标题、标签、分类徽章渲染正确，点击能进入 Studio |
| **4. 工作台沙箱** | 在 Studio 查看 iframe 预览 | 界面正确定位，切换 `Desktop/Tablet/Mobile` 视口响应平滑 |
| **5. 源码抽屉** | 打开 Code 抽屉切换所有文件 Tab | 文件内容完整呈现，Prism 高亮无误，无 Vite 包装代码 |
| **6. ZIP 导出** | 点击 Download 导出压缩包并在本地解压 | 本地双击 `index.html` 效果与线上 100% 一致 |
| **7. 构建检查** | 终端运行 `npm run build && npm run lint` | 零 TypeScript / 编译错误，编译通过 |

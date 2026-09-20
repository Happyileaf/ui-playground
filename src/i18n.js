// UI Playground Workbench Shell - Multi-Language (i18n) Engine
// NOTE: Strictly isolated to the platform shell. Standalone cases remain 100% self-contained.

export const SUPPORTED_LANGS = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
  { code: 'de-DE', label: 'Deutsch' }
];

export const translations = {
  'zh-CN': {
    // Brand & Header
    brandTag: '原生',
    navGallery: '画廊',
    navGalleryTitle: '全部案例网格总览',
    navStudio: '工作台',
    navStudioTitle: '交互式工作台与设备预览',
    githubBtn: 'GitHub',
    githubTooltip: '访问 GitHub 仓库 (开源主页)',
    searchBtn: '搜索',
    searchTitle: '快速搜索 (Cmd+K)',
    guideBtn: '架构指南',
    guideTitle: '原生优先理念与架构规范',

    // Gallery Hero & Stats
    heroTitle: '创意动效与原生 UI 组件工作台',
    heroDesc: '精选基于原生 Web 标准的物理动效与交互组件集合。100% 纯原生实现，零外部运行时依赖。',
    statCases: '个独立案例',
    statDeps: '0 外部依赖',
    statNative: '100% 原生 Web API',

    // Gallery Filters & Search
    filterAll: '全部案例',
    filterEffects: '视觉特效',
    filterComponents: 'UI 组件',
    gallerySearchPlaceholder: '按标题、标签、API 过滤...',
    noCasesFoundTitle: '未找到匹配案例',
    noCasesFoundHint: '尝试更换关键词或切换上方分类。',

    // Card Actions
    cardRun: '运行',
    cardCodeTitle: '查看源码',
    cardDownloadTitle: '下载案例源码包 (ZIP)',
    cardOpenTabTitle: '新标签页独立打开',

    // Studio Sidebar
    studioSearchPlaceholder: '快速查找案例...',
    studioCatAll: '全部',
    studioCatEffects: '特效',
    studioCatComponents: '组件',
    studioCounterOf: '/',
    studioCounterCases: '个案例',
    studioCounterNative: '原生自包含',
    studioNoMatches: '无匹配案例',

    // Studio Stage Toolbar & Breadcrumb
    breadcrumbEffect: '特效',
    breadcrumbComponent: '组件',
    copyPathTitle: '复制路径到剪贴板',
    toastCopiedPath: '案例路径已复制到剪贴板！',
    langMenuTitle: '切换语言',
    vpDesktopTitle: '桌面端 (100%)',
    vpTabletTitle: '平板端 (768px)',
    vpMobileTitle: '移动端 (390px)',
    reloadStageTitle: '重新加载预览',
    stageCodeBtn: '源码',
    stageCodeTitle: '查看当前案例源码',
    stageDownloadBtn: '下载 ZIP',
    stageDownloadTitle: '下载当前案例压缩包 (ZIP)',
    stageStandaloneBtn: '独立窗口',
    stageStandaloneTitle: '在独立新标签页中打开当前案例',

    // Code Drawer
    drawerCopy: '复制',
    drawerCopied: '已复制！',
    drawerCopyTitle: '复制当前文件代码',
    drawerDownload: '下载 ZIP',
    drawerDownloadTitle: '下载完整案例压缩包 (ZIP)',
    loadingSource: '正在加载源码...',
    couldNotLoadFile: '无法加载文件',

    // Command Palette
    palettePlaceholder: '输入组件名称或操作 (如 fireworks, button)...',
    paletteEmpty: '未找到匹配的组件或命令',
    paletteNavHint: '导航：↑ ↓ 选择，↵ 确定',
    paletteEscHint: 'ESC 关闭',

    // Architecture Guide Modal
    guideModalTitle: 'UI Playground 架构指南',
    guideGithubLink: '在 GitHub 上 Star / 参与共建',
    guidePrinciple1Title: '1. 原生优先与零运行时冗余 (Native First)',
    guidePrinciple1Desc: '每一个案例均纯粹基于原生 HTML5、现代 CSS3 与 ES6+ JavaScript 构建。绝无第三方打包器锁定，独立案例中零外部运行时框架依赖，还原极致原生 Web 性能。',
    guidePrinciple2Title: '2. 100% 独立离线运行保证 (Standalone Guarantee)',
    guidePrinciple2Desc: '每个特效与组件均位于独立的专属目录中。脱离外壳直接在任何浏览器双击 index.html 即可 100% 完整运行，拥有完整视觉与交互体验。',
    guidePrinciple3Title: '3. 极速自主扩展新案例 (Rapid Extension)',
    guidePrinciple3Desc: '只需在 effects/ 或 components/ 下新建子文件夹，编写 index.html，并在 playground.js 中注册元数据即可瞬时接入沙箱工作台。',

    // Footer
    footerBadgeNative: '原生优先',
    footerDesc: '面向现代 Web 的原生交互组件与物理动效试验台。100% 纯原生实现，免构建步骤，双击即用。',
    footerColCategories: '案例分类',
    footerColTech: '技术标准',
    footerColQuick: '快捷导航',
    footerActionSearch: '⌘K 快捷搜索',
    footerActionGuide: '架构指南与规范',
    footerActionStudio: '进入 Studio 工作台',
    footerActionGithub: 'GitHub 开源项目',
    footerCopyrightText: '纯原生零依赖交互试验台',
    footerShortcutCmdK: '命令检索',
    footerShortcutEsc: '关闭浮层',
    footerTotalCases: '个收录案例',

    // Toasts
    toastCopied: '已复制到剪贴板！',
    toastPackaging: '正在打包',
    toastDownloaded: '已下载',
    toastDownloadFailed: '下载失败',
    toastReloaded: '已重置舞台预览环境'
  },

  'en-US': {
    // Brand & Header
    brandTag: 'Native',
    navGallery: 'Gallery',
    navGalleryTitle: 'Grid Showcase of All Cases',
    navStudio: 'Studio',
    navStudioTitle: 'Interactive Workspace & Device Preview',
    githubBtn: 'GitHub',
    githubTooltip: 'View on GitHub (Open Source)',
    searchBtn: 'Search',
    searchTitle: 'Quick Search (Cmd+K)',
    guideBtn: 'Guide',
    guideTitle: 'Native-First Principles & Guidelines',

    // Gallery Hero & Stats
    heroTitle: 'Creative UI & Motion Playground',
    heroDesc: 'A curated collection of physics-based visual effects and interactive UI components. Crafted with 100% native Web standards and zero external runtime bloat.',
    statCases: 'Standalone Cases',
    statDeps: '0 Dependencies',
    statNative: '100% Native Web APIs',

    // Gallery Filters & Search
    filterAll: 'All Cases',
    filterEffects: 'Visual Effects',
    filterComponents: 'UI Components',
    gallerySearchPlaceholder: 'Filter by title, tag, API...',
    noCasesFoundTitle: 'No cases found',
    noCasesFoundHint: 'Try searching for a different keyword or switch categories.',

    // Card Actions
    cardRun: 'Run',
    cardCodeTitle: 'View Source Code',
    cardDownloadTitle: 'Download Case Package (ZIP)',
    cardOpenTabTitle: 'Open Standalone in New Tab',

    // Studio Sidebar
    studioSearchPlaceholder: 'Quick find case...',
    studioCatAll: 'All',
    studioCatEffects: 'Effects',
    studioCatComponents: 'Components',
    studioCounterOf: 'of',
    studioCounterCases: 'cases',
    studioCounterNative: 'Native Standalone',
    studioNoMatches: 'No matching cases',

    // Studio Stage Toolbar & Breadcrumb
    breadcrumbEffect: 'Effect',
    breadcrumbComponent: 'Component',
    copyPathTitle: 'Copy path to clipboard',
    toastCopiedPath: 'Case path copied to clipboard!',
    langMenuTitle: 'Switch Language',
    vpDesktopTitle: 'Desktop 100%',
    vpTabletTitle: 'Tablet (768px)',
    vpMobileTitle: 'Mobile (390px)',
    reloadStageTitle: 'Reload Frame',
    stageCodeBtn: 'Code',
    stageCodeTitle: 'View Source Code of this Case',
    stageDownloadBtn: 'Download',
    stageDownloadTitle: 'Download Case Package (ZIP)',
    stageStandaloneBtn: 'Standalone',
    stageStandaloneTitle: 'Open this Case in New Tab',

    // Code Drawer
    drawerCopy: 'Copy',
    drawerCopied: 'Copied!',
    drawerCopyTitle: 'Copy Current File Code',
    drawerDownload: 'Download ZIP',
    drawerDownloadTitle: 'Download Entire Case ZIP',
    loadingSource: 'Loading source code...',
    couldNotLoadFile: 'Could not load file',

    // Command Palette
    palettePlaceholder: 'Type a component name or action...',
    paletteEmpty: 'No matching commands or components found',
    paletteNavHint: 'Navigation: ↑ ↓ to navigate, ↵ to select',
    paletteEscHint: 'ESC to close',

    // Architecture Guide Modal
    guideModalTitle: 'UI Playground Architecture',
    guideGithubLink: 'Star & Contribute on GitHub',
    guidePrinciple1Title: '1. Native First & Zero Bloat',
    guidePrinciple1Desc: 'Every case is implemented purely using native HTML5, modern CSS3, and ES6+ JavaScript. No third-party bundler lock-in, zero runtime frameworks in standalone demos, and pure web performance.',
    guidePrinciple2Title: '2. Independent Execution Guarantee',
    guidePrinciple2Desc: 'Each effect and component lives in its own dedicated directory. Opening index.html in any web browser executes immediately with 100% fidelity without needing the parent playground.',
    guidePrinciple3Title: '3. Adding a New Case in Seconds',
    guidePrinciple3Desc: 'Simply create a new subfolder under effects/ or components/, add your index.html, and register the metadata entry in playground.js.',

    // Footer
    footerBadgeNative: 'Native-First',
    footerDesc: 'A modern native workbench for physics animations and interactive UI components. 100% native standards, zero build steps, instant offline usability.',
    footerColCategories: 'Categories',
    footerColTech: 'Web Standards',
    footerColQuick: 'Navigation',
    footerActionSearch: '⌘K Command Palette',
    footerActionGuide: 'Architecture Guide',
    footerActionStudio: 'Launch Studio',
    footerActionGithub: 'GitHub Repository',
    footerCopyrightText: 'Zero-Dependency Native UI & Motion Workbench',
    footerShortcutCmdK: 'Search',
    footerShortcutEsc: 'Close Overlay',
    footerTotalCases: 'Active Cases',

    // Toasts
    toastCopied: 'Copied to clipboard!',
    toastPackaging: 'Packaging',
    toastDownloaded: 'Downloaded',
    toastDownloadFailed: 'Download failed',
    toastReloaded: 'Reloaded stage preview'
  },

  'de-DE': {
    // Brand & Header
    brandTag: 'Nativ',
    navGallery: 'Galerie',
    navGalleryTitle: 'Rasterübersicht aller Beispiele',
    navStudio: 'Studio',
    navStudioTitle: 'Interaktiver Arbeitsbereich & Gerätevorschau',
    githubBtn: 'GitHub',
    githubTooltip: 'Auf GitHub ansehen (Open Source)',
    searchBtn: 'Suche',
    searchTitle: 'Schnellsuche (Cmd+K)',
    guideBtn: 'Leitfaden',
    guideTitle: 'Native-First Prinzipien & Richtlinien',

    // Gallery Hero & Stats
    heroTitle: 'Kreatives UI- & Animations-Playground',
    heroDesc: 'Eine kuratierte Sammlung physikbasierter visueller Effekte und interaktiver UI-Komponenten. Zu 100 % mit nativen Webstandards und ohne externe Laufzeit-Abhängigkeiten erstellt.',
    statCases: 'Eigenständige Fälle',
    statDeps: '0 Abhängigkeiten',
    statNative: '100% Native Web-APIs',

    // Gallery Filters & Search
    filterAll: 'Alle Fälle',
    filterEffects: 'Visuelle Effekte',
    filterComponents: 'UI-Komponenten',
    gallerySearchPlaceholder: 'Nach Titel, Tag, API filtern...',
    noCasesFoundTitle: 'Keine Fälle gefunden',
    noCasesFoundHint: 'Versuchen Sie ein anderes Suchwort oder wechseln Sie die Kategorie.',

    // Card Actions
    cardRun: 'Starten',
    cardCodeTitle: 'Quellcode anzeigen',
    cardDownloadTitle: 'Beispielpaket (ZIP) herunterladen',
    cardOpenTabTitle: 'In neuem Tab öffnen',

    // Studio Sidebar
    studioSearchPlaceholder: 'Fall schnell finden...',
    studioCatAll: 'Alle',
    studioCatEffects: 'Effekte',
    studioCatComponents: 'Komponenten',
    studioCounterOf: 'von',
    studioCounterCases: 'Fälle',
    studioCounterNative: 'Nativ Eigenständig',
    studioNoMatches: 'Keine passenden Fälle',

    // Studio Stage Toolbar & Breadcrumb
    breadcrumbEffect: 'Effekt',
    breadcrumbComponent: 'Komponente',
    copyPathTitle: 'Pfad in die Zwischenablage kopieren',
    toastCopiedPath: 'Pfad in die Zwischenablage kopiert!',
    langMenuTitle: 'Sprache wechseln',
    vpDesktopTitle: 'Desktop 100%',
    vpTabletTitle: 'Tablet (768px)',
    vpMobileTitle: 'Mobil (390px)',
    reloadStageTitle: 'Frame neu laden',
    stageCodeBtn: 'Code',
    stageCodeTitle: 'Quellcode dieses Beispiels anzeigen',
    stageDownloadBtn: 'Download',
    stageDownloadTitle: 'Beispielpaket (ZIP) herunterladen',
    stageStandaloneBtn: 'Eigenständig',
    stageStandaloneTitle: 'Dieses Beispiel im neuen Tab öffnen',

    // Code Drawer
    drawerCopy: 'Kopieren',
    drawerCopied: 'Kopiert!',
    drawerCopyTitle: 'Code der aktuellen Datei kopieren',
    drawerDownload: 'ZIP herunterladen',
    drawerDownloadTitle: 'Vollständiges Beispiel-ZIP herunterladen',
    loadingSource: 'Quellcode wird geladen...',
    couldNotLoadFile: 'Datei konnte nicht geladen werden',

    // Command Palette
    palettePlaceholder: 'Komponentenname oder Aktion eingeben...',
    paletteEmpty: 'Keine passenden Befehle oder Komponenten gefunden',
    paletteNavHint: 'Navigation: ↑ ↓ zum Navigieren, ↵ zum Auswählen',
    paletteEscHint: 'ESC zum Schließen',

    // Architecture Guide Modal
    guideModalTitle: 'UI Playground Architekturleitfaden',
    guideGithubLink: 'Auf GitHub folgen & mitwirken',
    guidePrinciple1Title: '1. Native First & Zero Bloat',
    guidePrinciple1Desc: 'Jeder Fall wird ausschließlich mit nativem HTML5, modernem CSS3 und ES6+ JavaScript implementiert. Keine Bindung an Drittanbieter-Bundler, null Laufzeit-Frameworks und reine Webleistung.',
    guidePrinciple2Title: '2. Unabhängige Ausführungsgarantie',
    guidePrinciple2Desc: 'Jeder Effekt und jede Komponente befindet sich in einem eigenen Verzeichnis. Das Öffnen der index.html in einem beliebigen Browser wird sofort und zu 100 % originalgetreu ausgeführt.',
    guidePrinciple3Title: '3. Neues Beispiel in Sekundenschnelle',
    guidePrinciple3Desc: 'Erstellen Sie einfach einen neuen Unterordner unter effects/ oder components/, fügen Sie Ihre index.html hinzu und registrieren Sie den Eintrag in playground.js.',

    // Footer
    footerBadgeNative: 'Native-First',
    footerDesc: 'Eine moderne native Werkbank für Physik-Animationen und interaktive UI-Komponenten. 100 % native Standards, null Build-Schritte, sofort offline lauffähig.',
    footerColCategories: 'Kategorien',
    footerColTech: 'Web-Standards',
    footerColQuick: 'Navigation',
    footerActionSearch: '⌘K Befehlspalette',
    footerActionGuide: 'Architekturleitfaden',
    footerActionStudio: 'Studio starten',
    footerActionGithub: 'GitHub-Repository',
    footerCopyrightText: 'Abhängigkeitsfreie native UI- & Animations-Werkbank',
    footerShortcutCmdK: 'Suche',
    footerShortcutEsc: 'Schließen',
    footerTotalCases: 'Aktive Fälle',

    // Toasts
    toastCopied: 'In die Zwischenablage kopiert!',
    toastPackaging: 'Verpacke',
    toastDownloaded: 'Heruntergeladen',
    toastDownloadFailed: 'Download fehlgeschlagen',
    toastReloaded: 'Vorschau neu geladen'
  }
};

const STORAGE_KEY = 'ui_playground_lang';

export function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && translations[saved]) return saved;

  const browserLang = navigator.language || '';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('de')) return 'de-DE';
  return 'en-US';
}

export function setStoredLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function t(key, lang = 'zh-CN') {
  const dict = translations[lang] || translations['zh-CN'];
  return dict[key] || translations['en-US'][key] || key;
}

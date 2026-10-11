import JSZip from 'jszip';
import { getInitialLanguage, setStoredLanguage, t, SUPPORTED_LANGS } from './i18n.js';

// Load raw source files directly via Vite glob to avoid dev server HMR CSS wrapping
const rawSources = import.meta.glob(['/playground/effects/**/*', '/playground/components/**/*', '/playground/pages/**/*'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// UI Playground - Interactive Core
(function () {
  // Master Case Catalog
  const cases = [
    {
      id: 'count-up',
      title: 'Count Up · 数字滚动',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/count-up/',
      url: '/playground/effects/count-up/index.html',
      description: 'requestAnimationFrame 与 easeOutExpo 驱动的数字爬升特效，进入视口独立触发，支持千分位、小数位、前缀后缀与一键重播。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['count-up', 'easing', 'intersection-observer', 'tabular-nums', 'data-viz', 'reduced-motion']
    },
    {
      id: 'scroll-reveal',
      title: 'Scroll Reveal · 滚动入场揭示',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/scroll-reveal/',
      url: '/playground/effects/scroll-reveal/index.html',
      description: 'IntersectionObserver 驱动的入场系统，支持上移、缩放、左右滑入与模糊四形态，同组错峰、一次触发解除观察并尊重减弱动效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['scroll-reveal', 'intersection-observer', 'entrance-animation', 'stagger', 'fade-transition', 'reduced-motion']
    },
    {
      id: 'dynamic-dock',
      title: 'Dynamic Magnification Dock · 动态鱼眼浮动坞台',
      type: 'component',
      category: 'components',
      path: 'playground/components/dynamic-dock/',
      url: '/playground/components/dynamic-dock/index.html',
      description: '连续高斯物理插值鱼眼放大 Dock 坞台系统，具备微拟态磨砂玻璃质感、macOS 经典弹性跳跃反馈、多方位停靠与 Web Audio 触感咔嗒音效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['dynamic-dock', 'fisheye-scale', 'gaussian-curve', 'spring-bounce', 'backdrop-blur', 'web-audio', 'tactile-feedback', 'micro-interaction']
    },
    {
      id: 'holo-card-studio',
      title: 'Holo Card Studio · 3D 全息典藏卡工坊',
      type: 'component',
      category: 'components',
      path: 'playground/components/holo-card-studio/',
      url: '/playground/components/holo-card-studio/index.html',
      description: '基于 EverettFish/holo-card-studio 的 4 层视差纵深架构、动态激光彩虹衍射光栅、Voronoi 星芒闪钻粒子与 3D 分解图层鉴赏工坊。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['holo-studio', '4-layer-depth', 'exploded-view', 'laser-rainbow', 'voronoi-starlight', 'foil-shader', '3d-flip', 'web-audio']
    },
    {
      id: 'embossed-foil-card',
      title: '3D Embossed Collectible Card · 3D 立体收藏卡',
      type: 'component',
      category: 'components',
      path: 'playground/components/embossed-foil-card/',
      url: '/playground/components/embossed-foil-card/index.html',
      description: '极薄平面卡面外轮廓与内部多层微型 3D 浮雕空间视差、24K 动态烫金金属高光、支持 6 张典藏插画平滑切换与光影漫游。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['3d-relief', 'shallow-depth', 'flat-card', 'gold-foil', 'parallax-depth', 'collectible-card', 'gallery-switcher', 'web-audio']
    },
    {
      id: 'holographic-card',
      title: 'Holographic Specular Card · 全息金属折射卡片',
      type: 'component',
      category: 'components',
      path: 'playground/components/holographic-card/',
      url: '/playground/components/holographic-card/index.html',
      description: '拟真金属拉丝基底、色散全息棱镜彩箔与菲涅尔镜面反射卡片，支持 3D 触觉翻转与多种奢雅贵金属工艺。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['3d-transform', 'holographic', 'specular-reflection', 'prismatic-foil', 'metal-finish', 'card-flip']
    },
    {
      id: 'auth',
      title: 'LUMEN · Digital Studio Auth · 登录与空间注册',
      type: 'page',
      category: 'pages',
      path: 'playground/pages/auth/',
      url: '/playground/pages/auth/index.html',
      description: '数字工坊高保真登录与空间注册系统，配备活体流体光织画布、光学微边框、极细 Web Audio 触感音效与无障碍双向表单流。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['page', 'auth', 'login', 'signup', 'generative-art', 'kinetic', 'web-audio', 'form-validation']
    },
    {
      id: 'pricing',
      title: 'SaaS Pricing Plans · 标准服务订阅中心',
      type: 'page',
      category: 'pages',
      path: 'playground/pages/pricing/',
      url: '/playground/pages/pricing/index.html',
      description: '标准 SaaS 服务订阅中心：极简、克制、高级感设计。涵盖 Starter (免费入门)、Lite (个人/微型团队)、Pro (核心推荐专业版) 与 Enterprise (企业定制) 4 个清晰梯度，支持月付/年付联动折算与简洁确认流。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['page', 'saas-pricing', 'starter', 'lite', 'pro', 'enterprise', 'subscription', 'billing']
    },
    {
      id: 'app-layout',
      title: 'App Shell Layout · 现代通用应用布局骨架',
      type: 'page',
      category: 'pages',
      path: 'playground/pages/app-layout/',
      url: '/playground/pages/app-layout/index.html',
      description: '专注通用应用系统布局架构（App Shell）：具备可展开/折叠紧凑导轨的侧边栏、移动端遮罩抽屉、面包屑与全局 ⌘K 检索顶部栏，以及优雅的内容占位插槽。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['page', 'app-layout', 'sidebar', 'topbar', 'breadcrumb', 'responsive', 'shell-ui']
    },
    {
      id: 'living-constellation',
      title: 'Living Constellation · 活体星图',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/living-constellation/',
      url: '/playground/effects/living-constellation/index.html',
      description: '具有深空纵深、活体星图结缔、潮汐引力扰动与低频宇宙事件的艺术级深空视觉作品。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'astronomy', 'constellation', 'particles', 'deep-space', 'generative-art']
    },
    {
      id: 'kinetic-silk',
      title: 'Kinetic Silk Waves',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/kinetic-silk/',
      url: '/playground/effects/kinetic-silk/index.html',
      description: 'Generative fluid silk wave physics with pointer gravity warp, impulse shockwaves, harmonic frequency weaving, and real-time color spectra.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'generative-art', 'kinetic', 'fluid-physics', 'interactive']
    },
    {
      id: 'fireworks',
      title: 'Canvas Fireworks',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/fireworks/',
      url: '/playground/effects/fireworks/index.html',
      description: 'Physics-based multi-particle fireworks with trail gravity, randomized color sparks, and Web Audio sound bursts.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'particles', 'physics', 'web-audio']
    },
    {
      id: 'particle-text',
      title: 'Particle Text',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/particle-text/',
      url: '/playground/effects/particle-text/index.html',
      description: 'Interactive rasterized canvas typography with particle scatter explosion and elastic spring recovery.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'typography', 'raster-analysis', 'spring']
    },
    {
      id: 'glitch-text',
      title: 'Interactive Glitch Text',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/glitch-text/',
      url: '/playground/effects/glitch-text/index.html',
      description: 'Interactive cyberpunk glitch typography with configurable intensity, speed, and color shifting effects.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['typography', 'glitch', 'generative', 'interactive', 'text-effects']
    },
    {
      id: 'cursor-follow',
      title: 'Fluid Cursor Trail',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/cursor-follow/',
      url: '/playground/effects/cursor-follow/index.html',
      description: 'Multi-layer lerp physics cursor with velocity deformation, trailing dots, and magnetic element hover.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['lerp-physics', 'pointer', 'velocity', 'cursor']
    },
    {
      id: 'interactive-piano',
      title: 'Interactive Piano Keyboard',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/interactive-piano/',
      url: '/playground/effects/interactive-piano/index.html',
      description: 'Interactive multi-note piano keyboard with Web Audio synthesis, keyboard support and sustain pedal.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['web-audio', 'interactive', 'keyboard', 'synthesizer']
    },
    {
      id: 'button',
      title: 'Modern UI Buttons',
      type: 'component',
      category: 'components',
      path: 'playground/components/button/',
      url: '/playground/components/button/index.html',
      description: 'Collection of native button styles: ripple wave, conic shimmer border, cyber neon, and glassmorphism.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['button-system', 'ripple', 'conic-shimmer', 'glass']
    },
    {
      id: 'card',
      title: '3D Perspective Card',
      type: 'component',
      category: 'components',
      path: 'playground/components/card/',
      url: '/playground/components/card/index.html',
      description: 'Interactive 3D perspective tilt card with holographic glare reflection and parallax depth layer translation.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['3d-transform', 'parallax-tilt', 'holographic-glare']
    },
    {
      id: 'modal',
      title: 'Native Modal Dialog',
      type: 'component',
      category: 'components',
      path: 'playground/components/modal/',
      url: '/playground/components/modal/index.html',
      description: 'Accessible <dialog> modal with backdrop blur, keyboard Escape handling, and smooth spring entry transitions.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['html5-dialog', 'accessible', 'backdrop-filter']
    },
    {
      id: 'tooltip',
      title: 'Smart Tooltip',
      type: 'component',
      category: 'components',
      path: 'playground/components/tooltip/',
      url: '/playground/components/tooltip/index.html',
      description: 'Smart collision-detecting tooltip that auto-adjusts viewport boundaries with bounce animations.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['collision-detection', 'smart-positioning', 'micro-ui']
    },
    {
      id: 'spotlight-cards',
      title: 'Spotlight Border Cards · 光标聚光描边卡片',
      type: 'component',
      category: 'components',
      path: 'playground/components/spotlight-cards/',
      url: '/playground/components/spotlight-cards/index.html',
      description: '纯 CSS mask 合成的光标追踪环形描边高光与内部柔光卡片组，具备 Lerp 阻尼跟随、离卡弹性回中与独立主题色。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['css-mask', 'spotlight-border', 'pointer-tracking', 'lerp-easing', 'micro-interaction', 'light-shadow']
    },
    {
      id: 'swipe-card-deck',
      title: 'Swipe Card Deck · 弹性拖拽卡牌堆',
      type: 'component',
      category: 'components',
      path: 'playground/components/swipe-card-deck/',
      url: '/playground/components/swipe-card-deck/index.html',
      description: 'Tinder 式拖拽滑动卡牌堆，具备指针拖拽倾斜、LIKE/NOPE 印章、阈值飞出与弹性回弹、底层卡片前推、撤回重抽与 Web Audio 音效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['pointer-events', 'drag-gesture', 'spring-physics', 'swipe-deck', 'throw-dismiss', 'web-audio', 'micro-interaction']
    },
    {
      id: 'capsule-tabs',
      title: 'Capsule Tab Motion Gallery · 胶囊标签动效展厅',
      type: 'component',
      category: 'components',
      path: 'playground/components/capsule-tabs/',
      url: '/playground/components/capsule-tabs/index.html',
      description: '涵盖 6 种经典物理与动效曲线的胶囊切换器：基础线性、弹性阻尼、呼吸光影、SVG 粘滞流体、磁吸瞬动与遮罩浮现，支持全键盘无障碍与纯原生触感音效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['capsule-tabs', 'tab-navigation', 'motion-design', 'cubic-bezier', 'svg-gooey', 'spring-physics', 'web-audio', 'accessibility']
    },
    {
      id: 'scroll-progress-bar',
      title: 'Scroll Progress · 阅读进度条与章节导航',
      type: 'component',
      category: 'components',
      path: 'playground/components/scroll-progress-bar/',
      url: '/playground/components/scroll-progress-bar/index.html',
      description: '顶部 scaleX 阅读进度条、右侧章节圆点滚动侦测导航与带实时百分比的回顶按钮，rAF 节流并适配减弱动效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['scroll-progress', 'scroll-spy', 'raf-throttle', 'back-to-top', 'chapter-nav']
    },
    {
      id: 'accordion-faq',
      title: 'Accordion FAQ · 手风琴问答列表',
      type: 'component',
      category: 'components',
      path: 'playground/components/accordion-faq/',
      url: '/playground/components/accordion-faq/index.html',
      description: 'grid-rows 高度过渡的无障碍手风琴，支持单项展开、全部展开/收起与方向键/Home/End 焦点漫游。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['accordion', 'grid-rows-transition', 'accessible', 'keyboard-nav', 'faq']
    },
    {
      id: 'image-comparison-slider',
      title: 'Image Comparison Slider · 图片对比滑块',
      type: 'component',
      category: 'components',
      path: 'playground/components/image-comparison-slider/',
      url: '/playground/components/image-comparison-slider/index.html',
      description: 'clip-path 裁剪的画面前后对比滑块，支持指针拖拽、键盘方向键微调、预设位置，场景由纯 CSS 渐变构造、零外部图片。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['image-comparison', 'clip-path', 'pointer-events', 'slider', 'keyboard-nav']
    },
    {
      id: 'context-menu',
      title: 'Context Menu · 右键上下文菜单',
      type: 'component',
      category: 'components',
      path: 'playground/components/context-menu/',
      url: '/playground/components/context-menu/index.html',
      description: '支持三级嵌套子菜单的右键上下文菜单，含视口边缘自动翻转、单选/勾选状态、禁用项、触屏长按唤起与完整键盘方向键导航。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['context-menu', 'submenu', 'keyboard-nav', 'long-press', 'floating-panel', 'accessibility']
    },
    {
      id: 'range-slider',
      title: 'Dual Range Slider · 双拇指区间滑块',
      type: 'component',
      category: 'components',
      path: 'playground/components/range-slider/',
      url: '/playground/components/range-slider/index.html',
      description: '双拇指区间选择滑块，自动保证最小间距与边界不越界，支持指针捕获、预设区间快速跳转及方向键/PageUp/Down/Home/End 全键盘操作。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['range-slider', 'dual-thumb', 'form-control', 'pointer-capture', 'keyboard-nav', 'filter']
    },
    {
      id: 'drawer',
      title: 'Slide Drawer · 弹性四向抽屉',
      type: 'component',
      category: 'components',
      path: 'playground/components/drawer/',
      url: '/playground/components/drawer/index.html',
      description: '支持上下左右四个方向滑出的抽屉面板，带高斯模糊遮罩、Tab 焦点陷阱循环、Esc 关闭、背景滚动锁定，关闭后焦点自动归还触发按钮。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['drawer', 'slide-panel', 'focus-trap', 'scroll-lock', 'four-direction', 'accessibility']
    },
    {
      id: 'otp-input',
      title: 'OTP Input · 分段验证码输入',
      type: 'component',
      category: 'components',
      path: 'playground/components/otp-input/',
      url: '/playground/components/otp-input/index.html',
      description: '六位分段验证码输入框，输入自动前进、退格回跳清除、整段粘贴自动拆分填充、方向键移动光标，校验通过呈现成功态，失败抖动提示并支持倒计时重发。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['otp-input', 'one-time-code', 'auto-advance', 'paste-fill', 'form-control', 'verification']
    },
    {
      id: 'color-picker',
      title: 'Color Studio · HSL 色彩工作台',
      type: 'component',
      category: 'components',
      path: 'playground/components/color-picker/',
      url: '/playground/components/color-picker/index.html',
      description: 'HSL 三滑块联动原生取色器，实时输出 HEX、RGB、HSL 三种色值并一键复制，12 色预设板快速起稿，另据色相自动生成互补、邻近、三角与明暗共 7 种和谐配色。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['color-picker', 'hsl', 'color-harmony', 'copy-to-clipboard', 'presets', 'form-control']
    },
    {
      id: 'combo-box',
      title: 'Searchable Combo Box · 可搜索下拉选择框',
      type: 'component',
      category: 'components',
      path: 'playground/components/combo-box/',
      url: '/playground/components/combo-box/index.html',
      description: '长列表即时过滤的可搜索选择框，分组标题与命中高亮、空结果提示、清除与快速定位，完整 ARIA combobox 语义与 ↑↓ Enter Esc 键盘操作。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['combo-box', 'searchable-select', 'filter', 'autocomplete', 'keyboard-nav', 'aria', 'form-control']
    },
    {
      id: 'mega-menu',
      title: 'Mega Menu · 全宽下拉导航菜单',
      type: 'component',
      category: 'components',
      path: 'playground/components/mega-menu/',
      url: '/playground/components/mega-menu/index.html',
      description: '悬停意图延迟展开的全宽多列导航菜单，图标化链接、特色推荐侧栏与平滑位移过渡，支持方向键漫游、Esc 收起，窄屏自动折叠。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['mega-menu', 'full-width-nav', 'hover-intent', 'dropdown', 'keyboard-nav', 'site-header', 'accessibility']
    },
    {
      id: 'file-dropzone',
      title: 'File Dropzone · 拖拽上传区',
      type: 'component',
      category: 'components',
      path: 'playground/components/file-dropzone/',
      url: '/playground/components/file-dropzone/index.html',
      description: '拖拽高亮的多文件上传区，类型与大小校验、图片缩略图预览、模拟进度上传、失败重试与一键清除，全程纯前端演示不上传服务器。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['file-dropzone', 'drag-and-drop', 'file-upload', 'thumbnail', 'progress', 'validation', 'form-control']
    },
    {
      id: 'split-pane',
      title: 'Split Pane · 可调节分栏面板',
      type: 'component',
      category: 'components',
      path: 'playground/components/split-pane/',
      url: '/playground/components/split-pane/index.html',
      description: '嵌套的水平与垂直可调节分栏，Pointer Capture 拖拽分隔条、最小尺寸保护、双击重置、键盘 ←→ 微调与实时百分比显示，含文件树编辑器终端拟真场景。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['split-pane', 'resizable', 'pointer-capture', 'nested-layout', 'keyboard-nav', 'developer-tools']
    },
    {
      id: 'command-palette',
      title: 'Command Palette · 命令面板',
      type: 'component',
      category: 'components',
      path: 'playground/components/command-palette/',
      url: '/playground/components/command-palette/index.html',
      description: 'Ctrl 或 Cmd + K 唤出的键盘命令面板，模糊检索 15 个分组动作，方向键循环导航、回车执行、Esc 关闭，支持匹配高亮、快捷键提示与最近使用记录。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['command-palette', 'keyboard-nav', 'fuzzy-search', 'developer-tools', 'accessible', 'micro-interaction']
    },
    {
      id: 'signature-pad',
      title: 'Signature Pad · 电子签名板',
      type: 'component',
      category: 'components',
      path: 'playground/components/signature-pad/',
      url: '/playground/components/signature-pad/index.html',
      description: 'Pointer Events 统一鼠标触控与手写笔的电子签名板，运笔速度自适应笔触粗细，DPR 高清渲染、合并事件平滑书写，支持撤销、清空与导出下载 PNG。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['signature-pad', 'canvas', 'pointer-events', 'dpr-scaling', 'drawing', 'form-control', 'reduced-motion']
    },
    {
      id: 'payment-card-input',
      title: 'Payment Card Input · 银行卡输入',
      type: 'component',
      category: 'components',
      path: 'playground/components/payment-card-input/',
      url: '/playground/components/payment-card-input/index.html',
      description: '实时联动 3D 银行卡的支付表单，卡号自动分组并识别六大卡组织、聚焦安全码卡片翻转，逐字段校验、月份过期检查与 Luhn 算法校验卡号。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['payment-form', 'credit-card', 'luhn-check', 'input-formatting', 'validation', 'flip-card', 'form-control']
    },
    {
      id: 'logo-marquee',
      title: 'Logo Marquee · 无缝跑马灯',
      type: 'component',
      category: 'components',
      path: 'playground/components/logo-marquee/',
      url: '/playground/components/logo-marquee/index.html',
      description: '纯 CSS 动画驱动的 Logo 无缝跑马灯，轨道复制并平移恰好 50% 消除循环跳跃，悬停暂停、方向切换、边缘渐隐遮罩并支持减弱动态效果偏好。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['marquee', 'logo-wall', 'css-animation', 'infinite-scroll', 'seamless-loop', 'reduced-motion']
    },
    {
      id: 'vertical-timeline',
      title: 'Vertical Timeline · 垂直时间线',
      type: 'component',
      category: 'components',
      path: 'playground/components/vertical-timeline/',
      url: '/playground/components/vertical-timeline/index.html',
      description: '产品里程碑垂直时间线，桌面端左右交替、移动端转单列，IntersectionObserver 滚动揭示卡片，中央脊柱随滚动填充进度，点击或键盘展开事件详情。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['vertical-timeline', 'milestones', 'scroll-reveal', 'intersection-observer', 'responsive', 'reduced-motion']
    },
    {
      id: 'breadcrumb',
      title: 'Breadcrumb · 面包屑导航',
      type: 'component',
      category: 'components',
      path: 'playground/components/breadcrumb/',
      url: '/playground/components/breadcrumb/index.html',
      description: '斜杠、箭头、圆点三种分隔符的语义化面包屑，aria-current 标记当前页；文件浏览器演示点击文件夹实时钻取与层级跳转，窄空间下中间层级自动折叠为省略菜单。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['breadcrumb', 'navigation', 'aria-current', 'overflow-menu', 'file-explorer', 'responsive']
    },
    {
      id: 'typewriter',
      title: 'Typewriter · 打字机文字',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/typewriter/',
      url: '/playground/effects/typewriter/index.html',
      description: '多段文案循环打字与删除的打字机特效，光标闪烁、文案进度点跳转、点击重播，H 呼出的控制台可调节打字速度、循环开关与光标显隐，并适配减弱动态偏好。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['typewriter', 'text-animation', 'typing-effect', 'loop', 'control-dock', 'reduced-motion']
    },
    {
      id: 'image-zoom',
      title: 'Image Zoom · 商品放大镜',
      type: 'component',
      category: 'components',
      path: 'playground/components/image-zoom/',
      url: '/playground/components/image-zoom/index.html',
      description: '电商场景商品放大镜：鼠标或手指在主图上移动时显示圆形镜片并同步呈现局部放大细节，支持 2×/3×/4× 三档倍率切换、键盘方向键平移与边界自动钳制，纯 CSS 渐变构造商品图零外部资源。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['image-zoom', 'e-commerce', 'magnifier', 'pointer-events', 'keyboard-nav', 'zero-image']
    },
    {
      id: 'tree-view',
      title: 'Tree View · 可访问文件树',
      type: 'component',
      category: 'components',
      path: 'playground/components/tree-view/',
      url: '/playground/components/tree-view/index.html',
      description: 'WAI-ARIA 文件目录树：分支展开收起、实时关键词过滤（自动展开命中路径）、一键全展/全收与选中路径回显，完整支持方向键、Home/End、Enter/Space 键盘导航，文件类型图标内联 SVG 绘制。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['tree-view', 'file-tree', 'wai-aria', 'keyboard-nav', 'search-filter', 'navigation']
    },
    {
      id: 'infinite-feed',
      title: 'Infinite Feed · 无限加载信息流',
      type: 'component',
      category: 'components',
      path: 'playground/components/infinite-feed/',
      url: '/playground/components/infinite-feed/index.html',
      description: '基于 IntersectionObserver 的无限信息流：哨兵提前进入视口即模拟异步请求，先展示贴近真实布局的骨架屏，数据返回后卡片入场，支持点赞、关注与失败重试，加载全部内容后展示明确终态。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['infinite-scroll', 'intersection-observer', 'skeleton', 'lazy-loading', 'feed', 'retry']
    },
    {
      id: 'image-cropper',
      title: 'Image Cropper · 图片裁剪器',
      type: 'component',
      category: 'components',
      path: 'playground/components/image-cropper/',
      url: '/playground/components/image-cropper/index.html',
      description: '八向手柄图片裁剪工作台：自由拖拽与四角四边缩放、九宫格辅助线、多种固定宽高比、滚轮与滑杆缩放，内置 Canvas 绘制示例图并支持本地上传，确认后导出裁剪预览 PNG，DPR 适配高清屏。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['image-cropper', 'canvas', 'resize-handle', 'aspect-ratio', 'export-png', 'dpr-aware']
    },
    {
      id: 'guided-tour',
      title: 'Guided Tour · 新手引导',
      type: 'component',
      category: 'components',
      path: 'playground/components/guided-tour/',
      url: '/playground/components/guided-tour/index.html',
      description: '聚光灯式新手功能导览：半透明遮罩挖空高亮目标元素、气泡卡片自动翻转避让边缘，支持上一步/下一步/跳过、Esc 与方向键操作、窗口缩放实时重定位，结束后还原焦点。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['guided-tour', 'spotlight', 'onboarding', 'overlay', 'focus-management', 'walkthrough']
    },
    {
      id: 'like-button',
      title: 'Like Button · 双击点赞迸发',
      type: 'component',
      category: 'components',
      path: 'playground/components/like-button/',
      url: '/playground/components/like-button/index.html',
      description: '社交媒体风格点赞卡片：双击媒体或点击心形按钮切换赞态，触发大心形闪现与多颗碎片向四周迸发，计数即时增减，碎片动画结束自动回收，支持减少动态效果偏好。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['like-button', 'double-tap', 'heart-burst', 'micro-interaction', 'social', 'particle']
    },
    {
      id: 'avatar-stack',
      title: 'Avatar Stack · 头像堆叠名片',
      type: 'component',
      category: 'components',
      path: 'playground/components/avatar-stack/',
      url: '/playground/components/avatar-stack/index.html',
      description: '重叠圆形成员头像组：悬停或键盘聚焦时头像抬升放大并弹出边缘避让名片，点击展开完整资料面板，气泡自动检测视口边界翻转方位，支持 Esc 关闭与焦点还原。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['avatar-stack', 'hover-card', 'edge-aware', 'tooltip', 'team', 'focus-management']
    },
    {
      id: 'menu-morph',
      title: 'Menu Morph · 汉堡形变导航',
      type: 'component',
      category: 'components',
      path: 'playground/components/menu-morph/',
      url: '/playground/components/menu-morph/index.html',
      description: '汉堡按钮三条线形变为关闭图标，全屏遮罩自顶部扫入，导航链接按索引错峰遮罩上滑进入；支持点击遮罩、Esc 关闭、Tab 焦点循环与焦点还原，减少动态效果时即时呈现。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['menu-morph', 'hamburger', 'fullscreen-nav', 'stagger', 'focus-trap', 'morph']
    },
    {
      id: 'top-loading-bar',
      title: 'Top Loading Bar · 顶部加载进度条',
      type: 'component',
      category: 'components',
      path: 'playground/components/top-loading-bar/',
      url: '/playground/components/top-loading-bar/index.html',
      description: '模拟路由请求的顶部细进度条，trickle 随机推进逼近但不满、完成后滑出，配合导航切换与手动开始完成，发光渐变末端。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['loading-bar', 'progress', 'navigation', 'route-transition', 'micro-interaction', 'nprogress']
    },
    {
      id: 'notification-center',
      title: 'Notification Center · 通知中心',
      type: 'component',
      category: 'components',
      path: 'playground/components/notification-center/',
      url: '/playground/components/notification-center/index.html',
      description: '顶栏铃铛驱动的通知下拉中心，未读徽标计数、全部/未读筛选、单条与一键已读，外点与 Esc 关闭并回收焦点，动画状态全程克制。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['notification', 'dropdown', 'badge', 'filter', 'focus-management', 'keyboard-nav', 'accessibility']
    },
    {
      id: 'contribution-graph',
      title: 'Contribution Graph · 贡献热力图',
      type: 'component',
      category: 'components',
      path: 'playground/components/contribution-graph/',
      url: '/playground/components/contribution-graph/index.html',
      description: 'GitHub 风格的年度贡献热力图，53 周×7 天网格配月份与星期标签，悬停提示具体日期与次数，方向键漫游单元格、总数 count-up，五级青绿配色。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['data-viz', 'heatmap', 'calendar', 'tooltip', 'keyboard-nav', 'count-up', 'grid']
    },
    {
      id: 'confetti-burst',
      title: 'Confetti Burst · 庆祝彩带迸发',
      type: 'effect',
      category: 'effects',
      path: 'playground/effects/confetti-burst/',
      url: '/playground/effects/confetti-burst/index.html',
      description: 'Canvas 2D 庆祝彩带粒子：中心爆发与双侧礼炮两种发射，纸片受重力、阻尼与正弦摆动并做 3D 翻转，DPR 自适应、粒子上限保护，Web Audio 手势懒激活轻音效。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'particles', 'confetti', 'physics', 'web-audio', 'celebration', 'requestanimationframe']
    },
    {
      id: 'kanban-board',
      title: 'Kanban Board · 拖拽看板',
      type: 'component',
      category: 'components',
      path: 'playground/components/kanban-board/',
      url: '/playground/components/kanban-board/index.html',
      description: '四列任务看板，Pointer Events 配合 setPointerCapture 跨列拖拽，浮动克隆与占位符实时指示落点、列高亮联动，Esc 取消拖拽，Alt+方向键键盘重排并播报状态。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['kanban', 'drag-and-drop', 'pointer-events', 'sortable', 'keyboard-nav', 'aria-live', 'accessibility']
    },
    {
      id: 'resizable-table',
      title: 'Resizable Table · 列宽可调数据表',
      type: 'component',
      category: 'components',
      path: 'playground/components/resizable-table/',
      url: '/playground/components/resizable-table/index.html',
      description: '后台常见的列宽可调数据表：Pointer Capture 拖拽表头手柄、双击复位，键盘方向键以 8px 步进微调；点击表头排序、关键词过滤，粘性表头配合状态胶囊与进度条展示 12 行任务数据。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['table', 'resizable', 'sortable', 'pointer-events', 'data', 'keyboard-nav', 'sticky']
    },
    {
      id: 'rich-text-toolbar',
      title: 'Rich Text Toolbar · 富文本工具条',
      type: 'component',
      category: 'components',
      path: 'playground/components/rich-text-toolbar/',
      url: '/playground/components/rich-text-toolbar/index.html',
      description: '零框架依赖的富文本编辑条：加粗斜体、标题引用、列表颜色基于原生编辑能力，选中文字时按钮自动高亮；链接浮层录入并保存选区，状态栏统计字数与选区长，一键查看生成的 HTML。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['rich-text', 'contenteditable', 'toolbar', 'execCommand', 'dropdown', 'selection', 'editor']
    },
    {
      id: 'watermark',
      title: 'Watermark Guard · 防泄密水印',
      type: 'component',
      category: 'components',
      path: 'playground/components/watermark/',
      url: '/playground/components/watermark/index.html',
      description: '机密文档页的全屏平铺水印：Canvas 单元旋转绘制并 dataURL 平铺，文字、透明度、字号、角度可调且输入防抖；MutationObserver 监听删除与篡改，1 秒内自动重绘自愈。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['watermark', 'canvas', 'security', 'mutation-observer', 'anti-tamper', 'dpr', 'accessible']
    },
    {
      id: 'virtual-list',
      title: 'Virtual List · 万级数据虚拟滚动',
      type: 'component',
      category: 'components',
      path: 'playground/components/virtual-list/',
      url: '/playground/components/virtual-list/index.html',
      description: '10000 条日志的定高虚拟滚动：phantom 撑高加 translate3d 窗口化渲染，DOM 始终只保留可视行与缓冲；级别过滤、防抖搜索、行号跳转、行详情面板与 ResizeObserver 自适应。',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['virtual-list', 'performance', 'windowing', 'scroll', 'filter', 'logs', 'resize-observer']
    }
  ];

  // State
  let currentLang = getInitialLanguage();
  let currentMode = 'gallery'; // 'gallery' | 'studio'
  let currentCase = cases[0];
  let galleryFilter = 'all';
  let gallerySearchQuery = '';
  let studioCategory = 'all';
  let studioSearchQuery = '';
  let activeCodeTab = 'index.html';
  let activeViewport = 'desktop';
  const fileCache = {};

  // DOM Elements
  const modeGalleryBtn = document.getElementById('modeGalleryBtn');
  const modeStudioBtn = document.getElementById('modeStudioBtn');
  const brandHomeBtn = document.getElementById('brandHomeBtn');
  const galleryView = document.getElementById('galleryView');
  const studioView = document.getElementById('studioView');
  const langDropdownWrapper = document.getElementById('langDropdownWrapper');
  const langDropdownTrigger = document.getElementById('langDropdownTrigger');
  const langCurrentLabel = document.getElementById('langCurrentLabel');
  const langDropdownMenu = document.getElementById('langDropdownMenu');

  // Gallery Elements
  const galleryLayout = document.querySelector('.gallery-layout');
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryFilterPills = document.querySelectorAll('#galleryFilterPills .cat-pill');
  const gallerySearchInput = document.getElementById('gallerySearchInput');
  const badgeCountAll = document.getElementById('badgeCountAll');
  const badgeCountEffects = document.getElementById('badgeCountEffects');
  const badgeCountComponents = document.getElementById('badgeCountComponents');
  const badgeCountPages = document.getElementById('badgeCountPages');
  const statCountCasesNum = document.getElementById('statCountCasesNum');
  const footerCaseCountPill = document.getElementById('footerCaseCountPill');
  const footerSearchTrigger = document.getElementById('footerSearchTrigger');
  const footerGuideTrigger = document.getElementById('footerGuideTrigger');
  const footerStudioTrigger = document.getElementById('footerStudioTrigger');
  const footerFilterLinks = document.querySelectorAll('.footer-filter-link');

  // Studio Elements
  const studioSidebar = document.getElementById('studioSidebar');
  const studioSearchInput = document.getElementById('studioSearchInput');
  const studioCategoryTabs = document.querySelectorAll('#studioCategoryTabs .sidebar-tab-btn');
  const studioCasesList = document.getElementById('studioCasesList');
  const studioCaseCounter = document.getElementById('studioCaseCounter');
  const stageActiveTitle = document.getElementById('stageActiveTitle');
  const stageActivePath = document.getElementById('stageActivePath');
  const copyStagePathBtn = document.getElementById('copyStagePathBtn');
  const stageBreadcrumb = document.getElementById('stageBreadcrumb');
  const stageFrameWrapper = document.getElementById('stageFrameWrapper');
  const stageCanvasArea = document.getElementById('stageCanvasArea');
  const stageReloadBtn = document.getElementById('stageReloadBtn');
  const vpBtns = document.querySelectorAll('.stage-vp-group .vp-icon-btn');

  // Header and Drawer Elements
  const openExternalBtn = document.getElementById('openExternalBtn');
  const toggleCodeBtn = document.getElementById('toggleCodeBtn');
  const downloadCurrentCaseBtn = document.getElementById('downloadCurrentCaseBtn');
  const codeDrawer = document.getElementById('codeDrawer');
  const drawerFileTabs = document.getElementById('drawerFileTabs');
  const codeViewerBlock = document.getElementById('codeViewerBlock');
  const copyCodeDrawerBtn = document.getElementById('copyCodeDrawerBtn');
  const downloadDrawerCaseBtn = document.getElementById('downloadDrawerCaseBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  // Command Palette
  const openPaletteBtn = document.getElementById('openPaletteBtn');
  const paletteBackdrop = document.getElementById('paletteBackdrop');
  const paletteSearchInput = document.getElementById('paletteSearchInput');
  const paletteResultsList = document.getElementById('paletteResultsList');

  // Guide Modal
  const openGuideBtn = document.getElementById('openGuideBtn');
  const guideBackdrop = document.getElementById('guideBackdrop');
  const closeGuideBtn = document.getElementById('closeGuideBtn');

  // Toast
  const appToast = document.getElementById('appToast');
  const toastMessage = document.getElementById('toastMessage');

  function showToast(msg) {
    if (toastMessage) toastMessage.textContent = msg;
    if (appToast) {
      appToast.classList.add('show');
      setTimeout(() => {
        appToast.classList.remove('show');
      }, 2400);
    }
  }

  function updateCategoryBadges() {
    const totalCount = cases.length;
    const effectsCount = cases.filter(c => c.category === 'effects').length;
    const componentsCount = cases.filter(c => c.category === 'components').length;
    const pagesCount = cases.filter(c => c.category === 'pages').length;

    const bAll = document.getElementById('badgeCountAll');
    const bEff = document.getElementById('badgeCountEffects');
    const bComp = document.getElementById('badgeCountComponents');
    const bPages = document.getElementById('badgeCountPages');

    if (bAll) bAll.textContent = totalCount;
    if (bEff) bEff.textContent = effectsCount;
    if (bComp) bComp.textContent = componentsCount;
    if (bPages) bPages.textContent = pagesCount;
  }

  // Multi-Language Application for Shell Layer
  function applyLanguage(lang) {
    if (!lang) return;
    currentLang = lang;
    setStoredLanguage(lang);

    // Update label in dropdown trigger
    if (langCurrentLabel) {
      if (lang === 'zh-CN') langCurrentLabel.textContent = '中文';
      else langCurrentLabel.textContent = 'English';
    }

    // Update active state in dropdown options
    if (langDropdownMenu) {
      const options = langDropdownMenu.querySelectorAll('.lang-option-item');
      options.forEach((opt) => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
      });
    }

    // Translate DOM text content via data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const text = t(key, currentLang);
      if (text) {
        el.textContent = text;
      }
    });

    // Translate DOM title attributes via data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      const title = t(key, currentLang);
      if (title) {
        el.setAttribute('title', title);
      }
    });

    // Translate input placeholders via data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const placeholder = t(key, currentLang);
      if (placeholder) {
        el.setAttribute('placeholder', placeholder);
      }
    });

    // Update dynamic stats
    if (statCountCasesNum) statCountCasesNum.textContent = cases.length;
    if (footerCaseCountPill) footerCaseCountPill.textContent = `${cases.length} ${t('footerTotalCases', currentLang)}`;
    updateCategoryBadges();

    // Refresh dynamic views
    if (currentMode === 'gallery') {
      renderGallery();
    } else {
      renderStudioSidebar();
      updateBreadcrumb(currentCase);
    }

    if (paletteBackdrop && paletteBackdrop.classList.contains('open')) {
      renderPaletteResults(paletteSearchInput ? paletteSearchInput.value : '');
    }
  }

  function updateBreadcrumb(c) {
    if (!stageBreadcrumb || !c) return;
    const typeSpan = stageBreadcrumb.querySelector('.stage-breadcrumb-type');
    if (typeSpan) {
      typeSpan.className = `stage-breadcrumb-type ${c.type}`;
      typeSpan.textContent = c.type === 'effect'
        ? t('breadcrumbEffect', currentLang)
        : (c.type === 'page' ? t('breadcrumbPage', currentLang) : t('breadcrumbComponent', currentLang));
    }
  }

  // Generate & Download ZIP bundle for any case
  async function downloadCaseZip(caseObj) {
    if (!caseObj) return;
    showToast(`${t('toastPackaging', currentLang)} ${caseObj.title}...`);
    try {
      const zip = new JSZip();
      
      const fetchPromises = caseObj.files.map(async (fileName) => {
        const filePath = `/${caseObj.path}${fileName}`;
        const content = await loadFileContent(filePath);
        zip.file(fileName, content);
      });

      await Promise.all(fetchPromises);
      const blob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${caseObj.id}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
      showToast(`${t('toastDownloaded', currentLang)} ${caseObj.id}.zip`);
    } catch (err) {
      console.error('Download error:', err);
      showToast(`${t('toastDownloadFailed', currentLang)}: ${err.message}`);
    }
  }

  // Safely reload or replace iframe to ensure clean teardown of previous execution context & audio
  function mountStudioIframe(url) {
    if (!stageFrameWrapper) return;
    const oldIframe = document.getElementById('studioMainIframe');
    if (oldIframe) {
      oldIframe.src = 'about:blank';
      oldIframe.remove();
    }
    const newIframe = document.createElement('iframe');
    newIframe.id = 'studioMainIframe';
    newIframe.title = 'Studio Preview';
    newIframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
    newIframe.src = url;
    stageFrameWrapper.appendChild(newIframe);
  }

  function unmountStudioIframe() {
    const iframe = document.getElementById('studioMainIframe');
    if (iframe) {
      iframe.src = 'about:blank';
    }
  }

  // ----- Hash Router -----
  // Routes: #/gallery | #/studio/<case-id>
  function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const segments = raw.split('/').filter(Boolean);
    const mode = segments[0] === 'studio' ? 'studio' : 'gallery';
    const caseId = mode === 'studio' ? segments[1] : null;
    return { mode, caseId };
  }

  function navigate(mode, caseId) {
    const target = mode === 'studio'
      ? `#/studio/${caseId || currentCase.id}`
      : '#/gallery';
    if (window.location.hash === target) {
      applyRoute();
    } else {
      window.location.hash = target;
    }
  }

  function applyRoute() {
    const route = parseHash();

    if (route.mode === 'studio' && route.caseId) {
      document.body.classList.add('mode-studio');
      const target = cases.find(c => c.id === route.caseId);
      if (!target) {
        window.history.replaceState(null, '', `#/studio/${currentCase.id}`);
        applyRoute();
        return;
      }
      const enteringStudio = currentMode !== 'studio';
      if (enteringStudio) {
        currentMode = 'studio';
        galleryView.classList.remove('active-view');
        studioView.classList.add('active-view');
        modeGalleryBtn.classList.remove('active');
        modeStudioBtn.classList.add('active');
      }
      // Always (re)mount when entering studio from gallery (iframe was blanked), or when the case changes
      if (enteringStudio || currentCase.id !== target.id) {
        loadStudioCase(target);
      }
    } else {
      document.body.classList.remove('mode-studio');
      if (window.location.hash !== '#/gallery') {
        window.history.replaceState(null, '', '#/gallery');
      }
      if (currentMode !== 'gallery') {
        currentMode = 'gallery';
        document.title = 'UI Playground';
        galleryView.classList.add('active-view');
        studioView.classList.remove('active-view');
        modeGalleryBtn.classList.add('active');
        modeStudioBtn.classList.remove('active');
        unmountStudioIframe(); // stop active studio execution when back in gallery
        renderGallery();
        if (galleryView) {
          galleryView.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    }
  }

  // Switch View Mode (kept as a thin wrapper over the router)
  function setViewMode(mode) {
    navigate(mode);
  }

  // Render Gallery Grid
  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const effectsCount = cases.filter(c => c.category === 'effects').length;
    const componentsCount = cases.filter(c => c.category === 'components').length;
    const pagesCount = cases.filter(c => c.category === 'pages').length;
    if (badgeCountAll) badgeCountAll.textContent = cases.length;
    if (badgeCountEffects) badgeCountEffects.textContent = effectsCount;
    if (badgeCountComponents) badgeCountComponents.textContent = componentsCount;
    if (badgeCountPages) badgeCountPages.textContent = pagesCount;

    const filtered = cases.filter((c) => {
      const matchCat = (galleryFilter === 'all' || c.category === galleryFilter);
      const q = gallerySearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.path.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      galleryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--text-tertiary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">${t('noCasesFoundTitle', currentLang)}</div>
          <div style="font-size: 0.85rem;">${t('noCasesFoundHint', currentLang)}</div>
        </div>
      `;
      return;
    }

    filtered.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'showcase-card';
      const typeLabel = c.type === 'effect'
        ? t('breadcrumbEffect', currentLang)
        : (c.type === 'page' ? t('breadcrumbPage', currentLang) : t('breadcrumbComponent', currentLang));

      card.innerHTML = `
        <div class="card-top-row">
          <div class="card-heading-box">
            <div class="card-title">${c.title}</div>
          </div>
          <span class="card-type-chip ${c.type}">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: currentColor;"></span>
            ${typeLabel}
          </span>
        </div>

        <p class="card-description">${c.description}</p>

        <div class="card-tags">
          ${c.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}
        </div>

        <div class="card-bottom-bar">
          <div class="card-quick-actions">
            <button class="btn-card-icon" data-action="code" title="${t('cardCodeTitle', currentLang)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </button>
            <button class="btn-card-icon" data-action="download" title="${t('cardDownloadTitle', currentLang)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <a class="btn-card-icon" href="${c.url}" target="_blank" rel="noopener noreferrer" title="${t('cardOpenTabTitle', currentLang)}" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <button class="btn-card-launch" data-action="launch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>${t('cardRun', currentLang)}</span>
            </button>
          </div>
        </div>
      `;

      // Clicking anywhere on card opens in studio
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="code"]')) {
          e.stopPropagation();
          currentCase = c;
          openCodeDrawer();
          return;
        }
        if (e.target.closest('[data-action="download"]')) {
          e.stopPropagation();
          downloadCaseZip(c);
          return;
        }
        if (e.target.closest('a')) {
          return;
        }
        currentCase = c;
        setViewMode('studio');
      });

      galleryGrid.appendChild(card);
    });
  }

  // Render Studio Sidebar
  function renderStudioSidebar() {
    if (!studioCasesList) return;
    studioCasesList.innerHTML = '';

    const filtered = cases.filter((c) => {
      const matchCat = (studioCategory === 'all' || c.category === studioCategory);
      const q = studioSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    if (studioCaseCounter) {
      const counterOf = t('studioCounterOf', currentLang);
      const counterCases = t('studioCounterCases', currentLang);
      studioCaseCounter.textContent = `${filtered.length} ${counterOf} ${cases.length} ${counterCases}`;
    }

    if (filtered.length === 0) {
      studioCasesList.innerHTML = `
        <div style="padding: 2rem 0.5rem; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
          ${t('studioNoMatches', currentLang)}
        </div>
      `;
      return;
    }

    filtered.forEach((c) => {
      const item = document.createElement('div');
      item.className = `sidebar-case-item ${c.id === currentCase.id ? 'active' : ''}`;
      const badgeText = c.type === 'effect' ? 'FX' : (c.type === 'page' ? 'PAGE' : 'UI');
      item.innerHTML = `
        <div class="case-item-left">
          <span class="case-item-title">${c.title}</span>
        </div>
        <span class="case-item-badge ${c.type}">${badgeText}</span>
      `;
      item.addEventListener('click', () => {
        navigate('studio', c.id);
      });
      studioCasesList.appendChild(item);
    });
  }

  // Load a case into the Studio Stage with clean teardown
  function loadStudioCase(c) {
    currentCase = c;
    document.title = `${c.title} · UI Playground`;
    if (stageActiveTitle) stageActiveTitle.textContent = c.title;
    if (stageActivePath) stageActivePath.textContent = `/${c.path}`;
    if (openExternalBtn) openExternalBtn.href = c.url;

    updateBreadcrumb(c);

    // Remount iframe to cleanly flush out previous instance & audio
    mountStudioIframe(c.url);

    renderStudioSidebar();

    if (codeDrawer.classList.contains('open')) {
      loadCodeInspector();
    }
  }

  // Code Inspector & Highlighting
  async function loadFileContent(filePath) {
    if (fileCache[filePath]) return fileCache[filePath];

    const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const stripped = normalized.replace(/^\//, '');

    // 1. Exact match in bundled rawSources
    if (typeof rawSources !== 'undefined' && rawSources) {
      if (rawSources[normalized]) {
        fileCache[filePath] = rawSources[normalized];
        return fileCache[filePath];
      }
      if (rawSources[stripped]) {
        fileCache[filePath] = rawSources[stripped];
        return fileCache[filePath];
      }
      for (const k in rawSources) {
        if (k === normalized || k === stripped || k.endsWith(normalized) || k.endsWith(stripped)) {
          fileCache[filePath] = rawSources[k];
          return fileCache[filePath];
        }
      }
    }

    // 2. Fallback fetch
    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let text = await res.text();
      // If dev server returned wrapped CSS or JS module code instead of raw CSS
      if (filePath.endsWith('.css') && text.includes('const __vite__css =')) {
        const match = text.match(/const __vite__css = "([\s\S]*?)";?\s*__vite__updateStyle/);
        if (match && match[1]) {
          try {
            text = JSON.parse(`"${match[1]}"`);
          } catch (e) {
            // fallback
          }
        }
      }
      fileCache[filePath] = text;
      return text;
    } catch (e) {
      return `/* ${t('couldNotLoadFile', currentLang)}: ${filePath} */`;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightSyntax(code, fileName) {
    let escaped = escapeHtml(code);

    if (fileName.endsWith('.html')) {
      escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>');
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9\-]+)/g, '<span class="token-tag">$1</span>');
      escaped = escaped.replace(/(\s+[a-zA-Z0-9\-:]+)(=)/g, '<span class="token-attr">$1</span>$2');
      escaped = escaped.replace(/(&quot;[^&]*&quot;)/g, '<span class="token-string">$1</span>');
    } else if (fileName.endsWith('.css')) {
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
      escaped = escaped.replace(/([a-zA-Z0-9\-]+)(:)/g, '<span class="token-property">$1</span>$2');
      escaped = escaped.replace(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))/g, '<span class="token-number">$1</span>');
    } else if (fileName.endsWith('.js')) {
      escaped = escaped.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
      escaped = escaped.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|class|new|async|await|this)\b/g, '<span class="token-keyword">$1</span>');
      escaped = escaped.replace(/(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g, '<span class="token-string">$1</span>');
      escaped = escaped.replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="token-function">$1</span>');
      escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token-number">$1</span>');
    }

    return escaped;
  }

  async function loadCodeInspector() {
    if (!drawerFileTabs || !codeViewerBlock) return;
    drawerFileTabs.innerHTML = '';

    if (!currentCase.files.includes(activeCodeTab)) {
      activeCodeTab = currentCase.files[0];
    }

    currentCase.files.forEach((file) => {
      const tab = document.createElement('button');
      tab.className = `file-tab-item ${file === activeCodeTab ? 'active' : ''}`;
      tab.innerHTML = `
        <span style="opacity: 0.6;">📄</span>
        <span>${file}</span>
      `;
      tab.addEventListener('click', () => {
        activeCodeTab = file;
        loadCodeInspector();
      });
      drawerFileTabs.appendChild(tab);
    });

    const filePath = `/${currentCase.path}${activeCodeTab}`;
    codeViewerBlock.innerHTML = `<span style="color: var(--text-tertiary);">${t('loadingSource', currentLang)}</span>`;
    const rawContent = await loadFileContent(filePath);
    codeViewerBlock.innerHTML = highlightSyntax(rawContent, activeCodeTab);
  }

  function openCodeDrawer() {
    codeDrawer.classList.add('open');
    toggleCodeBtn.classList.add('active');
    loadCodeInspector();
  }

  function closeCodeDrawer() {
    codeDrawer.classList.remove('open');
    toggleCodeBtn.classList.remove('active');
  }

  // Command Palette
  function openPalette() {
    paletteBackdrop.classList.add('open');
    paletteSearchInput.value = '';
    renderPaletteResults('');
    setTimeout(() => paletteSearchInput.focus(), 50);
  }

  function closePalette() {
    paletteBackdrop.classList.remove('open');
  }

  function renderPaletteResults(query) {
    if (!paletteResultsList) return;
    paletteResultsList.innerHTML = '';
    const q = query.toLowerCase().trim();

    const filtered = cases.filter(c =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );

    const showGithubAction = !q || ['git', 'github', 'repo', '开源', 'source', 'code'].some(k => k.includes(q) || q.includes(k));

    if (filtered.length === 0 && !showGithubAction) {
      paletteResultsList.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-tertiary); font-size: 0.85rem;">
          ${t('paletteEmpty', currentLang)}
        </div>
      `;
      return;
    }

    filtered.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = `palette-item ${idx === 0 && !showGithubAction ? 'selected' : ''}`;
      const badgeText = c.type === 'effect' ? 'FX' : (c.type === 'page' ? 'PAGE' : 'UI');
      item.innerHTML = `
        <div class="palette-item-left">
          <span class="case-item-badge ${c.type}">${badgeText}</span>
          <div>
            <div class="palette-item-title">${c.title}</div>
            <div class="palette-item-desc">${c.description}</div>
          </div>
        </div>
        <kbd class="kbd-shortcut">/${c.path}</kbd>
      `;
      item.addEventListener('click', () => {
        currentCase = c;
        setViewMode('studio');
        closePalette();
      });
      paletteResultsList.appendChild(item);
    });

    if (showGithubAction) {
      const ghItem = document.createElement('a');
      ghItem.href = 'https://github.com';
      ghItem.target = '_blank';
      ghItem.rel = 'noopener noreferrer';
      ghItem.className = 'palette-item';
      ghItem.style.textDecoration = 'none';
      ghItem.innerHTML = `
        <div class="palette-item-left">
          <span class="case-item-badge" style="background: rgba(255,255,255,0.1); color: var(--text-pure);">GIT</span>
          <div>
            <div class="palette-item-title" style="display: flex; align-items: center; gap: 0.4rem;">
              <span>GitHub</span>
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px; opacity: 0.8;">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <div class="palette-item-desc">${t('footerActionGithub', currentLang)}</div>
          </div>
        </div>
        <kbd class="kbd-shortcut">↵ 访问</kbd>
      `;
      ghItem.addEventListener('click', () => {
        closePalette();
      });
      paletteResultsList.appendChild(ghItem);
    }
  }

  // Language Switcher Dropdown Events
  function closeLangDropdown() {
    if (langDropdownWrapper) {
      langDropdownWrapper.classList.remove('open');
      if (langDropdownTrigger) langDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  if (langDropdownTrigger && langDropdownWrapper) {
    langDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langDropdownWrapper.classList.toggle('open');
      langDropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    if (langDropdownMenu) {
      langDropdownMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.lang-option-item');
        if (option && option.dataset.lang) {
          applyLanguage(option.dataset.lang);
          closeLangDropdown();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!langDropdownWrapper.contains(e.target)) {
        closeLangDropdown();
      }
    });
  }

  // Stage Breadcrumb Path Copy Button
  if (copyStagePathBtn) {
    copyStagePathBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fullPath = `/${currentCase.path}`;
      navigator.clipboard.writeText(fullPath).then(() => {
        showToast(t('toastCopiedPath', currentLang));
      }).catch(() => {
        showToast(t('toastCopiedPath', currentLang));
      });
    });
  }

  // Event Listeners Setup
  modeGalleryBtn.addEventListener('click', () => setViewMode('gallery'));
  modeStudioBtn.addEventListener('click', () => setViewMode('studio'));
  brandHomeBtn.addEventListener('click', () => setViewMode('gallery'));

  // Gallery Filters
  galleryFilterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      galleryFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      galleryFilter = pill.dataset.filter;
      renderGallery();
    });
  });

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', (e) => {
      gallerySearchQuery = e.target.value;
      renderGallery();
    });
  }

  // Studio Sidebar Controls
  if (studioSearchInput) {
    studioSearchInput.addEventListener('input', (e) => {
      studioSearchQuery = e.target.value;
      renderStudioSidebar();
    });
  }

  studioCategoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      studioCategoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      studioCategory = tab.dataset.cat;
      renderStudioSidebar();
    });
  });

  // Stage Toolbar Controls
  vpBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      vpBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeViewport = btn.dataset.viewport;
      stageFrameWrapper.className = `stage-frame-wrapper viewport-${activeViewport}`;
    });
  });

  if (stageReloadBtn) {
    stageReloadBtn.addEventListener('click', () => {
      mountStudioIframe(currentCase.url);
      showToast(t('toastReloaded', currentLang));
    });
  }

  // Code Drawer Controls
  if (toggleCodeBtn) {
    toggleCodeBtn.addEventListener('click', () => {
      if (codeDrawer.classList.contains('open')) {
        closeCodeDrawer();
      } else {
        openCodeDrawer();
      }
    });
  }

  if (downloadCurrentCaseBtn) {
    downloadCurrentCaseBtn.addEventListener('click', () => {
      downloadCaseZip(currentCase);
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeCodeDrawer);
  }

  if (copyCodeDrawerBtn) {
    copyCodeDrawerBtn.addEventListener('click', async () => {
      const filePath = `/${currentCase.path}${activeCodeTab}`;
      const raw = await loadFileContent(filePath);
      navigator.clipboard.writeText(raw).then(() => {
        showToast(t('toastCopied', currentLang));
      }).catch(() => {
        showToast(t('toastCopied', currentLang));
      });
    });
  }

  if (downloadDrawerCaseBtn) {
    downloadDrawerCaseBtn.addEventListener('click', () => {
      downloadCaseZip(currentCase);
    });
  }

  // Footer Navigation & Actions
  if (footerSearchTrigger) {
    footerSearchTrigger.addEventListener('click', openPalette);
  }
  if (footerGuideTrigger) {
    footerGuideTrigger.addEventListener('click', () => {
      guideBackdrop.classList.add('open');
    });
  }
  if (footerStudioTrigger) {
    footerStudioTrigger.addEventListener('click', () => {
      setViewMode('studio');
    });
  }
  footerFilterLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = link.dataset.filter;
      if (filter) {
        galleryFilterPills.forEach(p => {
          p.classList.toggle('active', p.dataset.filter === filter);
        });
        galleryFilter = filter;
        renderGallery();
        if (galleryView) {
          galleryView.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  });

  // Palette Controls
  openPaletteBtn.addEventListener('click', openPalette);
  paletteBackdrop.addEventListener('click', (e) => {
    if (e.target === paletteBackdrop) closePalette();
  });
  paletteSearchInput.addEventListener('input', (e) => {
    renderPaletteResults(e.target.value);
  });

  // Guide Modal Controls
  openGuideBtn.addEventListener('click', () => {
    guideBackdrop.classList.add('open');
  });
  closeGuideBtn.addEventListener('click', () => {
    guideBackdrop.classList.remove('open');
  });
  guideBackdrop.addEventListener('click', (e) => {
    if (e.target === guideBackdrop) guideBackdrop.classList.remove('open');
  });

  // Keyboard Shortcuts (Cmd+K / Ctrl+K / Esc)
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (paletteBackdrop.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === 'Escape') {
      closeLangDropdown();
      if (paletteBackdrop.classList.contains('open')) closePalette();
      if (guideBackdrop.classList.contains('open')) guideBackdrop.classList.remove('open');
      if (codeDrawer.classList.contains('open')) closeCodeDrawer();
    }
  });

  // Initialize: render the default gallery content first, then restore route from hash
  applyLanguage(currentLang);
  renderGallery();

  if (!window.location.hash) {
    window.location.hash = '#/gallery';
  }
  window.addEventListener('hashchange', applyRoute);
  applyRoute();
})();


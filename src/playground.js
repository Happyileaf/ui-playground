import JSZip from 'jszip';
import { getInitialLanguage, setStoredLanguage, t, SUPPORTED_LANGS } from './i18n.js';

// Load raw source files directly via Vite glob to avoid dev server HMR CSS wrapping
const rawSources = import.meta.glob(['/effects/**/*', '/components/**/*'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// UI Playground - Interactive Core
(function () {
  // Master Case Catalog
  const cases = [
    {
      id: 'fireworks',
      title: 'Canvas Fireworks',
      type: 'effect',
      category: 'effects',
      path: 'effects/fireworks/',
      url: '/effects/fireworks/index.html',
      description: 'Physics-based multi-particle fireworks with trail gravity, randomized color sparks, and Web Audio sound bursts.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'particles', 'physics', 'web-audio']
    },
    {
      id: 'magnetic-button',
      title: 'Magnetic Button',
      type: 'effect',
      category: 'effects',
      path: 'effects/magnetic-button/',
      url: '/effects/magnetic-button/index.html',
      description: 'Elastic magnetic pointer pull with radial spotlight tracking and spring relaxation (Single-file demo).',
      files: ['index.html'],
      tags: ['pointer-events', 'spring-physics', 'single-file']
    },
    {
      id: 'particle-text',
      title: 'Particle Text',
      type: 'effect',
      category: 'effects',
      path: 'effects/particle-text/',
      url: '/effects/particle-text/index.html',
      description: 'Interactive rasterized canvas typography with particle scatter explosion and elastic spring recovery.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['canvas', 'typography', 'raster-analysis', 'spring']
    },
    {
      id: 'liquid-button',
      title: 'SVG Liquid Button',
      type: 'effect',
      category: 'effects',
      path: 'effects/liquid-button/',
      url: '/effects/liquid-button/index.html',
      description: 'Organic fluid gooey physics created with native SVG feGaussianBlur and feColorMatrix matrix filters.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['svg-filters', 'gooey', 'liquid-motion']
    },
    {
      id: 'cursor-follow',
      title: 'Fluid Cursor Trail',
      type: 'effect',
      category: 'effects',
      path: 'effects/cursor-follow/',
      url: '/effects/cursor-follow/index.html',
      description: 'Multi-layer lerp physics cursor with velocity deformation, trailing dots, and magnetic element hover.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['lerp-physics', 'pointer', 'velocity', 'cursor']
    },
    {
      id: 'button',
      title: 'Modern UI Buttons',
      type: 'component',
      category: 'components',
      path: 'components/button/',
      url: '/components/button/index.html',
      description: 'Collection of native button styles: ripple wave, conic shimmer border, cyber neon, and glassmorphism.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['button-system', 'ripple', 'conic-shimmer', 'glass']
    },
    {
      id: 'card',
      title: '3D Perspective Card',
      type: 'component',
      category: 'components',
      path: 'components/card/',
      url: '/components/card/index.html',
      description: 'Interactive 3D perspective tilt card with holographic glare reflection and parallax depth layer translation.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['3d-transform', 'parallax-tilt', 'holographic-glare']
    },
    {
      id: 'modal',
      title: 'Native Modal Dialog',
      type: 'component',
      category: 'components',
      path: 'components/modal/',
      url: '/components/modal/index.html',
      description: 'Accessible <dialog> modal with backdrop blur, keyboard Escape handling, and smooth spring entry transitions.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['html5-dialog', 'accessible', 'backdrop-filter']
    },
    {
      id: 'tooltip',
      title: 'Smart Tooltip',
      type: 'component',
      category: 'components',
      path: 'components/tooltip/',
      url: '/components/tooltip/index.html',
      description: 'Smart collision-detecting tooltip that auto-adjusts viewport boundaries with bounce animations.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['collision-detection', 'smart-positioning', 'micro-ui']
    },
    {
      id: 'navigation',
      title: 'Sliding Pill Navbar',
      type: 'component',
      category: 'components',
      path: 'components/navigation/',
      url: '/components/navigation/index.html',
      description: 'Floating navigation bar with dynamic elastic sliding pill indicator that resizes to the active tab.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['navigation', 'sliding-pill', 'elastic-indicator']
    },
    {
      id: 'piano-keyboard',
      title: 'Interactive Piano Keyboard',
      type: 'effect',
      category: 'effects',
      path: 'effects/piano-keyboard/',
      url: '/effects/piano-keyboard/index.html',
      description: 'Polyphonic interactive piano keyboard with pure Web Audio API sine wave synthesis, supports mouse and touch interactions.',
      files: ['index.html', 'style.css', 'script.js'],
      tags: ['web-audio', 'synthesizer', 'interactive', 'polyphonic']
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

  // Multi-Language Application for Shell Layer
  function applyLanguage(lang) {
    if (!lang) return;
    currentLang = lang;
    setStoredLanguage(lang);

    // Update label in dropdown trigger
    if (langCurrentLabel) {
      if (lang === 'zh-CN') langCurrentLabel.textContent = '中文';
      else if (lang === 'de-DE') langCurrentLabel.textContent = 'Deutsch';
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
      typeSpan.textContent = c.type === 'effect' ? t('breadcrumbEffect', currentLang) : t('breadcrumbComponent', currentLang);
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

  // Switch View Mode
  function setViewMode(mode) {
    currentMode = mode;
    if (mode === 'gallery') {
      galleryView.classList.add('active-view');
      studioView.classList.remove('active-view');
      modeGalleryBtn.classList.add('active');
      modeStudioBtn.classList.remove('active');
      unmountStudioIframe(); // stop active studio execution when back in gallery
      renderGallery();
    } else {
      galleryView.classList.remove('active-view');
      studioView.classList.add('active-view');
      modeGalleryBtn.classList.remove('active');
      modeStudioBtn.classList.add('active');
      renderStudioSidebar();
      loadStudioCase(currentCase);
    }
  }

  // Render Gallery Grid
  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const effectsCount = cases.filter(c => c.category === 'effects').length;
    const componentsCount = cases.filter(c => c.category === 'components').length;
    if (badgeCountAll) badgeCountAll.textContent = cases.length;
    if (badgeCountEffects) badgeCountEffects.textContent = effectsCount;
    if (badgeCountComponents) badgeCountComponents.textContent = componentsCount;

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
      const typeLabel = c.type === 'effect' ? t('breadcrumbEffect', currentLang) : t('breadcrumbComponent', currentLang);

      card.innerHTML = `
        <div class="card-top-row">
          <div class="card-heading-box">
            <div class="card-title">${c.title}</div>
            <div class="card-path-sub">/${c.path}</div>
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
      item.innerHTML = `
        <div class="case-item-left">
          <span class="case-item-title">${c.title}</span>
        </div>
        <span class="case-item-badge ${c.type}">${c.type === 'effect' ? 'FX' : 'UI'}</span>
      `;
      item.addEventListener('click', () => {
        loadStudioCase(c);
      });
      studioCasesList.appendChild(item);
    });
  }

  // Load a case into the Studio Stage with clean teardown
  function loadStudioCase(c) {
    currentCase = c;
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
      item.innerHTML = `
        <div class="palette-item-left">
          <span class="case-item-badge ${c.type}">${c.type === 'effect' ? 'FX' : 'UI'}</span>
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
        if (galleryLayout) {
          galleryLayout.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Initialize
  applyLanguage(currentLang);
  setViewMode('gallery');
})();


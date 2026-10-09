(() => {
  const list = document.getElementById('articleList');
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');

  const ICON_CHEVRON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;

  const ARTICLES = [
    {
      tag: '设计手记',
      minutes: 6,
      title: '为什么你的折叠面板总让人觉得「卡」',
      paragraphs: [
        '高度动画是组件库里最容易被低估的细节。直接给 height 赋值会触发每帧重排，内容稍长就会掉帧；而从 0 跳到 auto 又无法被浏览器插值，于是只能生硬闪现。',
        '更稳妥的做法是利用 grid-template-rows 从 0fr 过渡到 1fr：浏览器只需要追踪网格轨道的高度，内部内容自然参与排版，既不用手动测量 scrollHeight，也能在窗口尺寸变化时保持正确。',
        '折叠时还有一个容易忽略的点——焦点与滚动位置。用户读完收起卡片后，如果页面位置不动，后续内容会突然跳走；适当把卡片顶回视口附近，阅读节奏会顺畅很多。',
        '最后，折叠态的视觉提示要克制：底部渐变遮罩、一枚明确的展开按钮、一个会旋转的箭头，三件套足够。过多的呼吸与闪烁只会制造廉价感。'
      ]
    },
    {
      tag: '前端性能',
      minutes: 4,
      title: '骨架屏的正确打开方式',
      paragraphs: [
        '骨架屏不是 Loading 的替代品，而是内容形状的「预排版」。当占位块的尺寸、间距与真实内容高度一致时，数据返回的那一刻几乎不会发生布局跳动。',
        '闪烁动画建议保持在 1.2 到 1.6 秒一次的慢速扫光，并且只在确实需要等待时出现。超过两秒还没结果，就应该给出明确的错误态和重试入口，而不是让用户一直盯着灰色块。',
        '骨架屏也不应该覆盖整站导航。让用户在等待期间仍可浏览、返回，比把所有交互都锁住要友好得多。'
      ]
    },
    {
      tag: '交互模式',
      minutes: 3,
      title: '渐进式披露：少即是多的工程实践',
      paragraphs: [
        '把所有信息一次性摊开，看似坦诚，实则让用户在首屏就陷入决策疲劳。渐进式披露主张先给摘要与核心操作，把细节藏在下一层，让用户按自己的节奏深入。',
        '这一原则在长文、表单与设置页尤其有效：表单可以分步、设置可以分组、长文可以折叠，关键是让「下一步」始终可见且可逆。',
        '可逆，是很多实现会漏掉的一环。用户展开后要能轻松收起，进入深层后要能原路返回，这种安全感本身就是体验的一部分。'
      ]
    },
    {
      tag: '短讯',
      minutes: 1,
      title: '一条不需要折叠的提示',
      paragraphs: [
        '当内容本身很短、首屏就能完整呈现时，就不应该再出现展开按钮。组件需要在渲染时判断真实高度：没有被截断，就不制造多余的交互。克制，是成熟组件的标志。'
      ]
    }
  ];

  const cards = [];

  function buildCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';

    const top = document.createElement('div');
    top.className = 'article-top';

    const tag = document.createElement('span');
    tag.className = 'article-tag';
    tag.textContent = article.tag;

    const readTime = document.createElement('span');
    readTime.className = 'read-time';
    readTime.textContent = `约 ${article.minutes} 分钟阅读`;

    top.append(tag, readTime);

    const title = document.createElement('h2');
    title.className = 'article-title';
    title.textContent = article.title;

    const preview = document.createElement('div');
    preview.className = 'text-preview';
    preview.textContent = article.paragraphs.join(' ');

    const shell = document.createElement('div');
    shell.className = 'text-shell';

    const inner = document.createElement('div');
    inner.className = 'text-inner';

    const body = document.createElement('div');
    body.className = 'article-body';
    article.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.append(p);
    });

    inner.append(body);
    shell.append(inner);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'expand-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<span class="toggle-label">展开阅读全文</span>${ICON_CHEVRON}`;

    card.append(top, title, preview, shell, toggle);

    const record = { card, shell, toggle, preview, expanded: false };

    toggle.addEventListener('click', () => setExpanded(record, !record.expanded));

    cards.push(record);
    return { card, record, preview };
  }

  function setExpanded(record, expanded) {
    const { card, shell, toggle, preview } = record;
    record.expanded = expanded;

    card.classList.toggle('expanded', expanded);
    shell.classList.toggle('expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('.toggle-label').textContent = expanded
      ? '收起全文'
      : '展开阅读全文';

    if (!expanded && !isInViewport(card)) {
      requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  ARTICLES.forEach((article) => {
    const { card, preview } = buildCard(article);
    list.append(card);

    requestAnimationFrame(() => {
      const isClamped = preview.scrollHeight - preview.clientHeight > 4;
      preview.classList.toggle('clamped', isClamped);

      if (!isClamped) {
        const record = cards[cards.length - 1];
        record.card.classList.add('short');
      }
    });
  });

  expandAllBtn.addEventListener('click', () => {
    cards.forEach((record) => {
      if (!record.card.classList.contains('short')) {
        setExpanded(record, true);
      }
    });
  });

  collapseAllBtn.addEventListener('click', () => {
    cards.forEach((record) => setExpanded(record, false));
  });
})();

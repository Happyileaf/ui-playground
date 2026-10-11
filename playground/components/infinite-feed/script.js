(() => {
  const feed = document.getElementById('feed');
  const statusBox = document.getElementById('feedStatus');
  const sentinelLoader = document.getElementById('sentinelLoader');

  const PAGE_SIZE = 3;
  const TOTAL_PAGES = 5;
  const MAX_FAIL_RATE = 0;

  const GRADIENTS = [
    ['#38bdf8', '#6366f1'],
    ['#fb7185', '#a855f7'],
    ['#34d399', '#0ea5e9'],
    ['#fbbf24', '#fb7185'],
    ['#22d3ee', '#818cf8'],
    ['#f472b6', '#facc15'],
    ['#4ade80', '#22d3ee']
  ];

  const AVATAR_TINTS = [
    '#38bdf8', '#fb7185', '#34d399', '#fbbf24',
    '#a78bfa', '#22d3ee', '#f472b6', '#4ade80'
  ];

  const AUTHORS = [
    '林小满', 'Aiden Chen', '苏打味的风', 'Momo Studio', '北岸有光',
    'Iris.W', '像素搬运工', '七月与设计', 'Nova Labs', '一只早睡的猫'
  ];

  const CONTENTS = [
    '把最近重构的导航交互整理成了笔记，动效细节和阈值都在评论区，欢迎拍砖',
    '周末用纯 CSS 画了一组渐变封面，没有任何图片资源，缩放依然锐利',
    '关于骨架屏的三点心得：形状要贴近真实布局、闪烁要克制、首屏别超过一秒',
    '无限滚动记得给用户一个明确的「到底了」终态，否则会一直期待下一页',
    '用 IntersectionObserver 替换 scroll 监听后，主线程明显安静了许多',
    '暗色模式不是简单反色，对比度与品牌色都要重新校准一遍',
    '指针事件统一了鼠标和触屏，手势逻辑终于不用写两套了',
    '把按钮的反馈延迟压到 100ms 以内，点击的「跟手」感受完全不同',
    '今天把一个 400KB 的图标库换成了内联 SVG，首屏体积直接瘦下来',
    '喜欢弹性曲线多一点点的留白，动画收尾时会显得更高级'
  ];

  const TAGS = ['#交互设计', '#前端性能', '#CSS', '#动效', '#设计系统', '#用户体验'];

  let currentPage = 0;
  let loading = false;
  let finished = false;
  let cursor = 0;

  const ICON_HEART = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
    </svg>`;

  const ICON_COMMENT = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"></path>
    </svg>`;

  const ICON_SHARE = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>`;

  function makePost(index) {
    const author = AUTHORS[index % AUTHORS.length];
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const tint = AVATAR_TINTS[index % AVATAR_TINTS.length];
    const tag = TAGS[index % TAGS.length];
    const content = CONTENTS[index % CONTENTS.length];
    const likes = 20 + ((index * 37) % 480);
    const comments = 3 + ((index * 13) % 60);
    const minutesAgo = (index * 47 + 6) % 360;

    return {
      author,
      tint,
      gradient,
      tag,
      content,
      likes,
      comments,
      liked: false,
      following: false,
      time: minutesAgo < 60
        ? `${minutesAgo} 分钟前`
        : `${Math.floor(minutesAgo / 60)} 小时前`
    };
  }

  function fetchPage(page) {
    return new Promise((resolve, reject) => {
      const delay = 700 + Math.random() * 700;

      setTimeout(() => {
        if (Math.random() < MAX_FAIL_RATE) {
          reject(new Error('network'));
          return;
        }

        const posts = [];
        for (let i = 0; i < PAGE_SIZE; i += 1) {
          posts.push(makePost(cursor));
          cursor += 1;
        }
        resolve({ page, posts });
      }, delay);
    });
  }

  function showSkeletons(count) {
    for (let i = 0; i < count; i += 1) {
      const card = document.createElement('div');
      card.className = 'skeleton-card skeleton-slot';

      card.innerHTML = `
        <div class="sk-row">
          <span class="sk sk-avatar"></span>
          <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
            <span class="sk sk-line w-60"></span>
            <span class="sk sk-line w-40"></span>
          </div>
        </div>
        <span class="sk sk-cover"></span>
        <span class="sk sk-line" style="width:90%;"></span>
        <span class="sk sk-line" style="width:70%;"></span>
      `;

      feed.append(card);
    }
  }

  function clearSkeletons() {
    feed.querySelectorAll('.skeleton-slot').forEach((el) => el.remove());
  }

  function createCard(post) {
    const card = document.createElement('article');
    card.className = 'feed-card';

    const head = document.createElement('div');
    head.className = 'card-head';

    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.style.background = post.tint;
    avatar.textContent = post.author.slice(0, 1);

    const meta = document.createElement('div');
    meta.className = 'card-meta';

    const name = document.createElement('span');
    name.className = 'author-name';
    name.textContent = post.author;

    const time = document.createElement('span');
    time.className = 'post-time';
    time.textContent = post.time;

    meta.append(name, time);

    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'follow-btn';
    followBtn.textContent = '关注';
    followBtn.addEventListener('click', () => {
      post.following = !post.following;
      followBtn.classList.toggle('following', post.following);
      followBtn.textContent = post.following ? '已关注' : '关注';
    });

    head.append(avatar, meta, followBtn);

    const cover = document.createElement('div');
    cover.className = 'card-cover';
    cover.style.background = `
      radial-gradient(120% 140% at 12% 8%, ${post.gradient[0]}, transparent 55%),
      radial-gradient(120% 140% at 88% 92%, ${post.gradient[1]}, transparent 55%),
      #0e131b`;

    const body = document.createElement('div');
    body.className = 'card-body';

    const text = document.createElement('p');
    text.className = 'post-text';
    text.textContent = `${post.content} `;
    const tagSpan = document.createElement('span');
    tagSpan.className = 'post-tag';
    tagSpan.textContent = post.tag;
    text.append(tagSpan);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'action-btn like-btn';
    likeBtn.setAttribute('aria-pressed', 'false');
    likeBtn.innerHTML = `${ICON_HEART}<span class="like-count">${post.likes}</span>`;
    likeBtn.addEventListener('click', () => {
      post.liked = !post.liked;
      likeBtn.classList.toggle('liked', post.liked);
      likeBtn.setAttribute('aria-pressed', String(post.liked));
      likeBtn.querySelector('.like-count').textContent =
        post.likes + (post.liked ? 1 : 0);
    });

    const commentBtn = document.createElement('button');
    commentBtn.type = 'button';
    commentBtn.className = 'action-btn';
    commentBtn.innerHTML = `${ICON_COMMENT}<span>${post.comments}</span>`;

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'action-btn';
    shareBtn.innerHTML = `${ICON_SHARE}<span>分享</span>`;

    actions.append(likeBtn, commentBtn, shareBtn);
    body.append(text, actions);

    card.append(head, cover, body);
    return card;
  }

  function renderError() {
    clearStatusError();
    sentinelLoader.classList.add('hidden');

    const wrap = document.createElement('div');
    wrap.className = 'sentinel-loader error-row';

    const text = document.createElement('span');
    text.className = 'loader-text';
    text.textContent = '加载失败，请重试';
    text.style.color = 'var(--like)';

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'follow-btn';
    retry.textContent = '重新加载';
    retry.addEventListener('click', () => {
      clearStatusError();
      sentinelLoader.classList.remove('hidden');
      loadMore();
    });

    wrap.append(text, retry);
    statusBox.append(wrap);
  }

  function clearStatusError() {
    statusBox.querySelectorAll('.error-row').forEach((el) => el.remove());
  }

  function showEnd() {
    clearStatusError();
    sentinelLoader.classList.add('hidden');

    const end = document.createElement('div');
    end.className = 'end-mark';
    end.innerHTML = `
      <span class="end-line"></span>
      <span>已经到底啦，共 ${cursor} 条动态</span>
    `;
    statusBox.append(end);
  }

  async function loadMore() {
    if (loading || finished) return;

    loading = true;
    sentinelLoader.classList.remove('hidden');
    showSkeletons(PAGE_SIZE);

    try {
      const { posts } = await fetchPage(currentPage);
      clearSkeletons();

      posts.forEach((post) => feed.append(createCard(post)));

      currentPage += 1;

      if (currentPage >= TOTAL_PAGES) {
        finished = true;
        showEnd();
      }
    } catch (_) {
      clearSkeletons();
      renderError();
    } finally {
      loading = false;
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !loading && !finished) {
        loadMore();
      }
    });
  }, {
    root: null,
    rootMargin: '240px 0px',
    threshold: 0
  });

  observer.observe(sentinelLoader);

  loadMore();
})();

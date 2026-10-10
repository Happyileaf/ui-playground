(function () {
  const CATEGORIES = [
    { id: 'smile', icon: '😀', label: '表情' },
    { id: 'gesture', icon: '👋', label: '手势' },
    { id: 'animal', icon: '🐻', label: '动物' },
    { id: 'food', icon: '🍕', label: '食物' },
    { id: 'activity', icon: '⚽', label: '运动' },
    { id: 'travel', icon: '🚀', label: '旅行' },
    { id: 'object', icon: '💡', label: '物品' },
    { id: 'symbol', icon: '❤️', label: '符号' }
  ];

  const EMOJIS = [
    { c: '😀', n: '微笑', k: 'smile happy grin face 笑 开心' },
    { c: '😄', n: '大笑', k: 'laugh happy joy 大笑' },
    { c: '😁', n: '露齿笑', k: 'grin beam teeth 开心' },
    { c: '😊', n: '害羞微笑', k: 'blush smile happy 微笑' },
    { c: '😍', n: '花痴', k: 'love heart eyes like 爱' },
    { c: '😘', n: '飞吻', k: 'kiss love 吻' },
    { c: '😎', n: '酷', k: 'cool sunglasses 酷' },
    { c: '🤔', n: '思考', k: 'think wondering 想' },
    { c: '🙂', n: '微微一笑', k: 'slight smile 微笑' },
    { c: '😉', n: '眨眼', k: 'wink 眨眼' },
    { c: '😴', n: '睡着了', k: 'sleep tired sleepy 睡' },
    { c: '😭', n: '大哭', k: 'cry sad tears 哭' },
    { c: '😮', n: '惊讶', k: 'wow surprised 惊讶' },
    { c: '😱', n: '吓到', k: 'scream fear 害怕' },
    { c: '😅', n: '尴尬笑', k: 'sweat nervous 汗' },
    { c: '🥳', n: '庆祝', k: 'party celebrate 庆祝' },
    { c: '🤩', n: '星星眼', k: 'star eyes excited 激动' },
    { c: '😇', n: '天使', k: 'angel innocent 天使' },
    { c: '🥰', n: '幸福', k: 'love hearts 幸福' },
    { c: '😋', n: '好吃', k: 'yum tongue tasty 馋' },
    { c: '🤗', n: '拥抱', k: 'hug 拥抱' },
    { c: '🙄', n: '翻白眼', k: 'eyeroll 白眼' },
    { c: '😪', n: '犯困', k: 'sleep tired 困' },
    { c: '🤯', n: '震惊', k: 'mind blown 震惊' },
    { c: '👋', n: '挥手', k: 'wave hello hi 你好' },
    { c: '👍', n: '赞', k: 'thumbs up good like 赞 好' },
    { c: '👎', n: '踩', k: 'thumbs down bad 差' },
    { c: '👏', n: '鼓掌', k: 'clap applause 鼓掌' },
    { c: '🙏', n: '拜托', k: 'pray thanks please 拜托 谢谢' },
    { c: '💪', n: '加油', k: 'strong muscle power 加油' },
    { c: '✌️', n: '胜利', k: 'peace victory 胜利' },
    { c: '🤞', n: '祝好运', k: 'fingers crossed luck 好运' },
    { c: '👌', n: 'OK', k: 'ok perfect 好' },
    { c: '🫶', n: '比心', k: 'love heart hands 爱' },
    { c: '🙌', n: '欢呼', k: 'celebrate hands 欢呼' },
    { c: '👐', n: '张开双手', k: 'open hands 张开' },
    { c: '🐶', n: '狗', k: 'dog puppy 狗' },
    { c: '🐱', n: '猫', k: 'cat kitten 猫' },
    { c: '🐻', n: '熊', k: 'bear 熊' },
    { c: '🐼', n: '熊猫', k: 'panda 熊猫' },
    { c: '🦁', n: '狮子', k: 'lion 狮子' },
    { c: '🐯', n: '老虎', k: 'tiger 老虎' },
    { c: '🐸', n: '青蛙', k: 'frog 青蛙' },
    { c: '🐵', n: '猴子', k: 'monkey 猴子' },
    { c: '🦊', n: '狐狸', k: 'fox 狐狸' },
    { c: '🐰', n: '兔子', k: 'rabbit bunny 兔子' },
    { c: '🐦', n: '鸟', k: 'bird 鸟' },
    { c: '🦄', n: '独角兽', k: 'unicorn 独角兽' },
    { c: '🍕', n: '披萨', k: 'pizza 披萨' },
    { c: '🍔', n: '汉堡', k: 'burger 汉堡' },
    { c: '🍟', n: '薯条', k: 'fries 薯条' },
    { c: '🌮', n: '塔可', k: 'taco 塔可' },
    { c: '🍣', n: '寿司', k: 'sushi 寿司' },
    { c: '🍜', n: '拉面', k: 'noodles ramen 面' },
    { c: '🍰', n: '蛋糕', k: 'cake 蛋糕' },
    { c: '🍦', n: '冰淇淋', k: 'ice cream 冰淇淋' },
    { c: '☕', n: '咖啡', k: 'coffee 咖啡' },
    { c: '🍺', n: '啤酒', k: 'beer 啤酒' },
    { c: '🍷', n: '红酒', k: 'wine 红酒' },
    { c: '🍎', n: '苹果', k: 'apple 苹果' },
    { c: '🍓', n: '草莓', k: 'strawberry 草莓' },
    { c: '🍉', n: '西瓜', k: 'watermelon 西瓜' },
    { c: '⚽', n: '足球', k: 'soccer football 足球' },
    { c: '🏀', n: '篮球', k: 'basketball 篮球' },
    { c: '🎾', n: '网球', k: 'tennis 网球' },
    { c: '⚾', n: '棒球', k: 'baseball 棒球' },
    { c: '🎮', n: '游戏', k: 'game controller 游戏' },
    { c: '🎯', n: '飞镖', k: 'target bullseye 目标' },
    { c: '🎲', n: '骰子', k: 'dice 骰子' },
    { c: '🎤', n: '唱歌', k: 'microphone sing 唱' },
    { c: '🎨', n: '艺术', k: 'art palette paint 艺术' },
    { c: '🎸', n: '吉他', k: 'guitar music 吉他' },
    { c: '🚀', n: '火箭', k: 'rocket launch 火箭' },
    { c: '✈️', n: '飞机', k: 'plane airplane 飞机' },
    { c: '🚗', n: '汽车', k: 'car 汽车' },
    { c: '🚲', n: '自行车', k: 'bike bicycle 自行车' },
    { c: '⛵', n: '帆船', k: 'boat sail 帆船' },
    { c: '🏠', n: '房子', k: 'house home 家' },
    { c: '🌍', n: '地球', k: 'earth world globe 地球' },
    { c: '🌈', n: '彩虹', k: 'rainbow 彩虹' },
    { c: '⭐', n: '星星', k: 'star 星星' },
    { c: '☀️', n: '太阳', k: 'sun sunny 太阳' },
    { c: '🌙', n: '月亮', k: 'moon night 月亮' },
    { c: '💡', n: '灯泡', k: 'bulb idea light 想法' },
    { c: '📱', n: '手机', k: 'phone mobile 手机' },
    { c: '💻', n: '电脑', k: 'computer laptop 电脑' },
    { c: '📚', n: '书', k: 'book books 书' },
    { c: '🎁', n: '礼物', k: 'gift present 礼物' },
    { c: '🔔', n: '铃铛', k: 'bell notification 提醒' },
    { c: '🔥', n: '火', k: 'fire hot lit 火 热' },
    { c: '✨', n: '闪亮', k: 'sparkles shine 闪' },
    { c: '💯', n: '满分', k: 'hundred perfect 满分' },
    { c: '✅', n: '对勾', k: 'check done yes 完成' },
    { c: '❌', n: '叉', k: 'cross no 错' },
    { c: '❤️', n: '红心', k: 'heart love 爱 心' },
    { c: '🧡', n: '橙心', k: 'heart orange 心' },
    { c: '💛', n: '黄心', k: 'heart yellow 心' },
    { c: '💚', n: '绿心', k: 'heart green 心' },
    { c: '💙', n: '蓝心', k: 'heart blue 心' },
    { c: '💜', n: '紫心', k: 'heart purple 心' },
    { c: '🖤', n: '黑心', k: 'heart black 心' },
    { c: '💔', n: '心碎', k: 'broken heart 心碎' },
    { c: '☮️', n: '和平', k: 'peace 和平' },
    { c: '♻️', n: '回收', k: 'recycle 回收' },
    { c: '⚠️', n: '警告', k: 'warning 警告' },
    { c: '🎵', n: '音符', k: 'music note 音乐' }
  ];

  const emojiByCat = {};
  let cursor = 0;
  CATEGORIES.forEach((cat, idx) => {
    const size = idx === CATEGORIES.length - 1
      ? EMOJIS.length - cursor
      : Math.round(EMOJIS.length / CATEGORIES.length);
    emojiByCat[cat.id] = EMOJIS.slice(cursor, cursor + size);
    cursor += size;
  });

  const trigger = document.getElementById('emojiTrigger');
  const popover = document.getElementById('emojiPopover');
  const searchInput = document.getElementById('emojiSearch');
  const catsBar = document.getElementById('popoverCats');
  const grid = document.getElementById('popoverGrid');
  const composerInput = document.getElementById('composerInput');
  const charCount = document.getElementById('charCount');
  const sendBtn = document.getElementById('sendBtn');
  const thread = document.getElementById('thread');
  const previewEmoji = document.getElementById('previewEmoji');
  const previewName = document.getElementById('previewName');

  let activeCat = CATEGORIES[0].id;
  let isSearching = false;
  let currentList = [];
  let focusedIndex = 0;
  let savedRange = null;

  function buildCats() {
    catsBar.innerHTML = '';
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-btn' + (cat.id === activeCat ? ' active' : '');
      btn.textContent = cat.icon;
      btn.title = cat.label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', cat.label);
      btn.addEventListener('click', () => {
        activeCat = cat.id;
        isSearching = false;
        searchInput.value = '';
        buildCats();
        renderGrid();
        searchInput.focus();
      });
      catsBar.appendChild(btn);
    });
  }

  function renderGrid() {
    grid.innerHTML = '';
    if (isSearching) {
      const q = searchInput.value.trim().toLowerCase();
      currentList = q
        ? EMOJIS.filter(e => e.n.toLowerCase().includes(q) || e.k.toLowerCase().includes(q))
        : [];
      grid.classList.add('searching');
    } else {
      currentList = emojiByCat[activeCat] || [];
      grid.classList.remove('searching');
    }

    if (currentList.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'grid-empty';
      empty.textContent = isSearching ? '没有找到相关表情' : '该分类暂无表情';
      grid.appendChild(empty);
      focusedIndex = -1;
      return;
    }

    currentList.forEach((e, i) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'emoji-cell';
      cell.setAttribute('role', 'option');
      cell.setAttribute('aria-label', e.n);
      cell.textContent = e.c;
      cell.addEventListener('click', () => {
        focusedIndex = i;
        insertEmoji(e);
      });
      cell.addEventListener('mouseenter', () => {
        focusedIndex = i;
        updateFocus();
      });
      grid.appendChild(cell);
    });

    focusedIndex = Math.min(Math.max(focusedIndex, 0), currentList.length - 1);
    updateFocus();
  }

  function updateFocus() {
    const cells = grid.querySelectorAll('.emoji-cell');
    cells.forEach((c, i) => c.classList.toggle('focused', i === focusedIndex));
    if (focusedIndex >= 0 && currentList[focusedIndex]) {
      const e = currentList[focusedIndex];
      previewEmoji.textContent = e.c;
      previewName.textContent = e.n;
      const target = cells[focusedIndex];
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function saveCaret() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && composerInput.contains(sel.anchorNode)) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  function insertEmoji(e) {
    composerInput.focus();
    if (savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
    const node = document.createTextNode(e.c);
    const sel = window.getSelection();
    if (!sel.rangeCount || !composerInput.contains(sel.anchorNode)) {
      composerInput.appendChild(node);
      const range = document.createRange();
      range.selectNodeContents(composerInput);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    savedRange = sel.getRangeAt(0).cloneRange();
    updateCharCount();
  }

  function updateCharCount() {
    const len = composerInput.textContent.length;
    charCount.textContent = `${len} 字`;
  }

  function openPopover() {
    saveCaret();
    popover.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    isSearching = false;
    searchInput.value = '';
    activeCat = CATEGORIES[0].id;
    buildCats();
    renderGrid();
    positionPopover();
    setTimeout(() => searchInput.focus(), 10);
  }

  function closePopover() {
    popover.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    saveCaret();
  }

  function positionPopover() {
    const rect = trigger.getBoundingClientRect();
    const width = popover.offsetWidth || 340;
    let left = rect.right - width;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > 300) {
      popover.style.top = `${rect.bottom + 8 + window.scrollY}px`;
    } else {
      popover.style.top = `${rect.top - popover.offsetHeight - 8 + window.scrollY}px`;
    }
    popover.style.left = `${left + window.scrollX}px`;
  }

  function moveFocus(dRow, dCol) {
    if (focusedIndex < 0) {
      focusedIndex = 0;
      updateFocus();
      return;
    }
    const cols = isSearching ? 7 : 8;
    let next;
    if (dRow !== 0) {
      next = focusedIndex + dRow * cols;
    } else {
      next = focusedIndex + dCol;
    }
    if (next < 0 || next >= currentList.length) return;
    focusedIndex = next;
    updateFocus();
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popover.classList.contains('hidden')) {
      openPopover();
    } else {
      closePopover();
    }
  });

  searchInput.addEventListener('input', () => {
    isSearching = true;
    focusedIndex = 0;
    renderGrid();
  });

  searchInput.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(1, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(-1, 0);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus(0, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveFocus(0, 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && currentList[focusedIndex]) {
          insertEmoji(currentList[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closePopover();
        composerInput.focus();
        break;
      default:
        break;
    }
  });

  composerInput.addEventListener('keyup', saveCaret);
  composerInput.addEventListener('mouseup', saveCaret);
  composerInput.addEventListener('input', updateCharCount);
  composerInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '.' || e.key === 'Period')) {
      e.preventDefault();
      openPopover();
    }
  });

  popover.addEventListener('pointerdown', (e) => e.stopPropagation());

  document.addEventListener('pointerdown', (e) => {
    if (!popover.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
      closePopover();
    }
  });

  window.addEventListener('resize', () => {
    if (!popover.classList.contains('hidden')) positionPopover();
  });

  sendBtn.addEventListener('click', () => {
    const text = composerInput.textContent.trim();
    if (!text) {
      composerInput.focus();
      return;
    }
    const empty = thread.querySelector('.thread-empty');
    if (empty) empty.remove();
    const bubble = document.createElement('div');
    bubble.className = 'thread-bubble';
    bubble.textContent = text;
    thread.appendChild(bubble);
    composerInput.textContent = '';
    savedRange = null;
    updateCharCount();
    composerInput.focus();
  });

  buildCats();
  updateCharCount();
})();

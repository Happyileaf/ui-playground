(function () {
  "use strict";

  const feed = document.getElementById("feed");
  const reloadBtn = document.getElementById("reloadBtn");
  const waveToggle = document.getElementById("waveToggle");

  const DATA = [
    {
      kind: "avatar",
      initial: "林",
      avatarBg: "linear-gradient(135deg, #38bdf8, #6366f1)",
      title: "林深时见鹿",
      text: "刚完成了今日的设计走查，组件库的加载态统一使用这套骨架结构，过渡更自然。",
      meta: "12 分钟前 · 设计更新",
    },
    {
      kind: "cover",
      coverBg: "linear-gradient(120deg, #0ea5e9 0%, #8b5cf6 55%, #ec4899 100%)",
      coverTitle: "山海之间 · 摄影合集",
      title: "本周精选内容已上线",
      text: "二十张来自山野与海岸线的照片，记录光线最温柔的几个瞬间。下滑开始浏览完整合集。",
      meta: "专题 · 20 张照片",
    },
    {
      kind: "avatar",
      initial: "周",
      avatarBg: "linear-gradient(135deg, #fbbf24, #f97316)",
      title: "周末观察员",
      text: "骨架占位块的尺寸与真实内容保持一致，加载完成后页面几乎不会发生跳动。",
      meta: "1 小时前 · 评论",
    },
  ];

  const SKELETON_MARKUP = [
    '<div class="skeleton sk-avatar"></div>' +
      '<div class="card-main">' +
      '<div class="skeleton sk-line w-60"></div>' +
      '<div class="skeleton sk-line w-90"></div>' +
      '<div class="skeleton sk-line w-40"></div>' +
      "</div>",
    '<div class="skeleton sk-cover"></div>' +
      '<div class="card-body">' +
      '<div class="skeleton sk-line w-70"></div>' +
      '<div class="skeleton sk-line w-100"></div>' +
      '<div class="skeleton sk-line w-100"></div>' +
      '<div class="skeleton sk-line w-30"></div>' +
      "</div>",
    '<div class="skeleton sk-avatar"></div>' +
      '<div class="card-main">' +
      '<div class="skeleton sk-line w-50"></div>' +
      '<div class="skeleton sk-line w-80"></div>' +
      '<div class="skeleton sk-line w-60"></div>' +
      "</div>",
  ];

  let loadTimer = null;

  function renderSkeletons() {
    const cards = feed.querySelectorAll(".feed-card");
    cards.forEach(function (card, index) {
      card.classList.remove("is-cover");
      card.innerHTML = SKELETON_MARKUP[index] || "";
    });
  }

  function renderRealContent() {
    const cards = feed.querySelectorAll(".feed-card");
    cards.forEach(function (card, index) {
      const item = DATA[index];
      if (!item) return;
      card.classList.toggle("is-cover", item.kind === "cover");
      if (item.kind === "cover") {
        card.innerHTML =
          '<div class="real-content">' +
          '<div class="real-cover" style="background:' + item.coverBg + '">' + item.coverTitle + "</div>" +
          '<div class="card-body">' +
          '<div class="real-title">' + item.title + "</div>" +
          '<div class="real-text">' + item.text + "</div>" +
          '<span class="real-meta">' + item.meta + "</span>" +
          "</div></div>";
      } else {
        card.innerHTML =
          '<div class="real-content">' +
          '<div class="real-avatar" style="background:' + item.avatarBg + '">' + item.initial + "</div>" +
          '<div class="card-main">' +
          '<div class="real-title">' + item.title + "</div>" +
          '<div class="real-text">' + item.text + "</div>" +
          '<span class="real-meta">' + item.meta + "</span>" +
          "</div></div>";
      }
    });
  }

  function simulateLoading() {
    if (loadTimer) {
      clearTimeout(loadTimer);
    }
    reloadBtn.disabled = true;
    reloadBtn.classList.add("spinning");
    renderSkeletons();

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 900
      : 1800 + Math.random() * 800;

    loadTimer = setTimeout(function () {
      renderRealContent();
      reloadBtn.disabled = false;
      reloadBtn.classList.remove("spinning");
      loadTimer = null;
    }, delay);
  }

  reloadBtn.addEventListener("click", simulateLoading);

  waveToggle.addEventListener("change", function () {
    document.body.classList.toggle("shimmer-off", !waveToggle.checked);
  });

  simulateLoading();
})();

(function () {
  const TYPE_META = {
    like: {
      icon: "❤️",
      bg: "rgba(251, 113, 133, 0.14)",
      ring: "rgba(251, 113, 133, 0.28)"
    },
    comment: {
      icon: "💬",
      bg: "rgba(56, 189, 248, 0.12)",
      ring: "rgba(56, 189, 248, 0.26)"
    },
    mention: {
      icon: "📣",
      bg: "rgba(245, 158, 11, 0.14)",
      ring: "rgba(245, 158, 11, 0.3)"
    },
    follow: {
      icon: "👥",
      bg: "rgba(52, 211, 153, 0.12)",
      ring: "rgba(52, 211, 153, 0.26)"
    },
    system: {
      icon: "⚙️",
      bg: "rgba(154, 163, 184, 0.12)",
      ring: "rgba(154, 163, 184, 0.26)"
    }
  };

  const notifications = [
    {
      id: 1,
      type: "like",
      title: "林晚舟 赞了你的作品",
      text: "「雾港夜行」摄影集获得了一个新的赞",
      time: "5 分钟前",
      read: false
    },
    {
      id: 2,
      type: "comment",
      title: "沈一川 评论了你",
      text: "第二张的光影处理太绝了，能分享一下后期参数吗？",
      time: "22 分钟前",
      read: false
    },
    {
      id: 3,
      type: "mention",
      title: "苏黎 在动态中提到了你",
      text: "@你 周末的城市漫步摄影局还差一位，要来吗？",
      time: "1 小时前",
      read: false
    },
    {
      id: 4,
      type: "system",
      title: "账户安全提醒",
      text: "你的账户于新设备登录，如非本人操作请及时修改密码",
      time: "2 小时前",
      read: false
    },
    {
      id: 5,
      type: "follow",
      title: "顾青禾 关注了你",
      text: "这位创作者也关注了你，去打个招呼吧",
      time: "今天 09:12",
      read: true
    },
    {
      id: 6,
      type: "like",
      title: "江予安 赞了你的评论",
      text: "你的评论「克制是最高级的表达」获得了 12 个赞",
      time: "昨天 20:41",
      read: true
    },
    {
      id: 7,
      type: "comment",
      title: "陆时鸣 回复了你",
      text: "已经把源文件发到你邮箱了，注意查收",
      time: "2 天前",
      read: true
    },
    {
      id: 8,
      type: "follow",
      title: "欢迎加入 Nimbus",
      text: "完善个人资料，让更多同好发现你的作品",
      time: "上周",
      read: true
    }
  ];

  const bellBtn = document.getElementById("bellBtn");
  const unreadBadge = document.getElementById("unreadBadge");
  const notifPanel = document.getElementById("notifPanel");
  const markAllBtn = document.getElementById("markAllBtn");
  const notifList = document.getElementById("notifList");
  const emptyState = document.getElementById("emptyState");
  const pills = Array.from(document.querySelectorAll(".pill"));

  let currentFilter = "all";
  let isOpen = false;

  function createNode(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function getVisibleNotifications() {
    if (currentFilter === "unread") {
      return notifications.filter(function (item) {
        return !item.read;
      });
    }
    return notifications;
  }

  function renderItem(item) {
    const meta = TYPE_META[item.type] || TYPE_META.system;
    const listItem = createNode("li");
    const button = createNode("button", "notif-item" + (item.read ? "" : " is-unread"));
    button.type = "button";
    button.dataset.id = String(item.id);
    button.setAttribute(
      "aria-label",
      item.title + "。" + item.text + "。" + item.time + (item.read ? "，已读" : "，未读")
    );

    const icon = createNode("span", "notif-icon", meta.icon);
    icon.style.setProperty("--bg", meta.bg);
    icon.style.setProperty("--ring", meta.ring);

    const body = createNode("span", "notif-body");
    body.appendChild(createNode("span", "notif-title", item.title));
    body.appendChild(createNode("span", "notif-text", item.text));
    body.appendChild(createNode("span", "notif-time", item.time));

    button.appendChild(icon);
    button.appendChild(body);

    if (!item.read) {
      button.appendChild(createNode("span", "unread-dot"));
    }

    listItem.appendChild(button);
    return listItem;
  }

  function updateBadge() {
    const count = notifications.filter(function (item) {
      return !item.read;
    }).length;

    if (count === 0) {
      unreadBadge.hidden = true;
      unreadBadge.textContent = "0";
    } else {
      unreadBadge.hidden = false;
      unreadBadge.textContent = count > 9 ? "9+" : String(count);
    }

    markAllBtn.disabled = count === 0;
  }

  function render() {
    const visible = getVisibleNotifications();
    notifList.innerHTML = "";

    if (visible.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent = currentFilter === "unread" ? "没有未读通知" : "暂无通知";
    } else {
      emptyState.hidden = true;
      visible.forEach(function (item) {
        notifList.appendChild(renderItem(item));
      });
    }

    updateBadge();
  }

  function focusItem(id) {
    let target = null;
    if (id !== undefined) {
      target = notifList.querySelector('.notif-item[data-id="' + id + '"]');
    }
    if (!target) {
      target = notifList.querySelector(".notif-item");
    }
    if (target) {
      target.focus();
    } else {
      markAllBtn.focus();
    }
  }

  function openPanel() {
    isOpen = true;
    notifPanel.classList.add("is-open");
    bellBtn.setAttribute("aria-expanded", "true");
    focusItem();
  }

  function closePanel(returnFocus) {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    notifPanel.classList.remove("is-open");
    bellBtn.setAttribute("aria-expanded", "false");
    if (returnFocus !== false) {
      bellBtn.focus();
    }
  }

  bellBtn.addEventListener("click", function () {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });

  markAllBtn.addEventListener("click", function () {
    notifications.forEach(function (item) {
      item.read = true;
    });
    render();
    markAllBtn.focus();
  });

  notifList.addEventListener("click", function (event) {
    const itemNode = event.target.closest(".notif-item");
    if (!itemNode) {
      return;
    }
    const id = Number(itemNode.dataset.id);
    const item = notifications.find(function (entry) {
      return entry.id === id;
    });
    if (item && !item.read) {
      item.read = true;
      render();
      focusItem(item.id);
    }
  });

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      currentFilter = pill.dataset.filter;
      pills.forEach(function (entry) {
        entry.classList.toggle("is-active", entry === pill);
      });
      render();
      pill.focus();
    });
  });

  document.addEventListener("pointerdown", function (event) {
    if (!isOpen) {
      return;
    }
    if (notifPanel.contains(event.target) || bellBtn.contains(event.target)) {
      return;
    }
    closePanel(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) {
      closePanel();
    }
  });

  render();
})();

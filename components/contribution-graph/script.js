(function () {
  var WEEKS = 53;
  var TOTAL_CELLS = WEEKS * 7;
  var MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  function dateSeed(date) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  }

  function pseudo(n) {
    var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function contributionAt(date) {
    var seed = dateSeed(date);
    if (pseudo(seed) < 0.55) {
      return 0;
    }
    return 1 + Math.floor(pseudo(seed + 1.618) * 30);
  }

  function levelOf(count) {
    if (count === 0) return 0;
    if (count <= 7) return 1;
    if (count <= 15) return 2;
    if (count <= 23) return 3;
    return 4;
  }

  function formatDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  var days = [];
  var total = 0;

  for (var i = 0; i < TOTAL_CELLS; i++) {
    var date = new Date(start);
    date.setDate(start.getDate() + i);
    var isFuture = date.getTime() > today.getTime();
    var count = isFuture ? 0 : contributionAt(date);
    var level = isFuture ? 0 : levelOf(count);
    if (!isFuture) {
      total += count;
    }
    days.push({ date: date, count: count, level: level, future: isFuture });
  }

  var gridEl = document.getElementById("grid");
  var buttons = [];
  var fragment = document.createDocumentFragment();

  days.forEach(function (day) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell l" + day.level + (day.future ? " blank" : "");
    var dateText = formatDate(day.date);
    var countText = day.count === 0 ? "无贡献" : day.count + " 次贡献";
    cell.setAttribute("aria-label", dateText + "，" + countText);
    cell.dataset.index = String(buttons.length);
    cell.dataset.count = String(day.count);
    cell.dataset.date = dateText;
    if (day.future) {
      cell.tabIndex = -1;
    } else {
      cell.tabIndex = buttons.length === 0 ? 0 : -1;
      buttons.push(cell);
    }
    fragment.appendChild(cell);
  });

  gridEl.appendChild(fragment);

  var monthsEl = document.getElementById("months");
  var monthFragment = document.createDocumentFragment();
  var lastLabel = null;

  for (var w = 0; w < WEEKS; w++) {
    var slot = document.createElement("span");
    slot.className = "month-slot";
    var labelText = "";
    for (var r = 0; r < 7; r++) {
      var dayInfo = days[w * 7 + r];
      if (!dayInfo.future && dayInfo.date.getDate() === 1) {
        labelText = MONTH_NAMES[dayInfo.date.getMonth()];
        break;
      }
    }
    if (labelText && labelText !== lastLabel) {
      var label = document.createElement("span");
      label.className = "month-label";
      label.textContent = labelText;
      slot.appendChild(label);
      lastLabel = labelText;
    }
    monthFragment.appendChild(slot);
  }

  monthsEl.appendChild(monthFragment);

  var totalEl = document.getElementById("totalCount");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  if (reducedMotion) {
    totalEl.textContent = String(total);
  } else {
    var duration = 900;
    var startTime = null;

    function animateCount(now) {
      if (startTime === null) {
        startTime = now;
      }
      var progress = Math.min((now - startTime) / duration, 1);
      var value = Math.round(total * easeOutCubic(progress));
      totalEl.textContent = String(value);
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    }

    requestAnimationFrame(animateCount);
  }

  var tooltipEl = document.getElementById("tooltip");
  var activeCell = null;

  function positionTooltip(cell) {
    var rect = cell.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top;
    var estimatedWidth = Math.max(tooltipEl.offsetWidth, 80);
    var halfWidth = estimatedWidth / 2;

    if (x < halfWidth + 8) {
      x = halfWidth + 8;
    }
    if (x > window.innerWidth - halfWidth - 8) {
      x = window.innerWidth - halfWidth - 8;
    }
    if (y < 46) {
      tooltipEl.style.transform = "translate(-50%, 12px)";
      tooltipEl.style.top = rect.bottom + "px";
    } else {
      tooltipEl.style.transform = "translate(-50%, calc(-100% - 10px))";
      tooltipEl.style.top = y + "px";
    }
    tooltipEl.style.left = x + "px";
  }

  function showTooltip(cell) {
    var count = Number(cell.dataset.count);
    var dateText = cell.dataset.date;
    var countHtml;
    if (count === 0) {
      countHtml = '<span class="tooltip-zero">无贡献</span>';
    } else {
      countHtml = '<span class="tooltip-count">' + count + ' 次贡献</span>';
    }
    tooltipEl.innerHTML = countHtml + '<span class="tooltip-date">' + dateText + "</span>";
    tooltipEl.classList.add("show");
    tooltipEl.setAttribute("aria-hidden", "false");
    activeCell = cell;
    positionTooltip(cell);
  }

  function hideTooltip() {
    tooltipEl.classList.remove("show");
    tooltipEl.setAttribute("aria-hidden", "true");
    activeCell = null;
  }

  gridEl.addEventListener("pointerover", function (event) {
    var cell = event.target.closest(".cell:not(.blank)");
    if (cell && cell !== activeCell) {
      showTooltip(cell);
    }
  });

  gridEl.addEventListener("pointerout", function (event) {
    if (!activeCell) {
      return;
    }
    var related = event.relatedTarget;
    if (!related || !gridEl.contains(related)) {
      hideTooltip();
    }
  });

  gridEl.addEventListener("focusin", function (event) {
    var cell = event.target.closest(".cell:not(.blank)");
    if (cell) {
      showTooltip(cell);
    }
  });

  gridEl.addEventListener("focusout", function (event) {
    if (!gridEl.contains(event.relatedTarget)) {
      hideTooltip();
    }
  });

  function moveFocus(cell, key) {
    var index = Number(cell.dataset.index);
    var next = index;
    switch (key) {
      case "ArrowRight":
        next = index + 7;
        break;
      case "ArrowLeft":
        next = index - 7;
        break;
      case "ArrowDown":
        next = index + 1;
        break;
      case "ArrowUp":
        next = index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = buttons.length - 1;
        break;
      default:
        return;
    }
    next = Math.max(0, Math.min(buttons.length - 1, next));
    if (next !== index) {
      cell.tabIndex = -1;
      buttons[next].tabIndex = 0;
      buttons[next].focus();
    }
  }

  gridEl.addEventListener("keydown", function (event) {
    var cell = event.target.closest(".cell:not(.blank)");
    if (!cell) {
      return;
    }
    var keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (keys.indexOf(event.key) !== -1) {
      event.preventDefault();
      moveFocus(cell, event.key);
    }
    if (event.key === "Escape") {
      hideTooltip();
    }
  });

  var scrollEl = document.querySelector(".chart-scroll");
  scrollEl.addEventListener("scroll", hideTooltip);
  window.addEventListener("resize", hideTooltip);
})();

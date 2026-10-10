(function () {
var HOTSPOTS = [
{
x: 50,
y: 51,
title: "落日",
description: "海平面上低垂的夕阳把天空染成橘粉渐变，金色反光顺着波纹向岸边铺开。"
},
{
x: 21,
y: 57,
title: "远方岛屿",
description: "海平线上一抹深色剪影，是距离海岸数公里的小岛，在暮色中若隐若现。"
},
{
x: 78,
y: 58,
title: "远航货轮",
description: "缓慢驶过的货轮留下淡淡的烟迹，为宁静的海面增添了一丝生活气息。"
},
{
x: 34,
y: 84,
title: "沙滩",
description: "被潮水反复打磨的细沙，靠近海水的区域颜色更深，泛着柔和的反光。"
},
{
x: 68,
y: 72,
title: "潮间浅滩",
description: "海浪退去后留下的镜面水洼，倒映着天空的色彩，是拾贝的好去处。"
}
];

var scene = document.getElementById("scene");
var nav = document.getElementById("hotspotNav");
var activeIndex = -1;
var popover = null;
var hotspotEls = [];
var navEls = [];

var clouds = [
{ cls: "cloud cloud-1" },
{ cls: "cloud cloud-2" }
];
clouds.forEach(function (c) {
var el = document.createElement("span");
el.className = c.cls;
scene.appendChild(el);
});

HOTSPOTS.forEach(function (item, i) {
var btn = document.createElement("button");
btn.type = "button";
btn.className = "hotspot";
btn.style.left = item.x + "%";
btn.style.top = item.y + "%";
btn.setAttribute("aria-label", "热点 " + (i + 1) + "：" + item.title);
btn.setAttribute("aria-expanded", "false");
btn.setAttribute("aria-haspopup", "dialog");

var dot = document.createElement("span");
dot.className = "dot";
btn.appendChild(dot);

btn.addEventListener("click", function (e) {
e.stopPropagation();
if (activeIndex === i) {
closePopover();
} else {
openPopover(i, true);
}
});

btn.addEventListener("keydown", function (e) {
if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
e.preventDefault();
if (activeIndex === i) {
closePopover();
} else {
openPopover(i, false);
}
}
});

scene.appendChild(btn);
hotspotEls.push(btn);
});

HOTSPOTS.forEach(function (item, i) {
var d = document.createElement("button");
d.type = "button";
d.className = "nav-dot";
d.setAttribute("aria-label", "跳转到热点：" + item.title);

d.addEventListener("click", function () {
openPopover(i, true);
});

d.addEventListener("focus", function () {
if (navFocusOpens) {
navFocusOpens = false;
openPopover(i, false);
}
});

d.addEventListener("keydown", function (e) {
if (e.key === "ArrowRight" || e.key === "ArrowDown") {
e.preventDefault();
navFocusOpens = true;
var next = (i + 1) % HOTSPOTS.length;
navEls[next].focus();
} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
e.preventDefault();
navFocusOpens = true;
var prev = (i - 1 + HOTSPOTS.length) % HOTSPOTS.length;
navEls[prev].focus();
} else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
e.preventDefault();
openPopover(i, true);
}
});

nav.appendChild(d);
navEls.push(d);
});

var navFocusOpens = false;
nav.addEventListener("mousedown", function () {
navFocusOpens = false;
});

function createPopover(item) {
var box = document.createElement("div");
box.className = "hotspot-popover";
box.setAttribute("role", "dialog");
box.setAttribute("aria-label", item.title + " 的标注详情");

var close = document.createElement("button");
close.type = "button";
close.className = "pop-close";
close.setAttribute("aria-label", "关闭标注");
close.textContent = "\u00d7";
close.addEventListener("click", function () {
var idx = activeIndex;
closePopover();
if (idx >= 0) {
hotspotEls[idx].focus();
}
});

var title = document.createElement("div");
title.className = "pop-title";
title.textContent = item.title;

var desc = document.createElement("p");
desc.className = "pop-desc";
desc.textContent = item.description;

box.appendChild(close);
box.appendChild(title);
box.appendChild(desc);
document.body.appendChild(box);
return box;
}

function positionPopover(index) {
var hs = hotspotEls[index];
var rect = hs.getBoundingClientRect();
var vw = window.innerWidth;
var vh = window.innerHeight;
var pw = popover.offsetWidth;
var ph = popover.offsetHeight;
var gap = 16;

var spaces = {
right: vw - (rect.right + gap),
left: rect.left - gap,
bottom: vh - (rect.bottom + gap),
top: rect.top - gap
};

var fits = [];
var order = ["right", "left", "bottom", "top"];
order.forEach(function (dir) {
if ((dir === "right" || dir === "left") ? spaces[dir] >= pw : spaces[dir] >= ph) {
fits.push(dir);
}
});

var dir;
if (fits.length) {
dir = fits.reduce(function (a, b) {
return spaces[a] >= spaces[b] ? a : b;
});
} else {
dir = order.reduce(function (a, b) {
return spaces[a] >= spaces[b] ? a : b;
});
}

var cx = rect.left + rect.width / 2;
var cy = rect.top + rect.height / 2;
var left;
var top;

if (dir === "right") {
left = rect.right + gap;
top = cy - ph / 2;
} else if (dir === "left") {
left = rect.left - gap - pw;
top = cy - ph / 2;
} else if (dir === "bottom") {
left = cx - pw / 2;
top = rect.bottom + gap;
} else {
left = cx - pw / 2;
top = rect.top - gap - ph;
}

left = Math.max(12, Math.min(left, vw - pw - 12));
top = Math.max(12, Math.min(top, vh - ph - 12));

popover.style.left = Math.round(left) + "px";
popover.style.top = Math.round(top) + "px";

popover.classList.remove("pop-right", "pop-left", "pop-bottom", "pop-top");
popover.classList.add("pop-" + dir);
}

function openPopover(index, focusHotspot) {
if (popover && activeIndex !== index) {
teardownPopover(false);
}

activeIndex = index;
var item = HOTSPOTS[index];

if (!popover) {
popover = createPopover(item);
} else {
popover.querySelector(".pop-title").textContent = item.title;
popover.querySelector(".pop-desc").textContent = item.description;
popover.setAttribute("aria-label", item.title + " 的标注详情");
}

hotspotEls.forEach(function (el, i) {
var on = i === index;
el.classList.toggle("is-active", on);
el.setAttribute("aria-expanded", on ? "true" : "false");
});

navEls.forEach(function (el, i) {
el.classList.toggle("is-active", i === index);
if (i === index) {
el.setAttribute("aria-current", "true");
} else {
el.removeAttribute("aria-current");
}
});

positionPopover(index);
requestAnimationFrame(function () {
popover.classList.add("is-open");
});

if (focusHotspot) {
hotspotEls[index].focus();
}
}

function teardownPopover(returnFocus) {
if (!popover) {
return;
}
var box = popover;
box.classList.remove("is-open");
setTimeout(function () {
if (box.parentNode) {
box.parentNode.removeChild(box);
}
}, 180);
popover = null;
}

function closePopover() {
var idx = activeIndex;
if (idx >= 0) {
hotspotEls[idx].classList.remove("is-active");
hotspotEls[idx].setAttribute("aria-expanded", "false");
navEls[idx].classList.remove("is-active");
navEls[idx].removeAttribute("aria-current");
}
activeIndex = -1;
teardownPopover(false);
}

document.addEventListener("click", function (e) {
if (!popover) {
return;
}
if (!popover.contains(e.target)) {
closePopover();
}
});

document.addEventListener("keydown", function (e) {
if (e.key === "Escape" && popover) {
var idx = activeIndex;
closePopover();
if (idx >= 0) {
hotspotEls[idx].focus();
}
}
});

var repositionTimer = null;
window.addEventListener("resize", function () {
if (popover && activeIndex >= 0) {
clearTimeout(repositionTimer);
repositionTimer = setTimeout(function () {
positionPopover(activeIndex);
}, 60);
}
});

window.addEventListener("scroll", function () {
if (popover && activeIndex >= 0) {
positionPopover(activeIndex);
}
}, true);
})();

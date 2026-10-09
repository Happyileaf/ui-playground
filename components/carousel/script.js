const slides = [
  {
    tag: 'MOUNTAIN · 山野',
    title: '云海之上的第一缕晨光',
    desc: '当第一束光越过山脊，流动的云雾被染成金橙，整片山谷在静谧中缓缓苏醒。',
    g: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 42%, #f59e0b 100%)'
  },
  {
    tag: 'OCEAN · 海洋',
    title: '深邃洋流与碎银般的浪',
    desc: '海风推动洋流前行，浪尖在暮色中翻起细碎银光，咸湿的空气里满是自由气息。',
    g: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 45%, #38bdf8 100%)'
  },
  {
    tag: 'FOREST · 森林',
    title: '穿过苔藓与光柱的秘境',
    desc: '高大的乔木撑起绿色穹顶，阳光在雾气中切出垂直光柱，脚下是柔软厚实的苔藓。',
    g: 'linear-gradient(135deg, #14532d 0%, #16a34a 48%, #a3e635 100%)'
  },
  {
    tag: 'DESERT · 沙漠',
    title: '沙丘脊线上的金色弧面',
    desc: '风日复一日雕刻着起伏的脊线，阴影与亮面交错，寂静中只听得见细沙滑落的声音。',
    g: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 46%, #fbbf24 100%)'
  },
  {
    tag: 'AURORA · 极光',
    title: '夜幕里起舞的绿色光带',
    desc: '带电粒子撞入大气，绿色与紫色的光幕在星空下缓缓波动，是寒夜最浪漫的馈赠。',
    g: 'linear-gradient(135deg, #312e81 0%, #7c3aed 42%, #34d399 100%)'
  }
];

const AUTOPLAY_DURATION = 5000;

const track = document.getElementById('carouselTrack');
const dotsWrap = document.getElementById('dots');
const carousel = document.getElementById('carousel');
const currentIdxEl = document.getElementById('currentIdx');
const totalIdxEl = document.getElementById('totalIdx');
const progressBar = document.getElementById('progressBar');

carousel.style.setProperty('--duration', `${AUTOPLAY_DURATION}ms`);
totalIdxEl.textContent = String(slides.length).padStart(2, '0');

let current = 0;
let offset = 0;
let dragging = false;
let startX = 0;
let viewportWidth = 0;
let autoplayTimer = null;
let isHovering = false;

slides.forEach((s, i) => {
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.style.setProperty('--g', s.g);
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${i + 1} / ${slides.length}`);
  slide.innerHTML = `
    <div class="slide-bg"></div>
    <div class="slide-orb"></div>
    <div class="slide-content">
      <span class="slide-tag">${s.tag}</span>
      <h2 class="slide-title">${s.title}</h2>
      <p class="slide-desc">${s.desc}</p>
    </div>
  `;
  track.appendChild(slide);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'dot';
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `跳转到第 ${i + 1} 张`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

function applyTransform(animated) {
  track.style.transition = animated
    ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none';
  const base = -current * viewportWidth;
  track.style.transform = `translate3d(${base + offset}px, 0, 0)`;
  applyParallax();
}

function applyParallax() {
  const slidesEls = track.querySelectorAll('.slide');
  slidesEls.forEach((el, i) => {
    const distance = i - current - offset / viewportWidth;
    const bg = el.querySelector('.slide-bg');
    const orb = el.querySelector('.slide-orb');
    const content = el.querySelector('.slide-content');
    bg.style.transform = `translateX(${distance * -42}px) scale(1.08)`;
    orb.style.transform = `translateX(${distance * -70}px)`;
    content.style.transform = `translateX(${distance * 24}px)`;
  });
}

function updateUI() {
  currentIdxEl.textContent = String(current + 1).padStart(2, '0');
  dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('is-active', i === current);
  });
}

function goTo(index) {
  current = (index + slides.length) % slides.length;
  offset = 0;
  applyTransform(true);
  updateUI();
  restartAutoplay();
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

const viewport = carousel.querySelector('.carousel-viewport');

function onPointerDown(e) {
  dragging = true;
  startX = e.clientX;
  viewportWidth = viewport.clientWidth;
  track.style.transition = 'none';
  viewport.setPointerCapture(e.pointerId);
  stopAutoplay();
}

function onPointerMove(e) {
  if (!dragging) return;
  let delta = e.clientX - startX;
  const atStart = current === 0 && delta > 0;
  const atEnd = current === slides.length - 1 && delta < 0;
  if (atStart || atEnd) delta *= 0.35;
  offset = delta;
  applyTransform(false);
}

function onPointerUp() {
  if (!dragging) return;
  dragging = false;
  const threshold = viewportWidth * 0.18;
  if (offset < -threshold) {
    next();
  } else if (offset > threshold) {
    prev();
  } else {
    offset = 0;
    applyTransform(true);
    restartAutoplay();
  }
}

viewport.addEventListener('pointerdown', onPointerDown);
viewport.addEventListener('pointermove', onPointerMove);
viewport.addEventListener('pointerup', onPointerUp);
viewport.addEventListener('pointercancel', onPointerUp);

document.getElementById('nextBtn').addEventListener('click', () => { next(); });
document.getElementById('prevBtn').addEventListener('click', () => { prev(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') next();
  else if (e.key === 'ArrowLeft') prev();
});

function startAutoplay() {
  if (isHovering || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stopAutoplay();
  carousel.classList.add('is-autoplay');
  autoplayTimer = setTimeout(() => {
    carousel.classList.remove('is-autoplay');
    next();
  }, AUTOPLAY_DURATION);
}

function stopAutoplay() {
  if (autoplayTimer) clearTimeout(autoplayTimer);
  autoplayTimer = null;
  carousel.classList.remove('is-autoplay');
}

function restartAutoplay() {
  void progressBar.offsetWidth;
  startAutoplay();
}

viewport.addEventListener('pointerenter', () => { isHovering = true; stopAutoplay(); });
viewport.addEventListener('pointerleave', () => { isHovering = false; startAutoplay(); });

function handleResize() {
  viewportWidth = viewport.clientWidth;
  offset = 0;
  applyTransform(false);
}
window.addEventListener('resize', handleResize);

viewportWidth = viewport.clientWidth;
applyTransform(false);
updateUI();
startAutoplay();

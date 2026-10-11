(function () {
  const bar = document.getElementById('loadingBar');
  const peg = bar.querySelector('.loading-peg');
  const statusLine = document.getElementById('statusLine');
  const startBtn = document.getElementById('startBtn');
  const completeBtn = document.getElementById('completeBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const pageTitle = document.getElementById('pageTitle');

  let progress = 0;
  let active = false;
  let timers = [];

  function clearTimers() {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  }

  function setTransform() {
    peg.style.transform = `translate3d(${progress - 100}%, 0, 0)`;
  }

  function setStatus() {
    statusLine.textContent = active ? `状态：加载中 ${Math.round(progress)}%` : '状态：空闲';
  }

  function trickle() {
    if (!active) return;
    const remaining = 100 - progress;
    const step = Math.max(0.5, remaining * 0.08 * Math.random());
    progress = Math.min(progress + step, 94);
    setTransform();
    setStatus();
    timers.push(setTimeout(trickle, 160 + Math.random() * 260));
  }

  function start() {
    clearTimers();
    progress = active ? progress : 4;
    active = true;
    bar.classList.add('active');
    setTransform();
    setStatus();
    trickle();
  }

  function done() {
    if (!active) {
      progress = 60;
      active = true;
      bar.classList.add('active');
      setTransform();
    }
    clearTimers();
    progress = 100;
    setTransform();
    setStatus();
    timers.push(setTimeout(() => {
      bar.classList.remove('active');
      active = false;
      progress = 0;
      setStatus();
    }, 320));
  }

  function navigate(link) {
    navLinks.forEach((l) => l.classList.remove('is-active'));
    link.classList.add('is-active');
    start();
    timers.push(setTimeout(() => {
      pageTitle.textContent = link.dataset.page;
      done();
    }, 700 + Math.random() * 700));
  }

  startBtn.addEventListener('click', () => {
    if (active) return;
    start();
  });

  completeBtn.addEventListener('click', done);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (link.classList.contains('is-active')) return;
      navigate(link);
    });
  });
})();

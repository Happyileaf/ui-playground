(function () {
  const buttons = Array.from(document.querySelectorAll('.async-btn'));
  const progressFill = document.getElementById('progressFill');
  const progressTrack = document.querySelector('.progress-track');
  const statusMsg = document.getElementById('statusMsg');

  let active = null;

  function setText(btn, state) {
    const label = btn.querySelector('.btn-text');
    label.textContent = label.dataset[state];
  }

  function setProgress(percent) {
    progressFill.style.width = `${percent}%`;
  }

  function finish(btn) {
    if (active !== btn) return;
    active = null;
    btn.disabled = false;
    btn.setAttribute('aria-busy', 'false');
    btn.classList.remove('is-loading');
    btn.classList.add('is-success');
    setText(btn, 'success');
    progressTrack.classList.remove('active');
    setProgress(100);
    statusMsg.textContent = btn.querySelector('.btn-text').dataset.success;

    setTimeout(() => {
      if (active) return;
      btn.classList.remove('is-success');
      setText(btn, 'idle');
      setProgress(0);
      statusMsg.textContent = '按钮空闲，等待操作';
    }, 1700);
  }

  function cancel() {
    if (!active) return;
    const btn = active;
    active = null;
    btn.disabled = false;
    btn.setAttribute('aria-busy', 'false');
    btn.classList.remove('is-loading');
    setText(btn, 'idle');
    progressTrack.classList.remove('active');
    setProgress(0);
    statusMsg.textContent = '操作已取消';
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (active) return;
      active = btn;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('is-loading');
      setText(btn, 'loading');
      progressTrack.classList.add('active');

      let percent = 0;
      setProgress(0);
      statusMsg.textContent = btn.querySelector('.btn-text').dataset.loading;

      const timer = setInterval(() => {
        if (active !== btn) {
          clearInterval(timer);
          return;
        }
        percent += Math.random() * 17 + 8;
        if (percent >= 100) {
          percent = 100;
          setProgress(percent);
          clearInterval(timer);
          finish(btn);
        } else {
          setProgress(percent);
        }
      }, 200);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cancel();
  });
})();

(function () {
  const stack = document.getElementById('alertStack');
  const seg = document.getElementById('variantSeg');
  const input = document.getElementById('messageInput');
  const triggerBtn = document.getElementById('triggerBtn');

  const META = {
    info: { title: '通知', icon: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>' },
    success: { title: '成功', icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' },
    warning: { title: '警告', icon: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' },
    danger: { title: '出错了', icon: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' }
  };

  const ACTION_LABELS = {
    dismiss: '知道了',
    reload: '刷新',
    undo: '撤销',
    upgrade: '查看',
    retry: '重试'
  };

  let activeVariant = 'info';

  function closeAlert(alert) {
    if (!alert || alert.classList.contains('is-leaving')) return;
    alert.classList.add('is-leaving');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const done = () => {
      if (alert.parentNode) alert.parentNode.removeChild(alert);
    };
    if (reduced) {
      done();
    } else {
      alert.addEventListener('animationend', done, { once: true });
      setTimeout(done, 480);
    }
  }

  function flashAction(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  }

  function bindAlert(alert) {
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeAlert(alert));
    }
    alert.querySelectorAll('.alert-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'dismiss') {
          closeAlert(alert);
          return;
        }
        flashAction(btn, ACTION_LABELS[action] ? ACTION_LABELS[action] + '中…' : '处理中…');
        setTimeout(() => closeAlert(alert), 700);
      });
    });
  }

  function createAlert(variant, message) {
    const meta = META[variant] || META.info;
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + variant;
    alert.setAttribute('role', 'alert');
    alert.innerHTML =
      '<span class="alert-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + meta.icon + '</svg></span>' +
      '<div class="alert-body"><p class="alert-title"></p><p class="alert-text"></p></div>' +
      '<div class="alert-actions"><button type="button" class="alert-action" data-action="dismiss">知道了</button></div>' +
      '<button type="button" class="alert-close" aria-label="关闭通知"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
    alert.querySelector('.alert-title').textContent = meta.title;
    alert.querySelector('.alert-text').textContent = message;
    bindAlert(alert);
    return alert;
  }

  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    activeVariant = btn.dataset.variant;
    seg.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
  });

  triggerBtn.addEventListener('click', () => {
    const message = input.value.trim() || '（空消息）';
    const alert = createAlert(activeVariant, message);
    stack.prepend(alert);
  });

  document.querySelectorAll('#alertStack .alert').forEach(bindAlert);
})();

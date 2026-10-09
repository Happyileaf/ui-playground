(function () {
  const toast = document.getElementById('copyToast');
  const toastText = document.getElementById('toastText');
  let toastTimer = null;

  function showToast(message, ok) {
    toastText.textContent = message;
    toast.style.borderColor = ok
      ? 'rgba(74, 222, 128, 0.34)'
      : 'rgba(251, 113, 133, 0.4)';
    toast.style.color = ok ? 'var(--success)' : 'var(--danger)';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      success = false;
    }
    document.body.removeChild(ta);
    return success;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        return legacyCopy(text);
      }
    }
    return legacyCopy(text);
  }

  function flash(btn, ok) {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1500);
  }

  async function handle(btn, text) {
    const ok = await copyText(text);
    flash(btn, ok);
    showToast(ok ? '已复制到剪贴板' : '复制失败，请手动选择复制', ok);
  }

  document.querySelectorAll('.copy-mini').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (target) handle(btn, target.textContent);
    });
  });

  document.querySelectorAll('.copy-primary, .copy-ghost').forEach((btn) => {
    btn.addEventListener('click', () => handle(btn, btn.dataset.copyText));
  });
})();

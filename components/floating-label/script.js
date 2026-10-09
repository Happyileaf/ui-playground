(function () {
  const form = document.getElementById('demoForm');
  const messageField = document.getElementById('messageField');
  const counter = document.getElementById('counter');
  const toast = document.getElementById('formToast');
  const MAX = 120;

  let toastTimer = null;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    if (toastTimer !== null) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function updateCounter() {
    counter.textContent = `${messageField.value.length} / ${MAX}`;
  }

  messageField.addEventListener('input', updateCounter);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name) {
      showToast('请填写姓名');
      form.elements.name.focus();
      return;
    }
    if (!emailOk) {
      showToast('请填写有效的邮箱地址');
      form.elements.email.focus();
      return;
    }

    showToast(`已收到 ${name} 的信息`);
  });

  updateCounter();
})();

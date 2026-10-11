// Standalone Native Modal Script
(function () {
  const openModalBtn = document.getElementById('openModalBtn');
  const openConfirmBtn = document.getElementById('openConfirmBtn');
  const infoDialog = document.getElementById('infoDialog');
  const dangerDialog = document.getElementById('dangerDialog');

  if (openModalBtn && infoDialog) {
    openModalBtn.addEventListener('click', () => {
      infoDialog.showModal();
    });
  }

  if (openConfirmBtn && dangerDialog) {
    openConfirmBtn.addEventListener('click', () => {
      dangerDialog.showModal();
    });
  }

  // Generic close handlers for elements with data-close attribute
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const dialog = e.target.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  // Close when clicking directly on backdrop
  [infoDialog, dangerDialog].forEach((dialog) => {
    if (!dialog) return;
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

  const confirmInfoBtn = document.getElementById('confirmInfoBtn');
  if (confirmInfoBtn) {
    confirmInfoBtn.addEventListener('click', () => {
      infoDialog.close();
    });
  }
})();

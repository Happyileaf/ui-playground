(function () {
  const triggers = Array.from(document.querySelectorAll('.faq-trigger'));
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');

  function setOpen(trigger, open) {
    trigger.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('open', open);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      setOpen(trigger, !isOpen);
    });
  });

  function focusTrigger(index) {
    if (index < 0 || index >= triggers.length) return;
    triggers[index].focus();
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('keydown', (e) => {
      let targetIndex = null;

      switch (e.key) {
        case 'ArrowDown':
          targetIndex = (index + 1) % triggers.length;
          break;
        case 'ArrowUp':
          targetIndex = (index - 1 + triggers.length) % triggers.length;
          break;
        case 'Home':
          targetIndex = 0;
          break;
        case 'End':
          targetIndex = triggers.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      focusTrigger(targetIndex);
    });
  });

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      triggers.forEach(trigger => setOpen(trigger, true));
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      triggers.forEach(trigger => setOpen(trigger, false));
    });
  }
})();

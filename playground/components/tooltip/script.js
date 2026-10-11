// Standalone Smart Positioning Tooltip Script
(function () {
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'native-tooltip';
  document.body.appendChild(tooltipEl);

  let activeTarget = null;

  function showTooltip(target) {
    activeTarget = target;
    const text = target.dataset.tooltip;
    if (!text) return;

    tooltipEl.textContent = text;
    tooltipEl.className = 'native-tooltip'; // reset

    const position = target.dataset.position || 'top';
    const targetRect = target.getBoundingClientRect();

    // Show invisible first to measure tooltip dimensions
    tooltipEl.style.top = '0px';
    tooltipEl.style.left = '0px';
    tooltipEl.style.display = 'block';

    const tooltipRect = tooltipEl.getBoundingClientRect();
    const gap = 10;

    let top = 0;
    let left = 0;
    let actualPos = position;

    if (position === 'top') {
      top = targetRect.top - tooltipRect.height - gap;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      if (top < 10) {
        top = targetRect.bottom + gap;
        actualPos = 'bottom';
      }
    } else if (position === 'bottom') {
      top = targetRect.bottom + gap;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      if (top + tooltipRect.height > window.innerHeight - 10) {
        top = targetRect.top - tooltipRect.height - gap;
        actualPos = 'top';
      }
    } else if (position === 'left') {
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left - tooltipRect.width - gap;
      if (left < 10) {
        left = targetRect.right + gap;
        actualPos = 'right';
      }
    } else if (position === 'right') {
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + gap;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = targetRect.left - tooltipRect.width - gap;
        actualPos = 'left';
      }
    }

    // Horizontal boundary clamp
    left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left));

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.classList.add(`pos-${actualPos}`);
    tooltipEl.classList.add('visible');
  }

  function hideTooltip() {
    activeTarget = null;
    tooltipEl.classList.remove('visible');
  }

  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('pointerenter', () => showTooltip(el));
    el.addEventListener('pointerleave', hideTooltip);
    el.addEventListener('focus', () => showTooltip(el));
    el.addEventListener('blur', hideTooltip);
  });
})();

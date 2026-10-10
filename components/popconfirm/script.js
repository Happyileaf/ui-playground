(function () {
  const pop = document.getElementById('popconfirm');
  const titleEl = document.getElementById('popTitle');
  const descEl = document.getElementById('popDesc');
  const cancelBtn = document.getElementById('popCancel');
  const confirmBtn = document.getElementById('popConfirm');
  const log = document.getElementById('resultLog');
  const GAP = 12;

  let activeTrigger = null;
  let activePlacement = 'top';

  const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

  function positionFor(trigger, placement) {
    const rect = trigger.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let top;
    let left;

    if (placement === 'top') {
      top = rect.top - ph - GAP;
      left = rect.left + rect.width / 2 - pw / 2;
    } else if (placement === 'bottom') {
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - pw / 2;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2 - ph / 2;
      left = rect.left - pw - GAP;
    } else {
      top = rect.top + rect.height / 2 - ph / 2;
      left = rect.right + GAP;
    }
    return { top, left };
  }

  function fits(placement, pos) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    if (pos.left < 8 || pos.left + pw > vw - 8) {
      if (placement === 'left' || placement === 'right') return false;
    }
    if (pos.top < 8 || pos.top + ph > vh - 8) {
      if (placement === 'top' || placement === 'bottom') return false;
    }
    return true;
  }

  function clampPosition(pos) {
    const vw = window.innerWidth;
    return {
      top: Math.max(8, Math.min(pos.top, vw && window.innerHeight - pop.offsetHeight - 8)),
      left: Math.max(8, Math.min(pos.left, vw - pop.offsetWidth - 8))
    };
  }

  function setArrow(trigger, side, pos) {
    const rect = trigger.getBoundingClientRect();
    pop.style.removeProperty('--arrow-x');
    pop.style.removeProperty('--arrow-y');
    if (side === 'top' || side === 'bottom') {
      const center = rect.left + rect.width / 2;
      const x = Math.max(20, Math.min(center - pos.left, pop.offsetWidth - 20));
      pop.style.setProperty('--arrow-x', `${x}px`);
    } else {
      const center = rect.top + rect.height / 2;
      const y = Math.max(20, Math.min(center - pos.top, pop.offsetHeight - 20));
      pop.style.setProperty('--arrow-y', `${y}px`);
    }
  }

  function openPop(trigger) {
    activeTrigger = trigger;
    titleEl.textContent = trigger.dataset.title || '确定执行此操作？';
    descEl.textContent = trigger.dataset.desc || '';
    cancelBtn.textContent = trigger.dataset.cancel || '取消';
    confirmBtn.textContent = trigger.dataset.confirm || '确定';

    pop.hidden = false;
    let placement = trigger.dataset.placement || 'top';
    let pos = positionFor(trigger, placement);
    if (!fits(placement, pos)) {
      const flipped = OPPOSITE[placement];
      const flippedPos = positionFor(trigger, flipped);
      if (fits(flipped, flippedPos)) {
        placement = flipped;
        pos = flippedPos;
      } else {
        pos = clampPosition(pos);
      }
    }
    activePlacement = placement;
    pop.setAttribute('data-side', placement);
    pop.style.top = `${pos.top}px`;
    pop.style.left = `${pos.left}px`;
    setArrow(trigger, placement, pos);
    confirmBtn.focus();
  }

  function closePop() {
    pop.hidden = true;
    if (activeTrigger) activeTrigger.focus();
    activeTrigger = null;
  }

  document.querySelectorAll('[data-popconfirm]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeTrigger === btn) {
        closePop();
        return;
      }
      if (activeTrigger) closePop();
      openPop(btn);
    });
  });

  cancelBtn.addEventListener('click', () => {
    log.textContent = '已取消操作';
    closePop();
  });

  confirmBtn.addEventListener('click', () => {
    log.textContent = `操作已执行：${activeTrigger.dataset.confirm}`;
    closePop();
  });

  document.addEventListener('click', (e) => {
    if (!pop.hidden && !pop.contains(e.target) && e.target !== activeTrigger) {
      closePop();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (pop.hidden) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      closePop();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey && document.activeElement === confirmBtn) {
        cancelBtn.focus();
      } else if (!e.shiftKey && document.activeElement === cancelBtn) {
        confirmBtn.focus();
      } else {
        (e.shiftKey ? confirmBtn : cancelBtn).focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (activeTrigger) openPop(activeTrigger);
  });
})();

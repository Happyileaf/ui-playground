(function () {
  const region = document.getElementById('toastRegion');
  const statusLine = document.getElementById('statusLine');
  const actionToastBtn = document.getElementById('actionToastBtn');
  const burstBtn = document.getElementById('burstBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PRESETS = {
    success: {
      title: '保存成功',
      message: '你的全部修改已经同步到云端，可以随时在其他设备继续编辑。',
      duration: 4200,
      icon: '<path d="m4 12.5 5 5L20 6.5"></path>'
    },
    info: {
      title: '发现新版本 v2.4',
      message: '本次更新带来了离线模式与快捷键面板，刷新页面即可体验。',
      duration: 5200,
      icon: '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.6v.2"></path>'
    },
    warning: {
      title: '存储空间不足',
      message: '云端剩余容量已低于 10%，请及时清理历史文件或升级套餐。',
      duration: 6000,
      icon: '<path d="M12 3.5 2.5 20h19L12 3.5Z"></path><path d="M12 10v4.5M12 17.4v.2"></path>'
    },
    error: {
      title: '网络连接失败',
      message: '请求超时，系统将在网络恢复后自动重试，未保存的内容已保留在本地。',
      duration: 6500,
      icon: '<circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6M15 9l-6 6"></path>'
    }
  };

  const toasts = new Map();
  let toastSeq = 0;

  function updateStatus(extra) {
    const count = toasts.size;
    if (extra) {
      statusLine.textContent = extra;
    } else if (count === 0) {
      statusLine.textContent = '通知区域当前为空';
    } else {
      statusLine.textContent = `通知区域当前有 ${count} 条通知`;
    }
  }

  function dismissToast(id) {
    const entry = toasts.get(id);
    if (!entry) {
      return;
    }
    const { element, timer } = entry;
    window.clearTimeout(timer);
    toasts.delete(id);
    element.classList.remove('is-in');
    element.classList.add('is-out');
    const remove = () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      updateStatus();
    };
    if (reduceMotion) {
      remove();
    } else {
      window.setTimeout(remove, 320);
    }
  }

  function startTimer(entry) {
    const { element, duration } = entry;
    entry.timer = window.setTimeout(() => dismissToast(entry.id), duration);
    if (!reduceMotion) {
      entry.elapsed = 0;
      entry.startedAt = performance.now();
      element.querySelector('.toast-progress').animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        {
          duration,
          easing: 'linear',
          fill: 'forwards'
        }
      );
    }
  }

  function pauseTimer(entry) {
    if (!entry.timer) {
      return;
    }
    window.clearTimeout(entry.timer);
    entry.timer = null;
    entry.elapsed += performance.now() - entry.startedAt;
    const animations = entry.element.querySelector('.toast-progress').getAnimations();
    animations.forEach((animation) => animation.pause());
  }

  function resumeTimer(entry) {
    if (entry.timer) {
      return;
    }
    const remaining = Math.max(entry.duration - entry.elapsed, 300);
    entry.timer = window.setTimeout(() => dismissToast(entry.id), remaining);
    entry.startedAt = performance.now();
    const animations = entry.element.querySelector('.toast-progress').getAnimations();
    animations.forEach((animation) => animation.play());
  }

  function createToast(type, options) {
    const preset = PRESETS[type] || PRESETS.info;
    const config = Object.assign({}, preset, options);
    const id = `toast-${++toastSeq}`;

    const element = document.createElement('div');
    element.className = `toast type-${type}`;
    element.dataset.toastId = id;
    element.innerHTML = `
      <span class="toast-accent"></span>
      <span class="toast-icon">
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">${config.icon}</svg>
      </span>
      <div class="toast-content">
        <p class="toast-title"></p>
        <p class="toast-message"></p>
        <div class="toast-actions" hidden></div>
      </div>
      <button type="button" class="toast-close" aria-label="关闭通知">
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18"></path>
        </svg>
      </button>
      <span class="toast-progress"></span>
    `;
    element.querySelector('.toast-title').textContent = config.title;
    element.querySelector('.toast-message').textContent = config.message;

    if (config.actions && config.actions.length) {
      const actionsRow = element.querySelector('.toast-actions');
      actionsRow.hidden = false;
      config.actions.forEach((action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `toast-action${action.primary ? ' is-primary' : ''}`;
        button.textContent = action.label;
        button.addEventListener('click', () => {
          action.onClick();
          dismissToast(id);
        });
        actionsRow.appendChild(button);
      });
    }

    region.appendChild(element);
    const entry = {
      id,
      element,
      duration: config.duration,
      elapsed: 0,
      startedAt: 0,
      timer: null
    };
    toasts.set(id, entry);

    element.querySelector('.toast-close').addEventListener('click', () => dismissToast(id));
    element.addEventListener('pointerenter', () => pauseTimer(entry));
    element.addEventListener('pointerleave', () => resumeTimer(entry));

    window.requestAnimationFrame(() => {
      element.classList.add('is-in');
    });
    startTimer(entry);
    updateStatus();
    return id;
  }

  document.querySelectorAll('.trigger-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = createToast(button.dataset.type);
      const preset = PRESETS[button.dataset.type];
      updateStatus(`已触发「${preset.title}」通知`);
      void id;
    });
  });

  actionToastBtn.addEventListener('click', () => {
    createToast('info', {
      title: '文件已上传完成',
      message: '「年度报告.pdf」已安全上传，你可以复制链接分享给同事。',
      duration: 8000,
      actions: [
        {
          label: '复制链接',
          primary: true,
          onClick: () => updateStatus('链接已复制到剪贴板')
        },
        {
          label: '稍后处理',
          onClick: () => updateStatus('通知已延后处理')
        }
      ]
    });
    updateStatus('已触发一条带操作按钮的通知');
  });

  burstBtn.addEventListener('click', () => {
    const sequence = ['success', 'warning', 'error'];
    sequence.forEach((type, index) => {
      window.setTimeout(() => {
        createToast(type);
        if (index === sequence.length - 1) {
          updateStatus('已连续触发三条通知');
        }
      }, index * 260);
    });
  });

  clearAllBtn.addEventListener('click', () => {
    Array.from(toasts.keys()).forEach((id) => dismissToast(id));
    updateStatus('已清空全部通知');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || toasts.size === 0) {
      return;
    }
    const ids = Array.from(toasts.keys());
    dismissToast(ids[ids.length - 1]);
  });

  updateStatus();
})();

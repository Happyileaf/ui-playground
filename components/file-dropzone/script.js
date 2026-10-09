(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const fileCount = document.getElementById('fileCount');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED = ['image/', '.pdf', '.doc', '.docx', '.zip', 'application/zip'];

  let entries = [];
  let dragDepth = 0;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function isAllowed(file) {
    const name = file.name.toLowerCase();
    return ALLOWED.some((rule) =>
      rule.startsWith('.') ? name.endsWith(rule) :
        (file.type && file.type.startsWith(rule)));
  }

  function fileIcon(file) {
    const name = file.name.toLowerCase();
    if (file.type.startsWith('image/')) return '🖼️';
    if (name.endsWith('.pdf')) return '📕';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📘';
    if (name.endsWith('.zip')) return '🗜️';
    return '📄';
  }

  function validate(file) {
    if (!isAllowed(file)) return '不支持的文件类型';
    if (file.size > MAX_SIZE) return '文件超过 10 MB 限制';
    return null;
  }

  function createEntry(file) {
    const error = validate(file);
    const entry = {
      id: 'f' + Date.now() + Math.random().toString(36).slice(2, 7),
      file,
      name: file.name,
      size: file.size,
      status: error ? 'error' : 'pending',
      progress: 0,
      error,
      thumbUrl: null
    };

    if (file.type.startsWith('image/')) {
      entry.thumbUrl = URL.createObjectURL(file);
    }
    entries.push(entry);
    renderEntry(entry);

    if (!error) startUpload(entry);
    updateBar();
  }

  function renderEntry(entry) {
    let li = document.getElementById(entry.id);
    const isNew = !li;
    if (isNew) {
      li = document.createElement('li');
      li.className = 'file-item';
      li.id = entry.id;
      fileList.appendChild(li);
    }

    const thumb = entry.thumbUrl
      ? '<img class="file-thumb" src="' + entry.thumbUrl + '" alt="">'
      : '<span class="file-thumb icon">' + fileIcon(entry.file) + '</span>';

    let subLine = '';
    if (entry.status === 'error') {
      subLine = '<span class="file-sub error">⚠ ' + entry.error + '</span>';
    } else if (entry.status === 'done') {
      subLine = '<span class="file-sub"><span class="status-dot done"></span>已完成 · ' + formatSize(entry.size) + '</span>';
    } else {
      subLine = '<span class="file-sub"><span class="status-dot uploading"></span>' +
        (entry.status === 'pending' ? '等待中' : '上传中 ' + Math.round(entry.progress) + '%') +
        ' · ' + formatSize(entry.size) + '</span>';
    }

    const action = entry.status === 'error'
      ? '<button type="button" class="file-action retry" data-action="retry">重试</button>'
      : '<button type="button" class="file-action" data-action="remove" aria-label="移除文件"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>';

    li.innerHTML =
      thumb +
      '<div class="file-info">' +
        '<span class="file-name"></span>' +
        subLine +
        '<div class="progress-track"><div class="progress-fill ' +
          (entry.status === 'error' ? 'error' : '') + '"></div></div>' +
      '</div>' +
      action;

    li.querySelector('.file-name').textContent = entry.name;
    li.querySelector('.progress-fill').style.width =
      (entry.status === 'done' ? 100 : entry.progress) + '%';
  }

  function startUpload(entry) {
    entry.status = 'uploading';
    entry.progress = 0;
    renderEntry(entry);

    const timer = setInterval(() => {
      entry.progress += 8 + Math.random() * 16;

      if (!entry.error && entry.progress > 62 && entry.progress < 70 &&
          entry.file.size > 9 * 1024 * 1024 && !entry.flunked) {
        entry.flunked = true;
        entry.status = 'error';
        entry.error = '网络异常，上传中断';
        clearInterval(timer);
        renderEntry(entry);
        updateBar();
        return;
      }

      if (entry.progress >= 100) {
        entry.progress = 100;
        entry.status = 'done';
        clearInterval(timer);
      }
      renderEntry(entry);
      updateBar();
    }, 220);
  }

  function retry(entry) {
    entry.error = null;
    entry.progress = 0;
    startUpload(entry);
  }

  function removeEntry(entry) {
    entries = entries.filter((e) => e !== entry);
    if (entry.thumbUrl) URL.revokeObjectURL(entry.thumbUrl);
    const li = document.getElementById(entry.id);
    if (li) li.remove();
    updateBar();
  }

  fileList.addEventListener('click', (e) => {
    const li = e.target.closest('.file-item');
    if (!li) return;
    const entry = entries.find((x) => x.id === li.id);
    if (!entry) return;
    if (e.target.closest('[data-action="remove"]')) removeEntry(entry);
    else if (e.target.closest('[data-action="retry"]')) retry(entry);
  });

  function updateBar() {
    if (!entries.length) {
      fileCount.textContent = '尚未添加文件';
      clearAllBtn.hidden = true;
      return;
    }
    const done = entries.filter((e) => e.status === 'done').length;
    fileCount.textContent = entries.length + ' 个文件 · 已完成 ' + done + ' 个';
    clearAllBtn.hidden = false;
  }

  clearAllBtn.addEventListener('click', () => {
    entries.forEach((e) => {
      if (e.thumbUrl) URL.revokeObjectURL(e.thumbUrl);
    });
    entries = [];
    fileList.innerHTML = '';
    updateBar();
  });

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    Array.from(fileInput.files).forEach(createEntry);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (evt === 'dragenter') dragDepth += 1;
      dropzone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (evt === 'dragleave') {
        dragDepth -= 1;
        if (dragDepth > 0) return;
      } else {
        dragDepth = 0;
      }
      dropzone.classList.remove('dragging');
      if (evt === 'drop' && e.dataTransfer) {
        Array.from(e.dataTransfer.files).forEach(createEntry);
      }
    });
  });

  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  updateBar();
})();

(function () {
  const DATA = [
    { group: '热门', items: [
      { value: 'cn', label: '中国', flag: '🇨🇳' },
      { value: 'us', label: '美国', flag: '🇺🇸' },
      { value: 'jp', label: '日本', flag: '🇯🇵' },
      { value: 'gb', label: '英国', flag: '🇬🇧' }
    ]},
    { group: '亚太', items: [
      { value: 'kr', label: '韩国', flag: '🇰🇷' },
      { value: 'sg', label: '新加坡', flag: '🇸🇬' },
      { value: 'au', label: '澳大利亚', flag: '🇦🇺' },
      { value: 'th', label: '泰国', flag: '🇹🇭' },
      { value: 'in', label: '印度', flag: '🇮🇳' },
      { value: 'nz', label: '新西兰', flag: '🇳🇿' }
    ]},
    { group: '欧洲', items: [
      { value: 'fr', label: '法国', flag: '🇫🇷' },
      { value: 'de', label: '德国', flag: '🇩🇪' },
      { value: 'it', label: '意大利', flag: '🇮🇹' },
      { value: 'es', label: '西班牙', flag: '🇪🇸' },
      { value: 'nl', label: '荷兰', flag: '🇳🇱' },
      { value: 'se', label: '瑞典', flag: '🇸🇪' },
      { value: 'ch', label: '瑞士', flag: '🇨🇭' }
    ]},
    { group: '美洲', items: [
      { value: 'ca', label: '加拿大', flag: '🇨🇦' },
      { value: 'br', label: '巴西', flag: '🇧🇷' },
      { value: 'mx', label: '墨西哥', flag: '🇲🇽' },
      { value: 'ar', label: '阿根廷', flag: '🇦🇷' }
    ]}
  ];

  const control = document.getElementById('comboControl');
  const input = document.getElementById('comboInput');
  const pop = document.getElementById('comboPop');
  const listbox = document.getElementById('comboListbox');
  const empty = document.getElementById('comboEmpty');
  const clearBtn = document.getElementById('comboClear');
  const readout = document.getElementById('selectedReadout');
  const resetBtn = document.getElementById('resetBtn');

  let isOpen = false;
  let query = '';
  let activeIndex = -1;
  let selected = null;
  let optionEls = [];

  function flatItems(filter) {
    const q = (filter || '').trim().toLowerCase();
    const result = [];
    DATA.forEach((section) => {
      const matched = section.items.filter((it) =>
        !q || it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q));
      if (matched.length) result.push({ group: section.group, items: matched });
    });
    return result;
  }

  function render() {
    const sections = flatItems(query);
    listbox.innerHTML = '';
    optionEls = [];
    let runningIndex = 0;

    sections.forEach((section) => {
      const groupEl = document.createElement('li');
      groupEl.className = 'combo-group-label';
      groupEl.setAttribute('role', 'presentation');
      groupEl.textContent = section.group;
      listbox.appendChild(groupEl);

      section.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'combo-option';
        li.setAttribute('role', 'option');
        li.setAttribute('id', 'opt-' + item.value);
        li.dataset.index = String(runningIndex);
        if (selected && selected.value === item.value) li.classList.add('selected');
        li.innerHTML =
          '<span class="opt-flag">' + item.flag + '</span>' +
          '<span class="opt-label">' + highlight(item.label, query) + '</span>' +
          '<span class="opt-check"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
        li.addEventListener('mouseenter', () => setActive(runningIndex));
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          choose(item);
        });
        listbox.appendChild(li);
        optionEls.push({ el: li, item });
        runningIndex += 1;
      });
    });

    const total = optionEls.length;
    empty.hidden = total !== 0;
    listbox.style.display = total ? 'block' : 'none';

    if (total) {
      const prefer = optionEls.findIndex((o) => selected && o.item.value === selected.value);
      setActive(prefer >= 0 ? prefer : 0, true);
    } else {
      activeIndex = -1;
    }
  }

  function highlight(text, filter) {
    if (!filter) return text;
    const idx = text.toLowerCase().indexOf(filter.toLowerCase());
    if (idx < 0) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + filter.length) + '</mark>' +
      text.slice(idx + filter.length);
  }

  function setActive(index, silentScroll) {
    if (!optionEls.length) return;
    activeIndex = (index + optionEls.length) % optionEls.length;
    optionEls.forEach((o, i) => {
      o.el.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) o.el.setAttribute('aria-selected', 'true');
      else o.el.removeAttribute('aria-selected');
    });
    const target = optionEls[activeIndex].el;
    if (!silentScroll) target.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    control.classList.add('open');
    control.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-expanded', 'true');
    render();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    control.classList.remove('open');
    control.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-expanded', 'false');
    if (selected) {
      input.value = selected.label;
    } else {
      input.value = '';
    }
    query = input.value;
  }

  function choose(item) {
    selected = item;
    input.value = item.label;
    query = item.label;
    readout.textContent = item.flag + ' ' + item.label;
    clearBtn.hidden = false;
    close();
    input.blur();
  }

  function clearAll() {
    selected = null;
    query = '';
    input.value = '';
    readout.textContent = '未选择';
    clearBtn.hidden = true;
    input.focus();
    open();
  }

  control.addEventListener('click', (e) => {
    if (e.target.closest('.combo-clear')) {
      e.stopPropagation();
      clearAll();
      return;
    }
    if (isOpen) close();
    else {
      open();
      input.focus();
      input.select();
    }
  });

  input.addEventListener('focus', () => {
    if (!isOpen) open();
  });

  input.addEventListener('input', () => {
    query = input.value;
    if (!isOpen) open();
    render();
  });

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) open();
        else setActive(activeIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) open();
        else setActive(activeIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && optionEls[activeIndex]) {
          choose(optionEls[activeIndex].item);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        if (isOpen) close();
        break;
      default:
        break;
    }
  });

  clearBtn.addEventListener('mousedown', (e) => e.preventDefault());

  resetBtn.addEventListener('click', clearAll);

  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const want = btn.dataset.jump;
      const found = []
        .concat(...DATA.map((s) => s.items))
        .find((it) => it.label === want);
      if (found) {
        choose(found);
      }
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (!control.contains(e.target) && !pop.contains(e.target) && isOpen) {
      close();
    }
  });

  clearBtn.hidden = true;
})();

(function () {
  const DATA = [
    {
      value: 'beijing', label: '北京市', children: [
        {
          value: 'chaoyang', label: '朝阳区', children: [
            { value: 'sanlitun', label: '三里屯街道' },
            { value: 'wangjing', label: '望京街道' },
            { value: 'cbd', label: '建外大街 / CBD' },
          ],
        },
        {
          value: 'haidian', label: '海淀区', children: [
            { value: 'zhongguancun', label: '中关村' },
            { value: 'wudaokou', label: '五道口' },
            { value: 'shangdi', label: '上地信息路' },
          ],
        },
        { value: 'dongcheng', label: '东城区', children: [{ value: 'wangfujing', label: '王府井' }] },
      ],
    },
    {
      value: 'shanghai', label: '上海市', children: [
        {
          value: 'pudong', label: '浦东新区', children: [
            { value: 'lujiazui', label: '陆家嘴金融区' },
            { value: 'zhangjiang', label: '张江高科技园' },
          ],
        },
        {
          value: 'xuhui', label: '徐汇区', children: [
            { value: 'xujiahui', label: '徐家汇' },
            { value: 'hengshan', label: '衡山路' },
          ],
        },
      ],
    },
    {
      value: 'guangdong', label: '广东省', children: [
        {
          value: 'shenzhen', label: '深圳市', children: [
            { value: 'nanshan', label: '南山区 · 科技园' },
            { value: 'futian', label: '福田中心区' },
          ],
        },
        {
          value: 'guangzhou', label: '广州市', children: [
            { value: 'tianhe', label: '天河区' },
            { value: 'yuexiu', label: '越秀区' },
          ],
        },
      ],
    },
    {
      value: 'zhejiang', label: '浙江省', children: [
        {
          value: 'hangzhou', label: '杭州市', children: [
            { value: 'xihu', label: '西湖区' },
            { value: 'binjiang', label: '滨江区' },
          ],
        },
      ],
    },
  ];

  const trigger = document.getElementById('trigger');
  const pop = document.getElementById('pop');
  const valueEl = document.getElementById('value');
  const clearBtn = document.getElementById('clearBtn');
  const resultValue = document.getElementById('resultValue');
  const resultCode = document.getElementById('resultCode');
  const resultCard = document.getElementById('resultCard');

  let pathNodes = [];
  let cursor = [];
  let activeLevel = 0;
  let isOpen = false;

  function nodesAt(level) {
    if (level === 0) return DATA;
    const node = pathNodes[level - 1];
    return node && node.children ? node.children : [];
  }

  function render() {
    pop.innerHTML = '';
    const depth = pathNodes.length + 1;
    for (let level = 0; level < depth; level += 1) {
      const nodes = nodesAt(level);
      if (!nodes.length) break;
      const col = document.createElement('div');
      col.className = 'cascader-col';
      col.setAttribute('role', 'group');

      nodes.forEach((node, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'cas-item';
        item.setAttribute('role', 'treeitem');
        const selectedInPath = pathNodes[level] === node;
        const isHover = cursor[level] === index && level === activeLevel;
        if (isHover || (selectedInPath && level !== activeLevel)) item.classList.add('is-active');

        const label = document.createElement('span');
        label.textContent = node.label;
        item.appendChild(label);

        const tail = document.createElement('span');
        if (node.children && node.children.length) {
          tail.className = 'cas-arrow';
          tail.textContent = '›';
        } else if (selectedInPath && level === pathNodes.length) {
          tail.className = 'cas-check';
          tail.textContent = '✓';
        }
        item.appendChild(tail);

        item.addEventListener('mouseenter', () => {
          cursor[level] = index;
          selectAt(level, node, false);
        });

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectAt(level, node, true);
        });

        col.appendChild(item);
      });
      pop.appendChild(col);
    }
  }

  function selectAt(level, node, advance) {
    pathNodes = pathNodes.slice(0, level);
    pathNodes.push(node);
    cursor[level] = nodesAt(level).indexOf(node);
    activeLevel = level;
    const hasChildren = node.children && node.children.length;
    if (!hasChildren) {
      render();
      commit();
      return;
    }
    if (advance) {
      activeLevel = level + 1;
      cursor[level + 1] = 0;
    } else {
      cursor = cursor.slice(0, level + 1);
    }
    render();
  }

  function commit() {
    const labels = pathNodes.map((n) => n.label);
    const values = pathNodes.map((n) => n.value);
    valueEl.textContent = labels.join(' / ');
    trigger.classList.remove('is-empty');
    resultCard.classList.remove('is-empty');
    resultValue.textContent = labels.join(' · ');
    resultCode.textContent = `value: ${values.join(' / ')}`;
    close();
  }

  function alignToViewport() {
    pop.style.left = '0';
    const rect = pop.getBoundingClientRect();
    const margin = 12;
    if (rect.right > window.innerWidth - margin) {
      const overflow = rect.right - (window.innerWidth - margin);
      pop.style.left = `${-overflow}px`;
    }
    if (rect.left < margin) pop.style.left = `${margin - rect.left}px`;
  }

  function open() {
    isOpen = true;
    pop.hidden = false;
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    activeLevel = pathNodes.length;
    cursor = pathNodes.map((node, level) => nodesAt(level).indexOf(node));
    cursor[activeLevel] = cursor[activeLevel] || 0;
    render();
    pop.classList.remove('is-open');
    void pop.offsetWidth;
    pop.classList.add('is-open');
    alignToViewport();
  }

  function close() {
    isOpen = false;
    pop.hidden = true;
    pop.classList.remove('is-open');
    trigger.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function clearSelection() {
    pathNodes = [];
    cursor = [];
    valueEl.textContent = '请选择 / 省 / 市 / 区县';
    trigger.classList.add('is-empty');
    resultCard.classList.add('is-empty');
    resultValue.textContent = '尚未选择';
    resultCode.textContent = 'value: —';
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSelection();
    trigger.focus();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!isOpen) return;
    if (pop.contains(e.target) || trigger.contains(e.target)) return;
    close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      close();
      trigger.focus();
      return;
    }
    if (!isOpen) return;

    const level = activeLevel;
    const nodes = nodesAt(level);
    if (!nodes.length) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const next = Math.min(Math.max((cursor[level] || 0) + dir, 0), nodes.length - 1);
      cursor[level] = next;
      pathNodes = pathNodes.slice(0, level);
      pathNodes.push(nodes[next]);
      render();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      selectAt(level, nodes[cursor[level] || 0], true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (level > 0) {
        activeLevel = level - 1;
        pathNodes = pathNodes.slice(0, level);
        render();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (isOpen) alignToViewport();
  });

  trigger.classList.add('is-empty');
  resultCard.classList.add('is-empty');
})();

// Standalone Fluid Sliding Navigation Script
(function () {
  const nav = document.getElementById('mainNav');
  const indicator = document.getElementById('navIndicator');
  const items = nav.querySelectorAll('.nav-item');
  const activeTitle = document.getElementById('activeTitle');
  const activeDesc = document.getElementById('activeDesc');

  const contentMap = {
    overview: {
      title: 'Overview',
      desc: 'Displaying primary project metrics, health statuses, and real-time operational feeds.'
    },
    analytics: {
      title: 'Analytics & Insights',
      desc: 'Live query telemetry, user retention trends, and compute usage graphs.'
    },
    deployments: {
      title: 'Active Deployments',
      desc: 'Zero-downtime cluster nodes running in production across global edge regions.'
    },
    settings: {
      title: 'System Settings',
      desc: 'Fine-tune environment credentials, role-based access, and build hooks.'
    }
  };

  function updateIndicator(targetEl) {
    if (!targetEl || !indicator) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = targetEl.getBoundingClientRect();

    const left = itemRect.left - navRect.left;
    const width = itemRect.width;

    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
  }

  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      items.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
      updateIndicator(item);

      const targetKey = item.getAttribute('href').replace('#', '');
      if (contentMap[targetKey]) {
        activeTitle.textContent = contentMap[targetKey].title;
        activeDesc.textContent = contentMap[targetKey].desc;
      }
    });
  });

  // Position indicator initially on current active item
  const initialActive = nav.querySelector('.nav-item.active') || items[0];
  if (initialActive) {
    // Timeout to ensure correct DOM layout measurement
    setTimeout(() => updateIndicator(initialActive), 50);
  }

  window.addEventListener('resize', () => {
    const active = nav.querySelector('.nav-item.active');
    if (active) updateIndicator(active);
  });
})();

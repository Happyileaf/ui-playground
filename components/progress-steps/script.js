(function () {
  'use strict';

  var STEP_DATA = [
    { icon: '🛒', title: '第 1 步：购物车', desc: '核对商品数量与规格，确认优惠券使用情况' },
    { icon: '📍', title: '第 2 步：填写地址', desc: '请填写或选择收货地址，确保包裹能准确送达' },
    { icon: '💳', title: '第 3 步：支付方式', desc: '支持微信、支付宝、银行卡等多种支付渠道' },
    { icon: '🎉', title: '第 4 步：完成下单', desc: '订单已提交成功，可在「我的订单」中查看物流' }
  ];

  var nodes = Array.prototype.slice.call(document.querySelectorAll('.step-node'));
  var trackProg = document.getElementById('trackProg');
  var panel = document.getElementById('stepPanel');
  var panelIcon = document.getElementById('panelIcon');
  var panelTitle = document.getElementById('panelTitle');
  var panelDesc = document.getElementById('panelDesc');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');

  var current = 1;
  var total = nodes.length;

  function render() {
    nodes.forEach(function (node, i) {
      node.classList.toggle('completed', i < current);
      node.classList.toggle('active', i === current);
      node.classList.toggle('clickable', i < current);
      node.setAttribute('aria-current', i === current ? 'step' : 'false');
    });

    var segments = total - 1;
    var pct = current / segments * 100;
    trackProg.style.width = pct + '%';

    var data = STEP_DATA[current];
    panelIcon.textContent = data.icon;
    panelTitle.textContent = data.title;
    panelDesc.textContent = data.desc;

    panel.classList.remove('swap');
    void panel.offsetWidth;
    panel.classList.add('swap');

    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === total - 1 ? '已完成' : '下一步';
    nextBtn.disabled = current === total - 1;
  }

  nextBtn.addEventListener('click', function () {
    if (current < total - 1) {
      current += 1;
      render();
    }
  });

  prevBtn.addEventListener('click', function () {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var index = parseInt(node.getAttribute('data-index'), 10);
      if (index < current) {
        current = index;
        render();
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.code === 'ArrowRight' && current < total - 1) {
      current += 1;
      render();
    } else if (e.altKey && e.code === 'ArrowLeft' && current > 0) {
      current -= 1;
      render();
    }
  });

  render();
})();

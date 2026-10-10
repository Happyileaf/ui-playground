(function () {
  'use strict';

  var LEVELS = [
    { v: 1, label: '很不满意，让你失望了', color: 'var(--v1)' },
    { v: 2, label: '不太满意，有待改进', color: 'var(--v2)' },
    { v: 3, label: '感觉一般，中规中矩', color: 'var(--v3)' },
    { v: 4, label: '比较满意，体验不错', color: 'var(--v4)' },
    { v: 5, label: '非常满意，太棒了！', color: 'var(--v5)' }
  ];

  var btns = Array.prototype.slice.call(document.querySelectorAll('.emoji-btn'));
  var trackFill = document.getElementById('trackFill');
  var verdict = document.getElementById('verdict');
  var submitBtn = document.getElementById('submitBtn');
  var ratingCard = document.getElementById('ratingCard');
  var successTitle = document.getElementById('successTitle');
  var successSub = document.getElementById('successSub');
  var againBtn = document.getElementById('againBtn');

  var selected = 0;
  var preview = 0;

  function paint(value) {
    btns.forEach(function (btn) {
      var v = parseInt(btn.getAttribute('data-value'), 10);
      btn.classList.toggle('lit', value > 0 && v <= value);
      btn.classList.toggle('active', v === value);
      btn.setAttribute('aria-checked', v === selected ? 'true' : 'false');
    });

    if (value > 0) {
      var level = LEVELS[value - 1];
      trackFill.style.width = (value / 5 * 100) + '%';
      verdict.textContent = level.label;
      verdict.style.color = level.color;
    } else {
      trackFill.style.width = '0';
      verdict.textContent = '请选择评分';
      verdict.style.color = 'var(--text-dim)';
    }
  }

  function choose(value) {
    selected = value;
    preview = value;
    paint(value);
    submitBtn.disabled = false;
  }

  btns.forEach(function (btn) {
    var v = parseInt(btn.getAttribute('data-value'), 10);

    btn.addEventListener('mouseenter', function () {
      preview = v;
      paint(v);
    });

    btn.addEventListener('click', function () {
      choose(v);
    });
  });

  document.getElementById('emojiRow').addEventListener('mouseleave', function () {
    preview = selected;
    paint(selected);
  });

  document.addEventListener('keydown', function (e) {
    if (ratingCard.classList.contains('flipped')) return;

    var digit = e.code.match(/^Digit([1-5])$/);
    var next = 0;

    if (digit) {
      next = parseInt(digit[1], 10);
    } else if (e.code === 'ArrowRight' || e.code === 'ArrowUp') {
      next = Math.min(5, (preview || selected || 0) + 1);
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') {
      next = Math.max(1, (preview || selected || 1) - 1);
    } else if (e.code === 'Enter' && selected > 0 &&
      document.activeElement !== submitBtn) {
      submit();
      return;
    } else {
      return;
    }

    e.preventDefault();
    preview = next;
    choose(next);
  });

  function submit() {
    if (!selected) return;
    var level = LEVELS[selected - 1];
    successTitle.textContent = '感谢你的 ' + selected + ' 星评价！';
    successSub.textContent = level.label;
    ratingCard.classList.add('flipped');
  }

  submitBtn.addEventListener('click', submit);

  againBtn.addEventListener('click', function () {
    ratingCard.classList.remove('flipped');
    selected = 0;
    preview = 0;
    submitBtn.disabled = true;
    paint(0);
  });

  paint(0);
})();

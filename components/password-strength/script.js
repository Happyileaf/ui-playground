(function () {
  const field = document.querySelector('.pwd-field');
  const input = document.getElementById('pwdInput');
  const toggleBtn = document.getElementById('toggleBtn');
  const meter = document.querySelector('.meter');
  const label = document.getElementById('strengthLabel');
  const confirmBtn = document.getElementById('confirmBtn');
  const ruleEls = Array.from(document.querySelectorAll('.rule'));

  const RULES = [
    { key: 'length', test: (v) => v.length >= 8 },
    { key: 'lower', test: (v) => /[a-z]/.test(v) },
    { key: 'upper', test: (v) => /[A-Z]/.test(v) },
    { key: 'number', test: (v) => /\d/.test(v) },
    { key: 'symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const LEVEL_TEXT = ['请输入密码', '弱', '中等', '强', '极强'];

  function evaluate() {
    const value = input.value;
    let score = 0;

    RULES.forEach((rule) => {
      const met = value.length > 0 && rule.test(value);
      const el = ruleEls.find((r) => r.dataset.rule === rule.key);
      el.classList.toggle('is-met', met);
      if (met) score += 1;
    });

    let level = 0;
    if (value.length > 0) {
      if (score <= 2) level = 1;
      else if (score === 3) level = 2;
      else if (score === 4) level = 3;
      else level = 4;
    }

    meter.dataset.level = String(level);
    label.textContent = LEVEL_TEXT[level];
    label.className = `strength-label ${level >= 2 ? 'lv' + level : ''}`;
    confirmBtn.disabled = level < 2;
  }

  input.addEventListener('input', evaluate);

  toggleBtn.addEventListener('click', () => {
    const showing = input.type === 'password';
    input.type = showing ? 'text' : 'password';
    field.classList.toggle('is-visible', showing);
    toggleBtn.setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
    input.focus();
  });

  confirmBtn.addEventListener('click', () => {
    label.textContent = '密码已确认';
    confirmBtn.textContent = '已确认';
    confirmBtn.disabled = true;
  });

  evaluate();
})();

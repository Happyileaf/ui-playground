(function () {
  const form = document.getElementById('wizForm');
  const card = document.getElementById('formCard');
  const panels = Array.from(document.querySelectorAll('.panel'));
  const stepEls = Array.from(document.querySelectorAll('.stepper .step'));
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const successView = document.getElementById('successView');
  const successMsg = document.getElementById('successMsg');
  const restartBtn = document.getElementById('restartBtn');
  const summary = document.getElementById('summary');

  const PLAN_LABELS = { starter: 'Starter · 免费', pro: 'Pro · ¥68/月', team: 'Team · ¥168/月' };
  const ROLE_LABELS = { designer: '设计师', developer: '开发者', founder: '创始人' };

  let current = 0;

  function setError(name, msg) {
    const el = document.getElementById('err-' + name);
    const field = el ? el.closest('.field') : null;
    if (el) el.textContent = msg || '';
    if (field) field.classList.toggle('has-error', Boolean(msg));
  }

  function validateStep(step) {
    let ok = true;
    if (step === 0) {
      const name = form.fullName.value.trim();
      const email = form.email.value.trim();
      if (name.length < 2) {
        setError('fullName', '请输入至少 2 个字符的姓名');
        ok = false;
      } else {
        setError('fullName', '');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', '请输入有效的邮箱地址');
        ok = false;
      } else {
        setError('email', '');
      }
    }
    if (step === 1) {
      if (!form.role.value) {
        setError('role', '请选择你的主要角色');
        ok = false;
      } else {
        setError('role', '');
      }
      const plan = form.querySelector('input[name="plan"]:checked');
      if (!plan) {
        setError('plan', '请选择一个订阅方案');
        ok = false;
      } else {
        setError('plan', '');
      }
    }
    if (step === 2) {
      if (!form.terms.checked) {
        setError('terms', '请先同意服务条款');
        ok = false;
      } else {
        setError('terms', '');
      }
    }
    return ok;
  }

  function renderStep() {
    panels.forEach((p, i) => p.classList.toggle('is-active', i === current));
    stepEls.forEach((s, i) => {
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-done', i < current);
    });
    backBtn.hidden = current === 0;
    nextBtn.textContent = current === panels.length - 1 ? '创建空间' : '继续';
    const focusTarget = panels[current].querySelector('input, select');
    if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
  }

  function buildSummary() {
    const plan = form.querySelector('input[name="plan"]:checked');
    const rows = [
      ['姓名', form.fullName.value.trim()],
      ['邮箱', form.email.value.trim()],
      ['角色', ROLE_LABELS[form.role.value] || ''],
      ['方案', plan ? PLAN_LABELS[plan.value] : '']
    ];
    summary.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  }

  function goNext() {
    if (!validateStep(current)) return;
    if (current < panels.length - 1) {
      current += 1;
      if (current === 2) buildSummary();
      renderStep();
    } else {
      finish();
    }
  }

  function finish() {
    card.hidden = true;
    successView.hidden = false;
    successMsg.textContent = `欢迎，${form.fullName.value.trim()}！确认邮件已发送至 ${form.email.value.trim()}。`;
    successView.querySelector('button').focus();
  }

  nextBtn.addEventListener('click', goNext);

  backBtn.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      renderStep();
    }
  });

  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && current < panels.length - 1) {
      const tag = e.target.tagName;
      if (tag !== 'SELECT' && tag !== 'A') {
        e.preventDefault();
        goNext();
      }
    }
  });

  ['input', 'change'].forEach((evt) => {
    form.addEventListener(evt, (e) => {
      if (e.target.name) setError(e.target.name, '');
    }, true);
  });

  restartBtn.addEventListener('click', () => {
    form.reset();
    current = 0;
    successView.hidden = true;
    card.hidden = false;
    renderStep();
  });

  renderStep();
})();

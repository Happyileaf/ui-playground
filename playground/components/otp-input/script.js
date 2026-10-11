const LENGTH = 6;
const inputsWrap = document.getElementById('otpInputs');
const statusEl = document.getElementById('otpStatus');
const verifyBtn = document.getElementById('verifyBtn');
const card = document.getElementById('otpCard');
const resendBtn = document.getElementById('resendBtn');

const inputs = [];

for (let i = 0; i < LENGTH; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.maxLength = 1;
  input.className = 'otp-box';
  input.setAttribute('aria-label', `第 ${i + 1} 位验证码`);

  input.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    if (value) {
      e.target.classList.add('is-filled');
      if (i < LENGTH - 1) inputs[i + 1].focus();
    } else {
      e.target.classList.remove('is-filled');
    }
    updateState();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (!input.value && i > 0) {
        inputs[i - 1].focus();
        inputs[i - 1].value = '';
        inputs[i - 1].classList.remove('is-filled');
        updateState();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs[i - 1].focus();
    } else if (e.key === 'ArrowRight' && i < LENGTH - 1) {
      inputs[i + 1].focus();
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    fillFrom(text, i);
    updateState();
  });

  input.addEventListener('focus', () => input.select());

  inputsWrap.appendChild(input);
  inputs.push(input);
}

function fillFrom(text, startIndex) {
  for (let j = 0; j < text.length; j++) {
    const idx = startIndex + j;
    if (idx >= LENGTH) break;
    inputs[idx].value = text[j];
    inputs[idx].classList.add('is-filled');
  }
  const lastFilled = Math.min(startIndex + text.length, LENGTH - 1);
  inputs[lastFilled === LENGTH - 1 || startIndex + text.length >= LENGTH ? LENGTH - 1 : lastFilled].focus();
}

function getCode() {
  return inputs.map((i) => i.value).join('');
}

function setStatus(text, type) {
  statusEl.innerHTML = `<span class="status-${type}">${text}</span>`;
}

function updateState() {
  const code = getCode();
  const complete = code.length === LENGTH;
  verifyBtn.disabled = !complete;
  if (complete) {
    setStatus('验证码已完整，点击验证', 'idle');
  } else {
    setStatus('等待输入…', 'idle');
  }
  card.classList.remove('is-success');
}

verifyBtn.addEventListener('click', () => {
  const code = getCode();
  if (code === '123456') {
    setStatus('验证成功！正在跳转…', 'success');
    card.classList.add('is-success');
    verifyBtn.textContent = '验证成功';
  } else {
    setStatus('验证码错误，请重新输入（提示：123456）', 'error');
    inputs.forEach((input) => {
      input.classList.add('shake');
      input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
    });
  }
});

resendBtn.addEventListener('click', () => {
  inputs.forEach((input) => {
    input.value = '';
    input.classList.remove('is-filled');
  });
  inputs[0].focus();
  updateState();

  let seconds = 30;
  resendBtn.disabled = true;
  resendBtn.textContent = `${seconds}s 后可重发`;
  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.textContent = '重新发送';
    } else {
      resendBtn.textContent = `${seconds}s 后可重发`;
    }
  }, 1000);
});

inputs[0].focus();

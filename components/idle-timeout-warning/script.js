(function () {
  var WARNING_GRACE = 15;
  var RING_LENGTH = 2 * Math.PI * 21;

  var state = {
    idleLimit: 20,
    idleElapsed: 0,
    warning: false,
    warningLeft: WARNING_GRACE,
    loggedOut: false
  };

  var lastTick = Date.now();
  var rafId = null;

  var statusLed = document.getElementById('statusLed');
  var statusTitle = document.getElementById('statusTitle');
  var statusSub = document.getElementById('statusSub');
  var countdownFill = document.getElementById('countdownFill');
  var graceText = document.getElementById('graceText');
  var dialogBackdrop = document.getElementById('dialogBackdrop');
  var dialProgress = document.getElementById('dialProgress');
  var dialNum = document.getElementById('dialNum');
  var stayBtn = document.getElementById('stayBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  var loggedScreen = document.getElementById('loggedScreen');
  var loggedReason = document.getElementById('loggedReason');
  var reloginBtn = document.getElementById('reloginBtn');
  var simulateBtn = document.getElementById('simulateBtn');
  var resetBtn = document.getElementById('resetBtn');
  var idleSeg = document.getElementById('idleSeg');

  dialProgress.style.strokeDasharray = String(RING_LENGTH);

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function setIdleStateUI() {
    statusLed.classList.remove('warning', 'danger');
    statusTitle.textContent = '会话进行中';
    statusSub.textContent = '闲置达到 ' + state.idleLimit + ' 秒将弹出预警，预警 ' + WARNING_GRACE + ' 秒后自动登出';
    countdownFill.classList.remove('warning', 'danger');
  }

  function openWarning() {
    state.warning = true;
    state.warningLeft = WARNING_GRACE;
    statusLed.classList.remove('danger');
    statusLed.classList.add('warning');
    statusTitle.textContent = '闲置预警进行中';
    statusSub.textContent = '请点击“继续保持登录”，否则会话即将安全结束';
    countdownFill.classList.add('warning');
    countdownFill.classList.remove('danger');
    dialogBackdrop.hidden = false;
    setTimeout(function () { stayBtn.focus(); }, 60);
  }

  function closeWarning() {
    state.warning = false;
    state.warningLeft = WARNING_GRACE;
    dialogBackdrop.hidden = true;
    setIdleStateUI();
  }

  function renewSession() {
    state.idleElapsed = 0;
    closeWarning();
  }

  function doLogout(reason) {
    state.warning = false;
    state.loggedOut = true;
    dialogBackdrop.hidden = true;
    statusLed.classList.remove('warning');
    statusLed.classList.add('danger');
    countdownFill.classList.remove('warning');
    countdownFill.classList.add('danger');
    loggedReason.textContent = reason;
    loggedScreen.hidden = false;
    reloginBtn.focus();
  }

  function resetDrill() {
    state.idleElapsed = 0;
    state.warning = false;
    state.warningLeft = WARNING_GRACE;
    state.loggedOut = false;
    dialogBackdrop.hidden = true;
    loggedScreen.hidden = false;
    loggedScreen.hidden = true;
    setIdleStateUI();
  }

  function tick() {
    var now = Date.now();
    var delta = (now - lastTick) / 1000;
    lastTick = now;

    if (!state.loggedOut) {
      if (state.warning) {
        state.warningLeft = Math.max(0, state.warningLeft - delta);
        var ratio = clamp(state.warningLeft / WARNING_GRACE, 0, 1);
        dialProgress.style.strokeDashoffset = String(RING_LENGTH * (1 - ratio));
        dialNum.textContent = String(Math.ceil(state.warningLeft));
        graceText.textContent = Math.ceil(state.warningLeft) + 's';
        countdownFill.style.transform = 'scaleX(' + ratio + ')';
        if (state.warningLeft <= 5) {
          dialProgress.classList.add('urgent');
          statusLed.classList.remove('warning');
          statusLed.classList.add('danger');
          countdownFill.classList.remove('warning');
          countdownFill.classList.add('danger');
        }
        if (state.warningLeft <= 0) {
          doLogout('会话因长时间未操作已自动结束，未保存的敏感数据已被清理。');
        }
      } else {
        state.idleElapsed += delta;
        var idleRatio = clamp(state.idleElapsed / state.idleLimit, 0, 1);
        countdownFill.style.transform = 'scaleX(' + (1 - idleRatio) + ')';
        graceText.textContent = Math.max(0, Math.ceil(state.idleLimit - state.idleElapsed)) + 's';
        if (state.idleElapsed >= state.idleLimit) {
          openWarning();
        }
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function markActivity() {
    if (state.loggedOut) return;
    if (state.warning) {
      renewSession();
      return;
    }
    state.idleElapsed = 0;
  }

  var activityEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  activityEvents.forEach(function (evtName) {
    window.addEventListener(evtName, markActivity, { passive: true });
  });

  stayBtn.addEventListener('click', renewSession);
  logoutBtn.addEventListener('click', function () {
    doLogout('你已手动结束当前会话，账户处于安全退出状态。');
  });
  reloginBtn.addEventListener('click', resetDrill);
  simulateBtn.addEventListener('click', function () {
    if (state.loggedOut) resetDrill();
    state.idleElapsed = state.idleLimit;
    openWarning();
  });
  resetBtn.addEventListener('click', resetDrill);

  idleSeg.addEventListener('click', function (e) {
    var btn = e.target.closest('.seg-btn');
    if (!btn) return;
    idleSeg.querySelectorAll('.seg-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    state.idleLimit = Number(btn.dataset.idle);
    state.idleElapsed = 0;
    if (!state.warning) setIdleStateUI();
  });

  document.addEventListener('keydown', function (e) {
    if (state.warning && e.key === 'Escape') {
      e.preventDefault();
      renewSession();
    }
  });

  setIdleStateUI();
  rafId = requestAnimationFrame(tick);
})();

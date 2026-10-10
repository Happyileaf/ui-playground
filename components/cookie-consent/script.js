(function () {
  'use strict';

  var STORAGE_KEY = 'ui-playground-cookie-consent';

  var banner = document.getElementById('consentBanner');
  var acceptBtn = document.getElementById('acceptBtn');
  var rejectBtn = document.getElementById('rejectBtn');
  var manageBtn = document.getElementById('manageBtn');
  var prefDetail = document.getElementById('prefDetail');
  var consentState = document.getElementById('consentState');
  var resetDemo = document.getElementById('resetDemo');
  var toast = document.getElementById('toast');
  var policyLink = document.getElementById('policyLink');

  var prefs = {
    necessary: true,
    preference: false,
    analytics: false,
    marketing: false
  };

  var managing = false;
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2600);
  }

  function saveConsent(choice) {
    var record = {
      ts: new Date().toISOString(),
      choice: choice,
      prefs: prefs
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) { /* private mode: session only */ }
    return record;
  }

  function describe(record) {
    if (record.choice === 'accept-all') return '已接受全部 Cookie';
    if (record.choice === 'reject-all') return '仅启用必要 Cookie';
    var on = Object.keys(record.prefs).filter(function (k) {
      return k !== 'necessary' && record.prefs[k];
    });
    if (!on.length) return '仅启用必要 Cookie';
    return '自定义授权：' + on.join('、');
  }

  function closeBanner() {
    banner.classList.remove('show');
    banner.classList.add('hide');
  }

  function openBanner() {
    banner.classList.remove('hide');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('show');
      });
    });
  }

  function acceptAll() {
    ['preference', 'analytics', 'marketing'].forEach(function (k) { prefs[k] = true; });
    var record = saveConsent('accept-all');
    consentState.textContent = '当前状态：' + describe(record);
    closeBanner();
    showToast('✓ 已保存你的全部授权偏好');
  }

  function rejectAll() {
    ['preference', 'analytics', 'marketing'].forEach(function (k) { prefs[k] = false; });
    syncSwitches();
    var record = saveConsent('reject-all');
    consentState.textContent = '当前状态：' + describe(record);
    closeBanner();
    showToast('已仅启用必要 Cookie，可随时重新设置');
  }

  function saveCustom() {
    var record = saveConsent('custom');
    consentState.textContent = '当前状态：' + describe(record);
    closeBanner();
    showToast('✓ 自定义偏好已保存');
  }

  function syncSwitches() {
    document.querySelectorAll('.switch').forEach(function (sw) {
      var key = sw.getAttribute('data-switch');
      var on = !!prefs[key];
      sw.classList.toggle('on', on);
      if (sw.tagName === 'BUTTON') sw.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function enterManage() {
    managing = true;
    prefDetail.hidden = false;
    manageBtn.textContent = '收起选项';
    rejectBtn.textContent = '保存选择';
    acceptBtn.style.display = 'none';
    syncSwitches();
  }

  function exitManage() {
    managing = false;
    prefDetail.hidden = true;
    manageBtn.textContent = '管理选项';
    rejectBtn.textContent = '仅必要';
    acceptBtn.style.display = '';
  }

  manageBtn.addEventListener('click', function () {
    if (managing) exitManage();
    else enterManage();
  });

  rejectBtn.addEventListener('click', function () {
    if (managing) saveCustom();
    else rejectAll();
  });

  acceptBtn.addEventListener('click', acceptAll);

  document.querySelectorAll('.switch').forEach(function (sw) {
    if (sw.getAttribute('aria-disabled') === 'true') return;
    sw.addEventListener('click', function () {
      var key = sw.getAttribute('data-switch');
      prefs[key] = !prefs[key];
      syncSwitches();
    });
  });

  policyLink.addEventListener('click', function (e) {
    e.preventDefault();
    showToast('这是演示环境，隐私政策页面未接入');
  });

  resetDemo.addEventListener('click', function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    consentState.textContent = '当前状态：尚未授权';
    exitManage();
    prefs.preference = false;
    prefs.analytics = false;
    prefs.marketing = false;
    syncSwitches();
    openBanner();
  });

  function init() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { saved = null; }

    if (saved && saved.prefs) {
      Object.keys(prefs).forEach(function (k) {
        if (typeof saved.prefs[k] === 'boolean') prefs[k] = saved.prefs[k];
      });
      consentState.textContent = '当前状态：' + describe(saved);
    } else {
      openBanner();
    }
  }

  setTimeout(init, 500);
})();

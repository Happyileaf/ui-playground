(function () {
  'use strict';

  var numberInput = document.getElementById('numberInput');
  var nameInput = document.getElementById('nameInput');
  var expiryInput = document.getElementById('expiryInput');
  var cvcInput = document.getElementById('cvcInput');
  var form = document.getElementById('paymentForm');
  var formSuccess = document.getElementById('formSuccess');

  var card3d = document.getElementById('card3d');
  var previewNumber = document.getElementById('previewNumber');
  var previewName = document.getElementById('previewName');
  var previewExpiry = document.getElementById('previewExpiry');
  var previewCvc = document.getElementById('previewCvc');
  var cardBrand = document.getElementById('cardBrand');

  var errors = {
    number: document.getElementById('numberError'),
    name: document.getElementById('nameError'),
    expiry: document.getElementById('expiryError'),
    cvc: document.getElementById('cvcError')
  };

  var BRANDS = [
    { id: 'UNIONPAY', test: /^62/ },
    { id: 'VISA', test: /^4/ },
    { id: 'MASTERCARD', test: /^(5[1-5]|2[2-7])/ },
    { id: 'AMEX', test: /^3[47]/ },
    { id: 'DISCOVER', test: /^(6011|65|64[4-9])/ },
    { id: 'JCB', test: /^35/ }
  ];

  function digits(value) {
    return value.replace(/\D/g, '');
  }

  function setFieldError(input, errorEl, message) {
    var field = input.closest('.field');
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  function detectBrand(d) {
    for (var i = 0; i < BRANDS.length; i++) {
      if (BRANDS[i].test.test(d)) return BRANDS[i].id;
    }
    return 'CARD';
  }

  function formatNumber(d) {
    var brand = detectBrand(d);
    var groupSize = brand === 'AMEX' ? [4, 6, 5] : [4, 4, 4, 4];
    var parts = [];
    var cursor = 0;
    for (var i = 0; i < groupSize.length && cursor < d.length; i++) {
      parts.push(d.slice(cursor, cursor + groupSize[i]));
      cursor += groupSize[i];
    }
    return parts.join(' ');
  }

  function renderNumber(d) {
    var brand = detectBrand(d);
    cardBrand.textContent = brand;
    numberInput.maxLength = brand === 'AMEX' ? 17 : 19;

    var groupSize = brand === 'AMEX' ? [4, 6, 5] : [4, 4, 4, 4];
    var groups = [];
    var cursor = 0;
    for (var i = 0; i < groupSize.length; i++) {
      var size = groupSize[i];
      var piece = d.slice(cursor, cursor + size);
      var padded = (piece + '####'.slice(piece.length)).slice(0, size);
      groups.push(padded);
      cursor += size;
    }

    if (d.length > 4) {
      groups[0] = '••••';
    }

    previewNumber.innerHTML = groups
      .map(function (g) { return g.replace(/ /g, '&nbsp;'); })
      .join('&nbsp;&nbsp;');
  }

  function luhnValid(d) {
    if (d.length < 13) return false;
    var sum = 0;
    var shouldDouble = false;
    for (var i = d.length - 1; i >= 0; i--) {
      var n = parseInt(d.charAt(i), 10);
      if (shouldDouble) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  numberInput.addEventListener('input', function () {
    var d = digits(numberInput.value).slice(0, 16);
    var formatted = formatNumber(d);
    numberInput.value = formatted;
    renderNumber(d);
    formSuccess.hidden = true;
    setFieldError(numberInput, errors.number, '');
  });

  numberInput.addEventListener('blur', function () {
    var d = digits(numberInput.value);
    if (d.length === 0) {
      setFieldError(numberInput, errors.number, '请输入卡号');
    } else if (!luhnValid(d)) {
      setFieldError(numberInput, errors.number, '卡号未通过 Luhn 校验，请检查');
    }
  });

  nameInput.addEventListener('input', function () {
    var cleaned = nameInput.value.replace(/[^a-zA-Z\s.\-']/g, '').toUpperCase();
    nameInput.value = cleaned;
    previewName.textContent = cleaned.trim() ? cleaned.trim() : 'YOUR NAME';
    formSuccess.hidden = true;
    setFieldError(nameInput, errors.name, '');
  });

  nameInput.addEventListener('blur', function () {
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, errors.name, '请输入持卡人姓名');
    }
  });

  expiryInput.addEventListener('input', function () {
    var d = digits(expiryInput.value).slice(0, 4);
    if (d.length >= 3) {
      d = d.slice(0, 2) + '/' + d.slice(2);
    }
    expiryInput.value = d;
    if (d.length === 0) {
      previewExpiry.textContent = 'MM / YY';
    } else {
      var mm = (d.slice(0, 2) + 'MM').slice(0, 2);
      var yy = (d.slice(3) + 'YY').slice(0, 2);
      previewExpiry.textContent = mm + ' / ' + yy;
    }
    formSuccess.hidden = true;
    setFieldError(expiryInput, errors.expiry, '');
  });

  expiryInput.addEventListener('blur', function () {
    var d = digits(expiryInput.value);
    if (d.length !== 4) {
      setFieldError(expiryInput, errors.expiry, '请输入完整有效期');
      return;
    }
    var month = parseInt(d.slice(0, 2), 10);
    if (month < 1 || month > 12) {
      setFieldError(expiryInput, errors.expiry, '月份应在 01–12 之间');
      return;
    }
    var year = 2000 + parseInt(d.slice(2), 10);
    var now = new Date();
    var endOfMonth = new Date(year, month, 0, 23, 59, 59);
    if (endOfMonth.getTime() < now.getTime()) {
      setFieldError(expiryInput, errors.expiry, '卡片已过期');
    }
  });

  cvcInput.addEventListener('focus', function () {
    card3d.classList.add('is-flipped');
  });

  cvcInput.addEventListener('blur', function () {
    card3d.classList.remove('is-flipped');
  });

  cvcInput.addEventListener('input', function () {
    var d = digits(cvcInput.value).slice(0, 3);
    cvcInput.value = d;
    previewCvc.textContent = d + '###'.slice(d.length);
    formSuccess.hidden = true;
    setFieldError(cvcInput, errors.cvc, '');
  });

  cvcInput.addEventListener('blur', function () {
    if (digits(cvcInput.value).length !== 3) {
      setFieldError(cvcInput, errors.cvc, '请输入 3 位安全码');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var checks = [
      [numberInput, errors.number, luhnValid(digits(numberInput.value)) ? '' : '卡号无效或未通过校验'],
      [nameInput, errors.name, nameInput.value.trim() ? '' : '请输入持卡人姓名'],
      [expiryInput, errors.expiry, validateExpiry()],
      [cvcInput, errors.cvc, digits(cvcInput.value).length === 3 ? '' : '请输入 3 位安全码']
    ];
    var valid = true;
    checks.forEach(function (item) {
      if (item[2]) valid = false;
      setFieldError(item[0], item[1], item[2]);
    });
    if (valid) {
      formSuccess.hidden = false;
    }
  });

  function validateExpiry() {
    var d = digits(expiryInput.value);
    if (d.length !== 4) return '请输入完整有效期';
    var month = parseInt(d.slice(0, 2), 10);
    if (month < 1 || month > 12) return '月份应在 01–12 之间';
    var year = 2000 + parseInt(d.slice(2), 10);
    var endOfMonth = new Date(year, month, 0, 23, 59, 59);
    if (endOfMonth.getTime() < Date.now()) return '卡片已过期';
    return '';
  }

  renderNumber('');
})();

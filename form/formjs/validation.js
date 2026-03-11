// validation.js

/**
 * 驗證：如果選擇郵寄，必須填寫地址
 * @param {string} optMailSelector - 郵寄選項的 selector，預設 '#optMail'
 * @param {string} addressSelector - 地址輸入框的 selector，預設 '#address'
 * @returns {boolean} 通過驗證返回 true，否則返回 false
 */
export function validateAddress(
  optMailSelector = '#optMail',
  addressSelector = '#address'
) {
  const mailOpt   = document.querySelector(optMailSelector);
  const addressEl = document.querySelector(addressSelector);
  if (mailOpt.checked && !addressEl.value.trim()) {
    addressEl.classList.add('border-danger');
    addressEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    addressEl.focus();
    Swal.fire({
      icon: 'warning',
      text: '請填寫郵寄地址'
    });
    return false;
  }
  addressEl.classList.remove('border-danger');
  return true;
}

/**
 * 驗證：必填欄位（公司、職工編號、姓名、電話）是否都有填
 * @param {string[]} requiredSelectors - 一組必填欄位的 selector，預設 ['#company','#staffnum','#name','#phone']
 * @returns {boolean} 通過驗證返回 true，否則返回 false
 */
export function validateRequired(
  requiredSelectors = ['#company', '#staffnum', '#name', '#phone']
) {
  for (const sel of requiredSelectors) {
    const el = document.querySelector(sel);
    if (!el || !el.value.trim()) {
      if (el) {
        el.classList.add('border-danger');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      Swal.fire({
        icon: 'warning',
        text: '請完整填寫必填欄位'
      });
      return false;
    }
    el.classList.remove('border-danger');
  }
  return true;
}

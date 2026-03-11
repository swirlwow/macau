// ui.js

/**
 * 切換按鈕 loading 狀態
 * @param {string[]} buttonSelectors - 按鈕的 selector 陣列，預設 ['#btnSubmit','#btnSubmitMobile']
 * @param {boolean} isLoading - 是否顯示 loading，預設 true
 */
export function setLoading(
  buttonSelectors = ['#btnSubmit', '#btnSubmitMobile'],
  isLoading = true
) {
  buttonSelectors.forEach(sel => {
    const btn = document.querySelector(sel);
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? '<span class="spinner-border spinner-border-sm"></span> 送出中…'
      : '送出需求';
  });
}

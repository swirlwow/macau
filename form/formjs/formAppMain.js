// formAppMain.js
import { validateAddress, validateRequired } from './validation.js';
import { collectOrderData } from './orderData.js';
import { setLoading } from './ui.js';
import { submitOrder } from './submit.js';

const EXEC_URL = 'https://script.google.com/macros/s/AKfycbzk92cEt6zvcfLeymJ_4TzqAI8UAM4nt43g5wvaw6WcpWffP1xNsZJBoHUk8SW1Mrjn/exec';

/**
 * 處理票券表單提交
 */
async function handleSubmit(evt) {
  evt.preventDefault();
  if (!validateAddress() || !validateRequired()) return;
  const orderData = collectOrderData();
  if (!orderData) return;

  const form = document.getElementById('orderForm');
  const now = new Date();
  const data = {
    company: form.company.value.trim(),
    staffnum: form.staffnum.value.trim(),
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    place: form.place.value.trim(),
    address: form.address.value.trim(),
    time: `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('zh-TW', { hour12: false })}`,
    order: orderData.orderList.join('\n'),
    price: orderData.price
  };

  setLoading(['#btnSubmit', '#btnSubmitMobile'], true);
  try {
    await submitOrder(EXEC_URL, data);
    await Swal.fire({
      icon: 'success',
      title: '送出成功',
      text: '您已成功送出需求，請靜待客服人員聯繫通知。'
    });
    location.reload();
  } catch (err) {
    console.error('Submit error:', err);
    Swal.fire({
      icon: 'error',
      title: '提交失敗',
      text: '系統忙線，請稍後重新輸入'
    });
    setLoading(['#btnSubmit', '#btnSubmitMobile'], false);
  }
}

/**
 * 切換 Tab 後重置未激活的表單
 */
function initTabReset() {
  const forms = {
    ticket: document.getElementById('orderForm'),
    local: document.getElementById('localForm'),
    oversea: document.getElementById('overseaForm')
  };
  const tabEl = document.getElementById('myTab');
  if (!tabEl) return;
  tabEl.addEventListener('shown.bs.tab', ev => {
    const href = ev.target.getAttribute('href'); // e.g. '#local'
    const key = href ? href.slice(1) : '';
    Object.entries(forms).forEach(([k, f]) => {
      if (f && k !== key) {
        f.reset();
        if (k === 'ticket') {
          document.querySelectorAll('.sub-total').forEach(td => td.textContent = '');
          const totalEl = document.getElementById('grandTotal');
          if (totalEl) totalEl.textContent = '0';
        }
      }
    });
  });
}

/**
 * 本地與海外旅遊表單提交後自動清空
 */
function initTourFormReset() {
  const localForm = document.getElementById('localForm');
  const overseaForm = document.getElementById('overseaForm');

  if (localForm) {
    localForm.addEventListener('submit', () => {
      setTimeout(() => localForm.reset(), 0);
    });
  }
  if (overseaForm) {
    overseaForm.addEventListener('submit', () => {
      setTimeout(() => overseaForm.reset(), 0);
    });
  }
}

/**
 * 初始化浮動欄位同步與按鈕
 */
function initFloatingBar() {
  const bar = document.getElementById('floatingBar');
  const totalFixed = document.getElementById('grandTotal');
  const form = document.getElementById('orderForm');
  if (!bar || !totalFixed || !form) return;

  const origCalc = window.calc || (() => { });
  window.calc = () => {
    origCalc();
    totalFixed.textContent = document.getElementById('grandTotal').textContent;
  };
  window.calc();

  // 改用 button 並 preventDefault 避免雙重提交
  const btnMob = document.getElementById('btnSubmitMobile');
  if (btnMob) {
    btnMob.type = 'button';
    btnMob.addEventListener('click', e => {
      e.preventDefault();
      form.requestSubmit();
    });
  }

  const resetBtn = bar.querySelector('button[type="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      document.querySelectorAll('.sub-total').forEach(td => td.textContent = '');
      window.calc();
    });
  }

  const sentinel = document.querySelector('#orderForm .text-center.mt-4');
  if (sentinel) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        bar.style.opacity = e.isIntersecting ? '0' : '1';
        bar.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.1 }).observe(sentinel);
  }

  document.body.classList.add('has-bottom-space');
}

/**
 * 入口：DOMContentLoaded 後執行
 */
export function initApp() {
  const form = document.getElementById('orderForm');
  if (form) form.addEventListener('submit', handleSubmit);
  initTabReset();
  initTourFormReset();
  initFloatingBar();
}

document.addEventListener('DOMContentLoaded', initApp);

const ENABLE_FLASH_STORE = false;  // 改成 true 就開啟「快閃店」選項

document.addEventListener('DOMContentLoaded', () => {
  const flashGroup = document
    .querySelector('#optPick2')
    ?.closest('.inputGroup1');

  if (flashGroup && !ENABLE_FLASH_STORE) {
    flashGroup.remove();
  }
});

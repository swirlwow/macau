import { loadTicketData } from './dataLoader.js';
import { initTicketSections, renderTickets } from './ticketTable.js';
import { initPriceCalculation } from './priceCalc.js';
import { initTooltips } from './tooltip.js';

const catMap = {
  classic:   '經典美食餐券',
  theme:     '全台各大主題樂園',
  entertain: '休閒娛樂票券'
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ 生成分類區塊
  initTicketSections(catMap, '#ticketArea');

  try {
    // 2️⃣ 載入並渲染票券
    const tickets = await loadTicketData();
    renderTickets(tickets, '#ticketArea');

    // 3️⃣ 初始化金額計算 & Tooltip
    initPriceCalculation('#ticketArea', '#grandTotal');
    initTooltips();

    // 4️⃣ 同步隱藏的 place 欄位
    const mail = document.getElementById('optMail');
    const options = document.querySelectorAll('input.pick-opt');
    const placeInput = document.getElementById('place');
    // 預設自取
    const pick1 = document.getElementById('optPick1');
    if (pick1 && pick1.checked) {
      placeInput.value = pick1.value;
    }
    // 當選項改變時更新 place
    options.forEach(opt =>
      opt.addEventListener('change', () => {
        placeInput.value = mail.checked
          ? mail.value
          : (document.querySelector('input[name="pickup"]:checked')?.value || '');
      })
    );

    // 5️⃣ 其他行為：TOP 平滑滾動
    document.getElementById('gotop')
      .addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

    // 6️⃣ 重置小計與總計
    document.getElementById('orderForm')
      .addEventListener('reset', () => {
        document.querySelectorAll('.sub-total').forEach(td => td.textContent = '');
        document.getElementById('grandTotal').textContent = '0';
        const d = document.getElementById('grandTotalDesktop');
        if (d) d.textContent = '0';
      });

    // 7️⃣ 快閃店 Modal
    const btnGuide = document.getElementById('openGuide');
    if (btnGuide) {
      btnGuide.addEventListener('click', () =>
        new bootstrap.Modal(document.getElementById('popupGuide')).show()
      );
    }

  } catch (err) {
    console.error('票券系統初始化失敗：', err);
  }
});

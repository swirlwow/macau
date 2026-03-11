// 负责监听 .qty 变化，更新小计 & 总计
export function initPriceCalculation(containerSelector, totalSelector) {
  const container = document.querySelector(containerSelector);
  const totalEl  = document.querySelector(totalSelector);
  if (!container || !totalEl) return;

  const mail = document.getElementById('optMail');

  const updateRow = input => {
    const qty = Math.min(Number(input.value) || 0, 99);
    input.value = qty;
    const price = Number(input.dataset.price);
    input.closest('tr').querySelector('.sub-total').textContent =
      qty ? (qty * price).toLocaleString() : '';
  };

  const calcTotal = () => {
    let tot = 0;
    container.querySelectorAll('.sub-total').forEach(td => {
      tot += Number(td.textContent.replace(/,/g, '')) || 0;
    });
    if (mail.checked) tot += Number(mail.dataset.price);
    totalEl.textContent = tot;
    const deskEl = document.getElementById('grandTotalDesktop');
    if (deskEl) deskEl.textContent = tot;
  };

  container.addEventListener('input', e => {
    if (!e.target.matches('.qty')) return;
    updateRow(e.target);
    calcTotal();
  });

  // 切換領取方式也重新計算 (for 同步 place hidden field)
  document.querySelectorAll('input.pick-opt').forEach(inp => {
    inp.addEventListener('change', calcTotal);
  });

  // 初始計算
  calcTotal();
}

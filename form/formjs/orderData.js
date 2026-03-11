// orderData.js
export function collectOrderData({
  qtySelector        = '.qty',
  mailOptionSelector = '#optMail',
  placeSelector      = '#place',
  ticketAreaSelector = '#ticketArea'
} = {}) {
  const ticketArea = document.querySelector(ticketAreaSelector);
  const skuEls     = Array.from(document.querySelectorAll(qtySelector));
  const orderList  = [];
  let price        = 0;

  skuEls.forEach(inp => {
    const q = Math.min(Number(inp.value) || 0, 99);
    if (q > 0) {
      orderList.push(`${inp.dataset.name} - ${q}張`);
      price += q * Number(inp.dataset.price);
    }
  });

 if (!orderList.length) {
    Swal.fire({
      icon: 'warning',
      text: '請選擇票券',
      didClose: () => {
        const classicSection = document.querySelector(
          '#ticketArea section[data-cat="classic"]'
        ); // 經典美食餐券分類:contentReference[oaicite:0]{index=0}
        if (classicSection) {
          const headerOffset = 70; // 固定 Navbar 高度
          const elementY = classicSection.getBoundingClientRect().top + window.pageYOffset;
          const scrollToY = elementY - headerOffset;
          window.scrollTo({ top: scrollToY, behavior: 'smooth' });
        } else {
          // fallback：整個票券區塊
          ticketArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
    return null;
  }

  const mailOpt       = document.querySelector(mailOptionSelector);
  if (mailOpt.checked) {
    orderList.push(`${mailOpt.dataset.name} - 1張`);
    price += Number(mailOpt.dataset.price);
  }

  const pickupChecked = !!document.querySelector('input[name="pickup"]:checked');
  // 未選擇領取方式時，同樣點 OK 後再滾到領取標題
  if (!mailOpt.checked && !pickupChecked) {
    Swal.fire({ icon: 'warning', text: '請選擇領取方式' })
      .then(() => {
        document.querySelector('h6').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    return null;
  }

  // 同步隱藏 place 欄位
  const placeInput = document.querySelector(placeSelector);
  placeInput.value = mailOpt.checked
    ? mailOpt.value
    : document.querySelector('input[name="pickup"]:checked').value;

  return { orderList, price };
}

/* Query.js – 完整查詢流程 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const URL = 'https://script.google.com/macros/s/AKfycbzk92cEt6zvcfLeymJ_4TzqAI8UAM4nt43g5wvaw6WcpWffP1xNsZJBoHUk8SW1Mrjn/exec';

$('#send').addEventListener('click', async () => {
  // 1. 欄位驗證
  const nameEl = $('#name');
  const phoneEl = $('#phone');
  let valid = true;

  [nameEl, phoneEl].forEach(el => {
    if (!el.value.trim()) {
      el.classList.add('border-danger');
      if (valid) el.focus();
      valid = false;
    } else {
      el.classList.remove('border-danger');
    }
  });
  if (!valid) return;

  // 2. 送出查詢前：切換按鈕狀態 + 顯示 loading 視窗
  toggleBtn(true);
  Swal.fire({
    title: '查詢中，請稍候',
    text: '系統正在幫您找訂單，可能需要幾秒鐘時間',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // 3. 組請求 body
    const body = new URLSearchParams({
      action: 'query',
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim()
    });

    // 4. 發 Fetch POST
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // 5. 解析 JSON
    const json = await res.json();

    // 6. 檢查後端 status
    if (json.status !== 'success') {
      Swal.fire({
        icon: 'error',
        text: '查詢失敗：' + (json.message || '未知錯誤')
      });
      return;
    }

    // 7. 正常取得 data 陣列
    handleData(json.data);

    // 8. 清空輸入
    nameEl.value = '';
    phoneEl.value = '';

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      text: '請求錯誤，請稍後再試'
    });
  } finally {
    // 9. 關閉 loading + 還原按鈕
    Swal.close();
    toggleBtn(false);
  }
});


/* 工具：按鈕 loading 狀態 */
function toggleBtn(isLoading) {
  const btn = $('#send');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? '查詢中…' : '送出查詢';
}

/* 處理 data 陣列，原有邏輯不變 */
function handleData(rows) {
  // rows 是 [ { data: [...], index: X }, ... ]
  rows.sort((a, b) => {
    const tA = new Date(a.data[6]);
    const tB = new Date(b.data[6]);
    if (isNaN(tA)) return 1;
    if (isNaN(tB)) return -1;
    return tB - tA;
  });

  const rowsHtml = rows.map(({ data }) => {
    const [, , , , , , time, item, price, , status] = data;
    const itemsHtml = item
      .split('張')
      .map((s, i, arr) =>
        `<div class="text-start">${s}${i < arr.length - 1 ? '張' : ''}</div>`
      )
      .join('');

    const timeText = new Date(time).toLocaleString('zh-TW', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: true
    });

    return `
      <tr>
        <td class="text-center">${timeText}</td>
        <td class="text-left">${itemsHtml}</td>
        <td class="text-center">${price}</td>
        <td class="text-center status">${convertStatus(status)}</td>
      </tr>`;
  }).join('');

  const table      = document.querySelector('.table-striped');
  const emptyState = document.getElementById('emptyState');
  const tbody = $('#dataView');

  if (rowsHtml) {
    tbody.innerHTML = rowsHtml;
    table.style.display = 'table';
    emptyState.classList.add('d-none');
  } else {
    tbody.innerHTML = '';
    table.style.display = 'none';
    emptyState.classList.remove('d-none');
  }
}

/* 狀態碼轉換 */
function convertStatus(status) {
  const s = String(status).trim();
  switch (s) {
    case '': return '處理中';
    case '1': return '已打包';
    case '2': return '已領取/已郵寄';
    case '3': return '已取消';
    default: return s;
  }
}
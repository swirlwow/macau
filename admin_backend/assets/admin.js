const STATUS_OPTIONS = ['處理中','已打包','已郵寄','已領取','已取消'];
let productOptions = [];
let currentOrder = null;
let dirtyWarnings = [];

async function apiGet(url){
  const res = await fetch(url, { credentials:'same-origin' });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`API 回應不是 JSON：${text.substring(0, 300)}`);
  }

  if (json.status !== 'success') {
    throw new Error(json.message || 'API失敗');
  }

  return json.data;
}

async function apiPost(url, data){
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`API 回應不是 JSON：${text.substring(0, 300)}`);
  }

  if (json.status !== 'success') {
    throw new Error(json.message || 'API失敗');
  }

  return json;
}

function esc(s = ''){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}

function money(v){
  const n = Number(v || 0);
  return n.toLocaleString('zh-TW');
}

function buildStatusSelect(value = '處理中', cls = 'js-status'){
  return `<select class="${cls}">${STATUS_OPTIONS.map(x =>
    `<option value="${x}" ${x === value ? 'selected' : ''}>${x}</option>`
  ).join('')}</select>`;
}

function setTableMessage(message){
  const tbody = document.getElementById('orderTbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="empty">${esc(message)}</td></tr>`;
}

function openModal(){
  document.getElementById('detailModal').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal(){
  document.getElementById('detailModal').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function bindModalUi(){
  const closeBtn = document.getElementById('detailCloseBtn');
  const backdrop = document.getElementById('detailBackdrop');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

async function loadProducts(){
  const rows = await apiGet('api/product_list.php');
  productOptions = rows || [];
  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = `商品主檔 ${productOptions.length} 筆`;
}

async function loadOrders(){
  setTableMessage('載入中...');
  const q = document.getElementById('searchBox').value.trim();
  const status = document.getElementById('statusFilter').value;
  const rows = await apiGet(`api/order_list.php?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`);
  renderOrderTable(rows);
}

function renderOrderTable(rows){
  const tbody = document.getElementById('orderTbody');

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">目前沒有資料</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const frontNoteText = String(r.frontNote == null ? '' : r.frontNote).trim();
    const rowStatus = String(r.statusText || '處理中').trim();

    return `
      <tr 
        data-order-id="${esc(r.orderId)}"
        class="status-${esc(rowStatus || '處理中')}"
      >
        <td>
          <a href="#" class="link-order js-open-order">${esc(r.orderId)}</a>
        </td>

        <td>
          <div class="company-place-stack">
            <input class="js-main company" value="${esc(r.company || '')}" placeholder="公司">
            <input class="js-main place" value="${esc(r.place || '')}" placeholder="領取地點">
          </div>
        </td>

        <td>
          <div class="contact-stack">
            <input class="js-main name" value="${esc(r.name || '')}" placeholder="姓名">
            <input class="js-main phone" value="${esc(r.phone || '')}" placeholder="電話">
          </div>
        </td>

        <td>
          <div class="time-text">${esc(r.time || '')}</div>
        </td>

        <td class="ticket-cell">
          <div class="ticket-main">${esc(r.tickets || '')}</div>
          <textarea 
            class="js-main frontNote front-note-box"
            placeholder="地址 / 前台備註"
          >${esc(frontNoteText)}</textarea>
        </td>

        <td class="actions-cell">
          <div class="actions-stack">
            <button class="btn btn-primary js-save-row">儲存</button>
            <button class="btn btn-light js-open-order">詳細</button>
          </div>
        </td>

        <td class="amount-cell" style="white-space:nowrap;text-align:right">${money(r.amount)}</td>

        <td>
          <div class="status-track-stack">
            ${buildStatusSelect(r.statusText || '處理中')}
            <input class="js-main trackingNo" value="${esc(r.trackingNo || '')}" placeholder="郵件號碼">
          </div>
        </td>

        <td>
          <textarea class="js-main internalNote note-box" placeholder="備註">${esc(r.internalNote || '')}</textarea>
        </td>
      </tr>
    `;
  }).join('');
}

async function openOrder(orderId){
  const data = await apiGet(`api/order_get.php?order_id=${encodeURIComponent(orderId)}`);
  currentOrder = data;
  dirtyWarnings = [];
  renderModal();
  openModal();
}

function renderModal(){
  const box = document.getElementById('drawerBody');

  if (!currentOrder) {
    box.innerHTML = `<div class="empty">請先點左側訂編開啟詳細資料</div>`;
    return;
  }

  const o = currentOrder.order;
  const items = currentOrder.items || [];

  box.innerHTML = `
    <div class="detail-meta">
      <div class="label">訂編</div>
      <div><strong>${esc(o.orderId)}</strong></div>
    </div>
    <div class="detail-meta">
      <div class="label">公司 / 姓名</div>
      <div>${esc(o.company || '')} / ${esc(o.name || '')}</div>
    </div>
    <div class="detail-meta">
      <div class="label">領取地點 / 電話</div>
      <div>${esc(o.place || '')} / ${esc(o.phone || '')}</div>
    </div>
    <div class="detail-meta">
      <div class="label">下單時間</div>
      <div>${esc(o.time || '')}</div>
    </div>
    <div class="detail-meta">
      <div class="label">地址/前台備註</div>
      <div>${esc(o.frontNote || '')}</div>
    </div>

    <div class="section-title">票券明細</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:44px">#</th>
          <th>商品</th>
          <th style="width:90px">數量</th>
          <th style="width:110px">單價</th>
          <th style="width:110px">成本</th>
          <th style="width:90px">扣庫</th>
          <th style="width:90px">小計</th>
          <th style="width:70px">刪除</th>
        </tr>
      </thead>
      <tbody id="detailItemsTbody">
        ${items.map((it, idx) => renderItemRow(it, idx + 1)).join('')}
      </tbody>
    </table>

    <div class="right-actions">
      <button class="btn btn-light" id="addItemBtn">新增商品</button>
      <button class="btn btn-secondary" id="previewPrintBtn">列印訂單</button>
      <button class="btn btn-danger" id="cancelOrderBtn">取消訂單</button>
      <button class="btn btn-primary" id="saveDetailBtn">儲存票券明細</button>
    </div>

    <div id="warningBox"></div>
    <div class="summary-box">
      <div>票券摘要與總金額會於儲存後自動重算</div>
      <div>總金額：<strong id="detailTotal">${money(calcDetailTotal())}</strong></div>
    </div>
  `;

  box.querySelectorAll('.item-row input, .item-row select').forEach(el => {
    el.addEventListener('input', onItemEdit);
    el.addEventListener('change', onItemEdit);
  });

  document.getElementById('addItemBtn').addEventListener('click', addItemRow);
  document.getElementById('saveDetailBtn').addEventListener('click', saveDetail);
  document.getElementById('cancelOrderBtn').addEventListener('click', cancelOrder);
  document.getElementById('previewPrintBtn').addEventListener('click', previewPrint);

  renderWarnings();
}

function renderItemRow(it = {}, lineNo = 1){
  const options = productOptions.map(p =>
    `<option value="${esc(p.productId)}" ${String(p.productId) === String(it.productId || '') ? 'selected' : ''}>${esc(p.productName)}</option>`
  ).join('');

  return `
    <tr class="item-row">
      <td class="txt">${lineNo}</td>
      <td>
        <select class="item-product">
          <option value="">請選商品</option>
          ${options}
        </select>
      </td>
      <td><input class="item-qty" type="number" min="0" value="${esc(it.qty ?? 1)}"></td>
      <td><input class="item-unitPrice" type="number" min="0" value="${esc(it.unitPrice ?? 0)}"></td>
      <td><input class="item-unitCost" type="number" min="0" value="${esc(it.unitCost ?? 0)}"></td>
      <td>
        <select class="item-needStock">
          <option value="Y" ${(it.needStock || 'N') === 'Y' ? 'selected' : ''}>Y</option>
          <option value="N" ${(it.needStock || 'N') === 'N' ? 'selected' : ''}>N</option>
        </select>
      </td>
      <td class="txt item-subtotal">${money((Number(it.qty || 0) * Number(it.unitPrice || 0)))}</td>
      <td><button type="button" class="btn btn-light item-delete">刪</button></td>
    </tr>
  `;
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('item-delete')) {
    const row = e.target.closest('.item-row');
    if (row) {
      row.remove();
      document.querySelectorAll('#detailItemsTbody .item-row').forEach((r, i) => {
        r.firstElementChild.textContent = i + 1;
      });
      const totalEl = document.getElementById('detailTotal');
      if (totalEl) totalEl.textContent = money(calcDetailTotal());
      computeWarnings();
    }
  }
});

function bindRowActions(){
  document.getElementById('orderTbody').addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-order-id]');
    if (!tr) return;
    const orderId = tr.dataset.orderId;

    if (e.target.classList.contains('js-open-order')) {
      e.preventDefault();
      await openOrder(orderId);
      return;
    }

    if (e.target.classList.contains('js-save-row')) {
      const saveBtn = e.target;
      const originalText = saveBtn.textContent;

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = '儲存中...';

        const data = await apiGet(`api/order_get.php?order_id=${encodeURIComponent(orderId)}`);
        const order = data.order;

        order.company = tr.querySelector('.company').value.trim();
        order.place = tr.querySelector('.place').value.trim();
        order.name = tr.querySelector('.name').value.trim();
        order.phone = tr.querySelector('.phone').value.trim();
        order.frontNote = tr.querySelector('.frontNote').value.trim();
        order.note = order.frontNote;
        order.trackingNo = tr.querySelector('.trackingNo').value.trim();
        order.internalNote = tr.querySelector('.internalNote').value.trim();
        order.statusText = tr.querySelector('.js-status').value;
        order.operator = 'PHP後台';

        const res = await apiPost('api/order_save.php', {
          order,
          items: data.items
        });

        tr.className = `status-${order.statusText}`;

        const frontNoteEl = tr.querySelector('.frontNote');
        if (frontNoteEl) frontNoteEl.value = order.frontNote || '';

        const trackingEl = tr.querySelector('.trackingNo');
        if (trackingEl) trackingEl.value = order.trackingNo || '';

        const internalNoteEl = tr.querySelector('.internalNote');
        if (internalNoteEl) internalNoteEl.value = order.internalNote || '';

        if (currentOrder && String(currentOrder.order.orderId) === String(orderId)) {
          currentOrder.order.company = order.company;
          currentOrder.order.place = order.place;
          currentOrder.order.name = order.name;
          currentOrder.order.phone = order.phone;
          currentOrder.order.frontNote = order.frontNote || '';
          currentOrder.order.trackingNo = order.trackingNo || '';
          currentOrder.order.internalNote = order.internalNote || '';
          currentOrder.order.statusText = order.statusText || '處理中';
        }

        alert(res.warnings && res.warnings.length
          ? `已儲存\n${res.warnings.join('\n')}`
          : '已儲存'
        );

      } catch (err) {
        alert('儲存失敗：' + err.message);
        console.error(err);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
      }
    }
  });
}

function onItemEdit(e){
  const row = e.target.closest('.item-row');
  if (!row) return;

  const productId = row.querySelector('.item-product').value;
  const product = productOptions.find(p => String(p.productId) === String(productId));

  if (product) {
    if (!row.dataset.touchedPrice) row.querySelector('.item-unitPrice').value = Number(product.salePrice || 0);
    if (!row.dataset.touchedCost) row.querySelector('.item-unitCost').value = Number(product.costPrice || 0);
    row.querySelector('.item-needStock').value = product.needStock || 'N';
  }

  if (e.target.classList.contains('item-unitPrice')) row.dataset.touchedPrice = '1';
  if (e.target.classList.contains('item-unitCost')) row.dataset.touchedCost = '1';

  const qty = Number(row.querySelector('.item-qty').value || 0);
  const unitPrice = Number(row.querySelector('.item-unitPrice').value || 0);
  row.querySelector('.item-subtotal').textContent = money(qty * unitPrice);

  const totalEl = document.getElementById('detailTotal');
  if (totalEl) totalEl.textContent = money(calcDetailTotal());

  computeWarnings();
}

function calcDetailTotal(){
  let total = 0;
  document.querySelectorAll('#detailItemsTbody .item-row').forEach(row => {
    const qty = Number(row.querySelector('.item-qty').value || 0);
    const price = Number(row.querySelector('.item-unitPrice').value || 0);
    total += qty * price;
  });
  return total;
}

function addItemRow(){
  const tbody = document.getElementById('detailItemsTbody');
  tbody.insertAdjacentHTML('beforeend', renderItemRow({}, tbody.querySelectorAll('.item-row').length + 1));

  tbody.querySelectorAll('.item-row').forEach((row, idx) => {
    row.firstElementChild.textContent = idx + 1;
    row.querySelectorAll('input,select').forEach(el => {
      el.addEventListener('input', onItemEdit);
      el.addEventListener('change', onItemEdit);
    });
  });
}

function collectDrawerPayload(){
  const baseOrder = currentOrder.order;
  const selectorSafe = String(baseOrder.orderId).replace(/"/g, '\\"');
  const mainRow = document.querySelector(`tr[data-order-id="${selectorSafe}"]`);

  const order = {
    orderId: baseOrder.orderId,
    company: mainRow ? mainRow.querySelector('.company').value.trim() : (baseOrder.company || ''),
    place: mainRow ? mainRow.querySelector('.place').value.trim() : (baseOrder.place || ''),
    staffNo: baseOrder.staffNo || '',
    name: mainRow ? mainRow.querySelector('.name').value.trim() : (baseOrder.name || ''),
    phone: mainRow ? mainRow.querySelector('.phone').value.trim() : (baseOrder.phone || ''),
    time: baseOrder.time || '',
    frontNote: mainRow ? mainRow.querySelector('.frontNote').value.trim() : (baseOrder.frontNote || ''),
    note: mainRow ? mainRow.querySelector('.frontNote').value.trim() : (baseOrder.frontNote || ''),
    trackingNo: mainRow ? mainRow.querySelector('.trackingNo').value.trim() : (baseOrder.trackingNo || ''),
    internalNote: mainRow ? mainRow.querySelector('.internalNote').value.trim() : (baseOrder.internalNote || ''),
    statusText: mainRow ? mainRow.querySelector('.js-status').value : (baseOrder.statusText || '處理中'),
    operator: 'PHP後台'
  };

  const items = [...document.querySelectorAll('#detailItemsTbody .item-row')].map((row, idx) => {
    const productId = row.querySelector('.item-product').value;
    const product = productOptions.find(p => String(p.productId) === String(productId)) || {};
    const qty = Number(row.querySelector('.item-qty').value || 0);
    const unitPrice = Number(row.querySelector('.item-unitPrice').value || 0);
    const unitCost = Number(row.querySelector('.item-unitCost').value || 0);
    const needStock = row.querySelector('.item-needStock').value;

    return {
      lineNo: idx + 1,
      productId,
      productName: product.productName || '',
      qty,
      unitPrice,
      unitCost,
      needStock,
      itemNote: ''
    };
  }).filter(x => x.productId && x.qty >= 0);

  return { order, items };
}

function computeWarnings(){
  const warnings = [];

  document.querySelectorAll('#detailItemsTbody .item-row').forEach(row => {
    const productId = row.querySelector('.item-product').value;
    const qty = Number(row.querySelector('.item-qty').value || 0);
    const product = productOptions.find(p => String(p.productId) === String(productId));

    if (product && String(product.needStock || 'N') === 'Y') {
      const currentStock = Number(product.currentStock || 0);
      if (currentStock < qty) {
        warnings.push(`${product.productName} 庫存可能不足（目前 ${currentStock}，編輯後 ${qty}）`);
      }
    }
  });

  dirtyWarnings = warnings;
  renderWarnings();
}

function renderWarnings(){
  const box = document.getElementById('warningBox');
  if (!box) return;

  if (!dirtyWarnings.length) {
    box.innerHTML = '';
    return;
  }

  box.innerHTML = `<div class="notice">⚠ 庫存提醒：\n${dirtyWarnings.join('\n')}</div>`;
}

async function saveDetail(){
  const btn = document.getElementById('saveDetailBtn');
  const originalText = btn ? btn.textContent : '儲存票券明細';

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = '儲存中...';
    }

    const payload = collectDrawerPayload();
    const res = await apiPost('api/order_save.php', payload);

    currentOrder.order = Object.assign({}, currentOrder.order, payload.order);
    currentOrder.items = payload.items;

    const selectorSafe = String(payload.order.orderId).replace(/"/g, '\\"');
    const tr = document.querySelector(`tr[data-order-id="${selectorSafe}"]`);
    if (tr) {
      tr.className = `status-${payload.order.statusText || '處理中'}`;

      const ticketMain = tr.querySelector('.ticket-main');
      if (ticketMain) {
        ticketMain.textContent = payload.items.map(x => `${x.productName} - ${x.qty}張`).join('\n');
      }

      const amountCell = tr.querySelector('.amount-cell');
      if (amountCell) {
        const total = payload.items.reduce((sum, x) => {
          return sum + (Number(x.qty || 0) * Number(x.unitPrice || 0));
        }, 0);
        amountCell.textContent = money(total);
      }

      const frontNoteEl = tr.querySelector('.frontNote');
      if (frontNoteEl) frontNoteEl.value = payload.order.frontNote || '';

      const trackingEl = tr.querySelector('.trackingNo');
      if (trackingEl) trackingEl.value = payload.order.trackingNo || '';

      const internalNoteEl = tr.querySelector('.internalNote');
      if (internalNoteEl) internalNoteEl.value = payload.order.internalNote || '';
    }

    renderModal();

    alert(res.warnings && res.warnings.length
      ? `儲存完成\n${res.warnings.join('\n')}`
      : '儲存完成'
    );

  } catch (err) {
    alert('儲存失敗：' + err.message);
    console.error(err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

async function cancelOrder(){
  if (!currentOrder) return;
  if (!confirm(`確定取消訂單 ${currentOrder.order.orderId}？`)) return;

  try {
    const res = await apiPost('api/order_cancel.php', {
      order_id: currentOrder.order.orderId,
      operator: 'PHP後台'
    });

    const selectorSafe = String(currentOrder.order.orderId).replace(/"/g, '\\"');
    const tr = document.querySelector(`tr[data-order-id="${selectorSafe}"]`);
    if (tr) {
      tr.className = 'status-已取消';
      const statusEl = tr.querySelector('.js-status');
      if (statusEl) statusEl.value = '已取消';
    }

    if (currentOrder && currentOrder.order) {
      currentOrder.order.statusText = '已取消';
      renderModal();
    }

    alert(res.message || '已取消');

  } catch (err) {
    alert('取消失敗：' + err.message);
    console.error(err);
  }
}

function previewPrint(){
  const payload = collectDrawerPayload();

  const itemsRows = payload.items.map((it, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${esc(it.productName)}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${money(it.unitPrice)}</td>
      <td style="text-align:right">${money(it.qty * it.unitPrice)}</td>
    </tr>
  `).join('');

  const html = `
  <!doctype html>
  <html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <title>訂單列印</title>
    <link rel="stylesheet" href="assets/admin.css">
  </head>
  <body>
    <div class="print-wrap">
      <h2 style="margin:0 0 16px">票券訂單明細</h2>
      <div class="print-head">
        <div><strong>訂單編號</strong><br>${esc(payload.order.orderId)}</div>
        <div><strong>公司</strong><br>${esc(payload.order.company)}</div>
        <div><strong>領取地點</strong><br>${esc(payload.order.place)}</div>
        <div><strong>總金額</strong><br>${money(calcDetailTotal())}</div>
      </div>
      <div class="print-box">
        <div><strong>姓名：</strong>${esc(payload.order.name)}</div>
        <div><strong>電話：</strong>${esc(payload.order.phone)}</div>
        <div><strong>地址/前台備註：</strong>${esc(payload.order.frontNote || '')}</div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>名稱</th>
            <th>數量</th>
            <th>福利價</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div class="print-total">總金額：${money(calcDetailTotal())}</div>
      <div style="margin-top:24px" class="no-print">
        <button onclick="window.print()" class="btn btn-primary">列印</button>
        <button onclick="window.close()" class="btn btn-light">關閉</button>
      </div>
    </div>
  </body>
  </html>`;

  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function bindToolbar(){
  document.getElementById('reloadBtn').addEventListener('click', async () => {
    try {
      await loadOrders();
    } catch (err) {
      setTableMessage('載入失敗：' + err.message);
      console.error(err);
    }
  });

  document.getElementById('reloadProductsBtn').addEventListener('click', async () => {
    try {
      await loadProducts();
      alert('商品主檔已更新');
    } catch (err) {
      alert('商品主檔載入失敗：' + err.message);
      console.error(err);
    }
  });

  document.getElementById('searchBtn').addEventListener('click', async () => {
    try {
      await loadOrders();
    } catch (err) {
      setTableMessage('搜尋失敗：' + err.message);
      console.error(err);
    }
  });

  document.getElementById('searchBox').addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      try {
        await loadOrders();
      } catch (err) {
        setTableMessage('搜尋失敗：' + err.message);
        console.error(err);
      }
    }
  });

  document.getElementById('statusFilter').addEventListener('change', async () => {
    try {
      await loadOrders();
    } catch (err) {
      setTableMessage('篩選失敗：' + err.message);
      console.error(err);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  bindToolbar();
  bindRowActions();
  bindModalUi();

  try {
    await loadProducts();
    await loadOrders();
  } catch (err) {
    setTableMessage('載入失敗：' + err.message);
    console.error(err);
  }
});
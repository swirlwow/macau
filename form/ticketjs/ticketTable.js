// 负责生成分类区块 & 注入票券行
export function initTicketSections(catMap, containerSelector) {
  const area = document.querySelector(containerSelector);
  if (!area) throw new Error(`找不到 ${containerSelector}`);

  Object.entries(catMap).forEach(([key, label]) => {
    const egiftTip = key === 'egift'
      ? '<p class="small text-danger mb-2">※送出需求後靜待簡訊通知➜回覆進行扣點➜2~3個工作日發放➜「會員專區/票券」</p>'
      : '';
    const section = document.createElement('section');
    section.className = 'mb-2';
    section.dataset.cat = key;
    section.innerHTML = `
      <h5 class="fw-bold mb-3">
        ${label}${key==='egift'
          ? '<span class="egift-note ms-2 small text-danger">✱需註冊為品味玩家會員</span>'
          : ''}
      </h5>
      ${egiftTip}
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle text-center small ticket-table">
          <thead class="table-primary text-center">
            <tr>
              <th class="col-id">#</th>
              <th>票券名稱</th>
              <th class="col-price">福利價</th>
              <th class="col-qty">張數</th>
              <th class="col-sub">小計</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>`;
    area.appendChild(section);
  });
}

export function renderTickets(tickets, containerSelector) {
  const area = document.querySelector(containerSelector);
  tickets.forEach(t => {
    const tbody = area.querySelector(`section[data-cat="${t.cat}"] tbody`);
    if (!tbody) return;

    const showName = t.name.replace(
      /^(.*?)(\s*[\*✱])(.+)$/,
      '$1 <span class="text-danger fw-bold">$2$3</span>'
    );
    const writeName = t.submit ?? t.name;
    const tip = Array.isArray(t.tooltip) ? t.tooltip.join('<br>') : t.tooltip;
    const disabled = t.name.includes('暫不提供');
    const qtyAttrs = disabled
      ? 'disabled class="form-control qty unavailable"'
      : 'class="form-control qty"';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-id">${t.id}</td>
      <td class="text-start">
        <a href="javascript:void(0)"
           data-bs-toggle="tooltip" data-bs-html="true"
           title="${tip}">${showName}</a>
      </td>
      <td class="col-price">${t.price}</td>
      <td class="col-qty">
        <input type="number" min="0" max="99"
               data-price="${t.price}"
               data-name="${writeName}"
               ${qtyAttrs}>
      </td>
      <td class="col-sub sub-total"></td>`;
    tbody.appendChild(tr);
  });
}

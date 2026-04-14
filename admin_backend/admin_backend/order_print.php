<?php
require_once __DIR__ . '/lib.php';
require_admin_auth();

$orderId = trim($_GET['order_id'] ?? '');
if ($orderId === '') {
    exit('缺少 order_id');
}

$res = gas_get([
    'action' => 'admin_get_order',
    'orderId' => $orderId
]);

if (($res['status'] ?? '') !== 'success') {
    exit(h($res['message'] ?? '讀取失敗'));
}

$data = $res['data'] ?? [];
$order = $data['order'] ?? [];
$items = $data['items'] ?? [];

$total = 0;
foreach ($items as $it) {
    $qty = (float)($it['qty'] ?? 0);
    $price = (float)($it['unitPrice'] ?? 0);
    $total += $qty * $price;
}

$showAmount = isset($order['amount']) && $order['amount'] !== '' ? (float)$order['amount'] : $total;
?>
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>列印訂單 <?= h($orderId) ?></title>
<link rel="stylesheet" href="assets/admin.css">
<style>
.print-page{
  max-width:920px;
  margin:0 auto;
  background:#fff;
  color:#111827;
  padding:24px;
}
.print-title{
  font-size:24px;
  font-weight:700;
  margin:0 0 18px;
}
.print-grid{
  display:grid;
  grid-template-columns:repeat(4, 1fr);
  border:1px solid #111;
  border-bottom:none;
}
.print-grid .cell{
  border-right:1px solid #111;
  padding:10px 12px;
  min-height:64px;
}
.print-grid .cell:last-child{
  border-right:none;
}
.print-grid .label{
  font-size:12px;
  color:#4b5563;
  margin-bottom:6px;
}
.print-grid .value{
  font-size:15px;
  font-weight:600;
  word-break:break-word;
}
.print-box{
  border:1px solid #111;
  border-top:none;
  padding:10px 12px;
}
.print-box .line{
  margin:4px 0;
  font-size:14px;
  line-height:1.6;
  word-break:break-word;
}
.print-table{
  width:100%;
  border-collapse:collapse;
  margin-top:18px;
}
.print-table th,
.print-table td{
  border:1px solid #111;
  padding:8px 10px;
  font-size:14px;
  line-height:1.5;
}
.print-table th{
  background:#f8fafc;
  text-align:left;
}
.print-right{
  text-align:right;
}
.print-total{
  display:flex;
  justify-content:flex-end;
  margin-top:12px;
  font-size:22px;
  font-weight:700;
}
.print-actions{
  margin-top:24px;
  display:flex;
  gap:8px;
}
@media print{
  .no-print{display:none !important;}
  body{background:#fff;}
  .print-page{padding:0;max-width:none;}
}
</style>
</head>
<body>
<div class="print-page">
  <h1 class="print-title">票券訂單明細</h1>

  <div class="print-grid">
    <div class="cell">
      <div class="label">訂單編號</div>
      <div class="value"><?= h($order['orderId'] ?? '') ?></div>
    </div>
    <div class="cell">
      <div class="label">公司</div>
      <div class="value"><?= h($order['company'] ?? '') ?></div>
    </div>
    <div class="cell">
      <div class="label">領取地點</div>
      <div class="value"><?= h($order['place'] ?? '') ?></div>
    </div>
    <div class="cell">
      <div class="label">總金額</div>
      <div class="value"><?= number_format($showAmount) ?></div>
    </div>
  </div>

  <div class="print-box">
    <div class="line"><strong>姓名：</strong><?= h($order['name'] ?? '') ?></div>
    <div class="line"><strong>電話：</strong><?= h($order['phone'] ?? '') ?></div>
    <div class="line"><strong>下單時間：</strong><?= h($order['time'] ?? '') ?></div>
    <div class="line"><strong>地址 / 前台備註：</strong><?= nl2br(h($order['frontNote'] ?? $order['note'] ?? '')) ?></div>
  </div>

  <table class="print-table">
    <thead>
      <tr>
        <th style="width:60px;">#</th>
        <th>名稱</th>
        <th style="width:90px;">數量</th>
        <th style="width:120px;">福利價</th>
        <th style="width:120px;">小計</th>
      </tr>
    </thead>
    <tbody>
      <?php if (!empty($items)): ?>
        <?php foreach ($items as $idx => $it): ?>
          <?php
            $qty = (float)($it['qty'] ?? 0);
            $unitPrice = (float)($it['unitPrice'] ?? 0);
            $subtotal = $qty * $unitPrice;
          ?>
          <tr>
            <td><?= $idx + 1 ?></td>
            <td><?= h($it['productName'] ?? '') ?></td>
            <td class="print-right"><?= rtrim(rtrim(number_format($qty, 2), '0'), '.') ?></td>
            <td class="print-right"><?= number_format($unitPrice) ?></td>
            <td class="print-right"><?= number_format($subtotal) ?></td>
          </tr>
        <?php endforeach; ?>
      <?php else: ?>
        <tr>
          <td colspan="5" style="text-align:center;color:#6b7280;">沒有票券明細</td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>

  <div class="print-total">總金額：<?= number_format($showAmount) ?></div>

  <div class="print-actions no-print">
    <button class="btn btn-primary" onclick="window.print()">列印</button>
    <button class="btn btn-light" onclick="window.close()">關閉</button>
  </div>
</div>
</body>
</html>
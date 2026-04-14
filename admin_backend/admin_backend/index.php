<?php
require_once __DIR__ . '/lib.php';
require_admin_auth();
?>
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>票券訂單後台</title>
<link rel="stylesheet" href="assets/admin.css">
</head>
<body>
<div class="wrap">

  <div class="toolbar no-print">
    <input
      type="text"
      id="searchBox"
      placeholder="搜尋訂編 / 公司 / 姓名 / 電話 / 票券"
      class="toolbar-search"
    >

    <select id="statusFilter" class="toolbar-select">
      <option>全部狀態</option>
      <option>處理中</option>
      <option>已打包</option>
      <option>已郵寄</option>
      <option>已領取</option>
      <option>已取消</option>
    </select>

    <button id="searchBtn" class="btn btn-light">搜尋</button>
    <button id="reloadBtn" class="btn btn-primary">重新載入</button>
    <button id="reloadProductsBtn" class="btn btn-light">重抓商品主檔</button>

    <div class="muted toolbar-meta" id="productCount">商品主檔 0 筆</div>
  </div>

  <div class="main">
    <div class="list-card">
      <h2>訂單總覽</h2>
      <div class="card-sub">主資料可直接編輯；商品內容請點「詳細」開啟票券明細視窗。</div>

      <div class="table-wrap">
        <table class="grid-table order-table">
          <thead>
            <tr>
              <th class="col-order">訂編</th>
              <th class="col-company-place">公司 / 領取地點</th>
              <th class="col-contact">姓名 / 電話</th>
              <th class="col-time">下單時間</th>
              <th class="col-ticket">票券</th>
              <th class="col-actions">操作</th>
              <th class="col-amount">金額</th>
              <th class="col-status-track">狀態 / 郵件號碼</th>
              <th class="col-note">備註</th>
            </tr>
          </thead>
          <tbody id="orderTbody">
            <tr>
              <td colspan="9" class="empty">載入中...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- 詳細編輯：只保留票券明細 -->
<div id="detailModal" class="detail-modal">
  <div class="detail-backdrop" id="detailBackdrop"></div>

  <div class="detail-dialog">
    <div class="detail-header">
      <div>
        <h2 style="margin:0">票券明細編輯</h2>
        <div class="card-sub" style="margin:6px 0 0">
          此處僅調整商品、數量與列印；其餘主資料請直接在訂單總覽修改。
        </div>
      </div>

      <button type="button" class="btn btn-light" id="detailCloseBtn">關閉</button>
    </div>

    <div class="detail-content" id="drawerBody">
      <div class="empty">請先點左側訂編或「詳細」開啟資料</div>
    </div>
  </div>
</div>

<script src="assets/admin.js"></script>
</body>
</html>
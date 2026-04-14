<?php
require_once __DIR__ . '/../lib.php';
require_admin_auth();

$body = require_post_json();
$orderId = trim($body['order_id'] ?? '');

if ($orderId === '') {
    json_response(['status' => 'error', 'message' => '缺少 order_id'], 400);
}

$get = gas_get([
    'action' => 'admin_get_order',
    'orderId' => $orderId
]);

if (($get['status'] ?? '') !== 'success') {
    json_response($get, 500);
}

$data = $get['data'] ?? [];
$order = $data['order'] ?? [];
$items = $data['items'] ?? [];

$order['statusText'] = '已取消';
$order['operator'] = $body['operator'] ?? 'PHP後台';

$res = gas_post_json([
    'action' => 'admin_save_order',
    'order' => $order,
    'items' => $items
]);

if (($res['status'] ?? '') !== 'success') {
    json_response($res, 500);
}

json_response($res);
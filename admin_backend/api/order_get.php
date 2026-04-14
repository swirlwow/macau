<?php
require_once __DIR__ . '/../lib.php';
require_admin_auth();

try {
    $orderId = trim($_GET['order_id'] ?? '');
    if ($orderId === '') {
        json_response([
            'status' => 'error',
            'message' => '缺少 order_id'
        ], 400);
    }

    $res = gas_get([
        'action' => 'admin_get_order',
        'orderId' => $orderId
    ]);

    if (($res['status'] ?? '') !== 'success') {
        json_response([
            'status' => 'error',
            'message' => $res['message'] ?? '讀取訂單失敗',
            'raw' => $res
        ], 500);
    }

    json_response([
        'status' => 'success',
        'data' => $res['data'] ?? null
    ]);

} catch (Throwable $e) {
    json_response([
        'status' => 'error',
        'message' => $e->getMessage()
    ], 500);
}
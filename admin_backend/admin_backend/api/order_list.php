<?php
require_once __DIR__ . '/../lib.php';
require_admin_auth();

try {
    $q = trim($_GET['q'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $res = gas_get([
        'action' => 'admin_list_orders'
    ]);

    if (($res['status'] ?? '') !== 'success') {
        json_response([
            'status' => 'error',
            'message' => $res['message'] ?? '讀取訂單失敗',
            'raw' => $res
        ], 500);
    }

    $rows = $res['data'] ?? [];
    if (!is_array($rows)) {
        json_response([
            'status' => 'error',
            'message' => '訂單資料格式錯誤',
            'raw' => $res
        ], 500);
    }

    if ($q !== '') {
        $rows = array_values(array_filter($rows, function ($r) use ($q) {
            $hay = implode(' ', [
                $r['orderId'] ?? '',
                $r['company'] ?? '',
                $r['place'] ?? '',
                $r['staffNo'] ?? '',
                $r['name'] ?? '',
                $r['phone'] ?? '',
                $r['tickets'] ?? '',
                $r['trackingNo'] ?? '',
                $r['internalNote'] ?? '',
                $r['frontNote'] ?? '',
            ]);

            return stripos($hay, $q) !== false;
        }));
    }

    if ($status !== '' && $status !== '全部狀態') {
        $rows = array_values(array_filter($rows, function ($r) use ($status) {
            return ($r['statusText'] ?? '') === $status;
        }));
    }

    json_response([
        'status' => 'success',
        'data' => $rows
    ]);

} catch (Throwable $e) {
    json_response([
        'status' => 'error',
        'message' => $e->getMessage()
    ], 500);
}
<?php
require_once __DIR__ . '/../lib.php';
require_admin_auth();

// 相容新舊 action
$res = gas_get(['action' => 'admin_list_products']);
if (($res['status'] ?? '') !== 'success') {
    $res = gas_get(['action' => 'admin_get_products']);
}

if (($res['status'] ?? '') !== 'success') {
    json_response($res, 500);
}

json_response(['status' => 'success', 'data' => $res['data'] ?? []]);
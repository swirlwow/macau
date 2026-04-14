<?php
require_once __DIR__ . '/../lib.php';
require_admin_auth();

$payload = require_post_json();
$payload['action'] = 'admin_save_order';

$res = gas_post_json($payload);

if (($res['status'] ?? '') !== 'success') {
    json_response($res, 500);
}

json_response($res);
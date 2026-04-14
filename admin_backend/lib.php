<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

function json_response($data, $status = 200)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function h($str)
{
    return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
}

function require_post_json()
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);

    if (!is_array($json)) {
        json_response(array('status' => 'error', 'message' => 'JSON 格式錯誤'), 400);
    }

    return $json;
}

function gas_get($params)
{
    $url = GAS_EXEC_URL . '?' . http_build_query($params);

    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => array('Accept: application/json'),
    ));

    $resp = curl_exec($ch);
    $errno = curl_errno($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        return array('status' => 'error', 'message' => 'GAS GET 失敗：' . $err);
    }

    $json = json_decode((string) $resp, true);
    if (!is_array($json)) {
        return array(
            'status' => 'error',
            'message' => 'GAS GET 回應非 JSON',
            'raw' => $resp,
            'http_code' => $status,
        );
    }

    return $json;
}

function gas_post_json($payload)
{
    $ch = curl_init(GAS_EXEC_URL);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json; charset=utf-8',
            'Accept: application/json',
        ),
    ));

    $resp = curl_exec($ch);
    $errno = curl_errno($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        return array('status' => 'error', 'message' => 'GAS POST 失敗：' . $err);
    }

    $json = json_decode((string) $resp, true);
    if (!is_array($json)) {
        return array(
            'status' => 'error',
            'message' => 'GAS POST 回應非 JSON',
            'raw' => $resp,
            'http_code' => $status,
        );
    }

    return $json;
}

function require_admin_auth()
{
    if (!ADMIN_AUTH_ENABLED) return;

    $user = isset($_SERVER['PHP_AUTH_USER']) ? $_SERVER['PHP_AUTH_USER'] : '';
    $pass = isset($_SERVER['PHP_AUTH_PW']) ? $_SERVER['PHP_AUTH_PW'] : '';

    if ($user !== ADMIN_USERNAME || $pass !== ADMIN_PASSWORD) {
        header('WWW-Authenticate: Basic realm="Ticket Admin"');
        http_response_code(401);
        echo 'Authentication required';
        exit;
    }
}
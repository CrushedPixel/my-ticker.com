<?php

function api_done($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

function api_error($err) {
    //Return other response code than 200
    $error = array(
        'id' => $err['id'],
        'desc' => $err['msg'],
        'key' => $err['key']);
    if(array_key_exists('objects', $err)) {
        $error['objects'] = $err['objects'];
    }
    http_response_code(400);
    api_done($error);
}

function argreq($name) {
    if (isset($_GET[$name]))
        return $_GET[$name];
    if (isset($_POST[$name]))
        return $_POST[$name];
    api_error(param_missing($name));
}

function argopt($name, $default) {
    if (isset($_GET[$name]))
        return $_GET[$name];
    if (isset($_POST[$name]))
        return $_POST[$name];
    return $default;
}

function password_hash($password) {
    return hash('sha256', $password);
}
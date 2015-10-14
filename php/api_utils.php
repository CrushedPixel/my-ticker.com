<?php

function api_done($response = null) {
    header('Content-Type: application/json');
    if(is_null($response)) $response = array("success" => true);
    echo json_encode($response);
    exit;
}

function api_error() {
    http_response_code(400);
    api_done(array("success" => false));
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
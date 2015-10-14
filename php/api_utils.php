<?php

function api_done($response = null) {
    header('Content-Type: application/json');
    if(is_null($response)) $response = array("success" => true);
    echo json_encode($response);
    exit;
}

function api_error($error = null) {
    http_response_code(400);
    if(is_null($error)) $error = array("success" => false);
    api_done($error);
}

function argreq($name) {
    if (isset($_GET[$name]))
        return $_GET[$name];
    if (isset($_POST[$name]))
        return $_POST[$name];
    api_error(array("message" => "Parameter missing: ".$name));
}

function argopt($name, $default) {
    if (isset($_GET[$name]))
        return $_GET[$name];
    if (isset($_POST[$name]))
        return $_POST[$name];
    return $default;
}

function hash_code($password) {
    return hash('sha256', $password);
}
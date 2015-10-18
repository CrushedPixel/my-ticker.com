<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");
$code = argreq("code");

$running = toggle_ticker_running($id, $code);

if(is_null($running)) api_error();

api_done(array("running" => $running));

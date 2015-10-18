<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");
$code = argreq("code");

if(check_ticker_passcode($id, $code)) {
	api_done(array("ticker" => get_ticker($id)));
}
api_error();
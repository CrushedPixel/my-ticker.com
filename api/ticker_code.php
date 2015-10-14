<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");
$code = argreq("code")

api_done(array("valid" => check_ticker_passcode($id, $code)));
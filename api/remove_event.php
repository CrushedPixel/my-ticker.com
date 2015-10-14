<?php
REQUIRE_ONCE "/php/main.php";

$id = argreq("id");
$event = argreq("event");
$code = argreq("code");

$result = remove_ticker_event($id, $event_id, $code);

if(!result) api_error();
api_done();
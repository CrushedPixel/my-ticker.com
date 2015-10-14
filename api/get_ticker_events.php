<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");

$events = get_ticker_events($id);

if(is_null($events) || empty($events)) api_error();

api_done(array("events" => $events));
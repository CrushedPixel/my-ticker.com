<?php
REQUIRE_ONCE "/php/main.php";

$id = argreq("id");
$team = argreq("team"); //true or false
$action = argopt("action", null);
$player_number = argreq("player_number");
$player_name = argreq("player_name");
$info = argopt("info", null);
$code = argreq("code");

$event_id = post_ticker_event($id, $team, $action, $player_number, $player_name, $info, $code);

if(is_null($event_id)) {
	api_error();
} else {
	api_done("id" => $event_id);
}
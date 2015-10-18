<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");
$team = argreq("team"); //0 or 1
$action = argopt("action", null);
$player_number = argreq("player_number");
$player_name = argreq("player_name");
$info = argopt("info", null);
$code = argreq("code");

if(is_null(post_ticker_event($id, $team, $action, $player_number, $player_name, $info, $code))) {
	api_error();
} else {
	api_done(array("ticker" => get_ticker($id)));
}
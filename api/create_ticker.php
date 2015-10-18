<?php
REQUIRE_ONCE "../php/main.php";

$team_a = argreq("team_a");
$team_b = argreq("team_b");
$duration = argreq("duration");
$name = argreq("name");
$location = argreq("location");
$players = argopt("players", "[]"); //is a json-encoded array
$code = argreq("code");

$players = json_decode($players, true);

$id = create_ticker($team_a, $team_b, $duration, $name, $location, $players, $code);

if(is_null($id)) {
	api_error();
}

api_done(array("ticker" => get_ticker($id)));
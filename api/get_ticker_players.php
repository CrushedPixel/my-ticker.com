<?php
REQUIRE_ONCE "/php/main.php";

$id = argreq("id");

$players = get_ticker_players($id);

//TODO: distinguish between invalid ticker and empty set
if(empty($players) || is_null($players)) api_error();

api_done(array("players" => $players));
<?php
REQUIRE_ONCE "/php/main.php";

$id = argreq("id");

$time = get_current_time($id);

if(is_null($time)) api_error();

api_done(array("half" => $time[0], "time" => $time[1], "overtime" => $time[2]));
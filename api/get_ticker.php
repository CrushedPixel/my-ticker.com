<?php
REQUIRE_ONCE "/php/main.php";

$id = argreq("id");

$ticker = get_ticker($id);

if(is_null($ticker)) api_error();

api_done(array("ticker" => $ticker));
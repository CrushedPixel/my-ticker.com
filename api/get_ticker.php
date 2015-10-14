<?php
REQUIRE_ONCE "../php/main.php";

$id = argreq("id");

$ticker = get_ticker($id);

if($ticker) api_done(array("ticker" => $ticker));
api_error();
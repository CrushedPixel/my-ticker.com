<?php
REQUIRE_ONCE "database.php";
REQUIRE_ONCE "api_utils.php";
REQUIRE_ONCE "validation.php";

//These aren't production values. Sorry to destroy your hope
$_db_host = "localhost";
$_db_username = "root";
$_db_password = "localpw";
$_db_database = "myticker";

function handle_errors($error, $message, $filename, $line) {
    http_response_code(400);
    echo "<b>$message</b> in line $line of <i>$filename</i></body></html>";
    exit;
}

function hash_password($password) {
	
}

set_error_handler('handle_errors');

$con = new PDO("mysql:host=$_db_host;dbname=$_db_database" ,$_db_username, $_db_password);
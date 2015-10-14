<?php
/*
 * Contains functions to validate user input and retreive valid values
 */

function get_valid_durations() {
	return array(15, 30, 45);
}

function validate_duration($duration) {
	if(!in_array($duration, get_valid_durations())) throw new Exception();
}

function validate_code($code) {
	$len = strlen($code);
	if($len < 5 || $len > 15) throw new Exception();
}

function sanitize_players($players) {
	$a = 0;
	$b = 0;

	$new_players = array();

	foreach($players as $player) {
		try {
			//every team may have at most 20 players to prevent database flooding
			if(!isset($player["team"])) continue;
			if($player["team"] == "b") {
				$b++;
				if($b > 20) continue;
			} else {
				$a++;
				if($a > 20) continue;
			}

			//checking for valid values
			if(!isset($player["number"]) || !isset($player["name"])
				|| empty($player["number"]) || $player["number"] > 100 || $player["number"] < 1
				|| empty($player["name"])) {
				continue;
			}

			$new_players[] = $player;
		} catch(Exception $e) {}
	}

	return $new_players;
}

function validate_event_creation($ticker, $code) {
	validate_ticker_passcode($ticker, $code);
	if(check_ticker_finished($ticker)) throw new Exception();
	if(!check_ticker_running($ticker)) throw new Exception();
}

function validate_ticker_passcode($ticker, $code) {
	if(!check_ticker_passcode($ticker, $code)) throw new Exception();
}

function check_ticker_passcode($ticker, $code) {
	global $con;

	$codehash = hash_code($code);

	$sql = "SELECT * FROM tickers WHERE id=? AND code=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $ticker);
	$stmt->bindParam(2, $codehash);
	$stmt->execute();

	return !empty($stmt->fetchAll());
}

function check_ticker_finished($ticker) {
	global $con;

	$sql = "SELECT * FROM tickers WHERE id=? AND finished=0";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $ticker);
	$stmt->execute();

	return empty($stmt->fetchAll());
}

function check_ticker_running($ticker) {
	global $con;

	$sql = "SELECT * FROM tickers WHERE id=? AND running=0";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $ticker);
	$stmt->execute();

	return empty($stmt->fetchAll());
}
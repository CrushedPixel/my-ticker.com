<?php

/**
 * Creates a new liveticker.
 * @param string team_a The home team's name.
 * @param string team_b The guest team's name.
 * @param int duration Each game half's duration in minutes.
 * @param string name The game's name.
 * @param string location The game's location.
 * @param mixed[] players The players of both teams. Structure: {team => true/false, "number", "name"}
 * @param string code The passcode that can be used to manage this ticker.
 * @return int The newly created ticker's id, or null if the creation failed.
 */
function create_ticker($team_a, $team_b, $duration, $name, $location, $players, $code) {
	global $con;

	//value validation and sanitizing
	try {
		validate_duration($duration);
		validate_code($code);
		$players = sanitize_players($players);
	} catch(Exception $e) {
		return null;
	}

	$codehash = hash_code($code);

	//create ticker
	$sql = 'INSERT INTO tickers (`team_a`, `team_b`, `duration`, `name`, `location`, `code`) VALUES (?, ?, ?, ?, ?, ?)';
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $team_a);
	$stmt->bindParam(2, $team_b);
	$stmt->bindParam(3, $duration);
	$stmt->bindParam(4, $name);
	$stmt->bindParam(5, $location);
	$stmt->bindParam(6, $codehash);
	$stmt->execute();

	$id = $con->lastInsertId();

	//add players
	if(!empty($players)) {
		$sql = "INSERT INTO players (`ticker`, `team`, `number`, `name`) VALUES ";

		$all_values = array();
		$i = 0;
		foreach($players as $player) {
			$sql .= "(?, ?, ?, ?)";
			if($i < sizeof($players)-1) $sql .= ", ";
			$i++;

			$team = false;
			if($player["team"] == "b") $team = true;

			$all_values = array_merge($all_values, array($id, $team, $player["number"], $player["name"]));
		}

		$stmt = $con->prepare($sql);

		$stmt->execute($all_values);
	}

	return $id;
}

/**
 * @param int id The liveticker's id.
 * @return mixed[] An array containing information about the liveticker.
 */
function get_ticker($id) {
	global $con;

	$sql = "SELECT * FROM tickers WHERE id=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->execute();

	return $stmt->fetch();
}

/**
 * @param int id The liveticker's id.
 * @return mixed[] An array containing all players participating in the given liveticker.
 */
function get_ticker_players($id) {
	global $con;

	$sql = "SELECT * FROM players WHERE ticker=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->execute();

	return $stmt->fetchAll();
}

/**
 * Posts a new event to a liveticker.
 * @param int id The liveticker's id.
 * @param bool team The team associated with the event. false for home, true for guest.
 * @param string action The event's action type. May be null for no specific action.
 * @param int player_number The number of the player associated with this event.
 * @param string player_name The name of the player associated with this event.
 * @param string info Additional information about this event. May be null for no information.
 * @param string code The passcode for the liveticker.
 * @return int The newly created event's id, or null if the creation failed.
 */
function post_ticker_event($id, $team, $action, $player_number, $player_name, $info, $code) {
	global $con;

	try {
		validate_event_creation($id, $code);
	} catch(Exception $e) {
		return null;
	}

	$timestamp = time();

	$sql = "INSERT INTO events VALUES (?, ?, ?, ?, ?, ?)";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->bindParam(2, $timestamp);
	$stmt->bindParam(3, $team);
	$stmt->bindParam(4, $action);
	$stmt->bindParam(5, $player_number);
	$stmt->bindParam(6, $player_name);
	$stmt->bindParam(7, $info);
	$stmt->execute();

	$id = $con->lastInsertId();
	return $id;
}

/**
 * Removes an event from a liveticker.
 * @param int id The liveticker's id.
 * @param int event_id The id of the event to remove.
 * @param string code The passcode for the liveticker.
 * @return bool Whether the event was sucessfully removed.
 */
function remove_ticker_event($id, $event_id, $code) {
	global $con;

	try {
		validate_ticker_passcode($id, $code);
	} catch(Exception $e) {
		return false;
	}

	$sql = "DELETE FROM events WHERE id=? AND ticker=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $event_id);
	$stmt->bindParam(2, $id);
	$stmt->execute();

	return true;
}

/**
 * @param int id The liveticker's id.
 * @return mixed[] An array containing all events of the given liveticker.
 */
function get_ticker_events($id) {
	global $con;

	$sql = "SELECT * FROM events WHERE ticker=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->execute();

	return $stmt->fetchAll();
}

/**
 * @param int id The liveticker's id.
 * @param string code The passcode for the liveticker.
 * @return bool Whether or not the ticker is running after the toggle, or null if toggling failed.
 */
function toggle_ticker_running($id, $code) {
	global $con;

	if(check_ticker_finished($id)) return null;

	$running = check_ticker_running($id);
	$new_running = !$running;
	$timestamp = time();

	$sql = "INSERT INTO timer VALUES (?, ?, ?)";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->bindParam(2, $timestamp);
	$stmt->bindParam(3, $new_running);

	$stmt->execute();

	if(sizeof(get_timing_values($id)) >= 4) {
		$sql = "UPDATE tickers SET finished=1 WHERE id=?";
		$stmt = $con->prepare($sql);
		$stmt->bindParam(1, $id);
		$stmt->execute();
	}

	$sql = "UPDATE tickers SET running=? WHERE id=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $new_running);
	$stmt->bindParam(2, $id);
	$stmt->execute();

	return $new_running;
}

function get_timing_values($id) {
	global $con;

	$sql = "SELECT * FROM timer WHERE ticker=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->execute();

	return $stmt->fetchAll();
}

/**
 * @param int id The liveticker's id.
 * @return int[] The matches current half (1 or 2), 
 *               the half's time in seconds (max. half length),
 *               the current overtime in seconds
 */
function get_current_time($id) {
	$ticker = get_ticker($id);
	if(is_null($ticker)) return null;

	$half_duration = 60*$ticker["duration"];

	$timing = get_timing_values($id);

	$timestamp = time();

	$half = 0;
	$time = 0;
	$overtime = 0;

	foreach($timing as $row) {
		if($row["started"]) {
			$half++;
			$time = $timestamp - $row["timestamp"];
		} else {
			$time -= $timestamp - $row["timestamp"];
		}
	}

	if($time > $half_duration) {
		$overtime = $time - $half_duration;
		$time = $half_duration;
	}

	return array($half, $time, $overtime);
}
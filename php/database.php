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

	if($row = $stmt->fetch()) {
		return array(
			"duration" => $row["duration"],
			"finished" => $row["finished"],
			"id" => $row["id"],
			"location" => $row["location"],
			"name" => $row["name"],
			"running" => $row["running"],
			"team_a" => $row["team_a"],
			"team_b" => $row["team_b"],
			"players" => get_ticker_players($id),
			"time" => get_current_time($id),
			"events" => get_ticker_events($id),
			"goals" => get_goal_count($id)
		);
	}

	return null;
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

	$arr = array();

	while($row = $stmt->fetch()) {
		$arr[] = array(
			"name" => $row["name"],
			"number" => $row["number"],
			"team" => $row["team"],
		);
	}

	return $arr;
}

/**
 * Posts a new event to a liveticker.
 * @param int id The liveticker's id.
 * @param int team The team associated with the event. 0 for home, 1 for guest.
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

	$sql = "INSERT INTO events (`ticker`, `timestamp`, `team`, `action`, `player_number`, `player_name`, `info`) VALUES (?, ?, ?, ?, ?, ?, ?)";
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

	$arr = array();

	while($row = $stmt->fetch()) {
		$arr[] = array(
			"id" => $row["id"],
			"time" => get_current_time($id, $row["timestamp"]),
			"team" => $row["team"],
			"action" => $row["action"],
			"player_number" => $row["player_number"],
			"player_name" => $row["player_name"],
			"info" => $row["info"]
		);
	}

	return $arr;
}

/**
 * @param int id The liveticker's id.
 * @param string code The passcode for the liveticker.
 * @return bool Whether or not the ticker is running after the toggle, or null if toggling failed.
 */
function toggle_ticker_running($id, $code) {
	//this is only possible under the following circumstances:
	//
	//1. The current event hasn't started yet. In this case, the first half will be started.
	//
	//2. The current event is in overtime (either first or second half). in this case,
	//	 the event is going to be stopped. If it's in the second half's overtime, the
	//	 event is going to be marked as finished. TODO: if tie, ask for match extension
	//
	//3. the current event is in the half time break. In this case, the second half will be started.

	global $con;

	if(check_ticker_finished($id)) return null; //disallow if finished

	$curtime = get_current_time($id);

	if(check_ticker_running($id)) { //if ticker is running, it can only be toggled if in overtime
		if($curtime["overtime"] == 0) return null;
	}
	

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
function get_current_time($id, $timestamp = -1) {
	global $con;

	$sql = "SELECT * FROM tickers WHERE id=?";
	$stmt = $con->prepare($sql);
	$stmt->bindParam(1, $id);
	$stmt->execute();

	if(!($ticker = $stmt->fetch())) return null;

	$half_duration = 60*$ticker["duration"];

	$timing = get_timing_values($id);

	if($timestamp == -1) $timestamp = time();

	$half = 0;
	$time = 0;
	$overtime = 0;

	foreach($timing as $row) {
		if($row["timestamp"] > $timestamp) break;
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

	return array("half" => $half, "time" => $time, "overtime" => $overtime);
}

function get_goal_count($id) {
	$a = 0;
	$b = 0;

	$events = get_ticker_events($id);

	foreach($events as $event) {
		if($event["action"] == "goal") {
			if($event["team"] == 0) $a++;
			else $b++;
		}
	}

	return array("team_a" => $a, "team_b" => $b);
}
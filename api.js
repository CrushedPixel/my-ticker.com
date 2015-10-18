/*
 Code for the interaction with the API.
 This is only a raw wrapper around the API, 
 no actual processing is done with the returned data.
*/

function get_valid_durations(callback, error_callback) {
	$.get(
		"/api/get_valid_durations.php"
	).done(callback).fail(error_callback);
}

function get_ticker(ticker_id, callback, error_callback) {
	$.post(
		"/api/get_ticker.php",
		{ "id": ticker_id }
	).done(callback).fail(error_callback);
}

function create_ticker(team_a, team_b, duration, name, location, players, code, callback, error_callback) {
	$.post(
		"/api/create_ticker.php",
		{ 
			"team_a": team_a, "team_b": team_b,
			"duration": duration, "name": name,
			"location": location, "players": players,
			"code": code
		}
	).done(callback).fail(error_callback);
}

function ticker_code(ticker_id, ticker_code, callback, error_callback) {
	$.post(
		"/api/ticker_code.php",
		{
			"id": ticker_id,
			"code": ticker_code
		}
	).done(callback).fail(error_callback);
}

function toggle_running(ticker_id, ticker_code, callback, error_callback) {
	$.post(
		"/api/toggle_ticker_running.php",
		{
			"id": ticker_id,
			"code": ticker_code
		}
	).done(callback).fail(error_callback);
}

function post_event(ticker_id, ticker_code, team, action, player_number, player_name, info, callback, error_callback) {
	$.post(
		"/api/post_event.php",
		{
			"id": ticker_id,
			"code": ticker_code,
			"team": team,
			"action": action,
			"player_number": player_number,
			"player_name": player_name,
			"info": info
		}
	).done(callback).fail(error_callback);
}
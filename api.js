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
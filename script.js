/*
 BEGIN UI TWEAKS
*/

function resize() {
	$(".element-wrapper").each(function(index) {
		var header = $(".element-wrapper").find(".element-header");
		var element = $(".element-wrapper").find(".element");

		element.height($(this).height() - header.height());
	});

	$(".events").height($(".event-overview").height() - $(".header").height() - $(".timer").height());
	$(".new-info-input").height($(".new-event").height() - $(".new-footer").height());

	$(".combo").each(function() {
		var input = $(this).find("input");
		var list = $(this).find("ul");

		list.css('margin-top', input.height() + 20);
	});
}

function applyRangeChecks() {
	$(".player-number").on('input', function() {
		if($(this).val() && /^\d+$/.test($(this).val())) {
			if($(this).val() < 1) {
				$(this).val(1);
			} else if($(this).val() > 100) {
				$(this).val(100);
			}
		} else {
			$(this).val('');
		}
	});
}

function applyComboJS() {
	$(".combo").each(function() {
		var id = $(this).find("input").attr('id');
		new combo(id, '#9c9','#cfc');
	});
}

function hideWrappers() {
	$(".element-wrapper").each(function() {
		$(this).hide().css("visibility", "hidden");
	});
}

function generateButtonToggles() {
	$(".action-button").each(function() {
		var main = $(this).find(".button-main");
		var expansion = $(this).find(".button-expansion");
		var id = expansion.attr('id');

		main.on("click", function() { toggleVisibility(id) });

		toggleVisibility(id);
	});
}

function toggleVisibility(id) {
	$('#'+id).toggle();
}

function populateDurationSelect() {
	var callback = function(data) {
		$.each(data["durations"], function(index, value) {
			$("#duration-select").append($("<option></option>").attr("value", value).text("2 * "+value+"'"));
		});
	};

	get_valid_durations(callback);
}

window.onresize = resize;

var timeout = 500;
//initially call the resize function to set the div's sizes
setTimeout(resize, timeout);

//apply some JS to some elements
setTimeout(applyComboJS, timeout);
setTimeout(generateButtonToggles, timeout);
setTimeout(populateDurationSelect, timeout);

//initially hide all element wrappers, as they are opened when needed
setTimeout(hideWrappers, timeout);

/*
 END UI TWEAKS
*/

/*
 BEGIN LIVETICKER LOAD
*/

function loadLiveticker() {
	var ticker = $("#ticker-id-input").val();

	var loadTicker = function(data) {
		console.log(data);
	};

	var showError = function() {
		alert('Liveticker could not be found.');
	};

	if(ticker.length > 0) {
		get_ticker(ticker, loadTicker, showError);
	}
}

function createLiveticker() {
	var team_a = $("#team-a-name").val();
	var team_b = $("#team-b-name").val();
	var duration = $("#duration-select").val();
	var name = $("#match-name").val();
	var location = $("#match-location").val();
	var code = $("#security-code").val();

	//extract players from containers
	var team_a_container = $('#players-team-a');
	var team_b_container = $('#players-team-b');

	var divs = $.merge(team_a_container.children(), team_b_container.children());
	var player_array = [];

	divs.each(function() {
		if(!($(this).attr("class").lastIndexOf('player', 0) === 0)) {
			return true;
		}

		var obj = {};

		var split = $(this).attr("class").split("-");
		var team_identifier = split[split.length-1];
		obj['team'] = team_identifier;
		obj['number'] = $(this).find(".player-number").val();
		obj['name'] = $(this).find(".player-name").val();

		player_array.push(obj);
	});

	var players = JSON.stringify(player_array);

	var callback = function(data) {
		console.log(data);
	};

	var error_callback = function(data) {
		console.log(data);
	};

	create_ticker(team_a, team_b, duration, name, location, players, code, callback, error_callback);
}

/*
 END LIVETICKER LOAD
*/

/*
 BEGIN EVENT CREATION
*/

//adds a new player to one of the teams. team is either 'a' or 'b'.
function addPlayer(team) {
	var container = $('#players-team-'+team);

	//max. 20 players to prevent database flooding
	if(container.children().length >= 20) return;

	var last_id = 0;

	var spl = container.children().last().attr('id').split("-");

	last_id = Number(spl[spl.length-1]);
	if(!$.isNumeric(last_id)) {
		last_id = 0;
	}

	var id = last_id+1;

	var div = $(document.createElement('div')).addClass('player').addClass('player-'+team).attr('id', 'player-'+team+'-'+id);

	//TODO: Set default value to next free number
	var number_html = '<input type="number" class="player-number border">'
	$(number_html).appendTo(div);

	var name_html = '<input type="text" class="player-name border" placeholder="Player Name">';
	$(name_html).appendTo(div);

	var remove_html = '<div class="player-remove-button border" onclick="removePlayer(\''+team+'\', '+id+')"><i class="fa fa-times"></i></div>'
	$(remove_html).appendTo(div);

	div.appendTo(container);

	resize();
	applyRangeChecks();
}

function removePlayer(team, id) {
	$('#player-'+team+'-'+id).remove();
	resize();
}

/*
 END EVENT CREATION
*/

/*
 BEGIN EVENT POSTING
*/

//TODO: actual Database interaction, possibly fetch events from server again after every post/remove
function postEvent(team, action, player_number, player_name, info) {
	var container = $('#event-list');

}

function removeEvent(event_id) {

}

/*
 END EVENT POSTING
*/
/*
 GLOBAL VARIABLES
*/
MANAGE_TICKER_ID = null; //the ticker that is currently being managed
MANAGE_TICKER_CODE = null; //the ticker's security code

TO_UPDATE = null; //either 'manage', 'load' or null

EVENTS = [];

function update() {
	if(TO_UPDATE == 'manage' || TO_UPDATE == 'load') {
		update_manage_ticker();
	}
}

setInterval(update, 10*1000); //update every 10s. Data usage is fine.

/*
 BEGIN UI TWEAKS
*/

function resize() {
	$(".new-info-input").height($(".new-event").height() - $(".new-footer").height());

	$(".combo").each(function() {
		var input = $(this).find("input");
		var list = $(this).find("ul");

		list.css('margin-top', input.height() + 14);
	});

	styleOverlaysRight();
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
		$(this).hide();
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

function styleOverlaysRight() {
	$('.overlay-container').each(function() {
		var overlay = $(this).find('.overlay-right');
		var other = $(this).children()[0];

		$(overlay).css('font-size', $(other).css('font-size'));
	});
}

function populateDurationSelect() {
	var callback = function(data) {
		$.each(data["durations"], function(index, value) {
			$("#duration-select").append($("<option></option>").attr("value", value).text("2 * "+value+"'"));
		});
	};

	var error_callback = function() {
		$.each([45, 30, 15], function(index, value) {
			$("#duration-select").append($("<option></option>").attr("value", value).text("2 * "+value+"'"));
		});
	}

	get_valid_durations(callback, error_callback);
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

function codeInfo() {
	sweetAlert('The Editing Code', 'Anyone with this code can edit your Liveticker.');
}

/*
 BEGIN LIVETICKER LOAD
*/

function loadLiveticker() {
	swal({
		title: 'Load Liveticker',
		html: 'Liveticker ID:<input class="visible" id="id-input" type="number">',
		confirmButtonText: "Load",
		showCancelButton: true,
		closeOnConfirm: false
	}, function() {
		var ticker = $('#id-input').val();
		if(ticker.length > 0) {

			var loadTicker = function(data) {
				load_ticker(data);
				TO_UPDATE = 'load';
				MANAGE_TICKER_ID = ticker;
				swal.closeModal();
			};

			var showError = function() {
				sweetAlert('Error loading Liveticker', 'A Liveticker with ID '+ticker+' could not be found.', 'error');
			};

			get_ticker(ticker, loadTicker, showError);
		}
	});
}

function manageLiveticker() {
	swal({
		title: 'Manage Liveticker',
		html: 'Liveticker ID:<input class="visible" id="id-input" type="number"><br>Security Code:<input class="visible" id="code-input" type="password">',
		confirmButtonText: "Load",
		showCancelButton: true,
		closeOnConfirm: false
	}, function() {
		var ticker = $('#id-input').val();
		var code = $('#code-input').val();
		if(ticker.length > 0 && code.length > 0) {

			var loadTicker = function(data) {
				manage_ticker(data);
				TO_UPDATE = 'manage';
				MANAGE_TICKER_ID = ticker;
				MANAGE_TICKER_CODE = code;
				swal.closeModal();
			};

			var showError = function() {
				sweetAlert('Error accessing Liveticker', 'Invalid Liveticker ID or Security Code provided.', 'error');
			};

			ticker_code(ticker, code, loadTicker, showError);
		}
	});
}

function createLiveticker() {
	var team_a = $("#team-a-name").val();
	var team_b = $("#team-b-name").val();
	var duration = $("#duration-select").val();
	var name = $("#match-name").val();
	var location = $("#match-location").val();
	var code = $("#security-code").val();

	//validating inputs
	var error = null;

	if(team_a.trim().length < 5 || team_b.trim().length < 5) {
		error = 'Team names have to contain at least 5 letters.';
	} else if(name.trim().length < 5) {
		error = 'The match name has to contain at least 5 letters.';
	} else if(location.trim().length < 5) {
		error = 'The match location has to contain at least 5 letters.';
	} else if(code.length < 5) {
		error = 'The editing code has to be between 5 and 15 characters long.';
	}

	if(error != null) {
		sweetAlert('Could not create Liveticker', error, 'error');
		return;
	}

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
		MANAGE_TICKER_ID = data["ticker"]["id"];
		MANAGE_TICKER_CODE = code;
		manage_ticker(data);
	};

	var error_callback = function(data) {
		sweetAlert('Could not create Liveticker', 'An unknown error occurred while creating your Liveticker.', 'error');
	};

	create_ticker(team_a, team_b, duration, name, location, players, code, callback, error_callback);
}

function load_ticker(data) {
	data = data["ticker"];

	update_manage_ticker(data);

	//show the UI
	$("#load-manage-button").hide();
	$("#create-wrapper").hide();
	$("#liveticker-wrapper").show();
}

function manage_ticker(data) {
	data = data["ticker"];

	//populate UI
	$("#team-a-option").html(data["team_a"]);
	$("#team-b-option").html(data["team_b"]);

	var number_values = $("#player-number-values");
	var name_values = $("#player-name-values");

	var name_input = $("#player-name-input");
	var number_input = $("#player-number-input");

	$("#team-select").change(function() {
		number_values.empty();
		name_values.empty();

		name_input.val('');
		number_input.val('');

		var value = this.value;

		$.each(data["players"], function() {
			if((value == "team-a" && this["team"] == 0) || (value == "team-b" && this["team"] == 1)) {
				var thenum = this["number"];
				var thename = this["name"];

				var num = $("<li>"+thenum+"</li>");
				var name = $("<li>"+thename+"</li>");

				num.click(function() {
					name_input.val(thename);
				});

				name.click(function() {
					number_input.val(thenum);
				});

				number_values.append(num);
				name_values.append(name);
			}
		});

		applyComboJS();
	});

	$("#team-select").change();

	//show/hide the post-event div depending on whether the ticker running or not
	var post_event_div = $("#event-post-div");

	if(data["running"] == 0) post_event_div.hide();
	else post_event_div.show();

	update_manage_ticker(data);

	//show the UI
	$("#load-manage-button").hide();
	$("#create-wrapper").hide();
	$("#manage-wrapper").show();
}

function unknown_error() {
	sweetAlert('An unknown error occurred.', 'Please try again after refreshing the page.', 'error');
}

function update_manage_ticker(data) {
	if(data === undefined) {
		get_ticker(MANAGE_TICKER_ID, function(data) {
				update_manage_ticker(data["ticker"]);
		}, function() { unknown_error(); });
		return;
	}

	$(".match-id").text(data["id"]);

	var live_timer = $(".live-timer");

	var timer_value = ((data["duration"]*Math.max(0, data["time"]["half"]-1)) + Math.ceil(data["time"]["time"]/60)) + "'";
	if(data["time"]["overtime"] > 0) {
		timer_value += "+"+Math.ceil(data["time"]["overtime"]/60);
	}

	live_timer.text(timer_value);

	var post_event_div = $("#event-post-div");

	//the ticker status
	$(".ticker-status").each(function() {
		$(this).hide();
	});

	var start_button = $("#start-button");
	var stop_button = $("#stop-button");

	start_button.html("Start First Half");
	stop_button.html("End First Half");

	start_button.prop('disabled', true);
	stop_button.prop('disabled', true);

	//very confusing if/else statements that show the correct event status div and enable the correct buttons
	if(data["time"]["half"] == 0) {
		$("#ticker-status-not-started").show();
		start_button.html("Start First Half");
		start_button.prop('disabled', false);
	} else {
		if(data["finished"] == 0) {
			if(data["running"] == 0) {
				$("#ticker-status-pause").show();
				start_button.html("Start Second Half");
				start_button.prop('disabled', false);
			} else {
				if(data["time"]["half"] == 1) {
					stop_button.html("End First Half"); 

					if(data["time"]["overtime"] == 0) {
						$("#ticker-status-half-1").show();
					} else {
						$("#ticker-status-half-1-overtime").show();
						stop_button.prop('disabled', false); //the half can only be stopped after it's finished
					}
				} else if(data["time"]["half"] == 2) {
					stop_button.html("End Second Half");

					if(data["time"]["overtime"] == 0) {
						$("#ticker-status-half-2").show();
					} else {
						$("#ticker-status-half-2-overtime").show();
						stop_button.prop('disabled', false); //the half can only be stopped after it's finished
					}
				}
			}
		} else {
			$("#ticker-status-finished").show();
		}
	}

	//setting the goal count
	$(".score-a").text(data["goals"]["team_a"]);
	$(".score-b").text(data["goals"]["team_b"]);

	//populating the events list
	//first, reset it
	$(".noevents-row").show();
	$(".events-table").children(":not(.noevents-row)").each(function() {
		$(this).remove();
	});

	//group elements by timestamp
	var half_duration = data["duration"];

	EVENTS = data["events"];

	var rows = [];
	$.each(data["events"], function(index, element) {
		var minute = (half_duration * Math.max(0, element["time"]["half"]-1)) + Math.ceil(element["time"]["time"]/60);
		var overtime = Math.ceil(element["time"]["overtime"]/60);

		var found = false;
		$.each(rows, function(index, row) {
			if(row["min"] == minute && row["ot"] == overtime) {
				row["events"].push(element)
				found = true;
			}
		});

		if(!found) {
			rows.push(
			{
				"min": minute,
				"ot": overtime,
				"events": [element]
			});
		}
	});


	$.each(rows, function(index, row) {
		$(".noevents-row").hide();

		var a_events = [];
		var b_events = [];

		$.each(row["events"], function(index, evnt) {
			if(evnt["team"] == 0) a_events.push(evnt);
			else b_events.push(evnt);
		});

		var row_count = Math.max(a_events.length, b_events.length);

		var i;
		for(i = 0; i < row_count; i++) {
			var events_row = $('<div/>',
			{
				"class": "events-row"
			});

			var a_event = $('<div/>',
			{
				"class": "events-row-entry almost-half event"
			});

			var b_event = $('<div/>',
			{
				"class": "events-row-entry almost-half event"
			});

			if(i < a_events.length) {
				append_event_to(a_event, a_events[i]);
			} else {
				a_event.html("&nbsp;")
			}

			if(i < b_events.length) {
				append_event_to(b_event, b_events[i]);
			} else {
				b_event.html("&nbsp;")
			}

			var timetext = "&nbsp;";

			if(i == 0) {
				timetext = row["min"]+"'";
				if(row["ot"] > 0) timetext += "+"+row["ot"];
			}

			var time = $('<div/>',
			{
				"class": "events-row-entry ninth timestamp",
				"html": timetext
			});

			a_event.appendTo(events_row);
			time.appendTo(events_row);
			b_event.appendTo(events_row);

			events_row.appendTo($(".events-table"));
		}

	});
}

function toggleTickerRunning() {
	var post_event_div = $("#event-post-div");

	var callback = function(sub_data) {
		if(sub_data["running"]) post_event_div.show();
		else post_event_div.hide();
		update_manage_ticker();
	};

	var error_callback = function() {
		unknown_error();
		update_manage_ticker();
	};

	toggle_running(MANAGE_TICKER_ID, MANAGE_TICKER_CODE, callback, error_callback);
}


function append_event_to(container, evnt) {

	var name_entry = $('<div/>',
	{
		"class": "events-row-entry-entry",
		"text": evnt["player_name"]+" ("+evnt["player_number"]+")"
	});

	actionLogo(evnt["action"]).appendTo(container);
	name_entry.appendTo(container);

	var info_button = $('<div/>',
		{
			"class": "events-row-entry-entry event-info-button",
			"html": '<i class="fa fa-info-circle"></i>',
			"onclick": 'eventInfo("'+evnt["id"]+'")'
		});

	info_button.appendTo(container);
}

function eventInfo(event_id) {
	evnt = null;
	$.each(EVENTS, function(index, e) {
		if(e["id"] == event_id) {
			evnt = e;
			return true;
		}
	});

	if(evnt != null) {

		var html_code = "Event Type: "+localizeEventType(evnt["action"])+"<br>";
		html_code += "Player: "+evnt["player_name"]+" ("+evnt["player_number"]+")";

		if(evnt["info"].trim().length > 0) {
			html_code += "<br>Info: "+evnt["info"];
		}
	
		swal({
			title: 'Event information',
			html: html_code,
		});
	}
}

function postEvent() {
	var team_letter = $("#team-select").val().split("-")[1];
	var player_number = $("#player-number-input").val();
	var player_name = $("#player-name-input").val();
	var action = $("#action-select").val();
	var info = $("#additional-info").val();

	//validating inputs
	var error = null;

	if(player_number.trim().length < 1) {
		error = 'The Player Number may not be empty';
	} else if(player_name.trim().length < 1 || player_name.trim().length > 30) {
		error = 'The Player Name may not be empty';
	}

	if(error != null) {
		sweetAlert('Could not post Event', error, 'error');
		return;
	}

	var callback = function(data) {
		update_manage_ticker(data["ticker"]);
		clearEventInputs();
	};

	var error_callback = function(data) {
		unknown_error();
	};

	var team = 0;
	if(team_letter == "b") team = 1;

	post_event(MANAGE_TICKER_ID, MANAGE_TICKER_CODE, team, action, player_number, player_name, info, callback, error_callback);
}

function clearEventInputs() {
	$("#team-select")[0].selectedIndex = 0;
	$("#action-select")[0].selectedIndex = 0;
	$("#player-number-input").val('');
	$("#player-name-input").val('');
	$("#additional-info").val('');
}

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

	var div = $(document.createElement('div')).addClass('player').addClass('overlay-container').addClass('player-'+team).attr('id', 'player-'+team+'-'+id);

	//TODO: Set default value to next free number
	var number_html = '<input type="number" class="player-number border">'
	$(number_html).appendTo(div);

	var name_html = '<input type="text" class="player-name border" placeholder="Player Name" maxlength="30">';
	$(name_html).appendTo(div);

	var remove_html = '<div class="overlay-right border" onclick="removePlayer(\''+team+'\', '+id+')"><i class="fa fa-times"></i></div>'
	$(remove_html).appendTo(div);

	div.appendTo(container);

	resize();
	applyRangeChecks();
}

function removePlayer(team, id) {
	$('#player-'+team+'-'+id).remove();
	resize();
}

function removeEvent(event_id) {
	//Possibly TODO
}

function actionLogo(action) {
	var src = "/icon/";
	if(action == "free" || action == "penalty" || action == "corner") {
		src += "foul"
	} else if(action == "yrc") {
		src += "rc";
	} else {
		src += action;
	}

	src += ".png";

	return $('<img>').attr('class', 'events-row-entry-entry event-img').attr('src', src);
}

function localizeEventType(event_type) {
	var text = "";
	$("#action-select > option").each(function() {
		if(this.value == event_type) {
			text = this.text;
			return true;
		}
	});

	return text;
}

function resetUI() {
	hideWrappers();
	$("#load-manage-button").show();
	$("#create-wrapper").show();

	$(".button-expansion").hide();

	EVENTS = [];
	TO_UPDATE = null;
	MANAGE_TICKER_ID = null;
	MANAGE_TICKER_CODE = null;
}
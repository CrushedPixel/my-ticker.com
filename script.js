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

window.onresize = resize;

//initially call the resize function to set the div's sizes
setTimeout(resize, 1000);
setTimeout(applyComboJS, 1000);

//adds a new player to one of the teams. team is either 'a' or 'b'.
function addPlayer(team) {
	var container = $('#players-team-'+team);

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
}
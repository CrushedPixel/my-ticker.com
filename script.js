function resize() {
	$(".events").height($(".event-overview").height() - $(".header").height() - $(".timer").height());
	$(".new-info-input").height($(".new-event").height() - $(".new-footer").height());
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

window.onresize = resize;

//initially call the resize function to set the div's sizes
setTimeout(resize, 1000);

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

	//TODO: identify entries with an ID, to be able to remove them
	//TODO: Set default value to next free number
	var number_html = '<input type="number" class="player-number">'
	$(number_html).appendTo(div);

	var name_html = '<input type="text" class="player-name" placeholder="Player Name">';
	$(name_html).appendTo(div);

	var remove_html = '<div class="player-remove-button" onclick="removePlayer(\''+team+'\', '+id+')"><i class="fa fa-times"></i></div>'
	$(remove_html).appendTo(div);

	div.appendTo(container);

	resize();
	applyRangeChecks();
}

function removePlayer(team, id) {
	$('#player-'+team+'-'+id).remove();
}
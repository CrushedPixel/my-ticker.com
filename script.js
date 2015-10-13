function resize() {
	$(".events").height($(".event-overview").height() - $(".header").height() - $(".timer").height());
	$(".new-info-input").height($(".new-event").height() - $(".new-footer").height());
}

window.onresize = resize;

//initially call the resize function to set the div's sizes
setTimeout(resize, 1000);

//adds a new player to one of the teams. team is either 'a' or 'b'.
function addPlayer(team) {
	var container = $('#players-team-'+team);

	var div = $(document.createElement('div')).addClass('player').addClass('player-'+team).html('a new player').appendTo(container);

	resize();
}

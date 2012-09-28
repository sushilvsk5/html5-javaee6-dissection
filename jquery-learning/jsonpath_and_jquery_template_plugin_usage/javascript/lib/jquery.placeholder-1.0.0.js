
$(document).ready(function() {
	activateHolders();
});

function activateHolders(){
	$("input[type=text]").each(function(){
		if ($(this).attr("holder") != "") {
			if ($(this).val() == "") {
				$(this).val($(this).attr("holder"));
				$(this).addClass("holder");
			}
			$(this).focus(function() {
				if ($(this).hasClass("holder")) {
					$(this).val("");
					$(this).removeClass("holder");
				}
			});
			$(this).blur(function() {
				if ($(this).val() == "") {
					$(this).val($(this).attr("holder"));
					$(this).addClass("holder");
				}
			});
		}
	});
}
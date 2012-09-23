$(document).ready(function() {
	$(".nav").click( checkForCode );
	
	function getRandom(num){
		var my_num = Math.floor(Math.random()*num);
		return my_num;
	}
	var hideCode = function(){
		var numRand = getRandom(4);
		$(".nav").each(function(index, value) {
			if(numRand == index){
				$(this).append("<span id='has_discount'></span>");
				return false;
			}
		});
	}
	hideCode();
	function checkForCode(){
		var discount;
		if($.contains(this, document.getElementById("has_discount") ) )
		{
			var my_num = getRandom(5);
			discount = "<p>Your Discount is "+my_num+"%</p>" ;
		}else{
			discount = "<p>Sorry, no discount!</p>" ;
		}
		$(this).append(discount);
		$(".nav").each( function(){
			$(this).unbind('click');
		});
	}
}); //End document.ready()
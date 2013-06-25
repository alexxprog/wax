jQuery(function($) {
	var sWdt = $(window).width();
	var sHgt = $(window).height();
	
	function setDims(){
		sWdt = $(window).width();
		sHgt = $(window).height();

		$(".colct_list .item").width(sWdt/100*33.3);
	}
//    var root = $('.colct_list').scrollable({circular: true, autopause: true, next: "#mnext", prev: "#mprev", keyboard: true}).autoscroll({ autoplay: true, autopause: false });
	  $(window).load(function(){
			$(window).resize(function(){
				setDims();
			});

			setDims();
			
			//Move all slides on the right side out of frame
			$(".colct_list .item").css({
				"position": "relative",
				"left": sWdt+"px",
				"visibility": "visible"
			});
			
			//Animation for first five slides
			var slides = $(".colct_list .item").length;
			//console.log("slides: "+slides);
			var index = 0;
			var startSlidesAnimation = setInterval(function(){
				//console.log("index: "+index);
				if(index < slides && index < 5){
					$(".colct_list .item").eq(index).animate({
						left: 0
					}, 500, function(){
					});
					index ++;
				}else clearInterval(startSlidesAnimation);
			}, 500);
			
			//Put in correct position the rest of the slides and initialize the slider 
			setTimeout(function(){
				//console.log(index);
				$(".colct_list .item").css({
					"left": 0
				}); 
				//console.log("scrollable");
				var coll_slider = $('#slider').scrollable({
					circular: false, 
					autopause: true, 
					next: ".slide_r", 
					prev: ".slide_l", 
					keyboard: true
				}).navigator({
					navi: ".cl_num",
					activeClass: "cl_curr",
					naviItem: "li"
				}).activator();
				//Get slider api
				scrollableApi = coll_slider.data("scrollable");
			}, 5*570);
		});

});

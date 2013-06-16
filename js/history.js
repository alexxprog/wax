jQuery(function($) {
	//Width of minimized block
	var smWidth = 200;
	
	//Init blocks dimentions after load/resize 
	function historyBlocksInit(){
		if($(".hist_list li").length > 1){
			smWidth = $(".hist_list li:last").innerWidth();
			$(".hist_list").css({"min-height": smWidth});
			$(".hist_list li:not(.fl_left_act)").css({"height": smWidth});
		}
//console.log(smWidth);
	}
	
	$(window).load(function(){
		historyBlocksInit();
		
		//reposition block on click
		$(".hist_list").on("click", "li:not(.fl_left_act)", function(){
			var activeIndex = $(this).index();
			$(".fl_left_act .hist_img img").css({"height": "auto"});
			
			$(".fl_left_act .item_dtl").fadeOut(function(){
				var bgWidth = $(".fl_left_act .hist_img img").width();
console.log(bgWidth);
				
				$(".fl_left_act").animate({
					height: bgWidth+"px"
				}, 500, function(){
					//$(this).removeClass("fl_left_act");
					$(this).find(".hist_img").css({"width": bgWidth+"px", "overflow": "hidden"}).animate({
						width: smWidth,
						height: smWidth
					}, 500, function(){
						$(this).find("img").css({"max-width": "100%", "min-width": "100%"});
						$(this).parent().css({"height": smWidth+"px", "margin-right": "89%"}).removeClass("fl_left_act");
						$(this).css({"max-width": "100%", "min-width": "100%", "height": "100%"});
					});
					/*
					 * */
				});
			});
			
		});

		//If window resized do this stuff
		$(window).resize(function(){
			historyBlocksInit();
		});
	});
});

jQuery(function($) {
	//Width of minimized block
	var smWidth = 200;
	var bgWidth = $(".fl_left_act .hist_img img").width();
	
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
		
		/*
		 * Move Item to new position
		 * @param (int) index - index of item in list
		 * @param (string) direction - can be "left" or "right"
		 */
		function moveItem(index, direction){
			var item = $(".hist_list li").eq(index);
			if(direction == 'left'){
				item.css({"margin-left": index*11+"%"});
				item.animate({
					marginRight: 100-((index+1)*11)+"%"
				}, 500, function(){
				});
			}else{
				item.animate({
					marginRight: ($(".hist_list li:not(.fl_left_act)").length-1-index)*11+"%"
				}, 500, function(){
					$(this).css({"margin-left": 0});
				});
				item.css({"margin-left": 0});
			}
		}
		
		function expandItem(index){
			var expandable = $(".hist_list li").eq(index);
			expandable.find(".item_dtl").hide();
			expandable.find(".hist_img").css({"width": smWidth+"px", "height": smWidth+"px", "overflow": "hidden"});
			expandable.addClass("fl_left_act").css({"margin-right": 0, "height": "100%"}).find(".hist_img").animate({
				width: 33+"%",
				height: bgWidth+"px"
			}, 500, function(){
				$(this).animate({
					height: 100+"%"
				}, 1000, function(){
					$(this).css({"overflow": "visible"});
					expandable.find(".item_dtl").fadeIn();
				});
			});
		}
		
		//reposition block on click
		$(".hist_list").on("click", "li:not(.fl_left_act)", function(){
			var clickedIndex = $(this).index();
			var openedIndex = $(".fl_left_act").index();
//console.log('clicked: '+clickedIndex+' opened: '+openedIndex);			
			$(".fl_left_act .hist_img img").css({"height": "auto"});
			
			$(".fl_left_act .item_dtl").fadeOut(function(){
//console.log(bgWidth);
				
				$(".fl_left_act").animate({
					height: bgWidth+"px"
				}, 500, function(){
					//$(this).removeClass("fl_left_act");
					$(this).find(".hist_img").css({"width": bgWidth+"px", "overflow": "hidden"}).animate({
						width: smWidth,
						height: smWidth
					}, 500, function(){
						$(this).find("img").css({"max-width": "100%", "min-width": "100%"});
						$(this).parent().css({"height": smWidth+"px", "margin-right": (100-(($(this).parent().index()+1)*11))+"%"}).removeClass("fl_left_act");
//						$(this).css({"max-width": "100%", "min-width": "100%", "height": "100%"});
						$(this).css({"max-width": "100%", "height": "100%"});
						var timeout = 0;
						if(clickedIndex < openedIndex){
							var n = openedIndex;
							timeout = (openedIndex-clickedIndex)*500;
//							while (n > clickedIndex) {
	//						}
							var interval = setInterval(function(){
								if(n <= clickedIndex) clearInterval(interval);
								else{
									moveItem(n, "right");
									n --;
								}
							}, 500);
						}else{
							var n = openedIndex;
							timeout = (clickedIndex-openedIndex)*500;
							var interval = setInterval(function(){
								n++;
								if(n >= clickedIndex) clearInterval(interval);
								moveItem(n, "left");
							}, 500);
						}
						
						setTimeout(function(){
							expandItem(clickedIndex);
						}, timeout+1000);
					});
				});
			});
			
		});

		//If window resized do this stuff
		$(window).resize(function(){
			historyBlocksInit();
		});
	});
});

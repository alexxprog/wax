jQuery(function($) {
//    var root = $('.colct_list').scrollable({circular: true, autopause: true, next: "#mnext", prev: "#mprev", keyboard: true}).autoscroll({ autoplay: true, autopause: false });
    var root = $('#slider').scrollable({
    		circular: true, 
    		autopause: true, 
    		next: ".slide_r", 
    		prev: ".slide_l", 
    		keyboard: true
    	}).navigator({
		    	navi: ".cl_num",
		    	activeClass: "cl_curr",
		    	naviItem: "li"
		    });
    scrollableApi = root.data("scrollable");

});

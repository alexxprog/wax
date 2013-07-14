jQuery(function($) {
	var sWdt = $(window).width();
	var sHgt = $(window).height();
	
	function setDims(){
		sWdt = $(window).width();
		sHgt = $(window).height();

//		if(!$(".colct_list .item.opened")) 
			$(".colct_list .item:not(.opened)").width(sWdt/100*33.3);
			$(".colct_list li .form_wrap").height($(".colct_list li:first-child").height());
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

	  // Share link click
		$(".icon_share").click(function(e){
			e.preventDefault();
			if(!$(this).hasClass("clicked")) $(this).addClass("clicked");
		});

	  // Print window open
		$("#print-order-btn").click(function(e){
			e.preventDefault();
			var newCollectionPrintWindow = window.open("/print.html", 'Collection item');
			if(!$(this).hasClass("clicked")) $(this).addClass("clicked");
		});
	  
	  $(".icon_send").click(function(e){
		  e.preventDefault();
		  var sendLink = $(this);
		  if(!$(this).hasClass("clicked")){ 
			  $(this).text("").addClass("clicked");
			  var emailform = $(this).next("form");
			 // console.dir(emailform);
			emailform.fadeIn().validate({
				//debug: true,
				cancelSubmit: true,
				//validation rules.
				rules: {
				    email: { //check element with the name email
				      required: true, //this is required field
				      email: true //check for valid email address
				    }
				},
				//custom error messages
				messages: {
					email: {
						required: 'Enter this!',
						email: "Please enter valid email!",
					}
				},
				success: function(label, element) {
					emailform.find(".cl-email-sbmt").show();
					label.remove();
				},
				errorPlacement: function(error, element) {
					emailform.find(".cl-email-sbmt").hide();
					error.insertAfter( element );
				},
				submitHandler: function(form){
					emailform.find(".cl-email-sbmt").hide();
					$.post(emailform.attr("action"), emailform.serialize(), function(data){
						if(typeof(data)  !== "undefined"){
							if(typeof(data.error)  !== "undefined" && data.error != ''){
								emailform.append($('<label for="email" class="error">'+data.error+'</label>'));
							}else{
								emailform.fadeOut().find(".cl-email-sbmt").show();
								sendLink.addClass("sent").text("sent");
								return false;
							}
						}
					}, 
					"json"
					);
				}
			  });
		  }
	  });
	  
	  
	  $(".icon_rent").click(function(e){
		  e.preventDefault();
		  var sendLink = $(this);
		  if(!$(this).hasClass("clicked")){
			  $(this).addClass("clicked");
			  scrollableApi = $('#slider').data("scrollable");
			  scrollableApi.seekTo(scrollableApi.getIndex());
console.log(scrollableApi.getIndex());
console.log($(".colct_list li").eq(scrollableApi.getIndex()));
//$(".colct_list li.opened").eq(scrollableApi.getIndex()).css({"max-width": "100%"}).animate({
			  $(".colct_list li.opened").css({"max-width": "100%"}).animate({
				  width: scrollableApi.getRoot().width()
			  }, 500, function(){
				  $(".slide_l, .slide_r").fadeOut();
				  $(".cl_num").fadeOut();
				  $(this).find(".form_wrap").fadeIn().jScrollPane({
					  verticalDragMaxHeight: 110,
					  verticalDragMinHeight: 110,
					  autoReinitialise: true
				  });
				  var rentform = $(this).find(".form_wrap form");
				  rentform.validate({
						//debug: true,
						cancelSubmit: true,
						//validation rules.
						rules: {
						    firstname: { //check element with the name firstname
						      required: true //this is required field
						    },
							  lastname: { //check element with the name firstname
								  required: true //this is required field
							  }
						},
						//custom error messages
						messages: {
							firstname: {
								required: 'Enter first name!'
							},
							lastname: {
								required: 'Enter last name!'
							}
						},
						success: function(label, element) {
							//emailform.find(".cl-email-sbmt").show();
							label.remove();
							//console.log("success");
							rentform.find(".form_err .send-error").remove();
							if(rentform.find(".form_err").html() == '') rentform.find(".form_err:visible").fadeOut();
						},
						errorPlacement: function(error, element) {
							//console.log("error: "+error.text());
							//emailform.find(".cl-email-sbmt").hide();
							if(error.text() != ''){
								rentform.find(".form_err").append( error );
								rentform.find(".form_err:hidden").fadeIn();
							}
						},
						submitHandler: function(form){
							console.log("form sending");
							//alert("sending");
							rentform.find(".btn_send").attr("disabled", "disabled");
							rentform.find(".btn_send").removeClass("btn_err");
							$.post(rentform.attr("action"), rentform.serialize(), function(data){
								if(typeof(data)  !== "undefined"){
									if(typeof(data.error)  !== "undefined" && data.error != ''){
										rentform.find(".form_err").append($('<label class="error send-error">'+data.error+'</label>')).fadeIn();
										rentform.find(".btn_send").removeAttr("disabled");
										rentform.find(".btn_send").removeClass("btn_suc");
										rentform.find(".btn_send").addClass("btn_err");
									}else{
										if(typeof(data.message)  !== "undefined" && data.message != ''){
											rentform.find(".form_suc").html(data.message).fadeIn();
										}
										rentform.find(".form_err .send-error").remove();
										rentform.find(".btn_send").addClass("btn_suc").text("Sent");
										return false;
									}
								}
							}, 
							"json"
							);
							/*
							 * */
							return false;
						}
					  });
			  }).addClass("rent");
		  }
	  });
	  
});

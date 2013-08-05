jQuery(function($) {
	function resizeContactSlider(){
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		//console.log('window: '+wHeight+' header: '+$(".contact-header").outerHeight(true)+' panel: '+$(".contact-cnt").outerHeight(true));
		var contentHeight = wHeight-$(".contact-header").outerHeight(true)-$(".contact-cnt").outerHeight(true);
		$('.contact-content').height(contentHeight);
		if($('#contact-slider')){
			$('#contact-slider li').width(wWidth).height(contentHeight-1);
		}
		if($('#map_canvas')) $('#map_canvas').height(contentHeight-1);
	}
	
	$(window).load(function(){
		resizeContactSlider();
		
		$('#contact-slider').flexslider({
			animation: "fade",
			slideshow: true,
			smoothHeight: false,
			controlNav: false,
			directionNav: false,
			keyboard: false,
			start: function(){
			}
		});
		
		$("#contact-map-btn").click(function(e){
			e.preventDefault();
			$("#contact-slider").toggle();
			$("#map_canvas").toggle();
			if($("#map_canvas").is(":visible")) initialize();
			$(this).toggleClass("pressed");
		});
		
		$("#sm-address").click(function(e){
			e.preventDefault();
			$(".contact-cnt div:visible, .contact-cnt form:visible").fadeOut(function(){
				$(".contact-cnt").height(37).find(".address").fadeIn("fast", function(){ resizeContactSlider(); });
			});
			resizeContactSlider();
		});
		
		$("#sm-schedule").click(function(e){
			e.preventDefault();
			$(".contact-cnt div:visible, .contact-cnt form:visible").fadeOut(function(){
				$(".contact-cnt").height(37).find(".schedule").fadeIn("fast", function(){ resizeContactSlider(); });
			});
			resizeContactSlider();
		});
		
		$("#sm-email-form").click(function(e){
			e.preventDefault();
			$(".contact-cnt div:visible, .contact-cnt form:visible").fadeOut(function(){
				$(".contact-content").fadeOut("fast", function(){
					$(".contact-cnt").height(130).find("form").fadeIn("fast", function(){ resizeContactSlider(); $(".contact-content").fadeIn(); });
				});
			});
			$("#contactform").trigger('reset').find("input, textarea").removeAttr("disabled");
		});
		
		var contactform = $("#contactform");
		var errCount = 0;
		var validator = contactform.validate({
			debug: true,
			cancelSubmit: true,
			ignore: ".ignore",

			//validation rules.
			rules: {
			    email: { //check element with the name email
			      required: true, //this is required field
			      email: true //check for valid email address
			    },
				name: { //check element with the name email
					required: true, //this is required field
					minlength: 3 //check if name length 3 or more letters 
				},
				message: { //check element with the name email
					required: true //this is required field
				}
			},
			//custom error messages
			messages: {
				email: {
					required: 'Required field!',
					email: "Please enter valid email!"
				},
				name: {
					required: 'Required field!',
					email: "Your name must be 3 or more letters!"
				},
				message: {
					required: 'Required field!'
				}
			},
			success: function(label, element) {
				if(validator.numberOfInvalids() == 0 || $("#sbm-btn").val() == ''){
					//console.log("success");
					$("#sbm-btn").removeClass("cf_btn_err").removeAttr("disabled").val("SEND");
				}
			},
			errorPlacement: function(error, element) {
				//console.log(validator.numberOfInvalids());
				//emailform.find(".cl-email-sbmt").hide();
				if(!$("#sbm-btn").hasClass("cf_btn_err")) $("#sbm-btn").addClass("cf_btn_err");
				if(error.text() != '') $("#sbm-btn").val(error.text());
			},
			submitHandler: function(form){
				//console.log("form sending");
				//alert("sending");
				contactform.find("#sbm-btn").attr("disabled", "disabled");
				$.post(contactform.attr("action"), contactform.serialize(), function(data){
					if(typeof(data)  !== "undefined"){
						if(typeof(data.error)  !== "undefined" && data.error != ''){
							contactform.find("#sbm-btn").addClass("cf_btn_err").removeAttr("disabled").val(data.error);
							return false;
						}else{
							contactform.find("#sbm-btn").addClass("cf_btn_dis").val("SENT");
							validator.resetForm();
							contactform.trigger('reset').find("input, textarea").attr("disabled", "disabled");
							return false;
						}
					}
				}, 
				"json"
				);

				return false;
			}
		});
	});
	
	$(window).resize(function(){
		resizeContactSlider();
	});

});

/**
 * @license 
 * jQuery Tools @VERSION Scrollable - New wave UI design
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/scrollable.html
 *
 * Since: March 2008
 * Date: @DATE 
 */
(function($) { 

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.scrollable = {
		
		conf: {	
			activeClass: 'active',
			circular: false,
			clonedClass: 'cloned',
			disabledClass: 'disabled',
			easing: 'swing',
			initialIndex: 0,
			item: '> *',
			items: '.items',
			keyboard: true,
			mousewheel: false, // fun_do_som
			next: '.next',   
			prev: '.prev', 
			size: 1,
			speed: 400,
			width: 628,
			vertical: false,
			touch: true,
			wheelSpeed: 0
		} 
	};
					
	// get hidden element's width or height even though it's hidden
	function dim(el, key) {
		var v = parseInt(el.css(key), 10);
		if (v) { return v; }
		var s = el[0].currentStyle; 
		return s && s.width && parseInt(s.width, 10);	
	}

	function find(root, query) { 
		var el = $(query);
		return el.length < 2 ? el : root.parent().find(query);
	}
	
	var current;		
	
	// constructor
	function Scrollable(root, conf) {
		
		// current instance
		var self = this, 
			 fire = root.add(self),
			 itemWrap = root.children(),
			 index = 0,
			 vertical = conf.vertical;
				
		if (!current) { current = self; } 
		if (itemWrap.length > 1) { itemWrap = $(conf.items, root); }
		//conf.width = current.width();
		
		
		// in this version circular not supported when size > 1
		if (conf.size > 1) { conf.circular = false; } 
		
		// methods
		$.extend(self, {
				
			getConf: function() {
				return conf;	
			},			
			
			getIndex: function() {
				return index;	
			}, 

			getSize: function() {
				return self.getItems().size();	
			},

			getNaviButtons: function() {
				return prev.add(next);	
			},
			
			getRoot: function() {
				return root;	
			},
			
			getItemWrap: function() {
				return itemWrap;	
			},
			
			getItems: function() {
				return itemWrap.find(conf.item).not("." + conf.clonedClass);	
			},

            getAllItems: function() {
				return itemWrap.find(conf.item);
			},

			move: function(offset, time) {
				return self.seekTo(index + offset, time);
			},
			
			next: function(time) {
				return self.move(conf.size, time);	
			},
			
			prev: function(time) {
				return self.move(-conf.size, time);	
			},
			
			begin: function(time) {
				return self.seekTo(0, time);	
			},
			
			end: function(time) {
				return self.seekTo(self.getSize() -2, time);	
			},	
			
			focus: function() {
				current = self;
				return self;
			},
			
			addItem: function(item) {
				item = $(item);
				
				if (!conf.circular)  {
					itemWrap.append(item);
					next.removeClass("disabled");
					
				} else {
					itemWrap.children().last().before(item);
					itemWrap.children().first().replaceWith(item.clone().addClass(conf.clonedClass)); 						
				}
				
				fire.trigger("onAddItem", [item]);
				return self;
			},
			
			closeItem: function(){
				//console.log(conf.items+" .selected");
				if($(".opened")){
					var wOpn = $(".opened .cl_img").width();
					$(".opened").find(".form_wrap:visible").fadeOut();
					$(".slide_l:hidden, .slide_r:hidden").fadeIn();
					$(".cl_num:hidden").fadeIn();
					$(".opened").find(".cl_dtl").fadeOut("fast", function(){
						$(".opened").animate({
							width: wOpn
						}, 500, function(){
							$(this).removeClass("opened");
							$(this).removeClass("rent");
						});
						itemWrap.removeClass("selected");
					});
				}
			},
			
			openItem: function(i, timeout){
				// ensure numeric index
				if (!i.jquery) { i *= 1; }
				
				if(!timeout) timeout = 500;
				
				// avoid seeking from end clone to the beginning
				if (conf.circular && i === 0 && index == -1 && time !== 0) { return self; }
				
				// check that index is sane				
				if (!conf.circular && i < 0 || i > self.getSize() || i < -1) { return self; }
				
				var item = i;
				
				if (i.jquery) {
					i = self.getItems().index(i);	
					
				} else {
					item = self.getItems().eq(i);
				}
				
				if(item.hasClass("opened")) return;
				
				itemWrap.addClass("selected");
				var wAct = item.innerWidth();
				setTimeout(function(){
					item.css({"max-width": wAct*2+"px"}).find(".cl_img").width(wAct);
					item.animate({
						width: wAct*2
					}, 500);
					
					var offset = -item.position().left;
					var dif = self.getRoot().width() - wAct*2;
					if(dif){
						offset += dif/2;
					}
					//console.log("left: "+$(this).position().left+"  width: "+wAct*2);
					itemWrap.animate({
						left: offset
					}, 500, function(){
						item.find(".cl_dtl").width(wAct).fadeIn();
						item.addClass("opened");
					});
				}, timeout);
			},
			
			/* all seeking functions depend on this */		
			seekTo: function(i, time, fn) {
console.log("seekTo: "+i);				
				// ensure numeric index
				if (!i.jquery) { i *= 1; }
				
				// avoid seeking from end clone to the beginning
				if (conf.circular && i === 0 && index == -1 && time !== 0) { return self; }
				
				// check that index is sane				
				if (!conf.circular && i < 0 || i > self.getSize() || i < -1) { return self; }
				
				var item = i;
			
				if (i.jquery) {
					i = self.getItems().index(i);	
					
				} else {
					item = self.getItems().eq(i);
				}  
				
				if(item.length == 0) { return self; }
/* ======================================= */				
				var itemsW = 0;
				self.getAllItems().each(function(){
					$(this).removeClass('active');
					itemsW += $(this).outerWidth();
				});
                item.addClass('active');
                self.getAllItems().removeClass("selected");
/* ======================================= */				
                
				// onBeforeSeek
				var e = $.Event("onBeforeSeek"); 
				if (!fn) {
					setTimeout(function(){
						fire.trigger(e, [i, time]);				
						if (e.isDefaultPrevented() || !item.length) { return self; }			
					}, 500);
				}  
	
                if(vertical){
                    var props = {top: -item.position().top};
               }else{
            	   if (!conf.circular){
            		   var rootW = self.getRoot().width();
            		   var shiftW = self.getItemWrap().position().left;
            		   var restW = itemsW - Math.abs(shiftW) - rootW;
            		   
//console.log("itemsW: "+itemsW+" rootW: "+rootW+" shiftW: "+shiftW+" restW: "+restW+" props.left: "+item.position().left);

            		   var offset = -item.position().left;
            		   if(shiftW != 0){
            			   var direction = 0;
            			   if((shiftW-(-item.position().left)) < 0) direction = -1;
            			   else direction = 1;
            			   
            			   if(direction > 0){
            				   //console.log((-shiftW+rootW) +"="+ itemsW+" dir: "+direction); 
            				   if(-shiftW+rootW == itemsW) { 
            					   return self; 
            				   }
            				   if(item.position().left+rootW > itemsW) { 
            					   //console.log("possible shift: "+(item.position().left+rootW) +"-"+ itemsW +"="+ (item.position().left+rootW - itemsW)); 
            					   //console.log("shiftW + rootW: " +(-shiftW) +"+"+ rootW +"="+ ((-shiftW)+rootW)); 
            					   offset = shiftW - (itemsW+shiftW-rootW); 
            					   //console.log("offset: " + offset); 
            				   }
            				   //if(item.position().left+rootW < itemsW) { console.log("2"); offset += item.position().left+rootW - itemsW; }
            			   } //else find(self.getRoot(), conf.next).removeClass("disabled");
            		   }
            		   if(rootW == itemsW) { return self; }
            		   
            		   var props = {left: offset};
            	   }else{ var props = {left: -item.position().left}; }
               }				
				
				index = i;
				current = self;  
				if (time === undefined) { time = conf.speed; }   
				
				itemWrap.animate(props, time, conf.easing, fn || function() { 
					fire.trigger("onSeek", [i]);		
				});	 
				
				return self; 
			},
			
			/* all seeking functions depend on this */		
			seekToCenter: function(i, time, fn) {
				// ensure numeric index
				if (!i.jquery) { i *= 1; }
				
				// avoid seeking from end clone to the beginning
				if (conf.circular && i === 0 && index == -1 && time !== 0) { return self; }
				
				// check that index is sane				
				if (!conf.circular && i < 0 || i > self.getSize() || i < -1) { return self; }
				
				var item = i;
				
				if (i.jquery) {
					i = self.getItems().index(i);	
					
				} else {
					item = self.getItems().eq(i);
				}  
				/* ======================================= */				
				self.getAllItems().each(function(){
					$(this).removeClass('active');
				});
				item.addClass('active');
				/* ======================================= */				
				
				// onBeforeSeek
				var e = $.Event("onBeforeSeek"); 
				if (!fn) {
					setTimeout(function(){
						fire.trigger(e, [i, time]);				
						if (e.isDefaultPrevented() || !item.length) { return self; }			
					}, 500);
				}  
				
                if(vertical){
                    props = {top: -item.position().top};
               }else{
                   //console.log(item)
                   var offset = -item.position().left;
                   var dif = self.getRoot().width() - item.width();
                   if(dif){
                       offset += dif/2;
                   }
                   props =  {left: offset};
               }				
				
				index = i;
				current = self;  
				if (time === undefined) { time = conf.speed; }   
				
				itemWrap.animate(props, time, conf.easing, fn || function() { 
					fire.trigger("onSeek", [i]);
				});	 
				
				return self; 
			}					
			
		});
				
		// callbacks	
		$.each(['onBeforeSeek', 'onSeek', 'onAddItem'], function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).on(name, conf[name]); 
			}
			
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;
			};
		});  
		
		// circular loop
		if (conf.circular) {
			
			var cloned1 = self.getItems().slice(-1).clone().prependTo(itemWrap),
				 cloned2 = self.getItems().eq(1).clone().appendTo(itemWrap);

			cloned1.add(cloned2).addClass(conf.clonedClass);
			
			self.onBeforeSeek(function(e, i, time) {
				
				if (e.isDefaultPrevented()) { return; }
				
				/*
					1. animate to the clone without event triggering
					2. seek to correct position with 0 speed
				*/
				if (i == -1) {
					self.seekTo(cloned1, time, function()  {
						self.end(0);		
					});          
					return e.preventDefault();
					
				} else if (i == self.getSize()) {
					self.seekTo(cloned2, time, function()  {
						self.begin(0);		
					});	
				}
				
			});

			// seek over the cloned item

			// if the scrollable is hidden the calculations for seekTo position
			// will be incorrect (eg, if the scrollable is inside an overlay).
			// ensure the elements are shown, calculate the correct position,
			// then re-hide the elements. This must be done synchronously to
			// prevent the hidden elements being shown to the user.

			// See: https://github.com/jquerytools/jquerytools/issues#issue/87

			var hidden_parents = root.parents().add(root).filter(function () {
				if ($(this).css('display') === 'none') {
					return true;
				}
			});
			if (hidden_parents.length) {
				hidden_parents.show();
				self.seekTo(0, 0, function() {});
				hidden_parents.hide();
			}
			else {
				self.seekTo(0, 0, function() {});
			}

		}
		
		// next/prev buttons
		var prev = find(root, conf.prev).click(function(e) { e.stopPropagation(); self.prev(); }),
			 next = find(root, conf.next).click(function(e) { e.stopPropagation(); self.next(); }); 
		
		if (!conf.circular) {
			self.onBeforeSeek(function(e, i) {
				setTimeout(function() {
					if (!e.isDefaultPrevented()) {
//console.log(i+"---"+self.getSize()-1);
//console.log();
						prev.toggleClass(conf.disabledClass, i <= 0);
						next.toggleClass(conf.disabledClass, i >= self.getSize() -1);
					}
				}, 1);
			});
			
			if (!conf.initialIndex) {
				prev.addClass(conf.disabledClass);	
			}			
		}
			
		if (self.getSize() < 2) {
			prev.add(next).addClass(conf.disabledClass);	
		}
			
		// mousewheel support
		if (conf.mousewheel && $.fn.mousewheel) {
			root.mousewheel(function(e, delta)  {
				if (conf.mousewheel) {
					self.move(delta < 0 ? 1 : -1, conf.wheelSpeed || 50);
					return false;
				}
			});			
		}
		
		// touch event
		if (conf.touch) {
			var touch = {};
			
			itemWrap[0].ontouchstart = function(e) {
				var t = e.touches[0];
				touch.x = t.clientX;
				touch.y = t.clientY;
			};
			
			itemWrap[0].ontouchmove = function(e) {
				
				// only deal with one finger
				if (e.touches.length == 1 && !itemWrap.is(":animated")) {			
					var t = e.touches[0],
						 deltaX = touch.x - t.clientX,
						 deltaY = touch.y - t.clientY;
	
					self[vertical && deltaY > 0 || !vertical && deltaX > 0 ? 'next' : 'prev']();				
					e.preventDefault();
				}
			};
		}
		
		if (conf.keyboard)  {
			
			$(document).on("keydown.scrollable", function(evt) {

				// skip certain conditions
				if (!conf.keyboard || evt.altKey || evt.ctrlKey || evt.metaKey || $(evt.target).is(":input")) { 
					return; 
				}
				
				// does this instance have focus?
				if (conf.keyboard != 'static' && current != self) { return; }
					
				var key = evt.keyCode;
			
				if (vertical && (key == 38 || key == 40)) {
					self.move(key == 38 ? -1 : 1);
					return evt.preventDefault();
				}
				
				if (!vertical && (key == 37 || key == 39)) {					
					self.move(key == 37 ? -1 : 1);
					return evt.preventDefault();
				}	  
				
			});  
		}
		
		// initial index
		if (conf.initialIndex) {
			self.seekTo(conf.initialIndex, 0, function() {});
		}
	} 

		
	// jQuery plugin implementation
	$.fn.scrollable = function(conf) { 
			
		// already constructed --> return API
		var el = this.data("scrollable");
		if (el) { return el; }		 

		conf = $.extend({}, $.tools.scrollable.conf, conf); 
		
		this.each(function() {			
			el = new Scrollable($(this), conf);
			$(this).data("scrollable", el);	
		});
		
		return conf.api ? el: this; 
		
	};
			
	
})(jQuery);



/**
 * @license 
 * jQuery Tools @VERSION / Scrollable Collection
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://alex-shulga.com
 *
 * Since: June 2013
 * Date: @DATE 
 */
(function($) {	
	var t = $.tools.scrollable; 
	
	t.collection = {
		conf: {
			close: ".close",
			openedClass: "opened",
			img: ".cl_img"
		}
	};		

	
	$.fn.collection = function(conf) {
		
		// configuration
		if (typeof conf == 'string') { conf = {navi: conf}; } 
		conf = $.extend({}, t.collection.conf, conf);
		var api = $(this).data("scrollable");
		
		var getOpened = function(){
			return api.getItemWrap().find("."+conf.openedClass);
		}

		var getClose = function(){
			return $(conf.close);
		}
		
		this.each(function() {
			
			function doClick(el, i, e) {
				api.closeItem();
				if(!el.parent().hasClass(conf.openedClass)){
					var time = getOpened().length ?  1000 : 1;
					setTimeout(function() {
						api.seekToCenter(i).openItem(i, 1000);
					}, time);
				}
				e.preventDefault(); 
			}
			
			//bind click to slider items
			api.getAllItems().each(function(){
				var i = $(this).index();
				$(this).find(conf.img).click(function(e){
					doClick($(this), i, e);
					e.preventDefault(); 
				});
			});

		});
		
		//bind click to close buttons
		getClose().click(function(e){
			e.preventDefault();
			var i = $(this).parents("."+conf.openedClass).index();
			api.closeItem();
			setTimeout(function() {
				api.seekToCenter(i);
			}, 1000);
		});
		
		
		api.move = function(offset, time) {
			if(api.getItemWrap().find("."+conf.openedClass).length){
				api.closeItem();
				setTimeout(function() {
					return api.seekTo(api.getIndex() + offset, time);
				}, 1000);
			}else return api.seekTo(api.getIndex() + offset, time);
		}
			

		return conf.api ? ret : this;
	};

})(jQuery);


/**
 * @license 
 * jQuery Tools @VERSION / Scrollable Accessories
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://alex-shulga.com
 *
 * Since: June 2013
 * Date: @DATE 
 */
(function($) {	
	var t = $.tools.scrollable; 
	
	t.accessory = {
			conf: {
				catClass: ".accs_li",
				acsClass: ".accessory",
				close: ".close",
				openedClass: "opened",
				img: ".cl_img"
			}
	};		
	
	
	$.fn.accessory = function(conf) {
		this.self = this;
		// configuration
		if (typeof conf == 'string') { conf = {}; } 
		conf = $.extend({}, t.accessory.conf, conf);
		var api = $(this).data("scrollable");
		
		var accessories = function(){
				var self = this;
				this.acsQueue = [];
				
				this.getVisibleIndex = function(i, move){
					var hidLen = api.getItemWrap().find(">li:lt(" + i + "):not(:visible)").length;
					var visibleLen = api.getItemWrap().find(">li:lt(" + i + "):visible").length;
					if(move === true){
console.log(api.getItemWrap().find(">li:lt(" + i + "):not(:visible)"));
console.log("li:lt(" + i + "):hidden       i: "+i+" hidLen: "+hidLen+" i-hidLen: "+(i-hidLen));					
					}
//					return visibleLen;
					return i - hidLen;
				}
				
				this.doClick = function(el, i, e) {
//					console.log("click "+i+" "+e);
					api.closeItem();
					if(!el.parent().hasClass(conf.openedClass)){
						var time = self.getOpened().length ?  1000 : 1;
						setTimeout(function() {
							api.seekToCenter(i).openItem(i, 1000);
						}, time);
					}
					e.preventDefault(); 
				}
				
				this.closeAccessories = function(){
					api.getItemWrap().find(conf.acsClass+" "+conf.close).trigger("click");
					api.getItemWrap().find(conf.img+":visible").fadeOut().parent().css({"visibility": "hidden"}).addClass("hide_item");
//					console.log("closeAccessories");
				}
				
				this.closeCategory = function(el){
//					el.fadeOut("fast");
					api.getItemWrap().find(".active").removeClass("active");
					el.addClass("hide_item").css({"visible": "hidden"});
					var elems = el.next();
					if(elems.length > 0){
//console.log($(elems[0]));
						$(elems[0]).addClass("active");
					}
//					console.log("closeCategory");
				}
				
				this.getOpened = function(){
					return api.getItemWrap().find("."+conf.openedClass);
				}				
				
				this.openItem = function(el){
					console.log(el);
					el.find(conf.img).css({"display": "none"});
					el.css({"visibility": "visible"}).width(0).removeClass("hide_item").animate({
						width: $(window).width()/100*33
					}, 500).find(conf.img).fadeIn("slow", function() {
//						console.log(ind+" - "+$(conf.acsClass":first:visible").index());
					});
					var index = self.getVisibleIndex(el.index());
					el.find(conf.img).click(function(e){
						self.doClick($(this), index, e);
					});
//					console.log("openItem");
				}
				
				this.showHiddenCategories = function(){
					api.getItemWrap().find(conf.catClass+".hide_item").removeClass("hide_item").css({"visible": "visible"});
					console.log("showHiddenCategories");
				}
				
				this.runQueue = function(){
//					console.log("Start queue");
//					console.dir(self.acsQueue);
					var startSlidesAnimation = setInterval(function(){
						if(self.acsQueue.length > 0) {
							var line = self.acsQueue.shift();
							(line[0])(line[1]);
						} else clearInterval(startSlidesAnimation);
					}, 300);
				}
				
				this.moveTo = function(i){
					var index = self.getVisibleIndex(api.getItemWrap().find(".active").index(), true);
					console.log("real index: "+api.getItemWrap().find(".active").index()+" visible index: "+index);
					api.seekTo(index);
					return;
					var accessories = api.getRoot().find(".accessory:visible");
					var accessory = api.getRoot().find(conf.acsClass+":hidden").next();
					console.log(accessory);
					if(accessories.length > 0){
						$(accessories[0]).addClass("active");
					}
				}
				
				this.openItems = function(){
					var index = self.getVisibleIndex($(this).index());
					console.log(index);

					self.acsQueue.push({0: api.seekTo, 1: 0});
					if(api.getItemWrap().find(conf.acsClass+":visible").length > 0){
						self.acsQueue.push({0: self.closeAccessories, 1: null});
//						console.log("add closeAccessories");
					}
					if(api.getItemWrap().find(conf.catClass+":hidden").length > 0){
						self.acsQueue.push({0:self.showHiddenCategories, 1:null});
//						console.log("add showHiddenCategories");
					}
					self.acsQueue.push({0: self.closeCategory, 1: $(this)});
//					console.log("add closeCategory");
					$(this).nextUntil(conf.catClass).each(function(){
						self.acsQueue.push({0: self.openItem, 1: $(this)});
//						console.log("add openItem");
					});
					self.acsQueue.push({0: self.moveTo, 1: index});
//					console.log("add closeCategory");
					
					self.runQueue();
				}
		}

		var acc = new accessories();
		setTimeout(function(){
			api.getItemWrap().find(conf.catClass).each(function() {
//				console.log($(this));
				$(this).bind("click", acc.openItems);
			});
		}, 10);
		
		//bind click to close buttons
		/*
		getClose().click(function(e){
			e.preventDefault();
			var i = $(this).parents("."+conf.openedClass).index();
			api.closeItem();
			setTimeout(function() {
				api.seekToCenter(i);
			}, 1000);
		});
		 * */
				
		return conf.api ? ret : this;
	};
	
})(jQuery);


/**
 * @license 
 * jQuery Tools @VERSION / Scrollable Activator
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://alex-shulga.com
 *
 * Since: June 2013
 * Date: @DATE 
 */
/*
(function($) {	
	var t = $.tools.scrollable; 
	
	t.activator = {
		conf: {
		}
	};		
	
	$.fn.activator = function(conf) {
		// configuration
		if (typeof conf == 'string') { conf = {navi: conf}; } 
		conf = $.extend({}, t.activator.conf, conf);
		var api = $(this).data("scrollable");
		this.each(function() {
			
			function doClick(el, i, e) {
				api.closeItem();
				if(!el.parent().hasClass("opened")){
					var time = api.getItemWrap().find(".opened").length ?  1000 : 1;
					setTimeout(function() {
						api.seekToCenter(i).openItem(i, 1000);
					}, time);
				}
				e.preventDefault(); 
			}
			
			//bind click to slider items
			api.getAllItems().each(function(){
				var i = $(this).index();
				$(this).find(".cl_img").click(function(e){
					doClick($(this), i, e);
					e.preventDefault(); 
				});
			});

		});
		
		//bind click to close buttons
		$(".cl_dtl_close").click(function(e){
			e.preventDefault();
			var i = $(this).parents(".item").index();
			api.closeItem();
			setTimeout(function() {
				api.seekToCenter(i);
			}, 1000);
		});
		
		
		api.move = function(offset, time) {
			if(api.getItemWrap().find(".opened").length){
				api.closeItem();
				setTimeout(function() {
					return api.seekTo(api.getIndex() + offset, time);
				}, 1000);
			}else return api.seekTo(api.getIndex() + offset, time);
		}
			

		//api.onBeforeSeek(function(e, index) {
		//}); 
		
		return conf.api ? ret : this;
	};

})(jQuery);
 * */


/**
 * @license 
 * jQuery Tools @VERSION / Scrollable Navigator
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/scrollable/navigator.html
 *
 * Since: September 2009
 * Date: @DATE 
 */
(function($) {
		
	var t = $.tools.scrollable; 
	
	t.navigator = {
		conf: {
			navi: '.navi',
			naviItem: null,		
			activeClass: 'active',
			indexed: false,
			idPrefix: null,
			
			// 1.2
			history: false
		}
	};		
	
	function find(root, query) {
		var el = $(query);
		return el.length < 2 ? el : root.parent().find(query);
	}
	
	// jQuery plugin implementation
	$.fn.navigator = function(conf) {

		// configuration
		if (typeof conf == 'string') { conf = {navi: conf}; } 
		conf = $.extend({}, t.navigator.conf, conf);
		
		var ret;
		
		this.each(function() {
				
			var api = $(this).data("scrollable"),
				 navi = conf.navi.jquery ? conf.navi : find(api.getRoot(), conf.navi), 
				 buttons = api.getNaviButtons(),
				 cls = conf.activeClass,
				 hashed = conf.history && !!history.pushState,
				 size = api.getConf().size;
				 

			// @deprecated stuff
			if (api) { ret = api; }
			
			api.getNaviButtons = function() {
				return buttons.add(navi);	
			}; 
			
			
			if (hashed) {
				history.pushState({i: 0}, '');
				
				$(window).on("popstate", function(evt) {
					var s = evt.originalEvent.state;
					if (s) { api.seekTo(s.i); }
				});					
			}
			
			function doClick(el, i, e) {
				api.seekTo(i);
				e.preventDefault(); 
				if (hashed) { history.pushState({i: i}, ''); }
			}
			
			function els() {
				return navi.find(conf.naviItem || '> *');	
			}
			
			function addItem(i) {  
				
				var item = $("<" + (conf.naviItem || 'a') + "/>").click(function(e)  {
					//doClick($(this), i, e);					
				});
				
				// index number / id attribute
				if (i === 0) {  item.addClass(cls); }
				if (conf.indexed)  { item.text(i + 1); }
				if (conf.idPrefix) { item.attr("id", conf.idPrefix + i); }
				
				return item.appendTo(navi);
			}
			
			
			// generate navigator
			if (els().length) {
				els().each(function(i) { 
					$(this).click(function(e)  {
						/*
						doClick($(this), i, e);		
						 * */
					});
				});
				
			} else {				
				$.each(api.getItems(), function(i) {
					if (i % size == 0) addItem(i); 
				});
			}   
			
			// activate correct entry
			api.onBeforeSeek(function(e, index) {
				setTimeout(function() {
					if (!e.isDefaultPrevented()) {	
						var i = index / size,
							 el = els().eq(i);
							 
						if (el.length) { els().removeClass(cls).eq(i).addClass(cls); }
					}
				}, 1);
			}); 
			
			// new item being added
			api.onAddItem(function(e, item) {
				var i = api.getItems().index(item);
				if (i % size == 0) addItem(i);
			});
			
		});		
		
		return conf.api ? ret : this;
		
	};
	
})(jQuery);			
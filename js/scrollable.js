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
			mousewheel: false,
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
					$(".opened").find(".cl_dtl").fadeOut("fast", function(){
						$(".opened").animate({
							width: wOpn
						}, 500, function(){
							//self.seekToCenter($(".opened").index());
							$(this).removeClass("opened");
						});
						itemWrap.removeClass("selected");
					})
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
				
				/*
				 * */
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
				//console.dir(self.getAllItems());
				self.getAllItems().each(function(){
					$(this).removeClass('active');
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
	
				var props = vertical ? {top: -item.position().top} : {left: -item.position().left};  
				
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
 * jQuery Tools @VERSION / Scrollable Activator
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://alex-shilga.com
 *
 * Since: June 2013
 * Date: @DATE 
 */
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
				api.seekToCenter(i).openItem(i, 1000);
				/*
				api.onSeek(function(e, index) {
					api.openItem(index, 500);
				}); 
				 * */
				e.preventDefault(); 
			}
			
			/*
			api.seekTo = function() {
				console.log("seek");
				return false;	
			}; 
			 * */
			//var next = find(api.getRoot(), conf.next);
			//console.dir(api.getRoot());
			//console.dir(conf);
			//console.dir(next);
			//next.click(function(e) { console.log("seek"); });
			
			api.getAllItems().each(function(){
				var i = $(this).index();
				$(this).find(".cl_img").click(function(e){
					doClick($(this), i, e);
					e.preventDefault(); 
				});
			});

		});
		
		$(".cl_dtl_close").click(function(e){
			e.preventDefault();
			var i = $(this).parents(".item").index();
			api.closeItem();
			api.seekToCenter(api.getItemWrap().find(".active"));
		});
		
		
		api.move = function(offset, time) {
			api.closeItem();
			setTimeout(function() {
				return api.seekTo(api.getIndex() + offset, time);
			}, 1000);
		},
			

		api.onBeforeSeek(function(e, index) {
		}); 
		
		return conf.api ? ret : this;
	};

})(jQuery);


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
					doClick($(this), i, e);					
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
						doClick($(this), i, e);		
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
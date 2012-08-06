// ================================================================
//
// WinJS.UI.Animation
//
//		Implementation of the WinJS.UI.Animation namespace
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI.Animation", {

    // ================================================================
	//
	// public function: WinJS.UI.Animation.enterPage
	//
	//		MSDN: TODO
	//
    enterPage: function (elements, offset) {

    	// TODO: is there a difference between enterPage and enterContent?
        return this.enterContent(elements, offset);
    },


	// ================================================================
	//
	// public function: WinJS.UI.Animation.exitPage
	//
	//		MSDN: TODO
	//
    exitPage: function (elements, offset) {

    	// TODO: is there a difference between exitPage and exitContent?
        return this.exitContent(elements, offset);
    },


	// ================================================================
	//
	// public function: WinJS.UI.Animation.enterContent
	//
	//		MSDN: TODO
	//
    enterContent: function (elements, offset) {

        return new WinJS.Promise(function (onComplete, e, p) {

            // keep track of the amount of time to delay between each element
        	var delay = 0;

        	// TODO: Not applying 'offset' parameter

            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            var numAnimations = elements.length;

            elements.forEach(function (element) {

                if (!element)
                    return;

                var $el = $(element);

            	// Shift WinJS.UI.Animation._enterExitDistance pixels to the left, then we'll animate back to start
                $el.offset({
                	left: $el.offset().left + WinJS.UI.Animation._enterExitDistance
                });

            	// Set opacity to 0.5, then we'll animate back to 1.
            	// TODO: should it instead animate back to starting Opacity?  What does win8 do with animating elements with starting opacity of < 1?
                $el.css("opacity", "0.5");

                $el.delay(delay).animate({

                	opacity: "1",

                	// TODO: I'd've thought that this should animate back to $el.offset().left, but if I do that it goes
                	// all wonky; test this with elements that have left != 0 -- what does Win8 do?
					// Note: Apply same change (if any) to exitContent
                	left: 0

                }, 150, function () {

                    if (--numAnimations == 0) {
                        if (onComplete)
                        	onComplete();
                    }
                });

                delay += WinJS.UI.Animation._staggerDelay;
            });
        });
    },


	// ================================================================
	//
	// public function: WinJS.UI.Animation.exitContent
	//
	//		MSDN: TODO
	//
    exitContent: function (elements, offset) {

    	return new WinJS.Promise(function (onComplete, e, p) {

    		// keep track of the amount of time to delay between each element
    		var delay = 0;

    		// Convert to array if only one element
    		if (!elements.length)
    			elements = [elements];

    		var numAnimations = elements.length;

    		elements.forEach(function (element) {

    		    if (!element)
    		        return;

    			var $el = $(element);

				// TODO: Oookay.  If I don't do this, then the animation doesn't work.  I need to understand offset() better.
    			$el.offset({ left: $el.offset().left });

    			$el.delay(delay).animate({
    				opacity: "0",
    				left: -WinJS.UI.Animation._enterExitDistance
    			}, 100, function () {

    				if (--numAnimations == 0) {
    					if (onComplete)
    						onComplete();
    				}
    			});

    			delay += WinJS.UI.Animation._staggerDelay;
    		});
    	});
    },


	// ================================================================
	//
	// private member: _staggerDelay
	//
	//		Defines the amount of time to pause before starting the next element when animating a collection of element
	//
    _staggerDelay: 50,


	// ================================================================
	//
	// private member: _enterExitDistance
	//
	//		The number of pixels to animate left/right enterContent/exitContent
	//
    _enterExitDistance: 20
});

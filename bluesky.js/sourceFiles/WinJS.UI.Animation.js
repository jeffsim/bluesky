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
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212672.aspx
    //
    enterPage: function (elements, offset) {

        // TODO: is there a difference between enterPage and enterContent?
        return WinJS.UI.Animation.enterContent(elements, offset);
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.exitPage
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701586.aspx
    //
    exitPage: function (elements, offset) {

        // TODO: is there a difference between exitPage and exitContent?
        return WinJS.UI.Animation.exitContent(elements, offset);
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.showPopup
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br230468.aspx
    //
    showPopup: function (elements, offset) {

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 250, "easeOut");
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.hidePopup
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212678.aspx
    //
    hidePopup: function (elements) {

        return new WinJS.Promise(function (onComplete) {
            if (!elements) {
                onComplete();
                return;
            }
            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            // Fade out all of the elements
            $(elements).fadeOut("fast").promise().done(function () {
                onComplete();
            });
        });
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.enterContent
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701582.aspx
    //
    enterContent: function (elements, offset) {
        return WinJS.UI.Animation._doShowAnimation(elements, offset, 150, "easeOut");
    },


    // ================================================================
    //
    // private function: WinJS.UI.Animation._doShowAnimation
    //
    _doShowAnimation: function (elements, offset, timeToAnimate, easing) {

        return new WinJS.Promise(function (onComplete, e, p) {

            // keep track of the amount of time to delay between each element
            var delay = 0;

            // If no offset was specified then use our default
            offset = offset || {
                top: "0px",
                left: WinJS.UI.Animation._enterExitDistance + "px"
            };

            // Convert to array if only one element; do same for offset
            if (!elements.length)
                elements = [elements];
            if (!offset.length)
                offset = [offset];

            var numAnimations = elements.length;
            for (var i = 0; i < elements.length; i++) {

                var element = elements[i];

                // If undefined or null element then nothing to animate.  decrement the number of animations we're waiting to have finish...
                if (!element) {
                    numAnimations--;
                    return;
                }

                var $el = $(element);

                // Store initial position type, since setting offset below will force it to relative
                var originalPosition = $el.css("position");

                // Get the amount that we'll offset the current element before animating back to start position
                var elementOffset = i < offset.length ? offset[i] : offset[offset.length - 1];
                var offsetTop = parseInt(elementOffset.top);
                var offsetLeft = parseInt(elementOffset.left);

                // Move element to starting animation position
                var initialPosition = $el.offset();
                $el.offset({
                    top: initialPosition.top + offsetTop,
                    left: initialPosition.left + offsetLeft
                });

                // Set opacity to 0.5, then we'll animate back to 1 (note that Win8 does not appear to reset to initial opacity, so neither do we)
                $el.css("opacity", "0.5");

                // Animate top/left back to initial position
                $el.delay(delay).animate({

                    opacity: "1",
                    top: (offsetTop > 0 ? "-" : "+") + "=" + Math.abs(offsetTop),
                    left: (offsetLeft > 0 ? "-" : "+") + "=" + Math.abs(offsetLeft)

                }, {
                    duration: timeToAnimate,
                    easing: easing || "linear",
                    complete: function () {

                        // Restore original css position
                        $el.css("position", originalPosition);

                        // When an animation completes, check if it was the last one and if so fulfill the promise.
                        if (--numAnimations == 0) {

                            if (onComplete)
                                onComplete();
                        }
                    }
                });

                delay += WinJS.UI.Animation._staggerDelay;
            }
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

            // If no offset was specified then use our default
            offset = offset || {
                top: "0px",
                left: -WinJS.UI.Animation._enterExitDistance + "px"
            };

            // Convert to array if only one element; do same for offset
            if (!elements.length)
                elements = [elements];
            if (!offset.length)
                offset = [offset];

            var numAnimations = elements.length;

            for (var i = 0; i < elements.length; i++) {

                var element = elements[i];

                // If undefined or null element then nothing to animate.  decrement the number of animations we're waiting to have finish...
                if (!element) {
                    numAnimations--;
                    return;
                }

                var $el = $(element);
                var elementOffset = i < offset.length ? offset[i] : offset[offset.length - 1];
                var offsetTop = parseInt(elementOffset.top);
                var offsetLeft = parseInt(elementOffset.left);

                // Store initial position type, since we need to force it to relative and will need to restore it
                var originalPosition = $el.css("position");

                // Force position to relative so that left/top animation works
                $el.css("position", "relative");

                // Perform the animation
                $el.delay(delay).animate({
                    opacity: "0",
                    left: (offsetLeft < 0 ? "-" : "+") + "=" + Math.abs(offsetLeft),
                    top: (offsetTop < 0 ? "-" : "+") + "=" + Math.abs(offsetTop)
                }, 100, function () {

                    // Restore original css position
                    $el.css("position", originalPosition);

                    // When an animation completes, check if it was the last one and if so fulfill the promise.
                    // TODO (CLEANUP): Consider using jQuery's promise (but that then means I need to track an array anyways)...
                    if (--numAnimations == 0) {

                        if (onComplete)
                            onComplete();
                    }
                });

                delay += WinJS.UI.Animation._staggerDelay;
            }
        });
    },


    // ================================================================
    //
    // private member: _staggerDelay
    //
    //		Defines the amount of time to pause before starting the next element when animating a collection of element
    //
    _staggerDelay: 30,


    // ================================================================
    //
    // private member: _enterExitDistance
    //
    //		The number of pixels to animate left/right enterContent/exitContent
    //
    _enterExitDistance: 20
});

3// ================================================================
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

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

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

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

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

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 250, "easeOut");
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.hidePopup
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212678.aspx
    //
    hidePopup: function (elements) {

        return this.fadeOut(elements);
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.fadeOut
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212674.aspx
    //
    fadeOut: function (elements) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return new WinJS.Promise(function (onComplete) {
            if (!elements) {
                onComplete();
                return;
            }
            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            // Fade out all of the elements $el.delay(delay).animate({

            $(elements).animate({
                opacity: "0",
            }, {
                duration: 150
            }).promise().done(function () {
                onComplete();
            });
        });
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.fadeIn
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212673.aspx
    //
    fadeIn: function (elements) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return new WinJS.Promise(function (onComplete) {
            if (!elements) {
                onComplete();
                return;
            }
            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            // Fade out all of the elements $el.delay(delay).animate({

            $(elements).animate({
                opacity: "1",
            }, {
                duration: 150
            }).promise().done(function () {
                onComplete();
            });
        });
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.crossFade
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212661.aspx
    //
    crossFade: function (incoming, outgoing) {

        return WinJS.Promise.join([this.fadeIn(incoming), this.fadeOut(outgoing)]);
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.pointerDown
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212680.aspx
    //
    pointerDown: function (elements) {

        return new WinJS.Promise(function (onComplete) {
            if (!elements) {
                onComplete();
                return;
            }
            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            // TODO: animate the transform
            // TODO: make work on other browsers
            // TODO: will break pre-existing transforms?
            $(elements).css("transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
            onComplete();
        });
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.pointerUp
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212681.aspx
    //
    pointerUp: function (elements) {

        return new WinJS.Promise(function (onComplete) {
            if (!elements) {
                onComplete();
                return;
            }
            // Convert to array if only one element
            if (!elements.length)
                elements = [elements];

            // TODO: animate the transform
            // TODO: make work on other browsers
            // TODO: will break pre-existing transforms?

            $(elements).css("transform", "none");
            onComplete();
        });
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.enterContent
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701582.aspx
    //
    enterContent: function (elements, offset) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 150, "easeOut");
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.showEdgeUI
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br230466.aspx
    //
    showEdgeUI: function (elements, offset) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 350, "easeOut");
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.hideEdgeUI
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212676.aspx
    //
    hideEdgeUI: function (elements, offset) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 350, "easeOut", true);
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.showPanel
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br230467.aspx
    //
    showPanel: function (elements, offset) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 550, "easeOut");
    },


    // ================================================================
    //
    // public function: WinJS.UI.Animation.hidePanel
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212677.aspx
    //
    hidePanel: function (elements, offset) {

        // Do nothing if animations are disabled
        if (!WinJS.UI.isAnimationEnabled)
            return;

        return WinJS.UI.Animation._doShowAnimation(elements, offset, 550, "easeOut", true);
    },


    // ================================================================
    //
    // private function: WinJS.UI.Animation._doShowAnimation
    //
    _doShowAnimation: function (elements, offset, timeToAnimate, easing, flipAnimation) {

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

                // TODO: Does Win8 animate hidden content into visibility?
                //if ($el.css("visibility") == "hidden" || $el.css("display") == "none" || $el.css("opacity") == 0) {
                //numAnimations--;
                //continue;
                //}

                // Store initial position type, since setting offset below will force it to relative
                var originalPosition = $el.css("position");

                // Get the amount that we'll offset the current element before animating back to start position
                var elementOffset = i < offset.length ? offset[i] : offset[offset.length - 1];
                var offsetTop = parseInt(elementOffset.top);
                var offsetLeft = parseInt(elementOffset.left);
                if (elementOffset.rtlflip == true)
                    offsetLeft = -offsetLeft;

                if (flipAnimation) {
                    offsetTop = -offsetTop;
                    offsetLeft = -offsetLeft;
                } else {
                    // Move element to starting animation position
                    var initialPosition = $el.offset();
                    $el.offset({
                        top: initialPosition.top + offsetTop,
                        left: initialPosition.left + offsetLeft
                    });

                    // Set opacity to 0.5, then we'll animate back to 1 (note that Win8 does not appear to reset to initial opacity, so neither do we)
                    $el.css("opacity", "0.5");
                }

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
    // public function: WinJS.UI.Animation.createPeekAnimation
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212659.aspx
    //
    createPeekAnimation: function (elements) {

        return new WinJS.UI.Animation._peekAnimation(elements);
    },


    // ================================================================
    //
    // private class: WinJS.UI.Animation._peekAnimation
    //
    _peekAnimation: WinJS.Class.define(

        // Constructor
        function (elements) {
            // Convert to array if only one element; do same for offset
            if (!elements.length)
                elements = [elements];

            // Store the elements we're tracking.

            this.trackedElements = elements.slice();

            // Store the list of positions for the specified elements
            this.initialPositions = this._getPositions(elements);
        },

        // ================================================================
		// WinJS.UI.Animation._peekAnimation members
		// ================================================================

        {
            // ================================================================
            //
            // public function: WinJS.UI.Animation._peekAnimation.execute
            //
            execute: function () {
                var that = this;
                var elements = this.trackedElements;
                return new WinJS.Promise(function (onComplete) {

                    // Get the tracked Elements' new positions and animate from initial to current.
                    var newPositions = that._getPositions(elements);

                    var numAnimations = elements.length;
                    for (var i = 0; i < elements.length; i++) {

                        var element = elements[i];

                        // If undefined or null element then nothing to animate.  decrement the number of animations we're waiting to have finish...
                        // Do the same if the element hasn't moved
                        if (!element || (that.initialPositions[i].left == newPositions.left && that.initialPositions[i].top == newPositions.top)) {
                            numAnimations--;
                            return;
                        }

                        var $el = $(element);
                        var originalPosition = $el.css("position");
                        var initialPosition = that.initialPositions[i];

                        var offsetTop = newPositions[i].top - initialPosition.top;
                        var offsetLeft = newPositions[i].left - initialPosition.left;

                        $el.offset({
                            top: initialPosition.top,
                            left: initialPosition.left
                        });

                        // Animate top/left back to new position
                        $el.animate({

                            left: (offsetLeft < 0 ? "-" : "+") + "=" + Math.abs(offsetLeft),
                            top: (offsetTop < 0 ? "-" : "+") + "=" + Math.abs(offsetTop)
                            //                            top: newPositions[i].top,
                            //                          left: newPositions[i].left

                        }, {
                            duration: 1500,
                            easing: "easeOut",
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
                    }
                });
            },


            // ================================================================
            //
            // private function: WinJS.UI.Animation._peekAnimation._getPositions
            //
            _getPositions: function (elements) {

                var positionsArray = [];
                elements.forEach(function (element) {
                    // TODO: Support margins/padding as needed
                    var $el = $(element);
                    var offset = $el.offset();
                    positionsArray.push({
                        left: offset.left,// - parseInt($el.css("marginLeft")),
                        top: offset.top,// - parseInt($el.css("marginTop"))
                    });
                });
                return positionsArray;
            },

            animateTime: 500,
            staggerDelay: 25,
            trackedElements: [],
            initialPositions: []
        }),


    // ================================================================
    //
    // public function: WinJS.UI.Animation.exitContent
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701585.aspx
    //
    exitContent: function (elements, offset) {

        // TODO (CLEANUP): Can I remove this and use the new 'flipAnimation' argument to _doShowAnimation?

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
                    continue;
                }

                var $el = $(element);

                // If hidden then don't animate
                if ($el.css("visibility") == "hidden" || $el.css("display") == "none" || $el.css("opacity") == 0) {
                    numAnimations--;
                    continue;
                }

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
    // private(ish) function: WinJS.UI.Animation._cancelAllActiveAnimations
    //
    //		Called when Animations are disabled (through WinJS.UI.Animation.disableAnimations).
    //
    _cancelAllActiveAnimations: function () {

        // TODO: What does Win8 do in this situation?  Let in-progress animations complete, force them 
        // to end-state, or just immediately cancel them?  We opt for the first as it's the simplest.
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
    _enterExitDistance: 20,
});
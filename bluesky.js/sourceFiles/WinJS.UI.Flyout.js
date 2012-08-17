// ================================================================
//
// WinJS.UI.Flyout
//
//		Implementation of the WinJS.UI.Flyout object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211726.aspx
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.Flyout
    //
    Flyout: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.Flyout constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211724.aspx
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.Flyout constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Hide the flyout until shown
            $(element).hide();

            // Initialize values
            this._hidden = true;
            this._placement = null;
            this._anchor = null;
            this._alignment = null;
        },

		// ================================================================
		// WinJS.UI.Flyout Member functions
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: WinJS.Flyout.show
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211727.aspx
		    //
		    show: function (anchor, placement, alignment) {

		        // If visible already then just return
		        if (!this.hidden)
		            return;

		        // Store our anchor, placement, and alignment
		        this._anchor = anchor;
		        this._placement = placement;
		        this._alignment = alignment;

		        // TODO-CLEANUP: This pattern is repeated in a lot of places; move into DOMEventMixin as private function.
		        //		        this.dispatchEvent("beforeshow", { type: "beforeshow", target: this.element, currentTarget: this.element, srcElement: this.element });
		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforeshow", true, false, {});
		        this.element.dispatchEvent(event);


		        // show
		        var $anchor = $(anchor);
		        var $flyout = $(this.element);
		        $flyout
                    .addClass("win-flyout")
                    .css({ 'position': 'absolute', 'visibility': 'hidden', 'display': 'block' });

		        var info = {
		            anchorLeft: $anchor.offset().left,
		            anchorTop: $anchor.offset().top,
		            anchorWidth: $anchor.outerWidth(),
		            anchorHeight: $anchor.outerHeight(),
		            flyoutWidth: $flyout.outerWidth(),
		            flyoutHeight: $flyout.outerHeight(),
		            flyoutLeftMargin: parseInt($flyout.css("marginLeft")),
		            flyoutTopMargin: parseInt($flyout.css("marginTop")),
		            flyoutRightMargin: parseInt($flyout.css("marginRight")),
		            flyoutBottomMargin: parseInt($flyout.css("marginBottom")),
		            screenHeight: $("html").outerHeight(),
		            screenWidth: $("html").outerWidth()
		        };

		        var dest, animOffset;
		        switch (placement || "auto") {
		            case "left":
		                dest = this._getLeftPosition(info, false);
		                break;
		            case "right":
		                dest = this._getRightPosition(info, false);
		                break;
		            case "top":
		                dest = this._getTopPosition(info, false);
		                break;
		            case "bottom":
		                dest = this._getBottomPosition(info, false);
		                break;
		            case "auto":
		                dest = this._getTopPosition(info, true) || this._getBottomPosition(info, true) ||
		                       this._getLeftPosition(info, true) || this._getRightPosition(info, true);
		                break;
		        }
		        $flyout
                    .remove()
                    .appendTo($("body"))
                    .css({
                        "left": dest.left,
                        "top": dest.top,
                        "z-index": "10000",
                        "visibility": "visible"
                    });

		        // Hide it
		        this._hidden = false;
		        var that = this;
		        new WinJS.UI.Animation.showPopup(this.element, [{ left: dest.animLeft, top: dest.animTop }]).then(function () {
		            // Enable light dismiss
		            $('body').bind('click', that._lightDismissHandler.bind(that));

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		    },


		    // ================================================================
		    //
		    // public function: WinJS.Flyout.hide
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211727.aspx
		    //
		    hide: function (anchor, placement, alignment) {

		        // If hidden already then just return
		        if (this.hidden)
		            return;

		        // Remove the light dismiss handler (only needed if hide() is called - light dismiss works w/o it)
		        // TODO: Test - does this work even though we did a bind(this) above?
		        $('body').unbind('click', this._lightDismissHandler);

		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforehide", true, false, {});
		        this.element.dispatchEvent(event);

		        // Animate the flyout out. 
		        this._hidden = true;
		        var that = this;
		        new WinJS.UI.Animation.hidePopup(this.element).then(function () {
		            $(that.element).css("visibility", "hidden");
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("afterhide", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		        // TODO: Does Win8 clear out anchor, placement, and alignment when hidden?
		        this._placement = null;
		        this._anchor = null;
		        this._alignment = null;
		    },


		    // ================================================================
		    //
		    // private function: WinJS.Flyout._lightDismissHandler
		    //
		    //		this is called when the user clicks outside the Flyout while visible.
		    //
		    _lightDismissHandler: function (e) {

		        // Ignore if the click event happened over our flyout
		        var flyoutLoc = this.$rootElement.offset();
		        var flyoutWidth = this.$rootElement.outerWidth();
		        var flyoutHeight = this.$rootElement.outerHeight();
		        if (e.clientX >= flyoutLoc.left && e.clientX <= flyoutLoc.left + flyoutWidth &&
                    e.clientY >= flyoutLoc.top && e.clientY <= flyoutLoc.top + flyoutHeight)
		            return;

		        // Hide our Flyout 
		        this.hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.Flyout._getLeftPosition
		    //
		    _getLeftPosition: function (info, failIfNoRoom) {
		        var left = info.anchorLeft - info.flyoutWidth - info.flyoutLeftMargin - info.flyoutRightMargin;
		        var top = info.anchorTop - info.flyoutTopMargin + (info.anchorHeight - info.flyoutHeight) / 2;

		        if (failIfNoRoom && left < 0)
		            return null;
		        // constrain to screen
		        top = Math.max(0, top);
		        top = Math.min(info.screenHeight - info.flyoutHeight - info.flyoutBottomMargin - info.flyoutTopMargin, top);

		        return { left: left, top: top, animLeft: "40px", animTop: "0px" };
		    },


		    // ================================================================
		    //
		    // private function: WinJS.Flyout._getRightPosition
		    //
		    _getRightPosition: function (info, failIfNoRoom) {
		        var top = info.anchorTop - info.flyoutTopMargin + (info.anchorHeight - info.flyoutHeight) / 2;
		        var left = info.anchorLeft + info.anchorWidth;

		        if (failIfNoRoom && left > info.screenWidth - (info.flyoutWidth + info.flyoutLeftmargin + info.flyoutRightMargin))
		            return null;
		        // constrain to screen
		        top = Math.max(0, top);
		        top = Math.min(info.screenHeight - info.flyoutHeight - info.flyoutBottomMargin - info.flyoutTopMargin, top);

		        return { left: left, top: top, animLeft: "-40px", animTop: "0px" };
		    },


		    // ================================================================
		    //
		    // private function: WinJS.Flyout._getTopPosition
		    //
		    _getTopPosition: function (info, failIfNoRoom) {
		        var left = info.anchorLeft - info.flyoutLeftMargin + (info.anchorWidth - info.flyoutWidth) / 2;
		        var top = info.anchorTop - info.flyoutHeight - info.flyoutBottomMargin - info.flyoutTopMargin;

		        if (failIfNoRoom && top < 0)
		            return null;
		        // constrain to screen
		        left = Math.max(0, left);
		        left = Math.min(info.screenWidth - info.flyoutWidth - info.flyoutLeftMargin - info.flyoutLeftMargin, left);

		        return { left: left, top: top, animLeft: "0px", animTop: "40px" };
		    },


		    // ================================================================
		    //
		    // private function: WinJS.Flyout._getBottomPosition
		    //
		    _getBottomPosition: function (info, failIfNoRoom) {
		        var left = info.anchorLeft - info.flyoutLeftMargin + (info.anchorWidth - info.flyoutWidth) / 2;
		        var top = info.anchorTop + info.anchorHeight;

		        if (failIfNoRoom && top > info.screenHeight - (info.flyoutHeight + info.flyoutBottomMargin + info.flyoutTopMargin))
		            return null;
		        // constrain to screen
		        left = Math.max(0, left);
		        left = Math.min(info.screenWidth - info.flyoutWidth - info.flyoutLeftMargin - info.flyoutLeftMargin, left);

		        return { left: left, top: top, animLeft: "0px", animTop: "-10px" };
		    },


		    // ================================================================
		    //
		    // public event: WinJS.Flyout.onafterhide
		    //
		    //		MSDN: TODO
		    //
		    onafterhide: {
		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onafterhide;
		        },

		        set: function (callback) {
		        	// Remove previous on* handler if one was specified
		        	if (this._onafterhide)
		        		this.removeEventListener("afterhide", this._onafterhide);

		            // track the specified handler for this.get
		            this._onafterhide = callback;
		            this.addEventListener("afterhide", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.Flyout.onaftershow
		    //
		    //		MSDN: TODO
		    //
		    onaftershow: {

		        get: function () {
                    // Return the tracked hander (if any)
		            return this._onaftershow;
                },

		        set: function (callback) {
		        	// Remove previous on* handler if one was specified
		        	if (this._onaftershow)
		        		this.removeEventListener("aftershow", this._onaftershow);

                    // track the specified handler for this.get
                    this._onaftershow = callback;
                    this.addEventListener("aftershow", callback);
                }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.Flyout.onbeforehide
		    //
		    //		MSDN: TODO
		    //
		    onbeforehide: {
                
		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onbeforehide;
		        },

		        set: function (callback) {
		        	// Remove previous on* handler if one was specified
		        	if (this._onbeforehide)
		        		this.removeEventListener("beforehide", this._onbeforehide);

		            // track the specified handler for this.get
		            this._onbeforehide = callback;
		            this.addEventListener("beforehide", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.Flyout.onbeforeshow
		    //
		    //		MSDN: TODO
		    //
		    onbeforeshow: {
                
		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onbeforeshow;
		        },

		        set: function (callback) {
		        	// Remove previous on* handler if one was specified
		        	if (this._onbeforeshow)
		        		this.removeEventListener("beforeshow", this._onbeforeshow);

		            // track the specified handler for this.get
		            this._onbeforeshow = callback;
		            this.addEventListener("beforeshow", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.Flyout.hidden
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212535.aspx
		    //
		    _hidden: true,
		    hidden: {
		        get: function () {
		            return this._hidden;
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.Flyout.alignment
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770559.aspx
		    //
		    _alignment: null,
		    alignment: {
		        get: function () {
		            return this._alignment;
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.Flyout.placement
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770561.aspx
		    //
		    _placement: true,
		    placement: {
		        get: function () {
		            return this._placement;
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.Flyout.anchor
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770560.aspx
		    //
		    _anchor: true,
		    anchor: {
		        get: function () {
		            return this._anchor;
		        }
		    }
		})
});

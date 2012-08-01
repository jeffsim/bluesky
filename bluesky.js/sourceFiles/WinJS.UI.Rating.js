// ================================================================
//
// WinJS.UI.Rating
//
//		Implementation of the WinJS.UI.Rating object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211895.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.Rating
	//
	Rating: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.Rating constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211897.aspx
		//
        function (element, options) {

        	/*DEBUG*/
        	// Parameter validation
        	if (!element)
        		console.error("WinJS.UI.Rating constructor: Undefined or null element specified");
        	/*ENDDEBUG*/

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// initialize the set of event listeners
        	// TODO: Strip the "on"?
        	this._eventListeners = {
        		onchange: [],
        		onpreviewchange: [],
        		oncancel: []
        	};

        	// Initialize hover and mousecapture-related variables
        	this._mouseDown = false;
        	this._overClickedStar = null;

        	// Set default options
        	this.enableClear = true;
        	this.averageRating = 0;
        	this.disabled = false;
        	this.maxRating = 5;

        	// Set any options that were specified.
        	WinJS.UI.setOptions(this, options);

			// TODO: Remove this after event handlers are figured out (specifically the "on" stripping part)
        	/* if (options) {
        		if (options.disabled)
        			this.disabled = options.disabled;
        		if (options.maxRating)
        			this.maxRating = options.maxRating;
        		if (options.averageRating)
        			this.averageRating = options.averageRating;
        		if (options.enableClear)
        			this.enableClear = options.enableClear;
        		if (options.userRating)
        			this.userRating = options.userRating;
        		if (options.onchange)
        			this.addEventListener("onchange", eval(options.onchange));
        		if (options.onpreviewchange)
        			this.addEventListener("onpreviewchange", eval(options.addEventListener));
        		if (options.oncancel)
        			this.addEventListener("oncancel", eval(options.oncancel));
        		//this.onchange = eval(options.onchange);
        	}*/

        	// Force a layout
        	this.render();
        },

		// ================================================================
		// WinJS.UI.Rating Member functions
		// ================================================================

        {
        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._doRender
        	//
        	//		Called when the control should "render" itself to the page.  This is considered a private
        	//		function because callers should have called our BaseControl's "render()" function, which
        	//		manages batching render calls for us.
        	//
        	_doRender: function () {

        		/*DEBUG*/
        		// State validation
        		if (!this.$rootElement)
        			console.error("WinJS.UI.Rating._doRender: Undefined or null 'this.$rootElement'");
        		/*ENDDEBUG*/

        		// TODO: Do DOM element generation once, and then do subsequent renders by updating classes (etc) instead of rerendering the entire control.
        		// TODO: not handling fractional stars yet.

        		// Start by clearing out our root element from previous renders and making it look like a Rating control to our styles
        		this.$rootElement
					.empty()
        			.addClass("win-rating")
        			.attr("role", "slider");

        		// Render stars
        		for (var i = 0; i < this.maxRating; i++) {

        			// Create the rating item and add it to the container.
        			var val;
        			if (this.userRating)
        				val = i < this.userRating ? "win-full win-user" : "win-empty";
        			else
        				val = i < this.averageRating ? "win-full" : "win-empty";

        			var tooltip = this.tooltipStrings ? this.tooltipStrings[i] : i + 1;

        			// Create the star and store its index so we can look it up later (to avoid unnecessary DOM walks)
        			var $star = $('<div class="win-star ' + val + '" style="float:left" title=' + tooltip + '></div>')
						.data("index", i);

        			// Add the star to the DOM
        			this.$rootElement.append($star);

        			// Mouse event handlers
        			$star.mousemove(this.handleMouseMove.bind(this));
        			$star.click(this.handleMouseClick.bind(this));
        		}

        		// Clear the floating stars
				// TODO: Will this break anyone's layouts?
        		this.$rootElement.append("<div style='clear:both'></div>");

        		// Add mouse event handlers to implement frag-clear
        		this.$rootElement.mouseleave(this.handleMouseLeave.bind(this))
					 			 .mousedown(function () { this.winControl._mouseDown = true; })
					 			 .mouseup(function () { this.winControl._mouseDown = false; });
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating.handleMouseLeave
        	//
        	//		Called when the mouse moves out of the Rating control.  If the user was frag-clearing
        	//		then clear out our userRating now; otherwise, restore the set rating value by re-rendering.
        	//
        	handleMouseLeave: function (evt) {

        		// Nothing to do if we're disabled.
        		if (this.disabled)
        			return;

        		this._overClickedStar = null;

        		// Check for frag-clear; is it enabled and is the mouse pressed as the user exits the rating control?
        		if (this.enableClear && this._mouseDown) {

        			// Did the user leave the left side?
        			var x = evt.clientX - $(evt.currentTarget).offset().left;
        			if (x <= 0) {
        				// TODO - frag clear shouldn't trigger until the user lifts the mouse button - this allows them
        				// to drag back in and cancel the clear.  Not doing it for now since I don't want to deal with
        				// mouse capture.  Note: when that's done, also need to add tooltip that says "Clear your rating"
        				//winControl._fragClearing = true;
        				this.userRating = null;
        			}
        		}
        		this._notifyCancel({ target: { winControl: this }, type: 'cancel' });

        		this.render();
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating.handleMouseClick
        	//
        	//		Called when the user clicks on the rating control
        	//
        	handleMouseClick: function (evt) {

        		// Nothing to do if we're disabled.
        		if (this.disabled)
        			return;

        		// Create the event info that we'll pass through the various events
        		var eventInfo = {
        			tentativeRating: this.userRating,
        			target: { winControl: this },
        			type: 'previewchange',
        			preventDefault: false
        		}

        		// Notify any previewChange listeners
        		this._notifyPreviewChange(eventInfo);

        		// Did any listener cancel the event?  If so then don't update the user rating
        		if (eventInfo.preventDefault)
        			return;

        		// When user clicks on an item, we want to disable setting win-tentative until
        		// the user moves onto a different item, or out and back in.  Do this before setting userRating
        		// since that (currently) regenerates all items and we lose index.
        		var thisIndex = $(evt.currentTarget).data("index");
        		this._overClickedStar = thisIndex;

        		// User didn't cancel the change of rating, so go ahead and change it.  This will cause the Rating control to rerender.
        		this.userRating = thisIndex + 1;

        		// Update event info and fire the change notification
        		eventInfo.type = "change";
        		eventInfo.tentativeRating = this.userRating;
        		eventInfo.userRating = this.userRating;
        		this._notifyChange(eventInfo);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating.handleMouseMove
        	//
        	//		Called when the mouse moves over the rating control
        	//
        	handleMouseMove: function (evt) {

        		// Nothing to do if we're disabled.
        		if (this.disabled)
        			return;

				// Get the star that the mouse is over
        		var $starOver = $(evt.currentTarget);

        		// If the user clicks a star, then it gets changed to 'full' state; we don't want to switch to 'tentative'
        		// until the user moves off of the star.
        		if (this._overClickedStar) {

        			// User has clicked a star and before this had not moved over it; check to see if the mouse is still over
        			// the same star, and if so return without changing anything.
        			if (this._overClickedStar == $starOver.data("index"))
        				return;

        			// Mark taht we're no longer over the star that was clicked
        			this._overClickedStar = null;
        		}

        		// change the hovered star and all previous stars to 'full/tentative' and change all stars after the hovered star to empty
        		$starOver.siblings().removeClass("win-user win-full").addClass("win-empty");
        		$starOver.removeClass("win-empty win-user win-full").addClass("win-full win-tentative");
        		$starOver.prevAll().removeClass("win-empty win-user win-full").addClass("win-full win-tentative");
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._notifyChange
        	//
        	//		TODO: Can/should I generalize all three of these into one generic event firer?
        	//		TODO: Need to figure on where "on" should and shouldn't be.
        	//
        	_notifyChange: function (eventData) {

        		// TODO: Can I use forEach?
        		for (var i in this._eventListeners.onchange)
        			this._eventListeners.onchange[i].listener(eventData);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._notifyPreviewChange
        	//
        	_notifyPreviewChange: function (eventData) {
        		for (var i in this._eventListeners.onpreviewchange)
        			this._eventListeners.onpreviewchange[i].listener(eventData);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._notifyCancel
        	//
        	_notifyCancel: function (eventData) {
        		for (var i in this._eventListeners.oncancel)
        			this._eventListeners.oncancel[i].listener(eventData);
        	},


        	// ================================================================
        	//
        	// public Variable (and getter/setter): userRating
        	//
        	//		When set, the control is re-rendered automatically.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211901.aspx
        	//
        	_userRating: null,
        	userRating: {

        		get: function () {
        			return this._userRating;
        		},

        		set: function (newUserRating) {
        			this._userRating = newUserRating;
        			this.render();
        		}
        	},


        	// ================================================================
        	//
        	// public Variable (and getter/setter): maxRating
        	//
        	//		When set, the control is re-rendered automatically.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211894.aspx
        	//
        	_maxRating: null,
        	maxRating: {

        		get: function () {
        			return this._maxRating;
        		},

        		set: function (newMaxRating) {
        			this._maxRating = newMaxRating;
        			this.render();
        		}
        	},


        	// ================================================================
        	//
        	// public Variable (and getter/setter): tooltipStrings
        	//
        	//		When set, the control is re-rendered automatically.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211900.aspx
        	//
        	_tooltipStrings: null,
        	tooltipStrings: {

        		get: function () {
        			return this._tooltipStrings;
        		},

        		set: function (newTooltipStrings) {
        			this._tooltipStrings = newTooltipStrings;

        			// TODO: update items rather than completely regenerating them
        			this.render();
        		}
        	}
        })
});
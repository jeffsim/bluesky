WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// private Object: WinJS.UI.BaseControl constructor
	//
	//		Base control for all renderable WinJS objects.  Should not be directly instantiated, but rather derived from.
	//
	//		TODO: Is there an established javascript naming pattern for private classes/variables?
	//		I've adopted an underline prefix (admittedly inconsistently), but will need to change that once I know what the preferred approach is...
	//		
	//		TODO: This isn't an existing WinJS object; consider moving out into a different namespace (e.g. Bluesky.BaseControl)
	//		
	BaseControl: WinJS.Class.define(function (element, options) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.BaseControl constructor: Undefined or null element specified");
		/*ENDDEBUG*/

		// Keep a reference to our root element in the DOM.  I'm deep in with jQuery already, so go ahead
		// and wrap it here.
		// TODO: Perf isn't currently a concern, but look into jQuery alternatives (including jqm) later		
		this.$rootElement = $(element);

		this.isYielding = false;

		this._eventListeners = {};

		// Store a reference to this control in the element with which it is associated
		element.winControl = this;

		// Track the DOM element with which this control is associated
		this.element = element;
	},

		// ================================================================
		// WinJS.UI.BaseControl Member functions
		// ================================================================

	{
		// ================================================================
		//
		// public Function: WinJS.UI.BaseControl.render
		//
		//		Called when the control should "render" itself to the page.  In order to allow
		//		batching of render calls (e.g. due to multiple changes to a control's datacontext),
		//		render() performs a yield with a zero timeout.  Given javascript's threading model,
		//		this allows the caller to call render numerous times, and only after the calling
		//		thread is done is our timeout triggered and the 'real' rendering is done.
		//
		render: function (forceRender) {

			if (forceRender) {
				this._doRender();
				this.isYielding = false;
				return;
			}

			// If we're already yielding then just return
			if (this.isYielding)
				return;

			// Mark that we're yielding and waiting for a chance to render.
			this.isYielding = true;

			// Set a timeout that will occur as soon as it can.  When it does, call our derived class's
			// doRender function
			var that = this;
			setTimeout(function () {

				if (that.isYielding) {
					that._doRender();

					// Mark that we're no longer yielding
					that.isYielding = false;
				}
			}, 0);
		},


		// ================================================================
		//
		// public Function: WinJS.UI.BaseControl.addEventListener
		//
		//		Adds a new event listener to the control
		//
		//		TODO: The difference between onchange and change.  see examples at http://msdn.microsoft.com/en-us/library/windows/apps/br211891.aspx
		//			  I need to figure out when "on" is and isn't present, and when it is and isn't stripped...
		//
		addEventListener: function (eventName, listener) {

			// Create the list of listeners for the specified event if the list does not yet exit
			if (!this._eventListeners[eventName])
				this._eventListeners[eventName] = [];

			// Push the event listener into the list
			this._eventListeners[eventName].push({ listener: listener });
		},


		// ================================================================
		//
		// public Function: WinJS.UI.BaseControl.removeEventListener
		//
		//		Removes an event listener from this Control
		//
		removeEventListener: function (eventName, listener) {

			// If we don't have any listeners for the specified event then we know we don't have to remove the listener
			if (!this._eventListeners[eventName])
				return;

			// Get the index of listener in the list of listeners for the event; if present in the list, then remove it.
			var index = this._eventListeners[eventName].indexOf(listener);
			if (index != -1)
				this._eventListeners[eventName].splice(index, 1);
		},

	})
});


// ================================================================
//
// WinJS.Application
//
// This is the root WinJS.Application namespace/object
//
WinJS.Namespace.define("WinJS.Application", {

	// This variable is used to indicate to code whether it's running in bluesky or win8.  To determine it,
	// check if (WinJS.Application.IsBluesky); on bluesky it returns true, on win8 it returns undefined.
	IsBluesky: true,


	// ================================================================
	//
	// public Function: WinJS.Application.start
	//
	//		Called when the webapp starts
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229705.aspx
	//
	start: function () {

		/* Here's the order things happen in in win8:
		
			// Application event handlers
			WinJS.Application.onactivated = function () { console.log(6); };
			WinJS.Application.onready = function () { console.log(7); };
			WinJS.Application.onloaded = function () { console.log(4); };

			// Call start
			console.log(1);
			WinJS.Application.start();
			console.log(2);

			// Browser event handlers
			$(document).ready(function () { console.log(5); });
			$(window).load(function () { console.log(8); });

			console.log(3);

			// output: 1,2,3,4,5,6,7,8
		*/

		// TODO: Where in this flow does the Win8 splash screen show?  I'll want to do preloading during that phase.

		// Provide a function in each of the events that allows the event listener to set a promise that indicates that the event listener 
		// has pending async work to do before we should continue with the next step in the activation process
		var asyncEventPromises = [];
		var setPromise = function (promise) {
			asyncEventPromises.push(promise);
		};

		// At this point, WinJS.Application is loaded (but not necessarily ready).  To mimic win8's 
		// application flow, we first yield before notifying listeners of the load
		var that = this;
		WinJS.Promise.timeout().then(function () {

			// WinJS.Application has been loaded; notify any listeners...
			that._notifyLoaded({
				setPromise: setPromise
			});

			// The notify handler optionally called setPromise and specified a Promise that they would complete before we should
			// for chaining purposes.  We join the promises in case there were multiple event handlers that specified setPromise handlers.
			if (asyncEventPromises.length > 0)
				return WinJS.Promise.join(asyncEventPromises);

			// If no async event promises specified, then just return and we'll jump into the next 'then'

		}).then(function () {

			// Wait until the DOM is ready and then notify any listeners that we're activated and ready
			var documentReady = new WinJS.Promise(function (c) {
				$(document).ready(function () {
					c();
				});
			});
			return documentReady.then(function () {
				// NOTE: If later on anything needs to happen between loaded and activated, then this is where that should happen

				// The application has been activated; notify any listeners...
				// Create the arguments object that we'll pass to the activated event listeners
				var detail = {
					// TODO: activatedOperation
					// TODO: tileId
					arguments: "",

					// Tell the app that the activation is via a launch (equivalent to tapping a tile in the win8 Start screen)
					kind: Windows.ApplicationModel.Activation.ActivationKind.launch,

					// TODO: Support this?
					previousExecutionState: null,

					target: null,

					setPromise: setPromise,

					activatedOperation: new Windows.UI.WebUI.ActivatedOperation()
				}

				// TODO: Not sure why win8 has detail.detail[0] = detail in the args.  Does it apply to the Web?
				detail.detail = [detail];

				// Clear out the asyncEventPromise so that we can reuse it for activated
				asyncEventPromises = [];
				that._notifyActivated(detail);
				
				if (asyncEventPromises.length > 0)
					return WinJS.Promise.join(asyncEventPromises);

				// If no async event promises specified, then just return and we'll jump into the next 'then'

			}).then(function () {

				// Support any requested deferrals (via activatedOperation.getDeferral)
				if (Windows.UI.WebUI._activationDeferrals.length > 0)
					return WinJS.Promise.join(Windows.UI.WebUI._activationDeferrals);

			}).then(function () {

				// NOTE: If later on anything needs to happen between activated and ready, then this is where that should happen

				// After we're loaded and activated, we're ready; notify any listeners...
				that._notifyReady({
					setPromise: setPromise
				});

				// TODO: I don't think anything chains after ready; so why does it take a setPromise?  Either way, we're currently
				// just ignoring it since there's nothing else to do.
			});
		});
	},


	// ================================================================
	//
	// public function: WinJS.Application.stop
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229799.aspx
	//
	stop: function () {

		// TODO: Do we need to do anything here on the web?  Should clean up eventListeners etc...
	},


	// ================================================================
	//
	// public function: WinJS.Application.addEventListener
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229799.aspx
	//
	addEventListener: function (eventName, listener) {

		// TODO: Can I leverage DOMEventMixin here now? 
		
		/*DEBUG*/
		// Parameter validation
		if (!WinJS.Application._eventListeners[eventName])
			console.warn("WinJS.Application.addEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
		/*ENDDEBUG*/

		// Add the listener to the list of listeners for the specified eventName
		WinJS.Application._eventListeners[eventName].push(listener);
	},


	// ================================================================
	//
	// public function: WinJS.Application.removeEventListener
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229678.aspx
	//
	removeEventListener: function (eventName, listener) {

		/*DEBUG*/
		// Parameter validation
		if (!WinJS.Application._eventListeners[eventName])
			console.warn("WinJS.Application.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
		/*ENDDEBUG*/

		// Remove the listener from the list of listeners for the specified eventName
		var listeners = WinJS.Application._eventListeners[eventName];
		for (var i = 0; i < listeners.length; i++) {
			if (listener === listeners[i]) {
				listeners.splice(i, 1);
				return;
			}
		}
	},


	// ================================================================
	//
	// private function: WinJS.Application._notifyActivated
	//
	//		Notify any listeners that the application has been activated
	//
	_notifyActivated: function (eventData) {

		var eventInfo = {
			target: this,
			type: "activated",
			detail: eventData,
			setPromise: eventData.setPromise,
			getDeferral: Windows.UI.WebUI.ActivatedOperation.getDeferral
		};

		for (var i in this._eventListeners.activated)
			this._eventListeners.activated[i](eventInfo);
	},


	// ================================================================
	//
	// private function: WinJS.Application._notifyLoaded
	//
	//		Notify any listeners that the application has been loaded
	//
	_notifyLoaded: function (eventData) {

		var eventInfo = {
			target: this,
			type: "loaded",
			setPromise: eventData.setPromise
		};

		for (var i in this._eventListeners.loaded)
			this._eventListeners.loaded[i](eventInfo);
	},


	// ================================================================
	//
	// private function: WinJS.Application._notifyReady
	//
	//		Notify any listeners that the application is ready
	//
	_notifyReady: function (eventData) {

		var eventInfo = {
			target: this,
			type: "ready",
			setPromise: eventData.setPromise
		};

		for (var i in this._eventListeners.ready)
			this._eventListeners.ready[i](eventInfo);
	},


	// ================================================================
	//
	// public event: WinJS.Application.onactivated
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212679.aspx
	//
	onactivated: {
		get: function () { return WinJS.Application._eventListeners["activated"]; },
		set: function (callback) { WinJS.Application.addEventListener("activated", callback); }
	},


	// ================================================================
	//
	// public event: WinJS.Application.onloaded
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229840.aspx
	//
	onloaded: {
		get: function () { return WinJS.Application._eventListeners["loaded"]; },
		set: function (callback) { WinJS.Application.addEventListener("loaded", callback); }
	},


	// ================================================================
	//
	// public event: WinJS.Application.onready
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229844.aspx
	//
	onready: {
		get: function () { return WinJS.Application._eventListeners["ready"]; },
		set: function (callback) { WinJS.Application.addEventListener("ready", callback); }
	},


	// Our set of event listeners
	_eventListeners: {
		loaded: [],
		activated: [],
		ready: [],
		checkpoint: [],		// NYI
		error: [],			// NYI
		settings: [],		// NYI
		unloaded: []		// NYI
	},


	// ================================================================
	//
	// public object: WinJS.Application.sessionState
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440965.aspx
	//
	//		TODO: Stubbed out version to unblock tests
	//
	//		NYI NYI NYI
	//
	sessionState: {
	}
});

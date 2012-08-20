// ================================================================
//
// WinJS.Utilities
//
//		This is the root WinJS.Utilities namespace/object
//
//		TODO: functions to add:
//			Key enumeration
//			eventMixin object
//			strictProcessing property
//			children function
//			convertToPixels function
//			createEventProperties function
//			data function
//			eventWithinElement function
//			formatLog function
//			getContentHeight function
//			getContentWidth function
//			getMember function
//			getPosition function
//			getRelativeLeft function
//			getRelativeTop function
//			getTotalHeight function
//			getTotalWidth function
//			id function
//			insertAdjacentHTML function
//			insertAdjacentHTMLUnsafe function
//			markSupportedForProcessing function
//			requireSupportedForProcessing method
//			setInnerHTML function
//			setInnerHTMLUnsafe function
//			setOuterHTML function
//			setOuterHTMLUnsafe function
//			startLog function
//			stopLog function

WinJS.Namespace.define("WinJS.Utilities", {

	// ================================================================
	//
	// public function: WinJS.Utilities.ready
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211903.aspx
	//
	ready: function (callback, async) {

		// TODO: Support async

		return new WinJS.Promise(function (promiseComplete) {
			$(document).ready(function () {
				callback();
				promiseComplete();
			});
		});
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.createEventProperties
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229811.aspx
	//
	createEventProperties: function (events) {

		// 'events' can be an arbitrary collection of parameters, so walk the argument list
		var eventProperties = {};
		for (var i = 0; i < arguments.length; i++) {
			var eventName = arguments[i];

			// Create the property.  Do this as a function as I was getting tripped up by the closure
			eventProperties["on" + eventName] = this._createProperty(eventName);
		}
		return eventProperties;
	},
	

	// ================================================================
	//
	// private function: WinJS.Utilities._createProperty
	//
	_createProperty: function (eventName) {

		var publicName = "on" + eventName;
		var privateName = "_on" + eventName;
		return {
			get: function () {
				return this[privateName];
			},
			set: function (callback) {
				// Remove previous on* handler if one was specified
				if (this[privateName])
					this.removeEventListener(eventName, callback);

				// track the specified handler for this.get
				this[privateName] = callback;
				this.addEventListener(eventName, callback);
			}
		};
	},


	// ================================================================
	//
	// public object: WinJS.Utilities.eventMixin
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211693.aspx
	//
	eventMixin: {

		// ================================================================
		//
		// public function: WinJS.Utilities.eventMixin.dispatchEvent
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211690.aspx
		//
		addEventListener: function (eventName, listener) {

			if (!this._eventListeners)
				this._eventListeners = [];
			if (!this._eventListeners[eventName])
				this._eventListeners[eventName] = [];

			// Add the listener to the list of listeners for the specified eventName
			this._eventListeners[eventName].push(listener);
		},


		// ================================================================
		//
		// public function: WinJS.Utilities.eventMixin.dispatchEvent
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211695.aspx
		//
		removeEventListener: function (eventName, listener) {

			// Remove the listener from the list of listeners for the specified eventName
			var listeners = this._eventListeners[eventName];
			for (var i = 0; i < listeners.length; i++) {
				if (listener === listeners[i]) {
					listeners.splice(i, 1);
					return;
				}
			}
		},


		// ================================================================
		//
		// public function: WinJS.Utilities.eventMixin.dispatchEvent
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211692.aspx
		//
		dispatchEvent: function (eventName, eventProperties) {

			if (!this._eventListeners)
				return;

			// TODO (CLEANUP): Can I just use the browser's dispatchEvent (etc) here?
			// TODO (CLEANUP): Use this in WinJS.Application, WinJS.Navigation, and other places that need events but don't have elements.
			var listeners = this._eventListeners[eventName];
			if (!listeners)
				return;

			var eventData = {

				// Event type
				type: eventName,

				// Event Targeting
				currentTarget: this,
				target: this,

				// bubble/cancel.  TODO: What are the proper values here?
				bubbles: false,
				cancelable: false,

				// Misc
				eventPhase: 0,
				detail: eventProperties,

				// Stopping/preventing
				defaultPrevented: false,
				preventDefault: function () { this.defaultPrevented = true; },
				_stopImmediately: false,
				stopImmediatePropagation: function () { this._stopImmediately = true; }
			};

			for (var i = 0; i < listeners.length; i++) {
				listeners[i](eventData);
				if (eventData._stopImmediately)
					break;
			}

			return eventData.defaultPrevented;
		}
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.addClass
	//
	//		Adds the specified class to the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229798.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	addClass: function (element, newClass) {

		if (element)
			$(element).addClass(newClass);
		return element;
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.hasClass
	//
	//		Adds the specified class to the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229829.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	hasClass: function (element, newClass) {

		if (!element)
			return element;
		return $(element).hasClass(newClass);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.toggleClass
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229851.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	toggleClass: function (element, name) {

		if (!element)
			return element;
		return $(element).toggleClass(name);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.removeClass
	//
	//		Removes the specified class from the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229848.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	removeClass: function (element, classToRemove) {

		if (element)
			$(element).removeClass(classToRemove);
		return element;
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.query
	//
	//		TODO: Remove jQuery wrapping
	//
	query: function (selector, rootElement) {

		// Get the raw DOM elements that match the selector/rootElement combination
		var elements = $(selector, rootElement || document).get();

		// Return a QueryCollection that wraps the DOM elements
		return new WinJS.Utilities.QueryCollection(elements);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.empty
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229816.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	empty: function (element) {

		if (element)
			$(element).empty();
		return element;
	}
});

// ================================================================
//
// public function: msSetImmediate
//
//		MSDN: TODO
//
function msSetImmediate(callback) {

	// TODO: I'm assuming this is what setImmediate does; essentially just yield the thread, and as soon as
	// the thread gets a chance, call the callback function
	// TODO: setImmediate tests.
	WinJS.Promise.timeout().then(function () {
		callback();
	});
}

window.msSetImmediate = msSetImmediate;
var setImmediate = msSetImmediate;
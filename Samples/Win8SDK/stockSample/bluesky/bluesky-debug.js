/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Copyright 2012, Jeff Simon (www.bluesky.io).  Date: 7/23/2012

"use strict";

// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS
//
// Root WinJS namespace
//
var WinJS = {

	// ================================================================
	//
	// public Object: WinJS.Namespace
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212652.aspx
	//
	Namespace: {

		// ================================================================
		//
		// public Function: Namespace.define
		//
		//		Defines a new namespace with the specified name.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212667.aspx
		//
		define: function (name, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!name)
				console.error("WinJS.Namespace.define: null or undefined 'name' specified.");
			if (!members)
				console.error("WinJS.Namespace.define: null or undefined 'members' specified.");
			/*ENDDEBUG*/

			return this.defineWithParent(window, name, members);
		},


		// ================================================================
		//
		// public Function: Namespace.defineWithParent
		//
		//		Defines a new namespace with the specified name under the specified parent namespace
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212665.aspx
		//
		defineWithParent: function (parent, name, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!parent)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'parent' specified.");
			if (!name)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'name' specified.");
			if (!members)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'members' specified.");
			/*ENDDEBUG*/

			var currentNamespace = parent;

			// Caller can specify multiple depth namespace as the parent; we verify that each part exists and create them if they don't
			var namespaceFragments = name.split(".");
			for (var i = 0, len = namespaceFragments.length; i < len; i++) {

				// Grab the ith level namespace fragment.
				var namespaceName = namespaceFragments[i];

				// Does the fragment existing in the current namespace?
				if (!currentNamespace[namespaceName]) {
					Object.defineProperty(currentNamespace, namespaceName, {

						// Initialize the namespace as empty
						value: {},

						// Do not allow the namespace name to be assigned
						writable: false,

						// Allow the namespace to be enumerated
						enumerable: true,

						// Allow the namespace to be removed and it's attributes (other than writable) to be changed.
						configurable: true
					});
				}

				// Step into the fragment's namespace to continue
				currentNamespace = currentNamespace[namespaceName];
			}

			// If the caller specified any members, then initialize them now in the new namespace
			if (members)
				WinJS._initializeMembers(currentNamespace, members);

			// Return the new namespace
			return currentNamespace;
		}
	},


	// ================================================================
	//
	// public Object: WinJS.Class
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229776.aspx
	//
	Class: {

		// ================================================================
		//
		// public Function: Class.define
		//
		//		Defines a class using the given constructor and the specified instance members
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229813.aspx
		//
		define: function (constructor, instanceMembers, staticMembers) {

			// Allow empty constructors
			constructor = constructor || function () { };

			// Add per-instance members to the constructor's prototype.
			if (instanceMembers)
				WinJS._initializeMembers(constructor.prototype, instanceMembers);

			// Add static members to the constructor
			if (staticMembers)
				WinJS._initializeMembers(constructor, staticMembers);

			// Return the constructor
			return constructor;
		},


		// ================================================================
		//
		// public Function: Class.derive
		//
		//		Creates a sub-class based on the specified baseClass parameter, using prototype inheritance.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229815.aspx
		//
		derive: function (baseClass, constructor, instanceMembers, staticMembers) {
			/*DEBUG*/
			// Perform parameter validation
			if (!baseClass)
				console.error("WinJS.Class.derive: null or undefined 'baseClass' specified.");
			/*ENDDEBUG*/

			// Allow empty constructors
			constructor = constructor || function () { };

			// Create the new class (in JS, constructor) from the specified base class
			constructor.prototype = Object.create(baseClass.prototype);

			// Set the constructor function on the newly created prototype
			Object.defineProperty(constructor.prototype, "constructor", { value: constructor });

			// Add the specified per-instance and static members to the constructor
			WinJS.Class.define(constructor, instanceMembers, staticMembers);

			// Return the constructor
			return constructor;
		},


		// ================================================================
		//
		// public Function: Class.mix
		//
		//		Defines a class using the given constructor and the union of the set of instance
		//		members specified by all the mixin objects. The mixin parameter list is of variable length.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229836.aspx
		//
		//		TODO: Win8 SDK docs look incorrect.  Revisit this function when they fix them.
		//
		mix: function (constructor, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!constructor)
				console.error("WinJS.Class.mix: null or undefined 'constructor' specified.");
			/*ENDDEBUG*/

			// Add per-instance members to the constructor's prototype.
			if (members)
				WinJS._initializeMembers(constructor.prototype, members);

			// Return the constructor
			return constructor;
		}
	},


	// ================================================================
	//
	// private function: WinJS._initializeMembers
	//
	//		Extends the target object to include the specified members
	//
	//		TODO: Consider pulling this (and all other private '_' functions) out of the namespaces and into the local file's namespace
	//
	_initializeMembers: function (target, members) {
		/*DEBUG*/
		// Perform parameter validation
		if (!target)
			console.error("WinJS._initializeMembers: null or undefined 'target' specified.");
		/*ENDDEBUG*/

		var properties = {};

		// Enumerate over the specified set of members
		for (var memberKey in members) {

			var member = members[memberKey];
			if (member == null)
				continue;

			// allow the member to show in for..in loops
			member.enumerable = true;

			// Getters and setters are managed as regular properties
			if (typeof member === "object" && (typeof member.get === "function" || typeof member.set === "function")) {

				// Add the member to the list of properties (which we'll set below)
				properties[memberKey] = member;
			} else {

				// Add the member directly to the target object
				target[memberKey] = member;
			}
		}

		// If any getters/setters were specified, then add them now
		if (properties != {})
			Object.defineProperties(target, properties);
	},


	// ================================================================
	//
	// WinJS.strictProcessing
	//
	//		TODO: Stubbed out for now
	//
	//		NYI NYI NYI
	//
	strictProcessing: function () {
	}

};








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.DOMEventMixin.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.DOMEventMixin
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    DOMEventMixin: WinJS.Class.define(null, {

        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.addEventListener
        //
        //		MSDN: TODO
        //
        addEventListener: function (eventName, listener) {

            // Create the list of event listeners for the specified event if it does not yet exist
            if (!this._eventListeners[eventName])
                this._eventListeners[eventName] = [];

            // Add the listener to the list of listeners for the specified eventName
            this._eventListeners[eventName].push(listener);

            // Add DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.addEventListener(eventName, listener);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.removeEventListener
        //
        //		MSDN: TODO
        //
        removeEventListener: function (eventName, listener) {

            /*DEBUG*/
            // Parameter validation
            if (!this._eventListeners[eventName])
                console.warn("WinJS.DOMEventMixin.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
            /*ENDDEBUG*/

            // TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

            // Remove the listener from the list of listeners for the specified eventName
            var listeners = this._eventListeners[eventName];
            for (var i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return;
                }
            }

            // Remove DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.removeEventListener(eventName, listener);
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
        //
        dispatchEvent: function(eventName, eventProperties) {
        
        	var defaultPrevented = false;

        	if (!this._eventListeners[eventName])
        		return false;
        	
        	this._eventListeners[eventName].forEach(function(listener) {
        		if (!defaultPrevented)
        			defaultPrevented = listener(eventProperties);
        	});
        	
        	return defaultPrevented;
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh768233.aspx
        //
        setOptions: function(control, options) {
        
        	// TODO (CLEANUP): Can WinJS.UI.setOptions mixin this object, and move its logic to here?
        	WinJS.UI.setOptions(control, options);
        }
	})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.xhr.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.xhr.js
//
//		Implementation of the WinJS.xhr function
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229787.aspx
//
WinJS.Namespace.define("WinJS", {

	// ================================================================
	//
	// public function: WinJS.xhr
	//
	xhr: function (options) {

		var request;
		var requestType = options && options.type || "GET";

		return new WinJS.Promise(function (onComplete, onError, onProgress) {

			// track if we've completed the request already
			var requestCompleted = false;

			// Create the request
			request = new XMLHttpRequest();

			// Listen for changes
			request.onreadystatechange = function () {

				// If the request was cancelled, then just break out
				if (request.cancelled || requestCompleted)
					return;

				// Request completed?
				if (request.readyState == 4) {
					// Successful completion or failure?
					if (request.status >= 200 && request.status < 300) {
						onComplete(request);
					}
					else
						onError(request);

					// Ignore subsequent changes
					requestCompleted = true;
				} else {
					// Report progress (TODO: Promise doesn't support progress yet)
					// onProgress(request);
				}
			};

			// Open the request
			request.open(requestType, options.url, true);

			// Add request headers
			if (options.headers)
				options.headers.forEach(function (header) {
					request.setRequestHeader(key, header);
				});

			// Finally, send the request
			request.send(options.data);
		},

		// Error handler
		function () {
			request.cancelled = true;
			request.abort();
		});
	}
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //


// ================================================================
//
// Windows
//
// This is the root Windows namespace/object
WinJS.Namespace.define("Windows", {

    // ================================================================
    //
    // Windows.UI
    //
    //		This is the root Windows.UI namespace/object
    //
    //		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    UI: {
        ViewManagement: {

        	ApplicationView: {
        		value: null,
        	},

            ApplicationViewState: {

            	view: {
					value: this.filled,
            	},

            	// Enumeration
            	fullScreenLandscape: 0,
            	filled: 1,
            	snapped: 2,
				fullScreenPortrait: 3
            }
        }
    },


    // ================================================================
    //
    // Windows.ApplicationModel
    //
    //		This is the root Windows.ApplicationModel namespace/object
    //
	//		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    ApplicationModel: {
        isWeb: true,
        Activation: {
            ActivationKind: {
                launch: 0
            },

            ApplicationExecutionState: {
                terminated: 0
            }
        }
    },


	// ================================================================
	//
	// Windows.Graphics
	//
	//		TODO: Stubbed out for test purposes
	//
	//		NYI NYI NYI
	//
    Graphics: {
    	Display: {
    		DisplayProperties: {
    		}
    	}
    },

});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Foundation.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// =========================================================
//
// Minimalist implementation of Windows.Foundation to unblock stockSample
//
WinJS.Namespace.define("Windows.Foundation", {

	// =========================================================
	//
	//		TODO: Stub function
	//
	Uri: WinJS.Class.define(function (uri) {
		this.uri = uri;
	},
	{
	})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Globalization.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// =========================================================
//
// Minimalist implementation of Globalization to unblock stockSample
//
WinJS.Namespace.define("Windows.Globalization.DateTimeFormatting", {

    // =========================================================
	//
	//	WinJS.Globalization.DateTimeFormatting.DateTimeFormatter
	//
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.globalization.datetimeformatting.datetimeformatter
    //
	DateTimeFormatter: WinJS.Class.define(function (formatTemplate) {

		this._formatTemplate = formatTemplate;
	},
    {
    	format: function (date) {
    		// TODO: Parse the format string.  For now, hardcoded to what stockSample needs
    		if (this._formatTemplate == "hour minute")
    			return date.toLocaleFormat();
    		else
    			return "";
    	}
    })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.System.Launcher.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// =========================================================
//
// Minimalist implementation of Windows.System.Launcher to unblock stockSample
//
WinJS.Namespace.define("Windows.System.Launcher", {

	// =========================================================
	//
	//		TODO: Stub function
	//
	launchUriAsync: function (uri) {

		// TODO: App suspension?
		document.location.href = uri.uri;
	}
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Application.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Navigation.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Navigation
//
//		This is the root WinJS.Navigation namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229778.aspx
//
WinJS.Namespace.define("WinJS.Navigation", {

	// ================================================================
	//
	// private Function: WinJS.Navigation._init
	//
	_init: function () {

		/* NYI
		// bind to hash changes so that we can see them
		window.onhashchange = function (info) {

			// User either pressed back, pressed forward, navigated (via this.navigate), or entered a hash'ed URL directly into the address bar

			console.log(info, info.newURL);
		}*/
	},


	// ================================================================
	//
	// public Function: WinJS.Navigation.navigate
	//
	//		Navigates to the specified target. For now we don't do anything except notify of the navigate; navigator.js
	//		is responsible for doing the actual page load.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229837.aspx
	//
	navigate: function (targetPath, options) {

		var that = this;
		return new WinJS.Promise(function (onNavigationComplete) {

			var beforeNavigateSetPromise = null;
			var navigatingSetPromise = null;
			var navigatedSetPromise = null;

			var newPageInfo = {
				location: targetPath,
				state: options,
				defaultPrevented: false
			};

			newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
			that._notifyBeforeNavigate(newPageInfo);

			WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

				// did user cancel?
				if (newPageInfo.defaultPrevented) {
					return false;
				}

				// User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
				newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
				that._notifyNavigating(newPageInfo);

			}).then(function () {

				// Wait until the navigating setPromise (set by caller) - if any - is fulfilled
				return WinJS.Promise.as(navigatingSetPromise);

			}).then(function () {

				// Add the current page (and options) to the backStack.
				if (that.curPageInfo && that.curPageInfo.location != "")
					that.backStack.push(that.curPageInfo);

				// Track the new page as the current page
				that.curPageInfo = newPageInfo;

				newPageInfo.setPromise = function (p) { navigatedSetPromise = p; };

				// Notify listeners of the navigated event
				that._notifyNavigated(that.curPageInfo);
				if (navigatedSetPromise)
					WinJS.Promise.as(navigatedSetPromise).then(function () { onNavigationComplete(); });
				else
					onNavigationComplete();
			});
		});
	},


	// ================================================================
	//
	// public Function: WinJS.Navigation.back
	//
	//		Navigates back one page in the backstack.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229802.aspx
	//
	back: function () {

		if (this.backStack.length == 0)
			return new WinJS.Promise.as(null);

		// TODO: Merge this into the similar code in .navigate() above.

		// Get the url and options of the page to which we're going back.
		// Don't pop it since the caller could cancel the back
		var backPage = this.backStack[this.backStack.length - 1];
		var that = this;
		return new WinJS.Promise(function (onNavigationComplete) {

			var beforeNavigateSetPromise = null;
			var navigatingSetPromise = null;
			var navigatedSetPromise = null;

			var newPageInfo = {
				location: backPage.location,
				state: backPage.state,
				defaultPrevented: false
			};

			newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
			that._notifyBeforeNavigate(newPageInfo);
			WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

				// did user cancel?
				if (newPageInfo.defaultPrevented) {
					return false;
				}

				// User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
				newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
				that._notifyNavigating(newPageInfo);

			}).then(function () {

				// Wait until the navigating setPromise (set by caller) - if any - is fulfilled
				return WinJS.Promise.as(navigatingSetPromise);

			}).then(function () {

				// Remove the page from the backstack
				that.backStack.pop();

				// Push the previous current page onto the forward stack
				that.forwardStack.push(that.curPageInfo);

				// Track the backed-to page as the current page
				that.curPageInfo = backPage;
				that.curPageInfo.setPromise = function (p) {
					navigatedSetPromise = p;
				};
				// Notify listeners of the navigated event
				that._notifyNavigated(that.curPageInfo);

				if (navigatedSetPromise)
					WinJS.Promise.as(navigatedSetPromise).then(function () { onNavigationComplete(); });
				else
					onNavigationComplete();
			});
		});
	},


	// ================================================================
	//
	// public Function: WinJS.Navigation.forward
	//
	//		Navigates forward one page in the backstack.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229818.aspx
	//
	forward: function () {

		if (this.forwardStack.length == 0)
			return new WinJS.Promise.as(null);

		// TODO: Merge this into the similar code in .navigate() and .back() above.

		// Get the url and options of the page to which we're going.
		// Don't pop it since the caller could cancel the forward
		var forwardPage = this.forwardStack[this.forwardStack.length - 1];

		var that = this;
		return new WinJS.Promise(function (onNavigationComplete) {

			var beforeNavigateSetPromise = null;
			var navigatingSetPromise = null;
			var navigatedSetPromise = null;

			var newPageInfo = {
				location: forwardPage.location,
				state: forwardPage.state,
				defaultPrevented: false
			};

			newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
			that._notifyBeforeNavigate(newPageInfo);
			WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

				// did user cancel?
				if (newPageInfo.defaultPrevented) {
					return false;
				}

				// User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
				newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
				that._notifyNavigating(newPageInfo);

			}).then(function () {

				// Wait until the navigating setPromise (set by caller) - if any - is fulfilled
				return WinJS.Promise.as(navigatingSetPromise);

			}).then(function () {

				// Remove the page from the forwardstack
				that.forwardStack.pop();

				// Push the previous current page onto the back stack
				that.backStack.push(that.curPageInfo);

				// Track the backed-to page as the current page
				that.curPageInfo = forwardPage;
				that.curPageInfo.setPromise = function (p) {
					navigatedSetPromise = p;
				};
				// Notify listeners of the navigated event
				that._notifyNavigated(that.curPageInfo);

				if (navigatedSetPromise)
					WinJS.Promise.as(navigatedSetPromise).then(function () { onNavigationComplete(); });
				else
					onNavigationComplete();
			});
		});
	},


	// ================================================================
	//
	// public property: WinJS.Navigation.canGoBack
	//
	//		canGoBack: true if the user can go back
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229804.aspx
	//
	canGoBack: {
		get: function () { return this.backStack.length > 0; }
	},


	// ================================================================
	//
	// public property: WinJS.Navigation.canGoForward
	//
	//		canGoBack: true if the user can go forward
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229805.aspx
	//
	canGoForward: {
		get: function () { return this.forwardStack.length > 0; }
	},

	// ================================================================
	//
	// private: backStack: The stack of navigable pages/options through which the user can go back
	//
	backStack: [],

	// ================================================================
	//
	// private: forwardStack: The stack of navigable pages/options through which the user can go forward
	//
	forwardStack: [],

	// ================================================================
	//
	// private: curPageInfo: the current page to which we are navigated.
	//
	curPageInfo: null,


	// ================================================================
	//
	// public function: WinJS.Navigation.addEventListener
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229800.aspx
	//
	addEventListener: function (eventName, listener) {

		// TODO: Can I leverage DOMEventMixin here now?
		
		/*DEBUG*/
		// Parameter validation
		if (!this._eventListeners[eventName])
			console.warn("WinJS.Navigation.addEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
		/*ENDDEBUG*/

		// Add the listener to the list of listeners for the specified eventName
		this._eventListeners[eventName].push(listener);
	},


	// ================================================================
	//
	// public function: WinJS.Navigation.removeEventListener
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229849.aspx
	//
	removeEventListener: function (eventName, listener) {

		/*DEBUG*/
		// Parameter validation
		if (!this._eventListeners[eventName])
			console.warn("WinJS.Navigation.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
		/*ENDDEBUG*/

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
	// private function: WinJS.Navigation._notifyBeforeNavigate
	//
	_notifyBeforeNavigate: function (eventData) {
		var eventInfo = {
			target: this,
			type: "beforenavigate",
			detail: eventData
		};

		for (var i in this._eventListeners.beforenavigate)
			this._eventListeners.beforenavigate[i](eventInfo);
		eventData.defaultPrevented = eventInfo.defaultPrevented;
	},

	// ================================================================
	//
	// private function: WinJS.Navigation._notifyNavigating
	//
	_notifyNavigating: function (eventData) {
		var eventInfo = {
			target: this,
			type: "navigating",
			detail: eventData
		};

		for (var i in this._eventListeners.navigating)
			this._eventListeners.navigating[i](eventInfo);
	},


	// ================================================================
	//
	// private function: WinJS.Navigation._notifyNavigated
	//
	_notifyNavigated: function (eventData) {

		var eventInfo = {
			target: this,
			type: "navigated",
			detail: eventData
		};

		for (var i in this._eventListeners.navigated)
			this._eventListeners.navigated[i](eventInfo);
	},


	// ================================================================
	//
	// public event: WinJS.Navigation.onbeforenavigate
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229838.aspx
	//
	onbeforenavigate: {
		get: function () { return this._eventListeners["beforenavigate"]; },
		set: function (callback) { this.addEventListener("beforenavigate", callback); }
	},


	// ================================================================
	//
	// public event: WinJS.Navigation.onnavigating
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229843.aspx
	//
	onnavigating: {
		get: function () { return this._eventListeners["navigating"]; },
		set: function (callback) { this.addEventListener("navigating", callback); }
	},


	// ================================================================
	//
	// public event: WinJS.Navigation.onnavigated
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229842.aspx
	//
	onnavigated: {
		get: function () { return this._eventListeners["navigated"]; },
		set: function (callback) { this.addEventListener("navigated", callback); }
	},


	// ================================================================
	//
	// Our event listeners
	//
	_eventListeners: {
		beforenavigate: [],
		navigating: [],
		navigated: []
	},


	// ================================================================
	//
	// public property: WinJS.Navigation.history
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229830.aspx
	//
	history: {
		get: function () {
			return {
				backStack: this.backStack,
				forwardStack: this.forwardStack,
				current: this.curPageInfo ? this.curPageInfo.location : "",
			};
		},

		set: function (value) {
			if (!value || value == {}) {
				this.backStack = [];
				this.forwardStack = [];
				this.curPageInfo = null;
			} else {
				// if back/forward stack not specified, then use an empty array
				this.backStack = value.backStack ? value.backStack.slice() : [];
				this.forwardStack = value.forwardStack ? value.forwardStack.slice() : [];
				this.curPageInfo.location = value.current && value.current.location ? value.current.location : "";
			}
		}
	},


	// ================================================================
	//
	// public property: WinJS.Navigation.location
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229835.aspx
	//
	location: {
		get: function () {
			return this.curPageInfo ? this.curPageInfo.location : null;
		},
		set: function (value) {
			this.curPageInfo.location = value;
		}
	},


	// ================================================================
	//
	// public property: WinJS.Navigation.state
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229850.aspx
	//
	state: {
		get: function () {
			return this.curPageInfo.state;
		},
		set: function (value) {
			this.curPageInfo.state = value;
		}
	}
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Resources.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Resources
//
//		Implementation of the WinJS.Resources object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.Resources", { }, {
    	
	// ================================================================
	//
	// public function: WinJS.Resources.processAll
	//
	//		MSDN: TODO
	//
	processAll: function() {
		throw "nyi";
	},
	
		    	
	// ================================================================
	//
	// public function: WinJS.Resources.getString
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701590.aspx
	//
	getString: function() {
		throw "nyi";
	},
    
        	    	
	// ================================================================
	//
	// public event: WinJS.Resources.oncontextchanged
	//
	//		MSDN: TODO
	//
	oncontextchanged: {
		get: function () { return this._eventListeners["contextchanged"]; },
		set: function (callback) { this.addEventListener("contextchanged", callback); }
	}
});

// inject addEventListener (et al) into WinJS.resources
// TODO: Test this actually works
//WinJS.Class.mix(WinJS.Resources, WinJS.UI.DOMEventMixin);
console.warn("do this");








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Promise.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Promise
//
// Provides a mechanism to schedule work to be done on a value that has not yet been computed.
// It is an abstraction for managing interactions with asynchronous APIs.
//
WinJS.Namespace.define("WinJS", {


	// ================================================================
	//
	// public Object: WinJS.Promise
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211867.aspx
	//
	//		TODO: Numerous unimplemented members: any, all, is, etc.
	//
	Promise: WinJS.Class.define(

        // ================================================================
        //
        // public Function: Promise Constructor
        //
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211866.aspx
		//
		//		TODO: Not handling onCancel yet
		//
        function (init, onCancel) {
        	/*DEBUG*/
        	// Perform parameter validation
        	if (!init)
        		console.error("WinJS.Promise: null or undefined initialization function passed to constructor");
        	/*ENDDEBUG*/

        	this._thenPromises = [];

        	// _completed: True if the Promise was fulfilled successfully
        	this._completed = false;

        	// _completedWithError: True if the Promise compled with an error
        	this._completedWithError = false;

        	// _completedValue: The value of the fulfilled Promise
        	this._completedValue = null;

        	// thenPromise variables
        	this._onThenComplete = null;
        	this._onThenError = null;
        	this._onThenProgress = null;

        	this._thenCompletes = [];

        	// Call the init callback function; this will kick off the (potentially long-lived) async process
        	var that = this;
        	init(function completed(value) { that._complete(value); },
                 function error(value) { that._error(value); },
                 function progress(value) { that._progress(value); });
        },

		// ================================================================
		// Per-instance members of WinJS.Promise
		// ================================================================
        {
        	// ================================================================
        	//
        	// public Function: Promise.then
        	//
        	//		Caller is asking us to call 'then' when we are complete.  If we're already
        	//		complete then go ahead and call; otherwise, return a Promise that we will
        	//		do so.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229728.aspx
        	//
        	//		TODO: Not handling error or progress callbacks yet
        	//
        	then: function (thenComplete, thenError, thenProgress) {

        	    if (!thenComplete)
        	        return this._completedValue;

        		if (this._completed) {
        			return new WinJS.Promise.as(thenComplete(this._completedValue));
        		} else if (this._completedWithError) {
        			if (thenError)
        				return new WinJS.Promise.as(thenError(this._completedValue));
        			else
        				return this._completedValue;
        		} else {

        			// This Promise hasn't completed yet; create a new then promise that we'll trigger when we complete.
        			var thenPromise = new WinJS.Promise(function () { });

        			// Track the functions to call on complete/error/progress
        			thenPromise._thenComplete = thenComplete;
        			thenPromise._thenError = thenError;
        			thenPromise._thenProgress = thenProgress;

        			this._thenPromises.push(thenPromise);

        			return thenPromise;
        		}
        	},

        	// ================================================================
        	//
        	// private Function: Promise.complete
        	//
        	//		Completion handler that's called when a promise completes successfully.
        	//
        	_complete: function (value) {

        		// Track that we've completed; for Promises that complete instantly (e.g. synchronously), we need to know that they've 
        		// completed for subsequent .then()s.
        		this._completed = true;
        		this._completedValue = value;

        		// Trigger any chained 'then' Promises
        		this._thenPromises.forEach(function (thenPromise) {

        			// Call the then promise's completion function (signifying that its dependent Promise has been fulfilled)
        			var thenResult = thenPromise._thenComplete(value);

        			// If the then is itself further chained, then we need to take thenResult and ensure it's a Promise, so that
        			// we can call the next-chained then function when thenResult is fulfilled.  This is important because the
        			// current thenPromise cannot notify that its been completed until the chainedPromise has itself been fulfilled.
        			// Yeah; this gets kind of hard to follow.
        			var chainedPromise = WinJS.Promise.as(thenResult);
        			if (chainedPromise) {	// TODO: I don't think this check is needed any more.

        				// When the Promise that we've chained off of thenPromise has completed, THEN we can notify that thenPromise has completed.
        				chainedPromise.then(function (v) {
        					thenPromise._complete(v);
        				});
        			}
        		});
        	},


        	// ================================================================
        	//
        	// private Function: Promise._error
        	//
        	//		Completion handler that's called when a promise completes with an error
        	//
        	_error: function (value) {

        		// Track that we've completed with error; for Promises that complete instantly (e.g. synchronously), we need to know that they've 
        		// completed for subsequent .then()s.
        		this._completedWithError = true;
        		this._completedValue = value;

        		// Trigger any chained 'then' Promises
        		this._thenPromises.forEach(function (thenPromise) {

        			// The error function is optional; if unspecified then just carry on.
        			if (!thenPromise._thenError)
        				return;

        			// Call the then promise's error function (signifying that its dependent Promise has been fulfilled)
        			var thenResult = thenPromise._thenError(value);

        			// See _complete for the convoluted explanation as to what's going on here.
        			var chainedPromise = WinJS.Promise.as(thenResult);
        			if (chainedPromise) {

        				// When the Promise that we've chained off of thenPromise has completed, THEN we can notify that thenPromise has completed.
        				// TODO: I Need to understand what the expected error result bubbling is here; e.g. do I need to even specify an onComplete
        				// function (the first param) in the then call below since an Error has already occurred?
        				chainedPromise.then(function (v) {
        					thenPromise._error(v);
        				}, function (v) {
        					thenPromise._error(v);
        				});
        			}
        		});
        	},

        	// ================================================================
        	//
        	// public Function: Promise.done
        	//
        	//		Caller is asking us to promise to call 'done' when we are complete.  done differs from then
        	//		in that you cannot chain off of done.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701079.aspx
        	//
        	done: function (onComplete, onError, onProgress) {
        		/*DEBUG*/
        		// Perform parameter validation
        		if (!onComplete)
        			console.error("WinJS.Promise.done: null or undefined onComplete function specified.");
        	    /*ENDDEBUG*/

        		// TODO: remove this after .done is implemented.
        		if (!blueskyUtils._warnedDoneNYI) {
        			console.warn("Promise.done is NYI; replacing with .then()");
        			blueskyUtils._warnedDoneNYI = true;
        		}

        		return this.then(onComplete, onError, onProgress);
        	},
        },

		// ================================================================
		// static members of WinJS.Promise
		// ================================================================

		{

			// ================================================================
			//
			// public Function: Promise.timeout
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229729.aspx
			//
			//		TODO: support amount of time.  none specified == immediate.
			//		TODO: support promise parameter
			//
			timeout: function (timeout, promise) {
				// If no timeout was specified, then set to 0 (essentially immediately)
				if (!timeout)
					timeout = 1;

				// Return a Promise that we'll complete when the timeout finishes.
				return new WinJS.Promise(function (c) { setTimeout(c, timeout); });
			},


			// ================================================================
			//
			// public Function: Promise.as
			//
			//		MSDN: http://http://msdn.microsoft.com/en-us/library/windows/apps/br211664.aspx
			//
			as: function (value) {

				// If the specified value is already a Promise then just return it.
				if (WinJS.Promise.is(value))
					return value;

				// The specified value isn't a Promise; create a new Promise that wraps it and return it now
				return new WinJS.Promise(function (c) { c(value); });
			},


			// ================================================================
			//
			// public Function: Promise.wrap
			//
			//		MSDN: TODO
			//
			wrap: function (value) {

				// TODO: Make sure this is what wrap is supposed to do; the difference between .as and .wrap
				return new WinJS.Promise(function (c) { c(value); });
			},


			// ================================================================
			//
			// public Function: Promise.is
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211765.aspx
			//
			is: function (value) {

				// TODO: Currently checking for existing of the then function; this will fire a false-positive if
				// the object is not a Promise but has an unrelated complete function.  What's the right way to check
				// for Promise'ness?
				return (value && value.then && typeof value.then === "function")
			},


			// ================================================================
			//
			// public Function: Promise.join
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211774.aspx
			//
			//		TODO: This is just a skeletal implementation, not thought through yet.
			//		TODO: Not handing errors, progress, or undefined promises.
			//
			join: function (promises) {

				// TODO: support empty list

				return new WinJS.Promise(function (c, e, p) {
					var results = [];
					if (!promises) {
						c(results);
					} else {
						// If a single promise was specified, then convert to array
						if (!promises.length)
							promises = [promises];

						var numPromises = promises.length;

						// Define the function to call when each promise is done; when we've called it numPromises times, then fire our complete event
						var promiseComplete = function (p) {
							if (--numPromises == 0)
								c(results);
						};

						// For each promise that was passed in, tack on a 'then' that will call our promiseComplete function
						// TODO: This is not fully implemented or thought through yet.  e.g. if a promise chain ends in done(),
						// then can we actually chain a then() on here?
						promises.forEach(function (p) {
							p.then(function (value) {
								results.push(value);
								promiseComplete(p);
							});
						});
					}
				});
			}
		})

});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Binding namespace
//
//		MSDN Docs: http://msdn.microsoft.com/en-us/library/windows/apps/br229775.aspx
//
WinJS.Namespace.defineWithParent(WinJS, "Binding", {

	// ================================================================
	//
	// public function: WinJS.Binding.as
	//
	//		Given an object, returns an observable object to which the caller can subsequently bind via this.bind().
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229801.aspx
	//
	as: function (data) {

		// If data is an object then wrap it; otherwise just return it as-is
		if (typeof data === "object") {

			// Create a bindable wrapper around the data.
			var BoundClass = WinJS.Binding.define(data);

			// Return the observable object.  Caller can bind to data via the wrapper's .bind() function.
			return new BoundClass(data);
		} else {
			return data;
		}
	},


	define: function (data) {

		// Return a function that generates an observable class with the properties in the specified data object
		var newClass = WinJS.Class.define(function (initialState) {

			// Set initial data
			this.sourceData = initialState || {};
			for (var key in initialState) {

				try {
					// TODO: If the target is a function that only has a getter, then this borks.  What should we do in
					// that case - or for functions in general?  try/catching for now.
					this.sourceData[key] = initialState[key];

				} catch (e) {
				}
			}
		},

		// ================================================================
		// WinJS.Binding.BoundClass members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.Binding.bind
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211857.aspx
			//
			bind: function (name, action) {

				// Create the list of listeners for 'name' if not yet created
				this.listeners[name] = this.listeners[name] || [];

				// If name has already been bound to action then there's nothing more to do
				if (this.listeners[name].indexOf(action) >= 0)
					return this;

				this.listeners[name].push(action);

				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.getProperty
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701588.aspx
			//
			getProperty: function (name) {

				return WinJS.Binding.as(this.sourceData[name]);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.setProperty
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701610.aspx
			//
			setProperty: function (name, value) {

				this.updateProperty(name, value);

				// return this object
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.updateProperty
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701633.aspx
			//
			updateProperty: function (name, value) {

				var oldValue = this.sourceData[name];
				var newValue = WinJS.Binding.unwrap(value);

				// If the value didn't change then we don't fire notifications, but we still need to return a promise
				if (newValue == oldValue)
					return WinJS.Promise.as();

				// The value changed; update it in the source data
				this.sourceData[name] = newValue;

				// Notify any listeners of the change
				return this.notify(name, newValue, oldValue);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.notify
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701592.aspx
			//
			notify: function (name, newValue, oldValue) {

				// If nothing's listening to changes on the property 'name' then just return
				if (!this.listeners[name])
					return WinJS.Promise.as();

				// Notifications must be asynchronous, so wrap them in a timeout
				// TODO: What if a notification is already in the wings (e.g. value changes again before this promise completes)?
				//		 Keep a list of pending notifications by name and remove pending ones.
				var that = this;
				return WinJS.Promise.timeout()
					.then(function () {

						that.listeners[name].forEach(function (listener) {
							listener(newValue, oldValue)
						});
					})
					.then(function () {
						return newValue;
					});
			},


			// Reference to the original source data
			sourceData: {},

			// Listeners
			listeners: {},
		});

		// Combine the list of properties from 'data' into the class prototype we created above.
		WinJS.Class.mix(newClass, WinJS.Binding.expandProperties(data));

		// return the class prototype that we created
		return newClass;
	},


	// ================================================================
	//
	// public function: WinJS.Binding.unwrap
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211870.aspx
	//
	unwrap: function (data) {

		if (data && data.sourceData)
			return data.sourceData;

		return data;
	},


	// ================================================================
	//
	// public function: WinJS.Binding.expandProperties
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229817.aspx
	//
	expandProperties: function (shape) {

		var properties = {};

		while (shape) {
			Object.keys(shape).forEach(function (propertyName) {

				properties[propertyName] = {

					get: function () {
						return this.getProperty(propertyName);
					},

					set: function (propertyValue) {
						return this.setProperty(propertyName, propertyValue);
					},

					// allow the property to show up in for..in loops
					enumerable: true,

					// Allow the property's attributes to be modified
					configurable: true
				}
			});
			shape = Object.getPrototypeOf(shape);
		}
		return properties;
	},


	// ================================================================
	//
	// public Function: WinJS.Binding.processAll
	//
	//		Looks for the data-win-bind attribute at the specified element (and all descendants of that element).  Performs
	//		an in-place replacement of field/value.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229846.aspx
	//
	//		TODO: Add support for parameter 'skipRoot'
	//		TODO: Add support for parameter 'bindingCache'
	//		TODO: Add support for data-win-bindsource
	//
	processAll: function (rootElement, dataContext, skipRoot, bindingCache) {

		/*DEBUG*/
		// Check for NYI parameters or functionality
		if (skipRoot)
			console.warn("WinJS.Binding.processAll - support for skipRoot is not yet implemented");
		if (bindingCache)
			console.warn("WinJS.Binding.processAll - support for bindingCache is not yet implemented");
		if ($("[data-win-bindsource]", rootElement).length > 0)
			console.warn("WinJS.Binding.processAll - support for data-win-bindsource is not yet implemented");
		/*ENDDEBUG*/

		return new WinJS.Promise(function (onComplete) {
			// Iterate (recursively) over all elements within rootElement that have "data-win-bind" set
			$("[data-win-bind]", rootElement).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Convert Win8 data-win-bind string (which is quasi-valid js format) into a js object.
				var winBinds = blueskyUtils.convertDeclarativeDataStringToJavascriptObject(this.dataset.winBind);

				// Iterate over all specified win-binds.
				for (var targetField in winBinds)
					WinJS.Binding._bindField(this, targetField, winBinds[targetField], dataContext);
			});

			// Notify that we've fulfilled our promise to processAll
			onComplete();
		});
	},


	// ================================================================
	//
	// private Function: WinJS.Binding._bindField
	//
	//  listens for changes on the specified data field and updates the specified DOM element when the field changes
	//
	_bindField: function (rootElement, targetField, sourceField, dataContext) {

		// If the dataContext is observable (e.g. was generated by calling WinJS.Binding.as()), then establish a bind contract so that
		// we can update the UI when the bound object's values change.
		if (dataContext.bind != undefined) {
			var thisElement = rootElement;

			dataContext.bind(sourceField, function (newValue, oldValue) {
				// At this point, the source data to which this element's field is bound has changed; update our UI to reflect the new value
				WinJS.Binding._updateBoundValue(thisElement, targetField, dataContext[sourceField]);
			});
		}

		// Update bound value immediately (whether the dataContext is observable or not)
		WinJS.Binding._updateBoundValue(rootElement, targetField, dataContext[sourceField]);
	},


	// ================================================================
	//
	// private Function: WinJS.Binding._updateBoundValue
	//
	//  Immediately updates the specified bound element/field to the new value
	//
	_updateBoundValue: function (targetElement, targetField, newValue) {

		/*DEBUG*/
		// Check for NYI functionality
		if (targetField.split('.').length > 2)
			console.warn("WinJS.Binding._updateBoundValue: field '" + targetField + "' is binding too deeply; only up to 2 levels of depth (e.g. 'style' (1 level) or 'style.backgroundColor' (2 levels)) are currently supported in bound field names.");
		/*ENDDEBUG*/

		// TODO: I fully expect there's a good JS'y way to deref from object["style.backgroundColor"] to object.style.backgroundColor, but I don't 
		// know what it is yet (and am hoping it doesn't involve a for loop).  Once I figure that out, I can just use that.  For now though, I'm
		// hard-coding support for 1 and 2 '.'s
		if (targetField.indexOf(".") >= 0) {

			// Handle binding to "style.backgroundColor" and similar fields.  Per above, I'm hoping to collapse this into the 'else' code, and also
			// generically extend to support "foo.bar.xyz.abc"
			var fields = targetField.split('.');
			targetElement[fields[0]][fields[1]] = newValue;
		} else {

			// "innerText" isn't supported on FireFox, so convert it to the W3C-compliant textContent property.  I suspect there will be 
			// more of these one-offs as we support more browsers.  Good reference: http://www.quirksmode.org/dom/w3c_html.html#t07See
			// TODO: Move this to a DOMElement extension?  Or find other way to not add this cost to non-IE browsers...  is there an existing polyfill for it?
			if (targetField == "innerText")
				targetField = "textContent";

			// Set the target element's target field to the source data's corresponding field.  Oh, the joy of javascript...
			targetElement[targetField] = newValue;
		}
	}
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding._ListBase.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// shouldn't be constructed outside of bluesky.js
	_ListBase: WinJS.Class.define(function () { }, {

		/*DEBUG*/
		// The functions in this debug block are abstract, so if we get into them it means a derived class didn't implement them
		getItem: function (index) {
			console.error("Unexpected call into abstract function _ListBase.getItem");
		},

		getItemFromKey: function (key) {
			console.error("Unexpected call into abstract function _ListBase.getItemFromKey");
		},
		indexOfKey: function (key) {
			console.error("Unexpected call into abstract function _ListBase.indexOfKey");
		},
		length: {
			get: function () {
				console.error("Unexpected call into abstract function _ListBase.length.getter");
			},
			set: function () {
				console.error("Unexpected call into abstract function _ListBase.length.setter");
			}
		},

		/*ENDDEBUG*/


		// ================================================================
		//
		// public function: WinJS.Binding.List.getAt
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700749.aspx
		//
		getAt: function (index) {

			// Return the value at the specified index.  Note: this multiple level of abstraction is to support
			// Grouped and Filtered lists when they come online.
			return this.getItem(index).data;
		},


		// ================================================================
		//
		// private function: WinJS.Binding.List._getValues
		//
		//		Returns an array that contains the values in this._items
		//
		_getValues: function () {

			// _items is a set (not an array) so we can't just return it but need to array'ize it.
			var values = [];
			for (var i = 0; i < this.length; i++) {
				var item = this.getItem(i);
				if (item)
					values[i] = this.getItem(i).data;
			}

			return values;
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.concat
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700739.aspx
		//
		concat: function (items) {

			// NOTE: Win8 does not return a WinJS.Binding.List (as of release preview), so neither do we.
			// This applies to numerous other functions here as well.
			return this._getValues().concat(items);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.join
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700759.aspx
		//
		join: function (separator) {

			return this._getValues().join(separator || ",");
		},



		// ================================================================
		//
		// public function: WinJS.Binding.List.forEach
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700747.aspx
		//
		forEach: function (callback, thisArg) {

			this._getValues().forEach(callback, thisArg);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.map
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700766.aspx
		//
		map: function (callback, thisArg) {

			return this._getValues().map(callback, thisArg);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.some
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700804.aspx
		//
		some: function (callback, thisArg) {

			return this._getValues().some(callback, thisArg);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.every
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700744.aspx
		//
		every: function (callback, thisArg) {

			return this._getValues().every(callback, thisArg);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.reduce
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700784.aspx
		//
		reduce: function (callback, initialValue) {

			return this._getValues().reduce(callback, initialValue);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.reduceRight
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700782.aspx
		//
		reduceRight: function (callback, initialValue) {

			return this._getValues().reduceRight(callback, initialValue);
		},

		// ================================================================
		//
		// public function: WinJS.Binding.List.indexOf
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700757.aspx
		//
		indexOf: function (searchElement, fromIndex) {

			return this._getValues().indexOf(searchElement, fromIndex);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.lastIndexOf
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700760.aspx
		//
		lastIndexOf: function (searchElement, fromIndex) {

			var list = this._getValues();
			// Interesting; lastIndexOf doesn't like 'undefined' for fromIndex - at
			// least on FF13.  indexOf (above) doesn't have this problem.  If fromIndex
			// isn't specified then set it to last item in the list
			if (fromIndex === undefined)
				fromIndex = list.length - 1;
			return list.lastIndexOf(searchElement, fromIndex);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.slice
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700802.aspx
		//
		slice: function (start, end) {

			return this._getValues().slice(start, end);
		},

		// ================================================================
		//
		// public function: WinJS.Binding.List.filter
		//
		//		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700745.aspx
		//
		filter: function (callback, thisArg) {

			return this._getValues().filter(callback, thisArg);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.createFiltered
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700741.aspx
		//
		createFiltered: function (inclusionFunction) {

			return new WinJS.Binding.FilteredListProjection(this, inclusionFunction);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.createGrouped
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700742.aspx
		//
		createGrouped: function (groupKeySelector, groupDataSelector) {

			return new WinJS.Binding.GroupedSortedListProjection(this, groupKeySelector, groupDataSelector);
		},

		// ================================================================
		//
		// private function: WinJS.Binding.List.copyItem
		//
		//		Creates a copy of a list item
		//
		copyItem: function (item) {
			return {
				key: item.key,
				data: item.data,
				groupKey: item.groupKey,
				groupSize: item.groupSize,
			};
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.addEventListener
		//
		//		MSDN: TODO
		//
		addEventListener: function (eventName, listener) {

			// TODO: Can I leverage DOMEventMixin here now?
		
			// Create the list of event listeners for the specified event if it does not yet exist
			// TODO: Apply this version of addEventListener to other controls.
			if (!this._eventListeners[eventName])
				this._eventListeners[eventName] = [];

			// Add the listener to the list of listeners for the specified eventName
			this._eventListeners[eventName].push(listener);

			// Add DOM element event handlers (e.g. click).
			// TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
			//this.element.addEventListener(eventName, listener);
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.removeEventListener
		//
		//		MSDN: TODO
		//
		removeEventListener: function (eventName, listener) {

			/*DEBUG*/
			// Parameter validation
			if (!this._eventListeners[eventName])
				console.warn("WinJS.Binding.List.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
			/*ENDDEBUG*/

			// TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

			// Remove the listener from the list of listeners for the specified eventName
			var listeners = this._eventListeners[eventName];
			for (var i = 0; i < listeners.length; i++) {
				if (listener === listeners[i]) {
					listeners.splice(i, 1);
					return;
				}
			}

			// Remove DOM element event handlers (e.g. click).
			// TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
		//	this.element.removeEventListener(eventName, listener);
		},

		// ================================================================
		//
		// private function: WinJS.Binding.List._notifyItemChanged
		//
		//		Notify any listeners that an item in the list changed
		//
		_notifyItemChanged: function (eventData) {

			// TODO: These event listeners are all very similar; how best to generalize?
			var eventInfo = {
				target: this,
				type: "itemchanged",
				detail: eventData
			};
			for (var i in this._eventListeners.itemchanged)
				this._eventListeners.itemchanged[i](eventInfo);
		},


		// ================================================================
		//
		// private function: WinJS.Binding.List._notifyItemRemoved
		//
		//		Notify any listeners that an item in the list was removed
		//
		_notifyItemRemoved: function (eventData) {

			var eventInfo = {
				target: this,
				type: "itemremoved",
				detail: eventData
			};
			for (var i in this._eventListeners.itemremoved)
				this._eventListeners.itemremoved[i](eventInfo);
		},


		// ================================================================
		//
		// private function: WinJS.Binding.List._notifyItemInserted
		//
		//		Notify any listeners that an item in the list was inserted
		//
		_notifyItemInserted: function (eventData) {

			var eventInfo = {
				target: this,
				type: "iteminserted",
				detail: eventData
			};
			for (var i in this._eventListeners.iteminserted)
				this._eventListeners.iteminserted[i](eventInfo);
		},
		// Events
		oniteminserted: {
			get: function () { return this._eventListeners["iteminserted"]; },
			set: function (callback) { this.addEventListener("iteminserted", callback); }	// TODO: iteminserted or oniteminserted?
		},
		onitemchanged: {
			get: function () { return this._eventListeners["itemchanged"]; },
			set: function (callback) { this.addEventListener("itemchanged", callback); }
		},
		onitemremoved: {
			get: function () { return this._eventListeners["itemremoved"]; },
			set: function (callback) { this.addEventListener("itemremoved", callback); }
		},

		onitemmoved: {
			get: function () { return this._eventListeners["itemmoved"]; },
			set: function (callback) { this.addEventListener("itemmoved", callback); }
		},
		onreload: {
			get: function () { return this._eventListeners["reload"]; },
			set: function (callback) { this.addEventListener("reload", callback); }
		},
		onitemmutated: {
			get: function () { return this._eventListeners["itemmutated"]; },
			set: function (callback) { this.addEventListener("itemmutated", callback); }
		}
	}),
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding._ModifiableListBase.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// shouldn't be constructed outside of bluesky.js
	_ModifiableListBase: WinJS.Class.derive(WinJS.Binding._ListBase, null, {

		// ================================================================
		//
		// public function: WinJS.Binding.List.push
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700779.aspx
		//
		push: function (value) {

			// Add the value to our list of values
			var valueKey = this._addValue(value);

			// Notify any listeners of the insertion
			this._notifyItemInserted({ key: valueKey, index: this.length, value: value });
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.splice
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700776.aspx
		//
		pop: function () {

			// Return the last item in our list
			var poppedValues = this.splice(-1, 1);
			if (poppedValues && poppedValues.length >= 1)
				return poppedValues[0];
			return null;
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.shift
		//
		//		MSDN: TODO
		//
		shift: function () {

			// TODO: Add test for List.shift
			return this.splice(0, 1)[0];
		},

		// TODO: Add unshift

		// ================================================================
		//
		// private function: WinJS.Binding.List._getNewKey
		//
		//		Returns a unique (for this list) key 
		//
		_getNewKey: function () {

			// Get a unique (for this list) key and ensure the next key gotten is unique
			return this._currentKey++;
		},


	}),
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.List.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.List
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700774.aspx
	//
	List: WinJS.Class.derive(WinJS.Binding._ModifiableListBase,

		// ================================================================
		//
		// public function: WinJS.Binding.List constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700764.aspx
		//
		function (list, options) {

			// initialize the set of event listeners
			this._eventListeners = [];

			// Initialize our value set and key array
			this._items = {};
			this._keys = [];
			this._currentKey = 0;

			// If caller specified values with which to pre-populate this list, then do so now.  Note that
			// we do not trigger item insertion in the initialization scenario.
			if (list) {
				for (var i in list)
					this._addValue(list[i]);
			}

			if (options) {
				WinJS.UI.setOptions(options);
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list

			// TODO: Apply same final solution to other List types
			this.dataSource = new WinJS.UI.IListDataSource(this, this._items);
			//WinJS.Binding.as(this._items);
			//this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.List members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.Binding.List.splice
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700810.aspx
			//
			splice: function (index, amount, item) {

				var removedItems = [];
				if (index < 0)
					index += this.length;

				// Remove 'amount' items starting at index 'index'
				while (amount > 0) {

					// Get the key and value at the current index
					var key = this._keys[index];
					/*DEBUG*/
					if (!this._items[key])
						console.warn(key + " key specified in List.splice");
					/*ENDDEBUG*/

					var removedItem = this._items[key];
					var removedValue = removedItem.data;

					// Do the removal from our list
					this._keys.splice(index, 1);

					// Track the removed items
					removedItems.push(removedValue);

					// Notify any listeners of the removal
					this._notifyItemRemoved({ key: key, value: removedValue, item: removedItem, index: index });

					// Delete the actual item
					delete this._items[key];

					// One less to remove...
					amount--;
				}

				// If caller specified items to insert in place of the spliced items, then insert them now
				if (arguments.length > 2) {

					for (var i = 2; i < arguments.length; i++) {

						// Get the item to add from the argumnet list
						var itemToAdd = arguments[i];

						// If user specified binding in options in the List constructor, then call as on all element values.
						if (this.binding)
							value = WinJS.Binding.as(value);

						// Determine the position at which to insert the item
						var pos = Math.min(index + i - 2, this.length);

						// Get a new unique key for the item we're adding
						var itemKey = this._getNewKey();

						// Generate the key/value pair that we'll store in our list and store it
						this._items[itemKey] = {
							key: itemKey,
							data: itemToAdd,
							index: pos
						};
						this._keys.splice(pos, 0, itemKey);

						// Notify any listeners of the addition
						this._notifyItemInserted({ key: itemKey, index: pos, value: itemToAdd });
					}
				}

				// Update the indices of items after the spliced items
				for (var i = index; i < this.length; i++) {
					this.getItem(i).index = i;
				}

				return removedItems;
			},


			// ================================================================
			//
			// private function: WinJS.Binding.List._spliceAtKey
			//
			//		Performs a splice starting at the specified key
			//
			_spliceAtKey: function (key, howMany) {

				var args = Array.prototype.slice.call(arguments);

				// Replace key with the index of key within this list
				args[0] = this._keys.indexOf(key);

				// Perform the splice
				return this.splice.apply(this, args);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.shift
			//
			//		MSDN: TODO
			//
			shift: function () {

				// TODO: Add test for List.shift
				return this.splice(0, 1)[0];
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.indexOfKey
			//
			//		MSDN: TODO
			//
			indexOfKey: function (key) {

				return this._keys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.List._addValue
			//
			//		Adds a value to the list, storing a key/value pair
			//
			_addValue: function (value) {

				// Get a new unique key for the item we're adding
				var valueKey = this._getNewKey();

				// If user specified binding in options in the List constructor, then call as on all element values
				if (this.binding)
					value = WinJS.Binding.as(value);

				// Generate the key/value pair that we'll store in our list and store it
				this._items[valueKey] = {
					key: valueKey,
					data: value,
					index: this._keys.length
				};
				this._keys.push(valueKey);

				// Return the key/value pair
				return valueKey;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.setAt
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700796.aspx
			//
			setAt: function (index, value) {

				if (index == this.length) {
					// Index is setting at the end - just do a push
					this.push(value);

				} else if (index < this.length) {

						// If user specified binding in options in the List constructor, then call as on all element values.
					if (this.binding)
						value = WinJS.Binding.as(value);

					var key = this._keys[index];
					var prevItem = this._items[key];
					var newItem = this.copyItem(prevItem);
					newItem.data = value;
					newItem.index = index;
					this._items[key] = newItem;
					/*
					{
						key: prevItem.key,
						data: value,
						index: index
					};*/

					// Notify any listeners of the change
					this._notifyItemChanged({
						key: key,
						index: index,
						oldValue: prevItem.data,
						newValue: value,
						oldItem: prevItem,
						newItem: newItem
					});
				}
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.length
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700762.aspx
			//
			length: {
				// Get the length of this list
				get: function () {
					return this._keys.length;
				},

				// Set the length of this list
				set: function (newLength) {
					if (newLength < this._keys.length)
						this.splice(newLength, this._keys.length - newLength);
					// TODO: what if > ?
				}
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.getItem
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700753.aspx
			//
			getItem: function (index) {

				/*DEBUG*/
				if (index === undefined || index > this.length)
					console.warn("WinJS.Binding.List.getItem: Invalid index (" + index + ") specified - Undefined or longer than list length (" + this.length + ")");
				/*ENDDEBUG*/

				// Get the key/value pair at the specified index
				return this.getItemFromKey(this._keys[index]);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.getItemFromKey
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700750.aspx
			//		
			getItemFromKey: function (key) {
				// Return the key/value pair for the item with the specified key
				return this._items[key];
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding._ListProjection.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	_ListProjection: WinJS.Class.derive(WinJS.Binding._ModifiableListBase, null, {

		// ================================================================
		//
		// public function: WinJS.Binding.List.getItemFromKey
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700750.aspx
		//		
		getItemFromKey: function (key) {
			// Return the key/value pair for the item with the specified key
			return this._list._items[key];
		},

		// ================================================================
		//
		// public function: WinJS.Binding.List.splice
		//
		//		MSDN: TODO
		//	
		splice: function (index, howMany, item) {

			// Convert arguments to an Array (Thank you MDN! https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments)
			var args = Array.prototype.slice.call(arguments);

			if (index == this.length || index == -1) {
				args[0] = this._list.length - 1;
				return this._list.splice.apply(this._list, args);
			} else {

				// We actually want to splice into our source list at the item which is at *our* index
				args[0] = this.getItem(index).key;

				// Call splice on our source list, using apply to pass the args
				return this._spliceAtKey.apply(this, args);
			}
		}
	})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.FilteredList.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.FilteredList
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920299.aspx
	//
	FilteredListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.FilteredListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createFiltered
		//
		function (sourceList, inclusionCallback) {

			// Keep track of our filtered set of keys
			this._filteredKeys = [];

			this._list = sourceList;
			this._currentKey = 0;

			// Store the callback to determine inclusion
			this._inclusionCallback = inclusionCallback;

			// Iterate over the items in this list; if the item is chosen for inclusion, then add it to the filtered list of keys
			for (var i = 0; i < sourceList.length ; i++) {

				var item = sourceList.getItem(i);
				if (inclusionCallback(item.data))
					this._filteredKeys.push(item.key);
			}

			// Initialize the set of event listeners
			this._eventListeners = [];

			// Listen for changes on our source list
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));
			this._list.addEventListener("itemchanged", this._itemChanged.bind(this));
			//	NYI:	sourceList.addEventListener("itemmoved", this._itemMoved.bind(this));
			//	NYI:	sourceList.addEventListener("itemmutated", this._itemMutated.bind(this));
			//	NYI:	sourceList.addEventListener("reload", this._reload.bind(this));

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list

			// TODO: Not sure what to bind to here.
			this.dataSource = new WinJS.UI.IListDataSource(this, this._filteredKeys);
//			this.dataSource = WinJS.Binding.as(this._filteredKeys);
	//		this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.FilteredList members
		// ================================================================

		{
			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.indexOf
			//
			indexOf: function (item) {
				return this._filteredKeys.indexOf(item.key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.length
			//
			length: {
				get: function () {
					return this._filteredKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.getItem
			//
			getItem: function (index) {
				return this.getItemFromKey(this._filteredKeys[index]);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.getItemFromKey
			//
			getItemFromKey: function (key) {
				return this._list.getItemFromKey(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._spliceAtKey
			//
			//		Performs a splice starting at the specified key
			//
			_spliceAtKey: function (key, howMany) {

				// Add in any new items.
				if (arguments.length > 2) {

					// Convert arguments to an Array (Thank you MDN! https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments)
					var args = Array.prototype.slice.call(arguments);

					// We're just inserting at this point, so set howMany to zero
					args[1] = 0;

					// Call splice on our source list, using apply to pass the args
					this._list._spliceAtKey.apply(this._list, args);
				}

				// Remove '#howMany' items. 
				var removedItems = [];
				if (howMany) {

					// Create the list of keys to remove
					var removedKeys = [];
					var filteredKeyIndex = this._filteredKeys.indexOf(key);
					var lastIndexToRemove = this._filteredKeys.length && (i - filteredKeyIndex) < howMany;
					for (var i = filteredKeyIndex; i < lastIndexToRemove; i++) {
						removedKeys.push(this._filteredKeys[i]);
					}

					// Now, remove the keys
					var thatList = this._list;
					removedKeys.forEach(function (key) {

						// Since this is a projection we need to iterate over the list rather than doing one big splice.
						// Also add the removed item to the list of items to return
						removedItems.push(thatList._spliceAtKey(key, 1)[0]);
					});
				}

				return removedItems;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.FilteredList.setAt
			//
			//		MSDN: TODO
			//
			setAt: function (index, value) {

				var keyIndex = this._list.indexOfKey(this._filteredKeys[index]);
				this._list.setAt(keyIndex, value);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.FilteredList.indexOfKey
			//
			//		MSDN: TODO
			//
			indexOfKey: function (key) {
				return this._filteredKeys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemInserted
			//
			//		Event callback - this function is called when an item is added to the list to which we are attached.
			//
			_itemInserted: function (eventData) {

				if (this._inclusionCallback(eventData.detail.value)) {

					// We want to insert the key at the right position; to do that, we look for the last index of the
					// previous item in the source list, and insert after that item.
					// TODO: This iteration is painful; possibly keep a map, but the management of is more painful than
					// I want to tackle right now (for a perf opt.).
					var previousKey;
					var index = eventData.detail.index;
					while ((--index) >= 0) {
						var item = this._list.getItem(index);
						if (item && this._inclusionCallback(item.data)) {
							previousKey = item.key;
							break;
						}
					}
					var targetIndex = previousKey !== undefined ? (this._filteredKeys.indexOf(previousKey) + 1) : 0;

					this._filteredKeys.splice(targetIndex, 0, eventData.detail.key);

					// Propagate the event.  Set the index to where we dropped the item
					var newEventDetail = {
						value: eventData.detail.value,
						key: eventData.detail.key,
						index: targetIndex
					};
					this._notifyItemInserted(newEventDetail);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemRemoved
			//
			//		Event callback - this function is called when an item is removed from the list to which we are attached.
			//
			_itemRemoved: function (eventData) {
				// Update the list of filtered keys
				var key = eventData.detail.key;
				var index = this._filteredKeys.indexOf(key);
				if (index >= 0) {
					this._filteredKeys.splice(index, 1);

					// Propagate the event
					this._notifyItemRemoved(eventData.detail);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemChanged
			//
			//		Event callback - this function is called when an item is changed in the list to which we are attached.
			//
			_itemChanged: function (eventData) {

				// nothing to do - just propagate the changed event to anyone listening to us.
				this._notifyItemChanged(eventData.detail);
			},
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.GroupedList.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.GroupedSortedListProjection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920302.aspx
	//
	GroupedSortedListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.GroupedSortedListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createGrouped
		//
		function (sourceList, groupKeySelector, groupDataSelector) {
			
			this._groupedItems = [];

			// Our projected list of groups; not actually created until requested
			this._groupsProjection = null;

			// The list of keys (from the source list) sorted 
			this._sortedKeys = [];  // TODO: move into separate SortedListProjection base class

			// Keep track of the list which we are projecting
			this._list = sourceList;

			// Initialize the set of event listeners
			this._eventListeners = [];

			this._groupKeySelector = groupKeySelector;
			this._groupDataSelector = groupDataSelector;

			// Listen for changes on our source list
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));
			this._list.addEventListener("itemchanged", this._itemChanged.bind(this));

			// initialize keys and sort
			this._sortedKeys = [];  // TODO: move into separate SortedListProjection base class
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);
				this._sortedKeys.push(item.key);
			}
			this._sortKeys();

			// initialize grouped items
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);
				item = this.copyItem(item);
				item.groupKey = groupKeySelector(item.data);
				this._addItem(item);
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list
			// TODO: Not sure what to bind to here.
			this.dataSource = new WinJS.UI.IListDataSource(this, this._groupedItems);
//			this.dataSource = WinJS.Binding.as(this._groupedItems);
	//		this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.GroupedSortedListProjection members
		// ================================================================

		{
			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.indexOf
			//
			indexOf: function (item) {
				return this._sortedKeys.indexOf(item.key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._sortKeys
			//
			_sortKeys: function () {

				var that = this;
				this._sortedKeys.sort(function (left, right) {
					left = that._groupKeySelector(that._list.getItemFromKey(left).data);
					right = that._groupKeySelector(that._list.getItemFromKey(right).data);
					if (left < right) return -1;
					if (left == right) return 0;
					return 1;
				});
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._addItem
			//
			_addItem: function (item) {

				// Get the group for the item
				var groupKey = this._groupKeySelector(item.data);
				var itemData = { data: item.data, groupKey: groupKey, key: item.key };
				this._groupedItems[item.key] = itemData;
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.length
			//
			length: {
				get: function () {
					return this._sortedKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.getItem
			//
			getItem: function (index) {

				var key = this._sortedKeys[index];
				return this.getItemFromKey(key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.getItemFromKey
			//
			getItemFromKey: function (key) {

				return this._groupedItems[key];
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.indexOfKey
			//
			indexOfKey: function (key) {

				return this._sortedKeys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemInserted
			//
			_itemInserted: function (eventData) {

				this._addItem({ data: eventData.detail.value, key: eventData.detail.key });

				// TODO: The following code attempts to insert the new item before the first item with the same key,
				// which is what win8 appears to do.  However, it isn't quite working, so I've commented it out and
				// gone with the simpler push/sort approach below.  That doesn't quite match win8 in that the sort
				// could drop the new item anywhere in the group of same-group keys - which I believe is acceptable
				// behavior; just slightly different than win8 though...
				/*
				var newItemGroupKey = this._groupKeySelector(this._list.getItemFromKey(eventData.detail.key).data);
				debugger;
				for (var i = 0; i < this._sortedKeys.length; i++) {
					var itemToCheck = this._list.getItemFromKey(this._sortedKeys[i]);
					var itemToCheckGroupKey = this._groupKeySelector(itemToCheck);
					if (newItemGroupKey == itemToCheckGroupKey) {
						// found a matching groupkey; insert this item before it
						break;
					}
				}
				// If we didn't break above, then i equals the end of the list, which is where we want to add it.
				this._sortedKeys.splice(i, 0, eventData.detail.key);

				// set the index of hte item
				// TODO: Need to update indices of items after this one, too
				eventData.detail.index = i;
				*/

				// Add the key to an arbitrary place, and then sort the whole list of keys to get them into the right place.
				this._sortedKeys.push(eventData.detail.key);
				this._sortKeys();

				// Get newly sorted index of item
				eventData.detail.index = this.indexOfKey(eventData.detail.key);

				// Propagate the event.
				this._notifyItemInserted(eventData.detail);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemRemoved
			//
			_itemRemoved: function (eventData) {

				var key = eventData.detail.key;
				var value = eventData.detail.value;
				var item = eventData.detail.item;
				var groupeditem = this._groupedItems[key];
				var sortedIndex = this._sortedKeys.indexOf(key);

				// Remove the item (by key) from our list of grouped items
				delete this._groupedItems[key];

				// Remove the key from the list of sorted keys
				this._sortedKeys.splice(sortedIndex, 1);

				// notify any listeners of the removal
				this._notifyItemRemoved({ key: key, value: value, index: sortedIndex, item: groupeditem });
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemChanged
			//
			_itemChanged: function (eventData) {

				var itemKey = eventData.detail.key;
				var newValue = eventData.detail.newValue;
				var prevGroupedItem = this._groupedItems[itemKey];

				// Create the new item, based off of the previous item
				var newGroupedItem = {
					key: prevGroupedItem.key,
					data: newValue,
					groupKey: this._groupKeySelector(newValue),
					groupSize: prevGroupedItem.groupSize,
				};
				
				// Store the new item in our list of grouped items
				this._groupedItems[itemKey] = newGroupedItem;

				// Is the new item still in the same group?
				if (prevGroupedItem.groupKey === newGroupedItem.groupKey) {

					// Item is still in the same group; we don't need to move anything, but do propagate the change
					this._notifyItemChanged({
						key: itemKey,
						index: this.indexOfKey(itemKey),
						oldValue: prevGroupedItem.data,
						newValue: newGroupedItem.data,
						oldItem: prevGroupedItem,
						newItem: newGroupedItem
					});

				} else {

					// Item is now in a new group; remove and reinsert it so that it appears in the new group

					// Remove the item and propagate the removal
					var itemIndex = this._sortedKeys.indexOf(itemKey);
					this._sortedKeys.splice(itemIndex, 1);
					this._notifyItemRemoved({
						key: itemKey,
						value: prevGroupedItem.data,
						index: itemIndex,
						item: prevGroupedItem
					});

					// Reinsert the item and propagate the insertion
					this._sortedKeys.push(itemKey);
					this._sortKeys();
					this._notifyItemInserted({
						key: itemKey,
						index: this.indexOfKey(itemKey),
						value: newValue
					});
				}
			},


			// ================================================================
			//
			// public property (getter): WinJS.Binding.GroupedSortedListProjection.groups
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh921584.aspx
			//
			groups: {
				get: function () {

					// Do a lazy-creation of our GroupsList
					if (this._groupsProjection == null)
						this._groupsProjection = new WinJS.Binding.GroupsListProjection(this);
					return this._groupsProjection;
				}
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.GroupsList.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.GroupsListProjection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920302.aspx
	//
	GroupsListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.GroupsListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createGrouped
		//
		function (sourceList) {

			// Keep track of the list (which is a groupedprojection) that we are projecting
			this._list = sourceList;

			// The list of group items which we are projecting over the source list
			this._groupItems = [];
			this._groupKeys = [];

			// Initialize the set of event listeners
			this._eventListeners = [];

			// Listen for changes on our source list.  Note that we don't have to listen for changes to items in the base list,
			// as our source groupprojection list will automatically convert changes to insertions/removals.
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));

			// Initialize groupitems
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);

				var groupKey = item.groupKey;
				// If the group doesn't exist yet, then add it now
				// TODO: build map instead of iterating?
				var found = false;
				for (var j in this._groupItems)
					if (this._groupItems[j].key == groupKey) {
						this._groupItems[j].groupSize++;
						found = true;
						break;
					}

				if (!found) {
					this._groupItems[groupKey] = {
						key: groupKey,
						groupSize: 1,
						data: sourceList._groupDataSelector(item.data) };
					this._groupKeys.push(groupKey);
				}
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list
			// TODO: Not sure what to bind to here.
			this.dataSource = new WinJS.UI.IListDataSource(this, this._groupItems);
			//this.dataSource = WinJS.Binding.as(this._groupItems);
			//this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.GroupsListProjection members
		// ================================================================

		{
			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._itemInserted
			//
			_itemInserted: function (eventData) {

				var groupKey = this._list.getItemFromKey(eventData.detail.key).groupKey;
				var groupItem = this._groupItems[groupKey];
				if (!groupItem) {

					// Add the new group
					this._groupKeys.push(groupKey);
					this._sortKeys();

					var newGroupItem = {
						key: groupKey,
						groupSize: 1,
						// TODO: Index etc
						data: this._list._groupDataSelector(eventData.value)
					};

					this._groupItems[groupKey] = newGroupItem;

					// Propagate the event.
					// TODO: Need to pass index of the group too
					this._notifyItemInserted({ key: newGroupItem.key, value: newGroupItem.data });

				} else {
					// Nothing to do here since the item insertion did not require a new group to be created.
					// TODO: Technically the group has changed, but I don't think it's in a way that caller can
					// see; that said, they may want to do something regardless, so I should fire a changed event
					// here...
					groupItem.groupSize++;
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._itemRemoved
			//
			_itemRemoved: function (event) {

				var groupKey = event.detail.item.groupKey;
				var groupItem = this._groupItems[groupKey];
				var groupIndex = this._groupKeys.indexOf(groupKey);

				// Is this the last item in the group?  If so, delete the group
				if (groupItem.groupSize == 1) {

					// Remove the group from the list of group keys and delete it
					this._groupKeys.splice(groupIndex, 1);
					delete this._groupItems[groupKey];

					// Notify any listeners that this group has been removed
					this._notifyItemRemoved(groupKey, groupIndex, groupItem.data, groupItem);

				} else {

					// One less item in the group.
					groupItem.groupSize--;

					// There are still more items in this group; notify any listeners that this group has changed but not been removed
					this._notifyItemChanged(groupKey, groupIndex, groupItem.data, groupItem.data, groupItem, groupItem);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._sortKeys
			//
			_sortKeys: function () {
				var that = this;
				this._groupKeys.sort(function (left, right) {
					if (left < right) return -1;
					if (left == right) return 0;
					return 1;
				});
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.length
			//
			length: {
				get: function () {
					return this._groupKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.getItem
			//
			getItem: function (index) {
				var key = this._groupKeys[index];
				return this.getItemFromKey(key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.getItemFromKey
			//
			getItemFromKey: function (key) {
				// TODO: wuff.  Need to store index or something instead.
				for (var i in this._groupItems)
					if (this._groupItems[i].key == key)
						return this._groupItems[i];

				// Key not found
				return null;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.GroupsListProjection.indexOfKey
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920305.aspx
			//
			indexOfKey: function (key) {

				return this._groupKeys.indexOf(key);
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Binding.Template.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Binding.Template
//
//		Implementation of the WinJS.Binding.Template object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229723.aspx
//
WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.Template
	//
	Template: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.Binding.Template constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229725.aspx
		//
		function (element, options) {

			// If no element was specified then create an empty div
			if (!element)
				element = $("<div></div>")[0];	// TODO: Perf - remove all of these extraneous jQuery wrappings wherever possible

			// Remember our element
			this.element = element;

			// Hide the template
			$(this.element).hide();

			// Set options if specified
			if (options)
				WinJS.UI.setOptions(this, options);

			// TODO: Implement enableRecycling option; seems like a performance tweak, so I've deferred working on it.
			// TODO: What's up with "Template.render.value" in the Win8 docs?  I don't understand it.  Seems almost like doc error,
			//		 so I'm holding off trying to understand it until the next rev of the win8 sdk docs.
		},

		// WinJS.Binding.Template members
		{
			// ================================================================
			//
			// public function: WinJS.Binding.Template.render
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229724.aspx
			//
			render: function (dataContext, container) {

				/*DEBUG*/
				// Parameter validation
				if (!dataContext)
					console.error("WinJS.Binding.Template.render: Undefined or null element dataContext");
				/*ENDDEBUG*/

				// Return a promise that we'll do the binding.

				// TODO: I'm doing "that = this" all over the place because I don't know the js pattern to get "this" to
				// be "this Template" in the Promise below.  I suspect there's some bind (js bind, not winjs bind)-related 
				// solution.  Once known, scour the code and remove the "that = this"'s where possible.
				var that = this;

				var bindElementToData = function (templateElement, data) {

					// If the container doesn't exist then create a new div.  Wrap it in jQuery for simplicity as well
					var $container = $(container || "<div></div>");

					// Add the win-template class to the target
					$container.addClass("win-template");

					// Clone this template prior to populating it
					var $template = $(templateElement).clone();

					// Populate the data into the cloned template
					return WinJS.Binding.processAll($template, data).then(function () {

						// Add the now-populated cloned template to the target container
						$container.append($template.children());
						return ($container[0]);
					});
				}

				// Create the promise that will be fulfilled once the element is ready (incl. possibly loading from remote href)
				var elementReady = new WinJS.Promise(function (onComplete) {

					// If href is specified then we need to load it
					if (that.href) {

						// Use Ajax to get the page's contents
						// TODO: Use WinJS.xhr when that's implemented
						$.get(that.href, function (response) {
							onComplete('<div data-win-control="WinJS.Binding.Template">' + response + '</div>');
						});
					} else {
						// No href specified; render using our element
						onComplete(that.element);
					}
				});

				// Before processing, check if the caller specified a timeout.  Per the win8 docs, a value of 0 =
				// no delay, a negative value is an msSetImmediate, and positive is a timeout.  I'm assuming that
				// msSetImmediate just does a yield, in which case it's synonymous with timeout=0.  *technically* they're 
				// different in that timeout=0 doesn't require the yield; but I don't see harm in the extraneous yield.
				var timeoutAmount = Math.max(0, that.processTimeout || 0);
				var renderComplete = WinJS.Promise.timeout(timeoutAmount)

					// let the itemPromise fulfill before continuing
					.then(function () {
						return dataContext;
					})
					.then(function (data) {

						// Data is ready; wait until the element is ready
						// TODO: These nested then's and Promises are ugly as all get-out.  Refactor.
						return elementReady
							.then(function (element) {

								// Finally, do the render
								return bindElementToData(element, data).then(function (result) {
									return result;
								});
							})
					});

				// Return an object with the element and the renderComplete promise
				return {
					element: this.element,
					renderComplete: renderComplete
				};
			},


			// ================================================================
			//
			// public function: WinJS.Binding.Template.renderItem
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701308.aspx
			//
			//		Note: apparently the only usage of renderItem on the internet: http://blogs.msdn.com/b/eternalcoding/archive/2012/04/23/how-to-cook-a-complete-windows-8-application-with-html5-css3-and-javascript-in-a-week-day-2.aspx
			//
			renderItem: function (item, container) {

				/*DEBUG*/
				// Parameter validation
				if (!item)
					console.error("WinJS.Binding.Template.renderItem: Undefined or null element item");
				/*ENDDEBUG*/

				// Win8 expects item to be a Promise that returns {data} - A promise to return that data is passed to render.
				var data = item.then(function (i) {
					return i.data;
				});

				return this.render(data, container);
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI
//
//		This is the root WinJS.UI namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229782.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Function: WinJS.UI.setOptions
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440978.aspx
	//
	setOptions: function (targetObject, members) {

		// If no options specified then exit now
		if (!members)
			return;

		/*DEBUG*/
		// Parameter validation
		if (!targetObject)
			console.error("WinJS.UI.setOptions: Undefined or null targetObject specified.");
		if (!members)
			console.error("WinJS.UI.setOptions: Undefined or null members specified.");
		/*ENDDEBUG*/

		for (var fieldKey in members) {

			var fieldValue = members[fieldKey];

			/*DEBUG*/
			if (!fieldKey)
				console.error("WinJS.UI.setOptions: Setting undefined or null field", targetObject, members);
			/*ENDDEBUG*/

			// If the member starts with "on" AND the targetObject is a function that supports addEventListener, then add the fieldValue as an event listener
			if (fieldKey.toLowerCase().indexOf("on") == 0 && targetObject.addEventListener) {

				// fieldKey is an event and the targetObject supports addEventListener, so add fieldValue as an event
				// if the fieldValue is a function that go ahead and add it; otherwise (e.g. if the options are declaratively defined)
				// we need to eval it.
				// TODO: Is there a non-eval way to do this?
				if (typeof fieldValue === "function")
					targetObject.addEventListener(fieldKey.substr(2), fieldValue);
				else
					targetObject.addEventListener(fieldKey.substr(2), eval(fieldValue));

			} else {

				// fieldKey is not an event
				// TODO: With declaratively specified options (e.g. when defining a Rating Control in HTML), numeric values 
				//		 will be returned here as strings instead of numbers.  While they still equate, they end up as different types.  What's
				//		 the right way to do that?  Are there other types that hit the same issue?
				targetObject[fieldKey] = members[fieldKey];
			}
		}
	},


	// ================================================================
	//
	// public Function: WinJS.UI.process
	//
	//		Applies declarative control binding to the specified element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440976.aspx
	//
	process: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.process: Undefined or null element specified.");
		/*ENDDEBUG*/

		return new WinJS.Promise(function (onComplete) {

			// Add winControl objects to all elements tagged as data-win-control
			$("[data-win-control]", element).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Process the element
				if (this.dataset && this.dataset.winControl)
					WinJS.UI._processElement(this);
			});

			// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
			setTimeout(function () { onComplete(element.winControl); }, 0);
		});
	},



	// ================================================================
	//
	// public Function: WinJS.UI.processAll
	//
	//		Applies declarative control binding to all elements, starting at the specified root element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440975.aspx
	//
	processAll: function (rootElement) {

		return new WinJS.Promise(function (onComplete) {

			// If the caller didn't specify a root element, then process the entire document.
			if (!rootElement)
				rootElement = document;

			// Add winControl objects to all elements tagged as data-win-control
			$("[data-win-control]", rootElement).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Process the element
				WinJS.UI._processElement(this);
			});

			// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
			setTimeout(function () { onComplete(); }, 0);
		});
	},


	// ================================================================
	//
	// private Function: WinJS.UI._processElement
	//
	//		Processes a single DOM element; called by WinJS.UI.process and WinJS.UI.processAll
	//
	_processElement: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI._processElement: Undefined or null element specified.");
		/*ENDDEBUG*/

		// If we've already processed the element in a previous call to process[All], then don't re-process it now.
		if (element.winControl)
			return;

		// If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
		// into a valid JS object before passing to the constructor.
		var options = element.dataset.winOptions ? blueskyUtils.convertDeclarativeDataStringToJavascriptObject(element.dataset.winOptions) : null;

		// Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object

		// Note: I originally had an eval here (evil, sure, but short and sweet), but the minify borked on it.  Here's the original line:
		//		element.winControl = eval("new window." + element.dataset.winControl + "(element, options)");
		// Then I wanted to do this (less evil, prettier than the above):
		//		element.winControl = new window[element.dataset.winControl](element, options);
		// ... but that doesn't work if element.dataset.winControl (a string) contains multiple depth (e.g. Test.Foo.Bar), since
		// window["Test.Foo.Bar"] != window["Test"]["Foo"]["Bar"]
		//
		// So I ended up with the following pained but functional approach.
		//
		//		TODO: SURELY there's a better way to do this :P
		//
		var parts = element.dataset.winControl.split(".");
		var controlConstructor = window;
		for (var i = 0; i < parts.length; i++)
			controlConstructor = controlConstructor[parts[i]];

		// Now that we have a pointer to the actual control constructor, instantiate the wincontrol
		element.winControl = new controlConstructor(element, options);

		// Create a reference from the wincontrol back to its source element
		element.winControl.element = element;
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.TapBehavior
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701303.aspx
	//
	TapBehavior: {
		directSelect: "directSelect",
		toggleSelect: "invoke",			// TODO: Why does Win8 have this discrepancy?
		invokeOnly: "invokeOnly",
		none: "none"
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.SelectionMode
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229687.aspx
	//
	SelectionMode: {
		none: "none",
		single: "single",
		multi: "multi"
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.SwipeBehavior
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701287.aspx
	//
	SwipeBehavior: {
		select: "select",
		none: "none"
	},

	// ================================================================
	//
	// public interface: WinJS.UI.IListDataSource
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211786.aspx
	//
	IListDataSource: WinJS.Class.define(function (sourceList, listItems) {

		this._list = sourceList;
		//this._items = WinJS.Binding.as(listItems);
	},

		// ================================================================
		// WinJS.UI.IListDataSource members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.getCount
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700660.aspx
			//
			getCount: function () {

				return WinJS.Promise.wrap(this._list.length);
			},


			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.itemFromKey
			//
			//		MSDN: TODO
			//
			itemFromKey: function (itemKey) {
				return WinJS.Promise.wrap(this._list.getItemFromKey(itemKey));
			},



			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.itemFromIndex
			//
			//		MSDN: TODO
			//
			itemFromIndex: function (itemIndex) {
				return WinJS.Promise.wrap(this._list.getAt(itemIndex));
			},


			// ================================================================
			//
			// public property: WinJS.UI.IListDataSource.list
			//
			//		MSDN: TODO
			//
			list: {
				get: function () {
					return this._list;
				}
			},
		}),


	// ================================================================
	//
	// public interface: WinJS.UI.ISelection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872204.aspx
	//
	ISelection: WinJS.Class.define(function (sourceList) {

		this._list = sourceList;
		this._selectedItems = [];
	},

		// ================================================================
		// WinJS.UI.ISelection members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.UI.ISelection.add
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872198.aspx
			//
			add: function (items) {
				var that = this;
				return new WinJS.Promise(function (c) {

					// If items is not an array, then convert it into one for simplicity
					if (items.length === undefined)
						items = [items];
					else {
						// Arrays must contain an object that implements ISelectionRange, which is NYI
						console.error("Passing an array of objects to WinJS.UI.ISelection.add, but ISelectionRange is NYI");
					}

					// We want to get values from our listview's actual databound list.
					var curList = that._list.itemDataSource._list;
					
					items.forEach(function (value) {
						var item;
						if (typeof value === "number") {
							// value is an index
							item = curList.getItem(value);
						} else {
							// value is an object that contains either index or key.  Use key if both are present
							if (value.key !== undefined) {
								item = curList.getItemFromKey(value);
							} else if (value.index !== undefined) {
								item = curList.getItem(value);
							}
								/*DEBUG*/
							else {
								console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
							}
							/*ENDDEBUG*/
						}

						if (that._selectedItems.indexOf(item) == -1)
							that._selectedItems.push(item);
					});

					// TODO: Notify our list
					that._list._selectionChanged();

					c(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.remove
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872205.aspx
			//
			remove: function (items) {
				var that = this;
				return new WinJS.Promise(function (c) {

					// If items is not an array, then convert it into one for simplicity
					if (items.length === undefined)
						items = [items];
					else {
						// Arrays must contain an object that implements ISelectionRange, which is NYI
						console.error("Passing an array of objects to WinJS.UI.ISelection.remove, but ISelectionRange is NYI");
					}

					// We want to get values from our listview's actual databound list.
					var curList = that._list.itemDataSource._list;

					items.forEach(function (value) {
						var item;
						if (typeof value === "number") {
							// value is an index
							item = curList.getItem(value);
						} else {
							// value is an object that contains either index or key.  Use key if both are present
							if (value.key !== undefined) {
								item = curList.getItemFromKey(value);
							} else if (value.index !== undefined) {
								item = curList.getItem(value);
							}
								/*DEBUG*/
							else {
								console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
							}
							/*ENDDEBUG*/
						}

						var indexOfItem = that._selectedItems.indexOf(item);
						if (indexOfItem != -1)
							that._selectedItems.splice(indexOfItem, 1);
					});

					// TODO: Notify our list
					that._list._selectionChanged();

					c(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.remove
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872199.aspx
			//
			clear: function () {
				var that = this;
				return new WinJS.Promise(function (c) {
					that._selectedItems = [];
					// Notify our list
					that._list._selectionChanged();
					c();
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.count
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872200.aspx
			//
			count: function () {
				return this._selectedItems.length;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getIndices
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872197.aspx
			//
			getIndices: function () {
				var indices = [];
				this._selectedItems.forEach(function (item) {
					indices.push(item.index);
				});
				return indices;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.isEverything
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872203.aspx
			//
			isEverything: function () {

				return this.count == this._list.length;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getItems
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872201.aspx
			//
			getItems: function () {
				var that = this;
				return new WinJS.Promise(function (c) {
					c(that._selectedItems);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.set
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872207.aspx
			//
			set: function (items) {
				var that = this;
				return this.clear().then(function () {
					return that.add(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.selectAll
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872206.aspx
			//
			selectAll: function () {
				var that = this;
				this.clear().then(function () {
					for (var i = 0; i < that._list.length; i++) {
						that.add(that._list.getItem(i));
					}
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getRanges
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872202.aspx
			//
			getRanges: function () {
				return new WinJS.Promise(function (c) {
					console.error("WinJS.UI.ISelection.getRanges is NYI");
					c([]);
				});
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Animation.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.BaseControl.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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
	BaseControl: WinJS.Class.derive(WinJS.UI.DOMEventMixin, function (element, options) {

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

			// Set a timeout that will occur as soon as it can.  When it does, call our derived class's doRender function
			var that = this;
			return new WinJS.Promise(function(c) {
				setTimeout(function () {
					if (that.isYielding) {
						that._doRender();

						// Mark that we're no longer yielding
						that.isYielding = false;
					}
					c();
				}, 0);
			});
		},


		// ================================================================
		//
		// public Function: WinJS.UI.BaseControl.forceLayout
		//
		//		Forces a regeneration of the control
		//
		forceLayout: function() {
			this.render();
		}
	})
});









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Pages.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.Pages
//
//		This is the root WinJS.UI.Pages namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770584.aspx
//
WinJS.Namespace.define("WinJS.UI.Pages", {

	// ================================================================
	//
	// public function: WinJS.UI.Pages.render
	//
	//		Loads, processes, and renders the subpage at pageUri.  Added to DOM element 'targetElement'.  state field
	//		contains options.  parentedPromise is fulfilled by caller when the html that we return has been added to the DOM - at
	//		that point we can call 'ready' on the page.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770580.aspx
	//		NOTE: Documentation at the link above is out of date/incorrect.
	//
	render: function (pageUri, targetElement, state, parentedPromise) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.render: Undefined or null pageUri specified");
		/*ENDDEBUG*/

		// Create a placeholder element if no target was specified
		targetElement = targetElement || $("<div></div>")[0];

		// Get the PageControl constructor for the specified Uri.  This will define the page if it does not yet exist
		var pageConstructor = this.get(pageUri);

		// Create the new page control.  Note that the page is not necessarily rendered (or even loaded) at this point.
		var pageControl = new pageConstructor(targetElement, state, null, parentedPromise);

		// Render a promise that is fulfilled when rendering is complete.
		return pageControl.renderPromise;
	},


	// ================================================================
	//
	// public function: WinJS.UI.Pages.get
	//
	//		Gets an already-defined page control for the specifed Uri, or creates a new one
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770586.aspx
	//
	get: function (pageUri) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.get: Undefined or null pageUri specified");
		/*ENDDEBUG*/

		// Get the page constructor for the specified Url
		var pageConstructor = WinJS.UI.Pages.registeredPages[pageUri.toLowerCase()];

		// If the page constructor doesn't exist, then define it now
		pageConstructor = pageConstructor || WinJS.UI.Pages.define(pageUri);

		// Return the page constructor for the specified url.
		return pageConstructor;
	},


	// ================================================================
	//
	// public function: WinJS.UI.Pages.define
	//
	//		Defines a new Page and returns a PageControl
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770579.aspx
	//
	define: function (pageUri, members) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.define: Undefined or null pageUri specified");
		/*ENDDEBUG*/

		// Check to see if an existing definition (keyed on the pageUrI) already exists, and use it if so.
		var existingDefn = this.registeredPages[pageUri.toLowerCase()];
		if (existingDefn) {
			var pageControl = existingDefn;
		}
		else {
			var pageControl = WinJS.Class.define(function (targetElement, state, complete, parentedPromise) {

				/*DEBUG*/
				// Parameter validation
				if (!targetElement)
					console.error("WinJS.UI.Pages.PageControl constructor: Undefined or null targetElement specified");
				/*ENDDEBUG*/

				// this is called when the page should be instantiated and its html realized.  Do so now.
				var page = WinJS.UI.Pages.registeredPages[pageUri.toLowerCase()];
				var that = this;

				if (parentedPromise) {
					// When parenting has completed, trigger the subpage's ready function.  The function that called render()
					// is responsible for triggering the parented promise that it passed in.
					parentedPromise.then(function () {
						// TODO: verify proper order of operations here.
						if (that["ready"])
							that["ready"](targetElement, state);
						if (that["updateLayout"])
							that["updateLayout"](targetElement, state, null);
						if (that["processed"])
							that["processed"](targetElement, state);
					});
				}

				// First load the page; then when that's done, process it.  Return a promise that this will happen.  Caller then chains on that promise.
				this.renderPromise = this._loadPage({ Uri: pageUri, element: targetElement })
                            .then(function (result) {
                            	return that._processPage(result);
                            });

				// if caller didn't specify a parented promise, then handle calling ready (et al) ourselves.
				// TODO: Clean this up with the above similar (inverted) block.
				if (!parentedPromise)
					this.renderPromise = this.renderPromise.then(function (result) {
						return new WinJS.Promise(function (onComplete) {
							// TODO: verify proper order of operations here.
							if (that["ready"])
								that["ready"](targetElement, state);
							if (that["updateLayout"])
								that["updateLayout"](targetElement, state, null);
							if (that["processed"])
								that["processed"](targetElement, state);
							onComplete(result);
						});
					})
			}, {

				// ================================================================
				//
				// private function: PageControl._loadPage
				//
				//		Internal function to load a page.  Will support both cached and remote pages.  Returns a Promise 
				//		so that the caller can be notified when we're done via then().
				//
				_loadPage: function (pageInfo) {

					/*DEBUG*/
					// Parameter validation
					if (!pageInfo)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageInfo specified");
					/*ENDDEBUG*/

					var that = this;

					// Create and return a Promise that we'll load the page.
					// NOTE: We could merge _getRemotePage into this function as this function is currently doing nothing;
					//		 however, this two-step process is in preparation for adding support for cached pages later on.
					return new WinJS.Promise(function (pageLoadCompletedCallback) {

						// TODO: Add cached file support.
						var fileIsCached = false;

						if (fileIsCached) {
							// return cached file
						} else {
							// Load the page remotely
							that._getRemotePage(pageInfo, pageLoadCompletedCallback);
						}
					});
				},

				
				// ================================================================
				//
				// private function: PageControl._getRemotePage
				//
				//		Internal function to load a page remotely via Ajax.
				//
				_getRemotePage: function (pageInfo, pageLoadCompletedCallback) {

					/*DEBUG*/
					// Parameter validation
					if (!pageInfo)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageInfo specified");
					if (!pageLoadCompletedCallback)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageLoadCompletedCallback specified");
					/*ENDDEBUG*/

					// Use Ajax to get the page's contents
					// TODO: Use WinJS.xhr when that's implemented
					$.get(pageInfo.Uri, function (response) {

						// We loaded the page
						// TODO: error handling
						pageInfo.response = response;

						// Notify that we've fulfilled our Promise to load the page.
						pageLoadCompletedCallback(pageInfo);
					});
				},


				// ================================================================
				//
				// private function: PageControl._processPage
				//
				//		Internal function to process a page; async since css processing can take an indeterminate amount of time.  This function returns 
				//		a Promise so that the caller can be notified when we're done via then().
				//
				_processPage: function (pageInfo) {

				    /*DEBUG*/
				    // Parameter validation
				    if (!pageInfo)
				        console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo specified");
				    if (!pageInfo.response)
				        console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo.response specified", pageInfo);
				    if (!pageInfo.element)
				        console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo.element specified", pageInfo);
				    /*ENDDEBUG*/

				    // Return a Promise that we'll process the page (Honestly! We will!)
				    return new WinJS.Promise(function (pageProcessCompletedCallback) {

				        // Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
				        // because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
				        // sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
				        // $("<div></div>").html(pageInfo.response) won't work for the above reason.

				        // 1. Create the temporary DOM element ourselves and assign its HTML to the subpage's html
				        var tempDiv = document.createElement("div");
				        tempDiv.innerHTML = pageInfo.response;

				        // 2. NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage
				    	// Note: Need to use visiblity:hidden/display:block so that any child element's dimensions are realized (e.g. listitems in a listview).
				        var $newPage = $(tempDiv).css({ 'position': 'absolute', 'visibility': 'hidden', 'display': 'block' });
				        $("script", document).each(function (index, element) {
				            // TODO: this is case sensitive, so "test.js" and "Test.js" will not match.
				            $("script[src='" + element.attributes["src"].value + "']", $newPage).remove();
				        });

				        // TODO: convert links to scripts?  See <LINK REL="stylesheet" HREF="http://ha.ckers.org/xss.css">

				        // Remove WinJS scripts.
				        // TODO: rather than do this on every page process (slow), do it on publish
				        // TODO: Note that, once I commented this out, some apps started failing; the reason was because those apps had references to //microsoft/winjs.*,
				        // and the presence of those references makes the css checks below fail because numNewStyleSheets are never fully loaded,
				        // so it never makes it out of the loop. This will repro with any 'invalid' script or style reference.  See comment below.  
				        $("link[href^='//Microsoft'], link[href^='//microsoft']", $newPage).remove();
				        $("script[src^='http://Microsoft'], script[src^='http://microsoft']", $newPage).remove();

				        // Track the number of styleSheets before the subpage is loaded.  We will need to wait below until
				        // we're sure that these pages have been completely parsed before we call the subpage's ready() function.
				        var numStyleSheetsBeforeSubpageAdded = document.styleSheets.length;

				        // Replace contents of element with loaded page's html
				        $(pageInfo.element).addClass("pagecontrol");
				        $(pageInfo.element).append($newPage);

				        // Do some parsing on the subpage...
				        // 1. Move meta and title tags to page's <head> element
				        var $head = $("head", document);
				        $("meta, title", $newPage).prependTo($head);

				        // 2. Move scripts and styles up into the page's <head> element
				        // TODO: remove any duplicates
				        $("link, script", $newPage).appendTo($head);

				        // 3. Remove duplicate styles
				        blueskyUtils.removeDuplicateElements("style", "src", $head);

				        // 4. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
				        $("title:not(:first)", $head).remove();

				        // Process the wincontrols in the newly loaded page fragment
				        WinJS.UI.processAll($newPage[0]);

				        // Win8 likes to add all DOM elements with Ids to the global namespace.  Add all of the loaded Page's id'ed DOM elements now.
				        $("[id]").each(function (index, element) {
				            window[element.id] = element;
				        });

				        // Calculate how many styles the subpage has added.  We will wait below until they are all loaded.
				        var numNewStyleSheets = document.styleSheets.length - numStyleSheetsBeforeSubpageAdded;

				        // If the subpage has referenced CSS files, those files may or may not yet be parsed; to ensure that they are before
				        // the subpage's ready function is called, we set up a timer that every 50 milliseconds checks to see if the CSS Files have
				        // all been parsed and their rules have been added to document.styleSheets.  If so, then we stop the timer and tell the subpage
				        // to go for it.  Lacking a "cssHasBeenParsed" notification, this is the best we can do.
				        var timeSpent = 0;

				        var handle = window.setInterval(function () {

				            // Determine how many of the styles have been loaded and parsed.  The browser (well, FF - need to verify against others)
				            // immediately adds the stylesheet, but it doesn't set cssRules until they're parsed; thus, check if cssRules is defined
				            // for all newly loaded styles.
				            // TODO: This isn't quite sufficient on FF; see http://dev.ckeditor.com/ticket/7784
				            // TODO: This also doesn't appear to work on iPad; need another solution...
				            var numStylesParsed = 0;
				            try {
				                for (var i = 0; i < numNewStyleSheets; i++) {
				                    if (document.styleSheets[numStyleSheetsBeforeSubpageAdded + i].cssRules != undefined)
				                        numStylesParsed++;
				                }
				            } catch (ex) {
				                // TODO: silently catch, ignore, and continue.  See if this works...    
				            }

				            // TODO: find best solution here - see TODO comment above.  if this is the only solution, then make timeOut changable by app
				            timeSpent += 50;
				            if (timeSpent > 2000) {
				                console.warn("Failed to load all style sheets and/or scripts in under 2 seconds; check network log and ensure all stylesheets are valid.");
				                numStylesParsed = numNewStyleSheets;
				            }
				            // Check to see if we've parsed all of the new style sheets
				            if (numStylesParsed == numNewStyleSheets) {

				                // The page's style sheets have all been loaded. Stop the interval timer
				                window.clearInterval(handle);

                                // Show the new page's elements with final style sheets; then move them
                                // out of the temp div; and then remove the temp newPage element
				                $newPage
                                    .contents()                     // grab contents (instead of children, to get text nodes as well).
                                    .appendTo(pageInfo.element);    // And add them to the DOM

				                // Notify that we've fulfilled our Promise to process the page.
				                pageProcessCompletedCallback(pageInfo);
				            }
				        }, 50);
				    });
				},

				// renderPromise: A Promise that is fulfilled when we have completed rendering
				renderPromise: null
			});
		}

		// Add members to the page control constructor
		pageControl = WinJS.Class.mix(pageControl, members);

		// Register the page control constructor for subsequent calls to WinJS.UI.Pages.get and WinJS.UI.Pages.define
		// TODO: I'm assuming that "helloWorld.html" is the same page as "HelloWORLD.hTML", but should check that Win8 agrees...
		this.registeredPages[pageUri.toLowerCase()] = pageControl;

		// Return the new page control constructor
		return pageControl;
	},


	// registeredPages: A map that associates pageUris with page constructor functions
	registeredPages: []
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.HtmlControl.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.HtmlControl
//
//		Implementation of the WinJS.UI.HtmlControl object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700625.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.HtmlControl
	//
	//		Note: HtmlControl just has a constructor; no members
	//
	HtmlControl: WinJS.Class.define(function (element, options, complete) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.HtmlControl constructor: Undefined or null element specified");
		/*ENDDEBUG*/

		// Render the page using the specified options. When rendering has completed, call the complete function
		WinJS.UI.Pages.render(options.uri, element, options)
			.then(complete);
	})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Flyout.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //


// ================================================================
//
// WinJS.UI
//
//		This is the root WinJS.UI namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229782.aspx
//
WinJS.Namespace.define("WinJS.UI", {


	// ================================================================
	//
	// public Function: WinJS.UI.setOptions
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440978.aspx
	//
	setOptions: function (targetObject, members) {

		// If no options specified then exit now
		if (!members)
			return;

		/*DEBUG*/
		// Parameter validation
		if (!targetObject)
			console.error("WinJS.UI.setOptions: Undefined or null targetObject specified.");
		if (!members)
			console.error("WinJS.UI.setOptions: Undefined or null members specified.");
		/*ENDDEBUG*/

		for (var fieldKey in members) {

			var fieldValue = members[fieldKey];

			/*DEBUG*/
			if (!fieldKey)
				console.error("WinJS.UI.setOptions: Setting undefined or null field", targetObject, members);
			/*ENDDEBUG*/

			// If the member starts with "on" AND the targetObject is a function that supports addEventListener, then add the fieldValue as an event listener
			if (fieldKey.toLowerCase().indexOf("on") == 0 && targetObject.addEventListener) {

				// fieldKey is an event and the targetObject supports addEventListener, so add fieldValue as an event
				// if the fieldValue is a function that go ahead and add it; otherwise (e.g. if the options are declaratively defined)
				// we need to eval it.
				// TODO: Is there a non-eval way to do this?
				if (typeof fieldValue === "function")
					targetObject.addEventListener(fieldKey.substr(2), fieldValue);
				else
					targetObject.addEventListener(fieldKey.substr(2), eval(fieldValue));

			} else {

				// fieldKey is not an event
				// TODO: With declaratively specified options (e.g. when defining a Rating Control in HTML), numeric values 
				//		 will be returned here as strings instead of numbers.  While they still equate, they end up as different types.  What's
				//		 the right way to do that?  Are there other types that hit the same issue?
				targetObject[fieldKey] = members[fieldKey];
			}
		}
	},


	// ================================================================
	//
	// public Function: WinJS.UI.process
	//
	//		Applies declarative control binding to the specified element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440976.aspx
	//
	process: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.process: Undefined or null element specified.");
		/*ENDDEBUG*/

		return new WinJS.Promise(function (onComplete) {

			// Add winControl objects to all elements tagged as data-win-control
			$("[data-win-control]", element).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Process the element
				if (this.dataset && this.dataset.winControl)
					WinJS.UI._processElement(this);
			});

			// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
			setTimeout(function () { onComplete(element.winControl); }, 0);
		});
	},



	// ================================================================
	//
	// public Function: WinJS.UI.processAll
	//
	//		Applies declarative control binding to all elements, starting at the specified root element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440975.aspx
	//
	processAll: function (rootElement) {

		return new WinJS.Promise(function (onComplete) {

			// If the caller didn't specify a root element, then process the entire document.
			if (!rootElement)
				rootElement = document;

			// Add winControl objects to all elements tagged as data-win-control
			$("[data-win-control]", rootElement).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Process the element
				WinJS.UI._processElement(this);
			});

			// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
			setTimeout(function () { onComplete(); }, 0);
		});
	},


	// ================================================================
	//
	// private Function: WinJS.UI._processElement
	//
	//		Processes a single DOM element; called by WinJS.UI.process and WinJS.UI.processAll
	//
	_processElement: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI._processElement: Undefined or null element specified.");
		/*ENDDEBUG*/

		// If we've already processed the element in a previous call to process[All], then don't re-process it now.
		if (element.winControl)
			return;

		// If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
		// into a valid JS object before passing to the constructor.
		var options = element.dataset.winOptions ? blueskyUtils.convertDeclarativeDataStringToJavascriptObject(element.dataset.winOptions) : null;

		// Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object

		// Note: I originally had an eval here (evil, sure, but short and sweet), but the minify borked on it.  Here's the original line:
		//		element.winControl = eval("new window." + element.dataset.winControl + "(element, options)");
		// Then I wanted to do this (less evil, prettier than the above):
		//		element.winControl = new window[element.dataset.winControl](element, options);
		// ... but that doesn't work if element.dataset.winControl (a string) contains multiple depth (e.g. Test.Foo.Bar), since
		// window["Test.Foo.Bar"] != window["Test"]["Foo"]["Bar"]
		//
		// So I ended up with the following pained but functional approach.
		//
		//		TODO: SURELY there's a better way to do this :P
		//
		var parts = element.dataset.winControl.split(".");
		var controlConstructor = window;
		for (var i = 0; i < parts.length; i++)
			controlConstructor = controlConstructor[parts[i]];

		// Now that we have a pointer to the actual control constructor, instantiate the wincontrol
		element.winControl = new controlConstructor(element, options);

		// Create a reference from the wincontrol back to its source element
		element.winControl.element = element;
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.TapBehavior
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701303.aspx
	//
	TapBehavior: {
		directSelect: "directSelect",
		toggleSelect: "invoke",			// TODO: Why does Win8 have this discrepancy?
		invokeOnly: "invokeOnly",
		none: "none"
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.SelectionMode
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229687.aspx
	//
	SelectionMode: {
		none: "none",
		single: "single",
		multi: "multi"
	},


	// ================================================================
	//
	// public enumeration: WinJS.UI.SwipeBehavior
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701287.aspx
	//
	SwipeBehavior: {
		select: "select",
		none: "none"
	},

	// ================================================================
	//
	// public interface: WinJS.UI.IListDataSource
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211786.aspx
	//
	IListDataSource: WinJS.Class.define(function (sourceList, listItems) {

		this._list = sourceList;
		//this._items = WinJS.Binding.as(listItems);
	},

		// ================================================================
		// WinJS.UI.IListDataSource members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.getCount
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700660.aspx
			//
			getCount: function () {

				return WinJS.Promise.wrap(this._list.length);
			},


			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.itemFromKey
			//
			//		MSDN: TODO
			//
			itemFromKey: function (itemKey) {
				return WinJS.Promise.wrap(this._list.getItemFromKey(itemKey));
			},



			// ================================================================
			//
			// public function: WinJS.UI.IListDataSource.itemFromIndex
			//
			//		MSDN: TODO
			//
			itemFromIndex: function (itemIndex) {
				return WinJS.Promise.wrap(this._list.getAt(itemIndex));
			},


			// ================================================================
			//
			// public property: WinJS.UI.IListDataSource.list
			//
			//		MSDN: TODO
			//
			list: {
				get: function () {
					return this._list;
				}
			},
		}),


	// ================================================================
	//
	// public interface: WinJS.UI.ISelection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872204.aspx
	//
	ISelection: WinJS.Class.define(function (sourceList) {

		this._list = sourceList;
		this._selectedItems = [];
	},

		// ================================================================
		// WinJS.UI.ISelection members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.UI.ISelection.add
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872198.aspx
			//
			add: function (items) {
				var that = this;
				return new WinJS.Promise(function (c) {

					// If items is not an array, then convert it into one for simplicity
					if (items.length === undefined)
						items = [items];
					else {
						// Arrays must contain an object that implements ISelectionRange, which is NYI
						console.error("Passing an array of objects to WinJS.UI.ISelection.add, but ISelectionRange is NYI");
					}

					// We want to get values from our listview's actual databound list.
					var curList = that._list.itemDataSource._list;
					
					items.forEach(function (value) {
						var item;
						if (typeof value === "number") {
							// value is an index
							item = curList.getItem(value);
						} else {
							// value is an object that contains either index or key.  Use key if both are present
							if (value.key !== undefined) {
								item = curList.getItemFromKey(value);
							} else if (value.index !== undefined) {
								item = curList.getItem(value);
							}
								/*DEBUG*/
							else {
								console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
							}
							/*ENDDEBUG*/
						}

						if (that._selectedItems.indexOf(item) == -1)
							that._selectedItems.push(item);
					});

					// TODO: Notify our list
					that._list._selectionChanged();

					c(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.remove
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872205.aspx
			//
			remove: function (items) {
				var that = this;
				return new WinJS.Promise(function (c) {

					// If items is not an array, then convert it into one for simplicity
					if (items.length === undefined)
						items = [items];
					else {
						// Arrays must contain an object that implements ISelectionRange, which is NYI
						console.error("Passing an array of objects to WinJS.UI.ISelection.remove, but ISelectionRange is NYI");
					}

					// We want to get values from our listview's actual databound list.
					var curList = that._list.itemDataSource._list;

					items.forEach(function (value) {
						var item;
						if (typeof value === "number") {
							// value is an index
							item = curList.getItem(value);
						} else {
							// value is an object that contains either index or key.  Use key if both are present
							if (value.key !== undefined) {
								item = curList.getItemFromKey(value);
							} else if (value.index !== undefined) {
								item = curList.getItem(value);
							}
								/*DEBUG*/
							else {
								console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
							}
							/*ENDDEBUG*/
						}

						var indexOfItem = that._selectedItems.indexOf(item);
						if (indexOfItem != -1)
							that._selectedItems.splice(indexOfItem, 1);
					});

					// TODO: Notify our list
					that._list._selectionChanged();

					c(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.remove
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872199.aspx
			//
			clear: function () {
				var that = this;
				return new WinJS.Promise(function (c) {
					that._selectedItems = [];
					// Notify our list
					that._list._selectionChanged();
					c();
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.count
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872200.aspx
			//
			count: function () {
				return this._selectedItems.length;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getIndices
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872197.aspx
			//
			getIndices: function () {
				var indices = [];
				this._selectedItems.forEach(function (item) {
					indices.push(item.index);
				});
				return indices;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.isEverything
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872203.aspx
			//
			isEverything: function () {

				return this.count == this._list.length;
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getItems
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872201.aspx
			//
			getItems: function () {
				var that = this;
				return new WinJS.Promise(function (c) {
					c(that._selectedItems);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.set
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872207.aspx
			//
			set: function (items) {
				var that = this;
				return this.clear().then(function () {
					return that.add(items);
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.selectAll
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872206.aspx
			//
			selectAll: function () {
				var that = this;
				this.clear().then(function () {
					for (var i = 0; i < that._list.length; i++) {
						that.add(that._list.getItem(i));
					}
				});
			},


			// ================================================================
			//
			// public function: WinJS.UI.ISelection.getRanges
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872202.aspx
			//
			getRanges: function () {
				return new WinJS.Promise(function (c) {
					console.error("WinJS.UI.ISelection.getRanges is NYI");
					c([]);
				});
			}
		})
});



// TODO: Move this to its own file

WinJS.Namespace.define("WinJS.UI", {
	DOMEventMixin: WinJS.Class.define(null, {

        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.addEventListener
        //
        //		MSDN: TODO
        //
        addEventListener: function (eventName, listener) {

            // Create the list of event listeners for the specified event if it does not yet exist
            if (!this._eventListeners[eventName])
                this._eventListeners[eventName] = [];

            // Add the listener to the list of listeners for the specified eventName
            this._eventListeners[eventName].push(listener);

            // Add DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.addEventListener(eventName, listener);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.removeEventListener
        //
        //		MSDN: TODO
        //
        removeEventListener: function (eventName, listener) {

            /*DEBUG*/
            // Parameter validation
            if (!this._eventListeners[eventName])
                console.warn("WinJS.DOMEventMixin.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
            /*ENDDEBUG*/

            // TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

            // Remove the listener from the list of listeners for the specified eventName
            var listeners = this._eventListeners[eventName];
            for (var i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return;
                }
            }

            // Remove DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.removeEventListener(eventName, listener);
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
        //
        dispatchEvent: function(eventName, eventProperties) {
        
        	var defaultPrevented = false;

        	if (!this._eventListeners[eventName])
        		return false;
        	
        	this._eventListeners[eventName].forEach(function(listener) {
        		if (!defaultPrevented)
        			defaultPrevented = listener(eventProperties);
        	});
        	
        	return defaultPrevented;
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh768233.aspx
        //
        setOptions: function(control, options) {
        
        	// TODO (CLEANUP): Can WinJS.UI.setOptions mixin this object, and move its logic to here?
        	WinJS.UI.setOptions(control, options);
        }
	})
});




// TODO: Move this to its own file
	
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
        	
        	// Initialize values
			this._hidden = true;
			this._placement = null;
			this._anchor = null;
			this._alignment = null;
		},
	
		// TODO: Support light dismiss

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
			show: function(anchor, placement, alignment) {
				
				// If visible already then just return
				if (!this.hidden)
					return;
				
				// Store our anchor, placement, and alignment
				this._anchor = anchor;
				this._placement = placement;
				this._alignment = alignment;
				
				// TODO: What elements does win8 pass?  Can I generalize "Event" object?
				// also: remove need for {}?  what does win8 dispatchEvent do with undefined options?
				// TODO: Can caller cancel?
				
				this.dispatchEvent("beforeshow", {});
				
				// show
				// TODO: Add win-flyout class
				
				// Enable light dismiss
				var that = this;
				$('body').one('click', this._lightDimissHandler.bind(this));

				// click inside flyout -- event.stopPropagation
				
				this.hidden = false;
				
				this.dispatchEvent("aftershow", {});
			
			},
			
	
        	// ================================================================
        	//
        	// public function: WinJS.Flyout.hide
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211727.aspx
        	//
			hide: function(anchor, placement, alignment) {
				
				// If hidden already then just return
				if (this.hidden)
					return;
				
				// Remove the light dismiss handler (only needed if hide() is called - light dismiss works w/o it)
				// TODO: Test - does this work even though we did a bind(this) above?
				$('body').unbind(this._lightDimissHandler);
				
				// TODO: Can caller cancel?
				this.dispatchEvent("beforehide", {});
				
				// hide
				
				this.hidden = true;
				
				// TODO: Does Win8 clear out anchor, placement, and alignment when hidden?
				this._placement = null;
				this._anchor = null;
				this._alignment = null;
			
				this.dispatchEvent("afterhide", {});
			},
			
			
        	// ================================================================
        	//
        	// private function: WinJS.Flyout._lightDimissHandler
        	//
        	//		this is called when the user clicks outside the Flyout while visible.
        	//
			_lightDimissHandler: function() {
			
				// Hide our Flyout
				this.hide();
			},
	
	
        	// ================================================================
        	//
        	// public event: WinJS.Flyout.onafterhide
        	//
        	//		MSDN: TODO
        	//
        	onafterhide: {
        		get: function () { return this._eventListeners["afterhide"]; },
        		set: function (callback) { this.addEventListener("afterhide", callback); }
        	},
        	
        	
        	// ================================================================
        	//
        	// public event: WinJS.Flyout.onaftershow
        	//
        	//		MSDN: TODO
        	//
        	onaftershow: {
        		get: function () { return this._eventListeners["aftershow"]; },
        		set: function (callback) { this.addEventListener("aftershow", callback); }
        	},
        	
        	
        	// ================================================================
        	//
        	// public event: WinJS.Flyout.onbeforehide
        	//
        	//		MSDN: TODO
        	//
        	onbeforehide: {
        		get: function () { return this._eventListeners["beforehide"]; },
        		set: function (callback) { this.addEventListener("beforehide", callback); }
        	},
        	
        	
        	// ================================================================
        	//
        	// public event: WinJS.Flyout.onbeforeshow
        	//
        	//		MSDN: TODO
        	//
        	onbeforeshow: {
        		get: function () { return this._eventListeners["beforeshow"]; },
        		set: function (callback) { this.addEventListener("beforeshow", callback); }
        	},
        	
        	
        	// ================================================================
        	//
        	// public property: WinJS.Flyout.hidden
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212535.aspx
        	//
			_hidden: true,
			hidden: {
				get: function() { 
					return _hidden;
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
				get: function() { 
					return _alignment;
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
				get: function() { 
					return _placement;
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
				get: function() { 
					return _anchor;
				}
			}
	})
});


// TODO: Move this to its own file
	
// ================================================================
//
// WinJS.Resources
//
//		Implementation of the WinJS.Resources object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.Resources", {
    	
	// ================================================================
	//
	// public function: WinJS.Resources.processAll
	//
	//		MSDN: TODO
	//
	processAll: function() {
		throw "nyi";
	},
	
		    	
	// ================================================================
	//
	// public function: WinJS.Resources.getString
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701590.aspx
	//
	getString: function() {
		throw "nyi";
	},
    
        	    	
	// ================================================================
	//
	// public event: WinJS.Resources.oncontextchanged
	//
	//		MSDN: TODO
	//
	oncontextchanged: {
		get: function () { return this._eventListeners["contextchanged"]; },
		set: function (callback) { this.addEventListener("contextchanged", callback); }
	},
	
});

// inject addEventListener (et al) into WinJS.resources
// TODO: Test this actually works
WinJS.Class.mix(WinJS.Resources, DOMEventMixin);








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Rating.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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

        	element = element || $("<div></div>")[0];

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// initialize the set of event listeners
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

        	// Force a layout
        	this.render(true);
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
        	// public Variable (and getter/setter): averageRating
        	//
        	//		When set, the control is re-rendered automatically.
        	//
        	//		MSDN: TODO
        	//
        	_averageRating: null,
        	averageRating: {

        		get: function () {
        			return this._averageRating;
        		},

        		set: function (newRating) {
        			this._averageRating = newRating;
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








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.FlipView.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.FlipView
//
//		Implementation of the WinJS.UI.FlipView object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211711.aspx
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.FlipView
    //
    FlipView: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.FlipView constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211707.aspx
		//
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.FlipView constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Set any options that were specified.
            if (options) {
                if (options.orientation)
                    this.orientation = options.orientation.toLowerCase();
                if (options.itemSpacing)
                    this.itemSpacing = options.itemSpacing;
                if (options.itemDataSource)
                    this.itemDataSource = eval(options.itemDataSource);
                if (options.itemTemplate)
                    this.itemTemplate = document.getElementById(options.itemTemplate);
                if (options.currentPage)
                    this.currentPage = options.currentPage;
            }

            // Start on the first page; yield first to allow caller to finish setup
            var that = this;
            msSetImmediate(function () {
            	if (that.currentPage == -1)
                	that.currentPage = 0;
            });
        },

		// ================================================================
		// WinJS.UI.FlipView Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private Function: WinJS.UI.FlipView._doRender
            //
            //		Called when the control should "render" itself to the page.  This is considered a private
            //		function because callers should have called our BaseControl's "render()" function, which
            //		manages batching render calls for us.
            //
            _doRender: function () {

                // Ensure we're fully set up.
                if (!this.itemDataSource && !this.itemTemplate)
                    return;

                /*DEBUG*/
                if (this.itemDataSource.getCount === undefined) {
                    console.log("FlipView.itemDataSource is not a databound object.  Wrap it with WinJS.Binding first.", this, this._itemDataSource);
                    return;
                }
                /*ENDDEBUG*/

                // TODO: Do DOM element generation once, and then do subsequent renders by updating classes (etc) instead of rerendering the entire control.

                // Start by clearing out our root element from previous renders and making it look like a FlipView control to our styles
                this.$rootElement
					.empty()
        			.addClass("win-flipview")
        			.attr("role", "listbox")
        			.css("overflow", "hidden");
                this._items = [];

                // Set item container dimensions to match the rootElement's dimensions (which the FlipView control requires be set)
                var width = this.$rootElement.outerWidth();
                var height = this.$rootElement.outerHeight();

                var $container = $("<div style='width:100%;height:100%;position:relative;z-index: 0;'></div>");

                $container.append($('<div tabindex="0" aria-hidden="true"></div>'));

                // Add nav buttons
                // TODO: Are there symbols we can use for left/right and up/down?
                if (this.orientation == "horizontal") {
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navleft" aria-hidden="true" style="display:none; z-index: 1000; font-weight:800" type="button">&lt;</button>'));
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navright" aria-hidden="false" style=" display:none;z-index: 1000; font-weight:800" type="button">&gt;</button>'));
                } else {
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navtop" aria-hidden="true" style="display:none; z-index: 1000; font-weight:800" type="button">^</button>'));
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navbottom" aria-hidden="false" style=" display:none;z-index: 1000; font-weight:800" type="button">v</button>'));
                }

                $container.append($('<div tabindex="0"></div>'));

                // render items in the FlipView
                var $surface = $('<div class="win-surface" role="group" style="width: 100%; height: 100%; position: relative;">');
                this.$itemsContainer = $("<div style='width:100%;height:100%;position:relative;'></div>");

                for (var i = 0; i < this.itemDataSource._list.length ; i++) {
                    var item = this.itemDataSource._list.getItem(i);
                    var $itemContainer = $("<div style='width: " + width + "px; height: " + height + "px; position: absolute;'></div>").hide();
                    var $subContainer;

                    // If the specified itemTemplate variable is a function, then call it to get the fully realized HTML; otherwise,
                    // we'll do the templatization ourseles through WinJS.Binding.processAll.
                    if (typeof this.itemTemplate !== "function") {

                        $subContainer = $("<div class='win-item'></div>");

                        // Get the templatized HTML that we'll populate. 
                        var templateInstance = $(this.itemTemplate)
												 .clone()		// Clone it so that we don't modify the original template
												 .addClass("win-template")	// tell our styles it's a template
												 .show()[0];	// Show the instance we'll populate

                        // Let WinJS binding do all the heavy lifting for us.
                        WinJS.Binding.processAll(templateInstance, item.data);

                        // Append the fully realized HTML to the list.
                        $subContainer.append(templateInstance);

                    } else {
                        // The itemTemplate object that the user specified is a function; that function is responsible
                        // for generating the fully realized HTML for an item.  Pass the function the next item now

                        // Create the DIV into which the item will be rendered
                        $subContainer = document.createElement("div");
                        $subContainer.className = "win-template";

                        // Create the promise that will be fulfilled when the item's data is ready
                        var index = this._curItemIndex;
                        var itemDataPromise = new WinJS.Promise(function (c, e, p) {
                            c({
                                data: item.data, index: index
                            });
                        });

                        // Wait until the item ('s data) is ready, and then...
                        var that = this;
                        itemDataPromise.then(function (item) {

                            // Render the item's data using the itemTemplate function, and then...
                            return that.itemTemplate(itemDataPromise);

                        }).then(function (element) {

                            // TODO: What do I do with renderPromise?  Do I fulfill it?
                            if (element.element)
                                element = element.element;

                            // Append the rendered item to our container (which was added to the DOM earlier)
                            $subContainer.appendChild(element);
                        });
                    }

                    $itemContainer.append($subContainer);
                    this.$itemsContainer.append($itemContainer);

                    // Store a list of items (DOM elements) in the FlipView
                    this._items[i] = $itemContainer;
                }

                // Add the tree of DOM elements to our root element
                $surface.append(this.$itemsContainer);
                $container.append($surface);
                this.$rootElement.append($container);

                // Add previous/next button handlers
                var that = this;
                $(".win-navleft, .win-navtop", this.$rootElement).click(function () {
                    that.previous();
                });
                $(".win-navright, .win-navbottom", this.$rootElement).click(function () {
                    that.next();
                });

                // Make the current page visible
                // TODO: Do I still need these two lines?
                if (typeof this.currentPage === "undefined")
                    this.currentPage = 0;
                this._makePageVisible(this._currentPage);
            },


            // ================================================================
            //
            // public property: WinJS.FlipView.orientation
            //
            //		TODO: MSDN
            //
            _orientation: "horizontal",
            orientation: {
                get: function () {
                    return this._orientation;
                },
                set: function (value) {
                    this._orientation = value;

                    // For simplicity, force a full relayout.
                    // TODO: Instead of regenerating everything, swap classes.  Can't (easily) do that at the moment
                    // since each button has content; I could do css content munging, but I need to revisit this anyways
                    // to use real symbols instead of [<,>,v,^].
                    this.render(true);
                }
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageCompleted
            //
            _notifyPageCompleted: function (eventData) {
                var eventInfo = {
                    target: this._items[this._currentPage] ? $(">div>div", this._items[this._currentPage])[0] : undefined,
                    type: "pagecompleted",
                    detail: eventData
                };

				this.dispatchEvent(eventInfo.type, eventInfo);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyDataSourceCountChanged
            //
            _notifyDataSourceCountChanged: function (eventData) {
                var eventInfo = {
                    target: this,
                    type: "datasourcecountchanged"
                };

				this.dispatchEvent(eventInfo.type, eventInfo);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageSelected
            //
            _notifyPageSelected: function (eventData) {
                var eventInfo = {
                    target: this._items[this._currentPage] ? $(">div>div", this._items[this._currentPage])[0] : undefined,
                    type: "pageselected",
                    detail: eventData
                };

				this.dispatchEvent(eventInfo.type, eventInfo);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageVisibilityChanged
            //
            _notifyPageVisibilityChanged: function (eventData) {
                var eventInfo = {
                    type: "pagevisibilitychanged",
                    target: this._items[this._currentPage] ? $(">div>div", this._items[this._currentPage])[0] : undefined,
                    srcElement: this._items[this._currentPage] ? this._items[this._currentPage][0] : undefined,
                    detail: eventData
                };

				this.dispatchEvent(eventInfo.type, eventInfo);
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.ondatasourcecountchanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211705.aspx
            //
            ondatasourcecountchanged: {
                get: function () { return this._eventListeners["datasourcecountchanged"]; },
                set: function (callback) { this.addEventListener("datasourcecountchanged", callback); }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagecompleted
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh965332.aspx
            //
            onpagecompleted: {
                get: function () { return this._eventListeners["pagecompleted"]; },
                set: function (callback) { this.addEventListener("pagecompleted", callback); }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpageselected
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211713.aspx
            //
            onpageselected: {
                get: function () { return this._eventListeners["pageselected"]; },
                set: function (callback) { this.addEventListener("pageselected", callback); }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagevisibilitychanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211714.aspx
            //
            onpagevisibilitychanged: {
                get: function () { return this._eventListeners["pagevisibilitychanged"]; },
                set: function (callback) { this.addEventListener("pagevisibilitychanged", callback); }
            },


            // ================================================================
            //
            // public function: WinJS.UI.FlipView.next
            //
            //		MSDN: TODO
            //
            next: function () {
                if (this.currentPage == this._items.length - 1)
                    return false;

                this.currentPage = this.currentPage + 1;
                return true;
            },


            // ================================================================
            //
            // public function: WinJS.UI.FlipView.previous
            //
            //		MSDN: TODO
            //
            previous: function () {
                if (this.currentPage == 0)
                    return false;

                this.currentPage = this.currentPage - 1;
                return true;
            },


            // ================================================================
            //
            // public function: WinJS.UI.FlipView.count
            //
            //		MSDN: TODO
            //
            count: function () {
                if (!this._itemDataSource)
                    return 0;

                var that = this;
                return new WinJS.Promise(function (c) {
                    c(that._itemDataSource._list.length);
                });
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.currentPage
            //
            //		MSDN: TODO
            //
            _currentPage: -1,   // use -1 to say "no page has been set yet" - checked in _makePageVisible
            currentPage: {
                get: function () {
                    return this._currentPage;
                },
                set: function (pageIndex) {

                    if (this._currentPage == pageIndex)
                        return;

                    var that = this;

                    this._makePageVisible(pageIndex);

                    // Fade out the current page
                    $(this._items[this._currentPage]).fadeOut("fast");

                    // Notify listeners that the previous page is no longer visible
                    this._notifyPageVisibilityChanged({ source: this.element, visible: false });

                    this._currentPage = pageIndex;

                    // Notify listeners that the new page is visible
                    that._notifyPageVisibilityChanged({ source: this.element, visible: true });

                    // Notify listeners that the page has been selected
                    this._notifyPageSelected({ source: this.element });

                    // Render the page; when done, notify listeners that the page has completed

                    // Animate the next page in
                    // TODO: Reverse if going left
                    // TODO: Does win8 animate on currentPage.set, or only on next/prev? A: only on next/prev; pull this out of here...
                    return WinJS.UI.Animation.enterContent([that._items[that._currentPage]]).then(function () {

                        that._notifyPageCompleted({ source: that.element });
                    });
                }
            },


            // ================================================================
            //
            // private property: WinJS.UI.FlipView._makePageVisible
            //
            //		Helper function to bring the specified page to the front and hide/show the nav buttons appropriately
            //
            _makePageVisible: function (pageIndex) {

                // If we don't know which page to make visible (read: pageIndex == -1) then just return
                if (pageIndex == -1)
                    return;

                // move the animating-in page to the top of the flipview's pagestack so that it's the visible one
                if (this._items.length > pageIndex)
                    this._items[pageIndex].remove().appendTo(this.$itemsContainer).show();
                if (pageIndex > 0)
                    $(".win-navleft, .win-navtop", this.$rootElement).show();
                else
                    $(".win-navleft, .win-navtop", this.$rootElement).hide();
                if (pageIndex < this._items.length - 1)
                    $(".win-navright, .win-navbottom", this.$rootElement).show();
                else
                    $(".win-navright, .win-navbottom", this.$rootElement).hide();
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.itemDataSource
            //
            //		MSDN: TODO
            //
            _itemDataSource: null,
            itemDataSource: {
                // itemDataSource.getter: Returns a reference to our current data source
                get: function () {
                    return this._itemDataSource;
                },

                // itemDataSource.setter: Used to set a new item data source
                set: function (newDataSource) {

                    var that = this;

                    // This event handler is called when an event that does not change our datasource count has occurred
                    var renderMe = function () {
                        that.render(true);
                        that.currentPage = Math.min(that._currentPage, that._itemDataSource._list.length - 1);
                    };

                    // This event handler is called when an event that changes our datasource count has occurred
                    var renderMeWithCountChange = function () {
                        that.render(true);
                        that.currentPage = Math.min(that._currentPage, that._itemDataSource._list.length - 1);
                        that._notifyDataSourceCountChanged();
                    };

                    // Unbind from previous list (if any)
                    if (this._itemDataSource && this._itemDataSource._list) {
                        this._itemDataSource._list.removeEventListener("itemremoved", renderMeWithCountChange);
                        this._itemDataSource._list.removeEventListener("iteminserted", renderMeWithCountChange);
                        this._itemDataSource._list.removeEventListener("itemchanged", renderMe);
                    }

                    var previousDataSource = this._itemDataSource;

                    // Store a reference to the new data source in our owning ListView
                    this._itemDataSource = newDataSource;

                    // Listen to changes to the list.
                    // TODO: Encapsulate all of this in the datasource object as "bindOnAnyChange"
                    this._itemDataSource._list.addEventListener("itemremoved", renderMeWithCountChange);
                    this._itemDataSource._list.addEventListener("iteminserted", renderMeWithCountChange);
                    this._itemDataSource._list.addEventListener("itemchanged", renderMe);

                    // Refresh our in-page appearance to show the new datasource's items.
                    this.render();
                    this.currentPage = Math.min(this._currentPage, this._itemDataSource._list.length - 1);

                    // Fire count change
                    // TODO: Does Win8 fire this on datasource change, or just on item changes?
                    if (previousDataSource && newDataSource._list.length != previousDataSource._list.length)
                        this._notifyDataSourceCountChanged();
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.itemTemplate
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700622.aspx
            //
            _itemTemplate: null,
            itemTemplate: {
                get: function () {
                    return this._itemTemplate;
                },

                set: function (newTemplate) {

                    this._itemTemplate = newTemplate;
                    this.render();
                }
            },


            // ================================================================
            //
            // private field: _items
            //
            //		The visible items (DOM elements) shown in the flipview
            //
            _items: [],


            // ================================================================
            //
            // private field:$itemsContainer
            //
            //		The div that holds the items in the flipview.
            //
            $itemsContainer: null
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.ListLayout.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.ListLayout
//
//		Implementation of the WinJS.UI.ListLayout object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211792.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.ListLayout
	//
	ListLayout: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.UI.ListLayout constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211791.aspx
		//
		function (layoutOptions) {

			// eval groupInfo if it is present
			if (layoutOptions && layoutOptions.groupInfo) {
				this.groupInfo = eval(layoutOptions.groupInfo);
			}
		},

	// ================================================================
	// WinJS.UI.ListLayout Member functions
	// ================================================================

	{
		// The horizontal property is always false for ListLayouts
		horizontal: {
			get: function () {
				return false;
			}
		}
	})
});









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.GridLayout.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.GridLayout
//
//		Implementation of the WinJS.UI.GridLayout object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211751.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.GridLayout
	//
	GridLayout: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.UI.GridLayout constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211742.aspx
		//
		function (layoutOptions) {

			if (layoutOptions) {
				// eval groupInfo if it is present
				if (layoutOptions.groupInfo)
					this.groupInfo = eval(layoutOptions.groupInfo);
				this.maxRows = layoutOptions.maxRows;
				this.groupHeaderPosition = layoutOptions.groupHeaderPosition;
			}
		},

	// ================================================================
	// WinJS.UI.GridLayout Member functions
	// ================================================================

	{
		// The horizontal property is always true for GridLayouts
		horizontal: {
			get: function () {
				return true;
			}
		}
	})
});









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.ListView.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.ListView
//
//		Implementation of the WinJS.UI.ListView object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.ListView
	//
	ListView: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.ListView constructor
		//
		//		MSDN: TODO
		//
        function (element, options) {

        	/*DEBUG*/
        	// Parameter validation
        	if (!element)
        		console.error("WinJS.UI.ListView constructor: Undefined or null element specified");
        	/*ENDDEBUG*/

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// Create our selection manager
        	this.selection = new WinJS.UI.ISelection(this);

        	// Set default options
        	this.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
        	this.swipeBehavior = WinJS.UI.SwipeBehavior.select;
        	this.selectionMode = WinJS.UI.SelectionMode.multi;
        	// Generate our layout definition object.
        	// tbd: what's the right win8 default?
        	if (options && options.layout && options.layout.type == "WinJS.UI.ListLayout")
        		this.layout = new WinJS.UI.ListLayout(options && options.layout);
        	else
        		this.layout = new WinJS.UI.GridLayout(options && options.layout);

        	this.items = [];

        	// Track last selected item for shift-click multiselect.
        	this._lastSelectedItemIndex = 0;

        	// Set any options that were specified.
        	if (options) {
        		if (options.selectionMode)
        			this.selectionMode = options.selectionMode;
        		if (options.tapBehavior)
        			this.tapBehavior = options.tapBehavior;
        		if (options.swipeBehavior)
        			this.swipeBehavior = options.swipeBehavior
        		if (options.itemDataSource)
        			this.itemDataSource = eval(options.itemDataSource);
        		if (options.itemTemplate)
        			this.itemTemplate = document.getElementById(options.itemTemplate) || eval(options.itemTemplate);
        		if (options.groupDataSource)
        			this.groupDataSource = eval(options.groupDataSource);
        		if (options.groupHeaderTemplate)
        			this.groupHeaderTemplate = document.getElementById(options.groupHeaderTemplate) || eval(options.groupHeaderTemplate);
        	}
        },

		// ================================================================
		// WinJS.UI.ListView Member functions
		// ================================================================

        {
        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._doRender
        	//
        	//		Called when the control should "render" itself to the page.  This is considered a private
        	//		function because callers should have called our BaseControl's "render()" function, which
        	//		manages batching render calls for us.
        	//
        	//		TODOS:
        	//			* I'm rendering the list twice initially.
        	//			* Do DOM element generation once, and then do subsequent renders by updating classes (etc) instead of rerendering the entire control.
        	//			* Implement virtualized data; as of now, if user fills list with 10k items then we render 10k items...
        	//			* Hook up window resize
        	//
        	_doRender: function () {

        		// Ensure we're fully set up.
        		if (!this.itemDataSource || !this.itemTemplate)
        			return;

        		/*DEBUG*/

        		if (this._itemDataSource.getCount == undefined) {
        			console.error("ListView.itemDataSource is not a databound object.", this, this._itemDataSource);
        			return;
        		}
        		/*ENDDEBUG*/

        		var $body = $("body");

        		// Start by clearing out our root element from previous renders
        		this.$rootElement.empty();

        		// Create two DOM elements; a parent Viewport which is static and does not move, and a child surface which is large enough to
        		// contain all items in the list.  Show the currently scrolled-to part of the list (child surface) in the viewport.
        		var orientation = this.layout.horizontal ? "win-horizontal" : "win-vertical"
        		var $viewportDiv = $("<div class='win-viewport " + orientation + "' role='group'></div>");
        		var $surfaceDiv = $("<div class='win-surface'></div>");

        		// The surface div has to be sized in order for the group header to obtain a valid size (see calculation of topY below).  Size the
        		// surface div to match the viewport; we'll increase its size after we render all items and know the final size
        		$surfaceDiv.css("height", this.$rootElement.innerHeight());
        		$surfaceDiv.css("width", this.$rootElement.innerWidth());

        		// Add the ListView's scrolling surface to the ListView's static (nonscrolling) viewport, and then add the 
        		// listView's static viewpoint to the DOM
        		$viewportDiv.append($surfaceDiv);
        		this.$rootElement.append($viewportDiv);

        		// Set our root element's position to relative so that list items can be absolutely positioned relative to the list
        		// Also add roles and classes to make the listbox look like a Win8 listbox
        		this.$rootElement
                    .css("position", "relative")
                    .attr("role", "listbox")
                    .addClass("win-listview");

        		// Tag the root element with the win-groups class if this is a Grouped ListView.
        		if (this._groupDataSource)
        			this.$rootElement.addClass("win-groups");

        		// Get the list of items that we'll render.
        		this.items = [];
        		for (var i = 0; i < this.itemDataSource._list.length; i++)
        			this.items.push(this.itemDataSource._list.getItem(i));

        		var that = this;

        		// Render each list item, and store a Promise for each item; that Promise will be fulfilled when the item has been rendered as is
        		// ready to be inserted into the visible DOM.  We will wait until all of these Promises are fulfilled.
        		var renderPromises = [];
        		if (typeof this.itemTemplate !== "function") {

        			// itemTemplate is not a function
        			this.items.forEach(function (item) {
        				that._renderItemTemplate(item);
        			});

        			// TODO: Possible bug in our Promise.join - doesn't work on empty array of Promises.  For now, just add an empty Promise
        			renderPromises.push(WinJS.Promise.as());

        		} else {

        			// itemTemplate is a function; create a collection of render promises which we'll wait on below.
        			// TODO (PERF-MINOR): An itemTemplate function could return synchronously, in which case we're unnecessarily waiting on it as a Promise.
        			for (var i = 0; i < this.items.length; i++) {
        				renderPromises.push(this._getItemFunctionRenderPromise(this.items[i], i));
        			}
        		}

        		// Wait until all of the items have been rendered
        		WinJS.Promise.join(renderPromises).then(function () {

        			// Set current rendering position to upper left corner of the list's surface
        			var renderCurX = 0, renderCurY = 0;

        			// Get the height of the space into which this List must fit.  We'll wrap when an item would go beyond this height.
        			var renderMaxY = that.$rootElement.innerHeight();

        			// Keep track of the width of the scrolling surface
        			var surfaceWidth = 0;

        			// Get groupInfo (if specified)
        			var groupInfo = that.layout.groupInfo && that.layout.groupInfo();

        			var currentGroupKey = null;

        			// Get the spacing to add between groups (if grouped view)
        			var groupSpacing;

        			var topY;

        			// Keep track of current row for maxRows comparison
        			var curRow = -1;

        			// Get the margin sizes around items
        			var templateMargins = that._getItemMargins();

        			var groupHeaderOnLeft = that.layout && that.layout.groupHeaderPosition == "left";

        			var listWidth = that.$rootElement.innerWidth();

        			// Add the rendered DOM elements to the DOM at the correct positions
        			for (var i = 0; i < that.items.length; i++) {
        				var item = that.items[i];

        				// TODO (PERF-MINOR): Wrap $itemElement on item creation to avoid rewrapping every time we render.
        				var $itemElement = $(item.element);

        				// Create the item container div for the current item, add the item's element to it, and place the
        				// itemcontainer in the listview's scrolling surface
        				var $thisItemContainer = $("<div class='win-container'></div>");
        				$thisItemContainer.append($itemElement);
        				$surfaceDiv.append($thisItemContainer);

        				// Get the dimensions of the item (force to width of list if not horizontal)
        				var itemWidth = that.layout.horizontal ? $itemElement.innerWidth() : listWidth;
        				var itemHeight = $itemElement.innerHeight();

        				// If cellspanning/groupinfo specified, then apply it now
        				if (groupInfo && groupInfo.enableCellSpanning) {

        					// NOTE: Since we use item dimensions already, we don't need to do anything for enableCellSpanning.
        					// TODO: Technically this breaks some edge cases - e.g. app has incorrectly (or inconsistently) sized items
        					//		 and is relying on groupInfo to set the right granularity for them.  I'll need to see some failure
        					//		 cases to fully understand the right solution here.
        					// TODO: Create some test cases with these edge case scenarios and see how Win8 handles them.
        				}

        				// If this is a grouped list and the item is in a different group than the previous item, then output a group header
        				// and jump to the next column
        				if (that._groupDataSource && item.groupKey != currentGroupKey) {

        					// Track the current group key so that we know when we switch to a new group
        					currentGroupKey = item.groupKey;

        					// Output the new group's header
        					// Clone the group header template, make it visible, and place it.
        					var $groupHeaderTemplate = $(that.groupHeaderTemplate)
								.clone()
								.addClass("win-groupheader")
								.show();

        					// Perform data binding on the group header template
        					// TODO: Should use groupDataSource.itemFromKey - but that returns a Promise and I need to refactor this
        					//		 code to allow that to return asychronously...
        					WinJS.Binding.processAll($groupHeaderTemplate[0], that._groupDataSource._list.getItemFromKey(item.groupKey).data);

        					// Add the fully realized HTML for the group header to the ListView's DOM element.
        					$surfaceDiv.append($groupHeaderTemplate);

        					// Create the group's header
        					// TODO (CLEANUP): I can collapse a few lines of the following if/else...
        					if (groupHeaderOnLeft) {

        						// If we haven't gotten the width of the group header yet, then do so now.
        						if (topY === undefined) {
        							topY = 0;

        							// Spacing between groups is (apparently) based on the margins of the group header.
        							// TODO: What about padding? border?
        							groupSpacing = parseInt($groupHeaderTemplate.css("marginLeft")) +
												   $groupHeaderTemplate.outerWidth() +
												   parseInt($groupHeaderTemplate.css("marginRight"));

        							surfaceWidth = groupSpacing;
        						} else
        							surfaceWidth += groupSpacing;

        					} else {

        						// If we haven't gotten the height of the group header yet, then do so now.
        						if (topY === undefined) {
        							topY = $groupHeaderTemplate.outerHeight();

        							// Spacing between groups is (apparently) based on the left margin of the group header.
        							// TODO: What about padding? border?
        							groupSpacing = parseInt($groupHeaderTemplate.css("marginLeft"));

        							surfaceWidth = groupSpacing;
        						} else
        							surfaceWidth += groupSpacing;
        					}

        					// Start rendering items just below the group header
        					renderCurY = topY;
        					renderCurX = surfaceWidth;

        					// Keep track of current row for maxRows check
        					curRow = 0;

        					// Set the header's final position
        					$groupHeaderTemplate.css({
        						"position": "absolute",
        						"top": "0px",
        						"left": (renderCurX - groupSpacing) + "px"  // step back groupSpacing pixels to account for margin
        					});

        				} else {

        					if (topY === undefined)
        						topY = 0;
        					if (that.layout.horizontal) {
        						// If placing this item would extend beyond the maximum Y, then wrap to the next column instead.
        						// So the same if maxRows is specified and we're about to exceed it
        						if (renderCurY + itemHeight >= renderMaxY ||
									that.layout.maxRows && curRow == that.layout.maxRows - 1) {
        							renderCurY = topY;
        							renderCurX = surfaceWidth;
        							curRow = 0;
        						} else
        							curRow++;
        					}
        				}

        				$thisItemContainer.css({
        					"top": renderCurY,
        					"left": renderCurX,
        					"width": itemWidth,
        					"height": itemHeight
        				});

        				// Keep track of the width of the scrolling surface
        				surfaceWidth = Math.max(surfaceWidth, renderCurX + itemWidth + templateMargins.horizontal);

        				// Go to the next place to put the next item
        				renderCurY += itemHeight + templateMargins.vertical;


        				// store a reference to the item in the itemcontainer
        				$(".win-item", $thisItemContainer).data("itemIndex", i);

        				// If the user clicks on the item, call our oniteminvoked function
        				$(".win-item", $thisItemContainer).click(function () {

        					// Get the index of the clicked item container's item
        					var itemIndex = $(this).data("itemIndex");

        					// Call invoke
        					if ((that.tapBehavior != "none") && that.oniteminvoked != null) {

        						// Create a Promise with the clicked item
        						var promise = new WinJS.Promise(function (c) { c(that.items[itemIndex]); });

        						// Call the callback
        						that._notifyItemInvoked({
        							srcElement: this.parentNode,
        							target: this.parentNode,
        							currentTarget: that.$rootElement,
        							detail: {
        								itemIndex: itemIndex,
        								itemPromise: promise
        							}
        						});
        					}

        					// Handle selection
        					if ((that.tapBehavior == "directSelect" || that.tapBehavior == "toggleSelect" ||
								blueskyUtils.shiftPressed || blueskyUtils.controlPressed) && (that.selectionMode != "none")) {

        						var $containerNode = $(this.parentNode)

        						// Check to see if user shift-clicked a collection of items
        						if (that.selectionMode == "multi" && blueskyUtils.shiftPressed) {
        							var startIndex = Math.min(itemIndex, that._lastSelectedItemIndex);
        							var endIndex = Math.max(itemIndex, that._lastSelectedItemIndex);
        							var itemIndicesToSelect = [];
        							for (var i = startIndex; i <= endIndex; i++)
        								itemIndicesToSelect.push(i);
        							that.selection.set(itemIndicesToSelect);
        						} else {
        							if (that.tapBehavior == "directSelect") {

        								// TODO: Does Win8 re-fire selection for already selected item?
        								if (that.selectionMode == "multi" && blueskyUtils.controlPressed)
        									that.selection.add(itemIndex);
        								else
        									that.selection.set(itemIndex);
        							} else {
        								if ($containerNode.hasClass("win-selected"))
        									that.selection.remove(itemIndex);// remove selection
        								else
        									if (that.selectionMode == "multi" && blueskyUtils.controlPressed)
        										that.selection.add(itemIndex);
        									else
        										that.selection.set(itemIndex);
        							}
        						}

        						that._lastSelectedItemIndex = itemIndex;
        						that._notifySelectionChanged();
        					}
        				});
        			}

        			// Set the final width of the ListView's scrolling surface, and make it visible
        			$surfaceDiv.css("width", surfaceWidth).show();

        			// use enterContent to slide the list's items into view.  This slides them as one contiguous block (as win8 does).
        			WinJS.UI.Animation.enterContent([$surfaceDiv[0]]);
        		});
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._getItemMargins
        	//
        	_getItemMargins: function () {

        		// Next, calculate the margin that should be added around each list item's win-container DIV.  This is obtained
        		// from the following css selector:     .win-listview > .win-horizontal .win-container
        		// To do this, create an element in the DOM that matches that selector, and grab it's marginTop/marginBottom values.
        		// TODO: Find a cleaner way of calculating this?
        		var orientation = this.layout.horizontal ? "win-horizontal" : "win-vertical"
        		var $container = $("<div class='win-listview'><div class='" + orientation + "'><div id='_cont1' class='win-container'></div></div></div>")
					.hide()
					.appendTo($("body"));

        		// Now that we have a matching element in the DOM, get it's margin values.  Since the css is returned as "#px", we need to strip the 'px'
        		var itemMargins = {
        			vertical: parseInt($("#_cont1").css("marginTop")) +
							  parseInt($("#_cont1").css("marginBottom")),
        			horizontal: parseInt($("#_cont1").css("marginLeft")) +
							  parseInt($("#_cont1").css("marginRight"))
        		};

        		// Clean up after ourselves and remove the element from the DOM.
        		$container.remove();

        		return itemMargins;
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._renderItemTemplate
        	//
        	_renderItemTemplate: function (item) {

        		// Get the templatized HTML that we'll populate.  Clone it so that we don't modify the original
        		// template, add the 'win-item' class, and then show it
        		item.element = $(this.itemTemplate)
					.clone()
					.addClass("win-item")
					.show()[0];

        		// Let WinJS binding do all the heavy lifting for us.
        		WinJS.Binding.processAll(item.element, item.data);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._getItemFunctionRenderPromise
        	//
        	//		Return a promise that we will render the specified item.  The item's DOM element will be returned in item.element.
        	//
        	_getItemFunctionRenderPromise: function (item, curItemIndex) {

        		var that = this;
        		return new WinJS.Promise(function (onComplete) {

        			// Create the promise that will be fulfilled when the item's data is ready
        			var itemDataPromise = new WinJS.Promise(function (c, e, p) {
        				c({
        					data: item.data, index: curItemIndex
        				});
        			});

        			// Wait until the item's data is ready, and then...
        			return itemDataPromise.then(function (item) {
        				// Render the item's data using the itemTemplate function, and then...
        				return that.itemTemplate(itemDataPromise);

        			}).then(function (element) {

        				// TODO: Wait on renderPromise (if specified)
        				if (element.element)
        					element = element.element;

        				// Append the rendered item to our container (which was added to the DOM earlier)
        				item.element = element;

        				// Get the size of the item from the item's element.
        				// TODO (PERF): Avoid the jQuery wrapper here.
        				var $itemElement = $(item.element);
        				item.elementWidth = $itemElement.outerWidth();
        				item.elementHeight = $itemElement.outerHeight();

						// Tag the item's element with win-item
        				$itemElement.addClass("win-item");

        				onComplete();
        			});
        		});
        	},


        	// _itemDataSource: The private reference to the data bound source to which we're listening and rendering.  Accessed via this.itemDataSoucce.
        	_itemDataSource: null,
        	itemDataSource: {
        		// itemDataSource.getter: Returns a reference to the current data source in our owning ListView
        		get: function () {
        			return this._itemDataSource;
        		},

        		// itemDataSource.setter: Used to set a new item data source
        		set: function (newDataSource) {

        			var that = this;

        			// This event handler is called when an event that does not change our datasource count has occurred
        			var renderMe = function () {
        				// TODO: leaving this wrapper in case I need to send events; if not, then just bind to render.
        				that.render(true);
        			};

        			// Unbind from previous list (if any)
        			if (this._itemDataSource && this._itemDataSource._list) {
        				this._itemDataSource._list.removeEventListener("itemremoved", renderMe);
        				this._itemDataSource._list.removeEventListener("iteminserted", renderMe);
        				this._itemDataSource._list.removeEventListener("itemchanged", renderMe);
        			}

        			// Store a reference to the new data source in our owning ListView
        			this._itemDataSource = newDataSource;

        			// Listen to changes to the list.
        			// TODO: Encapsulate all of this in the datasource object as "bindOnAnyChange"
        			this._itemDataSource._list.addEventListener("itemremoved", renderMe);
        			this._itemDataSource._list.addEventListener("iteminserted", renderMe);
        			this._itemDataSource._list.addEventListener("itemchanged", renderMe);

        			// Refresh our in-page appearance to show the new datasource's items.
        			this.render();
        		}
        	},


        	// _groupDataSource: If this is non-null, then the ListView renders its items in a grouped UX, grouped by the groups defined in groupDataSource
        	_groupDataSource: null,
        	groupDataSource: {
        		get: function () {
        			return this._groupDataSource;
        		},

        		// groupDataSource.setter: Used to set a new group data source
        		set: function (newDataSource) {

        			var that = this;

        			// This event handler is called when an event that does not change our datasource count has occurred
        			var renderMe = function () {
        				// TODO: leaving this wrapper in case I need to send events; if not, then just bind to render.
        				that.render(true);
        			};

        			// Unbind from previous list (if any)
        			if (this._groupDataSource && this._groupDataSource._list) {
        				this._groupDataSource._list.removeEventListener("itemremoved", renderMe);
        				this._groupDataSource._list.removeEventListener("iteminserted", renderMe);
        				this._groupDataSource._list.removeEventListener("itemchanged", renderMe);
        			}

        			var previousGroupDataSource = this._groupDataSource;

        			// Store a reference to the new data source
        			this._groupDataSource = newDataSource;

        			if (this._groupDataSource && this._groupDataSource._list) {
        				// Listen to changes to the list.
        				this._groupDataSource._list.addEventListener("itemremoved", renderMe);
        				this._groupDataSource._list.addEventListener("iteminserted", renderMe);
        				this._groupDataSource._list.addEventListener("itemchanged", renderMe);
        			}

        			// Refresh our in-page appearance to show the new datasource's items.
        			this.render();
        		}
        	},


        	// itemTemplate: A DOM element that contains the templatized HTML which we'll start with when rendering each
        	// element in the list.  Note that this can also be a function which returns the fully realized HTML to use
        	// for an element.
        	_itemTemplate: null,
        	itemTemplate: {
        		get: function () {
        			return this._itemTemplate;
        		},

        		set: function (newTemplate) {
        			this._itemTemplate = newTemplate;
        			this.render();
        		}
        	},

        	_layout: null,
        	layout: {
        		get: function () {
        			return this._layout;
        		},

        		set: function (newLayout) {

        			this._layout = new WinJS.UI.GridLayout(newLayout);
        			this.render();
        		}
        	},


        	// on Window resize, re-render ourselves
        	// tbd-perf: consider batching these
        	_windowResized: function (w, h) {
        		// tbd: instead of re-rendering completely, should do a "movePosition"
        		// tbd-perf: only relayout if size has changed at the listview items' size granularity
        		//var anim = WinJS.UI.Animation.createRepositionAnimation(this._listItems);
        		this.render();
        		//anim.execute();
        	},


        	// ================================================================
        	//
        	// private function: WinJS.ListView._notifySelectionChanged
        	//
        	_notifySelectionChanged: function () {

        		var eventData = {
        			type: "selectionchanged"
        		};

				this.dispatchEvent(eventInfo.type, eventData);
        	},


        	// ================================================================
        	//
        	// private function: WinJS.ListView._notifyItemInvoked
        	//
        	_notifyItemInvoked: function (eventData) {

        		eventData.type = "iteminvoked";

				this.dispatchEvent(eventInfo.type, eventData);
        	},


        	// ================================================================
        	//
        	// public event: WinJS.ListView.oniteminvoked
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211827.aspx
        	//
        	oniteminvoked: {
        		get: function () { return this._eventListeners["iteminvoked"]; },
        		set: function (callback) { this.addEventListener("iteminvoked", callback); }
        	},

        	// ================================================================
        	//
        	// public event: WinJS.ListView.selectionchanged
        	//
        	//		MSDN: TODO
        	//
        	onselectionchanged: {
        		get: function () { return this._eventListeners["selectionchanged"]; },
        		set: function (callback) { this.addEventListener("selectionchanged", callback); }
        	},


        	// ================================================================
        	//
        	// private function: WinJS.ListView._selectionChanged
        	//
        	//		This is called by our selection manager when selection has been updated.  Update all
        	//		of our items to display their current selected/unselected state.
        	//
        	_selectionChanged: function () {

        		var that = this;
        		this.items.forEach(function (item) {

        			var $containerNode = $(item.element.parentNode);
        			var itemWasSelected = $containerNode.hasClass("win-selected");
        			var itemIsNowSelected = that.selection._selectedItems.indexOf(item) >= 0;

        			if (itemWasSelected && !itemIsNowSelected) {

        				// remove selection
        				$containerNode.removeClass("win-selected");
        				$(".win-selectionbackground, .win-selectioncheckmarkbackground, .win-selectioncheckmark", $containerNode).remove();

        			} else if (!itemWasSelected && itemIsNowSelected) {

        					// add selection
        					// TODO (PERF-MINOR): Precreate and clone these DIVs
        				$containerNode.addClass("win-selected");
        				$(item.element).before($("<div class='win-selectionbackground'></div>"))
									   .after($("<div class='win-selectionbordercontainer'>" +
												"<div class='win-selectionborder win-selectionbordertop'></div>" +
												"<div class='win-selectionborder win-selectionborderright'></div>" +
												"<div class='win-selectionborder win-selectionborderbottom'></div>" +
												"<div class='win-selectionborder win-selectionborderleft'></div>" +
												"</div><div class='win-selectioncheckmarkbackground'></div><div class='win-selectioncheckmark'>X&nbsp;</div>"
										));
        			}
        		});
        	}

        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.UI.WebUI.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.UI.WebUI
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br244245.aspx
//
WinJS.Namespace.define("Windows.UI.WebUI", {

	// ================================================================
	//
	// Windows.UI.WebUI.ActivatedOperation
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.webui.activatedoperation.aspx
	//
	ActivatedOperation: WinJS.Class.define(null, {
		getDeferral: function () {
			var deferral = new Windows.UI.WebUI.ActivatedDeferral();
			Windows.UI.WebUI._activationDeferrals.push(deferral._promise);
			return deferral;
		}
	}),

	// ================================================================
	//
	// Windows.UI.WebUI.ActivatedDeferral
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.webui.activateddeferral.aspx
	//
	ActivatedDeferral: WinJS.Class.define(function () {

		var that = this;

		this._promise = new WinJS.Promise(function (c) {
			// Pass this Promise's complete function back as the deferral's "complete" function, so that
			// when the app calls deferral.complete, they're actually completing this promise...
			that.complete = c;
		});
	}, {}),


	// The list of all requested Activation deferrals.
	_activationDeferrals: []
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Utilities.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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

// ================================================================
//
// public function: setImmediate
//
//		MSDN: TODO
//
function setImmediate(c) {
	return msSetImmediate(c);
}








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.Utilities.QueryCollection.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.Utilities.QueryCollection
//
//		TODO: functions to add:
//			children method
//			control method
//			hasClass method
//			include method
//			query method
//			removeEventListener method
//			template method
//			toggleClass method
//
WinJS.Namespace.define("WinJS.Utilities", {

	// ================================================================
	//
	// public object: WinJS.Utilities.QueryCollection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211878.aspx
	//
	QueryCollection: WinJS.Class.derive(Array,

		// ================================================================
		//
		// public function: WinJS.Utilities.QueryCollection constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701094.aspx
		//
		function (elements) {

			if (elements) {
				if (elements.length !== undefined) {
					for (var i = 0; i < elements.length; i++) {
						this.push(elements[i]);
					}
				} else {
					this.push(elements);
				}
			}
		},

		// ================================================================
		// WinJS.Utilities.QueryCollection members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.Utilities.setAttribute
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211883.aspx
			//
			setAttribute: function (attr, value) {

				this.forEach(function (item) {
					item.setAttribute(attr, value);
				});
				return this;
			},

			// ================================================================
			//
			// public function: WinJS.Utilities.get
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211874.aspx
			//
			get: function (index) {

				if (index < this.length)
					return this[index];
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.forEach
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967805.aspx
			//
			forEach: function (callbackFn, thisArg) {

				if (callbackFn) {

					// Use the Array forEach to avoid infinite recursion here.
					return Array.prototype.forEach.call(this, callbackFn, thisArg);
				}
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.addClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211871.aspx
			//
			//		TODO: Remove jQuery wrapping
			//
			addClass: function (newClass) {

				if (newClass) {
					this.forEach(function (item) {
						$(item).addClass(newClass);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.removeClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211881.aspx
			//
			//		TODO: Remove jQuery wrapping
			//
			removeClass: function (classToRemove) {

				if (classToRemove) {
					this.forEach(function (item) {
						$(item).removeClass(classToRemove);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.addClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211877.aspx
			//
			listen: function (event, listener, capture) {

				if (event && listener) {
					this.forEach(function (element) {
						element.addEventListener(event, listener, capture);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.setStyle
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211884.aspx
			//
			//		TODO: Remove jQuery wrapping
			//			
			setStyle: function (name, value) {

				if (name && value) {
					this.forEach(function (item) {
						$(item).css(name, value);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.clearStyle
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211872.aspx
			//
			//		TODO: Remove jQuery wrapping
			//			
			clearStyle: function (name) {

				if (name) {
					this.forEach(function (item) {
						$(item).css(name, "");
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.id
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701120.aspx
			//
			//		TODO: Remove jQuery wrapping
			//		
			id: function (name) {

				if (!name)
					return null;

				var element = $("#" + name)[0];
				if (!element)
					return null;

				return new WinJS.Utilities.QueryCollection(element);
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.getAttribute
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211873.aspx
			//
			//		TODO: Remove jQuery wrapping
			//		
			getAttribute: function (name) {
				
				if (this.length == 0)
					return undefined;
				return $(this[0]).attr(name) || null;
			}
		}),
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: blueskyUtils.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// blueskyUtils
//
var blueskyUtils = {

	// ================================================================
	//
	// public Function: blueskyUtils.convertDeclarativeDataStringToJavascriptObject
	//
	// Win8's declarative parameters adopt a quasi-Json format.  This function cleans up a string and returns a string 
	// that can be eval'ed into a Javascript object.
	//
	// Example input: innerText: firstName; style.backgroundColor: backColor
	// Example output: { 'innerText': 'firstName', 'style.backgroundColor': 'backColor' }
	//
	convertDeclarativeDataStringToJavascriptObject: function (dataBindString) {

		// 1. Wrap keywords (keys and values) in single quotes
		// TODO-I'm wrapping number values in quotes; should I?
		// Note: the regex is trying to match a-z, a-Z, 0-9, -, ., and /      <-- Note that we need to match "." to support compounds like "style.backgroundColor"
		// TODO: Should the middle / be replaced with \/ or //?  I'm not sure what js's replace does here since "/" seems to delimit the regex, but it seems to be working...
		// TODO: This doesn't work with string arrays; e.g. "tooltipStrings:['Horrible','Poor','Fair','Good','Excellent','Delete']" borks.
		dataBindString = dataBindString.replace("\r", "").replace("\n", "").trim();
		var output = dataBindString.replace(/([a-zA-z\-0-9\./]+)/g, "'$1'");

		// 1B. The above regex will blindly add quotes to keyword that already have quotes.  Remove them here.
		// tbd-cleanup: merge this into the above regex.
		output = output.replace(/''/g, "'");

		// 1C. TODO - label:'view all' gets parsed into 'label':'view' 'all'.  The regex is officially past my ability to regexify, so
		// I'm hacking it out here.  Note that this won't necessarily work for non-literal strings with > 1 space, but that's okay for now.
		output = output.replace(/' '/g, " ");

		// 1D. TODO - icon:'url(/image.png)' gets parsed into 'icon':'url'('/image.png')'.  Per above, beyond my regfu, so hacking it away
		output = output.replace(/'\('/g, "(");
		output = output.replace(/'\)'/g, ")'");

		// 2. Wrap in curly braces if not already present
		// TODO: again, can probably merge into the regex above
		if (output.trim().indexOf("{") != 0)
			output = "{ " + output + " }";

		// 3. replace semicolon with comma
		output = output.replace(/;/g, ',');

		// 4. JSON prefers double quotes around keys/values
		output = output.replace(/\'/g, '"');

		// 5. convert the string into a javascript object
		try {
			var result = JSON.parse(output);
		} catch (ex) {
			// malformed JSON
			/*DEBUG*/
			console.warn("Malformed JSON passed to blueskyUtils.convertDeclarativeDataStringToJavascriptObject:  " + dataBindString);
			/*ENDDEBUG*/

			var result = "";
		}
		return result;
	},


	// ================================================================
	//
	// public Function: blueskyUtils.ensureDatasetReady
	//
	//		WinJS.Binding Code assumes existence of this.dataset which is HTML5 but not <=IE9.  This code adds this.dataset for IE
	//
	ensureDatasetReady: function (obj) {
		if (obj.dataset != undefined)
			return;

		obj.dataset = {};

		if (obj.attributes == undefined)
			return;

		// TODO: security - ensure it's data-\w+-\w+-..
		for (var ia = 0; ia < obj.attributes.length; ia++) {
			var aname = obj.attributes[ia].name;
			if (aname.substr(0, 5) == "data-") {
				var anbits = aname.split('-');
				var elemName = "";
				for (var ib = 1; ib < anbits.length; ib++) {
					var elemBit = anbits[ib];
					if (ib > 1)
						elemBit = elemBit.substr(0, 1).toUpperCase() + elemBit.substr(1);
					elemName += elemBit;
				}
				obj.dataset[elemName] = obj.attributes[ia].value;
			}
		}
	},


	// ================================================================
	//
	// private Function: blueskyUtils.removeDuplicateElements
	//
	//		Removes duplicate elements from the specfied root element.  Only the first is kept.
	//
	removeDuplicateElements: function (elementType, comparisonAttribute, $rootElement) {

		var seen = {};
		$(elementType, $rootElement).each(function () {
			var txt = $(this).attr(comparisonAttribute);
			if (seen[txt])
				$(this).remove();
			else
				seen[txt] = true;
		});
	},

	shiftPressed: false,
	controlPressed: false,

	// TODO: remove this after .done is implemented.
	_warnedDoneNYI: false,
}

// Determine if shift key is currently pressed
$(document).keydown(function (e) {

	blueskyUtils.shiftPressed = e.shiftKey;
	blueskyUtils.controlPressed = e.ctrlKey;
});
$(document).keyup(function (e) {

	blueskyUtils.shiftPressed = e.shiftKey;
	blueskyUtils.controlPressed = e.ctrlKey;
});

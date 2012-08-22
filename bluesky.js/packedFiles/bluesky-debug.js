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

/*DEBUG*/
// verify app included jQuery
if (!jQuery) {
    console.error("Bluesky requires jQuery.  Please include it prior to referencing bluesky.js");
}

// Verify known version of jQuery is used.
if ($().jquery != "1.7.2") {
    console.warn("this version of Bluesky.js was tested against jQuery v1.7.2; this app uses v" + $().jquery + ".  Consider changing to 1.7.2 if you encounter unexpected issues.");
}
/*ENDDEBUG*/

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

    DOMEventMixin: {

        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.addEventListener
        //
        //		MSDN: TODO
        //
        addEventListener: function (eventName, listener, useCapture) {

            // Add DOM element event handlers (e.g. click).
            this.element.addEventListener(eventName, listener, useCapture);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.removeEventListener
        //
        //		MSDN: TODO
        //
        removeEventListener: function (eventName, listener) {

            // Remove DOM element event handlers (e.g. click).
            this.element.removeEventListener(eventName, listener);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
        //
        dispatchEvent: function (type, eventProperties) {

            var event = document.createEvent("Event");

            // initialize the event.  Win8 passes properties in via ".detail"

            // TODO: Do all events take false, false?
            event.initEvent(type, false, false);

            if (eventProperties)
                event.detail = eventProperties.detail;

            // TODO: Did Microsoft invert dispatchEvent's return value?
            return this.element.dispatchEvent(event);
        }
    }
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

// ================================================================
//
// Note: We enable cross-domain Xhr requests in the web context.
//
//		WHY OH GOD WHY?  YOU WILL BREAK THE INTERNETZ !1!!
//
//		Yeah, I'm not sure if this is good or bad either, but here's the scoop:
//
//			1.	We want to enable win8 apps to be ported to bluesky with a modicum of pain.  That includes Local Context
//				Win8 apps, which have Cross-domain via xhr.  While we could just say "Web Context only" - and indeed that
//				may be the right answer, as I haven't thought this all the way through yet - I'm loath to make apps that
//				otherwise work, not work.
//			2.  So: This is here primarily as a polyfill to enable developers to quickly get their win8 xhr-using apps up and running.
//				It probably makes sense for me to throw out a console warning along the lines of "we've polyfilled this,
//				but you should really rethink this".  TODO: Add warning.
//			3.  If this does stay, then a few things:
//				A. I'll likely eventually replace YQL with a bluesky-hosted proxy so that we can mimic win8's whitelist approach
//				B. I'll make this developer-disable-able (not sure if opt-in or opt-out).  
//				   NOTE: Done - see Bluesky.Settings.ProxyCrossDomainXhrCalls
//	
WinJS.Namespace.define("WinJS", {

	// ================================================================
	//
	// public function: WinJS.xhr
	//
	//   ABOUT THIS FUNCTION:
	//   First, read the explanation above concerning CORS and YQL
	//   We have two models for xhr:
	//  	1.  One is the "proper" approach, which mimics Win8's and uses XMLHttpRequest and is all full of goodness,
	//  		except for the fact that it won't work cross-domain, and so a slew of LocalContext win8 apps would fall over.
	//  	2.  The other is the "fast prototype" approach, which uses jQuery and YQL to allow cross-domain and is all full of goodness,
	//  		except for the fact that it's ugly and pained and introduces additional layers into xhr request.
	//  
	//   At this stage of bluesky, we're more interested in enabling quick win8-->web ports, so we use the second approach as the default
	//   (with a console warning that it's just a polyfill), and enable developers to opt-in to the "Real" xhr through a Bluesky setting/override.
	//   This (a) allows win8 apps to work without change, and (b) allows developers to use the 'real' model when they're good and ready.
	//
	xhr: function (options) {

		var request;
		var requestType = options && options.type || "GET";

		if (Bluesky.Settings.ProxyCrossDomainXhrCalls) {
			// The following code is the second approach described above - proxy calls through YQL to enable cross-domain
			return new WinJS.Promise(function (onComplete, onError, onProgress) {

				// TODO: what should we do if url = "www.foo.com/bar" (e.g. no http:// at the front?)
				var isLocal = options.url.toLowerCase().indexOf("http://") != 0;

				// If this isn't a local request, then run it through the proxy to enable cross-domain
				// TODO: Check if it's same-domain and don't proxy if so
				// Use JSON format to support binary objects (xml format borks on them)
				if (!isLocal)
					options.url = "http://query.yahooapis.com/v1/public/yql?q=use%20%22http%3A%2F%2Fbluesky.io%2Fyqlproxy.xml" +
								  "%22%20as%20yqlproxy%3Bselect%20*%20from%20yqlproxy%20where%20url%3D%22" + encodeURIComponent(options.url) +
								  "%22%3B&format=json&callback=?";
				//	jQuery.support.cors = true; 
				// TODO: Progress
				$.ajax({
					url: options.url,
					data: options.data,
					dataType: "jsonp",
					success: function (data, textStatus, jqXHR) {
						// Since we're using YQL, data contains the XML Document with the result. Extract it
						if (isLocal) {
							var responseText = jqXHR.responseText;
							var responseXML = jqXHR.responseXML || null;
						} else {
							if (data)
								var response = data.query.results;
							else

								var response = $.parseJSON(jqXHR.responseText).query.results;
							// response could be .result or .xml
							if (response.xml) {

								// Parse the xml response (which is a JSON object) into an xml object
								var responseXML = "<xml>" + _xmlToJSON(response.xml) + "</xml>";
								var parser = new DOMParser();
								var responseXML = parser.parseFromString(responseXML, "application/xml");
							} else {
								var responseText = response.xml || response.result;
								var responseXML = null;
							}
						}

						onComplete({
							responseType: "",
							responseText: responseText,
							response: responseText,
							responseXML: responseXML,
							readyState: 4,
							DONE: 4,
							statusText: jqXHR.statusText,
							status: jqXHR.status
						});
					},
					error: function (jqXHR, textStatus, errorThrown) {
						// TODO: all return flags.
						// TODO: Support other errors
						if (jqXHR.status == 404)
							onError({ number: -2146697211 });	// Win8's 404 error code
						else
							onError({ number: 1 });	// TODO: What to do here?
					},
					type: requestType
				});
			});

		} else {
			// The following code is the first approach described above - use XMLHttpRequest which does not support cross-domain

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
	}
});


// ================================================================
//
// private function _xmlToJSON
//
//		The YQL proxy that we're using for WinJS.xhr returns XML data as JSON objects; we need to convert it
//		to an XMLDocument since that's what WinJS.xhr return.
//
//		Original source: http://ruchirawageesha.blogspot.com/2011/06/xml-to-json-and-json-to-xml-conversion.html
//
function _xmlToJSON(json) {

	var cloneNS = function (ns) {
		var nns = {};
		for (var n in ns) {
			if (ns.hasOwnProperty(n)) {
				nns[n] = ns[n];
			}
		}
		return nns;
	};

	var processLeaf = function (lname, child, ns) {
		var body = "";
		if (child instanceof Array) {
			for (var i = 0; i < child.length; i++) {
				body += processLeaf(lname, child[i], cloneNS(ns));
			}
			return body;
		} else if (child && typeof child === "object") {
			var el = "<" + lname;
			var attributes = "";
			var text = "";
			if (child["@xmlns"]) {
				var xmlns = child["@xmlns"];
				for (var prefix in xmlns) {
					if (xmlns.hasOwnProperty(prefix)) {
						if (prefix === "$") {
							if (ns[prefix] !== xmlns[prefix]) {
								attributes += " " + "xmlns=\"" + xmlns[prefix] + "\"";
								ns[prefix] = xmlns[prefix];
							}
						} else if (!ns[prefix] || (ns[prefix] !== xmlns[prefix])) {
							attributes += " xmlns:" + prefix + "=\"" + xmlns[prefix] + "\"";
							ns[prefix] = xmlns[prefix];
						}
					}
				}
			}
			for (var key in child) {
				if (child.hasOwnProperty(key) && key !== "@xmlns") {
					var obj = child[key];
					if (key === "$") {
						text += obj;
					} else if (key.indexOf("@") === 0) {
						attributes += " " + key.substring(1) + "=\"" + obj + "\"";
					} else {
						body += processLeaf(key, obj, cloneNS(ns));
					}
				}
			}
			body = text + body;
			return (body !== "") ? el + attributes + ">" + body + "</" + lname + ">" : el + attributes + "/>"
		}
	};
	for (var lname in json) {
		if (json.hasOwnProperty(lname) && lname.indexOf("@") == -1) {
			return processLeaf(lname, json[lname], {});
		}
	}
	return null;
}








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
//                    File: Windows.Foundation.Collections.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVectorView
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVectorView: WinJS.Class.define(function () {
        this._items = [];
    },
    {
        // TODO (CLEANUP): Derive this from Array.
        // TODO (CLEANUP): Function header comment blocks
        getAt: function (index) {
            if (index < this._items.length)
                return this._items[index];
            return null;
        },


        getMany: function (index, start) {
            console.error("IVector.getMany NYI");
        },

        indexOf: function (item) {
            return this._items.indexOf(item);
        },
        size: function () {
            return this._items.length;
        }
    })
});

// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVector
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVector: WinJS.Class.derive(Windows.Foundation.Collections.IVectorView, function () {
        this._items = [];
    },
    {
        // TODO (CLEANUP): Function header comment blocks

        // MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br206632.aspx
        append: function (value) {
            this._items.push(value);
        },


        clear: function () {
            this._items = [];
        },


        getAt: function (index) {
            if (index < this._items.length)
                return this._items[index];
            return null;
        },


        getMany: function (index, start) {
            console.error("IVector.getMany NYI");
        },

        getView: function () {
            console.error("IVector.getView NYI");
        },

        indexOf: function (item) {
            return this._items.indexOf(item);
        },
        insertAt: function (index, item) {
            return this._items.splice(index, 0, item);
        },
        removeAt: function (index) {
            this._items.splice(index, 1);
        },
        removeAtEnd: function () {
            return this._items.pop();
        },
        replaceAll: function (newItems) {
            this._items.clear();
            newItems.forEach(function (item) {
                this._items.append(item);
            });
        },
        setAt: function (index, item) {
            if (index < this._items.length)
                this._items[index] = item;
        },
        size: function () {
            return this._items.length;
        }
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
    			return date.toLocaleString();
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
WinJS.Namespace.define("WinJS.Resources", function () {
}, {

    // ================================================================
    //
    // public function: WinJS.Resources.processAll
    //
    //		MSDN: TODO
    //
    processAll: function () {
        throw "nyi";
    },


    // ================================================================
    //
    // public function: WinJS.Resources.getString
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701590.aspx
    //
    getString: function () {
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

// TODO: How to mixin to an object (instead of a class)?  
// WinJS.Class.mix(WinJS.Resources, WinJS.UI.DOMEventMixin);








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
                 function error(value) { that._error && that._error(value); },
                 function progress(value) { that._progress && that._progress(value); });
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

				// TODO: Currently checking for existence of the then function; this will fire a false-positive if
				// the object is not a Promise but has an unrelated function called "then".  What's the right way to check
				// for Promise'ness?  could use "instanceof"...
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

				return new WinJS.Promise(function (c, e, p) {
					var results = [];
					if (!promises || promises.length == 0) {
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

		    // Remove the data-win-control attribute after we've processed it.
			// $(rootElement).removeAttr("data-win-control");

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
				for (var i = 0; i < list.length; i++) {
					this._addValue(list[i]);
				}
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

				    // Give the cloned element a unique identifier
					blueskyUtils.setDOMElementUniqueId($template[0]);

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

            // Process the element
            blueskyUtils.ensureDatasetReady(element);
            if (element.dataset && element.dataset.winControl)
                WinJS.UI._processElement(element);

            // Process any child elements
            $("[data-win-control]", element).each(function () {

                // IE9 doesn't automagically populate dataset for us; fault it in if necessary
                blueskyUtils.ensureDatasetReady(this);

                // Process the element
                if (this.dataset && this.dataset.winControl)
                    WinJS.UI._processElement(this);
            });

            // Yield so that any controls we generated during the process call get a chance to finalize rendering themselves
            // before we indicate that we're done
            msSetImmediate(function () {
                onComplete(element.winControl);
            });
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

    	// TODO (CLEANUP): This and .process() share an awful lot of similarity...

        return new WinJS.Promise(function (onComplete) {

        	// If the caller didn't specify a root element, then process the entire document.
            if (!rootElement)
            	rootElement = document;
            else {
            	// Process the element
            	blueskyUtils.ensureDatasetReady(rootElement);
            	if (rootElement.dataset && rootElement.dataset.winControl)
            		WinJS.UI._processElement(rootElement);
            }

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
        var parts = element.dataset.winControl.split(".");
        var controlConstructor = window;
        for (var i = 0; i < parts.length; i++) {

        	/*DEBUG*/
        	if (!controlConstructor)
        		break;
        	/*ENDDEBUG*/

        	controlConstructor = controlConstructor[parts[i]];
        }

    	/*DEBUG*/
        if (!controlConstructor) {
        	console.error("bluesky: Unknown control specified in WinJS.UI._processElement: " + element.dataset.winControl);
        	return;
        }
    	/*ENDDEBUG*/

        // Now that we have a pointer to the actual control constructor, instantiate the wincontrol
        element.winControl = new controlConstructor(element, options);

        // Create a reference from the wincontrol back to its source element
        element.winControl.element = element;
    },


    // ================================================================
    //
    // public Function: WinJS.UI.enableAnimations
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/Hh779760.aspx
    // 
    enableAnimations: function () {

        WinJS.UI._animationEnabled = true;
    },


    // ================================================================
    //
    // public Function: WinJS.UI.disableAnimations
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779759.aspx
    // 
    disableAnimations: function () {

        WinJS.UI._animationEnabled = false;

        // Cancel any active animations
        WinJS.UI.Animation._cancelAllActiveAnimations();
    },


    // ================================================================
    //
    // public Function: WinJS.UI.executeAnimation
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779762.aspx
    // 
    executeAnimation: function (anim) {

        // TODO: Implement this.
        if (!_warnedExecuteAnimationNYI) {
            console.warn("Bluesky: WinJS.UI.Animation.executeAnimation is NYI");
            _warnedExecuteAnimationNYI = true;
        }
    },
    _warnedExecuteAnimationNYI: false,


    // ================================================================
    //
    // public Function: WinJS.UI.isAnimationEnabled
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779793.aspx
    // 
    _animationEnabled: true,
    isAnimationEnabled: function () {
        return _animationEnabled;
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
		    	var that = this;
		    	this._selectedItems.forEach(function (item) {
		    		var itemIndex = item.index || that._list._itemDataSource._list.indexOf(item);
		    		indices.push(itemIndex);
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
		            that._list.itemDataSource.getCount().then(function (count) {
		                for (var i = 0; i < count; i++) {
		                    that.add(i);
		                }
		            });
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
//                    File: WinJS.UI.AppBar.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.AppBar
//
//		Implementation of the WinJS.UI.AppBar object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.AppBar
	//
	AppBar: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.AppBar constructor
		//
		//		MSDN: TODO
		//
        function (element, options) {

        	/*DEBUG*/
        	// Parameter validation
        	if (!element)
        		console.error("WinJS.UI.AppBar constructor: Undefined or null element specified");
        	/*ENDDEBUG*/

        	options = options || {};

        	// Set default options
        	this._hidden = options.hidden || true;
        	this._disabled = options.disabled || false;
        	this._sticky = options.sticky || false;
        	this._layout = options.layout || "commands";
        	// TODO: layout

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// Create our DOM hierarchy
        	var $root = this.$rootElement;
        	$root.addClass("win-overlay");
        	$root.addClass("win-appbar");
        	$root.addClass("win-commandlayout");
        	$root.attr("role", "menubar");
        	$root.css("z-index", "1001");
        	$root.css("visibility", this._hidden ? "hidden" : "visible");
        	this.placement = options.placement || "bottom";

        	if (this._layout == "custom") {
        		WinJS.UI.processAll(this.element);
        	}

        	// Populate commands
        	this._commands = [];
        	var that = this;
        	$("button, hr", $root).each(function (i, button) {
        		WinJS.UI.processAll(button);
        		that._commands.push(button.winControl);
        	});

        	// Create click eater
        	this.$clickEater = $("<div class='win-appbarclickeater' style='z-index:1000'></div>");
        	this.$clickEater.appendTo($("body"));
        	this.$clickEater.click(function () {
        		if (!that._sticky)
        			that.hide();
        	});

        	// Capture right-click
        	$("body").bind("contextmenu", function (event) {
        		// Prevent default to keep browser's context menu from showing
        		// Don't StopPropagation though, so that other appbars get the event
        		event.preventDefault();
        		if (that._hidden)
        			that.show();
        		else
        			that.hide();
        	});
        },

		// ================================================================
		// WinJS.UI.AppBar Member functions
		// ================================================================


		{
			// ================================================================
			//
			// public property: WinJS.AppBar.layout
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700558.aspx
			//
			_layout: "commands",
			layout: {
				get: function () {
					return this._layout;
				},
				set: function (value) {
					this._layout = value;
					// TODO: Anything to do here?
				}
			},


			// ================================================================
			//
			// public property: WinJS.AppBar.placement
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700567.aspx
			//
			_placement: "bottom",
			placement: {
				get: function () {
					return this._placement;
				},
				set: function (value) {

					this._placement = value;

					// Oddly, the win-bottom/win-top classes don't define bottom/top values.  Do so explicitly here.
					if (this._placement == "bottom") {
						this.$rootElement.addClass("win-bottom");
						this.$rootElement.css({ "top": "auto", "bottom": "0px" });
					} else {
						this.$rootElement.addClass("win-top");
						this.$rootElement.css({ "top": "0px", "bottom": "auto" });
					}
				}
			},


			// ================================================================
			//
			// public property: WinJS.AppBar.commands
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700535.aspx
			//
			_commands: [],
			commands: {
				set: function (newCommands) {

					if (this._layout == "custom")
						return;

					// TODO: Does Win8 animate?
					this._commands = [];
					this.$rootElement.empty();

					if (!newCommands)
						return;

					// Caller can specify one item - if they did then convert it to an array
					if (!newCommands.length)
						newCommands = [newCommands];

					for (var i = 0; i < newCommands.length; i++) {
						this._commands.push(newCommands[i]);
						this.$rootElement.append(newCommands[i].element);

						// the command needs to listen to our hide events so that it can hide flyout (if it has one)
						this.addEventListener("beforehide", newCommands[i]._appBarHiding.bind(newCommands[i]));
					}
				}
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.hideCommands
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700551.aspx
			//
			hideCommands: function (commands) {

				if (!commands)
					return;
				if (!(commands instanceof Array))
					commands = [commands];

				// TODO: Animate removal of commands
				for (var i = 0; i < commands.length; i++) {
					var command = commands[i];
					if (typeof command === "string") {
						command = this.getCommandById(command);
					}
					command._hidden = true;
					command.$rootElement.css("visibility", "hidden");
				}
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.showCommands
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700570.aspx
			//
			showCommands: function (commands) {

				if (!commands)
					return;
				if (!(commands instanceof Array))
					commands = [commands];

				// TODO: Animate addition of commands
				for (var i = 0; i < commands.length; i++) {
					var command = commands[i];
					if (typeof command === "string")
						command = this.getCommandById(command);
					command._hidden = false;
					command.$rootElement.css("visibility", "visible");
				}
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.showOnlyCommands
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700574.aspx
			//
			showOnlyCommands: function (commands) {

				if (!commands)
					commands = [];
				if (!(commands instanceof Array))
					commands = [commands];

				// TODO: Animate addition of commands?
				// TODO (CLEANUP): Do this better.  Currently hiding everything and then showing only the ones specified.
				for (var i = 0; i < this._commands.length; i++) {
					this._commands[i]._hidden = true;
					this._commands[i].$rootElement.css("visibility", "hidden");
				}
				this.showCommands(commands);
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.getCommandById
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700547.aspx
			//
			getCommandById: function (id) {
				if (!this._commands)
					return null;

				for (var i = 0; i < this._commands.length; i++)
					if (this._commands[i].id == id)
						return this._commands[i];

				return null;
			},


			// ================================================================
			//
			// public property: WinJS.AppBar.disabled
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700540.aspx
			//
			_disabled: false,
			disabled: {
				get: function () {
					return this._disabled;
				},
				set: function (value) {

					this._disabled = value;

					if (this._disabled && !this._hidden) {
						// Don't call this.hide() since win8 doesn't fire events when hiding due to disabled = true
						// TODO: Animate
						this.$rootElement.css("visibility", "hidden");
						this._hidden = true;
					}
				}
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.show
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229676.aspx
			//
			show: function () {
				if (this._disabled)
					return;
				// TODO: Animate
				var event = document.createEvent("CustomEvent");
				event.initCustomEvent("beforeshow", true, true, {});
				this.element.dispatchEvent(event);

				// Did any listener cancel the event?  If so then don't show
				// NOTE: As near as I can tell, Win8 does not support cancelling this action (somewhat surprisingly)
				//if (event.preventDefault)
				//	return;

				this.$rootElement.css("visibility", "visible");
				this._hidden = false;
				this.$clickEater.show();
				var event = document.createEvent("CustomEvent");
				event.initCustomEvent("aftershow", true, true, {});
				this.element.dispatchEvent(event);
			},


			// ================================================================
			//
			// public function: WinJS.AppBar.hide
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229668.aspx
			//
			hide: function () {
				// TODO: Animate

				if (this._disabled)
					return;
				// TODO: Generalize this oft-repeated pattern.
				var event = document.createEvent("CustomEvent");
				event.initCustomEvent("beforehide", true, true, {});
				this.element.dispatchEvent(event);

				// Did any listener cancel the event?  If so then don't hide
				// NOTE: As near as I can tell, Win8 does not support cancelling this action (somewhat surprisingly)
				//if (event.preventDefault)
				//	return;

				this.$rootElement.css("visibility", "hidden");

				this._hidden = true;
				this.$clickEater.hide();

				var event = document.createEvent("CustomEvent");
				event.initCustomEvent("afterhide", true, true, {});
				this.element.dispatchEvent(event);
			},


			// ================================================================
			//
			// public property: WinJS.AppBar.hidden
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229665.aspx
			//
			_hidden: true,
			hidden: {
				get:
        		function () {
        			return this._hidden;
        		}
			},


			// ================================================================
			//
			// public event: WinJS.AppBar.onafterhide
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212515.aspx
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
			// public event: WinJS.AppBar.onaftershow
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212516.aspx
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
			// public event: WinJS.AppBar.onbeforehide
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212517.aspx
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
			// public event: WinJS.AppBar.onbeforeshow
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212518.aspx
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
			}
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.AppBarCommand.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.AppBarCommand
//
//		Implementation of the WinJS.UI.AppBarCommand object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.AppBarCommand
	//
	AppBarCommand: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.AppBarCommand constructor
		//
		//		MSDN: TODO
		//
        function (element, options) {

        	options = options || {};

        	// Set default options
        	this._type = options.type || "button";
        	this._section = options.section || "global";
        	this._hidden = options.hidden || false;
        	this._disabled = options.disabled || false;
        	this._icon = options.icon || "";
        	this._label = options.label || "";
        	this.onclick = options.onclick || null;
        	this._selected = options.selected || false;

        	// Create a base element if one was not provided
        	if (!element) {
        		// create button or hr based on options.type
        		if (options.type == "separator")
        			element = $("<hr/>")[0];
        		else
        			element = $("<button data-win-control='WinJS.UI.AppBarCommand'></button>")[0];
        		// Give the element a unique id
        		blueskyUtils.setDOMElementUniqueId(element);
        	}

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// Set id after we've created the element
        	this.id = options.id;
        	if (this.id)
        		this.$rootElement.attr("id", this.id);
        	if (options.extraClass)
        		this.$rootElement.addClass(options.extraClass);
        	this.tooltip = options.tooltip || this.label;

        	// Create our DOM hierarchy
        	var $root = this.$rootElement;
        	$root.addClass("win-command");

        	if (this.section == "global")
        		$root.addClass("win-global");
        	else
        		$root.addClass("win-selection");
        	if (this.type == "toggle")
        		$root.attr("role", "menuitemcheckbox");
        	else
        		$root.attr("role", "menuitem");

        	// Create the flyout to show when this button is clicked if type == flyout
        	this.flyout = (this.type == "flyout" && options.flyout) || null;

        	if (this.type != "separator") {
        		this.$commandImage = $("<span class='win-commandicon win-commandring'><span class='win-commandimage'></span></span>");
        		$root.append(this.$commandImage);
        		this.$label = $("<span class='win-label'>" + this.label + "</span>");
        		$root.append(this.$label);
        	}

        	// Bind click for flyout
        	var that = this;
        	$root.bind("click", function (event) {

        		if (that._flyout) {
        			event.stopPropagation();
        			that._flyout.show(that.element, that.placement == "top" ? "bottom" : "top");
        		}
        	});
        },

		// ================================================================
		// WinJS.UI.AppBarCommand Member functions
		// ================================================================

        {
        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.icon
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700483.aspx
        	//
        	_icon: true,
        	icon: {
        		get: function () {
        			return _icon;
        		},
        		set: function (value) {
        			this._icon = value;
        			// TODO: Set in DOM
        			console.error("nyi - change icon in DOM");
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.label
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700492.aspx
        	//
        	_label: true,
        	label: {
        		get: function () {
        			return this._label;
        		},
        		set: function (value) {
        			this._label = value;
        			this.$label.text(value);
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.disabled
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700457.aspx
        	//
        	_disabled: true,
        	disabled: {
        		get: function () {
        			return this._disabled;
        		},
        		set: function (value) {
        			this._disabled = value;
        			this.$rootElement.attr("disabled", this._disabled ? "disabled" : undefined);
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.flyout
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700472.aspx
        	//
        	_flyout: true,
        	flyout: {
        		get: function () {
        			return this._flyout;
        		},
        		set: function (value) {
        			// string vs. object
        			if (typeof value === "string")
        				value = new WinJS.UI.Flyout($("#" + value)[0]);
        			this._flyout = value;
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.hidden
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700477.aspx
        	//
        	_hidden: true,
        	hidden: {
        		get: function () {
        			return this._hidden;
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.section
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700511.aspx
        	//
        	_section: true,
        	section: {
        		get: function () {
        			return this._section;
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.type
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700529.aspx
        	//
        	_type: "button",
        	type: {
        		get: function () {
        			return this._type;
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.tooltip
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700522.aspx
        	//
        	_tooltip: "",
        	tooltip: {
        		get: function () {
        			return this._tooltip;
        		},
        		set: function (value) {
        			this._tooltip = value;

        			// TODO: Use WinJS.UI.Tooltip when that is implemented
        			this.$rootElement.attr("title", value);
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.selected
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700513.aspx
        	//
        	_selected: "",
        	selected: {
        		get: function () {
        			return this._selected;
        		},
        		set: function (value) {
        			this._selected = value;
        			// TODO: Change value in DOM.
        			console.error("nyi - change selected in DOM");
        		}
        	},


        	// ================================================================
        	//
        	// private function: WinJS.UI.AppBarCommand._appBarHiding
        	//
        	//		Called by the appbar when it's hiding; this allows us to hide our flyout if we have one and it's showing
        	//
        	_appBarHiding: function () {

        		// If we have a flyout, then hide it
        		if (this._flyout)
        			this._flyout.hide();
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

		// Do nothing if animations are disabled
		if (!WinJS.UI.isAnimationEnabled)
			return;

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

WinJS.Class.mix(WinJS.UI.BaseControl, WinJS.UI.DOMEventMixin);








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Fragments.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.Fragments
//
//		This is the root WinJS.UI.Fragments namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229781.aspx
//
WinJS.Namespace.define("WinJS.UI.Fragments", {

	// ================================================================
	//
	// public function: WinJS.UI.Fragments.render
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701605.aspx
	//
	render: function (href, element) {

		return WinJS.UI.Fragments._render(href, element, false);
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.renderCopy
	//
	//		MSDN: TODO
	//
	renderCopy: function (href, element) {

		return WinJS.UI.Fragments._render(href, element, true);
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._render
	//
	_render: function (href, element, addToCache) {

		// If already in the cache then just return the current page.  
		if (this._cacheStore[href])
			return this._getDocumentFragmentFromCache(href, element);

		// Load (and process) the fragment into the specified DOM element
		return this._loadAndProcessHrefIntoDocumentFragment(href).then(function (docFrag) {

			// At this point, docFrag contains the contents of the page at "href" (and scripts/styles have been moved up into the head).
			// If caller specifed an element, then move the document fragment into it and return the element; otherwise just return the fragment

			if (addToCache)
				WinJS.UI.Fragments._cacheStore[href] = docFrag.cloneNode(true);

			if (!element)
				return docFrag;

			element.appendChild(docFrag);

			return element;
		});
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._loadAndProcessHrefIntoDocumentFragment
	//
	_loadAndProcessHrefIntoDocumentFragment: function (href) {

		var that = this;
		return new WinJS.Promise(function (fragmentLoadedCallback) {

			// TODO: Use WinJS.xhr when that's implemented
			// TODO: Error handling

			// First, load the fragment's text
			$.get(href, function (response) {

				// Second, Process the loaded page into a document fragment
				that._processFragment(response).then(function (docFrag) {

					// Third, Notify listeners that the fragment has been loaded (and processed) into a document fragment
					fragmentLoadedCallback(docFrag);
				});
			});
		});
	},


	// TODO: Make Page.render use Fragment.render.


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._processFragment
	//
	_processFragment: function (fragmentText) {

		return new WinJS.Promise(function (fragmentProcessedCallback) {

			// Create a temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
			// TODO (PERF): Doing this with jQuery to get the 'contents' function. Need to refactor using document.createElement("div") et al
			var tempDiv = $("<div></div>");
			tempDiv[0].innerHTML = fragmentText;

			// Create the document fragment and copy the page's contents into it
			var docFrag = document.createDocumentFragment();
			tempDiv.contents().get().forEach(function (child) {
				docFrag.appendChild(child);
			});

			// AT THIS POINT: 
			//	1. docFrag contains the contents of the loaded fragment as DOM elements
			//	2. None of the scripts or styles (local or referenced) have been loaded or executed yet, nor moved out of the fragment

			// Move styles out of the document fragment and into the page's head.  Don't add duplicates. Move styles first so that
			// they're there when we move scripts.  Also; prepend the styles so they appear first
			var styleNodesToMove = [];
			var $head = $("head");

			for (var i in docFrag.childNodes) {
				var childNode = docFrag.childNodes[i];
				if (childNode.nodeName == "STYLE" || (childNode.nodeName == "LINK" && childNode.attributes.getNamedItem("rel").nodeValue == "stylesheet")) {

					styleNodesToMove.push(childNode);
				}
			}

			styleNodesToMove.forEach(function (styleNodeToMove) {

				// Remove the style node from the document fragment in preparation for adding it to the document's head.
				docFrag.removeChild(styleNodeToMove);

				// Only add the style to the document's head if it's not a duplicate
				var href = styleNodeToMove.attributes.getNamedItem("href");
				var isDuplicateStyle = href && ($("link[href='" + href.nodeValue + "']", $head).length > 0);

				// Remove WinJS styles from the loaded fragment.  Technically not necessary, but good for combination win8/web projects.
				// TODO (PERF): Possibly worth pulling this out for perf.
				var isMicrosoftStyle = href && href.nodeValue.toLowerCase().indexOf("//microsoft") == 0;

				if (!isDuplicateStyle && !isMicrosoftStyle) {
					// Add the style node to the head
					$head.prepend(styleNodeToMove);

					// Track moved nodes for test purposes (allowing us to subsequently remove them from $head)
					WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.push(styleNodeToMove);
				}
			});

			// AT THIS POINT: 
			//	1. The loaded fragment's styles have been moved up to the head and are ready to be parsed.  They may not actually be parsed
			//	yet due to how HTML5 handles styles.  
			//	2. We have removed any duplicate styles from the loaded fragment
			//	3. None of the loaded fragment's scripts have been moved out of the fragment nor have they been executed

			// Move scripts from the document fragment up to document head, but don't execute them.
			var scriptNodesToMove = [];
			for (var i in docFrag.childNodes) {
				var childNode = docFrag.childNodes[i];
				if (childNode.nodeName == "SCRIPT") {

					scriptNodesToMove.push(childNode);
				}
			}

			scriptNodesToMove.forEach(function (scriptNodeToMove) {

				// Remove the script node from the document fragment in preparation for adding it to the document's head.
				docFrag.removeChild(scriptNodeToMove);

				// Only add the script to the document's head if it's not a duplicate
				var src = scriptNodeToMove.attributes.getNamedItem("src");
				var isDuplicateScript = src && ($("script[src='" + src.nodeValue + "']", $head).length > 0);

				// Remove WinJS scripts and styles from the loaded fragment.  Technically not necessary, but good for combination win8/web projects.
				// TODO (PERF): Possibly worth pulling this out for perf.
				var isMicrosoftScript = src && src.nodeValue.toLowerCase().indexOf("//microsoft") == 0;

				if (!isDuplicateScript && !isMicrosoftScript) {

					// Add the script node to the head and execute it
					// TODO (CLEANUP):	Hmm, this is a bit tricky here.  Based on how Win8 appears to work,
					//					I believe that we want to execute the scripts we're appending to head.
					//					However, jQuery's '$head.append(scriptNodeToMove)' executes the script
					//					but doesn't actually put it into the head element.  On the other hand,
					//					document.head.appendChild(scriptNodeToMove); puts it in head, but 
					//					doesn't execute it (d'oh!).  There may be another option that gives us
					//					both, but for now jQuery's appears to work right, although the script
					//					isn't actually visible in the DOM. hm...
					$head.append(scriptNodeToMove);

					// Track moved nodes for test purposes (allowing us to subsequently remove them)
					WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.push(scriptNodeToMove);
				}
			});

			// Notify listeners  that the fragment has been processed.
			fragmentProcessedCallback(docFrag);
		});
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._getDocumentFragmentFromCache
	//
	//		Return a promise that we'll return the docfrag that corresponds to the specified href
	//		Caller is responsible for ensuring presence in the cache.
	//
	_getDocumentFragmentFromCache: function (href, element) {

		var docFrag = this._cacheStore[href].cloneNode();
		return new WinJS.Promise(function (c) {
			if (!element) {
				c(docFrag);
			} else {
				element.appendChild(docFrag);
				c(element);
			}
		});
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.cache
	//
	//		MSDN: TODO
	//
	cache: function (href) {
		var that = this;

		// If already in the cache then just return the current page.  
		if (this._cacheStore[href])
			return this._getDocumentFragmentFromCache(href);

		return this._loadAndProcessHrefIntoDocumentFragment(href).then(function (docFrag) {

			return new WinJS.Promise(function (fragmentCachedPromise) {

				// Add the loaded item to the page cache
				that._cacheStore[href] = docFrag;

				// Notify that we've fulfilled our Promise to load the page.
				fragmentCachedPromise(docFrag);
			});
		});
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.clearCache
	//
	//		MSDN: TODO
	//
	clearCache: function (href) {
		if (this._cacheStore[href])
			this._cacheStore[href] = null;
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._testSupportRemoveScriptsAndStyles
	//
	_testSupportMovedScriptsAndStyles: [],
	_testSupportRemoveScriptsAndStyles: function () {
		WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.forEach(function (node) {
			$(node).remove();
		});
		WinJS.UI.Fragments._testSupportMovedScriptsAndStyles = [];
	},


	// ================================================================
	//
	// private property: WinJS.UI.Fragments._cacheStore
	//
	//		Set of previously cached pages.  _cacheStore[href] = documentFragment
	//
	_cacheStore: []
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
	_renderingPage: null,
	_renderingSubpages: [],
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

						// We can't call processAll on the loaded page until it's been parented (so that styles can 'find' it in the DOM).
						return WinJS.UI.processAll(targetElement);

					}).then(function () {
						// If this is the top level "rendering page", then wait until all subpage renderPromises have been fulfilled before we tell anyone that we're done.
						// TODO: This should actually work recursively, where a subpage waits on its subpages.
						if (that == WinJS.UI.Pages._renderingPage && WinJS.UI.Pages._renderingSubpages.length > 0)
							return WinJS.Promise.join(WinJS.UI.Pages._renderingSubpages);

					}).then(function () {
						WinJS.UI.Pages._renderingPage = null;
						if (that.ready)
							that.ready(targetElement, state);
						if (that.updateLayout)
							that.updateLayout(targetElement, state, null);
						if (that.processed)
							that.processed(targetElement, state);
					});
				}

				// Create a promise to load the specified Uri into the specifie targetElement
				var loadedAndInited = this._loadPage({
					Uri: pageUri,
					element: targetElement
				}).then(function (pageInfo) {

					// After loading, process the page
					return that._processPage(pageInfo);

				}).then(function (pageInfo) {

					// After processing the page, call the page's "init" function (if any)
					return new WinJS.Promise(function (c) {

						if (that.init)
							that.init(targetElement, state);
						c(pageInfo);
					});
				});

				// Fulfill our elementReady promise after the page has been loaded AND init'ed
				this.elementReady = loadedAndInited.then(function () {
					return targetElement;
				});

				// After the page is loaded is init'ed, process it.  Return a promise that this will happen.  Caller then chains on that promise.
				// TODO: Diff between this and elementReady?
				this.renderPromise = loadedAndInited.then(function (result) {
					return result;
				});

				if (WinJS.UI.Pages._renderingPage) {
					// We're already rendering a page; that page (or one of its subpages) must have a subpage.  We will want to wait on all subpage rendering prior to informing complation
					WinJS.UI.Pages._renderingSubpages.push(this.renderPromise);
				} else {
					WinJS.UI.Pages._renderingPage = this;
					WinJS.UI.Pages._renderingSubpages = [];
				}

				// if caller didn't specify a parented promise, then handle calling ready (et al) ourselves.
				// TODO: Clean this up with the above similar (inverted) block.
				if (!parentedPromise) {
					this.renderPromise = this.renderPromise.then(function (result) {
						// We can't call processAll on the loaded page until it's been parented (so that styles can 'find' it in the DOM).
						return WinJS.UI.processAll(targetElement);

					}).then(function () {
						// If this is the top level "rendering page", then wait until all subpage renderPromises have been fulfilled before we tell anyone that we're done.
						// TODO: This should actually work recursively, where a subpage waits on its subpages.
						if (that == WinJS.UI.Pages._renderingPage && WinJS.UI.Pages._renderingSubpages.length > 0)
							return WinJS.Promise.join(WinJS.UI.Pages._renderingSubpages);

					}).then(function () {
						WinJS.UI.Pages._renderingPage = null;
						if (that["ready"])
							that["ready"](targetElement, state);
						if (that["updateLayout"])
							that["updateLayout"](targetElement, state, null);
						if (that["processed"])
							that["processed"](targetElement, state);
					})
				}
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

					// At this point, pageInfo.element == targetElement and pageInfo.response contains the 
					// text HTML response obtained from pageUri.

					// Return a Promise that we'll process the page (Honestly! We will!)
					return new WinJS.Promise(function (pageProcessCompletedCallback) {

						// Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
						// because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
						// sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
						// $("<div></div>").html(pageInfo.response) won't work for the above reason.

						// Also note: Per http://molily.de/weblog/domcontentloaded, HTML5 requires browsers to defer execution of scripts until
						// all previous stylesheets are loaded.  So, we need to rearrange scripts and styles from the loaded page so that styles come before scripts.
						// This does inject a nontrivial perf hit, but its unavoidable given the need to have styles parsed before scripts reference them (e.g. WinControl sizes).  In order 
						// to minimize the perf hit somewhat, we push all scripts to the bottom of the page and styles to the top (see rules 5 and 6 here:http://stevesouders.com/hpws/rules.php)
						// TODO: If this is a problem for a subset of apps, then provide a "WinJS.Bluesky.deferScripts" option and set it to optout.
						// TODO: How to do this to root page?  Probably just warn user? 

						// Create the temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
						// BTW: I *heart* John Resig: http://ejohn.org/blog/dom-documentfragments/
						// TODO (PERF): Doing this with jQuery to get the 'contents' function. Need to refactor using document.createElement("div")
						var tempDiv = $("<div></div>");
						tempDiv[0].innerHTML = pageInfo.response;

						// Create the temporary DOM fragment and copy the page's contents into it
						var tempDocument = document.createDocumentFragment();
						tempDiv.contents().get().forEach(function (child) {
							tempDocument.appendChild(child);
						});

						// AT THIS POINT: 
						//	1. tempDocument contains all of the contents of the loaded page as valid DOM element
						//	2. None of the scripts or styles (local or referenced) have been loaded or executed yet

						// NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage before
						//we actually 'realize' the script (to avoid duplicate scripts from being executed once in the root doc and once again in the loaded page).
						//
						// Note: Need to use visiblity:hidden/display:block so that any child element's dimensions are realized (e.g. listitems in a listview).
						var $newPage = $(tempDiv);//.css({ 'position': 'absolute', 'visibility': 'hidden', 'display': 'block' });

						// Add the contents from the temporary document to our new div
						// NOTE: This will NOT execute any scripts in $newPage.
						$newPage.append(tempDocument);

						// For each script in the main document, remove any duplicates in the new page.
						// TODO: this approach is case sensitive, so "test.js" and "Test.js" will not match.  What's the jQuery way to say "case insensitive"?
						$("script", document).each(function (index, element) {
							$("script[src='" + element.attributes["src"].value + "']", $newPage).remove();
						});

						// Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
						$("link[href^='//Microsoft'], link[href^='//microsoft']", $newPage).remove();
						$("script[src^='http://Microsoft'], script[src^='http://microsoft'], script[src^='//Microsoft'], script[src^='//microsoft']", $newPage).remove();

						// AT THIS POINT: 
						//	1. The loaded page is ready to be appended to the target element
						//	2. None of the loaded page's scripts have been executed, nor have its externally referenced scripts or styles been loaded.  

						// Prep the target element to insert the new page.
						var $target = $(pageInfo.element);
						$target.addClass("pagecontrol");

						// Do some parsing on the subpage...
						// A. Move various tags up to the page's <head> element.  Also move styles
						// TODO (PERF): Grab $("head") once and make it available in blueskyUtils._$head (or somesuch) for internal use only.
						var $head = $("head", document);

						// Move styles first so that they're there when we move scripts.  Also; prepend the styles so they appear first
						$("meta, title, link, style", $newPage).prependTo($head);

						// B. Remove duplicate styles and meta/charset tags
						blueskyUtils.removeDuplicateElements("style", "src", $head);
						blueskyUtils.removeDuplicateElements("meta", "charset", $head);

						// C. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
						$("title:not(:first)", $head).remove();

						// move any scripts out of $newPage and into a temporary list so that we can process them independently
						//		var $newPageScripts = $("script", $newPage).remove();

						// Add the new page's contents to the element (note: use contents instead of children to get text elements as well)
						$target.append($newPage.contents());

						// AT THIS POINT: 
						//	1. $target contains all of the elements from the loaded page.
						//	2. $target may or may not be placed within the DOM, so ELEMENTS WITHIN $target MAY HAVE INVALID DIMENSIONS/STYLES.
						//  3. All styles from the loaded page have been moved up to the page's head, but possibly not yet parsed into document.styleSheets
						//	4. No scripts (local or referenced) within the loaded page have been loaded or executed.

						// Win8 likes to add all DOM elements with Ids to the global namespace.  Add all of the loaded Page's id'ed DOM elements now.
						$("[id]", $target).each(function (index, element) {
							window[element.id] = element;
						});

						//	$newPageScripts.appendTo($head);

						// We *can't quite* call WinJS.UI.processAll on the loaded page, since it has not yet been parented.  So: just return and
						// wait for the parentedPromise to be fulfilled...

						pageProcessCompletedCallback(pageInfo);
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
		        },
		        set: function () {
		        	console.warn("Flyout.alignment is NYI");
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
        		this._notifyCancel();

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
        			//target: { winControl: this },
        			//type: 'previewchange',
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
        	//	eventInfo.type = "change";
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
        	_notifyChange: function (eventData) {
        	    var event = document.createEvent("CustomEvent");
        	    event.initCustomEvent("change", true, false, eventData);
        	    this.element.dispatchEvent(event);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._notifyPreviewChange
        	//
        	_notifyPreviewChange: function (eventData) {
        	    var event = document.createEvent("CustomEvent");
        	    event.initCustomEvent("previewchange", true, false, eventData);
        	    this.element.dispatchEvent(event);
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.Rating._notifyCancel
        	//
        	_notifyCancel: function (eventData) {
        	    var event = document.createEvent("CustomEvent");
        	    event.initCustomEvent("cancel", true, false, eventData);
        	    this.element.dispatchEvent(event);
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
                                                 .removeAttr("data-win-control") // remove the data-win-control attribute
												 .show()[0];	// Show the instance we'll populate

                        // Give the cloned element a unique identifier
                        blueskyUtils.setDOMElementUniqueId(templateInstance);

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
            _notifyPageCompleted: function (pageElement, eventData) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pagecompleted", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyDataSourceCountChanged
            //
            _notifyDataSourceCountChanged: function (pageElement, eventData) {

                // TODO-CLEANUP: Merge all of these _notify*** functions into one function and just call it.
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("datasourcecountchanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageSelected
            //
            _notifyPageSelected: function (pageElement, eventData) {

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pageselected", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageVisibilityChanged
            //
            _notifyPageVisibilityChanged: function (pageElement, eventData) {

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pagevisibilitychanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.ondatasourcecountchanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211705.aspx
            //
            ondatasourcecountchanged: {
                 
                get: function () {
                    // Return the tracked hander (if any)
                    return this._ondatasourcecountchanged;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._ondatasourcecountchanged)
                		this.removeEventListener("datasourcecountchanged", this._ondatasourcecountchanged);

                    // track the specified handler for this.get
                    this._ondatasourcecountchanged = callback;
                    this.addEventListener("datasourcecountchanged", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagecompleted
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh965332.aspx
            //
            onpagecompleted: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpagecompleted;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpagecompleted)
                		this.removeEventListener("pagecompleted", this._onpagecompleted);

                    // track the specified handler for this.get
                    this._onpagecompleted = callback;
                    this.addEventListener("pagecompleted", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpageselected
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211713.aspx
            //
            onpageselected: {
                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpageselected;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpageselected)
                		this.removeEventListener("pageselected", this._onpageselected);

                    // track the specified handler for this.get
                    this._onpageselected = callback;
                    this.addEventListener("pageselected", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagevisibilitychanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211714.aspx
            //
            onpagevisibilitychanged: {
                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpagevisibilitychanged;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpagevisibilitychanged)
                		this.removeEventListener("pagevisibilitychanged", this._onpagevisibilitychanged);

                	// track the specified handler for this.get
                    this._onpagevisibilitychanged = callback;
                    this.addEventListener("pagevisibilitychanged", callback);
                }
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
            // public function: WinJS.UI.FlipView.next
            //
            //		MSDN: TODO
            //
            next: function () {

                if (this.currentPage == this._items.length - 1)
                    return false;

                // TODO (CLEANUP): Combine previous, next, and set (lots of shared functionality)
                var pageIndex = this.currentPage + 1;

                this._makePageVisible(pageIndex);

                // Fade out the current page
                $(this._items[this._currentPage]).fadeOut("fast");

                // Notify listeners that the new page is visible
                var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                var incomingPage = $(".win-template", this._items[pageIndex])[0];
                this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });

                this._currentPage = pageIndex;

                // Notify listeners that the previous page is no longer visible
                this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                // Notify listeners that the page has been selected
                this._notifyPageSelected(incomingPage, { source: this.element });

                // Render the page; when done, notify listeners that the page has completed
                var that = this, offset;
                if (this.orientation == "horizontal")
                    offset = { top: "0px", left: "40px" };
                else
                    offset = { top: "40px", left: "0px" };

                var that = this;
                return WinJS.UI.Animation.enterContent([this._items[this._currentPage]], [offset]).then(function () {
                    that._notifyPageCompleted(incomingPage, { source: that.element });
                });
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

                // TODO (CLEANUP): Combine previous, next, and set (lots of shared functionality)
                var pageIndex = this.currentPage - 1;

                this._makePageVisible(pageIndex);

                // Fade out the current page
                $(this._items[this._currentPage]).fadeOut("fast");

                // Notify listeners that the new page is visible
                var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                var incomingPage = $(".win-template", this._items[pageIndex])[0];
                this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });

                this._currentPage = pageIndex;

                // Notify listeners that the previous page is no longer visible
                this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                // Notify listeners that the page has been selected
                this._notifyPageSelected(incomingPage, { source: this.element });

                // Render the page; when done, notify listeners that the page has completed
                var that = this, offset;
                if (this.orientation == "horizontal")
                    offset = { top: "0px", left: "-40px" };
                else
                    offset = { top: "-40px", left: "0px" };

                var that = this;
                return WinJS.UI.Animation.enterContent([this._items[this._currentPage]], [offset]).then(function () {
                    that._notifyPageCompleted(incomingPage, { source: that.element });
                });
                return true;
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

                	pageIndex = Math.max(pageIndex, 0);

                    if (this._currentPage == pageIndex)
                        return;
                    if (!this._itemDataSource || pageIndex >= this._itemDataSource.getCount())
                        return;
                    var that = this;

                    this._makePageVisible(pageIndex);

                    var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                    var incomingPage = $(".win-template", this._items[pageIndex])[0];

                    // Fade out the current page
                    if (outgoingPage) {
                        $(this._items[this._currentPage]).fadeOut("fast");
                        this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });
                    }

                    if (!incomingPage)
                        return;

                    this._currentPage = pageIndex;

                    // Notify listeners that the previous page is no longer visible
                    this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                    // Notify listeners that the page has been selected
                    this._notifyPageSelected(incomingPage, { source: this.element });

                    // Render the page; when done, notify listeners that the page has completed
                    return new WinJS.Promise(function (onComplete) {
                        $(that._items[that._currentPage]).fadeIn("fast", function () {
                            that._notifyPageCompleted(incomingPage, { source: that.element });
                            onComplete();
                        });
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
                        that._notifyDataSourceCountChanged(that.element);
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
                    this.currentPage = Math.max(0, Math.min(this._currentPage, this._itemDataSource._list.length - 1));

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
//                    File: WinJS.UI.SemanticZoom.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.SemanticZoom
//
//		Implementation of the WinJS.UI.SemanticZoom object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229690.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.SemanticZoom
	//
	SemanticZoom: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.SemanticZoom constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229692.aspx
		//	
        function (element, options) {

        	/*DEBUG*/
        	// Parameter validation
        	if (!element)
        		console.error("WinJS.UI.SemanticZoom constructor: Undefined or null element specified");
        	/*ENDDEBUG*/

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// Tag our rootelement with our class and role
        	this.$rootElement.addClass("win-semanticzoom").css("position", "relative");
        	this.$rootElement.attr("role", "ms-semanticzoomcontainer");

        	// Generate the DOM hierarchy for the SemanticZoom control
        	this._$zoomedInElement = $(">div::nth-child(1)", this.$rootElement);
        	this._$zoomedOutElement = $(">div::nth-child(2)", this.$rootElement);
        	this._$zoomContainer = $("<div style='position: absolute; left: 0px; top: 0px; overflow: hidden'></div>").appendTo(this.$rootElement);
        	this._$zoomedInContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomContainer);
        	this._$zoomedOutContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomContainer);
        	this._$zoomedInSubContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomedInContainer);
        	this._$zoomedOutSubContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomedOutContainer);
        	this._$zoomedInElement.appendTo(this._$zoomedInSubContainer);
        	this._$zoomedOutElement.appendTo(this._$zoomedOutSubContainer);

        	// Set dimensions
        	var dimensions = {
        		width: this.$rootElement.innerWidth(),
        		height: this.$rootElement.innerHeight()
        	};
        	this._$zoomContainer.css(dimensions);
        	this._$zoomedInContainer.css(dimensions);
        	this._$zoomedOutContainer.css(dimensions);
        	this._$zoomedInSubContainer.css(dimensions);
        	this._$zoomedOutSubContainer.css(dimensions);
        	this._$zoomedInElement.css(dimensions);
        	this._$zoomedOutElement.css(dimensions);

        	// Add the zoom button
        	this._addZoomButton();

        	WinJS.UI.processAll(this.element);

        	// Start out with zoomedin visible, zoomedout hidden
        	this._showElement(this._$zoomedInContainer);
        	this._hideElement(this._$zoomedOutContainer);

        	// When the user clicks on an item in the zoomedout control, zoom into it in the zoomedincontrol
        	// TODO: This only works with ListViews for now.  Need to generalize through IZoomableView in R2/R3
        	this._zoomedInListView = this._$zoomedInElement[0].winControl;
        	this._zoomedOutListView = this._$zoomedOutElement[0].winControl;
        	/*DEBUG*/
        	
        	if (!this._zoomedOutListView || !this._zoomedOutListView.selection)
        		console.error("SemanticZoom only works with ListView subcontrols for R1; IZoomableView will come in R2/R3");
        	if (this._zoomedInListView._groupDataSource != this._zoomedOutListView._itemDataSource)
        		console.error("SemanticZoom currently only works with a grouped listview as the zoomed-in view, and that listview's groupdatasource as the zoomed-out view.  Check the GroupedListview sample for a working example");

        	/*ENDDEBUG*/
        	this._zoomedOutListView.oniteminvoked = this._zoomedOutListItemClicked.bind(this);

        	// Initialize values
        	this._enableButton = true;
        	this._locked = false;
        	this._zoomedOut = false;
        	this._zoomFactor = 0.65;
        },

		// ================================================================
		// WinJS.UI.SemanticZoom Member functions
		// ================================================================

		{

			// ================================================================
			//
			// public event: WinJS.SemanticZoom.onzoomchanged
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh994989.aspx
			//
			onzoomchanged: {
				get: function () {
					// Return the tracked hander
					return this._onzoomchanged;
				},

				set: function (callback) {

					// Remove previous on* handler if one was specified
					if (this._onzoomchanged)
						this.removeEventListener("zoomchanged", this._onzoomchanged);

					// track the specified handler for this.get
					this._onzoomchanged = callback;
					this.addEventListener("zoomchanged", callback);
				}
			},


			// ================================================================
			//
			// public property: WinJS.SemanticZoom.enableButton
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/jj126159.aspx
			//
			_enableButton: true,
			enableButton: {
				get: function () {
					return this._enableButton;
				},
				set: function (value) {
					this._enableButton = value;
					this._enableButton ? this._addZoomButton() : this._removeZoomButton();
				}
			},


			// ================================================================
			//
			// public property: WinJS.SemanticZoom.locked
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229689.aspx
			//
			_locked: false,
			locked: {
				get: function () {
					return this._locked;
				},
				set: function (value) {
					this._locked = value;
				}
			},


			// ================================================================
			//
			// public property: WinJS.SemanticZoom.zoomedOut
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229693.aspx
			//
			_zoomedOut: false,
			zoomedOut: {
				get: function () {
					return this._zoomedOut;
				},
				set: function (isZoomedOut) {

					// If the ZoomControl is locked, then ignore zoom set
					if (this._locked)
						return;

					// If same, then ignore
					if (this._zoomedOut == isZoomedOut)
						return;

					this._zoomedOut = isZoomedOut;

					// hide/show the appropriate zoomed in/out container.  _hideElement/_showElement return
					// Promises which are fulfilled when the animation has finished; we wait until both
					// animations are done before triggering onzoomchanged
					var promises = [];
					if (isZoomedOut) {
						// We're zooming out; hide the zoomedInContainer and show the zoomedOutContainer
						promises.push(this._hideElement(this._$zoomedInContainer));
						promises.push(this._showElement(this._$zoomedOutContainer));

						// Also hide the zoom button, which isn't visible when zoomed out
						this._$zoomButton.hide().css({ "visibility": "hidden" });
					} else {

						// We're zooming in; show the zoomedInContainer and hide the zoomedOutContainer
						promises.push(this._showElement(this._$zoomedInContainer));
						promises.push(this._hideElement(this._$zoomedOutContainer));

						// Also show the zoom button, which is visible when zoomed out (if enableButton is true)
						if (this.enableButton)
							this._$zoomButton.show().css({ "visibility": "visible" });
					}

					// Per above, wait until both animations have completed before triggering onzoomchanged.
					var that = this;
					WinJS.Promise.join(promises).then(function () {
						// Notify listeners that zoom changed
						var event = document.createEvent("CustomEvent");
						event.initCustomEvent("zoomchanged", true, false, {});
						that.element.dispatchEvent(event);
					});
				}
			},


			// ================================================================
			//
			// public property: WinJS.SemanticZoom.zoomFactor
			//
			//		TODO: NYI; not leveraging this yet.
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701189.aspx
			//
			_zoomFactor: 0.65,
			zoomFactor: {
				get: function () {
					return this._zoomFactor;
				}
			},


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._showElement
			//
			_showElement: function ($element) {

				// TODO: Animate zoom (in R2)
				// TODO (CLEANUP): Use jQuery's promise functionality here?
				return new WinJS.Promise(function (onComplete) {
					$element.fadeIn("fast", function () {
						$element.css({ "visibility": "visible" });
						onComplete();
					});
				});
			},


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._hideElement
			//
			_hideElement: function ($element) {

				// TODO: Animate zoom (in R2)
				// TODO (CLEANUP): Use jQuery's promise functionality here?
				return new WinJS.Promise(function (onComplete) {
					$element.fadeOut("fast", function () {
						$element.css({ "visibility": "hidden", "display": "block" });
						onComplete();
					});
				});
			},


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._addZoomButton
			//
			_addZoomButton: function () {

				this._$zoomButton = $("<button class='win-semanticzoom-button win-semanticzoom-button-location ltr'></button>");
				this.$rootElement.append(this._$zoomButton);
				var that = this;
				this._$zoomButton.click(function () {
					that.zoomedOut = true;
				});
			},


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._removeZoomButton
			//
			_removeZoomButton: function () {

				this._$zoomButton.remove();
			},


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._zoomedOutListItemClicked
			//
			//		Called when the user clicks on an item in the zoomed out list view.  Transition to the zoomed-in listview,
			//		scrolled to the clicked-on group.
			//
			_zoomedOutListItemClicked: function (eventData) {

				// Zoom out
				this.zoomedOut = false;

				// Gor now, Semantic Zoom works with grouped lists only, so we can find the first item
				// in the invoked group, and scroll to it in the zoomed-in listview.
				// TODO: Support other datasources than grouped lists
				var that = this;
				eventData.detail.itemPromise.then(function (clickedGroup) {

					// Find the first item in the zoomedinlistview that is in the clicked group
					// TODO (CLEANUP): Should use IListDataSource for this.
					var list = that._zoomedInListView._itemDataSource._list;
					for (var i = 0; i < list.length; i++) {
						var item = list.getItem(i);
						if (item.groupKey == clickedGroup.key) {

							// Bring the selected item/group (?) into view
							that._zoomedInListView.indexOfFirstVisible = i;
							break;
						}
					}
				});
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
                this.$viewport = $viewportDiv;
                this.$scrollSurface = $surfaceDiv;

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

                        	// If there's a previous group header, then limit its width to the total width of the group of items that we just rendered
                        	if ($groupHeaderTemplate && !groupHeaderOnLeft) {
                        		$groupHeaderTemplate.css("width", (surfaceWidth - groupRenderStartX - parseInt($groupHeaderTemplate.css("marginLeft"))) + "px");
                        	}

                        	// Track width of the current group for the above limit
                        	groupRenderStartX = surfaceWidth;
							
                            // Track the current group key so that we know when we switch to a new group
                            currentGroupKey = item.groupKey;

                            // Output the new group's header
                            // Clone the group header template, make it visible, and place it.
                            var $groupHeaderTemplate = $(that.groupHeaderTemplate)
								.clone()
								.addClass("win-groupheader")
								.show();
                            
                            // Give the cloned element a unique identifier
                            // TODO (CLEANUP): can I do this in Binding.processAll?
                            blueskyUtils.setDOMElementUniqueId($groupHeaderTemplate[0]);

                            // Perform data binding on the group header template
                            // TODO: Should use groupDataSource.itemFromKey - but that returns a Promise and I need to refactor this
                            //		 code to allow that to return asychronously...
                            WinJS.Binding.processAll($groupHeaderTemplate[0], that._groupDataSource._list.getItemFromKey(item.groupKey).data);

                            // Remove the data-win-control attribute after we've processed it.
                            // TODO (CLEANUP): Am I doing this after every call to processAll?  If so, move this into there.
                            $groupHeaderTemplate.removeAttr("data-win-control");

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

						// Handle right-click selection
                        $(".win-item", $thisItemContainer).bind("contextmenu", function (event) {
                        	event.preventDefault();
                        	if (that.selectionMode != "none") {

                        		event.stopPropagation();

                        		// Get the index of the right-clicked item
                        		var itemIndex = $(this).data("itemIndex");

                        		//that.selection.add(itemIndex);
                        		var $containerNode = $(this.parentNode)

                        		if ($containerNode.hasClass("win-selected"))
                        			that.selection.remove(itemIndex);// remove selection
                        		else
                        			if (that.selectionMode == "multi")
                        				that.selection.add(itemIndex);
                        			else
                        				that.selection.set(itemIndex);

                        		that._lastSelectedItemIndex = itemIndex;
                        		that._notifySelectionChanged(that.element);
                        	}
                        });

                        // If the user clicks on the item, call our oniteminvoked function
                        $(".win-item", $thisItemContainer).click(function () {

                            // Get the index of the clicked item container's item
                            var itemIndex = $(this).data("itemIndex");

                            // Call invoke
                            if (that.tapBehavior != "none") {
								// TODO: Clean this up
                            	if (!(that.tapBehavior == "invokeOnly" && blueskyUtils.shiftPressed || blueskyUtils.controlPressed)) {

                            		// Create a Promise with the clicked item
                            		var promise = new WinJS.Promise(function (c) { c(that.items[itemIndex]); });

                            		// Call the callback
                            		that._notifyItemInvoked(this.parentNode, {
                            			itemIndex: itemIndex,
                            			itemPromise: promise
                            		});
                            	}
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
                                that._notifySelectionChanged(that.element);
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
                // template, add the 'win-item' class, remove the data-win-control attribute, and then show it
                item.element = $(this.itemTemplate)
					.clone()
					.addClass("win-item")
                    .removeAttr("data-win-control")
					.show()[0];

                // Give the cloned element a unique identifier
                blueskyUtils.setDOMElementUniqueId(item.element);

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

                        // Give the cloned element a unique identifier
                        if (!$(item.element).attr("id"))
                            blueskyUtils.setDOMElementUniqueId(item.element);

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
                    if (newLayout instanceof WinJS.UI.ListLayout || newLayout instanceof WinJS.UI.GridLayout)
                        this._layout = newLayout;
                    else
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
            _notifySelectionChanged: function (pageElement, eventData) {

            	// TODO: What to pass for data?

            	var event = document.createEvent("CustomEvent");
            	event.initCustomEvent("selectionchanged", true, false, eventData);
            	pageElement.dispatchEvent(event);
            },


        	// ================================================================
        	//
        	// private function: WinJS.ListView._notifyItemInvoked
        	//
            _notifyItemInvoked: function (pageElement, eventData) {

            	var event = document.createEvent("CustomEvent");
            	event.initCustomEvent("iteminvoked", true, false, eventData);
            	pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // public event: WinJS.ListView.oniteminvoked
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211827.aspx
            //
            oniteminvoked: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._oniteminvoked;
                },

                set: function (callback) {

                	// Remove previous on* handler if one was specified
                	if (this._oniteminvoked)
                		this.removeEventListener("iteminvoked", this._oniteminvoked);

                    // track the specified handler for this.get
                    this._oniteminvoked = callback;
                    this.addEventListener("iteminvoked", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.ListView.selectionchanged
            //
            //		MSDN: TODO
            //
            onselectionchanged: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._onselectionchanged;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onselectionchanged)
                		this.removeEventListener("selectionchanged", this._onselectionchanged);

                    // track the specified handler for this.get
                    this._onselectionchanged = callback;
                    this.addEventListener("selectionchanged", callback);
                }
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
            },


        	// ================================================================
        	//
        	// public property: WinJS.ListView.scrollPosition
        	//
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211847.aspx
        	//
            scrollPosition: {
            	get: function () {
					if (this.layout.horizontal)
						return this.$viewport.scrollLeft();
					else
						return this.$viewport.scrollTop();
            	},
            	set: function (value) {
            		if (this.layout.horizontal)
            			this.$viewport.scrollLeft(value);
					else
            			this.$viewport.scrollTop(value);
            	}
            },


        	// ================================================================
        	//
        	// public property: WinJS.ListView.indexOfFirstVisible
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700691.aspx
        	//
            indexOfFirstVisible: {
            	get: function () {
            		console.warn("ListView.indexOfFirstVisible getter is NYI; returning 0");
            		return 0;
            	},
            	set: function (index) {
            		// Get the position of the item at index 'index', and scroll to it
            		var item = this.items[index].element.parentNode;
            		var listMargin = parseInt(this.$scrollSurface.css("marginLeft"));
            		var itemMargin = parseInt($(item).css("marginLeft"));
            		if (this.layout.horizontal)
            			this.scrollPosition = item.offsetLeft + listMargin - itemMargin;
            		else
            			this.scrollPosition = item.offsetTop;
            	}
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.UI.Popups.UICommand.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.UI.Popups.UICommand
//
//		Implementation of the Windows.UI.Popups.UICommand object
//
//		MSDN: http://msdn.microsoft.com/library/windows/apps/BR242166
//

WinJS.Namespace.define("Windows.UI.Popups", {

    // ================================================================
    //
    // public Object: Windows.UI.Popups.UICommand
    //
    UICommand: WinJS.Class.define(

		// ================================================================
		//
		// public function: Windows.UI.Popups.UICommand constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/br242179
		//	
        function (label, action, commandId) {

            this._label = label;
            this._invoked = action;
            this._id = commandId;
        },

		// ================================================================
		// Windows.UI.Popups.UICommand Member functions
		// ================================================================

		{
		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.id
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.id
		    //	
		    _id: 0,
		    id: {
		        get: function () {
		            return this._id;
		        },
		        set: function (value) {
		            this._id = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.invoked
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.invoked
		    //	
		    _invoked: 0,
		    invoked: {
		        get: function () {
		            return this._invoked;
		        },
		        set: function (value) {
		            this._invoked = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.label
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.label
		    //	
		    _label: 0,
		    label: {
		        get: function () {
		            return this._label;
		        },
		        set: function (value) {
		            this._label = value;
		        }
		    }
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.UI.Popups.MessageDialog.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.UI.Popups.MessageDialog
//
//		Implementation of the Windows.UI.Popups.MessageDialog object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog
//

WinJS.Namespace.define("Windows.UI.Popups", {

    // ================================================================
    //
    // public Object: Windows.UI.Popups.MessageDialog
    //
    MessageDialog: WinJS.Class.define(

		// ================================================================
		//
		// public function: Windows.UI.Popups.MessageDialog constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.messagedialog.aspx
		//	
        function (content, title) {

            /*DEBUG*/
            // Parameter validation
            if (!content)
                console.error("Windows.UI.Popups.MessageDialog constructor: Undefined or null content specified");
            /*ENDDEBUG*/

            this._content = content;
            this._title = title;
            this._commands = new Windows.Foundation.Collections.IVector();
        },

		// ================================================================
		// Windows.UI.Popups.MessageDialog Member functions
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: Windows.UI.Popups.MessageDialog.showAsync
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.showasync.aspx
		    //	
		    showAsync: function () {
		        var that = this;
		        return new WinJS.Promise(function (onComplete) {

		            // Get the highest z-index item, and place the dialog one higher
		            var highestZ = blueskyUtils.getHighestZIndex();

		            // Create the translucent overlay that appears behind the dialog
		            var $overlay = $("<div style='width:100%;height:100%;background-color:#000;opacity:.5;z-index:" + (highestZ + 1) + "'></div>");
		            $overlay.fadeIn("fast").appendTo("body");

		            // Create the messagebox div
		            var messageHeight = that.title ? 200 : 160;
		            var messageTop = ($("html").outerHeight() - messageHeight) / 2;
		            var $message = $("<div></div>")
                        .css({
                            "width": "100%",
                            "background-color": "#fff",
                            "z-index": highestZ + 2,
                            "left": 0,
                            "position": "absolute",
                            "top": messageTop,
                            "height": messageHeight,
                            "right": 0
                        });
		            // TODO: Do the margin trick so that the messagebox stays vertically centered.

		            // TODO: Make sure < in content doesn't break!
		            var $titleText = $("<div>" + that.content + "</div>")
                        .css({
                            "color": "#000",
                            "font-size": "16pt",
                            "position": "absolute",
                            "top": that.title ? 80 : 20,
                            "left": "400px"
                        })
                        .appendTo($message);

		            if (that.title) {
		                // TODO: Make sure < in title doesn't break!
		                var $titleText = $("<div>" + that.title + "</div>")
                            .css({
                                "color": "#000",
                                "font-size": "30pt",
                                "position": "absolute",
                                "top": 20,
                                "left": "400px"
                            })
		                    .appendTo($message);
		            }

		            // Add commands.  If none specified then use 'Close'
		            if (that.commands.size() == 0) {
		                var closeCommand = new Windows.UI.Popups.UICommand("Close");
		                that.commands.append(closeCommand);
		            }

		            var buttonStart = 1300 - that.commands.size() * 200;
		            for (var i = 0; i < that.commands.size() ; i++) {
		                var command = that.commands.getAt(i);
		                var backgroundColor = i == that.defaultCommandIndex ? "rgba(53,206,251,1)" : "#ccc";
		                var border = i == that.defaultCommandIndex ? "solid 3px #000" : "solid 3px #ccc";
		                var left = buttonStart + i * 200;
		                var $commandButton = $("<div>" + command.label + "</div>")
                        .css({
                            "color": "#000",
                            "background-color": backgroundColor,
                            "border": border,
                            "width": "150px",
                            "cursor": "pointer",
                            "padding": "8px 6px",
                            "font-size": "12pt",
                            "font-weight": "600",
                            "position": "absolute",
                            "text-align": "center",
                            "top": that.title ? 130 : 80,
                            "left": left
                        })
		                .appendTo($message);
		                $commandButton.bind("click", { command: command }, function (event) {
		                    if (event.data.command.invoked)
		                        event.data.command.invoked(event.data.command);
		                    that._close(event.data.command);
		                });
		            }
                    // If we created a temporary 'close' command, then remove it now
		            if (closeCommand)
		                that.commands.clear();

		            $message.fadeIn("fast").appendTo("body");

		            that._$message = $message;
		            that._$overlay = $overlay;

		            // Complete the promise when the dialog closes...
		            that._onClosedPromise = onComplete;
		        });
		    },


		    // ================================================================
		    //
		    // private function: Windows.UI.Popups.MessageDialog._close
		    //
		    //		Called after a button has been pressed and the messagebox should go away.  When done, fulfill our closed promise.
		    //	
		    _close: function (command) {

		        var that = this;
		        this._$overlay.fadeOut("fast", function () {
		            that._$overlay.remove();
		        });
		        this._$message.fadeOut("fast", function () {
		            that._$message.remove();

		            // TODO (CLEANUP): technically the overlay may still be present when we fulfill the closed promise - should really 
                    // join the two fadeout promises together and wait for that before fulfilling our closed promise.
		            that._onClosedPromise(command);
		        });

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.defaultCommandIndex
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.defaultcommandindex.aspx
		    //	
		    _defaultCommandIndex: 0,
		    defaultCommandIndex: {
		        get: function () {
		            return this._defaultCommandIndex;
		        },
		        set: function (value) {
		            this._defaultCommandIndex = value;
		        }

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.cancelCommandIndex
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.cancelcommandindex.aspx
		    //	
		    _cancelCommandIndex: -1,
		    cancelCommandIndex: {
		        get: function () {
		            return this._cancelCommandIndex;
		        },
		        set: function (value) {
		            this._cancelCommandIndex = value;
		        }

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.commands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.commands.aspx
		    //	
		    _commands: null,
		    commands: {
		        get: function () {
		            return this._commands;
		        },
		        set: function (value) {
		            this._commands = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.content
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.content.aspx
		    //	
		    _content: "",
		    content: {
		        get: function () {
		            return this._content;
		        },
		        set: function (value) {
		            this._content = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.options
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.options.aspx
		    //	
		    _options: {},
		    options: {
		        get: function () {
		            return this._options;
		        },
		        set: function (value) {
		            this._options = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.title
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.title.aspx
		    //	
		    _title: "",
		    title: {
		        get: function () {
		            return this._title;
		        },
		        set: function (value) {
		            this._title = value;
		        }
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
//                    File: blueskySettings.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Bluesky
//
var Bluesky = {

	Settings: {

		// ================================================================
		//
		// Setting value: ProxyCrossDomainXhrCalls
		//
		//      See the WinJS.xhr code for the what and the why behind this setting.  In short:
		//			* If true then WinJS.xhr proxies requests through YQL to enable Cross-domain 
		//			  requests (as the Win8 LocalContext allows).  
		//			* If false then WinJS.xhr uses standard XMLHttpRequest, which doesn't work cross-domain
		//			  but is better/faster if you don't need it.
		//
		//		We default to true (do proxy through YQL) to enable fast bring-up of Win8 apps in bluesky.
		//
		ProxyCrossDomainXhrCalls: true
	}
};








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
    // public function: blueskyUtils.getHighestZIndex
    //
    //      Returns the highest z-index of all elements.  Useful to add DOM elements above all others (e.g. modal dialog box)
    //
    getHighestZIndex: function () {

        var highestIndex = 0;
        $("[z-index]").each(function () {
            highestIndex = Math.max(highestIndex, $(this).attr("z-index"));
        });
        return highestIndex;
    },


    // ================================================================
    //
    // public function: blueskyUtils.setDOMElementUniqueId
    //
    //      Assigns a unique (to the current DOM) id to the specified element
    //
    _uniqueControlId: 1,
    setDOMElementUniqueId: function(element) {
        // TODO (PERF): Do this without wrapping in $
        $(element).attr("id", "_bs" + (this._uniqueControlId++));
    },


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

		// Trim trailing semicolons
		if (dataBindString[dataBindString.length - 1] == ";")
			dataBindString = dataBindString.substring(0, dataBindString.length - 1);

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

// Add easeOut easing
jQuery.extend(jQuery.easing,
{
    def: 'easeOut',
    easeOut: function (x, curTime, startValue, deltaValue, elapsedTime) {
        curTime = curTime / elapsedTime - 1;
        return startValue + deltaValue * curTime * curTime * curTime * curTime * curTime + 1;
    }
});

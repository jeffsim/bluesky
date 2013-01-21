/* Copyright 2012, Bluesky LLC (www.bluesky.io)
* This Source Code Form is subject to the terms of a commercial license
* If you have no signed a license with Bluesky LLC for use of this code please contact sales@bluesky.io
* If you have questions, ideas or feedback please contact info@bluesky.io
*/

"use strict";

// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //


if (!console) {
    var console = {
        log: function () { },
        warn: function () { },
        error: function () { }
    };
};

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
			/*ENDDEBUG*/

			return WinJS.Namespace.defineWithParent(window, name, members);
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
			if (!member)
				continue;

			// Getters and setters are managed as regular properties
			if (typeof member === "object" && (typeof member.get === "function" || typeof member.set === "function")) {

			    member.enumerable = true;

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
    _strictProcessing: false,
	strictProcessing: function () {

        // NOTE: THIS FUNCTION HAS BEEN DEPRECATED.  Remove after Win8 RTM
	    this._strictProcessing = true;
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
//	
WinJS.Namespace.define("WinJS", {

    // ================================================================
    //
    // public function: WinJS.xhr
    //
    //   ABOUT THIS FUNCTION:
    //   First, read the explanation above concerning CORS and proxying XHR
    //   We have two models for xhr:
    //  	1.  One is the "proper" approach, which mimics Win8's and uses XMLHttpRequest and is all full of goodness,
    //  		except for the fact that it won't work cross-domain, and so a slew of LocalContext win8 apps would fall over.
    //  	2.  The other is the "fast prototype" approach, which uses jQuery and the Bluesky proxy to allow cross-domain and is all full of goodness,
    //  		except for the fact that it's ugly and pained and introduces additional layers into xhr request.
    //  
    //   At this stage of bluesky, we're more interested in enabling quick win8-->web ports, so we use the second approach as the default
    //   (with a console warning that it's just a polyfill), and enable developers to opt-in to the "Real" xhr through a Bluesky setting/override.
    //   This (a) allows win8 apps to work without change, and (b) allows developers to use the 'real' model when they're good and ready.
    //
    xhr: function (options) {

        var request;
        var requestType = (options && options.type) || "GET";
        var dataType = (options && options.dataType) || "json";  // TODO: What's Win8's default?

        // The following code is the second approach described above - proxy calls through YQL to enable cross-domain
        return new WinJS.Promise(function (onComplete, onError, onProgress) {

            var url = options.url;
            var urlLower = url.toLowerCase();

            // Check if it's same-domain; strip host path if so
            var sitePath = document.location.protocol + "//" + document.location.host;
            if (urlLower.indexOf(sitePath) == 0) {
                url = url.substr(sitePath.length);
                urlLower = urlLower.substr(sitePath.length);
            }

            // Determine if the url is local or not
            var isLocal = Bluesky.IsLocalExecution || !(urlLower.indexOf("http:") == 0 && urlLower.indexOf("localhost") == -1);

            // test for bypass 
            var isBypass = Bluesky.Settings.ProxyBypassUrls.contains(url);

            // If dataType not specified then try to set it ourselves.
            // TODO (CLEANUP): Do I really need to do this?  
            if (!options.dataType) {
                if (urlLower.indexOf(".xml") >= 0)
                    dataType = "xml";
                else if (urlLower.indexOf(".html") >= 0)
                    dataType = "html";
                else if (urlLower.indexOf(".json") >= 0)
                    dataType = "json";
                else if (urlLower.indexOf(".js") >= 0)
                    dataType = "script";
                else
                    dataType = "text";
            }

            // convert appdata references to filepath
            // TODO (CLEANUP): Do all of these more generically as they have multiple touchpoints in bluesky
            url = url.replace("ms-appx:///", "/");
            url = url.replace("ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase(), "");

            // Remove '///' from remote urls; remove "file:///" from local urls.
            if (Bluesky.IsLocalExecution)
                url = url.replace("file:///", "");
            else
                url = url.replace("///", "/");

            // If this isn't a local request, then run it through the proxy to enable cross-domain
            if (isBypass) {

                // if format and callback aren't set add each individually
                if (urlLower.indexOf("format=") == -1)
                    url = blueskyUtils.appendQueryStringParam(url, "format=json");
                if (urlLower.indexOf("callback=") == -1 && urlLower.indexOf("jsonp=") == -1)
                    url = blueskyUtils.appendQueryStringParam(url, "callback=?");
                dataType = "jsonp";
            }

            // Determine if we should go through the bluesky proxy
            var isProxied = !isLocal && !isBypass && Bluesky.Settings.ProxyCrossDomainXhrCalls;

            if (isProxied) {

                // Run the URL through our proxy on the bluesky server, where we can access cross
                // domain resources with wild abandon.
                url = "http://bluesky.io:8080/_p?" + encodeURIComponent(url);

                // $.ajax appears to automatically convert any POSTs to GETs when JSONP is involved;
                // but we need to know on the server side if it's a POST, so send that info up.
                if (requestType == "POST")
                    url += "&__post=1";
                dataType = "jsonp";
            }

            // Handle custom request initialize if specified
            // TODO: We're not using XMLHttpRequest, so we can't really pass it here!  Not sure what to do, short of
            // refactoring all of this to use XMLHttpRequest :P
            var fakeHttpRequest = null;
            if (options.customRequestInitializer)
                options.customRequestInitializer(fakeHttpRequest);

            // TODO: Progress
            var responseData;
            $.ajax(url, {
                data: options.data,
                dataType: dataType,
                type: requestType,
                headers: options.headers,
                success: function (data, textStatus, jqXHR) {
                    var response, responseText, responseXML;
                    // TODO: I haven't tested these since the inclusion of the bluesky proxy.
                    // TODO (CLEANUP): Ick.
                    if (data && data.firstChild) {
                        responseText = "";
                        responseXML = data;
                    } else {
                        responseText = data.status || data;
                        responseXML = null;
                    }
                    //                    if (!isProxied && data)
                    //                      responseText = JSON.stringify(data);
                    if (isProxied) {
                        // Try to convert the response into an XML object
                        var parser = new DOMParser();
                        try {
                            responseXML = parser.parseFromString(data, "application/xml");
                        } catch (ex) {
                            responseXML = null;
                        }
                    }
                    onComplete({
                        responseType: "",
                        responseText: responseText,
                        responseXML: responseXML,
                        data: data.data || data,
                        response: responseText,
                        readyState: jqXHR.readyState,
                        DONE: 4,
                        statusText: jqXHR.statusText == "success" ? "OK" : jqXHR.statusText,
                        status: jqXHR.status
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // TODO: all return flags.
                    // TODO: Support other errors
                    if (jqXHR.status == 403) {
                        onError({ number: 2 });
                    } else if (jqXHR.status == 404)
                        onError({ number: -2146697211 });	// Win8's 404 error code
                    else
                        onError({ number: 1 });	// TODO: What to do here?
                }
            });
        });
    }
    /* OLD VERSION
    xhr: function (options) {

        var request;
        var requestType = (options && options.type) || "GET";
        var dataType = (options && options.dataType) || "json";  // TODO: What's Win8's default?

        // The following code is the second approach described above - proxy calls through Bluesky to enable cross-domain
        return new WinJS.Promise(function (onComplete, onError, onProgress) {

            var url = options.url;
            var urlLower = url.toLowerCase();

            // Determine if the url is local or not
            // TODO: Check if it's same-domain and don't proxy if so
            var isLocal = urlLower.indexOf("http:") != 0 || urlLower.indexOf("localhost") != 0;

            // test for bypass 
            var isBypass = Bluesky.Settings.ProxyBypassUrls.contains(url);

            // convert appdata references to filepath
            url = url.replace("ms-appx:///", "/");
            url = url.replace("ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase(), "");

            // If this isn't a local request, then run it through the proxy to enable cross-domain
            if (isBypass) {

                // if format and callback aren't set add each individually
                if (urlLower.indexOf("format=") == -1)
                    url = blueskyUtils.appendQueryStringParam(url, "format=json");
                if (urlLower.indexOf("callback=") == -1 && urlLower.indexOf("jsonp=") == -1)
                    url = blueskyUtils.appendQueryStringParam(url, "callback=?");
                dataType = "jsonp";
            }

            // Determine if we should go through the YQL proxy
            var isYql = !isLocal && !isBypass && Bluesky.Settings.ProxyCrossDomainXhrCalls;
            if (isYql) {
                url = "http://query.yahooapis.com/v1/public/yql?q=use%20%22http%3A%2F%2Fbluesky.io%2Fyqlproxy.xml" +
                              "%22%20as%20yqlproxy%3Bselect%20*%20from%20yqlproxy%20where%20url%3D%22" + encodeURIComponent(url) +
                              "%22%3B&format=json&callback=?";
                dataType = "jsonp";
            }

            // TODO: Progress
            var responseData;
            $.ajax({
                url: url,
                data: options.data,
                dataType: dataType,
                type: requestType,
                success: function (data, textStatus, jqXHR) {
                    if (isYql) {
                        // Since we're using YQL, data contains the XML Document with the result. Extract it
                        if (!data)
                            data = $.parseJSON(jqXHR.responseText);
                        if (!data)
                            data = "";

                        if (data.query) {
                            var response = data.query.results;
                            if (response) {
                                var responseText = response.result || null;
                                // Parse the JSON object response into an xml object
                                var responseXML = "<xml>" + _JSONtoXML(response) + "</xml>";

                                // Convert the xml string into an object
                                var parser = new DOMParser();
                                var responseXML = parser.parseFromString(responseXML, "application/xml");

                                // TODO: Still need this? YQL was passing content/type pairs for some reason.
                                $("type", responseXML).remove();
                            } else {
                                response = "";
                                responseText = "";
                                responseXML = null;
                            }
                        } else if (data.firstChild) { // IE9 doesn't recognize "data instanceof XMLDocument", so use this instead
                            responseXML = data;
                            response = "";
                            responseText = "";
                        } else {
                            var response = data;
                            responseText = data;
                            responseXML = null;
                        }
                    }
                    else {
                        if (data && data.firstChild) {
                            responseXML = data;
                            response = "";
                            responseText = "";
                        } else {
                            responseData = (data && data.data) || data;
                            response = data;
                            responseText = data.status;
                            responseXML = null;
                        }
                    }

                    onComplete({
                        responseType: "",
                        responseText: responseText,
                        responseXML: responseXML,
                        data: responseData,
                        readyState: 4,
                        DONE: 4,
                        statusText: jqXHR.statusText == "success" ? "OK" : jqXHR.statusText,
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
                }
            });
        });
    }*/
});


// ================================================================
//
// private function _JSONtoXML
//
//		The YQL proxy that we're using for WinJS.xhr returns XML data as JSON objects; we need to convert it
//		to an XMLDocument since that's what WinJS.xhr return.
//
//		Original source: http://ruchirawageesha.blogspot.com/2011/06/xml-to-json-and-json-to-xml-conversion.html
//
function _JSONtoXML(json) {

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
        } else {
            child = child || "";
            return "<" + lname + "><![CDATA[" + child + "]]></" + lname + ">";

            //var escaped = child.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");//.replace("\r", "").replace("\n", "");
            //escaped = escaped.replace(/\r/g, "").replace(/\n/g, "");
            //return "<" + lname + ">" + escaped + "</" + lname + ">";
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
                // TODO (CLEANUP): Move this into separate namespace define so I can use the full enum
                value: 0//Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape,
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
            },
            InputPane: {
                getForCurrentView: function () {
                    return {
                        addEventListener: function () {
                        }
                    }
                }
            }
        },


        // ================================================================
        //
        // Windows.UI.StartScreen
        //
        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        StartScreen: {

            SecondaryTile: {
                exists: function () {
                    return false;
                },

                smallLogo: null,

                requestCreateForSelectionAsync: function (rect) {
                    return new WinJS.Promise(function (c) { c(false); });
                }
            },

            TileOptions: {
                none: 0,
                showNameOnLogo: 1,
                showNameOnWideLogo: 2,
                copyOnDeployment: 4
            }
        },


        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        Input: {
            Inking: {
                InkManager: WinJS.Class.define(function () {
                }, {
                    mode: 0,
                    processPointerDown: function (c) {
                    },
                    getStrokes: function () {
                        return [];
                    },
                    deleteSelected: function () {
                    },
                    updateRecognitionResults: function () {
                    },
                    selectWithLine: function () {
                    },
                    copySelectedToClipboard: function () {
                    },
                    pasteFromClipboard: function () {
                    },
                    recognizeAsync: function () {
                        return new WinJS.Promise(function (c) { c(); });
                    },
                    getRecognizers: function () {
                        return [];
                    }
                }, {

                    InkManipulationMode: {
                        selecting: 0,
                        erasing: 1,
                        inking: 2
                    }
                })
            },

            //		TODO: Stubbed out for test purposes
            //
            //		NYI NYI NYI
            //
            GestureRecognizer: WinJS.Class.define(function () { }, {
                addEventListener: function () {
                },
                removeEventListener: function () {
                }
            }),

            //		TODO: Stubbed out for test purposes
            //
            //		NYI NYI NYI
            //
            GestureSettings: {
                manipulationRotate: 1,
                manipulationTranslateX: 2,
                manipulationTranslateY: 3,
                manipulationScale: 4,
                manipulationRotateInertia: 5,
                manipulationScaleInertia: 6,
                manipulationTranslateInertia: 7,
                tap: 8
            }
        },

        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        ColorHelper: {
            fromArgb: function (a, r, g, b) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
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
        },
        Printing: {
            PrintManager: {
                getForCurrentView: function () {
                    return {};
                }
            }
        }
    },


    // ================================================================
    //
    // Windows.Data
    //
    //		TODO: Stubbed out for test purposes
    //
    //		NYI NYI NYI
    //
    Data: {
        Xml: {
            Dom: {
                XmlDocument: function () {
                    var p = new DOMParser();

                    // TODO (CLEANUP): XMLDocument has a loadXml which is equivalent to parseFromString... but this is ugly. I
                    // imagine I should be created a document here, not a parser...
                    p.loadXml = function (str) {
                        this._str = str;
                        return this.parseFromString(str, "text/xml");
                    }
                    p.getXml = function () {
                        return this._str;
                    }
                    return p;//.parseFromString("", "text/xml");
                }
            }
        }
    }
});


// ================================================================
//
// MSApp.execUnsafeLocalFunction
//
//      TODO (Cleanup): Move this to dedicated file
//
if (!window.MSApp) {
    window.MSApp = {
        execUnsafeLocalFunction: function (c) { return c(); }
    };
}








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
        this.absoluteUri = uri; // TODO
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
    IVectorView: WinJS.Class.derive(Array, function () {
        // constructor
    }, {
        // members
        getAt: function (i) {
            return this[i];
        },
        getMany: function (startIndex) {
            return this.slice(startIndex);
        },
        indexOf: function (item) {
            return this.indexOf(item);
        },
        size: {
            get: function () { return this.length; }
        }
    })
});


// =========================================================
//
// Implementation of Windows.Foundation.Collections.IMapView
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IMapView: WinJS.Class.derive(Object, function () {
        // constructor
    }, {
        // members
        size: {
            get: function () { return this.length; }
        },

        hasKey: function (key) {
            return this[key] !== undefined;
        },

        lookup: function (key) {
            if (this[key] === undefined)
                return undefined;

            return this[key];

            /* TODO: Following code trips up when 'values' object in ApplicationData.  To repro, uncomment and run applicationdata sdk sample app, scenario 3
                     For now we just return the original object, which should work for majority of cases.

            // lookup appears to clone objects on win8 so... so do we.
            //     var clonedObject = jQuery.extend(true, {}, this[key]);
            // var clonedObject = JSON.parse(JSON.stringify(this[key]))
            // See following for why this approach: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
            // I didn't use Resig's approach because if this[key] is a string (which it often is), then it creates a new object for every character...
            //  I also didn't use the parse/stringify approach as outlined since it can hit cyclic errors
            var seen = [];
            var clonedObject = JSON.parse(JSON.stringify(this[key], function (key, val) {
                if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return undefined;
                    seen.push(val);
                }
                return val;
            }));

            return clonedObject;
            */
        },

        split: function (first, second) {
            console.warn("bluesky NYI: IMapView.split");
        }
    })
});


// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVector
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVector: WinJS.Class.derive(Windows.Foundation.Collections.IVectorView, function () {
    },
    {
        // TODO (CLEANUP): Function header comment blocks

        // MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br206632.aspx
        append: function (value) {
            this.push(value);
        },


        clear: function () {
            this.length = 0;
        },


        getView: function () {
            console.error("IVector.getView NYI");
        },

        insertAt: function (index, item) {
            return this.splice(index, 0, item);
        },
        removeAt: function (index) {
            this.splice(index, 1);
        },
        removeAtEnd: function () {
            return this.pop();
        },
        replaceAll: function (newItems) {
            this.clear();
            newItems.forEach(function (item) {
                this.append(item);
            });
        },
        setAt: function (index, item) {
            if (index < this.length)
                this[index] = item;
        },
    })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.ApplicationModel.js
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
    // Windows.ApplicationModel
    //
    //		This is the root Windows.ApplicationModel namespace/object
    //
    //		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    ApplicationModel: {
        IsBluesky: true,
        Activation: {
            ActivationKind: {
                launch: 0
            },

            ApplicationExecutionState: {
                terminated: 0
            }
        },
        DataTransfer: {
            DataTransferManager: {
                getForCurrentView: function () {
                    return {
                        addEventListener: function () {
                        }
                    }
                }
            }
        },

        Search: {
            SearchPane: {
                getForCurrentView: function () {
                    return {
                        addEventListener: function () {
                        }
                    }
                }
            }
        },

    },

});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.ApplicationModel.Package.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //


// ================================================================
//
// Windows.ApplicationModel.Package
//
WinJS.Namespace.define("Windows.ApplicationModel.Package", {

    // =========================================================
    //
    // public member: Windows.ApplicationModel.Package
    //
    //      MSDN: TODO
    //
    _current: null,
    current: {
        get: function () {
            if (!this._current)
                this._current = new Windows.ApplicationModel._package();
            return this._current;
        }
    }
});


// ================================================================
//
// Windows.ApplicationModel._package
//
// This is the root Windows namespace/object
//
WinJS.Namespace.define("Windows.ApplicationModel", {

    // =========================================================
    //
    // private class: Windows.ApplicationModel._package
    //
    _package: WinJS.Class.define(

        function () {
            
            this.installedLocation = null;

            // TODO: What should these values be?
            this.id = {
                version: {
                    major: 0,
                    minor: 0,
                    build: 0,
                    revision: 0
                },
                architecture: "web",
                resourceId: "100",
                publisher: "bluesky",
                publisherId: "200",
                name: "testApp",
                fullName: "testApp",
                familyName: "testApp_Family",
                isFramework: false
            };
        },

        // ================================================================
        // Windows.Storage.ApplicationData.Package members
        // ================================================================

        {
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // =========================================================
    //
    // Private initializer: Windows.Storage._internalInit
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileattributes.aspx
    //
    _internalInit: function () {

        // Initialize the store for all persistent data.
        // NOTE: In some cases, localStorage is giving an access denied error in IE10 see http://stackoverflow.com/questions/13102116/access-denied-for-localstorage-in-ie10
        // Our workaround: try localStorage - if that doesn't work then fall back to session storage.
        // TODO: Roll this into a larger downlevel-support module and provide developer with options.
        Bluesky.dataStore = window.localStorage;

        try {
            Bluesky.dataStore.getItem('test__bluesky');
        } catch (ex) {
            // Failed to call getItem; fallback to session storage
            console.warn("Bluesky warning: this browser's local storage is not accessible; falling back to session storage instead.");
            Bluesky.dataStore = window.sessionStorage;
        }

        // Create the known folders
        var appData = Windows.Storage.ApplicationData.current;

        // TODO: Create all known folders
        // TODO: What to do with them?  I'm creating them here so that apps that assume their existence don't break; but 
        //       I'm not actually running filters (etc) against them.
        this.KnownFolders.documentsLibrary = new Windows.Storage.StorageFolder(appData.localFolder, "documents");
        this.KnownFolders.homeGroup = new Windows.Storage.StorageFolder(appData.localFolder, "homegroup");
        this.KnownFolders.picturesLibrary = new Windows.Storage.StorageFolder(appData.localFolder, "pictures");

        // Initialize the CachedFileManager for roaming files.
        // TODO: Uncomment this when roaming is enabled
        // Windows.Storage.CachedFileManager.init();
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.FileAttributes
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileattributes.aspx
    //
    FileAttributes: {
        normal: 0,
        readonly: 1,
        directory: 16,
        archive: 32,
        temporary: 256
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.CreationCollisionOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.creationcollisionoption.aspx
    //
    CreationCollisionOption: {
        generateUniqueName: 0,
        replaceExisting: 1,
        failIfExists: 2,
        openIfExists: 3
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.NameCollisionOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.namecollisionoption.aspx
    //
    NameCollisionOption: {
        generateUniqueName: 0,
        replaceExisting: 1,
        failIfExists: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.ApplicationDataLocality
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatalocality.aspx
    //
    ApplicationDataLocality: {
        local: 0,
        roaming: 1,
        temporary: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.ApplicationDataCreateDisposition
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacreatedisposition.aspx
    //
    ApplicationDataCreateDisposition: {
        always: 0,
        existing: 1
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.StorageDeleteOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagedeleteoption.aspx
    //
    StorageDeleteOption: {
        default: 0,
        PermanentDelete: 1
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.StorageItemTypes
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storageitemtypes.aspx
    //
    StorageItemTypes: {
        none: 0,
        file: 1,
        folder: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.FileAccessMode
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileaccessmode.aspx
    //
    FileAccessMode: {
        read: 0,
        readWrite: 1
    },


    // =========================================================
    //
    // Public class: Windows.Storage.KnownFolders
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.knownfolders.aspx
    //
    KnownFolders: {},
});









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.ApplicationData.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.ApplicationData
//
//		MSDN: TODO
//
//      Good writeup on the challenge behind local storage in browsers: http://hacks.mozilla.org/2012/03/there-is-no-simple-solution-for-local-storage/
//      tbd: short term, using localStorage for this.  There are issues with this (see previous link; plus, unclear limitations on storage amount across subdomains) -
//      however, it *will* run on practically every browser (see http://caniuse.com/#search=localstorage).  Mid-term, we should consider moving to a DB (mainly for
//      asynchronicity and perf), although there's not cross-browser standard there (e.g. indexedDb not supported on IE9).  Long-term, the new HTML5 file API makes sense,
//      but it's nowhere near cross-browser yet.  So; net net, we go with localStorage, with all its warts, for now.
//
WinJS.Namespace.define("Windows.Storage.ApplicationData", {

    // =========================================================
    //
    // public member: Windows.Storage.ApplicationData.current
    //
    //      MSDN: TODO
    //
    _current: null,
    current: {
        get: function () {
            if (!this._current)
                this._current = new Windows.Storage._applicationData();
            return this._current;
        }
    }
});


WinJS.Namespace.define("Windows.Storage", {

    // =========================================================
    //
    // private class: Windows.Storage.ApplicationData._applicationData
    //
    //      Encapsulates Windows.Storage.ApplicationData members in singleton 'current' above
    //
    _applicationData: WinJS.Class.define(

        function () {


            // Build the top-level root folder which will hold all other folders
            // TODO: Define correct root folder structure.  Mimic'ing Win8's for now
            this._rootFolder = new Windows.Storage.StorageFolder(null, "/Users/UserId");

            // Create the app folder
            this._appFolder = new Windows.Storage.AppXFolder(null, "");

            // TODO: I'm reusing the AppXFolder object for subfolders as well, so I can't set name/etc in the constructor
            this._appFolder.name = "AppX";
            this._appFolder.displayName = "AppX";
            this._appFolder.folderRelativeId = "0/0/AppX";

            var curPackage = Windows.ApplicationModel.Package.current;
            curPackage.installedLocation = this._appFolder;

            var builtInFolderRoot = "/Users/UserId/AppData/Local/Packages/" + curPackage.id.familyName + "/";

            // Create the local folder
            this.localFolder = new Windows.Storage.StorageFolder(this._rootFolder, "LocalState");
            this.localFolder.folderRelativeId = "0/0/" + this.localFolder.name;
            this.localFolder.path = builtInFolderRoot + "LocalState";
            this.localFolder._initMFT();

            // Create the temporary folder
            // TODO (CLEANUP): tempfolder should move to sessionStorage instead of localStorage, or at least be tracked
            // and periodically dumped.  Lack of ability to tell localStorage usage is... problemsome :P.
            this.temporaryFolder = new Windows.Storage.StorageFolder(this._rootFolder, "TempState");
            this.temporaryFolder.folderRelativeId = "0/0/" + this.temporaryFolder.name;
            this.temporaryFolder.path = builtInFolderRoot + "TempState";
            this.temporaryFolder._initMFT();

            // Create the roaming folder used to proxy all remote files
            this.roamingFolder = new Windows.Storage.StorageFolder(this._rootFolder, "RoamingState");
            this.roamingFolder.folderRelativeId = "0/0/" + this.roamingFolder.name;
            this.roamingFolder.path = builtInFolderRoot + "RoamingState";
            this.roamingFolder.isRoaming = true;
            this.roamingFolder._initMFT();

            // Create the settings containers
            this.roamingSettings = new Windows.Storage.ApplicationDataContainer("", Windows.Storage.ApplicationDataCreateDisposition.always);
            this.roamingSettings.locality = Windows.Storage.ApplicationDataLocality.roaming;

            this.localSettings = new Windows.Storage.ApplicationDataContainer("", Windows.Storage.ApplicationDataCreateDisposition.always);
            this.localSettings.locality = Windows.Storage.ApplicationDataLocality.local;

            // TODO (LATER): Create a page cache folder for apploader/cached apps.
            // appData._pageCacheFolder = new Windows.Storage.StorageFolder(appData._rootFolder, "pageCache");

            // mimic win8's roaming storage quota
            this.roamingStorageQuota = 100;

            // Start at version 0
            // TODO: Read this from the store?
            this.version = 0;
        },

        // ================================================================
        // Windows.Storage.ApplicationData._applicationData members
        // ================================================================

        {
            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.clearAsync
            //
            //		MSDN: TODO
            //
            clearAsync: function (locality) {
                var that = this;
                return new WinJS.Promise(function (c) {
                    var promises = [];
                    // clear localFolder
                    // TODO (PERF): Instead of enumerating this way, just blow away the folder's MFT (being sure to clear from localStorage!)
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.local)
                        promises.push(that.localFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // clear temporaryFolder
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.temporary)
                        promises.push(that.temporaryFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // clear roamingFolder
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.roaming)
                        promises.push(that.roamingFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // Wait until everything's deleted
                    WinJS.Promise.join(promises).then(function () {
                        c();
                    });
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.setVersionAsync
            //
            //		MSDN: TODO
            //
            setVersionAsync: function (newVersion, setVersionEventHandler) {
                return new WinJS.Promise(function (c) {
                    setVersionEventHandler({
                        currentVersion: Windows.Storage.ApplicationData.current.version, desiredVersion: newVersion
                    });
                    Windows.Storage.ApplicationData.version = newVersion;
                    c();
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.addEventListener
            //
            //		MSDN: TODO
            //
            addEventListener: function () {
                console.warn("bluesky fyi: Windows.Storage.ApplicationData.addEventListener is NYI");
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.removeEventListener
            //
            //		MSDN: TODO
            //
            removeEventListener: function () {
                console.warn("bluesky fyi: Windows.Storage.ApplicationData.removeEventListener is NYI");
            },
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.ApplicationDataContainer.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.ApplicationDataContainer
//
//		MSDN: TODO
//

WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.ApplicationData
    //
    ApplicationDataContainer: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.ApplicationDataContainer constructor
        //
        //      MSDN: TODO
        //
        function (name, disposition) {

            this.name = name;

            // TODO: Support disposition

            // TODO: If this container already exists, then open it instead of initializing with empty values
            //       Need to figure out persistence model first.
            this.containers = new Windows.Foundation.Collections.IMapView();
            this.values = new Windows.Storage.ApplicationDataContainerSettings();
        },

	    // ================================================================
	    // Windows.Storage.ApplicationDataContainer members
	    // ================================================================

        {
            // =========================================================
            //
            // public function: Windows.Storage.ApplicationDataContainer.createContainer
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacontainer.createcontainer.aspx
            //
            createContainer: function (name, disposition) {

                // Create the new container
                var newContainer = new Windows.Storage.ApplicationDataContainer(name, disposition);

                // Assign it to us with our locality
                newContainer._parentContainer = this;
                newContainer.locality = this.locality;

                // Win8 does not allow multiple subcontainers with the same name, so we can use a map (for quicker lookup later) here.
                this.containers[name] = newContainer;

                // Persist in file system
                Bluesky.dataStore.setItem("adc_" + name, JSON.stringify({ "parent": this.name }));

                // return the newly created container
                return newContainer;
            },


            // =========================================================
            //
            // public function: Windows.Storage.ApplicationDataContainer.deleteContainer
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacontainer.deletecontainer.aspx
            //
            deleteContainer: function (name) {
                
                // Remove from filesystem
                Bluesky.dataStore.removeItem("adc_" + name);

                delete this.containers[name];
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.ApplicationDataContainerSettings.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.ApplicationDataContainerSettings
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    ApplicationDataCompositeValue: WinJS.Class.derive(Object, null,null),


    // ================================================================
    //
    // public Object: Windows.Storage.ApplicationDataContainerSettings
    //
    ApplicationDataContainerSettings: WinJS.Class.derive(Windows.Foundation.Collections.IMapView,

        // =========================================================
        //
        // public function: Windows.Storage.ApplicationDataContainerSettings constructor
        //
        function () {

            // TODO: Read our values from store, once persistence model is figured out.
            //       (NOTE: Read doesn't happen here...)
        },

	    // ================================================================
	    // Windows.Storage.ApplicationDataContainerSettings members
	    // ================================================================

        {
            remove: function (key) {
                delete this[key];
            },

            insert: function (key, value) {
                this[key] = value;
            },

            clear: function () {
                for (var i in this)
                    if (this.hasOwnProperty(i))
                        delete this[i];
            },

            getView: function () {
                var result = {};
                for (var i in this)
                    if (this.hasOwnProperty(i))
                        result[i] = this[i];
                result.size = Object.keys(result).length;
                return result;
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.StorageItem.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.StorageItem
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // private Object: Windows.Storage.StorageItem
    //
    StorageItem: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.StorageItem constructor
        //
        function (parentFolder, desiredName) {

            this.parentFolder = parentFolder;
            if (parentFolder)
                this.isRoaming = parentFolder.isRoaming;
            this.name = desiredName;
            this.displayName = desiredName;
            if (parentFolder)
                this.path = parentFolder.path + "/" + desiredName;
            else
                this.path = desiredName;

            // TODO: Not storing dateCreated (or other date fields)
            this.dateCreated = new Date();//(new Date()).valueOf();
            this.dateModified = this.dateCreated;
            this.dateAccessed = this.dateCreated;

            this.properties = new Windows.Storage.StorageItemContentProperties(this);
        },

	    // ================================================================
	    // Windows.Storage.StorageItem members
	    // ================================================================

        {

            // ================================================================
            //
            // public function: Windows.Storage.StorageItem.isOfType
            //
            //      MSDN: TODO
            //
            isOfType: function (storageItemType) {

                // TODO: Bitmask, not equality.
                var isFolder = (this.attributes & Windows.Storage.FileAttributes.directory) == Windows.Storage.FileAttributes.directory;
                return (storageItemType == Windows.Storage.StorageItemTypes.folder && isFolder) ||
                     (storageItemType == Windows.Storage.StorageItemTypes.file && !isFolder);
            },


            // =========================================================
            //
            // public function: Windows.Storage.StorageItem.getBasicPropertiesAsync
            //
            //      MSDN: TODO
            //
            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var props = {
                    };

                    // TODO (PERF-MAJOR): Store size in MFT?  I'm only okay with this because I'm assuming that getBasicPropertiesAsync
                    // is a relatively rare call.  Either way, this MUST be fixed in R2/R3.  Apologies to any devs who tracked piss-poor
                    // performance down to this line :P.
                    return Windows.Storage.PathIO.readTextAsync(that.path).then(function (contents) {
                        if (!contents)
                            props.size = 0;
                        else
                            props.size = contents.length;
                        props.dateCreated = that.dateCreated;
                        props.dateModified = that.dateModified;
                        onComplete(props);
                    });
                });
            },


            // =========================================================
            //
            // public function: Windows.Storage.StorageItem.renameAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227227.aspx
            //
            renameAsync: function (desiredName, collisionOption) {
                var that = this;

                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that.parentFolder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(that.parentFolder, desiredName);

                    that.parentFolder._renameInMFT(that, desiredName);

                    onComplete(that);
                });
            },


            // =========================================================
            //
            // public function: Windows.Storage.StorageItem.moveAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227218.aspx
            //
            moveAsync: function (destinationFolder) {
                var that = this;
                return new WinJS.Promise(function (onComplete) {
                    that.parentFolder._removeFromMFT(that);
                    destinationFolder._addToMSFT(that);
                    that.parentFolder = destinationFolder;
                    onComplete();
                });
            }
        },

	    // ================================================================
	    // Windows.Storage.StorageItem static members
	    // ================================================================

        {
            _generateUniqueName: function (folder, desiredName) {
                var index = 1;
                var fileExt = desiredName.lastIndexOf(".");
                if (fileExt >= 0) {
                    var origNameWithoutExt = desiredName.substr(0, fileExt);
                    var ext = desiredName.substr(fileExt);
                } else {
                    var origNameWithoutExt = desiredName;
                    var ext = "";
                }

                while (true) {
                    desiredName = origNameWithoutExt + " (Copy " + index + ")" + ext;
                    if (!folder._mftEntryExists(desiredName))
                        break;
                    index++;
                }
                return desiredName;
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.StorageItemContentProperties.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.StorageItemContentProperties
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // private Object: Windows.Storage._allProps
    //
    //      List of all properties currently supported
    _allProps: ["System.FileExtension", "System.FileName", "System.IsFolder", "System.ItemType", "System.ItemTypeText",
                "System.FileAttributes", "System.ItemFolderNameDisplay", "System.ItemPathDisplay", "System.ItemName", "System.DateAccessed",
                "System.DateModified", "System.DateCreated", "System.FileOwner"],

    // ================================================================
    //
    // public Object: Windows.Storage.StorageItemContentProperties
    //
    StorageItemContentProperties: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.StorageItemContentProperties constructor
        //
        function (item) {
            this._item = item;
        },

	    // ================================================================
	    // Windows.Storage.StorageItemContentProperties members
	    // ================================================================

        {
            // =========================================================
            //
            // public function: Windows.Storage.StorageItemContentProperties.retrievePropertiesAsync
            //
            retrievePropertiesAsync: function (propertiesToRetrieve) {
                var item = this._item;
                return new WinJS.Promise(function (c) {

                    if (!propertiesToRetrieve || !propertiesToRetrieve.length)
                        propertiesToRetrieve = Windows.Storage._allProps;

                    // TODO: Properties should be saved to local (and roaming)
                    // TODO: Obviously, these should be stored in a map and returned verbatim, rather than regenerating each time.
                    // Hacking properties in for R1/R2 to work for the 90% case.
                    var props = {};
                    var isFolder = (item.attributes & Windows.Storage.FileAttributes.directory) == Windows.Storage.FileAttributes.directory;
                    var fileExt = item.name.substr(item.name.lastIndexOf(".") + 1);
                    propertiesToRetrieve.forEach(function (prop) {
                        if (prop.indexOf("System") == 0 && !props.System)

                            switch (prop) {
                                case "System.FileExtension":
                                    props[prop] = "." + fileExt;
                                    break;
                                case "System.FileName":
                                    props[prop] = item.name;
                                    break;
                                case "System.DateCreated":
                                    props[prop] = item.dateCreated;
                                    break;
                                case "System.DateModified":
                                    props[prop] = item.dateModified;
                                    break;
                                case "System.DateAccessed":
                                    props[prop] = item.dateAccessed;
                                    break;
                                case "System.FileOwner":
                                    props[prop] = "You";
                                    break;
                                case "System.IsFolder":
                                    props[prop] = isFolder;
                                    break;
                                case "System.ItemType":
                                    if (isFolder)
                                        props[prop] = "File folder";
                                    else
                                        props[prop] = "." + fileExt.toLowerCase();
                                    break;
                                case "System.ItemTypeText":
                                    if (isFolder)
                                        props[prop] = "File folder";
                                    else
                                        props[prop] = fileExt.toUpperCase() + " File";
                                    break;
                                case "System.FileAttributes":
                                    props[prop] = item.attributes;
                                    break;
                                case "System.ItemFolderNameDisplay":
                                    props[prop] = item.parentFolder.name;
                                    break;
                                case "System.ItemPathDisplay":
                                    props[prop] = item.path;
                                    break;
                                case "System.ItemName":
                                    props[prop] = item.name;
                                    break;
                            }
                    });
                    props.size = Object.keys(props).length;

                    c(props);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.savePropertiesAsync
            //
            //      MSDN: TODO
            //
            savePropertiesAsync: function (props) {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.savePropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getDocumentPropertiesAsync
            //
            //      MSDN: TODO
            //
            getDocumentPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getDocumentPropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getImagePropertiesAsync
            //
            //      MSDN: TODO
            //
            getImagePropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getImagePropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getMusicPropertiesAsync
            //
            //      MSDN: TODO
            //
            getMusicPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getMusicPropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getVideoPropertiesAsync
            //
            //      MSDN: TODO
            //
            getVideoPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getVideoPropertiesAsync is NYI");
                    c({});
                });
            },
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.StorageFile.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.StorageFile
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.StorageFile
    //
    StorageFile: WinJS.Class.derive(Windows.Storage.StorageItem,

		// ================================================================
		//
		// public function: Windows.Storage.StorageFile
		//
		//		MSDN: TODO
		//
        function (parentFolder, desiredName) {

            // Call into our base class' constructor
            Windows.Storage.StorageItem.call(this, parentFolder, desiredName);

            // Set our attributes
            this.attributes = Windows.Storage.FileAttributes.archive;

            var ext = desiredName.split('.').pop();
            switch (ext.toLowerCase()) {
                case "xml":
                    this.displayType = "XML Document";
                    break;
                default:
                    this.displayType = ext.toUpperCase() + " File";
                    break;
            }
            this.fileType = "." + ext;

            this.contentType = Windows.Storage.StorageFile._fileTypeMap[ext]
                                    ? Windows.Storage.StorageFile._fileTypeMap[ext]
                                    : ext.toUpperCase() + " File";
        },

            // ================================================================
            // Windows.Storage.StorageFile members
            // ================================================================
        {

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.copyAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.copyasync.aspx
            //
            copyAsync: function (folder, desiredName, collisionOption) {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var exists = folder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.NameCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(folder, desiredName);

                    var newFile = that.parentFolder._copyFileInMFT(that, folder, desiredName);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.copyAndReplaceAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh738482.aspx
            //
            copyAndReplaceAsync: function (fileToReplace) {
                var that = this;
                return fileToReplace.deleteAsync().then(function () {
                    return that.copyAsync(fileToReplace.parentFolder, fileToReplace.name);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.moveAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.moveasync.aspx
            //
            moveAsync: function (folder, desiredName, collisionOption) {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var exists = that.parentFolder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "File exists" });    // TODO (CLEANUP): Use correct win8 message
                        return;
                    }

                    if (collisionOption == Windows.Storage.NameCollisionOption.generateUniqueName && exists) {
                        var index = 1;
                        var fileExt = desiredName.lastIndexOf(".");
                        if (fileExt >= 0) {
                            var origNameWithoutExt = desiredName.substr(0, fileExt);
                            var ext = desiredName.substr(fileExt);
                        } else {
                            var origNameWithoutExt = desiredName;
                            var ext = "";
                        }

                        while (true) {
                            desiredName = origNameWithoutExt + " (Copy " + index + ")" + ext;
                            if (!that.parentFolder._mftEntryExists(desiredName))
                                break;
                            index++;
                        }

                    }

                    var newFile = that.parentFolder._copyFileInMFT(that, folder, desiredName);

                    // now that we've copied the file, remove the original one (this)
                    // TODO (PERF): Combine this into one action
                    that.deleteAsync().then(function () {
                        onComplete(newFile);
                    });
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.moveAndReplaceAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh738483.aspx
            //
            moveAndReplaceAsync: function (fileToReplace) {
                var that = this;
                return fileToReplace.deleteAsync().then(function () {
                    return that.moveAsync(fileToReplace.parentFolder, fileToReplace.name);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.deleteAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.deleteasync.aspx
            //
            deleteAsync: function () {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Remove ourselves from our parent's MFT
                    that.parentFolder._removeFromMFT(that);

                    onComplete();
                });
            },
        },

            // ================================================================
            // Windows.Storage.StorageFile static members
            // ================================================================

        {

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.getFileFromApplicationUriAsync
            //
            getFileFromApplicationUriAsync: function (uri) {
                return Windows.Storage.StorageFile.getFileFromPathAsync(uri.uri);
            },

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.getFolderFromPathAsync
            //
            //      TODO (CLEANUP): Combine this and StorageFile.getFileFromPathAsync - lots of shared code
            //
            getFileFromPathAsync: function (path) {

                path = path.replace(/\\/g, "/");

                // TODO (CLEANUP): Check for ms-appdata first, and then merge these two into one block.
                if (path.indexOf("ms-appx:///") == 0) {

                    // Loading from app install folder; redirect to it
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    var fileFolder = path.substr(11, path.lastIndexOf("/") - 11);
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFileAsync(fileName);
                    });
                }

                // Convert built-in folders' full path reference to ms-appdata path references
                var appData = Windows.Storage.ApplicationData.current;
                path = path.replace(appData.localFolder.path, "ms-appdata:///local");
                path = path.replace(appData.temporaryFolder.path, "ms-appdata:///temp");
                path = path.replace(appData.roamingFolder.path, "ms-appdata:///roaming");

                if (path.indexOf("ms-appdata:///") != 0) {
                    // App is referencing a file in root.  Treat that as a reference to the app install folder
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    // TODO: Need to strip initial "/" if present?
                    var fileFolder = path.substr(0, path.lastIndexOf("/"));
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFileAsync(fileName);
                    });
                }

                // If here, then it's a reference to temp, local, or roaming folder.

                var appData = Windows.Storage.ApplicationData.current;

                if (path.indexOf("ms-appdata:///temp/") == 0) {

                    // loading from temp folder; redirect to it
                    var folder = appData.temporaryFolder;
                    path = folder.path + path.substr(18);

                } else if (path.indexOf("ms-appdata:///local/") == 0) {

                        // loading from local folder; redirect to it
                    var folder = appData.localFolder;
                    path = folder.path + path.substr(19);

                } else if (path.indexOf("ms-appdata:///roaming/") == 0) {

                        // loading from roaming folder; redirect to it
                    var folder = appData.roamingFolder;
                    path = folder.path + path.substr(21);

                } else {
                    console.warn("Invalid path passed to Windows.Storage.PathIO: " + path);
                    return WinJS.Promise.as(null);
                }

                // At this point, folder references the root folder, and path has the (deep) subfolder and file
                var lastSlash = path.lastIndexOf("/");
                if (lastSlash >= 0) {
                    var fileName = path.substr(lastSlash + 1);
                    path = path.substr(0, lastSlash);
                    folder = folder._internalGetFolderFromPath(path);
                } else
                    fileName = path;

                return folder.getFileAsync(fileName);
            },

            // ================================================================
            //
            // private property: Windows.Storage.StorageFile._fileTypeMap
            //
            _fileTypeMap: {
                "jpg": "image/jpeg",
                "png": "image/png",
                "gif": "image/gif",
                "txt": "text/plain",
                "xml": "text/xml"
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.StorageFolder.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.StorageFolder
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.StorageFolder
    //
    //  NOTES:
    //
    //      * Items are stored in window.localStorage (and proxied to remoteStorage).
    //      * Because localStorage is a set of flat key/value pairs, we maintain a virtual file hierarchy
    //        in the form of a masterfiletable.  Each folder has its own masterfiletable which describes
    //        the items in the folder.
    //      * Items can exist in multiple states: 
    //          - As an MFT entry, which contains metadata about the item but no functionality (e.g. path, attributes).  These are
    //            referred to as "unrealized items".
    //          - As a StorageItem (File/Folder), which contains functionality (e.g. deleteAsync).  These are referred to as
    //            "realized items".  An item is faulted in from unrealized to realized state on-demand.
    //      * We store realized items in a map (this.realizedItems[name])
    //
    StorageFolder: WinJS.Class.derive(Windows.Storage.StorageItem,

		// ================================================================
		//
		// public function: Windows.Storage.StorageFolder
		//
		//		MSDN: TODO
		//
        function (parentFolder, desiredName) {

            // Call into our base class' constructor
            Windows.Storage.StorageItem.call(this, parentFolder, desiredName);

            // Set our attributes
            this.attributes = Windows.Storage.FileAttributes.directory;
            this.displayType = "File folder";

            // Our list of realized items (we've previously loaded data and created StorageFolder/Files).
            this.realizedItems = {};

            this._initMFT();
        },

		// ================================================================
		// Windows.Storage.StorageFolder members
		// ================================================================

        {
            _initMFT: function () {

                // Initialize our MFT; this will load the list of unrealized items as a flat string
                var mft = Bluesky.dataStore.getItem("mft_" + this.path);

                // If the MFT exists for this folder, then parse it into a JSON object now; otherwise initialize it with an empty MFT
                if (mft) {
                    this.masterFileTable = $.parseJSON(mft);
                    for (var i in this.masterFileTable)
                        this.masterFileTable[i].path = this.path + "/" + this.masterFileTable[i].name;
                }
                else
                    this.masterFileTable = {};
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderFromPathAsync
            //
            //		MSDN: TODO
            //
            getFolderFromPathAsync: function (path) {

                var thisFolder = this;
                return new WinJS.Promise(function (onComplete) {

                    onComplete(thisFolder._internalGetFolderFromPath(path));
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getBasicPropertiesAsync
            //
            //		MSDN: TODO
            //
            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Folders have no size
                    // TODO: dateCreated (et al)
                    var props = {
                        size: 0,
                        dateCreated: that.dateCreated,
                        dateModified: that.dateModified,
                        dateAccessed: that.dateAccessed,
                    };
                    onComplete(props);
                });
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._internalGetFolderFromPath
            //
            _internalGetFolderFromPath: function (path) {

                // Starting at this folder, walk through child folders until we finish walking 'path'.

                // Are we the requested path?
                if (path.length == this.path.length) {
                    return this;
                } else {

                    // Normalize path to use "/" everywhere (could be mix of \ and /)
                    path = path.replace(/\\/g, "/");

                    // Get our child path and continue the search
                    var childPath = path.substring(this.path.length);
                    var nextFolderName = childPath.split('/').slice(1)[0];
                    var childFolder = this._getRealizedItem(nextFolderName);

                    // Does childfolder exist?
                    if (childFolder) {

                        // Child folder exists; recurse into it
                        return childFolder._internalGetFolderFromPath(path);

                    } else if (nextFolderName) {

                        // Create folders as we go (TODO: check if win8 does this)

                        // Child folder does not exist; create it and then recurse into it
                        var childFolder = new Windows.Storage.StorageFolder(this, nextFolderName);

                        // Add the StorageFolder to our MFT and persist it
                        this._addItemToMFT(childFolder);

                        // now recurse into it
                        return childFolder._internalGetFolderFromPath(path);

                    } else {
                        // child folder does not exists and there's no 'next' folder... Um, blanking on how this happens (TODO)
                        return this;
                    }
                }
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFolderAsync
            //
            //		MSDN: TODO
            //
            createFolderAsync: function (desiredName, collisionOption) {

                // TODO: What's the Win8 default?
                if (typeof collisionOption === "undefined")
                    collisionOption = Windows.Storage.CreationCollisionOption.failIfExists;

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.CreationCollisionOption.failIfExists && exists) {
                        return onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(that, desiredName);

                    var newFile = new Windows.Storage.StorageFolder(that, desiredName);

                    // TODO: If isRoaming, then trigger the roaming manager to upload when it can

                    // Add the StorageFolder to our MFT and persist it
                    that._addItemToMFT(newFile);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFileAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227250.aspx
            //
            createFileAsync: function (desiredName, collisionOption) {

                // TODO: What's the Win8 default?
                if (typeof collisionOption === "undefined")
                    collisionOption = Windows.Storage.CreationCollisionOption.failIfExists;

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.CreationCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(that, desiredName);

                    var newFile = new Windows.Storage.StorageFile(that, desiredName);

                    // TODO: If isRoaming, then trigger the roaming manager to upload when it can

                    // Add the StorageFile to our MFT and persist it
                    that._addItemToMFT(newFile);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFolderQuery
            //
            //		MSDN: TODO
            //
            createFolderQuery: function (query) {

                // Ensure we have a valid query
                if (typeof query === "undefined")
                    query = Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query);
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getItemsAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/br227287
            //
            getItemsAsync: function (startIndex, maxItemsToRetrieve) {

                var query = Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getItemsAsync();
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFoldersAsync
            //
            //		MSDN: TODO
            //
            getFoldersAsync: function (query) {

                // Ensure we have a valid query
                if (typeof query === "undefined")
                    query = Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getFoldersAsync();
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFilesAsync
            //
            //		MSDN: TODO
            //
            getFilesAsync: function (query) {

                // Ensure we have a valid query
                if (typeof query === "undefined")
                    query = Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getFilesAsync();
            },




            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFileAsync
            //
            //		MSDN: TODO
            //
            //      TODO (R3): get[File|Folder|Item]Async() must check remote store if folder is roaming and file isn't
            //      present.  Use the CachedFileManager's ability to check status of roaming files (NYI)
            //
            getFileAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    name = name.replace("\\", "/");

                    var item = that._getRealizedItem(name);

                    // TODO: If not a file, then set item to null?  What does Win8 do?

                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },



            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderAsync
            //
            //		MSDN: TODO
            //
            getFolderAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var item = that._getRealizedItem(name);

                    // TODO: If not a folder, then set item to null?  What does Win8 do?

                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getItemAsync
            //
            //		MSDN: TODO
            //
            getItemAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var item = that._getRealizedItem(name);
                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getIndexedStateAsync
            //
            //		MSDN: TODO
            //
            getIndexedStateAsync: function () {

                return new WinJS.Promise(function (onComplete) {

                    // TODO: Indexing is not supported.  Update this should it ever be.
                    onComplete(Windows.Storage.Search.IndexedState.notIndexed);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.deleteAsync
            //
            //		MSDN: TODO
            //
            deleteAsync: function () {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Remove ourselves from our parent's MFT, and remove our (and our kids) MFTs from localStorage
                    that.parentFolder._removeFromMFT(that);

                    onComplete();
                });
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._removeFromMFT
            //
            //      Removes the specified child item from this folder's MFT, and removes the child item (and its kids') MFTs from localStorage
            //
            _removeFromMFT: function (childItem) {

                // Recursively remove the childItem and its childItems
                this._removeChildItem(childItem);

                // If this is a folder then persist our updated MFT
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._removeChildItem
            //
            //      Removes the specified child item from this folder's MFT, and removes the child item (and its kids') MFTs from localStorage
            //
            _removeChildItem: function (childItem) {

                // Remove us from the MFT
                if (childItem.attributes == Windows.Storage.FileAttributes.directory)
                    Bluesky.dataStore.removeItem("mft_" + childItem.path);
                else
                    Bluesky.dataStore.removeItem(childItem.path);

                // Remove the child item from our master file table
                delete this.masterFileTable[childItem.name.toLowerCase()];

                // If item is a folder then recursively remove it and its kids from localStorage
                if (childItem.attributes == Windows.Storage.FileAttributes.directory) {

                    // Empty the child's set of realizedItems
                    childItem.realizeItems = {};

                    // Recursively remove any child items
                    var that = this;
                    for (var entry in childItem.masterFileTable) {

                        var childItem2 = childItem.masterFileTable[entry];

                        // If the item is a file then just remove it; otherwise, recurse into it
                        if (childItem2.attributes == Windows.Storage.FileAttributes.archive)
                            Bluesky.dataStore.removeItem(childItem2.path);
                        else
                            childItem._removeChildItem(childItem2);
                    }
                }
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._mftEntryExists
            //
            _mftEntryExists: function (name) {

                return this.masterFileTable[name.toLowerCase()] ? true : false;
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._renameInMFT
            //
            _renameInMFT: function (childItem, newName) {

                var mftEntry = this.masterFileTable[childItem.name.toLowerCase()];
                if (!mftEntry)
                    return;

                // If childItem is a file, then load its contents so that we can save them back out with the new pathname (which is 
                // how we reference files in localStorage)
                if (childItem.attributes == Windows.Storage.FileAttributes.archive) {
                    var fileContents = Bluesky.dataStore.getItem(childItem.path);
                    Bluesky.dataStore.removeItem(childItem.path);
                }

                // Replace the old MFT entry with the new one
                this.masterFileTable[newName.toLowerCase()] = mftEntry;
                delete this.masterFileTable[mftEntry.name.toLowerCase()];

                // Update the mft entry's name
                mftEntry.name = newName;
                childItem.name = newName;
                childItem.path = this.path + "/" + newName;

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);

                // TODO: Do I need to update this.realizedItems as well?

                // When renaming a folder, we need to update MFT paths for all subfolders as well
                Windows.Storage.StorageFolder._refreshMFTPaths(this);

                // If this was a file then save out its contents with the new pathname
                if (fileContents)
                    Bluesky.dataStore.setItem(mftEntry.path, fileContents);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._copyInMFT
            //
            _copyFileInMFT: function (childItem, destFolder, newName) {

                // Special case files which come from the appx folder since they don't have an MFT entry
                if (childItem._isAppX) {

                    // Create a new mft entry
                    var newMFTEntry = destFolder._addItemToMFT({
                        name: childItem.name,
                        path: destFolder.path + "/" + childItem.name,
                        attributes: childItem.attributes,
                        masterFileTable: childItem.masterFileTable,
                        dateCreated: childItem.dateCreated,
                        dateModified: childItem.dateCreated,
                        dateAccessed: childItem.dateCreated,
                        size: childItem.size
                    });

                    var fileContents = childItem._appXContents;

                } else {

                    var sourceMFTEntry = this.masterFileTable[childItem.name.toLowerCase()];
                    if (!sourceMFTEntry)
                        return;

                    /*DEBUG*/
                    if (sourceMFTEntry.attributes != Windows.Storage.FileAttributes.archive)
                        console.warn("bluesky error: folder passed to StorageFolder._copyFileInMFT");
                    /*ENDDEBUG*/

                    // Clone the existing entry
                    var newMFTEntry = JSON.parse(JSON.stringify(sourceMFTEntry))

                    // Update the mft entry's name
                    newMFTEntry.name = newName;
                    newMFTEntry.path = destFolder.path + "/" + newName;
                    destFolder._addItemToMFT(newMFTEntry);

                    var fileContents = Bluesky.dataStore.getItem(sourceMFTEntry.path);
                }

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(destFolder.path, destFolder.masterFileTable);

                // copy source file's contents as well
                Bluesky.dataStore.setItem(newMFTEntry.path, fileContents);

                return destFolder._realizeItem(newMFTEntry);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._addItemToMFT
            //
            //      item: The StorageItem to add to the MFT
            //
            _addItemToMFT: function (item) {

                this.masterFileTable[item.name.toLowerCase()] = {
                    name: item.name,
                    path: this.path + "/" + item.name,
                    attributes: item.attributes,
                    masterFileTable: item.masterFileTable,
                    dateCreated: item.dateCreated,
                    dateModified: item.dateModified,
                    dateAccessed: item.dateAccessed,
                    size: item.size
                };

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);

                return this.masterFileTable[item.name.toLowerCase()];
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._realizeItem
            //
            //      An item can be in one of two states; unrealized, in which case we simply have an MFT entry with metadata, or
            //      realized, in which case we have a StorageItem on which functions can be called.  Note that we still don't 
            //      necessarily have data for the item loaded.
            //
            _realizeItem: function (mftEntry) {

                var lowerName = mftEntry.name.toLowerCase();
                // TODO (CLEANUP/PERF): I'm not updating realizedItems properly elsewhere yet.  Same comment below
                // if (!this.realizedItems[lowerName])
                {

                    if (mftEntry.attributes == Windows.Storage.FileAttributes.archive) {

                        // The item is a file
                        this.realizedItems[lowerName] = new Windows.Storage.StorageFile(this, mftEntry.name);

                    } else {

                        // It's a folder
                        this.realizedItems[lowerName] = new Windows.Storage.StorageFolder(this, mftEntry.name);
                        this.realizedItems[lowerName].masterFileTable = mftEntry.masterFileTable;
                    }
                }

                return this.realizedItems[lowerName];
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._getRealizedItem
            //
            _getRealizedItem: function (name) {

                var lowerName = name.toLowerCase();

                // If we've already realized the mftEntry into a StorageItem, then return the realized StorageItem
                // TODO (CLEANUP/PERF): I'm not updating realizedItems properly elsewhere yet.  Same comment above
                // if (this.realizedItems[lowerName])
                //    return this.realizedItems[lowerName];

                // If we haven't realized the mftEntry, but it is valid entry, then realize it now
                if (this.masterFileTable && this.masterFileTable[lowerName])
                    return this._realizeItem(this.masterFileTable[lowerName]);

                // there is no item with name 'name' in this folder
                return null;
            },
        },

        // ================================================================
        // Windows.Storage.StorageFolder static members
        // ================================================================

        {
            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderFromPathAsync
            //
            //      TODO (CLEANUP): Combine this and StorageFile.getFileFromPathAsync - lots of shared code
            //
            getFolderFromPathAsync: function (path) {

                path = path.replace(/\\/g, "/");

                // TODO (CLEANUP): Check for ms-appdata first, and then merge these two into one block.
                if (path.indexOf("ms-appx:///") == 0) {

                    // Loading from app install folder; redirect to it
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    var fileFolder = path.substr(11, path.lastIndexOf("/") - 11);
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFolderAsync(fileName);
                    });
                }

                // Convert built-in folders' full path reference to ms-appdata path references
                var appData = Windows.Storage.ApplicationData.current;
                path = path.replace(appData.localFolder.path, "ms-appdata:///local");
                path = path.replace(appData.temporaryFolder.path, "ms-appdata:///temp");
                path = path.replace(appData.roamingFolder.path, "ms-appdata:///roaming");

                if (path.indexOf("ms-appdata:///") != 0) {
                    // App is referencing a file in root.  Treat that as a reference to the app install folder
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    // TODO: Need to strip initial "/" if present?
                    var fileFolder = path.substr(0, path.lastIndexOf("/"));
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFolderAsync(fileName);
                    });
                }

                // If here, then it's a reference to temp, local, or roaming folder.

                var appData = Windows.Storage.ApplicationData.current;

                if (path.indexOf("ms-appdata:///temp/") == 0) {

                    // loading from temp folder; redirect to it
                    var folder = appData.temporaryFolder;
                    path = folder.path + path.substr(18);

                } else if (path.indexOf("ms-appdata:///local/") == 0) {

                    // loading from local folder; redirect to it
                    var folder = appData.localFolder;
                    path = folder.path + path.substr(19);

                } else if (path.indexOf("ms-appdata:///roaming/") == 0) {

                    // loading from roaming folder; redirect to it
                    var folder = appData.roamingFolder;
                    path = folder.path + path.substr(21);

                } else {
                    console.warn("Invalid path passed to Windows.Storage.PathIO: " + path);
                    return WinJS.Promise.as(null);
                }

                // At this point, folder references the root folder, and path has the (deep) subfolder and file
                var lastSlash = path.lastIndexOf("/");
                if (lastSlash >= 0) {
                    var fileName = path.substr(lastSlash + 1);
                    path = path.substr(0, lastSlash);
                    folder = folder._internalGetFolderFromPath(path);
                } else
                    fileName = path;

                return folder.getFolderAsync(fileName);
            },

            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._refreshMFTPaths
            //
            //      After renaming a folder, we need to update all MFT paths in the folder and its subfolders
            //
            //      TODO: How to avoid this?
            //
            _refreshMFTPaths: function (folder) {

                var dirty = false;
                for (var i in folder.masterFileTable) {

                    var mftEntry = folder.masterFileTable[i];

                    // Update the mftentry's path
                    var newPath = folder.path + "/" + mftEntry.name;
                    if (newPath != mftEntry.path) {
                        var key = mftEntry.attributes == 16 ? "mft_" : "";
                        var value = Bluesky.dataStore[key + mftEntry.path];
                        Bluesky.dataStore.removeItem(key + mftEntry.path);
                        Bluesky.dataStore.setItem(key + newPath, value);
                        mftEntry.path = newPath;
                        dirty = true;
                    }
                    // If the mftEntry is a folder, then recurse into it
                    if (mftEntry.attributes == 16)
                        Windows.Storage.StorageFolder._refreshMFTPaths(mftEntry);
                }
                if (dirty)
                    Windows.Storage.StorageFolder._persistMFT(folder.path, folder.masterFileTable);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._persistMFT
            //
            //      TODO (PERF): Wrap this in msSetImmediate & _isYielding (ala how BaseControl.render works) to allow
            //      batching of persistence in case app is changing many files at once.
            //
            _persistMFT: function (path, mft) {

                // Serialize our masterFileTable into a string that we can store
                //var mftString = JSON.stringify(this.masterFileTable);
                var mftString = JSON.stringify(mft, function (key, val) {
                    if (key == "path" || key == "masterFileTable")
                        return undefined;
                    return val;
                });
                // Store our MFT in localStorage
                Bluesky.dataStore.setItem("mft_" + path, mftString);
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage._AppXStorageFolder.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.StorageFolder
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    AppXFolder: WinJS.Class.derive(Windows.Storage.StorageFile,
        function () {
        },
        {
        })
});

WinJS.Namespace.define("Windows.Storage", {

    AppXFolder: WinJS.Class.derive(Windows.Storage.StorageFolder,

        // On Win8, the AppX folder contains the set of files that are embedded into the application.  On the 
        // web though, we don't have "embedded" files (at least, until apploader is in place).  So for us, the
        // Application folder is set to the root folder.  We need to override various 'get' functions accordingly
        function (parentFolder, name) {

            // Call into our base class' constructor
            Windows.Storage.StorageFolder.call(this, parentFolder, name);
        },

        {
            getFolderAsync: function (name) {

                var that = this;
                // in the appx folder, we assume requested folders exist
                return new WinJS.Promise(function (onComplete) {
                    var folder = new Windows.Storage.AppXFolder(this, name);
                    // appx folders support passing full path in as name; ensure we don't have double-/s
                    if (name[0] == '/')
                        name = name.substr(1);
                    folder.path = that.path + "/" + name;

                    onComplete(folder);
                });
            },

            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var props = {
                        size: that.size || 0,
                    };
                    onComplete(props);
                });
            },

            getFileAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    name = name.replace("\\", "/");

                    // Check if the file exists in the filesystem
                    var fullFilePath = that.path + "/" + name;

                    WinJS.xhr({
                        url: fullFilePath
                    }).then(
                    function (result) {
                        // Found the file.  Track that this file came from appX so that we don't
                        // try to load it from localStorage in FileIO.readTextAsync.  Also track the
                        // file's contents so that we don't have to reload them.
                        var file = new Windows.Storage.StorageFile(that, name);
                        file.path = fullFilePath;
                        // NOTE: This will differ slightly between win8 and web.  e.g. on Windows, a file with "Hello There" registers as 14 bytes, not 11,
                        // due to three bytes it prepends.  When we have binary buffer reads, use those instead to get 'real' file size.
                        if (!result.responseText)
                            file.size = 0;
                        else
                            file.size = result.responseText.length;

                        file._isAppX = true;
                        file._appXContents = result.responseText;

                        onComplete(file);
                    },
                     function (error) {
                         // no file found
                         if (!_warned404) {
                             console.warn("bluesky FYI: getFileAsync failed when loading a file from the app-install folder.  Note that all custom file types must " +
                                          "have their mime type registered in order for IIS to serve them up; this can be done on the server side, or directly from " +
                                          "your app's web.config by adding a mimeMap entry.  See the bluesky test Harness' web.config for an example, and the readTextAsync " +
                                          "test in Tests.Windows.Storage.FileIO.js.");
                             _warned404 = true;
                         }
                         onError({ message: "The system cannot find the file specified.\r\n" });
                     });
                });
            },

            getItemAsync: function (name) {

                var that = this;
                // in the appx folder, check if an item is a file and return it if so; otherwise assume it's a present
                // folder and gen' it up.
                return new WinJS.Promise(function (onComplete) {

                    if (!_warnedConsoleErrors) {
                        console.warn("bluesky FYI: StorageFolder.getItemAsync in the app install folder may output errors - these are not errors, " +
                                     "but are reported because we do not yet support/require an 'app manifest' that tells bluesky which files are installed " +
                                     "in the app-install folder; so bluesky cannot tell if the requested item is a file or a folder.  Thus, we first try to load it as a file " +
                                     "and if that fails, then we load it as a folder - this results in a 403, 404, or 301 error being reported for every folder " +
                                     "request that is made through getItemAsync.  To avoid the  error in console.log, and (more importantly) to " +
                                     "speed up accessing files and folders from the app install folder, switch to using getFileAsync and getFolderAsync. " +
                                     "This issue will be fixed when we support apploader and package manifests in R2/R3.");

                        _warnedConsoleErrors = true;
                    }

                    // Try loading it as a file
                    return that.getFileAsync(name).then(
                        function (file) {
                            // Found as a file
                            onComplete(file);
                        },
                        function (error) {
                            // File not found - return a folder instead
                            that.getFolderAsync(name).then(function (folder) {
                                onComplete(folder);
                            });
                        });
                });
            },
        })
});
var _warnedConsoleErrors = false;
var _warned404 = false;








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.FileIO.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.FileIO
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701440.aspx
//
WinJS.Namespace.define("Windows.Storage", {

    FileIO: {

        // =========================================================
        //
        // Function: Windows.Storage.FileIO.writeTextAsync
        //
        //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701508.aspx
        //
        writeTextAsync: function (file, contents, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {
                // tbd: append?
                // tbd: manage error when overflowing maximum localstorage space; currently fails silently (but I believe it
                //      still updates in the cloud correctly).

                // TODO: This is wrong (besides which, setItem is not defined)
                Bluesky.dataStore.setItem(file.path, contents);
                if (file.isRoaming) {
                    Windows.Storage.CachedFileManager.uploadRoamingFile(file, contents);
                }

                // Report completion regardless of roaming state
                onComplete();
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.writeLinesAsync
        //
        //      MSDN: TODO
        //
        writeLinesAsync: function (file, lines, encoding) {

            var contents = "";
            lines.forEach(function (line) {
                contents += line + "\r\n";
            });
            return this.writeTextAsync(file, contents, encoding);
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.appendTextAsync
        //
        //      MSDN: TODO
        //
        appendTextAsync: function (file, contents, encoding) {

            return this.readTextAsync(file, encoding).then(function (oldContents) {
                var newContents = oldContents + contents;
                return Windows.Storage.FileIO.writeTextAsync(file, newContents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.appendLinesAsync
        //
        //      MSDN: TODO
        //
        appendLinesAsync: function (file, lines, encoding) {

            return this.readTextAsync(file, encoding).then(function (oldContents) {
                var newContents = oldContents;

                var contents = "";
                lines.forEach(function (line) {
                    newContents += line + "\r\n";
                });
                return Windows.Storage.FileIO.writeTextAsync(file, newContents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.readTextAsync
        //
        //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileio.readtextasync.aspx
        //
        readTextAsync: function (file, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {

                // See AppXFolder.getFileAsync for reason behind this if block
                if (file._isAppX) {
                    onComplete(file._appXContents);
                    return;
                }

                // always read from local store, even if file is roaming; the roaming manager will asynchronously keep it up to date
                // TODO: This is wrong (besides which, getItem is not defined)
                var contents = Bluesky.dataStore.getItem(file.path);

                // if the file isn't found locally and it's a roamable file, then fault it in from the cloud
                if (contents == null && file.isRoaming) {
                    Windows.Storage.CachedFileManager.readRoamingFileFromRemoteStore(file).then(function (content) {
                        onComplete(content);
                    });
                }
                else
                    onComplete(contents);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.readLinesAsync
        //
        //      MSDN: TODO
        //
        readLinesAsync: function (file, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {

                Windows.Storage.FileIO.readTextAsync(file, encoding).then(function (fileContents) {
                    // split contents on line breaks
                    var lines = fileContents.split("\r\n");
                    lines.size = lines.length;
                    onComplete(lines);
                },
                function (error) {
                    onError(error);
                });
            });
        },

    }
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.PathIO.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.PathIO
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    PathIO: {

        // =========================================================
        //
        // Function: Windows.Storage.PathIO.readTextAsync
        //
        //      MSDN: TODO
        //
        readTextAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.writeTextAsync
        //
        //      MSDN: TODO
        //
        writeTextAsync: function (path, contents, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, contents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.readLinesAsync
        //
        //      MSDN: TODO
        //
        readLinesAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.readLinesAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.writeLinesAsync
        //
        //      MSDN: TODO
        //
        writeLinesAsync: function (path, contents, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.writeLinesAsync(file, contents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.appendTextAsync
        //
        //      MSDN: TODO
        //
        appendTextAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.appendTextAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.appendLinesAsync
        //
        //      MSDN: TODO
        //
        appendLinesAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.appendLinesAsync(file, encoding);
            });
        }
    }
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.Search.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.Search.StorageFolderQueryResult
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.aspx
//

WinJS.Namespace.define("Windows.Storage.Search", {

    // ================================================================
    //
    // Windows.Storage.Search.CommonFolderQuery enumeration
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.commonfolderquery.aspx
    //
    CommonFolderQuery: {
        defaultQuery: 0,
        groupByAlbum: 103,
        groupByAlbumArtist: 104,
        groupByArtist: 102,
        groupByAuthor: 110,
        groupByComposer: 105,
        groupByGenre: 106,
        groupByMonth: 101,
        groupByPublishedYear: 107,
        groupByRating: 108,
        groupByTag: 109,
        groupByType: 111,
        groupByYear: 100
    },


    // ================================================================
    //
    // Windows.Storage.Search.IndexedState enumeration
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.indexedstate.aspx
    //
    IndexedState: {
        unknown: 0,
        notIndexed: 1,
        partiallyIndexed: 2,
        fullyIndexed: 3
    },
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.Search.StorageFolderQueryResult.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// Windows.Storage.Search.StorageFolderQueryResult
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.aspx
//

WinJS.Namespace.define("Windows.Storage.Search", {

    // ================================================================
    //
    // public Object: Windows.Storage.Search.StorageFolderQueryResult
    //
    StorageFolderQueryResult: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.Search.StorageFolderQueryResult constructor
        //
        //      MSDN: TODO
        //
        function (sourceFolder, query) {
            // constructor
            this.folder = sourceFolder;
            this.query = query;
        },

	    // ================================================================
	    // Windows.Storage.Search.StorageFolderQueryResult members
	    // ================================================================

        {

            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getFoldersAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br208074.aspx
            //
            getFoldersAsync: function (query) {

                return this._getItemsOfType(query, Windows.Storage.FileAttributes.directory);
            },


            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getFilesAsync
            //
            //      MSDN: TODO
            //
            getFilesAsync: function (query) {

                // TODO: archive? normal?
                return this._getItemsOfType(query, Windows.Storage.FileAttributes.archive);
            },


            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getItemsAsync
            //
            //      MSDN: TODO
            //
            getItemsAsync: function (query) {

                return this._getItemsOfType(query);
            },


            // =========================================================
            //
            // private function: Windows.Storage.Search.StorageFolderQueryResult._getItemsOfType
            //
            _getItemsOfType: function (query, filterType) {
                // tbd: merging queries.
                query = query || this.query || Windows.Storage.Search.CommonFolderQuery.defaultQuery;
                var that = this;

                return new WinJS.Promise(function (onComplete) {

                    // enumerate files in our folder's fileStore that match our query.
                    // tbd: only supporting defaultQuery for now.
                    if (query != Windows.Storage.Search.CommonFolderQuery.defaultQuery)
                        throw "NYI: get[Item/Files/Folders]Async only support defaultQuery";

                    var results = new Windows.Foundation.Collections.IVectorView();

                    var folderItems = that.folder.masterFileTable;
                    for (var i in folderItems) {
                        var item = folderItems[i];
                        if ((filterType && (item.attributes & filterType) == filterType) || (!filterType)) {
                            // If we haven't previously realized the mft entry into a live item, then do so now
                            results.push(that.folder._realizeItem(item));
                        }
                    }

                    onComplete(results);
                });
            },

            // =========================================================
            //
            // public member: Windows.Storage.Search.StorageFolderQueryResult.folder
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.folder.aspx
            //
            folder: null,

            query: null
        }),
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: Windows.Storage.CachedFileManager.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //


WinJS.Namespace.define("Windows.Storage", {



    /* TODO: Roaming is not part of R1/R2 - this implementation is not tested and in place to keep prototype'd apps
    from breaking */




    // CachedFileManager: Responsible for keeping roaming files up to date.  
    // TODO: This requires a WINS-like service to be implemented.  Haven't rationalized that against client model yet.
    CachedFileManager: {
        init: function () {
        /*
            // uncomment this line to enable a clean install (for testing purposes only)
            // $.cookie("lastRoamingCheck", null);

            // If we haven't checked for roaming updates before, then start at 0.
            if (!$.cookie("lastRoamingCheck"))
                $.cookie("lastRoamingCheck", "0");

            // tbd-mustfix: lacking a push service, for debugging purposes I'm going to pull every 60 seconds to see if any files changed.  This
            // will DDoS our server if any reasonable number of users join the tech preview.  I think Windows has a 15 minute minimum time on Pull notifications
            // (but roaming probably goes through a push model).
            // tbd: when a roaming file changes remotely, and the local client is notified, does Win8 silently download the file immediately, or does it instead
            //      mark the file as dirty and then fault it in when the user asks for it?  1st approach; pro-new local client has files immediately present; con-
            //      big download.  2nd approach; pro- doesn't download files if user doesn't need them; con-user waits everytime they try to access a remote file.
            //      For now, I'm going with model 1, and updating/downloading every file.
            setInterval(this._checkForModifiedRoamingFiles, 1000 * 60);
            this._checkForModifiedRoamingFiles();

            // For debugging purposes (read: not polluting the console log), you can set Windows.Storage.CachedFileManager.enabled = false and roaming updates won't happen. Be sure to change back before shipping!
            // tbd-mustfix: need to find a way to disable this entirely until and unless the app has roaming files.  For the majority that don't,
            // this is just wasted battery/network pain.
            // For now, I've defaulted this to disabled; the app will need to explicitly enable it.*/
            this.enabled = false;
        },

        /*
        _checkForModifiedRoamingFiles: function () {
            // ensure we have a logged in user and valid appid
            if (!$.cookie("appId") || !$.cookie("userId"))
                return;

            if (!this.enabled)
                return;
            // ping our notification server (pull) to see if any files have changed
            $.ajax({
                type: "GET",
                url: "http://www.bluesky.io/_ws/webService.svc/GetModifiedRoamingFilesList",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: {
                    "appId": $.cookie("appId"),
                    "userId": $.cookie("userId"),
                    "lastRoamingCheck": $.cookie("lastRoamingCheck")
                },
                success: function (result) {

                    if (result.Success) {
                        if (result.updatedFiles.length > 0) {
                            console.log("Roaming files have been updated; downloading updated files:", result.updatedFiles);

                            // Fire off update requests for all apps in the updated list
                            result.updatedFiles.forEach(function (fileId) {
                                Windows.Storage.CachedFileManager.readRoamingFileFromRemoteStore(fileId);
                            });

                            // Update our last roaming check
                            $.cookie("lastRoamingCheck", result.lastRoamingCheck);
                        } else
                            console.log("CachedFileManager: no updated roaming files found");
                    } else {
                        // error. tbd: error handling
                        console.log("error getting modified roaming files list.  Error = ", result);
                    }
                },
                error: function (error) {
                    // error. tbd: error handling
                    console.log("error 2 getting modified roaming files list.  Error = ", error);
                }
            });
        },
        */
        _warnedNYI: false,
        uploadRoamingFile: function (file, fileContents) {
            if (!this._warnedNYI) {
                console.warn("bluesky: roaming files are not supported in R1/R2.")
                this._warnedNYI = true;
            }
            return new WinJS.Promise(function (onComplete) {

                onComplete();
                /*
                $.ajax({
                    type: "GET",
                    url: "http://www.bluesky.io/_ws/webService.svc/CanUploadAppRoamingFile",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: {
                        "appId": $.cookie("appId"),
                        "userId": $.cookie("userId"),
                        "fileSize": fileContents.length
                    },
                    success: function (result) {
                        if (result == true) {
                            // file.path has filename in it - on server we want just the path
                            var filePath = file.path.substring(0, file.path.length - file.name.length);

                            // we can send the file; do so now.
                            $.ajax({
                                type: "POST",
                                url: "http://www.bluesky.io/_ws/webService.svc/UploadAppRoamingFile",
                                contentType: "application/json; charset=utf-8",
                                // tbd-mustfix: does this approach have an upper limit on filesize?
                                data: '{"appId": "' + $.cookie("appId") + '","userId": "' + $.cookie("userId") + '","fileName": "' + file.name + '","filePath": "' + escape(filePath) + '","fileContents": "' + escape(fileContents) + '"}',
                                success: function (result) {
                                    // tbd: how to avoid the need to eval?
                                    eval('var r = ' + result);
                                    if (r.Success) {
                                        onComplete(r);
                                    }
                                    else
                                        // tbd: what's the right win8 way to handle this?
                                        console.log("error: insufficient cloud storage space (code " + r.ErrorCode + ")");
                                },

                                error: function (err) {
                                    // tbd: what does win8 do if a roaming upload fails?  I'm assuming it either fails silently,
                                    // or fires some event that apps can hook into.  For now, we just log to console
                                    console.log("error uploading file: ", err);
                                }
                            });
                        }
                        else
                            // tbd: same as above error
                            console.log("error uploading file: ", result);
                    },

                    error: function (err) {
                        // tbd: same as above error
                        console.log("error uploading file: ", err);
                    }
                });*/
            });
        },
        /*
        // tbd: this function should get called by a WINS-like notification service.
        readRoamingFileFromRemoteStore: function (fileId) {
            // Roaming files are read from the local store; we asynchronously keep them up to date using a WINS-equivalent push notification service
            // tbd: don't have WINS implemented yet.
            $.ajax({
                type: "GET",
                url: "http://www.bluesky.io/_ws/webService.svc/GetAppRoamingFile",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: {
                    "appId": $.cookie("appId"),
                    "userId": $.cookie("userId"),
                    "fileId": fileId
                },

                success: function (result) {
                    if (result.Success) {
                        // find the folder starting in the root; create folders as needed
                        // tbd: does win8's getFolderAtPath create the folder hierarchy, or does it err out?  If the latter, then use an internal function to do this.
                        Windows.Storage.ApplicationData.current.roamingFolder.getFolderFromPathAsync(unescape(result.FilePath)).then(function (folder) {
                            // update file in local storage.
                            folder.createFileAsync(result.FileName).then(function (file) {
                                Windows.Storage.FileIO.writeTextAsync(file, unescape(result.FileContents));
                            });
                        });
                    } else {
                        console.log("error reading roaming file from remote store", result);
                    }
                },

                error: function (err) {
                    onError("error uploading file: ", err);
                }
            });
        }*/
    }
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
            var parts = this._formatTemplate.split(" ");
            var result = "";
            // TODO: Parse the format string.  For now, hardcoded to what the bluesky samples need
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var partParts = part.split(".");
                switch (partParts[0]) {
                    case "hour":
                        if (i < parts.length - 1 && parts[i + 1] == "minute") {
                            result += date.getHours() + ":" + date.getMinutes();
                            i++;
                        }
                        else
                            result += date.getHours();
                        break;

                    case "minute":
                        result += date.getMinutes();
                        break;

                    case "year":
                        if (partParts[1] && partParts[1] == "abbreviated")
                            result += date.getFullYear() - 2000;
                        else
                            result += date.getFullYear();
                        break;

                    case "month":
                        if (partParts[1] && partParts[1] == "abbreviated")
                            result += this._abbreviatedMonths[date.getMonth()];
                        else
                            result += this._fullMonths[date.getMonth()];
                        break;

                    case "day":
                        result += date.getDate();
                        break;

                    case "dayofweek":
                        result += this._abbreviatedDays[date.getDay()];
                        break;
                }
                result += " ";
            }
            return result;
        },
        // TODO: Start with Mon or Sun?
        _fullDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        _abbreviatedDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        _fullMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        _abbreviatedMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    }, {
        // TODO
        shortDate: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },

        // TODO
        longDate: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },

        // TODO
        shortTime: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },
    })
});



// ================================================================
//
// Windows.Globalization.Calendar
//
//		TODO: Stubbed out for test purposes
//
//		NYI NYI NYI
//
// =========================================================
//
// Minimalist implementation of Globalization to unblock stockSample
//
WinJS.Namespace.define("Windows.Globalization", {

    Calendar: WinJS.Class.define(function () {
    }, {
        setToMin: function () {
        },
        setToMax: function () {
        }

    }),
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

        // Ensure we're running in a supported environment
        if (!this._supportedBrowser()) {
            // TODO: I'd prefer to set document.body.innerHTML directly, but document.body is null at this point the startup 
            //       flow.  Find the right place to slot this.
            document.location.href = "http://bluesky.io/unsupportedBrowser.html";
            return;
        }

        // Initialize bluesky
        Bluesky.initialize();

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

                    activatedOperation: new Windows.UI.WebUI.ActivatedOperation(),

                    splashScreen: {

                        imageLocation: {
                            x: (window.innerWidth - 620) / 2,
                            y: (window.innerHeight - 300) / 2,
                            height: 300,
                            width: 620
                        },

                        // TODO (NYI) splashScreen.ondismissed
                        ondismissed: {
                        }
                    }
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


    // ================================================================
    //
    // private function: _supportedBrowser
    //
    _supportedBrowser: function () {

        // Support version 9.0 and higher in IE
        if ($.browser.msie && parseInt($.browser.version) >= 9)
            return true;

        // Support Version 12.0 and higher in Opera
        if ($.browser.opera && parseInt($.browser.version) >= 12)
            return true;

        // Support version 16.0 and higher in Firefox
        if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
            var ffversion = new Number(RegExp.$1)
            if (ffversion >= 16)
                return true;
        }

        // support version 5 and higher in safari
        if ($.browser.safari && navigator.userAgent.indexOf("Version/1.") == -1
                             && navigator.userAgent.indexOf("Version/2.") == -1
                             && navigator.userAgent.indexOf("Version/3.") == -1
                             && navigator.userAgent.indexOf("Version/4.") == -1)
            return true;

        // If here, then we do not recognize the browser.  Sorry!
        return false;
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

    _pageCacheBuster: "",
    _curPageLoadedExtFiles: [],

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

            // Generate a unique cache buster per page.  If a page has multiple subpages that all load the same script or css, then only one of each will get loaded.
            if (Bluesky.Settings.cacheBustScriptsAndStyles)
                WinJS.Navigation._pageCacheBuster = "_bsid=" + Date.now() + Math.floor((Math.random() * 1000000));


            // Keep track of all styles being loaded during 'this' navigate, and only load each once.  
            WinJS.Navigation._curPageLoadedExtFiles = [];

            // Disallow second-navigations
            // NOTE: Win8 does not appear to do this; we do because we like crashing less often.
            if (that.curPageInfo) {
                if (that.curPageInfo.location == targetPath) {
                    // second-check: ensure user isn't redirecting going back to same page during 'ready' (et al) with different options
                    // TODO: This check is failing.
                    //console.log(targetPath, options, that.curPageInfo.options);
                    //        if (that.curPageInfo.options == options) {
                    //           return onNavigationComplete(false);
                    //      }
                }
            }
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
                    onNavigationComplete(false);
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward

                // unload previous pages' scripts (if any)
                WinJS.UI.Pages._curPageScripts.forEach(function (src) {
                    $("script[src^='" + src + "']").remove();
                });
                WinJS.UI.Pages._curPageScripts = [];

                // Hide any clickeaters
                WinJS.UI._hideClickEaters();
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Unload previous pages' controls
                // TODO: Need to create test cases in Win8 and see if they do this in .navigate.
                $("[data-win-control]").each(function () {

                    if (this.winControl && this.winControl._unloadOnNavigate)
                        this.winControl._unloadOnNavigate();
                });

                // Wait until the navigating setPromise (set by caller) - if any - is fulfilled
                return WinJS.Promise.as(navigatingSetPromise);

            }).then(function () {

                // Add the current page (and options) to the backStack.
                if (that.curPageInfo && that.curPageInfo.location != "")
                    that.backStack.push(that.curPageInfo);

                // Track the new page as the current page
                that.curPageInfo = newPageInfo;
                that.curPageInfo.options = options;

                newPageInfo.setPromise = function (p) { navigatedSetPromise = p; };

                // Notify listeners of the navigated event
                that._notifyNavigated(that.curPageInfo);

                if (navigatedSetPromise)
                    WinJS.Promise.as(navigatedSetPromise).then(function () {
                        onNavigationComplete(true);
                    });
                else {
                    onNavigationComplete(true);
                }
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

        if (this._navigating)
            return;
        this._navigating = true;

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
                    that._navigating = false;
                    return false;
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Unload previous pages' controls
                // TODO: Need to create test cases in Win8 and see if they do this in .navigate.
                $("[data-win-control]").each(function () {

                    if (this.winControl && this.winControl._unloadOnNavigate)
                        this.winControl._unloadOnNavigate();
                });

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
                that._navigating = false;
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

        if (this._navigating)
            return;
        this._navigating = true;
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
                    that._navigating = false;
                    return false;
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Unload previous pages' controls
                // TODO: Need to create test cases in Win8 and see if they do this in .navigate.
                $("[data-win-control]").each(function () {

                    if (this.winControl && this.winControl._unloadOnNavigate)
                        this.winControl._unloadOnNavigate();
                });

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
                that._navigating = false;

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
WinJS.Namespace.define("WinJS.Resources", {

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
    getString: function (a) {
        if (!WinJS.Resources._warnedGetString) {
            console.warn("WinJS.Resources.getString is NYI");
            WinJS.Resources._warnedGetString = true;
        }
        return a;
    },
    _warnedGetString: false,


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

            cancel: function () {
                console.warn("WinJS.Promise.cancel: NYI");
            }
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

        // We only wrap objects
        if (typeof data === "object") {

            // If we've already wrapped it then return the existing observable wrapper
            if (data._observable)
                return data._observable;

            // Create an observable wrapper object around the data.
            var observableClass = WinJS.Binding.define(data);

            // Return the observable object.  Caller can bind to data via the wrapper's .bind() function.
            return new observableClass(data);

        } else {
            // We can only wrap objects; entities such as numbers and functions are not observable.
            return data;
        }
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.bind
    //
    //      MSDN: TODO
    //
    //      TODO: Not fully implemented or tested
    //
    bind: function (source, data) {

        // Ensure the source is observable
        var bindingSource = WinJS.Binding.as(source);

        // Iterate over all keys in the data, hooking up on-change callback functions and recursing in as needed
        Object.keys(data).forEach(function (dataKey) {

            // If the current data item is a callback function then bind it to changes on the specified key.
            // If instead the data item is an object then recurse into it.
            var bindingData = data[dataKey];
            if (typeof (bindingData) === "function") {

                // Bind changes to the 'dataKey' member on the surce object to the function 'bindingData'
                bindingSource.bind(dataKey, bindingData);
            }
            else {

                // The item is an object; recurse into it and bind its subobjects.  Also, when the object itself changes we'll rebind here.
                bindingSource.bind(dataKey, function (bindableObject) {
                    WinJS.Binding.bind(bindableObject, bindingData);
                });
            }
        });
        return bindingSource;
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.define
    //
    //      MSDN: TODO
    //
    define: function (data) {

        // Return a function that generates an observable class with the properties in the specified data object
        var newClass = WinJS.Class.define(function (initialState) {

            initialState = initialState || {};

            // Store a reference to the original source data
            this.backingData = initialState;

            // Initialize listeners
            this.listeners = {};

            // Mix in the initial data values
            var bindableData = WinJS.Binding.expandProperties(initialState);
            Object.defineProperties(this, bindableData);

            // Store references to and from the observer
            initialState._observable = this;
            this._observable = this;
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

		        // Do a one-time upfront change notification on the value
		        action(this[name]);

		        return this;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.Binding.getProperty
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701588.aspx
		    //
		    getProperty: function (name) {

		        return WinJS.Binding.as(this.backingData[name]);
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

		        var oldValue = this.backingData[name];
		        var newValue = WinJS.Binding.unwrap(value);

		        // If the value didn't change then we don't fire notifications, but we still need to return a promise
		        if (newValue == oldValue)
		            return WinJS.Promise.as();

		        // The value changed; update it in the source data
		        this.backingData[name] = newValue;

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
		});

        // Combine the list of properties from 'data' into the class prototype we created above.
        return WinJS.Class.mix(newClass, WinJS.Binding.expandProperties(data));
    },


    // ================================================================
    //
    // public function: WinJS.Binding.unwrap
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211870.aspx
    //
    unwrap: function (data) {

        if (data && data.backingData)
            return data.backingData;

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
                for (var targetField in winBinds) {
                    var winBind = winBinds[targetField];

                    // If a converter was specified, then include it in the binding process.
                    var convIndex = winBind.indexOf(" ");
                    var converter = null;
                    if (convIndex > -1) {
                        // A converter was specified; grab the name of the converter (after the space) and set the name
                        // of the field to the contents before the space
                        var parts = winBind.split(" ");
                        converter = eval(parts[1]);
                        winBind = parts[0];
                    }

                    // Source and target fields can contain... interesting... contents, such as "background.color['green']".  Parse them out here.
                    var targetFields = WinJS.Binding._parseFields(targetField);
                    var sourceFields = WinJS.Binding._parseFields(winBind);

                    WinJS.Binding._bindField(this, targetFields, sourceFields, dataContext, converter);
                }
            });

            // Notify that we've fulfilled our promise to processAll
            onComplete();
        });
    },


    // ================================================================
    //
    // private Function: WinJS.Binding._parseFields
    //
    //      The usual format for source and target binding fields is e.g. "color" or "background.color"; however, they can 
    //      also contain values such as "color['green']".  This function parses these strings into arrays
    //
    _parseFields: function (fieldString) {

        // First, perform the 'usual' parse
        var fields = fieldString.split('.');
        var results = [];

        // Now iterate over all of the fields, parsing unusual formats as we go
        // TODO: This is incomplete and only parsing a few scenarios.  I need to understand the full breadth of what we need to support here, and implement
        //       that.  Also TODO: can we merge this into the win-option parsing code?
        fields.forEach(function (field) {

            // Handle special cases
            if (field.indexOf('[') > -1) {
                // special case: handle foo['bar']
                // TODO (CLEANUP): Use regex here.  Also: very special-cased right now.
                var firstField = field.substr(0, field.indexOf('['));
                var secondFieldStart = field.substr(firstField.length + 2);
                var secondField = secondFieldStart.substr(0, secondFieldStart.indexOf(']') - 1);
                results.push(firstField);
                results.push(secondField);

            } else {

                // default case
                results.push(field);
            }
        });

        return results;
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.converter
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229809.aspx
    //
    converter: function (doConvert) {

        // Create and return a default initializer for the specified doConvert function
        return WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            return doConvert(source[sourceProperty]);
        });
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.initializer
    //
    //      MSDN: TODO
    //
    initializer: function (converter) {
        return converter;
    },


    // ================================================================
    //
    // private Function: WinJS.Binding._bindField
    //
    //  listens for changes on the specified data field and updates the specified DOM element when the field changes
    //
    _bindField: function (targetElement, targetField, sourceField, dataContext, initializer) {

        // Get an observable wrapper around dataContext and bind to that
        var observer = WinJS.Binding.as(dataContext);
        if (observer._observable)
            observer = observer._observable;

        // If the dataContext is observable then establish a bind contract so that we can update the target when the bound object's values change.
        // Although the previous line set up an observable wrapper, if dataContext isn't observable (e.g. it's a number) then we couldn't wrap it.
        if (observer) {

            var lastProperty = targetField[targetField.length - 1];

            // Source field can be multiple levels deep (e.g. "style.background.color").  If there's only one then bind to it; if there's more than
            // one then we need to recurse in, binding as we go
            if (sourceField.length == 1) {

                // We're at the 'end' of the source field; bind _changes to that field_ (sourceField[0]) on _the observer_ to
                // set the _targetElement's targetProperty_ to the updated value.
                observer.bind(sourceField[0], function (newValue) {
                    if (initializer)
                        newValue = initializer(dataContext, sourceField, targetElement, targetField);
                    var t = targetElement;
                    for (var i = 0; i < targetField.length - 1; i++)
                        t = t[targetField[i]];
                    t[lastProperty] = newValue;
                });

            } else {

                // We are binding to a complex property.  
                var subData = {};
                var currentNode = subData;

                // Iterate over the elements of the source Field, generating an object tree structure that matches it and setting the 'bottom' node
                for (var i = 0; i < sourceField.length; i++) {
                    if (i == sourceField.length - 1)
                        currentNode[sourceField[i]] = function (newValue) {
                            targetElement[lastProperty] = newValue;
                        };
                    else
                        currentNode = currentNode[sourceField[i]] = {};
                }

                return WinJS.Binding.bind(observer, subData);
            }
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

// ================================================================
//
// WinJS.Binding._ListBase
//
//		Implementation of the WinJS.Binding._ListBase object
//
WinJS.Namespace.define("WinJS.Binding", {

    // Unique identifier for each List
    _uniqueListId: 1,

    // ================================================================
    //
    // private Object: WinJS.Binding._ListBase
    //
    _ListBase: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.Binding._ListBase constructor
		//
        function () {

            // Give this list a unique Id to allow for quick equality comparisons
            this._id = WinJS.Binding._uniqueListId++;
        }, 

		// ================================================================
		// WinJS.Binding._ListBase Member functions
		// ================================================================

        {

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
            // public function: WinJS.Binding._ListBase.getAt
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
            // private function: WinJS.Binding._ListBase._getValues
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
            // public function: WinJS.Binding._ListBase.concat
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
            // public function: WinJS.Binding._ListBase.join
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700759.aspx
            //
            join: function (separator) {

                return this._getValues().join(separator || ",");
            },



            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.forEach
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700747.aspx
            //
            forEach: function (callback, thisArg) {

                this._getValues().forEach(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.map
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700766.aspx
            //
            map: function (callback, thisArg) {

                return this._getValues().map(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.some
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700804.aspx
            //
            some: function (callback, thisArg) {

                return this._getValues().some(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.every
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700744.aspx
            //
            every: function (callback, thisArg) {

                return this._getValues().every(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.reduce
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700784.aspx
            //
            reduce: function (callback, initialValue) {

                return this._getValues().reduce(callback, initialValue);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.reduceRight
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700782.aspx
            //
            reduceRight: function (callback, initialValue) {

                return this._getValues().reduceRight(callback, initialValue);
            },

            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.indexOf
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700757.aspx
            //
            indexOf: function (searchElement, fromIndex) {

                return this._getValues().indexOf(searchElement, fromIndex);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.lastIndexOf
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
            // public function: WinJS.Binding._ListBase.slice
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700802.aspx
            //
            slice: function (start, end) {

                return this._getValues().slice(start, end);
            },

            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.filter
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700745.aspx
            //
            filter: function (callback, thisArg) {

                return this._getValues().filter(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createFiltered
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700741.aspx
            //
            createFiltered: function (inclusionFunction) {

                return new WinJS.Binding.FilteredListProjection(this, inclusionFunction);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createGrouped
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700742.aspx
            //
            createGrouped: function (groupKeySelector, groupDataSelector, groupSorter) {

                return new WinJS.Binding.GroupedSortedListProjection(this, groupKeySelector, groupDataSelector, groupSorter);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createSorted
            //
            //		MSDN: TODO
            //
            //      NYI NYI NYI: Stub function that does not actually sort
            //
            createSorted: function (sorterFunction) {

                return new WinJS.Binding.FilteredListProjection(this, function (i) { return true; });
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.addEventListener
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
            // public function: WinJS.Binding._ListBase.removeEventListener
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
            // private function: WinJS.Binding._ListBase._notifyItemChanged
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
            // private function: WinJS.Binding._ListBase._notifyItemRemoved
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
            // private function: WinJS.Binding._ListBase._notifyItemInserted
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
        }, {

            // ================================================================
            //
            // private function: WinJS.Binding._ListBase.copyItem
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
	    // public function: WinJS.Binding.List.dispose
	    //
	    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh921598.aspx
	    //
		dispose: function () {
		    // TODO: Anything to do here?
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
					var newItem = WinJS.Binding._ListBase.copyItem(prevItem);
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

			index = (index + this.length) % this.length;

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
		    _spliceAtKey: function (key, numberToRemove) {

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
		        if (numberToRemove > 0) {

		            // Create the list of keys to remove
		            var removedKeys = [];
		            var filteredKeyIndex = this._filteredKeys.indexOf(key);
		            var lastIndexToRemove = this._filteredKeys.length;

		            for (var i = filteredKeyIndex; i < lastIndexToRemove && numberToRemove > 0; i++) {
		                removedKeys.push(this._filteredKeys[i]);
		                numberToRemove--;
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

		        var key = eventData.detail.key;
		        var index = eventData.detail.index;
		        var oldValue = eventData.detail.oldValue;
		        var newValue = eventData.detail.newValue;

                // Determine if the item was and now is in this list.
		        var oldValueFilter = this._inclusionCallback(oldValue);
		        var newValueFilter = this._inclusionCallback(newValue);

		        if (oldValueFilter && newValueFilter) {

		            // Item was in the list before and still is; notify any listeners that the item's changed
		            this._notifyItemChanged({
		                key: key,
		                index: this._filteredKeys.indexOf(key),
		                oldItem: eventData.detail.oldItem,
		                oldValue: oldValue,
		                newItem: eventData.detail.newItem,
		                newValue: newValue
		            });

		        } else if (oldValueFilter) {

                    // Item was in this list before, but is now filtered out
		            this._itemRemoved({
		                detail: {
		                    key: key,
		                    index: index,
		                    item: eventData.detail.oldItem,
		                    value: oldValue
		                }
		            });

		        } else if (newValueFilter) {

		            // Item was NOT this list before, but is now
		            this._itemInserted({
		                detail: {
		                    key: key,
		                    index: index,
		                    value: newValue
		                }
		            });
		        }
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
		function (sourceList, groupKeySelector, groupDataSelector, groupSorter) {
			
			this._groupedItems = [];

			// Our projected list of groups; not actually created until requested
			this._groupsProjection = null;

			// The list of keys (from the source list) sorted 
			this._sortedKeys = [];  // TODO: move into separate SortedListProjection base class

			this._groupSorter = groupSorter || this._sortFunction;

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
				item = WinJS.Binding._ListBase.copyItem(item);
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
			        return that._groupSorter(left, right);
			    });
			},


		    // ================================================================
		    //
		    // private function: WinJS.Binding.GroupedSortedListProjection._sortFunction
		    //
			_sortFunction: function (left, right) {

			    if (left < right) return -1;
			    if (left == right) return 0;
			    return 1;
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
		                data: sourceList._groupDataSelector(item.data)
		            };
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
		                data: this._list._groupDataSelector(eventData.detail.value)
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
		{// ================================================================
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

		        // TODO: I'm doing "that = this" all over the place because I don't know the js pattern to get "this" to
		        // be "this Template" in the Promise below.  I suspect there's some bind (js bind, not winjs bind)-related 
		        // solution.  Once known, scour the code and remove the "that = this"'s where possible.
		        var that = this;

		        // We need to grab our place in the target (if defined) so that display order is gauranteed if multiple bindings are happening in parallel.
		        var $placeholder = $("<div class='win-template'></div>");
		        if (container)
		            $(container).append($placeholder);

		        var bindElementToData = function (templateElement, data) {

		            // Clone the template prior to populating it
		            var $template = $(templateElement).clone();

		            // Give the cloned element a unique identifier
		            blueskyUtils.setDOMElementUniqueId($template[0]);

		            // Bind the data into the cloned template
		            return WinJS.Binding.processAll($template[0], data).then(function () {

		                // Add the now-populated cloned template's contents to the target container
		                if (container) {

                            // Place the bound template's contents at the placeholder in the target
		                    var $result = $placeholder.after($template.contents());

                            // Remove the placeholder since we no longer need it
		                    $placeholder.remove();

                            // And return the bound template's contents
		                    return $result[0];
		                } else {

                            // No target element was specified so no placeholder to deal with - just return the bound template's contents
		                    return $template.contents();
		                }
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

		        var renderComplete = WinJS.Promise.as(dataContext).then(function (data) {
		            return elementReady.then(function (element) {
		                return bindElementToData(element, data);
		            });
		        });

		        // Before processing, check if the caller specified a timeout.  Per the win8 docs, a value of 0 =
		        // no delay, a negative value is an msSetImmediate, and positive is a timeout.
		        if (!that.processTimeout) {
		            return renderComplete;
		        } else {

		            // Because bluesky's msSetImmediate is just a timeout(0), we can do this
		            return WinJS.Promise.timeout(Math.max(0, that.processTimeout)).then(function () {

		                return renderComplete;
		            });
		        }
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

            // Process the element.  Unlike processAll, this does not handle all child processable elements.
            blueskyUtils.ensureDatasetReady(element);
            if (element.dataset && element.dataset.winControl) {

                // If we are in the process of defining a Page, then ensure that 'this' control is ready before the page indicates that it is ready
                //                if (WinJS.UI.Pages._definingPage) {
                var t = WinJS.UI._processElement(element);
                t.then(onComplete);

                if (WinJS.UI.Pages._renderingPage)
                    WinJS.UI.Pages._renderingPage._subElementPromises.push(t);
            }
            else
                onComplete();
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
                rootElement = document.body;

            // Process the element
            WinJS.UI.process(rootElement).then(function () {

                // Process all processable child elements; i.e. those tagged with data-win-control
                var renderPromises = [];
                $("[data-win-control]", rootElement).each(function () {

                    renderPromises.push(WinJS.UI.process(this));
                });
                onComplete();
            });
        });
    },

    _processElementStack: [],
    // ================================================================
    //
    // private Function: WinJS.UI._processElement
    //
    //		Processes a single DOM element; called by WinJS.UI.process and WinJS.UI.processAll
    //
    _processElement: function (elementIn) {

        var element = elementIn;    // TODO (CLEANUP): Validate closures everywhere
        return new WinJS.Promise(function (onComplete) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI._processElement: Undefined or null element specified.");
            /*ENDDEBUG*/

            // If we've already processed the element in a previous call to process[All], then don't re-process it now.
            if (element.winControl) {
                onComplete(element.winControl);
                return;
            }
            // If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
            // into a valid JS object before passing to the constructor.
            var options = element.dataset.winOptions ? blueskyUtils.convertDeclarativeDataStringToJavascriptObject(element.dataset.winOptions) : null;

            // Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object
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
            // 
            if (!controlConstructor) {
                console.error("bluesky: Unknown control specified in WinJS.UI._processElement: " + element.dataset.winControl);
                return;
            }
            /*ENDDEBUG*/
            var completed = function () {
                onComplete(element.winControl);
            }

            // Instantiate the actual winControl.
            element.winControl = new controlConstructor(element, options, completed);

            // Create a reference from the wincontrol back to its source element
            element.winControl.element = element;

            // If the control does not have a completion handler, then completed will never get called; go ahead and call it now.
            if (controlConstructor.length < 3)
                completed();
        });
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
    _warnedExecuteAnimationNYI: false,
    executeAnimation: function (anim) {

        // TODO: Implement this.
        if (!_warnedExecuteAnimationNYI) {
            console.warn("Bluesky: WinJS.UI.Animation.executeAnimation is NYI");
            _warnedExecuteAnimationNYI = true;
        }
    },

    executeTransition: function (element, props) {
        return new WinJS.Promise(function (c) {
            $(element).css(props.property, props.to);
            console.log("trans", element, props);
            c();
        });
    },

    /*
    execAnimation: function (element, props) {
        return new WinJS.Promise(function (c) {
            $(element).css(props.property, props.to);
            console.log("anim", element, props);
            c();
        });
    },*/


    // ================================================================
    //
    // public function: WinJS.UI.setControl
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440977.aspx
    //
    //  TODO: HMM - trying to do this on Win8 gives a "function not known" exception.  Doc or code bug?
    //
    setControl: function (handler) {

        // Per todo above, not sure what to do here; drop a warning to the console
        /*DEBUG*/
        console.warn("WinJS.UI.setControl is not implemented, as it does not appear to exist on Win8!");
        /*ENDDEBUG*/
    },


    // ================================================================
    //
    // public function: WinJS.UI.eventHandler
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967816.aspx
    //
    eventHandler: function (handler) {

        WinJS.Utilities.markSupportedForProcessing(handler);
    },


    // ================================================================
    //
    // public function: WinJS.UI.scopedSelect
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/Hh921605.aspx
    //
    scopedSelect: function (selector) {

        return document.querySelector(selector);
    },


    // ================================================================
    //
    // private function: WinJS.UI.scopedSelect
    //
    //      Called when the app is navigating to a new page; hide appbar
    //
    //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
    //
    _hideClickEaters: function () {
        WinJS.UI.AppBar._hideClickEater();
        WinJS.UI.Flyout._hideClickEater();
    },


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

    // Unique identifier for each IListDataSource
    _uniqueListId: 1,

    // ================================================================
    //
    // public interface: WinJS.UI.IListDataSource
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211786.aspx
    //
    IListDataSource: WinJS.Class.define(function (sourceList, listItems) {

        this._list = sourceList;
        //this._items = WinJS.Binding.as(listItems);

        // Give this IListDataSource a unique Id to allow for quick equality comparisons
        this._id = WinJS.UI._uniqueListId++;
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
		                for (var i = 0; i < items.length; i++) {
		                    if (typeof items[i] != "number") {
		                        console.error("Passing an array of objects to WinJS.UI.ISelection.add, but ISelectionRange is NYI");
		                        break;
		                    }
		                }
		            }

		            // We want to get values from our listview's actual databound list.
		            var curList = that._list.itemDataSource._list;

		            for (var i = 0; i < items.length; i++) {
		                var value = items[i];
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

		                if (!that._containsItemByKey(item.key)) {
		                    // The item we obtained above may have an index; if this selection's list is a filtered list, then that index may
		                    // be wrong (since it's for the full list).  So: copy the item and set its index here.
		                    item = WinJS.Binding._ListBase.copyItem(item);
		                    item.index = i;

		                    that._selectedItems.push(item);
		                }
		            }

		            // Notify our list
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

		                var indexOfItem = that._getIndexByKey(item.key);
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
		            // Our items' indices may have changed (e.g. due to list changing), so get updated index here.
		            // TODO: Should Iselection listen to changes on _list._itemDataSource?
		            var itemIndex = that._list._itemDataSource._list.indexOf(item.data);
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
		        return new WinJS.Promise(function () {
		            that._selectedItems = [];
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
		        that._selectedItems = [];
		        that._list.itemDataSource.getCount().then(function (count) {
		            for (var i = 0; i < count; i++) {
		                that.add(i);
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
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.ISelection._containsItemByKey
		    //
		    //		Returns true if this selection contains an item with the specified key
		    //
		    _containsItemByKey: function (key) {

		        return this._getIndexByKey(key) != -1;
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.ISelection._getIndexByKey
		    //
		    //		Returns Index of the item in _selectedItems with the specified key, or -1 if not found
		    //
		    _getIndexByKey: function (key) {

		        for (var i = 0; i < this._selectedItems.length; i++)
		            if (this._selectedItems[i].key == key)
		                return i;

		        // Item with specified key not found
		        return -1;
		    }
		})
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
		    this._hidden = (!!options.hidden || options.hidden == "false") ? false : true;
		    this._disabled = (options.disabled == true || options.disabled == "true") ? true : false;
		    this._sticky = (options.sticky == true || options.sticky == "true") ? true : false; // TODO: CLEANUP
		    this._layout = options.layout || "commands";

		    // Track that this is an appbar
		    this._isBlueskyAppBar = true;

		    // Call into our base class' constructor
		    WinJS.UI.BaseControl.call(this, element, options);

		    // Create our DOM hierarchy
		    var $root = this.$rootElement;
		    $root.addClass("win-overlay");
		    $root.addClass("win-appbar");
		    $root.addClass("win-commandlayout");
		    $root.attr("role", "menubar");
		    $root.css("visibility", this._hidden ? "hidden" : "visible");
		    $root.css("display", this._hidden ? "none" : "block");
		    this.placement = options.placement || "bottom";

		    if (this._layout == "custom") {
		        WinJS.UI.processAll(this.element);
		    }

		    // Populate commands
		    this._commands = [];
		    var that = this;
		    $("button, hr", $root).each(function (i, button) {
		        WinJS.UI.processAll(button);
		        if (button.winControl) {
		            that._commands.push(button.winControl);
		            that.addEventListener("beforehide", button.winControl._appBarHiding.bind(button.winControl));
		        }
		    });

		    // When the AppBar loses focus, hide it
		    this.$rootElement.focusout(function (event) {

		        // TODO (CLEANUP): If a flyout is showing from an appbarcommand, then clicking on the flyout should not make the appbar disappear - but since the appbar
		        // disappears if it loses focus, that's exactly what happens.  So, we track the last mousedown that occurred, and in the appbar focusout handler we ignore
		        // the focusout event if it happened very recently.
		        if (WinJS.UI._flyoutClicked && Date.now() - WinJS.UI._flyoutClicked < 250)
		            return;

		        // TODO (CLEANUP): Similar hackiness to above
		        if (that._appBarCommandClickedTime && Date.now() - that._appBarCommandClickedTime < 250)
		            return;

		        if (!that._sticky) {
		            that._hiddenDueToFocusOut = Date.now();
		            that.hide();
		        } else
		            that._hiddenDueToFocusOut = null;

		    });

		    // Capture right-click
		    $("body").bind("contextmenu", { appBar: this }, this._rightClickHandler);

		    // When we're removed from the DOM, unload ourselves
		    this.$rootElement.bind("DOMNodeRemoved", this._unload);
		},

		// ================================================================
		// WinJS.UI.AppBar Member functions
		// ================================================================

		{

		    // ================================================================
		    //
		    // private function: WinJS.UI.AppBar.scopedSelect
		    //
		    //      Called when the app is navigating to a new page; hide appbar
		    //
		    //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
		    //
		    _hideClickEaters: function () {
		        $(".win-appbarclickeater").hide();
		    },

		    // ================================================================
		    //
		    // private function: WinJS.AppBar._rightClickHandler
		    //
		    _rightClickHandler: function (event) {

		        // Prevent default to keep browser's context menu from showing
		        // Don't StopPropagation though, so that other appbars get the event
		        event.preventDefault();

		        var appBar = event.data.appBar;

		        // If we were hidden externally (e.g. our css 'display' property was directly set) instead of through this.hide(), then
		        // change our state to hidden so that we show below)
		        // TODO (CLEANUP): All of the AppBar click-handling makes my skin crawl.
		        if (appBar.$rootElement.css("display") == "none") {
		            appBar._hidden = true;
		            appBar._hiddenDueToFocusOut = null;
		        }

		        // If the user right-clicked while the appbar is visible, then we get a focusout (above) to hide it, and we come here and re-show it, but we shouldn't!
		        // So, if this is happening very soon after a focusout, then don't show
		        if (appBar._hiddenDueToFocusOut && Date.now() - appBar._hiddenDueToFocusOut < 200) {
		            appBar._hiddenDueToFocusOut = null;
		            return;
		        }

		        if (appBar._hidden)
		            appBar.show();
		        else
		            appBar.hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.AppBar._clickEaterFunction
		    //
		    _clickEaterFunction: function () {

		        // If we're not sticky and the user clicked off of the appbar, then hide the appbar
		        if (!this._sticky)
		            this.hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.AppBar._unload
		    //
		    _unload: function (event) {

		        // This is called if the appbar OR an element on the appbar (e.g. an appbarcommand) is removed; make sure it's the appbar
		        if (event.target == this) {
		            var appBar = this.winControl;

		            // Remove our click listener from the appbar click eater
		            if (WinJS.UI._$appBarClickEater)
		                WinJS.UI._$appBarClickEater.unbind("click", appBar._clickEaterFunction);

		            // TODO: What if there are other appbars visible?
		            if (WinJS.UI._$appBarClickEater)
		                WinJS.UI._$appBarClickEater.hide();
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("beforehide", true, true, {});
		            appBar.dispatchEvent(event);

		            // Unbind commands' appbarhiding listeners
		            for (var i = 0; i < appBar._commands.length; i++) {
		                appBar.removeEventListener("beforehide", appBar._commands[i]._appBarHiding);
		            }

		            // Remove our right-click listener from body
		            $("body").unbind("contextmenu", appBar._rightClickHandler);

		            // And remove our listener for when we're removed from the DOM
		            appBar.$rootElement.unbind("DOMNodeRemoved", appBar._unload);
		        }
		    },


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
		        set: function (commands) {

		            // Unbind previous commands' appbarhiding listeners
		            for (var i = 0; i < commands.length; i++) {
		                this.removeEventListener("beforehide", commands[i]._appBarHiding);
		            }

		            // TODO: Does Win8 animate?
		            this._commands = [];
		            this.$rootElement.empty();

		            if (!commands || (typeof commands.length !== "undefined" && commands.length == 0))
		                return;

		            // the 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		            commands = this._realizeCommands(commands);

		            for (var i = 0; i < commands.length; i++) {
		                this._commands.push(commands[i]);
		                this.$rootElement.append(commands[i].element);

		                // the command needs to listen to our hide events so that it can hide flyout (if it has one)
		                this.addEventListener("beforehide", commands[i]._appBarHiding.bind(commands[i]));
		            }
		        }
		    },



		    // ================================================================
		    //
		    // private function: WinJS.AppBar._realizeCommands
		    //
		    _realizeCommands: function (commands) {

		        // Caller can specify one item - if they did then convert it to an array
		        if (typeof commands === "string" || !commands.length)
		            commands = [commands];

		        var realizedCommands = [];

		        // TODO: The MSDN win8 docs say that these functions can take (1) a [array of] string[s], or (2) a [array of] commandbar[s].  However, the MSDN samples
		        //       ALSO pass DOMElements (sigh), so we handle all cases here.  Update this when win8 and MSDN stabilize.
		        // Also note: the docs are unclear on whether or not you can mix-and-match, so we handle them all.
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            if (typeof command === "string") {
		                command = this.getCommandById(command);
		            } else if (command instanceof Element) {
		                command = command.winControl;
		            }
		            realizedCommands.push(command);
		        }
		        return realizedCommands;
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

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

		        // TODO: Animate removal of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
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

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

		        // TODO: Animate addition of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
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

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

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
		                if (WinJS.UI._$appBarClickEater)
		                    WinJS.UI._$appBarClickEater.hide();
		                this._hidden = true;
		            }
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.sticky
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700576.aspx
		    //
		    _sticky: false,
		    sticky: {
		        get: function () {
		            return this._sticky;
		        },
		        set: function (value) {

		            this._sticky = value;
		            if (WinJS.UI._$appBarClickEater) {
		                if (this._sticky)
		                    WinJS.UI._$appBarClickEater.hide();
		                else if (!this._hidden)
		                    WinJS.UI._$appBarClickEater.show();
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

		        $(".win-appbarclickeater").remove();
		        WinJS.UI._$appBarClickEater = $("<div class='win-appbarclickeater'></div>")
                                .appendTo($("body"))
                                .click(this._clickEaterFunction.bind(this))
                                .show();

		        // Give the appbar focus
		        this.element.focus();

		        var that = this;
		        this.$rootElement.css("visibility", "visible").fadeIn("fast", function () {
		            that.$rootElement.css("display", "block")
		            that._hidden = false;
		            if (!that._sticky)
		                WinJS.UI._$appBarClickEater.show();
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, true, {});
		            that.element.dispatchEvent(event);
		        });
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

		        var that = this;
		        this._hiding = true;
		        if (WinJS.UI._$appBarClickEater)
		            WinJS.UI._$appBarClickEater.hide();
		        this.$rootElement.fadeOut("fast", function () {
		            that.$rootElement.css("visibility", "hidden").css("display", "none")
		            that._hiding = false;
		            that._hidden = true;

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("afterhide", true, true, {});
		            that.element.dispatchEvent(event);
		        });
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
		},

		// ================================================================
		// WinJS.UI.AppBar static Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private function: WinJS.UI.AppBar._hideClickEater
            //
            //      Called when the app is navigating to a new page; hide appbar
            //
            //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
            //
            _hideClickEater: function () {
                $(".win-appbar").each(function (i, e) {
                    e.winControl.hide();
                });
            },
        })
});

// ================================================================
//
// Not my finest moment.
//
// So:  On IE, when you $.hide() something, it triggers a focusout.  This allows us to hook and hide
//      the appbar if the app calls $appbar.hide().  On *firefox* though (and possibly other browsers,
//      $.hide() does not trigger focusout.  The *only* way I can see around this is to hook into $.hide()
//      and, if the element in question is an appbar, then tell the actual appbar wincontrol to hide.
//
// TODO: What about other ways to hide, e.g. $appbar.css("display", "none")?  Can hook the same way, but
//       am worried about perf...
//
(function () {
    var orig = $.fn.hide;
    $.fn.hide = function () {
        var result = orig.apply(this, arguments);
        if (this[0] && this[0].winControl && ((this[0].winControl._isBlueskyAppBar && !this[0].winControl._hiding) || this[0].winControl._isFlyout)) {
            this[0].winControl.hide();
        }
        return result;
    }
})();








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
            // TODO (CLEANUP): Clean up how options are defined across all wincontrols
            // TODO (CLEANUP): Sanity check: can boolean options come in as strings ("true" instead of true)?  If not, then clean up the below
            this._type = options.type || "button";
            this._section = options.section || "global";
            this._hidden = (options.hidden || options.hidden == "true") ? true : false;
            this._label = options.label || "";
            this._selected = (options.selected || options.selected == "true") ? true : false;

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

            this.disabled = (options.disabled || options.disabled == "true") ? true : false;

            this.onclick = options.onclick || null;

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

                if (this.element.children.length == 0) {

                    this.$commandImage = $("<span class='win-commandicon win-commandring'><span class='win-commandimage'></span></span>");
                    $root.append(this.$commandImage);
                    this.$label = $("<span class='win-label'>" + this.label + "</span>");
                    $root.append(this.$label);
                }
            }

            // Fix temporary bug in blueskyUtils.parseJson...
            if (options.icon && options.icon.indexOf("(") != -1 && options.icon.indexOf(")") == -1)
                options.icon = options.icon + ")";

            this.icon = options.icon || "";

            // Bind click for flyout
            var that = this;
            $root.bind("click", function (event) {
                if (that._flyout) {
                    event.stopPropagation();
                    event.preventDefault();
                    that._flyout.show(that.element, that.placement == "top" ? "bottom" : "top");
                } else {
                    // TODO: See comment in appbar constructor on the purpose behind appBarCommandClickedTime
                    var appBarNode = that.element.parentNode;
                    if (appBarNode && appBarNode.winControl) {
                        appBarNode.winControl._appBarCommandClickedTime = Date.now();
                    }
                }
            });
        },

		// ================================================================
		// WinJS.UI.AppBarCommand Member functions
		// ================================================================

        {
            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.onclick
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700502.aspx
            //
            onclick: {
                get: function () {
                    return this._prevOnClick;
                },

                set: function (func) {

                    if (!func) {
                        if (this._prevOnClick)
                            this.$rootElement.unbind("click", this._prevOnClick);
                    } else {
                        this.$rootElement.click(func);
                        this._prevOnClick = func;
                    }
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.icon
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700483.aspx
            //
            _icon: true,
            icon: {
                get: function () {
                    return this._icon;
                },
                set: function (value) {
                    this._icon = value;
                    var iconIndex = WinJS.UI.AppBarCommand._iconMap.indexOf(this._icon);
                    if (this.icon.indexOf("url(") == 0)
                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": this._icon,
                            "backgroundPosition": ""
                        });
                    else if (iconIndex >= 0) {
                        var iconStr = (-40 * (iconIndex % 5)) + "px " + (-40 * (Math.floor(iconIndex / 5))) + "px";

                        // TODO (PERF): The app could be using either ui-dark or ui-light, and we want to use different icon png based
                        // on which is loaded.  I'm not sure what the best way is to tell which (if either) is loaded.
                        var iconImage = "http://bluesky.io/images/icons-dark.png";
                        for (var i = 0; i < document.styleSheets.length; i++) {
                            if (document.styleSheets[i].href && document.styleSheets[i].href.toLowerCase().indexOf("ui-dark") >= 0) {
                                iconImage = "http://bluesky.io/images/icons.png";
                                break;
                            }
                        }

                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": "url('" + iconImage + "')",
                            "backgroundPosition": iconStr,
                        });
                    } else
                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": "",
                            "backgroundPosition": ""
                        });

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
                    if (this._disabled)
                        this.$rootElement.attr("disabled", "disabled");
                    else
                        this.$rootElement.removeAttr("disabled");
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
                },
                set: function (value) {
                    this._section = value;
                    if (this._section == "global")
                        this.$rootElement.removeClass("win-selection").addClass("win-global");
                    else
                        this.$rootElement.removeClass("win-global").addClass("win-selection");
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
                    // Win8's styles use the aria-checked attribute to apply selected styling
                    this.$rootElement.attr("aria-checked", value ? "true" : "");
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
        }, {
            _iconMap: ['accept', 'back', 'caption', 'contactpresence', 'document',
					  'accounts', 'bold', 'cc', 'copy', 'download',
					  'add', 'bookmarks', 'characters', 'crop', 'edit',
					  'admin', 'browsephotos', 'clear', 'cut', 'emoji',
					  'aligncenter', 'bullets', 'clock', 'delete', 'emoji2',
					  'alignleft', 'calendar', 'closepane', 'disableupdates', 'favorite',
					  'alignright', 'calendarday', 'comment', 'dislike', 'filter',
					  'attach', 'calendarweek', 'contact', 'dockbottom', 'dinf',
					  'attachcamera', 'camera', 'contact2', 'dockleft', 'flag',
					  'audio', 'cancel', 'contactinfo', 'dockright', 'folder',
					  'font', 'home', 'link', 'movetofolder', 'page2',
					  'fontcolor', 'import', 'list', 'musicinfo', 'paste',
					  'forward', 'importall', 'mail', 'mute', 'pause',
					  'globe', 'important', 'mail2', 'next', 'people',
					  'go', 'italic', 'mailforward', 'openfile', 'permissions',
					  'gototoday', 'keyboard', 'mailreply', 'openlocal', 'phone',
					  'hangup', 'leavechat', 'mailreplyall', 'openpane', 'pictures',
					  'help', 'left', 'mappin', 'orientation', 'pin',
					  'hidebcc', 'like', 'message', 'otheruser', 'placeholder',
					  'highlight', 'likedislike', 'more', 'page', 'play',
					  'previewlink', 'repair', 'settings', 'sync', 'video',
					  'previous', 'right', 'shop', 'trim', 'videochat',
					  'priority', 'rotate', 'showbcc', 'twopage', 'view',
					  'protectedocument', 'rotatecamera', 'showresults', 'underline', 'viewall',
					  'read', 'save', 'shuffle', 'undo', 'volume',
					  'redo', 'savelocal', 'slideshow', 'unfavorite', 'webcam',
					  'refresh', 'selectall', 'sort', 'unpin', 'world',
					  'remote', 'send', 'stop', 'up', 'zoom',
					  'remove', 'setlockscreen', 'stopslideshow', 'upload', 'zoomin',
					  'rename', 'settile', 'switch', 'uploadskydrive', 'zoomout'
            ]
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.AppBarIcon.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

3// ================================================================
//
// WinJS.UI.AppBarIcon
//
//		Implementation of the WinJS.UI.AppBarIcon object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    AppBarIcon: {}
});

// Populate WinJS.UI.AppBarIcon
// TODO (CLEANUP): Don't do this in global context.
var _bsTempIconMap = WinJS.UI.AppBarCommand._iconMap;
for (var i in _bsTempIconMap)
    WinJS.UI.AppBarIcon[_bsTempIconMap[i]] = _bsTempIconMap[i];









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.Animation.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

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

        return WinJS.UI.Animation.fadeOut(elements);
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
            // TODO (CLEANUP): at startup, determine which browser this is, and set blueskyUtils._browserCss["transform"] to the appropriate
            //                 vendor prefix, and then just do one call here.
            // TODO: will break pre-existing transforms?
            $(elements).css("transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
            $(elements).css("-ms-transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
            $(elements).css("-moz-transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
            $(elements).css("-webkit-transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
            $(elements).css("-o-transform", "matrix(0.975, 0, 0, 0.975, 0, 0)");
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
            // TODO (CLEANUP): at startup, determine which browser this is, and set blueskyUtils._browserCss["transform"] to the appropriate
            //                 vendor prefix, and then just do one call here.
            // TODO: will break pre-existing transforms?
            $(elements).css("transform", "none");
            $(elements).css("-ms-transform", "none");
            $(elements).css("-moz-transform", "none");
            $(elements).css("-webkit-transform", "none");
            $(elements).css("-o-transform", "none");
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
                        left: offset.left,
                        top: offset.top,
                    });
                });
                return positionsArray;
            },

            trackedElements: [],
            initialPositions: []
        }),


    // ================================================================
    //
    // public function: WinJS.UI.Animation.createRepositionAnimation
    //
    //		MSDN: TODO
    //
    createRepositionAnimation: function (elements) {

        return new WinJS.UI.Animation._repositionAnimation(elements);
    },


    // ================================================================
    //
    // private class: WinJS.UI.Animation._repositionAnimation
    //
    _repositionAnimation: WinJS.Class.define(

        // Constructor
        function (elements) {

            // Convert to array if only one element; do same for offset
            if (typeof elements.length === "undefined")
                elements = [elements];

            // Store the elements we're tracking.
            this.trackedElements = elements.slice();

            // Store the list of positions for the specified elements
            this.initialPositions = this._getPositions(elements);
        },

        // ================================================================
		// WinJS.UI.Animation._repositionAnimation members
		// ================================================================

        {
            // ================================================================
            //
            // public function: WinJS.UI.Animation._repositionAnimation.execute
            //
            execute: function () {
                var that = this;
                var elements = this.trackedElements;
                this.$animatingElements = [];
                return new WinJS.Promise(function (onComplete) {
                    // Get the tracked Elements' new positions and animate from initial to current.
                    var newPositions = that._getPositions(elements);
                    for (var i = 0; i < elements.length; i++) {

                        var element = elements[i];

                        var $el = $(element);
                        that.$animatingElements.push(element);
                        var originalPosition = $el.css("position");
                        var initialPosition = that.initialPositions[i];

                        var offsetTop = newPositions[i].top - initialPosition.top;
                        var offsetLeft = newPositions[i].left - initialPosition.left;

                        // TODO: Replace jQuery animation with CSS3 transitions
                        // ala: http://css3.bradshawenterprises.com/slide1/

                        $el.offset({
                            top: initialPosition.top,
                            left: initialPosition.left
                        });

                        // Animate top/left back to new position
                        $el.animate({
                            left: (offsetLeft < 0 ? "-" : "+") + "=" + Math.abs(offsetLeft),
                            top: (offsetTop < 0 ? "-" : "+") + "=" + Math.abs(offsetTop)

                        }, {
                            duration: 1000,

                            easing: "easeOut"
                        });
                    }

                    that.$animatingElements = $(elements);
                    that.$animatingElements.promise().done(function () {

                        // Restore original css position 
                        if (!that._canceling) {

                            $(this).css("position", originalPosition);
                            this.$animatingElements = null;
                        }
                        onComplete();
                    });

                });
            },


            // ================================================================
            //
            // private function: WinJS.UI.Animation._repositionAnimation._cancel
            //
            _cancel: function () {

                if (this.$animatingElements) {
                    this._canceling = true;
                    this.$animatingElements.stop(true, false);
                }
            },


            // ================================================================
            //
            // private function: WinJS.UI.Animation._repositionAnimation._getPositions
            //
            _getPositions: function (elements) {

                var positionsArray = [];
                elements.forEach(function (element) {

                    var offset = $(element).offset();
                    positionsArray.push({
                        left: offset.left,
                        top: offset.top,
                    });
                });
                return positionsArray;
            },

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

        // If already in the cache then just return a clone of the cached page.  
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
            // TODO: Should we automatically cache bust like we do in WinJS.UI.Pages._getRemotePage?  Same Q for scripts

            // First, load the fragment's text
            $.get(href, function (response) {

                // Second, Process the loaded page into a document fragment
                that._processFragment(response).then(function (docFrag) {

                    // Third, gaurantee asynchronicity
                    WinJS.Promise.timeout().then(function () {

                        // And finally, Notify listeners that the fragment has been loaded (and processed) into a document fragment
                        fragmentLoadedCallback(docFrag);
                    });
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

            // TODO: Do I need to handle moving id'ed elements to the global namespace?  See Pages._processPage...

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

            // Notify listeners that the fragment has been processed.
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

        var docFrag = this._cacheStore[href].cloneNode(true);
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
    //		Set of previously cached pages. 
    //      _cacheStore[href] = documentFragment
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
    _definingPageSubControls: [],
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

        pageUri = this._normalizeUrl(pageUri).toLowerCase();

        // Get the page constructor for the specified Url
        var pageConstructor = WinJS.UI.Pages.registeredPages[pageUri];

        // If the page constructor doesn't exist, then define it now
        pageConstructor = pageConstructor || WinJS.UI.Pages.define(pageUri);

        // Return the page constructor for the specified url.
        return pageConstructor;
    },


    // ================================================================
    //
    // private function: WinJS.UI.Pages._normalizeUrl
    //
    //		Normalizes the URL to always include host.
    //
    _normalizeUrl: function (pageUri) {

        // Always include host
        // Local execution (e.g. phonegap) - use file:///
        // remote execution (e.g. from website) - use http://
        if (Bluesky.IsLocalExecution) {
            if (pageUri.indexOf("file:") != 0) {
                var slash = pageUri[0] == "/" ? "" : "/";
                pageUri = "file://" + document.location.host + slash + pageUri;
            }
        }
        else {
            if (pageUri.indexOf("http:") != 0) {
                var slash = pageUri[0] == "/" ? "" : "/";
                pageUri = "http://" + document.location.host + slash + pageUri;
            }
        }
        return pageUri;
    },


    // ================================================================
    //
    // public function: WinJS.UI.Pages.define
    //
    //		Defines a new Page and returns a PageControl
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770579.aspx
    //
    _renderingPageStack: [],
    _renderingPage: null,

    define: function (pageUri, members) {

        /*DEBUG*/
        // Parameter validation
        if (!pageUri)
            console.error("WinJS.UI.Pages.define: Undefined or null pageUri specified");
        /*ENDDEBUG*/

        pageUri = this._normalizeUrl(pageUri).toLowerCase();

        // Check to see if an existing definition (keyed on the pageUrI) already exists, and use it if so.
        var existingDefn = this.registeredPages[pageUri];
        if (existingDefn) {
            var pageControl = existingDefn;
        }
        else {
            var pageControl = WinJS.Class.define(function (targetElement, state, completion, parentedPromise) {

                // Set the target element's winControl to this
                targetElement.winControl = this;

                // Track the page that is currently being defined, so that subcontrols on it can be associated with it, and we can wait for them to be ready
                // before we fulfill our renderPromise.
                // TODO: This will break if a Page loads a Page that loads a Page; a seemingly rare case so ignoring for now; but will need to address eventually.

                WinJS.UI.Pages._renderingPageStack.push(this);

                var parentPage = WinJS.UI.Pages._renderingPage;
                WinJS.UI.Pages._renderingPage = this;
                this.element = targetElement;

                // Track the elements which are created as a part of this page's construction; we will wait for those elements to be ready before indicated that our rendering is complete.
                this._subElementPromises = [];

                /*DEBUG*/
                // Parameter validation
                if (!targetElement)
                    console.error("WinJS.UI.Pages.PageControl constructor: Undefined or null targetElement specified");
                /*ENDDEBUG*/

                var thiscomp;
                var p = new WinJS.Promise(function (c) { thiscomp = c; });
                var pageInfo = {
                    Uri: pageUri,
                    element: targetElement
                };
                var that = this;

                this.renderPromise = this._loadPage(pageInfo).then(function () {
                    return that._processPage(pageInfo);

                }).then(function pageAppendScripts() {

                    return that._appendScripts(pageUri);

                }).then(function pageInit() {
                    return that.init && that.init(targetElement, state);
                });

                var renderingCompleted = this.renderPromise.then(function pageParentPromise() {

                    return parentedPromise;

                }).then(function pageProcessAll() {

                    return WinJS.UI.processAll(targetElement);

                }).then(function pageProcessed() {

                    return that.processed && that.processed(targetElement, state);

                }).then(function pageCompletion() {

                    thiscomp();
                    return completion && completion(that);
                }).then(function childElementsComplete() {

                    // On Win8, apps can assume that controls on pages are loaded and ready as soon as they are constructed; this is because everything is running
                    // locally on Win8.  In bluesky, we do not (yet? tbd) require that all content be local, so it could be that, at this point in the page loading
                    // process, the page is 'ready', but the controls on may not be.  Win8's page flow says that the controls are be ready before it says the page
                    // itself is ready; since we can't assume sequentiality, we have to explicitly wait for all processable UI elements to be ready before
                    // we fulfill our renderPromise.

                    // TODO: This is unclear territory with edge cases I may not be seeing.  Keep an eye on this code as samples and apps come in.

                    // TODO: Should this happen before or after ready?  Depends on if Page's controls need to be (1) parented or (2) ready before we indicated we're ready.
                    return WinJS.Promise.join(that._subElementPromises).then(function () {
                        WinJS.UI.Pages._renderingPage = WinJS.UI.Pages._renderingPageStack.pop();
                    });
                });

                renderingCompleted.then(function pageReady() {
                    msSetImmediate(function () {
                            return that.ready && that.ready(targetElement, state);
                    });
                });

                // If we're being constructed in context of another UI Page being constructed, then add our completion promise to that 'parent' page's list of sub element promises.
                if (parentPage)
                    parentPage._subElementPromises.push(p); // renderingComplete? this.renderPromise? :P

                /*
                    // unload previous pages' styles (if any)
                    // TODO: Need to move this into Navigation.navigate
                    WinJS.UI.Pages._previousPageLinks.forEach(function (href) {
                        $("link[href^='" + href + "']").remove();
                    });
                    WinJS.UI.Pages._previousPageLinks = [];
                    WinJS.UI.Pages._renderingPage = null;
                */

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
                // private function: PageControl._appendScripts
                //
                //		Adds a collection of scripts to the page; returns a promise that is fulfilled when all scripts
                //      have been loaded and processed.  NOTE: The approach below is adopted (rather than just appending them
                //      via $.append) because it allows complete debugging in Firebug.  Trust me, this is a good thing.
                //
                _appendScripts: function (pageUri) {
                    var that = this;
                    return new WinJS.Promise(function (scriptsLoaded) {

                        // Track how many scripts we have to load; when *all* of them have completed loading, fulfill
                        // the scriptsLoaded promise.  
                        // TODO: Will this never fulfill if script fails to load (e.g. 404)?

                        // insert scripts after main page scripts
                        that.$styleInsertionPoint = $("script", $("head")).last();
                        var thisPageScripts = [];
                        that.newPageScripts.forEach(function (element) {
                            if (element.attributes.src) {

                                var src = element.attributes.src.value;

                                if (!Bluesky.IsLocalExecution) {
                                    // Change local script paths to absolute
                                    if (src[0] != "/" && src.toLowerCase().indexOf("http:") != 0) {
                                        var thisPagePath = pageUri.substr(0, pageUri.lastIndexOf("/") + 1);
                                        src = thisPagePath + src;
                                    }
                                    // Add a timestamp to force a clean load
                                    if (Bluesky.Settings.cacheBustScriptsAndStyles) {
                                        var char = src.indexOf("?") == -1 ? "?" : "&";
                                        src += char + WinJS.Navigation._pageCacheBuster;
                                    }
                                }

                                // If the script is already being loaded, then ignore; we only load each one once per page.
                                if (WinJS.Navigation._curPageLoadedExtFiles.indexOf(src) == -1) {

                                    WinJS.Navigation._curPageLoadedExtFiles.push(src);
                                    thisPageScripts.push(src);

                                    // track all loaded scripts so that we can unload them on next page navigation
                                    WinJS.UI.Pages._curPageScripts.push(src);
                                }
                            }
                            else
                                that.$styleInsertionPoint.append(element);
                        });


                        if (thisPageScripts.length) {
                            // Load all scripts
                            LazyLoad.js(thisPageScripts, function () {
                                scriptsLoaded();
                            });
                        }
                        else {
                            // If no scripts to load, then fulfill the Promise now
                            scriptsLoaded();
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

                    var uniquePage = pageInfo.Uri;

                    // If loading the file remotely, then add a timestamp to force a clean load
                    if (Bluesky.Settings.cacheBustScriptsAndStyles && !Bluesky.IsLocalExecution) {
                        var char = pageInfo.Uri.indexOf("?") == -1 ? "?" : "&";
                        uniquePage = pageInfo.Uri + char + WinJS.Navigation._pageCacheBuster;
                    }

                    // Use Ajax to get the page's contents
                    WinJS.xhr({
                        url: uniquePage,
                        dataType: "text"
                    }).then(function (response) {
                        // We loaded the page
                        // TODO: error handling
                        pageInfo.response = response.data;

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

                    // TODO (PERF): Grab $("head") once and make it available in blueskyUtils._$head (or somesuch) for internal use only.
                    var $head = $("head", document);

                    // At this point, pageInfo.element == targetElement and pageInfo.response contains the 
                    // text HTML response obtained from pageUri.
                    var that = this;
                    // Return a Promise that we'll process the page (Honestly! We will!)
                    return new WinJS.Promise(function (pageProcessCompletedCallback) {

                        // Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
                        // because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
                        // sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
                        // $("<div></div>").html(pageInfo.response) won't work for the above reason.

                        // replace ms-appx:/// with root /
                        pageInfo.response = pageInfo.response.replace(/ms-appx:\/\/\//gi, "/")

                        // Also note: Per http://molily.de/weblog/domcontentloaded, HTML5 requires browsers to defer execution of scripts until
                        // all previous stylesheets are loaded.  So, we need to rearrange scripts and styles from the loaded page so that styles come before scripts.
                        // This does inject a nontrivial perf hit, but its unavoidable given the need to have styles parsed before scripts reference them (e.g. WinControl sizes).  In order 
                        // to minimize the perf hit somewhat, we push all scripts to the bottom of the page and styles to the top (see rules 5 and 6 here:http://stevesouders.com/hpws/rules.php)
                        // TODO: If this is a problem for a subset of apps, then provide a "WinJS.Bluesky.deferScripts" option and set it to optout.
                        // TODO: How to do this to root page?  Probably just warn user? 

                        // Create the temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
                        // see: http://stackoverflow.com/questions/7738046/what-for-to-use-document-implementation-createhtmldocument
                        var tempDocument = document.implementation.createHTMLDocument("newPage").body;
                        tempDocument.innerHTML = pageInfo.response;


                        // AT THIS POINT: 
                        //	1. tempDocument contains all of the contents of the loaded page as valid DOM element
                        //	2. None of the scripts or styles (local or referenced) have been loaded or executed yet

                        // Keep track of all styles; we'll wait until they've loaded
                        var stylesToWaitFor = [];

                        // get the list of scripts and link that are already in the document; we'll use that list to remove any duplicates from the new page
                        var $existingScripts = $("script", document);
                        var $existingLinks = $("link", document);

                        that.newPageScripts = [];
                        // Process elements
                        var nodesToRemove = [];
                        var removedStyles = [];
                        for (var i = 0; i < tempDocument.childNodes.length; i++) {

                            var element = tempDocument.childNodes[i];
                            if (element.nodeName == "SCRIPT" && element.attributes && element.attributes.src) {
                                var scriptSrc = element.attributes.src.value.toLowerCase();

                                // Fixup scripts to remove win8-specific stuff
                                if (scriptSrc.indexOf("///") == 0) {
                                    scriptSrc = scriptSrc.substr(2);
                                    element.attributes.src.value = scriptSrc;
                                }

                                // remove any scripts which are already in the document
                                $existingScripts.each(function (i, script) {
                                    if (script.attributes.src) {
                                        var existingHref = blueskyUtils.removeBSIDFromUrl(script.attributes.src.value);
                                        if (scriptSrc == existingHref) {
                                            nodesToRemove.push(element);
                                        }
                                    }
                                });

                                // Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
                                if (scriptSrc.indexOf("//microsoft.winjs") > -1)
                                    nodesToRemove.push(element);
                            }
                            if (element.nodeName == "LINK" && element.attributes && element.attributes.href) {
                                var linkSrc = element.attributes.href.value.toLowerCase();

                                // Fixup links to remove win8-specific stuff
                                if (linkSrc.indexOf("///") == 0) {
                                    linkSrc = linkSrc.substr(2);
                                    element.attributes.href.value = linkSrc;
                                }

                                // remove any links which are already in the document
                                $existingLinks.each(function (i, existingLink) {
                                    if (existingLink.attributes.href) {
                                        var existingHref = blueskyUtils.removeBSIDFromUrl(existingLink.attributes.href.value);
                                        if (linkSrc == existingHref) {
                                            removedStyles.push(existingHref);
                                            nodesToRemove.push(element);
                                        }
                                    }
                                });

                                // Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
                                if (linkSrc.indexOf("//microsoft.winjs") > -1)
                                    nodesToRemove.push(element);
                            }
                        }

                        // Remove nodes that were identified as duplicates or otherwise unwanted
                        nodesToRemove.forEach(function (element) {
                            try {
                                tempDocument.removeChild(element);
                            } catch (ex) {
                                debugger;
                            }
                        });

                        // Pull out all scripts; we'll add them in separately
                        var scripts = [];
                        for (var i = 0; i < tempDocument.childNodes.length; i++) {
                            var element = tempDocument.childNodes[i];
                            if (element.nodeName == "SCRIPT") {

                                scripts.push(element);
                                that.newPageScripts.push(element);
                            }
                        }
                        scripts.forEach(function (script) {
                            tempDocument.removeChild(script);
                        });

                        // NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage before
                        // we actually 'realize' the script (to avoid duplicate scripts from being executed once in the root doc and once again in the loaded page).
                        var $newPage = $(tempDocument);

                        // Store the set of links that we loaded for the last page (if any) so that we can remove them after the new styles are loaded.
                        // Note that we cannot remove them yet, as that would result in an unstyled view of the current page being displayed
                        // Special case: both previous and new page contain same script; don't add it to previous page links so that we don't accidentally
                        // remove it...
                        WinJS.UI.Pages._previousPageLinks = [];
                        for (var i in WinJS.UI.Pages._curPageLinks) {
                            var link = WinJS.UI.Pages._curPageLinks[i].toLowerCase();
                            if (removedStyles.indexOf(link) == -1)
                                WinJS.UI.Pages._previousPageLinks.push(link)
                        }
                        WinJS.UI.Pages._curPageLinks = [];

                        // AT THIS POINT: 
                        //	1. The loaded page is ready to be appended to the target element
                        //	2. None of the loaded page's scripts have been executed, nor have its externally referenced scripts or styles been loaded.  

                        // Keep track of all link'ed styles; we'll wait until they've loaded
                        $("link", $newPage).each(function (i, style) {

                            // Change local paths to absolute path
                            var linkSrc = style.attributes.href.value;
                            if (!Bluesky.IsLocalExecution && linkSrc[0] != "/" && linkSrc.toLowerCase().indexOf("http:") != 0) {
                                var thisPagePath = pageInfo.Uri.substr(0, pageInfo.Uri.lastIndexOf("/") + 1);
                                //var host = document.location.protocol.length + 2 + document.location.host.length;
                                //thisPagePath = thisPagePath.substr(host);
                                style.href = thisPagePath + linkSrc;
                            }

                            WinJS.UI.Pages._curPageLinks.push(linkSrc);

                            // Create a promise that we'll wait until the style has been loaded
                            stylesToWaitFor.push(getStyleLoadedPromise(style));
                        });
                        $("link", $newPage).remove();

                        $("meta, title", $newPage).prependTo($head);

                        // B. Remove duplicate styles and meta/charset tags
                        blueskyUtils.removeDuplicateElements("meta", "charset", $head);
                        blueskyUtils.removeDuplicateElements("link", "href", $head);

                        // C. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
                        $("title:not(:first)", $head).remove();

                        // move any scripts out of $newPage and into a temporary list so that we can process them independently
                        //    that.$newPageScripts = $("script", $newPage).remove();
                        // Add the new page's contents to the element (note: use contents instead of children to get text elements as well)
                        var $target = $("<div class='pagecontrol'></div>");//$(pageInfo.element);
                        $target.append($newPage.contents());

                        // AT THIS POINT: 
                        //	1. $target contains all of the elements from the loaded page.
                        //	2. $target may or may not be placed within the DOM, so ELEMENTS WITHIN $target MAY HAVE INVALID DIMENSIONS/STYLES.
                        //  3. All styles from the loaded page have been moved up to the page's head, but possibly not yet parsed into document.styleSheets
                        //	4. No scripts (local or referenced) within the loaded page have been loaded or executed.

                        // Wait until all of the styles have been loaded...
                        WinJS.Promise.join(stylesToWaitFor).then(function () {

                            // Now that the new page's styles, which we previously moved into the document head, are loaded, append the rest of the new page
                            // of the new page to the document.
                            $target.appendTo($(pageInfo.element));

                            // Modern browsers like to add all DOM elements with Ids to the global namespace.  See this link for back-story: http://stackoverflow.com/questions/3434278/ie-chrome-are-dom-tree-elements-global-variables-here
                            // The *problem* is that Firefox (as of v15) does it at a later point than IE (after the page is fully loaded).  SO: We need
                            // to go ahead and forcibly inject all id'ed elements into the DOM now so that scripts on the same page don't break due to unexpectedly missing global
                            // id'ed elements.  Thanks again, IE, for making this necessary! *grimace*
                            // TODO (CLEANUP): I can constrain to $target since default.html is handled elsewhere
                            $("[id]").each(function (index, element) {
                                try {
                                    window[element.id] = element;
                                } catch (e) {
                                }
                            });

                            // We *can't quite* call WinJS.UI.processAll on the loaded page, since it has not yet been parented.  So: just return and
                            // wait for the parentedPromise to be fulfilled...
                            pageProcessCompletedCallback(pageInfo);
                        });
                    });
                },

                // renderPromise: A Promise that is fulfilled when we have completed rendering
                renderPromise: null,
                newPageScripts: null
            });
        }

        // Add members to the page control constructor
        pageControl = WinJS.Class.mix(pageControl, members);

        // Register the page control constructor for subsequent calls to WinJS.UI.Pages.get and WinJS.UI.Pages.define
        this.registeredPages[pageUri.toLowerCase()] = pageControl;
        // Return the new page control constructor
        return pageControl;
    },

    // registeredPages: A map that associates pageUris with page constructor functions
    registeredPages: [],

    // _curPageScripts: The set of scripts on the currently loaded page.
    // TODO: Rationalize this with WinJS.UI.Fragments (Which can also load scripts)
    _curPageScripts: [],
    _curPageLinks: [],
    _previousPageLinks: []
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
	}, {

	    updateLayout: function () {
	    }
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

            // Track that this is a flyout
            this._isFlyout = true;

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
		    // public function: WinJS.UI.Flyout.show
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
			        .addClass("win-overlay")
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
                    .appendTo($("body"))
                    .css({
                        "left": dest.left,
                        "top": dest.top,
                        "visibility": "visible"
                    });

		        $(".win-flyoutmenuclickeater").remove();
		        WinJS.UI._$flyoutClickEater = $("<div class='win-flyoutmenuclickeater'></div>")
                                .appendTo($("body"))
                                .click(WinJS.UI.Flyout._clickEaterFunction)
		                        .show();

		        // TODO (CLEANUP): If this flyout is showing from an appbarcommand, then clicking on the flyout should not make the appbar disappear - but since the appbar
		        // disappears if it loses focus, that's exactly what happens.  So, we track the last mousedown that occurred, and in the appbar focusout handler we ignore
		        // the focusout event if it happened very recently.
		        this.$rootElement.mousedown(function (event) {
		            WinJS.UI._flyoutClicked = Date.now();
		        });

		        this._hidden = false;
		        var that = this;
		        new WinJS.UI.Animation.showPopup(this.element, [{ left: dest.animLeft, top: dest.animTop }]).then(function () {

		            // Ensure the flyout is visible and that another flyout didn't close it during the show (e.g. clicking a button in a menu)
		            WinJS.UI._$flyoutClickEater.show();

		            WinJS.UI._flyoutClicked = Date.now();
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		        this.$rootElement.bind("DOMNodeRemoved", this._unload);
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.Flyout._hideClickEaters
		    //
		    //      Called when the app is navigating to a new page; hide appbar
		    //
		    //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
		    //
		    _hideClickEaters: function () {
		        $(".win-flyoutmenuclickeater").hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.Flyout._unload
		    //
		    _unload: function (event) {

		        // This is called if the Flyout OR an element on the Flyout is removed; make sure it's the Flyout
		        if (event.target == this) {

		            // Remove our click listener from the Flyout click eater
		            WinJS.UI._$flyoutClickEater.unbind("click", this._clickEaterFunction);

		            // TODO: Same question as in appbar._unload: should we hide? what if there are multiple flyouts visible and only one is unloaded?
		            WinJS.UI._$flyoutClickEater.hide();

		            // And remove our listener for when we're removed from the DOM
		            if (this.$rootElement)
		                this.$rootElement.unbind("DOMNodeRemoved", this._unload);
		        }
		    },

		    // ================================================================
		    //
		    // public function: WinJS.UI.Flyout.hide
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
		        WinJS.UI._$flyoutClickEater.hide();
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

		    /*
		    // ================================================================
		    //
		    // private function: WinJS.UI.Flyout._lightDismissHandler
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

            */
		    // ================================================================
		    //
		    // private function: WinJS.UI.Flyout._getLeftPosition
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
		    // private function: WinJS.UI.Flyout._getRightPosition
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
		    // private function: WinJS.UI.Flyout._getTopPosition
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
		    // private function: WinJS.UI.Flyout._getBottomPosition
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
		    // public event: WinJS.UI.Flyout.onafterhide
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
		    // public event: WinJS.UI.Flyout.onaftershow
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
		    // public event: WinJS.UI.Flyout.onbeforehide
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
		    // public event: WinJS.UI.Flyout.onbeforeshow
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
		    // public property: WinJS.UI.Flyout.hidden
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
		    // public property: WinJS.UI.Flyout.alignment
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
		    // public property: WinJS.UI.Flyout.placement
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
		    // public property: WinJS.UI.Flyout.anchor
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770560.aspx
		    //
		    _anchor: true,
		    anchor: {
		        get: function () {
		            return this._anchor;
		        }
		    }
		},

		// ================================================================
		// WinJS.UI.Flyout static Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private function: WinJS.UI.Flyout._hideClickEater
            //
            //      Called when the app is navigating to a new page; hide appbar
            //
            //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
            //
            _hideClickEater: function () {
                $(".win-flyout").each(function (i, e) {
                    e.winControl.hide();
                });
            },


            // ================================================================
            //
            // private function: WinJS.UI.Flyout._clickEaterFunction
            //
            _clickEaterFunction: function () {
                console.log("eaten");
                $(".win-flyout, .win-settingsflyout").each(function (i, e) {
                    e.winControl.hide();
                });
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
                if (typeof this.currentPage === "undefined" || this.currentPage == -1)
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
                        this._notifyDataSourceCountChanged(that.element);
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
	        },

	    })

});









// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.IZoomableView.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

/*DEBUG*/

// ================================================================
//
// WinJS.UI.IZoomableView
//
//		This is the root WinJS.UI.IZoomableView interface
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229794.aspx
//
//		IZoomableView is an interface (abstract), so technically nothing
//		is needed here.  However, for debug builds we warn if the developer
//		neglected to implement any of the required functions
//

WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public interface: WinJS.UI.IZoomableView
	//
	IZoomableView: WinJS.Class.define(null,

		// ================================================================
		//
		// WinJS.UI.IZoomableView Member functions
		//
		// ================================================================

        {
        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.getPanAxis
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229792.aspx
        	//
        	getPanAxis: function () {
        		if (!this._warnedGetPanAxis) {
        			console.warn("bluesky Warning: IZoomableView.getPanAxis has not been implemented on a derived class");
        			this._warnedGetPanAxis = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.configureForZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229789.aspx
        	//
        	_warnedConfigureForZoom: false,
        	configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {
        		if (!this._warnedConfigureForZoom) {
        			console.warn("bluesky Warning: IZoomableView.configureForZoom has not been implemented on a derived class");
        			this._warnedConfigureForZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.setCurrentItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229796.aspx
        	//
        	_warnedSetCurrentItem: false,
        	setCurrentItem: function (x, y) {
        		if (!this._warnedSetCurrentItem) {
        			console.warn("bluesky Warning: IZoomableView.setCurrentItem has not been implemented on a derived class");
        			this._warnedSetCurrentItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.getCurrentItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229791.aspx
        	//
        	_warnedGetCurrentItem: false,
        	getCurrentItem: function () {
        		if (!this._warnedGetCurrentItem) {
        			console.warn("bluesky Warning: IZoomableView.getCurrentItem has not been implemented on a derived class");
        			this._warnedGetCurrentItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.beginZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229788.aspx
        	//
        	_warnedBeginZoom: false,
        	beginZoom: function () {
        		if (!this._warnedBeginZoom) {
        			console.warn("bluesky Warning: IZoomableView.beginZoom has not been implemented on a derived class");
        			this._warnedBeginZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.positionItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229795.aspx
        	//
        	_warnedPositionItem: false,
        	positionItem: function (/*@override*/item, position) {
        		if (!this._warnedPositionItem) {
        			console.warn("bluesky Warning: IZoomableView.positionItem has not been implemented on a derived class");
        			this._warnedPositionItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.endZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229790.aspx
        	//
        	_warnedEndZoom: false,
        	endZoom: function (isCurrentView) {
        		if (!this._warnedEndZoom) {
        			console.warn("bluesky Warning: IZoomableView.endZoom has not been implemented on a derived class");
        			this._warnedEndZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.handlePointer
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229793.aspx
        	//
        	_warnedHandlePointer: false,
        	handlePointer: function (pointerId) {
        		if (!this._warnedHandlePointer) {
        			console.warn("bluesky Warning: IZoomableView.handlePointer has not been implemented on a derived class");
        			this._warnedHandlePointer = true;
        		}
        	}
        })
});
/*ENDDEBUG*/








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
            this._$zoomedInElement = $($(">div", this.$rootElement)[0]);
            this._$zoomedOutElement = $($(">div", this.$rootElement)[1]);
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
            // TODO (CLEANUP): Should listview.configureForZoom handle this?
            this._$zoomedInContainer.css("visibility", "visible");
            this._$zoomedOutContainer.css("visibility", "hidden");

            // When the user clicks on an item in the zoomedout control, zoom into it in the zoomedincontrol
            this._zoomedInView = this._$zoomedInElement[0].winControl;
            this._zoomedOutView = this._$zoomedOutElement[0].winControl;

            // If zoomedinview is a listview, then forward SemanticZoom calls to it's private functions
            this._zoomedInView.beginZoom = this._zoomedInView.beginZoom || this._zoomedInView._beginZoom || function () { };
            this._zoomedInView.endZoom = this._zoomedInView.endZoom || this._zoomedInView._endZoom || function () { };
            this._zoomedInView.getCurrentItem = this._zoomedInView.getCurrentItem || this._zoomedInView._getCurrentItem || function () { };
            this._zoomedInView.configureForZoom = this._zoomedInView.configureForZoom || this._zoomedInView._configureForZoom || function () { };
            this._zoomedInView.positionItem = this._zoomedInView.positionItem || this._zoomedInView._positionItem || function () { };

            // If _zoomedOutView is a listview, then forward SemanticZoom calls to it's private functions
            this._zoomedOutView.beginZoom = this._zoomedOutView.beginZoom || this._zoomedOutView._beginZoom || function () { };
            this._zoomedOutView.endZoom = this._zoomedOutView.endZoom || this._zoomedOutView._endZoom || function () { };
            this._zoomedOutView.getCurrentItem = this._zoomedOutView.getCurrentItem || this._zoomedOutView._getCurrentItem || function () { };
            this._zoomedOutView.configureForZoom = this._zoomedOutView.configureForZoom || this._zoomedOutView._configureForZoom || function () { };
            this._zoomedOutView.positionItem = this._zoomedOutView.positionItem || this._zoomedOutView._positionItem || function () { };

            // Call configureForZoom
            var that = this;
            this._zoomedInView.configureForZoom(false, true, function () { that.zoomedOut = true; }, 1);
            this._zoomedOutView.configureForZoom(true, false, function () { that.zoomedOut = false; }, 100);

            // Initialize values
            this._enableButton = true;
            this._locked = false;
            this._zoomedOut = false;
            this._zoomFactor = 0.65;

            // We want to know when the browser is resized so that we can relayout our items.
            window.addEventListener("resize", this._windowResized.bind(this));
            this.$rootElement.resize(this._windowResized.bind(this));

            // TODO: We want to disconnect our listviews' resize events so that we can fire them *after* we resize things - but I can't quite get it to work.
            //window.removeEventListener("resize", this._zoomedInView._windowResized);
            //window.removeEventListener("resize", this._zoomedOutView._windowResized);
        },

		// ================================================================
		// WinJS.UI.SemanticZoom Member functions
		// ================================================================

        {

            // ================================================================
            //
            // private event: WinJS.SemanticZoom._windowResized
            //
            //		Called when the browser window is resized; resize ourselves
            //
            _windowResized: function (eventData) {

                // If size hasn't changed, then nothing to do.
                var newWidth = this.$rootElement.innerWidth();
                var newHeight = this.$rootElement.innerHeight();
                if (parseInt(this._$zoomContainer.css("width")) == newWidth && parseInt(this._$zoomContainer.css("height")) == newHeight)
                    return;

                // Set dimensions
                var dimensions = { width: newWidth, height: newHeight };
                this._$zoomContainer.css(dimensions);
                this._$zoomedInContainer.css(dimensions);
                this._$zoomedOutContainer.css(dimensions);
                this._$zoomedInSubContainer.css(dimensions);
                this._$zoomedOutSubContainer.css(dimensions);
                this._$zoomedInElement.css(dimensions);
                this._$zoomedOutElement.css(dimensions);
            },


            // TODO: Haven't thought this through yet.
            _doRender: function () {
                if (this.zoomedOut)
                    this._zoomedOutView._doRender && this._zoomedOutView._doRender();
                else
                    this._zoomedInView._doRender && this._zoomedInView._doRender();
            },

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

                    // Trigger beginZoom on both the zoomedIn and zoomedOut Views
                    this._zoomedInView.beginZoom();
                    this._zoomedOutView.beginZoom();

                    // TODO (R3): For R1/R2 we're just fading between views when zooming.  In R3 when we add the 'zoom' animation,
                    //			  we'll need to set initial view scroll offsets here so that they smoothly animate
                    var itemPromise = (isZoomedOut ? this._zoomedInView : this._zoomedOutView).getCurrentItem();
                    var that = this;
                    itemPromise = itemPromise || WinJS.Promise.wrap();
                    itemPromise.then(function (current) {

                        // hide/show the appropriate zoomed in/out container.  _hideElement/_showElement return
                        // Promises which are fulfilled when the animation has finished; we wait until both
                        // animations are done before triggering onzoomchanged
                        var promises = [];
                        if (isZoomedOut) {

                            // Set position of the zooming-to ZoomableView
                            if (current)
                                that._zoomedOutView.positionItem(current.item, current.position);

                            // We're zooming out; hide the zoomedInContainer and show the zoomedOutContainer
                            promises.push(that._hideElement(that._$zoomedInContainer));
                            promises.push(that._showElement(that._$zoomedOutContainer));

                            // Also hide the zoom button, which isn't visible when zoomed out
                            that._$zoomButton.hide().css({ "visibility": "hidden" });

                        } else {

                            // Set position of the zooming-to ZoomableView
                            if (current)
                                that._zoomedInView.positionItem(current.item, current.position);

                            // We're zooming in; show the zoomedInContainer and hide the zoomedOutContainer
                            promises.push(that._showElement(that._$zoomedInContainer));
                            promises.push(that._hideElement(that._$zoomedOutContainer));

                            // Also show the zoom button, which is visible when zoomed out (if enableButton is true)
                            if (that.enableButton)
                                that._$zoomButton.show().css({ "visibility": "visible" });
                        }

                        // Per above, wait until both animations have completed before triggering onzoomchanged.
                        WinJS.Promise.join(promises).then(function () {

                            // Trigger endZoom on both the zoomedIn and zoomedOut Views
                            that._zoomedInView.endZoom();
                            that._zoomedOutView.endZoom();

                            // Notify listeners that zoom changed
                            var event = document.createEvent("CustomEvent");
                            event.initCustomEvent("zoomchanged", true, false, {});
                            that.element.dispatchEvent(event);
                        });
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
                return new WinJS.Promise(function (onComplete) {
                    if ($element.css("visibility") == "visible") {
                        $element.fadeOut("fast", function () {
                            $element.css({ "visibility": "hidden", "display": "block" });
                            onComplete();
                        });
                    }
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


            /*
            // ================================================================
            //
            // private function: WinJS.SemanticZoom._zoomedOutListItemClicked
            //
            //		Called when the user clicks on an item in the zoomed out list view.  Transition to the zoomed-in listview,
            //		scrolled to the clicked-on group.
            //
            _zoomedOutListItemClicked: function (eventData) {

                // Set the item the zoomedin list
                console.error("NYI: eventData x,y", eventData);
                this._zoomedInView.setCurrentItem(eventData.x, eventData.y);

                // Zoom back in to the zoomedin list
                that.zoomedOut = false;
                return;

        		// Zoom out

        		// For now, Semantic Zoom works with grouped lists only, so we can find the first item
        		// in the invoked group, and scroll to it in the zoomed-in listview.
        		// TODO: Support other datasources than grouped lists
        		eventData.detail.itemPromise.then(function (clickedItem) {
        		    that._zoomed
        			// Find the first item in the zoomedinlistview that is in the clicked group
        			// TODO (CLEANUP): Should use IListDataSource for this.
        			var list = that._zoomedInView._itemDataSource._list;
        			for (var i = 0; i < list.length; i++) {
        				var item = list.getItem(i);
        				if (item.groupKey == clickedGroup.key) {
        					// Bring the selected item/group (?) into view
        					that._zoomedInView.indexOfFirstVisible = i;
        					break;
        				}
        			}
        		});
            }*/
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
                if (options.oniteminvoked)
                    this.oniteminvoked = eval(options.oniteminvoked);
            }

            this._disableAnimation = false;

            // We want to know when the browser is resized so that we can relayout our items.
            this._prevWidth = "";
            this._prevHeight = "";

            //window.addEventListener("resize", this._windowResized.bind(this));
            this.$rootElement.resize(this._windowResized.bind(this));

            // When we're removed from the DOM, unload ourselves
            this.$rootElement.bind("DOMNodeRemoved", this._unload);
        },

		// ================================================================
		// WinJS.UI.ListView Member functions
		// ================================================================

        {
            _unloadOnNavigate: function () {

                // Remove our click listener from the appbar click eater
                if (this.$rootElement) {
                    this.$rootElement.unbind("resize", this._windowResized);
                    this.$rootElement.unbind("DOMNodeRemoved", this._unload);
                }

                // NOTE: When adding our event listeners to our _list, we need to use this.render.bind(this) so that 'this' is the context
                //       in which the event handler is called.  The problem is that you cannot simply call removedEventListener(evtName, this.render.bind(this)
                //       to remove it.  So we do it this way instead...
                if (this._itemDataSource && this._itemDataSource._list) {
                    this._itemDataSource._list.removeEventListener("itemremoved", this._registeredEventCallback_ItemRemoved);
                    this._itemDataSource._list.removeEventListener("iteminserted", this._registeredEventCallback_ItemInserted);
                    this._itemDataSource._list.removeEventListener("itemchanged", this._registeredEventCallback_ItemChanged);
                }

                if (this._groupDataSource && this._groupDataSource._list) {
                    this._groupDataSource._list.addEventListener("itemremoved", this._registeredEventCallback_GroupItemRemoved);
                    this._groupDataSource._list.addEventListener("iteminserted", this._registeredEventCallback_GroupItemInserted);
                    this._groupDataSource._list.addEventListener("itemchanged", this._registeredEventCallback_GroupItemChanged);
                }
            },

            // ================================================================
            //
            // private function: WinJS.ListView._unload
            //
            _unload: function (event) {

                // This is called if the ListView OR an element in the ListView is removed; make sure it's the ListView
                if (event.target == this) {

                    this.winControl._unloadOnNavigate();
                }
            },


            // ================================================================
            //
            // private event: WinJS.ListView._windowResized
            //
            //		Called when the browser window is resized; resize ourselves
            //
            _windowResized: function (eventData) {

                // TODO (HACK):  I'm not unbinding listviews' resize callbacks, so we get here for elements that aren't in the DOM.  Need to figure out the 
                // right way to unbind callbacks when controls are removed.
                if (!this.$rootElement.closest("html").length)
                    return;

                // Resize only if vert changed
                // TODO: I *think* this is valid; no broken scenarios come to mind.
                var newHeight = this.$rootElement.innerHeight();
                if (this._prevHeight == newHeight)
                    return;

                this._prevHeight = newHeight;

                // TODO (PERF): only relayout if size has changed at the listview items' size granularity
                var elements = [];
                this.items.forEach(function (item) {
                    elements.push(item.element.parentNode);
                });

                // Animate groupheaders too (if any)
                if (this.$_groupHeaders) {
                    this.$_groupHeaders.forEach(function ($header) {
                        elements.push($header[0]);
                    });
                }

                var that = this;

                // If a resize animation is already running then cancel it and we'll animate from the current mid-animated position
                if (that._resizeAnim) {
                    that._resizeAnim._cancel();
                }
                that._resizeAnim = WinJS.UI.Animation.createRepositionAnimation(elements);
                that._disableAnimation = true;
                that._positionItems(true);
                that._disableAnimation = false;
                that._resizeAnim.execute().then(function () {
                    that._resizeAnim = null;
                });
            },


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
                this.$viewport = $("<div class='win-viewport " + orientation + "' role='group'></div>");
                this.$scrollSurface = $("<div class='win-surface'></div>");

                // The surface div has to be sized in order for the group header to obtain a valid size (see calculation of topY below).  Size the
                // surface div to match the viewport; we'll increase its size after we render all items and know the final size
                //             this.$scrollSurface.css("height", this.$rootElement.innerHeight());
                //           this.$scrollSurface.css("width", this.$rootElement.innerWidth());

                // Add the ListView's scrolling surface to the ListView's static (nonscrolling) viewport, and then add the 
                // listView's static viewpoint to the DOM
                this.$viewport.append(this.$scrollSurface);
                this.$rootElement.append(this.$viewport);

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

                } else {

                    // itemTemplate is a function; create a collection of render promises which we'll wait on below.
                    // TODO (PERF-MINOR): An itemTemplate function could return synchronously, in which case we're unnecessarily waiting on it as a Promise.
                    for (var i = 0; i < this.items.length; i++) {
                        renderPromises.push(this._getItemFunctionRenderPromise(this.items[i], i));
                    }
                }

                // Wait until all of the items have been rendered and then position them
                WinJS.Promise.join(renderPromises).then(function () {

                    // Generate the containers (DOM elements) for the items
                    that._generateItems();

                    // Place the list items in their correct positions
                    that._positionItems();

                    //that.$viewport.height(that.$scrollSurface.height());
                    // TODO (CLEANUP): Resize events come in in unexpected ways.  I'm setting width/height here because currently we get a resize
                    // event on first render *after* we render, which causes us to reposition items twice.  That's on FF; I believe IE9 comes in with
                    // a different order for firing resize events...  This is marked as a TODO because I'm not 100% sure this won't break apps that
                    // rely on a resize event getting fired; also, I should look into forcibly firing a resize event on FF to normalize across browsers...
                    that._prevWidth = that.$rootElement.outerWidth();
                    that._prevHeight = that.$rootElement.outerHeight();
                });
            },


            // ================================================================
            //
            // private event: WinJS.ListView._generateItems
            //
            _generateItems: function () {

                if (this.items.length == 0)
                    return;
                // This should only happen when itemDataSource or groupDataSource changes (including first set).
                var that = this;

                // Get groupInfo (if specified)
                var groupInfo = that.layout.groupInfo && that.layout.groupInfo();

                var currentGroupKey = null;
                this.$_groupHeaders = [];

                // Generate containers for the list's items
                for (var i = 0; i < that.items.length; i++) {

                    var item = that.items[i];

                    // Wrap so that we don't re-wrap every time we position
                    item.$element = $(item.element);

                    // Create the item container div for the current item, add the item's element to it, and place the
                    // itemcontainer in the listview's scrolling surface
                    var $thisItemContainer = $("<div class='win-container'></div>");
                    $thisItemContainer.append(item.$element);
                    this.$scrollSurface.append($thisItemContainer);

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
                            .css({
                                "position": "absolute",
                                "top": "0px"
                            })
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
                        this.$scrollSurface.append($groupHeaderTemplate);

                        this.$_groupHeaders.push($groupHeaderTemplate);
                    }

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
                        }
                    });

                    // show pointerUp/pointerDown animation - but only if item is templated (if a function, then
                    // caller is responsible for handling)
                    // TODO (R3): mousedown on item and then move away from the item; item should return to full size while
                    //            button remains pressed.  setCapture() proved to be a bit of a challenge to get working on
                    //            FF, so ignoring for R1/R2.
                    if (typeof this.itemTemplate !== "function") {

                        $(".win-item", $thisItemContainer).mousedown(function (event) {
                            WinJS.UI.Animation.pointerDown(this);
                            this.setCapture(false);
                        });

                        $(".win-item", $thisItemContainer).mouseup(function (event) {
                            WinJS.UI.Animation.pointerUp(this);
                            document.releaseCapture();
                        });
                    }

                    // If the user clicks on the item, call our oniteminvoked function
                    $(".win-item", $thisItemContainer).click(function () {

                        // Get the index of the clicked item container's item
                        var itemIndex = $(this).data("itemIndex");

                        // Track last tapped item for the semanticzoom _getCurrentItem helper function, since we don't have focus yet
                        // TODO: Remove this when we have keyboard focus support
                        that._currentItem = itemIndex;

                        // Call invoke
                        if (that.tapBehavior != "none") {
                            // TODO: Clean this up
                            if (!(that.tapBehavior == "invokeOnly" && blueskyUtils.shiftPressed || blueskyUtils.controlPressed)) {

                                // Create a Promise with the clicked item
                                var promise = new WinJS.Promise(function (c) {
                                    var data = WinJS.Binding._ListBase.copyItem(that.items[itemIndex]);
                                    data.index = itemIndex;
                                    c(data);
                                });

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
                                        if (that.selectionMode == "multi")
                                            that.selection.add(itemIndex);
                                        else
                                            that.selection.set(itemIndex);
                                }
                            }

                            that._lastSelectedItemIndex = itemIndex;
                            that._notifySelectionChanged(that.element);
                        }

                        // Semantic Zoom support
                        if (that._triggerZoom && that._isZoomedOut)
                            that._triggerZoom();
                    });
                }
            },


            // ================================================================
            //
            // private event: WinJS.ListView._positionItems
            //
            _positionItems: function (repositionDueToResize) {

                if (this.items.length == 0)
                    return;

                if (repositionDueToResize) {
                    // TODO (PERF): Do nothing if the current listview size is sufficiently equal to the previous size such that
                    // no repositioning occurs.  I'm assuming there's some check (@ item granularity size)...
                }

                // Set current rendering position to upper left corner of the list's surface
                var renderCurX = 0, renderCurY = 0;

                // Get the height of the space into which this List must fit.  We'll wrap when an item would go beyond this height.
                var renderMaxY = this.$scrollSurface.innerHeight();

                // Keep track of the width of the scrolling surface
                var surfaceWidth = 0;

                // Get groupInfo (if specified)
                var groupInfo = this.layout.groupInfo && this.layout.groupInfo();

                var currentGroupKey = null;

                // Get the spacing to add between groups (if grouped view)
                var groupSpacing;

                var topY;

                // Keep track of current row for maxRows comparison
                var curRow = -1;

                // Get the margin sizes around items
                var templateMargins = this._getItemMargins($(this.items[0].element));

                var groupHeaderOnLeft = this.layout && this.layout.groupHeaderPosition == "left";
                var groupRenderStartX;

                var listWidth = this.$rootElement.innerWidth();

                // Add the rendered DOM elements to the DOM at the correct positions
                var groupIndex = 0;
                for (var i = 0; i < this.items.length; i++) {

                    var item = this.items[i];

                    // Get the dimensions of the item (force to width of list if not horizontal)
                    var itemWidth = this.layout.horizontal ? item.element.offsetWidth : listWidth;
                    var itemHeight = item.element.offsetHeight;
                    var itemContainer = item.element.parentNode;
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
                    if (this._groupDataSource && item.groupKey != currentGroupKey) {

                        // If there's a previous group header, then limit its width to the total width of the group of items that we just rendered
                        if ($groupHeaderTemplate && !groupHeaderOnLeft) {

                            // TODO (CLEANUP): FF is ellipsizing a pixel or two too soon... Not sure why since there's no border...
                            // TODO (BUG): One resize, need to recalc groupHeader size from original, since group could be wider now.
                            var pad = 2;
                            $groupHeaderTemplate.css("width", Math.min(parseInt($groupHeaderTemplate.css("width")) + pad,
                                                                       (surfaceWidth - groupRenderStartX - parseInt($groupHeaderTemplate.css("marginLeft")) + pad)) + "px");
                        }

                        // Track width of the current group for the above limit
                        groupRenderStartX = surfaceWidth;

                        // Track the current group key so that we know when we switch to a new group
                        currentGroupKey = item.groupKey;

                        var $groupHeaderTemplate = this.$_groupHeaders[groupIndex++];

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
                            "left": (renderCurX - groupSpacing) + "px"  // step back groupSpacing pixels to account for margin
                        });

                    } else {

                        if (topY === undefined)
                            topY = 0;
                        if (this.layout.horizontal) {
                            // If placing this item would extend beyond the maximum Y, then wrap to the next column instead.
                            // So the same if maxRows is specified and we're about to exceed it
                            if (renderCurY + itemHeight + templateMargins.containerVertical >= renderMaxY ||
                                this.layout.maxRows && curRow == this.layout.maxRows - 1) {
                                renderCurY = topY;
                                renderCurX = surfaceWidth;
                                curRow = 0;
                            } else
                                curRow++;
                        }
                    }
                    itemContainer.style.left = renderCurX + "px";
                    itemContainer.style.top = renderCurY + "px";
                    itemContainer.style.width = (itemWidth + templateMargins.itemHorizontal) + "px";
                    itemContainer.style.height = (itemHeight + templateMargins.itemVertical) + "px";

                    // Keep track of the width of the scrolling surface
                    surfaceWidth = Math.max(surfaceWidth, renderCurX + itemWidth + templateMargins.containerHorizontal);

                    // Go to the next place to put the next item
                    renderCurY += itemHeight + templateMargins.containerVertical;

                    // If item is selected, then add border
                    if (this.selection._containsItemByKey(item.key))
                        this._addSelectionBorderToElement(item.element);
                }

                // Set the final width of the ListView's scrolling surface, and make it visible
                this.$scrollSurface.css("width", surfaceWidth).show();

                // use enterContent to slide the list's items into view.  This slides them as one contiguous block (as win8 does).
                if (!this._disableAnimation && !this._disableEntranceAnimation)
                    WinJS.UI.Animation.enterContent([this.$scrollSurface[0]]);
            },


            // ================================================================
            //
            // private Function: WinJS.UI.ListView._getItemMargins
            //
            _getItemMargins: function ($item) {

                var $container = $("<div id='_cont1' class='win-container'></div>")
					.appendTo(this.$scrollSurface);

                // Now that we have a matching element in the DOM, get it's margin values.  Since the css is returned as "#px", we need to strip the 'px'
                // TODO: not 100% sure what the right solution is here; build a test in win8 and see what it does
                var itemMargins = {
                    containerVertical: parseInt($container.css("marginTop")) + parseInt($container.css("marginBottom")),
                    containerHorizontal: parseInt($container.css("marginLeft")) + parseInt($container.css("marginRight")),
                    itemVertical: parseInt($item.css("marginTop")) + parseInt($item.css("marginBottom")),
                    itemHorizontal: parseInt($item.css("marginLeft")) + parseInt($item.css("marginRight"))
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

                        // help the app along with win8 references
                        // TODO: Generalize this (it gets called in multiple places), and extend to support the other ms-appdata locations (e.g. localStorage).
                        element.innerHTML = element.innerHTML.replace(/ms-appx:\/\/\//g, "/");

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

                    // If our itemDataSource == newDataSource, then just return
                    if (this._itemDataSource && this._itemDataSource._id == newDataSource._id)
                        return;

                    var that = this;

                    // NOTE: When adding our event listeners to our _list, we need to use this.render.bind(this) so that 'this' is the context
                    //       in which the event handler is called.  The problem is that you cannot simply call removedEventListener(evtName, this.render.bind(this)
                    //       to remove it.  So we do it this way instead.

                    // Unbind from previous list (if any)
                    if (this._itemDataSource && this._itemDataSource._list) {
                        this._itemDataSource._list.removeEventListener("itemremoved", this._registeredEventCallback_ItemRemoved);
                        this._itemDataSource._list.removeEventListener("iteminserted", this._registeredEventCallback_ItemInserted);
                        this._itemDataSource._list.removeEventListener("itemchanged", this._registeredEventCallback_ItemChanged);
                    }

                    // Store a reference to the new data source in our owning ListView
                    this._itemDataSource = newDataSource;

                    // Listen to changes to the list.
                    this._registeredEventCallback_ItemRemoved = function () { that.render(false); }
                    this._registeredEventCallback_ItemInserted = function () { that.render(false); }
                    this._registeredEventCallback_ItemChanged = function () { that.render(false); }
                    this._itemDataSource._list.addEventListener("itemremoved", this._registeredEventCallback_ItemRemoved);
                    this._itemDataSource._list.addEventListener("iteminserted", this._registeredEventCallback_ItemInserted);
                    this._itemDataSource._list.addEventListener("itemchanged", this._registeredEventCallback_ItemChanged);

                    // Refresh our in-page appearance to show the new datasource's items.
                    this.render();
                }
            },

            // The following event callbacks are to workaround the (apparent) inability to bind event listeners to this.render.bind(this).
            _registeredEventCallback_ItemRemoved: null,
            _registeredEventCallback_ItemInserted: null,
            _registeredEventCallback_ItemChanged: null,

            _registeredEventCallback_GroupItemRemoved: null,
            _registeredEventCallback_GroupItemInserted: null,
            _registeredEventCallback_GroupItemChanged: null,

            // _groupDataSource: If this is non-null, then the ListView renders its items in a grouped UX, grouped by the groups defined in groupDataSource
            _groupDataSource: null,
            groupDataSource: {
                get: function () {
                    return this._groupDataSource;
                },

                // groupDataSource.setter: Used to set a new group data source
                set: function (newDataSource) {

                    // If our groupDataSource == newDataSource, then just return
                    if (this._groupDataSource && this._groupDataSource._id == newDataSource._id)
                        return;

                    var that = this;

                    // NOTE: When adding our event listeners to our _list, we need to use this.render.bind(this) so that 'this' is the context
                    //       in which the event handler is called.  The problem is that you cannot simply call removedEventListener(evtName, this.render.bind(this)
                    //       to remove it.  So we do it this way instead.

                    // Unbind from previous list (if any)
                    if (this._groupDataSource && this._groupDataSource._list) {
                        this._groupDataSource._list.removeEventListener("itemremoved", this._registeredEventCallback_GroupItemRemoved);
                        this._groupDataSource._list.removeEventListener("iteminserted", _registeredEventCallback_GroupItemInserted);
                        this._groupDataSource._list.removeEventListener("itemchanged", _registeredEventCallback_GroupItemChanged);
                    }

                    var previousGroupDataSource = this._groupDataSource;

                    // Store a reference to the new data source
                    this._groupDataSource = newDataSource;

                    if (this._groupDataSource && this._groupDataSource._list) {
                        // Listen to changes to the list.
                        this._registeredEventCallback_GroupItemRemoved = function () { that.render(true); }
                        this._registeredEventCallback_GroupItemInserted = function () { that.render(true); }
                        this._registeredEventCallback_GroupItemChanged = function () { that.render(true); }
                        this._groupDataSource._list.addEventListener("itemremoved", this._registeredEventCallback_GroupItemRemoved);
                        this._groupDataSource._list.addEventListener("iteminserted", this._registeredEventCallback_GroupItemInserted);
                        this._groupDataSource._list.addEventListener("itemchanged", this._registeredEventCallback_GroupItemChanged);
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

                    if (this._itemTemplate != newTemplate) {
                        this._itemTemplate = newTemplate;
                        this.render();
                    }
                }
            },


            // ================================================================
            //
            // public property: WinJS.ListView.layout
            //
            //      MSDN: TODO
            //
            _layout: null,
            layout: {
                get: function () {
                    return this._layout;
                },

                set: function (newLayout) {

                    if (!(newLayout instanceof WinJS.UI.ListLayout) && !(newLayout instanceof WinJS.UI.GridLayout))
                        newLayout = new WinJS.UI.GridLayout(newLayout);

                    // If the new layout is the same as the old layout, then do nothing
                    if (!_.isEqual(this._layout, newLayout)) {

                        this._layout = newLayout;
                        this.render();
                    }
                }
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
                    var itemIsNowSelected = that.selection._containsItemByKey(item.key);

                    if (itemWasSelected && !itemIsNowSelected) {

                        // remove selection
                        $containerNode.removeClass("win-selected");
                        $(".win-selectionbackground, .win-selectioncheckmarkbackground, .win-selectioncheckmark", $containerNode).remove();

                    } else if (!itemWasSelected && itemIsNowSelected) {

                        // add selection border
                        that._addSelectionBorderToElement(item.element);
                    }
                });

                this._notifySelectionChanged(this.element);
            },


            // ================================================================
            //
            // private function: WinJS.ListView._addSelectionBorderToElement
            //
            _addSelectionBorderToElement: function (element) {

                // TODO (PERF-MINOR): Precreate and clone these DIVs
                var $containerNode = $(element.parentNode);
                $containerNode.addClass("win-selected");
                $(element).before($("<div class='win-selectionbackground'></div>"))
                               .after($("<div class='win-selectionbordercontainer'>" +
                                        "<div class='win-selectionborder win-selectionbordertop'></div>" +
                                        "<div class='win-selectionborder win-selectionborderright'></div>" +
                                        "<div class='win-selectionborder win-selectionborderbottom'></div>" +
                                        "<div class='win-selectionborder win-selectionborderleft'></div>" +
                                        "</div><div class='win-selectioncheckmarkbackground'></div><div class='win-selectioncheckmark'></div>"
                                ));
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

                    if (!this.$viewport)
                        return 0;

                    var curScrollRect = {
                        left: this.$viewport.scrollLeft(),
                        top: this.$viewport.scrollTop(),
                        width: this.$viewport.innerWidth(),
                        height: this.$viewport.innerHeight()
                    };

                    // Items are sorted in order, so just find the first one that's in the current viewport
                    if (this.layout.horizontal) {
                        var viewLeftEdge = this.$viewport.scrollLeft();
                        for (var i = 0; i < this.items.length; i++) {
                            var itemRightEdge = parseInt(this.items[i].element.parentNode.style.left) +
                                                parseInt(this.items[i].element.parentNode.style.width);
                            if (itemRightEdge > viewLeftEdge)
                                return i;
                        }
                    } else {
                        var viewTopEdge = this.$viewport.scrollTop();
                        for (var i = 0; i < this.items.length; i++) {
                            var itemBottomEdge = parseInt(this.items[i].element.parentNode.style.right) +
                                                 parseInt(this.items[i].element.parentNode.style.height);
                            if (itemBottomEdge > viewTopEdge)
                                return i;
                        }
                    }
                    // No item is visible
                    return -1;  // TODO: What does win8 return here?
                },

                set: function (index) {

                    if (index >= this.items.length)
                        return;

                    // Get the position of the item at index 'index', and scroll to it
                    var item = this.items[index].element.parentNode;
                    if (this.layout.horizontal)
                        this.scrollPosition = item.offsetLeft -
                                              parseInt(this.items[0].element.parentNode.style.left) +
                                              parseInt($(this.items[0].element.parentNode).css("marginLeft"));
                    else
                        this.scrollPosition = item.offsetTop -
                                              parseInt(this.items[0].element.parentNode.style.top) +
                                              parseInt($(this.items[0].element.parentNode).css("marginTop"));
                }
            },

            // ================================================================
            //
            // public property: WinJS.ListView.indexOfLastVisible
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700698.aspx
            //
            indexOfLastVisible: {

                get: function () {
                    var curScrollRect = {
                        left: this.$viewport.scrollLeft(),
                        top: this.$viewport.scrollTop(),
                        width: this.$viewport.innerWidth(),
                        height: this.$viewport.innerHeight()
                    };

                    // Items are sorted in order, so just find the last one that's in the current viewport
                    if (this.layout.horizontal) {
                        var viewLeftEdge = this.$viewport.scrollLeft();
                        for (var i = this.items.length - 1; i >= 0; i--) {
                            var itemRightEdge = parseInt(this.items[i].element.parentNode.style.left) +
                                                parseInt(this.items[i].element.parentNode.style.width);
                            if (itemRightEdge > viewLeftEdge)
                                return i;
                        }
                    } else {
                        var viewTopEdge = this.$viewport.scrollTop();
                        for (var i = this.items.length - 1; i >= 0; i--) {
                            for (var i = 0; i < this.items.length; i++)
                                var itemBottomEdge = parseInt(this.items[i].element.parentNode.style.right) +
                                                     parseInt(this.items[i].element.parentNode.style.height);
                            if (itemBottomEdge > viewTopEdge)
                                return i;
                        }
                    }
                    // No item is visible
                    return -1;  // TODO: What does win8 return here?
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._beginZoom
            //
            //		SemanticZoom support function
            //
            _beginZoom: function () {

                // TODO (R3): For R1/R2, We fade between lists for Semantic zooming in/out - so we don't
                // need to worry about scrollbars and the like.  So we get off easy here until R3!
            },


            // ================================================================
            //
            // private function: WinJS.ListView._beginZoom
            //
            //		SemanticZoom support function
            //
            _endZoom: function (isCurrentView) {

                // TODO (R3): For R1/R2, We fade between lists for Semantic zooming in/out - so we don't
                // need to worry about scrollbars and the like.  So we get off easy here until R3!
            },


            // ================================================================
            //
            // private function: WinJS.ListView._getCurrentItem
            //
            //		SemanticZoom support function
            //
            _getCurrentItem: function () {
                var that = this;

                // TODO: Update this to use focus when that gets added in R3
                var index = that._currentItem || that.indexOfFirstVisible;

                // TODO: use datasource.getitem
                var item = that._itemDataSource._list.getItem(index);
                var container = item.element.parentNode;
                return WinJS.Promise.wrap({
                    item: item,
                    position: {
                        left: container.offsetLeft,
                        top: container.offsetTop,
                        width: container.offsetWidth,
                        height: container.offsetHeight
                    }
                });
            },


            // ================================================================
            //
            // private function: WinJS.ListView._configureForZoom
            //
            //		SemanticZoom support function
            //
            _configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {

                // Track if we're the zoomedout or zoomedin view.
                this._isZoomedOut = isZoomedOut;

                // Call this._triggerZoom when the user clicks on an item
                this._triggerZoom = triggerZoom;
            },


            // ================================================================
            //
            // private function: WinJS.ListView._positionItem
            //
            //		SemanticZoom support function
            //
            _positionItem: function (item, position) {

                if (!item) {
                    this.indexOfFirstVisible = 0;
                    return;
                }
                // Get the first item whose key matches "key"
                if (this._isZoomedOut) {
                    // TODO: Haven't tested this one.
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].key == item.groupKey) {
                            this.indexOfFirstVisible = i;
                            return;
                        }
                    }
                } else {
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].groupKey == item.key) {
                            this.indexOfFirstVisible = i;
                            return;
                        }
                    }
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._setCurrentItem
            //
            //		SemanticZoom support function
            //
            _setCurrentItem: function (x, y) {

                //  Get the item at location x,y
                console.error("NYI: Get the item at location x,y");
                var item = null;

                this.indexOfFirstVisible = 0;/*

                    // todo: use datasource.getitem
                    var list = this._itemDataSource._list;
                    for (var i = 0; i < list.length; i++) {
                        var item = list.getItem(i);
                        if (item.groupKey == clickedGroup.key) {
                            // Bring the selected item/group (?) into view
                      //      that._zoomedInView.indexOfFirstVisible = i;

                            var pos = {
                                left: $focusedElement[0].offsetLeft,
                                top: $focusedElement[0].offsetTop,
                                width: $focusedElement[0].offsetWidth,
                                height: $focusedElement[0].offsetHeight
                            };


                            return WinJS.Promise.wrap({ item: groupItem, position: pos });

                            break;
                        }
                    }
                });*/
            },


            // ================================================================
            //
            // public function: WinJS.ListView.ensureVisible
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211820.aspx
            //
            ensureVisible: function (itemIndex) {

                if (itemIndex < this.indexOfFirstVisible || itemIndex > this.indexOfLastVisible)
                    this.indexOfFirstVisible = itemIndex;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.elementFromIndex
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh758351.aspx
            //
            elementFromIndex: function (itemIndex) {

                var item = this._itemDataSource._list.getItem(itemIndex);
                return item ? item.element : null;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.elementFromIndex
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700675.aspx
            //
            indexOfElement: function (element) {

                for (var i = 0; i < this.items.length; i++)
                    if (this.items[i].element == element)
                        return i;
                return -1;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.currentItem
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440977.aspx
            //
            currentItem: {

                get: function () {
                    if (this._currentItem) {
                        var itemWithIndex = this._itemDataSource._list.getItemFromKey(this._currentItem.key);
                        return {
                            index: itemWithIndex.index,
                            key: this._currentItem.key,
                            hasFocus: true,             // TODO: Changes when we have focus
                            showFocus: true,            // TODO: Changes when we have focus
                        }
                    } else {
                        return {
                            index: -1,
                            key: null,
                            hasFocus: false,
                            showFocus: false
                        };
                    }
                },

                set: function (value) {

                    if (value.index) {

                        this._currentItem = this.items[value.index];
                        $(this._curentItem).focus();

                    } else if (value.key) {

                        this._currentItem = this._itemDataSource._list.getItemFromKey(value.key);
                        $(this._curentItem).focus();

                    } else {

                        // Clearing
                        if (this._currentItem) {
                            $(this._currentItem).blur();
                            this._currentItem = null;
                        }
                    }
                }
            },


            // ================================================================
            //
            // public function: WinJS.ListView.resetGroupHeader
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700726.aspx
            //
            _groupHeaderRecycleFunction: null,
            resetGroupHeader: {
                get: function () {
                    if (!this._warnedResetGroupHeader) {
                        this._warnedResetGroupHeader = true;
                        console.warn("bluesky: resetGroupHeader is NYI");
                    }
                    return _groupHeaderRecycleFunction;
                },
                set: function (value) {
                    if (!this._warnedResetGroupHeader) {
                        this._warnedResetGroupHeader = true;
                        console.warn("bluesky: resetGroupHeader is NYI");
                    }
                    _groupHeaderRecycleFunction = value;
                }
            },


            // ================================================================
            //
            // public function: WinJS.ListView.resetItem
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211846.aspx
            //
            _itemRecycleFunction: null,
            resetItem: {
                get: function () {
                    if (!this._warnedResetItem) {
                        this._warnedResetItem = true;
                        console.warn("bluesky: resetItem is NYI");
                    }
                    return _itemRecycleFunction;
                },
                set: function (value) {
                    if (!this._warnedResetItem) {
                        this._warnedResetItem = true;
                        console.warn("bluesky: resetItem is NYI");
                    }
                    _itemRecycleFunction = value;
                }
            }
        })
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.ToggleSwitch.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.ToggleSwitch
//
//		Implementation of the WinJS.UI.ToggleSwitch object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.ToggleSwitch
    //
    //      NYI NYI NYI: Stub
    // 
    ToggleSwitch: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.ToggleSwitch constructor
		//
		//		MSDN: TODO
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.ToggleSwitch constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);
        },

		// ================================================================
		// WinJS.UI.ToggleSwitch Member functions
		// ================================================================

		{
		    labelOn: "On",
		    labelOff: "Off",
		    title: "title"
		})
});








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: WinJS.UI.SettingsFlyout.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS.UI.SettingsFlyout
//
//		Implementation of the WinJS.UI.SettingsFlyout object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.SettingsFlyout
    //
    //      NYI NYI NYI: Stub
    // 
    SettingsFlyout: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.SettingsFlyout constructor
		//
		//		MSDN: TODO
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.SettingsFlyout constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            var width = (options && options.width) || "narrow";
            this.widthClass = width == "narrow" ? "win-narrow" : "win-wide";

            // Track that this is a flyout
            this._isFlyout = true;

            // Initialize values
            this._hidden = true;

            // Start out hidden
            this.$rootElement.hide();
        },

		// ================================================================
		// WinJS.UI.SettingsFlyout Member functions
		// ================================================================

		{
		    show: function () {

		        // TODO: Need to mock up a Win8-like 'root level' settings flyout with this.applicationCommands
		        //   ... but how to tell?

		        // If visible already then just return
		        if (!this.hidden)
		            return;

		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforeshow", true, false, {});
		        this.element.dispatchEvent(event);

		        // show
		        var $flyout = $(this.element)
                    .addClass("win-settingsflyout win-overlay " + this.widthClass)
                    .appendTo($("body"))
                    .css("visibility", "visible")
		            .show();

		        // NOTE: For some reason, settingsflyout uses the appbar click eater; I'd've thought it would use the same click eater as regular flyout...
		        $(".win-appbarclickeater").remove();
		        WinJS.UI._$appBarClickEater = $("<div class='win-appbarclickeater'></div>")
                                .appendTo($("body"))
                                .click(this.hide.bind(this))
                                .contextmenu(this.hide.bind(this))
		                        .show();

		        this.$rootElement.mousedown(function (event) {
		            WinJS.UI._flyoutClicked = Date.now();
		        });

		        this._hidden = false;
		        var that = this;
		        new WinJS.UI.Animation.showPopup(this.element, [{ left: "240px" }]).then(function () {

		            // Ensure the flyout is visible and that another flyout didn't close it during the show (e.g. clicking a button in a menu)
		            WinJS.UI._$appBarClickEater.show();

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		        this.$rootElement.bind("DOMNodeRemoved", this._unload);
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.SettingsFlyout._unload
		    //
		    _unload: function (event) {

		        // This is called if the Flyout OR an element on the Flyout is removed; make sure it's the Flyout
		        if (event.target == this) {

		            // Remove our click listener from the Flyout click eater
		            WinJS.UI._$flyoutClickEater.unbind("click", this._clickEaterFunction);

		            // TODO: Same question as in appbar._unload: should we hide? what if there are multiple flyouts visible and only one is unloaded?
		            WinJS.UI._$flyoutClickEater.hide();

		            // And remove our listener for when we're removed from the DOM
		            if (this.$rootElement)
		                this.$rootElement.unbind("DOMNodeRemoved", this._unload);
		        }
		    },

		    // ================================================================
		    //
		    // public function: WinJS.UI.SettingsFlyout.hide
		    //
		    //		MSDN: TODO
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
		        WinJS.UI._$appBarClickEater.hide();
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
		    // public event: WinJS.UI.SettingsFlyout.onafterhide
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
		    // public event: WinJS.UI.SettingsFlyout.onaftershow
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
		    // public event: WinJS.UI.SettingsFlyout.onbeforehide
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
		    // public event: WinJS.UI.SettingsFlyout.onbeforeshow
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
		    // public property: WinJS.UI.SettingsFlyout.hidden
		    //
		    //		MSDN: TODO
		    //
		    _hidden: true,
		    hidden: {
		        get: function () {
		            return this._hidden;
		        }
		    },


		},

		// ================================================================
		// WinJS.UI.SettingsFlyout static Member functions
		// ================================================================

        {
            // ================================================================
            //
            // public function: WinJS.UI.SettingsFlyout.showSettings
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701259.aspx
            //	
            populateSettings: function (e) {

                /*DEBUG*/
                if (!e.detail.applicationcommands)
                    console.warn("Empty e.detail.applicationcommands passed to SettingsFlyout.populateSettings.");
                /*ENDDEBUG*/

                this.applicationCommands = e.detail.applicationcommands;
            },


            // ================================================================
            //
            // public function: WinJS.UI.SettingsFlyout.showSettings
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770581.aspx
            //	
            showSettings: function (id, path) {
                // If the specified settings control is already in the DOM, then just show it
                var $settingsControl = $("#" + id);
                if ($settingsControl.length)
                    $settingsControl[0].winControl.show();
                else {

                    // Not in the DOM yet; create a new SettingsFlyout control for the specified settings page
                    var $settingsDiv = $("<div></div>").appendTo($("body"));
                    WinJS.UI.Pages.render(path, $settingsDiv[0]).then(function () {

                        // Grab a pointer to the newly created settings control
                        $settingsControl = $("#" + id);
                        if (!$settingsControl.length) {
                            // Hmm; the id in the html referenced by 'path' doesn't match the specified ID
                            /*DEBUG*/
                            console.warn("SettingsFlyout error: specified Id '" + id + "' does not match the id of the SettingsFlyout control in page '" + path + "'.");
                            /*ENDDEBUG*/
                            $settingsDiv.remove();
                        } else {
                            // Show the newly created SettingsFlyout page
                            $settingsControl[0].winControl.show();
                        }
                    });
                }
            },


            // ================================================================
            //
            // private function: WinJS.UI.SettingsFlyout._hideClickEater
            //
            //      Called when the app is navigating to a new page; hide appbar
            //
            //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
            //
            _hideClickEater: function () {
                $(".win-flyout").each(function (i, e) {
                    e.winControl.hide();
                });
            },
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
		            if (that.commands.size == 0) {
		                var closeCommand = new Windows.UI.Popups.UICommand("Close");
		                that.commands.append(closeCommand);
		            }

		            var buttonStart = 1300 - that.commands.size * 200;
		            for (var i = 0; i < that.commands.size ; i++) {
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

    WebUIApplication: {
        addEventListener: function () {
        },
        removeEventListener: function () {
        }
    },

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

    // TODO
    getPosition: function (item) {
        return {
            left: item.offsetLeft,
            top: item.offsetTop,
            width: item.offsetWidth,
            height: item.offsetHeight
        };
    },
    // TODO
    getContentHeight: function (item) {
        return $(item).innerHeight();
    },

    // TODO
    getContentWidth: function (item) {
        return $(item).innerWidth();
    },

    // TODO
    insertAdjacentHTML: function (element, position, text) {
        switch (position) {
            case "beforebegin":
                $(element).prepend(text);
                break;
            case "afterbegin":
                $(element).before(text);
                break;
            case "beforeend":
                $(element).append(text);
                break;
            case "afterend":
                $(element).after(text);
                break;
        }
    },

    // TODO
    insertAdjacentElement: function (element, position, text) {
        WinJS.Utilities.insertAdjacentHTML(element, position, text);
    },
    // TODO
    setInnerHTMLUnsafe: function (c) {
        return c;
    },
    // ================================================================
    //
    // public function: WinJS.Utilities.markSupportedForProcessing
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967819.aspx 
    //
    markSupportedForProcessing: function (handler) {

        handler._supportedForProcessing = true;
    },


    // ================================================================
    //
    // public function: WinJS.Utilities.requireSupportedForProcessing
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967820.aspx
    //
    requireSupportedForProcessing: function (handler) {

        if (WinJS.strictProcessing && !handler._supportedForProcessing)
            throw "requireSupportedForProcessing is not defined";  // TODO: real exceptions/errors (WinJS.ErrorFromName)
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
            eventProperties["on" + eventName] = WinJS.Utilities._createProperty(eventName);
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
                if (WinJS.Utilities[privateName])
                    WinJS.Utilities.removeEventListener(eventName, callback);

                // track the specified handler for this.get
                WinJS.Utilities[privateName] = callback;
                WinJS.Utilities.addEventListener(eventName, callback);
            }
        };
    },


    // TODO
    addEventListener: function (eventName, listener) {

        if (!WinJS.Utilities._eventListeners)
            WinJS.Utilities._eventListeners = [];
        if (!WinJS.Utilities._eventListeners[eventName])
            WinJS.Utilities._eventListeners[eventName] = [];

        // Add the listener to the list of listeners for the specified eventName
        WinJS.Utilities._eventListeners[eventName].push(listener);
    },

    // TODO
    removeEventListener: function (eventName, listener) {

        // Remove the listener from the list of listeners for the specified eventName
        var listeners = WinJS.Utilities._eventListeners[eventName];
        for (var i = 0; i < listeners.length; i++) {
            if (listener === listeners[i]) {
                listeners.splice(i, 1);
                return;
            }
        }
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

            if (!WinJS.Utilities._eventListeners)
                WinJS.Utilities._eventListeners = [];
            if (!WinJS.Utilities._eventListeners[eventName])
                WinJS.Utilities._eventListeners[eventName] = [];

            // Add the listener to the list of listeners for the specified eventName
            WinJS.Utilities._eventListeners[eventName].push(listener);
        },


        // ================================================================
        //
        // public function: WinJS.Utilities.eventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211695.aspx
        //
        removeEventListener: function (eventName, listener) {

            // Remove the listener from the list of listeners for the specified eventName
            var listeners = WinJS.Utilities._eventListeners[eventName];
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

            if (!WinJS.Utilities._eventListeners)
                return;

            // TODO (CLEANUP): Can I just use the browser's dispatchEvent (etc) here?
            // TODO (CLEANUP): Use this in WinJS.Application, WinJS.Navigation, and other places that need events but don't have elements.
            var listeners = WinJS.Utilities._eventListeners[eventName];
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
                preventDefault: function () { WinJS.Utilities.defaultPrevented = true; },
                _stopImmediately: false,
                stopImmediatePropagation: function () { WinJS.Utilities._stopImmediately = true; }
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

    // ================================================================
    //
    // public funciton: Bluesky.initialize
    //
    initialize: function () {

        // Determine if this app is running locally.  This impacts how files are loaded
        this.IsLocalExecution = window.PhoneGap != null;
    },


    // ================================================================
    //
    // public object: Bluesky.Application
    //
    Application: {

        // ================================================================
        //
        // public funtion: Bluesky.Application.setAppInfo
        //
        //  bluesky Applications can use this to specify app information.  This will
        //  eventually be obtained from the manifest.
        //
        setAppInfo: function (appId, publisherId, version) {
            appId = appId.toUpperCase();
            // TODO: Not sure what this one is actually.  Unlikely to impact web
            var proc = "neutral_";

            Windows.ApplicationModel.Package.current.id.name = appId;
            Windows.ApplicationModel.Package.current.id.fullName = appId + "_" + publisherId;
            Windows.ApplicationModel.Package.current.id.familyName = appId + "_" + version + "_" + proc + "_" + publisherId;
        }
    },

	Settings: {

	    // ================================================================
	    //
	    // Setting value: cacheBustScriptsAndStyles
	    //
	    //      By default, we append "_bsid=<random#>" to the end of any scripts and styles.  This is to ensure that
	    //      a 'fresh' version of the file has been loaded; when browsers overly cache things (IE, I'm looking at you), it
	    //      makes development painful; and updating apps in production equally so, since you're not gauranteed that you'll
	    //      get the latest version of a file (and could even in theory get mismatched versions).
	    //
	    //      So, cache busting here is a good thing.  So why allow developers to disable it?  Because it can actually make debugging more 
	    //      painful.  You can't drop breakpoints in scripts and F5, because the ?bdid value makes it a 'different' script each
	    //      time.  Setting the following to false will stop that from happening, BUT IS VERY VERY DANGEROUS because if a developer
	    //      forgets about it and releases an update, then their users can be in an indeterminate state with who-knows-what version of each file.
	    //      
	    //      TODO: our deployment process should disallow (w/ exceptions granted as needed) publishing with this set to false.
	    //
	    cacheBustScriptsAndStyles: true,


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
	    ProxyCrossDomainXhrCalls: true,


	    // ================================================================
	    //
	    // Setting object: ProxyBypassUrls
	    //
	    //      Used to specify specific Urls that should not go through the YQL proxy.
	    //
	    //      TODO: I believe Win8 has a parallel object.  Move to that one.
        //
	    ProxyBypassUrls: {

	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.add
	        //
	        add: function(urls) {
	            if (!urls)
	                return;
	            if (typeof urls.length === undefined)
	                urls = [urls];
	            urls.forEach(function(url) {
	                Bluesky.Settings.ProxyBypassUrls.urls.push(url.toLowerCase());
	            });
	        },


	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.clear
	        //
	        clear: function () {
	            this.urls = [];
	        },


	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.contains
	        //
	        contains: function (url) {

	            var result = false;
	            var sourceUrl = url.toLowerCase();
	            var urls = Bluesky.Settings.ProxyBypassUrls.urls;
	            for (var i = 0; i < urls.length; i++) {

	                if (sourceUrl.match(urls[i]))
	                    return true;
	            }

	            return false;
	        },


	        // ================================================================
	        //
	        // public member: Bluesky.Settings.ProxyBypassUrls.urls
	        //
	        urls: []
	    }
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
        $("body > *").each(function (n, e) {
            if ($(e).css("position") != "static")
                highestIndex = Math.max(highestIndex, parseInt($(this).css("z-index")));
        });
        return highestIndex;
    },


    // ================================================================
    //
    // public function: blueskyUtils.removeBSIDFromUrl
    //
    //      Removes a bsid parameter from a URL.  bsid must be last parameter in the URL.
    //
    removeBSIDFromUrl: function (url) {

        // remove timestamp if present
        var href = url.toLowerCase();
        var timeStampIndex = href.indexOf("_bsid");
        if (timeStampIndex >= 0)
            href = href.substr(0, timeStampIndex - 1);
        return href;
    },


    // ================================================================
    //
    // public function: blueskyUtils.setDOMElementUniqueId
    //
    //      Appends a parameter to a querystring, using ? or & appropriately.
    //
    appendQueryStringParam: function (url, param) {
        var char = url.indexOf("?") > -1 ? "&" : "?";
        return url + char + param;
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
    // Example output: { "innerText": "firstName", "style.backgroundColor": "backColor" }
    //
    // more example inputs:
    //       {selectionMode : 'none', itemTemplate: select('#featuredTemplate'), oniteminvoked : Telerik.QSF.HTML.Home.exampleSelected}
    //       src: controlImage
    //       src: controlImage; alt: controlText
    //       {
    //-         startAngle:0,
    //-         endAngle:180,
    //-         min:0,
    //-         max:100,
    //-         majorUnit:25,
    //-         ranges:[{from:0,to:25,color:'red'},{from:25,to:100, color:'#595959'}],
    //-         rangeSize: 2,
    //-         rangeDistance:-1,
    //-         value:33.33
    //-      }
    convertDeclarativeDataStringToJavascriptObject: function (sourceString) {
        var dataBindString = sourceString.replace(/\n/g, "").replace(/\n/g, "");    // TODO (CLEANUP): Do this as one.
        var parseResult = blueskyUtils.recurseInto(dataBindString, 0);

        var result = "";
        try {
            var result = JSON.parse('{' + parseResult.json + '}');
        } catch (ex) {
            /*DEBUG*/
            console.warn("Malformed JSON passed to blueskyUtils.convertDeclarativeDataStringToJavascriptObject");
            console.log(dataBindString);
            console.log(parseResult);
            /*ENDDEBUG*/
        }
        return result;
    },

    recurseInto: function (dataBindString, startIndex) {

        var parserModes = { lookingForKey: 0, lookingForColon: 1, lookingForValue: 2 };
        // Parse the string. TODO: Convert to "real" parser
        var parseMode = parserModes.lookingForKey,
            curCharIndex = startIndex,
            curKey = null,
            lastCharIndex = dataBindString.length;

        var isValidKeyChar = function (ch) {
            // TODO (CLEANUP): e.g. search('[^a-zA-Z_$0-9]')
            return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '.' || ch == '[' || ch == ']';
        }

        var json = '';
        while (curCharIndex < lastCharIndex) {

            switch (parseMode) {

                case parserModes.lookingForKey:

                    switch (dataBindString[curCharIndex]) {

                        case '\t': case '\r': case ' ': case '\n':  // skip whitespace
                        case '\'': case '"':                        // Quotes appear to be optional around keys, so ignore them
                        case ',': case ';':                         // Skip separators because we know we're looking for a key
                        case '{': case '}':                         // hmm: It looks like you can optionally include { and } around the content.  Not sure if that impacts anything, but ignoring for now
                            curCharIndex++;
                            break;

                        default:
                            // Oy: Win8 allows keys like:     this[ 'aria-label' ]: text WinJS.Binding.setAttribute
                            // So we need to support quotes as valid key values and allow anything within those quotes.  We also need to support whitespace in keys :P
                            // So for now, just read until colon.  TODO (CLEANUP): check for invalid chars.  Also, trim whitespace from outside of quotes
                            var startOfKey = curCharIndex++;
                            while (dataBindString[curCharIndex] != ":")
                                curCharIndex++;
                            curKey = dataBindString.substr(startOfKey, curCharIndex - startOfKey);

                            // See above ('oy') example for how win8 can allow whitespace in key names.  Remove all whitespace here.
                            // TODO: Can this break scenarios?  e.g. is foo["hello world"]  a valid key, with whitespace between quotes?
                            curKey.replace(/ /g, "");

                            parseMode = parserModes.lookingForColon;
                            break;
                    }
                    break;

                case parserModes.lookingForColon:

                    switch (dataBindString[curCharIndex]) {
                        // skip whitespace
                        case '\t': case '\r': case ' ': case '\n':
                            curCharIndex++;
                            break;

                        case ':':
                            curCharIndex++;
                            parseMode = parserModes.lookingForValue;
                            break;
                        default:
                            console.warn("Unexpected character encountered in data string, ", dataBindString, " at index ", curCharIndex);
                            return;
                    }
                    break;

                case parserModes.lookingForValue:
                    // keyValue can be string (in quotes)
                    // keyValue can be value; eval'ed.  ex; controlImage.  ex; select('#featuredTemplate'), ex; Test.Foo.Bar.function
                    // keyValue can be object; eval'ed.  ex; { foo:1, bar:2 }
                    // keyValue can be array; eval'ed

                    switch (dataBindString[curCharIndex]) {
                        // skip whitespace
                        case '\t': case '\r': case ' ': case '\n':
                            curCharIndex++;
                            break;

                            // string value.  Read until end of string (pushing/popping quote stack)
                        case '"': case '\'':

                            var quoteType = dataBindString[curCharIndex];
                            // Read until end of string.  Note: Ignore quotes "inside" the string;  e.g. 'Hello \'World\''
                            var startOfValue = ++curCharIndex;
                            while (!(dataBindString[curCharIndex] == quoteType && dataBindString[curCharIndex - 1] != '\\'))
                                curCharIndex++;
                            var value = dataBindString.substr(startOfValue, curCharIndex - startOfValue);
                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":"' + value.trim() + '"';
                            parseMode = parserModes.lookingForKey;
                            break;

                            // object.  recurse into it since we need to convert it as well into valid JSON
                        case '{':
                            var parseResult = blueskyUtils.recurseInto(dataBindString, curCharIndex);
                            curCharIndex += parseResult.length;
                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":{' + parseResult.json + '}';
                            parseMode = parserModes.lookingForKey;
                            break;

                            // value.  Read until end of value definition
                        default:

                            // valid end-of-value chars are:   ,  ;  }   and end-of-string
                            // Read until end of value.  Note: Ignore end-values "inside" the value;  e.g. { foo: test('}') }
                            var startOfValue = curCharIndex,
                                depth = 0,
                                curQuoteType = null;
                            while (curCharIndex < lastCharIndex) {
                                var ch = dataBindString[curCharIndex];

                                // if cur char is start of a quote,  then read until the end of the string and then just keep going.  Note: Ignore quotes "inside" the string;  e.g. 'Hello \'World\''
                                // TODO (BUG): This will not work on more complex/wacky binding strings...  Need to have a real parser here.
                                if (ch == '\'' || ch == '"') {

                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == quoteType && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote
                                    curCharIndex++;

                                } else if (ch == '[') {

                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == ']' && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote

                                } else if (ch == '{') {
                                    debugger;
                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == '}' && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote

                                } else if (ch == ',' || ch == ';' || ch == '}') {
                                    break;
                                }
                                else
                                    curCharIndex++;
                            }
                            var value = dataBindString.substr(startOfValue, curCharIndex - startOfValue);

                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":"' + value.trim() + '"';
                            parseMode = parserModes.lookingForKey;
                            break;
                    }
                    break;
            }
        }
        return { json: json, length: curCharIndex - startIndex };
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

    // TODO: The collective intellect of the internet is wrong about how to test for shift/control pressed; the below
    // breaks when the user presses shift, selects and item in a listview, then clicks *out* while shift is still pressed;
    // shift stays 'on' since we never get the keyup.  Disabling multiselect for now

    // blueskyUtils.shiftPressed = e.shiftKey;
    // blueskyUtils.controlPressed = e.ctrlKey;
});
$(document).keyup(function (e) {

    // blueskyUtils.shiftPressed = e.shiftKey;
    // blueskyUtils.controlPressed = e.ctrlKey;
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

function select(e) {
    return $(e)[0];
}
// Initialize storage now so that appdata.current is initialized (apps may rely on it now).
// TODO: Build one place where these inits happen
Windows.Storage._internalInit();








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: externalDependencies.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// externalDependencies.js
//
//      This file contains all external libraries upon which bluesky depends.  License is included in all cases.
//
//      TODO: In general, is it better to include like this, or as separate <script>?  Pros and cons to either...  e.g.: what if
//            app has its own <script> tag for the same library?
//      TODO: I'm trying to follow both the law and the spirit of including external libraries - is this the 'right' way to do that?
//
//      Dependency          Reason
//      ==================================================================================================
//      underscore          Used for its deep-equality check, and will likely come in handy later anyways.
//      jQueryResize        Used for monitoring (and batching) resize events for WinJS.UI.ListView



// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function () {
    function r(a, c, d) {
        if (a === c) return 0 !== a || 1 / a == 1 / c; if (null == a || null == c) return a === c; a._chain && (a = a._wrapped); c._chain && (c = c._wrapped); if (a.isEqual && b.isFunction(a.isEqual)) return a.isEqual(c); if (c.isEqual && b.isFunction(c.isEqual)) return c.isEqual(a); var e = l.call(a); if (e != l.call(c)) return !1; switch (e) {
            case "[object String]": return a == "" + c; case "[object Number]": return a != +a ? c != +c : 0 == a ? 1 / a == 1 / c : a == +c; case "[object Date]": case "[object Boolean]": return +a == +c; case "[object RegExp]": return a.source ==
            c.source && a.global == c.global && a.multiline == c.multiline && a.ignoreCase == c.ignoreCase
        } if ("object" != typeof a || "object" != typeof c) return !1; for (var f = d.length; f--;) if (d[f] == a) return !0; d.push(a); var f = 0, g = !0; if ("[object Array]" == e) { if (f = a.length, g = f == c.length) for (; f-- && (g = f in a == f in c && r(a[f], c[f], d)) ;); } else {
            if ("constructor" in a != "constructor" in c || a.constructor != c.constructor) return !1; for (var h in a) if (b.has(a, h) && (f++, !(g = b.has(c, h) && r(a[h], c[h], d)))) break; if (g) {
                for (h in c) if (b.has(c, h) && !f--) break;
                g = !f
            }
        } d.pop(); return g
    } var s = this, I = s._, o = {}, k = Array.prototype, p = Object.prototype, i = k.slice, J = k.unshift, l = p.toString, K = p.hasOwnProperty, y = k.forEach, z = k.map, A = k.reduce, B = k.reduceRight, C = k.filter, D = k.every, E = k.some, q = k.indexOf, F = k.lastIndexOf, p = Array.isArray, L = Object.keys, t = Function.prototype.bind, b = function (a) { return new m(a) }; "undefined" !== typeof exports ? ("undefined" !== typeof module && module.exports && (exports = module.exports = b), exports._ = b) : s._ = b; b.VERSION = "1.3.3"; var j = b.each = b.forEach = function (a,
    c, d) { if (a != null) if (y && a.forEach === y) a.forEach(c, d); else if (a.length === +a.length) for (var e = 0, f = a.length; e < f; e++) { if (e in a && c.call(d, a[e], e, a) === o) break } else for (e in a) if (b.has(a, e) && c.call(d, a[e], e, a) === o) break }; b.map = b.collect = function (a, c, b) { var e = []; if (a == null) return e; if (z && a.map === z) return a.map(c, b); j(a, function (a, g, h) { e[e.length] = c.call(b, a, g, h) }); if (a.length === +a.length) e.length = a.length; return e }; b.reduce = b.foldl = b.inject = function (a, c, d, e) {
        var f = arguments.length > 2; a == null && (a = []); if (A &&
        a.reduce === A) { e && (c = b.bind(c, e)); return f ? a.reduce(c, d) : a.reduce(c) } j(a, function (a, b, i) { if (f) d = c.call(e, d, a, b, i); else { d = a; f = true } }); if (!f) throw new TypeError("Reduce of empty array with no initial value"); return d
    }; b.reduceRight = b.foldr = function (a, c, d, e) { var f = arguments.length > 2; a == null && (a = []); if (B && a.reduceRight === B) { e && (c = b.bind(c, e)); return f ? a.reduceRight(c, d) : a.reduceRight(c) } var g = b.toArray(a).reverse(); e && !f && (c = b.bind(c, e)); return f ? b.reduce(g, c, d, e) : b.reduce(g, c) }; b.find = b.detect = function (a,
    c, b) { var e; G(a, function (a, g, h) { if (c.call(b, a, g, h)) { e = a; return true } }); return e }; b.filter = b.select = function (a, c, b) { var e = []; if (a == null) return e; if (C && a.filter === C) return a.filter(c, b); j(a, function (a, g, h) { c.call(b, a, g, h) && (e[e.length] = a) }); return e }; b.reject = function (a, c, b) { var e = []; if (a == null) return e; j(a, function (a, g, h) { c.call(b, a, g, h) || (e[e.length] = a) }); return e }; b.every = b.all = function (a, c, b) {
        var e = true; if (a == null) return e; if (D && a.every === D) return a.every(c, b); j(a, function (a, g, h) {
            if (!(e = e && c.call(b,
            a, g, h))) return o
        }); return !!e
    }; var G = b.some = b.any = function (a, c, d) { c || (c = b.identity); var e = false; if (a == null) return e; if (E && a.some === E) return a.some(c, d); j(a, function (a, b, h) { if (e || (e = c.call(d, a, b, h))) return o }); return !!e }; b.include = b.contains = function (a, c) { var b = false; if (a == null) return b; if (q && a.indexOf === q) return a.indexOf(c) != -1; return b = G(a, function (a) { return a === c }) }; b.invoke = function (a, c) { var d = i.call(arguments, 2); return b.map(a, function (a) { return (b.isFunction(c) ? c || a : a[c]).apply(a, d) }) }; b.pluck =
    function (a, c) { return b.map(a, function (a) { return a[c] }) }; b.max = function (a, c, d) { if (!c && b.isArray(a) && a[0] === +a[0]) return Math.max.apply(Math, a); if (!c && b.isEmpty(a)) return -Infinity; var e = { computed: -Infinity }; j(a, function (a, b, h) { b = c ? c.call(d, a, b, h) : a; b >= e.computed && (e = { value: a, computed: b }) }); return e.value }; b.min = function (a, c, d) {
        if (!c && b.isArray(a) && a[0] === +a[0]) return Math.min.apply(Math, a); if (!c && b.isEmpty(a)) return Infinity; var e = { computed: Infinity }; j(a, function (a, b, h) {
            b = c ? c.call(d, a, b, h) : a; b < e.computed &&
            (e = { value: a, computed: b })
        }); return e.value
    }; b.shuffle = function (a) { var b = [], d; j(a, function (a, f) { d = Math.floor(Math.random() * (f + 1)); b[f] = b[d]; b[d] = a }); return b }; b.sortBy = function (a, c, d) { var e = b.isFunction(c) ? c : function (a) { return a[c] }; return b.pluck(b.map(a, function (a, b, c) { return { value: a, criteria: e.call(d, a, b, c) } }).sort(function (a, b) { var c = a.criteria, d = b.criteria; return c === void 0 ? 1 : d === void 0 ? -1 : c < d ? -1 : c > d ? 1 : 0 }), "value") }; b.groupBy = function (a, c) {
        var d = {}, e = b.isFunction(c) ? c : function (a) { return a[c] };
        j(a, function (a, b) { var c = e(a, b); (d[c] || (d[c] = [])).push(a) }); return d
    }; b.sortedIndex = function (a, c, d) { d || (d = b.identity); for (var e = 0, f = a.length; e < f;) { var g = e + f >> 1; d(a[g]) < d(c) ? e = g + 1 : f = g } return e }; b.toArray = function (a) { return !a ? [] : b.isArray(a) || b.isArguments(a) ? i.call(a) : a.toArray && b.isFunction(a.toArray) ? a.toArray() : b.values(a) }; b.size = function (a) { return b.isArray(a) ? a.length : b.keys(a).length }; b.first = b.head = b.take = function (a, b, d) { return b != null && !d ? i.call(a, 0, b) : a[0] }; b.initial = function (a, b, d) {
        return i.call(a,
        0, a.length - (b == null || d ? 1 : b))
    }; b.last = function (a, b, d) { return b != null && !d ? i.call(a, Math.max(a.length - b, 0)) : a[a.length - 1] }; b.rest = b.tail = function (a, b, d) { return i.call(a, b == null || d ? 1 : b) }; b.compact = function (a) { return b.filter(a, function (a) { return !!a }) }; b.flatten = function (a, c) { return b.reduce(a, function (a, e) { if (b.isArray(e)) return a.concat(c ? e : b.flatten(e)); a[a.length] = e; return a }, []) }; b.without = function (a) { return b.difference(a, i.call(arguments, 1)) }; b.uniq = b.unique = function (a, c, d) {
        var d = d ? b.map(a, d) : a,
        e = []; a.length < 3 && (c = true); b.reduce(d, function (d, g, h) { if (c ? b.last(d) !== g || !d.length : !b.include(d, g)) { d.push(g); e.push(a[h]) } return d }, []); return e
    }; b.union = function () { return b.uniq(b.flatten(arguments, true)) }; b.intersection = b.intersect = function (a) { var c = i.call(arguments, 1); return b.filter(b.uniq(a), function (a) { return b.every(c, function (c) { return b.indexOf(c, a) >= 0 }) }) }; b.difference = function (a) { var c = b.flatten(i.call(arguments, 1), true); return b.filter(a, function (a) { return !b.include(c, a) }) }; b.zip = function () {
        for (var a =
        i.call(arguments), c = b.max(b.pluck(a, "length")), d = Array(c), e = 0; e < c; e++) d[e] = b.pluck(a, "" + e); return d
    }; b.indexOf = function (a, c, d) { if (a == null) return -1; var e; if (d) { d = b.sortedIndex(a, c); return a[d] === c ? d : -1 } if (q && a.indexOf === q) return a.indexOf(c); d = 0; for (e = a.length; d < e; d++) if (d in a && a[d] === c) return d; return -1 }; b.lastIndexOf = function (a, b) { if (a == null) return -1; if (F && a.lastIndexOf === F) return a.lastIndexOf(b); for (var d = a.length; d--;) if (d in a && a[d] === b) return d; return -1 }; b.range = function (a, b, d) {
        if (arguments.length <=
        1) { b = a || 0; a = 0 } for (var d = arguments[2] || 1, e = Math.max(Math.ceil((b - a) / d), 0), f = 0, g = Array(e) ; f < e;) { g[f++] = a; a = a + d } return g
    }; var H = function () { }; b.bind = function (a, c) { var d, e; if (a.bind === t && t) return t.apply(a, i.call(arguments, 1)); if (!b.isFunction(a)) throw new TypeError; e = i.call(arguments, 2); return d = function () { if (!(this instanceof d)) return a.apply(c, e.concat(i.call(arguments))); H.prototype = a.prototype; var b = new H, g = a.apply(b, e.concat(i.call(arguments))); return Object(g) === g ? g : b } }; b.bindAll = function (a) {
        var c =
        i.call(arguments, 1); c.length == 0 && (c = b.functions(a)); j(c, function (c) { a[c] = b.bind(a[c], a) }); return a
    }; b.memoize = function (a, c) { var d = {}; c || (c = b.identity); return function () { var e = c.apply(this, arguments); return b.has(d, e) ? d[e] : d[e] = a.apply(this, arguments) } }; b.delay = function (a, b) { var d = i.call(arguments, 2); return setTimeout(function () { return a.apply(null, d) }, b) }; b.defer = function (a) { return b.delay.apply(b, [a, 1].concat(i.call(arguments, 1))) }; b.throttle = function (a, c) {
        var d, e, f, g, h, i, j = b.debounce(function () {
            h =
            g = false
        }, c); return function () { d = this; e = arguments; f || (f = setTimeout(function () { f = null; h && a.apply(d, e); j() }, c)); g ? h = true : i = a.apply(d, e); j(); g = true; return i }
    }; b.debounce = function (a, b, d) { var e; return function () { var f = this, g = arguments; d && !e && a.apply(f, g); clearTimeout(e); e = setTimeout(function () { e = null; d || a.apply(f, g) }, b) } }; b.once = function (a) { var b = false, d; return function () { if (b) return d; b = true; return d = a.apply(this, arguments) } }; b.wrap = function (a, b) {
        return function () {
            var d = [a].concat(i.call(arguments, 0));
            return b.apply(this, d)
        }
    }; b.compose = function () { var a = arguments; return function () { for (var b = arguments, d = a.length - 1; d >= 0; d--) b = [a[d].apply(this, b)]; return b[0] } }; b.after = function (a, b) { return a <= 0 ? b() : function () { if (--a < 1) return b.apply(this, arguments) } }; b.keys = L || function (a) { if (a !== Object(a)) throw new TypeError("Invalid object"); var c = [], d; for (d in a) b.has(a, d) && (c[c.length] = d); return c }; b.values = function (a) { return b.map(a, b.identity) }; b.functions = b.methods = function (a) {
        var c = [], d; for (d in a) b.isFunction(a[d]) &&
        c.push(d); return c.sort()
    }; b.extend = function (a) { j(i.call(arguments, 1), function (b) { for (var d in b) a[d] = b[d] }); return a }; b.pick = function (a) { var c = {}; j(b.flatten(i.call(arguments, 1)), function (b) { b in a && (c[b] = a[b]) }); return c }; b.defaults = function (a) { j(i.call(arguments, 1), function (b) { for (var d in b) a[d] == null && (a[d] = b[d]) }); return a }; b.clone = function (a) { return !b.isObject(a) ? a : b.isArray(a) ? a.slice() : b.extend({}, a) }; b.tap = function (a, b) { b(a); return a }; b.isEqual = function (a, b) { return r(a, b, []) }; b.isEmpty =
    function (a) { if (a == null) return true; if (b.isArray(a) || b.isString(a)) return a.length === 0; for (var c in a) if (b.has(a, c)) return false; return true }; b.isElement = function (a) { return !!(a && a.nodeType == 1) }; b.isArray = p || function (a) { return l.call(a) == "[object Array]" }; b.isObject = function (a) { return a === Object(a) }; b.isArguments = function (a) { return l.call(a) == "[object Arguments]" }; b.isArguments(arguments) || (b.isArguments = function (a) { return !(!a || !b.has(a, "callee")) }); b.isFunction = function (a) { return l.call(a) == "[object Function]" };
    b.isString = function (a) { return l.call(a) == "[object String]" }; b.isNumber = function (a) { return l.call(a) == "[object Number]" }; b.isFinite = function (a) { return b.isNumber(a) && isFinite(a) }; b.isNaN = function (a) { return a !== a }; b.isBoolean = function (a) { return a === true || a === false || l.call(a) == "[object Boolean]" }; b.isDate = function (a) { return l.call(a) == "[object Date]" }; b.isRegExp = function (a) { return l.call(a) == "[object RegExp]" }; b.isNull = function (a) { return a === null }; b.isUndefined = function (a) { return a === void 0 }; b.has = function (a,
    b) { return K.call(a, b) }; b.noConflict = function () { s._ = I; return this }; b.identity = function (a) { return a }; b.times = function (a, b, d) { for (var e = 0; e < a; e++) b.call(d, e) }; b.escape = function (a) { return ("" + a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") }; b.result = function (a, c) { if (a == null) return null; var d = a[c]; return b.isFunction(d) ? d.call(a) : d }; b.mixin = function (a) { j(b.functions(a), function (c) { M(c, b[c] = a[c]) }) }; var N = 0; b.uniqueId =
    function (a) { var b = N++; return a ? a + b : b }; b.templateSettings = { evaluate: /<%([\s\S]+?)%>/g, interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g }; var u = /.^/, n = { "\\": "\\", "'": "'", r: "\r", n: "\n", t: "\t", u2028: "\u2028", u2029: "\u2029" }, v; for (v in n) n[n[v]] = v; var O = /\\|'|\r|\n|\t|\u2028|\u2029/g, P = /\\(\\|'|r|n|t|u2028|u2029)/g, w = function (a) { return a.replace(P, function (a, b) { return n[b] }) }; b.template = function (a, c, d) {
        d = b.defaults(d || {}, b.templateSettings); a = "__p+='" + a.replace(O, function (a) { return "\\" + n[a] }).replace(d.escape ||
        u, function (a, b) { return "'+\n_.escape(" + w(b) + ")+\n'" }).replace(d.interpolate || u, function (a, b) { return "'+\n(" + w(b) + ")+\n'" }).replace(d.evaluate || u, function (a, b) { return "';\n" + w(b) + "\n;__p+='" }) + "';\n"; d.variable || (a = "with(obj||{}){\n" + a + "}\n"); var a = "var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" + a + "return __p;\n", e = new Function(d.variable || "obj", "_", a); if (c) return e(c, b); c = function (a) { return e.call(this, a, b) }; c.source = "function(" + (d.variable || "obj") + "){\n" + a + "}"; return c
    };
    b.chain = function (a) { return b(a).chain() }; var m = function (a) { this._wrapped = a }; b.prototype = m.prototype; var x = function (a, c) { return c ? b(a).chain() : a }, M = function (a, c) { m.prototype[a] = function () { var a = i.call(arguments); J.call(a, this._wrapped); return x(c.apply(b, a), this._chain) } }; b.mixin(b); j("pop,push,reverse,shift,sort,splice,unshift".split(","), function (a) {
        var b = k[a]; m.prototype[a] = function () {
            var d = this._wrapped; b.apply(d, arguments); var e = d.length; (a == "shift" || a == "splice") && e === 0 && delete d[0]; return x(d,
            this._chain)
        }
    }); j(["concat", "join", "slice"], function (a) { var b = k[a]; m.prototype[a] = function () { return x(b.apply(this._wrapped, arguments), this._chain) } }); m.prototype.chain = function () { this._chain = true; return this }; m.prototype.value = function () { return this._wrapped }
}).call(this);

/*
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function ($, h, c) { var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow"; e[b] = 250; e[f] = true; $.event.special[j] = { setup: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.add(l); $.data(this, d, { w: l.width(), h: l.height() }); if (a.length === 1) { g() } }, teardown: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.not(l); l.removeData(d); if (!a.length) { clearTimeout(i) } }, add: function (l) { if (!e[f] && this[k]) { return false } var n; function m(s, o, p) { var q = $(this), r = $.data(this, d); r.w = o !== c ? o : q.width(); r.h = p !== c ? p : q.height(); n.apply(this, arguments) } if ($.isFunction(l)) { n = l; return m } else { n = l.handler; l.handler = m } } }; function g() { i = h[k](function () { a.each(function () { var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d); if (m !== o.w || l !== o.h) { n.trigger(j, [o.w = m, o.h = l]) } }); g() }, e[b]) } })(jQuery, this);




/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

/**
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

@module lazyload
@class LazyLoad
@static
@version 2.0.3 (git)
*/

var LazyLoad = (function (doc) {
    // -- Private Variables ------------------------------------------------------

    // User agent and feature test information.
    var env,

    // Reference to the <head> element (populated lazily).
    head,

    // Requests currently in progress, if any.
    pending = {},

    // Number of times we've polled to check whether a pending stylesheet has
    // finished loading. If this gets too high, we're probably stalled.
    pollCount = 0,

    // Queued requests.
    queue = { css: [], js: [] },

    // Reference to the browser's list of stylesheets.
    styleSheets = doc.styleSheets;

    // -- Private Methods --------------------------------------------------------

    /**
    Creates and returns an HTML element with the specified name and attributes.
  
    @method createNode
    @param {String} name element name
    @param {Object} attrs name/value mapping of element attributes
    @return {HTMLElement}
    @private
    */
    function createNode(name, attrs) {
        var node = doc.createElement(name), attr;

        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                node.setAttribute(attr, attrs[attr]);
            }
        }

        return node;
    }

    /**
    Called when the current pending resource of the specified type has finished
    loading. Executes the associated callback (if any) and loads the next
    resource in the queue.
  
    @method finish
    @param {String} type resource type ('css' or 'js')
    @private
    */
    function finish(type) {
        var p = pending[type],
            callback,
            urls;

        if (p) {
            callback = p.callback;
            urls = p.urls;

            urls.shift();
            pollCount = 0;

            // If this is the last of the pending URLs, execute the callback and
            // start the next request in the queue (if any).
            if (!urls.length) {
                callback && callback.call(p.context, p.obj);
                pending[type] = null;
                queue[type].length && load(type);
            }
        }
    }

    /**
    Populates the <code>env</code> variable with user agent and feature test
    information.
  
    @method getEnv
    @private
    */
    function getEnv() {
        var ua = navigator.userAgent;

        env = {
            // True if this browser supports disabling async mode on dynamically
            // created script nodes. See
            // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
            async: doc.createElement('script').async === true
        };

        (env.webkit = /AppleWebKit\//.test(ua))
          || (env.ie = /MSIE/.test(ua))
          || (env.opera = /Opera/.test(ua))
          || (env.gecko = /Gecko\//.test(ua))
          || (env.unknown = true);

        // TODO (REMOVE): For some reason, async script loading is now failing
        if (env.ie)
            env.async = false;
    }

    /**
    Loads the specified resources, or the next resource of the specified type
    in the queue if no resources are specified. If a resource of the specified
    type is already being loaded, the new request will be queued until the
    first request has been finished.
  
    When an array of resource URLs is specified, those URLs will be loaded in
    parallel if it is possible to do so while preserving execution order. All
    browsers support parallel loading of CSS, but only Firefox and Opera
    support parallel loading of scripts. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.
  
    @method load
    @param {String} type resource type ('css' or 'js')
    @param {String|Array} urls (optional) URL or array of URLs to load
    @param {Function} callback (optional) callback function to execute when the
      resource is loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function will
      be executed in this object's context
    @private
    */
    function load(type, urls, callback, obj, context) {
        var _finish = function () { finish(type); },
            isCSS = type === 'css',
            nodes = [],
            i, len, node, p, pendingUrls, url;

        env || getEnv();

        if (urls) {
            // If urls is a string, wrap it in an array. Otherwise assume it's an
            // array and create a copy of it so modifications won't be made to the
            // original.
            urls = typeof urls === 'string' ? [urls] : urls.concat();

            // Create a request object for each URL. If multiple URLs are specified,
            // the callback will only be executed after all URLs have been loaded.
            //
            // Sadly, Firefox and Opera are the only browsers capable of loading
            // scripts in parallel while preserving execution order. In all other
            // browsers, scripts must be loaded sequentially.
            //
            // All browsers respect CSS specificity based on the order of the link
            // elements in the DOM, regardless of the order in which the stylesheets
            // are actually downloaded.
            if (isCSS || env.async || env.gecko || env.opera) {
                // Load in parallel.
                queue[type].push({
                    urls: urls,
                    callback: callback,
                    obj: obj,
                    context: context
                });
            } else {
                // Load sequentially.
                for (i = 0, len = urls.length; i < len; ++i) {
                    queue[type].push({
                        urls: [urls[i]],
                        callback: i === len - 1 ? callback : null, // callback is only added to the last URL
                        obj: obj,
                        context: context
                    });
                }
            }
        }

        // If a previous load request of this type is currently in progress, we'll
        // wait our turn. Otherwise, grab the next item in the queue.
        if (pending[type] || !(p = pending[type] = queue[type].shift())) {
            return;
        }

        head || (head = doc.head || doc.getElementsByTagName('head')[0]);
        pendingUrls = p.urls;

        for (i = 0, len = pendingUrls.length; i < len; ++i) {
            url = pendingUrls[i];

            if (isCSS) {
                node = env.gecko ? createNode('style') : createNode('link', {
                    href: url,
                    rel: 'stylesheet'
                });
            } else {
                node = createNode('script', { src: url });
                node.async = false;
            }

            node.className = 'lazyload';
            node.setAttribute('charset', 'utf-8');

            if (env.ie && !isCSS) {
                node.onreadystatechange = function () {
                    if (/loaded|complete/.test(node.readyState)) {
                        node.onreadystatechange = null;
                        _finish();
                    }
                };
            } else if (isCSS && (env.gecko || env.webkit)) {
                // Gecko and WebKit don't support the onload event on link nodes.
                if (env.webkit) {
                    // In WebKit, we can poll for changes to document.styleSheets to
                    // figure out when stylesheets have loaded.
                    p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
                    pollWebKit();
                } else {
                    // In Gecko, we can import the requested URL into a <style> node and
                    // poll for the existence of node.sheet.cssRules. Props to Zach
                    // Leatherman for calling my attention to this technique.
                    node.innerHTML = '@import "' + url + '";';
                    pollGecko(node);
                }
            } else {
                node.onload = node.onerror = _finish;
            }

            nodes.push(node);
        }

        for (i = 0, len = nodes.length; i < len; ++i) {
            head.appendChild(nodes[i]);
        }
    }

    /**
    Begins polling to determine when the specified stylesheet has finished loading
    in Gecko. Polling stops when all pending stylesheets have loaded or after 10
    seconds (to prevent stalls).
  
    Thanks to Zach Leatherman for calling my attention to the @import-based
    cross-domain technique used here, and to Oleg Slobodskoi for an earlier
    same-domain implementation. See Zach's blog for more details:
    http://www.zachleat.com/web/2010/07/29/load-css-dynamically/
  
    @method pollGecko
    @param {HTMLElement} node Style node to poll.
    @private
    */
    function pollGecko(node) {
        var hasRules;

        try {
            // We don't really need to store this value or ever refer to it again, but
            // if we don't store it, Closure Compiler assumes the code is useless and
            // removes it.
            hasRules = !!node.sheet.cssRules;
        } catch (ex) {
            // An exception means the stylesheet is still loading.
            pollCount += 1;

            if (pollCount < 200) {
                setTimeout(function () { pollGecko(node); }, 50);
            } else {
                // We've been polling for 10 seconds and nothing's happened. Stop
                // polling and finish the pending requests to avoid blocking further
                // requests.
                hasRules && finish('css');
            }

            return;
        }

        // If we get here, the stylesheet has loaded.
        finish('css');
    }

    /**
    Begins polling to determine when pending stylesheets have finished loading
    in WebKit. Polling stops when all pending stylesheets have loaded or after 10
    seconds (to prevent stalls).
  
    @method pollWebKit
    @private
    */
    function pollWebKit() {
        var css = pending.css, i;

        if (css) {
            i = styleSheets.length;

            // Look for a stylesheet matching the pending URL.
            while (--i >= 0) {
                if (styleSheets[i].href === css.urls[0]) {
                    finish('css');
                    break;
                }
            }

            pollCount += 1;

            if (css) {
                if (pollCount < 200) {
                    setTimeout(pollWebKit, 50);
                } else {
                    // We've been polling for 10 seconds and nothing's happened, which may
                    // indicate that the stylesheet has been removed from the document
                    // before it had a chance to load. Stop polling and finish the pending
                    // request to prevent blocking further requests.
                    finish('css');
                }
            }
        }
    }

    return {

        /**
        Requests the specified CSS URL or URLs and executes the specified
        callback (if any) when they have finished loading. If an array of URLs is
        specified, the stylesheets will be loaded in parallel and the callback
        will be executed after all stylesheets have finished loading.
    
        @method css
        @param {String|Array} urls CSS URL or array of CSS URLs to load
        @param {Function} callback (optional) callback function to execute when
          the specified stylesheets are loaded
        @param {Object} obj (optional) object to pass to the callback function
        @param {Object} context (optional) if provided, the callback function
          will be executed in this object's context
        @static
        */
        css: function (urls, callback, obj, context) {
            load('css', urls, callback, obj, context);
        },

        /**
        Requests the specified JavaScript URL or URLs and executes the specified
        callback (if any) when they have finished loading. If an array of URLs is
        specified and the browser supports it, the scripts will be loaded in
        parallel and the callback will be executed after all scripts have
        finished loading.
    
        Currently, only Firefox and Opera support parallel loading of scripts while
        preserving execution order. In other browsers, scripts will be
        queued and loaded one at a time to ensure correct execution order.
    
        @method js
        @param {String|Array} urls JS URL or array of JS URLs to load
        @param {Function} callback (optional) callback function to execute when
          the specified scripts are loaded
        @param {Object} obj (optional) object to pass to the callback function
        @param {Object} context (optional) if provided, the callback function
          will be executed in this object's context
        @static
        */
        js: function (urls, callback, obj, context) {
            load('js', urls, callback, obj, context);
        }

    };
})(this.document);


// BLUESKY CODE FOLLOWS
function getStyleLoadedPromise(style) {

    return new WinJS.Promise(function (c) {

        var uniquePage = style.attributes.href.value;

        if (Bluesky.IsLocalExecution) {
            uniquePage = uniquePage.replace("file:///", "/");
        } else {
            uniquePage = uniquePage.replace("///", "/");

            // Add a unique timestamp to gaurantee re-load
            if (Bluesky.Settings.cacheBustScriptsAndStyles)
                uniquePage += "?" + WinJS.Navigation._pageCacheBuster;
        }

        // If the style is already being loaded, then ignore; we only load each one once per page.
        if (WinJS.Navigation._curPageLoadedExtFiles.indexOf(uniquePage) > -1) {
            c();
            return;
        }
        WinJS.Navigation._curPageLoadedExtFiles.push(uniquePage);

        // Insert dynamically loaded styles after the last script in the base page.
        $styleInsertionPoint = $("script", $("head")).last();

        LazyLoad.css(uniquePage, function () { c(); });
    });
}

// TODO (CLEANUP): $styleInsertionPoint is deprecated; remove
var $styleInsertionPoint;

function select(e) {
    return $(e)[0];
}








// ============================================================== //
// ============================================================== //
// ==                                                          == //
//                    File: bluesky-polyfills.js
// ==                                                          == //
// ============================================================== //
// ============================================================== //

// ================================================================
//
// WinJS-MiscPolyfill.js
//
//      This file contains various fillers for IE10 features/properties that Win8
//      apps can rely on but which we cannot.
//
//      "Polyfill" may not be the right name for this file, but it'll do.
//
//      NOTE: This file is NOT trying to be particularly performant; it's main purpose is to notify
//      developers that they are using non-cross-browser-compatible features.
//


// ================================================================
//
//      IE10 has -ms-grid, so we need to add some helper styles if we're not on IE10.
//      These samples are demonstrating the delta between Win8 and bluesky; in real apps, just 
//      don't use -ms-grid, and this won't be necessary.
//
$(document).ready(function () {
    if (!($.browser.msie && $.browser.version == "10.0")) {
        $("body").addClass("notIE10");
    }
});

// ================================================================
//
// Add toStaticHTML
//
if (!window.toStaticHTML) {
    var warnedStaticHTML = false;
    window.toStaticHTML = function (html) {

        if (!warnedStaticHTML) {
            console.warn("bluesky: toStaticHTML is not present on non-IE browsers, and has been polyfilled to just return the source HTML; consider changing code for perf.  This warning will appear only once.");
            warnedStaticHTML = true;
        }
        var root = document.implementation.createHTMLDocument("page").body;
        root.innerHTML = html;
        $(root).find("script, style").remove();
        return root.innerHTML;
    }
}

if (!$.browser.msie) {

    // ================================================================
    //
    // Add srcElement to events
    //
    if (!Event.prototype.srcElement) {
        var warnedSrcElement = false;
        Event.prototype.__defineGetter__("srcElement", function () {
            if (!warnedSrcElement) {
                console.warn("bluesky: srcElement is not present on non-IE browsers, and has been changed to target; consider changing code for perf.  This warning will appear only once.");
                warnedSrcElement = true;
            }
            return this.target;
        });
    }

    // ================================================================
    //
    // Add setActive to DOM elements
    //
    //      TODO: Just nop'ing this for now.
    //
    if (!Element.setActive) {
        var warnedSetActive = false;
        Element.prototype.setActive = function (value) {
            if (!warnedSetActive) {
                console.warn("bluesky: setActive is not present on non-IE browsers, and has been NOP'ed for now.");
                warnedSetActive = true;
            }

            // nop
        }
    }

    // ================================================================
    //
    // Add onpropertychange handler to DOM elements
    //
    //      TODO: This is decidedly not the right polyfill, but it addresses the current need.
    //
    if (!Element.onpropertychange) {
        var warnedPropertyChange = false;
        Element.prototype.__defineSetter__("onpropertychange", function (value) {
            if (!warnedPropertyChange) {
                console.warn("bluesky: onpropertychange is not present on non-IE browsers, and has been rerouted to onclick which only helps in a few situations (e.g. using it for checkbox click handlers); consider changing code for perf.  This warning will appear only once.");
                warnedPropertyChange = true;
            }
            this.onclick = value;
        });
    }

    // ================================================================
    //
    // Add innerText getter/setter to element
    //
    if (!Element.prototype.innerText) {
        var warnedInnerText = false;
        Element.prototype.__defineGetter__("innerText", function () {
            if (!warnedInnerText) {
                console.warn("bluesky: innerText is not present on non-IE browsers, and has been changed to textContent; consider changing code for perf.  This warning will appear only once.");
                warnedInnerText = true;
            }
            return this.textContent;
        });
        Element.prototype.__defineSetter__("innerText", function (value) {
            if (!warnedInnerText) {
                console.warn("bluesky: innerText is not present on non-IE browsers, and has been changed to textContent; consider changing code for perf.  This warning will appear only once.");
                warnedInnerText = true;
            }
            this.textContent = value;
        });
    }
}

// ================================================================
//
// prototype.bind extension
//
//      The Windows 8 templates use the recent "bind" addition to Javascript (short defn of bind: bind creates a new 
//      function that, when called, itself calls this function in the context of the provided this value).  Browsers
//      such as WP7 and iOS's browser do not support bind, so we add it here.  Thank you Mozilla: (see this
//      page: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind).
//
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}


// ================================================================
//
// Element.classList polyfill
//
//		This is present on all modern browsers except for IE9.
//
//		==> NOTE: THIS POLYFILL IS COMPLETELY UNTESTED.  IT'S FOR TESTING PURPOSES. <==
//
if (!Element.classList) {

    var warnedPolyfill = false;
    var polyFillClassList = function (element) {
        return {
            length: {
                get: function () {
                    if (this.className == "")
                        return 0;
                    var num = this.className.split(" ");
                    return num + 1;
                }
            },

            add: function (className) {
                this._checkWarned();
                $(element).addClass(className);
            },

            remove: function (className) {
                this._checkWarned();
                $(element).removeClass(className);
            },

            contains: function (className) {
                this._checkWarned();
                return $(element).hasClass(className);
            },

            toggle: function (className) {
                this._checkWarned();
                if (this.contains(className))
                    this.remove(className);
                else
                    this.add(className);
            },

            _checkWarned: function () {
                if (!warnedPolyfill) {
                    console.warn("bluesky: Element.classList is not present in this browser, and has been polyfilled; consider changing code for perf.  This warning will appear only once.");
                    warnedPolyfill = true;
                }
            }
        }
    }

    Object.defineProperty(Element.prototype, "classList", {
        get: function () {
            return new polyFillClassList(this);
        },
        enumerable: true,
        configurable: true
    });
}


if (window.Node && !window.Node.removeNode) {
    Node.prototype.removeNode = function (removeChildren) {
        var self = this;
        if (Boolean(removeChildren)) {
            return this.parentNode.removeChild(self);
        }
        else {
            var range = document.createRange();
            range.selectNodeContents(self);
            return this.parentNode.replaceChild(range.extractContents(), self);
        }
    }
}


// ================================================================
//
// Normalize indexedDB
//
if (!window.msIndexedDB) {
    var warnedIndexedDB = false;
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    window.msIndexedDB = function (html) {

        // Warn the dev even if the current browser has it, since they may not realize they're going to have issues on IE9.
        if (!warnedIndexedDB) {
            console.warn("bluesky warning: this app uses indexedDB, but IE9 does not support it; this app may not run on IE9 as a result.");
            warnedIndexedDB = true;
        }
        return indexedDB;
    }
}


// ================================================================
//
// IE supports a variety of funcitons and members on HTMLElement.style which other browsers do not support.  Add them here..
//
if (!CSSStyleDeclaration.posLeft) {

    Object.defineProperty(CSSStyleDeclaration.prototype, "posLeft", {
        get: function () {
            return parseInt(this.left);
        },
        set: function (value) {
            this.left = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "posTop", {
        get: function () {
            return parseInt(this.top);
        },
        set: function (value) {
            this.top = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CSSStyleDeclaration.prototype, "posWidth", {
        get: function () {
            return parseInt(this.width);
        },
        set: function (value) {
            this.width = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "posHeight", {
        get: function () {
            return parseInt(this.height);
        },
        set: function (value) {
            this.height = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "float", {
        get: function () {
            return this.cssFloat;
        },
        set: function (value) {
            this.cssFloat = value;
        },
        enumerable: true,
        configurable: true
    });
    // polyfill for HTMLElement.style.setAttribute(key,value) here
    CSSStyleDeclaration.prototype.setAttribute = function (key, value) {
        this[key] = value;
    };

    // polyfill for HTMLElement.style.removeAttribute(key,value) here
    CSSStyleDeclaration.prototype.removeAttribute = function (key) {
        this[key] = null;
    };
}

// Only IE10 supports MSPointerDown (et al), so we need to hook into addEventListener (et al) on other browsers
// TODO: I don't want to do a ua-check here, but am not sure how to test for existence of MSPointerUp...
if (!($.browser.msie && $.browser.version == "10.0")) {

    var evtMap = {
        MSPointerDown: "mousedown",
        MSPointerUp: "mouseup",
        MSPointerMove: "mousemove",
        MSPointerCancel: ""    // TODO: hm.
    };

    var originalAddEL = HTMLCanvasElement.prototype.addEventListener;
    HTMLCanvasElement.prototype.addEventListener = function (evt, func, cap) {

        // if the event is one of the IE10 ones, then map to a known one
        if (evtMap[evt]) {
            // TODO: Warn dev
            evt = evtMap[evt];
        }

        // Call the original addEventListener function
        // TODO (CLEANUP): Can I call 'base' or something here?
        originalAddEL.call(this, evt, func, cap);
    };

    var originalRemoveEL = HTMLCanvasElement.prototype.removeEventListener;
    HTMLCanvasElement.prototype.removeEventListener = function (evt, func, cap) {

        // if the event is one of the IE10 ones, then map to a known one
        if (evtMap[evt])
            evt = evtMap[evt];

        // Call the original removeEventListener function
        // TODO (CLEANUP): Can I call 'base' or something here?
        originalRemoveEL.call(this, evt, func, cap);
    };
}

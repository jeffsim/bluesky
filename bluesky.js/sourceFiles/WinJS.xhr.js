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

                var sourceUrl = options.url.toLowerCase();

                var isLocal = sourceUrl.indexOf("http") != 0;

                // If this isn't a local request, then run it through the proxy to enable cross-domain
                // TODO: Check if it's same-domain and don't proxy if so
                // Use JSON format to support binary objects (xml format borks on them)
                if (!isLocal) {
                    options.url = "http://query.yahooapis.com/v1/public/yql?q=use%20%22http%3A%2F%2Fbluesky.io%2Fyqlproxy.xml" +
								  "%22%20as%20yqlproxy%3Bselect%20*%20from%20yqlproxy%20where%20url%3D%22" + encodeURIComponent(options.url) +
								  "%22%3B&format=json&callback=?";
                    var dataType = "jsonp";
                }

                // TODO: Progress
                $.ajax({
                    url: options.url,
                    data: options.data,
                    dataType: dataType,
                    success: function (data, textStatus, jqXHR) {
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
                        } else{
                            var response = data;
                            var responseText = data;
                            responseXML = null;
                        }

                        onComplete({
                            responseType: "",
                            responseText: responseText,
                            response: responseText,
                            responseXML: responseXML,
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

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
    //   NOTE: YQL has a 1000 requests per app per hour limit.  If that's too limiting for you, then you'll need to enable JSONP on your server and
    //   bypass the YQL proxy.  In time, we'll replace YQL with our own proxy with more dev-friendly rate limiting.
    //
    xhr: function (options) {

        var request;
        var requestType = (options && options.type) || "GET";
        var dataType = (options && options.dataType) || "json";  // TODO: What's Win8's default?

        // The following code is the second approach described above - proxy calls through YQL to enable cross-domain
        return new WinJS.Promise(function (onComplete, onError, onProgress) {

            var url = options.url;
            var urlLower = url.toLowerCase();

            // Determine if the url is local or not
            // TODO: Check if it's same-domain and don't proxy if so
            // starts with http:// and !
            var isLocal = !(urlLower.indexOf("http:") == 0 && urlLower.indexOf("localhost") == -1);

            // test for bypass 
            var isBypass = Bluesky.Settings.ProxyBypassUrls.contains(url);

            if (!options.dataType && urlLower.indexOf(".xml") >= 0)
                dataType = "xml";

            // convert appdata references to filepath
            // TODO (CLEANUP): Do all of these more generically as they have multiple touchpoints in bluesky
            url = url.replace("ms-appx:///", "/");
            url = url.replace("ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase(), "");
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

                    onComplete({
                        responseType: "",
                        responseText: responseText,
                        responseXML: responseXML,
                        data: data.data || data,
                        readyState: jqXHR.readyState,
                        DONE: 4,
                        statusText: jqXHR.statusText == "success" ? "OK" : jqXHR.statusText,
                        status: jqXHR.status
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // TODO: all return flags.
                    // TODO: Support other errors
                    debugger;
                    if (jqXHR.status == 404)
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

        // The following code is the second approach described above - proxy calls through YQL to enable cross-domain
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

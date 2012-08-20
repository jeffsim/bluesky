//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var sampleTitle = "MessageDialog JS Sample";

    var scenarios = [
        { url: "/html/customcommand.html", title: "Use custom commands" },
        { url: "/html/defaultclosecommand.html", title: "Use default close command" },
        { url: "/html/completedcallback.html", title: "Use completed callback" },
        { url: "/html/cancelcommand.html", title: "Use cancel command" }
    ];

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                var url = WinJS.Application.sessionState.lastUrl || scenarios[0].url;
                return WinJS.Navigation.navigate(url);
            }));
        }
    }

    WinJS.Navigation.addEventListener("navigated", function (eventObject) {
        var url = eventObject.detail.location;
        var host = document.getElementById("contentHost");

        host.winControl && host.winControl.unload && host.winControl.unload();

    	//
    	// BLUESKY-CHANGE: Win8 can empty out the contenthost and avoid the flash of emptiness because (I'm 
    	// assuming) the load is happening synchronously (or at least, before the render thread can run) since 
    	// the content being loaded is local.  In bluesky it's remote, so the load happens asynchronously and
    	// you get a momentary flash of emptiness.  To avoid this, we hold off removing the previous page's elements
    	// until rendering is complete.  Since the completion of rendering (and showing of new content) fulfills
    	// the render promise before yielding to the render thread, the user doesn't see a momentary flash of old
    	// and new content.  The proper bluesky/Win8 compatible solution is to just use the bluesky approach below.
    	//
    	// TODO: This isn't quite working yet; getting a momentarily flash of both old and new content :P...
		//
   //     if (WinJS.Application.IsBluesky)
     //   	var $previousPageContent = $(host).contents();
       // else
        	WinJS.Utilities.empty(host);
        eventObject.detail.setPromise(WinJS.UI.Pages.render(url, host, eventObject.detail.state).then(function () {
        	// Per above; if this is bluesky then remove the old page's content now.
        //	if (WinJS.Application.IsBluesky)
        	//	$previousPageContent.remove();
            WinJS.Application.sessionState.lastUrl = url;
        }));
    });

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle,
        scenarios: scenarios
    });

    WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();
})();

﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    new WinJS.Promise(function (c) {
        c();
    }).then();


    var sampleTitle = "FlipView control sample";

    var scenarios = [
        { url: "/html/simpleflipview.html", title: "FlipView populated using a simple JSON data source and template" },
        { url: "/html/orientationAndItemSpacing.html", title: "Orientation and ItemSpacing" },
        { url: "/html/interactiveContent.html", title: "Using interactive content" },
        { url: "/html/contextControl.html", title: "Creating a Context Control" },
        { url: "/html/stylingButtons.html", title: "Styling Navigation Buttons" },
        { url: "/html/itemTemplatesAndDataSources.html", title: "Item Templates & Data Sources" },
        { url: "/html/controlEvents.html", title: "Control Events" }
    ];

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                // Navigate to either the first scenario or to the last running scenario
                // before suspension or termination.
                var url = WinJS.Application.sessionState.lastUrl || scenarios[0].url;
                return WinJS.Navigation.navigate(url);
            }));
        }
    }

    WinJS.Navigation.addEventListener("navigated", function (eventObject) {
        var url = eventObject.detail.location;
        var host = document.getElementById("contentHost");
        // Call unload method on current scenario, if there is one
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
        // TODO: We still get a very quick flash because scenario-select.html is loaded asynchronously; not sure
        // how to avoid that without refactoring the app. Investigate not adding *anything* to the DOM until
        // *everything* is processed and ready for viewing.
        //
        if (WinJS.Application.IsBluesky)
            var $previousPageContent = $(host).children();
        else
            WinJS.Utilities.empty(host);
        eventObject.detail.setPromise(WinJS.UI.Pages.render(url, host, eventObject.detail.state).then(function () {

            // Per above; if this is bluesky then remove the old page's content now.
            if (WinJS.Application.IsBluesky)
                $previousPageContent.remove();

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

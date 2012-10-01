//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    var app = WinJS.Application;

    app.onactivated = function (eventObject) {
        var argument = null;
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            if (eventObject.detail.arguments !== "") {
                // Extract tile parameters and perform tile activation
                argument = eventObject.detail.arguments;
                if (!Helper.isStockInFavorites(argument)) {
                    argument = null;
                }
            }
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                // Using the WinJS navigation pattern (even though this sample only has one view) to make
                // it easier to expand the app's functionality (e.g. Add search view, compare stocks view, etc).
                return WinJS.Navigation.navigate("/html/dashboard.html", argument).then(function () {
                    // Retrieve and send tile updates after the navigation completes to get the app UX up
                    // as quickly as possible.
                    Tile.initialize();
                    Tile.sentUpdatesToAllTiles();
                });
            }));
        }
    };

    WinJS.Navigation.addEventListener("navigated", function (eventObject) {
        var url = eventObject.detail.location;
        WinJS.Utilities.empty(contentHost);
        WinJS.UI.Pages.render(url, contentHost, eventObject.detail.state);
    });
    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function (e) {
        dashboard.onLayoutChanged();
    }, false);
    app.start();

})();

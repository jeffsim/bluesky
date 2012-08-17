﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/scenario2.html", {
        ready: function (element, options) {
            var listView = element.querySelector('#listView').winControl;

            // Notify the ListView to calculate its layout
            listView.forceLayout();

            function itemInvokedHandler(eventObject) {
            	eventObject.detail.itemPromise.done(function (invokedItem) {

                    // Access item data from the itemPromise
                    WinJS.log("The item at index " + invokedItem.index + " is "
                        + invokedItem.data.title + " with a text value of "
                        + invokedItem.data.text, "sample", "status");
                });
            }
            console.log(2);
            listView.addEventListener("iteminvoked", itemInvokedHandler, false);
        }
    });
})();

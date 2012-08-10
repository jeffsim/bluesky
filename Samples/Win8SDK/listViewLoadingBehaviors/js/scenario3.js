﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/scenario3.html", {
        ready: function (element, options) {
            var listView = element.querySelector("#listView").winControl;
            listView.forceLayout();

            function loadMoreButtonHandler() {

                // Loads additional content in the ListView
                listView.loadMorePages();
            }

            element.querySelector("#loadMoreButton").addEventListener("click", loadMoreButtonHandler, false);
        }
    });
})();

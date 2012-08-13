//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    function unpin(stock) {
        var stockName = (stock && typeof stock === "string" ? stock : Dashboard.getCurrentStock()),
            selectionRect = cmdUnpin.getBoundingClientRect(),
            rect = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height },
            tileDelete = new Windows.UI.StartScreen.SecondaryTile(stockName);
        if (isPinned(stockName)) {
            tileDelete.requestDeleteAsync(rect).then(function () {
                Helper.hideAppBar();
            });
        }
    }

    function pin() {
        var stockName = Dashboard.getCurrentStock(),
            selectionRect = cmdPin.getBoundingClientRect(),
            rect = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height },
            uriLogo = new Windows.Foundation.Uri("ms-appx:///images/contentTileLogo.png"),
            uriWideLogo = new Windows.Foundation.Uri("ms-appx:///images/appcontentTile.png"),
            tileCreate = null;
        tileCreate = new Windows.UI.StartScreen.SecondaryTile(
                stockName,
                stockName,
                stockName,
                stockName,
                Windows.UI.StartScreen.TileOptions.showNameOnLogo +
                    Windows.UI.StartScreen.TileOptions.showNameOnWideLogo +
                    Windows.UI.StartScreen.TileOptions.copyOnDeployment,
                uriLogo,
                uriWideLogo);

        tileCreate.requestCreateForSelectionAsync(rect).then(function (isTilePinned) {
            if (isTilePinned) {
                Helper.hideAppBar();
                Tile.fetchDataAndSendTileUpdate(stockName, true);
            }
        });
    }
    
    function isPinned(stock) {
        return Windows.UI.StartScreen.SecondaryTile.exists(stock);
    }

    WinJS.Namespace.define("Pinning", {
        pin: pin,
        unpin: unpin,
        isPinned: isPinned
    });
})();

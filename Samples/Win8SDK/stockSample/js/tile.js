//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";
	/* BLUESKY-TODO
    var Notifications = Windows.UI.Notifications;

    function sentUpdatesToAllTiles() {
        sendUpdatesToMainTile();
        sendUpdatesToSecondaryTiles();
    }

    function sendUpdatesToMainTile() {
        Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication().clear();

        var myStocks = Helper.getFavoriteStocks();
        myStocks.forEach(function (value) {
            Tile.fetchDataAndSendTileUpdate(value);
        });
    }

    function sendUpdatesToSecondaryTiles() {
        // Get secondary tile ids for all applications in the package and list them out:
        Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
            if (tiles) {
                tiles.forEach(function (tile) {
                    var stockName = tile.tileId;
                    Tile.fetchDataAndSendTileUpdate(stockName, true);
                });
            }
        });
    }

    function fetchDataAndSendTileUpdate(stockName, isSecondary) {
        Api.getStockInfoData(stockName).then(function (data) {
            var item = data[0];
            if (item) {
                item = Mock.randomizeItem(item);
                Tile.sendTileUpdate(stockName, item.change, item.lastSale, item.lastSaleTime, item.open, isSecondary);
            }
        });
    }

    function sendTileUpdate(symbol, change, lastTrade, lastTradeTime, openValue, isSecondaryTile) {
        var changeDisplay = parseFloat(change) === 0 ? "0.00" : Helper.formatDecimal(parseFloat(change), 2),
            lines = [
                symbol.toUpperCase() + " " + (parseFloat(change) >= 0 ? "\u25B2 +" : "\u25BC ") + changeDisplay,
                "Last Trade " + Helper.formatDecimal(parseFloat(lastTrade), 2),
                "Last Trade Time " + lastTradeTime,
                "Open " + openValue,
                ""
            ],
            tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideText01),
            tileTextAttributes = tileXml.getElementsByTagName("text");

        for (var i = 0; i < 5; i++) {
            tileTextAttributes[i].appendChild(tileXml.createTextNode(lines[i]));
        }

        var binding = tileXml.getElementsByTagName("binding");
        if (binding[0]) {
            binding[0].setAttribute("branding", isSecondaryTile ? "name" : "logo");
        }

        var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareText01),
            squareLines = [
                symbol.toUpperCase(),
                (parseFloat(change) >= 0 ? "\u25B2 +" : "\u25BC ") + changeDisplay,
                lastTradeTime,
                openValue
            ],
            squareTileTextAttributes = squareTileXml.getElementsByTagName("text");

        for (i = 0; i < 4; i++) {
            squareTileTextAttributes[i].appendChild(squareTileXml.createTextNode(squareLines[i]));
        }

        var squareTileBinding = squareTileXml.getElementsByTagName("binding");
        if (squareTileBinding[0]) {
            squareTileBinding[0].setAttribute("branding", "none");
        }

        var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
        tileXml.getElementsByTagName("visual").item(0).appendChild(node);

        var tileNotification = new Notifications.TileNotification(tileXml);
        tileNotification.tag = symbol.replace(/[^a-zA-Z0-9]+/g, "Z");

        if (isSecondaryTile) {
            Notifications.TileUpdateManager.createTileUpdaterForApplication(symbol.toLowerCase()).update(tileNotification);
        } else {
            Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        }
    }

    function initialize () {
        var tileUpdateManager = Notifications.TileUpdateManager,
            tileUpdater = tileUpdateManager.createTileUpdaterForApplication();
        tileUpdater.enableNotificationQueue(true);
    }

    WinJS.Namespace.define("Tile", {
        sendTileUpdate: sendTileUpdate,
        initialize: initialize,
        sentUpdatesToAllTiles: sentUpdatesToAllTiles,
        fetchDataAndSendTileUpdate: fetchDataAndSendTileUpdate,
        sendUpdatesToMainTile: sendUpdatesToMainTile
    });*/
    WinJS.Namespace.define("Tile", {
    	sendTileUpdate: function () { },
    	initialize: function () { },
    	sentUpdatesToAllTiles: function () { },
    	fetchDataAndSendTileUpdate: function () { },
    	sendUpdatesToMainTile: function () { }
    });
})();

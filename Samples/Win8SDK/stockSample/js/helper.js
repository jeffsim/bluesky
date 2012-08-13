//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    function formatDecimal(value, numberOfDecimalPoints) {
        var result = value;
        if (value) {
            var dotIndex = value.toString().indexOf(".");
            result = value.toString().substr(0, dotIndex + numberOfDecimalPoints + 1);
        }
        return result;
    }

    function getFriendlyTime(time) {
        var date = new Date(time);
        var dayFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek.abbreviated");
        var timeFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("hour minute");
        return dayFormatter.format(date) + " " + timeFormatter.format(date) + " GMT";
    }

    function showMessage(text) {
        var message = new Windows.UI.Popups.MessageDialog(text);
        message.showAsync();
    }

    function getFavoriteStocks() {
        var myStocks = Windows.Storage.ApplicationData.current.roamingSettings.values["mystocks"];
        if (!myStocks) {
            myStocks = Mock.defaultStocks;
        }
        return myStocks.split(",");
    }

    function hideAppBar() {
        appBar.winControl.hide();
    }

    function animateTitle() {
        var titleArea = WinJS.Utilities.query("#content .header .titleArea")[0];

        titleArea.style.display = "block";
        WinJS.UI.Animation.enterPage([titleArea], { top: "0px", left: "500px" });        
    }

    function displayAllInOneInfo() {
        Api.getHistoryData("1m").then(function (data) {
            if (data && data.stockValues && data.stockValues.length > 0) {
                var opts = Chart.getChartOptions(true);
                var myStocks = Helper.getFavoriteStocks();
                var stockInfo = Dashboard.getCurrentStockInfo();

                // Remove any previously rendered stock listing.
                var infoContainer = WinJS.Utilities.query("#allInOne .info");
                WinJS.Utilities.empty(infoContainer[0]);

                // Populate the values in the grid with new listings for all the stocks.
                WinJS.UI.process(allInOneItemTemplate).then(function (templateControl) {
                    myStocks.forEach(function (value) {
                        var item = Mock.randomizeItem(stockInfo);
                        item.stockName = value;
                        item.chartID = "chart" + value;
                        item.percent = (item.percent === "N/A" ? item.percent : formatDecimal(parseFloat(item.percent), 2));
                        item.changeArrow = (item.change >= 0 ? "\u25B2" : "\u25BC");
                        item.lastTradePrice = formatDecimal(parseFloat(item.lastSale), 2);
                        templateControl.render(item, infoContainer[0]).then(function () {
                            var chartInfo = [];
                            chartInfo[0] = Mock.randomizeChart(data.stockValues);
                            CanvasChart.drawChart(document.getElementById("chart" + value), chartInfo, opts);
                        });
                    });
                });
            }
        });
    }

    function displayStockInfo(item) {
        WinJS.UI.process(stockInfoTemplate).then(function (templateControl) {
            // Remove the old stock content
            var infoContainer = WinJS.Utilities.query("#content .details .grid");            
            WinJS.Utilities.empty(infoContainer[0]);

            // Add the current stock content
            item.stockName = "";
            item.chartID = "";
            item.changeArrow = (item.change >= 0 ? "\u25B2" : "\u25BC");
            templateControl.render(item, infoContainer[0]);
        });
    }

    function isStockInFavorites(stock) {
        var isFavorite = false;
        var myStocks = getFavoriteStocks();
        myStocks.forEach(function (value) {
            if (stock === value) {
                isFavorite = true;
            }
        });
        return isFavorite;
    }

    function addStock(stock) {
        var myStocks = getFavoriteStocks();
        myStocks.push(stock);
        Windows.Storage.ApplicationData.current.roamingSettings.values["mystocks"] = myStocks.join(",");
    }

    function getFirstFavorite() {
        var myStocks = getFavoriteStocks();
        if (myStocks && myStocks.length > 0) {
            return myStocks[0];
        } else {
            return "";
        }
    }

    function deleteStock(stock) {
        var myStocks = getFavoriteStocks(),
            myNewStocks = [];
        myStocks.forEach(function (value) {
            if (value !== stock) {
                myNewStocks.push(value);
            }
        });
        Windows.Storage.ApplicationData.current.roamingSettings.values["mystocks"] = myNewStocks.join(",");
    }

    WinJS.Namespace.define("Helper", {
        formatDecimal: formatDecimal,
        getFriendlyTime: getFriendlyTime,
        isStockInFavorites: isStockInFavorites,
        getFavoriteStocks: getFavoriteStocks,
        hideAppBar: hideAppBar,
        displayStockInfo: displayStockInfo,
        animateTitle: animateTitle,
        addStock: addStock,
        deleteStock: deleteStock,
        getFirstFavorite: getFirstFavorite,
        displayAllInOneInfo: displayAllInOneInfo
    });
})();

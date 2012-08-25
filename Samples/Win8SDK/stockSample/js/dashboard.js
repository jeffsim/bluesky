//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    var range = null;
    var selectedStock = null;
    var chartData = null;
    var chartOpts = null;
    var chartMinDate = null;
    var currentStockInfo = null;
    var selectedItemCssClass = "selectedAction";
	/* BLUESKY-TODO
    var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
	*/
    var roamingSettings = {
    	values: {
    		selectedStock: "STOCK1"
    	}
    };

    var page = WinJS.UI.Pages.define("/html/dashboard.html", {
            ready: function (element, options) {
                selectedStock = options;
                Helper.animateTitle();

                // Configure the chart range options (week/month/year) based on user's settings
                initializeChartRangeOption();

                // Initialize the list of user stocks
                initializeUserStocks();

                // Configure the app bar with this page's settings
                configureAppBar();

                // Initialize the Market News list view control
                News.initialize();

                // Display all the stock information for the current stock
                showStockInfo(selectedStock, range);
                           
				// BLUESKY-TODO: 
                // window.addEventListener("resize", onLayoutChanged);           

                // Set the chart's canvas size given the portrait/landscape state.
                setChartCanvasSize();
            }
    });

    function configureAppBar() {
        var appBar = document.getElementById("appBar").winControl;
        appBar.addEventListener("beforeshow", function () {
            var myStocks = Helper.getFavoriteStocks(),
                layoutState = Windows.UI.ViewManagement.ApplicationViewState,
                appLayout = Windows.UI.ViewManagement.ApplicationView,
                isSnapped = appLayout.value === layoutState.snapped;
            if (isSnapped) {
                 appBar.hideCommands([cmdPin, cmdUnpin, cmdSeparator, cmdDelete]);
            } else {
                appBar.showCommands([cmdPin, cmdUnpin, cmdSeparator, cmdDelete, cmdAdd]);

                // Configure the pin/unpin buttons visibility
                if (Pinning.isPinned(selectedStock)) {
                    appBar.hideCommands([cmdPin]);
                    appBar.showCommands([cmdUnpin]);
                } else {
                    appBar.hideCommands([cmdUnpin]);
                    appBar.showCommands([cmdPin]);
                }

                // Clear the add stock field
                addStockText.value = "";
            }

            // Configure the add/delete app bar buttons based on the favorites limit
            if (myStocks.length === 1) {
                cmdDelete.disabled = true;
                cmdAdd.disabled = false;
            } else if (myStocks.length >= 5) {
                cmdDelete.disabled = false;
                cmdAdd.disabled = true;
            } else {
                cmdDelete.disabled = false;
                cmdAdd.disabled = false;
            }
        }, false);

        var addStockButton = document.getElementById("addStockButton").addEventListener("click", function () {
            var newStock = addStockText.value;
            newStock = escape(newStock.substr(0, 8).toLocaleUpperCase());
            if (Helper.isStockInFavorites(newStock)) {
                showStockInfo(newStock, range);
            } else {
                Helper.addStock(newStock);
                initializeUserStocks();
                showStockInfo(newStock, range);
            }
            Helper.hideAppBar();
            var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
            var appLayout = Windows.UI.ViewManagement.ApplicationView;
            var isSnapped = appLayout.value === layoutState.snapped;
            if (isSnapped) {
                Helper.displayAllInOneInfo();
            }
            Tile.sendUpdatesToMainTile();
        });
    }

    function showStockInfo(stock, chartRange, keepNews, keepStockInfo) {
        selectedStock = stock;
        roamingSettings.values["selectedStock"] = selectedStock;

        var i = 0, len = 0;
        var targetElementsToDelClass = WinJS.Utilities.query("#content .info .myStocks li");
        for (i = 0, len = targetElementsToDelClass.length; i < len; i++) {
            WinJS.Utilities.removeClass(targetElementsToDelClass[i], selectedItemCssClass);
        }

        var targetElementsToAddClass = WinJS.Utilities.query("#content .info .myStocks li[data-stock='" + stock + "']");
        for (i = 0, len = targetElementsToAddClass.length; i < len; i++) {
            WinJS.Utilities.addClass(targetElementsToAddClass[i], selectedItemCssClass);
        }
        
        if (!keepNews) {
            News.requestNews(stock);
        }

        if (!keepStockInfo) {
            Api.getStockInfoData(stock).then(function (data) {
                var item = data[0];
                if (item) {
                    item = Mock.randomizeItem(item);
                    currentStockInfo = item;
                    Helper.displayStockInfo(item);
                    Tile.sendTileUpdate(stock, item.change, item.lastSale, item.lastSaleTime, item.open);
                }
            });
        }
        
        Api.getHistoryData(chartRange).then(function (data) {
            if (data && data.stockValues && data.stockValues.length > 0) {                
                data.stockValues = Mock.randomizeChart(data.stockValues);
                chartData = [];
                chartData[0] = data.stockValues;
                CanvasChart.drawChart(document.getElementById("chartCanvas"), chartData, Chart.getChartOptions(false));
            }
        });
    }

    function initializeUserStocks() {
        var myStocks = Helper.getFavoriteStocks();

        if (!selectedStock) {
            selectedStock = roamingSettings.values["selectedStock"] || Mock.defaultSelectedStock;
        }

        var targetElements = WinJS.Utilities.query("#content .info .myStocks");        
        WinJS.Utilities.empty(targetElements[0]);        

        myStocks.forEach(function (value) {
            var isSelected = value === selectedStock;
            addStockNavigationLink(value, isSelected);
        });
    }
   
    function setChartCanvasSize() {        
        var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
        var appLayout = Windows.UI.ViewManagement.ApplicationView;
        if (appLayout.value === layoutState.fullScreenPortrait) {
            document.getElementById("chartCanvas").width = 750;
            document.getElementById("chartCanvas").height = 308;
        } else if (appLayout.value === layoutState.fullScreenLandscape) {
            document.getElementById("chartCanvas").width = 1000;
            document.getElementById("chartCanvas").height = 295;
        }
        if (chartData) {
            CanvasChart.drawChart(document.getElementById("chartCanvas"), chartData, Chart.getChartOptions());
        }
    }

    function initializeChartRangeOption() {
        // Get the current value for the chart range
        range = roamingSettings.values["range"] || "1m";
        // Check the radio button for the current range to roam settings
        var targets = WinJS.Utilities.query("input[value='" + range + "']");
        targets[0].checked = true;        
        targets = WinJS.Utilities.query("#content .info .range input[type='radio']");
        for (var i = 0, len = targets.length; i < len; i++) {
            targets[i].onclick = (function (eventObject) {
                range = eventObject.target.value;
                roamingSettings.values["range"] = range;
                showStockInfo(selectedStock, range, true, true);
            });            
        }
    }

    function onLayoutChanged() {
        var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
        var appLayout = Windows.UI.ViewManagement.ApplicationView;
        var isSnapped = appLayout.value === layoutState.snapped;

        switch (appLayout.value) {
            case layoutState.fullScreenLandscape:
            case layoutState.fullScreenPortrait:                
                setChartCanvasSize();
                WinJS.UI.process(marketNews).then(function () {
                    var lv = marketNewsList.winControl;
                    lv.forceLayout();
                });
                break;
        }

        if (isSnapped) {
            Helper.displayAllInOneInfo();
        } else {
            showStockInfo(selectedStock, range, true);
        }
    }

    function addStockNavigationLink(stock, isSelected) {
        var item = document.createElement("li"),
          link = document.createElement("a");
          link.innerHTML = stock;

        link.addEventListener("click", function (eventObject) {
            selectedStock = eventObject.target.parentNode.getAttribute("data-stock");
            showStockInfo(selectedStock, range);
        });

        item.setAttribute("data-stock", stock);
        if (isSelected) {
            item.className = selectedItemCssClass;
        }
        item.appendChild(link);

        var targets = WinJS.Utilities.query("#content .info .stockPanel .myStocks");
        for (var i = 0, len=targets.length; i < len; i++) {
            targets[i].appendChild(item);
        }
        
    }

    function getCurrentStock() {
        return selectedStock;
    }

    function getCurrentStockInfo() {
        return currentStockInfo;
    }

    function getCurrentChartData() {
        return { data: chartData, minDate: chartMinDate };
    }

    function deleteStock() {
        Helper.deleteStock(selectedStock);
        initializeUserStocks();
        Helper.hideAppBar();
        if (Pinning.isPinned(selectedStock)) {
            Pinning.unpin(selectedStock);
        }
        Tile.sendUpdatesToMainTile();
        showStockInfo(Helper.getFirstFavorite(), range);
    }

    WinJS.Namespace.define("Dashboard", {
        getCurrentStock: getCurrentStock,
        getCurrentChartData: getCurrentChartData,
        getCurrentStockInfo: getCurrentStockInfo,
        deleteStock: deleteStock,
        onLayoutChanged: onLayoutChanged
    });
})();

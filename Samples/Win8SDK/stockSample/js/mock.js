//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";
    
    var defaultStocks = "STOCK1,STOCK2,STOCK3,STOCK4",
        defaultSelectedStock = "STOCK1";

    function modifyNewsResult(item, stock) {
        return item.replace(/{stock}/g, stock);
    }

    function randomizeItem(item) {
        var random = Math.random(),
            randomRange = Math.random(),
            factor = (random * 100) % 2 === 0 ? -1 : 1;
        random = random * factor;

        item.lastSale = Helper.formatDecimal(parseFloat(item.lastSale) + random, 2);
        item.open = Helper.formatDecimal(parseFloat(item.open) + random, 2);
        item.volume = Helper.formatDecimal(parseFloat(item.volume) + random, 1);
        item.daysRange = Helper.formatDecimal(parseFloat(item.open) - randomRange, 2) + " - " + Helper.formatDecimal(parseFloat(item.open) + randomRange, 2);
        item.fiftyTwoWeekRange = Helper.formatDecimal(parseFloat(item.lastSale) - randomRange, 2) + " - " + Helper.formatDecimal(parseFloat(item.lastSale) + randomRange, 2);
        item.change = Helper.formatDecimal(parseFloat(item.change) + random, 2);

        return item;
    }

    function randomizeChart(data) {
        for (var i = 0, len = data.length; i < len; i++) {
            data[i][1] = parseFloat(data[i][1]) + (Math.random());
        }
        return data;
    }

    WinJS.Namespace.define("Mock", {
        modifyNewsResult: modifyNewsResult,
        randomizeItem: randomizeItem,
        randomizeChart: randomizeChart,
        defaultStocks: defaultStocks,
        defaultSelectedStock: defaultSelectedStock
    });
})();

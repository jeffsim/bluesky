//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    function getStockInfoData(stock) {
        var url = "/data/stock-info.xml";
        return WinJS.xhr({ url: url }).then(function (response) {
            return parseInfoData(response);
        });
    }

    function getHistoryData(range) {
        var url = "/data/stock-history-" + range + ".csv";
        return WinJS.xhr({ url: url }).then(function (response) {
            return parseHistoryData(response);
        });
    }

    function getNewsData(stock) {
        var url = "/data/stock-news.xml";
        return WinJS.xhr({ url: url });
    }

    function formatNumber(number) {
        return number.replace(/,/g, "");
    }

    function parseInfoData(response) {
        var result = [],
            xmlDoc = response.responseXML;
        var allCompanyInfoNodes = xmlDoc.querySelectorAll("DynamicSymbology");
        var allStockDataNodes = xmlDoc.querySelectorAll("Dynamic");

        for (var i = 0, len = allStockDataNodes.length; i < len; i++) {
            var stockDataNodes = allStockDataNodes[i];
            var companyInfoNodes = allCompanyInfoNodes[i];

            var marketCapOriginal = formatNumber(stockDataNodes.querySelector("MarketCap").textContent),
                openValue = formatNumber(stockDataNodes.querySelector("Open").textContent);
            var openStr = parseFloat(openValue),
                lastSale = parseFloat(formatNumber(stockDataNodes.querySelector("Last").textContent)),
                low = parseFloat(stockDataNodes.querySelector("Low").textContent),
                high = parseFloat(stockDataNodes.querySelector("High").textContent),
                volume = Helper.formatDecimal((parseInt(formatNumber(stockDataNodes.querySelector("Volume").textContent)) / 1000000), 2),
                closeValue = parseFloat(parseFloat(stockDataNodes.querySelector("Close").textContent)),
                yearLow = parseFloat(stockDataNodes.querySelector("Low52Week").textContent),
                yearHigh = parseFloat(stockDataNodes.querySelector("High52Week").textContent);
            volume = volume > 0 ? volume : "N/A";

            result[i] =
            {
                name: companyInfoNodes.querySelector("LocalCompanyName").textContent,
                open: openValue === 0 ? "N/A" : openValue,
                close: closeValue,
                marketcap: parseInt(marketCapOriginal.substr(1, marketCapOriginal.length)),
                fiftyTwoWeekRange: yearLow + " - " + yearHigh,
                lastSale: lastSale,
                lastSaleTime: Helper.getFriendlyTime(stockDataNodes.querySelector("TimeOfLastSale").textContent),
                change: closeValue === 0 ? "0" : Helper.formatDecimal(parseFloat(lastSale - closeValue), 2).toString(),
                percent: openValue === 0 ? "N/A" : ((Math.abs(lastSale - openValue) * 100) / openValue).toString(),
                volume: volume,
                low: low,
                high: high,
                daysRange: openValue === 0 ? "N/A" : (low + " - " + high),
                symbol: companyInfoNodes.querySelector("Symbol").textContent.toUpperCase()
            };
        }

        return result;
    }

    function parseHistoryData(response) {
        var firstDate = "",
            rows = response.responseText.split("\n"),
            firstValues = rows[rows.length - 2].split(","),
            firstClose = parseFloat(firstValues[4]),
            stockValues = [];

        for (var i = 1, len = rows.length - 1; i < len; i++) {
            var values = rows[i].split(","),
                date = values[0];
            if (i === rows.length - 2) {
                firstDate = date;
            }
            var closeValue = parseFloat(values[4]);
            var perClose = (Math.abs(closeValue - firstClose) * 100) / firstClose * (closeValue > firstClose ? 1 : -1),
                volume = values[5],
                adjClose = parseFloat(values[6]);

            stockValues.push([date, closeValue]);
        }

        return {
            stockValues: stockValues,
            firstDate: firstDate
        };
    }

    WinJS.Namespace.define("Api", {
        getStockInfoData: getStockInfoData,
        getHistoryData: getHistoryData,
        getNewsData: getNewsData
    });
})();

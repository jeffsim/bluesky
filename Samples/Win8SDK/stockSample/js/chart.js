//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    function getChartOptions(isSnap) {

        var options = {
            dateAxes: true,
            graphBGColor: CanvasChart.graphBGColors.warm,
            drawElbows: false,
            yAxisDecimals: 1,
            drawShadows: false
        };
        
        if (isSnap) {
            options.gridRows     = 4;
            options.gridCols     = 4;
        }
        return options;
    }

    function getRangeOptions (range, isSnap) {
        var tickInterval;
        switch (range) {
            case "1w":
                tickInterval = "1 day";
                break;
            case "1m":
                tickInterval = isSnap ? "12 days" : "4 days";
                break;
            case "1y":
                tickInterval = "45 days";
                break;
            default:
                Helper.showMessage("invalid range " + range);
                break;
        }
        return {
            tickInterval: tickInterval
        };
    }

    function initialize () {
        //// insert any chart setup code here        
    }

    initialize();

    WinJS.Namespace.define("Chart", {
        getChartOptions: getChartOptions
    });
})();

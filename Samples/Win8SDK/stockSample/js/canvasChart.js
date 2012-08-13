//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }


    ////drawChart
    // Renders the points into the canvas of id that's passed in.
    //
    // Parameters:
    // chartCanvasId - The id of the canvas that the chart will be drawn into.
    // points - The array of point objects that will be drawn.
    //
    // Returns: none
    function drawChart(canvas, thePoints, options) {
        initialize(canvas, thePoints, options);
        drawBackground();
        drawChartGrid();
        chartPoints(thePoints, options);
    }

    // Variables used for data configuration
    var dateAxes, points;

    // Variables used for canvas / drawing
    var context;

    // Variables used for grid creation.
    var gridRows, gridCols;
    var gridWidth, gridHeight;
    var gridLineWidth, graphLineWidth;
    var legendNames;

    // Variables that control the rendered area.
    var chartWidth, chartHeight;
    var scaleXMin, scaleXMax;
    var scaleYMin, scaleYMax;
    var rangePad;

    // Variables that control styling.
    var drawLines, drawShadows, drawElbows, drawPointLabels, goldenMode;
    var axesFontSizeX, axesFontSizeY, pointLabelFontSize;
    var axesPaddingX, axesPaddingY, axesLabelsAlpha;
    var xAxisDecimals, yAxisDecimals;
    var seriesColors = [
        "#FFFFFF",
        "#0000CC",
        "#000000",
        "#99CC00",
        "#CCCCCC",
        "#33FFFF",
        "#993399",
        "#99FF99",
        "#6600CC",
        "#FF9966",
        "#666600",
        "#0033FF",
        "#CCCC00",
        "#FFFF00",
        "#FF00CC",
        "#666666",
        "#FFCC66",
        "#FFCC00",
        "#FF6600",
        "#CCFF66",
        "#FF9900",
        "#CCCC66",        
        "#FF6666",
        "#996699",
        "#CC9900"
    ];

    // Variables representing enumerations.
    var axisDateTypes = { short: 0, medium: 1, long: 2 };
    var axisDateType;
    var graphBGColors = { test: -1, hot: 0, cool: 1, cold: 2, money: 3 };
    var graphBGColor;
    var testModes = { simple: 0, random: 1, date: 2, plusMinus: 3, array: 4 };
    var testMode;
    var chartTypes = { line: 0, bar: 1 };
    var chartType;

    // Variables relevant to the legend. Default height of the legend supports 4 rows
    var defaultTotalLegendHeight = (4 * 30) + 20;

    function initialize(canvas, thePoints, options) {
        // Signals that the axes and some inputs must be parsed from date strings.
        dateAxes = false;
        axisDateType = axisDateTypes.short;

        // Default values for various chart features.
        drawLines = true, drawPointLabels = false, drawElbows = true, drawShadows = false, goldenMode = false;
        gridLineWidth = 1;
        graphLineWidth = 5;
        pointLabelFontSize = 10;
        rangePad = .10; // The amount of padding we place around the chart edges and graphed points.
        gridRows = 8;
        gridCols = 8;
        axesFontSizeX = 10;
        axesFontSizeY = 10;
        axesPaddingX = 40;
        axesPaddingY = 60;
        axesLabelsAlpha = .6;
        xAxisDecimals = 2;
        yAxisDecimals = 2;
        graphBGColor = graphBGColors.hot;
        testMode = testModes.random;
        chartType = chartTypes.line;
        context = canvas.getContext("2d");

        // Note: the boolean comparisons must test for false and true
        if (options) {
            if (typeof options.dateAxes === "boolean") {
                dateAxes = options.dateAxes;
            }
            if (!isNaN(options.axisDateType)) {
                axisDateType = options.axisDateType;
            }
            if (typeof options.drawLines === "boolean") {
                drawLines = options.drawLines;
            }
            if (typeof options.drawPointLabels === "boolean") {
                drawPointLabels = options.drawPointLabels;
            }
            if (typeof options.drawElbows === "boolean") {
                drawElbows = options.drawElbows;
            }

            if (typeof options.drawShadows === "boolean") {
                drawShadows = options.drawShadows;
            }
            if (typeof options.goldenMode === "boolean") {
                goldenMode = options.goldenMode;
            }
            if (!isNaN(options.gridLineWidth)) {
                gridLineWidth = options.gridLineWidth;
            }
            if (!isNaN(options.graphLineWidth)) {
                graphLineWidth = options.graphLineWidth;
            }
            if (!isNaN(options.pointLabelFontSize)) {
                pointLabelFontSize = options.pointLabelFontSize;
            }
            if (!isNaN(options.rangePad)) {
                rangePad = options.rangePad;
            }
            if (!isNaN(options.gridRows)){
                gridRows = options.gridRows;
            }
            if (!isNaN(options.gridCols)){
                gridCols = options.gridCols;
            }
            if (!isNaN(options.axesFontSizeX)){
                axesFontSizeX = options.axesFontSizeX;
            }
            if (!isNaN(options.axesFontSizeY)){
                axesFontSizeY = options.axesFontSizeY;
            }
            if (!isNaN(options.axesPaddingX)){
                axesPaddingX = options.axesPaddingX;
            }
            if (!isNaN(options.axesPaddingY)){
                axesPaddingX = options.axesPaddingY;
            }
            if (!isNaN(options.axesLabelsAlpha)){
                axesLabelsAlpha = options.axesLabelsAlpha;
            }
            if (!isNaN(options.xAxisDecimals)){
                xAxisDecimals = options.xAxisDecimals;
            }
            if (!isNaN(options.yAxisDecimals)){
                yAxisDecimals = options.yAxisDecimals;
            }
            if (!isNaN(options.testMode)) {
                testMode = options.testMode;
            }
            if (!isNaN(options.graphBGColor)){
                graphBGColor = options.graphBGColor;
            }
            if (!isNaN(options.chartType)){
                chartType = options.chartType;
            }
            if (options.legendNames) {
                legendNames = options.legendNames;
            }
        }

        if (thePoints && chartType === chartTypes.bar) {
            gridCols = thePoints.length;
        }

        // Configure based on options.
        if (goldenMode) {
            // Try to make chart more beautiful by enforcing "golden ratio" on grid and graph.
            context.canvas.width = 1.61 * canvas.height;
        }

        // Calculate the area that the graph/chart will be drawn in.
        chartWidth = canvas.width - axesPaddingY;
        chartHeight = canvas.height - axesPaddingX;

        // Calculate the grid for background / scale.
        gridWidth = chartWidth / gridCols;  // This is the width of the grid cells (background and axes).
        gridHeight = chartHeight / gridRows; // This is the height of the grid cells (background axes).

        // Extend the canvas if we need to draw a legend
        if (legendNames && legendNames.length > 0) {
            canvas.height = context.canvas.height + defaultTotalLegendHeight;
        }

        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
    }


    ////arrayToPoints
    // Conversion of array to points for convenience.
    //
    // Parameters:
    //   "pointsArray" - The 2d array (x,y) of elements to convert.
    // Returns:
    //   Array of Point objects.
    function arrayToPoints(pointsArray) {
        var thePoints = [];
        for (var i = 0, len = pointsArray.length; i < len; i++) {
            if (dateAxes) {
                // TODO: this should be a function that is passed in.
                var yearMonthDay = pointsArray[i][0].split("-");
                var month = parseInt(yearMonthDay[1]) - 1;  // The month value for the Date object is zero-based
                var date = new Date(yearMonthDay[0], month, yearMonthDay[2]);
                thePoints[i] = new Point(date, pointsArray[i][1]);
            } else {
                thePoints[i] = new Point(pointsArray[i][0], pointsArray[i][1]);
            }
        }
        return thePoints;
    }

    ////chartPoints
    // Sets up the chart axes and draws the points.
    //
    // Parameters :
    //   'pointsArray' - the array of point objects to chart
    // Returns    : none
    function chartPoints(pointsArray, options) {
        var thePoints = pointsArray;
        // Are we graphing dates? If so, we'll have to put dates on axes and so on.
        if (thePoints[0][0].x instanceof Date) {
            dateAxes = true;
        }

        for (var i = 0, len = thePoints.length; i < len; i++) {
            // Do we need to turn a 2d array into points?
            if (!(thePoints[i][0] instanceof Point)) {
                thePoints[i] = arrayToPoints(pointsArray[i]);
            }

            // Sort the points so our line doesn't cross.
            thePoints[i].sort(pointCompare);
        }

        // Determine the scale for drawing axes / points.
        calculateScale(thePoints);

        drawAxes(thePoints);


        if (chartType === chartTypes.line) {
            graphPoints(thePoints);
        } else if (chartType === chartTypes.bar) {
            graphBars(thePoints);
        }

        if (legendNames && legendNames.length > 0) {
            drawLegend();
        }
    }

    ////drawBackground
    // Draws the colorful grid background
    //
    // Parameters : none
    // Returns    : none
    function drawBackground() {
        if (chartType === chartTypes.line) {
            for (var i = 0; i < gridRows; i++) {
                getColor(i);
                context.fillRect(0, i * gridHeight, chartWidth, gridHeight);
            }
        }
    }

    function getColor(i) {
        switch (graphBGColor) {
            case graphBGColors.hot:
                context.fillStyle = "rgb(" + Math.floor(255 - ((111 / gridRows) * i)) + "," + Math.floor(185 - ((185 / gridRows) * i)) + "," + Math.floor((80 / gridRows) * i) + ")";
                break;
            case graphBGColors.cool:
                context.fillStyle = "rgb(" + Math.floor((80 / gridRows) * i) + "," + Math.floor(185 - ((185 / gridRows) * i)) + "," + Math.floor(255 - ((111 / gridRows) * i)) + ")";
                break;
            case graphBGColors.cold:
                context.fillStyle = "rgb(" + Math.floor(185 - ((185 / gridRows) * i)) + "," + ((80 / gridRows) * i) + "," + Math.floor(255 - ((111 / gridRows) * i)) + ")";
                break;
            case graphBGColors.money:
                context.fillStyle = "rgb(" + Math.floor(90 - (80 / gridRows) * i) + "," + Math.floor(205 - ((155 / gridRows) * i)) + "," + Math.floor(90 - ((80 / gridRows) * i)) + ")";
                break;
            default:
                context.fillStyle = "rgb(" + Math.floor(150 - ((150 / gridRows) * i)) + "," + ((80 / gridRows) * i) + "," + Math.floor(255 - ((111 / gridRows) * i)) + ")";
                break;
        }
    }

    ////drawChartGrid
    // Draws the white lines that go vertically between vertical gridlines
    //
    // Parameters : none
    // Returns    : none
    function drawChartGrid() {
        for (var i = 0; i < gridCols; i++) {
            context.strokeStyle = "rgba(255,255,255, .7)";
            context.beginPath();
            context.moveTo(i * gridWidth, chartHeight);
            context.lineTo(i * gridWidth, 0);
            context.lineWidth = gridLineWidth;
            context.stroke();
        }
    }

    ////getDateString
    // Returns a date string in various convenient formats.
    //
    // Parameters:
    // format - A
    function getDateString(theDate, format) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dateString;

        switch (format) {
            case axisDateTypes.short:
                var month = months[theDate.getMonth()];
                var day = theDate.getDate();
                dateString = month + " " + day;
                break;
            case axisDateTypes.medium:
            case axisDateTypes.long:
            default:
                dateString = theDate.toDateString();
                break;
        }
        return dateString;
    }

    ////drawAxes
    // Draws the axes based on how the chart is configured
    // Parameters : none
    // Returns    : none
    //
    // Notes: This could have a better handling for determining how to
    // label the axes, for example, it could determine the scales and
    // so forth for the font size and positioning.
    function drawAxes(thePoints) {
        var xRange = scaleXMax - scaleXMin;
        var yRange = scaleYMax - scaleYMin;

        var xUnit = xRange / gridCols;
        var yUnit = yRange / gridRows;

        context.fillStyle = "rgba(255,255,255," + axesLabelsAlpha + ")";
        context.font = axesFontSizeY + "pt Arial";

        var text = "";

        // Draw the y-axes labels.
        for (var i = 1; i < gridRows; i++) {
            if (yAxisDecimals === 0) {
                text = Math.round(scaleYMax - (i * yUnit));
            } else {
                text = (scaleYMax - (i * yUnit)).toFixed(yAxisDecimals);
            }
            context.fillText(text, chartWidth + 5, i * gridHeight);
        }

        context.font = axesFontSizeX + "pt Arial";

        // Draw the x-axis labels
        if (chartType === chartTypes.line) {
            for (i = 0; i < gridCols; i++) {
                text = "";
                if (dateAxes) {
                    var date = new Date();
                    date.setTime(scaleXMin.getTime() + (i * xUnit));
                    text = getDateString(date, axisDateType);
                } else {
                    text = Math.round(scaleXMin + (i * xUnit));
                }
                context.fillText(text, i * gridWidth, chartHeight + (axesPaddingX - axesFontSizeX));
            }
        }
        // For bar charts, draw all labels exactly as they appear in the Point structure.
        if (chartType === chartTypes.bar) {
            gridCols = thePoints[0].length;
            for (i = 0; i < gridCols; i++) {
                text = "";
                text += thePoints[0][i].x;
                context.fillText(text, i * gridWidth, chartHeight + axesFontSizeY);
            }
        }
    }

    ////calculateScale
    // Determines what the axes should be for graphing
    //
    // Parameters:
    //   points - Array of points with x and y values
    //
    // Returns: none
    function calculateScale(thePoints) {
        scaleXMin = thePoints[0][0].x;
        scaleYMax = thePoints[0][0].y;
        scaleXMax = thePoints[0][0].x;
        scaleYMin = thePoints[0][0].y;
        for (var i = 0, len = thePoints.length; i < len; i++) {
            for (var j = 0, len2 = thePoints[i].length; j < len2; j++) {
                if (scaleXMax < thePoints[i][j].x) {
                    scaleXMax = thePoints[i][j].x;
                }
                if (scaleYMax < thePoints[i][j].y) {
                    scaleYMax = thePoints[i][j].y;
                }
                if (scaleXMin > thePoints[i][j].x) {
                    scaleXMin = thePoints[i][j].y;
                }
                if (scaleYMin > thePoints[i][j].y) {
                    scaleYMin = thePoints[i][j].y;
                }
            }
        }
    }
    ////graphBars
    // Draws bar graphs on the current chart
    //
    // Parameters:
    //   points - An array of points to draw as bars.
    //
    // Returns: none
    function graphBars(thePoints) {
        var barsToGraph = thePoints[0].length - 1;

        var xRange = scaleXMax - scaleXMin;
        var xFactor = Math.round(xRange / gridCols);

        // Determine the scaling factor based on the min / max ranges.
        var yRange = scaleYMax - scaleYMin;

        var padX = chartWidth / 25;
        var padY = chartHeight / 25;

        var yFactor = (chartHeight - padY) / yRange;

        if (drawShadows) {
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4;
            context.shadowColor = "rgba(0, 0, 0, 0.5)";
        }
        context.fillStyle = "rgba(255,255,255, 1)";
        context.beginPath();

        var yStart = Math.round(chartHeight);

        for (var i = 0; i < barsToGraph; i++) {
            var xStart = Math.round(i * gridWidth) + Math.round(gridWidth / 2);
            var xFinish = Math.round((i + 1 * gridWidth) - gridWidth / 5) - Math.round(gridWidth / 2);
            var yFinish = Math.round(((thePoints[0][i].y - scaleYMin) * yFactor) - padY);
            getColor(i);
            context.fillRect(xStart + (gridWidth / 10), yFinish, gridWidth * .8, yStart - yFinish);
        }
    }

    ////graphPoints
    // Draws the points on a chart.
    //
    // Parameters:
    //   points - An array of points to draw.
    //
    // Returns: none
    function graphPoints(thePoints) {
        for (var seriesIndex = 0, numOfSeries = thePoints.length; seriesIndex < numOfSeries; seriesIndex++) {
            if (thePoints[seriesIndex].length > 1) {
                var thisX, thisY, nextX, nextY, i, len;

                // Determine the scaling factor based on the min / max ranges.
                var xRange = scaleXMax - scaleXMin;
                xRange += rangePad * xRange;
                var yRange = scaleYMax - scaleYMin;
                yRange += rangePad * yRange;

                var padX = chartWidth / 25;
                var padY = chartHeight / 25;

                var xFactor = (chartWidth) / xRange;
                var yFactor = (chartHeight - padY) / yRange;

                // If we use a 'miterlimit' of .5 the elbow width, the elbow covers the line.
                context.miterLimit = graphLineWidth / 4;

                if (drawShadows) {
                    context.shadowOffsetX = 2;
                    context.shadowOffsetY = 2;
                    context.shadowBlur = 4;
                    context.shadowColor = "rgba(0, 0, 0, 0.5)";
                }

                context.strokeStyle = seriesColors[seriesIndex];
                context.beginPath();

                // Draw the points (elbows).
                // Note: Moving this below the line drawing code will cause fills in the lines.
                for (i = 0, len = thePoints[seriesIndex].length; i < len; i++) {
                    thisX = (thePoints[seriesIndex][i].x - scaleXMin) * xFactor, thisY = (thePoints[seriesIndex][i].y - scaleYMin) * yFactor;

                    if (drawElbows) {
                        context.moveTo(thisX, (chartHeight - thisY) - padY);
                        context.arc(thisX, (chartHeight - thisY) - padY, graphLineWidth / 2, 0, 360);
                        context.moveTo(thisX, (chartHeight - thisY) - padY);
                        context.fill();
                    }
                }

                // Move to the first point.
                thisX = (thePoints[seriesIndex][0].x - scaleXMin) * xFactor, thisY = (thePoints[seriesIndex][0].y - scaleYMin) * yFactor;
                nextX = (thePoints[seriesIndex][1].x - scaleXMin) * xFactor, nextY = (thePoints[seriesIndex][1].y - scaleYMin) * yFactor;
                context.moveTo(thisX, (chartHeight - thisY) - padY);

                // Draw a path for the line graph.
                if (drawLines) {
                    for (i = 0, len = thePoints[seriesIndex].length; i < len - 1; i++) {
                        thisX = (thePoints[seriesIndex][i].x - scaleXMin) * xFactor, thisY = (thePoints[seriesIndex][i].y - scaleYMin) * yFactor;
                        nextX = (thePoints[seriesIndex][i + 1].x - scaleXMin) * xFactor, nextY = (thePoints[seriesIndex][i + 1].y - scaleYMin) * yFactor;

                        context.lineTo(nextX, (chartHeight - nextY) - padY);

                        context.lineWidth = graphLineWidth;
                    }
                    context.stroke();
                }


                // Draw the labels.
                // Note: Moving this above the line drawing code will cause the lines to occlude labels.
                for (i = 0, len = thePoints[seriesIndex].length; i < len; i++) {
                    thisX = (thePoints[seriesIndex][i].x - scaleXMin) * xFactor, thisY = (thePoints[seriesIndex][i].y - scaleYMin) * yFactor;

                    if (drawPointLabels) {
                        var text = "";
                        if (dateAxes) {
                            var date = new Date();
                            date.setTime(thePoints[seriesIndex][i].x);
                            text = date.toLocaleDateString();
                        } else {
                            text = Math.round(thePoints[seriesIndex][i].x).toString() + ", " + Math.round(thePoints[seriesIndex][i].y).toString();
                        }
                        context.fillStyle = "rgb(255,255,255)";
                        context.font = pointLabelFontSize + "pt Arial";
                        context.fillText(text, thisX, (chartHeight - thisY) - padY);
                    }
                }
            }
        }
    }

    function drawLegend() {
        var legendLineWidth = 40;
        var legendLineMarginX = 15;
        var legendLineMarginY = 30;
        var legendBoxMarginX = 5;
        var legendBoxMarginY = 15;
        var legendTextOffsetY = 5;
        var legendColor = "#FFFFFF";
        var legendFont = "10pt Segoe UI";
        var i, len;

        // Determine the widest legend text
        var widestTextSize = 0;
        for (i = 0, len = legendNames.length; i < len; i++) {
            context.font = legendFont;
            var currentTextWidth = context.measureText(legendNames[i]).width;
            if (currentTextWidth > widestTextSize) {
                widestTextSize = currentTextWidth;
            }
        }

        // For calculating the optimal width of a single legend, we calculate the line width, space between the line and text,
        // margin between 2 legends and the width of the legend text. This is the divisor over the canvas width.
        var singleLegendWidth = legendLineWidth + legendLineMarginX + widestTextSize + legendBoxMarginX;
        var singleLegendHeight = legendLineMarginY;
        var numberOfLegendsX = Math.floor(chartWidth / singleLegendWidth);
        var numberOfLegendsY = Math.ceil(legendNames.length / numberOfLegendsX);
        var totalLegendWidth = singleLegendWidth * numberOfLegendsX;
        var totalLegendHeight = singleLegendHeight * numberOfLegendsY;

        // Extend the canvas based on the optimal size of the legend box
        var x = 0;
        var y = chartHeight + axesPaddingX + legendBoxMarginX;

        // Draw the outer box
        context.strokeStyle = legendColor;
        context.lineWidth = 1;
        context.strokeRect(x, y, chartWidth, totalLegendHeight);

        // Draw the individual legends
        context.lineWidth = graphLineWidth;
        x = legendBoxMarginX;
        y += legendBoxMarginY;
        var legendCounterX = 1;
        for (i = 0, len = legendNames.length; i < len; i++) {
            context.beginPath();

            // Draw the legend line
            context.strokeStyle = seriesColors[i];
            context.moveTo(x, y);
            context.lineTo(x + legendLineWidth, y);
            context.stroke();

            // Draw the text with the legend name
            x += legendLineWidth + legendLineMarginX;
            context.moveTo(x, y);
            context.fillStyle = legendColor;
            context.font = legendFont;
            context.fillText(legendNames[i], x, y + legendTextOffsetY);

            // Move on to the next legend name/line. If this will take us over the right margin, we go to the next line
            x += widestTextSize + legendBoxMarginX;
            ++legendCounterX;
            if (legendCounterX > numberOfLegendsX) {
                legendCounterX = 1;
                x = legendBoxMarginX;
                y += singleLegendHeight;
            }
        }
    }

    ////pointCompare
    // A sorting function for sorting point values.
    //
    // Parameters:
    //   left - element on the left of the comparison operator
    //   right - the element on the right of the comparison operator
    //
    // Returns:
    //   positive if left > right,
    //   0 if left === right,
    //   negative if left < right
    function pointCompare(left, right) {
        if (left.x > right.x) {
            return 1;
        }
        if (left.x === right.x) {
            return 0;
        }
        return -1;
    }
    
    WinJS.Namespace.define("CanvasChart", {
        Point: Point,
        graphBGColors: graphBGColors,
        testModes: testModes,
        chartTypes: chartTypes,
        drawChart: drawChart
    });
})();
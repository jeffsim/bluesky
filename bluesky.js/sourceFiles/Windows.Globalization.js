// =========================================================
//
// Minimalist implementation of Globalization to unblock stockSample
//
WinJS.Namespace.define("Windows.Globalization.DateTimeFormatting", {

    // =========================================================
    //
    //	WinJS.Globalization.DateTimeFormatting.DateTimeFormatter
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.globalization.datetimeformatting.datetimeformatter
    //
    DateTimeFormatter: WinJS.Class.define(function (formatTemplate) {

        this._formatTemplate = formatTemplate;
    },
    {
        format: function (date) {
            var parts = this._formatTemplate.split(" ");
            var result = "";
            // TODO: Parse the format string.  For now, hardcoded to what the bluesky samples need
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var partParts = part.split(".");
                switch (partParts[0]) {
                    case "hour":
                        if (i < parts.length - 1 && parts[i + 1] == "minute") {
                            result += date.getHours() + ":" + date.getMinutes();
                            i++;
                        }
                        else
                            result += date.getHours();
                        break;

                    case "minute":
                        result += date.getMinutes();
                        break;

                    case "year":
                        if (partParts[1] && partParts[1] == "abbreviated")
                            result += date.getFullYear() - 2000;
                        else
                            result += date.getFullYear();
                        break;

                    case "month":
                        if (partParts[1] && partParts[1] == "abbreviated")
                            result += this._abbreviatedMonths[date.getMonth()];
                        else
                            result += this._fullMonths[date.getMonth()];
                        break;

                    case "day":
                        result += date.getDate();
                        break;

                    case "dayofweek":
                        result += this._abbreviatedDays[date.getDay()];
                        break;
                }
                result += " ";
            }
            return result;
        },
        // TODO: Start with Mon or Sun?
        _fullDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        _abbreviatedDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        _fullMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        _abbreviatedMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    }, {
        // TODO
        shortDate: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },

        longDate: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },

        // TODO
        shortTime: {
            patterns: {
                first: function () {
                    return {
                        current: {
                            indexOf: function (a) { return; }
                        }
                    }
                }
            }
        },
    })
});



// ================================================================
//
// Windows.Globalization.Calendar
//
//		TODO: Stubbed out for test purposes
//
//		NYI NYI NYI
//
// =========================================================
//
// Minimalist implementation of Globalization to unblock stockSample
//
WinJS.Namespace.define("Windows.Globalization", {

    Calendar: WinJS.Class.define(function () {
    }, {
        setToMin: function () {
        },
        setToMax: function () {
        }

    }),
});

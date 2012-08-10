"use strict";

// ================================================================
//
// WinJS.Utilities
//
// This is the root WinJS.Utilities namespace/object
WinJS.Utilities = WinJS.Utilities || {

    // ================================================================
    //
    // WinJS.Utilities.addClass
    //
    // Adds the specified class to the specified DOM element
    addClass: function (element, newClass) {

        // tbd-perf: do this without wrapping in $
        $(element).addClass(newClass);
    }
}


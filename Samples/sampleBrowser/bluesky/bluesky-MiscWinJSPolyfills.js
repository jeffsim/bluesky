﻿// ================================================================
//
// WinJS-MiscPolyfill.js
//
//      This file contains various fillers for IE10 features/properties that Win8
//      apps can rely on but which we cannot.
//
//      "Polyfill" may not be the right name for this file, but it'll do.
//
//      NOTE: This file is NOT trying to be particularly performant; it's main purpose is to notify
//      developers that they are using non-cross-browser-compatible features.
//


// ================================================================
//
//      IE10 has -ms-grid, so we need to add some helper styles if we're not on IE10.
//      These samples are demonstrating the delta between Win8 and bluesky; in real apps, just 
//      don't use -ms-grid, and this won't be necessary.
//
$(document).ready(function () {
    if (!($.browser.msie && $.browser.version == "10.0")) {
        $("body").addClass("notIE10");
    }
});

if (!$.browser.msie) {

    // ================================================================
    //
    // Add srcElement to events
    //
    if (!Event.prototype.srcElement) {
        var warnedSrcElement = false;
        Event.prototype.__defineGetter__("srcElement", function () {
            if (!warnedSrcElement) {
                console.warn("bluesky: srcElement is not present on non-IE browsers, and has been changed to target; consider changing code for perf.  This warning will appear only once.");
                warnedSrcElement = true;
            }
            return this.target;
        });
    }

    // ================================================================
    //
    // Add setActive to DOM elements
    //
    //      TODO: Just nop'ing this for now.
    //
    if (!Element.setActive) {
        var warnedSetActive = false;
        Element.prototype.setActive = function (value) {
            if (!warnedSetActive) {
                console.warn("bluesky: setActive is not present on non-IE browsers, and has been NOP'ed for now.");
                warnedSetActive = true;
            }

            // nop
        }
    }

    // ================================================================
    //
    // Add onpropertychange handler to DOM elements
    //
    //      TODO: This is decidedly not the right polyfill, but it addresses the current need.
    //
    if (!Element.onpropertychange) {
        var warnedPropertyChange = false;
        Element.prototype.__defineSetter__("onpropertychange", function (value) {
            if (!warnedPropertyChange) {
                console.warn("bluesky: onpropertychange is not present on non-IE browsers, and has been rerouted to onclick which only helps in a few situations (e.g. using it for checkbox click handlers); consider changing code for perf.  This warning will appear only once.");
                warnedPropertyChange = true;
            }
            this.onclick = value;
        });
    }

    // ================================================================
    //
    // Add innerText getter/setter to element
    //
    if (!Element.prototype.innerText) {
        var warnedInnerText = false;
        Element.prototype.__defineGetter__("innerText", function () {
            if (!warnedInnerText) {
                console.warn("bluesky: innerText is not present on non-IE browsers, and has been changed to textContent; consider changing code for perf.  This warning will appear only once.");
                warnedInnerText = true;
            }
            return this.textContent;
        });
        Element.prototype.__defineSetter__("innerText", function (value) {
            if (!warnedInnerText) {
                console.warn("bluesky: innerText is not present on non-IE browsers, and has been changed to textContent; consider changing code for perf.  This warning will appear only once.");
                warnedInnerText = true;
            }
            this.textContent = value;
        });
    }
}

// ================================================================
//
// prototype.bind extension
//
//      The Windows 8 templates use the recent "bind" addition to Javascript (short defn of bind: bind creates a new 
//      function that, when called, itself calls this function in the context of the provided this value).  Browsers
//      such as WP7 and iOS's browser do not support bind, so we add it here.  Thank you Mozilla: (see this
//      page: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind).
//
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
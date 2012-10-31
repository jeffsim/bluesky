// ================================================================
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

// ================================================================
//
// Add toStaticHTML
//
if (!window.toStaticHTML) {
    var warnedStaticHTML = false;
    window.toStaticHTML = function (html) {

        if (!warnedStaticHTML) {
            console.warn("bluesky: toStaticHTML is not present on non-IE browsers, and has been polyfilled to just return the source HTML; consider changing code for perf.  This warning will appear only once.");
            warnedStaticHTML = true;
        }
        var root = document.implementation.createHTMLDocument("page").body;
        root.innerHTML = html;
        $(root).find("script, style").remove();
        return root.innerHTML;
    }
}

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

    if (!Element.currentStyle)
        Element.prototype.currentStyle = function (el, cssprop) {

            if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
                return document.defaultView.getComputedStyle(el, "")[cssprop]
            else //try and get inline style
                return el.style[cssprop]
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


// ================================================================
//
// Element.classList polyfill
//
//		This is present on all modern browsers except for IE9.
//
//		==> NOTE: THIS POLYFILL IS COMPLETELY UNTESTED.  IT'S FOR TESTING PURPOSES. <==
//
if (!Element.classList) {

    var warnedPolyfill = false;
    var polyFillClassList = function (element) {
        return {
            length: {
                get: function () {
                    if (this.className == "")
                        return 0;
                    var num = this.className.split(" ");
                    return num + 1;
                }
            },

            add: function (className) {
                this._checkWarned();
                $(element).addClass(className);
            },

            remove: function (className) {
                this._checkWarned();
                $(element).removeClass(className);
            },

            contains: function (className) {
                this._checkWarned();
                return $(element).hasClass(className);
            },

            toggle: function (className) {
                this._checkWarned();
                if (this.contains(className))
                    this.remove(className);
                else
                    this.add(className);
            },

            _checkWarned: function () {
                if (!warnedPolyfill) {
                    console.warn("bluesky: Element.classList is not present in this browser, and has been polyfilled; consider changing code for perf.  This warning will appear only once.");
                    warnedPolyfill = true;
                }
            }
        }
    }

    Object.defineProperty(Element.prototype, "classList", {
        get: function () {
            return new polyFillClassList(this);
        },
        enumerable: true,
        configurable: true
    });
}


if (window.Node && !window.Node.removeNode) {
    Node.prototype.removeNode = function (removeChildren) {
        var self = this;
        if (Boolean(removeChildren)) {
            return this.parentNode.removeChild(self);
        }
        else {
            var range = document.createRange();
            range.selectNodeContents(self);
            return this.parentNode.replaceChild(range.extractContents(), self);
        }
    }
}


// ================================================================
//
// Normalize indexedDB
//
if (!window.msIndexedDB) {
    var warnedIndexedDB = false;
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    window.msIndexedDB = function (html) {

        // Warn the dev even if the current browser has it, since they may not realize they're going to have issues on IE9.
        if (!warnedIndexedDB) {
            console.warn("bluesky warning: this app uses indexedDB, but IE9 does not support it; this app may not run on IE9 as a result.");
            warnedIndexedDB = true;
        }
        return indexedDB;
    }
}

// ================================================================
//
// IE supports a variety of funcitons and members on HTMLElement.style which other browsers do not support.  Add them here..
//
if (!CSSStyleDeclaration.posLeft) {

    Object.defineProperty(CSSStyleDeclaration.prototype, "posLeft", {
        get: function () {
            return parseInt(this.left);
        },
        set: function (value) {
            this.left = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "posTop", {
        get: function () {
            return parseInt(this.top);
        },
        set: function (value) {
            this.top = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CSSStyleDeclaration.prototype, "posWidth", {
        get: function () {
            return parseInt(this.width);
        },
        set: function (value) {
            this.width = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "posHeight", {
        get: function () {
            return parseInt(this.height);
        },
        set: function (value) {
            this.height = parseInt(value) + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "float", {
        get: function () {
            return this.cssFloat;
        },
        set: function (value) {
            this.cssFloat = value;
        },
        enumerable: true,
        configurable: true
    });

    // polyfill for HTMLElement.style.setAttribute(key,value) here
    CSSStyleDeclaration.prototype.setAttribute = function (key, value) {
        this[key] = value;
    };

    // polyfill for HTMLElement.style.removeAttribute(key,value) here
    CSSStyleDeclaration.prototype.removeAttribute = function (key) {
        this[key] = null;
    };
}

// Only IE10 supports MSPointerDown (et al), so we need to hook into addEventListener (et al) on other browsers
// TODO: I don't want to do a ua-check here, but am not sure how to test for existence of MSPointerUp...
if (!($.browser.msie && $.browser.version == "10.0")) {

    var evtMap = {
        MSPointerDown: "mousedown",
        MSPointerUp: "mouseup",
        MSPointerMove: "mousemove",
        MSPointerCancel: ""    // TODO: hm.
    };

    var originalAddEL = HTMLCanvasElement.prototype.addEventListener;
    HTMLCanvasElement.prototype.addEventListener = function (evt, func, cap) {

        // if the event is one of the IE10 ones, then map to a known one
        if (evtMap[evt]) {
            // TODO: Warn dev
            evt = evtMap[evt];
        }

        // Call the original addEventListener function
        // TODO (CLEANUP): Can I call 'base' or something here?
        originalAddEL.call(this, evt, func, cap);
    };

    var originalRemoveEL = HTMLCanvasElement.prototype.removeEventListener;
    HTMLCanvasElement.prototype.removeEventListener = function (evt, func, cap) {

        // if the event is one of the IE10 ones, then map to a known one
        if (evtMap[evt])
            evt = evtMap[evt];

        // Call the original removeEventListener function
        // TODO (CLEANUP): Can I call 'base' or something here?
        originalRemoveEL.call(this, evt, func, cap);
    };
}
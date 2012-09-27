"use strict";

// ================================================================
//
// Windows
//
// This is the root Windows namespace/object
WinJS.Namespace.define("Windows", {

    // ================================================================
    //
    // Windows.UI
    //
    //		This is the root Windows.UI namespace/object
    //
    //		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    UI: {
        ViewManagement: {

            ApplicationView: {
                // TODO (CLEANUP): Move this into separate namespace define so I can use the full enum
                value: 0//Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape,
            },

            ApplicationViewState: {

                view: {
                    value: this.filled,
                },

                // Enumeration
                fullScreenLandscape: 0,
                filled: 1,
                snapped: 2,
                fullScreenPortrait: 3
            },
            InputPane: {
                getForCurrentView: function () {
                    return {
                        addEventListener: function () {
                        }
                    }
                }
            },
        },


        StartScreen: {
            SecondaryTile: {
                exists: function () {
                    return false;
                }
            }
        },
    },


    // ================================================================
    //
    // Windows.Graphics
    //
    //		TODO: Stubbed out for test purposes
    //
    //		NYI NYI NYI
    //
    Graphics: {
        Display: {
            DisplayProperties: {
            }
        },
        Printing: {
            PrintManager: {
                getForCurrentView: function () {
                    return {};
                }
            }
        }
    },

    // ================================================================
    //
    // Windows.Data
    //
    //		TODO: Stubbed out for test purposes
    //
    //		NYI NYI NYI
    //
    Data: {
        Xml: {
            Dom: {
                XmlDocument: function () {
                    var p = new DOMParser();

                    // TODO (CLEANUP): XMLDocument has a loadXml which is equivalent to parseFromString... but this is ugly. I
                    // imagine I should be created a document here, not a parser...
                    p.loadXml = function (str) {
                        this._str = str;
                        return this.parseFromString(str, "text/xml");
                    }
                    p.getXml = function () {
                        return this._str;
                    }
                    return p;//.parseFromString("", "text/xml");
                }
            }
        }
    }
});


// ================================================================
//
// MSApp.execUnsafeLocalFunction
//
//      TODO (Cleanup): Move this to dedicated file
//
WinJS.Namespace.define("MSApp", {
    execUnsafeLocalFunction: function (c) { return c(); }
});

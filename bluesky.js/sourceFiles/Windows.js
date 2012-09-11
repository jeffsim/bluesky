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
                value: null,
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

});


// ================================================================
//
// Add MSApp.execUnsafeLocalFunction
//
//      TODO (Cleanup): Move this to dedicated file
//
WinJS.Namespace.define("MSApp", {
    execUnsafeLocalFunction: function (c) { return c; }
});

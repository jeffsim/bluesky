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
            }
        },


        // ================================================================
        //
        // Windows.UI.ApplicationSettings
        //
        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        ApplicationSettings: {
            SettingsPane: {
                getForCurrentView: function () {
                    return {
                        oncommandsrequested: null
                    };
                }
            }
        },


        // ================================================================
        //
        // Windows.UI.StartScreen
        //
        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        StartScreen: {

            SecondaryTile: {
                exists: function () {
                    return false;
                },

                smallLogo: null,

                requestCreateForSelectionAsync: function (rect) {
                    return new WinJS.Promise(function (c) { c(false); });
                }
            },

            TileOptions: {
                none: 0,
                showNameOnLogo: 1,
                showNameOnWideLogo: 2,
                copyOnDeployment: 4
            }
        },


        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        Input: {
            Inking: {
                InkManager: WinJS.Class.define(function () {
                }, {
                    mode: 0,
                    processPointerDown: function (c) {
                    },
                    getStrokes: function () {
                        return [];
                    },
                    deleteSelected: function () {
                    },
                    updateRecognitionResults: function () {
                    },
                    selectWithLine: function () {
                    },
                    copySelectedToClipboard: function () {
                    },
                    pasteFromClipboard: function () {
                    },
                    recognizeAsync: function () {
                        return new WinJS.Promise(function (c) { c(); });
                    },
                    getRecognizers: function () {
                        return [];
                    }
                }, {

                    InkManipulationMode: {
                        selecting: 0,
                        erasing: 1,
                        inking: 2
                    }
                })
            },

            //		TODO: Stubbed out for test purposes
            //
            //		NYI NYI NYI
            //
            GestureRecognizer: WinJS.Class.define(function () { }, {
                addEventListener: function () {
                },
                removeEventListener: function () {
                }
            }),

            //		TODO: Stubbed out for test purposes
            //
            //		NYI NYI NYI
            //
            GestureSettings: {
                manipulationRotate: 1,
                manipulationTranslateX: 2,
                manipulationTranslateY: 3,
                manipulationScale: 4,
                manipulationRotateInertia: 5,
                manipulationScaleInertia: 6,
                manipulationTranslateInertia: 7,
                tap: 8
            }
        },

        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        ColorHelper: {
            fromArgb: function (a, r, g, b) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            }
        },


        // ================================================================
        //
        //      Windows.UI.Notifications
        //
        //		TODO: Stubbed out for test purposes
        //
        //		NYI NYI NYI
        //
        Notifications: {
            TileUpdateManager: {
                createTileUpdaterForApplication: function () {
                    return {
                        clear: function () {
                        },
                        enableNotificationQueue: function () {
                        }
                    };
                }
            }
        }
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
    // Windows.Networking
    //
    //		TODO: Stubbed out for test purposes
    //
    //		NYI NYI NYI
    Networking: {

        Connectivity: {
            NetworkConnectivityLevel: {
                none: 0,
                localAccess: 1,
                constrainedInternetAccess: 2,
                internetAccess: 3
            },

            NetworkInformation: {
                getInternetConnectionProfile: function () {
                    return {
                        getNetworkConnectivityLevel: function () {
                            return Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
                        }
                    }
                }
            }
        },
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
if (!window.MSApp) {
    window.MSApp = {
        execUnsafeLocalFunction: function (c) { return c(); }
    };
}
"use strict";

// ================================================================
//
// Windows
//
// This is the root Windows namespace/object
var Windows = {

    // ================================================================
    //
    // Windows.UI
    //
    // This is the root Windows.UI namespace/object
    //
    // NYI NYI NYI
    //
    UI: {
        ViewManagement: {
            ApplicationView: {
                getForCurrentView: function () {

                    return {

                        // Add an event listener for the specified event
                        addEventListener: function (eventName, callback) {
                            if (this.listeners[eventName] == undefined)
                                this.listeners[eventName] = [];
                            this.listeners[eventName].push(callback);
                        },

                        //
                        // NYI NYI NYI
                        //
                        onviewstatechanged: null,
                        
                        // listeners: list of registered eventlisteners.
                        listeners: [],
                    }
                }
            },

            ApplicationViewState: {
                // nyi: picked random value
                snapped: 100,
            }
        }
    },


    // ================================================================
    //
    // Windows.Globalization
    //
    // This is the root Windows.Globalization namespace/object
    //
    // NYI NYI NYI
    //
    // var dayFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek.abbreviated");
    // var timeFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("hour minute");
    Globalization: {
        DateTimeFormatting: {
            DateTimeFormatter: function (dateFormat) {
                var newFormatter = {
                    format: function (date) {
                        return date.toString();
                    },
                    dateFormat: dateFormat
                }
                return newFormatter;
            }
        }
    },
    
    
    // ================================================================
    //
    // Windows.Storage
    //
    // This is the root Windows.Storage namespace/object
    //
    // NYI NYI NYI
    //
    Storage: {
        ApplicationData: {
            current: {
                roamingSettings: {
                    values: {
                        "mystocks": ""
                    }
                }
            }
        }
    },


    // ================================================================
    //
    // Windows.Graphics
    //
    // This is the root Windows.Graphics namespace/object
    //
    // NYI NYI NYI
    //
    Graphics: {
        Display: {
            DisplayProperties: {
            }
        }
    },


    // ================================================================
    //
    // Windows.ApplicationModel
    //
    // This is the root Windows.ApplicationModel namespace/object
    //
    // NYI NYI NYI
    //
    ApplicationModel: {
        isWeb: true,
        Activation: {
            ActivationKind: {
                launch: 0
            },
            ApplicationExecutionState: {
                terminated: 0
            }
        }
    }
}

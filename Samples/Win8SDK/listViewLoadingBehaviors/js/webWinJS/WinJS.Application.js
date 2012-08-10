"use strict";

// ================================================================
//
// WinJS.Application
//
// This is the root WinJS.Application namespace/object
WinJS.Namespace.defineWithParent(WinJS, "Application", {

    // ================================================================
    //
    // Function: WinJS.Application.start
    //
    // Called when the webapp starts
    start: function () {

        // tbd: I haven't put any thought into the right startup flow.  For now,
        // we just wait until the document is done loading, and then fire our
        // on activated event.  Default.js should register for and handle this event.
        var that = this;

        $(document).ready(function () {

            // We need to initialize the Navigation component to get history going.
            WinJS.Navigation.init();

            var args = {
                detail: {
                    kind: Windows.ApplicationModel.Activation.ActivationKind.launch,
                    previousExecutionState: null
                },
                setPromise: function (promise) {
                    promise.then(function (onComplete) {
                        // tbd: what does Win8 expect us to do at this point?
                        onComplete();
                    });
                }
            };
            for (var i in that._eventListeners.activated)
                that._eventListeners.activated[i].listener(args);
        });
    },

    addEventListener: function (eventName, listener) {

        if (!this._eventListeners[eventName])
            this._eventListeners[eventName] = [];
        this._eventListeners[eventName].push({ listener: listener });
    },

    // NYI
    sessionState: {
    },

    _eventListeners: {
        activated: [],
    },
});


"use strict";

(function () {

    // ================================================================
    //
    // WinJS.Promise
    //
    // Provides a mechanism to schedule work to be done on a value that has not yet been computed.
    // It is an abstraction for managing interactions with asynchronous APIs.
    WinJS.Namespace.define("WinJS", {
        Promise: WinJS.Class.define(
            function (init, onCancel) {
                // Call the init callback function; this will kick off the (potentially long-lived) async process
                var that = this;
                init(function completed(value) { that.complete(value); },
                     function error(value) { that.error(value); },
                     function progress(value) { that.progress(value); }
                );
            },
            {
                // ================================================================
                //
                // Function: Promise.then
                //
                // Caller is asking us to promise to call 'then' when we are complete.
                then: function (onComplete) {

                    // Create a new promise to wrap onComplete in.  Pass in an empty init function.
                    var thenPromise = new WinJS.Promise(function () { });

                    thenPromise.initThen = onComplete;

                    // Keep track of the operation - we'll need to trigger it in complete
                    this.thenPromise = thenPromise;

                    // If the dependent promise has already completed, then fire the thenPromise.
                    if (this._completed)
                        return thenPromise.initThen(this._completeValue);

                    // Return the operation; it's up to the caller to wrap it in a promise if they want chaining
                    return thenPromise;
                },
                done: function (onComplete) {

                    // Create a new promise to wrap onComplete in.  Pass in an empty init function.
                    var thenPromise = new WinJS.Promise(function () { });

                    thenPromise.initThen = onComplete;

                    // Keep track of the operation - we'll need to trigger it in complete
                    this.thenPromise = thenPromise;

                    // If the dependent promise has already completed, then fire the thenPromise.
                    if (this._completed)
                        return thenPromise.initThen(this._completeValue);

                    // Return the operation; it's up to the caller to wrap it in a promise if they want chaining
                    return thenPromise;
                },

                // tbd: I expect that providing the context (e.g. the "this") variable is avoidable, but I can't figure out how to get around it.
                complete: function (value) {

                    // Track that we've completed; for Promises that complete instantly (e.g. synchronously), we need to know that they've 
                    // completed for subsequent .then()s.
                    this._completed = true;
                    this._completedValue = value;

                    // Chain
                    if (this.thenPromise != null) {
                        var nextPromise = this.thenPromise.initThen(value);

                        // tbd: ugh, still not right.
                        if (nextPromise != null)
                            nextPromise.thenPromise = this.thenPromise.thenPromise;
                    }
                    else
                        return value;
                },

                // tbd: join, any, all, etc. support
                initThen: null,

                thenPromise: null
            }, {
                // tbd: support amount of time.  none specified == immediate.
                timeout: function () {
                    return new WinJS.Promise(function (c) { c(); });
                }
            })
    });
})();

// ================================================================
//
// WinJS.Promise
//
// Provides a mechanism to schedule work to be done on a value that has not yet been computed.
// It is an abstraction for managing interactions with asynchronous APIs.
//
WinJS.Namespace.define("WinJS", {


    // ================================================================
    //
    // public Object: WinJS.Promise
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211867.aspx
    //
    //		TODO: Numerous unimplemented members: any, all, is, etc.
    //
    Promise: WinJS.Class.define(

        // ================================================================
        //
        // public Function: Promise Constructor
        //
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211866.aspx
		//
		//		TODO: Not handling onCancel yet
		//
        function (init, onCancel) {
            /*DEBUG*/
            // Perform parameter validation
            if (!init)
                console.error("WinJS.Promise: null or undefined initialization function passed to constructor");
            /*ENDDEBUG*/

            this._thenPromises = [];

            // _completed: True if the Promise was fulfilled successfully
            this._completed = false;

            // _completedWithError: True if the Promise compled with an error
            this._completedWithError = false;

            // _completedValue: The value of the fulfilled Promise
            this._completedValue = null;

            // thenPromise variables
            this._onThenComplete = null;
            this._onThenError = null;
            this._onThenProgress = null;

            this._thenCompletes = [];

            // Call the init callback function; this will kick off the (potentially long-lived) async process
            var that = this;
            init(function completed(value) { that._complete(value); },
                 function error(value) { that._error && that._error(value); },
                 function progress(value) { that._progress && that._progress(value); });
        },

		// ================================================================
		// Per-instance members of WinJS.Promise
		// ================================================================

        {
            // ================================================================
            //
            // public Function: Promise.then
            //
            //		Caller is asking us to call 'then' when we are complete.  If we're already
            //		complete then go ahead and call; otherwise, return a Promise that we will
            //		do so.
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229728.aspx
            //
            //		TODO: Not handling error or progress callbacks yet
            //
            then: function (thenComplete, thenError, thenProgress) {

                if (!thenComplete)
                    return this._completedValue;

                if (this._completed) {
                    return new WinJS.Promise.as(thenComplete(this._completedValue));
                } else if (this._completedWithError) {
                    if (thenError)
                        return new WinJS.Promise.as(thenError(this._completedValue));
                    else
                        return this._completedValue;
                } else {

                    // This Promise hasn't completed yet; create a new then promise that we'll trigger when we complete.
                    var thenPromise = new WinJS.Promise(function () { });

                    // Track the functions to call on complete/error/progress
                    thenPromise._thenComplete = thenComplete;
                    thenPromise._thenError = thenError;
                    thenPromise._thenProgress = thenProgress;

                    this._thenPromises.push(thenPromise);

                    return thenPromise;
                }
            },

            // ================================================================
            //
            // private Function: Promise.complete
            //
            //		Completion handler that's called when a promise completes successfully.
            //
            _complete: function (value) {

                // Track that we've completed; for Promises that complete instantly (e.g. synchronously), we need to know that they've 
                // completed for subsequent .then()s.
                this._completed = true;
                this._completedValue = value;

                // Trigger any chained 'then' Promises
                this._thenPromises.forEach(function (thenPromise) {

                    // Call the then promise's completion function (signifying that its dependent Promise has been fulfilled)
                    var thenResult = thenPromise._thenComplete(value);

                    // If the then is itself further chained, then we need to take thenResult and ensure it's a Promise, so that
                    // we can call the next-chained then function when thenResult is fulfilled.  This is important because the
                    // current thenPromise cannot notify that its been completed until the chainedPromise has itself been fulfilled.
                    // Yeah; this gets kind of hard to follow.
                    var chainedPromise = WinJS.Promise.as(thenResult);
                    if (chainedPromise) {	// TODO: I don't think this check is needed any more.

                        // When the Promise that we've chained off of thenPromise has completed, THEN we can notify that thenPromise has completed.
                        chainedPromise.then(function (v) {
                            thenPromise._complete(v);
                        });
                    }
                });
            },


            // ================================================================
            //
            // private Function: Promise._error
            //
            //		Completion handler that's called when a promise completes with an error
            //
            _error: function (value) {

                // Track that we've completed with error; for Promises that complete instantly (e.g. synchronously), we need to know that they've 
                // completed for subsequent .then()s.
                this._completedWithError = true;
                this._completedValue = value;

                // Trigger any chained 'then' Promises
                this._thenPromises.forEach(function (thenPromise) {

                    // The error function is optional; if unspecified then just carry on.
                    if (!thenPromise._thenError)
                        return;

                    // Call the then promise's error function (signifying that its dependent Promise has been fulfilled)
                    var thenResult = thenPromise._thenError(value);

                    // See _complete for the convoluted explanation as to what's going on here.
                    var chainedPromise = WinJS.Promise.as(thenResult);
                    if (chainedPromise) {

                        // When the Promise that we've chained off of thenPromise has completed, THEN we can notify that thenPromise has completed.
                        // TODO: I Need to understand what the expected error result bubbling is here; e.g. do I need to even specify an onComplete
                        // function (the first param) in the then call below since an Error has already occurred?
                        chainedPromise.then(function (v) {
                            thenPromise._error(v);
                        }, function (v) {
                            thenPromise._error(v);
                        });
                    }
                });
            },


            // ================================================================
            //
            // public Function: Promise.done
            //
            //		Caller is asking us to promise to call 'done' when we are complete.  done differs from then
            //		in that you cannot chain off of done.
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701079.aspx
            //
            done: function (onComplete, onError, onProgress) {

                if (!onComplete) {
                    // TODO: What should happen here if onComplete isn't defined?  What if none of the three callbacks are defined?
                    return;
                }

                // TODO: remove this after .done is implemented.
                if (!blueskyUtils._warnedDoneNYI) {
                    console.warn("Promise.done is NYI; replacing with .then()");
                    blueskyUtils._warnedDoneNYI = true;
                }

                return this.then(onComplete, onError, onProgress);
            },

            cancel: function () {
                console.warn("WinJS.Promise.cancel: NYI");
            }
        },

		// ================================================================
		// static members of WinJS.Promise
		// ================================================================

		{

		    // ================================================================
		    //
		    // public Function: Promise.timeout
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229729.aspx
		    //
		    //		TODO: support amount of time.  none specified == immediate.
		    //		TODO: support promise parameter
		    //
		    timeout: function (timeout, promise) {
		        // If no timeout was specified, then set to 0 (essentially immediately)
		        if (!timeout)
		            timeout = 1;

		        // Return a Promise that we'll complete when the timeout finishes.
		        return new WinJS.Promise(function (c) { setTimeout(c, timeout); });
		    },


		    // ================================================================
		    //
		    // public Function: Promise.as
		    //
		    //		MSDN: http://http://msdn.microsoft.com/en-us/library/windows/apps/br211664.aspx
		    //
		    as: function (value) {

		        // If the specified value is already a Promise then just return it.
		        if (WinJS.Promise.is(value))
		            return value;

		        // The specified value isn't a Promise; create a new Promise that wraps it and return it now
		        return new WinJS.Promise(function (c) { c(value); });
		    },


		    // ================================================================
		    //
		    // public Function: Promise.wrap
		    //
		    //		MSDN: TODO
		    //
		    wrap: function (value) {

		        // TODO: Make sure this is what wrap is supposed to do; the difference between .as and .wrap
		        return new WinJS.Promise(function (c) { c(value); });
		    },


		    // ================================================================
		    //
		    // public Function: Promise.is
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211765.aspx
		    //
		    is: function (value) {

		        // TODO: Currently checking for existence of the then function; this will fire a false-positive if
		        // the object is not a Promise but has an unrelated function called "then".  What's the right way to check
		        // for Promise'ness?  could use "instanceof"...
		        return (value && value.then && typeof value.then === "function")
		    },


		    // ================================================================
		    //
		    // public Function: Promise.join
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211774.aspx
		    //
		    //		TODO: This is just a skeletal implementation, not thought through yet.
		    //		TODO: Not handing errors, progress, or undefined promises.
		    //
		    join: function (promises) {

		        return new WinJS.Promise(function (c, e, p) {
		            var results = [];
		            if (!promises || promises.length == 0) {
		                c(results);
		            } else {
		                // If a single promise was specified, then convert to array
		                if (!promises.length)
		                    promises = [promises];

		                var numPromises = promises.length;

		                // Define the function to call when each promise is done; when we've called it numPromises times, then fire our complete event
		                var promiseComplete = function (p) {
		                    if (--numPromises == 0)
		                        c(results);
		                };

		                // For each promise that was passed in, tack on a 'then' that will call our promiseComplete function
		                // TODO: This is not fully implemented or thought through yet.  e.g. if a promise chain ends in done(),
		                // then can we actually chain a then() on here?
		                promises.forEach(function (p) {
		                    p.then(function (value) {
		                        results.push(value);
		                        promiseComplete(p);
		                    });
		                });
		            }
		        });
		    }
		})
});

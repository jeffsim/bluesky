"use strict";

// ================================================================
//
// WinJS.Navigation
//
// This is the root WinJS.Navigation namespace/object
// tbd-cleanup: Find a better method to avoid double-instantiating WinJS.* classes
WinJS.Navigation = WinJS.Navigation || {

    // Initialize web history.  We're using history.js (here: https://github.com/balupton/History.js)
    // The other option is jquery bbq: http://benalman.com/code/projects/jquery-bbq/examples/fragment-basic/#kebabs.html
    //      that seems better, but possibly harder to integrate into the Win8 model.
    init: function () {
        /* History.js stuff - removing for now since it's broken

        History.Adapter.bind(window, 'statechange', function (a) {

            //console.log('statechange:', History.getState().data, History.getState().title, History.getState().url);

            // TBD: This gets called on any state change, including nav, refresh, back, and forward.  I *think* I should call
            // WinJS.UI.processAll() here for 'back' and 'forward' (to regen the UI), but that borks.  Also: look into caching
            // contents of the page for faster rendering on back/forward
        });*/
    },

    /* History.js stuff - removing for now since it's broken
    History: window.History,

    State: null,

    isFirstNav: true,*/

    // ================================================================
    //
    // Function: WinJS.Navigation.navigate
    //
    // Navigates to the specified target. For now we don't do anything except notify of the navigate; navigator.js
    // is responsible for doing the actual page load.
    // TBD: not generating various events
    navigate: function (targetPath, options) {

        var that = this;
        return new WinJS.Promise(function (onComplete) {
            /* History.js stuff - removing for now since it's broken
            // If this is the very first navigation, then it's the navigation to the app's home page.
            // TBD: This should move into default.js and be managed as a reactivation from suspension.  Once the win8
            // app has that (and the pattern becomes clear), do this move.
            console.log("nav1", targetPath, options, this.isFirstNav);
            if (this.isFirstNav) {
                this.isFirstNav = false;
                this.State = History.getState();
                if (this.State.data.path != undefined) {
                    targetPath = this.State.data.path;
                    options = this.State.data.options;
                }
            }
    
            // TBD: okay, this is retarded: I can't figure out how to tell if this.History is empty; so I'm going to cheat and say you
            // can go back if this isn't home; which is broken
            this.canGoBack = targetPath != "/homePage/homePage.html";
            */

            // If nothing is listening for navigation events then break out
            if (that.onnavigated == null)
                return;

            // tbd: use the following form when I decide to retackle de-webifying navigator.js
            var navInfo = {
                detail: {
                    location: targetPath,
                    state: options,
                    setPromise: function (promise) {
                        promise.then(function (onNavigationComplete) {
                            // app's navigation process completed; inform *our* caller that we're done.
                            onComplete();
                        });
                    }
                }
            };
            //var navInfo = { path: targetPath, options: options };

            // Notify listeners of the navigation event
            that.onnavigated(navInfo);

            // Add the new page (and options) to the backStack.  Only do this if this isn't the first page
            if (that.lastTarget != null) {
                that.backStack.push(that.lastTarget);
                that.canGoBack = true;
            }

            that.lastTarget = navInfo;

            // Since we've navigated forward, mark that the user can now go back

            /* History.js stuff - removing for now since it's broken
            this.History.pushState({ path: targetPath, options: options });
            */
        });
    },


    // ================================================================
    //
    // Function: WinJS.Navigation.back
    //
    // Navigates back one page in the backstack.
    back: function () {

        // Get the url and options of the page to which we're going back
        this.lastTarget = this.backStack.pop();

        // Navigate to the page.
        // tbd: this must be updated to pass a promise in; see above.
        if (this.onnavigated != null)
            this.onnavigated(this.lastTarget);

        // If there are no more pages in the backstack, then the user can no longer go back.
        this.canGoBack = this.backStack.length > 0;

        /* History.js stuff - removing for now since it's broken
        this.History.back();
        this.State = History.getState();
        this.onnavigated({ path: this.State.data.path, options: this.State.data.options });

        /* History.js stuff - removing for now since it's broken
        // tbd: see above tbd
        this.State = History.getState();
        this.canGoBack = this.State.data.path != "/homePage/homePage.html";

        // tbd: hardcoding for now
        this.canGoBack = true;
        */
    },


    // ================================================================
    //
    // Function: WinJS.Navigation.forward
    //
    // Navigates forward one page in the backStack
    //
    forward: function () {

        /* History.js stuff - removing for now since it's broken
        this.History.go(1);
        */
    },


    // canGoBack: true if the user can go back
    canGoBack: false,

    // canGoForward: true if the user can go forward
    canGoForward: false,

    // backStack: the stack of navigable pages/options through which the user can go back
    backStack: [],

    // lastTarget: the last target page to which we navigated.  Used to push current page onto the backStack
    lastTarget: null,

    // onnavigated: Our navigation event.  This can be subscribed to in order to get navigation event notifications.
    onnavigated: null,
}
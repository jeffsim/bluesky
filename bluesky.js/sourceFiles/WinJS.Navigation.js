// ================================================================
//
// WinJS.Navigation
//
//		This is the root WinJS.Navigation namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229778.aspx
//
WinJS.Namespace.define("WinJS.Navigation", {

    // ================================================================
    //
    // private Function: WinJS.Navigation._init
    //
    _init: function () {

        /* NYI
		// bind to hash changes so that we can see them
		window.onhashchange = function (info) {

			// User either pressed back, pressed forward, navigated (via this.navigate), or entered a hash'ed URL directly into the address bar

			console.log(info, info.newURL);
		}*/
    },


    // ================================================================
    //
    // public Function: WinJS.Navigation.navigate
    //
    //		Navigates to the specified target. For now we don't do anything except notify of the navigate; navigator.js
    //		is responsible for doing the actual page load.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229837.aspx
    //
    navigate: function (targetPath, options) {


        var that = this;
        return new WinJS.Promise(function (onNavigationComplete) {

            // Disallow second-navigations
            // NOTE: Win8 does not appear to do this; we do because we like crashing less often.
            if (that.curPageInfo) {
                if (that.curPageInfo.location == targetPath) {
                    // second-check: ensure user isn't redirecting going back to same page during 'ready' (et al) with different options
                    // TODO: This check is failing.
                    //console.log(targetPath, options, that.curPageInfo.options);
                    //        if (that.curPageInfo.options == options) {
                    return onNavigationComplete(false);
                    //      }
                }
            }

            var beforeNavigateSetPromise = null;
            var navigatingSetPromise = null;
            var navigatedSetPromise = null;

            var newPageInfo = {
                location: targetPath,
                state: options,
                defaultPrevented: false
            };

            newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
            that._notifyBeforeNavigate(newPageInfo);

            WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

                // did user cancel?
                if (newPageInfo.defaultPrevented) {
                    onNavigationComplete(false);
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward

                // First; hide any clickeaters
                WinJS.UI._hideClickEaters();
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Wait until the navigating setPromise (set by caller) - if any - is fulfilled
                return WinJS.Promise.as(navigatingSetPromise);

            }).then(function () {

                // Add the current page (and options) to the backStack.
                if (that.curPageInfo && that.curPageInfo.location != "")
                    that.backStack.push(that.curPageInfo);

                // Track the new page as the current page
                that.curPageInfo = newPageInfo;
                that.curPageInfo.options = options;

                newPageInfo.setPromise = function (p) { navigatedSetPromise = p; };

                // Notify listeners of the navigated event
                that._notifyNavigated(that.curPageInfo);



                if (navigatedSetPromise)
                    WinJS.Promise.as(navigatedSetPromise).then(function () {
                        onNavigationComplete(true);
                    });
                else {
                    onNavigationComplete(true);
                }
            });
        });
    },


    // ================================================================
    //
    // public Function: WinJS.Navigation.back
    //
    //		Navigates back one page in the backstack.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229802.aspx
    //
    back: function () {

        if (this.backStack.length == 0)
            return new WinJS.Promise.as(null);

        if (this._navigating)
            return;
        this._navigating = true;

        // TODO: Merge this into the similar code in .navigate() above.

        // Get the url and options of the page to which we're going back.
        // Don't pop it since the caller could cancel the back
        var backPage = this.backStack[this.backStack.length - 1];
        var that = this;
        return new WinJS.Promise(function (onNavigationComplete) {

            var beforeNavigateSetPromise = null;
            var navigatingSetPromise = null;
            var navigatedSetPromise = null;

            var newPageInfo = {
                location: backPage.location,
                state: backPage.state,
                defaultPrevented: false
            };

            newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
            that._notifyBeforeNavigate(newPageInfo);
            WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

                // did user cancel?
                if (newPageInfo.defaultPrevented) {
                    that._navigating = false;
                    return false;
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Wait until the navigating setPromise (set by caller) - if any - is fulfilled
                return WinJS.Promise.as(navigatingSetPromise);

            }).then(function () {

                // Remove the page from the backstack
                that.backStack.pop();

                // Push the previous current page onto the forward stack
                that.forwardStack.push(that.curPageInfo);

                // Track the backed-to page as the current page
                that.curPageInfo = backPage;
                that.curPageInfo.setPromise = function (p) {
                    navigatedSetPromise = p;
                };
                // Notify listeners of the navigated event
                that._navigating = false;
                that._notifyNavigated(that.curPageInfo);

                if (navigatedSetPromise)
                    WinJS.Promise.as(navigatedSetPromise).then(function () { onNavigationComplete(); });
                else
                    onNavigationComplete();
            });
        });
    },


    // ================================================================
    //
    // public Function: WinJS.Navigation.forward
    //
    //		Navigates forward one page in the backstack.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229818.aspx
    //
    forward: function () {

        if (this.forwardStack.length == 0)
            return new WinJS.Promise.as(null);

        if (this._navigating)
            return;
        this._navigating = true;
        // TODO: Merge this into the similar code in .navigate() and .back() above.

        // Get the url and options of the page to which we're going.
        // Don't pop it since the caller could cancel the forward
        var forwardPage = this.forwardStack[this.forwardStack.length - 1];
        var that = this;
        return new WinJS.Promise(function (onNavigationComplete) {

            var beforeNavigateSetPromise = null;
            var navigatingSetPromise = null;
            var navigatedSetPromise = null;

            var newPageInfo = {
                location: forwardPage.location,
                state: forwardPage.state,
                defaultPrevented: false
            };

            newPageInfo.setPromise = function (p) { beforeNavigateSetPromise = p; };
            that._notifyBeforeNavigate(newPageInfo);
            WinJS.Promise.as(beforeNavigateSetPromise).then(function () {

                // did user cancel?
                if (newPageInfo.defaultPrevented) {
                    that._navigating = false;
                    return false;
                }

                // User didn't cancel; notify them that we're navigating.  They can't cancel from this point forward
                newPageInfo.setPromise = function (p) { navigatingSetPromise = p; };
                that._notifyNavigating(newPageInfo);

            }).then(function () {

                // Wait until the navigating setPromise (set by caller) - if any - is fulfilled
                return WinJS.Promise.as(navigatingSetPromise);

            }).then(function () {

                // Remove the page from the forwardstack
                that.forwardStack.pop();

                // Push the previous current page onto the back stack
                that.backStack.push(that.curPageInfo);

                // Track the backed-to page as the current page
                that.curPageInfo = forwardPage;
                that.curPageInfo.setPromise = function (p) {
                    navigatedSetPromise = p;
                };
                // Notify listeners of the navigated event
                that._notifyNavigated(that.curPageInfo);
                that._navigating = false;

                if (navigatedSetPromise)
                    WinJS.Promise.as(navigatedSetPromise).then(function () { onNavigationComplete(); });
                else
                    onNavigationComplete();
            });
        });
    },


    // ================================================================
    //
    // public property: WinJS.Navigation.canGoBack
    //
    //		canGoBack: true if the user can go back
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229804.aspx
    //
    canGoBack: {
        get: function () { return this.backStack.length > 0; }
    },


    // ================================================================
    //
    // public property: WinJS.Navigation.canGoForward
    //
    //		canGoBack: true if the user can go forward
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229805.aspx
    //
    canGoForward: {
        get: function () { return this.forwardStack.length > 0; }
    },

    // ================================================================
    //
    // private: backStack: The stack of navigable pages/options through which the user can go back
    //
    backStack: [],

    // ================================================================
    //
    // private: forwardStack: The stack of navigable pages/options through which the user can go forward
    //
    forwardStack: [],

    // ================================================================
    //
    // private: curPageInfo: the current page to which we are navigated.
    //
    curPageInfo: null,


    // ================================================================
    //
    // public function: WinJS.Navigation.addEventListener
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229800.aspx
    //
    addEventListener: function (eventName, listener) {

        // TODO: Can I leverage DOMEventMixin here now?

        /*DEBUG*/
        // Parameter validation
        if (!this._eventListeners[eventName])
            console.warn("WinJS.Navigation.addEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
        /*ENDDEBUG*/

        // Add the listener to the list of listeners for the specified eventName
        this._eventListeners[eventName].push(listener);
    },


    // ================================================================
    //
    // public function: WinJS.Navigation.removeEventListener
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229849.aspx
    //
    removeEventListener: function (eventName, listener) {

        /*DEBUG*/
        // Parameter validation
        if (!this._eventListeners[eventName])
            console.warn("WinJS.Navigation.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
        /*ENDDEBUG*/

        // Remove the listener from the list of listeners for the specified eventName
        var listeners = this._eventListeners[eventName];
        for (var i = 0; i < listeners.length; i++) {
            if (listener === listeners[i]) {
                listeners.splice(i, 1);
                return;
            }
        }
    },


    // ================================================================
    //
    // private function: WinJS.Navigation._notifyBeforeNavigate
    //
    _notifyBeforeNavigate: function (eventData) {
        var eventInfo = {
            target: this,
            type: "beforenavigate",
            detail: eventData
        };

        for (var i in this._eventListeners.beforenavigate)
            this._eventListeners.beforenavigate[i](eventInfo);
        eventData.defaultPrevented = eventInfo.defaultPrevented;
    },

    // ================================================================
    //
    // private function: WinJS.Navigation._notifyNavigating
    //
    _notifyNavigating: function (eventData) {
        var eventInfo = {
            target: this,
            type: "navigating",
            detail: eventData
        };

        for (var i in this._eventListeners.navigating)
            this._eventListeners.navigating[i](eventInfo);
    },


    // ================================================================
    //
    // private function: WinJS.Navigation._notifyNavigated
    //
    _notifyNavigated: function (eventData) {

        var eventInfo = {
            target: this,
            type: "navigated",
            detail: eventData
        };

        for (var i in this._eventListeners.navigated)
            this._eventListeners.navigated[i](eventInfo);
    },


    // ================================================================
    //
    // public event: WinJS.Navigation.onbeforenavigate
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229838.aspx
    //
    onbeforenavigate: {
        get: function () { return this._eventListeners["beforenavigate"]; },
        set: function (callback) { this.addEventListener("beforenavigate", callback); }
    },


    // ================================================================
    //
    // public event: WinJS.Navigation.onnavigating
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229843.aspx
    //
    onnavigating: {
        get: function () { return this._eventListeners["navigating"]; },
        set: function (callback) { this.addEventListener("navigating", callback); }
    },


    // ================================================================
    //
    // public event: WinJS.Navigation.onnavigated
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229842.aspx
    //
    onnavigated: {
        get: function () { return this._eventListeners["navigated"]; },
        set: function (callback) { this.addEventListener("navigated", callback); }
    },


    // ================================================================
    //
    // Our event listeners
    //
    _eventListeners: {
        beforenavigate: [],
        navigating: [],
        navigated: []
    },


    // ================================================================
    //
    // public property: WinJS.Navigation.history
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229830.aspx
    //
    history: {
        get: function () {
            return {
                backStack: this.backStack,
                forwardStack: this.forwardStack,
                current: this.curPageInfo ? this.curPageInfo.location : "",
            };
        },

        set: function (value) {
            if (!value || value == {}) {
                this.backStack = [];
                this.forwardStack = [];
                this.curPageInfo = null;
            } else {
                // if back/forward stack not specified, then use an empty array
                this.backStack = value.backStack ? value.backStack.slice() : [];
                this.forwardStack = value.forwardStack ? value.forwardStack.slice() : [];
                this.curPageInfo.location = value.current && value.current.location ? value.current.location : "";
            }
        }
    },


    // ================================================================
    //
    // public property: WinJS.Navigation.location
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229835.aspx
    //
    location: {
        get: function () {
            return this.curPageInfo ? this.curPageInfo.location : null;
        },
        set: function (value) {
            this.curPageInfo.location = value;
        }
    },


    // ================================================================
    //
    // public property: WinJS.Navigation.state
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229850.aspx
    //
    state: {
        get: function () {
            return this.curPageInfo.state;
        },
        set: function (value) {
            this.curPageInfo.state = value;
        }
    }
});
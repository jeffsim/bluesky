// ================================================================
//
// WinJS.Resources
//
//		Implementation of the WinJS.Resources object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.Resources", function () {
        // TODO: Hmm... Going to have to rethink this when I really implement WinJS.Resources.
        WinJS.Resources._eventListeners = null
    }, {
    	
	// ================================================================
	//
	// public function: WinJS.Resources.processAll
	//
	//		MSDN: TODO
	//
	processAll: function() {
		throw "nyi";
	},
	
		    	
	// ================================================================
	//
	// public function: WinJS.Resources.getString
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701590.aspx
	//
	getString: function() {
		throw "nyi";
	},
    
        	    	
	// ================================================================
	//
	// public event: WinJS.Resources.oncontextchanged
	//
	//		MSDN: TODO
	//
	oncontextchanged: {
		get: function () { return this._eventListeners["contextchanged"]; },
		set: function (callback) { this.addEventListener("contextchanged", callback); }
	},


    // ================================================================
    //
    // public function: WinJS.Resources.addEventListener
    //
    //		MSDN: TODO
    //
	addEventListener: function (eventName, listener) {

	    // TODO: How to use DomEventMixin here?

	    // Create the list of event listeners for the specified event if it does not yet exist
	    if (!WinJS.Resources._eventListeners[eventName])
	        WinJS.Resources._eventListeners[eventName] = [];

	    // Add the listener to the list of listeners for the specified eventName
	    WinJS.Resources._eventListeners[eventName].push(listener);
	},


    // ================================================================
    //
    // public function: WinJS.Resources.removeEventListener
    //
    //		MSDN: TODO
    //
	removeEventListener: function (eventName, listener) {

	    /*DEBUG*/
	    // Parameter validation
	    if (!WinJS.Resources._eventListeners[eventName])
	        console.warn("WinJS.Resources.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
	    /*ENDDEBUG*/

	    // TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

	    // Remove the listener from the list of listeners for the specified eventName
	    var listeners = WinJS.Resources._eventListeners[eventName];
	    for (var i = 0; i < listeners.length; i++) {
	        if (listener === listeners[i]) {
	            listeners.splice(i, 1);
	            return;
	        }
	    }
	},


    // ================================================================
    //
    // public function: WinJS.DOMEventMixin.dispatchEvent
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
    //
	dispatchEvent: function (eventName, eventProperties) {

	    var defaultPrevented = false;

	    if (!this._eventListeners[eventName])
	        return false;

	    this._eventListeners[eventName].forEach(function (listener) {
	        if (!defaultPrevented)
	            defaultPrevented = listener(eventProperties);
	    });

	    return defaultPrevented;
	},

});
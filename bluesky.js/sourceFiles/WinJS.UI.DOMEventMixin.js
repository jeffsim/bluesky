// ================================================================
//
// WinJS.UI.DOMEventMixin
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    DOMEventMixin: WinJS.Class.define(null, {

        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.addEventListener
        //
        //		MSDN: TODO
        //
        addEventListener: function (eventName, listener) {

            // Create the list of event listeners for the specified event if it does not yet exist
            if (!this._eventListeners[eventName])
                this._eventListeners[eventName] = [];

            // Add the listener to the list of listeners for the specified eventName
            this._eventListeners[eventName].push(listener);

            // Add DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.addEventListener(eventName, listener);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.removeEventListener
        //
        //		MSDN: TODO
        //
        removeEventListener: function (eventName, listener) {

            /*DEBUG*/
            // Parameter validation
            if (!this._eventListeners[eventName])
                console.warn("WinJS.DOMEventMixin.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
            /*ENDDEBUG*/

            // TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

            // Remove the listener from the list of listeners for the specified eventName
            var listeners = this._eventListeners[eventName];
            for (var i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return;
                }
            }

            // Remove DOM element event handlers (e.g. click).
            // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
            this.element.removeEventListener(eventName, listener);
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
        //
        dispatchEvent: function(eventName, eventProperties) {
        
        	var defaultPrevented = false;

        	if (!this._eventListeners[eventName])
        		return false;
        	
        	this._eventListeners[eventName].forEach(function(listener) {
        		if (!defaultPrevented)
        			defaultPrevented = listener(eventProperties);
        	});
        	
        	return defaultPrevented;
        },
        
        
        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh768233.aspx
        //
        setOptions: function(control, options) {
        
        	// TODO (CLEANUP): Can WinJS.UI.setOptions mixin this object, and move its logic to here?
        	WinJS.UI.setOptions(control, options);
        }
	})
});

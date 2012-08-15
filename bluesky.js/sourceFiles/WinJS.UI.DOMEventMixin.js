// ================================================================
//
// WinJS.UI.DOMEventMixin
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    DOMEventMixin: {

        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.addEventListener
        //
        //		MSDN: TODO
        //
        addEventListener: function (eventName, listener, useCapture) {

            // Add DOM element event handlers (e.g. click).
            this.element.addEventListener(eventName, listener, useCapture);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.removeEventListener
        //
        //		MSDN: TODO
        //
        removeEventListener: function (eventName, listener) {

            // Remove DOM element event handlers (e.g. click).
            this.element.removeEventListener(eventName, listener);
        },


        // ================================================================
        //
        // public function: WinJS.DOMEventMixin.dispatchEvent
        //
        //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700594.aspx
        //
        dispatchEvent: function (type, eventProperties) {

            var event = document.createEvent("Event");

            // initialize the event.  Win8 passes properties in via ".detail"

            // TODO: Do all events take false, false?
            event.initEvent(type, false, false);

            if (eventProperties)
                event.detail = eventProperties.detail;

            // TODO: Did Microsoft invert dispatchEvent's return value?
            return this.element.dispatchEvent(event);
        }
    }
});

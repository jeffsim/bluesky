// ================================================================
//
// WinJS.UI.ToggleSwitch
//
//		Implementation of the WinJS.UI.ToggleSwitch object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.ToggleSwitch
    //
    //      NYI NYI NYI: Stub
    // 
    ToggleSwitch: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.ToggleSwitch constructor
		//
		//		MSDN: TODO
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.ToggleSwitch constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);
        },

		// ================================================================
		// WinJS.UI.ToggleSwitch Member functions
		// ================================================================

		{
		    labelOn: "On",
		    labelOff: "Off",
		    title: "title"
		})
});
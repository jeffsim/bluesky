// ================================================================
//
// WinJS.UI.SettingsFlyout
//
//		Implementation of the WinJS.UI.SettingsFlyout object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.SettingsFlyout
    //
    //      NYI NYI NYI: Stub
    // 
    SettingsFlyout: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.SettingsFlyout constructor
		//
		//		MSDN: TODO
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.SettingsFlyout constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Start out hidden
            this.$rootElement.hide();
        },

		// ================================================================
		// WinJS.UI.SettingsFlyout Member functions
		// ================================================================

		{
		    show: function () {
		    },

		    hide: function () {
		    }
		})
});
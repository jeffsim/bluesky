// ================================================================
//
// WinJS.UI.GridLayout
//
//		Implementation of the WinJS.UI.GridLayout object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211751.aspx
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.GridLayout
    //
    GridLayout: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.UI.GridLayout constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211742.aspx
		//
		function (layoutOptions) {

		    if (layoutOptions) {
		        // eval groupInfo if it is present
		        if (layoutOptions.groupInfo)
		            this.groupInfo = eval(layoutOptions.groupInfo);
		        this.maxRows = layoutOptions.maxRows;
		        this.groupHeaderPosition = layoutOptions.groupHeaderPosition;
		    }
		},

	    // ================================================================
	    // WinJS.UI.GridLayout Member functions
	    // ================================================================

	    {
	        // The horizontal property is always true for GridLayouts
	        horizontal: {
	            get: function () {
	                return true;
	            }
	        },

	    })

});


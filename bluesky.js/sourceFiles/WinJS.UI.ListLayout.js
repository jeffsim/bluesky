// ================================================================
//
// WinJS.UI.ListLayout
//
//		Implementation of the WinJS.UI.ListLayout object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211792.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.ListLayout
	//
	ListLayout: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.UI.ListLayout constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211791.aspx
		//
		function (layoutOptions) {

		// Set typical options
		WinJS.UI.setOptions(this, layoutOptions);

		// eval groupInfo if it is present
		if (layoutOptions.groupInfo) {
			this.groupInfo = eval(layoutOptions.groupInfo);
		}
	},

	// ================================================================
	// WinJS.UI.ListLayout Member functions
	// ================================================================

	{
		// No member functions
	})
});


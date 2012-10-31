// ================================================================
//
// WinJS.UI.HtmlControl
//
//		Implementation of the WinJS.UI.HtmlControl object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700625.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.HtmlControl
	//
	//		Note: HtmlControl just has a constructor; no members
	//
	HtmlControl: WinJS.Class.define(function (element, options, complete) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.HtmlControl constructor: Undefined or null element specified");
		/*ENDDEBUG*/

		// Render the page using the specified options. When rendering has completed, call the complete function
		WinJS.UI.Pages.render(options.uri, element, options)
			.then(complete);
	}, {

	    updateLayout: function () {
	    }
	})
});

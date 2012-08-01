// ================================================================
//
// Windows.UI.WebUI
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br244245.aspx
//
WinJS.Namespace.define("Windows.UI.WebUI", {

	// ================================================================
	//
	// Windows.UI.WebUI.ActivatedOperation
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.webui.activatedoperation.aspx
	//
	ActivatedOperation: WinJS.Class.define(null, {
		getDeferral: function () {
			var deferral = new Windows.UI.WebUI.ActivatedDeferral();
			Windows.UI.WebUI._activationDeferrals.push(deferral._promise);
			return deferral;
		}
	}),

	// ================================================================
	//
	// Windows.UI.WebUI.ActivatedDeferral
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.webui.activateddeferral.aspx
	//
	ActivatedDeferral: WinJS.Class.define(function () {

		var that = this;

		this._promise = new WinJS.Promise(function (c) {
			// Pass this Promise's complete function back as the deferral's "complete" function, so that
			// when the app calls deferral.complete, they're actually completing this promise...
			that.complete = c;
		});
	}, {}),


	// The list of all requested Activation deferrals.
	_activationDeferrals: []
});
// =========================================================
//
// Minimalist implementation of Windows.System.Launcher to unblock stockSample
//
WinJS.Namespace.define("Windows.System.Launcher", {

	// =========================================================
	//
	//		TODO: Stub function
	//
	launchUriAsync: function (uri) {

		// TODO: App suspension?
		document.location.href = uri.uri;
	}
});

// =========================================================
//
// Minimalist implementation of Windows.System.UserProfile
//
WinJS.Namespace.define("Windows.System.UserProfile", {

    // =========================================================
    //
    //		TODO: Stub function
    //
    UserInformation: {
        getDisplayNameAsync: function () {
            return new WinJS.Promise(function (c) {
                return c("Player");
            });
        }
    }
});
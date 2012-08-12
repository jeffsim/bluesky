(function () {
	"use strict";

	WinJS.Application.addEventListener("activated", function (args) {

		if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
			
			args.setPromise(WinJS.UI.processAll().then(function () {
				return WinJS.Navigation.navigate(Application.navigator.home);
			}));
		}
	});

	WinJS.Application.start();
})();

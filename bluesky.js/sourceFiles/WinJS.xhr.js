// ================================================================
//
// WinJS.xhr.js
//
//		Implementation of the WinJS.xhr function
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229787.aspx
//
WinJS.Namespace.define("WinJS", {

	// ================================================================
	//
	// public function: WinJS.xhr
	//
	xhr: function (options) {

		var request;
		var requestType = options && options.type || "GET";

		return new WinJS.Promise(function (onComplete, onError, onProgress) {

			// track if we've completed the request already
			var requestCompleted = false;

			// Create the request
			request = new XMLHttpRequest();

			// Listen for changes
			request.onreadystatechange = function () {

				// If the request was cancelled, then just break out
				if (request.cancelled || requestCompleted)
					return;

				// Request completed?
				if (request.readyState == 4) {
					// Successful completion or failure?
					if (request.status >= 200 && request.status < 300) {
						onComplete(request);
					}
					else
						onError(request);

					// Ignore subsequent changes
					requestCompleted = true;
				} else {
					// Report progress (TODO: Promise doesn't support progress yet)
					// onProgress(request);
				}
			};

			// Open the request
			request.open(requestType, options.url, true);

			// Add request headers
			if (options.headers)
				options.headers.forEach(function (header) {
					request.setRequestHeader(key, header);
				});

			// Finally, send the request
			request.send(options.data);
		},

		// Error handler
		function () {
			request.cancelled = true;
			request.abort();
		});
	}
});
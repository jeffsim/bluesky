"use strict";

// ================================================================
//
// Test.WinJS.UI.xhr.js
//		Tests for WinJS.UI.xhr
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.xhr Tests", {

	// ==========================================================================
	// 
	// Test local xhr
	//
	localXhr: function (test) {

		test.start("Basic local xhr test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Test getting a file from local source
			WinJS.xhr({
				type: "GET",
				url: "/Tests/supportFiles/xhr/get1.html"
			}).then(function (result) {
				test.assert(result.readyState == result.DONE, "ReadyState not right.");
				test.assert(result.responseText.indexOf("xhr get test") != 0, "responseText does not contain page");
				onTestComplete(test);
			});
		});
	},


	/* 
	 *
	 *
	 *	bluesky works with what Win8 calls "Web Context" applications - and those applications do not support CORS (see this
	 *  page for details: http://msdn.microsoft.com/en-us/library/windows/apps/hh465373.aspx).  As such, the following tests
	 *  work when run via the Win8Tests project (which is a Local Context app), but not when run from bluesky.  Thus, they're
	 *  commented out.

	// ==========================================================================
	// 
	// Test remote xhr
	//
	remoteXhr: function (test) {

		test.start("Basic remote xhr test");
		test.timeoutLength = 5000;

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Test getting a file from remote source
			WinJS.xhr({
				type: "GET",
				url: "http://tests.bluesky.io/Tests/supportFiles/xhr/get1.html"
			}).then(function (result) {
				test.assert(result.readyState == result.DONE, "ReadyState not right.");
				test.assert(result.responseText.indexOf("xhr get test") != 0, "responseText does not contain page");
				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test CORS support
	//
	corsTests: function (test) {
		test.start("xhr CORS tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Test following types: html, text, xml, json, jsonp, binary
			return new WinJS.Promise(function (c) {
				// Test getting an HTML file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1.html"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "html: ReadyState not right.");
					test.assert(result.responseType == "", "html: ResponseType incorrect");
					test.assert(result.response == result.responseText, "html: Response != responseText");
					test.assert(result.responseXML == null, "html: ResponseXML != null");
					test.assert(result.status == 200, "html: Status incorrect");
					test.assert(result.statusText == "OK", "html: Status text incorrect");
					c();
				});
			}).then(function () {
				// Test getting a text file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1.txt"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "txt: ReadyState not right.");
					test.assert(result.responseType == "", "txt: ResponseType incorrect");
					test.assert(result.response == result.responseText, "txt: Response != responseText");
					test.assert(result.responseXML == null, "txt: ResponseXML != null");
					test.assert(result.status == 200, "txt: Status incorrect");
					test.assert(result.statusText == "OK", "txt: Status text incorrect");
				});
			}).then(function () {
				// Test getting an xml file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1.xml"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "xml: ReadyState not right.");
					test.assert(result.responseType == "", "xml: ResponseType incorrect");
					test.assert(result.response == result.responseText, "xml: Response != responseText");
					test.assert(result.responseXML != null, "xml: ResponseXML == null");
					test.assert(result.status == 200, "xml: Status incorrect");
					test.assert(result.statusText == "OK", "xml: Status text incorrect");

					// Validate contents of XML
					test.assert(result.responseXML.nodeType == result.responseXML.DOCUMENT_NODE, "xml: Not a document node");
					test.assert(result.responseXML.firstChild.tagName == "xml", "xml: first child != xml");

				});
			}).then(function () {
				// Test getting a json file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1.json"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "json: ReadyState not right.");
					test.assert(result.responseType == "", "json: ResponseType incorrect");
					test.assert(result.response == result.responseText, "json: Response != responseText");
					test.assert(result.responseXML == null, "json: ResponseXML != null");
					test.assert(result.status == 200, "json: Status incorrect");
					test.assert(result.statusText == "OK", "json: Status text incorrect");
				});
			}).then(function () {
				// Test getting a jsonp file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1b.jsonp"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "jsonp: ReadyState not right.");
					test.assert(result.responseType == "", "jsonp: ResponseType incorrect");
					test.assert(result.response == result.responseText, "jsonp: Response != responseText");
					test.assert(result.responseXML == null, "jsonp: ResponseXML != null");
					test.assert(result.status == 200, "jsonp: Status incorrect");
					test.assert(result.statusText == "OK", "jsonp: Status text incorrect");
				});
			}).then(function () {
				// Test getting a binary file
				WinJS.xhr({
					type: "GET",
					url: "http://www.wanderlinggames.com/blueskyCORSTests/get1.jpg"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "jpg: ReadyState not right.");
					test.assert(result.responseType == "", "jpg: ResponseType incorrect");
					test.assert(result.response == result.responseText, "jpg: Response != responseText");
					test.assert(result.responseXML == null, "jpg: ResponseXML != null");
					test.assert(result.status == 200, "jpg: Status incorrect");
					test.assert(result.statusText == "OK", "jpg: Status text incorrect");

					// Validate contents of jpg
					test.assert(result.response.substr(3).indexOf("Exif") == 0, "jpg: response != Exif");

					onTestComplete(test);
				});
			});
		});

	},
	*/

	fileTypes: function (test) {
		test.start("xhr file type tests");
		test.timeoutLength = 5000;
		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Test following types: html, text, xml, json, jsonp, binary
			return new WinJS.Promise(function (c) {
				// Test getting an HTML file
				WinJS.xhr({
					type: "GET",
					url: "/Tests/supportFiles/xhr/get1.html"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "html: ReadyState not right.");
					test.assert(result.responseType == "", "html: ResponseType incorrect");
					test.assert(result.response == result.responseText, "html: Response != responseText");
					test.assert(result.responseXML == null, "html: ResponseXML != null");
					test.assert(result.status == 200, "html: Status incorrect");
					test.assert(result.statusText == "OK", "html: Status text incorrect");
					c();
				});
			}).then(function () {
				// Test getting a text file
				WinJS.xhr({
					type: "GET",
					url: "/Tests/supportFiles/xhr/get1.txt"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "txt: ReadyState not right.");
					test.assert(result.responseType == "", "txt: ResponseType incorrect");
					test.assert(result.response == result.responseText, "txt: Response != responseText");
					test.assert(result.responseXML == null, "txt: ResponseXML != null");
					test.assert(result.status == 200, "txt: Status incorrect");
					test.assert(result.statusText == "OK", "txt: Status text incorrect");
				});
			}).then(function () {
				// Test getting an xml file
				WinJS.xhr({
					type: "GET",
					url: "/Tests/supportFiles/xhr/get1.xml"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "xml: ReadyState not right.");
					test.assert(result.responseType == "", "xml: ResponseType incorrect");
					test.assert(result.response == result.responseText, "xml: Response != responseText");
					test.assert(result.responseXML != null, "xml: ResponseXML == null");
					test.assert(result.status == 200, "xml: Status incorrect");
					test.assert(result.statusText == "OK", "xml: Status text incorrect");

					// Validate contents of XML
					test.assert(result.responseXML.nodeType == result.responseXML.DOCUMENT_NODE, "xml: Not a document node");
					test.assert(result.responseXML.firstChild.tagName == "xml", "xml: first child != xml");

				});
			}).then(function () {
				// Test getting a binary file
				WinJS.xhr({
					type: "GET",
					url: "/Tests/supportFiles/xhr/get1.jpg"
				}).then(function (result) {
					test.assert(result.readyState == result.DONE, "jpg: ReadyState not right.");
					test.assert(result.responseType == "", "jpg: ResponseType incorrect");
					test.assert(result.response == result.responseText, "jpg: Response != responseText");
					test.assert(result.responseXML == null, "jpg: ResponseXML != null");
					test.assert(result.status == 200, "jpg: Status incorrect");
					test.assert(result.statusText == "OK", "jpg: Status text incorrect");

					// Validate contents of jpg
					test.assert(result.response.substr(3).indexOf("Exif") != -1, "jpg: response != Exif");

					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test file not found handling
	//
	fileNotFound: function (test) {

		test.start("File not found handling test");
		test.timeoutLength = 5000;

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Test getting a nonexistent file from local source
			WinJS.xhr({
				type: "GET",
				url: "/IDontExist.txt"
			}).then(
            // Success handler
            function (result) {
            	test.assert(false, "Found a nonexistent file");
            	onTestComplete(test);
            },

            // Error handler
            function (result) {
            	test.assert(result.number == -2146697211, "Error result incorrect (" + result.number + ")");
            	onTestComplete(test);
            });
		});
	},


	nyiTests: function (test) {
		test.start("This lists of nyi tests for WinJS.xhr");


		// todo: test cancelling via timeout (see http://msdn.microsoft.com/en-us/library/windows/apps/hh868283.aspx)
		//      can't do the above yet since promise doesn't support error handling yet

		test.nyi("Progress tests");
		test.nyi("options.header and options.data tests");
		test.nyi("on* tests");
		test.nyi("parameters on URL");
		test.nyi("POST tests");
		test.nyi("Different server response tests (e.g. different response headers)");
	},
});
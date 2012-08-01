"use strict";

// ================================================================
//
// Test.WinJS.UI.HtmlControl.js
//		Tests for WinJS.UI.HtmlControl
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.HtmlControl Tests", {

	// ==========================================================================
	// 
	// Test basic HtmlControl creation
	//
	basicHtmlControl: function (test) {

		test.start("basic HtmlControl creation");
		
		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the page into
			var $testDiv = testHarness.addTestDiv("dataA");

			var testControl = new WinJS.UI.HtmlControl($testDiv[0], { uri: '/Tests/supportFiles/htmlControl1.html' }, function () {

				test.assert($testDiv.text().indexOf("Hello") >= 0, "failed to Load page");

				onTestComplete(test);
			});
		});
	},
});
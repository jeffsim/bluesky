"use strict";

// ================================================================
//
// Test.WinJS.UI.js
//		Tests for the top-level WinJS.UI.Pages object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.Pages Tests", {

	// ==========================================================================
	// 
	// Test WinJS.UI.Pages.define functionality
	//
	pagesDefine: function (test) {

		test.start("WinJS.UI.Pages.define tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			// Define a new page
			var testPageConstructor = WinJS.UI.Pages.define('/Tests/supportFiles/pagesDefine1.html', {

				ready: function (targetElement, state) {

					// At this point, the page has loaded and is ready.  Validate its content
					test.assert($(targetElement).text().indexOf("Hello World") >= 0, "Failed to populate page");
					
					// Verify the page was added to the DOM in the test frame.
					test.assert($("#testPageDiv", $(".testFrame")), "Page was loaded but not added to DOM in expected place.");

					// Verify that we added the id'ed DIVs to the global namespace (as is Win8's wont)
					test.assert(window.testPageDiv.innerHTML == "Foo", "Did not add ID'ed div to global namespace");

				    // Verify that script in the page was executed in document.ready
				    // NOTE: Win8 does not allow script in the loaded page (except through the *unsafe methods), but we do
				    // want to allow it in bluesky
					if (WinJS.Application.IsBluesky) {
					    test.assert($("#testPageDiv2", $(".testFrame")).text() == "Bar", "Script was not run in the loaded page");

					    // Verify that external script in the page was executed in document.ready
					    test.assert($("#testPageDiv3", $(".testFrame")).text() == "Baz", "External script was not run in the loaded page");
					}

					// Verify that style specified in page head was applied
					test.assert($("#testPageDiv4", $(".testFrame")).css("color") == "rgb(255, 0, 0)", "Failed to apply style from page head");

					// Verify that external style was applied
					test.assert($("#testPageDiv5", $(".testFrame")).css("color") == "rgb(0, 128, 0)", "Failed to apply style from external file");

					test.nyi("head/title/etc management");
					test.nyi("Slow loading css files");
					test.nyi("404 css files");
					test.nyi("Other Page functions (updateLayout, processed, etc)");
					test.nyi("Re-defining a Page; what does it do?");

					// notify the test harness that we've completed this async test
					onTestComplete(test);
				}
			});

		    // Create the page
			var testPage = new testPageConstructor($testDiv[0]);

			// Verify we created the page
			test.assert(testPage.ready, "Failed to create the page");

			// Just return; there's nothing else to do until the page's ready function is called (above)
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.Pages.define functionality with a page that has a win control
	//
	pagesDefineWithWincontrol: function (test) {

		test.start("WinJS.UI.Pages.define with WinControl tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Define a new control in our local namespace and create an instance of it
			WinJS.Namespace.define("TestHarness.pagesDefineWithWincontrol", {
				TestControl: WinJS.Class.define(function (element, options) {
					this.testVal = options.option1;
				}, {
					testVal: 50,
				})
			});

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			// Define a new page
			var testPageConstructor = WinJS.UI.Pages.define('/Tests/supportFiles/pagesDefineWithWC1.html', {

				ready: function (targetElement, state) {

					// At this point, the page has loaded and is ready.  Validate the presence and construction of the winControl
					var winControl = $("#testDiv", $(targetElement))[0].winControl;
					test.assert(winControl, "Failed to create WinControl");
					test.assert(winControl.testVal = 100, "Failed to construct WinControl");

					test.nyi("Multi-level page loads (pages that have controls that load pages)");

					// notify the test harness that we've completed this async test
					onTestComplete(test);
				}
			});

			// Create the page
			var testPage = new testPageConstructor($testDiv[0]);

			// Just return; there's nothing else to do until the page's ready function is called (above)
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.Pages.get functionality
	//
	pagesGet: function (test) {

		test.start("WinJS.UI.Pages.get tests");
		test.timeoutLength = 5000;
		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			// We'll reuse the test page's name a few times, so store it now.  store in lowercase
			var testPageName = '/Tests/supportFiles/pagesGet1.html'.toLowerCase();
			var testPage2Name = '/Tests/supportFiles/pagesGet2.html'.toLowerCase();

			// Sneak into the Page's list of registered pages and clear out the existing ones in case the user re-runs this test.
			if (WinJS.Application.IsBluesky)
			    WinJS.UI.Pages.registeredPages[testPageName] = null;

			// Define the page constructor
			var testPageConstructor = WinJS.UI.Pages.define(testPageName, {

				ready: function (targetElement, state) {

					// Sneak into the Pages object to verify the page constructor is now there for the getting
				    if (WinJS.Application.IsBluesky)
				        test.assert(WinJS.UI.Pages.registeredPages[testPageName], "Failed to define the page via Pages.get");

					if (numLoadedPages < 2)
						pageLoaded();
					else {
						// We've loaded the pages.
						// Verify we got three pages total (2 from define, one from get)
						test.assert($testDiv.text().split('Hello').length - 1 == 3, "Failed to get all three pages");

						// notify the test harness that we've completed this async test
						onTestComplete(test);
					}
				}
			});

			// Subsequent pages are loaded using get.
			var numLoadedPages = 0;
			var pageLoaded = function () {

				numLoadedPages++;
				var testPageConstructor2 = WinJS.UI.Pages.get(testPageName);
				var testPage2 = new testPageConstructor2($testDiv[0]);
			};

		    // Create the first test page.  This is created using the Pages.define constructor (to get it into the list of registered pages).
			var testPage1 = new testPageConstructor($testDiv[0]);
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.Pages.render functionality
	//
	pagesRender: function (test) {

		test.start("WinJS.UI.Pages.render tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");
			
			// Render the page
			WinJS.UI.Pages.render('/Tests/supportFiles/pagesRender.html', $testDiv[0], { option1: 100, option2: "Foo" }).then(function () {

				// Verify that the page rendered
				test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

				// TODO: How to verify that options where passed?
				test.nyi("Verify that options were passed to the page");
				test.nyi("Page not found handling");
				test.nyi("Specify a parentedPromise");

				// notify the test harness that we've completed this async test
				onTestComplete(test);
			});

			// Just return; there's nothing else to do until the page's ready function is called (above)
		});
	}
});
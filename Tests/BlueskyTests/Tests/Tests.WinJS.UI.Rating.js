"use strict";

// ================================================================
//
// Test.WinJS.UI.Rating.js
//		Tests for WinJS.UI.Rating
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.Rating Tests", {

	// ==========================================================================
	// 
	// Test basic Rating creation
	//
	basicRating: function (test) {

		test.start("Basic Rating creation");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="{averageRating: 2.4}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
			WinJS.UI.process($testDiv[0]).then(function (ratingControl) {

				// Verify that the rating control was instantiated
				test.assert(ratingControl, "Failed to instantiate rating control");

				// Verify that the options were set properly
				test.assert(ratingControl.averageRating == 2.4, "Failed to set win options on Rating control");

				// Verify stars are correctly set on creation based on average rating
				// TODO: Figure out the right jQuery selector to avoid this double wrapping
				var $stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set average rating properly");

			    // This test uses private bluesky functions which aren't present on win8, so we can't continue this test past this point
			    // TODO: Make this test fully work on Win8
				if (!WinJS.Application.IsBluesky) {
				    onTestComplete(test);
				    return test.skip("This test uses private bluesky functions");
				}

				// test moving the mouse over the control
				// TODO: This isn't really testing the mouse integration so it isn't a complete test, but it covers the biggest parts of
				//		 the code, and avoids requiring user interaction.  Maybe later someone more Test-savvy than I can fix this
				ratingControl.handleMouseMove({ currentTarget: $stars[1] });
				test.assert($($stars[0]).hasClass("win-tentative") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-tentative") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-empty") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set tentative");

				ratingControl.handleMouseMove({ currentTarget: $stars[3] });
				test.assert($($stars[0]).hasClass("win-tentative") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-tentative") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-tentative") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-tentative") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set tentative a second time");

				// test restoration of average rating on mouseleave
				var leftSideOfStar = $($stars[3]).offset().left;
				ratingControl.handleMouseLeave({ currentTarget: $stars[3], clientX: leftSideOfStar });

				// TODO: Rating.handleMouseLeave currently forces a re-render to restore values; this means
				// that in order to complete the mouseleave we need to force a render now.  This will be unnecessary
				// (but harmless) code once Rating no longer re-renders on mouseLeave - remove this call at that time.
				ratingControl.render(true);	// force a re-render

				// TODO: Also, since we just did a re-render, the previous list of $stars have now been destroyed; reacquire
				// them.  Just like the above line, once Ratings no longer re-renders, this line will be harmless and can be removed 
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to restore on mouse leave");

				// test adding user rating
				ratingControl.handleMouseMove({ currentTarget: $stars[3] });
				test.assert($($stars[0]).hasClass("win-tentative") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-tentative") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-tentative") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-tentative") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set tentative a second time");

				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				// Like handleMouseLeave, handleMouseClick re-renders the Ratings control, so we do the same re-render and reacquisition of 
				// child controls here as well.
				ratingControl.render(true);
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to add user rating (click)");

				// test that moving onto another star before the user rating sets only up to the hovered star
				ratingControl.handleMouseMove({ currentTarget: $stars[1] });
				test.assert($($stars[0]).hasClass("win-tentative") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-tentative") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-empty") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set stars on hover");

				// test that clicking on the star sets user rating and clears tentative (second time; tested once above as well)
				ratingControl.handleMouseClick({ currentTarget: $stars[1] });

				// Same as above; remove this when no longer re-rendering Ratings
				ratingControl.render(true);
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-empty") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to change user rating second time");

				// test that leaving the rating control (without frag-clearing) restores the current user rating
				ratingControl.handleMouseMove({ currentTarget: $stars[3] });
				test.assert($($stars[0]).hasClass("win-tentative") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-tentative") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-tentative") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-tentative") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to set stars on hover");

				ratingControl.handleMouseLeave({ currentTarget: $stars[3], clientX: leftSideOfStar });
				ratingControl.render(true);	// force a re-render
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-empty") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Leaving did not restore user rating");

				// Mark NYI tests
				test.nyi("Rating control events - setting and notifying");
				test.nyi("Fractional stars (functionality NYI in control)");

				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test programmatic Rating creation
	//
	progRating: function (test) {

		test.start("Programmatic Rating creation");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestDiv("test1");

			// Programmatically create the Rating control.  This will also render it into the DOM at the test1 div.
			var testControl = new WinJS.UI.Rating($testDiv[0], { averageRating: 2.6 });

			// Verify the rating control's options were initialized
			test.assert(testControl.averageRating == 2.6, "Failed to set win options on Rating control");

			// Verify the rating control was added to the DOM in the expected place
			test.assert(testControl.element.parentNode == $(".testFrame")[0], "Failed to add Rating Control to the expected location in the DOM");

			onTestComplete(test);
		});
	},


	// ==========================================================================
	// 
	// Test maxRating
	//
	maxRating: function (test) {

		test.start("maxRating tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="{averageRating: 2.4, maxRating: 10}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
			WinJS.UI.process($testDiv[0]).then(function (ratingControl) {

				var $stars = $testDiv.children(".win-star");

				// verify that maxRating is correct
				test.assert(ratingControl.maxRating == 10, "Failed to set maxRating during instantiation");

			    // test that 10 stars were created in the DOM
			    // NOTE: On Win8, there's actually 11 since the fractional star shows up as two individual stars.  We don't
			    // support fractional stars yet, so we only have 10...
				test.assert($stars.length == (WinJS.Application.IsBluesky ? 10 : 11), "Unexpected number of stars");

			    // This test uses private bluesky functions which aren't present on win8, so we can't continue this test past this point
			    // TODO: Make this test fully work on Win8
				if (!WinJS.Application.IsBluesky) {
				    onTestComplete(test);
				    return test.skip("This test uses private bluesky functions");
				}

				// test that the stars are interactive
				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				ratingControl.render(true);	// TODO: see basicRating test for why this line and next are here and can be removed once  Rating doesn't re-render
				$stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty") &&
							$($stars[5]).hasClass("win-empty"), "Failed to add user rating (click)");

				// create another control with 8 stars
				$testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="{averageRating: 2.4, maxRating: 8}"></div>');

				// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
				WinJS.UI.process($testDiv[0]).then(function () {

					var ratingControl = $testDiv[0].winControl;
					var $stars = $testDiv.children(".win-star");

					// verify that maxRating is correct
					test.assert(ratingControl.maxRating == 8, "Failed to set maxRating during instantiation");

					// test that 10 stars were created in the DOM
					test.assert($stars.length == 8, "Unexpected number of stars");

					// Test changing maxRating
					ratingControl.maxRating = 3;

					// changing maxRating does a complete re-render of the control, so force the render to happen now (it's waiting to happen lazily in the background).
					ratingControl.render(true);
					$stars = $testDiv.children(".win-star");
					test.assert($stars.length == 3, "Unexpected number of stars after changing maxRating");

					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test disabled Rating control
	//
	disableRating: function (test) {

		test.start("Disabled Rating tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="{averageRating: 2.4}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
			WinJS.UI.process($testDiv[0]).then(function (ratingControl) {

				var $stars = $testDiv.children(".win-star");

				ratingControl.disabled = true;

			    // This test uses private bluesky functions which aren't present on win8, so we can't continue this test past this point
			    // TODO: Make this test fully work on Win8
				if (!WinJS.Application.IsBluesky) {
				    onTestComplete(test);
				    return test.skip("This test uses private bluesky functions");
				}

				// test that the stars are not interactive
				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				ratingControl.render(true);	// TODO: see basicRating test for why this line and next are here and can be removed once  Rating doesn't re-render
				$stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to disable interaction");

				ratingControl.disabled = false;

				// test that the stars are now interactive
				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				ratingControl.render(true);	// TODO: see basicRating test for why this line and next are here and can be removed once  Rating doesn't re-render
				$stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to re-enable interaction");

				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test Rating options
	//
	ratingOptions: function (test) {

		test.start("Test Rating options");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Define event callbacks for this test
			WinJS.Namespace.define("Test.ratingOptions", {
				cancelTest: function () {
					console.log("asdf");
				},
				changeTest: function () {
				},
				previewTest: function () {
				},
			});

			// TODO: Test rating options in declaratively defined Rating control

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="' +
				'{averageRating: 2.4, maxRating: 10,disabled:true,enableClear:false,' +
				' oncancel:Test.ratingOptions.cancelTest,onchange:Test.ratingOptions.changeTest, onpreviewchange:Test.ratingOptions.previewTest}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
			WinJS.UI.process($testDiv[0]).then(function (ratingControl) {

				var $stars = $testDiv.children(".win-star");

				// verify options were set
				// console.log(ratingControl);
				test.assert(ratingControl.averageRating == 2.4, "averageRating option not set");
				test.assert(ratingControl.maxRating == 10, "maxRating option not set");

				test.assert(ratingControl.disabled == "true", "disabled option not set");
				test.assert(ratingControl.enableClear == "false", "enableClear option not set");

                /* Events are NYI in R1.  TODO: Add in R2
				test.assert(ratingControl.oncancel && ratingControl.oncancel == Test.ratingOptions.cancelTest, "oncancel option not set");
				test.assert(ratingControl.onchange && ratingControl.onchange == Test.ratingOptions.changeTest, "onchange option not set");
				test.assert(ratingControl.onpreviewchange && ratingControl.onpreviewchange == Test.ratingOptions.previewTest, "onpreviewchange option not set");
                */

				// Verify event handlers are callable
				test.nyi("Need to test that the event handlers are callable");
				//	ratingControl.oncancel();

				// TODO: Random note: I'd like to chain onTestComplete into a separate then (to allow flattened chaining of other tests), but 
				// a known bug (failing test: noReturnNoPromiseChain) is keeping that from working.
				onTestComplete(test);
			});

			test.nyi("Test options in programmatically defined Rating control");
			test.nyi("Test invalid option (keys and values)");
			test.nyi('Test tooltipStrings:["a","b","c"]');
			test.nyi('Verify that the frag clear test is working');
		});
	},


	// ==========================================================================
	// 
	// Test that frag clearing (where user mousedowns then leaves the control on the left side)
	//
	//		TODO: Win8's frag clearing requires that the user lift the mouse button while the toolbar is showing;
	//			  That part isn't implemented yet, and simply click-dragging off the left side currently triggers
	//			  frag-clear.  Update this test when proper mouse capture on frag clearing is implemented.
	//
	fragClearing: function (test) {

		test.start("Frag clearing test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Add UX element to the test working space that we can load the Control(s) into
			var $testDiv = testHarness.addTestElement('<div data-win-control="WinJS.UI.Rating" data-win-options="{averageRating: 2.4}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate (and render) the Rating control itself
			WinJS.UI.process($testDiv[0]).then(function (ratingControl) {

				var $stars = $testDiv.children(".win-star");

				// enable frag clear
				ratingControl.enableClear = true;

			    // This test uses private bluesky functions which aren't present on win8, so we can't continue this test past this point
			    // TODO: Make this test fully work on Win8
				if (!WinJS.Application.IsBluesky) {
				    onTestComplete(test);
				    return test.skip("This test uses private bluesky functions");
				}
				// Set user rating
				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				ratingControl.render(true);	// TODO: see basicRating test for why this line and next are here and can be removed once  Rating doesn't re-render
				$stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to add user rating (click)");

				// test that frag-clearing restores the average rating
				ratingControl.$rootElement.mousedown();
				var leftSideOfStar = $($stars[3]).offset().left;
				ratingControl.handleMouseLeave({ currentTarget: $stars[3], clientX: leftSideOfStar });
				ratingControl.render(true);
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-empty") &&
							$($stars[4]).hasClass("win-empty"), "Failed to restore on frag clear");


				// Test that frag-clearing doesn't trigger if enableClear != true
				ratingControl.enableClear = false;

				// Set user rating
				ratingControl.handleMouseClick({ currentTarget: $stars[3] });
				ratingControl.render(true);	// TODO: see basicRating test for why this line and next are here and can be removed once  Rating doesn't re-render
				$stars = $testDiv.children(".win-star");
				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to add user rating (click)");

				// test leaving via the left side while frag-clearing is disabled
				ratingControl.$rootElement.mousedown();
				var leftSideOfStar = $($stars[3]).offset().left;
				ratingControl.handleMouseLeave({ currentTarget: $stars[3], clientX: leftSideOfStar });
				ratingControl.render(true);
				$stars = $testDiv.children(".win-star");

				test.assert($($stars[0]).hasClass("win-user") && $($stars[0]).hasClass("win-full") &&
							$($stars[1]).hasClass("win-user") && $($stars[1]).hasClass("win-full") &&
							$($stars[2]).hasClass("win-user") && $($stars[2]).hasClass("win-full") &&
							$($stars[3]).hasClass("win-user") && $($stars[3]).hasClass("win-full") &&
							$($stars[4]).hasClass("win-empty"), "Failed to honor enableClear=false");

				onTestComplete(test);
			});
		});
	},
});
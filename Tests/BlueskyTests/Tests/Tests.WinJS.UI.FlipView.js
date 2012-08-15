"use strict";

(function () {
	// ================================================================
	//
	// Test.WinJS.UI.FlipView.js
	//		Tests for WinJS.UI.FlipView
	//

	// Add our tests into the test harness's list of tests
	testHarness.addTestFile("WinJS.UI.FlipView Tests", {

		// ==========================================================================
		// 
		// Test basic FlipView creation
		//
		basicFlipView: function (test) {

			test.start("Basic FlipView creation");

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			// TODO: Given infinite time, I'd take the doAsync pattern and force-apply it to all tests
			// so that we can remove the need to call it in every async test (which are quickly over-taking
			// the non-async tests).
			return test.doAsync(function (onTestComplete) {

				createFlipView().then(function () {

					var $flipViewSurface = $(".win-surface", $("#testFlipView"));

					// Verify that the working space contains the flipview
					test.assert($flipViewSurface[0], "Failed to create flipView surface");

					// Verify that images and title are both bound properly
					test.assert($("img:first", $flipViewSurface).attr("src").indexOf("/Tests/supportFiles/flipView/img") == 0, "Failed to bind image");
					test.assert($(".ItemTitle:contains(Foo)", $flipViewSurface)[0], "Failed to bind text");

					// Verify that the item template is not visible.
					test.assert($("#simple_ItemTemplate").css("display") == "none", "Failed to hide template");

					// verify that the buttons are present
					test.assert($(".win-navright")[0], "Failed to create right button");
					test.assert($(".win-navleft")[0], "Failed to create left button");
					onTestComplete(test);
				});
			});
		},


		// ==========================================================================
		// 
		// Test FlipView orientation property
		//
		orientation: function (test) {

			test.start("FlipView orientation property");
			test.timeoutLength = 3000;
			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				var flipView;
				createFlipView().then(function (flipControl) {

					flipView = flipControl;

					// verify default orientation is horz
					test.assert(flipView.orientation == "horizontal", "Default orientation is not horizontal");

					// verify buttons are correct
					test.assert($(".win-navleft")[0], "Left button not present");
					test.assert($(".win-navright")[0], "Right button not present");
					test.assert(!$(".win-navtop")[0], "Top button present");
					test.assert(!$(".win-navbottom")[0], "Bottom button present");

					// switch orientation
					var completePromise = waitUntilPageComplete(flipView);
					flipView.orientation = "vertical";

					// TODO: Does the orientation change happen synchronously on Win8? If not, then what event fires to
					// signal that the orientation change has completed?
					return WinJS.Promise.timeout(300);
				}).then(function () {
					// verify orientation is now vert
					test.assert(flipView.orientation == "vertical", "Did not change orientation");

					// verify buttons are correct
					test.assert(!$(".win-navleft")[0], "2: Left button present");
					test.assert(!$(".win-navright")[0], "2: Right button present");
					test.assert($(".win-navtop")[0], "2: Top button not present");
					test.assert($(".win-navbottom")[0], "2: Bottom button not present");
					onTestComplete(test);
				});
			});
		},


		// ==========================================================================
		// 
		// Test state persistence creation
		//
		statePersistence: function (test) {

			test.start("FlipView state persistence tests");
			test.timeoutLength = 3000;

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				// Create the list of items to bind into the flipview and bind it.
				var list = new WinJS.Binding.List();
				list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
				list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
				list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
				list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });
				var flipView;
				createFlipView(list).then(function (flipViewControl) {

					flipView = flipViewControl;

					var completePromise = waitUntilPageComplete(flipView);

					// goto the third item in the flipview
					flipView.currentPage = 2;

					return completePromise;
				}).then(function () {

					// remove the second item from the flipview
					list.splice(1, 1);

					return WinJS.Promise.timeout(300);

				}).then(function () {

					// Win8 lays out flipview differently than bluesky, so we have to check different values
					if (!WinJS.Application.IsBluesky)
						return test.skip("Win8 FlipView is implemented differently than bluesky; test can't run.");

					// Verify that we're now on the second item in the flipview
					return test.skip("This is known to fail; it's because the FlipView is re-rendering completely.  This is okay for R1; fix in R2");
					test.assert($(".win-surface .ItemTitle")[2].textContent == "Foo", "State was not persisted after item was removed");
					test.resultNote = "This is known to fail; it's because the FlipView is re-rendering completely";
					onTestComplete(test);
				});

				test.nyi("test dispatchEvent method");
				test.nyi("test setCustomAnimations methods");
			});
		},


		// ==========================================================================
		// 
		// Test programmatic FlipView creation
		//
		programmaticCreation: function (test) {

			test.start("Programmatic FlipView creation tests");
			test.timeoutLength = 3000;
			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				// Create the list of items to bind into the flipview and bind it.
				var list = new WinJS.Binding.List();
				list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
				list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
				list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
				list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });

				var $testDiv = testHarness.addTestDiv("test1");

				var flipView;

				var template = testHarness.addTestElement('<div id="simple_ItemTemplate" data-win-control="WinJS.Binding.Template">' +
													'<div class="overlaidItemTemplate">' +
													'	<img class="image" data-win-bind="src: picture; alt: title" style="height: 300px" />' +
													'	<div class="ItemTitle" data-win-bind="innerText: title" style="margin-top: -5px; height:40px; padding: 8px; background-color: #13257e; color: #fff; font-size: 12pt">' +
													'	</div>' +
													'</div>' +
												'</div>')[0];
				WinJS.UI.processAll(template).then(function() {
				    // Create and process the FlipView
				    flipView = new WinJS.UI.FlipView($testDiv[0], { itemDataSource: list.dataSource, itemTemplate: template });
				    return WinJS.Promise.timeout();
				}).then(function() {
					var $element = $(flipView.element);

					// verify that the flipView's DOM elements were created and are visible
					test.assert(flipView.element, "FlipView does not have a DOM element");
					test.assert($element.parent().hasClass("testFrame"), "FlipView not inserted into DOM in expected location");
					test.assert($element.attr("id") == "test1", "FlipView id is incorrect");
					test.assert($element.hasClass("win-flipview"), "FlipView does not have win-flipview class");

					onTestComplete(test);
				});
			});
		},


		// ==========================================================================
		// 
		// Test element property
		//
		elementProperty: function (test) {

			test.start("Element property tests");

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				createFlipView().then(function (flipViewControl) {
					test.assert(flipViewControl.element, "No element specified");
					test.assert($(flipViewControl.element).attr("id") == "testFlipView", "Incorrect element specified");
					onTestComplete(test);
				});
			});
		},


		// ==========================================================================
		// 
		// Test itemSpacing property
		//
		itemSpacingProperty: function (test) {

			test.start("itemSpacing property tests");

			return test.skip("Not sure what the itemSpacing property does yet.  This is okay for R1; fix in R2");
		},


		// ==========================================================================
		// 
		// Test FlipView events
		//
		eventHandlers: function (test) {

			test.start("FlipView event handling tests");
			test.timeoutLength = 5000;
			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				// Create the list of items to bind into the flipview and bind it.
				var list = new WinJS.Binding.List();
				list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
				list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
				list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
				list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });

				var flipView;
				var count = [], completed = [], selected = [], vischanged = [];
				createFlipView(list).then(function (flipControl) {

					flipView = flipControl;

					var onCountChanged = function (eventData) {
						count.push(eventData);
					}
					var onCompleted = function (eventData) {
						completed.push(eventData);
					}
					var onSelected = function (eventData) {
						selected.push(eventData);
					}
					var onVisChanged = function (eventData) {
						vischanged.push(eventData);
					}

					flipControl.addEventListener("datasourcecountchanged", onCountChanged);
					flipControl.addEventListener("pagecompleted", onCompleted);
					flipControl.addEventListener("pageselected", onSelected);
					flipControl.addEventListener("pagevisibilitychanged", onVisChanged);

					// Goto the next page; when completed, check result
					var completePromise = waitUntilPageComplete(flipView);
					flipControl.next();
					return completePromise;

				}).then(function () {

					// verify the right events happened, in the right order

					// NOTE: Win8 displays a "loading" item that it hides when things are loaded - this causes
					// and extra visibilitychanged event on win8 that we don't see in bluesky since we don't have
					// that loaded div...
				    test.assert(completed.length == 1, "Did not get completed event");
					test.assert($(completed[0].target).hasClass("win-template"), "completed event pointing at wrong element");
					test.assert(completed[0].detail.source == flipView.element, "completed event pointing at wrong detail.source");
					test.assert(selected.length == 1, "Did not get selected event");
					test.assert($(selected[0].target).hasClass("win-template"), "selected event pointing at wrong element");
					test.assert(selected[0].detail.source == flipView.element, "selected event pointing at wrong detail.source");
					test.assert(vischanged.length == 2, "Did not get 2 onVisChanged events");
					test.assert($(vischanged[0].target).hasClass("win-template"), "onVisChanged event 0 pointing at wrong element");
					test.assert(vischanged[0].detail.source == flipView.element, "onVisChanged event 0 pointing at wrong detail.source");
					test.assert(vischanged[0].detail.visible == true, "onVisChanged event 0 visible = wrong");
					test.assert($(vischanged[1].target).hasClass("win-template"), "onVisChanged event 1 pointing at wrong element");
					test.assert(vischanged[1].detail.source == flipView.element, "onVisChanged event 1 pointing at wrong detail.source");
					test.assert(vischanged[1].detail.visible == false, "onVisChanged event 1 visible = wrong");

					// Test changing datacount
					list.pop();
					return WinJS.Promise.timeout(500);
					return completePromise;

				}).then(function () {
					test.assert(count.length == 1, "Did not get count event");

					// NOTE: Win8 docs say that 'source' should point at flipControl. but that's not what it looks like when running Win8.
					// TODO: Look at this again in the next Win8 release; it's either a bug in their docs or their code.
					//test.assert(count && count[0].source == flipControl, "count event pointing at wrong element");

					onTestComplete(test);
				});
			});
		},


		// ==========================================================================
		// 
		// Test changing data behind a FlipView
		//
		modifyingDataSource: function (test) {

			test.start("Modifying FlipView data tests");
			test.timeoutLength = 5000;

			// Create the list of items to bind into the flipview and bind it.
			var list = new WinJS.Binding.List();
			list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
			list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
			list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
			list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {
				var flipView;
				createFlipView(list).then(function (flipControl) {

					flipView = flipControl;

					// Remove an item from the list; flipView should no longer contain it.
					list.pop();

					return WinJS.Promise.timeout(500);

				}).then(function () {

					// Verify that we do not have the fourth item present
					var $fourthItem = $("img[alt=Bar]");
					test.assert(!$fourthItem[0], "Failed to remove fourth item");

					// Test changing an item
					list.setAt(1, { picture: "/Tests/supportFiles/flipView/img4.jpg", title: "XYZ" });

					return WinJS.Promise.timeout(500);

				}).then(function () {

					var $changedItem = $("img[alt=XYZ]");
					test.assert($changedItem[0], "Failed to change item");

					// Test adding an item
					list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Test2" });

					return WinJS.Promise.timeout(500);

				}).then(function () {

					var $changedItem = $("img[alt=XYZ]");
					test.assert($changedItem[0], "Failed to change item");

					// Test splicing an item
					list.splice(1, 0, { picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Test3" });

					return WinJS.Promise.timeout(500);

				}).then(function () {

					var $newItem = $("img[alt=Test3]");
					test.assert($newItem[0], "Failed to add new item");

					onTestComplete(test);
				});
			});
		},
		// ==========================================================================
		// 
		// Test FlipView.count
		//
		count: function (test) {

			test.start("FlipView.count() tests");
			test.timeoutLength = 5000;

			// Create the list of items to bind into the flipview and bind it.
			var list = new WinJS.Binding.List();
			list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
			list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
			list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
			list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			// TODO: Given infinite time, I'd take the doAsync pattern and force-apply it to all tests
			// so that we can remove the need to call it in every async test (which are quickly over-taking
			// the non-async tests).
			return test.doAsync(function (onTestComplete) {
				var flipView;
				createFlipView(list).then(function (flipControl) {

					flipView = flipControl;

					// Verify we have 4 items
					return flipView.count().then(function (amount) {
						test.assert(amount == 4, "1: invalid count");

						// Remove an item from the list
						list.pop();

						return WinJS.Promise.timeout(500);
					});

				}).then(function () {

					// Verify we have 3 items
					return flipView.count().then(function (amount) {
						test.assert(amount == 3, "2: invalid count");

						// Test changing an item
						list.setAt(1, { picture: "/Tests/supportFiles/flipView/img4.jpg", title: "XYZ" });

						return WinJS.Promise.timeout(500);
					});
				}).then(function () {

					// Verify we still have 3 items
					return flipView.count().then(function (amount) {
						test.assert(amount == 3, "3: invalid count");

						// Test adding an item
						list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Test2" });

						return WinJS.Promise.timeout(500);
					});
				}).then(function () {
					return flipView.count().then(function (amount) {

						test.assert(amount == 4, "4: invalid count");

						// Test splicing an item
						list.splice(1, 0, { picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Test3" });

						return WinJS.Promise.timeout(500);
					});
				}).then(function () {

					return flipView.count().then(function (amount) {
						test.assert(amount == 5, "5: invalid count");

						onTestComplete(test);
					});
				});
			});
		},


		// ==========================================================================
		// 
		// Test FlipView.next and FlipView.previous functionality
		//
		nextPrevious: function (test) {

			test.start("FlipView next and previous tests");
			test.timeoutLength = 2000;

			// Win8 lays out its flipview control elements differently than bluesky does, so this test will not work on Win8
			// TODO: Figure out a good solution to this
			if (!WinJS.Application.IsBluesky)
				return test.skip("Win8 FlipView is implemented differently than bluesky; test can't run.");

			// This is an async test, so it must use test.doAsync and call onTestComplete when done
			return test.doAsync(function (onTestComplete) {

				var flipControl;
				createFlipView().then(function () {
					var $flipViewSurface = $(".win-surface", $("#testFlipView"));
					flipControl = $("#testFlipView")[0].winControl;

					// Verify item #1 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "title 1", "next: #1 not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.next();
					test.assert(canFlip, "Should be able to flip from 1st item");
					return completePromise;
				}).then(function () {

					// Verify item #2 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Hello world", "next: #2 not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.next();
					test.assert(canFlip, "Should be able to flip from 2nd item");
					return completePromise;
				}).then(function () {

					// Verify item #3 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Foo", "next: #3 not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.next();
					test.assert(canFlip, "Should be able to flip from 3rd item");
					return completePromise;
				}).then(function () {

					// Verify item #4 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Bar", "next: #4 not at top");
					var canFlip = flipControl.next();
					test.assert(!canFlip, "Shouldn't be able to flip from 4th item");
					return WinJS.Promise.timeout();
				}).then(function () {

					// Verify item #4 is still at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Bar", "next: #4 still not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.previous();
					test.assert(canFlip, "Should be able to flip backwards from 4th item");
					return completePromise;
				}).then(function () {

					// Verify item #3 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Foo", "previous: #3 not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.previous();
					test.assert(canFlip, "Should be able to flip backwards from 3rd item");
					return completePromise;

				}).then(function () {

					// Verify item #2 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "Hello world", "previous: #2 not at top");

					var completePromise = waitUntilPageComplete(flipControl);
					var canFlip = flipControl.previous();
					test.assert(canFlip, "Should be able to flip backwards from 2nd item");
					return completePromise;

				}).then(function () {
					// Verify item #1 is at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "title 1", "previous: #1 not at top");
					var canFlip = flipControl.previous();
					test.assert(!canFlip, "Shouldn't be able to flip backwards from 1st item");
					return WinJS.Promise.timeout();

				}).then(function () {
					// Verify item #1 is still at top
					test.assert($("#testFlipView .ItemTitle")[3].innerHTML == "title 1", "previous: #1 still not at top");

					onTestComplete(test);
				});
			});
		}
	});


	// ==========================================================================
	// 
	// private function: waitUntilPageComplete
	//
	//		Helper function that returns a promise that is fulfilled when the specified FlipView
	//		control fires its pagecompleted event
	//
	function waitUntilPageComplete(flipControl) {

		return new WinJS.Promise(function (c) {

			// Define this function explicitly so that we can remove it
			var completeHandler = function () {

				// Remove this function from the list of event listeners on the flip control
				flipControl.removeEventListener("pagecompleted", completeHandler);

				// Fulfill our promise.
				c();
			};

			// Listen for pagecompleted events; call the above handler when one is fired.
			flipControl.addEventListener("pagecompleted", completeHandler);
		});
	}


	// ==========================================================================
	// 
	// private function: createFlipView
	//
	//		Helper function that creates a FlipView
	//
	function createFlipView(list, target) {

		if (!list) {
			// Create the list of items to bind into the flipview and bind it.
			var list = new WinJS.Binding.List();
			list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
			list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
			list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
			list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });
		}
		if (!target) {
			var $tempTarget = $("<div></div>");
			$(".testFrame").append($tempTarget);
			target = $tempTarget[0];
		}

		return new WinJS.Promise(function (c) {
			var flipView;

			WinJS.UI.Pages.render("/Tests/supportFiles/flipView/flipView.html", target).then(function (testPage) {

				flipView = $("#testFlipView")[0].winControl;
				flipView.itemTemplate = $("#simple_ItemTemplate")[0];
				flipView.itemDataSource = list.dataSource;

				// Yield so that the list can render with the new data source
				return WinJS.Promise.timeout();

			}).then(function () {

				// Create a promise that will be fulfilled when the pagecompleted event fires
				var completePromise = waitUntilPageComplete(flipView);

				// Force the flipview to the last page to cause win8 to fault in the pages
				flipView.currentPage = list.length - 1;
				return completePromise;

			}).then(function () {

				// Create a promise that will be fulfilled when the pagecompleted event fires
				var completePromise = waitUntilPageComplete(flipView);

				// Force the flipview back to the first page
				flipView.currentPage = 0;
				return completePromise;

			}).then(function () {

				c(flipView);
			});
		});
	}

})();
"use strict";

// ================================================================
//
// Test.WinJS.UI.AppBarCommand.js
//		Tests for the top-level WinJS.UI.AppBarCommand object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.AppBarCommand Tests", {

	// ==========================================================================
	// 
	// Test WinJS.UI.AppBarCommand.render functionality
	//
	basicAppBarCommand: function (test) {

		test.start("Basic AppBarCommand tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			// Render the page
			WinJS.UI.Pages.render('/Tests/supportFiles/appBar/basicAppbar.html', $testDiv[0]).then(function () {

				// Verify that the page rendered
				test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

				var $appBar = $(".win-appbar", $testDiv)
				var $buttons = $("button", $appBar);
				var $commandImages = $("span", $appBar);
				var appBar = $appBar[0].winControl;

				// verify format of the appbuttons in the appbar
				$buttons.each(function (i, button) {
					var $button = $(button);
					test.assert($button.hasClass("win-command"), "Button does not have win-command class");
					test.assert($button.hasClass("win-global"), "Button does not have win-global class");
					test.assert($button.attr("role") == "menuitem", "Button role not correct");
					test.assert($button.attr("data-win-control") == "WinJS.UI.AppBarCommand", "Button wincontrol not correct");

					// verify command image span
					var $commandImage = $($("span", $button)[0]);
					test.assert($commandImage.length == 1, "Command Image not present");
					test.assert($commandImage.hasClass("win-commandicon"), "Command Image does not have win-commandicon class");
					test.assert($commandImage.hasClass("win-commandring"), "Command Image does not have win-commandring class");
					var $commandImageIcon = $(">span", $commandImage);
					test.assert($commandImageIcon.length == 1, "Command Image icon not present");
					test.assert($commandImageIcon.hasClass("win-commandimage"), "Command Image Icon does not have win-commandimage class");

					// verify label
					var $label = $($("span", $button)[2]);
					test.assert($label.length == 1, "Label not present");
					test.assert($label.hasClass("win-label"), "Label does not have win-label class");
				});
				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.AppBarCommand constructor with element
	//
	elementConstructor: function (test) {

		test.start("AppBarCommand constructor with element tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");
			var $el1 = $("<button></button>");
			var $el2 = $("<button></button>");
			var $el3 = $("<hr/>");
			var appBar = new WinJS.UI.AppBar($testDiv[0]);
			var button1 = new WinJS.UI.AppBarCommand($el1[0], { id: "id1", icon: "undo", label: "undo", section: "global", extraClass: "testClass", tooltip: "World" });
			var button2 = new WinJS.UI.AppBarCommand($el2[0], { id: "id2", icon: "redo", label: "redo", section: "selection", tooltip: "Hello" });
			var button3 = new WinJS.UI.AppBarCommand($el3[0], { type: "separator" });
			test.assert(button1, "Failed to create button 1");
			test.assert(button2, "Failed to create button 2");
			test.assert(button3, "Failed to create button 3");
			appBar.commands = [button1, button2, button3];
			appBar.onaftershow = function () {

				var $buttons = $("button", $testDiv);

				// verify format of the appbuttons in the appbar
				test.assert($($buttons[0]).hasClass("win-global"), "Button1 does not have win-global class");
				test.assert($($buttons[1]).hasClass("win-selection"), "Button2 does not have win-selection class");

				$buttons.each(function (i, button) {
					var $button = $(button);
					test.assert($button.hasClass("win-command"), "Button does not have win-command class");
					test.assert($button.attr("role") == "menuitem", "Button role not correct");
					test.assert(!$button.attr("data-win-control"), "Button wincontrol not correct");

					// verify command image span
					var $commandImage = $($("span", $button)[0]);
					test.assert($commandImage.length == 1, "Command Image not present");
					test.assert($commandImage.hasClass("win-commandicon"), "Command Image does not have win-commandicon class");
					test.assert($commandImage.hasClass("win-commandring"), "Command Image does not have win-commandring class");
					var $commandImageIcon = $(">span", $commandImage);
					test.assert($commandImageIcon.length == 1, "Command Image icon not present");
					test.assert($commandImageIcon.hasClass("win-commandimage"), "Command Image Icon does not have win-commandimage class");

					// verify label
					var $label = $($("span", $button)[2]);
					test.assert($label.length == 1, "Label not present");
					test.assert($label.hasClass("win-label"), "Label does not have win-label class");
					onTestComplete(test);
				});

				// TODO: test with invalid element.  must be <button> for button,toggle,flyout, and <hr> for flyout
				$testDiv.remove();
				$(".win-appbarclickeater").remove();
				onTestComplete(test);
			}
			appBar.show();
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.AppBarCommand events
	//
	clickTests: function (test) {

		test.start("AppBarCommand.onclick tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			var appBar = new WinJS.UI.AppBar($testDiv[0]);
			var button1 = new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "global", extraClass: "testClass", tooltip: "World" });
			var button2 = new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "selection", disabled: true, tooltip: "Hello" });
			var button3 = new WinJS.UI.AppBarCommand(null, { type: "separator" });

			appBar.commands = [button1, button2, button3];

			appBar.onaftershow = function () {

				var $buttons = $("button", $testDiv);

				// validate button gets onclick event
				button1.onclick = function (event) {
					// validate event data
					test.assert(event.type == "click", "incorrect event type");

					test.assert(this == button1, "button1: incorrect this");
					$(button2).click();
				}

				// Diable to ensure onclick test does nothing
				button2.disabled = true;
				button2.onclick = function (event) {
					test.assert(this == button2, "button2: incorrect this");
					$(button3).click();
				}

				// validate separated does not get onclick event (?)
				button3.onclick = function (event) {
					test.assert(this == button3, "button3: incorrect this");

					// Cleanup
					$testDiv.remove();
					$(".win-appbarclickeater").remove();
					onTestComplete(test);
				}

				// test click
				$(button1).click();
			}
			appBar.show();
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.AppBarCommand.addEventListener and removeEventListener functions
	//
	addRemoveEventListeners: function (test) {

		test.start("AppBarCommand.add/removeEventListener tests");
		test.skip("AppBarCommand.addEventListener isn't firing on Win8, so can't validate behavior.  Revisit with win8 RTM");
		return;

		test.timeoutLength = 5000;
		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");
			var appBar = new WinJS.UI.AppBar($testDiv[0]);

			var button1 = new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "global", extraClass: "testClass", tooltip: "World" });
			var button2 = new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "selection", disabled: true, tooltip: "Hello" });
			var button3 = new WinJS.UI.AppBarCommand(null, { type: "separator" });
			appBar.commands = [button1, button2, button3];

			var beforeShowCalled = [];
			var afterShowCalled = [];
			var beforeHideCalled = [];
			var afterHideCalled = [];
			var test1 = function (event) {
				//validate event data
				beforeShowCalled.push(event);
			}
			button1.addEventListener("beforeshow", test1);
			button2.addEventListener("aftershow", function (event) {
				//validate event data
				afterShowCalled.push(event);
			});
			button3.addEventListener("beforehide", function (event) {
				//validate event data
				beforeHideCalled.push(event);
			});
			button1.addEventListener("afterhide", function (event) {
				//validate event data
				afterHideCalled.push(event);
			});
			appBar.onaftershow = function () {
				appBar.hide();
			}
			appBar.onafterhide = function () {

				$testDiv.remove();
				$(".win-appbarclickeater").remove();
				onTestComplete(test);
			}
			appBar.show();
		});
	},

	// ==========================================================================
	// 
	// Test WinJS.UI.AppBarCommand.flyout property
	//
	flyout: function (test) {

		test.start("AppBarCommand.flyout property tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");
			var appBar = new WinJS.UI.AppBar($testDiv[0]);
			var $flyoutDiv = testHarness.addTestElement("<div id='flyoutId' style='width:200px;height:200px;background-color:green'>Hello</div>");
			var flyout = new WinJS.UI.Flyout($flyoutDiv[0]);

			var button1 = new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "selection", extraClass: "testClass", tooltip: "World" });
			var button2 = new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "global", type: "flyout", flyout: 'flyoutId' });
			var button3 = new WinJS.UI.AppBarCommand(null, { type: "separator" });
			appBar.commands = [button1, button2, button3];
			appBar.onaftershow = function () {
				flyout.onaftershow = null;

				// call up the flyout 
				flyout.onaftershow = function () {
					flyout.onaftershow = null;
					$testDiv.remove();
					$flyoutDiv.remove();
					$(".win-appbarclickeater").remove();
					onTestComplete(test);
				}
				$("#id2").click();
			}
			appBar.show();
		});
	},


	// ==========================================================================
	// 
	// Test various WinJS.UI.AppBarCommand properties
	//
	variousProperties: function (test) {

		test.start("AppBarCommand property tests");
		test.timeoutLength = 5000;

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Create a div to hold the page(s) we'll create
			var $testDiv = testHarness.addTestDiv("dataA");

			// test multiple commands
			var appBar = new WinJS.UI.AppBar($testDiv[0]);
			appBar.commands = [
                new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "global", extraClass: "testClass", tooltip: "World" }),
                new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "selection", disabled: false, tooltip: "Hello" }),
                new WinJS.UI.AppBarCommand(null, { id: "sep", type: "separator" }),
                new WinJS.UI.AppBarCommand(null, { id: "id3", icon: "home", label: "home", section: "global", disabled: true }),
                new WinJS.UI.AppBarCommand(null, { id: "id4", icon: "remove", label: "remove", section: "global", type: "toggle" }),
                new WinJS.UI.AppBarCommand(null, { id: "id5", icon: "camera", label: "camera", section: "global", type: "flyout" })
			];

			appBar.onaftershow = function () {
				var $buttons = $("button", $testDiv);
				// TODO (CLEANUP): Ugh, can't get the right jQuery selector to say "1st button, 2nd button, etc"
				var $button1 = $($buttons[0]);
				var $button2 = $($buttons[1]);
				var $button3 = $($buttons[2]);
				var $button4 = $($buttons[3]);
				var $button5 = $($buttons[4]);

				var button1 = $button1[0].winControl;
				var button2 = $button2[0].winControl;
				var button3 = $button3[0].winControl;
				var button4 = $button4[0].winControl;
				var button5 = $button5[0].winControl;
				
				// Test disabled property
				test.assert(button1.disabled == false, "button1 disabled = incorrect");
				test.assert(button2.disabled == false, "button2 disabled = incorrect");
				test.assert(button3.disabled == true, "button3 disabled = incorrect");

				// Test setting disabled 
				button2.disabled = true;
				button3.disabled = false;
				test.assert(button2.disabled == true, "2: button2 disabled = incorrect");
				test.assert(button3.disabled == false, "2: button3 disabled = incorrect");
				test.assert($("#id2").attr("disabled") == "disabled", "2: button 2 css disabled incorrect")
				test.assert(!$("#id3").attr("disabled"), "2: button 3 css disabled incorrect")
				// NOTE: The onclick test ensures that clicking disabled buttons does nothing

				// Test element property
				test.assert($(button1.element).attr("id") == "id1", "button1 element incorrect");
				test.assert($(button2.element).attr("id") == "id2", "button2 element incorrect");
				test.assert($(button3.element).attr("id") == "id3", "button3 element incorrect");

				// Test extraClass property
				test.assert($button1.hasClass("testClass"), "extraClass did not work");

				// Test id property
				test.assert(button1.id == "id1", "Button1 id incorrect");
				test.assert(button2.id == "id2", "Button2 id incorrect");
				test.assert(button3.id == "id3", "Button3 id incorrect");

				// Test label property (set too)
				test.assert(button1.label == "undo", "Button1 label incorrect");

				test.assert($($("span", $("#id1"))[2]).text() == "undo", "Button1 label incorrect in DOM");
				button1.label = "undo2";
				test.assert(button1.label == "undo2", "2: Button1 label incorrect");
				test.assert($($("span", $("#id1"))[2]).text() == "undo2", "2: Button1 label incorrect in DOM");

				// Test hidden property
				test.assert(!button1.hidden, "Button1 hidden incorrect");
				// NOTE: I can't figure out how to test hidden = true!   Hiding the appbar on win8 doesn't change hidden on its buttons, and there's no
				// "hide()" function on appbarcommand :P.

				// Test icon property (set too)
				// NOTE: as Win8 uses content (with a win8-specific font), and bluesky uses
				// backgroundImage, so we test these differently...
				if (WinJS.Application.IsBluesky) {
				//	test.assert(false, "todo");
				} else {
					test.assert(button2.icon == "", "Button 2 icon incorrect");
					test.assert($(">span>span", $("#id2")).text() == "", "Button 2 css icon incorrect");
					button2.icon = "add"
					test.assert(button2.icon == "", "2: Button 2 icon incorrect");
					test.assert($(">span>span", $("#id2")).text() == "", "2: Button 2 css icon incorrect");
				}
				// TODO: Test setting icon to image

				// Test selected property (set too)
				// NOTE: MSDN says that this is only valid for toggle buttons, but it appears to work equally well on regular buttons as well.
				// I'm building/testing against what Win8 does, rather than what MSDN says, and will update if win8 changes.
				test.assert(!button1.selected, "Button 1 selected by default, shouldn't be");
				button1.selected = true;
				test.assert(button1.selected, "Button 1 not selected");

				// Verify can select disabled button
				button2.selected = true;
				test.assert(button2.selected, "Did not select disabled button");

				// test with toggle button
				test.assert(!button3.selected, "Button 3 selected by default, shouldn't be");
				button3.selected = true;
				test.assert(button3.selected, "Button 3 not selected");
				button3.selected = false;
				test.assert(!button3.selected, "Button 3 didn't re-select");

				// Test type property
				test.assert(button1.type == "button", "Button1 type incorrect");
				test.assert($("#id1").attr("role") == "menuitem", "Button1 role incorrect");
				test.assert(button2.type == "button", "Button2 type incorrect");
				test.assert($("#id2").attr("role") == "menuitem", "Button2 role incorrect");
				test.assert(button4.type == "toggle", "Button3 type incorrect");
				test.assert($("#id4").attr("role") == "menuitemcheckbox", "Button3 role incorrect");
				test.assert(button5.type == "flyout", "Button5 type incorrect");
				test.assert($("#id5").attr("role") == "menuitem", "Button5 role incorrect");

				// Test section property
				test.assert(button1.section == "global", "button1 section incorrect");
				test.assert(button2.section == "selection", "button2 section incorrect");

				// Test tooltip property (set too)
				test.assert(button1.tooltip == "World", "button1 tooltip incorrect");
				test.assert(button2.tooltip == "Hello", "button2 tooltip incorrect");
				// verify that no tooltip --> label
				test.assert(button3.tooltip == "home", "button3 tooltip incorrect");
				button1.tooltip = "Foo";
				test.assert(button1.tooltip == "Foo", "2: button1 tooltip incorrect");

				$testDiv.remove();
				$(".win-appbarclickeater").remove();
				onTestComplete(test);
			}

			appBar.show();
		});
	}
});
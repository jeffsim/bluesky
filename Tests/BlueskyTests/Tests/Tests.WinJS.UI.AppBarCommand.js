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
                    var $commandImage = $(">span::nth-child(1)", $button);
                    test.assert($commandImage.length == 1, "Command Image not present");
                    test.assert($commandImage.hasClass("win-commandicon"), "Command Image does not have win-commandicon class");
                    test.assert($commandImage.hasClass("win-commandring"), "Command Image does not have win-commandring class");
                    var $commandImageIcon = $(">span", $commandImage);
                    test.assert($commandImageIcon.length == 1, "Command Image icon not present");
                    test.assert($commandImageIcon.hasClass("win-commandimage"), "Command Image Icon does not have win-commandimage class");

                    // verify label
                    var $label = $(">span::nth-child(2)", $button);
                    test.assert($label.length == 1, "Label not present");
                    test.assert($label.hasClass("win-label"), "Label does not have win-label class");
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBarCommand events
    //
    events: function (test) {

        test.start("AppBarCommand event tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // addEventListener, removeEventListener, onclick
            // NOTE: The onclick test ensures that clicking disabled buttons does nothing
            onTestComplete(test);

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
            onTestComplete(test);
        });
    },


    // ==========================================================================
    // 
    // Test various WinJS.UI.AppBarCommand properties
    //
    variousProperties: function (test) {

        test.start("AppBarCommand property tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // TODO: Test specifying an element in the appbarcommand constructor

            // test multiple commands
            var appBar = new WinJS.UI.AppBar($testDiv[0]);
            appBar.commands = [
                new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "global", extraClass:"testClass" , tooltip: "World" }),
                new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "selection", disabled: false, tooltip: "Hello" }),
                new WinJS.UI.AppBarCommand(null, { type: "separator" }),
                new WinJS.UI.AppBarCommand(null, { id: "id3", icon: "home", label: "home", section: "global", disabled: true })
            ];

            appBar.onaftershow = function () {
                var $buttons = $("button", $testDiv);
                // TODO (CLEANUP): Ugh, can't get the right jQuery selector to say "1st button, 2nd button, etc"
                var $button1 = $($buttons[0]);
                var $button2 = $($buttons[1]);
                var $button3 = $($buttons[2]);

                var button1 = $button1[0].winControl;
                var button2 = $button2[0].winControl;
                var button3 = $button3[0].winControl;

                // Test disabled property
                test.assert(button1.disabled == false, "button1 disabled = incorrect");
                test.assert(button2.disabled == false, "button2 disabled = incorrect");
                test.assert(button3.disabled == true, "button3 disabled = incorrect");

                // Test setting disabled 
                button2.disabled = true;
                button3.disabled = false;
                test.assert(button2.disabled == true, "2: button2 disabled = incorrect");
                test.assert(button3.disabled == false, "2: button3 disabled = incorrect");
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

                // TODO: Test hidden property (set too)
                // TODO: Test icon property (set too)
                // TODO: Test label property (set too)
                // TODO: Test section property
                // TODO: Test selected property (set too)
                // TODO: Test tooltip property (set too)
                // TODO: Test type property

                //$testDiv.remove();
                onTestComplete(test);
            }

            appBar.show();

        });
    },

});
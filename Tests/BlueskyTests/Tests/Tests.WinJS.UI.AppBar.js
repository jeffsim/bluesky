"use strict";

// ================================================================
//
// Test.WinJS.UI.AppBar.js
//		Tests for the top-level WinJS.UI.AppBar object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.AppBar Tests", {

    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.render functionality
    //
    basicAppbar: function (test) {

        test.start("Basic appbar tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            test.nyi("Right-click bringup; can't test since I can't figure out how to simulate a right-click that win8 recognizes");

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/basicAppbar.html', $testDiv[0]).then(function () {

                // Verify that the page rendered
                test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                var $appBar = $(".win-appbar", $testDiv)
                var $buttons = $("button", $appBar);
                var $commandImages = $("span", $appBar);
                var appBar = $appBar[0].winControl;

                // Verify form of the appbar's HTML
                test.assert($appBar.hasClass("win-overlay"), "Appbar does not have win-overlay class");
                test.assert($appBar.hasClass("win-appbar"), "Appbar does not have win-appbar class");
                test.assert($appBar.hasClass("win-commandlayout"), "Appbar does not have win-commandlayout class");
                test.assert($appBar.hasClass("win-bottom"), "Appbar does not have win-bottom class");
                test.assert($appBar.attr("role") == "menubar", "Appbar role not correct");

                // Verify presence and location of the appbar
                test.assert($appBar[0], "Appbar not found in expected position");

                // Verify appbar is hidden
                test.assert($appBar.css("visibility") == "hidden", "Appbar not hidden by default");

                // Check z-index and click-eater
                var $clickEater = $(">.win-appbarclickeater", $("body"));
                test.assert($clickEater[0], "Click eater not in expected location");
                test.assert($appBar.css("z-index") == 1001, "Appbar z-index incorrect");
                test.assert($clickEater.css("z-index") == 1000, "$clickEater z-index incorrect");

                // Verify control
                test.assert(appBar, "Appbar control not found");
                test.assert(appBar.element == $appBar[0], "appBar.element not set");

                // verify presence and format of the appbuttons in the appbar
                test.assert($buttons.length == 2, "Buttons not present");
                test.assert($($buttons[0]).attr("id") == "cmdAdd", "First button not cmdAdd");
                test.assert($($buttons[1]).attr("id") == "cmdHome", "Second button not cmdHome");
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
                });

                // Show the appbar
                var afterShow = function () {
                    appBar.onaftershow = null;
                    // verify appbar is visible
                    test.assert($appBar.css("visibility") == "visible", "Appbar not visible");

                    // Cleanup
                    $appBar.remove();

                    // notify the test harness that we've completed this async test
                    onTestComplete(test);
                }
                appBar.onaftershow = afterShow;
                appBar.show();
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.show and hide functionality
    //
    showAndHide: function (test) {

        test.start("Appbar show and hide tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            var $appBar, appBar;
            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/basicAppbar.html', $testDiv[0])
                .then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        $appBar = $(".win-appbar", $testDiv)
                        appBar = $appBar[0].winControl;

                        // Verify that the page rendered
                        test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                        // Verify appbar is hidden by default
                        test.assert(appBar.hidden, "Appbar not hidden by default");

                        // Show the appbar
                        var afterShow = function () {
                            appBar.onaftershow = null;

                            // verify appbar is visible
                            test.assert($appBar.css("visibility") == "visible", "Appbar not visible");

                            onComplete(test);
                        }
                        appBar.onaftershow = afterShow;
                        appBar.show();
                    });
                }).then(function () {

                    // Hide the appbar
                    var afterHide = function () {
                        appBar.onafterhide = null;

                        // verify appbar is visible
                        test.assert($appBar.css("visibility") == "hidden", "Appbar not hidden after calling hide");

                        // Cleanup
                        $appBar.remove();

                        onTestComplete(test);
                    }
                    appBar.onafterhide = afterHide;
                    appBar.hide();
                });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.disabled and .hidden properties
    //
    disabledAndHiddenProperties: function (test) {

        test.start("Appbar.disabled and .hidden tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            var $appBar, appBar;
            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/basicAppbar.html', $testDiv[0])
                .then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        $appBar = $(".win-appbar", $testDiv)
                        appBar = $appBar[0].winControl;

                        // Disable the appbar and ensure that showing it doesn't actually show it.
                        // Test events that are called too
                        appBar.disabled = true;

                        // Show the appbar
                        var beforeShow = function () {
                            test.assert(false, "beforeShow although disabled");
                        }
                        var afterShow = function () {
                            test.assert(false, "afterShow although disabled");
                        }
                        appBar.onbeforeshow = beforeShow;
                        appBar.onaftershow = afterShow;
                        WinJS.Promise.timeout(500).then(function () {
                            test.assert(appBar.disabled, "Disabled property changed");
                            test.assert(appBar.hidden, "appbar visible but shouldn't be");
                            test.assert($appBar.css("visibility") == "hidden", "appbar visibility != hidden");

                            // cleanup
                            appBar.onbeforeshow = null;
                            appBar.onaftershow = null;

                            onComplete(test);
                        });
                        appBar.show();
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        // next, test setting to disabled while visible; should hide the appbar
                        // First show the appbar again
                        appBar.disabled = false;

                        // Show the appbar
                        var afterShow = function () {
                            appBar.onaftershow = null;

                            // verify appbar is visible
                            test.assert(!appBar.hidden, "appbar hidden but shouldn't be");
                            test.assert($appBar.css("visibility") == "visible", "Appbar not visible after calling show");

                            onComplete(test);

                        }
                        appBar.onaftershow = afterShow;
                        appBar.show();
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        // NOTE: Win8 doesn't send an onbefore/afterhide in this scenario
                        var beforeHide = function () {
                            test.assert(false, "beforehide should not have been called");
                        }
                        var afterHide = function () {
                            test.assert(false, "afterhide should not have been called");
                        }
                        appBar.onbeforehide = beforeHide;
                        appBar.onafterhide = afterHide;

                        WinJS.Promise.timeout(500).then(function () {
                            test.assert(appBar.disabled, "2: Disabled property changed");
                            test.assert(appBar.hidden, "2: Dappbar visible but shouldn't be");
                            test.assert($appBar.css("visibility") == "hidden", "2: Dappbar visibility != hidden");

                            appBar.onbeforehide = null;
                            appBar.onafterhide = null;
                            $appBar.remove();
                            onTestComplete(test);
                        });
                        // Disable the now-visible appbar; this should cause it to be hidden
                        appBar.disabled = true;
                    });
                });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar events
    //
    events: function (test) {

        test.start("Appbar event tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/basicAppbar.html', $testDiv[0]).then(function () {

                var $appBar = $(".win-appbar", $testDiv)
                var appBar = $appBar[0].winControl;

                var callbacks = [];
                var beforeShow = function (eventData) {
                    callbacks.push(eventData);
                    test.assert(eventData.type == "beforeshow", "Wrong type in beforeshow");
                    test.assert($(eventData.target).hasClass("win-appbar"), "Wrong target in beforeshow");
                    test.assert($(eventData.srcElement).hasClass("win-appbar"), "Wrong srcElement in beforeshow");
                    test.assert($(eventData.currentTarget).hasClass("win-appbar"), "Wrong currentTarget in beforeshow");
                    test.assert(eventData.bubbles == true, "Wrong bubbles in beforeshow");
                    test.assert(eventData.cancelable == true, "Wrong cancelable in beforeshow");
                }
                var afterShow = function (eventData) {
                    callbacks.push(eventData);
                    test.assert(eventData.type == "aftershow", "Wrong type in afterShow");
                    test.assert($(eventData.target).hasClass("win-appbar"), "Wrong target in afterShow");
                    test.assert($(eventData.srcElement).hasClass("win-appbar"), "Wrong srcElement in afterShow");
                    test.assert($(eventData.currentTarget).hasClass("win-appbar"), "Wrong currentTarget in afterShow");
                    test.assert(eventData.bubbles == true, "Wrong bubbles in afterShow");
                    test.assert(eventData.cancelable == true, "Wrong cancelable in afterShow");
                    appBar.hide();
                }
                var beforeHide = function (eventData) {
                    callbacks.push(eventData);
                    test.assert(eventData.type == "beforehide", "Wrong type in beforeHide");
                    test.assert($(eventData.target).hasClass("win-appbar"), "Wrong target in beforeHide");
                    test.assert($(eventData.srcElement).hasClass("win-appbar"), "Wrong srcElement in beforeHide");
                    test.assert($(eventData.currentTarget).hasClass("win-appbar"), "Wrong currentTarget in beforeHide");
                    test.assert(eventData.bubbles == true, "Wrong bubbles in beforeHide");
                    test.assert(eventData.cancelable == true, "Wrong cancelable in beforeHide");
                }
                var afterHide = function (eventData) {
                    callbacks.push(eventData);
                    test.assert(eventData.type == "afterhide", "Wrong type in afterHide");
                    test.assert($(eventData.target).hasClass("win-appbar"), "Wrong target in afterHide");
                    test.assert($(eventData.srcElement).hasClass("win-appbar"), "Wrong srcElement in afterHide");
                    test.assert($(eventData.currentTarget).hasClass("win-appbar"), "Wrong currentTarget in afterHide");
                    test.assert(eventData.bubbles == true, "Wrong bubbles in afterHide");
                    test.assert(eventData.cancelable == true, "Wrong cancelable in afterHide");

                    test.assert(callbacks.length == 4, "Not all four callbacks called");
                    test.assert(callbacks[0].type == "beforeshow");
                    test.assert(callbacks[1].type == "aftershow");
                    test.assert(callbacks[2].type == "beforehide");
                    test.assert(callbacks[3].type == "afterhide");

                    // test clearing events.  Remove them, then show the appbar again; wait 500 ms and ensure none of
                    // the events were captured
                    appBar.onbeforeshow = null;
                    appBar.onaftershow = null;
                    appBar.removeEventListener("beforehide", beforeHide);
                    appBar.removeEventListener("afterhide", afterHide);
                    callbacks = [];

                    setTimeout(function () {
                        test.assert(callbacks.length == 0, "Callbacks called after events removed");

                        appBar.hide();

                        // Cleanup
                        $appBar.remove();

                        onTestComplete(test);
                    }, 500);

                    appBar.show();
                }

                // Hook up event listeners.  Use combination of on* and add/remove eventlistener
                // TODO: test useCapture
                appBar.onbeforeshow = beforeShow;
                appBar.onaftershow = afterShow;
                appBar.addEventListener("beforehide", beforeHide);
                appBar.addEventListener("afterhide", afterHide);

                appBar.show();
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar button sections
    //
    sections: function (test) {

        test.start("Appbar sections tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/complexAppbar.html', $testDiv[0]).then(function () {

                var $appBar = $(".win-appbar", $testDiv)
                var appBar = $appBar[0].winControl;

                test.assert($("#cmdUndo", $appBar).hasClass("win-selection"), "cmdUndo in wrong section");
                test.assert($("#cmdDelete", $appBar).hasClass("win-selection"), "cmdDelete in wrong section");
                test.assert($("#cmdAdd", $appBar).hasClass("win-global"), "cmdAdd in wrong section");
                test.assert($("#cmdHome", $appBar).hasClass("win-global"), "cmdHome in wrong section");

                test.assert($("hr.win-selection").length == 1, "No separator in selection");
                test.assert($("hr.win-global").length == 1, "No separator in global");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.commands property
    //
    commandsProperty: function (test) {

        test.start("AppBar.commands property tests");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/complexAppbar.html', $testDiv[0]).then(function () {

                var $appBar = $(".win-appbar", $testDiv)
                var appBar = $appBar[0].winControl;

                // test one command
                var newCommand = new WinJS.UI.AppBarCommand(null, { id: "newButtonId", icon: "delete", label: "hello", hidden: false });
                appBar.commands = newCommand;

                // verify it worked 
                var $button = $("button", $appBar);
                test.assert($button.length == 1, "incorrect number of buttons");
                test.assert($button.attr("id") == "newButtonId", "Invalid button in appbar");
                test.assert($(".win-label", $button).text() == "hello", "Button has wrong label");

                // test multiple commands
                var newCommands = [
                    new WinJS.UI.AppBarCommand(null, { id: "id1", icon: "undo", label: "undo", section: "global" }),
                    new WinJS.UI.AppBarCommand(null, { id: "id2", icon: "redo", label: "redo", section: "selection" }),
                    new WinJS.UI.AppBarCommand(null, { type: "separator" }),
                    new WinJS.UI.AppBarCommand(null, { id: "id3", icon: "home", label: "home", section: "global" })
                ];
                appBar.commands = newCommands;

                // verify it worked 
                var $buttons = $("button", $appBar);
                test.assert($buttons.length == 3, "2: incorrect number of buttons");
                var $b1 = $("button::nth-child(1)", $appBar);
                var $b2 = $("button::nth-child(2)", $appBar);
                var $b3 = $("button::nth-child(4)", $appBar);
                test.assert($b1.attr("id") == "id1", "2: button id1 incorrect");
                test.assert($b2.attr("id") == "id2", "2: button id2 incorrect");
                test.assert($b3.attr("id") == "id3", "2: button id3 incorrect");
                var $sep = $("hr::nth-child(3)", $appBar);
                test.assert($sep[0], "2: separator not present");

                // test no commands
                appBar.commands = [];

                var $button = $("button", $appBar);
                test.assert($button.length == 0, "3: incorrect number of buttons");

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.getCommandById
    //
    getCommandById: function (test) {

        test.start("AppBar.getCommandById tests");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/complexAppbar.html', $testDiv[0]).then(function () {

                var appBar = $(".win-appbar", $testDiv)[0].winControl;

                var cmd2 = appBar.getCommandById("cmdDelete");
                test.assert(cmd2.label == "Delete", "getCommandById did not work");

                var nullCmd = appBar.getCommandById("nonexistentId");
                test.assert(nullCmd == null, "getCommandById did not work with nonexistent id");

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar command hiding and showing
    //
    hideShowCommands: function (test) {

        test.start("AppBar command hiding and showing tests");
        test.timeoutLength = 15000;

        // hideCommands
        // showCommands
        // showOnlyCommands

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            var appBar;
            var cmdAdd, cmdHome, cmdUndo, cmdDelete;
            var $cmdAdd, $cmdHome, $cmdUndo, $cmdDelete;

            // Render the page
            WinJS.UI.Pages.render('/Tests/supportFiles/appBar/complexAppbar.html', $testDiv[0]).then(function () {

                appBar = $(".win-appbar", $testDiv)[0].winControl;
                return new WinJS.Promise(function (onComplete) {

                    cmdAdd = appBar.getCommandById("cmdAdd");
                    cmdHome = appBar.getCommandById("cmdHome");
                    cmdUndo = appBar.getCommandById("cmdUndo");
                    cmdDelete = appBar.getCommandById("cmdDelete");

                    $cmdAdd = $(cmdAdd.element);
                    $cmdHome = $(cmdHome.element);
                    $cmdUndo = $(cmdUndo.element);
                    $cmdDelete = $(cmdDelete.element);

                    appBar.onaftershow = function () {
                        onComplete();
                    }
                    appBar.show();

                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {


                        // Test hidecommands with one item
                        appBar.hideCommands(cmdAdd);
                        // on all of these, we need to wait a moment for the command(s) to finish animating
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "1: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "visible", "1: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "visible", "1: Undo not visible");
                        test.assert($cmdDelete.css("visibility") == "visible", "1: Delete not visible");

                        // test hidecommands with multiple items; also test hiding already hidden item
                        appBar.hideCommands([cmdHome, cmdUndo, cmdAdd]);
                        WinJS.Promise.timeout(1000).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "2: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "2: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "2: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "2: Delete not visible");

                        // test hiding already hidden item
                        appBar.hideCommands(cmdAdd);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "3: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "3: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "3: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "3: Delete not visible");

                        // Test showcommands with one item
                        appBar.showCommands(cmdAdd);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "4: Add not visible");
                        test.assert($cmdHome.css("visibility") == "hidden", "4: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "4: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "4: Delete not visible");

                        // Test showcommands with multiple items
                        appBar.showCommands([cmdHome, cmdDelete, cmdAdd]);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "5: Add not visible");
                        test.assert($cmdHome.css("visibility") == "visible", "5: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "hidden", "5: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "5: Delete not visible");

                        // Test showOnlyCommands with one item
                        appBar.showOnlyCommands(cmdUndo);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "6: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "6: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "visible", "6: Undo not visible");
                        test.assert($cmdDelete.css("visibility") == "hidden", "6: Delete not hidden");

                        // Test showOnlyCommands with multiple items
                        appBar.showOnlyCommands([cmdHome, cmdAdd]);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "7: Add not visible");
                        test.assert($cmdHome.css("visibility") == "visible", "7: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "hidden", "7: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "hidden", "7: Delete not hidden");

                        // Repeat above tests, using string identifiers instead of objects
                        appBar.showCommands([cmdUndo, cmdHome, cmdDelete, cmdAdd]);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });

                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "10: Add not visible");
                        test.assert($cmdHome.css("visibility") == "visible", "10: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "visible", "10: Undo not visible");
                        test.assert($cmdDelete.css("visibility") == "visible", "10: Delete not visible");

                        // Test hidecommands with one item
                        appBar.hideCommands("cmdAdd");
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "11: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "visible", "11: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "visible", "11: Undo not visible");
                        test.assert($cmdDelete.css("visibility") == "visible", "11: Delete not visible");


                        // test hidecommands with multiple items; also test hiding already hidden item
                        appBar.hideCommands(["cmdHome", "cmdUndo", "cmdAdd"]);
                        WinJS.Promise.timeout(1000).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "12: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "12: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "12: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "12: Delete not visible");

                        // test hiding already hidden item
                        appBar.hideCommands("cmdAdd");
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "13: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "13: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "13: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "13: Delete not visible");

                        // Test showcommands with one item
                        appBar.showCommands("cmdAdd");
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "14: Add not visible");
                        test.assert($cmdHome.css("visibility") == "hidden", "14: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "14: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "14: Delete not visible");

                        // Test showcommands with multiple items
                        appBar.showCommands(["cmdHome", "cmdDelete", "cmdAdd"]);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "15: Add not visible");
                        test.assert($cmdHome.css("visibility") == "visible", "15: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "hidden", "15: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "15: Delete not visible");
                        // Test showOnlyCommands with one item
                        appBar.showOnlyCommands("cmdDelete");
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "hidden", "16: Add not hidden");
                        test.assert($cmdHome.css("visibility") == "hidden", "16: Home not hidden");
                        test.assert($cmdUndo.css("visibility") == "hidden", "16: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "visible", "16: Delete not visible");

                        // Test showOnlyCommands with multiple items
                        appBar.showOnlyCommands(["cmdHome", "cmdAdd"]);
                        WinJS.Promise.timeout(500).then(function () { onComplete(); });
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        test.assert($cmdAdd.css("visibility") == "visible", "17: Add not visible");
                        test.assert($cmdHome.css("visibility") == "visible", "17: Home not visible");
                        test.assert($cmdUndo.css("visibility") == "hidden", "17: Undo not hidden");
                        test.assert($cmdDelete.css("visibility") == "hidden", "17: Delete not hidden");

                        $(appBar.element).remove();

                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar programmatic creation
    //
    programmaticCreate: function (test) {

        test.start("Appbar programmatic creation tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            $testDiv.css("backgroundColor", "#ccc");

            var appBar = new WinJS.UI.AppBar($testDiv[0], { placement: "top" });

            appBar.onaftershow = function () {
                test.assert($testDiv.hasClass("win-appbar"), "Appbar not created");
                test.assert($testDiv[0].winControl == appBar, "wincontrol not set");
                test.assert(appBar.placement == "top", "options not set");

                // Cleanup
                $testDiv.remove();
                onTestComplete(test);
            }
            appBar.show();
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.placement property
    //
    placementProperty: function (test) {

        test.start("Appbar.placement property tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            $testDiv.css("backgroundColor", "#ccc");

            // test top placement
            return new WinJS.Promise(function (onComplete) {
                var appBar = new WinJS.UI.AppBar($testDiv[0], { placement: "top" });

                appBar.onaftershow = function () {
                    test.assert($testDiv.hasClass("win-appbar"), "Appbar not created");
                    test.assert(appBar.placement == "top", "options not set");
                    test.assert($testDiv.css("top") == "0px", "appbar not at top");
                    test.assert($testDiv.css("bottom") == "auto", "appbar bottom is incorrect");
                    test.assert($testDiv.css("position") == "fixed", "appbar position is incorrect");

                    // Cleanup
                    $testDiv.remove();
                    onComplete();
                }
                appBar.show();

            }).then(function () {

                testHarness.clearTestSpace();
                var $testDiv = testHarness.addTestDiv("dataA");
                $testDiv.css("backgroundColor", "#ccc");

                // test bottom placement
                return new WinJS.Promise(function (onComplete) {
                    var appBar = new WinJS.UI.AppBar($testDiv[0], { placement: "bottom" });

                    appBar.onaftershow = function () {
                        test.assert($testDiv.hasClass("win-appbar"), "Appbar not created");
                        test.assert(appBar.placement == "bottom", "options not set");
                        test.assert($testDiv.css("top") == "auto", "appbar not at bottom");
                        test.assert($testDiv.css("bottom") == "0px", "appbar top is incorrect");
                        test.assert($testDiv.css("position") == "fixed", "appbar position is incorrect");

                        // Cleanup
                        $testDiv.remove();
                        onTestComplete(test);
                    }
                    appBar.show();
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.layout property
    //
    layoutProperty: function (test) {

        test.start("Appbar.layout property tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            $testDiv.css("backgroundColor", "#ccc");

            // test normal layout
            return new WinJS.Promise(function (onComplete) {
                var appBar = new WinJS.UI.AppBar($testDiv[0], { layout: "commands" });
                appBar.commands = new WinJS.UI.AppBarCommand(null, { id: "newButtonId", icon: "delete", label: "hello", hidden: false });
                appBar.onaftershow = function () {
                    appBar.onaftershow = null;
                    test.assert($("button", $testDiv).hasClass("win-global"), "command button not created");

                    // Cleanup
                    onComplete();
                }
                appBar.show();

            }).then(function () {

                testHarness.clearTestSpace();
                var $testDiv = testHarness.addTestDiv("dataA");
                $testDiv.css("backgroundColor", "#ccc");

                // Now test a custom layout
                WinJS.UI.Pages.render('/Tests/supportFiles/appBar/customLayout.html', $testDiv[0]).then(function () {
                    var $appBar = $(".win-appbar", $testDiv)
                    var appBar = $appBar[0].winControl;
                    appBar.onaftershow = function () {
                        test.assert(appBar.layout == "custom", "Layout not custom");
                        test.assert($("button", $appBar).length == 7, "Did not create custom layout");

                        // Verify the rating control was created and processed
                        var $rating = $(".win-rating", $appBar);
                        test.assert($rating[0], "Rating element not created");
                        test.assert($rating[0].winControl, "Rating control not created");
                        test.assert($rating[0].winControl.averageRating == 2.4, "Rating control not initialized");

                        // Cleanup
                        testHarness.clearTestSpace();
                        onTestComplete(test);
                    }

                    appBar.show();
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.AppBar.sticky property and light dismiss
    //
    stickyAndLightDismiss: function (test) {

        test.start("Appbar.sticky property and light dismiss tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");
            $testDiv.css("backgroundColor", "#ccc");
            // test non-sticky layout
            return new WinJS.Promise(function (onComplete) {
                var $appBar = $testDiv;
                var appBar = new WinJS.UI.AppBar($testDiv[0], { layout: "commands", sticky: "false" });

                appBar.onafterhide = function () {
                    test.assert($appBar.css("visibility") == "hidden", "Appbar not hidden after light dismiss");
                    onComplete();
                };

                appBar.onaftershow = function () {

                    // Do a light dismiss
                    $(".win-appbarclickeater").click();

                    // Cleanup
                    onComplete();
                }
                appBar.show();

            }).then(function () {

                // now test sticky
                testHarness.clearTestSpace();
                var $testDiv = testHarness.addTestDiv("dataA");
                $testDiv.css("backgroundColor", "#ccc");

                return new WinJS.Promise(function (onComplete) {
                    var $appBar = $testDiv;
                    var appBar = new WinJS.UI.AppBar($testDiv[0], { layout: "commands", sticky: "true" });

                    appBar.onafterhide = function () {
                        test.assert(false, "sticky appbar should not hide on lightdismiss");
                        onComplete();
                    };

                    appBar.onaftershow = function () {

                        setTimeout(function () {
                            test.assert($appBar.css("visibility") == "visible", "Appbar not visible but should be");
                            onComplete();
                        }, 1000);

                        // Do a light dismiss
                        $(".win-appbarclickeater").click();
                    }
                    appBar.show();
                });

            }).then(function () {

                // now hidden property with sticky=true
                testHarness.clearTestSpace();
                var $testDiv = testHarness.addTestDiv("dataA");
                $testDiv.css("backgroundColor", "#ccc");

                return new WinJS.Promise(function (onComplete) {
                    var $appBar = $testDiv;
                    var appBar = new WinJS.UI.AppBar($testDiv[0], { layout: "commands", sticky: "true" });

                    appBar.onafterhide = function () {
                        test.assert($appBar.css("visibility") == "hidden", "Appbar not hidden after hide()");

                        // Cleanup
                        testHarness.clearTestSpace();
                        onTestComplete(test);
                    };

                    appBar.onaftershow = function () {

                        msSetImmediate(function () {
                            appBar.hide();
                        });
                    }
                    appBar.show();
                });
            });
        });
    }
});
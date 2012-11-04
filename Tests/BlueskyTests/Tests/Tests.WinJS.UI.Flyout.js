"use strict";

// ================================================================
//
// Test.WinJS.UI.Flyout.js
//		Tests for WinJS.UI.Flyout
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.Flyout Tests", {

    // ==========================================================================
    // 
    // Test basic Flyout creation
    //
    basicFlyout: function (test) {

        test.start("Basic Flyout creation");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:200px;background-color:#a00;width:100px;height:100px'>anchor</div>");
            var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Hello there</div>');
            
            var flyout = new WinJS.UI.Flyout($flyout[0]);
            var after = function (e) {
                // Verify the flyout is visible and where we expect it to be
                var $flyoutDiv = $(".win-flyout");
                test.assert($flyoutDiv.length == 1, "Flyout not present in DOM");
                test.assert($flyoutDiv.css("visibility") == "visible", "Flyout not visible");
                test.assert($flyout.html().indexOf("Hello there") >= 0, "flyout inner html incorrect");

                flyout.hide();
            }

            flyout.onafterhide = function (e) {
                // Need to explicitly remove flyout from DOM since it's not in the testFrame
                $(flyout.element).remove();
                onTestComplete(test);
            }

            flyout.onaftershow = after;
            flyout.show($anchor[0], "bottom");
        });
    },


    // ==========================================================================
    // 
    // Test Flyout event handlers
    //
    flyoutEvents: function (test) {
        test.start("Test Flyout event handlers");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:200px;background-color:#a00;width:100px;height:100px'>anchor</div>");
            var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Hello there</div>');

            var flyout = new WinJS.UI.Flyout($flyout[0]);
            var eventOrder = [];
            var beforeShowValue, beforeHideValue, afterShowValue, afterHideValue;

            flyout.onbeforeshow = function (e) {
                test.assert(e.type == "beforeshow", "Incorrect event type specified in onbeforeshow");
                test.assert(e.target.id == "testFlyout", "Incorrect target specified in onbeforeshow");
                test.assert(e.currentTarget.id == "testFlyout", "Incorrect currentTarget specified in onbeforeshow");
                test.assert(e.srcElement.id == "testFlyout", "Incorrect srcElement specified in onbeforeshow");
                eventOrder.push(1);
                beforeShowValue = e;
            }
            flyout.onaftershow = function (e) {
                test.assert(e.type == "aftershow", "Incorrect event type specified in onaftershow");
                test.assert(e.target.id == "testFlyout", "Incorrect target specified in onaftershow");
                test.assert(e.currentTarget.id == "testFlyout", "Incorrect currentTarget specified in onaftershow");
                test.assert(e.srcElement.id == "testFlyout", "Incorrect srcElement specified in onaftershow");
                eventOrder.push(2);
                afterShowValue = e;
                // Wait a moment, then hide it
                WinJS.Promise.timeout(100).then(function () {
                    flyout.hide();
                });
            }
            flyout.onbeforehide = function (e) {
                test.assert(e.type == "beforehide", "Incorrect event type specified in onbeforehide");
                test.assert(e.target.id == "testFlyout", "Incorrect target specified in onbeforehide");
                test.assert(e.currentTarget.id == "testFlyout", "Incorrect currentTarget specified in onbeforehide");
                test.assert(e.srcElement.id == "testFlyout", "Incorrect srcElement specified in onbeforehide");
                eventOrder.push(3);
                beforeHideValue = e;
            }
            flyout.onafterhide = function (e) {
                test.assert(e.type == "afterhide", "Incorrect event type specified in onafterhide");
                test.assert(e.target.id == "testFlyout", "Incorrect target specified in onafterhide");
                test.assert(e.currentTarget.id == "testFlyout", "Incorrect currentTarget specified in onafterhide");
                test.assert(e.srcElement.id == "testFlyout", "Incorrect srcElement specified in onafterhide");
                eventOrder.push(4);
                afterHideValue = e;

                // Verify the flyout is not visible and where we expect it to be
                var $flyoutDiv = $(".win-flyout");
                test.assert($flyoutDiv.css("visibility") == "hidden", "Flyout visible, should be hidden");

                // Verify order of events
                test.assert(eventOrder[0] == 1 && eventOrder[1] == 2 && eventOrder[2] == 3 && eventOrder[3] == 4, "Events fired in wrong order");
                flyout.hide();
                $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                onTestComplete(test);
            }

            flyout.show($anchor[0], "bottom");
        });
    },

    // ==========================================================================
    // 
    // Test Flyout positioning logic
    //
    flyoutAutoPositioning: function (test) {
        test.start("Test Flyout positioning logic");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Verify that default is to display along top (if fits)
            return new WinJS.Promise(function (onComplete) {

                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                var afterShow = function () {
                    // Verify the flyout is visible and where we expect it to be
                    test.assert($flyout.offset().top < $anchor.offset().top, "verify flyout is not above anchor");

                    // Verify centered
                    var anchorHorzCenter = $anchor.offset().left + $anchor.outerWidth() / 2;
                    var flyoutHorzCenter = $flyout.offset().left + $flyout.outerWidth() / 2;
                    test.assert(Math.abs(anchorHorzCenter - flyoutHorzCenter) < 1, "Flyout not horizontally centered (1)");

                    flyout.removeEventListener("aftershow", afterShow);
                    flyout.hide();
                    $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame
                    onComplete();
                };
                flyout.addEventListener("aftershow", afterShow);
                flyout.show($anchor[0]);

            }).then(function () {

                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                // Verify that second default (if top is full) is bottom side
                return new WinJS.Promise(function (onComplete) {
                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top > $anchor.offset().top, "verify flyout is not below anchor");

                        // Verify centered
                        var anchorHorzCenter = $anchor.offset().left + $anchor.outerWidth() / 2;
                        var flyoutHorzCenter = $flyout.offset().left + $flyout.outerWidth() / 2;
                        test.assert(Math.abs(anchorHorzCenter - flyoutHorzCenter) < 1, "Flyout not horizontally centered (2)");

                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame
                        onComplete();
                    };
                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0]);

                });
            }).then(function () {

                testHarness.clearTestSpace();
                var screenHeight = $("html").outerHeight();

                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:150px;background-color:#a00;width:100px;height:" + screenHeight + "px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                // Verify that third default (if top and bottom are full) is left side
                return new WinJS.Promise(function (onComplete) {
                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left < $anchor.offset().left, "Flyout is not to the left of anchor");

                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onTestComplete(test);
                    };
                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0]);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test explicit Flyout position specifying
    //
    flyoutExplicitPositioning: function (test) {

        test.start("Test explicit position without sufficient space");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {

                // Verify that if placement == left then the flyout appears to the left
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                var afterShow = function () {
                    // Verify the flyout is visible and where we expect it to be
                    test.assert($flyout.offset().left < $anchor.offset().left, "Flyout is not to the left");
                    flyout.removeEventListener("aftershow", afterShow);
                    flyout.hide();
                    $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                    onComplete();
                };
                flyout.addEventListener("aftershow", afterShow);
                flyout.show($anchor[0], "left");

            }).then(function () {

                // Verify that if placement == right then the flyout appears to the right
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                // Verify that second default (if top is full) is bottom side
                return new WinJS.Promise(function (onComplete) {
                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left > $anchor.offset().left, "Flyout is not to the right");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };
                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "right");

                });
            }).then(function () {

                // Verify that if placement == top then the flyout appears to the top
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                // Verify that second default (if top is full) is bottom side
                return new WinJS.Promise(function (onComplete) {
                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top < $anchor.offset().top, "Flyout is not to the top");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };
                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "top");

                });
            }).then(function () {

                // Verify that if placement == bottom then the flyout appears to the bottom
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                // Verify that second default (if top is full) is bottom side
                return new WinJS.Promise(function (onComplete) {
                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top > $anchor.offset().top, "Flyout is not to the bottom");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onTestComplete(test);
                    };
                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "bottom");
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Flyout Edge handling logic
    //
    flyoutEdges: function (test) {
        test.start("Test Flyout edge handling");
        test.timeoutLength = 5000;

        test.nyi("Flyout to top (too close on left/right) - should stay onscreen");
        test.nyi("Flyout to bottom (too close on left/right) - should stay onscreen");
        test.nyi("Flyout to left (too close on top/bottom) - should stay onscreen");
        test.nyi("Flyout to right (too close on top/bottom) - should stay onscreen");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {
                // Verify that if placement == right and too close on top/bottom, then it doesn't go offscreen
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:300px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);

                var afterShow = function () {
                    // Verify the flyout is visible and where we expect it to be
                    test.assert($flyout.offset().top == parseInt($flyout.css("marginTop")), "Flyout not on top of screen");
                    flyout.removeEventListener("aftershow", afterShow);
                    flyout.hide();
                    $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                    onComplete();
                };

                flyout.addEventListener("aftershow", afterShow);
                flyout.show($anchor[0], "right");
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == left and too close on top/bottom, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:10px;left:300px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top == parseInt($flyout.css("marginTop")), "Flyout (2) not on top of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "left");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == top and too close on right, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var leftEdge = $("html").outerWidth();
                    var testFrameLeft = $(".testFrame").offset().left;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:300px;left:" + (leftEdge - testFrameLeft - 150) + "px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left + $flyout.outerWidth() + parseInt($flyout.css("marginRight")) == leftEdge, "Flyout not on right of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "top");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == bottom and too close on right, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var leftEdge = $("html").outerWidth();
                    var testFrameLeft = $(".testFrame").offset().left;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:300px;left:" + (leftEdge - testFrameLeft - 150) + "px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left + $flyout.outerWidth() + parseInt($flyout.css("marginRight")) == leftEdge, "Flyout (2) not on right of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "bottom");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {

                    // Verify that if placement == right and too close on bottom, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var bottomEdge = $("html").outerHeight();
                    var testFrameTop = $(".testFrame").offset().top;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:" + (bottomEdge - testFrameTop - 150) + "px;left:300px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top + $flyout.outerHeight() + parseInt($flyout.css("marginBottom")) == bottomEdge, "Flyout not on bottom of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "right");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == left and too close on bottom, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var bottomEdge = $("html").outerHeight();
                    var testFrameTop = $(".testFrame").offset().top;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:" + (bottomEdge - testFrameTop - 150) + "px;left:300px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().top + $flyout.outerHeight() + parseInt($flyout.css("marginBottom")) == bottomEdge, "Flyout (2) not on bottom of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "left");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == top and too close on left, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var left = -$(".testFrame").offset().left + 10;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:310px;left:" + left + "px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left == parseInt($flyout.css("marginLeft")), "Flyout not on left of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onComplete();
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "top");
                });
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {
                    // Verify that if placement == bottom and too close on left, then it doesn't go offscreen
                    testHarness.clearTestSpace();
                    var left = -$(".testFrame").offset().left + 10;
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:310px;left:" + left + "px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:200px;height:200px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);

                    var afterShow = function () {
                        // Verify the flyout is visible and where we expect it to be
                        test.assert($flyout.offset().left == parseInt($flyout.css("marginLeft")), "Flyout not on left of screen");
                        flyout.removeEventListener("aftershow", afterShow);
                        flyout.hide();
                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame

                        onTestComplete(test);
                    };

                    flyout.addEventListener("aftershow", afterShow);
                    flyout.show($anchor[0], "bottom");
                });
            })
        });
    },


    // ==========================================================================
    // 
    // Test Flyout Resizing logic
    //
    flyoutResizing: function (test) {
        test.start("Test Flyout Resizing logic");
        test.nyi("test resizing; eg flyout to top, but too close to top to fit.");
    },


    // ==========================================================================
    // 
    // Test Flyout dismissing
    //
    flyoutDismiss: function (test) {
        test.start("Test Flyout dismissing");

        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {

                // Verify that hide() works
                testHarness.clearTestSpace();
                var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                var flyout = new WinJS.UI.Flyout($flyout[0]);
                flyout.onafterhide = function (e) {

                    // Verify the flyout is not visible and where we expect it to be
                    test.assert($flyout.css("visibility") == "hidden", "Flyout visible, should be hidden");
                    $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame
                    onComplete();
                }

                flyout.onaftershow = function (e) {
                    flyout.hide();
                }

                flyout.show($anchor[0]);
            }).then(function () {
                return new WinJS.Promise(function (onComplete) {

                    // Verify that hide() works
                    testHarness.clearTestSpace();
                    var $anchor = testHarness.addTestElement("<div id='testAnchor' style='position: absolute;top:150px;left:150px;background-color:#a00;width:100px;height:100px'>anchor</div>");
                    var $flyout = testHarness.addTestElement('<div id="testFlyout" data-win-control="WinJS.UI.Flyout" style="display: none;background-color:#aaa;width:20px;height:20px">Foo</div>');
                    var flyout = new WinJS.UI.Flyout($flyout[0]);
                    flyout.onafterhide = function (e) {

                        // Verify the flyout is not visible and where we expect it to be
                        test.assert($flyout.css("visibility") == "hidden", "Flyout visible, should be hidden");

                        $(flyout.element).remove(); // Need to explicitly remove flyout from DOM since it's not in the testFrame
                        onTestComplete(test);
                    }

                    flyout.onaftershow = function (e) {

                        // Click to force a light dismiss
                        // TODO: Hmm, this doesn't trigger a native click event but instead passes it straight to the body, so the flyout's click
                        // eater doesn't catch it.  As a result, we can't test this without a test manager running outside of the browser...
                        //testHarness.simulateMouseEvent($("body")[0], { type: "click" });
                        flyout.hide();
                    }

                    flyout.show($anchor[0]);
                });
            });
        });
    },
});
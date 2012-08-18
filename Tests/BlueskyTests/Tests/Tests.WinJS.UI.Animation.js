"use strict";

// ================================================================
//
// Test.WinJS.UI.Animation.js
//		Tests for WinJS.UI.Animation
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.Animation Tests", {
    
    // ==========================================================================
    // 
    // Test Animation.showPopup and Animation.hidePopup
    //
    showHidePopup: function (test) {

        test.start("Animation.show/hidePopup tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // TODO: How to test if the animation actually animated?
            WinJS.UI.Animation.showPopup([$testElement[0]]).then(function () {

                // verify the content is where we expect it to be
            	test.assert($("#testElement").css("left") == "0px" || $("#testElement").css("left") == "auto", "Element not at left=0; " + $("#testElement").css("left"));

                return WinJS.Promise.timeout();
            }).then(function () {

                return WinJS.UI.Animation.hidePopup($testElement[0]);

            }).then(function () {

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.enterContent
    //
    enterContent: function (test) {

        test.start("Animation.enterContent tests");

        test.nyi("test animating elements with different position (relative, absolute, etc)");
        test.nyi("test animating elements with left != 0");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // TODO: How to test if the animation actually animated?
            WinJS.UI.Animation.enterContent([$testElement[0]]).then(function () {

                // verify the content is where we expect it to be
            	test.assert($("#testElement").css("left") == "0px" || $("#testElement").css("left") == "auto", "Element not at left=0; " + $("#testElement").css("left"));

                return WinJS.Promise.timeout();
            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999'>Hello</div>" +
															  "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888'>World</div>" +
															  "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777'>Foo</div>" +
															  "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666'>Bar</div>" +
															  "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555'>XYZ</div>" +
															  "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444'>abc</div>" +
															  "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333'>123</div>");

                return WinJS.UI.Animation.enterContent($(".testEl").get());

            }).then(function () {

                // verify the elements are where we expect them to be
                $(".testEl").get().forEach(function (el) {
                	test.assert($(el).css("left") == "0px" || $(el).css("left") == "auto", "Element not at left=0; " + $(el).css("left"));
                });

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.enterContentWithOffset
    //
    enterContentWithOffset: function (test) {

        test.start("Animation.enterContent with offsets tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // test undefined offset
            new WinJS.Promise(function (onComplete) {

                WinJS.UI.Animation.enterContent([$testElement[0]]).then(function () {

                    onComplete();
                });
            }).then(function () {
                // Test one offset - positive x
                return new WinJS.Promise(function (onComplete) {

                    WinJS.UI.Animation.enterContent([$testElement[0]], { top: "0px", left: "100px" }).then(function () {

                        onComplete();
                    });
                });
            }).then(function () {
                // Test one offset - negative x
                return new WinJS.Promise(function (onComplete) {

                    WinJS.UI.Animation.enterContent([$testElement[0]], { top: "0px", left: "-100px" }).then(function () {

                        onComplete();
                    });
                });
            }).then(function () {
                // Test one offset - positive Y
                return new WinJS.Promise(function (onComplete) {

                    WinJS.UI.Animation.enterContent([$testElement[0]], { top: "100px", left: "0px" }).then(function () {

                        onComplete();
                    });
                });
            }).then(function () {
                // Test one offset - rtlflip
                return new WinJS.Promise(function (onComplete) {

                    WinJS.UI.Animation.enterContent([$testElement[0]], { top: "0px", left: "100px", rtlflip: true }).then(function () {

                        onComplete();
                    });
                });
            }).then(function () {
                // Test multiple offsets
                return new WinJS.Promise(function (onComplete) {
                    testHarness.clearTestSpace();
                    var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999'>Hello</div>" +
                                                                  "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888'>World</div>" +
                                                                  "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777'>Foo</div>" +
                                                                  "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666'>Bar</div>" +
                                                                  "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555'>XYZ</div>" +
                                                                  "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444'>abc</div>" +
                                                                  "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333'>123</div>");

                    WinJS.UI.Animation.enterContent($testElement.get(), [{
                        top: "0px", left: "100px",
                    }, {
                        top: "100px", left: "100px",
                    }, {
                        top: "100px", left: "100px",
                    }, {
                        top: "0px", left: "100px", rtlflip: true
                    }]).then(function () {

                        onTestComplete(test);
                    });
                });
            })
        });
    },


    // ==========================================================================
    // 
    // Test Animation.exitContent
    //
    exitContent: function (test) {

        test.start("Animation.exitContent tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // TODO: How to test if the animation actually animated?
            WinJS.UI.Animation.exitContent([$testElement[0]]).then(function () {

                // verify the content is where we expect it to be
                // TODO: Does Win8 munge with the left property?  Do they restore it to 0 at the end?
            	test.assert($("#testElement").css("left") == -WinJS.UI.Animation._enterExitDistance + "px" || $("#testElement").css("left") == "auto", "Element not at left");

                return WinJS.Promise.timeout();
            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333'>123</div>");

                return WinJS.UI.Animation.exitContent($(".testEl").get());

            }).then(function () {

                // verify the elements are where we expect them to be
                $(".testEl").get().forEach(function (el) {
                	test.assert($(el).css("left") == -WinJS.UI.Animation._enterExitDistance + "px" || $(el).css("left") == "auto", "2: Element not at left");
                });

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.enterPage
    //
    enterPage: function (test) {

        test.start("Animation.enterPage tests");
        test.nyi("I'm currently assuming that enterPage == enterContent, which is unlikely but I can't check that right now.  Revisit this.");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // TODO: How to test if the animation actually animated?
            WinJS.UI.Animation.enterPage([$testElement[0]]).then(function () {

                // verify the content is where we expect it to be
            	test.assert($("#testElement").css("left") == "0px" || $("#testElement").css("left") == "auto", "Element not at left=0");

                return WinJS.Promise.timeout();
            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333'>123</div>");

                return WinJS.UI.Animation.enterPage($(".testEl").get());

            }).then(function () {

                // verify the elements are where we expect them to be
                $(".testEl").get().forEach(function (el) {
                	test.assert($(el).css("left") == "0px" || $(el).css("left") == "auto", "Element not at left=0");
                });

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.exitPage
    //
    exitPage: function (test) {

        test.start("Animation.exitPage tests");
        test.nyi("I'm currently assuming that exitPage == exitContent, which is unlikely but I can't check that right now.  Revisit this.");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999'>Hello</div>");

            // TODO: How to test if the animation actually animated?
            WinJS.UI.Animation.exitPage([$testElement[0]]).then(function () {

                // verify the content is where we expect it to be
                // TODO: Does Win8 munge with the left property?  Do they restore it to 0 at the end?
            	test.assert($("#testElement").css("left") == -WinJS.UI.Animation._enterExitDistance + "px" || $("#testElement").css("left") == "auto", "Element not at left");

                return WinJS.Promise.timeout();
            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333'>123</div>");

                return WinJS.UI.Animation.exitPage($(".testEl").get());

            }).then(function () {

                // verify the elements are where we expect them to be
                $(".testEl").get().forEach(function (el) {
                	test.assert($(el).css("left") == -WinJS.UI.Animation._enterExitDistance + "px" || $(el).css("left") == "auto", "2: Element not at left");
                });

                onTestComplete(test);
            });
        });
    }
});
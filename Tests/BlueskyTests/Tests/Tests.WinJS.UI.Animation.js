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
    },


    // ==========================================================================
    // 
    // Test Animation.fadeIn
    //
    fadeIn: function (test) {

        test.start("Animation.fadeIn tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999;opacity: 0'>Hello</div>");

            return WinJS.UI.Animation.fadeIn([$testElement[0]]).then(function () {

                test.assert($("#testElement").css("opacity") == "1", "Element not shown");

            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999;opacity: 0'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888;opacity: 0'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777;opacity: 0'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666;opacity: 0'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555;opacity: 0'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444;opacity: 0'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333;opacity: 0'>123</div>");

                WinJS.UI.Animation.fadeIn($(".testEl").get()).then(function () {

                    // verify the elements are as we expect them to be
                    $(".testEl").get().forEach(function (el) {
                        test.assert($(el).css("opacity") == 1, "2: Element not shown");
                    });
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.fadeOut
    //
    fadeOut: function (test) {

        test.start("Animation.fadeOut tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $testElement = testHarness.addTestElement("<div id='testElement' style='width:400px;height:300px;background-color:#999;opacity: 1'>Hello</div>");

            return WinJS.UI.Animation.fadeOut([$testElement[0]]).then(function () {

                test.assert($("#testElement").css("opacity") == "0", "Element not hidden");

            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666;opacity: 1'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555;opacity: 1'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444;opacity: 1'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333;opacity: 1'>123</div>");

                WinJS.UI.Animation.fadeOut($(".testEl").get()).then(function () {

                    // verify the elements are as we expect them to be
                    $(".testEl").get().forEach(function (el) {
                        test.assert($(el).css("opacity") == 0, "2: Element not hidden");
                    });
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.crossFade
    //
    crossFade: function (test) {

        test.start("Animation.crossFade tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $incoming = testHarness.addTestElement("<div id='testElement1' style='width:400px;height:300px;background-color:red;opacity: 0'>Hello</div>");
            var $outgoing = testHarness.addTestElement("<div id='testElement2' style='height:300px;background-color:green;opacity: 1'>World</div>");

            return WinJS.UI.Animation.crossFade([$incoming[0]], [$outgoing[0]]).then(function () {

                test.assert($incoming.css("opacity") == "1", "$incoming not shown");
                test.assert($outgoing.css("opacity") == "0", "$outgoing not hidden");

            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $incoming = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999;opacity: 0'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888;opacity: 0'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777;opacity: 0'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666;opacity: 0'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555;opacity: 0'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444;opacity: 0'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333;opacity: 0'>123</div>");

                var $outgoing = testHarness.addTestElement("<div class='testElb' id='test1b' style='width:400px;height:50px;background-color:#999;opacity: 1'>2Hello</div>" +
                                                              "<div class='testElb' id='test2b' style='width:400px;height:50px;background-color:#888;opacity: 1'>2World</div>" +
                                                              "<div class='testElb' id='test3b' style='width:400px;height:50px;background-color:#777;opacity: 1'>2Foo</div>" +
                                                              "<div class='testElb' id='test4b' style='width:400px;height:50px;background-color:#666;opacity: 1'>2Bar</div>" +
                                                              "<div class='testElb' id='test5b' style='width:400px;height:50px;background-color:#555;opacity: 1'>2XYZ</div>" +
                                                              "<div class='testElb' id='test6b' style='width:400px;height:50px;background-color:#444;opacity: 1'>2abc</div>" +
                                                              "<div class='testElb' id='test7b' style='width:400px;height:50px;background-color:#333;opacity: 1'>2123</div>");

                WinJS.UI.Animation.crossFade($incoming.get(), $outgoing.get()).then(function () {

                    // verify the elements are as we expect them to be
                    $(".testEl").get().forEach(function (el) {
                        test.assert($(el).css("opacity") == 1, "2: incoming not shown. " + $(el).css("opacity"));
                    });
                    $(".testElb").get().forEach(function (el) {
                        test.assert($(el).css("opacity") == 0, "2: outgoing not hidden");
                    });
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.pointerDown
    //
    pointerDown: function (test) {

        test.start("Animation.pointerDown tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $incoming = testHarness.addTestElement("<div id='testElement1' style='width:400px;height:300px;background-color:blue'>Hello</div>");

            return WinJS.UI.Animation.pointerDown($incoming.get()).then(function () {

                test.assert($incoming.css("transform") == "matrix(0.975, 0, 0, 0.975, 0, 0)", "transform wrong");

            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666;opacity: 1'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555;opacity: 1'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444;opacity: 1'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333;opacity: 1'>123</div>");

                WinJS.UI.Animation.pointerDown($(".testEl").get()).then(function () {

                    // verify the elements are as we expect them to be
                    $(".testEl").get().forEach(function (el) {
                        test.assert($(el).css("transform") == "matrix(0.975, 0, 0, 0.975, 0, 0)", "transform wrong");
                    });
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.pointerUp
    //
    pointerUp: function (test) {

        test.start("Animation.pointerUp tests");

        test.nyi("Test with pre-existing transform");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var $incoming = testHarness.addTestElement("<div id='testElement1' style='width:400px;height:300px;background-color:blue'>Hello</div>");

            return WinJS.UI.Animation.pointerDown($incoming.get()).then(function () {
                return WinJS.UI.Animation.pointerUp($incoming.get()).then(function () {

                    test.assert($incoming.css("transform") == "none" ||
                                $incoming.css("transform") == "matrix(1, 0, 0, 1, 0, 0)", "transform wrong");
                });
            }).then(function () {

                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>" +
                                                              "<div class='testEl' id='test4' style='width:400px;height:50px;background-color:#666;opacity: 1'>Bar</div>" +
                                                              "<div class='testEl' id='test5' style='width:400px;height:50px;background-color:#555;opacity: 1'>XYZ</div>" +
                                                              "<div class='testEl' id='test6' style='width:400px;height:50px;background-color:#444;opacity: 1'>abc</div>" +
                                                              "<div class='testEl' id='test7' style='width:400px;height:50px;background-color:#333;opacity: 1'>123</div>");

                WinJS.UI.Animation.pointerDown($(".testEl").get()).then(function () {
                    WinJS.UI.Animation.pointerUp($(".testEl").get()).then(function () {

                        // verify the elements are as we expect them to be
                        $(".testEl").get().forEach(function (el) {
                            test.assert($(el).css("transform") == "none" ||
                                        $(el).css("transform") == "matrix(1, 0, 0, 1, 0, 0)", "transform wrong");

                        });
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.showPanel and Animation.hidePanel
    //
    showHidePanel: function (test) {

        test.start("Animation.show/hidePanel tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (c) {
                var $testElement = testHarness.addTestElement("<div id='testElement' style='position:absolute;right:0px;width:400px;height:300px;background-color:#999'>Hello</div>");

                // TODO: How to test if the animation actually animated?
                WinJS.UI.Animation.showPanel([$testElement[0]], { top: "0px", left: "400px" }).then(function () {

                    // TODO: verify the content is where we expect it to be

                    WinJS.UI.Animation.hidePanel([$testElement[0]], { top: "0px", left: "400px" }).then(function () {

                        // TODO: verify the content is where we expect it to be

                        c();
                    });
                });
            }).then(function () {
                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='position:absolute;right:0px;top:10px;width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='position:absolute;right:0px;top:110px;width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='position:absolute;right:0px;top:210px;width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>");
                WinJS.UI.Animation.showPanel($(".testEl").get(), { top: "0px", left: "400px" }).then(function () {
                    WinJS.UI.Animation.hidePanel($(".testEl").get(), { top: "0px", left: "400px" }).then(function () {

                        // TODO: verify the content is where we expect it to be
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.showEdgeUI and Animation.hideEdgeUI
    //
    showHideEdgeUI: function (test) {

        test.start("Animation.show/hideEdgeUI tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (c) {
                var $testElement = testHarness.addTestElement("<div id='testElement' style='position:absolute;right:0px;width:400px;height:300px;background-color:#999'>Hello</div>");

                // TODO: How to test if the animation actually animated?
                WinJS.UI.Animation.showEdgeUI([$testElement[0]], { top: "0px", left: "400px" }).then(function () {

                    // TODO: verify the content is where we expect it to be

                    WinJS.UI.Animation.hideEdgeUI([$testElement[0]], { top: "0px", left: "400px" }).then(function () {

                        // TODO: verify the content is where we expect it to be

                        c();
                    });
                });
            }).then(function () {
                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='position:absolute;right:0px;top:10px;width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='position:absolute;right:0px;top:110px;width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='position:absolute;right:0px;top:210px;width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>");
                WinJS.UI.Animation.showEdgeUI($(".testEl").get(), { top: "0px", left: "400px" }).then(function () {
                    WinJS.UI.Animation.hideEdgeUI($(".testEl").get(), { top: "0px", left: "400px" }).then(function () {

                        // TODO: verify the content is where we expect it to be
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Animation.createPeekAnimation
    //
    createPeekAnimation: function (test) {

        test.start("Animation.createPeekAnimation tests");
        test.timeoutLength = 5000;
        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (c) {
                var $testElement = testHarness.addTestElement("<div id='testElement' style='position:absolute;left:100px;top:100px;width:400px;height:300px;background-color:#999'>Hello</div>");

                var anim = WinJS.UI.Animation.createPeekAnimation($testElement[0]);
                $testElement.css("top", "0px");
                anim.execute().then(function () {
                    c();
                });
            }).then(function () {
                // Test animating multiple elements
                testHarness.clearTestSpace();
                var $testElement = testHarness.addTestElement("<div class='testEl' id='test1' style='position:absolute;left:0px;top:10px;width:400px;height:50px;background-color:#999;opacity: 1'>Hello</div>" +
                                                              "<div class='testEl' id='test2' style='position:absolute;left:50px;top:210px;width:400px;height:50px;background-color:#888;opacity: 1'>World</div>" +
                                                              "<div class='testEl' id='test3' style='position:absolute;left:100px;top:310px;width:400px;height:50px;background-color:#777;opacity: 1'>Foo</div>");
                var anim = WinJS.UI.Animation.createPeekAnimation($testElement.get());
                $("#test1").css("top", "0px");
                $("#test2").css("top", "60px");
                $("#test3").css("top", "120px");
                anim.execute().then(function () {

                    // TODO: verify the content is where we expect it to be
                    onTestComplete(test);
                });
            });
        });
    },

});
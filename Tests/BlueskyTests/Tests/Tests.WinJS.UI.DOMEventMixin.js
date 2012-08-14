"use strict";

// ================================================================
//
// Test.WinJS.UI.DOMEventMixin.js
//		Tests for WinJS.UI.DOMEventMixin
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.DOMEventMixin Tests", {

    // ==========================================================================
    // 
    // Test basic DOMEventMixin mixin
    //
    mixinTest: function (test) {

        test.start("DOMEventMixin mix in to class");

        // Define class into which we'll mix DOMEventMixin
        WinJS.Namespace.define("Tests.DOMEventMixin", {
            TestClass: WinJS.Class.define(function () { })
        });

        // Mix DomEventMixin into the test class
        WinJS.Class.mix(Tests.DOMEventMixin.TestClass, WinJS.UI.DOMEventMixin);

        // Create an instance of the test class so that we can check for the presence of the DOMEventMixin functions
        var test1 = new Tests.DOMEventMixin.TestClass();
        test.assert(test1.addEventListener, "Failed to inject addEventListener into class");
        test.assert(test1.removeEventListener, "Failed to inject removeEventListener into class");
        test.assert(test1.dispatchEvent, "Failed to inject dispatchEvent into class");
    },


    // ==========================================================================
    // 
    // Test basic DOMEventMixin.addEventListener
    //
    addEventListener: function (test) {
        test.start("DOMEventMixin.addEventListener tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Define class into which we'll mix DOMEventMixin and create an instance of it
            WinJS.Namespace.define("Tests.DOMEventMixin", {
                TestClass2: WinJS.Class.define(function () {

                    // DOMEventMixin works on DOM elements, so add one.
                    this.element = testHarness.addTestDiv("test1")[0];
                })
            });

            WinJS.Class.mix(Tests.DOMEventMixin.TestClass2, WinJS.UI.DOMEventMixin);
            var test1 = new Tests.DOMEventMixin.TestClass2();
            // Define the callback function that we'll listen for
            var onTest = function () {
                onTestComplete(test);
            }

            // Add the event listener and fire the event.
            test1.addEventListener("testEvent", onTest);
            test1.dispatchEvent("testEvent");
        });
    },


    // ==========================================================================
    // 
    // Test DOMEventMixin.removeEventListener
    //
    removeEventListener: function (test) {
        test.start("DOMEventMixin.removeEventListener tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Define class into which we'll mix DOMEventMixin and create an instance of it
            WinJS.Namespace.define("Tests.DOMEventMixin", {
                TestClass3: WinJS.Class.define(function () {

                    // DOMEventMixin works on DOM elements, so add one.
                    this.element = testHarness.addTestDiv("test1")[0];
                })
            });

            WinJS.Class.mix(Tests.DOMEventMixin.TestClass3, WinJS.UI.DOMEventMixin);
            var test1 = new Tests.DOMEventMixin.TestClass3();
            // Define the callback function that we'll listen for
            var num = 0;
            var onTest = function () {

                test.assert(num == 0, "failed to remove event listener");
                num++;

                // First event fired; now remove the event listener and ensure we don't catch it
                test1.removeEventListener("testEvent", onTest);
                setTimeout(function () {
                    onTestComplete(test);
                }, 200);
                test1.dispatchEvent("testEvent");
            }

            // Add the event listener and fire the event.
            test1.addEventListener("testEvent", onTest);
            test1.dispatchEvent("testEvent");
        });
    },


    // ==========================================================================
    // 
    // Test DOMEventMixin.dispatchEvent
    //
    dispatchEvent: function (test) {
        test.start("DOMEventMixin.dispatchEvent tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Define class into which we'll mix DOMEventMixin and create an instance of it
            WinJS.Namespace.define("Tests.DOMEventMixin", {
                TestClass4: WinJS.Class.define(function () {

                    // DOMEventMixin works on DOM elements, so add one.
                    this.element = testHarness.addTestDiv("test1")[0];
                })
            });

            WinJS.Class.mix(Tests.DOMEventMixin.TestClass4, WinJS.UI.DOMEventMixin);
            var test1 = new Tests.DOMEventMixin.TestClass4();
            // Define the callback function that we'll listen for
            var num = 0;
            var onTest = function () {

                // Event was dispatched
                onTestComplete(test);
            }

            // Add the event listener and fire the event.
            test1.addEventListener("testEvent", onTest);
            test1.dispatchEvent("testEvent");
        });
    }

});
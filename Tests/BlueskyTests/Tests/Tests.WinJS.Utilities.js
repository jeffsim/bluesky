"use strict";

// ================================================================
//
// Test.WinJS.Utilities.js
//		Tests for the top-level WinJSUtilities object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Utilities Tests", {

    // ==========================================================================
    // 
    // Test WinJS.Utilities.ready functionality
    //
    ready: function (test) {

        test.start("WinJS.Utilities.ready tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Test Promise and callback
            var promiseFulfilled = false;
            var functionCalled = false;

            WinJS.Utilities.ready(function () {

                // Mark that the function was called by the ready function
                functionCalled = true;

            }).then(function () {

                // Mark that the promise was fulfilled by the ready function
                promiseFulfilled = true;
            });

            WinJS.Promise.timeout(100).then(function () {
                test.assert(promiseFulfilled, "Failed to fulfill ready promise");
                test.assert(functionCalled, "Failed to call ready function");
                onTestComplete(test);
            });

            test.nyi("Test async parameter (functionality nyi)");
        });
    },

    // ==========================================================================
    // 
    // Test WinJS.Utilities.markSupportedForProcessing functionality
    //
    markSupportedForProcessing: function (test) {

        test.start("WinJS.Utilities.markSupportedForProcessing tests");

        var handler = function () {
        };

        var element = WinJS.Utilities.markSupportedForProcessing(handler);
        test.assert(handler._supportedForProcessing, "eventHandler did not assign supportedForProcessing");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.addClass functionality
    //
    addClass: function (test) {

        test.start("WinJS.Utilities.addClass tests");

        var $testDiv = testHarness.addTestDiv("test1");
        var element = WinJS.Utilities.addClass($testDiv[0], "testClass");
        test.assert($testDiv.hasClass("testClass"), "Failed to add class");
        test.assert(element == $testDiv[0], "Failed to return element");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.hasClass functionality
    //
    hasClass: function (test) {

        test.start("WinJS.Utilities.hasClass tests");

        var $testDiv = testHarness.addTestDiv("test1");
        WinJS.Utilities.addClass($testDiv[0], "testClass");
        test.assert($testDiv.hasClass("testClass"), "Failed to verify has class");
        test.assert(!$testDiv.hasClass("testClass1"), "Failed to verify (false) has class");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.removeClass functionality
    //
    removeClass: function (test) {

        test.start("WinJS.Utilities.removeClass tests");

        var $testDiv = testHarness.addTestDiv("test1");
        WinJS.Utilities.addClass($testDiv[0], "testClass");
        test.assert($testDiv.hasClass("testClass"), "Failed to add class");
        var element = WinJS.Utilities.removeClass($testDiv[0], "testClass");

        test.assert(element == $testDiv[0], "Failed to return element");
        test.assert(!$testDiv.hasClass("testClass"), "Failed to remove class");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.removeClass toggleClass
    //
    toggleClass: function (test) {

        test.start("WinJS.Utilities.toggleClass tests");

        var $testDiv = testHarness.addTestDiv("test1");
        WinJS.Utilities.toggleClass($testDiv[0], "testClass");
        test.assert($testDiv.hasClass("testClass"), "Failed to toggle-on class");
        WinJS.Utilities.toggleClass($testDiv[0], "testClass");
        test.assert(!$testDiv.hasClass("testClass"), "Failed to toggle-off class");
        WinJS.Utilities.toggleClass($testDiv[0], "testClass");
        test.assert($testDiv.hasClass("testClass"), "Failed to re-toggle-on class");
        WinJS.Utilities.toggleClass($testDiv[0], "testClass");
        test.assert(!$testDiv.hasClass("testClass"), "Failed to re-toggle-off class");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.empty functionality
    //
    empty: function (test) {

        test.start("WinJS.Utilities.empty tests");

        var $testDiv = testHarness.addTestElement("<div id='test1'><div id='child1'>Hello</div><div id='child2'>World<div id='child3'>Bar</div></div>Foo</div>");
        var element = WinJS.Utilities.empty($testDiv[0]);
        test.assert(element == $testDiv[0], "Failed to return element");
        test.assert($testDiv.text() == "", "Failed to empty class");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.query functionality
    //
    query: function (test) {

        test.start("WinJS.Utilities.query tests");

        var testDiv = testHarness.addTestElement(
							"<div id='test1'>' " +
								"<div id='child1'>Hello</div>" +
								"<div id='child2'>World" +
									"<div class='t1' id='child3'>Bar</div>" +
									"<div class='t1' id='child4'>Bar2</div>" +
									"<div class='t1' id='child5'>Bar2</div>" +
								"</div>" +
								"Foo" +
							"</div>")[0];

        // NOTE: Look in Tests.Utilities.QueryCollection.js for more comprehensive QueryCollection result checks

        // NOTE: Can't test without rootElement since that returns all of the page's divs.  Have to take it on
        // faith that that works (at least until there's an out-of-browser test manager).
        var qc = WinJS.Utilities.query("div", testDiv);
        test.assert(qc.length == 5, "Failed to query divs");
        qc = WinJS.Utilities.query(".t1", $("#child2", $(testDiv))[0]);
        test.assert(qc.length == 3, "Failed to query by class from child");
    },



    // ==========================================================================
    // 
    // Test WinJS.Utilities.createEventProperties functionality
    //
    createEventProperties: function (test) {

        test.start("WinJS.Utilities.createEventProperties tests");
        var Person = WinJS.Class.define(
            function () {
                this.name = "Harry";
                this.color = "blue";
            });
        WinJS.Class.mix(Person, WinJS.Utilities.createEventProperties("change", "rename"));
        var myPerson = new Person();
        var hasOnChange = false;
        var hasOnRename = false;
        var hasName = false;
        var hasColor = false;
        for (var prop in myPerson) {
            hasOnChange |= prop == "onchange";
            hasOnRename |= prop == "onrename";
            hasName |= prop == "name";
            hasColor |= prop == "color";
        }
        test.assert(hasOnChange, "does not have onchange");
        test.assert(hasOnRename, "does not have onrename");
        test.assert(hasName, "does not have name");
        test.assert(hasColor, "does not have color");
    },


    // ==========================================================================
    // 
    // Test WinJS.Utilities.eventMixin functionality
    //
    eventMixin: function (test) {

        test.start("WinJS.Utilities.eventMixin tests");
        return test.doAsync(function (onTestComplete) {

            var Person = WinJS.Class.define(
                function () {
                    this.name = "Harry";
                    this.color = "blue";
                });
            WinJS.Class.mix(Person, WinJS.Utilities.eventMixin);
            WinJS.Class.mix(Person, WinJS.Utilities.createEventProperties("change", "rename"));
            var myPerson = new Person();
            myPerson.onchange = function (eventData) {
                test.assert(eventData.detail.hello == "world", "Event data not valid");
                onTestComplete(test);
            };
            myPerson.dispatchEvent("change", { "hello": "world" });
        });
    }
});
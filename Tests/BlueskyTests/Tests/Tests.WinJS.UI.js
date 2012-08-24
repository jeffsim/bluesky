"use strict";

// ================================================================
//
// Test.WinJS.UI.js
//		Tests for the top-level WinJS.UI object
//
//	TESTS TO ADD:
//		WinJS.UI.processAll test

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI Tests", {

	// ==========================================================================
	// 
	// Test WinJS.UI.setOptions functionality
	//
	uiSetOptions: function (test) {

		test.start("WinJS.UI.setOptions tests");

		// Prep the test frame.
		var $testDiv = testHarness.addTestDiv("test");

		// Define a new control in our local namespace
		WinJS.Namespace.define("TestHarness.uiSetOptions", {
			TestControl: WinJS.Class.define(function (element, options) { }, {})
		});
		var testControl = new TestHarness.uiSetOptions.TestControl($testDiv[0]);

		// Test setting regular options
		WinJS.UI.setOptions(testControl, { option1: 'Hello', option2: 'World' });
		test.assert(testControl.option1 == "Hello" && testControl.option2 == "World", "Failed to set options");

		// Test setting "on" functions without addEventListener
		var testVal1 = 0, testVal2 = 0;
		var testFunc2 = function () { testVal2 = 2; };

		// Since our control does not support addEventListener, these gets added as members that are called normally
		// TODO: Refactor this test using the custom control with addEventListener that I implemented in some other test
		WinJS.UI.setOptions(testControl, {
			onfoo: function () { testVal1 = 1; },
			onBar: testFunc2
		});

		// Call the functions
		testControl.onfoo();
		testControl.onBar();
		test.assert(testVal1 == 1 && testVal2 == 2, "Failed to set non-event 'on' functions in setOptions");

		test.nyi("setOptions with declarative string (ala Rating control in html)");
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.setOptions' onEvent handling
	//
	uiSetOptionsOnEvent: function (test) {

		test.start("WinJS.UI.setOptions onEvent tests");

		// Create a test control with addEventListener support
		var TestControl = function () {
			return {
				addEventListener: function (name, listener) {
					if (!this.listeners[name])
						this.listeners[name] = [];
					this.listeners[name].push(listener);
				},
				raiseEvent: function (name) {
					if (this.listeners[name]) {
						this.listeners[name].forEach(function (listener) {
							listener();
						});
					}
				},
				listeners: []
			};
		};

		var testVal1 = 0, testVal2 = 0;
		var testFunc2 = function () { testVal2 = 2; };

		var testControl = new TestControl();

		// Create a new eventListener
		WinJS.UI.setOptions(testControl, {
			oniteminvoked: function () {
				testVal1 = 1;
			},
			// since HtmlControl does not support addEventListener, this gets added as a member that is called normally
			onfoo: testFunc2
		});

		// Trigger the events
		testControl.raiseEvent("iteminvoked");
		testControl.raiseEvent("foo");
		test.assert(testVal1 == 1 && testVal2 == 2, "Failed to set event handlers in setOptions");
	},


    // ==========================================================================
    // 
    // Test WinJS.UI.eventHandler functionality
    //
	eventHandler: function (test) {

	    test.start("WinJS.UI.eventHandler tests");

	    var handler = function () {
	    };

	    WinJS.UI.eventHandler(handler);

	    test.assert(handler._supportedForProcessing, "eventHandler did not assign supportedForProcessing");
	},


    // ==========================================================================
    // 
    // Test WinJS.UI.scopedSelect functionality
    //
	scopedSelect: function (test) {

	    test.start("WinJS.UI.scopedSelect tests");

	    var element = WinJS.UI.scopedSelect(".testFrame");
	    test.assert(element == $(".testFrame")[0], "scopedSelect returned incorrect element");
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.process functionality
	//
	processTests: function (test) {

		test.start("WinJS.UI.process tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Define a new control in our local namespace and create an instance of it
			WinJS.Namespace.define("TestHarness.processTests", {
				TestControl: WinJS.Class.define(function (element, options) {
				}, {
					testVal: 50,
				})
			});

			// Add a test element that we can process
			var testDiv = testHarness.addTestElement('<div id="testDiv" data-win-control="TestHarness.processTests.TestControl">Hello World</div>')[0];

			// process the element
			WinJS.UI.process(testDiv);

			// Validate that the DOM element now has a control associated with it of the type we created above
			test.assert(testDiv.winControl.testVal == 50, "Failed to associate winControl with DOM element");

			onTestComplete(test);
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.process with data-win-options specified
	//
	processWithOptionsTests: function (test) {

		test.start("WinJS.UI.process tests with data-win-options");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Define a new control in our local namespace and create an instance of it
			WinJS.Namespace.define("TestHarness.processWithOptionsTests", {
				TestControl: WinJS.Class.define(function (element, options) {
					this.testVal = options.option1;
					this.testVal2 = options.option2;
					this.element = element;
				}, {
					testVal: 50,
					testVal2: "Foo",
					change: function () {
						$(this.element).text("Happy now");
					}
				})
			});

			// Add a test element that we can process
			var testDiv = testHarness.addTestElement('<div id="testDiv" data-win-control="TestHarness.processWithOptionsTests.TestControl" data-win-options="{option1: 100, option2: \'Bar\'}">Hello World</div>')[0];

			// process the element
			WinJS.UI.process(testDiv);

			// Validate that the DOM element now has a control associated with it of the type we created above, and that its options were set correctly
			var winControl = testDiv.winControl;
			test.assert(winControl, "Failed to associate winControl with DOM element");
			test.assert(winControl.testVal == 100 && winControl.testVal2 == "Bar", "Failed to set winOptions on DOM element");

			// Test a function call on the DOM element's control
			winControl.change();
			test.assert($(testDiv).text() == "Happy now", "Failed to associate winControl with DOM element");

			onTestComplete(test);
		});
	},


	// ==========================================================================
	// 
	// Test WinJS.UI.processAll functionality
	//
	processAllTests: function (test) {

		test.start("WinJS.UI.processAll tests");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Define a new control in our local namespace and create an instance of it
			WinJS.Namespace.define("TestHarness.processAllTests", {
				TestControl1: WinJS.Class.define(function (element, options) {
					this.testVal = options.option1;
				}, {
					testVal: 50,
				})
			});

			// Define a new control in our local namespace and create an instance of it
			WinJS.Namespace.define("TestHarness.processAllTests", {
				TestControl2: WinJS.Class.define(function (element, options) {
					this.testVal2 = options.option2;
				}, {
					testVal2: 150,
				})
			});

			// Add a test element with multiple controls in it that we can process
			var $testDiv = testHarness.addTestElement('<div id="testDiv"><div id="control1" data-win-control="TestHarness.processAllTests.TestControl1" ' +
														'data-win-options="{option1: 200}">Hello</div><div id="control2" data-win-control="' +
														'TestHarness.processAllTests.TestControl2" data-win-options="{option2: 100}">World</div>');

			// Process all of the elements in the test div
			WinJS.UI.processAll($testDiv[0]);

			// Validate that the DOM element now has controls associated with it of the types that we created above
			var control1WinControl = $("#control1", $testDiv)[0].winControl;
			var control2WinControl = $("#control2", $testDiv)[0].winControl;
			
			test.assert(control1WinControl.testVal == 200, "Failed to associate first winControl with DOM element");
			test.assert(control2WinControl.testVal2 == 100, "Failed to associate second winControl with DOM element");

			onTestComplete(test);
		});
	}
});
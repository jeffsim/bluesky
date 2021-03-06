﻿"use strict";

// ================================================================
//
// Test.BlueskyUtils.js
//		Tests for the Bluesky Utilities
//
//	TESTS TO ADD:
//		blueskyUtils.ensureDatasetReady tests
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("BlueskyUtils Tests", {

	// ==========================================================================
	// 
	// Test convertDeclarativeDataStringToJavascriptObject functionality
	//
	dataStringToJSONTests: function (test) {

	    test.start("dataStringToJSON tests");

        // No blueskyUtils on Win8.
		if (!WinJS.Application.IsBluesky)
		    return test.skip("No blueskyUtils on Win8");

		// Test simple conversion
		var testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: firstName");
		test.assert(testVar.innerText == "firstName", "Failed to perform simple conversion");
		
		// Test multiple targets
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: firstName; marginLeft: left; foo: bar");
		test.assert(testVar.innerText == "firstName" && testVar.marginLeft == "left" && testVar.foo == "bar", "Failed to handle multiple targets");

		// Test two-compound sources
		var testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: person.firstName");
		test.assert(testVar.innerText == "person.firstName", "Failed to support two compound sources");

		// Test three-compound sources
		var testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: company.person.firstName");
		test.assert(testVar.innerText == "company.person.firstName", "Failed to support three compound sources");

		// Test two-compound targets.  Note that compound targets are purposefully not decomposed down into individual parts; e.g. 
		// the following won't generate "testVar.style.backgroundColor"
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: firstName; style.backgroundColor: backColor");
		test.assert(testVar.innerText == "firstName" &&
					testVar["style.backgroundColor"] == "backColor", "Failed to perform two compound conversions");

		// Test three-compound targets
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: firstName; style.backgroundColor: backColor; style.color: color");
		test.assert(testVar.innerText == "firstName" &&
					testVar["style.backgroundColor"] == "backColor" &&
					testVar["style.color"] == "color", "Failed to perform three compound conversions");

		// Test excess whitespace
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("  innerText:  firstName		;  marginLeft:  left");
		test.assert(testVar.innerText == "firstName" &&
					testVar.marginLeft == "left", "Failed to handle excess spaces");


	    // Test converter assignment
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("innerText: firstName converter1; marginLeft: left  converter2 ");
		test.assert(testVar.innerText == "firstName converter1" &&
					testVar.marginLeft == "left  converter2", "Failed to handle converters");

		// The following tests test direct assignment (vs the above, which are binding-focused)

		// Test string arrays
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("tooltipStrings: ['Horrible', 'Poor', 'Fair', 'Good', 'Excellent']");
		test.assert(testVar.tooltipStrings == "['Horrible', 'Poor', 'Fair', 'Good', 'Excellent']", "Failed to handle string arrays");

		// Test numbers
		testVar = blueskyUtils.convertDeclarativeDataStringToJavascriptObject("value:100, value2:200, value3:9.9");
		test.assert(testVar.value == 100 &&testVar.value2 == 200 && testVar.value3 == 9.9, "Failed to convert numbers");

		// TODO: Test special chars (e.g. double quotes in strings, semicolons, etc)
	},


    // ==========================================================================
    // 
    // Test MSApp.execUnsafeLocalFunction functionality
    //
    //      TODO (CLEANUP): Move this to dedicated test file for MSApp
    //
	execUnsafeLocalFunction: function (test) {

	    test.start("MSApp.execUnsafeLocalFunction tests");
	    var c;
	    var f = function () {
	        c = 40;
	        return 41;
	    }
	    var res = MSApp.execUnsafeLocalFunction(f);
	    test.assert(c == 40, "function was not called");
	    test.assert(res == 41, "function did not return value");
	},
});
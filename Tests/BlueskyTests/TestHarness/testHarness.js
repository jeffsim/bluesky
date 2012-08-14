"use strict";

// ================================================================
//
// testHarness.js
//		Defines the test harness's main functionality.
//
//	TODOs
//		Starting a new test run does not cancel the previous run if it's still going
//		Cookie'd checkboxes in options aren't initializing properly

var testHarness = {

    // ==========================================================================
    // 
    // public function: initialize
    //		Initializes the test harness and prepares it to run tests.
    //
    initialize: function () {

        // Start by populating the list of runnable test files.  All available testfiles should
        // have added themselves to testHarness.testFiles by the time we get here.
        var $testFileDropdown = $("#testFileDropdown");
        $testFileDropdown.append("<option value='all' selected='selected'>All tests</option>");
        for (var i = 0; i < this.testFiles.length; i++) {
            $testFileDropdown.append("<option value='" + i + "'>" + this.testFiles[i].description + "</option>");
        }

        // If the user changes the test file to run dropdown, then populate the tests to run dropdown
        $testFileDropdown.change(function () {
            testHarness._populateTestDropdown();
        });

        // Initialize the options UI
        this._initializeOptionsAndOptionsUI();

        // Select all test files
        testHarness._setTestFile('all');

        // Handle start test button click
        $("#startTests").click(function () {

            // Get the set of tests to run
            var testsToRun = [];
            var testFilesToRun = [];
            var $testDropdown = $("#testDropdown");
            var selectedTestIndex = $testDropdown.val();
            var selectedTestFileIndex = $testFileDropdown.val();
            if (selectedTestIndex != 'all') {
                // The user selected a specific test; run only it
                testFilesToRun.push({
                    description: testHarness.testFiles[selectedTestFileIndex].description,
                    tests: { test: testHarness.testFiles[selectedTestFileIndex].tests[selectedTestIndex] }
                });
            } else {
                // user wants to run all tests in the selected test file (or all files if no file selected)
                if (selectedTestFileIndex == 'all')
                    testFilesToRun = testHarness.testFiles;
                else
                    testFilesToRun.push(testHarness.testFiles[selectedTestFileIndex]);
            }

            // Clear out test results from previous runs (if any)
            testHarness.numTestsStarted = 0;
            testHarness.numTestsCompleted = 0;
            testHarness.numTestsPassed = 0;
            testHarness.numTestsFailed = 0;
            $(".finalResults").hide();

            // Prep the test result area
            $(".testResults").empty();
            $(".numAsserts").show();

            testHarness.assertsChecked = 0;

            // Start running tests
            testHarness._startNewTestFile(testFilesToRun[0]);
            testHarness._runTestsInTestFiles(testFilesToRun, 0, 0);
        });
    },

    $testFileResult: null,

    // ==========================================================================
    // 
    // private function: _startNewTestFile
    //		Outputs a new header for a new test file to the test results pane
    //
    _startNewTestFile: function (testFile) {

        testHarness.$testFileResult = $("<div class='collapsible testsResult'></div>");
        testHarness.$testFileResult.prepend("<div class='TestFilesTitle'>Running: " + testFile.description + "</div>");
        $(".testResults").append(testHarness.$testFileResult);
    },


    // ==========================================================================
    // 
    // private function: _runTestsInTestFiles
    //		Sequentially run all tests in testFilesToRun
    //
    //		Note: I really wanted to do this with WinJS.Promise, but the sequential-asynchronous-actions pattern
    //		is a new one to me, and I couldn't quite make it work.  Revisit this later
    //
    _runTestsInTestFiles: function (testFilesToRun, testFileIndex, testIndex) {

        var testFileToRun = testFilesToRun[testFileIndex];
        var testToRun = testFileToRun.tests[Object.keys(testFileToRun.tests)[testIndex]];

        // Clear out the test space before the test runs
        testHarness.clearTestSpace();

        var testObj = new Test();

        testHarness.numTestsStarted++;

        // Run the test
        try {
            var testPromise = testToRun(testObj);
        } catch (ex) {
            // exception occurred in test

            // does user want exceptions to get thrown?  this gives access to stack etc
            if (testHarness.allowExceptions == true)
                throw ex;

            // mark as failure
            testObj.assert(false, "Exception occurred: " + ex.message);
        }

        if (testPromise) {
            // test is running asynchronously and hasn't completed yet; it returned a promise that it would eventually
            // complete.  When that promise is completed, then log the result

            // give the test 2 seconds to run and then cancel it
            var cancelTimer = setTimeout(function () {

                // Test took too long - cancel it and go on to the next one
                testObj.cancel();

                // run next test
                testHarness._logResultAndRunNextTest(testObj, testFilesToRun, testFileIndex, testIndex);

            }, testObj.timeoutLength);

            testPromise.then(function (test) {

                if (test.cancelled || test.skipped)
                    return;

                clearTimeout(cancelTimer);

                // run next test
                testHarness._logResultAndRunNextTest(test, testFilesToRun, testFileIndex, testIndex);
            });

        } else {

            // The test ran synchronously and immediately returned; log the result now.
            testHarness._logResultAndRunNextTest(testObj, testFilesToRun, testFileIndex, testIndex);
        }
    },


    // ==========================================================================
    // 
    // private function: _logResultAndRunNextTest
    //		Logs the test results captured in testObj, and then determines which test to run
    //		next.  This is a little wonky due to the need to serialize potentially asynchronous tests...
    // 
    _logResultAndRunNextTest: function (testObj, testFilesToRun, testFileIndex, testIndex) {

        // Log the result
        testHarness._logTestResult(testObj);

        var testFileToRun = testFilesToRun[testFileIndex];

        // Step to the next test
        testIndex++;

        // Are we at the end of the tests in the current test file?
        if (testIndex >= Object.keys(testFileToRun.tests).length) {

            // We finished the last test in the current test file; step to the next test file
            testFileIndex++;

            // Are we at the end of the list of test files?
            if (testFileIndex > testFilesToRun.length - 1) {

                // We're Done with all tests in all test files
                testHarness._updateFinalResults();
                return;

            } else {

                // More test files to go; step to the next one
                testIndex = 0;
                testHarness._startNewTestFile(testFilesToRun[testFileIndex]);
            }
        }

        // Run the next test in the series.
        testHarness._runTestsInTestFiles(testFilesToRun, testFileIndex, testIndex);
    },


    // ==========================================================================
    // 
    // private function: _initializeOptionsAndOptionsUI
    //		Initialize options and the options UI 
    // 
    _initializeOptionsAndOptionsUI: function () {

        // Set up the options UI button handlers
        $(".optionsButton").click(function () {
            $(".optionsFrame").show();
        });
        $(".optionsCloseButton").click(function () {
            $(".optionsFrame").hide();
        });

        // Initialize the allowExceptions checkbox.
        testHarness.allowExceptions = $.cookie("allowExceptions") == "true" ? true : false;
        if (testHarness.allowExceptions)
            $('#allowExceptions').attr('checked');

        $('#allowExceptions').change(function () {
            testHarness.allowExceptions = $('#allowExceptions').attr('checked') == 'checked';
            $.cookie("allowExceptions", testHarness.allowExceptions);
        });

        // Initialize the showNYI checkbot
        testHarness.showNYI = $.cookie("showNYI") == "true" ? true : false;
        if (testHarness.showNYI)
            $('#showNYI').attr('checked');

        $('#showNYI').change(function () {
            testHarness.showNYI = $('#showNYI').attr('checked') == 'checked';
            testHarness.showNYI ? $(".nyiItem").show() : $(".nyiItem").hide();
            $.cookie("showNYI", testHarness.showNYI);
        });
    },


    // ==========================================================================
    // 
    // private function: _updateFinalResults
    //		Update final results display.
    // 
    _updateFinalResults: function () {

        // TODO: If run tests < total tests to run, then at least one did not finish.  Need to report those out...
        var $finalResults = $(".finalResults");
        var results = testHarness.numTestsStarted + " tests run; " + testHarness.numTestsPassed + " passed, " + testHarness.numTestsFailed + " failed";
        $finalResults.html(results).show();
        if (testHarness.numTestsFailed > 0)
            $finalResults.css("backgroundColor", "Red");
        else
            $finalResults.css("backgroundColor", "Green");
    },


    // ==========================================================================
    // 
    // private function: _logTestResult
    //		Logs the results of a test, captured in the passed-in testObj.
    // 
    _logTestResult: function (testObj) {

        if (testObj.skipped) {

            // Test was skipped
            testHarness.$testFileResult.append("<div class='testResult testSkipped'>" + testObj.name + ": Skipped</div>");
            if (testObj.skipMessage)
                testHarness.$testFileResult.append("<div class='testResult skipMessage'>Reason: " + testObj.skipMessage + "</div>");

            // Skipped tests count as passed
            testHarness.numTestsPassed++;

        } else if (testObj.cancelled) {

                // Test was cancelled
            testHarness.$testFileResult.append("<div class='testResult testIncomplete'>" + testObj.name + ": Did not complete</div>");

            // Track the number of tests that have failed
            testHarness.numTestsFailed++;

        } else if (testObj.issues.length == 0) {

                // There were no issues with the test; it passed.
            testHarness.$testFileResult.append("<div class='testResult testPassed'>" + testObj.name + ": Passed</div>");

            // Track the number of tests that have passed
            testHarness.numTestsPassed++;

        } else {

            // Issues were reported with the test; add them to result view
            testHarness.$testFileResult.append("<div class='testResult testFailed'>" + testObj.name + ": Failed</div>");
            testObj.issues.forEach(function (testIssue) {
                testHarness.$testFileResult.append("<div class='testIssue'>Error: " + testIssue.errorMessage + "</div>");
            });

            // Track the number of tests that have failed
            testHarness.numTestsFailed++;
        }

        // If caller specified a resultNote then output it here.
        if (testObj.resultNote)
            testHarness.$testFileResult.append("<div class='testResult testNote'>" + testObj.resultNote + "</div>");

        // If test specified any NYI items then add them here
        testObj.nyiItems.forEach(function (nyi) {
            testHarness.$testFileResult.append("<div class='testResult nyiItem'>NYI: " + nyi + "</div>");
        });

        // Hide NYI items if user doesn't want to see them.
        // TODO: Is it possible (and not discouraged) to change the actual attributes of the .nyiItem css class (rather than the DOM elements
        // with that class)?  If so, then the preferable approach here would be to tweak the display attriute on the class.
        if (!testHarness.showNYI)
            $(".nyiItem").hide();


        // Track the total number of tests that have completed
        testHarness.numTestsCompleted++;
    },


    // ==========================================================================
    // 
    // public function: clearTestSpace
    //		Removes all controls from the test working space
    // 
    clearTestSpace: function () {
        $(".testFrame").empty();
    },


    // ==========================================================================
    // 
    // public function: addTestFiles
    //		Adds the specified set of tests to our list of runnable tests
    // 
    addTestFile: function (testFileDescription, tests) {

        this.testFiles.push({ description: testFileDescription, tests: tests });
    },


    // ==========================================================================
    // 
    // public function: addTestElement
    //		Test helper function - adds the specified element to the test space
    // 
    addTestElement: function (elementText) {
        var $testElement = $(elementText);
        $(".testFrame").append($testElement);
        return $testElement;
    },


    // ==========================================================================
    // 
    // public function: addTestDiv
    //		Test helper function - adds an empty div to the working space with the specified id
    // 
    addTestDiv: function (divId) {

        var $testDiv = $("<div id='" + divId + "'></div>");
        $(".testFrame").append($testDiv);
        return $testDiv;
    },


    // ==========================================================================
    // 
    // private function: _setTestFile
    //		Selects the test file with the specified index
    // 
    _setTestFile: function (testFileIndex) {

        $("#testFileDropdown").val(testFileIndex).trigger('change');
    },


    // ==========================================================================
    // 
    // private function: _setTest
    //		Selects the test with the specified name
    // 
    _setTest: function (testName) {
        $("#testDropdown").val(testName);
    },


    // ==========================================================================
    // 
    // private function: _populateTestDropdown
    //		Populates the Tests dropdown with the tests in the currently selected testfile
    // 
    _populateTestDropdown: function () {

        // Add the 'all tests' option
        var $testDropdown = $("#testDropdown");
        $testDropdown.empty();
        $testDropdown.append("<option value='all' selected='selected'>All tests</option>");

        var selectedTestFileIndex = $("#testFileDropdown").val();
        if (selectedTestFileIndex == 'all') {
            // user selected all test files; don't add any
        } else {
            // user selected one test file
            var testFile = testHarness.testFiles[selectedTestFileIndex];
            var i = 0;
            for (var test in testFile.tests) {
                $testDropdown.append("<option value='" + test + "'>" + test + "</option>");
            }
        }
    },


    // ==========================================================================
    // 
    // public function: simulateMouseEvent
    //
    //		Simulates a mouse event
    //      Adapted from: http://stackoverflow.com/questions/6157929/how-to-simulate-mouse-click-using-javascript
    //
    simulateMouseEvent: function (target, options) {

        var event = document.createEvent('MouseEvents');
        var options = options || {};

        var opts = {
            type: options.type || 'click',
            canBubble: options.canBubble || true,
            cancelable: options.cancelable || true,
            view: options.view || document.defaultView,
            detail: options.detail || 1,
            screenX: options.screenX || 0, //The coordinates within the entire page
            screenY: options.screenY || 0,
            clientX: options.clientX || 0, //The coordinates within the viewport
            clientY: options.clientY || 0,
            ctrlKey: options.ctrlKey || false,
            altKey: options.altKey || false,
            shiftKey: options.shiftKey || false,
            metaKey: options.metaKey || false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
            button: options.button || 0, //0 = left, 1 = middle, 2 = right
            relatedTarget: options.relatedTarget || null,
        }

        // Pass in the options
        event.initMouseEvent(opts.type, opts.canBubble, opts.cancelable, opts.view, opts.detail, opts.screenX, opts.screenY,
                             opts.clientX, opts.clientY, opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, opts.button, opts.relatedTarget);

        // Fire the event
        target.dispatchEvent(event);
    },


    // ==========================================================================
    //
    // Variables
    // 

    // testFiles: The list of all test files.  An array of {description, tests}.
    // Each test file that is included is expected to push themselves into this list
    testFiles: [],

    // Test results - Number of tests run, number of tests that passed, and number of tests that failed
    numTestsStarted: 0,
    numTestsCompleted: 0,
    numTestsPassed: 0,
    numTestsFailed: 0,

    // maxTestTime: Maximum time (in milliseconds) to let the tests run before cancelling.
    maxTestTime: 2000,

    // allowExceptions: if true, then exceptions that occur in tests are rethrown, allowing the user to get more info in the console.
    allowExceptions: false,

    // showNYI: If true, then not yet implemented items in test results are shown
    showNYI: false,

    // assertsChecked: Total number of asserts checked during a test run
    assertsChecked: 0
};


// ================================================================
//
// function Test()
//		Generates a new Test object that can be passed to an individual test, which should
//		use it to communicate back to the test harness.
//
function Test() {

    return {
        // ==========================================================================
        // 
        // public function: start
        //		Starts a new test
        // 
        start: function (testName) {

            this.name = testName;
        },


        // ==========================================================================
        // 
        // public function: assert
        //		Asserts that the specified condition is true; if not, then the specified error message is added
        //		to the list of issues reported with the current test
        // 
        assert: function (condition, errorMessage) {
            if (!condition) {
                this.issues.push({ condition: condition, errorMessage: errorMessage });
            }

            // Display the total number of asserts that have been checked this run
            testHarness.assertsChecked++;
            $(".numAsserts").text(testHarness.assertsChecked + " checks");
        },


        // ==========================================================================
        // 
        // public function: cancel
        //		Cancels a test.
        // 
        cancel: function () {

            // TODO: Ideally we cancel the itemPromise as well, but promise.cancel() is NYI
            this.cancelled = true;
        },


        // ==========================================================================
        // 
        // public function: doAsync
        //		Create a promise that an asynchronous test can use
        // 
        doAsync: function (testFunc) {

            var testPromise = new WinJS.Promise(testFunc);
            testPromise.test = this;

            return testPromise;
        },


        // ==========================================================================
        // 
        // public function: nyi
        //		A Test can use this function to keep a list of NYI tests.  Display of these NYI lines can be toggled in the UX
        // 
        nyi: function (message) {
            this.nyiItems.push(message);
        },


        // ==========================================================================
        // 
        // public function: skip
        //		A Test can use this function to skip a test.  Used for example on Win8 to skip tests that are unrunnable on Win8
        // 
        skip: function (message) {
            this.skipped = true;
            this.skipMessage = message;
        },


        // ==========================================================================
        //
        // Variables
        // 

        // The list of NYI items with the test
        nyiItems: [],

        // The list of reported issues with the test
        issues: [],

        // The name of the test
        name: null,

        // Test can set this if it wants to put any explanatory text into the result pane
        resultNote: null,

        // set to true if this test was cancelled
        cancelled: false,

        // Asynchronous tests can override this if they need to run longer than this
        timeoutLength: 1000,

        // Set to true if this test was skipped
        skipped: false,

        // If the test was skipped, then this contains an (optional) message set by the test explaining why the test was skipped
        skipMessage: null,
    };
}


// ==========================================================================
//
// $(document).ready: Function to call when the document is done loading and ready to go.
//
$(document).ready(function () {

    // Initialize the test harness once everything's loaded
    testHarness.initialize();

    // In normal times, we just return at this point.  However, for times when you're trying to get one particular test (or test file)
    // to work, you can specify specific test files (e.g. all WinJS.Binding tests) or one specific test (e.g. simpleBinding).

    // TODO: Cookie these values.

    // To select a particular test file, call _setTestFile with the index of the testFile in the test files dropdown, or 'all' for all
    testHarness._setTestFile(10);

    // To select a particular test, call _setTest with the name of the test (as it appears in the 'tests to run' dropdown)
    testHarness._setTest("eventHandlers");

    // Temp: start the tests now to save me from clicking the button
    $("#startTests").click();
});
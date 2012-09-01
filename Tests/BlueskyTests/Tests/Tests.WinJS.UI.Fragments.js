"use strict";

// ================================================================
//
// Test.WinJS.UI.js
//		Tests for the top-level WinJS.UI.Fragments object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.Fragments Tests", {

    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.render functionality
    //
    fragmentRender: function (test) {

        test.start("WinJS.UI.Fragments.render tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment1.html'.toLowerCase();
            WinJS.UI.Fragments.render(testFileName, $testDiv[0]).then(function (loadedFragment) {

                test.assert(loadedFragment.parentNode.className == "testFrame", "Fragment not inserted into DOM in expected location");
                test.assert(loadedFragment.nodeType == loadedFragment.ELEMENT_NODE, "Fragment not of expected type");
                test.assert(loadedFragment == $testDiv[0], "Loaded Fragment is not the test div");

                // Verify that the fragment rendered
                test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                // Verify that we did *not* add the item to the cache.
                test.assert(!WinJS.UI.Fragments._cacheStore[testFileName], "Page was cached, but shouldn't have been");

                // next, test calling render with no element
                return WinJS.UI.Fragments.render(testFileName);

            }).then(function (loadedFragment) {

                // Verify that a document fragment was returned (since there was no element to attach to)
                test.assert(loadedFragment.nodeType == loadedFragment.DOCUMENT_FRAGMENT_NODE, "Fragment not of expected type");
                test.assert(loadedFragment.parentNode == null, "Fragment parented but shouldn't be");
                test.assert(loadedFragment.ownerDocument == document, "Fragment not part of ownerDocument");

                // Verify that the fragment rendered
                test.assert(loadedFragment.textContent.indexOf("Hello") >= 0, "Failed to render fragment");

                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.render with WinControls functionality
    //
    fragmentRenderWithControls: function (test) {

        test.start("WinJS.UI.Fragments.render with WinControls tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Define a new control in our local namespace and create an instance of it
            WinJS.Namespace.define("TestHarness.fragments3", {
                TestControl: WinJS.Class.define(function (element, options) {
                    this.testVal = options.option1;
                }, {
                    testVal: 50,
                })
            });

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment3.html'.toLowerCase();
            WinJS.UI.Fragments.render(testFileName, $testDiv[0]).then(function () {

                // Verify that the fragment rendered
                var testControlDiv = $("#testDiv")[0];
                test.assert(testControlDiv && $testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                // Verify that controls have NOT yet been processed
                test.assert(!testControlDiv.winControl, "Controls in fragment were processed but should not have been yet");

                // Process the UI to gen up the controls
                WinJS.UI.processAll(testControlDiv);

                // Verify that controls HAVE been processed
                var testControl = testControlDiv.winControl;
                test.assert(testControl, "Controls in fragment were not processed by WinJS.UI.processAll");
                if (testControl)
                    test.assert(testControl.testVal = 50, "Control was processed but not initialized");

                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });

            // Just return; there's nothing else to do until the page's ready function is called (above)
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.render with script/css 
    //
    fragmentRenderWithScript: function (test) {

        test.start("Fragments.render with script/css");
        var $head = $("head");

        // When WinJS.UI.Fragments.render (et al) loads a page with styles and scripts, those styles and scripts are moved up into the head and
        // they are NOT unloaded, regardless of caching or clearCache calls.  There's nothing we can do about it; we just need to ensure that the
        // user only does ONE test run (an F5 or app restart will suffice), and skip the test if otherwise
        if ($("script[src$='fragment2.js']", $head).length == 1) {
            test.skip("Due to how WinJS.UI.Fragments handles scripts and styles, the fragmentRenderWithScript can only be run once per session.  Refresh the page/app to remove the script and allow this test to run again.");
            return;
        }

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            test.assert(window.fragmentTestValue === undefined,  "Test not ready: fragmentTestValue incorrect");
            test.assert(window.fragmentTestValue2 === undefined, "Test not ready: fragmentTestValue2 incorrect");
            test.assert(window.fragmentTestValue3 === undefined, "Test not ready: fragmentTestValue3 incorrect");
            test.assert(window.fragmentTestValue4 === undefined, "Test not ready: fragmentTestValue4 incorrect");
            test.assert(window.fragmentTestValue5 === undefined, "Test not ready: fragmentTestValue5 incorrect");
            test.assert(window.fragmentTestValue6 === undefined, "Test not ready: fragmentTestValue6 incorrect");

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment2.html'.toLowerCase();
            WinJS.UI.Fragments.render(testFileName, $testDiv[0]).then(function () {

                // Verify that scripts and css were moved into head and out of the fragment
                test.assert($("script", $testDiv).length == 0, "Scripts were not moved out of fragment");
                test.assert($("link", $testDiv).length == 0, "Styles were not moved out of fragment");

            	// We can't do the following line, because our approach for movingscripts (jQuery) executes them but doesn't
				// actually place them in the HEAD element.
            	//   test.assert($("script[src$='fragment2.js']", $head).length == 1, "Scripts were not moved into head");
                test.assert($("link[href$='fragment2.css']", $head).length == 1, "Styles were not moved into head");

                // Verify that local script was loaded and executed
                test.assert(window.fragmentTestValue3 === 300, "fragmentTestValue3 incorrect");

            	// Verify that doc.ready in local script was run, but DOM-impacting functiosn didn't impact the DOM
                test.assert($("#test3").text() == "Bar", "local script was run, but shouldn't have been");
                test.assert(window.fragmentTestValue2 === 200, "fragmentTestValue2 incorrect");

            	// Verify that external script was loaded and executed
                test.assert(window.fragmentTestValue4 === 400, "fragmentTestValue4 incorrect");

            	// Verify that doc.ready in external script was run, but that DOM-impacting functions didn't impact the DOM
                test.assert(window.fragmentTestValue5 === 500, "fragmentTestValue5 incorrect");
                test.assert($("#test2").text() == "Foo", "external script was run, but shouldn't have been");

                // Verify that local style was applied
                test.assert($("#test2").css("color") == "rgb(255, 0, 0)", "local style was not applied.  " + $("#test2").css("color"));

                // Verify that external style was applied
                test.assert($("#test3").css("color") == "rgb(0, 128, 0)", "external style was not applied.  " + $("#test3").css("color"));
                
            	// Verify that DOM elements in the loaded fragment were added to the global namespace (as WinJS is wont to do)
                test.assert(test2, "DOM element was not added to global namespace");

                // Verify tests are present
                test.assert(window.fragmentTestValue === undefined, "fragmentTestValue incorrect");
                test.assert(window.fragmentTestValue6 === undefined, "fragmentTestValue6 incorrect");
                test.assert(window.fragmentTestValueA === 1, "fragmentTestValueA incorrect.  " + window.fragmentTestValueA);

                // Now run a function that was added in the local script and ensure it's working
                window.fragmentTestFunc1();
                test.assert($("#test3").text() == "123", "local script was not run, but should have been");

                // Now run a function that was added in the external script and ensure it's working
                window.fragmentTestFunc2();
                test.assert($("#test2").text() == "qwer", "external script was not run, but should have been");

                // Cleanup after ourselves
                window.fragmentTestValue = undefined;
                window.fragmentTestValue2 = undefined;
                window.fragmentTestValue3 = undefined;
                window.fragmentTestValue4 = undefined;
                window.fragmentTestValue5 = undefined;
                window.fragmentTestValue6 = undefined;
                window.fragmentTestValueA = undefined;
                
            	// Internal bluesky function to enable removing moving styles and scripts for testing purposes
				if (WinJS.Application.IsBluesky)
					WinJS.UI.Fragments._testSupportRemoveScriptsAndStyles();

                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });

            // Just return; there's nothing else to do until the page's ready function is called (above)
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.renderCopy functionality
    //
    fragmentRenderCopy: function (test) {

        test.start("WinJS.UI.Fragments.renderCopy tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div to hold the page(s) we'll create
            var $testDiv = testHarness.addTestDiv("dataA");

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment1.html'.toLowerCase();
            WinJS.UI.Fragments.renderCopy(testFileName, $testDiv[0]).then(function () {

                // Verify that the fragment rendered
                test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                // Verify that we *did* add the item to the cache.
                test.assert(WinJS.UI.Fragments._cacheStore[testFileName], "Page was not cached, but should have been");

                // next, test calling render with no element
                return WinJS.UI.Fragments.renderCopy(testFileName);

                // notify the test harness that we've completed this async test
            }).then(function (loadedFragment) {
                // Verify that a document fragment was returned (since there was no element to attach to)
                test.assert(loadedFragment.nodeType == loadedFragment.DOCUMENT_FRAGMENT_NODE, "Fragment not of expected type");
                test.assert(loadedFragment.parentNode == null, "Fragment parented but shouldn't be");
                test.assert(loadedFragment.ownerDocument == document, "Fragment not part of ownerDocument");

                // Clean up after ourselves
                WinJS.UI.Fragments.clearCache(testFileName);

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.cache functionality
    //
    fragmentCache: function (test) {

        test.start("WinJS.UI.Fragments.cache tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment1.html'.toLowerCase();
            WinJS.UI.Fragments.cache(testFileName).then(function (docFrag) {

                // verify that a document fragment was passed to us
                test.assert(docFrag, "Document fragment not returned");

                test.assert(docFrag.nodeType == docFrag.DOCUMENT_FRAGMENT_NODE, "Fragment not of expected type");

                // Verify that we *did* add the item to the cache.
                test.assert(WinJS.UI.Fragments._cacheStore[testFileName], "Page was not cached, but should have been");

                // Clean up after ourselves
                WinJS.UI.Fragments.clearCache(testFileName);

                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.cache with script functionality
    //
    fragmentCacheWithScript: function (test) {

        test.start("WinJS.UI.Fragments.cache with script tests");

        var $head = $("head");

        // When WinJS.UI.Fragments.render (et al) loads a page with styles and scripts, those styles and scripts are moved up into the head and
        // they are NOT unloaded, regardless of caching or clearCache calls.  There's nothing we can do about it; we just need to ensure that the
        // user only does ONE test run (an F5 or app restart will suffice), and skip the test if otherwise
        if ($("script[src$='fragment4.js']", $head).length == 1) {
            test.skip("Due to how WinJS.UI.Fragments handles scripts and styles, the fragmentCacheWithScript can only be run once per session.  Refresh the page/app to remove the script and allow this test to run again.");
            return;
        }

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment4.html'.toLowerCase();
            WinJS.UI.Fragments.cache(testFileName).then(function (docFrag) {

            	// Verify that scripts and css were moved into head and out of the fragment
            	// We can't do the following line, because our approach for movingscripts (jQuery) executes them but doesn't
            	// actually place them in the HEAD element.
                //test.assert($("script[src$='fragment4.js']", $("head")).length == 1, "Scripts were not moved into head");
                test.assert($("link[href$='fragment4.css']", $("head")).length == 1, "Styles were not moved into head");

                // Verify tests are present.  Scripts should all have executed, including $.ready.  
                test.assert(window.fragmentTestValue === undefined, "fragmentTestValue incorrect");
                test.assert(window.fragmentTestValue2 === 200, "fragmentTestValue2 incorrect");
                test.assert(window.fragmentTestValue3 === 300, "fragmentTestValue3 incorrect");
                test.assert(window.fragmentTestValue4 === 400, "fragmentTestValue4 incorrect");
                test.assert(window.fragmentTestValue5 === 500, "fragmentTestValue5 incorrect");
                test.assert(window.fragmentTestValueA === 1, "fragmentTestValueA incorrect");

                // Verify that DOM elements in the loaded fragment were NOT added to the global namespace (as WinJS does that when the fragment is rendered, not cached)
                test.assert(window.test4 === undefined, "DOM element was added to global namespace, but shouldn't have been");

                // Now run a function that was added in the local script and ensure it's working
                window.fragmentTestFunc1();
                test.assert(window.fragmentTestValue6 == 600, "local script was not run, but should have been");

                // Now run a function that was added in the external script and ensure it's working
                window.fragmentTestFunc2();
                test.assert(window.fragmentTestValue == 100, "external script was not run, but should have been");

                window.fragmentTestValue = undefined;
                window.fragmentTestValue2 = undefined;
                window.fragmentTestValue3 = undefined;
                window.fragmentTestValue4 = undefined;
                window.fragmentTestValue5 = undefined;
                window.fragmentTestValue6 = undefined;

                // test loading cached fragment again - script should run the first time but NOT subsequent times");
                return WinJS.UI.Fragments.cache(testFileName);

            }).then(function (docFrag2) {

                // Verify tests are present.  Scripts should NOT have executed, including $.ready.    Since we cleared them out above, they should still be undefined
                test.assert(window.fragmentTestValue === undefined,  "Test 2: fragmentTestValue incorrect");
                test.assert(window.fragmentTestValue2 === undefined, "Test 2: fragmentTestValue2 incorrect");
                test.assert(window.fragmentTestValue3 === undefined, "Test 2: fragmentTestValue3 incorrect");
                test.assert(window.fragmentTestValue4 === undefined, "Test 2: fragmentTestValue4 incorrect");
                test.assert(window.fragmentTestValue5 === undefined, "Test 2: fragmentTestValue5 incorrect");
                test.assert(window.fragmentTestValue6 === undefined, "Test 2: fragmentTestValue6 incorrect");
                test.assert(window.fragmentTestValueA === 1, "fragmentTestValueA incorrect.  " + window.fragmentTestA);   // <-- If this is "2", then script was run on second time.

                // Now render the cached fragment
                var $testDiv = testHarness.addTestDiv("test2");
                return WinJS.UI.Fragments.render(testFileName, $testDiv[0]);
            }).then(function (docElement) {

                // Scripts should still not have executed
                test.assert(window.fragmentTestValue === undefined,  "Test 3: fragmentTestValue incorrect");
                test.assert(window.fragmentTestValue2 === undefined, "Test 3: fragmentTestValue2 incorrect");
                test.assert(window.fragmentTestValue3 === undefined, "Test 3: fragmentTestValue3 incorrect");
                test.assert(window.fragmentTestValue4 === undefined, "Test 3: fragmentTestValue4 incorrect");
                test.assert(window.fragmentTestValue5 === undefined, "Test 3: fragmentTestValue5 incorrect");
                test.assert(window.fragmentTestValue6 === undefined, "Test 3: fragmentTestValue6 incorrect");
                test.assert(window.fragmentTestValueA === 1, "fragmentTestValueA incorrect.  " + window.fragmentTestA);   // <-- If this is "2", then script was run on second time.

                // Cleanup after ourselves
                window.fragmentTestValue = undefined;
                window.fragmentTestValue2 = undefined;
                window.fragmentTestValue3 = undefined;
                window.fragmentTestValue4 = undefined;
                window.fragmentTestValue5 = undefined;
                window.fragmentTestValue6 = undefined;
                window.fragmentTestValueA = undefined;

            	// Internal bluesky function to enable removing moving styles and scripts for testing purposes
                WinJS.UI.Fragments.clearCache(testFileName);
                if (WinJS.Application.IsBluesky) {
                	WinJS.UI.Fragments._testSupportRemoveScriptsAndStyles();
                }
                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.UI.Fragments.clearCache functionality
    //
    fragmentClearCache: function (test) {

        test.start("WinJS.UI.Fragments.clearCache tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Render the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment1.html'.toLowerCase();
            WinJS.UI.Fragments.cache(testFileName).then(function (docFrag) {

                // Verify that we *did* add the item to the cache.
                test.assert(WinJS.UI.Fragments._cacheStore[testFileName], "Page was not cached, but should have been");
                WinJS.UI.Fragments.clearCache(testFileName);

                // Verify that item is no longer in the caceh
                test.assert(!WinJS.UI.Fragments._cacheStore[testFileName], "Page was not removed from cache");

                // notify the test harness that we've completed this async test
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test loaded previously cached WinJS.UI.Fragments
    //
    cachedFragments: function (test) {

        test.start("previously cached WinJS.UI.Fragments tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Load and cache the fragment
            var testFileName = '/Tests/supportFiles/fragments/fragment1.html'.toLowerCase();
            WinJS.UI.Fragments.cache(testFileName).then(function (docFrag) {

                // Now that the fragment is cached, render using it.

                // Create a div to hold the page(s) we'll create
            	var $testDiv = testHarness.addTestDiv("dataA");
                WinJS.UI.Fragments.render(testFileName, $testDiv[0]).then(function (loadedFragment) {

                    // Verify that the fragment rendered
                    test.assert($testDiv.text().indexOf("Hello") >= 0, "Failed to render page");

                    WinJS.UI.Fragments.clearCache(testFileName);

                    // notify the test harness that we've completed this async test
                    onTestComplete(test);
                });
            });
        });
    },
});
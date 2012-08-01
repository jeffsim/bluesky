"use strict";

// ================================================================
//
// Test.WinJS.Application.js
//		Tests for the top-level WinJS.Application object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Application Tests", {

	// ==========================================================================
	// 
	// Test Application lifecycle functionality
	//
	applicationLifeCycleTests: function (test) {

		test.start("WinJS.Application lifecycle tests");

	    // Win8 does not trigger onactivated (etc) here, so we can't test this on Win8
		if (!WinJS.Application.IsBluesky)
		    return test.skip("Win8 does not trigger onactivated (etc) here");

		/* Here's the order things happen in in win8:
		
			// Application event handlers
			WinJS.Application.onactivated = function () { console.log(6); };
			WinJS.Application.onready = function () { console.log(7); };
			WinJS.Application.onloaded = function () { console.log(4); };

			// Call start
			console.log(1);
			WinJS.Application.start();
			console.log(2);

			// Browser event handlers
			$(document).ready(function () { console.log(5); });
			$(window).load(function () { console.log(8); });

			console.log(3);

			// output: 1,2,3,4,5,6,7,8
		*/

		// About the above: since this test is happening *after* document.ready and window.load have occurred,
		// we can't check that they happen in the right place, although we can verify that the application.on* 
		// events happen in the right order.  I've separately verified that the above works as expected in a 
		// normal flow - just drop it into an skeleton html file (with a bluesky.js reference) and run it.
		// TODO: When I've got manual tests in place, add this as a manual test

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var log = [];

			// Application event handlers; define separately so that we can remove them to not mess with subsequent tests
			var logActivated = function () { log.push(4); };
			var logLoaded = function () { log.push(3); };
			var logReady = function () {
				// this should happen after everything else has occurred; verify that, and that they occurred in the expected order
				test.assert(log.length == 4, "Failed to fire all events");
				test.assert(log[0] == 1 && log[1] == 2 && log[2] == 3 && log[3] == 4, "Failed to fire events in expected order");

				// Clean up
				WinJS.Application.removeEventListener("activated", logActivated);
				WinJS.Application.removeEventListener("loaded", logLoaded);
				WinJS.Application.removeEventListener("ready", logReady);
				WinJS.Application.stop();

				onTestComplete(test);
			};

			WinJS.Application.onactivated = logActivated;
			WinJS.Application.onloaded = logLoaded;
			WinJS.Application.onready = logReady;

			// Call start
			log.push(1);
			WinJS.Application.start();
			log.push(2);
		});
	},


	// ==========================================================================
	// 
	// Test activation deferrals
	//
	activatedDeferral: function (test) {

		test.start("Test activation deferrals");

	    // Win8 does not trigger onactivated (etc) here, so we can't test this on Win8
		if (!WinJS.Application.IsBluesky)
		    return test.skip("Win8 does not trigger onactivated (etc) here");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

		    test.nyi("Activation deferrals require splash screen before testing can occur");
		    onTestComplete(test);
		    /* I thought the deferral inserted a delay between onactivated and onready; but onready is
               called immediately regardless.  I'm guessing that the deferral is instead intended to allow
               the app to display is splash screen longer until it's ready to show its UI.  Since we don't
               currently have an apploader/splashscreen, this functionality isn't of use.  Leaving the test
               in place though so that I can update it later
			var testVal = 0;
			var onActivated = function (eventData) {

				// Request a deferral (which is a quasi-promise which we'll call complete on when we're done)
				var deferral = eventData.detail.activatedOperation.getDeferral();
				new WinJS.Promise.timeout(10)
						.then(function () {
						    testVal = 1;
							deferral.complete();
						});
			};

			var onReady = function (eventData) {
				test.assert(testVal == 1, "Failed to call setPromise");

				// TODO: Ideally check timer and ensure we waited.

				// Clean up
				WinJS.Application.removeEventListener("activated", onActivated);
				WinJS.Application.removeEventListener("ready", onReady);
				WinJS.Application.stop();
			    // Poke into bluesky internals to clear out the activation deferrals
				Windows.UI.WebUI._activationDeferrals = [];

				onTestComplete(test);
			};

			WinJS.Application.onactivated = onActivated;
			WinJS.Application.onready = onReady;

			WinJS.Application.start();*/
		});
	},


	// ==========================================================================
	// 
	// WinJS.Application.activated setPromise tests
	//
	activatedSetPromise: function (test) {

		test.start("WinJS.Application.activated setPromise tests");

	    // Win8 does not trigger onactivated (etc) here, so we can't test this on Win8
		if (!WinJS.Application.IsBluesky)
		    return test.skip("Win8 does not trigger onactivated (etc) here");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var testVal = 0;
			var onActivated = function (eventData) {

				test.assert(eventData.setPromise, "setPromise not found in eventData");
				eventData.setPromise(new WinJS.Promise.timeout(10)
						.then(function () {
							testVal = 1;
						}));
			};

			var onReady = function (eventData) {

				test.assert(testVal == 1, "Failed to call setPromise");
				// TODO: Ideally check timer and ensure we waited.

				// Clean up
				WinJS.Application.removeEventListener("activated", onActivated);
				WinJS.Application.removeEventListener("ready", onReady);
				WinJS.Application.stop();

				onTestComplete(test);
			};

			WinJS.Application.onactivated = onActivated;
			WinJS.Application.onready = onReady;

			WinJS.Application.start();
		});
	},


	// ==========================================================================
	// 
	// WinJS.Application.loaded setPromise tests
	//
	loadedSetPromise: function (test) {

		test.start("WinJS.Application.loaded setPromise tests");

	    // Win8 does not trigger onactivated (etc) here, so we can't test this on Win8
		if (!WinJS.Application.IsBluesky)
		    return test.skip("Win8 does not trigger onactivated (etc) here");

	    // This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var testVal = 0;
			var onLoaded = function (eventData) {

				test.assert(eventData.setPromise, "setPromise not found in eventData");
				eventData.setPromise(new WinJS.Promise.timeout(10)
						.then(function () {
							testVal = 1;
						}));
			};

			var onReady = function (eventData) {

				test.assert(testVal == 1, "Failed to call setPromise");
				// TODO: Ideally check timer and ensure we waited.

				// Clean up
				WinJS.Application.removeEventListener("activated", onLoaded);
				WinJS.Application.removeEventListener("ready", onReady);
				WinJS.Application.stop();

				onTestComplete(test);
			};

			WinJS.Application.onloaded = onLoaded;
			WinJS.Application.onready = onReady;

			WinJS.Application.start();
		});
	},


	// ==========================================================================
	// 
	// WinJS.Application.ready setPromise tests
	//
	readySetPromise: function (test) {

		test.start("WinJS.Application.ready setPromise tests");

	    // Win8 does not trigger onactivated (etc) here, so we can't test this on Win8
		if (!WinJS.Application.IsBluesky)
		    return test.skip("Win8 does not trigger onactivated (etc) here");

	    // This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var testVal = 0;
			var onReady = function (eventData) {

				test.assert(eventData.setPromise, "setPromise not found in eventData");
				eventData.setPromise(new WinJS.Promise.timeout(10)
						.then(function () {

							// TODO: Ideally check timer and ensure we waited.

							// Clean up
							WinJS.Application.removeEventListener("ready", onReady);
							WinJS.Application.stop();
							onTestComplete(test);
						}));
			};

			WinJS.Application.onready = onReady;

			WinJS.Application.start();
		});
	}
});
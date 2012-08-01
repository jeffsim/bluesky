"use strict";

// ================================================================
//
// Test.WinJS.Promise.js
//		Tests for the WinJS.Promise object
//
// TODO: Other Promise tests to add:
//		Promise.done
//		errors
//		as
//		progress
//		cancellation
//		(check out http://code.msdn.microsoft.com/windowsapps/Promise-e1571015/sourcecode?fileId=43927&pathId=1493948072 for sample code)

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Promise Tests", {

	// ==========================================================================
	// 
	// Test simple Promise without chaining - sanity test
	//
	simplePromise: function (test) {

		test.start("Simple Promise test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// Wait 10 ms, then fire our completion callback
			setTimeout(function () {
				onTestComplete(test);
			}, 10);
		});

		test.nyi("Promise.as tests");
		test.nyi("Promise.done tests"); // see page 78 of the book for details
		tset.nyi("error handling and exceptions in Promises");
	},


	// ==========================================================================
	// 
	// Test simple Promise chaining
	//
	simpleChaining: function (test) {

		test.start("Simple Promise chaining test");
		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			return new WinJS.Promise(function (onComplete) {
				// Wait 10 ms, then fire our completion callback
				setTimeout(function () {
					onComplete(1234);
				}, 10);
			})
			.then(function (result) {
				return new WinJS.Promise(function (onComplete) {
					setTimeout(function () {
						onComplete(result + 100);
					}, 10);
				});
			})
			.then(function (result) {
				return new WinJS.Promise(function (onComplete) {
					setTimeout(function () { onComplete(result + 100); }, 10);
				});
			})
			.then(function (result) {
				return new WinJS.Promise(function (onComplete) {
					test.assert(result == 1434, "failed to complete the chain of promises (res=" + result + ")");
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test chaining promises that do not themselves return Promises.
	//
	nonPromiseChaining: function (test) {
		test.start("Non-promise chaining");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var p = new WinJS.Promise(function (onComplete) {
				setTimeout(function () {
					onComplete(1);
				}, 10);
			});

			p.then(function (res) {
				return res + 50;
			})
			.then(function (res) {
				return res + 100;
			})
			.then(function (res) {
				test.assert(res == 151, "Failed to chain non-promise thens properly");
				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test immediately returning promises
	//
	immediateReturn: function (test) {

		test.start("Immediate return test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			return new WinJS.Promise(function (onComplete) {
				// Complete immediately
				onComplete(1234);
			})
			.then(function (result) {
				// Chain a non-immediate promise in the middle
				return new WinJS.Promise(function (onComplete) {
					onComplete(result + 100);
				});
			})
			.then(function (result) {
				// Chain an immediately complete promise in the middle
				return new WinJS.Promise(function (onComplete) {
					onComplete(result + 100);
				});
			})
			.then(function (result) {
				// Chain an immediately complete promise in the middle
				return new WinJS.Promise(function (onComplete) {
					test.assert(result == 1434, "failed to complete the chain of promises");
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test chained immediately returning promises
	//
	immediateReturnWithChaining: function (test) {

		test.start("Immediate return with chaining test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var result = 1234;

			var p = new WinJS.Promise(function (onComplete) {

				//  Wait a moment and then complete this promise
				setTimeout(function () {
					onComplete(result + 100);
				}, 10);
			});

			p.then(function (result) {

				// Chain an immediately complete promise in the middle
				return new WinJS.Promise(function (onComplete) {
					onComplete(result + 100);
				});
			})
			.then(function (result) {
				return new WinJS.Promise(function (onComplete) {
					// Validate the final result
					test.assert(result == 1434, "failed to complete the chain of promises");

					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Multiple 'then's can chain off of the same promise; this tests that that works.
	//
	simultaneousPromises: function (test) {

		test.start("Simultaneous Promises");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var result = 1;

			// Create the Promise off of which we will chain the multiple then's
			var testPromise = new WinJS.Promise(function (onComplete) {
				setTimeout(function () {
					onComplete(1);
				}, 10);
			});

			testPromise.then(function () {
				result += 2;
			});

			testPromise.then(function () {
				result += 4;
			});

			testPromise.then(function () {
				result += 8;
			});

			// TODO: When Promise.join is fully implemented, use it here.
			var timer = setInterval(function () {

				// Verify that all three then promises fired.
				if (result == 15) {
					clearInterval(timer);
					onTestComplete(test);
				}
			}, 10);
		});
	},


	// ==========================================================================
	// 
	// Multiple 'then's can chain off of the same promise; this tests that that works.
	//
	simultaneousChainedPromises: function (test) {

		test.start("Simultaneous Chained Promises");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var result = 1;

			// Create the Promise off of which we will chain the multiple then's
			var p = new WinJS.Promise(function (onComplete) {
				setTimeout(function () {
					onComplete(1);
				}, 10);
			});

			p.then(function () {
				return new WinJS.Promise(function (onComplete) {
					setTimeout(function () {
						result += 2;
						onComplete(1);
					}, 10);
				});
			});

			p.then(function () {
				return new WinJS.Promise(function (onComplete) {
					setTimeout(function () {
						result += 4;
						onComplete(1);
					}, 10);
				});
			});

			p.then(function () {
				return new WinJS.Promise(function (onComplete) {
					setTimeout(function () {
						result += 8;
						onComplete(1);
					}, 10);
				});
			});


			// TODO: When Promise.join is implemented, use it here.
			var timer = setInterval(function () {

				// Verify that all three then promises fired.
				if (result == 15) {
					clearInterval(timer);
					onTestComplete(test);
				}
			}, 10);
		});
	},


	// ==========================================================================
	// 
	// Promise chaining must happen in order; this test verifies that it does
	//
	chainOrdering: function (test) {

		test.start("Chain ordering test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var res = [];

			var p = new WinJS.Promise(function (onComplete) {
				res.push(1);
				// Complete immediately
				onComplete(1234);
			})
			.then(function (result) {
				res.push(2);

				// Chain a non-immediate promise in the middle
				return new WinJS.Promise(function (onComplete) {
					res.push(3);
					setTimeout(function () {
						res.push(4);
						onComplete(result + 100);
					}, 10);
				});
			})
			.then(function (result) {
				res.push(5);

				// Chain an immediately complete promise in the middle
				return new WinJS.Promise(function (onComplete) {
					res.push(6);
					onComplete(result + 100);
				});
			})
			.then(function (result) {
				res.push(7);

				// Chain a non-immediate promise in the middle
				return new WinJS.Promise(function (onComplete) {
					res.push(8);
					setTimeout(function () {
						res.push(9);
						onComplete(result + 100);
					}, 10);
				});
			})
			.then(function (result) {
				res.push(10);

				// Chain an immediately complete promise in the middle
				return new WinJS.Promise(function (onComplete) {
					res.push(11);
					onComplete(result + 100);
				});
			})
			.then(function (result) {
				res.push(12);
				return new WinJS.Promise(function (onComplete) {
					res.push(13);
					// Validate the final result
					for (var i = 1; i < 14; i++) {
						if (res[i - 1] != i) {
							test.assert(false, "failed to fulfill Promises in expected order");
							break;
						}
					}

					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test simple promise join
	//
	simpleJoin: function (test) {

		test.start("Simple join test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var promise1 = new WinJS.Promise(function (c) { setTimeout(function () { c(); }); }, 10);
			var promise2 = new WinJS.Promise(function (c) { setTimeout(function () { c(); }); }, 10);
			var promise3 = new WinJS.Promise(function (c) { setTimeout(function () { c(); }); }, 10);

			return WinJS.Promise.join([promise1, promise2, promise3]).then(function () {

				// Simply getting here is success.
				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test promise join with result values
	//
	joinWithResults: function (test) {

		test.start("Promise join with result values test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var promise1 = new WinJS.Promise(function (c) { setTimeout(function () { c(100); }); }, 10);
			var promise2 = new WinJS.Promise(function (c) { setTimeout(function () { c(200); }); }, 10);
			var promise3 = new WinJS.Promise(function (c) { setTimeout(function () { c(300); }); }, 10);

			return WinJS.Promise.join([promise1, promise2, promise3]).then(function (results) {
				// Validate results
				test.assert(results.indexOf(100) > -1, "Failed to obtain result 100");
				test.assert(results.indexOf(200) > -1, "Failed to obtain result 200");
				test.assert(results.indexOf(300) > -1, "Failed to obtain result 300");

				onTestComplete(test);
			});
		});
	},


	// ==========================================================================
	// 
	// Test promise timeout
	//
	promiseTimeout: function (test) {

		test.start("Promise timeout test");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			// test timeout > 0
			return WinJS.Promise.timeout(100).then(function () {

				// Test timeout == 0
				return WinJS.Promise.timeout(0).then(function () {

					// Simply getting here is success.
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Test Promise.as functionality
	//
	promiseAsTests: function (test) {

		test.start("Promise.as tests");

		// Define a function that adds two numbers together synchronously
		function nonPromiseAdd(num1, num2) {
			return num1 + num2;
		}

		// Define a function that adds two numbers together using a promise
		function promiseAdd(num1, num2) {
			return new WinJS.Promise(function (c) { c(num1 + num2); });
		}

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {
			var count = 1;
			var num1 = count++;
			var num2 = count++;

			promiseAdd(num1, num2).
				then(function (v) {
					num1 = v;
					num2 = count++;

					// wrap the regular non-synchronous method in Promise.as() to treat it as a promise 
					return WinJS.Promise.as(promiseAdd(num1, num2));
				}).
				then(function (v) {
					num1 = v;
					num2 = count++;
					return promiseAdd(num1, num2);
				}).
				then(function (v) {
					num1 = v;
					num2 = count++;

					// wrap the regular non-synchronous method in Promise.as() to treat it as a promise 
					return WinJS.Promise.as(nonPromiseAdd(num1, num2));
				}).
				then(function (v) {
					test.assert(v == 15 && num1 == 10 && num2 == 5, "failed to complete the chain of promises");
					onTestComplete(test);
				});
		});
	},
	

	// ==========================================================================
	// 
	// Test Promise.is functionality
	//
	promiseIsTests: function (test) {

		test.start("Promise.is tests");

		var promise = new WinJS.Promise(function () { });
		var nonPromise = 100;

		test.assert(WinJS.Promise.is(promise), "Failed to identify a promise as a promise");
		test.assert(!WinJS.Promise.is(nonPromise), "Falsely identified a non-promise as a promise");
	}
});
"use strict";

// ================================================================
//
// Test.WinJS.Navigation.js
//		Tests for the top-level WinJS.Navigation object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Navigation Tests", {

	// ==========================================================================
	// 
	// Simple navigate test
	//
	simpleNavigate: function (test) {

		test.start("Simple navigate test");
		test.timeoutLength = 5000;

		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController1: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	that.element.appendChild(newElement);
                        	that.element.removeChild(oldElement);
                        	oldElement.innerText = "";

                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController1"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {

				WinJS.Navigation.navigate(pageControl.testPage).then(function () {

					// Verify that we navigated
					test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 1") >= 0, "Failed to navigate to page");
					test.assert($(".pagecontrol div", testHarness.testFrame).hasClass("root"), "Page setup unexpected");
					pageControl.cleanupTest();
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Navigation events test
	//
	navigationEvents: function (test) {

		test.start("Navigation events test");
		test.timeoutLength = 5000;

		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController2: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound events so that we can remove them
				this.boundBeforeNavigateEvent = this._beforenavigate.bind(this);
				this.boundNavigatedEvent = this._navigated.bind(this);
				this.boundNavigatingEvent = this._navigating.bind(this);
				WinJS.Navigation.onbeforenavigate = this.boundBeforeNavigateEvent;
				WinJS.Navigation.onnavigating = this.boundNavigatingEvent;
				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});
					that.navigatedEventArgs = args;

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$("> div", $(that.element)).replaceWith(newElement);
                        	parentedComplete();
                        })
                    );
				},
				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("beforenavigate", this.boundBeforeNavigateEvent);
					WinJS.Navigation.removeEventListener("navigating", this.boundNavigatingEvent);
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_beforenavigate: function (args) { this.beforenavigateEventArgs = args; },
				_navigating: function (args) { this.navigatingEventArgs = args; },
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController2"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {
				WinJS.Navigation.navigate(pageControl.testPage, { test1: 100, test2: 200 }).then(function () {

					// Verify that we navigated and args at each step
					test.assert(pageControl.beforenavigateEventArgs && pageControl.navigatingEventArgs && pageControl.navigatedEventArgs, "Failed to navigate");
					test.assert(pageControl.beforenavigateEventArgs.detail.location == "/Tests/supportFiles/nav1.html", "Invalid location on beforenavigateEventArgs");
					test.assert(pageControl.navigatingEventArgs.detail.location == "/Tests/supportFiles/nav1.html", "Invalid location on beforenavigateEventArgs");
					test.assert(pageControl.navigatedEventArgs.detail.location == "/Tests/supportFiles/nav1.html", "Invalid location on beforenavigateEventArgs");

					test.assert(pageControl.beforenavigateEventArgs.detail.state.test1 == 100, "Invalid state on beforenavigateEventArgs");
					test.assert(pageControl.navigatingEventArgs.detail.state.test1 == 100, "Invalid state on beforenavigateEventArgs");
					test.assert(pageControl.navigatedEventArgs.detail.state.test1 == 100, "Invalid state on beforenavigateEventArgs");

					pageControl.cleanupTest();
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Navigation between two pages
	//
	twoPageNavigation: function (test) {

		test.start("Navigation between two pages");
		test.timeoutLength = 5000;

		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController1: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$(that.element).empty().append(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController1"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {

				WinJS.Navigation.navigate(pageControl.testPage).then(function () {
					WinJS.Navigation.navigate("/Tests/supportFiles/nav2.html").then(function () {
						// Verify that we navigated
						test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 1") == -1, "Failed to remove previous page");
						test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") >= 0, "Failed to navigate to page");
						pageControl.cleanupTest();
						onTestComplete(test);
					});
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Navigation cancellation
	//
	navigationCancellation: function (test) {

		test.start("Navigation cancellation test");
		test.timeoutLength = 5000;

		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController4: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound events so that we can remove them
				this.boundBeforeNavigateEvent = this._beforenavigate.bind(this);
				this.boundNavigatedEvent = this._navigated.bind(this);
				this.boundNavigatingEvent = this._navigating.bind(this);
				WinJS.Navigation.addEventListener("beforenavigate", this.boundBeforeNavigateEvent);
				WinJS.Navigation.addEventListener("navigating", this.boundNavigatingEvent);
				WinJS.Navigation.addEventListener("navigated", this.boundNavigatedEvent);

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("beforenavigate", this.boundBeforeNavigateEvent);
					WinJS.Navigation.removeEventListener("navigating", this.boundNavigatingEvent);
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					that.navigatedEventArgs = args;

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$("> div", $(that.element)).replaceWith(newElement);
                        	parentedComplete();
                        })
                    );
				},

				_beforenavigate: function (args) {

					// Prevent the navigation of the second navigation
					if (args.detail.location.indexOf("nav2") > -1)
						args.detail.setPromise(new WinJS.Promise(function () { return true; }));

					this.beforenavigateEventArgs = args;
				},

				_navigating: function (args) {
					this.navigatingEventArgs = args;
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController4"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {

				WinJS.Navigation.navigate(pageControl.testPage, { test1: 100, test2: 200 }).then(function () {

					WinJS.Navigation.navigate("/Tests/supportFiles/nav2.html").then(function () {
						// Verify that we only navigated the first time
						// Interesting; Win8 does not appear to have a way to determine that navigation was cancelled. So we do it this way:
						// if you get here, then you navigated, and failed.  Otherwise we give a short timeout and then call success.
						test.assert(false, "Navigated to second page");
					});
				});

				// See above for why we do this, and why a timeout is considered success.
				WinJS.Promise.timeout(1000).then(function () {
					pageControl.cleanupTest();
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Back Navigation
	//
	backNavigation: function (test) {

		test.start("Back Navigation");
		test.timeoutLength = 5000;
		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController5: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$(that.element).empty().append(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController5"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {
				WinJS.Navigation.navigate(pageControl.testPage).then(function () {
					WinJS.Navigation.navigate("/Tests/supportFiles/nav2.html").then(function () {
						WinJS.Navigation.navigate("/Tests/supportFiles/nav3.html").then(function () {
							test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") >= 0, "Failed to navigate to third page");

							WinJS.Navigation.back().then(function () {
								// Verify that we navigated back once
								test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") == -1, "Failed to navigate back away from third page");
								test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") >= 0, "Failed to navigate back to second page");

								// Navigate back again
								WinJS.Navigation.back().then(function () {
									test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") == -1, "Failed to navigate back away from second page");
									test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 1") >= 0, "Failed to navigate back to first page");

									pageControl.cleanupTest();
									onTestComplete(test);
								});
							});
						});
					});
				});
			});
		});
	},


	// ==========================================================================
	// 
	// Forward Navigation
	//
	forwardNavigation: function (test) {

		test.start("Forward Navigation");
		test.timeoutLength = 5000;

		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController5: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$(that.element).empty().append(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		test.nyi("navigation to direct URL");
		test.nyi("navigation hash tags");
		test.nyi("what is onnavigated.value used for?");
		test.nyi("what is onnavigating.delta used for?");
		test.nyi("Tests for Navigation.history property");

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController5"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {

				WinJS.Navigation.navigate(pageControl.testPage).then(function () {
					WinJS.Navigation.navigate("/Tests/supportFiles/nav2.html").then(function () {
						WinJS.Navigation.navigate("/Tests/supportFiles/nav3.html").then(function () {
							test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") >= 0, "Failed to navigate to third page");

							WinJS.Navigation.back().then(function () {
								// Verify that we navigated back once
								test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") == -1, "Failed to navigate back away from third page");
								test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") >= 0, "Failed to navigate back to second page");

								// Navigate back again
								WinJS.Navigation.back().then(function () {
									test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") == -1, "Failed to navigate back away from second page");
									test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 1") >= 0, "Failed to navigate back to first page");

									// Now go forward
									WinJS.Navigation.forward().then(function () {
										test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") == -1, "Failed to navigate forward away from third page");
										test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 2") >= 0, "Failed to navigate forward to second page");

										// Navigate forward again
										WinJS.Navigation.forward().then(function () {
											test.assert($(".pagecontrol", testHarness.testFrame).text().indexOf("Nav page 3") >= 0, "Failed to navigate forward to third page");
											pageControl.cleanupTest();
											onTestComplete(test);
										})
									});
								});
							});
						});
					});
				});
			});
		});
	},


	// ==========================================================================
	// 
	//  canGoBack/Forward tests
	//
	canGoBackForward: function (test) {

		test.start("canGoBack/Forward tests");
		test.timeoutLength = 5000;
		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController5: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$("> div", $(that.element)).replaceWith(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController5"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {
				WinJS.Navigation.navigate(pageControl.testPage).then(function () {
					test.assert(WinJS.Navigation.canGoBack == false, "1: error; shouldn't be able to go back");
					test.assert(WinJS.Navigation.canGoForward == false, "2: error; shouldn't be able to go forward");
					WinJS.Navigation.navigate("/Tests/supportFiles/nav2.html").then(function () {
						test.assert(WinJS.Navigation.canGoBack == true, "3: error; should be able to go back");
						test.assert(WinJS.Navigation.canGoForward == false, "4: error; shouldn't be able to go forward");
						WinJS.Navigation.navigate("/Tests/supportFiles/nav3.html").then(function () {
							test.assert(WinJS.Navigation.canGoBack == true, "5: error; should be able to go back");
							test.assert(WinJS.Navigation.canGoForward == false, "6: error; shouldn't be able to go forward");
							WinJS.Navigation.back().then(function () {	// back to page 2
								test.assert(WinJS.Navigation.canGoBack == true, "7: error; should be able to go back");
								test.assert(WinJS.Navigation.canGoForward == true, "8: error; should be able to go forward");
								WinJS.Navigation.back().then(function () {	// back to page 1
									test.assert(WinJS.Navigation.canGoBack == false, "9: error; shouldn't be able to go back");
									test.assert(WinJS.Navigation.canGoForward == true, "10: error; should be able to go forward");

									pageControl.cleanupTest();
									onTestComplete(test);
								});
							});
						});
					});
				});
			});
		});
	},


	// ==========================================================================
	// 
	//  Navigation.location tests
	//
	locationTests: function (test) {

		test.start("Navigation.location tests");
		test.timeoutLength = 5000;
		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController5: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$("> div", $(that.element)).replaceWith(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController5"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {
				WinJS.Navigation.navigate(pageControl.testPage).then(function () {
					
					// Note: Setting location doesn't actually cause the page to change
					test.assert(WinJS.Navigation.location == pageControl.testPage, "Failed to set location");
					pageControl.cleanupTest();
					onTestComplete(test);
				});
			});
		});
	},


	// ==========================================================================
	// 
	//  Navigation.state tests
	//
	stateTests: function (test) {

		test.start("Navigation.state tests");
		test.timeoutLength = 5000;
		// Create our pagecontroller class
		WinJS.Namespace.define("TestHarness.navTests", {
			PageController5: WinJS.Class.define(function (element, options) {

				this.element = element;
				var $pageElement = $("<div></div>");
				$(element).append($pageElement);
				this.pageElement = $pageElement[0];

				// Keep a pointer to the bound event so that we can remove it
				this.boundNavigatedEvent = this._navigated.bind(this);

				WinJS.Navigation.onnavigated = this.boundNavigatedEvent;

				WinJS.UI.setOptions(this, options);
			}, {

				cleanupTest: function () {
					WinJS.Navigation.removeEventListener("navigated", this.boundNavigatedEvent);
					WinJS.Navigation.history = {};
				},

				_navigated: function (args) {
					var that = this;
					var oldElement = that.pageElement;
					var newElement = $("<div style='width:100%;height:100%'></div>")[0];
					var parentedComplete;
					var parented = new WinJS.Promise(function (c) {
						parentedComplete = c;
					});

					args.detail.setPromise(

						// Yield, then render, then parent, then inform that we're done
                        WinJS.Promise.timeout().then(function () {
                        	if (oldElement.winControl && oldElement.winControl.unload) {
                        		oldElement.winControl.unload();
                        	}
                        	return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented);

                        }).then(function parentElement(control) {
                        	// Replace the contained div with the new content
                        	$("> div", $(that.element)).replaceWith(newElement);
                        	parentedComplete();
                        })
                    );
				},
			})
		});

		// This is an async test, so it must use test.doAsync and call onTestComplete when done
		return test.doAsync(function (onTestComplete) {

			var $pageController = testHarness.addTestElement('<div id="contenthost" data-win-control="TestHarness.navTests.PageController5"' +
															 '	  data-win-options="{testPage: \'/Tests/supportFiles/nav1.html\'}"></div>');

			// Call WinJS.UI.process on the newly creating DOM element to instantiate the page control
			WinJS.UI.process($pageController[0]).then(function (pageControl) {
				WinJS.Navigation.navigate(pageControl.testPage, { test1: 100 }).then(function () {
					
					// Note: Setting location doesn't actually cause the page to change
					test.assert(WinJS.Navigation.state.test1 == 100, "Failed to set state");
					WinJS.Navigation.state.test1 = 200;
					test.assert(WinJS.Navigation.state.test1 == 200, "Failed to change state");
					pageControl.cleanupTest();
					onTestComplete(test);
				});
			});
		});
	},
});
"use strict";

(function () {
	// ================================================================
	//
	// Test.WinJS.Utilities.QueryCollection.js
	//		Tests for the Utilities.QueryCollection object
	//

	// Add our tests into the test harness's list of tests
	testHarness.addTestFile("WinJS.Utilities.QueryCollection Tests", {

		// ==========================================================================
		// 
		// Test basic QueryCollection create functionality
		//
		createQueryCollection: function (test) {

			test.start("basic QueryCollection create tests");

			var testDiv = createTestDivForQueryCollection();

			// Test regular QC creation
			var qc = WinJS.Utilities.query("div", testDiv);
			test.assert(qc.length == 5, "Failed to create QueryCollection");

			// Test one element creation
			qc = new WinJS.Utilities.QueryCollection(100);
			test.assert(qc.length == 1, "Failed to create one-element QueryCollection");

			// Test empty QC creation
			qc = new WinJS.Utilities.QueryCollection([]);
			test.assert(qc.length == 0, "Failed to create empty QueryCollection");

			// Test undefined QC creation
			qc = new WinJS.Utilities.QueryCollection();
			test.assert(qc.length == 0, "Failed to create undefined QueryCollection");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.setAttribute functionality
		//
		setAttribute: function (test) {

			test.start("QueryCollection.setAttribute tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);
			qc.setAttribute("test", "red");
			var valid = true;
			qc.forEach(function (item) {
				valid = valid & $(item).attr("test") == "red";
			});

			test.assert(valid, "Failed to setAttribute");
		},

		// ==========================================================================
		// 
		// Test QueryCollection.getAttribute functionality
		//
		getAttribute: function (test) {

			test.start("QueryCollection.getAttribute tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);

			// set attribute so that we can get it
			qc.setAttribute("test", "red");
			var valid = true;
			qc.forEach(function (item) {
				valid = valid & $(item).attr("test") == "red";
			});
			test.assert(valid, "Failed to setAttribute");

			// Now get the attribute
			var firstItemAttr = qc.getAttribute("test");
			test.assert(firstItemAttr == "red", "Failed to getAttribute");

			// test invalid attribute
			var invalidAttr = qc.getAttribute("test2");
			test.assert(invalidAttr === null, "Failed to getAttribute invalid attribute");

			// test with empty list
			qc = new WinJS.Utilities.QueryCollection([]);
			var emptyAttr = qc.getAttribute("test2");
			test.assert(emptyAttr === undefined, "Failed to getAttribute from empty list");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.get functionality
		//
		get: function (test) {

			test.start("QueryCollection.get tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);
			var get1 = qc.get(1);
			var get3 = qc.get(3);
			test.assert($(get1).attr("id") == "child2", "Failed to get(1)");
			test.assert($(get3).attr("id") == "child4", "Failed to get(3)");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.forEach functionality
		//
		forEach: function (test) {

			test.start("QueryCollection.forEach tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);
			var items = [];
			qc.forEach(function (item) {
				items.push(item);
			});
			test.assert(items.length == 5, "Invalid number of items called in forEach");
			test.assert($(items[0]).attr("id") == "child1", "Invalid item returned: 0");
			test.assert($(items[1]).attr("id") == "child2", "Invalid item returned: 1");
			test.assert($(items[2]).attr("id") == "child3", "Invalid item returned: 2");
			test.assert($(items[3]).attr("id") == "child4", "Invalid item returned: 3");
			test.assert($(items[4]).attr("id") == "child5", "Invalid item returned: 4");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.addClass functionality
		//
		addClass: function (test) {

			test.start("QueryCollection.addClass tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);
			qc.addClass("testClass");
			var valid = true;
			qc.forEach(function (item) {
				valid &= WinJS.Utilities.hasClass(item, "testClass");
			});

			test.assert(valid, "Failed to addClass");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.removeClass functionality
		//
		removeClass: function (test) {

			test.start("QueryCollection.removeClass tests");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);

			// Add the class so that we can remove it
			qc.addClass("testClass");
			var valid = true;
			qc.forEach(function (item) {
				valid &= WinJS.Utilities.hasClass(item, "testClass");
			});

			test.assert(valid, "Failed to addClass");

			// Now remove the class
			qc.removeClass("testClass");
			var valid = true;
			qc.forEach(function (item) {
				valid &= !WinJS.Utilities.hasClass(item, "testClass");
			});

			test.assert(valid, "Failed to removeClass");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.id functionality
		//
		id: function (test) {

			test.start("QueryCollection.id tests");

		    // Odd; the win8 sdk states that .id() is a function on a querycollection,
		    // but win8 throws an "unknown function" error on it.  Not sure if its a doc
		    // error or a code error, so leaving in for now, but skipping on win8
			if (!WinJS.Application.IsBluesky)
			    return test.skip("Win8 doesn't appear to support QC.id() - doc or code bug?");

			var testDiv = createTestDivForQueryCollection();

			var qc = WinJS.Utilities.query("div", testDiv);
			var id1 = qc.id("child2");
			var id3 = qc.id("child4");
			test.assert(id1.length == 1, "Invalid length on id1");
			test.assert(id3.length == 1, "Invalid length on id3");
			test.assert($(id1.get(0)).attr("id") == "child2", "Failed to id(1)");
			test.assert($(id3.get(0)).attr("id") == "child4", "Failed to id(3)");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.setStyle functionality
		//
		setStyle: function (test) {

			test.start("QueryCollection.setStyle tests");

			var testDiv = createTestDivForQueryCollection();
			var qc = WinJS.Utilities.query("div", testDiv);
			qc.setStyle("color", "blue");
			var valid = true;
			qc.forEach(function (item) {
				valid &= ($(item).css("color") == "rgb(0, 0, 255)");
			});

			test.assert(valid, "Failed to setStyle");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.clearStyle functionality
		//
		clearStyle: function (test) {

			test.start("QueryCollection.clearStyle tests");

			var testDiv = createTestDivForQueryCollection();
			var qc = WinJS.Utilities.query("div", testDiv);

			// set style so that we can clear it
			qc.setStyle("color", "blue");
			var valid = true;
			qc.forEach(function (item) {
				valid &= ($(item).css("color") == "rgb(0, 0, 255)");
			});
			test.assert(valid, "Failed to setStyle");

			qc.clearStyle("color");
			var valid = true;
			qc.forEach(function (item) {
				valid &= ($(item).css("color") == "rgb(0, 0, 0)");
			});
			test.assert(valid, "Failed to clearStyle");
		},


		// ==========================================================================
		// 
		// Test QueryCollection.listen functionality
		//
		listen: function (test) {

			test.start("QueryCollection.listen tests");

			var testDiv = createTestDivForQueryCollection();
			var qc = WinJS.Utilities.query("div", testDiv);

			test.nyi("test capture");

			var results = [];
			qc.listen("click", function (e) {
				results.push($(this).attr("id"));
				e.cancelBubble = true;
			});

			// Note: Safari does not like .trigger("click"), so manually gen up the event
			$("div", $(testDiv)).each(function (index, el) {
				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				el.dispatchEvent(evt);
			});

			test.assert(results.length == 5, "Did not trigger 5 events");
			test.assert(results.indexOf("child1") >= 0, "Did not trigger for child1");
			test.assert(results.indexOf("child2") >= 0, "Did not trigger for child2");
			test.assert(results.indexOf("child3") >= 0, "Did not trigger for child3");
			test.assert(results.indexOf("child4") >= 0, "Did not trigger for child4");
			test.assert(results.indexOf("child5") >= 0, "Did not trigger for child5");
		}
	});


	// ==========================================================================
	// 
	// createTestDivForQueryCollection
	//
	//		Creates a div with various queryable elements. This happens enough in 
	//		the QueryCollection tests to be worth doing once.
	//
	function createTestDivForQueryCollection() {
		return testHarness.addTestElement(
								"<div id='test1'>" +
									"<div id='child1'>Hello</div>" +
									"<div id='child2'>World" +
										"<div class='t1' id='child3'>Bar</div>" +
										"<div class='t1' id='child4'>Bar2</div>" +
										"<div class='t1' id='child5'>Bar2</div>" +
									"</div>" +
									"Foo" +
								"</div>")[0];
	}
})();
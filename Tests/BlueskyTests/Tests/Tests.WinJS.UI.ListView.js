"use strict";

(function () {
	// ================================================================
	//
	// Test.WinJS.UI.ListView.js
    //		Tests for WinJS.UI.ListView
	//

	// Add our tests into the test harness's list of tests
    testHarness.addTestFile("WinJS.UI.ListView Tests", {

        // ==========================================================================
        // 
        // Test basic ListView creation
        //
        basicListView: function (test) {

            test.start("Basic ListView creation");

            // This is an async test, so it must use test.doAsync and call onTestComplete when done
            return test.doAsync(function (onTestComplete) {

                createListView().then(function () {

                    onTestComplete(test);
                });
            });
        }
    });


	// ==========================================================================
	// 
	// private function: createListView
	//
	//		Helper function that creates a ListView
	//
	function createListView(list, target) {

		if (!list) {
			// Create the list of items to bind into the flipview and bind it.
			var list = new WinJS.Binding.List();
			list.push({ picture: "/Tests/supportFiles/flipView/img1.jpg", title: "title 1" });
			list.push({ picture: "/Tests/supportFiles/flipView/img2.jpg", title: "Hello world" });
			list.push({ picture: "/Tests/supportFiles/flipView/img3.jpg", title: "Foo" });
			list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" });
			for (var i = 2; i < 20; i++)
			    list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar" + i });
			list.push({ picture: "/Tests/supportFiles/flipView/img4.jpg", title: "Bar6" });
		}
		if (!target) {
			var $tempTarget = $("<div></div>");
			$(".testFrame").append($tempTarget);
			target = $tempTarget[0];
		}

		return new WinJS.Promise(function (c) {
			var listView;

			WinJS.UI.Pages.render("/Tests/supportFiles/listView/listView.html", target).then(function (testPage) {

				listView = $("#testListView")[0].winControl;
				listView.itemTemplate = $("#simple_ItemTemplate")[0];
				listView.itemDataSource = list.dataSource;

				// Yield so that the list can render with the new data source
				return WinJS.Promise.timeout();

			}).then(function () {

				c(listView);
			});
		});
	}

})();
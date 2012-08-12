"use strict";

// ================================================================
//
// Test.WinJS.Binding.FilteredList.js
//		Tests for the WinJS.Binding.FilteredList object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Binding.FilteredList Tests", {

	// ==========================================================================
	// 
	// Test simple Filtered List creation
	//
	filteredListCreation: function (test) {

		test.start("Simple Filtered list creation test");

		var list = new WinJS.Binding.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

		var filteredList = list.createFiltered(function (el) {
			return el % 2;
		});
		var d = filteredList.dataSource;
		test.assert(filteredList.getAt(0) == 1 &&
					filteredList.getAt(1) == 3 &&
					filteredList.getAt(2) == 5 &&
					filteredList.getAt(3) == 7 &&
					filteredList.getAt(4) == 9, "Failed to populate filtered list");

		test.nyi("test indexOfKey - may not be implemented properly");
	},
	

	// ==========================================================================
	// 
	// Test creating filtered Lists from filtered lists
	//
	filteredFilteredListCreation: function (test) {

		test.start("Filtered Filtered list creation test");

		var list = new WinJS.Binding.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

		var filteredList = list.createFiltered(function (el) {
			return el % 2;
		});

		var filteredList2 = filteredList.createFiltered(function (el) {
			return el >3;
		});
		test.assert(filteredList2.getAt(0) == 5 &&
					filteredList2.getAt(1) == 7 &&
					filteredList2.getAt(2) == 9, "Failed to populate doubly filtered list");

		// Check that changes to the source list propagate through both filterings
		list.splice(3, 4);
		test.assert(list.length == 7 &&
					list.getAt(0) == 1 && list.getAt(1) == 2 && list.getAt(2) == 3 && list.getAt(3) == 8 &&
					list.getAt(4) == 9 && list.getAt(5) == 10 && list.getAt(6) == 11, "Failed to splice list");		// 1,2,3,8,9,10,11

		test.assert(filteredList.length == 4 &&
					filteredList.getAt(0) == 1 && filteredList.getAt(1) == 3 &&
					filteredList.getAt(2) == 9 && filteredList.getAt(3) == 11, "Failed to filter first list");		// 1,3,9,11

		test.assert(filteredList2.length == 2 &&
					filteredList2.getAt(0) == 9 && filteredList2.getAt(1) == 11, "Failed to filter second list");	// 9, 11


		// Check that changes to the first filtered list propagate through to the second filtered list
		filteredList.pop();

		test.assert(list.length == 6 &&
					list.getAt(0) == 1 && list.getAt(1) == 2 && list.getAt(2) == 3 && list.getAt(3) == 8 &&					// 1,2,3,8,9,10
					list.getAt(4) == 9 && list.getAt(5) == 10, "Pop did not change sourcelist");

		test.assert(filteredList.length == 3 &&
					filteredList.getAt(0) == 1 && filteredList.getAt(1) == 3 &&
					filteredList.getAt(2) == 9, "Pop did not change first filtered list");							// 1,3,9

		test.assert(filteredList2.length == 1 &&
					filteredList2.getAt(0) == 9, "Pop did not change second filtered sourcelist");					// 9

		// insert into first filtered list.  Splicing at the filtered's list's "1" index should insert into the source list starting 
		// at value 3, which is at index 3 in the source list.
		filteredList.splice(1, 0, 110, 111);
		test.assert(list.length == 8 &&
					list.getAt(0) == 1 && list.getAt(1) == 2 && list.getAt(2) == 110 && list.getAt(3) == 111 &&
					list.getAt(4) == 3 && list.getAt(5) == 8 &&																						// 1,2,110,111,3,8,9,10
					list.getAt(6) == 9 && list.getAt(7) == 10, "Splice did not change sourcelist");

		test.assert(filteredList.length == 4 &&
					filteredList.getAt(0) == 1 && filteredList.getAt(1) == 111 &&
					filteredList.getAt(2) == 3 && filteredList.getAt(3) == 9, "splice did not change first filtered list");							// 1,111,3,9

		test.assert(filteredList2.length == 2 &&
					filteredList2.getAt(0) == 111 && filteredList2.getAt(1) == 9, "splice did not change second filtered sourcelist");				// 111,9

		// insert into second filtered list
		filteredList2.splice(1, 0, 112, 113);
		test.assert(list.length == 10 &&
					list.getAt(0) == 1 && list.getAt(1) == 2 && list.getAt(2) == 110 && list.getAt(3) == 111 && 
					list.getAt(4) == 3 && list.getAt(5) == 8 && list.getAt(6) == 112 && list.getAt(7) == 113 && 
					list.getAt(8) == 9 && list.getAt(9) == 10, "splice into list2 did not change sourcelist");										// 1,2,110,111,113,3,8,112,113,9,10
		test.assert(filteredList.length == 5 &&
					filteredList.getAt(0) == 1 && filteredList.getAt(1) == 111 && filteredList.getAt(2) == 3 &&
					filteredList.getAt(3) == 113 && filteredList.getAt(4) == 9, "splice into list2 did not change first filtered list");			// 1,111,3,113,9
		test.assert(filteredList2.length == 3 &&
					filteredList2.getAt(0) == 111 && filteredList2.getAt(1) == 113 &&
					filteredList2.getAt(2) == 9, "splice into list2 did not change second filtered sourcelist");									// 111,113,9
	},
	

	// ==========================================================================
	// 
	// Test Filtered List notifications
	//
	filteredListNotifications: function (test) {

		test.start("Filtered List notifications tests");

		test.nyi("Can't test onitemmutated, onitemmoved, or onreload since those are nyi");

		var list = new WinJS.Binding.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		list.listId = 0;
		var filteredList = list.createFiltered(function (el) {
			return el % 2;
		});
		filteredList.listId = 1;	// tag for test check below
		var filteredList2 = filteredList.createFiltered(function (el) {
			return el > 3;
		});
		filteredList2.listId = 2;	// tag for test check below

		var itemInsertedInfos = [];
		var itemRemovedInfos = [];
		var itemChangedInfos = [];
		var itemInsertedInfos2 = [];
		var itemRemovedInfos2 = [];
		var itemChangedInfos2 = [];

	    // set up listeners through addEventListeners
		var onInserted = function (eventInfo) { itemInsertedInfos.push(eventInfo); };
		var onRemoved = function (eventInfo) { itemRemovedInfos.push(eventInfo); };
		var onChanged = function (eventInfo) { itemChangedInfos.push(eventInfo); };
		list.addEventListener("iteminserted", onInserted);
		list.addEventListener("itemremoved", onRemoved);
		list.addEventListener("itemchanged", onChanged);
		filteredList.addEventListener("iteminserted", onInserted);
		filteredList.addEventListener("itemremoved", onRemoved);
		filteredList.addEventListener("itemchanged", onChanged);
		filteredList2.addEventListener("iteminserted", onInserted);
		filteredList2.addEventListener("itemremoved", onRemoved);
		filteredList2.addEventListener("itemchanged", onChanged);

		// set up listeners through direct events
		list.oniteminserted = function (eventInfo) { itemInsertedInfos2.push(eventInfo); }
		list.onitemremoved = function (eventInfo) { itemRemovedInfos2.push(eventInfo); }
		list.onitemchanged = function (eventInfo) { itemChangedInfos2.push(eventInfo); }
		filteredList.oniteminserted = function (eventInfo) { itemInsertedInfos2.push(eventInfo); }
		filteredList.onitemremoved = function (eventInfo) { itemRemovedInfos2.push(eventInfo); }
		filteredList.onitemchanged = function (eventInfo) { itemChangedInfos2.push(eventInfo); }
		filteredList2.oniteminserted = function (eventInfo) { itemInsertedInfos2.push(eventInfo); }
		filteredList2.onitemremoved = function (eventInfo) { itemRemovedInfos2.push(eventInfo); }
		filteredList2.onitemchanged = function (eventInfo) { itemChangedInfos2.push(eventInfo); }

		// Test removing item from base list - notification should go to all lists
		list.pop();
		test.assert(itemRemovedInfos.length == 3 && itemRemovedInfos2.length == 3, "1: Incorrect number of removal notifications");
		test.assert(itemRemovedInfos[0].target.listId == 2 && itemRemovedInfos[0].detail.value == 11, "1: Failed to notify removal from second filtered list");
		test.assert(itemRemovedInfos[1].target.listId == 1 && itemRemovedInfos[1].detail.value == 11, "1: Failed to notify removal from first filtered list");
		test.assert(itemRemovedInfos[2].target.listId == 0 && itemRemovedInfos[2].detail.value == 11, "1: Failed to notify removal from base list");
		test.assert(itemRemovedInfos2[0].target.listId == 2 && itemRemovedInfos2[0].detail.value == 11, "1: Failed to notify (via direct) removal from second filtered list");
		test.assert(itemRemovedInfos2[1].target.listId == 1 && itemRemovedInfos2[1].detail.value == 11, "1: Failed to notify (via direct) removal from first filtered list");
		test.assert(itemRemovedInfos2[2].target.listId == 0 && itemRemovedInfos2[2].detail.value == 11, "1: Failed to notify (via direct) removal from base list");

		// Test splicing to remove an item from list and first filteredlist but not second filtered list
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];

		list.splice(2, 1);
		test.assert(itemRemovedInfos.length == 2 && itemRemovedInfos2.length == 2, "2: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "2: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 0 && itemChangedInfos2.length == 0, "2: Incorrect number of change notifications");
		test.assert(itemRemovedInfos[0].target.listId == 1 && itemRemovedInfos[0].detail.value == 3, "2: Failed to notify removal from second filtered list");
		test.assert(itemRemovedInfos[1].target.listId == 0 && itemRemovedInfos[1].detail.value == 3, "2: Failed to notify removal from base list");
		test.assert(itemRemovedInfos2[0].target.listId == 1 && itemRemovedInfos2[1].detail.value == 3, "2: Failed to notify (via direct) removal from second filtered list");
		test.assert(itemRemovedInfos2[1].target.listId == 0 && itemRemovedInfos2[0].detail.value == 3, "2: Failed to notify (via direct) removal from first filtered list");

		// Test splicing to insert items
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];

		list.splice(2, 2, 13, 14);

		test.assert(itemRemovedInfos.length == 4 && itemRemovedInfos2.length == 4, "3: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 4 && itemInsertedInfos2.length == 4, "3: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 0 && itemChangedInfos2.length == 0, "3: Incorrect number of change notifications");

		test.assert(itemInsertedInfos[0].target.listId == 2 && itemInsertedInfos[0].detail.value == 13, "3a: Failed to notify insertion to list");
		test.assert(itemInsertedInfos[1].target.listId == 1 && itemInsertedInfos[1].detail.value == 13, "3b: Failed to notify insertion to list");
		test.assert(itemInsertedInfos[2].target.listId == 0 && itemInsertedInfos[2].detail.value == 13, "3c: Failed to notify insertion to list");
		test.assert(itemInsertedInfos[3].target.listId == 0 && itemInsertedInfos[3].detail.value == 14, "3d: Failed to notify insertion to list");
		test.assert(itemInsertedInfos2[0].target.listId == 2 && itemInsertedInfos2[0].detail.value == 13, "3a: Failed to notify (via direct) insertion to list");
		test.assert(itemInsertedInfos2[1].target.listId == 1 && itemInsertedInfos2[1].detail.value == 13, "3b: Failed to notify (via direct) insertion to list");
		test.assert(itemInsertedInfos2[2].target.listId == 0 && itemInsertedInfos2[2].detail.value == 13, "3c: Failed to notify (via direct) insertion to list");
		test.assert(itemInsertedInfos2[3].target.listId == 0 && itemInsertedInfos2[3].detail.value == 14, "3d: Failed to notify (via direct) insertion to list");

		test.assert(itemRemovedInfos[0].target.listId == 0 && itemRemovedInfos[0].detail.value == 4, "3e: Failed to notify removal from second filtered list");
		test.assert(itemRemovedInfos[1].target.listId == 2 && itemRemovedInfos[1].detail.value == 5, "3f: Failed to notify removal from base list");
		test.assert(itemRemovedInfos[2].target.listId == 1 && itemRemovedInfos[2].detail.value == 5, "3g: Failed to notify removal from base list");
		test.assert(itemRemovedInfos[3].target.listId == 0 && itemRemovedInfos[3].detail.value == 5, "3h: Failed to notify removal from base list");
		test.assert(itemRemovedInfos2[0].target.listId == 0 && itemRemovedInfos2[0].detail.value == 4, "3i: Failed to notify removal from second filtered list");
		test.assert(itemRemovedInfos2[1].target.listId == 2 && itemRemovedInfos2[1].detail.value == 5, "3j: Failed to notify removal from base list");
		test.assert(itemRemovedInfos2[2].target.listId == 1 && itemRemovedInfos2[2].detail.value == 5, "3k: Failed to notify removal from base list");
		test.assert(itemRemovedInfos2[3].target.listId == 0 && itemRemovedInfos2[3].detail.value == 5, "3l: Failed to notify removal from base list");


		// Test changing items
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];

		list.setAt(4, 53);
		list.setAt(5, 55);
		test.assert(itemRemovedInfos.length == 0 && itemRemovedInfos2.length == 0, "4: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 2 && itemInsertedInfos2.length == 2, "4: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 4 && itemChangedInfos2.length == 4, "4: Incorrect number of change notifications");

		test.assert(itemChangedInfos[0].target.listId == 0 && itemChangedInfos[0].detail.oldValue == 6 && itemChangedInfos[0].detail.newValue == 53, "4a: Failed to notify change to base list");
		test.assert(itemChangedInfos[1].target.listId == 2 && itemChangedInfos[1].detail.oldValue == 7 && itemChangedInfos[1].detail.newValue == 55, "4b: Failed to notify change to base list");
		test.assert(itemChangedInfos[2].target.listId == 1 && itemChangedInfos[2].detail.oldValue == 7 && itemChangedInfos[2].detail.newValue == 55, "4c: Failed to notify change to base list");
		test.assert(itemChangedInfos[3].target.listId == 0 && itemChangedInfos[3].detail.oldValue == 7 && itemChangedInfos[3].detail.newValue == 55, "4d: Failed to notify change to base list");
		test.assert(itemInsertedInfos[0].target.listId == 2 && itemInsertedInfos[0].detail.value == 53, "4e: Failed to notify change to base list");
		test.assert(itemInsertedInfos[1].target.listId == 1 && itemInsertedInfos[1].detail.value == 53, "4f: Failed to notify change to base list");

		// Test making changes to filtered list.
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];

		filteredList.setAt(2, 57);
		filteredList.pop();

		test.assert(itemRemovedInfos.length == 3 && itemRemovedInfos2.length == 3, "5: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "5: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 3 && itemChangedInfos2.length == 3, "5: Incorrect number of change notifications");

		test.assert(itemRemovedInfos[0].target.listId == 2 && itemRemovedInfos[0].detail.value == 9, "5a: Failed to notify removal from list");
		test.assert(itemRemovedInfos[1].target.listId == 1 && itemRemovedInfos[1].detail.value == 9, "5b Failed to notify removal from list");
		test.assert(itemRemovedInfos[2].target.listId == 0 && itemRemovedInfos[2].detail.value == 9, "5c Failed to notify removal from list");

		test.assert(itemChangedInfos[0].target.listId == 2 && itemChangedInfos[0].detail.oldValue == 53 && itemChangedInfos[0].detail.newValue == 57, "5d: Failed to notify change to base list");
		test.assert(itemChangedInfos[1].target.listId == 1 && itemChangedInfos[1].detail.oldValue == 53 && itemChangedInfos[1].detail.newValue == 57, "5e: Failed to notify change to base list");
		test.assert(itemChangedInfos[2].target.listId == 0 && itemChangedInfos[2].detail.oldValue == 53 && itemChangedInfos[2].detail.newValue == 57, "5f: Failed to notify change to base list");

		// Test making changes to second-filtered list.
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];

		filteredList2.setAt(1, 59);
		filteredList.pop();
		/*
		console.log(itemInsertedInfos);
		console.log(itemRemovedInfos);
		console.log(itemChangedInfos);
		console.log(itemInsertedInfos2);
		console.log(itemRemovedInfos2);
		console.log(itemChangedInfos2);

		console.log(list._getValues());
		console.log(filteredList._getValues());
		console.log(filteredList2._getValues());*/

		test.assert(itemRemovedInfos.length == 3 && itemRemovedInfos2.length == 3, "6: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "6: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 3 && itemChangedInfos2.length == 3, "6: Incorrect number of change notifications");
		test.assert(itemRemovedInfos[0].target.listId == 2 && itemRemovedInfos[0].detail.value == 55, "6a: Failed to notify removal from second filtered list");
		test.assert(itemRemovedInfos[1].target.listId == 1 && itemRemovedInfos[1].detail.value == 55, "6b: Failed to notify removal from base list");
		test.assert(itemRemovedInfos[2].target.listId == 0 && itemRemovedInfos[2].detail.value == 55, "6c: Failed to notify removal from base list");
		test.assert(itemChangedInfos[0].target.listId == 2 && itemChangedInfos[0].detail.oldValue == 57 && itemChangedInfos[0].detail.newValue == 59, "6g: Failed to notify change to base list");
		test.assert(itemChangedInfos[1].target.listId == 1 && itemChangedInfos[1].detail.oldValue == 57 && itemChangedInfos[1].detail.newValue == 59, "6h: Failed to notify change to base list");
		test.assert(itemChangedInfos[2].target.listId == 0 && itemChangedInfos[2].detail.oldValue == 57 && itemChangedInfos[2].detail.newValue == 59, "6i: Failed to notify change to base list");

	    // Cleanup:
		list.removeEventListener("iteminserted", onInserted);
		list.removeEventListener("itemremoved", onRemoved);
		list.removeEventListener("itemchanged", onChanged);
		filteredList.removeEventListener("iteminserted", onInserted);
		filteredList.removeEventListener("itemremoved", onRemoved);
		filteredList.removeEventListener("itemchanged", onChanged);
		filteredList2.removeEventListener("iteminserted", onInserted);
		filteredList2.removeEventListener("itemremoved", onRemoved);
		filteredList2.removeEventListener("itemchanged", onChanged);
	}
});
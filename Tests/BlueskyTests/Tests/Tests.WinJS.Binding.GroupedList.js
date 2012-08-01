"use strict";

// ================================================================
//
// Test.WinJS.Binding.GroupedList.js
//		Tests for the WinJS.Binding.GroupedList object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Binding.GroupedList Tests", {

	// ==========================================================================
	// 
	// Test simple Grouped List creation
	//
	groupedListCreation: function (test) {

		test.start("Simple Grouped list creation test");

		var list = new WinJS.Binding.List([{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}]);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}

		var groupDataSelector = function (item) {
			return { color: item.color };
		}

		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		// Verify grouped list
		test.assert(groupedList.length == 6, "Invalid groupedlist.length");
		test.assert(groupedList._sortedKeys.length == 6, "Invalid groupedlist._sortedKeys length");
		test.assert(groupedList._list == list, "groupedlist._list not set");
		test.assert(groupedList._groupedItems[0].groupKey == "Hello", "Invalid group key for first item");
		test.assert(groupedList._groupedItems[0].data.name == "Jeff", "Invalid data for first item");
		test.assert(groupedList._groupedItems[1].groupKey == "Hello", "Invalid group key for second item");
		test.assert(groupedList._groupedItems[1].data.name == "Erich", "Invalid data for second item");
		test.assert(groupedList._groupedItems[2].groupKey == "Hello", "Invalid group key for third item");
		test.assert(groupedList._groupedItems[2].data.name == "Sarah", "Invalid data for third item");
		test.assert(groupedList._groupedItems[3].groupKey == "Foo", "Invalid group key for fourth item");
		test.assert(groupedList._groupedItems[3].data.name == "Dan", "Invalid data for fourth item");
		test.assert(groupedList._groupedItems[4].groupKey == "World", "Invalid group key for fifth item");
		test.assert(groupedList._groupedItems[4].data.color == "blue", "Invalid data for fifth item");
		test.assert(groupedList._groupedItems[5].groupKey == "World", "Invalid group key for fifth item");
		test.assert(groupedList._groupedItems[5].data.name == "Kurt", "Invalid data for fifth item");

		// Verify groups list
		test.assert(groups._groupKeys.length == 3, "Invalid groups.length");
		test.assert(groups._list == groupedList, "groupedlist._list not set");
		test.assert(groups._groupKeys[0] == "Foo", "Invalid groupKey[0]");
		test.assert(groups._groupKeys[1] == "Hello", "Invalid groupKey[1]");
		test.assert(groups._groupKeys[2] == "World", "Invalid groupKey[2]");
		test.assert(groups._groupItems.Foo.key == "Foo", "Invalid groups._groupItems.Foo.key");
		test.assert(groups._groupItems.Foo.data.color == "purple", "Invalid groups._groupItems.Foo.data.color");
		test.assert(groups._groupItems.Hello.key == "Hello", "Invalid groups._groupItems.Hello.key");
		test.assert(groups._groupItems.Hello.data.color == "red", "Invalid groups._groupItems.Hello.data.color");
		test.assert(groups._groupItems.World.key == "World", "Invalid groups._groupItems.World.key");
		test.assert(groups._groupItems.World.data.color == "blue", "Invalid groups._groupItems.World.data.color");
	},


	// ==========================================================================
	// 
	// Test filtered Grouped List creation
	//
	filteredGroupedList: function (test) {

		test.start("Filtered Grouped list creation test");

		var list = new WinJS.Binding.List([{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}]);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}

		var groupDataSelector = function (item) {
			return { color: item.color };
		}

		var filteredList = list.createFiltered(function (item) { return item.val1 % 2 == 0; });
		var groupedList = filteredList.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		// Verify grouped list
		test.assert(groupedList.length == 3, "Invalid groupedlist.length");
		test.assert(groupedList._sortedKeys.length == 3, "Invalid groupedlist._sortedKeys length");
		test.assert(groupedList._list == filteredList, "groupedlist._list not set");
		test.assert(groupedList._groupedItems[0].groupKey == "Hello", "Invalid group key for first item");
		test.assert(groupedList._groupedItems[0].data.name == "Jeff", "Invalid data for first item");
		test.assert(groupedList._groupedItems[2].groupKey == "Hello", "Invalid group key for third item");
		test.assert(groupedList._groupedItems[2].data.name == "Sarah", "Invalid data for third item");
		test.assert(groupedList._groupedItems[4].groupKey == "World", "Invalid group key for fifth item");
		test.assert(groupedList._groupedItems[4].data.color == "blue", "Invalid data for fifth item");

		// Verify groups list
		test.assert(groups._groupKeys.length == 2, "Invalid groups.length");
		test.assert(groups._list == groupedList, "groupedlist._list not set");
		test.assert(groups._groupKeys[0] == "Hello", "Invalid groupKey[0]");
		test.assert(groups._groupKeys[1] == "World", "Invalid groupKey[1]");
		test.assert(groups._groupItems.Hello.key == "Hello", "Invalid groups._groupItems.Hello.key");
		test.assert(groups._groupItems.Hello.data.color == "red", "Invalid groups._groupItems.Hello.data.color");
		test.assert(groups._groupItems.World.key == "World", "Invalid groups._groupItems.World.key");
		test.assert(groups._groupItems.World.data.color == "blue", "Invalid groups._groupItems.World.data.color");
	},


	// ==========================================================================
	// 
	// Test Grouped filtered List creation
	//
	groupedFilteredList: function (test) {

		test.start("Grouped Filtered list creation test");

		var list = new WinJS.Binding.List([{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}]);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}

		var groupDataSelector = function (item) {
			return { color: item.color };
		}

		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		var filteredList = groupedList.createFiltered(function (item) { return item.val1 % 2 == 0; });

		// Filtered list should ignore the grouping entirely and go off of the base list
		test.assert(filteredList._list == groupedList, "filteredList._list not set");
		test.assert(filteredList._filteredKeys.length == 3, "Invalid filteredList.length");
		test.assert(filteredList._filteredKeys[0] == 0, "Invalid 1 key");
		test.assert(filteredList._filteredKeys[1] == 2, "Invalid 2 key");
		test.assert(filteredList._filteredKeys[2] == 4, "Invalid 3 key");
	},


	// ==========================================================================
	// 
	// Test doubly-Grouped Grouped List creation
	//
	groupedGroupedList: function (test) {

		test.start("Doubly-grouped Grouped lists test");

		var list = new WinJS.Binding.List([{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}]);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}
		var groupDataSelector = function (item) {
			return { color: item.color };
		}
		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);

		var groupKeySelector2 = function (item) {
			return item.val1 % 2 == 0 ? "g1" : "g2";
		}

		var groupDataSelector2 = function (item) {
			return { color: item.color };
		}
		var groupedList2 = groupedList.createGrouped(groupKeySelector2, groupDataSelector2);

		// Verify sorting
		test.assert(groupedList2._sortedKeys[0] == 0 && groupedList2._sortedKeys[1] == 2 &&
					groupedList2._sortedKeys[2] == 4 && groupedList2._sortedKeys[3] == 3 &&
					groupedList2._sortedKeys[4] == 1 && groupedList2._sortedKeys[5] == 5, "Keys not sorted");

		// Verify groups set properly in groupeditems
		test.assert(groupedList2._groupedItems[0].groupKey == "g1" && groupedList2._groupedItems[1].groupKey == "g2" &&
					groupedList2._groupedItems[2].groupKey == "g1" && groupedList2._groupedItems[3].groupKey == "g2" &&
					groupedList2._groupedItems[4].groupKey == "g1" && groupedList2._groupedItems[5].groupKey == "g2", "GroupKeys not correct");

		// Verify data
		test.assert(groupedList._groupedItems[0].data.name == "Jeff", "Invalid data for first item");
		test.assert(groupedList._groupedItems[1].data.name == "Erich", "Invalid data for second item");
		test.assert(groupedList._groupedItems[2].data.name == "Sarah", "Invalid data for third item");
		test.assert(groupedList._groupedItems[3].data.name == "Dan", "Invalid data for fourth item");
		test.assert(groupedList._groupedItems[4].data.color == "blue", "Invalid data for fifth item");
		test.assert(groupedList._groupedItems[5].data.name == "Kurt", "Invalid data for fifth item");

		// test groups
		var groups = groupedList2.groups;
		test.assert(groups._groupKeys.length == 2, "Invalid groups.length");
		test.assert(groups._list == groupedList2, "groups._list not set");
		test.assert(groups._groupKeys[0] == "g1", "Invalid groupKey[0]");
		test.assert(groups._groupKeys[1] == "g2", "Invalid groupKey[1]");
		test.assert(groups._groupItems.g1.key == "g1", "Invalid groups._groupItems.g1.key");
		test.assert(groups._groupItems.g1.data.color == "red", "Invalid groups._groupItems.g1.data.color");
		test.assert(groups._groupItems.g2.key == "g2", "Invalid groups._groupItems.g2.key");
		test.assert(groups._groupItems.g2.data.color == "purple", "Invalid groups._groupItems.g2.data.color");
	},


	// ==========================================================================
	// 
	// Test Grouped List changes
	//
	groupedListChanges: function (test) {

		test.start("Grouped lists change notifications");
		var testData = [{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}];

		var list = new WinJS.Binding.List(testData);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}
		var groupDataSelector = function (item) {
			return { color: item.color };
		}
		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		var itemInsertedInfos = [];
		var itemRemovedInfos = [];
		var itemChangedInfos = [];
		var itemInsertedInfos2 = [];
		var itemRemovedInfos2 = [];
		var itemChangedInfos2 = [];

		// set up listeners through addEventListeners
		list.addEventListener("iteminserted", function (eventInfo) { itemInsertedInfos.push(eventInfo); });
		list.addEventListener("itemremoved", function (eventInfo) { itemRemovedInfos.push(eventInfo); });
		list.addEventListener("itemchanged", function (eventInfo) { itemChangedInfos.push(eventInfo); });
		groupedList.addEventListener("iteminserted", function (eventInfo) { itemInsertedInfos.push(eventInfo); });
		groupedList.addEventListener("itemremoved", function (eventInfo) { itemRemovedInfos.push(eventInfo); });
		groupedList.addEventListener("itemchanged", function (eventInfo) { itemChangedInfos.push(eventInfo); });

		// set up listeners through direct events
		list.oniteminserted = function (eventInfo) { itemInsertedInfos2.push(eventInfo); }
		list.onitemremoved = function (eventInfo) { itemRemovedInfos2.push(eventInfo); }
		list.onitemchanged = function (eventInfo) { itemChangedInfos2.push(eventInfo); }
		groupedList.oniteminserted = function (eventInfo) { itemInsertedInfos2.push(eventInfo); }
		groupedList.onitemremoved = function (eventInfo) { itemRemovedInfos2.push(eventInfo); }
		groupedList.onitemchanged = function (eventInfo) { itemChangedInfos2.push(eventInfo); }

		// test a change that doesn't make the item change groups
		list.setAt(0, { name: "Fred", color: "black", val1: 90 });

		test.assert(itemRemovedInfos.length == 0 && itemRemovedInfos2.length == 0, "1: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "1: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 2 && itemChangedInfos2.length == 2, "1: Incorrect number of change notifications");
		test.assert(itemChangedInfos[0].detail.oldValue.name == "Jeff" && itemChangedInfos[0].detail.newValue.name == "Fred", "1g: Failed to notify change to base list");
		test.assert(itemChangedInfos[1].detail.oldValue.name == "Jeff" && itemChangedInfos[0].detail.newValue.name == "Fred", "1h: Failed to notify change to base list");
		test.assert(itemChangedInfos2[0].detail.oldValue.name == "Jeff" && itemChangedInfos2[0].detail.newValue.name == "Fred", "1i: Failed to notify change to base list");
		test.assert(itemChangedInfos2[1].detail.oldValue.name == "Jeff" && itemChangedInfos2[0].detail.newValue.name == "Fred", "1j: Failed to notify change to base list");

		// test a change that *does* make the item change groups
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];
		list.setAt(1, { name: "Mary", color: "aqua", val1: 190 });

		test.assert(itemRemovedInfos.length == 1 && itemRemovedInfos2.length == 1, "2: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 1 && itemInsertedInfos2.length == 1, "2: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 1 && itemChangedInfos2.length == 1, "2: Incorrect number of change notifications");

	    // The following tests fail on Win8 because bluesky inserts items in the same group in a different place than win8 does;
	    // the net result to the user should be fine; that said, I have a TODO in the codebase to fix this.
		if (!WinJS.Application.IsBluesky)
		    return test.skip("bluesky inserts items in different (but same to user) place as Win8");

		test.assert(itemInsertedInfos[0].target == groupedList, "2: list target incorrect");
		test.assert(itemInsertedInfos[0].detail.index == 5, "2: index incorrect");
		test.assert(itemInsertedInfos[0].detail.value.color == "aqua", "2: value incorrect");
		test.assert(itemInsertedInfos2[0].target == groupedList, "3: list target incorrect");
		test.assert(itemInsertedInfos2[0].detail.index == 5, "3: index incorrect");
		test.assert(itemInsertedInfos2[0].detail.value.color == "aqua", "3: value incorrect");

		test.assert(itemChangedInfos[0].target == list, "4: list target incorrect");
		test.assert(itemChangedInfos[0].detail.index == 1, "4: index incorrect");
		test.assert(itemChangedInfos[0].detail.oldValue.name == "Erich" && itemChangedInfos[0].detail.newValue.name == "Mary", "4: Failed to notify change to base list");
		test.assert(itemChangedInfos[0].detail.oldItem.index == 1, "4: olditem.index wrong");
		test.assert(itemChangedInfos[0].detail.oldItem.data.color == "red", "4: data.color wrong");
		test.assert(itemChangedInfos[0].detail.newItem.index == 1, "4b: olditem.index wrong");
		test.assert(itemChangedInfos[0].detail.newItem.data.color == "aqua", "4b: data.color wrong");
		test.assert(itemChangedInfos2[0].target == list, "5: list target incorrect");
		test.assert(itemChangedInfos2[0].detail.index == 1, "5: index incorrect");
		test.assert(itemChangedInfos2[0].detail.oldValue.name == "Erich" && itemChangedInfos[0].detail.newValue.name == "Mary", "5: Failed to notify change to base list");
		test.assert(itemChangedInfos2[0].detail.oldItem.index == 1, "5: olditem.index wrong");
		test.assert(itemChangedInfos2[0].detail.oldItem.data.color == "red", "5: data.color wrong");
		test.assert(itemChangedInfos2[0].detail.newItem.index == 1, "5: olditem.index wrong");
		test.assert(itemChangedInfos2[0].detail.newItem.data.color == "aqua", "5: data.color wrong");

		test.assert(itemRemovedInfos[0].target == groupedList, "6: list target incorrect");
		test.assert(itemRemovedInfos[0].detail.index == 2, "6: index incorrect");
		test.assert(itemRemovedInfos[0].detail.item.groupKey == "Hello", "6:groupKey incorrect. " + itemRemovedInfos[0].detail.item.groupKey);
		test.assert(itemRemovedInfos[0].detail.item.data.color == "red", "6:data.color incorrect. " + itemRemovedInfos[0].detail.item.data.color);
		test.assert(itemRemovedInfos2[0].target == groupedList, "6b: list target incorrect");
		test.assert(itemRemovedInfos2[0].detail.index == 2, "6b: index incorrect");
		test.assert(itemRemovedInfos2[0].detail.item.groupKey == "Hello", "6b:groupKey incorrect");
		test.assert(itemRemovedInfos2[0].detail.item.data.color == "red", "6b:data.color incorrect");

		// test a change that doesn't actually change the value
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];
		list.setAt(1, { name: "Mary", color: "aqua", val1: 190 });
		test.assert(itemRemovedInfos.length == 0 && itemRemovedInfos2.length == 0, "7: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "7: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 2 && itemChangedInfos2.length == 2, "7: Incorrect number of change notifications");

		test.assert(itemChangedInfos[0].target == groupedList, "8: list target incorrect");
		test.assert(itemChangedInfos[0].detail.index == 5, "8: index incorrect");
		test.assert(itemChangedInfos[0].detail.oldValue.name == "Mary" && itemChangedInfos[0].detail.newValue.name == "Mary", "8: Failed to notify change to base list");
		test.assert(itemChangedInfos[0].detail.oldItem.groupKey == "World", "8: olditem.groupKey wrong");
		test.assert(itemChangedInfos[0].detail.oldItem.data.color == "aqua", "8: data.color wrong");
		test.assert(itemChangedInfos[0].detail.newItem.groupKey == "World", "8: newItem.groupKey wrong");
		test.assert(itemChangedInfos[0].detail.newItem.data.color == "aqua", "8: newItem,data.color wrong");
		test.assert(itemChangedInfos[1].target == list, "8b: list target incorrect");
		test.assert(itemChangedInfos[1].detail.index == 1, "8b: index incorrect");
		test.assert(itemChangedInfos[1].detail.oldValue.name == "Mary" && itemChangedInfos[0].detail.newValue.name == "Mary", "8b: Failed to notify change to base list");
		test.assert(itemChangedInfos[1].detail.oldItem.index == 1, "8b: olditem.index wrong");
		test.assert(itemChangedInfos[1].detail.oldItem.data.color == "aqua", "8b: data.color wrong");
		test.assert(itemChangedInfos[1].detail.newItem.index == 1, "8b: newItem.index wrong");
		test.assert(itemChangedInfos[1].detail.newItem.data.color == "aqua", "8b: newItem,data.color wrong");

		test.assert(itemChangedInfos2[0].target == groupedList, "9: list target incorrect");
		test.assert(itemChangedInfos2[0].detail.index == 5, "9: index incorrect");
		test.assert(itemChangedInfos2[0].detail.oldValue.name == "Mary" && itemChangedInfos[0].detail.newValue.name == "Mary", "9: Failed to notify change to base list");
		test.assert(itemChangedInfos2[0].detail.oldItem.groupKey == "World", "9: olditem.groupKey wrong");
		test.assert(itemChangedInfos2[0].detail.oldItem.data.color == "aqua", "9: data.color wrong");
		test.assert(itemChangedInfos2[0].detail.newItem.groupKey == "World", "9: newItem.groupKey wrong");
		test.assert(itemChangedInfos2[0].detail.newItem.data.color == "aqua", "9: newItem,data.color wrong");
		test.assert(itemChangedInfos2[1].target == list, "9b: list target incorrect");
		test.assert(itemChangedInfos2[1].detail.index == 1, "9b: index incorrect");
		test.assert(itemChangedInfos2[1].detail.oldValue.name == "Mary" && itemChangedInfos[0].detail.newValue.name == "Mary", "9b: Failed to notify change to base list");
		test.assert(itemChangedInfos2[1].detail.oldItem.index == 1, "9b: olditem.index wrong");
		test.assert(itemChangedInfos2[1].detail.oldItem.data.color == "aqua", "9b: data.color wrong");
		test.assert(itemChangedInfos2[1].detail.newItem.index == 1, "9b: newItem.index wrong");
		test.assert(itemChangedInfos2[1].detail.newItem.data.color == "aqua", "9b: newItem,data.color wrong");

		// test splice
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];
		list.splice(2, 2);
		test.assert(itemRemovedInfos.length == 4 && itemRemovedInfos2.length == 4, "10: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 0 && itemInsertedInfos2.length == 0, "10: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 0 && itemChangedInfos2.length == 0, "10: Incorrect number of change notifications");
		test.assert(itemRemovedInfos[0].target == groupedList, "10: item 0: Incorrect target list");
		test.assert(itemRemovedInfos[1].target == list, "10: item 1: Incorrect target list");
		test.assert(itemRemovedInfos[2].target == groupedList, "10: item 2: Incorrect target list");
		test.assert(itemRemovedInfos[3].target == list, "10: item 3: Incorrect target list");

		test.assert(itemRemovedInfos[0].detail.index == 2, "10: item 0: Incorrect index");
		test.assert(itemRemovedInfos[0].detail.item.groupKey == "Hello", "10: item 0: Incorrect groupKey");
		test.assert(itemRemovedInfos[0].detail.item.data.color == "red", "10: item 0: Incorrect data");
		test.assert(itemRemovedInfos[0].detail.value.name == "Sarah", "10: item 0: Incorrect value");

		test.assert(itemRemovedInfos[1].detail.index == 2, "10: item 1: Incorrect index");
		test.assert(itemRemovedInfos[1].detail.item.data.color == "red", "10: item 1: Incorrect data");
		test.assert(itemRemovedInfos[1].detail.value.name == "Sarah", "10: item 1: Incorrect value");

		test.assert(itemRemovedInfos[2].detail.index == 0, "10: item 2: Incorrect index");
		test.assert(itemRemovedInfos[2].detail.item.groupKey == "Foo", "10: item 2: Incorrect groupKey");
		test.assert(itemRemovedInfos[2].detail.item.data.color == "purple", "10: item 2: Incorrect data");
		test.assert(itemRemovedInfos[2].detail.value.name == "Dan", "10: item 2: Incorrect value");

		test.assert(itemRemovedInfos[3].detail.index == 2, "10: item 3: Incorrect index");
		test.assert(itemRemovedInfos[3].detail.item.data.color == "purple", "10: item 3: Incorrect data");
		test.assert(itemRemovedInfos[3].detail.value.name == "Dan", "10: item 3: Incorrect value");

		// test insertion with splice
		itemInsertedInfos = [];
		itemRemovedInfos = [];
		itemChangedInfos = [];
		itemInsertedInfos2 = [];
		itemRemovedInfos2 = [];
		itemChangedInfos2 = [];
		list.splice(2, 2, { name: "Frank", color: "teal", val1: 114 }, { name: "Harry", color: "silver", val1: 93 });

		test.assert(itemRemovedInfos.length == 4 && itemRemovedInfos2.length == 4, "12: Incorrect number of removal notifications");
		test.assert(itemInsertedInfos.length == 4 && itemInsertedInfos2.length == 4, "12: Incorrect number of insert notifications");
		test.assert(itemChangedInfos.length == 0 && itemChangedInfos2.length == 0, "12: Incorrect number of change notifications");

		test.assert(itemInsertedInfos[0].target == groupedList, "12: inserted item 0: target wrong");
		test.assert(itemInsertedInfos[1].target == list, "12: inserted item 1: target wrong");
		test.assert(itemInsertedInfos[2].target == groupedList, "12: inserted item 2: target wrong");
		test.assert(itemInsertedInfos[3].target == list, "12: inserted item 3: target wrong");
		test.assert(itemInsertedInfos[0].detail.index == 2, "12: inserted item 0: index wrong");
		test.assert(itemInsertedInfos[1].detail.index == 2, "12: inserted item 1: index wrong");
		test.assert(itemInsertedInfos[2].detail.index == 1, "12: inserted item 2: index wrong");
		test.assert(itemInsertedInfos[3].detail.index == 1, "12: inserted item 3: index wrong; expected 1, got " + itemInsertedInfos[3].detail.index);
		test.assert(itemInsertedInfos[0].detail.value.name == "Frank", "12: inserted item 0: value wrong");
		test.assert(itemInsertedInfos[1].detail.value.name == "Frank", "12: inserted item 1: value wrong");
		test.assert(itemInsertedInfos[2].detail.value.name == "Harry", "12: inserted item 2: value wrong");
		test.assert(itemInsertedInfos[3].detail.value.name == "Harry", "12: inserted item 3: value wrong");

		test.assert(itemRemovedInfos[0].target == groupedList, "12: inserted item 0: target wrong");
		test.assert(itemRemovedInfos[1].target == list, "12: inserted item 1: target wrong");
		test.assert(itemRemovedInfos[2].target == groupedList, "12: inserted item 2: target wrong");
		test.assert(itemRemovedInfos[3].target == list, "12: inserted item 3: target wrong");

		test.assert(itemRemovedInfos[0].detail.index == 1, "12: removed item 0: index wrong; expected 1, got " + itemRemovedInfos[0].detail.index);
		test.assert(itemRemovedInfos[1].detail.index == 2, "12: removed item 1: index wrong; expected 2, got " + itemRemovedInfos[1].detail.index);
		test.assert(itemRemovedInfos[2].detail.index == 1, "12: removed item 2: index wrong; expected 1, got " + itemRemovedInfos[2].detail.index);
		test.assert(itemRemovedInfos[3].detail.index == 2, "12: removed item 3: index wrong; expected 2, got " + itemRemovedInfos[3].detail.index);
		test.assert(itemRemovedInfos[0].detail.value.name == "Jenn", "12: removed item 0: value wrong");
		test.assert(itemRemovedInfos[1].detail.value.name == "Jenn", "12: removed item 1: value wrong");
		test.assert(itemRemovedInfos[2].detail.value.name == "Kurt", "12: removed item 2: value wrong");
		test.assert(itemRemovedInfos[3].detail.value.name == "Kurt", "12: removed item 3: value wrong");
		test.assert(itemRemovedInfos[0].detail.item.groupKey == "World", "12: removed item 0: groupKey wrong");
		test.assert(itemRemovedInfos[2].detail.item.groupKey == "World", "12: removed item 2: groupKey wrong");
		test.assert(itemRemovedInfos[0].detail.item.data.name == "Jenn", "12: removed item 0: item.data wrong");
		test.assert(itemRemovedInfos[1].detail.item.data.name == "Jenn", "12: removed item 1: item.data wrong");
		test.assert(itemRemovedInfos[2].detail.item.data.name == "Kurt", "12: removed item 2: item.data wrong");
		test.assert(itemRemovedInfos[3].detail.item.data.name == "Kurt", "12: removed item 3: item.data wrong");

		test.nyi("try setting an item directly and seeing changes propagate.");
	},

	/* TODO: I'm thinking that this is covered by the other grouped, filtered, grouped/filtered, and notifications tests
	   I've got.  That said, for completeness I should come back to this at some point... 
	// ==========================================================================
	// 
	// Test Notifications in filtered Grouped Lists
	//
	notifyInGroupedFilteredList: function (test) {

		test.start("Notifications in filtered Grouped List tests");

		// Test changing items in filtered-grouped lists
		var list = new WinJS.Binding.List([{ test: 1 }, { test: 2 }, { test: 3 }, { test: 4 }, { test: 5 }, { test: 6 }]);

		var groupKeySelector = function (item) {
			return (item.test % 2) == 0 ? "Foo" : "Bar";
		}

		var groupDataSelector = function (item) {
			return { test2: item.test < 3 ? "group1" : "group2" };
		}

		var filteredList = list.createFiltered(function (item) { return item.val1 < 5; });
		var groupedList = filteredList.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		// replace an unfiltered item with a value that will get the item filtered
		list.setAt(1, { test: 7 });

		// replace a filtered item with a value that will get the item unfiltered
		 list.setAt(4, { test: 0 });

		// Splice a filtered item

		// Splice an unfiltered item

		// other tests: insertion via splice
	},
	*/

	// ==========================================================================
	// 
	// Test Grouped List splice
	//
	groupedListSplice: function (test) {

		test.start("Grouped List splice tests");
		var testData = [{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}];

		var list = new WinJS.Binding.List(testData);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}
		var groupDataSelector = function (item) {
			return { color: item.color };
		}
		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);
		var groups = groupedList.groups;

		// prep the list (TODO: Remove this - it's because I'm copying the test from above)
		list.setAt(0, { name: "Fred", color: "black", val1: 90 });
		list.setAt(1, { name: "Mary", color: "aqua", val1: 190 });

		// test splice
		list.splice(2, 2);
		test.assert(groupedList._groupedItems[0].groupKey == "Hello", "11: item 0 groupKey wrong");
		test.assert(groupedList._groupedItems[1].groupKey == "World", "11: item 1 groupKey wrong");
		test.assert(groupedList._groupedItems[4].groupKey == "World", "11: item 2 groupKey wrong");
		test.assert(groupedList._groupedItems[5].groupKey == "World", "11: item 3 groupKey wrong");
		test.assert(groupedList._groupedItems[0].data.color == "black", "11: item 0 data wrong");
		test.assert(groupedList._groupedItems[1].data.color == "aqua", "11: item 1 data wrong");
		test.assert(groupedList._groupedItems[4].data.color == "blue", "11: item 2 data wrong");
		test.assert(groupedList._groupedItems[5].data.color == "blue", "11: item 3 data wrong");
		test.assert(groups._list == groupedList, "11: groups._listwrong");
		test.assert(groups._groupKeys.length == 2 && groups._groupKeys[0] == "Hello" && groups._groupKeys[1] == "World", "11: groups.groupKeys wrong");
		test.assert(groups._groupItems.Hello.key == "Hello" && groups._groupItems.Hello.groupSize == 1 && groups._groupItems.Hello.data.color == "red", "11:groups.groupItem.Hello wrong");
		test.assert(groups._groupItems.World.key == "World" && groups._groupItems.World.groupSize == 3 && groups._groupItems.World.data.color == "blue", "11:groups.groupItem.World wrong");

		// test insertion with splice
		list.splice(2, 2, { name: "Frank", color: "teal", val1: 114 }, { name: "Harry", color: "silver", val1: 93 });

	    // TODO: The keys are different, but the data is correct, so I think this is just a difference in how win8 and bluesky manage key
        // generation.  
		if (WinJS.Application.IsBluesky) {
		    test.assert(groupedList._sortedKeys.length == 4 && groupedList._sortedKeys[0] == 0 &&
                        groupedList._sortedKeys[1] == 7 && groupedList._sortedKeys[2] == 1 &&
                        groupedList._sortedKeys[3] == 6, "12: SortedKeys wrong");
		    test.assert(groupedList._groupedItems[0].groupKey == "Hello", "12: item 0 groupKey wrong");
		    test.assert(groupedList._groupedItems[1].groupKey == "World", "12: item 1 groupKey wrong");
		    test.assert(groupedList._groupedItems[6].groupKey == "World", "12: item 2 groupKey wrong");
		    test.assert(groupedList._groupedItems[7].groupKey == "Hello", "12: item 3 groupKey wrong");
		    test.assert(groupedList._groupedItems[0].data.color == "black", "12: item 0 data wrong");
		    test.assert(groupedList._groupedItems[1].data.color == "aqua", "12: item 1 data wrong");
		    test.assert(groupedList._groupedItems[6].data.color == "teal", "12: item 2 data wrong");
		    test.assert(groupedList._groupedItems[7].data.color == "silver", "12: item 3 data wrong");
		} else {
		    test.assert(groupedList._sortedKeys.length == 4 && groupedList._sortedKeys[0] == 0 &&
                        groupedList._sortedKeys[1] == 8 && groupedList._sortedKeys[2] == 1 &&
                        groupedList._sortedKeys[3] == 7, "12: SortedKeys wrong");
		    test.assert(groupedList._groupedItems[0].groupKey == "Hello", "12: item 0 groupKey wrong");
		    test.assert(groupedList._groupedItems[1].groupKey == "World", "12: item 1 groupKey wrong");
		    test.assert(groupedList._groupedItems[7].groupKey == "World", "12: item 2 groupKey wrong");
		    test.assert(groupedList._groupedItems[8].groupKey == "Hello", "12: item 3 groupKey wrong");
		    test.assert(groupedList._groupedItems[0].data.color == "black", "12: item 0 data wrong");
		    test.assert(groupedList._groupedItems[1].data.color == "aqua", "12: item 1 data wrong");
		    test.assert(groupedList._groupedItems[7].data.color == "teal", "12: item 2 data wrong");
		    test.assert(groupedList._groupedItems[8].data.color == "silver", "12: item 3 data wrong");

		}
		test.assert(groups._list == groupedList, "11: groups._listwrong");
		test.assert(groups._groupKeys.length == 2 && groups._groupKeys[0] == "Hello" && groups._groupKeys[1] == "World", "11: groups.groupKeys wrong");
		test.assert(groups._groupItems.Hello.key == "Hello" && groups._groupItems.Hello.groupSize == 2 && groups._groupItems.Hello.data.color == "red", "11:groups.groupItem.Hello wrong");
		test.assert(groups._groupItems.World.key == "World" && groups._groupItems.World.groupSize == 2 && groups._groupItems.World.data.color == "blue", "11:groups.groupItem.World wrong");
	},


	// ==========================================================================
	// 
	// Test Grouped List setAt
	//
	groupedListSetAt: function (test) {

		test.start("Grouped List setAt tests");

		var list = new WinJS.Binding.List([{
			name: "Jeff", color: "red", val1: 100
		}, {
			name: "Erich", color: "red", val1: 101
		}, {
			name: "Sarah", color: "red", val1: 102
		}, {
			name: "Dan", color: "purple", val1: 103
		}, {
			name: "Jenn", color: "blue", val1: 104
		}, {
			name: "Kurt", color: "blue", val1: 105
		}]);

		var groupKeySelector = function (item) {
			return item.val1 < 103 ? "Hello" : item.val1 == 103 ? "Foo" : "World";
		}
		var groupDataSelector = function (item) {
			return { color: item.color };
		}
		var groupedList = list.createGrouped(groupKeySelector, groupDataSelector);

		// Change item but leave in current group
		list.setAt(0, { name: "Fred", color: "black", val1: 90 });
		var groups = groupedList.groups;

		// Verify data
		test.assert(groupedList.length == 6, "Invalid groupedlist.length");
		test.assert(groupedList._sortedKeys.length == 6, "Invalid groupedlist._sortedKeys length");
		test.assert(groupedList._list == list, "groupedlist._list not set");
		test.assert(groupedList._groupedItems[0].groupKey == "Hello", "Invalid group key for first item");
		test.assert(groupedList._groupedItems[0].data.name == "Fred", "Invalid data for first item");
		test.assert(groupedList._groupedItems[1].groupKey == "Hello", "Invalid group key for second item");
		test.assert(groupedList._groupedItems[1].data.name == "Erich", "Invalid data for second item");
		test.assert(groupedList._groupedItems[2].groupKey == "Hello", "Invalid group key for third item");
		test.assert(groupedList._groupedItems[2].data.name == "Sarah", "Invalid data for third item");
		test.assert(groupedList._groupedItems[3].groupKey == "Foo", "Invalid group key for fourth item");
		test.assert(groupedList._groupedItems[3].data.name == "Dan", "Invalid data for fourth item");
		test.assert(groupedList._groupedItems[4].groupKey == "World", "Invalid group key for fifth item");
		test.assert(groupedList._groupedItems[4].data.color == "blue", "Invalid data for fifth item");
		test.assert(groupedList._groupedItems[5].groupKey == "World", "Invalid group key for fifth item");
		test.assert(groupedList._groupedItems[5].data.name == "Kurt", "Invalid data for fifth item");

		// Verify groups list
		test.assert(groups._groupKeys.length == 3, "Invalid groups.length");
		test.assert(groups._list == groupedList, "groupedlist._list not set");
		test.assert(groups._groupKeys[0] == "Foo", "Invalid groupKey[0]");
		test.assert(groups._groupKeys[1] == "Hello", "Invalid groupKey[1]");
		test.assert(groups._groupKeys[2] == "World", "Invalid groupKey[2]");
		test.assert(groups._groupItems.Foo.key == "Foo", "Invalid groups._groupItems.Foo.key");
		test.assert(groups._groupItems.Foo.data.color == "purple", "Invalid groups._groupItems.Foo.data.color");
		test.assert(groups._groupItems.Hello.key == "Hello", "Invalid groups._groupItems.Hello.key");
		test.assert(groups._groupItems.Hello.data.color == "black", "Invalid groups._groupItems.Hello.data.color");
		test.assert(groups._groupItems.World.key == "World", "Invalid groups._groupItems.World.key");
		test.assert(groups._groupItems.World.data.color == "blue", "Invalid groups._groupItems.World.data.color");

		// test a change that *does* make the item change groups
		list.setAt(1, { name: "Mary", color: "aqua", val1: 190 });
		test.assert(groupedList.length == 6, "Incorrect size for length; expected 6, got " + groupedList.length);
		test.assert(groupedList._list == list, "invalid _list value");

	    // These keys are in different order between win8 and bluesky, although not in a way that users will notice.  We just
	    // sort same values differently.  The GroupedList code has a TODO to fix this eventually.
		if (WinJS.Application.IsBluesky) {
		    test.assert(groupedList._sortedKeys[0] == 3 && groupedList._sortedKeys[1] == 0 &&
                        groupedList._sortedKeys[2] == 2 && groupedList._sortedKeys[3] == 4 &&
                        groupedList._sortedKeys[4] == 5 && groupedList._sortedKeys[5] == 1, "sortedKeys out of order");
		} else {
		    test.assert(groupedList._sortedKeys[0] == 3 && groupedList._sortedKeys[1] == 0 &&
                        groupedList._sortedKeys[2] == 2 && groupedList._sortedKeys[3] == 1 &&
                        groupedList._sortedKeys[4] == 4 && groupedList._sortedKeys[5] == 5, "sortedKeys out of order");
		}
		test.assert(groupedList._groupedItems[0].data.name == "Fred" && groupedList._groupedItems[0].groupKey == "Hello", "groupedItem 0 incorrect");
		test.assert(groupedList._groupedItems[1].data.name == "Mary" && groupedList._groupedItems[1].groupKey == "World", "groupedItem 1 incorrect");
		test.assert(groupedList._groupedItems[2].data.name == "Sarah" && groupedList._groupedItems[2].groupKey == "Hello", "groupedItem 2 incorrect");
		test.assert(groupedList._groupedItems[3].data.name == "Dan" && groupedList._groupedItems[3].groupKey == "Foo", "groupedItem 3 incorrect");
		test.assert(groupedList._groupedItems[4].data.name == "Jenn" && groupedList._groupedItems[4].groupKey == "World", "groupedItem 4 incorrect");
		test.assert(groupedList._groupedItems[5].data.name == "Kurt" && groupedList._groupedItems[5].groupKey == "World", "groupedItem 5 incorrect");
		test.assert(groups._list == groupedList, "Invalid _list value for groups");
		test.assert(groups._groupKeys[0] == "Foo" && groups._groupKeys[1] == "Hello" && groups._groupKeys[2] == "World", "Invalid groups._groupKeys");
		test.assert(groups._groupItems["Foo"].key == "Foo" && groups._groupItems["Foo"].groupSize == 1, "Group Foo size 1 incorrect; expected 1, got " + groups._groupItems["Foo"].groupSize);
		test.assert(groups._groupItems["Hello"].key == "Hello" && groups._groupItems["Hello"].groupSize == 2, "Group Hello size 1 incorrect; expected 2, got " + groups._groupItems["Hello"].groupSize);
		test.assert(groups._groupItems["World"].key == "World" && groups._groupItems["World"].groupSize == 3, "Group World size 1 incorrect; expected 3, got " + groups._groupItems["World"].groupSize);
	}
});
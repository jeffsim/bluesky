"use strict";

// ================================================================
//
// Test.WinJS.Binding.List.js
//		Tests for the WinJS.Binding.List object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Binding.List Tests", {

	// ==========================================================================
	// 
	// Test simple list creation
	//
	listCreation: function (test) {

		test.start("Simple list creation test");

		// test empty list creation
		var list = new WinJS.Binding.List();
		test.assert(list._currentKey !== undefined, "Failed to create a List");

		// test list creation with values
		var testData = { test: 4 };
		list = new WinJS.Binding.List(["a", 1, testData]);
		test.assert(list.length == 3 &&
					list.getAt(0) == "a" &&
					list.getAt(1) == 1 &&
					list.getAt(2) == testData, "Failed to create list with values");
	},


	// ==========================================================================
	// 
	// Test list.push
	//
	listPush: function (test) {

		test.start("List.push tests");

		// Verify pushed items appear in the list
		var list = new WinJS.Binding.List(["a", "b"]);
		list.push("c");
		list.push("d");
		test.assert(list.getAt(0) == "a" &&
					list.getAt(1) == "b" &&
					list.getAt(2) == "c" &&
					list.getAt(3) == "d", "Failed to push items into list");

		// Verify that we get notified when items are pushed onto the list
		var itemWasInserted = false;
		list.addEventListener("iteminserted", function (eventInfo) {
			itemWasInserted = eventInfo && eventInfo.detail.value == "e";
		});
		list.push("e");
		test.assert(itemWasInserted, "Failed to get notified of insertion on push");
	},


	// ==========================================================================
	// 
	// Test list.pop
	//
	listPop: function (test) {

		test.start("List.pop tests");

		// Pop some items
		var list = new WinJS.Binding.List(["a", "b", "c", "d"]);
		var val1 = list.pop();
		var val2 = list.pop();

		// Verify popped items are correct
		test.assert(val1 == "d" && val2 == "c", "Popped values are incorrect");

		// Verify what remains of the list is correct
		test.assert(list.getAt(0) == "a" &&
					list.getAt(1) == "b" &&
					list.length == 2, "Failed to push items into list");

		// Verify that we get notified when items are popped from the list
		var itemWasPopped = false;
		list.addEventListener("itemremoved", function (eventInfo) {
			itemWasPopped = eventInfo && eventInfo.detail.value == "b";
		});
		list.pop();
		test.assert(itemWasPopped, "Failed to get notified of removal on pop");
	},

	

	// ==========================================================================
	// 
	// Test list.splice
	//
	listSplice: function (test) {

		test.start("List.splice tests");

		// Splice some items
		var list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);
		var removedItems = list.splice(1, 3);

		// Verify that the splice worked and that it returned the removed items
		var item0 = list.getItem(0);
		var item1 = list.getItem(1);
		test.assert(list.length == 2 && item0.data == "a"&& item1.data == "e", "Failed to splice list");
		test.assert(removedItems.length == 3 &&
					removedItems[0] == "b" &&
					removedItems[1] == "c" &&
					removedItems[2] == "d", "Failed to return removed items");

		// Verify that we get notified when items are spliced out of the list
		var itemWasSpliced = false;
		var removedItemsNotify = [];
		list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);
		list.addEventListener("itemremoved", function (eventInfo) {
			removedItemsNotify.push(eventInfo.detail.value);
		});
		var removedItems = list.splice(1, 2);
		test.assert(removedItemsNotify[0] == "b" &&
					removedItemsNotify[1] == "c", "Failed to get notified of removal on splice");

		// Test specifying items to insert in place of spliced items
		var list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);
		var removedItems = list.splice(1, 3, "hello", 45, "world");
		test.assert(removedItems.length == 3 &&
			removedItems[0] == "b" &&
			removedItems[1] == "c" &&
			removedItems[2] == "d", "Failed to return removed items when splicing with new items");
		var item0 = list.getItem(0);
		var item1 = list.getItem(1);
		var item2 = list.getItem(2);
		var item3 = list.getItem(3);
		var item4 = list.getItem(4);

		test.assert(list.length == 5 &&
					item0.data == "a" && 
					item1.data == "hello" && 
					item2.data == 45 && 
					item3.data == "world" && 
					item4.data == "e", "Failed to splice list with new items");

		// test notifications when splicing with insertion.
		var itemWasSpliced = false;
		var removedItemsNotify = [];
		var insertedItemsNotify = [];
		list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);
		list.addEventListener("itemremoved", function (eventInfo) {
			removedItemsNotify.push(eventInfo.detail.value);
		});
		list.addEventListener("iteminserted", function (eventInfo) {
			insertedItemsNotify.push(eventInfo.detail.value);
		});
		var removedItems = list.splice(1, 3, "Hello", 45);

		test.assert(removedItemsNotify.length == 3 &&
					removedItemsNotify[0] == "b" &&
					removedItemsNotify[1] == "c" &&
					removedItemsNotify[2] == "d", "Failed to get notified of removal on splice with new items");

		test.assert(insertedItemsNotify.length == 2 &&
					insertedItemsNotify[0] == "Hello" &&
					insertedItemsNotify[1] == 45, "Failed to get notified of insertion on splice with new items");
	},

	
	// ==========================================================================
	// 
	// Test list.setAt
	//
	listSetAt: function (test) {

		test.start("List.setAt tests");

		// setAt some items
		var list = new WinJS.Binding.List(["a", "b", "c", "d","e"]);
		list.setAt(2, 4);		// test number
		list.setAt(4, "Hello");	// test string
		list.setAt(5, "World");	// test setAt end
		list.setAt(15, "Foo");	// test setAt past end

		test.assert(list.length == 6 &&
					list.getAt(0) == "a" &&
					list.getAt(1) == "b" &&
					list.getAt(2) == 4 &&
					list.getAt(3) == "d" &&
					list.getAt(4) == "Hello" &&
					list.getAt(5) == "World", "Failed to setAt");

		// Verify that we get change notifications
		list.addEventListener("itemchanged", function (eventInfo) {
			test.assert(eventInfo.detail.index == 2, "itemChanged notification - Index is incorrect");
			test.assert(eventInfo.detail.newItem.data == 14, "itemChanged notification - newItem is incorrect");
			test.assert(eventInfo.detail.newValue == 14, "itemChanged notification - newValue is incorrect");
			test.assert(eventInfo.detail.oldItem.data == 4, "itemChanged notification - oldItem is incorrect");
			test.assert(eventInfo.detail.oldValue == 4, "itemChanged notification - oldValue is incorrect");
		});
		list.setAt(2, 14);
	},


	// ==========================================================================
	// 
	// Test list.concat
	//
	listConcat: function (test) {

		test.start("List.concat tests");

		// Verify concat works
		var list = new WinJS.Binding.List(["a", "b"]);

		var list2 = list.concat(["c", "d"]);
		test.assert(list2[0] == "a" &&
					list2[1] == "b" &&
					list2[2] == "c" &&
					list2[3] == "d", "Failed to concat items");
	},


	// ==========================================================================
	// 
	// Test list.slice
	//
	listSlice: function (test) {

		test.start("List.slice tests");

		// Verify slice works
		var list = new WinJS.Binding.List(["a", "b","c","d","e","f"]);

		var list2 = list.slice(2,4);
		test.assert(list2[0] == "c" && list2[1] == "d", "Failed to slice list");
	},


	// ==========================================================================
	// 
	// Test list.forEach
	//
	listForEach: function (test) {

		test.start("List.forEach tests");

		// Verify forEach works
		var testData = ["a", "b", "c"];
		var list = new WinJS.Binding.List(testData);
		var testThis = { a: 1 };

		var valid = true;
		var validThis = true;
		list.forEach(function (element, index, c) {

			// verify this is the right element
			valid &= testData[index] == element;

			// verify 'this' was set correctly
			validThis &= this == testThis;
		}, testThis);

		test.assert(valid, "Failed to enumerate in forEach");
		test.assert(validThis, "Failed to set 'this' in forEach");
	},


	// ==========================================================================
	// 
	// Test list.map
	//
	listMap: function (test) {

		test.start("List.map tests");

		// Verify forEach works
		var testData = ["a", "b", "c"];
		var list = new WinJS.Binding.List(testData);
		var testThis = { a: 1 };

		var valid = true;
		var validThis = true;
		var result = list.map(function (element, index, c) {

			// verify this is the right element
			valid &= testData[index] == element;

			// verify 'this' was set correctly
			validThis &= this == testThis;
			return element;
		}, testThis);

		test.assert(valid, "Failed to enumerate in map");
		test.assert(validThis, "Failed to set 'this' in map");

		// verify result
		test.assert(result[0] == "a" && result[1] == "b" && result[2] == "c", "Failed to return map");
	},


	// ==========================================================================
	// 
	// Test list.some
	//
	listSome: function (test) {

		test.start("List.some tests");

		// Verify forEach works
		var testData = ["a", "b", "c"];
		var list = new WinJS.Binding.List(testData);
		var testThis = { a: 1 };

		var valid = true;
		var validThis = true;
		var result = list.some(function (element, index, c) {

			// verify this is the right element
			valid &= testData[index] == element;

			// verify 'this' was set correctly
			validThis &= this == testThis;
			return element == "a";
		}, testThis);
		test.assert(valid, "Failed to enumerate in some");
		test.assert(validThis, "Failed to set 'this' in some");
		// verify result
		test.assert(result == true, "Failed in some with result = true");

		// try false
		result = list.some(function (element, index, c) {
			return element == "d";
		}, testThis);

		// verify result
		test.assert(result == false, "Failed in some with result = false");
	},


	// ==========================================================================
	// 
	// Test list.every
	//
	listEvery: function (test) {

		test.start("List.every tests");

		// Verify forEach works
		var testData = ["a1", "a2", "a3"];
		var list = new WinJS.Binding.List(testData);
		var testThis = { a: 1 };

		var valid = true;
		var validThis = true;
		var result = list.some(function (element, index, c) {

			// verify this is the right element
			valid &= testData[index] == element;

			// verify 'this' was set correctly
			validThis &= this == testThis;
			return element[0] == "a";
		}, testThis);

		test.assert(valid, "Failed to enumerate in every");
		test.assert(validThis, "Failed to set 'this' in every");
		// verify result
		test.assert(result == true, "Failed in every with result = true");

		// try false
		result = list.every(function (element, index, c) {
			return element[1] == "2";
		}, testThis);

		// verify result
		test.assert(result == false, "Failed in every with result = false");
	},


	// ==========================================================================
	// 
	// Test list.reduce
	//
	listReduce: function (test) {

		test.start("List.reduce tests");

		// Verify forEach works
		var testData = [100, 200, 350];
		var list = new WinJS.Binding.List(testData);

		var valid = true;
		var result = list.reduce(function (previousValue, currentValue, index, array) {
			valid &= (currentValue == array[index]);
			valid &= (currentValue == testData[index]);
			return currentValue * 2;
		});
		test.assert(valid, "Unexpected order");
		test.assert(result == 700, "Failed in reduce without initial value");

		// try with initial value
		var valid = true;
		var result = list.reduce(function (previousValue, currentValue, index, array) {
			return previousValue * 2 + currentValue;
		}, 500);
		test.assert(result == 5150, "Failed in reduce with initial value");
	},


	// ==========================================================================
	// 
	// Test list.reduceRight
	//
	listReduceRight: function (test) {

		test.start("List.reduceRight tests");

		// Verify forEach works
		var testData = [100, 200, 350];
		var list = new WinJS.Binding.List(testData);

		var valid = true;
		var result = list.reduceRight(function (previousValue, currentValue, index, array) {
			valid &= (currentValue == array[index]);
			valid &= (currentValue == testData[index]);
			return currentValue * 2;
		});
		test.assert(valid, "Unexpected order");
		test.assert(result == 200, "Failed in reduce without initial value");

		// try with initial value
		var valid = true;
		var result = list.reduceRight(function (previousValue, currentValue, index, array) {
			return previousValue * 2 + currentValue;
		}, 500);
		test.assert(result == 5900, "Failed in reduce with initial value");
	},


	// ==========================================================================
	// 
	// Test list.filter
	//
	listFilter: function (test) {

		test.start("List.filter tests");

		// Verify forEach works
		var testData = [100, 200, 350];
		var list = new WinJS.Binding.List(testData);

		var valid = true;
		var result = list.filter(function (element, index, array) {
			return element < 250;
		});
		test.assert(result.length == 2 && result[0] == 100 && result[1] == 200, "Unexpected array returned from List.filter");
	},


	// ==========================================================================
	// 
	// Test list.join
	//
	listJoin: function (test) {

		test.start("List.join tests");

		// Verify filter works
		var testData = [100,200,350];
		var list = new WinJS.Binding.List(testData);

		// try without separator
		var result = list.join(",");
		test.assert(result == "100,200,350", "join without separator failed");

		// try with separator
		var result = list.join("|");
		test.assert(result == "100|200|350", "join with separator failed");
	},


	// ==========================================================================
	// 
	// Test list.indexOf
	//
	listIndexOf: function (test) {

		test.start("List.indexOf tests");

		// Verify indexOf works
		var testData = [100, 200, "Hello", 300, "World", 300, "Foo"];
		var list = new WinJS.Binding.List(testData);

		test.assert(list.indexOf(200) == 1, "Index of number is incorrect");
		test.assert(list.indexOf("World") == 4, "Index of string is incorrect");
		test.assert(list.indexOf(300) == 3, "Index of number with dupe entry is incorrect");

		// test fromIndex
		test.assert(list.indexOf(300, 0) == 3, "first Index with fromIndex is incorrect");
		test.assert(list.indexOf(300, 3) == 3, "second Index with fromIndex is incorrect");
		test.assert(list.indexOf(300, 4) == 5, "third Index with fromIndex is incorrect");
	},


	// ==========================================================================
	// 
	// Test list.lastIndexOf
	//
	listLastIndexOf: function (test) {

		test.start("List.lastIndexOf tests");

		// Verify lastIndexOf works
		var testData = [100, 200, "Hello", 300, "World", 300, "Foo"];
		var list = new WinJS.Binding.List(testData);
		test.assert(list.lastIndexOf(200) == 1, "Index of number is incorrect");
		test.assert(list.lastIndexOf("World") == 4, "Index of string is incorrect");
		test.assert(list.lastIndexOf(300) == 5, "Index of number with dupe entry is incorrect");

		// test fromIndex
		test.assert(list.lastIndexOf(300, 0) == -1, "first Index with fromIndex is incorrect");
		test.assert(list.lastIndexOf(300, 3) == 3, "second Index with fromIndex is incorrect");
		test.assert(list.lastIndexOf(300, 4) == 3, "third Index with fromIndex is incorrect");
	},


	// ==========================================================================
	// 
	// Test list.getAt
	//
	listGetAt: function (test) {

		test.start("List.getAt tests");

		// Verify lastIndexOf works
		var testData = [100, 200, "Hello", 300, "World", 300, "Foo"];
		var list = new WinJS.Binding.List(testData);

		test.assert(list.getAt(0) == testData[0], "Failed to getAt(0)");
		test.assert(list.getAt(1) == testData[1], "Failed to getAt(1)");
		test.assert(list.getAt(2) == testData[2], "Failed to getAt(2)");
	},


	// ==========================================================================
	// 
	// Test list.getItem
	//
	listGetItem: function (test) {

		test.start("List.getItem tests");

		// Verify lastIndexOf works
		var testData = [100, 200, "Hello", 300, "World", 300, "Foo"];
		var list = new WinJS.Binding.List(testData);

		test.assert(list.getItem(0).data == testData[0], "Failed to getItem(0)");
		test.assert(list.getItem(1).data == testData[1], "Failed to getItem(1)");
		test.assert(list.getItem(2).data == testData[2], "Failed to getItem(2)");
	},


	// ==========================================================================
	// 
	// Test list.getItemFromKey
	//
	listGetItemFromKey: function (test) {

		test.start("List.getItemFromKey tests");

		// Verify lastIndexOf works
		var testData = [100, 200, "Hello", 300, "World", 300, "Foo"];
		var list = new WinJS.Binding.List(testData);

		var item1 = list.getItem(1);
		var item2 = list.getItem(2);

		test.assert(list.getItemFromKey(item1.key).data == testData[1], "Failed to getItemFromKey(1)");
		test.assert(list.getItemFromKey(item2.key).data == testData[2], "Failed to getItemFromKey(2)");
	},
	

	// ==========================================================================
	// 
	// Test list.length
	//
	listLength: function (test) {

		test.start("List.length tests");

		// Verify list length getter is working
		var list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);

		test.assert(list.length == 5, "List length not set at start");

		list.push("f");
		test.assert(list.length == 6, "List length incorrect after push");
		list.pop();
		test.assert(list.length == 5, "List length incorrect after pop");

		// Verify list length setter is working
		list.length = 2;
		test.assert(list.length == 2, "List setter did not work");

		// verify that we get remove notifications when list is shortened or grown via list.length.
		list = new WinJS.Binding.List(["a", "b", "c", "d", "e"]);
		var removedItems = [];
		list.addEventListener("itemremoved", function (eventInfo) {
			removedItems.push(eventInfo.detail.value);
		});
		list.length = 2;
		test.assert(removedItems.length == 3 &&
					removedItems[0] == "c" &&
					removedItems[1] == "d" &&
					removedItems[2] == "e", "Failed to get notified of changes in length setter");

		// verify that setting length to > current length leaves it at current length
		list.length = 100;
		test.assert(list.length == 2, "setting length to 100 failed");
	},


	// ==========================================================================
	// 
	// Test list.addEventListener
	//
	listAddEventListener: function (test) {

		test.start("List.addEventListener tests");

		var list = new WinJS.Binding.List(["a", "b","c","d","e"]);

		// Add the known event listeners and ensure they trigger
		list.addEventListener("iteminserted", function (eventInfo) {
			test.assert(eventInfo.detail.value == "hello", "iteminserted notification - value is incorrect");
		});

		list.addEventListener("itemremoved", function (eventInfo) {
			test.assert(eventInfo.detail.value == "hello", "itemremoved notification - value is incorrect");
		});

		list.addEventListener("itemchanged", function (eventInfo) {
			test.assert(eventInfo.detail.index == 4, "itemChanged notification - Index is incorrect");
			test.assert(eventInfo.detail.newItem.data == 45, "itemChanged notification - newItem is incorrect");
			test.assert(eventInfo.detail.newValue == 45, "itemChanged notification - newValue is incorrect");
			test.assert(eventInfo.detail.oldItem.data == "e", "itemChanged notification - oldItem is incorrect");
			test.assert(eventInfo.detail.oldValue == "e", "itemChanged notification - oldValue is incorrect");

		});

		list.setAt(4, 45);
		list.push("hello");
		list.pop();

		test.nyi("onitemmoved listener test (functionality in List is nyi)");
		test.nyi("onitemmutated listener test (functionality in List is nyi)");
		test.nyi("onreload listener test (functionality in List is nyi)");
	},

});
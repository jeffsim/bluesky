"use strict";

// ================================================================
//
// Test.Windows.Storage.ApplicationDataContainerSettings.js
//		Tests for Windows.Storage.ApplicationDataContainerSettings
//
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.ApplicationDataContainerSettings Tests", {

    // ==========================================================================
    // 
    // Test ApplicationDataContainerSettings.clear
    //
    clear: function (test) {

        test.start("ApplicationDataContainerSettings.clear tests");
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);
        test1.values["test1value1"] = "abc";
        test1.values["test1value2"] = "123";
        test2.values["test2value1"] = "xyz";
        test2.values["test2value2"] = "789";
        test1.values.clear();

        test.assert(!test1.values["test1value1"], "v1 not cleared");
        test.assert(!test1.values["test1value2"], "v2 not cleared");
        test.assert(test2.values["test2value1"] == "xyz", "2v1 cleared");
        test.assert(test2.values["test2value2"] == "789", "2v2 cleared");

        // cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");
    },

    // ==========================================================================
    // 
    // Test ApplicationDataContainerSettings.getView
    //
    getView: function (test) {

        test.start("ApplicationDataContainerSettings.getView tests");
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);
        test1.values["test1value1"] = "abc";
        test1.values["test1value2"] = "123";
        test2.values["test2value1"] = "xyz";
        test2.values["test2value2"] = "789";
        var v1 = new Windows.Storage.ApplicationDataCompositeValue();
        v1.val1 = "hello"; v1.val2 = "world";
        test1.values["test1comp"] = v1;
        var v2 = new Windows.Storage.ApplicationDataCompositeValue();
        v2.val1 = "red"; v2.val2 = "dog";
        test2.values["test2comp"] = v2;

        // test getView
        var view = test1.values.getView();
        test.assert(view.size == 3, "View size incorrect");
        test.assert(view.test1value1 == "abc", "1 View value 1 incorrect");
        test.assert(view.test1value2 == "123", "2 View value 2 incorrect");
        test.assert(view.test1comp.val2 == "world", "View composite value incorrect");

        // Test nonmutability of the source
        view.test1value1 = "hello";

        var view2 = test1.values.getView();
        test.assert(view2.size == 3, "View size incorrect");
        test.assert(view2.test1value1 == "abc", "3 View value 1 incorrect");
        test.assert(view2.test1value2 == "123", "4 View value 2 incorrect");
        test.assert(view2.test1comp.val2 == "world", "View composite value incorrect");

        // Now test with roaming folder

        // test getView
        var view2 = test2.values.getView();
        test.assert(view2.size == 3, "View size incorrect");
        test.assert(view2.test2value1 == "xyz", "5 View value 1 incorrect");
        test.assert(view2.test2value2 == "789", "6 View value 2 incorrect");
        test.assert(view2.test2comp.val2 == "dog", "View composite value incorrect");

        // Test nonmutability of the source
        view2.test1value1 = "hello";

        var view3 = test2.values.getView();
        test.assert(view3.size == 3, "View size incorrect");
        test.assert(view3.test2value1 == "xyz", "7 View value 1 incorrect");
        test.assert(view3.test2value2 == "789", "8 View value 2 incorrect");
        test.assert(view3.test2comp.val2 == "dog", "View composite value incorrect");

        // cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");
    },


    // ==========================================================================
    // 
    // Test ApplicationDataContainerSettings.insert and remove
    //
    insertRemove: function (test) {

        test.start("ApplicationDataContainerSettings.insert and remove tests");
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);
        test1.values["test1value1"] = "abc";
        test1.values["test1value2"] = "123";
        test2.values["test2value1"] = "xyz";
        test2.values["test2value2"] = "789";

        test1.values.insert("test3", "hello");
        test1.values.insert("test1value2", "world");
        test2.values.insert("test4", "after");
        test2.values.insert("test2value2", "dinner");

        // test lookup while we're at it
        test.assert(test1.values.test3 == "hello", "test3 not set");
        test.assert(test1.values["test3"] == "hello", "2 test3 not set");
        test.assert(test1.values.lookup("test3") == "hello", "2 lookup 1 not set");

        test.assert(test1.values.test1value2 == "world", "test1value2 not set");
        test.assert(test1.values["test1value2"] == "world", "2 test1value2 not set");
        test.assert(test1.values.lookup("test1value2") == "world", "2 lookup 2 not set");

        test.assert(test2.values.test4 == "after", "test4 not set");
        test.assert(test2.values["test4"] == "after", "2 test4 not set");
        test.assert(test2.values.lookup("test4") == "after", "2 lookup 3 not set");

        test.assert(test2.values.test2value2 == "dinner", "test4 not set");
        test.assert(test2.values["test2value2"] == "dinner", "2 test4 not set");
        test.assert(test2.values.lookup("test2value2") == "dinner", "2 lookup 4 not set");

        var view1 = test1.values.getView();
        test.assert(view1.size == 3, "View size incorrect");
        test.assert(view1.test3 == "hello", "test3 not set");

        test.assert(view1["test3"] == "hello", "2 test3 not set");
        test.assert(view1.test1value2 == "world", "test1value2 not set");
        test.assert(view1["test1value2"] == "world", "2 test1value2 not set");

        var view2 = test2.values.getView();
        test.assert(view2.test4 == "after", "test4 not set");
        test.assert(view2["test4"] == "after", "2 test4 not set");
        test.assert(view2.test2value2 == "dinner", "test4 not set");
        test.assert(view2["test2value2"] == "dinner", "2 test4 not set");

        // cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");

        test.nyi("first() - NYI");
        test.nyi("mapchanged - NYI");
    },
});
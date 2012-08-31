"use strict";

// ================================================================
//
// Test.Windows.Storage.ApplicationDataContainer.js
//		Tests for Windows.Storage.ApplicationDataContainer
//
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.ApplicationDataContainer Tests", {
    
    // ==========================================================================
    // 
    // Test ApplicationDataContainer.locality
    //
    locality: function (test) {

        test.start("ApplicationDataContainer.locality tests");

        // Test pre-defined settings containers
        test.assert(appData.localSettings.locality == Windows.Storage.ApplicationDataLocality.local, "localSettings locality wrong");
        test.assert(appData.roamingSettings.locality == Windows.Storage.ApplicationDataLocality.roaming, "roamingSettings locality wrong");

        // Test custom created settings containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

        test.assert(test1.locality == Windows.Storage.ApplicationDataLocality.local, "test1 locality wrong");
        test.assert(test2.locality == Windows.Storage.ApplicationDataLocality.roaming, "test2 locality wrong");

        // cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");
    },


    // ==========================================================================
    // 
    // Test ApplicationDataContainer.name
    //
    name: function (test) {

        test.start("ApplicationDataContainer.name tests");

        // Test pre-defined settings containers
        test.assert(appData.localSettings.name == "", "localSettings name wrong.  " + appData.localSettings.name);
        test.assert(appData.roamingSettings.name == "", "roamingSettings name wrong");
            
        // Test custom created settings containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

        test.assert(test1.name == "testContainer1", "test1 name wrong");
        test.assert(test2.name == "testContainer2", "test2 name wrong");

        // Test "level 2" custom created settings containers
        var test1b = appData.localSettings.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2b = appData.roamingSettings.createContainer("testContainer2b", Windows.Storage.ApplicationDataCreateDisposition.always);

        test.assert(test1b.name == "testContainer1b", "test1b name wrong");
        test.assert(test2b.name == "testContainer2b", "test2b name wrong");

        // cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");
    },
    

    // ==========================================================================
    // 
    // Test ApplicationDataContainer.createContainer
    //
    createContainer: function (test) {

        test.start("ApplicationDataContainer.createContainer tests");

        // Test create in predefined containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

        test.assert(test1.name == "testContainer1", "test1 wrong");
        test.assert(test2.name == "testContainer2", "test2 wrong");

        // Test "level 1" create in custom containers
        var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2b = test2.createContainer("testContainer2b", Windows.Storage.ApplicationDataCreateDisposition.always);
            
        test.assert(test1b.name == "testContainer1b", "test1b wrong");
        test.assert(test2b.name == "testContainer2b", "test2b wrong");
            
        // Test "level 2" custom created settings containers
        var test1c = test1b.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2c = test2b.createContainer("testContainer2c", Windows.Storage.ApplicationDataCreateDisposition.always);

        test.assert(test1c.name == "testContainer1c", "test1c name wrong");
        test.assert(test2c.name == "testContainer2c", "test2c name wrong");

        //cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");
    },


    // ==========================================================================
    // 
    // Test ApplicationDataContainer.deleteContainer
    //
    deleteContainer: function (test) {

        test.start("ApplicationDataContainer.deleteContainer tests");

        // create custom containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.localSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test3 = appData.roamingSettings.createContainer("testContainer3", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test4 = appData.roamingSettings.createContainer("testContainer4", Windows.Storage.ApplicationDataCreateDisposition.always);

        // create child containers
        var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test1c = test1.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);

        // verify they're present
        test.assert(appData.localSettings.containers["testContainer1"], "Container 1 not created");
        test.assert(appData.localSettings.containers["testContainer2"], "Container 2 not created");
        test.assert(appData.roamingSettings.containers["testContainer3"], "Container 3 not created");
        test.assert(appData.roamingSettings.containers["testContainer4"], "Container 4 not created");

        // delete some
        test1.deleteContainer("testContainer1b");
        appData.localSettings.deleteContainer("testContainer2");
        appData.roamingSettings.deleteContainer("testContainer3");

        test.assert(!test1.containers.hasKey("testContainer1b"), "testContainer1b not deleted");
        test.assert(test1.containers.hasKey("testContainer1c"), "testContainer1c deleted");
        test.assert(appData.localSettings.containers.hasKey("testContainer1"), "testContainer1 not found");
        test.assert(!appData.roamingSettings.containers.hasKey("testContainer2"), "testContainer2 not deleted");
        test.assert(!appData.roamingSettings.containers.hasKey("testContainer3"), "testContainer3 not deleted");
        test.assert(appData.roamingSettings.containers.hasKey("testContainer4"), "testContainer4 not found");

        //cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer4");
    },


    // ==========================================================================
    // 
    // Test ApplicationDataContainer.deleteContainer
    //
    containers: function (test) {

        test.start("ApplicationDataContainer.containers tests");

        // create custom containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.localSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test3 = appData.roamingSettings.createContainer("testContainer3", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test4 = appData.roamingSettings.createContainer("testContainer4", Windows.Storage.ApplicationDataCreateDisposition.always);
        
        // create child containers
        var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test1c = test1.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);

        // Verify presence and hasKey()
        test.assert(appData.localSettings.containers.hasKey("testContainer1"), "testContainer1 not found");
        test.assert(appData.localSettings.containers.testContainer1, "2: testContainer1 not found");
        test.assert(appData.localSettings.containers.hasKey("testContainer2"), "testContainer2 not found");
        test.assert(appData.localSettings.containers.testContainer2, "2: testContainer2 not found");
        test.assert(appData.roamingSettings.containers.hasKey("testContainer3"), "testContainer3 not found");
        test.assert(appData.roamingSettings.containers.testContainer3, "2: testContainer3 not found");
        test.assert(appData.roamingSettings.containers.hasKey("testContainer4"), "testContainer4 not found");
        test.assert(appData.roamingSettings.containers.testContainer4, "2: testContainer4 not found");
        test.assert(test1.containers.hasKey("testContainer1b"), "testContainer1b not found");
        test.assert(test1.containers.testContainer1b, "2: testContainer1b not found");
        test.assert(test1.containers.hasKey("testContainer1c"), "testContainer1c not found");
        test.assert(test1.containers.testContainer1c, "2: testContainer1c not found");

        // verify lookup
        test.assert(appData.localSettings.containers.lookup("testContainer1").name == test1.name, "testContainer1 lookup failed");
        test.assert(appData.localSettings.containers.lookup("testContainer2").name == test2.name, "testContainer2 lookup failed");
        test.assert(appData.roamingSettings.containers.lookup("testContainer3").name == test3.name, "testContainer3 lookup failed");
        test.assert(appData.roamingSettings.containers.lookup("testContainer4").name == test4.name, "testContainer4 lookup failed");
        test.assert(test1.containers.lookup("testContainer1b").name == test1b.name, "testContainer1b lookup failed");
        test.assert(test1.containers.lookup("testContainer1c").name == test1c.name, "testContainer1b lookup failed");

        // verify lookup returns a clone
        test.assert(appData.localSettings.containers.lookup("testContainer1") != test1, "lookup returned value");

        // TODO: verify IMapView split

        //cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.localSettings.deleteContainer("testContainer2");
        appData.roamingSettings.deleteContainer("testContainer3");
        appData.roamingSettings.deleteContainer("testContainer4");
    },


    // ==========================================================================
    // 
    // Test ApplicationDataContainer.values
    //
    values: function (test) {

        test.start("ApplicationDataContainer.values tests");

        // Test simple values
        var t1value = "hello", t1value2 = "world", t2value = "rhello", t2value2 = "rworld", t1bvalue = "Abc",
            t1bvalue2 = "123", t1cvalue = "xyz", t1cvalue2 = "qwertadsf";

        // create custom containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

        // create child containers
        var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test1c = test1.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);

        test1.values["test1value"] = t1value;
        test1.values["test1value2"] = t1value2;
        test2.values["test2value"] = t2value;
        test2.values["test2value2"] = t2value2;
        test1b.values["test1bvalue"] = t1bvalue;
        test1b.values["test1bvalue2"] = t1bvalue2;
        test1c.values["test1cvalue"] = t1cvalue;
        test1c.values["test1cvalue2"] = t1cvalue2;

        test.assert(test1.values["test1value"] == t1value, "simple: test1value incorrect");
        test.assert(test1.values.test1value == t1value, "simple: 2 test1value incorrect");
        test.assert(test1.values["test1value2"] == t1value2, "simple: test1value2 incorrect");
        test.assert(test1.values.test1value2 == t1value2, "simple: 2 test1value2 incorrect");
        test.assert(test2.values["test2value"] == t2value, "simple: test2value incorrect");
        test.assert(test2.values.test2value == t2value, "simple: 2 test2value incorrect");
        test.assert(test2.values["test2value2"] == t2value2, "simple: test2value2 incorrect");
        test.assert(test2.values.test2value2 == t2value2, "simple: 2 test2value2 incorrect");
        test.assert(test1b.values["test1bvalue"] == t1bvalue, "simple: test1bvalue incorrect");
        test.assert(test1b.values.test1bvalue == t1bvalue, "simple: 2 test1bvalue incorrect");
        test.assert(test1b.values["test1bvalue2"] == t1bvalue2, "simple: test1bvalue2 incorrect");
        test.assert(test1b.values.test1bvalue2 == t1bvalue2, "simple: 2 test1bvalue2 incorrect");
        test.assert(test1c.values["test1cvalue"] == t1cvalue, "simple: test1cvalue incorrect");
        test.assert(test1c.values.test1cvalue == t1cvalue, "simple: 2 test1cvalue incorrect");
        test.assert(test1c.values["test1cvalue2"] == t1cvalue2, "simple: test1cvalue2 incorrect");
        test.assert(test1c.values.test1cvalue2 == t1cvalue2, "simple: 2 test1cvalue2 incorrect");

        // test remove
        test1.values.remove("test1value");
        test2.values.remove("test2value");
        test1b.values.remove("test1bvalue");
        test1c.values.remove("test1cvalue");

        test.assert(test1.values["test1value2"] == t1value2, "simple: removed test1value2 incorrect");
        test.assert(test1.values.test1value2 == t1value2, "simple: 2 removed test1value2 incorrect");
        test.assert(test2.values["test2value2"] == t2value2, "simple: removed test2value2 incorrect");
        test.assert(test2.values.test2value2 == t2value2, "simple: 2 removed test2value2 incorrect");
        test.assert(test1b.values["test1bvalue2"] == t1bvalue2, "simple: removed test1bvalue2 incorrect");
        test.assert(test1b.values.test1bvalue2 == t1bvalue2, "simple: 2 removed test1bvalue2 incorrect");
        test.assert(test1c.values["test1cvalue2"] == t1cvalue2, "simple: removed test1cvalue2 incorrect");
        test.assert(test1c.values.test1cvalue2 == t1cvalue2, "simple: 2 removed test1cvalue2 incorrect");

        test.assert(!test1.values.hasKey("test1value"), "simple: removed test1value incorrect");
        test.assert(!test1.values.test1value, "simple: removed 2 test1value incorrect");
        test.assert(!test2.values.hasKey(t2value), "simple: removed test2value incorrect");
        test.assert(!test2.values.t2value, "simple: removed 2 test2value incorrect");
        test.assert(!test1b.values.hasKey("test1bvalue"), "simple: removed test1bvalue incorrect");
        test.assert(!test1b.values.test1bvalue, "simple: removed 2 test1bvalue incorrect");
        test.assert(!test1c.values.hasKey("test1cvalue"), "simple: removed test1cvalue incorrect");
        test.assert(!test1c.values.test1cvalue, "simple: removed 2 test1cvalue incorrect");

        //cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");


        // create custom containers
        var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

        // create child containers
        var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
        var test1c = test1.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);

        // Test composite values
        var v1 = new Windows.Storage.ApplicationDataCompositeValue();
        var v2 = new Windows.Storage.ApplicationDataCompositeValue();
        var v3 = new Windows.Storage.ApplicationDataCompositeValue();
        var v4 = new Windows.Storage.ApplicationDataCompositeValue();
        var v5 = new Windows.Storage.ApplicationDataCompositeValue();
        var v6 = new Windows.Storage.ApplicationDataCompositeValue();
        var v7 = new Windows.Storage.ApplicationDataCompositeValue();
        var v8 = new Windows.Storage.ApplicationDataCompositeValue();
        v1["t1"] = 100; v1["a2"] = "Hello";
        v2["t2"] = 200; v2["b2"] = "World";
        v3["t3"] = 300; v3["c2"] = "ABC";
        v4["t4"] = 400; v4["d2"] = "xyz";
        v5["t5"] = 500; v5["e2"] = "123";
        v6["t6"] = 600; v6["f2"] = "qwer";
        v7["t7"] = 700; v7["g2"] = "asdf";
        v8.t8 = 800; v8.h2 = "zxcv";


        test1.values["test1value"] = v1;
        test1.values["test1value2"] = v2;
        test2.values["test2value"] = v3;
        test2.values["test2value2"] = v4;
        test1b.values["test1bvalue"] = v5;
        test1b.values["test1bvalue2"] = v6;
        test1c.values["test1cvalue"] = v7;
        test1c.values["test1cvalue2"] = v8;

        test.assert(test1.values["test1value"].a2 == "Hello", "composite: test1value incorrect");
        test.assert(test1.values.test1value.a2 == "Hello", "composite: 2 test1value incorrect");
        test.assert(test1.values["test1value2"].b2 == "World", "composite: test1value2 incorrect");
        test.assert(test1.values.test1value2.b2 == "World", "composite: 2 test1value2 incorrect");
        test.assert(test2.values["test2value"].c2 == "ABC", "composite: test2value incorrect");
        test.assert(test2.values.test2value.c2 == "ABC", "composite: 2 test2value incorrect");
        test.assert(test2.values["test2value2"].d2 == "xyz", "composite: test2value2 incorrect");
        test.assert(test2.values.test2value2.d2 == "xyz", "composite: 2 test2value2 incorrect");
        test.assert(test1b.values["test1bvalue"].e2 == "123", "composite: test1bvalue incorrect");
        test.assert(test1b.values.test1bvalue.e2 == "123", "composite: 2 test1bvalue incorrect");
        test.assert(test1b.values["test1bvalue2"].f2 == "qwer", "composite: test1bvalue2 incorrect");
        test.assert(test1b.values.test1bvalue2.f2 == "qwer", "composite: 2 test1bvalue2 incorrect");
        test.assert(test1c.values["test1cvalue"].g2 == "asdf", "composite: test1cvalue incorrect");
        test.assert(test1c.values.test1cvalue.g2 == "asdf", "composite: 2 test1cvalue incorrect");
        test.assert(test1c.values["test1cvalue2"].h2 == "zxcv", "composite: test1cvalue2 incorrect");
        test.assert(test1c.values.test1cvalue2.h2 == "zxcv", "composite: 2 test1cvalue2 incorrect");

        // test remove
        test1.values.remove("test1value");
        test2.values.remove("test2value");
        test1b.values.remove("test1bvalue");
        test1c.values.remove("test1cvalue");

        test.assert(test1.values["test1value2"].b2 == "World", "composite: test1value2 removed incorrect");
        test.assert(test1.values.test1value2.b2 == "World", "composite: 2 test1value2 removed incorrect");
        test.assert(test2.values["test2value2"].d2 == "xyz", "composite: test2value2 removed incorrect");
        test.assert(test2.values.test2value2.d2 == "xyz", "composite: 2 test2value2 removed incorrect");
        test.assert(test1b.values["test1bvalue2"].f2 == "qwer", "composite: test1bvalue2 removed incorrect");
        test.assert(test1b.values.test1bvalue2.f2 == "qwer", "composite: 2 test1bvalue2 removed incorrect");
        test.assert(test1c.values["test1cvalue2"].h2 == "zxcv", "composite: test1cvalue2 removed incorrect");
        test.assert(test1c.values.test1cvalue2.h2 == "zxcv", "composite: 2 test1cvalue2 removed incorrect");

        test.assert(!test1.values.hasKey("test1value"), "composite: removed test1value incorrect");
        test.assert(!test1.values.test1value, "composite: removed 2 test1value incorrect");
        test.assert(!test2.values.hasKey(t2value), "composite: removed test2value incorrect");
        test.assert(!test2.values.t2value, "composite: removed 2 test2value incorrect");
        test.assert(!test1b.values.hasKey("test1bvalue"), "composite: removed test1bvalue incorrect");
        test.assert(!test1b.values.test1bvalue, "composite: removed 2 test1bvalue incorrect");
        test.assert(!test1c.values.hasKey("test1cvalue"), "composite: removed test1cvalue incorrect");
        test.assert(!test1c.values.test1cvalue, "composite: removed 2 test1cvalue incorrect");

        //cleanup
        appData.localSettings.deleteContainer("testContainer1");
        appData.roamingSettings.deleteContainer("testContainer2");

        // TODO: Can't test test persistence across runs.  Revisit when/if I move to an external test manager which drives the browser.
    }
});

function _valuesTest(type, test, t1value, t1value2, t2value, t2value2, t1bvalue, t1bvalue2, t1cvalue, t1cvalue2) {

    type += ": ";

    // create custom containers
    var test1 = appData.localSettings.createContainer("testContainer1", Windows.Storage.ApplicationDataCreateDisposition.always);
    var test2 = appData.roamingSettings.createContainer("testContainer2", Windows.Storage.ApplicationDataCreateDisposition.always);

    // create child containers
    var test1b = test1.createContainer("testContainer1b", Windows.Storage.ApplicationDataCreateDisposition.always);
    var test1c = test1.createContainer("testContainer1c", Windows.Storage.ApplicationDataCreateDisposition.always);

    test1.values["test1value"] = t1value;
    test1.values["test1value2"] = t1value2;
    test2.values["test2value"] = t2value;
    test2.values["test2value2"] = t2value2;
    test1b.values["test1bvalue"] = t1bvalue;
    test1b.values["test1bvalue2"] = t1bvalue2;
    test1c.values["test1cvalue"] = t1cvalue;
    test1c.values["test1cvalue2"] = t1cvalue2;
    
    test.assert(test1.values["test1value"] == t1value, type + "test1value incorrect");
    test.assert(test1.values.test1value == t1value, type + "2 test1value incorrect");
    test.assert(test1.values["test1value2"] == t1value2, type + "test1value2 incorrect");
    test.assert(test1.values.test1value2 == t1value2, type + "2 test1value2 incorrect");
    test.assert(test2.values["test2value"] == t2value, type + "test2value incorrect");
    test.assert(test2.values.test2value == t2value, type + "2 test2value incorrect");
    test.assert(test2.values["test2value2"] == t2value2, type + "test2value2 incorrect");
    test.assert(test2.values.test2value2 == t2value2, type + "2 test2value2 incorrect");
    test.assert(test1b.values["test1bvalue"] == t1bvalue, type + "test1bvalue incorrect");
    test.assert(test1b.values.test1bvalue == t1bvalue, type + "2 test1bvalue incorrect");
    test.assert(test1b.values["test1bvalue2"] == t1bvalue2, type + "test1bvalue2 incorrect");
    test.assert(test1b.values.test1bvalue2 == t1bvalue2, type + "2 test1bvalue2 incorrect");
    test.assert(test1c.values["test1cvalue"] == t1cvalue, type + "test1cvalue incorrect");
    test.assert(test1c.values.test1cvalue == t1cvalue, type + "2 test1cvalue incorrect");
    test.assert(test1c.values["test1cvalue2"] == t1cvalue2, type + "test1cvalue2 incorrect");
    test.assert(test1c.values.test1cvalue2 == t1cvalue2, type + "2 test1cvalue2 incorrect");

    // test remove
    test1.values.remove("test1value");
    test2.values.remove("test2value");
    test1b.values.remove("test1bvalue");
    test1c.values.remove("test1cvalue");

    test.assert(test1.values["test1value2"] == t1value2, type + "removed test1value2 incorrect");
    test.assert(test1.values.test1value2 == t1value2, type + "2 removed test1value2 incorrect");
    test.assert(test2.values["test2value2"] == t2value2, type + "removed test2value2 incorrect");
    test.assert(test2.values.test2value2 == t2value2, type + "2 removed test2value2 incorrect");
    test.assert(test1b.values["test1bvalue2"] == t1bvalue2, type + "removed test1bvalue2 incorrect");
    test.assert(test1b.values.test1bvalue2 == t1bvalue2, type + "2 removed test1bvalue2 incorrect");
    test.assert(test1c.values["test1cvalue2"] == t1cvalue2, type + "removed test1cvalue2 incorrect");
    test.assert(test1c.values.test1cvalue2 == t1cvalue2, type + "2 removed test1cvalue2 incorrect");

    test.assert(!test1.values.hasKey("test1value"), type + "removed test1value incorrect");
    test.assert(!test1.values.test1value, type + "removed 2 test1value incorrect");
    test.assert(!test2.values.hasKey(t2value), type + "removed test2value incorrect");
    test.assert(!test2.values.t2value, type + "removed 2 test2value incorrect");
    test.assert(!test1b.values.hasKey("test1bvalue"), type + "removed test1bvalue incorrect");
    test.assert(!test1b.values.test1bvalue, type + "removed 2 test1bvalue incorrect");
    test.assert(!test1c.values.hasKey("test1cvalue"), type + "removed test1cvalue incorrect");
    test.assert(!test1c.values.test1cvalue, type + "removed 2 test1cvalue incorrect");

    //cleanup
    appData.localSettings.deleteContainer("testContainer1");
    appData.roamingSettings.deleteContainer("testContainer2");
}
"use strict";

// ================================================================
//
// Test.WinJS.Binding.js
//		Tests for the WinJS.Binding object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Binding Tests", {

    // ==========================================================================
    // 
    // Test simple dynamic programmatic binding - sanity test with one value to make sure binding is working at all.
    //
    singleDynamicProgBinding: function (test) {

        test.start("Single dynamic programmatic binding");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it via binding.  Set its id to 'DataA'
            var $testDiv = testHarness.addTestDiv("dataA");

            // Create a regular js object
            var sourceData = { a: 10, b: 50 };

            // Wrap the regular js object in an observable wrapper; the wrapper has the same fields
            // as the regular JS object, but changes to the bindingSource's fields can be listened to via the .bind() function.
            var bindingSource = WinJS.Binding.as(sourceData);

            // Listen to changes on the data's "a" field.  
            bindingSource.bind("a", function (newValue, oldValue) {
                $("#dataA").text(newValue);
            });

            // Change the data's "a" field through the bindingSource; this will cause the .bind() function above to get called.
            bindingSource.a = 50;

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                // Verify that the bound value changed
                test.assert($testDiv.text() == "50", "failed to update div on change of bound data");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test multiple dynamic programmatic bindings
    //
    multipleDynamicProgBinding: function (test) {

        test.start("Multiple dynamic programmatic binding");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // See the singleDynamicProgBinding test for an explanation of what we're doing here.
            var $testDivA = testHarness.addTestDiv("dataA");
            var $testDivB = testHarness.addTestDiv("dataB");
            var $testDivC = testHarness.addTestDiv("dataC");

            var sourceDataA = { a: 10, b: 50 };
            var sourceDataB = { a: 20, b: 50 };
            var sourceDataC = { a: 10, b: 60 };

            var bindingSourceA = WinJS.Binding.as(sourceDataA);
            var bindingSourceB = WinJS.Binding.as(sourceDataB);
            var bindingSourceC = WinJS.Binding.as(sourceDataC);

            bindingSourceA.bind("a", function (newValue, oldValue) { $("#dataA").text(newValue); });
            bindingSourceB.bind("a", function (newValue, oldValue) { $("#dataB").text(newValue); });
            bindingSourceC.bind("b", function (newValue, oldValue) { $("#dataC").text(newValue); });

            bindingSourceA.a = 50;
            bindingSourceB.a = 150;
            bindingSourceC.b = 250;

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                test.assert($testDivA.text() == "50", "failed to update div A on change of bound data");
                test.assert($testDivB.text() == "150", "failed to update div B on change of bound data");
                test.assert($testDivC.text() == "250", "failed to update div C on change of bound data");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test one-time declarative binding
    //
    oneTimeDeclarativeBinding: function (test) {

        test.start("One-time declarative binding");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div id="test">First Name: <span id="first" data-win-bind="innerText: firstName">Joe</span><br/>' +
													  'Last Name: <span id="last" data-win-bind="innerText: lastName">Smith</span></div>');

            // Create a regular js object
            var person = { firstName: "Jacob", lastName: "Simon" };

            // Tell WinJS.Binding to process all data-win-bind attributes in the contactCard HTML element.  This will perform the 
            // data-binding as a ONE TIME event.  After this line, the UI will say "Jacob"
            WinJS.Binding.processAll($testDiv[0], person);

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                var firstName = $("#first", $testDiv).text();
                test.assert(firstName == "Jacob", "Failed to set data via WinJS.Binding.processAll");

                // As a test, set the data's value; since we haven't wrapped it in a binding source, the changes aren't being listened to and
                // the UI won't update to reflect the new value.
                person.firstName = "Luke";

                WinJS.Promise.timeout().then(function () {
                    firstName = $("#first", $testDiv).text();
                    test.assert(firstName == "Jacob", "Unexpectedly set data although binding wasn't created");
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test dynamic declarative binding
    //
    dynamicDeclarativeBinding: function (test) {

        test.start("Dynamic declarative binding");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div id="test">First Name: <span id="first" data-win-bind="innerText: firstName">Joe</span><br/>' +
													  'Last Name: <span id="last" style="background-color:Red" data-win-bind="style.backgroundColor: backColor">Smith</span></div>');

            var person = { backColor: "#f00", firstName: "Henry", lastName: "Ford", thumbnailImage: null };

            // In order to cause the binding to happen every time the person object's data changes, we need to wrap the regular js 
            // object in a binding source; the bindingSource has the same fields as the regular JS object, but changes to the 
            // bindingSource's fields automatically call WinJS.Binding.processAll
            var bindingSource = WinJS.Binding.as(person);

            // Tell WinJS.Binding to process all data-win-bind attributes in the contactCard2 HTML element.  Since bindingSource is a
            // bindingSource, processAll() will establish the appropriate field listeners to update the UI when bindingSource's data changes.
        //    debugger;
            WinJS.Binding.processAll($("#test")[0], bindingSource);

            // Now make a change to the binding source's fields.  The binding source will cause the Binding.process to automatically
            // get called when the binding source's field values change, which will update the UI via WinJS.Binding.processAll
            bindingSource.firstName = "Thomas";
            bindingSource.backColor = "#0f0";

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                // Validate test results
                var firstName = $("#first", $testDiv).text();
                test.assert(firstName == "Thomas", "Failed to dynamically change first name");
                var backColor = $("#last", $testDiv).css("backgroundColor");
                test.assert(backColor == "rgb(0, 255, 0)", "Failed to dynamically change backgroundColor (value is '" + backColor + "')");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test multiple dynamic data-win-binds
    //
    multipleDynamicBinds: function (test) {

        test.start("multiple dynamic data-win-binds");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div id="test">First Name: <span id="first" data-win-bind=' +
													  '"innerText: firstName; style.backgroundColor: backColor;style.color:color">John</span></div>');

            // See the dynamicDeclarativeBinding test for an explanation of what we're doing here.
            var person = { backColor: "#f00", firstName: "Henry", lastName: "Ford", thumbnailImage: null };
            var bindingSource = WinJS.Binding.as(person);
            WinJS.Binding.processAll($("#test")[0], bindingSource);
            bindingSource.firstName = "Thomas";
            bindingSource.backColor = "#0f0";

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                // Validate test results
                var firstName = $("#first", $testDiv).text();
                test.assert(firstName == "Thomas", "Failed to dynamically change first name");
                var backColor = $("#first", $testDiv).css("backgroundColor");
                test.assert(backColor == "rgb(0, 255, 0)", "Failed to dynamically change backgroundColor");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test WinJS.Binding converter functions
    //
    converter: function (test) {

        test.start("Binding converter functions");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div id="test">First Name: <span id="first" data-win-bind=' +
													  '"innerText: firstName BindingTests.converter.conv1; style.backgroundColor: backColor BindingTests.converter.conv2;style.color:color">John</span></div>');

            // See the dynamicDeclarativeBinding test for an explanation of what we're doing here.
            var person = { backColor: "#f00", firstName: "Henry", lastName: "Ford", thumbnailImage: null };
            WinJS.Namespace.define("BindingTests.converter", {
                conv1: WinJS.Binding.converter(function (val) {
                    return val + "asdf";
                }),
                conv2: WinJS.Binding.converter(function (val) {
                    return val[0] + val[1] + val[2] + "f";
                })
            });

            var bindingSource = WinJS.Binding.as(person);
            WinJS.Binding.processAll($("#test")[0], bindingSource);
            bindingSource.firstName = "Thomas";
            bindingSource.backColor = "#0f0";

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                // Validate test results
                var firstName = $("#first", $testDiv).text();
                test.assert(firstName == "Thomasasdf", "Failed to dynamically change first name");
                var backColor = $("#first", $testDiv).css("backgroundColor");
                test.assert(backColor == "rgb(0, 255, 255)", "Failed to dynamically change backgroundColor");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test multiple data-win-binds to the same field 
    //
    multipleBindsToSameField: function (test) {
        test.start("multiple data-win-binds to the same field");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div class="test">Name 1: <div id="first" data-win-bind="innerText: firstName">name1</div>' +
													  'Name 2: <div id="last" data-win-bind="innerText: firstName">name2</div></div>');

            var person = { firstName: "Henry" };
            var bindingSource = WinJS.Binding.as(person);
            WinJS.Binding.processAll($(".test")[0], bindingSource);
            bindingSource.firstName = "Thomas";

            // Changes notification happen asynchronously, so yield
            WinJS.Promise.timeout().then(function () {

                // Validate test results
                var firstName = $("#first", $testDiv).text();
                test.assert(firstName == "Thomas", "Failed to change first instance of name");
                var firstName = $("#last", $testDiv).text();
                test.assert(firstName == "Thomas", "Failed to change second instance of name");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test multiple depth data-win-bind
    //
    multipleDepthBind: function (test) {

        // Test:  <div data-win-bind="innerText:person.address.city"> should trigger when ANY of person or address or city changes...
        // This also tests 'deep' binds.
        test.start("multiple depth data-win-bind");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Add UX element to the test working space so that we can test changing it.
            var $testDiv = testHarness.addTestElement('<div class="test"><div data-win-bind="innerText:address.street.name"></div>' +
                '<div data-win-bind="innerText:address.street.number"></div>' +
                '<div data-win-bind="innerText:address.city"></div></div>');

            var person = {
                name: "Jeff",
                address: {
                    street: {
                        name: "John Rd",
                        number: 100
                    },
                    city: "Seattle"
                }
            };
            var bindingSource = WinJS.Binding.as(person);

            WinJS.Binding.processAll($(".test")[0], bindingSource).then(function () {

                // Hmm; can't get the change notification to trigger on Win8; I must be misunderstanding something about how to
                // hook up multi-depth binds.  nyi'ing for now.
                test.nyi("Can't get multiple-depth binds to work on Win8.");
                onTestComplete(test);
                return;
                // Test that changing each level causes the UX to change
                person.address.street.name = "Elm";
                //person.address = { street: { name: "Hollywood Boulevard", number: 200 }, city: "Hollywood" };
                //person = { name: "Jenn", street: { name:"Foo Way", number:300}, city: "Seattle" };

                // Changes notification happen asynchronously, so yield
                WinJS.Promise.timeout().then(function () {
                    test.assert($testDiv.text() == "Elm", "Failed to change bottom level of multiple-depth bind");

                    person.address.street = { name: "Oak", number: 200 };
                    WinJS.Promise.timeout().then(function () {
                        test.assert($testDiv.text() == "Oak 200", "Failed to change middle level of multiple-depth bind");
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Binding.define
    //
    bindingDefine: function (test) {

        test.start("Binding.define tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Define an constructor function that, when used, generates an observable wrapper around the following properties in the constructed object
            var Person = WinJS.Binding.define({
                backColor: "",
                firstName: "",
                test: { t1: "asdf", t2: "" },	// should be ignored
                test2: "",
                lastName: ""
            });

            // Test Binding.define with initial state
            var person1 = new Person({ firstName: "Jeff", lastName: "Simon", backColor: "red" });
            var person2 = new Person({ firstName: "Luke", lastName: "Simon2", backColor: "green" });
            // Verify that initial state was set.
            test.assert(person1.firstName == "Jeff", "Failed to set first initial state");
            test.assert(person2.lastName == "Simon2", "Failed to set second initial state");

            // Verify that we did not populate the unbound vars
            test.assert(person1.test2 === undefined, "unexpectedly set unbound var");

            // Test Binding.define without the optional initial state
            var person3 = new Person();
            person3.firstName = "Sarah";
            person3.lastName = "Lanier";
            person3.backColor = "yellow";

            var t1, t2, t3, t4;
            // Listen to changes on various field.  
            person1.bind("firstName", function (testnewValue, oldValue) { t1 = testnewValue; });
            person2.bind("lastName", function (testnewValue, oldValue) { t2 = testnewValue; });
            person3.bind("backColor", function (testnewValue, oldValue) { t3 = testnewValue; });

            // Change the data's fields; this will cause the .bind() functions above to get called.
            person1.firstName = "Fred";
            person2.lastName = "Flintstone";
            person3.backColor = "purple";

            // bound changes are notified asynchronously, so we need to yield and let them complete
            new WinJS.Promise.timeout().then(function () {
                test.assert(t1 == "Fred", "Failed to bind first value");
                test.assert(t2 == "Flintstone", "Failed to bind second value");
                test.assert(t3 == "purple", "Failed to bind third value");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Binding.bind
    //
    bindingBind: function (test) {

        test.start("Binding.bind tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create the object to which we can bind
            var Person = WinJS.Binding.define({
                test1: "",
                test2: "",
                test3: { t1: "asdf", t2: "" }
            });

            var person1 = new Person({ test1: 100, test2: "Hello" });
            var person2 = new Person({ test1: 200, test2: "World" });

            var t1, t2, t3;

            // bind to changes on various field.  
            person1.bind("test1", function (newValue, oldValue) { t1 = newValue; });
            person2.bind("test1", function (newValue, oldValue) { t2 = newValue; });
            person2.bind("test2", function (newValue, oldValue) { t3 = newValue; });

            person1.test1 = 50;
            person2.test2 = "Bar";

            // bound changes are notified asynchronously, so we need to yield and let them complete
            new WinJS.Promise.timeout().then(function () {
                test.assert(t1 == 50, "Failed to bind first value");
                test.assert(t3 == "Bar", "Failed to bind third value");
                onTestComplete(test);
            });

            test.nyi("Test multilevel binding (foo.bar.xyz)");
        });
    },


    // ==========================================================================
    // 
    // Test Binding.unwrap
    //
    bindingUnwrap: function (test) {

        test.start("Binding.unwrap tests");

        // Verify that unwrap returns the original object when an observable is passed
        var person1Data = { test1: 100, test2: "Hello" };
        var person1 = WinJS.Binding.as(person1Data);
        test.assert(WinJS.Binding.unwrap(person1) == person1Data, "Failed to unwrap observable object");

        // Verify that unwrap returns the value when a value is passed
        test.assert(WinJS.Binding.unwrap(person1.test2) == "Hello", "Failed to unwrap value");
    },


    // ==========================================================================
    // 
    // Test Binding.getProperty
    //
    bindingGetProperty: function (test) {

        test.start("Binding.getProperty tests");

        // Create the object to which we can bind
        var Person = WinJS.Binding.define({
            test1: "",
            test2: "",
            test3: { t1: "asdf", t2: "" }
        });

        var person1Data = { test1: 100, test2: "Hello" };
        var person1 = new Person(person1Data);

        // Verify that getProperty on a value returns the value
        test.assert(person1.getProperty("test1") == 100, "Failed to return a value in getProperty(value)");

        // Verify that getProperty on a complex property returns undefined
        test.assert(person1.getProperty("test3") === undefined, "Failed to return undefined for complex property");
    },


    // ==========================================================================
    // 
    // Test Binding.setProperty
    //
    bindingSetProperty: function (test) {

        test.start("Binding.SetProperty tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create the object to which we can bind
            var Person = WinJS.Binding.define({
                test1: "",
                test2: "",
                test3: { t1: "asdf", t2: "" }
            });

            var person1 = new Person({ test1: 100, test2: "Hello" });

            // verify that setProperty returns the object
            var result = person1.setProperty("test1", 20);
            test.assert(result == person1, "Failed to return the object from setProperty");

            // Property sets happen asynchronously
            new WinJS.Promise.timeout().then(function () {
                test.assert(person1.test1 == 20, "Failed to set property");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Binding.updateProperty
    //
    bindingUpdateProperty: function (test) {

        test.start("Binding.updateProperty tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create the object to which we can bind
            var Person = WinJS.Binding.define({
                test1: "",
                test2: "",
                test3: { t1: "asdf", t2: "" }
            });

            var person1 = new Person({ test1: 100, test2: "Hello" });

            // verify that updateProperty returns a promise
            var updatePromise = person1.updateProperty("test1", 30);
            test.assert(WinJS.Promise.is(updatePromise), "Failed to return a Promise from updateProperty");

            updatePromise.then(function () {
                test.assert(person1.test1 == 30, "Failed to update property");
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Binding.notify
    //
    bindingNotify: function (test) {

        test.start("Binding.notify tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var boundData = { a: 10, b: 50 };
            var bindingSource = WinJS.Binding.as(boundData);

            var notified1 = false;
            // Listen to changes on the data's "a" field.  
            bindingSource.bind("a", function (newValue, oldValue) {
                notified1 = true;
            });

            // Notify that changes have occurred.  notify() returns a Promise that will be fulfilled once all
            // listeners have been notified.
            bindingSource.notify("a", 20, boundData.a).then(function () {

                test.assert(notified1, "Failed to notify");

                // Verify that the notification did not actually change the data
                test.assert(boundData.a == 10, "Notification unexpectedly changed data");

                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test Binding.expandProperties
    //
    bindingExpandProperties: function (test) {

        test.start("Binding.expandProperties tests");

        var boundData = { a: 10, b: 50 };
        var bindingSource = WinJS.Binding.as(boundData);

        var propSet = WinJS.Binding.expandProperties(bindingSource);

        // Verify that the properties were returned and are observable
        test.assert(propSet.getProperty, "Property Set not observable");
        test.assert(propSet.a, "Property a not returned");
        test.assert(propSet.b, "Property b not returned");
        test.assert(propSet.a.get, "Property a not observable");
        test.assert(propSet.b.get, "Property b not observable");
    }
});
"use strict";

// ================================================================
//
// Test.WinJS.Binding.Template.js
//		Tests for the WinJS.Binding.Template object
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.Binding.Template Tests", {

    // ==========================================================================
    // 
    // Test declarative template rendering
    //
    templateDeclRendering: function (test) {

        test.start("Template (declarative) rendering");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div into which we can render the template's bound data
            var renderTargetDiv = testHarness.addTestDiv("renderTarget")[0];

            // Create the template
            var template = $('<div data-win-control="WinJS.Binding.Template">' +
                               '<div  id="templateDiv">' +
								 '<div class="templateItem" data-win-bind="style.background: color">' +
									'<ol>' +
										'<li><span>Name :</span><span data-win-bind="textContent: name"></span></li>' +
										'<li><span>Birthday:</span><span data-win-bind="textContent: birthday"></span></li>' +
										'<li><span>Pets name: </span><span data-win-bind="textContent: petname"></span></li>' +
										'<li><span>Dessert: </span><span data-win-bind="textContent: dessert"></span></li>' +
									'</ol>' +
								 '</div>' +
                                '</div>' +
							   '</div>')[0];

            // Create an observable class
            var Person = WinJS.Binding.define({ name: "", color: "", birthday: "", petname: "", dessert: "" });

            // Create some observable data
            var people = [
				new Person({ name: "Bob", color: "red", birthday: "2/2/2002", petname: "Spot", dessert2: "chocolate cake" }),
				new Person({ name: "Sally", color: "green", birthday: "3/3/2003", petname: "Xena", dessert: "cherry pie" }),
				new Person({ name: "Fred", color: "blue", birthday: "2/2/2002", petname: "Pablo", dessert: "ice cream" }),
            ];

            // Process the Template
            WinJS.UI.process(template).then(function (templateControl) {

                // The Template has been processed - we can now use it to bind data into and render that templatized/bound data into the test frame
                var renderPromises = [];
                people.forEach(function (person) {
                    renderPromises.push(templateControl.render(person, renderTargetDiv));
                });

                // Wait until all templates have been rendered
                WinJS.Promise.join(renderPromises).then(function () {

                    // verify templates were rendered
                    var $t1 = $("#renderTarget #templateDiv:nth-child(1)");
                    var $t2 = $("#renderTarget #templateDiv:nth-child(2)");
                    var $t3 = $("#renderTarget #templateDiv:nth-child(3)");
                    test.assert($t1[0] && $t2[0] && $t3[0], "Templates were not rendered");

                    // verify data was bound
                    var t2Pet = $("#renderTarget #templateDiv:nth-child(2) li:nth-child(3) span:nth-child(2)");
                    test.assert(t2Pet.text() == "Xena", "data was not bound");

                    // Now, test that changes to the data to which the Template is bound are reflected in the ui
                    people[0].name = "Jeff";

                    // Since bound changes are asynch, we need to yield
                    WinJS.Promise.timeout().then(function () {
                        var t2Name = $("#renderTarget #templateDiv:nth-child(1) li:nth-child(1) span:nth-child(2)");
                        test.assert(t2Name.text() == "Jeff", "data was not bound");

                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test programmatic template rendering
    //
    templateProgRendering: function (test) {

        test.start("Template (programmatic) rendering");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div into which we can render the template's bound data
            var renderTargetDiv = testHarness.addTestDiv("renderTarget")[0];

            // Define the DOM element to convert into a template
            var templateDiv = $('<div data-win-control="WinJS.Binding.Template">' +
                               '<div  id="templateDiv">' +
								'<div class="templateItem" data-win-bind="style.background: color">' +
									'<ol>' +
										'<li><span>Name :</span><span data-win-bind="textContent: name"></span></li>' +
										'<li><span>Birthday:</span><span data-win-bind="textContent: birthday"></span></li>' +
										'<li><span>Pets name: </span><span data-win-bind="textContent: petname"></span></li>' +
										'<li><span>Dessert: </span><span data-win-bind="textContent: dessert"></span></li>' +
									'</ol>' +
							   '</div>')[0];

            // Create the template
            var templateControl = new WinJS.Binding.Template(templateDiv);

            // Create an observable class
            var Person = WinJS.Binding.define({ name: "", color: "", birthday: "", petname: "", dessert: "" });

            // Create some observable data
            var people = [
				new Person({ name: "Bob", color: "red", birthday: "2/2/2002", petname: "Spot", dessert2: "chocolate cake" }),
				new Person({ name: "Sally", color: "green", birthday: "3/3/2003", petname: "Xena", dessert: "cherry pie" }),
				new Person({ name: "Fred", color: "blue", birthday: "2/2/2002", petname: "Pablo", dessert: "ice cream" }),
            ];

            // The Template has been processed - we can now use it to bind data into and render that templatized/bound data into the test frame
            var renderPromises = [];
            people.forEach(function (person) {
                renderPromises.push(templateControl.render(person, renderTargetDiv));
            });

            // Wait until all templates have been rendered
            WinJS.Promise.join(renderPromises).then(function () {

                // verify templates were rendered
                var $t1 = $("#renderTarget #templateDiv:nth-child(1)");
                var $t2 = $("#renderTarget #templateDiv:nth-child(2)");
                var $t3 = $("#renderTarget #templateDiv:nth-child(3)");
                test.assert($t1[0] && $t2[0] && $t3[0], "Templates were not rendered");

                // verify data was bound
                var t2Pet = $("#renderTarget #templateDiv:nth-child(2) li:nth-child(3) span:nth-child(2)");
                test.assert(t2Pet.text() == "Xena", "data was not bound");

                // Now, test that changes to the data to which the Template is bound are reflected in the ui
                people[0].name = "Jeff";

                // Since bound changes are asynch, we need to yield
                WinJS.Promise.timeout().then(function () {
                    var t2Name = $("#renderTarget #templateDiv:nth-child(1) li:nth-child(1) span:nth-child(2)");
                    test.assert(t2Name.text() == "Jeff", "data was not bound");

                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test external template loading
    //
    externalTemplateHref: function (test) {

        test.start("external template loading");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Create a div into which we can render the template's bound data
            var renderTargetDiv = testHarness.addTestDiv("renderTarget")[0];

            // Create the template
            /*var templateDiv = $('<div data-win-control="WinJS.Binding.Template">' +
                   '<div  id="templateDiv">' +
                    '<div class="templateItem" data-win-bind="style.background: color">' +
                        '<ol>' +
                            '<li><span>Name :</span><span data-win-bind="textContent: name"></span></li>' +
                            '<li><span>Birthday:</span><span data-win-bind="textContent: birthday"></span></li>' +
                            '<li><span>Pets name: </span><span data-win-bind="textContent: petname"></span></li>' +
                            '<li><span>Dessert: </span><span data-win-bind="textContent: dessert"></span></li>' +
                        '</ol>' +
                   '</div>')[0];
			var templateControl = new WinJS.Binding.Template(templateDiv);*/
            var templateControl = new WinJS.Binding.Template(null, { href: '/Tests/supportFiles/externalTemplate1.html' });
            console.log(templateControl);
            // Create an observable class
            var Person = WinJS.Binding.define({ name: "", color: "", birthday: "", petname: "", dessert: "" });

            // Create some observable data
            var people = [
				new Person({ name: "Bob", color: "red", birthday: "2/2/2002", petname: "Spot", dessert2: "chocolate cake" }),
				new Person({ name: "Sally", color: "green", birthday: "3/3/2003", petname: "Xena", dessert: "cherry pie" }),
				new Person({ name: "Fred", color: "blue", birthday: "2/2/2002", petname: "Pablo", dessert: "ice cream" }),
            ];

            // The Template has been processed - we can now use it to bind data into and render that templatized/bound data into the test frame
            var renderPromises = [];
            people.forEach(function (person) {
                renderPromises.push(templateControl.render(person, renderTargetDiv));
            });

            // Wait until all templates have been rendered
            WinJS.Promise.join(renderPromises).then(function () {
                // verify templates were rendered
                var t1 = $("#renderTarget div")[0];
                var t2 = $("#renderTarget div")[1];
                var t3 = $("#renderTarget div")[2];
                test.assert(t1 && t2 && t3, "Templates were not rendered");
                if (!WinJS.Application.IsBluesky)
                    test.resultNote = "Some race condition happening on Win8 here; fails on first test run but not subsequent runs...";

            	// verify data was bound
                var t2Pet = $("#renderTarget #templateDiv:nth-child(2) li:nth-child(3) span:nth-child(2)");
                test.assert(t2Pet.text() == "Xena", "data was not bound");

                // Now, test that changes to the data to which the Template is bound are reflected in the ui
                people[0].name = "Jeff";

                // Since bound changes are asynch, we need to yield
                WinJS.Promise.timeout().then(function () {
                    var t2Name = $("#renderTarget #templateDiv:nth-child(1) li:nth-child(1) span:nth-child(2)");
                    test.assert(t2Name.text() == "Jeff", "data2 was not bound");

                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Template.renderItem
    //
    renderItem: function (test) {

        test.start("Template.renderItem Tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            // Define the DOM element to convert into a template
            var templateDiv = $('<div data-win-control="WinJS.Binding.Template">' +
                               '<div  id="templateDiv">' +
								'<div class="templateItem" data-win-bind="style.background: color">' +
									'<ol>' +
										'<li><span>Name :</span><span data-win-bind="textContent: name"></span></li>' +
										'<li><span>Birthday:</span><span data-win-bind="textContent: birthday"></span></li>' +
										'<li><span>Pets name: </span><span data-win-bind="textContent: petname"></span></li>' +
										'<li><span>Dessert: </span><span data-win-bind="textContent: dessert"></span></li>' +
									'</ol>' +
								'</div>' +
								'</div>' +
							   '</div>')[0];

            // Create the template
            var templateControl = new WinJS.Binding.Template(templateDiv);

            // Create an observable class
            var Person = WinJS.Binding.define({ name: "", color: "", birthday: "", petname: "", dessert: "" });

            // Create some observable data
            var people = [
				new Person({ name: "Bob", color: "red", birthday: "2/2/2002", petname: "Spot", dessert2: "chocolate cake" }),
            ];

            // The Template has been processed - we can now use it to bind data into and render that templatized/bound data into the test frame
            var itemPromise = new WinJS.Promise(function (c) {
                c({
                    data: people[0]
                });
            });

            var renderPromise = templateControl.renderItem(itemPromise).then(function (renderedTemplate) {
                // At this point, renderedTemplate should have the rendered and bound data, although it isn't in the DOM anywhere.

                // verify template was rendered
                var $t2Pet = $("li:nth-child(3) span:nth-child(2)", $(renderedTemplate));
                test.assert($t2Pet.text() == "Spot", "Template was not rendered");
                onTestComplete(test);
            });
        });
    }
});
"use strict";

// ================================================================
//
// Test.WinJS.UI.SemanticZoom.js
//		Tests for WinJS.UI.SemanticZoom
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS.UI.SemanticZoom Tests", {

    // ==========================================================================
    // 
    // Test basic SemanticZoom creation
    //
    basicSemanticZoom: function (test) {

        test.start("Basic SemanticZoom creation");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var target = testHarness.addTestDiv("test1")[0];
            WinJS.UI.Pages.render("/Tests/supportFiles/semanticZoom/simpleZoom.html", target).then(function (testPage) {
                var $sz = $("#semanticZoomDiv");
                var sz = $sz[0].winControl;
                test.assert(sz, "Failed to instantiate semanticZoom control");

                // Wait until view is done transitioning.  Note that the semanticzoom control does not send a zoomchanged (or other event)
                // so we need to just wait.
                WinJS.Promise.timeout(1000).then(function () {
                    test.assert($("#zoomedInListView").css("visibility") == "visible", "Zoomed in is not visible (should be)");
                    test.assert($("#zoomedOutListView").css("visibility") == "hidden", "Zoomed out is visible (shouldn't be)");

                    var $containerDiv = $(">div", $sz);

                    // Verify that the sz element has one child div, and has css: left: 0px; top: 0px; width: 600px; height: 400px; overflow: hidden; position: absolute;
                    // Verify that the sz element has one child button, which has class: win-semanticzoom-button win-semanticzoom-button-location ltr" style="visibility: hidden;
                    test.assert($sz.children().length == 2, "Incorrect number of child elements under semanticZoomDiv");
                    test.assert($(">button", $sz)[0], "Button not present");
                    test.assert($containerDiv, "first div not present");
                    test.assert($containerDiv[0] == $("> :first-child", $sz)[0], "semanticZoomDiv child elements in incorrect order");

                    // Verify that the sz's one child div has two divs, one for each zoomable element, first with css: 
                    //      left: 0px; top: 0px; width: 600px; height: 400px; overflow: hidden; visibility: visible; position: absolute
                    // ... and second with css:
                    //      left: 0px; top: 0px; width: 600px; height: 400px; overflow: hidden; visibility: hidden; position: absolute
                    var $zoomedInContainer = $($containerDiv.children()[0]);
                    var $zoomedOutContainer = $($containerDiv.children()[1]);
                    test.assert($zoomedInContainer, "zoomedInContainer not present");
                    test.assert($zoomedOutContainer, "zoomedOutContainer not present");
                    test.assert($zoomedInContainer.css("left") == "0px", "$zoomedInContainer left incorrect");
                    test.assert($zoomedInContainer.css("top") == "0px", "$zoomedInContainer top incorrect");
                    test.assert($zoomedInContainer.css("width") == "440px", "$zoomedInContainer width incorrect (" + $zoomedInContainer.css("width") + ")");
                    test.assert($zoomedInContainer.css("height") == "400px", "$zoomedInContainer height incorrect");
                    test.assert($zoomedInContainer.css("overflow") == "hidden", "$zoomedInContainer overflow incorrect");
                    test.assert($zoomedInContainer.css("visibility") == "visible", "$zoomedInContainer visibility incorrect");
                    test.assert($zoomedInContainer.css("position") == "absolute", "$zoomedInContainer position incorrect");
                    test.assert($zoomedOutContainer.css("left") == "0px", "$zoomedInContainer left incorrect");
                    test.assert($zoomedOutContainer.css("top") == "0px", "$zoomedInContainer top incorrect");
                    test.assert($zoomedOutContainer.css("width") == "440px", "$zoomedInContainer width incorrect");
                    test.assert($zoomedOutContainer.css("height") == "400px", "$zoomedInContainer height incorrect");
                    test.assert($zoomedOutContainer.css("overflow") == "hidden", "$zoomedInContainer overflow incorrect");
                    test.assert($zoomedOutContainer.css("visibility") == "hidden", "$zoomedInContainer visibility incorrect");
                    test.assert($zoomedOutContainer.css("position") == "absolute", "$zoomedInContainer position incorrect");

                    // Verify that each of THOSE child divs has one div
                    var $zoomedInContainerDiv = $(">div", $zoomedInContainer);
                    var $zoomedOutContainerDiv = $(">div", $zoomedOutContainer);
                    test.assert($zoomedInContainerDiv.length == 1, "Incorrect number of divs in zoomedInContainer");
                    test.assert($zoomedOutContainerDiv.length == 1, "Incorrect number of divs in zoomedOutContainer");

                    // Verify that each of those child divs contains a listview (zoomedOutListView or zoomedInListView)
                    var $zoomedInContainerListDiv = $(">div", $zoomedInContainerDiv);
                    var $zoomedOutContainerListDiv = $(">div", $zoomedOutContainerDiv);
                    test.assert($zoomedInContainerListDiv.length == 1, "Incorrect number of divs in zoomedInContainerDiv");
                    test.assert($zoomedOutContainerListDiv.length == 1, "Incorrect number of divs in zoomedOutContainerDiv");

                    test.assert($zoomedInContainerListDiv.hasClass("win-listview"), "ListView 1 not where it's expected to be");
                    test.assert($zoomedOutContainerListDiv.hasClass("win-listview"), "ListView 2 not where it's expected to be");
                    test.assert($zoomedInContainerListDiv.attr("id") == "zoomedInListView", "ListView 1 has wrong id");
                    test.assert($zoomedOutContainerListDiv.attr("id") == "zoomedOutListView", "ListView 2 has wrong id");

                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test SemanticZoom.locked property
    //
    lockedProperty: function (test) {

        test.start("SemanticZoom.locked property");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var target = testHarness.addTestDiv("test1")[0];
            WinJS.UI.Pages.render("/Tests/supportFiles/semanticZoom/simpleZoom.html", target).then(function (testPage) {
                var sz = $("#semanticZoomDiv")[0].winControl;
                test.assert(!sz.locked, "Default locked property should be false, but it's true");
                test.assert(!sz.zoomedOut, "Not Zoomed in by default");
                sz.locked = true;
                sz.zoomedOut = true;

                // Wait until view is done *not* transitioning.  Note that the semanticzoom control does not send a zoomchanged (or other event)
                // so we need to just wait.
                WinJS.Promise.timeout(1000).then(function () {
                    test.assert(sz.zoomedOut == false, "Zoomed, but shouldn't have");
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test SemanticZoom.enableButton property
    //
    enableButton: function (test) {

        test.start("SemanticZoom.enableButton property");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var target = testHarness.addTestDiv("test1")[0];
            WinJS.UI.Pages.render("/Tests/supportFiles/semanticZoom/simpleZoom.html", target).then(function (testPage) {
                var sz = $("#semanticZoomDiv")[0].winControl;
                var $button = $(".win-semanticzoom-button");
                test.assert(sz.enableButton == true, "Enablebutton should be true by default");

                // Wait until view is done *not* transitioning.  Note that the semanticzoom control does not send a zoomchanged (or other event)
                // so we need to just wait.
                WinJS.Promise.timeout(1000).then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        test.assert($button[0], "Semantic zoom button not present in DOM");

                        // TODO: verify zoom button is second div of the SemanticZoom control

                        sz.onzoomchanged = function () {
                            sz.onzoomchanged = null;
                            onComplete();
                        }

                        // Click the button and ensure it zooms out
                        $button.click();

                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        // ensure button is hidden
                        test.assert($button.css("visibility") == "hidden", "Button not hidden in zoomed out mode");

                        // zoom back in
                        sz.onzoomchanged = function () {
                            sz.onzoomchanged = null;
                            onComplete();
                        }
                        sz.zoomedOut = false;
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        // disable the button
                        sz.enableButton = false;
                        // Yield so that the js renderer can remove the button
                        onComplete();
                    });
                }).then(function () {
                    var $button = $(".win-semanticzoom-button");
                    test.assert($button.length == 0, "Zoom button present; shouldn't be");

                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test SemanticZoom zooming
    //
    zooming: function (test) {

        test.start("Basic SemanticZoom zooming");
        test.timeoutLength = 5000;

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            var target = testHarness.addTestDiv("test1")[0];
            var sz;
            WinJS.UI.Pages.render("/Tests/supportFiles/semanticZoom/simpleZoom.html", target).then(function (testPage) {
                sz = $("#semanticZoomDiv")[0].winControl;
                WinJS.Promise.timeout(1000).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        // test zoomed-in by default
                        test.assert($("#zoomedInListView").css("visibility") == "visible", "1: Zoomed in isn't visible (should be)");
                        test.assert($("#zoomedOutListView").css("visibility") == "hidden", "1: Zoomed out is visible (shouldn't be)");

                        sz.onzoomchanged = function (e) {
                            sz.onzoomchanged = null;
                            onComplete();
                        }
                        sz.zoomedOut = true;
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {

                        // test zoomed out
                        test.assert($("#zoomedInListView").css("visibility") == "hidden", "2: Zoomed in is visible (shouldn't be)");
                        test.assert($("#zoomedOutListView").css("visibility") == "visible", "2: Zoomed out isn't visible (should be)");

                        sz.onzoomchanged = function (e) {
                            sz.onzoomchanged = null;
                            onComplete();
                        }
                        sz.zoomedOut = false;
                    });
                }).then(function () {
                    return new WinJS.Promise(function (onComplete) {
                        // test zoomed back in
                        test.assert($("#zoomedInListView").css("visibility") == "visible", "3: Zoomed in isn't visible (should be)");
                        test.assert($("#zoomedOutListView").css("visibility") == "hidden", "3: Zoomed out is visible (shouldn't be)");

                        sz.onzoomchanged = function (e) {
                            sz.onzoomchanged = null;
                            onTestComplete(test);
                            onComplete();
                        }
                        sz.zoomedOut = true;
                    });
                });
            });

            test.nyi("Test IZoomableView");
            test.nyi("Test zoomFactor");
        });
    }
});

// Create a grouped list for the ListView from the item data and the grouping functions
var Tests = {
    SemanticZoom: {
        myList: new WinJS.Binding.List([
            { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/Tests/supportFiles/images/60Lemon.png" },
            { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/Tests/supportFiles/images/60Lemon.png" },
            { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/Tests/supportFiles/images/60Lemon.png" },
            { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/Tests/supportFiles/images/60Lemon.png" },
            { title: "Marvelous Mint", text: "Gelato", picture: "/Tests/supportFiles/images/60Mint.png" },
            { title: "Marvelous Mint", text: "Gelato", picture: "/Tests/supportFiles/images/60Mint.png" },
            { title: "Marvelous Mint", text: "Gelato", picture: "/Tests/supportFiles/images/60Mint.png" },
            { title: "Marvelous Mint", text: "Gelato", picture: "/Tests/supportFiles/images/60Mint.png" },
            { title: "Creamy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Creamy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Creamy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Creamy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Succulent Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Succulent Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Succulent Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Succulent Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Very Vanilla", text: "Ice Cream", picture: "/Tests/supportFiles/images/60Vanilla.png" },
            { title: "Very Vanilla", text: "Ice Cream", picture: "/Tests/supportFiles/images/60Vanilla.png" },
            { title: "Very Vanilla", text: "Ice Cream", picture: "/Tests/supportFiles/images/60Vanilla.png" },
            { title: "Very Vanilla", text: "Ice Cream", picture: "/Tests/supportFiles/images/60Vanilla.png" },
            { title: "Orangy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Orangy Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Absolutely Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Absolutely Orange", text: "Sorbet", picture: "/Tests/supportFiles/images/60Orange.png" },
            { title: "Triple Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Triple Strawberry", text: "Sorbet", picture: "/Tests/supportFiles/images/60Strawberry.png" },
            { title: "Double Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Double Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Double Banana Blast", text: "Low-fat frozen yogurt", picture: "/Tests/supportFiles/images/60Banana.png" },
            { title: "Green Mint", text: "Gelato", picture: "/Tests/supportFiles/images/60Mint.png" }
        ]),

        compareGroups: function (left, right) {
            return left.toUpperCase().charCodeAt(0) - right.toUpperCase().charCodeAt(0);
        },

        getGroupKey: function (dataItem) {
            return dataItem.title.toUpperCase().charAt(0);
        },

        getGroupData: function (dataItem) {
            return {
                title: dataItem.title.toUpperCase().charAt(0)
            };
        }
    }
};

Tests.SemanticZoom.myGroupedList = Tests.SemanticZoom.myList.createGrouped(Tests.SemanticZoom.getGroupKey, Tests.SemanticZoom.getGroupData, Tests.SemanticZoom.compareGroups);

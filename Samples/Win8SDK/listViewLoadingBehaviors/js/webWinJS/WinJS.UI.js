"use strict";

// ================================================================
//
// WinJS.UI
//
// This is the root WinJS.UI namespace/object
WinJS.Namespace.defineWithParent(WinJS, "UI", {

    // ================================================================
    //
    // Function: WinJS.UI.processAll
    //
    processAll: function (rootElement) {

        return new WinJS.Promise(function (onComplete) {
            // If the caller didn't specify a root element, then process the entire document.
            if (rootElement == undefined)
                rootElement = document;

            // Add winControl objects to all elements tagged as data-win-control
            $("[data-win-control]", rootElement).each(function () {

                // ensure dataset in IE9-
                webWinJS.Utilities._ensureDatasetReady(this);

                // If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
                // into a valid JS object before passing to the constructor.
                var options = this.dataset.winOptions != undefined ? webWinJS.Utilities._convertDeclarativeDataStringToJavascriptObject(this.dataset.winOptions) : null;

                // Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object
                this.winControl = eval("new window." + this.dataset.winControl + "(this, options)");
            });
            onComplete();
        });
    },

    SemanticZoom: function (context, options) {
        return {
            zoomedOut: false,
            forceLayout: function () {
            },
            locked: false
        };
    },

    Animation: {
        enterPage: function (a, b) { return new WinJS.Promise(function (c) { c(); }); }
    },

    // ================================================================
    //
    // Function: WinJS.UI.setOptions
    //
    setOptions: function (targetObject, members) {
        // check for a delayed render type object, like list view...
        if (targetObject._delayedRender != undefined)
            targetObject._delayedRender = true;
        for (var fieldKey in members) {
            // Sanity check
            if (fieldKey == undefined)
                console.error("Setting undefined field in WinJS.UI.setOptions", targetObject, members);
            if (members[fieldKey] == undefined)
                console.error("Setting undefined field value in WinJS.UI.setOptions", targetObject, members, fieldKey);
            targetObject[fieldKey] = members[fieldKey];
        }
        if (targetObject._delayedRender != undefined) {
            targetObject._delayedRender = false;
            targetObject.render();
        }
    },


    // ================================================================
    //
    // Function: WinJS.UI.ListLayout
    //
    // NYI NYI NYI 
    //
    ListLayout: function () {
        // NYI
    },


    // ================================================================
    //
    // Function: WinJS.UI.ListLayout
    //
    // NYI NYI NYI 
    //
    GridLayout: function () {
        // NYI
    }
});
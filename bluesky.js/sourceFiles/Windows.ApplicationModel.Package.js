"use strict";

// ================================================================
//
// Windows.ApplicationModel.Package
//
WinJS.Namespace.define("Windows.ApplicationModel.Package", {

    // =========================================================
    //
    // public member: Windows.ApplicationModel.Package
    //
    //      MSDN: TODO
    //
    _current: null,
    current: {
        get: function () {
            if (!this._current)
                this._current = new Windows.ApplicationModel._package();
            return this._current;
        }
    }
});


// ================================================================
//
// Windows.ApplicationModel._package
//
// This is the root Windows namespace/object
//
WinJS.Namespace.define("Windows.ApplicationModel", {

    // =========================================================
    //
    // private class: Windows.ApplicationModel._package
    //
    _package: WinJS.Class.define(

        function () {
            
            this.installedLocation = null;

            // TODO: What should these values be?
            this.id = {
                version: {
                    major: 0,
                    minor: 0,
                    build: 0,
                    revision: 0
                },
                architecture: "web",
                resourceId: "100",
                publisher: "bluesky",
                publisherId: "200",
                fullName: "testApp",
                familyName: "testApp_Family",
                isFramework: false
            };
        },

        // ================================================================
        // Windows.Storage.ApplicationData.Package members
        // ================================================================

        {
        })
});

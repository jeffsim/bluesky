// ================================================================
//
// WinJS.Resources
//
//		Implementation of the WinJS.Resources object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.Resources", function () {
}, {

    // ================================================================
    //
    // public function: WinJS.Resources.processAll
    //
    //		MSDN: TODO
    //
    processAll: function () {
        throw "nyi";
    },


    // ================================================================
    //
    // public function: WinJS.Resources.getString
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701590.aspx
    //
    getString: function () {
        throw "nyi";
    },


    // ================================================================
    //
    // public event: WinJS.Resources.oncontextchanged
    //
    //		MSDN: TODO
    //
    oncontextchanged: {
        get: function () { return this._eventListeners["contextchanged"]; },
        set: function (callback) { this.addEventListener("contextchanged", callback); }
    }
});

// TODO: How to mixin to an object (instead of a class)?  
// WinJS.Class.mix(WinJS.Resources, WinJS.UI.DOMEventMixin);

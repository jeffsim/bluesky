// ================================================================
//
// Windows.Storage.ApplicationDataContainerSettings
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    ApplicationDataCompositeValue: WinJS.Class.derive(Object, null,null),


    // ================================================================
    //
    // public Object: Windows.Storage.ApplicationDataContainerSettings
    //
    ApplicationDataContainerSettings: WinJS.Class.derive(Windows.Foundation.Collections.IMapView,

        // =========================================================
        //
        // public function: Windows.Storage.ApplicationDataContainerSettings constructor
        //
        function () {

            // TODO: Read our values from store, once persistence model is figured out.
            //       (NOTE: Read doesn't happen here...)
        },

	    // ================================================================
	    // Windows.Storage.ApplicationDataContainerSettings members
	    // ================================================================

        {
            remove: function (key) {
                delete this[key];
            },

            insert: function (key, value) {
                this[key] = value;
            },

            clear: function () {
                for (var i in this)
                    if (this.hasOwnProperty(i))
                        delete this[i];
            },

            getView: function () {
                var result = {};
                for (var i in this)
                    if (this.hasOwnProperty(i))
                        result[i] = this[i];
                result.size = Object.keys(result).length;
                return result;
            }
        })
});

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
        function (parentApplicationDataContainer) {

            this.parentADC = parentApplicationDataContainer;

            // TODO: Read our values from store, once persistence model is figured out.
            // TODO: This naming approach won't support redundant names.  Need to move to use the MFT.
            var existingContainerSettings = Bluesky.dataStore.getItem("adcs_" + this.parentADC.name);
            if (existingContainerSettings) {

                // Settings container exists - load it
                // TODO (CLEANUP): Better way to do this?
                var saveData = JSON.parse(existingContainerSettings);
                for (var i in saveData)
                    this[i] = saveData[i];

                // NOTE: Read doesn't happen here... (tbd: is that to defer reading ALL settings on startup?)
            } else {
                Bluesky.dataStore.setItem("adcs_" + name, JSON.stringify({ "parent": this.parentADC.name, values: null }));
            }
        },

	    // ================================================================
	    // Windows.Storage.ApplicationDataContainerSettings members
	    // ================================================================

        {
            _blueskyPersist: function () {
                var saveData = {};
                for (var i in this)
                    if (this.hasOwnProperty(i) && i != "parentADC")
                        saveData[i] = this[i];
                Bluesky.dataStore.setItem("adcs_" + this.parentADC.name, JSON.stringify(saveData));
            },


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

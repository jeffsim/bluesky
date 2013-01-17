// ================================================================
//
// Windows.Storage.ApplicationDataContainer
//
//		MSDN: TODO
//

WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.ApplicationData
    //
    ApplicationDataContainer: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.ApplicationDataContainer constructor
        //
        //      MSDN: TODO
        //
        function (name, disposition) {

            this.name = name;

            // TODO: Support disposition

            // TODO: If this container already exists, then open it instead of initializing with empty values
            //       Need to figure out persistence model first.
            this.containers = new Windows.Foundation.Collections.IMapView();
            this.values = new Windows.Storage.ApplicationDataContainerSettings();
        },

	    // ================================================================
	    // Windows.Storage.ApplicationDataContainer members
	    // ================================================================

        {
            // =========================================================
            //
            // public function: Windows.Storage.ApplicationDataContainer.createContainer
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacontainer.createcontainer.aspx
            //
            createContainer: function (name, disposition) {

                // Create the new container
                var newContainer = new Windows.Storage.ApplicationDataContainer(name, disposition);

                // Assign it to us with our locality
                newContainer._parentContainer = this;
                newContainer.locality = this.locality;

                // Win8 does not allow multiple subcontainers with the same name, so we can use a map (for quicker lookup later) here.
                this.containers[name] = newContainer;

                // Persist in file system
                Bluesky.dataStore.setItem("adc_" + name, JSON.stringify({ "parent": this.name }));

                // return the newly created container
                return newContainer;
            },


            // =========================================================
            //
            // public function: Windows.Storage.ApplicationDataContainer.deleteContainer
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacontainer.deletecontainer.aspx
            //
            deleteContainer: function (name) {
                
                // Remove from filesystem
                Bluesky.dataStore.removeItem("adc_" + name);

                delete this.containers[name];
            }
        })
});

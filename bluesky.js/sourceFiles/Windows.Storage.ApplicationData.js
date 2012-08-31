// ================================================================
//
// Windows.Storage.ApplicationData
//
//		MSDN: TODO
//
//      Good writeup on the challenge behind local storage in browsers: http://hacks.mozilla.org/2012/03/there-is-no-simple-solution-for-local-storage/
//      tbd: short term, using localStorage for this.  There are issues with this (see previous link; plus, unclear limitations on storage amount across subdomains) -
//      however, it *will* run on practically every browser (see http://caniuse.com/#search=localstorage).  Mid-term, we should consider moving to a DB (mainly for
//      asynchronicity and perf), although there's not cross-browser standard there (e.g. indexedDb not supported on IE9).  Long-term, the new HTML5 file API makes sense,
//      but it's nowhere near cross-browser yet.  So; net net, we go with localStorage, with all its warts, for now.
//
WinJS.Namespace.define("Windows.Storage.ApplicationData", {

    // =========================================================
    //
    // public member: Windows.Storage.ApplicationData.current
    //
    //      MSDN: TODO
    //
    _current: null,
    current: {
        get: function () {
            if (!this._current)
                this._current = new Windows.Storage._applicationData();
            return this._current;
        }
    }
});


WinJS.Namespace.define("Windows.Storage", {

    // =========================================================
    //
    // private class: Windows.Storage.ApplicationData._applicationData
    //
    //      Encapsulates Windows.Storage.ApplicationData members in singleton 'current' above
    //
    _applicationData: WinJS.Class.define(

        function () {


            // Build the top-level root folder which will hold all other folders
            // TODO: Define correct root folder structure.  Mimic'ing Win8's for now
            this._rootFolder = new Windows.Storage.StorageFolder(null, "/Users/UserId");

            // Create the app folder
            this._appFolder = new Windows.Storage.AppXFolder(null, "");

            // TODO: I'm reusing the AppXFolder object for subfolders as well, so I can't set name/etc in the constructor
            this._appFolder.name = "AppX";
            this._appFolder.displayName = "AppX";
            this._appFolder.folderRelativeId = "0/0/AppX";

            var curPackage = Windows.ApplicationModel.Package.current;
            curPackage.installedLocation = this._appFolder;

            var builtInFolderRoot = "/Users/UserId/AppData/Local/Packages/" + curPackage.id.familyName + "/";

            // Create the local folder
            this.localFolder = new Windows.Storage.StorageFolder(this._rootFolder, "LocalState");
            this.localFolder.folderRelativeId = "0/0/" + this.localFolder.name;
            this.localFolder.path = builtInFolderRoot + "LocalState";
            this.localFolder._initMFT();

            // Create the temporary folder
            // TODO (CLEANUP): tempfolder should move to sessionStorage instead of localStorage, or at least be tracked
            // and periodically dumped.  Lack of ability to tell localStorage usage is... problemsome :P.
            this.temporaryFolder = new Windows.Storage.StorageFolder(this._rootFolder, "TempState");
            this.temporaryFolder.folderRelativeId = "0/0/" + this.temporaryFolder.name;
            this.temporaryFolder.path = builtInFolderRoot + "TempState";
            this.temporaryFolder._initMFT();

            // Create the roaming folder used to proxy all remote files
            this.roamingFolder = new Windows.Storage.StorageFolder(this._rootFolder, "RoamingState");
            this.roamingFolder.folderRelativeId = "0/0/" + this.roamingFolder.name;
            this.roamingFolder.path = builtInFolderRoot + "RoamingState";
            this.roamingFolder.isRoaming = true;
            this.roamingFolder._initMFT();

            // Create the settings containers
            this.roamingSettings = new Windows.Storage.ApplicationDataContainer("", Windows.Storage.ApplicationDataCreateDisposition.always);
            this.roamingSettings.locality = Windows.Storage.ApplicationDataLocality.roaming;

            this.localSettings = new Windows.Storage.ApplicationDataContainer("", Windows.Storage.ApplicationDataCreateDisposition.always);
            this.localSettings.locality = Windows.Storage.ApplicationDataLocality.local;

            // TODO (LATER): Create a page cache folder for apploader/cached apps.
            // appData._pageCacheFolder = new Windows.Storage.StorageFolder(appData._rootFolder, "pageCache");

            // mimic win8's roaming storage quota
            this.roamingStorageQuota = 100;

            // Start at version 0
            // TODO: Read this from the store?
            this.version = 0;
        },

        // ================================================================
        // Windows.Storage.ApplicationData._applicationData members
        // ================================================================

        {
            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.clearAsync
            //
            //		MSDN: TODO
            //
            clearAsync: function (locality) {
                var that = this;
                return new WinJS.Promise(function (c) {
                    var promises = [];
                    // clear localFolder
                    // TODO (PERF): Instead of enumerating this way, just blow away the folder's MFT (being sure to clear from localStorage!)
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.local)
                        promises.push(that.localFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // clear temporaryFolder
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.temporary)
                        promises.push(that.temporaryFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // clear roamingFolder
                    if (locality === undefined || locality == Windows.Storage.ApplicationDataLocality.roaming)
                        promises.push(that.roamingFolder.getItemsAsync().then(function (items) {
                            items.forEach(function (item) {
                                promises.push(item.deleteAsync());
                            });
                        }));

                    // Wait until everything's deleted
                    WinJS.Promise.join(promises).then(function () {
                        c();
                    });
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.setVersionAsync
            //
            //		MSDN: TODO
            //
            setVersionAsync: function (newVersion, setVersionEventHandler) {
                return new WinJS.Promise(function (c) {
                    setVersionEventHandler({
                        currentVersion: Windows.Storage.ApplicationData.current.version, desiredVersion: newVersion
                    });
                    Windows.Storage.ApplicationData.version = newVersion;
                    c();
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.addEventListener
            //
            //		MSDN: TODO
            //
            addEventListener: function () {
                console.warn("bluesky fyi: Windows.Storage.ApplicationData.addEventListener is NYI");
            },


            // ================================================================
            //
            // public function: Windows.Storage.ApplicationData.removeEventListener
            //
            //		MSDN: TODO
            //
            removeEventListener: function () {
                console.warn("bluesky fyi: Windows.Storage.ApplicationData.removeEventListener is NYI");
            },
        })
});

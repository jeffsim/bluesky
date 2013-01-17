// ================================================================
//
// Windows.Storage
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // =========================================================
    //
    // Private initializer: Windows.Storage._internalInit
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileattributes.aspx
    //
    _internalInit: function () {

        // Initialize the store for all persistent data.
        // NOTE: In some cases, localStorage is giving an access denied error in IE10 see http://stackoverflow.com/questions/13102116/access-denied-for-localstorage-in-ie10
        // Our workaround: try localStorage - if that doesn't work then fall back to session storage.
        // TODO: Roll this into a larger downlevel-support module and provide developer with options.
        Bluesky.dataStore = window.localStorage;

        try {
            Bluesky.dataStore.getItem('test__bluesky');
        } catch (ex) {
            // Failed to call getItem; fallback to session storage
            console.warn("Bluesky warning: this browser's local storage is not accessible; falling back to session storage instead.");
            Bluesky.dataStore = window.sessionStorage;
        }

        // Create the known folders
        var appData = Windows.Storage.ApplicationData.current;

        // TODO: Create all known folders
        // TODO: What to do with them?  I'm creating them here so that apps that assume their existence don't break; but 
        //       I'm not actually running filters (etc) against them.
        this.KnownFolders.documentsLibrary = new Windows.Storage.StorageFolder(appData.localFolder, "documents");
        this.KnownFolders.homeGroup = new Windows.Storage.StorageFolder(appData.localFolder, "homegroup");
        this.KnownFolders.picturesLibrary = new Windows.Storage.StorageFolder(appData.localFolder, "pictures");

        // Initialize the CachedFileManager for roaming files.
        // TODO: Uncomment this when roaming is enabled
        // Windows.Storage.CachedFileManager.init();
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.FileAttributes
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileattributes.aspx
    //
    FileAttributes: {
        normal: 0,
        readonly: 1,
        directory: 16,
        archive: 32,
        temporary: 256
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.CreationCollisionOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.creationcollisionoption.aspx
    //
    CreationCollisionOption: {
        generateUniqueName: 0,
        replaceExisting: 1,
        failIfExists: 2,
        openIfExists: 3
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.NameCollisionOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.namecollisionoption.aspx
    //
    NameCollisionOption: {
        generateUniqueName: 0,
        replaceExisting: 1,
        failIfExists: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.ApplicationDataLocality
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatalocality.aspx
    //
    ApplicationDataLocality: {
        local: 0,
        roaming: 1,
        temporary: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.ApplicationDataCreateDisposition
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdatacreatedisposition.aspx
    //
    ApplicationDataCreateDisposition: {
        always: 0,
        existing: 1
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.StorageDeleteOption
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagedeleteoption.aspx
    //
    StorageDeleteOption: {
        default: 0,
        PermanentDelete: 1
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.StorageItemTypes
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storageitemtypes.aspx
    //
    StorageItemTypes: {
        none: 0,
        file: 1,
        folder: 2
    },


    // =========================================================
    //
    // Public enumeration: Windows.Storage.FileAccessMode
    //
    //      MSDN:  http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileaccessmode.aspx
    //
    FileAccessMode: {
        read: 0,
        readWrite: 1
    },


    // =========================================================
    //
    // Public class: Windows.Storage.KnownFolders
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.knownfolders.aspx
    //
    KnownFolders: {},
});


// ================================================================
//
// Windows.Storage.StorageFolder
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    AppXFolder: WinJS.Class.derive(Windows.Storage.StorageFile,
        function () {
        },
        {
        })
});

WinJS.Namespace.define("Windows.Storage", {

    AppXFolder: WinJS.Class.derive(Windows.Storage.StorageFolder,

        // On Win8, the AppX folder contains the set of files that are embedded into the application.  On the 
        // web though, we don't have "embedded" files (at least, until apploader is in place).  So for us, the
        // Application folder is set to the root folder.  We need to override various 'get' functions accordingly
        function (parentFolder, name) {

            // Call into our base class' constructor
            Windows.Storage.StorageFolder.call(this, parentFolder, name);
        },

        {
            getFolderAsync: function (name) {

                var that = this;
                // in the appx folder, we assume requested folders exist
                return new WinJS.Promise(function (onComplete) {
                    var folder = new Windows.Storage.AppXFolder(this, name);
                    // appx folders support passing full path in as name; ensure we don't have double-/s
                    if (name[0] == '/')
                        name = name.substr(1);
                    folder.path = that.path + "/" + name;

                    onComplete(folder);
                });
            },

            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var props = {
                        size: that.size || 0,
                    };
                    onComplete(props);
                });
            },

            getFileAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    // Check if the file exists in the filesystem
                    var fullFilePath = that.path + "/" + name;

                    WinJS.xhr({
                        url: fullFilePath
                    }).then(
                    function (result) {
                        // Found the file.  Track that this file came from appX so that we don't
                        // try to load it from localStorage in FileIO.readTextAsync.  Also track the
                        // file's contents so that we don't have to reload them.
                        var file = new Windows.Storage.StorageFile(that, name);
                        file.path = fullFilePath;
                        // NOTE: This will differ slightly between win8 and web.  e.g. on Windows, a file with "Hello There" registers as 14 bytes, not 11,
                        // due to three bytes it prepends.  When we have binary buffer reads, use those instead to get 'real' file size.
                        if (!result.responseText)
                            file.size = 0;
                        else
                            file.size = result.responseText.length;

                        file._isAppX = true;
                        file._appXContents = result.responseText;

                        onComplete(file);
                    },
                     function (error) {
                         // no file found
                         if (!_warned404) {
                             console.warn("bluesky FYI: getFileAsync failed when loading a file from the app-install folder.  Note that all custom file types must " +
                                          "have their mime type registered in order for IIS to serve them up; this can be done on the server side, or directly from " +
                                          "your app's web.config by adding a mimeMap entry.  See the bluesky test Harness' web.config for an example, and the readTextAsync " +
                                          "test in Tests.Windows.Storage.FileIO.js.");
                             _warned404 = true;
                         }
                         onError({ message: "The system cannot find the file specified.\r\n" });
                     });
                });
            },

            getItemAsync: function (name) {

                var that = this;
                // in the appx folder, check if an item is a file and return it if so; otherwise assume it's a present
                // folder and gen' it up.
                return new WinJS.Promise(function (onComplete) {

                    if (!_warnedConsoleErrors) {
                        console.warn("bluesky FYI: StorageFolder.getItemAsync in the app install folder may output errors - these are not errors, " +
                                     "but are reported because we do not yet support/require an 'app manifest' that tells bluesky which files are installed " +
                                     "in the app-install folder; so bluesky cannot tell if the requested item is a file or a folder.  Thus, we first try to load it as a file " +
                                     "and if that fails, then we load it as a folder - this results in a 403, 404, or 301 error being reported for every folder " +
                                     "request that is made through getItemAsync.  To avoid the  error in console.log, and (more importantly) to " +
                                     "speed up accessing files and folders from the app install folder, switch to using getFileAsync and getFolderAsync. " +
                                     "This issue will be fixed when we support apploader and package manifests in R2/R3.");

                        _warnedConsoleErrors = true;
                    }

                    // Try loading it as a file
                    return that.getFileAsync(name).then(
                        function (file) {
                            // Found as a file
                            onComplete(file);
                        },
                        function (error) {
                            // File not found - return a folder instead
                            that.getFolderAsync(name).then(function (folder) {
                                onComplete(folder);
                            });
                        });
                });
            },
        })
});
var _warnedConsoleErrors = false;
var _warned404 = false;
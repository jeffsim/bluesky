// ================================================================
//
// Windows.Storage.StorageFile
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.StorageFile
    //
    StorageFile: WinJS.Class.derive(Windows.Storage.StorageItem,

		// ================================================================
		//
		// public function: Windows.Storage.StorageFile
		//
		//		MSDN: TODO
		//
        function (parentFolder, desiredName) {

            // Call into our base class' constructor
            Windows.Storage.StorageItem.call(this, parentFolder, desiredName);

            // Set our attributes
            this.attributes = Windows.Storage.FileAttributes.archive;

            var ext = desiredName.split('.').pop();
            switch (ext.toLowerCase()) {
                case "xml":
                    this.displayType = "XML Document";
                    break;
                default:
                    this.displayType = ext.toUpperCase() + " File";
                    break;
            }
            this.fileType = "." + ext;

            this.contentType = Windows.Storage.StorageFile._fileTypeMap[ext]
                                    ? Windows.Storage.StorageFile._fileTypeMap[ext]
                                    : ext.toUpperCase() + " File";
        },

            // ================================================================
            // Windows.Storage.StorageFile members
            // ================================================================
        {

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.copyAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.copyasync.aspx
            //
            copyAsync: function (folder, desiredName, collisionOption) {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var exists = folder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.NameCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(folder, desiredName);

                    var newFile = that.parentFolder._copyFileInMFT(that, folder, desiredName);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.copyAndReplaceAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh738482.aspx
            //
            copyAndReplaceAsync: function (fileToReplace) {
                var that = this;
                return fileToReplace.deleteAsync().then(function () {
                    return that.copyAsync(fileToReplace.parentFolder, fileToReplace.name);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.moveAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.moveasync.aspx
            //
            moveAsync: function (folder, desiredName, collisionOption) {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var exists = that.parentFolder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "File exists" });    // TODO (CLEANUP): Use correct win8 message
                        return;
                    }

                    if (collisionOption == Windows.Storage.NameCollisionOption.generateUniqueName && exists) {
                        var index = 1;
                        var fileExt = desiredName.lastIndexOf(".");
                        if (fileExt >= 0) {
                            var origNameWithoutExt = desiredName.substr(0, fileExt);
                            var ext = desiredName.substr(fileExt);
                        } else {
                            var origNameWithoutExt = desiredName;
                            var ext = "";
                        }

                        while (true) {
                            desiredName = origNameWithoutExt + " (Copy " + index + ")" + ext;
                            if (!that.parentFolder._mftEntryExists(desiredName))
                                break;
                            index++;
                        }

                    }

                    var newFile = that.parentFolder._copyFileInMFT(that, folder, desiredName);

                    // now that we've copied the file, remove the original one (this)
                    // TODO (PERF): Combine this into one action
                    that.deleteAsync().then(function () {
                        onComplete(newFile);
                    });
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.moveAndReplaceAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh738483.aspx
            //
            moveAndReplaceAsync: function (fileToReplace) {
                var that = this;
                return fileToReplace.deleteAsync().then(function () {
                    return that.moveAsync(fileToReplace.parentFolder, fileToReplace.name);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.deleteAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.storagefile.deleteasync.aspx
            //
            deleteAsync: function () {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Remove ourselves from our parent's MFT
                    that.parentFolder._removeFromMFT(that);

                    onComplete();
                });
            },
        },

            // ================================================================
            // Windows.Storage.StorageFile static members
            // ================================================================

        {

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.getFileFromApplicationUriAsync
            //
            getFileFromApplicationUriAsync: function (uri) {
                return Windows.Storage.StorageFile.getFileFromPathAsync(uri.uri);
            },

            // ================================================================
            //
            // public function: Windows.Storage.StorageFile.getFolderFromPathAsync
            //
            //      TODO (CLEANUP): Combine this and StorageFile.getFileFromPathAsync - lots of shared code
            //
            getFileFromPathAsync: function (path) {

                path = path.replace(/\\/g, "/");

                // TODO (CLEANUP): Check for ms-appdata first, and then merge these two into one block.
                if (path.indexOf("ms-appx:///") == 0) {

                    // Loading from app install folder; redirect to it
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    var fileFolder = path.substr(11, path.lastIndexOf("/") - 11);
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFileAsync(fileName);
                    });
                }

                // Convert built-in folders' full path reference to ms-appdata path references
                var appData = Windows.Storage.ApplicationData.current;
                path = path.replace(appData.localFolder.path, "ms-appdata:///local");
                path = path.replace(appData.temporaryFolder.path, "ms-appdata:///temp");
                path = path.replace(appData.roamingFolder.path, "ms-appdata:///roaming");

                if (path.indexOf("ms-appdata:///") != 0) {
                    // App is referencing a file in root.  Treat that as a reference to the app install folder
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
                    // TODO: Need to strip initial "/" if present?
                    var fileFolder = path.substr(0, path.lastIndexOf("/"));
                    var fileName = path.substr(path.lastIndexOf("/") + 1);
                    // Note: we can pass the full "foo/bar/xyz/abc" path to getFolderAsync since the appx folder handler doesn't care.  This will
                    // have to change when we implement 'real' appx folder with manifests.
                    return appFolder.getFolderAsync(fileFolder).then(function (folder) {
                        return folder.getFileAsync(fileName);
                    });
                }

                // If here, then it's a reference to temp, local, or roaming folder.

                var appData = Windows.Storage.ApplicationData.current;

                if (path.indexOf("ms-appdata:///temp/") == 0) {

                    // loading from temp folder; redirect to it
                    var folder = appData.temporaryFolder;
                    path = folder.path + path.substr(18);

                } else if (path.indexOf("ms-appdata:///local/") == 0) {

                        // loading from local folder; redirect to it
                    var folder = appData.localFolder;
                    path = folder.path + path.substr(19);

                } else if (path.indexOf("ms-appdata:///roaming/") == 0) {

                        // loading from roaming folder; redirect to it
                    var folder = appData.roamingFolder;
                    path = folder.path + path.substr(21);

                } else {
                    console.warn("Invalid path passed to Windows.Storage.PathIO: " + path);
                    return WinJS.Promise.as(null);
                }

                // At this point, folder references the root folder, and path has the (deep) subfolder and file
                var lastSlash = path.lastIndexOf("/");
                if (lastSlash >= 0) {
                    var fileName = path.substr(lastSlash + 1);
                    path = path.substr(0, lastSlash);
                    folder = folder._internalGetFolderFromPath(path);
                } else
                    fileName = path;

                return folder.getFileAsync(fileName);
            },

            // ================================================================
            //
            // private property: Windows.Storage.StorageFile._fileTypeMap
            //
            _fileTypeMap: {
                "jpg": "image/jpeg",
                "png": "image/png",
                "gif": "image/gif",
                "txt": "text/plain",
                "xml": "text/xml"
            }
        })
});
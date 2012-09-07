// ================================================================
//
// Windows.Storage.StorageFolder
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // public Object: Windows.Storage.StorageFolder
    //
    //  NOTES:
    //
    //      * Items are stored in window.localStorage (and proxied to remoteStorage).
    //      * Because localStorage is a set of flat key/value pairs, we maintain a virtual file hierarchy
    //        in the form of a masterfiletable.  Each folder has its own masterfiletable which describes
    //        the items in the folder.
    //      * Items can exist in multiple states: 
    //          - As an MFT entry, which contains metadata about the item but no functionality (e.g. path, attributes).  These are
    //            referred to as "unrealized items".
    //          - As a StorageItem (File/Folder), which contains functionality (e.g. deleteAsync).  These are referred to as
    //            "realized items".  An item is faulted in from unrealized to realized state on-demand.
    //      * We store realized items in a map (this.realizedItems[name])
    //
    StorageFolder: WinJS.Class.derive(Windows.Storage._StorageItem,

		// ================================================================
		//
		// public function: Windows.Storage.StorageFolder
		//
		//		MSDN: TODO
		//
        function (parentFolder, desiredName) {

            // Call into our base class' constructor
            Windows.Storage._StorageItem.call(this, parentFolder, desiredName);

            // Set our attributes
            this.attributes = Windows.Storage.FileAttributes.directory;
            this.displayType = "File folder";

            // Our list of realized items (we've previously loaded data and created StorageFolder/Files).
            this.realizedItems = {};

            this._initMFT();
        },

		// ================================================================
		// Windows.Storage.StorageFolder members
		// ================================================================

        {
            _initMFT: function() {
                
                // Initialize our MFT; this will load the list of unrealized items as a flat string
                var mft = localStorage.getItem("mft_" + this.path);

                // If the MFT exists for this folder, then parse it into a JSON object now; otherwise initialize it with an empty MFT
                if (mft) {
                    this.masterFileTable = $.parseJSON(mft);
                    for (var i in this.masterFileTable)
                        this.masterFileTable[i].path = this.path + "/" + this.masterFileTable[i].name;
                }
                else
                    this.masterFileTable = {};
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderFromPathAsync
            //
            //		MSDN: TODO
            //
            getFolderFromPathAsync: function (path) {

                var thisFolder = this;
                return new WinJS.Promise(function (onComplete) {

                    onComplete(thisFolder._internalGetFolderFromPath(path));
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getBasicPropertiesAsync
            //
            //		MSDN: TODO
            //
            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Folders have no size
                    // TODO: dateCreated (et al)
                    var props = {
                        size: 0,
                        dateCreated: that.dateCreated,
                        dateModified: that.dateModified,
                        dateAccessed: that.dateAccessed,
                    };
                    onComplete(props);
                });
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._internalGetFolderFromPath
            //
            _internalGetFolderFromPath: function (path) {

                // Starting at this folder, walk through child folders until we finish walking 'path'.

                // Are we the requested path?
                if (path.length == this.path.length) {
                    return this;
                } else {

                    // Normalize path to use "/" everywhere (could be mix of \ and /)
                    path = path.replace(/\\/g, "/");

                    // Get our child path and continue the search
                    var childPath = path.substring(this.path.length);
                    var nextFolderName = childPath.split('/').slice(1)[0];
                    var childFolder = this._getRealizedItem(nextFolderName);

                    // Does childfolder exist?
                    if (childFolder) {

                        // Child folder exists; recurse into it
                        return childFolder._internalGetFolderFromPath(path);

                    } else if (nextFolderName) {

                            // Create folders as we go (TODO: check if win8 does this)

                            // Child folder does not exist; create it and then recurse into it
                        var childFolder = new Windows.Storage.StorageFolder(this, nextFolderName);

                        // Add the StorageFolder to our MFT and persist it
                        this._addItemToMFT(childFolder);

                        // now recurse into it
                        return childFolder._internalGetFolderFromPath(path);

                    } else {
                        // child folder does not exists and there's no 'next' folder... Um, blanking on how this happens (TODO)
                        return this;
                    }
                }
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFolderAsync
            //
            //		MSDN: TODO
            //
            createFolderAsync: function (desiredName, collisionOption) {

                // TODO: What's the Win8 default?
                collisionOption = collisionOption || Windows.Storage.CreationCollisionOption.failIfExists;

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.CreationCollisionOption.failIfExists && exists) {
                        return onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(that, desiredName);

                    var newFile = new Windows.Storage.StorageFolder(that, desiredName);

                    // TODO: If isRoaming, then trigger the roaming manager to upload when it can

                    // Add the StorageFolder to our MFT and persist it
                    that._addItemToMFT(newFile);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFileAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227250.aspx
            //
            createFileAsync: function (desiredName, collisionOption) {

                // TODO: What's the Win8 default?
                collisionOption = collisionOption || Windows.Storage.CreationCollisionOption.failIfExists;

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.CreationCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage.StorageItem._generateUniqueName(that, desiredName);

                    var newFile = new Windows.Storage.StorageFile(that, desiredName);

                    // TODO: If isRoaming, then trigger the roaming manager to upload when it can

                    // Add the StorageFile to our MFT and persist it
                    that._addItemToMFT(newFile);

                    onComplete(newFile);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.createFolderQuery
            //
            //		MSDN: TODO
            //
            createFolderQuery: function (query) {

                // Ensure we have a valid query
                query = query || Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query);
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getItemsAsync
            //
            //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/br227287
            //
            getItemsAsync: function (startIndex, maxItemsToRetrieve) {

                var query = Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getItemsAsync();
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFoldersAsync
            //
            //		MSDN: TODO
            //
            getFoldersAsync: function (query) {

                // Ensure we have a valid query
                query = query || Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getFoldersAsync();
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFilesAsync
            //
            //		MSDN: TODO
            //
            getFilesAsync: function (query) {

                // Ensure we have a valid query
                query = query || Windows.Storage.Search.CommonFolderQuery.defaultQuery;

                return new Windows.Storage.Search.StorageFolderQueryResult(this, query).getFilesAsync();
            },




            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFileAsync
            //
            //		MSDN: TODO
            //
            //      TODO (R3): get[File|Folder|Item]Async() must check remote store if folder is roaming and file isn't
            //      present.  Use the CachedFileManager's ability to check status of roaming files (NYI)
            //
            getFileAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    name = name.replace("\\", "/");

                    var item = that._getRealizedItem(name);

                    // TODO: If not a file, then set item to null?  What does Win8 do?

                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },



            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderAsync
            //
            //		MSDN: TODO
            //
            getFolderAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var item = that._getRealizedItem(name);

                    // TODO: If not a folder, then set item to null?  What does Win8 do?

                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getItemAsync
            //
            //		MSDN: TODO
            //
            getItemAsync: function (name) {

                var that = this;
                return new WinJS.Promise(function (onComplete, onError) {

                    var item = that._getRealizedItem(name);
                    if (!item)
                        onError({ message: "The system cannot find the file specified.\r\n" });
                    else
                        onComplete(item);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getIndexedStateAsync
            //
            //		MSDN: TODO
            //
            getIndexedStateAsync: function () {

                return new WinJS.Promise(function (onComplete) {

                    // TODO: Indexing is not supported.  Update this should it ever be.
                    onComplete(Windows.Storage.Search.IndexedState.notIndexed);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.deleteAsync
            //
            //		MSDN: TODO
            //
            deleteAsync: function () {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Remove ourselves from our parent's MFT, and remove our (and our kids) MFTs from localStorage
                    that.parentFolder._removeFromMFT(that);

                    onComplete();
                });
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._removeFromMFT
            //
            //      Removes the specified child item from this folder's MFT, and removes the child item (and its kids') MFTs from localStorage
            //
            _removeFromMFT: function (childItem) {

                // Recursively remove the childItem and its childItems
                this._removeChildItem(childItem);

                // If this is a folder then persist our updated MFT
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._removeChildItem
            //
            //      Removes the specified child item from this folder's MFT, and removes the child item (and its kids') MFTs from localStorage
            //
            _removeChildItem: function (childItem) {

                // Remove us from the MFT
                if (childItem.attributes == Windows.Storage.FileAttributes.directory)
                    localStorage.removeItem("mft_" + childItem.path);
                else
                    localStorage.removeItem(childItem.path);

                // Remove the child item from our master file table
                delete this.masterFileTable[childItem.name.toLowerCase()];

                // If item is a folder then recursively remove it and its kids from localStorage
                if (childItem.attributes == Windows.Storage.FileAttributes.directory) {

                    // Empty the child's set of realizedItems
                    childItem.realizeItems = {};

                    // Recursively remove any child items
                    var that = this;
                    for (var entry in childItem.masterFileTable) {

                        var childItem2 = childItem.masterFileTable[entry];

                        // If the item is a file then just remove it; otherwise, recurse into it
                        if (childItem2.attributes == Windows.Storage.FileAttributes.archive)
                            localStorage.removeItem(childItem2.path);
                        else
                            childItem._removeChildItem(childItem2);
                    }
                }
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._mftEntryExists
            //
            _mftEntryExists: function (name) {

                return this.masterFileTable[name.toLowerCase()] ? true : false;
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._renameInMFT
            //
            _renameInMFT: function (childItem, newName) {

                var mftEntry = this.masterFileTable[childItem.name.toLowerCase()];
                if (!mftEntry)
                    return;

                // If childItem is a file, then load its contents so that we can save them back out with the new pathname (which is 
                // how we reference files in localStorage)
                if (childItem.attributes == Windows.Storage.FileAttributes.archive) {
                    var fileContents = localStorage.getItem(childItem.path);
                    localStorage.removeItem(childItem.path);
                }

                // Replace the old MFT entry with the new one
                this.masterFileTable[newName.toLowerCase()] = mftEntry;
                delete this.masterFileTable[mftEntry.name.toLowerCase()];

                // Update the mft entry's name
                mftEntry.name = newName;
                childItem.name = newName;
                childItem.path = this.path + "/" + newName;

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);

                // TODO: Do I need to update this.realizedItems as well?

                // When renaming a folder, we need to update MFT paths for all subfolders as well
                Windows.Storage.StorageFolder._refreshMFTPaths(this);

                // If this was a file then save out its contents with the new pathname
                if (fileContents)
                    localStorage.setItem(mftEntry.path, fileContents);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._copyInMFT
            //
            _copyFileInMFT: function (childItem, destFolder, newName) {

                // Special case files which come from the appx folder since they don't have an MFT entry
                if (childItem._isAppX) {

                    // Create a new mft entry
                    var newMFTEntry = destFolder._addItemToMFT({
                        name: childItem.name,
                        path: destFolder.path + "/" + childItem.name,
                        attributes: childItem.attributes,
                        masterFileTable: childItem.masterFileTable,
                        dateCreated: childItem.dateCreated,
                        dateModified: childItem.dateCreated,
                        dateAccessed: childItem.dateCreated,
                        size: childItem.size
                    });

                    var fileContents = childItem._appXContents;

                } else {

                    var sourceMFTEntry = this.masterFileTable[childItem.name.toLowerCase()];
                    if (!sourceMFTEntry)
                        return;

                    /*DEBUG*/
                    if (sourceMFTEntry.attributes != Windows.Storage.FileAttributes.archive)
                        console.warn("bluesky error: folder passed to StorageFolder._copyFileInMFT");
                    /*ENDDEBUG*/

                    // Clone the existing entry
                    var newMFTEntry = JSON.parse(JSON.stringify(sourceMFTEntry))

                    // Update the mft entry's name
                    newMFTEntry.name = newName;
                    newMFTEntry.path = destFolder.path + "/" + newName;
                    destFolder._addItemToMFT(newMFTEntry);

                    var fileContents = localStorage.getItem(sourceMFTEntry.path);
                }

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(destFolder.path, destFolder.masterFileTable);

                // copy source file's contents as well
                localStorage.setItem(newMFTEntry.path, fileContents);

                return destFolder._realizeItem(newMFTEntry);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._addItemToMFT
            //
            //      item: The StorageItem to add to the MFT
            //
            _addItemToMFT: function (item) {

                this.masterFileTable[item.name.toLowerCase()] = {
                    name: item.name,
                    path: this.path + "/" + item.name,
                    attributes: item.attributes,
                    masterFileTable: item.masterFileTable,
                    dateCreated: item.dateCreated,
                    dateModified: item.dateModified,
                    dateAccessed: item.dateAccessed,
                    size: item.size
                };

                // And persist our MFT back to localStorage
                Windows.Storage.StorageFolder._persistMFT(this.path, this.masterFileTable);

                return this.masterFileTable[item.name.toLowerCase()];
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._realizeItem
            //
            //      An item can be in one of two states; unrealized, in which case we simply have an MFT entry with metadata, or
            //      realized, in which case we have a StorageItem on which functions can be called.  Note that we still don't 
            //      necessarily have data for the item loaded.
            //
            _realizeItem: function (mftEntry) {

                var lowerName = mftEntry.name.toLowerCase();
                // TODO (CLEANUP/PERF): I'm not updating realizedItems properly elsewhere yet.  Same comment below
                // if (!this.realizedItems[lowerName])
                {

                    if (mftEntry.attributes == Windows.Storage.FileAttributes.archive) {

                        // The item is a file
                        this.realizedItems[lowerName] = new Windows.Storage.StorageFile(this, mftEntry.name);

                    } else {

                        // It's a folder
                        this.realizedItems[lowerName] = new Windows.Storage.StorageFolder(this, mftEntry.name);
                        this.realizedItems[lowerName].masterFileTable = mftEntry.masterFileTable;
                    }
                }

                return this.realizedItems[lowerName];
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._getRealizedItem
            //
            _getRealizedItem: function (name) {

                var lowerName = name.toLowerCase();

                // If we've already realized the mftEntry into a StorageItem, then return the realized StorageItem
                // TODO (CLEANUP/PERF): I'm not updating realizedItems properly elsewhere yet.  Same comment above
                // if (this.realizedItems[lowerName])
                //    return this.realizedItems[lowerName];

                // If we haven't realized the mftEntry, but it is valid entry, then realize it now
                if (this.masterFileTable && this.masterFileTable[lowerName])
                    return this._realizeItem(this.masterFileTable[lowerName]);

                // there is no item with name 'name' in this folder
                return null;
            },
        },

        // ================================================================
        // Windows.Storage.StorageFolder static members
        // ================================================================

        {
            // ================================================================
            //
            // public function: Windows.Storage.StorageFolder.getFolderFromPathAsync
            //
            //      TODO (CLEANUP): Combine this and StorageFile.getFileFromPathAsync - lots of shared code
            //
            getFolderFromPathAsync: function (path) {

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
                        return folder.getFolderAsync(fileName);
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
                        return folder.getFolderAsync(fileName);
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

                return folder.getFolderAsync(fileName);
            },

            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._refreshMFTPaths
            //
            //      After renaming a folder, we need to update all MFT paths in the folder and its subfolders
            //
            //      TODO: How to avoid this?
            //
            _refreshMFTPaths: function (folder) {

                var dirty = false;
                for (var i in folder.masterFileTable) {

                    var mftEntry = folder.masterFileTable[i];

                    // Update the mftentry's path
                    var newPath = folder.path + "/" + mftEntry.name;
                    if (newPath != mftEntry.path) {
                        var key = mftEntry.attributes == 16 ? "mft_" : "";
                        var value = localStorage[key + mftEntry.path];
                        localStorage.removeItem(key + mftEntry.path);
                        localStorage.setItem(key + newPath, value);
                        mftEntry.path = newPath;
                        dirty = true;
                    }
                    // If the mftEntry is a folder, then recurse into it
                    if (mftEntry.attributes == 16)
                        Windows.Storage.StorageFolder._refreshMFTPaths(mftEntry);
                }
                if (dirty)
                    Windows.Storage.StorageFolder._persistMFT(folder.path, folder.masterFileTable);
            },


            // ================================================================
            //
            // private function: Windows.Storage.StorageFolder._persistMFT
            //
            //      TODO (PERF): Wrap this in msSetImmediate & _isYielding (ala how BaseControl.render works) to allow
            //      batching of persistence in case app is changing many files at once.
            //
            _persistMFT: function (path, mft) {

                // Serialize our masterFileTable into a string that we can store
                //var mftString = JSON.stringify(this.masterFileTable);
                var mftString = JSON.stringify(mft, function (key, val) {
                    if (key == "path" || key == "masterFileTable")
                        return undefined;
                    return val;
                });
                // Store our MFT in localStorage
                localStorage.setItem("mft_" + path, mftString);
            }
        })
});
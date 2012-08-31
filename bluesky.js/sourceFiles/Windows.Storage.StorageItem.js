// ================================================================
//
// Windows.Storage._StorageItem
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // private Object: Windows.Storage._StorageItem
    //
    _StorageItem: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage._StorageItem constructor
        //
        function (parentFolder, desiredName) {

            this.parentFolder = parentFolder;
            if (parentFolder)
                this.isRoaming = parentFolder.isRoaming;
            this.name = desiredName;
            this.displayName = desiredName;
            if (parentFolder)
                this.path = parentFolder.path + "/" + desiredName;
            else
                this.path = desiredName;

            // TODO: Not storing dateCreated (or other date fields)
            this.dateCreated = new Date();//(new Date()).valueOf();
            this.dateModified = this.dateCreated;
            this.dateAccessed = this.dateCreated;

            this.properties = new Windows.Storage.StorageItemContentProperties(this);
        },

	    // ================================================================
	    // Windows.Storage._StorageItem members
	    // ================================================================

        {

            // ================================================================
            //
            // public function: Windows.Storage._StorageItem.isOfType
            //
            //      MSDN: TODO
            //
            isOfType: function (storageItemType) {

                // TODO: Bitmask, not equality.
                var isFolder = (this.attributes & Windows.Storage.FileAttributes.directory) == Windows.Storage.FileAttributes.directory;
                return (storageItemType == Windows.Storage.StorageItemTypes.folder && isFolder) ||
                     (storageItemType == Windows.Storage.StorageItemTypes.file && !isFolder);
            },


            // =========================================================
            //
            // public function: Windows.Storage._StorageItem.getBasicPropertiesAsync
            //
            //      MSDN: TODO
            //
            getBasicPropertiesAsync: function () {
                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    var props = {
                    };

                    // TODO (PERF-MAJOR): Store size in MFT?  I'm only okay with this because I'm assuming that getBasicPropertiesAsync
                    // is a relatively rare call.  Either way, this MUST be fixed in R2/R3.  Apologies to any devs who tracked piss-poor
                    // performance down to this line :P.
                    return Windows.Storage.PathIO.readTextAsync(that.path).then(function (contents) {
                        if (!contents)
                            props.size = 0;
                        else
                            props.size = contents.length;
                        props.dateCreated = that.dateCreated;
                        props.dateModified = that.dateModified;
                        onComplete(props);
                    });
                });
            },


            // =========================================================
            //
            // public function: Windows.Storage._StorageItem.renameAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227227.aspx
            //
            renameAsync: function (desiredName, collisionOption) {
                var that = this;

                return new WinJS.Promise(function (onComplete, onError) {

                    var exists = that.parentFolder._mftEntryExists(desiredName);

                    if (collisionOption == Windows.Storage.NameCollisionOption.failIfExists && exists) {
                        onError({ message: "Cannot create a file when that file already exists.\r\n" });
                        return;
                    }

                    if (collisionOption == Windows.Storage.CreationCollisionOption.generateUniqueName && exists)
                        desiredName = Windows.Storage._StorageItem._generateUniqueName(that.parentFolder, desiredName);

                    that.parentFolder._renameInMFT(that, desiredName);

                    onComplete(that);
                });
            },


            // =========================================================
            //
            // public function: Windows.Storage._StorageItem.moveAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br227218.aspx
            //
            moveAsync: function (destinationFolder) {
                var that = this;
                return new WinJS.Promise(function (onComplete) {
                    that.parentFolder._removeFromMFT(that);
                    destinationFolder._addToMSFT(that);
                    that.parentFolder = destinationFolder;
                    onComplete();
                });
            }
        },

	    // ================================================================
	    // Windows.Storage._StorageItem static members
	    // ================================================================

        {
            _generateUniqueName: function (folder, desiredName) {
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
                    if (!folder._mftEntryExists(desiredName))
                        break;
                    index++;
                }
                return desiredName;
            }
        })
});

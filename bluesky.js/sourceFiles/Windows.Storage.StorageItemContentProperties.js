// ================================================================
//
// Windows.Storage.StorageItemContentProperties
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    // ================================================================
    //
    // private Object: Windows.Storage._allProps
    //
    //      List of all properties currently supported
    _allProps: ["System.FileExtension", "System.FileName", "System.IsFolder", "System.ItemType", "System.ItemTypeText",
                "System.FileAttributes", "System.ItemFolderNameDisplay", "System.ItemPathDisplay", "System.ItemName", "System.DateAccessed",
                "System.DateModified", "System.DateCreated", "System.FileOwner"],

    // ================================================================
    //
    // public Object: Windows.Storage.StorageItemContentProperties
    //
    StorageItemContentProperties: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.StorageItemContentProperties constructor
        //
        function (item) {
            this._item = item;
        },

	    // ================================================================
	    // Windows.Storage.StorageItemContentProperties members
	    // ================================================================

        {
            // =========================================================
            //
            // public function: Windows.Storage.StorageItemContentProperties.retrievePropertiesAsync
            //
            retrievePropertiesAsync: function (propertiesToRetrieve) {
                var item = this._item;
                return new WinJS.Promise(function (c) {

                    if (!propertiesToRetrieve || !propertiesToRetrieve.length)
                        propertiesToRetrieve = Windows.Storage._allProps;

                    // TODO: Properties should be saved to local (and roaming)
                    // TODO: Obviously, these should be stored in a map and returned verbatim, rather than regenerating each time.
                    // Hacking properties in for R1/R2 to work for the 90% case.
                    var props = {};
                    var isFolder = (item.attributes & Windows.Storage.FileAttributes.directory) == Windows.Storage.FileAttributes.directory;
                    var fileExt = item.name.substr(item.name.lastIndexOf(".") + 1);
                    propertiesToRetrieve.forEach(function (prop) {
                        if (prop.indexOf("System") == 0 && !props.System)

                            switch (prop) {
                                case "System.FileExtension":
                                    props[prop] = "." + fileExt;
                                    break;
                                case "System.FileName":
                                    props[prop] = item.name;
                                    break;
                                case "System.DateCreated":
                                    props[prop] = item.dateCreated;
                                    break;
                                case "System.DateModified":
                                    props[prop] = item.dateModified;
                                    break;
                                case "System.DateAccessed":
                                    props[prop] = item.dateAccessed;
                                    break;
                                case "System.FileOwner":
                                    props[prop] = "You";
                                    break;
                                case "System.IsFolder":
                                    props[prop] = isFolder;
                                    break;
                                case "System.ItemType":
                                    if (isFolder)
                                        props[prop] = "File folder";
                                    else
                                        props[prop] = "." + fileExt.toLowerCase();
                                    break;
                                case "System.ItemTypeText":
                                    if (isFolder)
                                        props[prop] = "File folder";
                                    else
                                        props[prop] = fileExt.toUpperCase() + " File";
                                    break;
                                case "System.FileAttributes":
                                    props[prop] = item.attributes;
                                    break;
                                case "System.ItemFolderNameDisplay":
                                    props[prop] = item.parentFolder.name;
                                    break;
                                case "System.ItemPathDisplay":
                                    props[prop] = item.path;
                                    break;
                                case "System.ItemName":
                                    props[prop] = item.name;
                                    break;
                            }
                    });
                    props.size = Object.keys(props).length;

                    c(props);
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.savePropertiesAsync
            //
            //      MSDN: TODO
            //
            savePropertiesAsync: function (props) {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.savePropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getDocumentPropertiesAsync
            //
            //      MSDN: TODO
            //
            getDocumentPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getDocumentPropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getImagePropertiesAsync
            //
            //      MSDN: TODO
            //
            getImagePropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getImagePropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getMusicPropertiesAsync
            //
            //      MSDN: TODO
            //
            getMusicPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getMusicPropertiesAsync is NYI");
                    c({});
                });
            },


            // ================================================================
            //
            // public function: Windows.Storage.StorgeItemContentProperties.getVideoPropertiesAsync
            //
            //      MSDN: TODO
            //
            getVideoPropertiesAsync: function () {
                return new WinJS.Promise(function (c) {
                    console.warn("bluesky fyi: StorgeItemContentProperties.getVideoPropertiesAsync is NYI");
                    c({});
                });
            },
        })
});
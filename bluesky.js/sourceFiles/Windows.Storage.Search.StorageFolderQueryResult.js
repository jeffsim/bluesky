// ================================================================
//
// Windows.Storage.Search.StorageFolderQueryResult
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.aspx
//

WinJS.Namespace.define("Windows.Storage.Search", {

    // ================================================================
    //
    // public Object: Windows.Storage.Search.StorageFolderQueryResult
    //
    StorageFolderQueryResult: WinJS.Class.define(

        // =========================================================
        //
        // public function: Windows.Storage.Search.StorageFolderQueryResult constructor
        //
        //      MSDN: TODO
        //
        function (sourceFolder, query) {
            // constructor
            this.folder = sourceFolder;
            this.query = query;
        },

	    // ================================================================
	    // Windows.Storage.Search.StorageFolderQueryResult members
	    // ================================================================

        {

            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getFoldersAsync
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br208074.aspx
            //
            getFoldersAsync: function (query) {

                return this._getItemsOfType(query, Windows.Storage.FileAttributes.directory);
            },


            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getFilesAsync
            //
            //      MSDN: TODO
            //
            getFilesAsync: function (query) {

                // TODO: archive? normal?
                return this._getItemsOfType(query, Windows.Storage.FileAttributes.archive);
            },


            // =========================================================
            //
            // public function: Windows.Storage.Search.StorageFolderQueryResult.getItemsAsync
            //
            //      MSDN: TODO
            //
            getItemsAsync: function (query) {

                return this._getItemsOfType(query);
            },


            // =========================================================
            //
            // private function: Windows.Storage.Search.StorageFolderQueryResult._getItemsOfType
            //
            _getItemsOfType: function (query, filterType) {
                // tbd: merging queries.
                query = query || this.query || Windows.Storage.Search.CommonFolderQuery.defaultQuery;
                var that = this;

                return new WinJS.Promise(function (onComplete) {

                    // enumerate files in our folder's fileStore that match our query.
                    // tbd: only supporting defaultQuery for now.
                    if (query != Windows.Storage.Search.CommonFolderQuery.defaultQuery)
                        throw "NYI: get[Item/Files/Folders]Async only support defaultQuery";

                    var results = new Windows.Foundation.Collections.IVectorView();

                    var folderItems = that.folder.masterFileTable;
                    for (var i in folderItems) {
                        var item = folderItems[i];
                        if ((filterType && (item.attributes & filterType) == filterType) || (!filterType)) {
                            // If we haven't previously realized the mft entry into a live item, then do so now
                            results.push(that.folder._realizeItem(item));
                        }
                    }

                    onComplete(results);
                });
            },

            // =========================================================
            //
            // public member: Windows.Storage.Search.StorageFolderQueryResult.folder
            //
            //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.folder.aspx
            //
            folder: null,

            query: null
        }),
});
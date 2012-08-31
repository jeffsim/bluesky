// ================================================================
//
// Windows.Storage.Search.StorageFolderQueryResult
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.storagefolderqueryresult.aspx
//

WinJS.Namespace.define("Windows.Storage.Search", {

    // ================================================================
    //
    // Windows.Storage.Search.CommonFolderQuery enumeration
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.commonfolderquery.aspx
    //
    CommonFolderQuery: {
        defaultQuery: 0,
        groupByAlbum: 103,
        groupByAlbumArtist: 104,
        groupByArtist: 102,
        groupByAuthor: 110,
        groupByComposer: 105,
        groupByGenre: 106,
        groupByMonth: 101,
        groupByPublishedYear: 107,
        groupByRating: 108,
        groupByTag: 109,
        groupByType: 111,
        groupByYear: 100
    },


    // ================================================================
    //
    // Windows.Storage.Search.IndexedState enumeration
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.search.indexedstate.aspx
    //
    IndexedState: {
        unknown: 0,
        notIndexed: 1,
        partiallyIndexed: 2,
        fullyIndexed: 3
    },
});
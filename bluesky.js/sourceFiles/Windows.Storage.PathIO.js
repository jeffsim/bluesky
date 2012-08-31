// ================================================================
//
// Windows.Storage.PathIO
//
//		MSDN: TODO
//
WinJS.Namespace.define("Windows.Storage", {

    PathIO: {

        // =========================================================
        //
        // Function: Windows.Storage.PathIO.readTextAsync
        //
        //      MSDN: TODO
        //
        readTextAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.writeTextAsync
        //
        //      MSDN: TODO
        //
        writeTextAsync: function (path, contents, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, contents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.readLinesAsync
        //
        //      MSDN: TODO
        //
        readLinesAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.readLinesAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.writeLinesAsync
        //
        //      MSDN: TODO
        //
        writeLinesAsync: function (path, contents, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.writeLinesAsync(file, contents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.appendTextAsync
        //
        //      MSDN: TODO
        //
        appendTextAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.appendTextAsync(file, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.PathIO.appendLinesAsync
        //
        //      MSDN: TODO
        //
        appendLinesAsync: function (path, encoding) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function (file) {
                return Windows.Storage.FileIO.appendLinesAsync(file, encoding);
            });
        }
    }
});
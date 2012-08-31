// ================================================================
//
// Windows.Storage.FileIO
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701440.aspx
//
WinJS.Namespace.define("Windows.Storage", {

    FileIO: {

        // =========================================================
        //
        // Function: Windows.Storage.FileIO.writeTextAsync
        //
        //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701508.aspx
        //
        writeTextAsync: function (file, contents, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {
                // tbd: append?
                // tbd: manage error when overflowing maximum localstorage space; currently fails silently (but I believe it
                //      still updates in the cloud correctly).

                // TODO: This is wrong (besides which, setItem is not defined)
                localStorage.setItem(file.path, contents);
                if (file.isRoaming) {
                    Windows.Storage.CachedFileManager.uploadRoamingFile(file, contents);
                }

                // Report completion regardless of roaming state
                onComplete();
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.writeLinesAsync
        //
        //      MSDN: TODO
        //
        writeLinesAsync: function (file, lines, encoding) {

            var contents = "";
            lines.forEach(function (line) {
                contents += line + "\r\n";
            });
            return this.writeTextAsync(file, contents, encoding);
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.appendTextAsync
        //
        //      MSDN: TODO
        //
        appendTextAsync: function (file, contents, encoding) {

            return this.readTextAsync(file, encoding).then(function (oldContents) {
                var newContents = oldContents + contents;
                return Windows.Storage.FileIO.writeTextAsync(file, newContents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.appendLinesAsync
        //
        //      MSDN: TODO
        //
        appendLinesAsync: function (file, lines, encoding) {

            return this.readTextAsync(file, encoding).then(function (oldContents) {
                var newContents = oldContents;

                var contents = "";
                lines.forEach(function (line) {
                    newContents += line + "\r\n";
                });
                return Windows.Storage.FileIO.writeTextAsync(file, newContents, encoding);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.readTextAsync
        //
        //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.fileio.readtextasync.aspx
        //
        readTextAsync: function (file, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {

                // See AppXFolder.getFileAsync for reason behind this if block
                if (file._isAppX) {
                    onComplete(file._appXContents);
                    return;
                }

                // always read from local store, even if file is roaming; the roaming manager will asynchronously keep it up to date
                // TODO: This is wrong (besides which, getItem is not defined)
                var contents = localStorage.getItem(file.path);

                // if the file isn't found locally and it's a roamable file, then fault it in from the cloud
                if (contents == null && file.isRoaming) {
                    Windows.Storage.CachedFileManager.readRoamingFileFromRemoteStore(file).then(function (content) {
                        onComplete(content);
                    });
                }
                else
                    onComplete(contents);
            });
        },


        // =========================================================
        //
        // Function: Windows.Storage.FileIO.readLinesAsync
        //
        //      MSDN: TODO
        //
        readLinesAsync: function (file, encoding) {

            return new WinJS.Promise(function (onComplete, onError) {

                Windows.Storage.FileIO.readTextAsync(file, encoding).then(function (fileContents) {
                    // split contents on line breaks
                    var lines = fileContents.split("\r\n");
                    lines.size = lines.length;
                    onComplete(lines);
                },
                function (error) {
                    onError(error);
                });
            });
        },

    }
});
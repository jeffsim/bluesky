
WinJS.Namespace.define("Windows.Storage", {



    /* TODO: Roaming is not part of R1/R2 - this implementation is not tested and in place to keep prototype'd apps
    from breaking */




    // CachedFileManager: Responsible for keeping roaming files up to date.  
    // TODO: This requires a WINS-like service to be implemented.  Haven't rationalized that against client model yet.
    CachedFileManager: {
        init: function () {
        /*
            // uncomment this line to enable a clean install (for testing purposes only)
            // $.cookie("lastRoamingCheck", null);

            // If we haven't checked for roaming updates before, then start at 0.
            if (!$.cookie("lastRoamingCheck"))
                $.cookie("lastRoamingCheck", "0");

            // tbd-mustfix: lacking a push service, for debugging purposes I'm going to pull every 60 seconds to see if any files changed.  This
            // will DDoS our server if any reasonable number of users join the tech preview.  I think Windows has a 15 minute minimum time on Pull notifications
            // (but roaming probably goes through a push model).
            // tbd: when a roaming file changes remotely, and the local client is notified, does Win8 silently download the file immediately, or does it instead
            //      mark the file as dirty and then fault it in when the user asks for it?  1st approach; pro-new local client has files immediately present; con-
            //      big download.  2nd approach; pro- doesn't download files if user doesn't need them; con-user waits everytime they try to access a remote file.
            //      For now, I'm going with model 1, and updating/downloading every file.
            setInterval(this._checkForModifiedRoamingFiles, 1000 * 60);
            this._checkForModifiedRoamingFiles();

            // For debugging purposes (read: not polluting the console log), you can set Windows.Storage.CachedFileManager.enabled = false and roaming updates won't happen. Be sure to change back before shipping!
            // tbd-mustfix: need to find a way to disable this entirely until and unless the app has roaming files.  For the majority that don't,
            // this is just wasted battery/network pain.
            // For now, I've defaulted this to disabled; the app will need to explicitly enable it.*/
            this.enabled = false;
        },

        /*
        _checkForModifiedRoamingFiles: function () {
            // ensure we have a logged in user and valid appid
            if (!$.cookie("appId") || !$.cookie("userId"))
                return;

            if (!this.enabled)
                return;
            // ping our notification server (pull) to see if any files have changed
            $.ajax({
                type: "GET",
                url: "http://www.bluesky.io/_ws/webService.svc/GetModifiedRoamingFilesList",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: {
                    "appId": $.cookie("appId"),
                    "userId": $.cookie("userId"),
                    "lastRoamingCheck": $.cookie("lastRoamingCheck")
                },
                success: function (result) {

                    if (result.Success) {
                        if (result.updatedFiles.length > 0) {
                            console.log("Roaming files have been updated; downloading updated files:", result.updatedFiles);

                            // Fire off update requests for all apps in the updated list
                            result.updatedFiles.forEach(function (fileId) {
                                Windows.Storage.CachedFileManager.readRoamingFileFromRemoteStore(fileId);
                            });

                            // Update our last roaming check
                            $.cookie("lastRoamingCheck", result.lastRoamingCheck);
                        } else
                            console.log("CachedFileManager: no updated roaming files found");
                    } else {
                        // error. tbd: error handling
                        console.log("error getting modified roaming files list.  Error = ", result);
                    }
                },
                error: function (error) {
                    // error. tbd: error handling
                    console.log("error 2 getting modified roaming files list.  Error = ", error);
                }
            });
        },
        */
        _warnedNYI: false,
        uploadRoamingFile: function (file, fileContents) {
            if (!this._warnedNYI) {
                console.warn("bluesky: roaming files are not supported in R1/R2.")
                this._warnedNYI = true;
            }
            return new WinJS.Promise(function (onComplete) {

                onComplete();
                /*
                $.ajax({
                    type: "GET",
                    url: "http://www.bluesky.io/_ws/webService.svc/CanUploadAppRoamingFile",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: {
                        "appId": $.cookie("appId"),
                        "userId": $.cookie("userId"),
                        "fileSize": fileContents.length
                    },
                    success: function (result) {
                        if (result == true) {
                            // file.path has filename in it - on server we want just the path
                            var filePath = file.path.substring(0, file.path.length - file.name.length);

                            // we can send the file; do so now.
                            $.ajax({
                                type: "POST",
                                url: "http://www.bluesky.io/_ws/webService.svc/UploadAppRoamingFile",
                                contentType: "application/json; charset=utf-8",
                                // tbd-mustfix: does this approach have an upper limit on filesize?
                                data: '{"appId": "' + $.cookie("appId") + '","userId": "' + $.cookie("userId") + '","fileName": "' + file.name + '","filePath": "' + escape(filePath) + '","fileContents": "' + escape(fileContents) + '"}',
                                success: function (result) {
                                    // tbd: how to avoid the need to eval?
                                    eval('var r = ' + result);
                                    if (r.Success) {
                                        onComplete(r);
                                    }
                                    else
                                        // tbd: what's the right win8 way to handle this?
                                        console.log("error: insufficient cloud storage space (code " + r.ErrorCode + ")");
                                },

                                error: function (err) {
                                    // tbd: what does win8 do if a roaming upload fails?  I'm assuming it either fails silently,
                                    // or fires some event that apps can hook into.  For now, we just log to console
                                    console.log("error uploading file: ", err);
                                }
                            });
                        }
                        else
                            // tbd: same as above error
                            console.log("error uploading file: ", result);
                    },

                    error: function (err) {
                        // tbd: same as above error
                        console.log("error uploading file: ", err);
                    }
                });*/
            });
        },
        /*
        // tbd: this function should get called by a WINS-like notification service.
        readRoamingFileFromRemoteStore: function (fileId) {
            // Roaming files are read from the local store; we asynchronously keep them up to date using a WINS-equivalent push notification service
            // tbd: don't have WINS implemented yet.
            $.ajax({
                type: "GET",
                url: "http://www.bluesky.io/_ws/webService.svc/GetAppRoamingFile",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: {
                    "appId": $.cookie("appId"),
                    "userId": $.cookie("userId"),
                    "fileId": fileId
                },

                success: function (result) {
                    if (result.Success) {
                        // find the folder starting in the root; create folders as needed
                        // tbd: does win8's getFolderAtPath create the folder hierarchy, or does it err out?  If the latter, then use an internal function to do this.
                        Windows.Storage.ApplicationData.current.roamingFolder.getFolderFromPathAsync(unescape(result.FilePath)).then(function (folder) {
                            // update file in local storage.
                            folder.createFileAsync(result.FileName).then(function (file) {
                                Windows.Storage.FileIO.writeTextAsync(file, unescape(result.FileContents));
                            });
                        });
                    } else {
                        console.log("error reading roaming file from remote store", result);
                    }
                },

                error: function (err) {
                    onError("error uploading file: ", err);
                }
            });
        }*/
    }
});
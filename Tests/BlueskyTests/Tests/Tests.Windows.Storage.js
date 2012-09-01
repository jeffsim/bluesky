"use strict";

// ================================================================
//
// Test.Windows.Storage.js
//		Tests for Windows.Storage
//
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage Tests", {

    // ==========================================================================
    // 
    // Test Storage standardFolders
    //
    standardFolders: function (test) {

        test.start("Standard Storage folders tests");

        return test.doAsync(function (onTestComplete) {

            var appData = Windows.Storage.ApplicationData.current;
            var localFolder = appData.localFolder;
            var tempFolder = appData.temporaryFolder;
            var roamingFolder = appData.roamingFolder;
            var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

            // Verify the folders are built as expected
            test.assert(localFolder.displayName == "LocalState", "LocalFolder display name incorrect");
            test.assert(localFolder.name == "LocalState", "LocalFolder name incorrect");
            test.assert(localFolder.displayType == "File folder", "LocalFolder display type incorrect");
            test.assert(localFolder.attributes == 16, "LocalFolder attributes incorrect");
            test.assert(pathCompare(localFolder.folderRelativeId, "0\\0\\LocalState"), "LocalFolder folderRelativeId incorrect");

            test.assert(tempFolder.displayName == "TempState", "tempFolder display name incorrect");
            test.assert(tempFolder.name == "TempState", "tempFolder name incorrect");
            test.assert(tempFolder.displayType == "File folder", "tempFolder display type incorrect");
            test.assert(tempFolder.attributes == 16, "tempFolder attributes incorrect");
            test.assert(pathCompare(tempFolder.folderRelativeId, "0\\0\\TempState"), "tempFolder folderRelativeId incorrect");

            test.assert(roamingFolder.displayName == "RoamingState", "roamingFolder display name incorrect");
            test.assert(roamingFolder.name == "RoamingState", "roamingFolder name incorrect");
            test.assert(roamingFolder.displayType == "File folder", "roamingFolder display type incorrect");
            test.assert(roamingFolder.attributes == 16, "roamingFolder attributes incorrect");
            test.assert(pathCompare(roamingFolder.folderRelativeId, "0\\0\\RoamingState"), "roamingFolder folderRelativeId incorrect");

            test.assert(appFolder.displayName == "AppX", "appFolder display name incorrect");
            test.assert(appFolder.name == "AppX", "appFolder name incorrect");
            test.assert(appFolder.displayType == "File folder", "appFolder display type incorrect");
            test.assert(appFolder.attributes == 16, "appFolder attributes incorrect");
            test.assert(pathCompare(appFolder.folderRelativeId, "0\\0\\AppX"), "appFolder folderRelativeId incorrect");

            // Validate folder.path
            // TODO: How to validate front part of path?
            var curPackage = Windows.ApplicationModel.Package.current;
            test.assert(pathIndexOf(localFolder.path, "\\Local\\Packages\\" + curPackage.id.familyName + "\\LocalState") > 0, "Local Folder path incorrect");
            test.assert(pathIndexOf(tempFolder.path, "\\Local\\Packages\\" + curPackage.id.familyName + "\\TempState") > 0, "Temporary Folder path incorrect");
            test.assert(pathIndexOf(roamingFolder.path, "\\Local\\Packages\\" + curPackage.id.familyName + "\\RoamingState") > 0, "Roaming Folder path incorrect");


            // Test creating, writing to, reading, and deleting a file in local and temp folders (roaming is R3)
            var writeToFolder = function (folder, fileName, contents) {
                return folder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (sampleFile) {
                       return Windows.Storage.FileIO.writeTextAsync(sampleFile, contents);
                   });
            }

            var readFromFolder = function (folder, fileName) {
                return folder.getFileAsync(fileName)
                   .then(function (sampleFile) {
                       return Windows.Storage.FileIO.readTextAsync(sampleFile);
                   });
            }

            var test1Promise = writeToFolder(localFolder, "testdata.dat", "Hello World").then(function () {
                return readFromFolder(localFolder, "testdata.dat").then(function (fileContents) {
                    test.assert(fileContents == "Hello World", "Failed to read/write from local folder");
                });
            });
            var test2Promise = writeToFolder(tempFolder, "testdata2.dat", "alpha Beta").then(function () {
                return readFromFolder(tempFolder, "testdata2.dat").then(function (fileContents) {
                    test.assert(fileContents == "alpha Beta", "Failed to read/write from temp folder");
                });
            });
            var test3Promise = writeToFolder(roamingFolder, "testdata3.dat", "cappa Delta1").then(function () {
                return readFromFolder(roamingFolder, "testdata3.dat").then(function (fileContents) {
                    test.assert(fileContents == "cappa Delta1", "Failed to read/write from roaming folder");
                });
            });

            var test4Promise = appFolder.getFolderAsync("Tests").then(function (folder) {
                test.assert(folder.name == "Tests", "Failed to read/write from roaming folder");
            });
            WinJS.Promise.join([test1Promise, test2Promise, test3Promise, test4Promise]).then(function () {
                onTestComplete(test);
            });
        });

        // TODO: How to test that apps can't see each others' folders?
    },


    // ==========================================================================
    // 
    // Test ms-appx and ms-appdata protocols
    //
    msappProtocol: function (test) {
        test.start("ms-appx and ms-appdata protocols tests");

        // settings this to 1000 since we're skipping (and thus hanging)
        test.timeoutLength = 1000;

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var roamingFolder = appData.roamingFolder;

        return test.doAsync(function (onTestComplete) {
            // Apps can read from temp, roaming, or local using ms-appdata or ms-appx protocols -- e.g.:
            //      <img src="ms-appdata:///temp/myFile.png" alt="" />
            //      <img src="ms-appdata:///local/myFile.png" alt="" />
            //      <img src="ms-appdata:///roaming/myFile.png" alt="" />
            //      <img src="ms-appx://packageFullName/file.png" alt="" />  or  
            //      <img src="ms-appx:///file.png" alt="" />

            // To test this, first create files that we can reference.  Note that the app-package includes images that we can copy to the other folders
            var packageFolder = Windows.ApplicationModel.Package.current.installedLocation;

            var copyToFolder = function (destFolder, fileName) {
                return packageFolder.getItemAsync("Tests").done(function (item) {
                    item.getItemAsync("supportFiles").done(function (item) {
                        item.getItemAsync("storage").done(function (item) {
                            item.getItemAsync(fileName).done(function (file) {
                                return file.copyAsync(destFolder, file.name, Windows.Storage.NameCollisionOption.replaceExisting);
                            });
                        });
                    });
                });
            }

            var test1Promise = copyToFolder(localFolder, "img2.jpg");
            var test2Promise = copyToFolder(tempFolder, "img3.jpg");
            // todo: test roaming

            WinJS.Promise.join([test1Promise, test2Promise]).then(function () {

                // Now, load a page with images that reference those temp files
                var $testDiv = testHarness.addTestDiv("dataA");
                WinJS.UI.Pages.render('/Tests/supportFiles/storage/msappx.html', $testDiv[0]).then(function () {

                    test.skip("//msappx: and //msappdata: protocols are NYI in bluesky");
                    /* TODO: The following code works on Win8, but not in FF.  Not sure what's missing...
                    // Verify that the images contain the bits
                    var img1 = $("#image1")[0];
                    var img2 = $("#image2")[0];
                    var img3 = $("#image3")[0];
                    var canvas = document.createElement("canvas");
                    canvas.width = img1.width;
                    canvas.height = img1.height;

                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img1, 0, 0);
                    var dataUrl = canvas.toDataURL("image/jpg");
                    test.assert(dataUrl.indexOf("VBORw0KGgoAAAA") == 23, "Image1 not loaded");
                    ctx.clearRect(0, 0, img1.width, img2.height);

                    ctx.drawImage(img2, 0, 0);
                    var dataUrl = canvas.toDataURL("image/jpg");
                    test.assert(dataUrl.indexOf("VBORw0KGgoAAAA") == 23, "Image2 not loaded");
                    ctx.clearRect(0, 0, img1.width, img2.height);

                    ctx.drawImage(img3, 0, 0);
                    var dataUrl = canvas.toDataURL("image/jpg");
                    test.assert(dataUrl.indexOf("VBORw0KGgoAAAA") == 23, "Image3 not loaded");
                    ctx.clearRect(0, 0, img1.width, img2.height);
                    */
                    onTestComplete(test);
                });

            });

        });
    },

    nyiTests: function (test) {

        test.start("Not Yet implemented tests; mix these into the various Tests.Windows.Storage.*.js files");
        test.nyi("R1: Limits of browser.localStorage");
        test.nyi("R1: \\ and / in path");
        test.nyi("R2: Windows.Storage.Streams (e.g. DataReader et al)");
        test.nyi("R2: Query* functions in Windows.Storage.StorageFolder");
        test.nyi("R3: MRU");
        test.nyi("R3: manifest/permissions? test on win8 by removing documentslibrary from perms - gives access denied on KnownFolders.documentsLibrary.createFileAsync");
        test.nyi("R3: Roaming data: CachedFileManager, RoamingFolder, FoamingSettings, RoamingStorageQuota, RoamingSettings");
        test.nyi("R3: DownloadsFolder; have to think through what that means in bluesky.");
        test.nyi("R3: Misc other classes in Windows.Storage");
    }
});
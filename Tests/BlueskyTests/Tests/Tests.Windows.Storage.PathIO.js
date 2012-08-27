"use strict";

// ================================================================
//
// Test.Windows.Storage.PathIO.js
//		Tests for Windows.Storage.PathIO
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.PathIO Tests", {

    // ==========================================================================
    // 
    // Test PathIO.readTextAsync
    //
    readTextAsync: function (test) {

        test.start("PathIO.readTextAsync tests");

        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple read
            return new WinJS.Promise(function (onComplete) {

                var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

                Windows.Storage.PathIO.readTextAsync("ms-appx:///Tests/SUPPORTFILES/storage/readTeST1.dAt").then(function (fileContents) {

                    test.assert(fileContents == "Hello There", "File contents incorrect");
                    onComplete();
                });

            }).then(function () {

                // TODO: Test local folder
                // TODO: Test temp folder
                onTestComplete(test);
            });
        });
    },


    // ==========================================================================
    // 
    // Test PathIO.readLinesAsync
    //
    readLinesAsync: function (test) {

        test.start("PathIO.readLinesAsync tests");

        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {

                Windows.Storage.PathIO.readLinesAsync("ms-appx:///Tests/SUPPORTFILES/storage/readLinesTest1.dat").then(function (lines) {
                    test.assert(lines.size == 4, "Incorrect number of lines");
                    test.assert(lines[2] == "test of", "Line 2 incorrect");
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test PathIO.writeTextAsync
    //
    writeTextAsync: function (test) {

        test.start("PathIO.writeTextAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.temporaryFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("writeTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {

                       Windows.Storage.PathIO.writeTextAsync("ms-appdata:///temp/writeTextAsyncTest1.dat", "Hello world").then(function () {
                           // Verify the file's contents are there
                           Windows.Storage.PathIO.readTextAsync("ms-appdata:///temp/writeTextAsyncTest1.dat").then(function (contents) {
                               test.assert(contents == "Hello world", "File contents incorrect");
                               onTestComplete(test);
                           });
                       });
                   });
            });
        });
    },

    /*

    Per the comment in the test, we can't test writeBytesAsync since we don't have Storage.Streams in this release.

    // ==========================================================================
    // 
    // Test PathIO.writeBytesAsync
    //
    writeBytesAsync: function (test) {

        test.start("PathIO.writeBytesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("writeBytesAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       var bytes = [1, 2, 4, 0, 100, 200];
                       Windows.Storage.PathIO.writeBytesAsync("ms-appdata:///temp/writeBytesAsyncTest1.dat", bytes).then(function () {

                           // Verify the file's contents are there
                           tempFolder.getFileAsync("writeTextAsyncTest1.dat").then(function (readFile) {
                               // TODO: Can't verify contents since (I think) we need Storage.streams, but those aren't in this release.  Revisit later.
                           });
                       });
                   });
            });
        });
    },*/


    // ==========================================================================
    // 
    // Test PathIO.writeLinesAsync
    //
    writeLinesAsync: function (test) {

        test.start("PathIO.writeLinesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                    localFolder.createFileAsync("writeLinesAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       var lines = ["ABC", "123", "XYZ"];
                       Windows.Storage.PathIO.writeLinesAsync("ms-appdata:///local/writeLinesAsyncTest1.dat", lines).then(function () {

                           // Verify the file's contents are there
                           localFolder.getFileAsync("writeLinesAsyncTest1.dat").then(function (readFile) {
                               Windows.Storage.FileIO.readTextAsync(readFile).then(function (fileContents) {
                                   test.assert(fileContents == "ABC\r\n123\r\nXYZ\r\n", "File contents incorrect");
                                   onTestComplete(test);
                               });
                           });
                       });
                   });
            });
        });
    },


    // ==========================================================================
    // 
    // Test PathIO.appendTextAsync
    //
    appendTextAsync: function (test) {

        test.start("PathIO.appendTextAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.temporaryFolder;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("appendTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {
                           
                           Windows.Storage.PathIO.appendTextAsync("ms-appdata:///temp/appendTextAsyncTest1.dat", "ABC123").then(function () {

                               // Verify the file's contents are correct
                               tempFolder.getFileAsync("appendTextAsyncTest1.dat").then(function (readFile) {
                                   Windows.Storage.FileIO.readTextAsync(readFile).then(function (fileContents) {
                                       test.assert(fileContents == "Hello worldABC123", "File contents incorrect");
                                       onTestComplete(test);
                                   });
                               });
                           });
                       });
                   });
            });
        });
    },

    // ==========================================================================
    // 
    // Test PathIO.appendLinesAsync
    //
    appendLinesAsync: function (test) {

        test.start("PathIO.appendLinesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.temporaryFolder;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("appendTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {
                           var lines = ["ABC", "123", "XYZ"];
                           Windows.Storage.PathIO.appendLinesAsync("ms-appdata:///temp/appendTextAsyncTest1.dat", lines).then(function () {
                               // Verify the file's contents are correct
                               tempFolder.getFileAsync("appendTextAsyncTest1.dat").then(function (readFile) {
                                   Windows.Storage.FileIO.readTextAsync(readFile).then(function (fileContents) {
                                       test.assert(fileContents == "Hello worldABC\r\n123\r\nXYZ\r\n", "File contents incorrect");
                                       onTestComplete(test);
                                   });
                               });
                           });
                       });
                   });
            });
        });
    },


    // ==========================================================================
    // 
    // Test PathIO.readBufferAsync
    //
    readBufferAsync: function (test) {

        test.start("PathIO.readBufferAsync tests");
        test.nyi("Buffered read/write is NYI: coming in bluesky R2");
    },

    // ==========================================================================
    // 
    // Test PathIO.writeBufferAsync
    //
    writeBufferAsync: function (test) {

        test.start("PathIO.writeBufferAsync tests");
        test.nyi("Buffered read/write is NYI: coming in bluesky R2");
    }

});

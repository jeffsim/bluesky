"use strict";

// ================================================================
//
// Test.Windows.Storage.FileIO.js
//		Tests for Windows.Storage.FileIO
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.FileIO Tests", {

    // ==========================================================================
    // 
    // Test FileIO.readTextAsync
    //
    readTextAsync: function (test) {

        test.start("FileIO.readTextAsync tests");

        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple read
            return new WinJS.Promise(function (onComplete) {

                var getStorageTestFile = function(fileName) {
                    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

                    return appFolder.getItemAsync("Tests").then(function (item) {
                        return item.getItemAsync("supportFiles").then(function (item) {
                            return item.getItemAsync("storage").then(function (item) {
                                return item.getItemAsync(fileName).then(function (file) {
                                    return Windows.Storage.FileIO.readTextAsync(file);
                                });
                            });
                        });
                    });
                }
                // NOTE: test case insensitivity at the same time
                return getStorageTestFile("readTeST1.dAt").then(function (fileContents) {

                    test.assert(fileContents == "Hello There", "File contents incorrect");
                    onComplete();
                });

            }).then(function () {

                // Test nonexistent file read
                return new WinJS.Promise(function (onComplete) {
                    appFolder.getFileAsync("IDontExist.dat").then(function (results) {

                        test.assert(false, "shouldn't be here");
                    }, function (err) {
                        test.assert(err.message = "The system cannot find the file specified.\r\n");
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test FileIO.readLinesAsync
    //
    readLinesAsync: function (test) {

        test.start("FileIO.readLinesAsync tests");

        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {

                return appFolder.getItemAsync("Tests").then(function (item) {
                    return item.getItemAsync("supportFiles").then(function (item) {
                        return item.getItemAsync("storage").then(function (item) {
                            return item.getItemAsync("readLinesTest1.dat").then(function (file) {
                                Windows.Storage.FileIO.readLinesAsync(file).then(function (lines) {
                                    test.assert(lines.size == 4, "Incorrect number of lines");
                                    test.assert(lines[2] == "test of", "Line 2 incorrect");
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
    // Test FileIO.writeTextAsync
    //
    writeTextAsync: function (test) {

        test.start("FileIO.writeTextAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("writeTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {

                           // Verify the file's contents are there
                           tempFolder.getFileAsync("writeTextAsyncTest1.dat").then(function (readFile) {
                               Windows.Storage.FileIO.readTextAsync(readFile).then(function (fileContents) {
                                   test.assert(fileContents == "Hello world", "File contents incorrect");
                                   onTestComplete(test);
                               });
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
    // Test FileIO.writeBytesAsync
    //
    writeBytesAsync: function (test) {

        test.start("FileIO.writeBytesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("writeBytesAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       var bytes = [1, 2, 4, 0, 100, 200];
                       Windows.Storage.FileIO.writeBytesAsync(testFile, bytes).then(function () {

                           // Verify the file's contents are there
                           tempFolder.getFileAsync("writeBytesAsyncTest1.dat").then(function (readFile) {
                               // TODO: Can't verify contents since (I think) we need Storage.streams, but those aren't in this release.  Revisit later.
                           });
                       });
                   });
            });
        });
    },*/


    // ==========================================================================
    // 
    // Test FileIO.writeLinesAsync
    //
    writeLinesAsync: function (test) {

        test.start("FileIO.writeLinesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;
        test.nyi("Test encoding");

        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("writeLinesAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       var lines = ["ABC", "123", "XYZ"];
                       Windows.Storage.FileIO.writeLinesAsync(testFile, lines).then(function () {

                           // Verify the file's contents are there
                           tempFolder.getFileAsync("writeLinesAsyncTest1.dat").then(function (readFile) {
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
    // Test FileIO.appendTextAsync
    //
    appendTextAsync: function (test) {

        test.start("FileIO.appendTextAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("appendTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {

                           Windows.Storage.FileIO.appendTextAsync(testFile, "ABC123").then(function () {
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
    // Test FileIO.appendLinesAsync
    //
    appendLinesAsync: function (test) {

        test.start("FileIO.appendLinesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var tempFolder = appData.localFolder;

        test.nyi("Test encoding");
        return test.doAsync(function (onTestComplete) {

            // Test simple write
            return new WinJS.Promise(function (onComplete) {

                tempFolder.createFileAsync("appendTextAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting)
                   .then(function (testFile) {
                       Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {
                           var lines = ["ABC", "123", "XYZ"];
                           Windows.Storage.FileIO.appendLinesAsync(testFile, lines).then(function () {
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
    // Test FileIO.readBufferAsync
    //
    readBufferAsync: function (test) {

        test.start("FileIO.readBufferAsync tests");
        test.nyi("Buffered read/write is NYI: coming in bluesky R2");
    },

    // ==========================================================================
    // 
    // Test FileIO.writeBufferAsync
    //
    writeBufferAsync: function (test) {

        test.start("FileIO.writeBufferAsync tests");
        test.nyi("Buffered read/write is NYI: coming in bluesky R2");
    }
});

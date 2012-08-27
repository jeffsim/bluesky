"use strict";

// ================================================================
//
// Test.Windows.Storage.StorageFile.js
//		Tests for Windows.Storage.StorageFile
//

var appData = Windows.Storage.ApplicationData.current;
var localFolder = appData.localFolder;
var tempFolder = appData.temporaryFolder;
var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

function cleanUpStorageFileTest() {
    return localFolder.getItemAsync("TestX").then(function (item) {
        return item.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete).then(function () {
            return localFolder.getItemAsync("Test2").then(function (item) {
                return item.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete);
            }, function (error) {
            });
        }, function (error) {
        });
    }, function (error) {
    });
}

// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.StorageFile Tests", {
    // ==========================================================================
    // 
    // Test StorageFile.getFileFromApplicationUriAsync
    //
    getFileFromApplicationUriAsync: function (test) {
        test.start("getFileFromApplicationUriAsync tests");
        test.timeoutLength = 4000;

        return test.doAsync(function (onTestComplete) {
            return new WinJS.Promise(function (c) {
                var uri = new Windows.Foundation.Uri("ms-appx:///Tests/supportFiles/storage/readtest2.dat");
                Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (file) {
                    test.assert(file.name == "readtest2.dat", "Failed to load correct file");
                    c();
                });
            }).then(function () {
                // Test from local folder
                return new WinJS.Promise(function (c) {
                    setupFileFolderTest(localFolder).then(function () {

                        var uri = new Windows.Foundation.Uri("ms-appdata:///local/Test2/Test3/testFile2a.dat");
                        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (file) {
                            test.assert(file.name == "testFile2a.dat", "Failed to load correct file");
                            cleanUpStorageFileTest().then(function () {
                                c();
                            });
                        });
                    });
                });

            }).then(function () {
                // Test from temp folder
                return new WinJS.Promise(function (c) {
                    setupFileFolderTest(tempFolder).then(function () {

                        var uri = new Windows.Foundation.Uri("ms-appdata:///temp/Test2/Test3/testFile2a.dat");
                        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (file) {
                            test.assert(file.name == "testFile2a.dat", "Failed to load correct file");
                            cleanUpStorageFileTest().then(function () {
                                c();
                            });
                        });
                    });
                });

            }).then(function () {
                // test invalid file
                return new WinJS.Promise(function (c) {
                    var uri = new Windows.Foundation.Uri("ms-appx:///Tests/supportFiles/IDontExist.dat");
                    Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (file) {
                        test.assert(false, "Did not fire error on invalid file");
                    }, function (error) {
                        test.assert(error.message == "The system cannot find the file specified.\r\n", "Invalid error message");
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.folderRelativeId
    //
    folderRelativeId: function (test) {
        test.start("folderRelativeId tests");
        test.timeoutLength = 5000;
        test.nyi("I can't ferret out the pattern Win8 uses to assign these Ids; implement this test once I do.");
        return test.doAsync(function (onTestComplete) {
            setupFileFolderTest(tempFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.GetFileFromPathAsync
    //
    GetFileFromPathAsync: function (test) {
        test.start("GetFileFromPathAsync tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {

            GetFileFromPathAsync_Folder(test, localFolder).then(function () {
                GetFileFromPathAsync_Folder(test, tempFolder).then(function () {
                    // We can't modify app folder, so we need a different test for it
                    Windows.Storage.StorageFile.getFileFromPathAsync(appFolder.path + "\\Tests\\supportFiles\\storage\\readtest2.dat").then(function (file) {
                        test.assert(file.name == "readtest2.dat", "name incorrect");
                        cleanUpStorageFileTest().then(function () {
                            onTestComplete(test);
                        });
                    });
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.path
    //
    path: function (test) {
        test.start("path tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            path_Folder(test, localFolder).then(function () {
                path_Folder(test, tempFolder).then(function () {
                    // We can't modify app folder, so we need a different test for it
                    Windows.Storage.StorageFile.getFileFromPathAsync(appFolder.path + "\\Tests\\supportFiles\\storage\\readtest2.dat").then(function (file) {
                        test.assert(file.path == appFolder.path + "\\Tests\\supportFiles\\storage\\readtest2.dat", "path incorrect");
                        cleanUpStorageFileTest().then(function () {
                            onTestComplete(test);
                        });
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.properties
    //
    properties: function (test) {
        test.start("properties tests");
        test.timeoutLength = 15000;
        return test.doAsync(function (onTestComplete) {
            properties_Folder(test, localFolder).then(function () {
                properties_Folder(test, tempFolder).then(function () {
                    cleanUpStorageFileTest().then(function () {
                        // We can't modify app folder, so we need a different test for it
                        Windows.Storage.StorageFile.getFileFromPathAsync(appFolder.path + "\\Tests\\supportFiles\\storage\\readtest2.dat").then(function (file) {
                            file.properties.retrievePropertiesAsync(["System.FileName", "System.FileExtension"]).then(function (props) {
                                test.assert(props.size == 2, "Incorrect number of properties returned");
                                test.assert(props["System.FileExtension"] == ".dat", "Extension wrong");
                                test.assert(props["System.FileName"] == "readtest2.dat", "Name wrong");
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
    // Test StorageFile.deleteAsync
    //
    deleteAsync: function (test) {
        console.log(5);
        test.start("deleteAsync tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            delete_Folder(test, localFolder).then(function () {
                delete_Folder(test, tempFolder).then(function () {
                    // TODO: verify you can't delete from appfolder
                    cleanUpStorageFileTest().then(function () {
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.renameAsync_File
    //
    renameAsync_File: function (test) {
        test.start("renameAsync file tests");
        test.timeoutLength = 5000;

        var newFolder, newFile;

        return test.doAsync(function (onTestComplete) {

            // Create a folder
            tempFolder.createFolderAsync("renameTests", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {

                // Create a file in the folder and populate it
                newFolder = folder;
                return newFolder.createFileAsync("renameTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    // Populate the file
                    newFile = file;
                    return Windows.Storage.FileIO.writeTextAsync(file, "Hello world");
                });

            }).then(function () {

                // Rename the file
                return newFile.renameAsync("test2.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {

                    // Verify the file has the new name, and no file with the last previous name exists
                    return newFolder.getItemAsync("test2.dat").then(function (item) {
                        test.assert(item.name == "test2.dat", "1: File not found or modified");
                        return item.getBasicPropertiesAsync().then(function (props) {
                            test.assert(props.size == 11, "1b: File not modified");
                        });
                    });
                });

            }).then(function () {

                // Create another file, then try renaming it to test2.dat, with replaceExisting and ensure it overwrites original
                return newFolder.createFileAsync("renameTest2.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    // Populate the file
                    var newFile2 = file;
                    return Windows.Storage.FileIO.writeTextAsync(file, "ABC123").then(function () {
                        return newFile2.renameAsync("test2.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                            return newFolder.getItemAsync("test2.dat").then(function (item) {
                                return item.getBasicPropertiesAsync().then(function (props) {
                                    test.assert(props.size == 6, "2: File not overwritten");
                                });
                            });
                        });
                    });
                });

            }).then(function () {

                // Create another file, then try renaming it to test2.dat, with generateUniqueName and ensure both exist
                return newFolder.createFileAsync("renameTest3.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    // Populate the file
                    var newFile3 = file;
                    return Windows.Storage.FileIO.writeTextAsync(file, "ABC").then(function () {
                        return newFile3.renameAsync("test2.dat", Windows.Storage.NameCollisionOption.generateUniqueName).then(function () {
                            test.assert(newFile3.name != "renameTest2.dat", "3 unique name not used for name");
                            test.assert(newFile3.displayName != "renameTest2.dat", "4 unique name not used displayName");
                            return newFolder.getItemAsync("test2.dat").then(function (item) {
                                return item.getBasicPropertiesAsync().then(function (props) {
                                    test.assert(props.size == 6, "5 File overwritten");
                                    return newFolder.getItemAsync(newFile3.name).then(function (item) {
                                        return item.getBasicPropertiesAsync().then(function (props) {
                                            test.assert(props.size == 3, "6 File not saved");
                                            onTestComplete(test);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                // TODO: Create another file, then try renaming it to test2.dat, with failIfExists and ensure it fails.  Can't do yet since Promise doesn't
                // propagate errors yet.
            });
        });
    },



    // ==========================================================================
    // 
    // Test StorageFile.getBasicPropertiesAsync
    //
    getBasicPropertiesAsync: function (test) {
        test.start("getBasicPropertiesAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {

            // validate displayName and displayType and isOfType as well
            var getStorageTestFile = function (fileName) {
                return appFolder.getItemAsync("Tests").then(function (item) {
                    test.assert(item.displayName == "Tests", "1 displayname incorrect");
                    test.assert(item.name == "Tests", "1 name incorrect");
                    test.assert(!item.fileType, "1 have filetype, but shouldn't");
                    test.assert(item.displayType == "File folder", "1 displayType incorrect");
                    test.assert(item.isOfType(Windows.Storage.StorageItemTypes.folder), "1 incorrect isOfType");
                    return item.getItemAsync("supportFiles").then(function (item) {
                        test.assert(item.displayName == "supportFiles", "2 displayname incorrect");
                        test.assert(item.name == "supportFiles", "2 name incorrect");
                        test.assert(!item.fileType, "2 have filetype, but shouldn't");
                        test.assert(item.displayType == "File folder", "2 displayType incorrect");
                        test.assert(item.isOfType(Windows.Storage.StorageItemTypes.folder), "2 incorrect isOfType");
                        return item.getItemAsync("storage").then(function (item) {
                            test.assert(item.displayName == "storage", "3 displayname incorrect");
                            test.assert(item.name == "storage", "3 name incorrect");
                            test.assert(!item.fileType, "3 have filetype, but shouldn't");
                            test.assert(item.displayType == "File folder", "3 displayType incorrect");
                            test.assert(item.isOfType(Windows.Storage.StorageItemTypes.folder), "3 incorrect isOfType");
                            return item.getItemAsync(fileName);
                        });
                    });
                });
            }
            // test file from appfolder
            getStorageTestFile("readtest2.DAt").then(function (file) {
                return file.getBasicPropertiesAsync().then(function (props) {
                    test.assert(props.size == 14, "4: File size incorrect");
                    test.assert(file.displayName == "readtest2.DAt", "4 displayname incorrect");
                    test.assert(file.name == "readtest2.DAt", "4 name incorrect");
                    test.assert(file.displayType == "DAT File", "4 displayType incorrect");
                    test.assert(file.fileType == ".DAt", "4 fileType incorrect");
                    test.assert(file.isOfType(Windows.Storage.StorageItemTypes.file), "4 incorrect isOfType");
                });

            }, function (error) {
                console.log("oops");
            }).then(function () {

                // test folder from appfolder
                return new WinJS.Promise(function (onComplete) {
                    appFolder.getItemAsync("Tests").then(function (item) {
                        item.getBasicPropertiesAsync().then(function (props) {
                            test.assert(props.size == 0, "Folder size incorrect");
                            onComplete();
                        });
                    });
                });
            }).then(function () {

                // test folder from localfolder
                return new WinJS.Promise(function (onComplete) {
                    localFolder.createFolderAsync("PropsTest", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (item) {
                        test.assert(item.displayName == "PropsTest", "5 displayname incorrect");
                        test.assert(item.name == "PropsTest", "5 name incorrect");
                        test.assert(item.displayType == "File folder", "5 displayType incorrect");
                        test.assert(!item.fileType, "5 fileType incorrect");
                        test.assert(item.isOfType(Windows.Storage.StorageItemTypes.folder), "5 incorrect isOfType");
                        item.getBasicPropertiesAsync().then(function (props) {
                            test.assert(props.size == 0, "2: Foldersize incorrect");
                            onComplete();
                        });
                    });
                });
            }).then(function () {

                // test file from tempfolder
                return new WinJS.Promise(function (onComplete) {

                    var createTestFile = function () {
                        return localFolder.createFolderAsync("PropsTest2", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
                            test.assert(folder.displayName == "PropsTest2", "6 displayname incorrect");
                            test.assert(folder.name == "PropsTest2", "6 name incorrect");
                            test.assert(folder.displayType == "File folder", "6 displayType incorrect");
                            test.assert(!folder.fileType, "6 fileType incorrect");
                            test.assert(folder.isOfType(Windows.Storage.StorageItemTypes.folder), "6 incorrect isOfType");
                            return folder.createFileAsync("getBasicPropertiesAsyncTest1.dAT", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                                return Windows.Storage.FileIO.writeTextAsync(file, "Hello world").then(function () {
                                    return folder.getFileAsync("getBasicPropertiesAsyncTest1.dAT");
                                });
                            });
                        });
                    }
                    createTestFile().then(function (item) {
                        test.assert(item.displayName == "getBasicPropertiesAsyncTest1.dAT", "7 displayname incorrect");
                        test.assert(item.name == "getBasicPropertiesAsyncTest1.dAT", "7 name incorrect");
                        test.assert(item.displayType == "DAT File", "7 displayType incorrect");
                        test.assert(item.fileType == ".dAT", "7 fileType incorrect");
                        test.assert(item.isOfType(Windows.Storage.StorageItemTypes.file), "7 incorrect isOfType");
                        item.getBasicPropertiesAsync().then(function (props) {
                            test.assert(props.size == 11, "7: File size incorrect");
                            onTestComplete(test);
                        });
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.attributes
    //
    attributes: function (test) {
        test.start("attributes tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {

            // Test file properties from app-package
            return new WinJS.Promise(function (onComplete) {

                var getStorageTestFile = function (fileName) {
                    return appFolder.getItemAsync("Tests").then(function (item) {
                        test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "1: attributes incorrect");
                        return item.getItemAsync("supportFiles").then(function (item) {
                            test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "2: attributes incorrect");
                            return item.getItemAsync("storage").then(function (item) {
                                test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "3: attributes incorrect");
                                return item.getItemAsync(fileName);
                            });
                        });
                    });
                }
                // test file from appfolder
                getStorageTestFile("readtest2.dat").then(function (item) {
                    test.assert(item.attributes == Windows.Storage.FileAttributes.archive, "4: attributes incorrect");
                    onComplete();
                },
                function (err) {
                });

            }).then(function () {

                // test folder from localfolder
                return new WinJS.Promise(function (onComplete) {
                    localFolder.createFolderAsync("PropsTest", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (item) {
                        test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "5: attributes incorrect");
                        onComplete();
                    });
                });
            }).then(function () {

                // test file from tempfolder
                return new WinJS.Promise(function (onComplete) {

                    var createTestFile = function () {
                        return localFolder.createFolderAsync("PropsTest2", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
                            test.assert(folder.attributes == Windows.Storage.FileAttributes.directory, "6: attributes incorrect");
                            return folder.createFileAsync("getBasicPropertiesAsyncTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                                test.assert(file.attributes == Windows.Storage.FileAttributes.archive, "7: attributes incorrect");
                                return Windows.Storage.FileIO.writeTextAsync(file, "Hello world").then(function () {
                                    return folder.getFileAsync("getBasicPropertiesAsyncTest1.dat");
                                });
                            });
                        });
                    }
                    createTestFile().then(function (item) {
                        test.assert(item.attributes == Windows.Storage.FileAttributes.archive, "8: attributes incorrect");
                        onTestComplete(test);
                    });
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test StorageFile.dateCreated
    //
    dateCreated: function (test) {
        test.start("dateCreated tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {

            // Test folder
            localFolder.createFolderAsync("dateCreatedTest", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
                var now = new Date();
                test.assert(folder.dateCreated.getYear() == now.getYear() &&
                            folder.dateCreated.getMonth() == now.getMonth(), "folder dateCreated is incorrect");

                // Test created file
                folder.createFileAsync("dateCreatedTest1.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (testFile) {
                    Windows.Storage.FileIO.writeTextAsync(testFile, "Hello world").then(function () {
                        folder.getItemAsync("dateCreatedTest1.dat").then(function (item) {
                            test.assert(item.dateCreated.getYear() == now.getYear() &&
                                        item.dateCreated.getMonth() == now.getMonth(), "item dateCreated is incorrect");

                            // test appx file
                            var getStorageTestFile = function (fileName) {
                                return appFolder.getItemAsync("Tests").then(function (item) {
                                    test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "1: attributes incorrect");
                                    return item.getItemAsync("supportFiles").then(function (item) {
                                        test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "2: attributes incorrect");
                                        return item.getItemAsync("storage").then(function (item) {
                                            test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "3: attributes incorrect");
                                            return item.getItemAsync(fileName);
                                        });
                                    });
                                });
                            }
                            getStorageTestFile("readtest2.dat").then(function (file) {
                                test.assert(file.dateCreated.getYear() >= 111, "appx file datecreated wrong");
                                folder.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete).then(function () {
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
    // Test StorageFile.contentType
    //
    contentType: function (test) {
        test.start("contentType tests");
        test.timeoutLength = 5000;

        var getTestFile = function (fileName) {
            return appFolder.getItemAsync("Tests").then(function (item) {
                return item.getItemAsync("supportFiles").then(function (item) {
                    return item.getItemAsync("storage").then(function (item) {
                        return item.getItemAsync("contentTypes").then(function (item) {
                            return item.getItemAsync(fileName);
                        });
                    });
                });
            });
        }

        // TODO: Test other contentTypes.
        // TODO: If I do enough, then find a way to for.. loop these.
        return test.doAsync(function (onTestComplete) {

            return new WinJS.Promise(function (onComplete) {

                // XML
                getTestFile("xmlfile.xml").then(function (item) {
                    test.assert(item.contentType == "text/xml", "XML contentType wrong  " + item.contentType);
                    onComplete();
                });

            }).then(function () {

                return new WinJS.Promise(function (onComplete) {
                    // Text
                    getTestFile("test.txt").then(function (item) {
                        test.assert(item.contentType == "text/plain", "TXT contentType wrong  " + item.contentType);
                        onComplete();
                    });
                });
            }).then(function () {

                return new WinJS.Promise(function (onComplete) {
                    // png
                    getTestFile("icon.png").then(function (item) {
                        test.assert(item.contentType == "image/png", "png contentType wrong  " + item.contentType);
                        onComplete();
                    });
                });
            }).then(function () {

                return new WinJS.Promise(function (onComplete) {
                    // jpg
                    getTestFile("img1.jpg").then(function (item) {
                        test.assert(item.contentType == "image/jpeg", "jpg contentType wrong  " + item.contentType);
                        onComplete();
                    });
                });
            }).then(function () {

                return new WinJS.Promise(function (onComplete) {
                    // gif
                    getTestFile("icon2.gif").then(function (item) {
                        test.assert(item.contentType == "image/gif", "gif contentType wrong  " + item.contentType);
                        onTestComplete(test);
                    });
                });
            });
        });
    },

    /*
    // ==========================================================================
    // 
    // Test StorageFile.getThumbnailAsync
    //
    getThumbnailAsync: function (test) {
        test.start("getThumbnailAsync tests");
        test.nyi("getThumbnailAsync not supported in R1/R2");
    },
    
    
    
    // ==========================================================================
    // 
    // Test StorageFile.createStreamedFileAsync
    //
    createStreamedFileAsync: function (test) {
        test.start("createStreamedFileAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.createStreamedFileFromUriAsync
    //
    createStreamedFileFromUriAsync: function (test) {
        test.start("createStreamedFileFromUriAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    // ==========================================================================
    // 
    // Test StorageFile.openAsync
    //
    openAsync: function (test) {
        test.start("openAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openReadAsync
    //
    openReadAsync: function (test) {
        test.start("openReadAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openSequentialReadAsync
    //
    openSequentialReadAsync: function (test) {
        test.start("openSequentialReadAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openTransactedWriteAsync
    //
    openTransactedWriteAsync: function (test) {
        test.start("openTransactedWriteAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.replaceWithStreamedFileAsync
    //
    replaceWithStreamedFileAsync: function (test) {
        test.start("replaceWithStreamedFileAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.replaceWithStreamedFileFromUriAsync
    //
    replaceWithStreamedFileFromUriAsync: function (test) {
        test.start("replaceWithStreamedFileFromUriAsync tests");
        test.nyi("Storage.Stream not supported in R1/R2");
    },
    */


    // ==========================================================================
    // 
    // Test StorageFile.renameAsync_LocalFolder
    //
    renameAsync_LocalFolder: function (test) {
        test.start("renameAsync LocalFolder tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            renameAsync_Folder(test, appData.localFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.renameAsync_TempFolder
    //
    renameAsync_TempFolder: function (test) {
        test.start("renameAsync TempFolder tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            renameAsync_Folder(test, appData.temporaryFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },
    /*
    // ==========================================================================
    // 
    // Test StorageFile.renameAsync_AppFolder
    //
    renameAsync_AppFolder: function (test) {
        test.start("renameAsync App Folder tests");
        test.timeoutLength = 5000;
        // TODO: When Promise supports errors, ensure that renaming in the appfolder throws an error (since you can't do it)
        return test.doAsync(function (onTestComplete) {
            renameAsync_Folder(test, Windows.ApplicationModel.Package.current.installedLocation).then(function () {
            cleanUpStorageFileTest().then(function () {
                onTestComplete(test);
            });
            });
        });
    },*/

    // ==========================================================================
    // 
    // Test StorageFile.copyAsync_LocalFolder
    //
    copyAsync_LocalFolder: function (test) {
        test.start("copyAsync LocalFolder tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            copyAsync_File(test, appData.localFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.copyAsync_TempFolder
    //
    copyAsync_TempFolder: function (test) {
        test.start("copyAsync TempFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            copyAsync_File(test, appData.temporaryFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    /*
    
    // TODO: When Promise supports errors, ensure that renaming in the appfolder throws an error (since you can't do it)
    
    // ==========================================================================
    // 
    // Test StorageFile.copyAsync_AppFolder
    //
    copyAsync_AppFolder: function (test) {
        test.start("copyAsync App Folder tests");
        test.timeoutLength = 5000;
    
        return test.doAsync(function (onTestComplete) {
            copyAsync_File(test, Windows.ApplicationModel.Package.current.installedLocation).then(function () {
            cleanUpStorageFileTest().then(function () {
                onTestComplete(test);
            });
            });
        });
    },*/


    // ==========================================================================
    // 
    // Test StorageFile.copyAndReplaceAsync_LocalFolder
    //
    copyAndReplaceAsync_LocalFolder: function (test) {
        test.start("copyAndReplaceAsync LocalFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            copyAndReplaceAsync_File(test, appData.localFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.copyAndReplaceAsync_TempFolder
    //
    copyAndReplaceAsync_TempFolder: function (test) {
        test.start("copyAndReplaceAsync TempFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            copyAndReplaceAsync_File(test, appData.temporaryFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    /*
    
    // TODO: When Promise supports errors, ensure that renaming in the appfolder throws an error (since you can't do it)
    
    // ==========================================================================
    // 
    // Test StorageFile.copyAndReplaceAsync_AppFolder
    //
    copyAndReplaceAsync_AppFolder: function (test) {
        test.start("copyAndReplaceAsync App Folder tests");
                test.timeoutLength = 5000;
    
        return test.doAsync(function (onTestComplete) {
            copyAndReplaceAsync_File(test, Windows.ApplicationModel.Package.current.installedLocation).then(function () {
            cleanUpStorageFileTest().then(function () {
                onTestComplete(test);
            });
            });
        });
    },*/


    // ==========================================================================
    // 
    // Test StorageFile.moveAsync_LocalFolder
    //
    moveAsync_LocalFolder: function (test) {
        test.start("moveAsync LocalFolder tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            moveAsync_File(test, appData.localFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.moveAsync_TempFolder
    //
    moveAsync_TempFolder: function (test) {
        test.start("moveAsync TempFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            moveAsync_File(test, appData.temporaryFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    /*
    
    // TODO: When Promise supports errors, ensure that renaming in the appfolder throws an error (since you can't do it)
    
    // ==========================================================================
    // 
    // Test StorageFile.moveAsync_AppFolder
    //
    moveAsync_AppFolder: function (test) {
        test.start("moveAsync App Folder tests");
                test.timeoutLength = 5000;
    
        return test.doAsync(function (onTestComplete) {
            moveAsync_File(test, Windows.ApplicationModel.Package.current.installedLocation).then(function () {
            cleanUpStorageFileTest().then(function () {
                onTestComplete(test);
            });
            });
        });
    },*/

    // ==========================================================================
    // 
    // Test StorageFile.moveAndReplaceAsync_LocalFolder
    //
    moveAndReplaceAsync_LocalFolder: function (test) {
        test.start("moveAndReplaceAsync LocalFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            moveAndReplaceAsync_File(test, appData.localFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFile.moveAndReplaceAsync_TempFolder
    //
    moveAndReplaceAsync_TempFolder: function (test) {
        test.start("moveAndReplaceAsync TempFolder tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;
            moveAndReplaceAsync_File(test, appData.temporaryFolder).then(function () {
                cleanUpStorageFileTest().then(function () {
                    onTestComplete(test);
                });
            });
        });
    },

    /*
    
    // TODO: When Promise supports errors, ensure that renaming in the appfolder throws an error (since you can't do it)
    
    // ==========================================================================
    // 
    // Test StorageFile.moveAndReplaceAsync_AppFolder
    //
    moveAndReplaceAsync_AppFolder: function (test) {
        test.start("moveAndReplaceAsync App Folder tests");
                test.timeoutLength = 5000;
    
        return test.doAsync(function (onTestComplete) {
            moveAndReplaceAsync_File(test, Windows.ApplicationModel.Package.current.installedLocation).then(function () {
            cleanUpStorageFileTest().then(function () {
                onTestComplete(test);
            });
            });
        });
    },*/
});

var testFolder1, testFolder1a, testFolder2, testFolder2a;
var testFile1, testFile1a, testFile2, testFile2a;

function path_Folder(test, folder) {

    return new WinJS.Promise(function (c) {
        return setupFileFolderTest(folder).then(function () {
            test.assert(testFile1.path == testFolder1.path + "\\" + testFile1.name, "testFile1 path incorrect");
            test.assert(testFile1a.path == testFolder1a.path + "\\" + testFile1a.name, "testFile1a path incorrect");
            test.assert(testFile2.path == testFolder2.path + "\\" + testFile2.name, "testFile2 path incorrect");
            test.assert(testFile2a.path == testFolder2a.path + "\\" + testFile2a.name, "testFile2a path incorrect");
            c();
        });
    });
}
function delete_Folder(test, folder) {

    return new WinJS.Promise(function (c) {
        return setupFileFolderTest(folder).then(function () {

            testFile1a.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete).then(function () {
                // Verify file is not longer there
                // TODO: Can't do without Promise error handling (NYI)
                c();
            });
        });
    });
}
function GetFileFromPathAsync_Folder(test, folder) {

    return new WinJS.Promise(function (c) {
        return setupFileFolderTest(folder).then(function () {

            Windows.Storage.StorageFile.getFileFromPathAsync(folder.path + "\\TestX\\TestY\\testFile1a.dat").then(function (file) {
                test.assert(file.name == "testFile1a.dat", "Failed to find file");
                c();
            });
        });
    });
}

function properties_Folder(test, folder) {

    return new WinJS.Promise(function (onComplete) {
        return setupFileFolderTest(folder).then(function () {
            // Test one property
            return new WinJS.Promise(function (c) {
                return testFile1.properties.retrievePropertiesAsync(["System.FileName", "System.FileExtension"]).then(function (props) {
                    test.assert(props.size == 2, "Incorrect number of properties returned");
                    test.assert(props["System.FileExtension"] == ".dat", "Extension wrong");
                    test.assert(props["System.FileName"] == "TestFile1.dat", "Name wrong");
                    c();
                });
            }).then(function () {
                return new WinJS.Promise(function (c) {

                    // Get ALL properties
                    return testFile1.properties.retrievePropertiesAsync([]).then(function (props) {
                        // Test some of the properties
                        // TODO: Test all, once I know which ones are supported in bluesky
                        //          See: http://msdn.microsoft.com/en-us/library/windows/desktop/dd561977%28v=VS.85%29.aspx
                        // TODO: Test properties added by other apps - can you do that in bluesky?
                        test.assert(props["System.IsFolder"] == false, "IsFolder wrong");
                        test.assert(props["System.ItemType"] == ".dat", "ItemType wrong");
                        test.assert(props["System.ItemTypeText"] == "DAT File", "ItemTypeText wrong");
                        test.assert(props["System.FileAttributes"] == 32, "FileAttributes");
                        var itemFolderName = props["System.ItemFolderNameDisplay"];
                        var itemFolderPath = folder.path + "\\" + itemFolderName + "\\" + props["System.ItemName"];
                        test.assert(itemFolderPath == props["System.ItemPathDisplay"], "itemFolderPath incorrect");
                        c();
                    });
                });
            }).then(function () {

                /* TODO: The following gives an 'unknown error' on Win8.  :P
                return new WinJS.Promise(function (c) {
                    // Test saveproperty
                    return testFile1.properties.retrievePropertiesAsync(["System.FileName", "System.FileExtension"]).then(function (props) {
                        props["System.FileName"] = "testfileZ.dat";
                        testFile1.properties.savePropertiesAsync().then(function () {
                            // Verify property
                            // TODO: test invalid properties
                            testFolder1.getItemAsync("testfileZ.dat").then(function (item) {
                                test.assert(item.path == testFolder1.path + "\\" + item.name, "property not saved");
                                onComplete();
                            });
                        });
                    });
                });*/
                onComplete();
            });
        });
    });
}
function copyAndReplaceAsync_File(test, testFolder) {
    // Test: copy from testFolder to LocalFolder
    // Test: copy from testFolder to TempFolder
    // Test: copy from testFolder to AppFolder (TODO: Can't since Promise doesn't support errors yet)
    var appData = Windows.Storage.ApplicationData.current;
    var localFolder = appData.localFolder;
    var tempFolder = appData.temporaryFolder;
    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

    return copyAndReplaceAsync_FileToFolder(test, testFolder, localFolder).then(function () {
        return copyAndReplaceAsync_FileToFolder(test, testFolder, tempFolder).then(function () {
            return copyAndReplaceAsync_FileToFolder(test, testFolder, appFolder);
        });
    });
};

function copyAndReplaceAsync_FileToFolder(test, sourceFolder, destFolder) {
    return setupFileFolderTest(sourceFolder).then(function () {
        return new WinJS.Promise(function (c) {

            return testFile1a.copyAndReplaceAsync(testFile2).then(function () {

                // ensure new file is there
                return testFolder2.getFileAsync("testFile2.dat").then(function (file) {
                    test.assert(file.name == "testFile2.dat", "1: new file name incorrect");

                    return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                        test.assert(fileContents == "Hello", "File1 contents incorrect");

                        // ensure old file is still there
                        return testFolder1a.getFileAsync("testFile1a.dat").then(function (file) {
                            test.assert(file.name == "testFile1a.dat", "1: old file name incorrect");

                            return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                                test.assert(fileContents == "Hello", "File2 contents incorrect");

                                c();
                            });
                        });
                    });
                });
            });
        });
    });
}

function moveAndReplaceAsync_File(test, testFolder) {
    // Test: move from testFolder to LocalFolder
    // Test: move from testFolder to TempFolder
    // Test: move from testFolder to AppFolder (TODO: Can't since Promise doesn't support errors yet)
    var appData = Windows.Storage.ApplicationData.current;
    var localFolder = appData.localFolder;
    var tempFolder = appData.temporaryFolder;
    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

    return moveAndReplaceAsync_FileToFolder(test, testFolder, localFolder).then(function () {
        return moveAndReplaceAsync_FileToFolder(test, testFolder, tempFolder).then(function () {
            return moveAndReplaceAsync_FileToFolder(test, testFolder, appFolder);
        });
    });
};

function moveAndReplaceAsync_FileToFolder(test, sourceFolder, destFolder) {
    return setupFileFolderTest(sourceFolder).then(function () {
        return new WinJS.Promise(function (c) {

            return testFile1a.moveAndReplaceAsync(testFile2).then(function () {

                // ensure new file is there
                return testFolder2.getFileAsync("testFile2.dat").then(function (file) {
                    test.assert(file.name == "testFile2.dat", "1: new file name incorrect");

                    return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                        test.assert(fileContents == "Hello", "File1 contents incorrect");

                        // ensure old file is not there
                        // TODO: Can't test since Promise doesn't support errors yet
                        c();
                    });
                });
            });
        });
    });
}


function moveAsync_File(test, testFolder) {
    // Test: move from testFolder to LocalFolder
    // Test: move from testFolder to TempFolder
    // Test: move from testFolder to AppFolder (TODO: Can't since Promise doesn't support errors yet)
    var appData = Windows.Storage.ApplicationData.current;
    var localFolder = appData.localFolder;
    var tempFolder = appData.temporaryFolder;
    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

    return moveAsync_FileToFolder(test, testFolder, localFolder).then(function () {
        return moveAsync_FileToFolder(test, testFolder, tempFolder).then(function () {
            return moveAsync_FileToFolder(test, testFolder, appFolder);
        });
    });
};

function moveAsync_FileToFolder(test, sourceFolder, destFolder) {
    return setupFileFolderTest(sourceFolder).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: move file to new file in same folder.
            return testFile1a.moveAsync(testFolder1, "newFile.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                return testFolder1.getFileAsync("newFile.dat").then(function (newFile) {
                    return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                        test.assert(fileContents == "Hello", "File1 contents incorrect");

                        return testFolder1.getFileAsync("newFile.dat").then(function (file) {
                            test.assert(file.name == "newFile.dat", "1b: new file name incorrect");
                            test.assert(file.path.indexOf(testFolder1.path + "\\newFile.dat") == 0, "1: path invalid");

                            // Ensure old file doesn't exist
                            // TODO: Can't until Promise supports errors
                            c();
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: move file over existing file in same folder with replaceExisting.  Ensure old file is overwritten

            // Create new file "testFile1b.dat" in testFolder1
            return testFolder1.createFileAsync("testFile1b.dat").then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, "FOO").then(function () {

                    // move testFile1.dat over testFile1b.dat
                    return testFile1.moveAsync(testFolder1, "testFile1b.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                        return testFolder1.getFileAsync("testFile1b.dat").then(function (newFile) {
                            test.assert(newFile.name == "testFile1b.dat", "2: new file name incorrect");

                            return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                                test.assert(fileContents == "XYZ123", "2 File1 contents incorrect");

                                // Ensure old file doesn't exist
                                // TODO: Can't until Promise supports errors
                                c();
                            });
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: move file to existing file in same folder with generateUniqueName.  Ensure both files are present

            // Create new file "testFile1b.dat" in testFolder1'
            var testFile3;
            return testFolder1.createFileAsync("testFile1b.dat").then(function (file) {
                testFile3 = file;
                return Windows.Storage.FileIO.writeTextAsync(file, "FOO");
            }).then(function () {
                // move testFile1.dat over testFile1b.dat
                return testFile1.moveAsync(testFolder1, "testFile1b.dat", Windows.Storage.NameCollisionOption.generateUniqueName).then(function () {
                    return testFolder1.getFileAsync("testFile1b.dat").then(function (newFile) {
                        test.assert(newFile.name == "testFile1b.dat", "3: new file name incorrect");

                        return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                            test.assert(fileContents == "FOO", "3 File1 contents incorrect");
                            c();
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // TODO: Test move without specifying a fileName.
            // Test: move file to new file in different folder with replaceExisting
            return testFile1a.moveAsync(testFolder2, "newFile.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                return testFolder2.getFileAsync("newFile.dat").then(function (newFile) {
                    // verify we were passed the new file and it's in the right place
                    test.assert(newFile.name == "newFile.dat", "4: new file name incorrect");
                    test.assert(newFile.path == testFolder2.path + "\\" + newFile.name, "4: folder incorrect");

                    // Now read the file from the folder and verify it's present and correct
                    return testFolder2.getItemAsync("newFile.dat").then(function (file) {
                        test.assert(file.name == "newFile.dat", "4b: new file name incorrect");
                        test.assert(file.path == testFolder2.path + "\\" + file.name, "4b: folder incorrect");

                        // Verify contents of the new file
                        return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                            test.assert(fileContents == "Hello", "4 File1 contents incorrect");

                            // Verify old file is not there (TODO: Can't without Promise error)
                            c();
                        });
                    });
                });
            });

            c();

        });
    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: move file to existing file in different folder with replaceExisting.  Ensure old file is overwritten
            return testFile1a.moveAsync(testFolder2, "testFile2.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                return testFolder2.getFileAsync("testFile2.dat").then(function (newFile) {
                    // verify we were passed the new file and it's in the right place
                    test.assert(newFile.name == "testFile2.dat", "5: new file name incorrect");
                    test.assert(newFile.path == testFolder2.path + "\\" + newFile.name, "5: folder incorrect");

                    // Now read the file from the folder and verify it's present and correct
                    return testFolder2.getItemAsync("testFile2.dat").then(function (file) {
                        test.assert(file.name == "testFile2.dat", "5b: new file name incorrect");
                        test.assert(file.path == testFolder2.path + "\\" + file.name, "5b: folder incorrect");

                        // Verify contents of the new file
                        return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                            test.assert(fileContents == "Hello", "5 File1 contents incorrect");

                            // Verify old file is not there (TODO: Can't without Promise error)
                            c();
                        });
                    });
                });
            });

        });
    });
}

function copyAsync_File(test, testFolder) {
    // Test: copy from testFolder to LocalFolder
    // Test: copy from testFolder to TempFolder
    // Test: copy from testFolder to AppFolder (TODO: Can't since Promise doesn't support errors yet)
    var appData = Windows.Storage.ApplicationData.current;
    var localFolder = appData.localFolder;
    var tempFolder = appData.temporaryFolder;
    var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

    return copyAsync_FileToFolder(test, testFolder, localFolder).then(function () {
        return copyAsync_FileToFolder(test, testFolder, tempFolder).then(function () {
            return copyAsync_FileToFolder(test, testFolder, appFolder);
        });
    });
};

function copyAsync_FileToFolder(test, sourceFolder, destFolder) {
    return setupFileFolderTest(sourceFolder).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: copy file to new file in same folder. ensure both files exist
            return testFile1a.copyAsync(testFolder1, "newFile.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFile) {
                test.assert(newFile.name == "newFile.dat", "1: new file name incorrect");

                return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                    test.assert(fileContents == "Hello", "File1 contents incorrect");

                    return testFolder1.getFileAsync("newFile.dat").then(function (file) {
                        test.assert(file.name == "newFile.dat", "1b: new file name incorrect");
                        test.assert(file.path.indexOf(testFolder1.path + "\\newFile.dat") == 0, "1: path invalid");

                        return testFolder1.getFileAsync("testFile1.dat").then(function (file) {
                            test.assert(file.name == "testFile1.dat", "1c: new file name incorrect");
                            test.assert(file.path.indexOf(testFolder1.path + "\\testFile1.dat") == 0, "1d: path invalid");
                            return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                                test.assert(fileContents == "Hello", "File2 contents incorrect");
                                c();
                            });
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: copy file to existing file in same folder with replaceExisting.  Ensure old file is overwritten

            // Create new file "testFile1b.dat" in testFolder1
            return testFolder1.createFileAsync("testFile1b.dat").then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, "FOO").then(function () {

                    // copy testFile1.dat over testFile1b.dat
                    return testFile1.copyAsync(testFolder1, "testFile1b.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFile) {
                        test.assert(newFile.name == "testFile1b.dat", "2: new file name incorrect");

                        return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                            test.assert(fileContents == "XYZ123", "2 File1 contents incorrect");
                            c();
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: copy file to existing file in same folder with generateUniqueName.  Ensure both files are present

            // Create new file "testFile1b.dat" in testFolder1'
            var testFile3;
            return testFolder1.createFileAsync("testFile1b.dat").then(function (file) {
                testFile3 = file;
                return Windows.Storage.FileIO.writeTextAsync(file, "FOO");
            }).then(function () {
                // copy testFile1.dat over testFile1b.dat
                return testFile1.copyAsync(testFolder1, "testFile1b.dat", Windows.Storage.NameCollisionOption.generateUniqueName).then(function (newFile) {
                    test.assert(newFile.name != "testFile1b.dat", "3: new file name incorrect");

                    return Windows.Storage.FileIO.readTextAsync(newFile).then(function (fileContents) {
                        test.assert(fileContents == "XYZ123", "3 File1 contents incorrect");
                        return Windows.Storage.FileIO.readTextAsync(testFile3).then(function (fileContents) {
                            test.assert(fileContents == "FOO", "3 File1 contents incorrect");
                            c();
                        });
                    });
                });
            });
        });

    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // TODO: Test copy without specifying a fileName.
            // Test: copy file to new file in different folder with replaceExisting
            return testFile1a.copyAsync(testFolder2, "newFile.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFile) {
                // verify we were passed the new file and it's in the right place
                test.assert(newFile.name == "newFile.dat", "4: new file name incorrect");
                test.assert(newFile.path == testFolder2.path + "\\" + newFile.name, "4: folder incorrect");

                // Now read the file from the folder and verify it's present and correct
                return testFolder2.getItemAsync("newFile.dat").then(function (file) {
                    test.assert(file.name == "newFile.dat", "4b: new file name incorrect");
                    test.assert(file.path == testFolder2.path + "\\" + file.name, "4b: folder incorrect");

                    // Verify contents of the new file
                    return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                        test.assert(fileContents == "Hello", "4 File1 contents incorrect");

                        // Verify old file is still there
                        return testFolder1a.getFileAsync(testFile1a.name).then(function (file2) {
                            test.assert(file2.name == "testFile1a.dat", "4c: new file name incorrect");
                            test.assert(file2.path.indexOf(testFolder1a.path + "\\testFile1a.dat") == 0, "4d: path invalid");

                            return Windows.Storage.FileIO.readTextAsync(file2).then(function (fileContents) {
                                test.assert(fileContents == "Hello", "4e File1 contents incorrect");
                                c();
                            });
                        });
                    });
                });
            });

            c();

        });
    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(sourceFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // Test: copy file to existing file in different folder with replaceExisting.  Ensure old file is overwritten
            return testFile1a.copyAsync(testFolder2, "testFile2.dat", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFile) {
                // verify we were passed the new file and it's in the right place
                test.assert(newFile.name == "testFile2.dat", "5: new file name incorrect");
                test.assert(newFile.path == testFolder2.path + "\\" + newFile.name, "5: folder incorrect");

                // Now read the file from the folder and verify it's present and correct
                return testFolder2.getItemAsync("testFile2.dat").then(function (file) {
                    test.assert(file.name == "testFile2.dat", "5b: new file name incorrect");
                    test.assert(file.path == testFolder2.path + "\\" + file.name, "5b: folder incorrect");

                    // Verify contents of the new file
                    return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContents) {
                        test.assert(fileContents == "Hello", "5 File1 contents incorrect");

                        // Verify old file is still there
                        return testFolder1a.getFileAsync(testFile1a.name).then(function (file2) {
                            test.assert(file2.name == "testFile1a.dat", "5c: new file name incorrect");
                            test.assert(file2.path.indexOf(testFolder1a.path + "\\testFile1a.dat") == 0, "5d: path invalid");

                            return Windows.Storage.FileIO.readTextAsync(file2).then(function (fileContents) {
                                test.assert(fileContents == "Hello", "5e File1 contents incorrect");
                                c();
                            });
                        });
                    });
                });
            });

        });
    });
}

function renameAsync_Folder(test, testFolder) {

    return setupFileFolderTest(testFolder).then(function () {
        return new WinJS.Promise(function (c) {
            // test: rename folder to new (nonexisting) name
            return testFolder2.renameAsync("newFolderName", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFolder) {
                // Verify new folder exists and older folder doesn't (TODO: Can't do latter since Promise doesn't handle errors yet)
                return testFolder.getFolderAsync("newFolderName").then(function (f) {
                    test.assert(f.name == "newFolderName", "1: New folder not found");
                    test.assert(f.attributes == 16, "1: New folder has invalid attributes");
                    test.assert(f.path.indexOf(testFolder.path + "\\newFolderName") == 0, "1: path invalid");

                    // Verify file is still in renamed folder
                    f.getItemAsync("testFile2.dat").then(function (item) {
                        test.assert(item.name == "testFile2.dat", "1: file not in renamed folder");
                        test.assert(item.path.indexOf(testFolder.path + "\\newFolderName\\testFile2.dat") == 0, "1: file path invalid");

                        // Verify subfolder is still in renamed folder
                        f.getItemAsync("Test3").then(function (sf) {
                            test.assert(sf.name == "Test3", "1: subfolder not in renamed folder");
                            test.assert(sf.path.indexOf(testFolder.path + "\\newFolderName\\Test3") == 0, "1b: folder path invalid");

                            // Verify file is still in subfolder
                            sf.getItemAsync("testFile2a.dat").then(function (file2) {
                                test.assert(file2.name == "testFile2a.dat", "1: subfolder not in renamed folder");
                                test.assert(file2.path.indexOf(testFolder.path + "\\newFolderName\\Test3\\testFile2a.dat") == 0, "1c: file path invalid");

                                c();
                            });
                        });
                    });
                });
            });
        });
    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(testFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // * rename folder to existing name: test NameCollisionOptions.replaceExisting
            return testFolder2.renameAsync("newFolderName", Windows.Storage.NameCollisionOption.replaceExisting).then(function (newFolder) {
                // Verify new folder exists and older folder doesn't
                // TODO: Can't do latter since Promise doesn't handle errors yet
                return testFolder.getFolderAsync("newFolderName").then(function (f) {
                    test.assert(f.name == "newFolderName", "2: New folder not found");
                    test.assert(f.attributes == 16, "2: New folder has invalid attributes");
                    test.assert(f.path.indexOf(testFolder.path + "\\newFolderName") == 0, "2: path invalid");

                    // Verify file is still in renamed folder
                    f.getItemAsync("testFile2.dat").then(function (item) {
                        test.assert(item.name == "testFile2.dat", "2: file not in renamed folder");
                        test.assert(item.path.indexOf(testFolder.path + "\\newFolderName\\testFile2.dat") == 0, "2b: path invalid");

                        // Verify subfolder is still in renamed folder
                        f.getItemAsync("Test3").then(function (sf) {
                            test.assert(sf.name == "Test3", "2: subfolder not in renamed folder");
                            test.assert(sf.path.indexOf(testFolder.path + "\\newFolderName\\Test3") == 0, "2c: path invalid");

                            // Verify file is still in subfolder
                            sf.getItemAsync("testFile2a.dat").then(function (file2) {
                                test.assert(file2.name == "testFile2a.dat", "2: subfolder not in renamed folder");
                                test.assert(file2.path.indexOf(testFolder.path + "\\newFolderName\\Test3\\testFile2a.dat") == 0, "2d: path invalid");

                                c();
                            });
                        });
                    });
                });
            });
        });
    }).then(function () {

        // Prep for next text
        return setupFileFolderTest(testFolder);

    }).then(function () {
        return new WinJS.Promise(function (c) {

            // * rename folder to existing name: test NameCollisionOptions.generateUniqueName
            return testFolder2.renameAsync("TestX", Windows.Storage.NameCollisionOption.generateUniqueName).then(function () {
                // Verify old folder still exists and new folder exists but with different name
                test.assert(testFolder2.name != "TestX", "3: Did not create unique name");
                return testFolder.getFolderAsync("TestX").then(function (oldFolder) {
                    test.assert(oldFolder.name == "TestX", "3: Old folder not found");
                    test.assert(oldFolder.attributes == 16, "3: Old folder has invalid attributes");
                    test.assert(oldFolder.path.indexOf(testFolder.path + "\\TestX") == 0, "3: path invalid");

                    testFolder.getFolderAsync(testFolder2.name).then(function (f) {

                        // Verify file is still in renamed folder
                        f.getItemAsync("testFile2.dat").then(function (item) {
                            test.assert(item.name == "testFile2.dat", "1: file not in renamed folder");
                            test.assert(item.path.indexOf(testFolder.path + "\\" + testFolder2.name + "\\" + "testFile2.dat") == 0, "3b: path invalid");

                            // Verify subfolder is still in renamed folder
                            f.getItemAsync("Test3").then(function (sf) {
                                test.assert(sf.name == "Test3", "1: subfolder not in renamed folder");
                                test.assert(sf.path.indexOf(testFolder.path + "\\" + testFolder2.name + "\\" + "Test3") == 0, "3c: path invalid");

                                // Verify file is still in subfolder
                                sf.getItemAsync("testFile2a.dat").then(function (file2) {
                                    test.assert(file2.name == "testFile2a.dat", "1: subfolder not in renamed folder");

                                    // Clean up after ourselves
                                    cleanUpStorageFileTest().then(function () {
                                        c();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // TODO: test failIfExists - can't yet since Promise doesn't support errors
}

function setupFileFolderTest(testFolder) {

    // Setup:
    // 1. Create a folder (testFolder/TestX)
    //   Add a file to the folder (testFolder/TestX/testFile1.dat)
    //   Add a subfolder to the folder (testFolder/TestX/TestY)
    //   Add a file to the subfolder (testFolder/TestX/TestY/testFile1a.dat)
    // 2. Create another folder (testFolder/Test2)
    //   Add a file to the folder (testFolder/Test2/testFile2.dat)
    //   Add a subfolder to the folder (testFolder/Test2/Test3)
    //   Add a file to the subfolder (testFolder/Test2/testFile2a.dat)
    return new WinJS.Promise(function (c) {
        testFolder.createFolderAsync("TestX", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
            testFolder1 = folder;
            return testFolder1.createFileAsync("TestFile1.dat");
        }).then(function (file) {
            testFile1 = file;
            return Windows.Storage.FileIO.writeTextAsync(file, "XYZ123");
        }).then(function () {
            return testFolder1.createFolderAsync("TestY", Windows.Storage.CreationCollisionOption.replaceExisting);
        }).then(function (folder) {
            testFolder1a = folder;
            return testFolder1a.createFileAsync("testFile1a.dat");
        }).then(function (file) {
            testFile1a = file;
            return Windows.Storage.FileIO.writeTextAsync(file, "Hello");
        }).then(function () {
            return testFolder.createFolderAsync("Test2", Windows.Storage.CreationCollisionOption.replaceExisting);
        }).then(function (folder) {
            testFolder2 = folder;
            return testFolder2.createFileAsync("testFile2.dat");
        }).then(function (file) {
            testFile2 = file;
            return Windows.Storage.FileIO.writeTextAsync(file, "World");
        }).then(function (folder) {
            return testFolder2.createFolderAsync("Test3", Windows.Storage.CreationCollisionOption.replaceExisting);
        }).then(function (folder) {
            testFolder2a = folder;
            return testFolder2a.createFileAsync("testFile2a.dat");
        }).then(function (file) {
            testFile2a = file;
            c();
        });
    });
}
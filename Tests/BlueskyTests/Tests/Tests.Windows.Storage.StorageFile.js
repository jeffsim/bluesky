"use strict";

// ================================================================
//
// Test.Windows.Storage.StorageFile.js
//		Tests for Windows.Storage.StorageFile
//

// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.StorageFile Tests", {


    // ==========================================================================
    // 
    // Test StorageFile.renameAsync_File
    //
    renameAsync_File: function (test) {
        test.start("renameAsync file tests");

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

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
    // Test StorageFile.renameAsync_Folder
    //
    renameAsync_Folder: function (test) {
        test.start("renameAsync folder tests");
        // TODO
    },


    // ==========================================================================
    // 
    // Test StorageFile.getBasicPropertiesAsync
    //
    getBasicPropertiesAsync: function (test) {
        test.start("getBasicPropertiesAsync tests");

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

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
            getStorageTestFile("readtest1.DAt").then(function (file) {
                file.getBasicPropertiesAsync().then(function (props) {
                    test.assert(props.size == 14, "4: File size incorrect");
                    test.assert(file.displayName == "readtest1.DAt", "4 displayname incorrect");
                    test.assert(file.name == "readtest1.DAt", "4 name incorrect");
                    test.assert(file.displayType == "DAT File", "4 displayType incorrect");
                    test.assert(file.fileType == ".DAt", "4 fileType incorrect");
                    test.assert(file.isOfType(Windows.Storage.StorageItemTypes.file), "4 incorrect isOfType");
                });

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

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

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
                getStorageTestFile("readtest1.dat").then(function (item) {
                    test.assert(item.attributes == Windows.Storage.FileAttributes.archive, "4: attributes incorrect");
                    onComplete();
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

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

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
                            getStorageTestFile("readtest1.dat").then(function (file) {
                                test.assert(file.dateCreated.getYear() >= 111, "appx file datecreated wrong");
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
    // Test StorageFile.contentType
    //
    contentType: function (test) {
        test.start("contentType tests");

        var appData = Windows.Storage.ApplicationData.current;
        var localFolder = appData.localFolder;
        var tempFolder = appData.temporaryFolder;
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;

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
    // Test StorageFile.copyAndReplaceAsync
    //
    copyAndReplaceAsync: function (test) {
        test.start("copyAndReplaceAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.copyAsync
    //
    copyAsync: function (test) {
        test.start("copyAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.createStreamedFileAsync
    //
    createStreamedFileAsync: function (test) {
        test.start("createStreamedFileAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.createStreamedFileFromUriAsync
    //
    createStreamedFileFromUriAsync: function (test) {
        test.start("createStreamedFileFromUriAsync tests");
        test.nyi("Not yet implemented");
    },
    
    // ==========================================================================
    // 
    // Test StorageFile.deleteAsync
    //
    deleteAsync: function (test) {
        test.start("deleteAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    
    // ==========================================================================
    // 
    // Test StorageFile.folderRelativeId
    //
    folderRelativeId: function (test) {
        test.start("folderRelativeId tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.getFileFromApplicationUriAsync
    //
    getFileFromApplicationUriAsync: function (test) {
        test.start("getFileFromApplicationUriAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.GetFileFromPathAsync
    //
    GetFileFromPathAsync: function (test) {
        test.start("GetFileFromPathAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.getThumbnailAsync
    //
    getThumbnailAsync: function (test) {
        test.start("getThumbnailAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.moveAndReplaceAsync
    //
    moveAndReplaceAsync: function (test) {
        test.start("moveAndReplaceAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.moveAsync
    //
    moveAsync: function (test) {
        test.start("moveAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openAsync
    //
    openAsync: function (test) {
        test.start("openAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openReadAsync
    //
    openReadAsync: function (test) {
        test.start("openReadAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openSequentialReadAsync
    //
    openSequentialReadAsync: function (test) {
        test.start("openSequentialReadAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.openTransactedWriteAsync
    //
    openTransactedWriteAsync: function (test) {
        test.start("openTransactedWriteAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.path
    //
    path: function (test) {
        test.start("path tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.properties
    //
    properties: function (test) {
        test.start("properties tests");
        test.nyi("Not yet implemented");
    },
    
    // ==========================================================================
    // 
    // Test StorageFile.replaceWithStreamedFileAsync
    //
    replaceWithStreamedFileAsync: function (test) {
        test.start("replaceWithStreamedFileAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test StorageFile.replaceWithStreamedFileFromUriAsync
    //
    replaceWithStreamedFileFromUriAsync: function (test) {
        test.start("replaceWithStreamedFileFromUriAsync tests");
        test.nyi("Not yet implemented");
    }
    */
});

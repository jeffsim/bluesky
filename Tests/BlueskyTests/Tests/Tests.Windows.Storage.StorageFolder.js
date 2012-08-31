"use strict";

// ================================================================
//
// Test.Windows.Storage.StorageFolder.js
//		Tests for Windows.Storage.StorageFolder
//
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.StorageFolder Tests", {


    // ==========================================================================
    // 
    // Test StorageFolder.properties
    //
    properties: function (test) {
        test.start("properties tests");
        test.timeoutLength = 15000;
        return test.doAsync(function (onTestComplete) {
            properties_Folder(test, localFolder).then(function () {
                properties_Folder(test, tempFolder).then(function () {
                    cleanUpStorageFileTest().then(function () {
                        // We can't modify app folder, so we need a different test for it
                        Windows.Storage.StorageFolder.getFolderFromPathAsync(appFolder.path + "\\Tests\\supportFiles\\storage").then(function (file) {
                            file.properties.retrievePropertiesAsync(["System.FileName", "System.FileAttributes"]).then(function (props) {
                                test.assert(props.size == 2, "Incorrect number of properties returned");
                                test.assert(props["System.FileAttributes"] == 16, "FileAttributes wrong");

                                test.assert(props["System.FileName"] == "storage", "Name wrong");
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
    // Test Storage.StorageFolder.createFileAsync
    //
    createFileAsync: function (test) {
        test.start("StorageFolder.createFileAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var createFileAsync_Folder = function (test, folder) {
                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        // Create the test file
                        return folder.createFileAsync("createTest.xml", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                            // validate file exists
                            test.assert(pathCompare(file.path, folder.path + "\\" + file.name), "File path incorrect");
                            test.assert(file.displayName == "createTest.xml", "File displayName incorrect");
                            test.assert(file.name == "createTest.xml", "File name incorrect");
                            test.assert(file.fileType == ".xml", "File fileType incorrect");
                            test.assert(file.contentType == "text/xml", "File contentType incorrect");
                            test.assert(file.attributes == Windows.Storage.FileAttributes.archive, "1: attributes incorrect");
                            test.assert(file.displayType == "XML Document", "File displayType incorrect");
                            test.assert(file.dateCreated.getYear() == (new Date()).getYear(), "File dateCreated incorrect");

                            return cleanUpStorageFileTest().then(function () {
                                file.deleteAsync().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                }).then(function () {

                    // Test with failure
                    return setupFileFolderTest(folder).then(function () {
                        return new WinJS.Promise(function (c) {
                            // Create the test file
                            return folder.createFileAsync("createTest.xml").then(function (file) {
                                return folder.createFileAsync("createTest.xml").then(
                                    // success handler
                                    function (file) {
                                        test.assert(false, "shouldn't be here");
                                    },

                                    // Error handler
                                    function (error) {
                                        test.assert(error.message == "Cannot create a file when that file already exists.\r\n", "Incorrect error message");
                                        return cleanUpStorageFileTest().then(function () {
                                            c();
                                        });
                                    });
                            });
                        });
                    })
                });
            }

            return createFileAsync_Folder(test, appData.localFolder).then(function () {
                return createFileAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFolderAsync
    //
    createFolderAsync: function (test) {
        test.start("StorageFolder.createFolderAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var createFolderAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        // Create the test folder
                        return folder.createFolderAsync("TestFolder3", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (item) {
                            // validate folder exists
                            test.assert(pathCompare(item.path, folder.path + "\\" + item.name), "folder path incorrect");
                            test.assert(item.displayName == "TestFolder3", "folder displayName incorrect");
                            test.assert(item.name == "TestFolder3", "folder name incorrect");
                            test.assert(!item.fileType, "folder fileType incorrect");
                            test.assert(item.attributes == Windows.Storage.FileAttributes.directory, "1: attributes incorrect");
                            test.assert(!item.contentType, "folder contentType incorrect");
                            test.assert(item.displayType == "File folder", "folder displayType incorrect");
                            test.assert(item.dateCreated.getYear() == (new Date()).getYear(), "folder dateCreated incorrect");
                            test.assert(item.isOfType(Windows.Storage.StorageItemTypes.folder), "1 incorrect isOfType");
                            test.assert(folder.isOfType(Windows.Storage.StorageItemTypes.folder), "2 incorrect isOfType");
                            return cleanUpStorageFileTest().then(function () {
                                return item.deleteAsync().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                }).then(function () {

                    // Test with failure
                    return setupFileFolderTest(folder).then(function () {
                        return new WinJS.Promise(function (c) {
                            // Create the test folder
                            return folder.createFolderAsync("TestFolder3").then(function (folder2) {
                                return folder.createFolderAsync("TestFolder3").then(function (file) {
                                    test.assert(false, "shouldn't be here");
                                }, function (error) {
                                    test.assert(error.message == "Cannot create a file when that file already exists.\r\n", "Incorrect error message");
                                    return cleanUpStorageFileTest().then(function () {
                                        return folder2.deleteAsync().then(function () {
                                            c();
                                        });
                                    });
                                });
                            });
                        });
                    })
                });
            }

            return createFolderAsync_Folder(test, appData.localFolder).then(function () {
                return createFolderAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test Storage.StorageFolder.deleteAsync
    //
    deleteAsync: function (test) {
        test.start("StorageFolder.deleteAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var deleteAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        // Create the test folder
                        return folder.createFolderAsync("TestFolder3", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (item) {

                            // Delete the test folder
                            return item.deleteAsync().then(function () {
                                // verify it's no longer there
                                return folder.getItemAsync("TestFolder3").then(function () {
                                    test.assert("shouldn't be here");
                                },
                                function (error) {
                                    test.assert(error.message == "The system cannot find the file specified.\r\n", "Incorrect error");
                                    return cleanUpStorageFileTest().then(function () {
                                        c();
                                    });
                                });
                            });
                        });
                    });
                });
            }
            test.nyi("Collision options");

            return deleteAsync_Folder(test, appData.localFolder).then(function () {
                return deleteAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getIndexedStateAsync
    //
    getIndexedStateAsync: function (test) {
        test.start("StorageFolder.getIndexedStateAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getIndexedStateAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        return folder.getIndexedStateAsync().then(function (state) {
                            test.assert(state == Windows.Storage.Search.IndexedState.notIndexed, "root folder state incorrect");
                            testFolder1a.getIndexedStateAsync().then(function (state) {
                                test.assert(state == Windows.Storage.Search.IndexedState.notIndexed, "created folder state incorrect");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            return getIndexedStateAsync_Folder(test, appData.localFolder).then(function () {
                return getIndexedStateAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.renameAsync
    //
    renameAsync: function (test) {
        test.start("StorageFolder.renameAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var renameAsync = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        // Rename the test folder
                        testFolder1.renameAsync("TestFolder_X", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (item) {

                            // verify it's there
                            return folder.getItemAsync("TestFolder_X").then(function (item) {
                                test.assert(item.name == "TestFolder_X", "Item not renamed");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            test.nyi("Collision options");
            return renameAsync(test, appData.localFolder).then(function () {
                return renameAsync(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFolderAsync
    //
    getFolderAsync: function (test) {
        test.start("StorageFolder.getFolderAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getFolderAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        return folder.getFolderAsync("TestX").then(function (item) {
                            test.assert(pathCompare(item.path, folder.path + "\\" + item.name), "Subfolder path incorrect");
                            return cleanUpStorageFileTest().then(function () {
                                c();
                            });
                        });
                    });
                });
            }

            return getFolderAsync_Folder(test, appData.localFolder).then(function () {
                return getFolderAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFileAsync
    //
    getFileAsync: function (test) {
        test.start("StorageFolder.getFileAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getFileAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        testFolder1a.createFileAsync("testFile1b.dat").then(function () {
                            return testFolder1a.getFileAsync("testFile1a.dat").then(function (item) {
                                test.assert(pathCompare(item.path, testFolder1a.path + "\\testFile1a.dat"), "Subfolder path incorrect");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            return getFileAsync_Folder(test, appData.localFolder).then(function () {
                return getFileAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getItemAsync
    //
    getItemAsync: function (test) {
        test.start("StorageFolder.getItemAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getItemAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        // test with file
                        return testFolder1a.createFileAsync("testFile1b.dat").then(function () {
                            return testFolder1a.getItemAsync("testFile1a.dat").then(function (item) {
                                test.assert(pathCompare(item.path, testFolder1a.path + "\\testFile1a.dat"), "Subfolder path incorrect");
                                test.assert(item.attributes == 32, "file attributes wrong");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                }).then(function () {

                    // Test with folder
                    return setupFileFolderTest(folder).then(function () {
                        return new WinJS.Promise(function (c) {
                            // Create the test folder
                            return folder.getItemAsync("TestX").then(function (item) {
                                test.assert(pathCompare(item.path, folder.path + "\\TestX"), "Subfolder path incorrect");
                                test.assert(item.attributes == 16, "file attributes wrong");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    })
                });
            }

            return getItemAsync_Folder(test, appData.localFolder).then(function () {
                return getItemAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFilesAsync
    //
    getFilesAsync: function (test) {
        test.start("StorageFolder.getFilesAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getFilesAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        testFolder1a.createFileAsync("testFile1b.dat").then(function () {
                            return testFolder1a.getFilesAsync().then(function (items) {
                                test.assert(items.size == 2, "incorrect number of files");
                                test.assert((items[0].name == "testFile1a.dat" && items[1].name == "testFile1b.dat") ||
                                            (items[1].name == "testFile1a.dat" && items[0].name == "testFile1b.dat"), "files not found");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            return getFilesAsync_Folder(test, appData.localFolder).then(function () {
                return getFilesAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getItemsAsync
    //
    getItemsAsync: function (test) {
        test.start("StorageFolder.getItemsAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getItemsAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        testFolder1.createFileAsync("testFile1b.dat").then(function () {
                            return testFolder1.getItemsAsync().then(function (items) {
                                test.assert(items.size == 3, "incorrect number of files");
                                test.assert(items[0].name == "testFile1b.dat" || items[0].name == "TestFile1.dat" || items[0].name == "TestY", "Incorrect files");
                                test.assert(items[1].name == "testFile1b.dat" || items[1].name == "TestFile1.dat" || items[1].name == "TestY", "Incorrect files");
                                test.assert(items[2].name == "testFile1b.dat" || items[2].name == "TestFile1.dat" || items[2].name == "TestY", "Incorrect files");
                                test.assert(items[0].name != items[1].name && items[1].name != items[2].name, "Incorrect files");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            return getItemsAsync_Folder(test, appData.localFolder).then(function () {
                return getItemsAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFoldersAsync
    //
    getFoldersAsync: function (test) {
        test.start("StorageFolder.getFoldersAsync tests");
        test.timeoutLength = 5000;

        return test.doAsync(function (onTestComplete) {
            var appData = Windows.Storage.ApplicationData.current;

            var getFoldersAsync_Folder = function (test, folder) {

                return setupFileFolderTest(folder).then(function () {
                    return new WinJS.Promise(function (c) {
                        return folder.getFolderAsync("TestX").then(function (item) {
                            item.getFoldersAsync().then(function (sfs) {
                                test.assert(sfs.size == 1, "Incorrect size");
                                test.assert(pathCompare(sfs[0].path, folder.path + "\\" + item.name + "\\" + sfs[0].name), "Subfolder path incorrect");
                                return cleanUpStorageFileTest().then(function () {
                                    c();
                                });
                            });
                        });
                    });
                });
            }

            return getFoldersAsync_Folder(test, appData.localFolder).then(function () {
                return getFoldersAsync_Folder(test, appData.temporaryFolder).then(function () {
                    return onTestComplete(test);
                });
            });
        });
    },

    // ==========================================================================
    // 
    // Test StorageFolder.folderRelativeId
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
    // Test StorageFolder.getFolderFromPathAsync
    //
    getFolderFromPathAsync: function (test) {
        test.start("getFolderFromPathAsync tests");
        test.timeoutLength = 5000;
        return test.doAsync(function (onTestComplete) {
            var getFolderFromPathAsync_Folder = function (test, folder) {

                return new WinJS.Promise(function (c) {
                    return setupFileFolderTest(folder).then(function () {

                        Windows.Storage.StorageFolder.getFolderFromPathAsync(folder.path + "\\TestX\\TestY").then(function (item) {
                            test.assert(item.name == "TestY", "Failed to find item");
                            c();
                        });
                    });
                });
            }
            getFolderFromPathAsync_Folder(test, localFolder).then(function () {
                getFolderFromPathAsync_Folder(test, tempFolder).then(function () {
                    // We can't modify app folder, so we need a different test for it
                    Windows.Storage.StorageFolder.getFolderFromPathAsync(appFolder.path + "\\Tests\\supportFiles\\storage").then(function (item) {
                        test.assert(item.name == "storage", "name incorrect");
                        cleanUpStorageFileTest().then(function () {
                            onTestComplete(test);
                        });
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
    */

    /*


    
    
    Query* searches are not supported in R1 - coming in R2
    
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.
    //
    areQueryOptionsSupported: function (test) {
    
        test.start("StorageFolder.areQueryOptionsSupported tests");
        test.nyi("Not yet implemented");
    },
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFileQuery
    //
    createFileQuery: function (test) {
    
        test.start("StorageFolder.createFileQuery tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFileQueryWithOptions
    //
    createFileQueryWithOptions: function (test) {
    
        test.start("StorageFolder.createFileQueryWithOptions tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFolderQuery
    //
    createFolderQuery: function (test) {
    
        test.start("StorageFolder.createFolderQuery tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFolderQueryWithOptions
    //
    createFolderQueryWithOptions: function (test) {
    
        test.start("StorageFolder.createFolderQueryWithOptions tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createItemQuery
    //
    createItemQuery: function (test) {
    
        test.start("StorageFolder.createItemQuery tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createItemQueryWithOptions
    //
    createItemQueryWithOptions: function (test) {
    
        test.start("StorageFolder.createItemQueryWithOptions tests");
        test.nyi("Not yet implemented");
    },
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.isCommonFileQuerySupported
    //
    isCommonFileQuerySupported: function (test) {
    
        test.start("StorageFolder.isCommonFileQuerySupported tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.isCommonFolderQuerySupported
    //
    isCommonFolderQuerySupported: function (test) {
    
        test.start("StorageFolder.isCommonFolderQuerySupported tests");
        test.nyi("Not yet implemented");
    },
    */
});
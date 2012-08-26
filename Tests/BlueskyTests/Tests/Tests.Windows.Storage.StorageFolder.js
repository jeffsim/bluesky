"use strict";

// ================================================================
//
// Test.Windows.Storage.StorageFolder.js
//		Tests for Windows.Storage.StorageFolder
//
/*
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.StorageFolder Tests", {
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.createFileAsync
    //
    createFileAsync: function (test) {

        test.start("StorageFolder.createFileAsync tests");

        // This is an async test, so it must use test.doAsync and call onTestComplete when done
        return test.doAsync(function (onTestComplete) {

            Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("sample.dat", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (createdFile) {

                // Verify file exists
                createdFile.getBasicPropertiesAsync().then(function (basicProperties) {

                    test.assert(basicProperties.itemDate, "Item not created");

                    test.assert(false, "NYI: create in custom folder");
                    test.assert(false, "NYI: error handling");
                    onTestComplete(test);
                });
            });
        });
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.areQueryOptionsSupported
    //
    areQueryOptionsSupported: function (test) {

        test.start("StorageFolder.areQueryOptionsSupported tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.attributes
    //
    attributes: function (test) {

        test.start("StorageFolder.attributes tests");
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
    // Test Storage.StorageFolder.createFolderAsync
    //
    createFolderAsync: function (test) {

        test.start("StorageFolder.createFolderAsync tests");
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
    // Test Storage.StorageFolder.dateCreated
    //
    dateCreated: function (test) {

        test.start("StorageFolder.dateCreated tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.deleteAsync
    //
    deleteAsync: function (test) {

        test.start("StorageFolder.deleteAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.displayName
    //
    displayName: function (test) {

        test.start("StorageFolder.displayName tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.displayType
    //
    displayType: function (test) {

        test.start("StorageFolder.displayType tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.folderRelativeId
    //
    folderRelativeId: function (test) {

        test.start("StorageFolder.folderRelativeId tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getBasicPropertiesAsync
    //
    getBasicPropertiesAsync: function (test) {

        test.start("StorageFolder.getBasicPropertiesAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFileAsync
    //
    getFileAsync: function (test) {

        test.start("StorageFolder.getFileAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFilesAsync
    //
    getFilesAsync: function (test) {

        test.start("StorageFolder.getFilesAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFolderAsync
    //
    getFolderAsync: function (test) {

        test.start("StorageFolder.getFolderAsync tests");
        test.nyi("Not yet implemented");
    },
    
    
    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFolderFromPathAsync
    //
    getFolderFromPathAsync: function (test) {

        test.start("StorageFolder.getFolderFromPathAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getFoldersAsync
    //
    getFoldersAsync: function (test) {

        test.start("StorageFolder.getFoldersAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getIndexedStateAsync
    //
    getIndexedStateAsync: function (test) {

        test.start("StorageFolder.getIndexedStateAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getItemAsync
    //
    getItemAsync: function (test) {

        test.start("StorageFolder.getItemAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getItemsAsync
    //
    getItemsAsync: function (test) {

        test.start("StorageFolder.getItemsAsync tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.getThumbnailAsync
    //
    getThumbnailAsync: function (test) {

        test.start("StorageFolder.getThumbnailAsync tests");
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


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.isOfType
    //
    isOfType: function (test) {

        test.start("StorageFolder.isOfType tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.name
    //
    name: function (test) {

        test.start("StorageFolder.name tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.path
    //
    path: function (test) {

        test.start("StorageFolder.path tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.properties
    //
    properties: function (test) {

        test.start("StorageFolder.properties tests");
        test.nyi("Not yet implemented");
    },


    // ==========================================================================
    // 
    // Test Storage.StorageFolder.renameAsync
    //
    renameAsync: function (test) {

        test.start("StorageFolder.renameAsync tests");
        test.nyi("Not yet implemented");
    }
});
    */
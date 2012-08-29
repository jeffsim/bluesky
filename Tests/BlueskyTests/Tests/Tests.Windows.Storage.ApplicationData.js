"use strict";

// ================================================================
//
// Test.Windows.Storage.ApplicationData.js
//		Tests for Windows.Storage.ApplicationData
//
// Add our tests into the test harness's list of tests
testHarness.addTestFile("Windows.Storage.ApplicationData Tests", {

    // ==========================================================================
    // 
    // Test roamingStorageQuota
    //
    roamingStorageQuota: function (test) {

        test.start("ApplicationData.roamingStorageQuota tests");

        var appData = Windows.Storage.ApplicationData.current;
        test.assert(appData.roamingStorageQuota == 100, "roamingStorageQuota is incorrect");
    },

    // ==========================================================================
    // 
    // Test built-in folders
    //
    foldersAndSettings: function (test) {

        test.start("built-in folder and settings tests");

        return test.doAsync(function (onTestComplete) {

            test.assert(appData.localFolder, "appData.localFolder not found");
            test.assert(appData.temporaryFolder, "appData.tempFolder not found");
            test.assert(appData.roamingFolder, "appData.roamingFolder not found");

            // TODO: These tests will break in different regions...
            test.assert(appData.localFolder.displayName == "LocalState", "Local folder display name incorrect");
            test.assert(appData.temporaryFolder.displayName == "TempState", "tempFolder display name incorrect");
            test.assert(appData.roamingFolder.displayName == "RoamingState", "roamingFolder display name incorrect");

            test.assert(appData.localSettings, "localSettings not found");
            test.assert(appData.roamingSettings, "roamingSettings not found");

            test.nyi("datachanged/signalDataChanged - no roaming in R1/R2");
            onTestComplete(test);
        });
    },


    // ==========================================================================
    // 
    // Test version and setVersionAsync
    //
    version: function (test) {

        test.start("version and setVersionAsync tests");

        return test.doAsync(function (onTestComplete) {

            var curVersion = appData.version;

            var setVersionHandler = function (setVersionRequest) {
                test.assert(setVersionRequest.currentVersion == curVersion, "curVersion incorrect");
                test.assert(setVersionRequest.desiredVersion == 10, "desiredVersion incorrect");
                onTestComplete(test);
            };
            appData.setVersionAsync(10, setVersionHandler);
        });
    },

    // ==========================================================================
    // 
    // Test version and clearAsync
    //
    clearAsync: function (test) {

        test.start("clearAsync tests");
        test.timeoutLength = 10000;
        var roamingFolder = appData.roamingFolder;

        // TODO: Not really testing roaming here.

        return test.doAsync(function (onTestComplete) {
            return new WinJS.Promise(function (c) {
                return setupFileFolderTest(localFolder).then(function () {
                    return setupFileFolderTest(tempFolder).then(function () {
                        return setupFileFolderTest(roamingFolder).then(function () {
                            // clear local
                            return appData.clearAsync(Windows.Storage.ApplicationDataLocality.local).then(function () {

                                // verify local is empty and temp/roaming are not
                                localFolder.getItemsAsync().then(function (items) {
                                    test.assert(items.size == 0, "1 Did not clear local");
                                    tempFolder.getItemsAsync().then(function (items2) {
                                        test.assert(items2.size > 0, "1 Did clear temp");
                                        return cleanUpStorageFileTest().then(function () {

                                            c();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }).then(function () {
                return new WinJS.Promise(function (c) {
                    return setupFileFolderTest(localFolder).then(function () {
                        return setupFileFolderTest(tempFolder).then(function () {
                            return setupFileFolderTest(roamingFolder).then(function () {
                                // clear temp
                                return appData.clearAsync(Windows.Storage.ApplicationDataLocality.temporary).then(function () {

                                    // verify temp is empty and local/roaming are not
                                    tempFolder.getItemsAsync().then(function (items) {
                                        test.assert(items.size == 0, "2 Did not clear temp");
                                        localFolder.getItemsAsync().then(function (items2) {
                                            test.assert(items2.size > 0, "2 Did clear local");
                                            return cleanUpStorageFileTest().then(function () {

                                                c();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }).then(function () {
                return new WinJS.Promise(function (c) {
                    return setupFileFolderTest(localFolder).then(function () {
                        return setupFileFolderTest(tempFolder).then(function () {
                            return setupFileFolderTest(roamingFolder).then(function () {
                                // clear roaming
                                return appData.clearAsync(Windows.Storage.ApplicationDataLocality.roaming).then(function () {

                                    // verify roaming is empty and local/temp are not
                                    tempFolder.getItemsAsync().then(function (items) {
                                        test.assert(items.size > 0, "3 Did clear temp");
                                        localFolder.getItemsAsync().then(function (items2) {
                                            test.assert(items2.size > 0, "3 Did clear local");
                                            return cleanUpStorageFileTest().then(function () {

                                                c();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }).then(function () {
                return new WinJS.Promise(function (c) {
                    return setupFileFolderTest(localFolder).then(function () {
                        return setupFileFolderTest(tempFolder).then(function () {
                            return setupFileFolderTest(roamingFolder).then(function () {
                                // clear wihtout locality
                                return appData.clearAsync().then(function () {

                                    // verify all are empty
                                    tempFolder.getItemsAsync().then(function (items) {
                                        test.assert(items.size == 0, "4 Did not clear temp");
                                        localFolder.getItemsAsync().then(function (items2) {
                                            test.assert(items2.size == 0, "4 Did clear local");
                                            return cleanUpStorageFileTest().then(function () {

                                                onTestComplete(test);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});
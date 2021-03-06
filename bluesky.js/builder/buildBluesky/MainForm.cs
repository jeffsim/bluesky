﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Windows.Forms;
using Microsoft.Ajax.Utilities;

namespace buildBluesky
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            sourceFolderTB.Text = @"..\..\..\..\sourceFiles";
            destFolderTB.Text = @"..\..\..\..\packedFiles";
        }
        string sourceFolder, destFolder;

        private void button1_Click(object sender, EventArgs e)
        {
            string[] filesInOrder = new string[] {
               @"\WinJS.js",
               @"\WinJS.UI.DOMEventMixin.js",
               @"\WinJS.xhr.js",
               @"\Windows.js",
               @"\Windows.Foundation.js",
               @"\Windows.Foundation.Collections.js",
               @"\Windows.ApplicationModel.js",
               @"\Windows.ApplicationModel.Package.js",
               @"\Windows.Storage.js",
               @"\Windows.Storage.ApplicationData.js",
               @"\Windows.Storage.ApplicationDataContainer.js",
               @"\Windows.Storage.ApplicationDataContainerSettings.js",
               @"\Windows.Storage.StorageItem.js",
               @"\Windows.Storage.StorageItemContentProperties.js",
               @"\Windows.Storage.StorageFile.js",
               @"\Windows.Storage.StorageFolder.js",
               @"\Windows.Storage._AppXStorageFolder.js",
               @"\Windows.Storage.FileIO.js",
               @"\Windows.Storage.PathIO.js",
               @"\Windows.Storage.Search.js",
               @"\Windows.Storage.Search.StorageFolderQueryResult.js",
               @"\Windows.Storage.CachedFileManager.js",
               @"\Windows.Globalization.js",
               @"\Windows.System.Launcher.js",
               @"\WinJS.Application.js",
               @"\WinJS.Navigation.js",
               @"\WinJS.Resources.js",
               @"\WinJS.Promise.js",
               @"\WinJS.Binding.js",
               @"\WinJS.Binding._ListBase.js",
               @"\WinJS.Binding._ModifiableListBase.js",
               @"\WinJS.Binding.List.js",
               @"\WinJS.Binding._ListProjection.js",
               @"\WinJS.Binding.FilteredList.js",
               @"\WinJS.Binding.GroupedList.js",
               @"\WinJS.Binding.GroupsList.js",
               @"\WinJS.Binding.Template.js",
               @"\WinJS.UI.js",
               @"\WinJS.UI.BaseControl.js",
               @"\WinJS.UI.AppBar.js",
               @"\WinJS.UI.AppBarCommand.js",
               @"\WinJS.UI.AppBarIcon.js",
               @"\WinJS.UI.Animation.js",
               @"\WinJS.UI.Fragments.js",
               @"\WinJS.UI.Pages.js",
               @"\WinJS.UI.HtmlControl.js",
               @"\WinJS.UI.Flyout.js",
               @"\WinJS.UI.Rating.js",
               @"\WinJS.UI.FlipView.js",
               @"\WinJS.UI.ListLayout.js",
               @"\WinJS.UI.GridLayout.js",
               @"\WinJS.UI.IZoomableView.js",
               @"\WinJS.UI.SemanticZoom.js",
               @"\WinJS.UI.ListView.js",
			   @"\WinJS.UI.ToggleSwitch.js",
			   @"\WinJS.UI.SettingsFlyout.js",
               @"\Windows.UI.Popups.UICommand.js",
               @"\Windows.UI.Popups.MessageDialog.js",
			   @"\Windows.UI.WebUI.js",
			   @"\WinJS.Utilities.js",
			   @"\WinJS.Utilities.QueryCollection.js",
               @"\blueskySettings.js",
               @"\blueskyUtils.js",
               @"\externalDependencies.js",
               @"\bluesky-polyfills.js"
            };

            // Ensure source and dest folders end with a backslash
            sourceFolder = sourceFolderTB.Text;
            destFolder = destFolderTB.Text;
            if (!sourceFolder.EndsWith("\\"))
                sourceFolder += "\\";
            if (!destFolder.EndsWith("\\"))
                destFolder += "\\";

            string version = "1.0";

            // Build the non-minified debug version
            BuildFile("bluesky-" + version + "-debug.js", false, filesInOrder);

            // Build the minified release version (extract DEBUG lines)
            BuildFile("bluesky-" + version + "-min.js", true, filesInOrder);

            // Copy the debug version into the Test folder
            string blueskyTestFile = @"..\..\..\..\..\Tests\BlueskyTests\bluesky\bluesky-" + version + "-debug.js";
            if (File.Exists(blueskyTestFile))
                File.Delete(blueskyTestFile);
            File.Copy(destFolder + "bluesky-" + version + "-debug.js", blueskyTestFile);

            // Copy the minified (release) version into the test folder
            blueskyTestFile = @"..\..\..\..\..\Tests\BlueskyTests\bluesky\bluesky-" + version + "-min.js";
            if (File.Exists(blueskyTestFile))
                File.Delete(blueskyTestFile);
            File.Copy(destFolder + "bluesky-" + version + "-min.js", blueskyTestFile);

            MessageBox.Show("Build complete");
        }

        private string addLicense()
        {
            string output = "/* Copyright 2012, Bluesky LLC (www.bluesky.io)\r\n";
            output += "* This Source Code Form is subject to the terms of a commercial license\r\n";
            output += "* If you have no signed a license with Bluesky LLC for use of this code please contact sales@bluesky.io\r\n";
            output += "* If you have questions, ideas or feedback please contact info@bluesky.io\r\n*/\r\n\r\n";

            return output;
        }

        private void BuildFile(string outputFileName, bool minifyAndRemoveDebug, string[] filesInOrder)
        {
            string output = "";
            int i = 0;

            // Add licensing info to file, regardless of minification
            output += addLicense();
            // Add use strict to top of file (rather than specifying in each one)
            output += "\"use strict\";\r\n\r\n";

            foreach (string fileName in filesInOrder)
            {
                // Add file header
                if (i > 0)
                {
                    output += "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n";
                }
                output += "// ============================================================== //\r\n";
                output += "// ============================================================== //\r\n";
                output += "// ==                                                          == //\r\n";
                output += "//                    File: " + fileName.Substring(1) + "\r\n";
                output += "// ==                                                          == //\r\n";
                output += "// ============================================================== //\r\n";
                output += "// ============================================================== //\r\n";
                output += "\r\n";

                string[] sourceLines = File.ReadAllLines(sourceFolder + fileName);
                bool _inDebugBlock = false;
                foreach (string sourceLine in sourceLines)
                {

                    // create a trimmed line for checking (we'll output the original line though)
                    string trimmedLine = sourceLine.Trim();

                    // skip 'use strict' in case I forgot to remove :P
                    if (trimmedLine.ToLower() == "\"use strict\";")
                        continue;

                    // if this is a release build and we're in a debug block then look for the end of the block and skip lines until we get to it
                    if (minifyAndRemoveDebug)
                    {
                        if (_inDebugBlock)
                        {
                            if (trimmedLine.Contains("/*ENDDEBUG*/"))
                            {
                                _inDebugBlock = false;
                            }
                            continue;
                        }
                        else if (trimmedLine.Contains("/*DEBUG*/"))
                        {
                            _inDebugBlock = true;
                            continue;
                        }
                    }

                    // TODO: \n or \r\n? (here and elsewhere in this file)
                    output += sourceLine + "\r\n";
                }
                i++;
            }

            if (minifyAndRemoveDebug)
            {
                var minifier = new Microsoft.Ajax.Utilities.Minifier();
                output = addLicense() + minifier.MinifyJavaScript(output);
            }
            string outputFile = destFolder + outputFileName;
            File.Delete(outputFile);
            File.WriteAllText(outputFile, output);
            Close();
        }
    }
}

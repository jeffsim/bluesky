using System;
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
               @"\Windows.js",
               @"\WinJS.Application.js",
               @"\WinJS.Navigation.js",
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
               @"\WinJS.UI.Animation.js",
               @"\WinJS.UI.BaseControl.js",
               @"\WinJS.UI.Pages.js",
               @"\WinJS.UI.HtmlControl.js",
               @"\WinJS.UI.Rating.js",
               @"\WinJS.UI.FlipView.js",
               @"\WinJS.UI.ListLayout.js",
               @"\WinJS.UI.ListView.js",
			   @"\Windows.UI.WebUI.js",
			   @"\WinJS.Utilities.js",
			   @"\WinJS.Utilities.QueryCollection.js",
               @"\blueskyUtils.js"
            };

			// Ensure source and dest folders end with a backslash
			sourceFolder = sourceFolderTB.Text;
			destFolder = destFolderTB.Text;
			if(!sourceFolder.EndsWith("\\"))
				sourceFolder += "\\";
			if(!destFolder.EndsWith("\\"))
				destFolder += "\\";

			// Build the non-minified debug version
			BuildFile("bluesky-debug.js", false, filesInOrder);

			// Build the minified release version (extract DEBUG lines)
			BuildFile("bluesky-min.js", true, filesInOrder);

			// Copy the debug version into the Test folder
			string blueskyTestFile = @"..\..\..\..\..\Tests\BlueskyTests\bluesky\bluesky-debug.js";
			if(File.Exists(blueskyTestFile))
				File.Delete(blueskyTestFile);
			File.Copy(destFolder + "bluesky-debug.js", blueskyTestFile);

			// Copy the minified (release) version into the test folder
			blueskyTestFile = @"..\..\..\..\..\Tests\BlueskyTests\bluesky\bluesky-min.js";
			if(File.Exists(blueskyTestFile))
				File.Delete(blueskyTestFile);
			File.Copy(destFolder + "bluesky-min.js", blueskyTestFile);

            // Temp, for development purposes - copy into sample folder
            var navSampleFile = @"..\..\..\..\..\Samples\Win8SDK\listViewTemplates\bluesky\bluesky-debug.js";
            if (File.Exists(navSampleFile))
                File.Delete(navSampleFile);
            File.Copy(destFolder + "bluesky-debug.js", navSampleFile);

            MessageBox.Show("Build complete");
		}

		private string addLicense()
		{
			string output = "/* This Source Code Form is subject to the terms of the Mozilla Public\r\n";
			output += "* License, v. 2.0. If a copy of the MPL was not distributed with this\r\n";
			output += "* file, You can obtain one at http://mozilla.org/MPL/2.0/. */\r\n\r\n";
			output += "// Copyright 2012, Jeff Simon (www.bluesky.io).  Date: 7/23/2012\r\n\r\n";
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

			foreach(string fileName in filesInOrder)
			{
				// Add file header
				if(i > 0)
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
				foreach(string sourceLine in sourceLines)
				{

					// create a trimmed line for checking (we'll output the original line though)
					string trimmedLine = sourceLine.Trim();

					// skip 'use strict' in case I forgot to remove :P
					if(trimmedLine.ToLower() == "\"use strict\";")
						continue;

					// if this is a release build and we're in a debug block then look for the end of the block and skip lines until we get to it
					if(minifyAndRemoveDebug)
					{
						if(_inDebugBlock)
						{
							if(trimmedLine.Contains("/*ENDDEBUG*/"))
							{
								_inDebugBlock = false;
							}
							continue;
						}
						else if(trimmedLine.Contains("/*DEBUG*/"))
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

			if(minifyAndRemoveDebug)
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

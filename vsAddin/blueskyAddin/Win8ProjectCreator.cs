using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text;
using System.Xml;
using EnvDTE;
using EnvDTE80;

namespace blueskyAddin
{
    public static class Win8ProjectCreator
    {
        static string _sourceProjectFullPathAndName;
        static string _sourceProjectFullPath;
        static string _sourceProjectName;
        static Assembly _thisAssembly;
        static DTE2 dte;
        public static void DuplicateWin8JSProject(DTE2 dteIn, Project sourceProject)
        {
            dte = dteIn;
            // TBD: Should output a migration report.
            // TBD: Add a w8waddin "welcome page" ala the vs2012 start page.  not sure where to put it; link from vs2012 start page? replace it? show on webify? etfc

            // copy web source files
            _thisAssembly = Assembly.GetExecutingAssembly();
            _sourceProjectFullPathAndName = sourceProject.FullName;
            _sourceProjectFullPath = sourceProject.FullName.Substring(0, sourceProject.FullName.LastIndexOf("\\"));
            _sourceProjectName = _sourceProjectFullPathAndName.Substring(_sourceProjectFullPath.Length+1);
            XmlDocument templateWebAppProject = new XmlDocument();

            projectFiles.Clear();

            // Parse the source Win8 project and extract information that we'll inject into the web project
            ProcessSourceProject(sourceProject);

            // Load the template web app project file and prepare the Xml
            string sourceProj = LoadProjectFile("WebAppProj.csproj");

            byte[] encodedString = Encoding.UTF8.GetBytes(sourceProj);
            MemoryStream ms = new MemoryStream(encodedString);
            ms.Flush();
            ms.Position = 0;
            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.Load(ms);
            XmlNode root = xmlDoc.DocumentElement;
            XmlNamespaceManager nsmgr = new XmlNamespaceManager(xmlDoc.NameTable);
            nsmgr.AddNamespace("vs", "http://schemas.microsoft.com/developer/msbuild/2003");

  //          XmlNode assemblyName = root.SelectSingleNode("descendant::vs:AssemblyName", nsmgr);
//            assemblyName.InnerText = _sourceAssemblyName + "_Web";

            XmlNode projectGuid = root.SelectSingleNode("descendant::vs:ProjectGuid", nsmgr);
            projectGuid.InnerText = Guid.NewGuid().ToString();

            // Get the files collection; add files from source project
            XmlNode itemGroup = root.SelectSingleNode("descendant::vs:ItemGroup", nsmgr);
            foreach(string file in projectFiles) {
                XmlNode contentNode = xmlDoc.CreateElement("Content", "http://schemas.microsoft.com/developer/msbuild/2003");
                XmlAttribute includeAttr = xmlDoc.CreateAttribute("Include");
                includeAttr.Value = file;
                contentNode.Attributes.Append(includeAttr);
                itemGroup.AppendChild(contentNode);
            }

            xmlDoc.Save(_sourceProjectFullPath + "\\WebApp.csproj");

            try
            {
                // Load the appxmanifest file, process it, and save it back out as a w8wmanifest file
                // tbd: what if file was renamed; enumerate files and find the .appxmanifest file...
                string sourceManifest = File.ReadAllText(_sourceProjectFullPath + "\\package.appxmanifest");

                encodedString = Encoding.UTF8.GetBytes(sourceManifest);
                ms = new MemoryStream(encodedString);
                ms.Flush();
                ms.Position = 0;
                xmlDoc = new XmlDocument();
                xmlDoc.Load(ms);
                root = xmlDoc.DocumentElement;
                nsmgr = new XmlNamespaceManager(xmlDoc.NameTable);
                nsmgr.AddNamespace("vs", "http://schemas.microsoft.com/appx/2010/manifest");

                XmlNode osMinVer = root.SelectSingleNode("descendant::vs:OSMinVersion", nsmgr);
                osMinVer.InnerText = "0.9.0";

                XmlNode osMaxVer = root.SelectSingleNode("descendant::vs:OSMaxVersionTested", nsmgr);
                osMaxVer.InnerText = "0.9.0";

                // Get the start page
                XmlNode appNode = root.SelectSingleNode("descendant::vs:Application", nsmgr);
                appNode.Attributes["StartPage"].Value = "defaultWeb.html";

                xmlDoc.Save(_sourceProjectFullPath + "\\package.w8wmanifest");
            } catch( Exception ex)
            {
                // no manifest; ignore it

            }

            // Copy web-specific source files project folder
            string[] sourceFiles = {
                                    "web.config",
                                    "WebApp.csproj.user"
                                   };
            foreach(string file in sourceFiles)
                CopyProjectFile(file);

            // Add the new project to the current solution
            Solution2 soln = (Solution2)dte.Solution;

            soln.AddFromFile(_sourceProjectFullPath + "\\WebApp.csproj");

            // Create and open a 'migration' report
            DoMigrationReport(projectFiles);
        }

        enum MigrationWarnings { MsGrid, IndexedDB, WinJSRef };
        static void DoMigrationReport(List<string> sourceFiles)
        {
            Dictionary<MigrationWarnings, List<string>> warnings = new Dictionary<MigrationWarnings, List<string>>();

            warnings[MigrationWarnings.MsGrid] = new List<string>();
            warnings[MigrationWarnings.IndexedDB] = new List<string>();
            warnings[MigrationWarnings.WinJSRef] = new List<string>();
            // Perform a variety of checks and notify the user of the results
            foreach (string file in sourceFiles)
            {
                string fileContents = File.ReadAllText(_sourceProjectFullPath + "/" + file);
                
                // check for -ms-grid
                if (fileContents.Contains("-ms-grid"))
                    warnings[MigrationWarnings.MsGrid].Add(file);

                // check for indexedDb
                if (fileContents.Contains("indexedDB"))
                    warnings[MigrationWarnings.IndexedDB].Add(file);

                if (fileContents.ToLower().Contains("//microsoft.winjs.1.0.rc"))
                    warnings[MigrationWarnings.WinJSRef].Add(file);
            }

            string reportText = "";
            reportText += "<!-- saved from url=(0030)http://www.bluesky.io/ --><html><body><div style='background-color:#eee;width:100%;height:80px;font-family: Segoe UI; font-size:24pt'>bluesky migration report for '" + _sourceProjectName + 
                            "'.<br/><span style='font-size: 14pt'>Created: " + DateTime.Now.ToLongTimeString() + ", " + DateTime.Now.ToShortDateString() + ".</span></div><br/><br/><span style='font-color:red'>Warnings:</span><br/><br/>";
            reportText += "<table border='1' style='border-spacing: 0px;'><tr style='background-color:'#ddd'><td style='background-color:'#ddd'>File</td><td>Warning</td></tr>";
            foreach(string warningFile in warnings[MigrationWarnings.IndexedDB])
                reportText += "<tr><td style='background-color:'#eee'>" + warningFile + "</td><td>Contains indexedDB reference; multiple browsers do not support that.</td></tr>";
            foreach (string warningFile in warnings[MigrationWarnings.MsGrid])
                reportText += "<tr><td style='background-color:'#eee'>" + warningFile + "</td><td>Contains -ms-grid; this is only supported by IE10, and your layout may be broken on other browsers.</td></tr>";
            foreach (string warningFile in warnings[MigrationWarnings.WinJSRef])
                reportText += "<tr><td style='background-color:'#eee'>" + warningFile + "</td><td>Remove all references to //Microsoft.WinJS.1.0.RC; they are currently tripping up the css parser and causing css files to not load.</td></tr>";
            reportText += "</table></body></html>";
            // Create the migration report
            string migrationReportName = _sourceProjectFullPath + "/blueskyMigrationReport.html";
            File.WriteAllText(migrationReportName, reportText);
            dte.ItemOperations.Navigate(migrationReportName);
        }

            #region File support
        private static void CopyProjectFile(string fileName)
        {
            string fileName2 = fileName.Replace("/", ".");
            Stream stream = _thisAssembly.GetManifestResourceStream("blueskyAddin.WebProjectFilesToCopy." + fileName2);
            BinaryReader r = new BinaryReader(stream);

            byte[] fileContents = new byte[r.BaseStream.Length];
            r.Read(fileContents, 0, (int)r.BaseStream.Length);
            r.Close();
            File.WriteAllBytes(_sourceProjectFullPath + "\\" + fileName, fileContents);
        }

        private static string LoadProjectFile(string fileName)
        {
            Stream stream = _thisAssembly.GetManifestResourceStream("blueskyAddin.WebProjectFilesToCopy." + fileName);
            StreamReader r = new StreamReader(stream);
            string file = r.ReadToEnd();
            r.Close();
            return file;
        }
        #endregion

        private static void ProcessSourceProject(Project sourceProject)
        {
            for(int i = 0; i < sourceProject.ProjectItems.Count; i++)
                ProcessProjectItem(sourceProject.ProjectItems.Item(i + 1));
        }

        private static void ProcessProjectItem(ProjectItem prjItem)
        {
            foreach (ProjectItem childItem in prjItem.ProjectItems)
                ProcessProjectItem(childItem);

            if(prjItem.Kind.ToLower() == "{6bb5f8ee-4483-11d3-8bcf-00c04f8ec28c}") // physical file 
            {
                string fileFullPath = prjItem.Properties.Item("FullPath").Value.ToString();
                string fileRelativePath = fileFullPath.Substring(_sourceProjectFullPath.Length + 1);

                string[] fileTypesToIgnore = { "pfx", "appxmanifest" };
                bool ignore1 = false;
                foreach(string ignore in fileTypesToIgnore)
                    if(fileRelativePath.ToLower().EndsWith(ignore))
                    {
                        ignore1 = true;
                        break;
                    }
                if(ignore1)
                    return;

                // special case - if this is "default.html", then re-render it into defaultweb.html and create a new file for it.
                // tbd: This is assuming that default page is called "default.html".  Should instead ask user.
                if(fileRelativePath.ToLower().EndsWith("default.html"))
                    ReRenderDefaultHtml(fileRelativePath);
                else
                    projectFiles.Add(fileRelativePath);

            }
        }

        private static void ReRenderDefaultHtml(string defaultFile)
        {
            // Brute-force mechanism (TBD:... that won't always work).  Inject web8 content into the file at the top of the head
            // many tbds on this:  inject after meta tags.  what if no HEAD.  what if already present.  etc.
            string file = File.ReadAllText(_sourceProjectFullPath + "\\" + defaultFile);

            string contentToInject = "\r\n" +
                                    "    <!-- disable IE's Quirks mode -->\r\n" +
                                    "    <meta http-equiv='X-UA-Compatible' content='IE=edge,chrome=1'>\r\n" +
                                    "\r\n" +
                                    "    <!-- bluesky Styles -->\r\n" +
                                    "    <!-- NOTE: It's important to include styles before scripts since the scripts can reference them -->\r\n" +
                                    "    <!-- NOTE: switch 'light' to 'dark' if that's what your app uses. -->\r\n" +
                                    "    <link href='http://bluesky.io/css/bluesky-ui-light-1.0-debug.css' rel='stylesheet'>\r\n" +
                                    "\r\n" +
                                    "    <!-- bluesky scripts -->\r\n" +
                                    "    <script src='http://bluesky.io/js/ext/jquery-1.8.0.js' type='text/javascript'></script>\r\n" +
                                    "    <script src='http://bluesky.io/js/bluesky-1.0-debug.js' type='text/javascript'></script>\r\n" +
                                    "\r\n";
   
            int headLoc = file.ToLower().IndexOf("<head>") + 6;
            string newFile = file.Substring(0, headLoc) + contentToInject + file.Substring(headLoc);
            File.WriteAllText(_sourceProjectFullPath + "\\defaultweb.html", newFile);
        }
        static List<string> projectFiles = new List<string>();
    }
}

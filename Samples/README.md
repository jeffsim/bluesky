# bluesky Samples

This folder contains samples which demonstrate bluesky in action.  It will contain more samples in R1 when the bulk of the bluesky API comes online.

The navigationTemplate sample is working (details below) - the Win8SDK sample(s) are not yet working.

## About the navigationTemplate sample
The navigation sample is an early demonstration of what bluesky will enable: taking a win8 application and publishing it to the web with a minimal amount of effort.  The sample SLN file has two projects, both of which point at the same source code (except for different default.html files) - one project builds for Win8, the other builds for web.  You can make a change in once place, select the project you want, and F5.  

(Note: while the sln will open and work in both Win7/Win8 and in both VS2010/VS2012, VS on Win7 will not recognize the win8 project and throw a warning on startup; that's fine, you can just skip past it and just work with the web project if you're on win7).

## Creating the navigationTemplate sample
Creating a bluesky project currently requires a few extra steps up front, because our in-vitro VS addin to 'webify' Win8 projects is still being built.  While you could work around this by messing with the project files directly, for this example we'll instead just build one solution file with both projects, but with separate copies of those files.

Since we'll be creating and then converting a WinJS project into a bluesky project, you'll need to do this in Windows 8 (since VS2012 on Win7 doesn't support WinJS projects).  Eventually we will provide bluesky template projects which enable Win7 (and monodevelop/xcode on Mac) to create new bluesky projects.  For the time being, if you're on Win7 and want to try bluesky, then just open up the navigationTemplate project and change files as you wish (of course, since bluesky is just html, you can also create your own web project and run with it).

1. First, create the Win8 sample: 
	- In VS2012 on Windows 8, create a new app using the "Navigation App" template under Templates/Other languages/Javascript
2. Now, create the sibling web project:
	* Right click on Solution in Solution explorer and select Add|New Project
	* Select Visual C#|Web and select the ASP.Net Empty Web Application
		- change name to navigationTemplate
		- We want the project sitting alongside the win8 project, so change "location" to C:\dev\sample\navigationTemplate
3. Next, copy the files from the win8 project into the web project
	* Drag the css, images, js, and pages folders, and the default.html file, from the win8 project onto the web project
		- If you really want one codebase, then another option is to go through Add Existing Item and select "add as a link" - but that has to be done file-by-file.
4. Now, change the WinJS script and style references in the web project's default.html to point at bluesky instead;
	* Replace these lines...

```html
	<!-- WinJS references -->
	<link href="//Microsoft.WinJS.1.0.RC/css/ui-dark.css" rel="stylesheet" />
	<script src="//Microsoft.WinJS.1.0.RC/js/base.js"></script>
	<script src="//Microsoft.WinJS.1.0.RC/js/ui.js"></script>
```

   ... with these lines:

```html
	<!-- External bluesky dependencies -->
	<script type='text/javascript' src='http://bluesky.io/js/ext/jquery-1.7.2.min.js'></script>
		
    <!-- bluesky references -->
	<script src='http://bluesky.io/js/bluesky-debug-R0.js' type='text/javascript'></script>
	<link href='http://bluesky.io/css/ui-dark.css' rel='stylesheet'>
	<link href='http://bluesky.io/css/webOverrides-dark-R0.css' rel='stylesheet'>

```	

5) The WinJS samples all rely pretty heavily on -ms-grid for layout, which we need to work around as there is neither support on other browsers nor a polyfill to fake it (yet).  To fix this, paste the following into default.html:

```css
	<style>
	/* Account for lack of -ms-grid*/
	h1 {
		display: inline-block;
		margin-left: 20px;
	}
	</style>
	
```

And you're done!  Set the web project as the startup project and hit F5 and you should see the sample open up in the browser.  You can also delete the win8 project if you are only interested in the web project.

### Creating a bluesky project from scratch
You don't need the original win8 project for this, so in either Win7 or Win8 you can do this:

1. Create a new empty web app 
2. Paste the bluesky references (from step 4 above) into your default.html file

And you're done!  You can start using WinJS APIs in your app.

### Give it a try
You can try out the sample here: http://navSample.bluesky.io.  The sample does basically nothing (as does the navigation template app in win8) - but you can pull up the page source and see that, indeed, it's a full Win8 application running on the Web. 

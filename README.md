# [bluesky] (http://www.bluesky.io)

## What is bluesky?
bluesky is an effort to deliver an API, Platform, and Portal that unifies users’ app experiences across all of their devices.  Initial efforts are focused on developers and the API, which will be a ground-up rewrite of WinJS, built for the modern web.  The goal of bringing WinJS to the web is to enable the impending army of WinJS developers to quickly and easily – ideally with just one click - bring their Win8 apps to the web.  Picture taking your Win8 app and publishing it to Facebook or your own web site; or making it available on the iPad...
## How complete is the bluesky WinJS API at the moment?
Not very complete, although we've just hit our API Preview milestone (you can see what that includes in the table below.)
## How complete will the final bluesky WinJS API be?
Fairly complete.  The yardstick for bluesky is that a typical Win8/WinJS app works on the web without any changes except where the app relies on a non-cross-browser feature and a polyfill isn’t available (e.g. –ms-grid).  We’ll be using the Win8 SDK samples as a proving ground for the near-term future.  There will be things that just plain never work (e.g. hybrid apps).
## How much of bluesky is new code?
All of it.  bluesky is written from scratch, and shares precisely 0 lines of code with Microsoft’s WinJS.  
## All new code, huh; how're the bugs?
They're fine, thanks.  Bluesky is sitting at around 100% code coverage.
## How do I run the tests?
Open bluesky.sln in Visual Studio, set the BlueskyTests project as the startup project, and press F5 (or just open Tests/BlueskyTests.sln and hit F5).

Alternatively, if you'd like to run the tests without downloading anything, you can run the Tests by browsing to here: http://tests.bluesky.io/testharness/testharness.html.
## Can see it in action?
You can view a very early sample here: http://navSample.bluesky.io. The sample does basically nothing, but you can pull up the page source and see that, indeed, it's a Win8 application running on the Web.  The sample is the Visual Studio 'WinJS Navigation' template', and the only modifications were to change scripts from WinJS to bluesky, and tweak some styles).   You can read more about this sample in the Samples folder's readme file.  A more robust sample will come with the R1 release.

Another option is to view the Tests running on the web; you can do that here: http://tests.bluesky.io/testharness/testharness.html.
## How do I use the API?
See the readme in the Samples folder for instructions on how the WinJS navigation template was converted to bluesky.  A more robust answer will be part of R1.
## What comes when?
No dates, but here’s a rough staging (everything subject to change):
<table>
  <tr>
		<td>Release Number</td>
		<td>Name</td>
		<td>Summary</td>
		<td>Features</td>
	</tr>
	<tr>
		<td>0 (<b>COMPLETE!</b>)</td>
		<td>API Alpha</td>
		<td>A subset of WinJS on the Web<br/><br/>Enough to create simple yet fully functional webapps with WinJS.  This includes largely complete versions of the following objects:</td>
		<td>
			<ul>
				<li>WinJS.Application (<b>done</b>)</li>
				<li>WinJS.UI (<b>done</b>)</</li>
				<li>WinJS.UI.Pages (<b>done</b>)</</li>
				<li>WinJS.Binding (<b>done</b>)</</li>
				<li>WinJS.Binding.Template (<b>done</b>)</</li>
				<li>WinJS.Binding.List (<b>done</b>)</</li>
				<li>WinJS.Binding.FilteredList (<b>done</b>)</</li>
				<li>WinJS.Binding.GroupedList (<b>done</b>)</</li>
				<li>WinJS.Navigation (<b>done</b>)</n</li>
				<li>WinJS.Promise (<b>done</b>)</</li>
				<li>WinJS.UI.HtmlControl (<b>done</b>)</</li>
				<li>WinJS.Utilities subset (<b>done</b>)</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>1</td>
		<td>API Preview</td>
		<td>WinJS on the Web<br/><br/>At this point a complex WinJS application can be run nearly verbatim on the web.  Works across any HTML5 browser on tablet or PC (functions on mobile, but no explicit effort to deal with mobile layout or device challenges).  This includes largely complete versions of the following objects:</td>
		<td>
			<ul>
				<li>WinJS.UI.ListView</li>
				<li>WinJS.UI.FlipView</li>
				<li>WinJS.UI.Rating (<b>done</b>)</li>
				<li>WinJS.UI.Animation</li>
				<li>Windows.Storage (local and temp)</li>
				<li>WinJS.Resources</li>
				<li>WinJS.UI.AppBar</li>
				<li>WinJS.UI.SemanticZoom</li>
				<li>bluesky apps work on any HTML5 browser (tablet/desktop)</li>
				<li>Adapt WinJS.Navigation to the web</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>2</td>
		<td>Platform Preview</td>
		<td>WinJS <b>for</b> the Web<br/><br/>Shape WinJS as it would be had it been created for the web from the start.  Focused around the blurring of webapp, nativeapp, and website.  Mobile also starts to come into the picture.</td>
		<td>
			<ul>
				<li>3rd party integration (dropbox/skydrive, google docs/office 365/etc)</li>
				<li>Windows.Storage (remote)</li>
				<li>”Webify me” tool for VS; one click convert win8 app to web.</li>
				<li>Mobile support (e.g. meta-viewports)</li>
				<li>More tbd...</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>3</td>
		<td>Portal Preview</td>
		<td>Win8 on the Web<br/><br/>Win8 Start menu-like experience (built in bluesky, ‘natch) that anyone can sign up for and access across any device.  A preliminary discovery and acquisition experience round out the e2e experience.</td>
		<td>
			<ul>
				<li>A Win8 start menu-esque on the web</li>
				<li>A ‘webapp store’ discovery experience</li>
				<li>A one-click publish tool for apps from VS to the bluesky ‘store’</li>
				<li>More tbd...</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>4</td>
		<td>Portal Launch</td>
		<td>Your Home on the Web<br/><br/>User choice is a key tenet behind bluesky, and how your shell looks is something everyone feels differently about.  In this release, the win8 start menu-like experience can be replaced by the user with a variety of other Shells.  Further, any developer can create a new ‘home app’ that users can discovery and use.</td>
		<td>
			<ul>
				<li>Custom (non-win8-ish) home pages</li>
				<li>3rd party ability to create home pages</li>
				<li>More tbd...</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>5</td>
		<td>IT Preview</td>
		<td>Prep for bluesky in the enterprise<br><br>Enable IT shops to run win8 apps on legacy desktops.  Your developers want to write in win8, but your users are on macbooks?  Take a look at bluesky...</td>
		<td>
			<ul>
				<li>More tbd ...</li>
			</ul>
		</td>
	</tr>
</table>
## Win8 on the web?  But what if I don't care for Metro?
No problem; user choice is a core driver behind the bluesky portal, and we definitely see a day when bluesky Portal users will have the ability to choose any shell UX that fits their needs.  Granted, there will probably be a Windows bias to bluesky for developers (e.g. in APIs and tooling) since a key focus is getting Win8 apps onto the web; but of course it's all HTML underneath and you can use whatever you want.
## I want to use the bluesky API but not the portal
Great, go for it!  We've adopted the MPL 2.0 license because - as we read it - it in essence says that you can use the bluesky source code however you see fit (including publishing outside of the bluesky portal) - but any modifications you make to bluesky itself need to be made available via the same open source MPL 2.0 license.  You can find more about the MPL here: http://mozilla.org/MPL/2.0
## What’s really driving this?
Getting a bit broad for a moment: WinJS on the web is the first of many steps along a path that is focused on building out the next generation of computing experiences around the power of the web. Today's computing experiences are deeply fragmented, with households adopting computing devices with OS's from across a range of vendors. Not only do those apps and shells not span devices, they rarely even span across computing devices within any one vendor. We believe that the next generation of Shell experiences can build on the web and the growing prevalence of HTML5 to deliver ubiquitous accessibility and complete customizability of our everyday computing experiences.

So why WinJS? Because we also believe that WinJS provides a unique opportunity to build a platform for webapps. While Microsoft's implementation is constrained to Windows devices, we believe that it will bring with it an army of Windows 8 client developers, and further legitimize HTML/JS as a 'real' rich client development language.  By rewriting WinJS from the ground up, bluesky enables those developers to quickly and easily - and hopefully with just one click - bring their native Win8 apps to the web and increase their addressable market many times over.

This all leads to the bluesky Portal, which can look like the Win8 start menu, the iOS home page, or even the MSDOS shell if command line is your thing.  They’re all just wrappers around your apps; and the idea of a completely customizable portal that provides universal access to those apps has great appeal to us.


##Contact
- Email: jeffsim@bluesky.io (Jeff Simon)
- Follow: http://twitter.com/blueskydotio

## License
[MPL 2.0] (http://mozilla.org/MPL/2.0/)
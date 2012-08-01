// ================================================================
//
// WinJS.UI.Pages
//
//		This is the root WinJS.UI.Pages namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770584.aspx
//
WinJS.Namespace.define("WinJS.UI.Pages", {

	// ================================================================
	//
	// public function: WinJS.UI.Pages.render
	//
	//		Loads, processes, and renders the subpage at pageUri.  Added to DOM element 'targetElement'.  state field
	//		contains options.  parentedPromise is fulfilled by caller when the html that we return has been added to the DOM - at
	//		that point we can call 'ready' on the page.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770580.aspx
	//		NOTE: Documentation at the link above is out of date/incorrect.
	//
	render: function (pageUri, targetElement, state, parentedPromise) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.render: Undefined or null pageUri specified");
		if (!targetElement)
			console.error("WinJS.UI.Pages.render: Undefined or null targetElement specified");
		/*ENDDEBUG*/

		// Get the PageControl constructor for the specified Uri.  This will define the page if it does not yet exist
		var pageConstructor = this.get(pageUri);

		// Create the new page control.  Note that the page is not necessarily rendered (or even loaded) at this point.
		var pageControl = new pageConstructor(targetElement, state, null, parentedPromise);

		// Render a promise that is fulfilled when rendering is complete.
		return pageControl.renderPromise;
	},


	// ================================================================
	//
	// public function: WinJS.UI.Pages.get
	//
	//		Gets an already-defined page control for the specifed Uri, or creates a new one
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770586.aspx
	//
	get: function (pageUri) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.get: Undefined or null pageUri specified");
		/*ENDDEBUG*/

		// Get the page constructor for the specified Url
		var pageConstructor = WinJS.UI.Pages.registeredPages[pageUri.toLowerCase()];

		// If the page constructor doesn't exist, then define it now
		pageConstructor = pageConstructor || WinJS.UI.Pages.define(pageUri);

		// Return the page constructor for the specified url.
		return pageConstructor;
	},


	// ================================================================
	//
	// public function: WinJS.UI.Pages.define
	//
	//		Defines a new Page and returns a PageControl
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770579.aspx
	//
	define: function (pageUri, members) {

		/*DEBUG*/
		// Parameter validation
		if (!pageUri)
			console.error("WinJS.UI.Pages.define: Undefined or null pageUri specified");
		/*ENDDEBUG*/

		// Check to see if an existing definition (keyed on the pageUrI) already exists, and use it if so.
		var existingDefn = this.registeredPages[pageUri.toLowerCase()];
		if (existingDefn) {
			var pageControl = existingDefn;
		}
		else {
			var pageControl = WinJS.Class.define(function (targetElement, state, complete, parentedPromise) {

				/*DEBUG*/
				// Parameter validation
				if (!targetElement)
					console.error("WinJS.UI.Pages.PageControl constructor: Undefined or null targetElement specified");
				/*ENDDEBUG*/

				// this is called when the page should be instantiated and its html realized.  Do so now.
				var page = WinJS.UI.Pages.registeredPages[pageUri.toLowerCase()];
				var that = this;

				if (parentedPromise) {
					// When parenting has completed, trigger the subpage's ready function.  The function that called render()
					// is responsible for triggering the parented promise that it passed in.
					parentedPromise.then(function () {
						// TODO: verify proper order of operations here.
						if (that["ready"])
							that["ready"](targetElement, state);
						if (that["updateLayout"])
							that["updateLayout"](targetElement, state, null);
						if (that["processed"])
							that["processed"](targetElement, state);
					});
				}

				// First load the page; then when that's done, process it.  Return a promise that this will happen.  Caller then chains on that promise.
				this.renderPromise = this._loadPage({ Uri: pageUri, targetElement: targetElement })
                            .then(function (result) {
                            	return that._processPage(result);
                            });

				// if caller didn't specify a parented promise, then handle calling ready (et al) ourselves.
				// TODO: Clean this up with the above similar (inverted) block.
				if (!parentedPromise)
					this.renderPromise = this.renderPromise.then(function (result) {
						return new WinJS.Promise(function (onComplete) {
							// TODO: verify proper order of operations here.
							if (that["ready"])
								that["ready"](targetElement, state);
							if (that["updateLayout"])
								that["updateLayout"](targetElement, state, null);
							if (that["processed"])
								that["processed"](targetElement, state);
							onComplete(result);
						});
					})
			}, {

				// ================================================================
				//
				// private function: PageControl._loadPage
				//
				//		Internal function to load a page.  Will support both cached and remote pages.  Returns a Promise 
				//		so that the caller can be notified when we're done via then().
				//
				_loadPage: function (pageInfo) {

					/*DEBUG*/
					// Parameter validation
					if (!pageInfo)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageInfo specified");
					/*ENDDEBUG*/

					var that = this;

					// Create and return a Promise that we'll load the page.
					// NOTE: We could merge _getRemotePage into this function as this function is currently doing nothing;
					//		 however, this two-step process is in preparation for adding support for cached pages later on.
					return new WinJS.Promise(function (pageLoadCompletedCallback) {

						// TODO: Add cached file support.
						var fileIsCached = false;

						if (fileIsCached) {
							// return cached file
						} else {
							// Load the page remotely
							that._getRemotePage(pageInfo, pageLoadCompletedCallback);
						}
					});
				},

				
				// ================================================================
				//
				// private function: PageControl._getRemotePage
				//
				//		Internal function to load a page remotely via Ajax.
				//
				_getRemotePage: function (pageInfo, pageLoadCompletedCallback) {

					/*DEBUG*/
					// Parameter validation
					if (!pageInfo)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageInfo specified");
					if (!pageLoadCompletedCallback)
						console.error("WinJS.UI.PageControl._loadPage: Undefined or null pageLoadCompletedCallback specified");
					/*ENDDEBUG*/

					// Use Ajax to get the page's contents
					// TODO: Use WinJS.xhr when that's implemented
					$.get(pageInfo.Uri, function (response) {

						// We loaded the page
						// TODO: error handling
						pageInfo.response = response;

						// Notify that we've fulfilled our Promise to load the page.
						pageLoadCompletedCallback(pageInfo);
					});
				},


				// ================================================================
				//
				// private function: PageControl._processPage
				//
				//		Internal function to process a page; async since css processing can take an indeterminate amount of time.  This function returns 
				//		a Promise so that the caller can be notified when we're done via then().
				//
				_processPage: function (pageInfo) {

					/*DEBUG*/
					// Parameter validation
					if (!pageInfo)
						console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo specified");
					if (!pageInfo.response)
						console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo.response specified", pageInfo);
					if (!pageInfo.targetElement)
						console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo.targetElement specified", pageInfo);
					/*ENDDEBUG*/

					// Return a Promise that we'll process the page (Honestly! We will!)
					return new WinJS.Promise(function (pageProcessCompletedCallback) {

						// TODO: The entirety of this function makes my skin crawl.

						// Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
						// because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
						// sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
						// $("<div></div>").html(pageInfo.response) won't work for the above reason.

						// 1. Create the temporary DOM element ourselves and assign its HTML to the subpage's html
						var tempDiv = document.createElement("div");
						tempDiv.innerHTML = pageInfo.response;

						// 2. NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage
						var $response = $(tempDiv);
						$("script", document).each(function (index, element) {
							// TODO: this is case sensitive, so "test.js" and "Test.js" will not match.
							$("script[src='" + element.attributes["src"].value + "']", $response).remove();
						});

						// TODO: convert links to scripts?  See <LINK REL="stylesheet" HREF="http://ha.ckers.org/xss.css">

						// Remove WinJS scripts.
						// TODO: rather than do this on every page process (slow), do it on publish
						// TODO: Note that, once I commented this out, some apps started failing; the reason was because those apps had references to //microsoft/winjs.*,
						// and the presence of those references makes the css checks below fail because numNewStyleSheets are never fully loaded,
						// so it never makes it out of the loop. This will repro with any 'invalid' script or style reference.  See comment below.  
						$("link[href^='//Microsoft'], link[href^='//microsoft']", $response).remove();
						$("script[src^='http://Microsoft'], script[src^='http://microsoft']", $response).remove();

						// Replace contents of targetElement with loaded page's html
						var $newPage = $(pageInfo.targetElement);
						$newPage.addClass("pagecontrol");

						// Hide the page until we've loaded style sheets
						$newPage.hide();

						$newPage.append($response.html());

						// Track the number of styleSheets before the subpage is loaded.  We will need to wait below until
						// we're sure that these pages have been completely parsed before we call the subpage's ready() function.
						var numStyleSheetsBeforeSubpageAdded = document.styleSheets.length;

						// Do some parsing on the subpage...
						// 1. Move meta and title tags to page's <head> element
						var $head = $("head", document);
						$("meta, title", $newPage).prependTo($head);

						// 2. Move scripts and styles up into the page's <head> element
						// TODO: remove any duplicates
						$("link, script", $newPage).appendTo($head);

						// 3. Remove duplicate styles
						blueskyUtils.removeDuplicateElements("style", "src", $head);

						// 4. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
						$("title:not(:first)", $head).remove();

						// Process the wincontrols in the newly loaded page fragment
						WinJS.UI.processAll($newPage[0]);

						// Win8 likes to add all DOM elements with Ids to the global namespace.  Add all of the loaded Page's id'ed DOM elements now.
						$("[id]").each(function (index, element) {
							window[element.id] = element;
						});

						// Calculate how many styles the subpage has added.  We will wait below until they are all loaded.
						var numNewStyleSheets = document.styleSheets.length - numStyleSheetsBeforeSubpageAdded;

						// If the subpage has referenced CSS files, those files may or may not yet be parsed; to ensure that they are before
						// the subpage's ready function is called, we set up a timer that every 100 milliseconds checks to see if the CSS Files have
						// all been parsed and their rules have been added to document.styleSheets.  If so, then we stop the timer and tell the subpage
						// to go for it.  Lacking a "cssHasBeenParsed" notification, this is the best we can do.
						var timeSpent = 0;

						var handle = window.setInterval(function () {

							// Determine how many of the styles have been loaded and parsed.  The browser (well, FF - need to verify against others)
							// immediately adds the stylesheet, but it doesn't set cssRules until they're parsed; thus, check if cssRules is defined
							// for all newly loaded styles.
							// TODO: This isn't quite sufficient on FF; see http://dev.ckeditor.com/ticket/7784
							// TODO: This also doesn't appear to work on iPad; need another solution...
							var numStylesParsed = 0;
							try {
								for (var i = 0; i < numNewStyleSheets; i++) {
									if (document.styleSheets[numStyleSheetsBeforeSubpageAdded + i].cssRules != undefined)
										numStylesParsed++;
								}
							} catch (ex) {
								// TODO: silently catch, ignore, and continue.  See if this works...    
							}

							// TODO: find best solution here - see TODO comment above.  if this is the only solution, then make timeOut changable by app
							timeSpent += 100;
							if (timeSpent > 2000) {
								console.error("Failed to load all style sheets and/or scripts; check network log and ensure all stylesheets are valid.");
								numStylesParsed = numNewStyleSheets;
							}

							// Check to see if we've parsed all of the new style sheets
							if (numStylesParsed == numNewStyleSheets) {

								// The page's style sheets have all been loaded. Stop the interval timer
								window.clearTimeout(handle);

								// Show the page with final style sheets
								$newPage.show();

								// Notify that we've fulfilled our Promise to process the page.
								pageProcessCompletedCallback(pageInfo);
							}
						}, 100);
					});
				},

				// renderPromise: A Promise that is fulfilled when we have completed rendering
				renderPromise: null
			});
		}

		// Add members to the page control constructor
		pageControl = WinJS.Class.mix(pageControl, members);

		// Register the page control constructor for subsequent calls to WinJS.UI.Pages.get and WinJS.UI.Pages.define
		// TODO: I'm assuming that "helloWorld.html" is the same page as "HelloWORLD.hTML", but should check that Win8 agrees...
		this.registeredPages[pageUri.toLowerCase()] = pageControl;

		// Return the new page control constructor
		return pageControl;
	},


	// registeredPages: A map that associates pageUris with page constructor functions
	registeredPages: []
});
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
		/*ENDDEBUG*/

		// Create a placeholder element if no target was specified
		targetElement = targetElement || $("<div></div>")[0];

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
	_renderingPage: null,
	_renderingSubpages: [],
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

						// We can't call processAll on the loaded page until it's been parented (so that styles can 'find' it in the DOM).
						return WinJS.UI.processAll(targetElement);

					}).then(function () {
						// If this is the top level "rendering page", then wait until all subpage renderPromises have been fulfilled before we tell anyone that we're done.
						// TODO: This should actually work recursively, where a subpage waits on its subpages.
						if (that == WinJS.UI.Pages._renderingPage && WinJS.UI.Pages._renderingSubpages.length > 0)
							return WinJS.Promise.join(WinJS.UI.Pages._renderingSubpages);

					}).then(function () {
						WinJS.UI.Pages._renderingPage = null;
						if (that.ready)
							that.ready(targetElement, state);
						if (that.updateLayout)
							that.updateLayout(targetElement, state, null);
						if (that.processed)
							that.processed(targetElement, state);
					});
				}

				// Create a promise to load the specified Uri into the specifie targetElement
				var loadedAndInited = this._loadPage({
					Uri: pageUri,
					element: targetElement
				}).then(function (pageInfo) {

					// After loading, process the page
					return that._processPage(pageInfo);

				}).then(function (pageInfo) {

					// After processing the page, call the page's "init" function (if any)
					return new WinJS.Promise(function (c) {

						if (that.init)
							that.init(targetElement, state);
						c(pageInfo);
					});
				});

				// Fulfill our elementReady promise after the page has been loaded AND init'ed
				this.elementReady = loadedAndInited.then(function () {
					return targetElement;
				});

				// After the page is loaded is init'ed, process it.  Return a promise that this will happen.  Caller then chains on that promise.
				// TODO: Diff between this and elementReady?
				this.renderPromise = loadedAndInited.then(function (result) {
					return result;
				});

				if (WinJS.UI.Pages._renderingPage) {
					// We're already rendering a page; that page (or one of its subpages) must have a subpage.  We will want to wait on all subpage rendering prior to informing complation
					WinJS.UI.Pages._renderingSubpages.push(this.renderPromise);
				} else {
					WinJS.UI.Pages._renderingPage = this;
					WinJS.UI.Pages._renderingSubpages = [];
				}

				// if caller didn't specify a parented promise, then handle calling ready (et al) ourselves.
				// TODO: Clean this up with the above similar (inverted) block.
				if (!parentedPromise) {
					this.renderPromise = this.renderPromise.then(function (result) {
						// We can't call processAll on the loaded page until it's been parented (so that styles can 'find' it in the DOM).
						return WinJS.UI.processAll(targetElement);

					}).then(function () {
						// If this is the top level "rendering page", then wait until all subpage renderPromises have been fulfilled before we tell anyone that we're done.
						// TODO: This should actually work recursively, where a subpage waits on its subpages.
						if (that == WinJS.UI.Pages._renderingPage && WinJS.UI.Pages._renderingSubpages.length > 0)
							return WinJS.Promise.join(WinJS.UI.Pages._renderingSubpages);

					}).then(function () {
						WinJS.UI.Pages._renderingPage = null;
						if (that["ready"])
							that["ready"](targetElement, state);
						if (that["updateLayout"])
							that["updateLayout"](targetElement, state, null);
						if (that["processed"])
							that["processed"](targetElement, state);
					})
				}
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
					if (!pageInfo.element)
						console.error("WinJS.UI.PageControl._processPage: Undefined or null pageInfo.element specified", pageInfo);
					/*ENDDEBUG*/

					// At this point, pageInfo.element == targetElement and pageInfo.response contains the 
					// text HTML response obtained from pageUri.

					// Return a Promise that we'll process the page (Honestly! We will!)
					return new WinJS.Promise(function (pageProcessCompletedCallback) {

						// Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
						// because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
						// sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
						// $("<div></div>").html(pageInfo.response) won't work for the above reason.

						// Also note: Per http://molily.de/weblog/domcontentloaded, HTML5 requires browsers to defer execution of scripts until
						// all previous stylesheets are loaded.  So, we need to rearrange scripts and styles from the loaded page so that styles come before scripts.
						// This does inject a nontrivial perf hit, but its unavoidable given the need to have styles parsed before scripts reference them (e.g. WinControl sizes).  In order 
						// to minimize the perf hit somewhat, we push all scripts to the bottom of the page and styles to the top (see rules 5 and 6 here:http://stevesouders.com/hpws/rules.php)
						// TODO: If this is a problem for a subset of apps, then provide a "WinJS.Bluesky.deferScripts" option and set it to optout.
						// TODO: How to do this to root page?  Probably just warn user? 

						// Create the temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
						// BTW: I *heart* John Resig: http://ejohn.org/blog/dom-documentfragments/
						// TODO (PERF): Doing this with jQuery to get the 'contents' function. Need to refactor using document.createElement("div")
						var tempDiv = $("<div></div>");
						tempDiv[0].innerHTML = pageInfo.response;

						// Create the temporary DOM fragment and copy the page's contents into it
						var tempDocument = document.createDocumentFragment();
						tempDiv.contents().get().forEach(function (child) {
							tempDocument.appendChild(child);
						});

						// AT THIS POINT: 
						//	1. tempDocument contains all of the contents of the loaded page as valid DOM element
						//	2. None of the scripts or styles (local or referenced) have been loaded or executed yet

						// NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage before
						//we actually 'realize' the script (to avoid duplicate scripts from being executed once in the root doc and once again in the loaded page).
						//
						// Note: Need to use visiblity:hidden/display:block so that any child element's dimensions are realized (e.g. listitems in a listview).
						var $newPage = $(tempDiv);//.css({ 'position': 'absolute', 'visibility': 'hidden', 'display': 'block' });

						// Add the contents from the temporary document to our new div
						// NOTE: This will NOT execute any scripts in $newPage.
						$newPage.append(tempDocument);

						// For each script in the main document, remove any duplicates in the new page.
						// TODO: this approach is case sensitive, so "test.js" and "Test.js" will not match.  What's the jQuery way to say "case insensitive"?
						$("script", document).each(function (index, element) {
							$("script[src='" + element.attributes["src"].value + "']", $newPage).remove();
						});

						// Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
						$("link[href^='//Microsoft'], link[href^='//microsoft']", $newPage).remove();
						$("script[src^='http://Microsoft'], script[src^='http://microsoft'], script[src^='//Microsoft'], script[src^='//microsoft']", $newPage).remove();

						// AT THIS POINT: 
						//	1. The loaded page is ready to be appended to the target element
						//	2. None of the loaded page's scripts have been executed, nor have its externally referenced scripts or styles been loaded.  

						// Prep the target element to insert the new page.
						var $target = $(pageInfo.element);
						$target.addClass("pagecontrol");

						// Do some parsing on the subpage...
						// A. Move various tags up to the page's <head> element.  Also move styles
						// TODO (PERF): Grab $("head") once and make it available in blueskyUtils._$head (or somesuch) for internal use only.
						var $head = $("head", document);

						// Move styles first so that they're there when we move scripts.  Also; prepend the styles so they appear first
						$("meta, title, link, style", $newPage).prependTo($head);

						// B. Remove duplicate styles and meta/charset tags
						blueskyUtils.removeDuplicateElements("style", "src", $head);
						blueskyUtils.removeDuplicateElements("meta", "charset", $head);

						// C. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
						$("title:not(:first)", $head).remove();

						// move any scripts out of $newPage and into a temporary list so that we can process them independently
						//		var $newPageScripts = $("script", $newPage).remove();

						// Add the new page's contents to the element (note: use contents instead of children to get text elements as well)
						$target.append($newPage.contents());

						// AT THIS POINT: 
						//	1. $target contains all of the elements from the loaded page.
						//	2. $target may or may not be placed within the DOM, so ELEMENTS WITHIN $target MAY HAVE INVALID DIMENSIONS/STYLES.
						//  3. All styles from the loaded page have been moved up to the page's head, but possibly not yet parsed into document.styleSheets
						//	4. No scripts (local or referenced) within the loaded page have been loaded or executed.

						// Win8 likes to add all DOM elements with Ids to the global namespace.  Add all of the loaded Page's id'ed DOM elements now.
						$("[id]", $target).each(function (index, element) {
							window[element.id] = element;
						});

						//	$newPageScripts.appendTo($head);

						// We *can't quite* call WinJS.UI.processAll on the loaded page, since it has not yet been parented.  So: just return and
						// wait for the parentedPromise to be fulfilled...

						pageProcessCompletedCallback(pageInfo);
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
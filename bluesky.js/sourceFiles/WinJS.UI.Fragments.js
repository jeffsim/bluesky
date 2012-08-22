// ================================================================
//
// WinJS.UI.Fragments
//
//		This is the root WinJS.UI.Fragments namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229781.aspx
//
WinJS.Namespace.define("WinJS.UI.Fragments", {

	// ================================================================
	//
	// public function: WinJS.UI.Fragments.render
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701605.aspx
	//
	render: function (href, element) {

		return WinJS.UI.Fragments._render(href, element, false);
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.renderCopy
	//
	//		MSDN: TODO
	//
	renderCopy: function (href, element) {

		return WinJS.UI.Fragments._render(href, element, true);
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._render
	//
	_render: function (href, element, addToCache) {

		// If already in the cache then just return the current page.  
		if (this._cacheStore[href])
			return this._getDocumentFragmentFromCache(href, element);

		// Load (and process) the fragment into the specified DOM element
		return this._loadAndProcessHrefIntoDocumentFragment(href).then(function (docFrag) {

			// At this point, docFrag contains the contents of the page at "href" (and scripts/styles have been moved up into the head).
			// If caller specifed an element, then move the document fragment into it and return the element; otherwise just return the fragment

			if (addToCache)
				WinJS.UI.Fragments._cacheStore[href] = docFrag.cloneNode(true);

			if (!element)
				return docFrag;

			element.appendChild(docFrag);

			return element;
		});
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._loadAndProcessHrefIntoDocumentFragment
	//
	_loadAndProcessHrefIntoDocumentFragment: function (href) {

		var that = this;
		return new WinJS.Promise(function (fragmentLoadedCallback) {

			// TODO: Use WinJS.xhr when that's implemented
			// TODO: Error handling

			// First, load the fragment's text
			$.get(href, function (response) {

				// Second, Process the loaded page into a document fragment
				that._processFragment(response).then(function (docFrag) {

					// Third, Notify listeners that the fragment has been loaded (and processed) into a document fragment
					fragmentLoadedCallback(docFrag);
				});
			});
		});
	},


	// TODO: Make Page.render use Fragment.render.


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._processFragment
	//
	_processFragment: function (fragmentText) {

		return new WinJS.Promise(function (fragmentProcessedCallback) {

			// Create a temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
			// TODO (PERF): Doing this with jQuery to get the 'contents' function. Need to refactor using document.createElement("div") et al
			var tempDiv = $("<div></div>");
			tempDiv[0].innerHTML = fragmentText;

			// Create the document fragment and copy the page's contents into it
			var docFrag = document.createDocumentFragment();
			tempDiv.contents().get().forEach(function (child) {
				docFrag.appendChild(child);
			});

			// AT THIS POINT: 
			//	1. docFrag contains the contents of the loaded fragment as DOM elements
			//	2. None of the scripts or styles (local or referenced) have been loaded or executed yet, nor moved out of the fragment

			// Move styles out of the document fragment and into the page's head.  Don't add duplicates. Move styles first so that
			// they're there when we move scripts.  Also; prepend the styles so they appear first
			var styleNodesToMove = [];
			var $head = $("head");

			for (var i in docFrag.childNodes) {
				var childNode = docFrag.childNodes[i];
				if (childNode.nodeName == "STYLE" || (childNode.nodeName == "LINK" && childNode.attributes.getNamedItem("rel").nodeValue == "stylesheet")) {

					styleNodesToMove.push(childNode);
				}
			}

			styleNodesToMove.forEach(function (styleNodeToMove) {

				// Remove the style node from the document fragment in preparation for adding it to the document's head.
				docFrag.removeChild(styleNodeToMove);

				// Only add the style to the document's head if it's not a duplicate
				var href = styleNodeToMove.attributes.getNamedItem("href");
				var isDuplicateStyle = href && ($("link[href='" + href.nodeValue + "']", $head).length > 0);

				// Remove WinJS styles from the loaded fragment.  Technically not necessary, but good for combination win8/web projects.
				// TODO (PERF): Possibly worth pulling this out for perf.
				var isMicrosoftStyle = href && href.nodeValue.toLowerCase().indexOf("//microsoft") == 0;

				if (!isDuplicateStyle && !isMicrosoftStyle) {
					// Add the style node to the head
					$head.prepend(styleNodeToMove);

					// Track moved nodes for test purposes (allowing us to subsequently remove them from $head)
					WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.push(styleNodeToMove);
				}
			});

			// AT THIS POINT: 
			//	1. The loaded fragment's styles have been moved up to the head and are ready to be parsed.  They may not actually be parsed
			//	yet due to how HTML5 handles styles.  
			//	2. We have removed any duplicate styles from the loaded fragment
			//	3. None of the loaded fragment's scripts have been moved out of the fragment nor have they been executed

			// Move scripts from the document fragment up to document head, but don't execute them.
			var scriptNodesToMove = [];
			for (var i in docFrag.childNodes) {
				var childNode = docFrag.childNodes[i];
				if (childNode.nodeName == "SCRIPT") {

					scriptNodesToMove.push(childNode);
				}
			}

			scriptNodesToMove.forEach(function (scriptNodeToMove) {

				// Remove the script node from the document fragment in preparation for adding it to the document's head.
				docFrag.removeChild(scriptNodeToMove);

				// Only add the script to the document's head if it's not a duplicate
				var src = scriptNodeToMove.attributes.getNamedItem("src");
				var isDuplicateScript = src && ($("script[src='" + src.nodeValue + "']", $head).length > 0);

				// Remove WinJS scripts and styles from the loaded fragment.  Technically not necessary, but good for combination win8/web projects.
				// TODO (PERF): Possibly worth pulling this out for perf.
				var isMicrosoftScript = src && src.nodeValue.toLowerCase().indexOf("//microsoft") == 0;

				if (!isDuplicateScript && !isMicrosoftScript) {

					// Add the script node to the head and execute it
					// TODO (CLEANUP):	Hmm, this is a bit tricky here.  Based on how Win8 appears to work,
					//					I believe that we want to execute the scripts we're appending to head.
					//					However, jQuery's '$head.append(scriptNodeToMove)' executes the script
					//					but doesn't actually put it into the head element.  On the other hand,
					//					document.head.appendChild(scriptNodeToMove); puts it in head, but 
					//					doesn't execute it (d'oh!).  There may be another option that gives us
					//					both, but for now jQuery's appears to work right, although the script
					//					isn't actually visible in the DOM. hm...
					$head.append(scriptNodeToMove);

					// Track moved nodes for test purposes (allowing us to subsequently remove them)
					WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.push(scriptNodeToMove);
				}
			});

			// Notify listeners  that the fragment has been processed.
			fragmentProcessedCallback(docFrag);
		});
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._getDocumentFragmentFromCache
	//
	//		Return a promise that we'll return the docfrag that corresponds to the specified href
	//		Caller is responsible for ensuring presence in the cache.
	//
	_getDocumentFragmentFromCache: function (href, element) {

		var docFrag = this._cacheStore[href].cloneNode(true);
		return new WinJS.Promise(function (c) {
			if (!element) {
				c(docFrag);
			} else {
				element.appendChild(docFrag);
				c(element);
			}
		});
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.cache
	//
	//		MSDN: TODO
	//
	cache: function (href) {
		var that = this;

		// If already in the cache then just return the current page.  
		if (this._cacheStore[href])
			return this._getDocumentFragmentFromCache(href);

		return this._loadAndProcessHrefIntoDocumentFragment(href).then(function (docFrag) {

			return new WinJS.Promise(function (fragmentCachedPromise) {

				// Add the loaded item to the page cache
				that._cacheStore[href] = docFrag;

				// Notify that we've fulfilled our Promise to load the page.
				fragmentCachedPromise(docFrag);
			});
		});
	},


	// ================================================================
	//
	// public function: WinJS.UI.Fragments.clearCache
	//
	//		MSDN: TODO
	//
	clearCache: function (href) {
		if (this._cacheStore[href])
			this._cacheStore[href] = null;
	},


	// ================================================================
	//
	// private function: WinJS.UI.Fragments._testSupportRemoveScriptsAndStyles
	//
	_testSupportMovedScriptsAndStyles: [],
	_testSupportRemoveScriptsAndStyles: function () {
		WinJS.UI.Fragments._testSupportMovedScriptsAndStyles.forEach(function (node) {
			$(node).remove();
		});
		WinJS.UI.Fragments._testSupportMovedScriptsAndStyles = [];
	},


	// ================================================================
	//
	// private property: WinJS.UI.Fragments._cacheStore
	//
	//		Set of previously cached pages.  _cacheStore[href] = documentFragment
	//
	_cacheStore: []
});
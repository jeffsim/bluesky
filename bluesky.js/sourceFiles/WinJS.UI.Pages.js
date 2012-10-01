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

        pageUri = this._normalizeUrl(pageUri);

        // Get the page constructor for the specified Url
        var pageConstructor = WinJS.UI.Pages.registeredPages[pageUri];

        // If the page constructor doesn't exist, then define it now
        pageConstructor = pageConstructor || WinJS.UI.Pages.define(pageUri);

        // Return the page constructor for the specified url.
        return pageConstructor;
    },


    // ================================================================
    //
    // private function: WinJS.UI.Pages._normalizeUrl
    //
    //		Normalizes the URL to be lowercase and always include host.
    //
    _normalizeUrl: function (pageUri) {

        pageUri = pageUri.toLowerCase();

        // Always include host
        if (pageUri.indexOf("http:") != 0) {
            var slash = pageUri[0] == "/" ? "" : "/";
            pageUri = "http://" + document.location.host + slash + pageUri
        }

        return pageUri;
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

        pageUri = this._normalizeUrl(pageUri);

        // Check to see if an existing definition (keyed on the pageUrI) already exists, and use it if so.
        var existingDefn = this.registeredPages[pageUri];
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
                var page = WinJS.UI.Pages.registeredPages[pageUri.toLowerCase()];   // TODO (CLEANUP): Remove this
                var that = this;
                targetElement.winControl = this;

                if (parentedPromise) {
                    // When parenting has completed, trigger the subpage's ready function.  The function that called render()
                    // is responsible for triggering the parented promise that it passed in.
                    parentedPromise.then(function () {

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

                    return that._appendScripts(pageUri).then(function () {
                        return result;
                    });
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
                // private function: PageControl._appendScripts
                //
                //		Adds a collection of scripts to the page; returns a promise that is fulfilled when all scripts
                //      have been loaded and processed.  NOTE: The approach below is adopted (rather than just appending them
                //      via $.append) because it allows complete debugging in Firebug.  Trust me, this is a good thing.
                //
                _appendScripts: function (pageUri) {
                    var that = this;
                    return new WinJS.Promise(function (scriptsLoaded) {

                        // Track how many scripts we have to load; when *all* of them have completed loading, fulfill
                        // the scriptsLoaded promise.  
                        // TODO: Will this never fulfill if script fails to load (e.g. 404)?
                        var toLoad = 0;

                        // unload previous pages' scripts (if any)
                        // TODO (CLEANUP): Move this elsewhere
                        WinJS.UI.Pages._curPageScripts.forEach(function (src) {
                            $("script[src='" + src + "']").remove();
                        });
                        WinJS.UI.Pages._curPageScripts = [];

                        that.newPageScripts.forEach(function (element) {
                            var script = document.createElement("script");
                            script.type = "text/javascript";
                            if (element.attributes.src) {
                                var src = element.attributes.src.value;
                                toLoad++;

                                // Change local script paths to absolute
                                if (src[0] != "/" && src.toLowerCase().indexOf("http:") != 0) {
                                    var thisPagePath = pageUri.substr(0, pageUri.lastIndexOf("/") + 1);
                                    src = thisPagePath + src;
                                }

                                // Add a timestamp to force a clean load
                                var char = src.indexOf("?") == -1 ? "?" : "&";
                                src += char + "_bsid=" + Date.now() + Math.floor((Math.random() * 1000000));

                                // track all loaded scripts so that we can unload them on next page navigation
                                WinJS.UI.Pages._curPageScripts.push(src);

                                script.src = src;
                                // TODO (CLEANUP): Change to use lazyload
                                script.onload = function () {
                                    if (--toLoad == 0)
                                        scriptsLoaded();
                                }
                            }
                            else
                                script.innerText = element.innerText;

                            document.head.appendChild(script);
                        });

                        // If no scripts to load, then fulfill the Promise now
                        if (toLoad == 0) {
                            scriptsLoaded();
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

                    // Add a timestamp to force a clean load
                    var char = pageInfo.Uri.indexOf("?") == -1 ? "?" : "&";
                    var uniquePage = pageInfo.Uri + char + "_bsid=" + Date.now() + Math.floor((Math.random() * 1000000));

                    // Use Ajax to get the page's contents
                    // TODO: Use WinJS.xhr when that's implemented
                    $.get(uniquePage, function (response) {

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

                    // TODO (PERF): Grab $("head") once and make it available in blueskyUtils._$head (or somesuch) for internal use only.
                    var $head = $("head", document);

                    // At this point, pageInfo.element == targetElement and pageInfo.response contains the 
                    // text HTML response obtained from pageUri.
                    var that = this;
                    // Return a Promise that we'll process the page (Honestly! We will!)
                    return new WinJS.Promise(function (pageProcessCompletedCallback) {

                        // Parse out the script tags from the response and remove duplicates.  Note that we can't go directly through jQuery for this
                        // because jQuery automatically evals the scripts, but we need to remove them before they get eval'ed.  *However*, we can
                        // sidestep that by (1) creating the DOM element ourselves, and then (2) wrapping that temp element in jQuery.  Note that
                        // $("<div></div>").html(pageInfo.response) won't work for the above reason.

                        // replace ms-appx:/// with root /
                        pageInfo.response = pageInfo.response.replace(/ms-appx:\/\/\//gi, "/")

                        // Also note: Per http://molily.de/weblog/domcontentloaded, HTML5 requires browsers to defer execution of scripts until
                        // all previous stylesheets are loaded.  So, we need to rearrange scripts and styles from the loaded page so that styles come before scripts.
                        // This does inject a nontrivial perf hit, but its unavoidable given the need to have styles parsed before scripts reference them (e.g. WinControl sizes).  In order 
                        // to minimize the perf hit somewhat, we push all scripts to the bottom of the page and styles to the top (see rules 5 and 6 here:http://stevesouders.com/hpws/rules.php)
                        // TODO: If this is a problem for a subset of apps, then provide a "WinJS.Bluesky.deferScripts" option and set it to optout.
                        // TODO: How to do this to root page?  Probably just warn user? 

                        // Create the temporary DOM element ourselves and assign its HTML to the subpage's html.  Do this instead of appendChild to keep the scripts.
                        // see: http://stackoverflow.com/questions/7738046/what-for-to-use-document-implementation-createhtmldocument
                        var tempDocument = document.implementation.createHTMLDocument("newPage").body;
                        tempDocument.innerHTML = pageInfo.response;

                        // AT THIS POINT: 
                        //	1. tempDocument contains all of the contents of the loaded page as valid DOM element
                        //	2. None of the scripts or styles (local or referenced) have been loaded or executed yet

                        // Keep track of all styles; we'll wait until they've loaded
                        var stylesToWaitFor = [];

                        // get the list of scripts and link that are already in the document; we'll use that list to remove any duplicates from the new page
                        var $existingScripts = $("script", document);
                        var $existingLinks = $("links", document);

                        that.newPageScripts = [];

                        // Process elements
                        var nodesToRemove = [];
                        for (var i = 0; i < tempDocument.childNodes.length; i++) {

                            var element = tempDocument.childNodes[i];
                            if (element.nodeName == "SCRIPT" && element.attributes && element.attributes.src) {
                                var scriptSrc = element.attributes.src.value.toLowerCase();

                                // remove any scripts which are already in the document
                                $existingScripts.each(function (i, script) {
                                    if (script.attributes.src)
                                        if (scriptSrc == script.attributes.src.value.toLowerCase())
                                            nodesToRemove.push(element);
                                });

                                // Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
                                if (scriptSrc.indexOf("//microsoft.winjs") > -1)
                                    nodesToRemove.push(element);
                            }
                            if (element.nodeName == "LINK" && element.attributes && element.attributes.href) {
                                var linkSrc = element.attributes.href.value;

                                // remove any links which are already in the document
                                $existingLinks.each(function (i, existingLink) {
                                    if (linkSrc == existingLink.attributes.src.value.toLowerCase())
                                        nodesToRemove.push(element);
                                });


                                // Remove WinJS scripts and styles from the new page.  Technically not necessary, possibly worth pulling out for perf.
                                if (linkSrc.indexOf("//microsoft.winjs") > -1)
                                    nodesToRemove.push(element);
                            }
                        }

                        // Remove nodes that were identified as duplicates or otherwise unwanted
                        nodesToRemove.forEach(function (element) {
                            tempDocument.removeChild(element);
                        });

                        // Pull out all scripts; we'll add them in separately
                        var scripts = [];
                        for (var i = 0; i < tempDocument.childNodes.length; i++) {
                            var element = tempDocument.childNodes[i];
                            if (element.nodeName == "SCRIPT") {

                                scripts.push(element);
                                that.newPageScripts.push(element);
                            }
                        }
                        scripts.forEach(function (script) {
                            tempDocument.removeChild(script);
                        });

                        // NOW we can wrap the subpage's HTML in jQuery and then step over all scripts in the main page; remove any duplicates from the subpage before
                        // we actually 'realize' the script (to avoid duplicate scripts from being executed once in the root doc and once again in the loaded page).
                        var $newPage = $(tempDocument);

                        // AT THIS POINT: 
                        //	1. The loaded page is ready to be appended to the target element
                        //	2. None of the loaded page's scripts have been executed, nor have its externally referenced scripts or styles been loaded.  

                        // Keep track of all link'ed styles; we'll wait until they've loaded
                        $("link", $newPage).each(function (i, style) {
                            if (style.readyState != 'complete' && style.readyState != 'loaded') {

                                // Change local paths to absolute path
                                var linkSrc = style.attributes.href.value;
                                if (linkSrc[0] != "/" && linkSrc.toLowerCase().indexOf("http:") != 0) {
                                    var thisPagePath = pageInfo.Uri.substr(0, pageInfo.Uri.lastIndexOf("/") + 1);
                                    style.href = thisPagePath + linkSrc;
                                }

                                // Create a promise that we'll wait until the style has been loaded
                                stylesToWaitFor.push(getStyleLoadedPromise(style));
                            }
                        });

                        // move styles, links, and meta/title from the new page into the target element
                        var $stylePrependPoint = $head;
                        $("meta, title, link, style", $head).each(function (i, tag) {
                            $stylePrependPoint = $(tag);
                        });
                        $stylePrependPoint.after($("link, style", $newPage));
                        $("meta, title", $newPage).prependTo($head);

                        // B. Remove duplicate styles and meta/charset tags
                        blueskyUtils.removeDuplicateElements("meta", "charset", $head);
                        blueskyUtils.removeDuplicateElements("link", "href", $head);

                        // C. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
                        $("title:not(:first)", $head).remove();

                        // move any scripts out of $newPage and into a temporary list so that we can process them independently
                        //    that.$newPageScripts = $("script", $newPage).remove();
                        // Add the new page's contents to the element (note: use contents instead of children to get text elements as well)
                        var $target = $("<div class='pagecontrol'></div>");//$(pageInfo.element);
                        $target.append($newPage.contents());

                        // AT THIS POINT: 
                        //	1. $target contains all of the elements from the loaded page.
                        //	2. $target may or may not be placed within the DOM, so ELEMENTS WITHIN $target MAY HAVE INVALID DIMENSIONS/STYLES.
                        //  3. All styles from the loaded page have been moved up to the page's head, but possibly not yet parsed into document.styleSheets
                        //	4. No scripts (local or referenced) within the loaded page have been loaded or executed.

                        // Wait until all of the styles have been loaded...
                        WinJS.Promise.join(stylesToWaitFor).then(function () {

                            // Now that the new pages styles, which we previously moved into the document head, are loaded, append the rest
                            // of the new page to the document.
                            $target.appendTo($(pageInfo.element));

                            // Modern browsers like to add all DOM elements with Ids to the global namespace.  See this link for back-story: http://stackoverflow.com/questions/3434278/ie-chrome-are-dom-tree-elements-global-variables-here
                            // The *problem* is that Firefox (as of v15) does it at a later point than IE (after the page is fully loaded).  SO: We need
                            // to go ahead and forcibly inject all id'ed elements into the DOM now so that scripts on the same page don't break due to unexpectedly missing global
                            // id'ed elements.  Thanks again, IE, for making this necessary! *grimace*
                            // TODO (CLEANUP): I can constrain to $target since default.html is handled elsewhere
                            $("[id]").each(function (index, element) {
                                try {
                                    window[element.id] = element;
                                } catch (e) {
                                }
                            });

                            // We *can't quite* call WinJS.UI.processAll on the loaded page, since it has not yet been parented.  So: just return and
                            // wait for the parentedPromise to be fulfilled...
                            pageProcessCompletedCallback(pageInfo);
                        });
                    });
                },

                // renderPromise: A Promise that is fulfilled when we have completed rendering
                renderPromise: null,
                newPageScripts: null
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
    registeredPages: [],

    // _curPageScripts: The set of scripts on the currently loaded page.
    // TODO: Rationalize this with WinJS.UI.Fragments (Which can also load scripts)
    _curPageScripts: []
});
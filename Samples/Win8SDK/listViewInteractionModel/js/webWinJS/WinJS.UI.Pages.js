"use strict";
var xxd,xxe;
// ================================================================
//
// WinJS.Pages
//
// This is the root WinJS.Pages namespace/object
WinJS.UI.Pages = WinJS.UI.Pages || {

    // ================================================================
    //
    // WinJS.UI.Pages.define
    //
    // Defines a new Page.
    define: function (pageName, members) {

        // Track the set of member functions for a particular page.  This allows us to (for instance) call page.ready() later
        this.registeredPages[pageName] = members;
    },


    // ================================================================
    //
    // WinJS.UI.Pages._loadPage
    //
    // Internal function to load a page via Ajax.  Returns a Promise so that the caller can be notified when we're done via then().
    _loadPage: function (pageInfo) {

        // Create and return a Promise that we'll load the page.
        return new WinJS.Promise(function (pageLoadCompletedCallback) {

            // Use Ajax to get the page's contents
            $.get(pageInfo.Uri, function (response) {

                // We loaded the page
                // tbd: error handling
                pageInfo.response = response;

                // Notify that we've fulfilled our Promise to load the page.
                pageLoadCompletedCallback(pageInfo);
            });
        });
    },


    // ================================================================
    //
    // WinJS.UI.Pages._processPage
    //
    // Internal function to process a page; async since css processing can take an indeterminate amount of time.  This function returns 
    // a Promise so that the caller can be notified when we're done via then().
    _processPage: function (pageInfo) {

        return new WinJS.Promise(function (pageProcessCompletedCallback) {

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
                // tbd: this is case sensitive, so "test.js" and "Test.js" will not match.
                $("script[src='" + element.attributes["src"].value + "']", $response).remove();
            });

            // Replace WinJS scripts with webWinJS scripts
            $("link[href^='//Microsoft'], link[href^='//microsoft']", $response).remove();
            $("script[src^='http://Microsoft'], script[src^='http://microsoft']", $response).remove();
            xxd = $response;

            $("[id]").each(function (index, element) {
                window[element.id] = element;
            });

            // Replace contents of contentHost with loaded page's html
            var $newPage = $(pageInfo.targetElement);
            $newPage.addClass("pagecontrol");
            $newPage.append($response.children(0));

            // Track the number of styleSheets before the subpage is loaded.  We will need to wait below until
            // we're sure that these pages have been completely parsed before we call the subpage's ready() function.
            var numStyleSheetsBeforeSubpageAdded = document.styleSheets.length;

            // Do some parsing on the subpage...
            // 1. Move meta and title tags to page's <head> element
            var $head = $("head", document);
            $("meta, title", $newPage).prependTo($head);

            // 2. Move scripts and styles up into the page's <head> element
            // tbd: remove any duplicates
            $("link, script", $newPage).appendTo($head);

            // 3. Remove duplicate styles
            webWinJS.Utilities.removeDuplicateElements("style", "src", $head);

            // 4. Remove duplicate title strings; if the subpage specified one then it's now the first one, so remove all > 1
            $("title:not(:first)", $head).remove();

            // Process the wincontrols in the newly loaded page fragment
            WinJS.UI.processAll($newPage[0]);

            // Check how many styles the subpage has added.  We will wait below until they are all loaded.
            var numNewStyleSheets = document.styleSheets.length - numStyleSheetsBeforeSubpageAdded;

            // If the subpage has referenced CSS files, those files may or may not yet be parsed; to ensure that they are before
            // the subpage's ready function is called, we set up a timer that every 100 milliseconds checks to see if the CSS Files have
            // all been parsed and their rules have been added to document.styleSheets.  If so, then we stop the timer and tell the subpage
            // to go for it.  Lacking a "cssHasBeenParsed" notification, this is the best we can do.
            var handle = window.setInterval(function () {

                // Determine how many of the styles have been loaded and parsed.  The browser (well, FF - need to verify against others)
                // immediately adds the stylesheet, but it doesn't set cssRules until they're parsed; thus, check if cssRules is defined
                // for all newly loaded styles.
                var numStylesParsed = 0;
                for (var i = 0; i < numNewStyleSheets; i++) {
                    if (document.styleSheets[numStyleSheetsBeforeSubpageAdded + i].cssRules != undefined)
                        numStylesParsed++;
                }

                // Check to see if we've parsed all of the new style sheets
                if (numStylesParsed == numNewStyleSheets) {

                    // The page's style sheets have all been loaded. Stop the interval timer
                    window.clearTimeout(handle);

                    // Notify that we've fulfilled our Promise to process the page.
                    pageProcessCompletedCallback(pageInfo);
                }
            }, 100);
        });
    },


    // ================================================================
    //
    // WinJS.UI.Pages.render
    //
    // Loads, processes, and renders the subpage at pageUri.  Added to DOM element 'targetElement'.  state field
    // contains options.  parentedPromise is fulfilled by caller when the html that we return has been added to the DOM - at
    // that point we can call 'ready' on the page.
    render: function (pageUri, targetElement, state, parentedPromise) {

        // When parenting has completed, trigger the subpage's ready function.  The function that called render()
        // is responsible for triggering the parented promise that it passed in.
        parentedPromise.then(function () {
            var page = WinJS.UI.Pages.registeredPages[pageUri];
            page["ready"](targetElement, state);
            if (page["updateLayout"])
                page["updateLayout"](targetElement, state, null);
        });

        // First load the page; then when that's done, process it.  Return a promise that this will happen.  Caller then chains on that promise.
        return this._loadPage({ Uri: pageUri, targetElement: targetElement })
                    .then(function (result) { return WinJS.UI.Pages._processPage(result); });
    },


    // registeredPages: A map that ties page name (string) to member functions
    registeredPages: []
}
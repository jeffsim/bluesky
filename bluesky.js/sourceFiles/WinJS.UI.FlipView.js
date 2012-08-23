// ================================================================
//
// WinJS.UI.FlipView
//
//		Implementation of the WinJS.UI.FlipView object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211711.aspx
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.FlipView
    //
    FlipView: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.FlipView constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211707.aspx
		//
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.FlipView constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Set any options that were specified.
            if (options) {
                if (options.orientation)
                    this.orientation = options.orientation.toLowerCase();
                if (options.itemSpacing)
                    this.itemSpacing = options.itemSpacing;
                if (options.itemDataSource)
                    this.itemDataSource = eval(options.itemDataSource);
                if (options.itemTemplate)
                    this.itemTemplate = document.getElementById(options.itemTemplate);
                if (options.currentPage)
                    this.currentPage = options.currentPage;
            }

            // Start on the first page; yield first to allow caller to finish setup
            var that = this;
            msSetImmediate(function () {
                if (that.currentPage == -1)
                    that.currentPage = 0;
            });
        },

		// ================================================================
		// WinJS.UI.FlipView Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private Function: WinJS.UI.FlipView._doRender
            //
            //		Called when the control should "render" itself to the page.  This is considered a private
            //		function because callers should have called our BaseControl's "render()" function, which
            //		manages batching render calls for us.
            //
            _doRender: function () {

                // Ensure we're fully set up.
                if (!this.itemDataSource && !this.itemTemplate)
                    return;

                /*DEBUG*/
                if (this.itemDataSource.getCount === undefined) {
                    console.log("FlipView.itemDataSource is not a databound object.  Wrap it with WinJS.Binding first.", this, this._itemDataSource);
                    return;
                }
                /*ENDDEBUG*/

                // TODO: Do DOM element generation once, and then do subsequent renders by updating classes (etc) instead of rerendering the entire control.

                // Start by clearing out our root element from previous renders and making it look like a FlipView control to our styles
                this.$rootElement
					.empty()
        			.addClass("win-flipview")
        			.attr("role", "listbox")
        			.css("overflow", "hidden");
                this._items = [];

                // Set item container dimensions to match the rootElement's dimensions (which the FlipView control requires be set)
                var width = this.$rootElement.outerWidth();
                var height = this.$rootElement.outerHeight();

                var $container = $("<div style='width:100%;height:100%;position:relative;z-index: 0;'></div>");

                $container.append($('<div tabindex="0" aria-hidden="true"></div>'));

                // Add nav buttons
                // TODO: Are there symbols we can use for left/right and up/down?
                if (this.orientation == "horizontal") {
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navleft" aria-hidden="true" style="display:none; z-index: 1000; font-weight:800" type="button">&lt;</button>'));
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navright" aria-hidden="false" style=" display:none;z-index: 1000; font-weight:800" type="button">&gt;</button>'));
                } else {
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navtop" aria-hidden="true" style="display:none; z-index: 1000; font-weight:800" type="button">^</button>'));
                    $container.append($('<button tabindex="-1" class="win-navbutton win-navbottom" aria-hidden="false" style=" display:none;z-index: 1000; font-weight:800" type="button">v</button>'));
                }

                $container.append($('<div tabindex="0"></div>'));

                // render items in the FlipView
                var $surface = $('<div class="win-surface" role="group" style="width: 100%; height: 100%; position: relative;">');
                this.$itemsContainer = $("<div style='width:100%;height:100%;position:relative;'></div>");

                for (var i = 0; i < this.itemDataSource._list.length ; i++) {
                    var item = this.itemDataSource._list.getItem(i);
                    var $itemContainer = $("<div style='width: " + width + "px; height: " + height + "px; position: absolute;'></div>").hide();
                    var $subContainer;

                    // If the specified itemTemplate variable is a function, then call it to get the fully realized HTML; otherwise,
                    // we'll do the templatization ourseles through WinJS.Binding.processAll.
                    if (typeof this.itemTemplate !== "function") {

                        $subContainer = $("<div class='win-item'></div>");

                        // Get the templatized HTML that we'll populate. 
                        var templateInstance = $(this.itemTemplate)
												 .clone()		// Clone it so that we don't modify the original template
												 .addClass("win-template")	// tell our styles it's a template
                                                 .removeAttr("data-win-control") // remove the data-win-control attribute
												 .show()[0];	// Show the instance we'll populate

                        // Give the cloned element a unique identifier
                        blueskyUtils.setDOMElementUniqueId(templateInstance);

                        // Let WinJS binding do all the heavy lifting for us.
                        WinJS.Binding.processAll(templateInstance, item.data);

                        // Append the fully realized HTML to the list.
                        $subContainer.append(templateInstance);

                    } else {
                        // The itemTemplate object that the user specified is a function; that function is responsible
                        // for generating the fully realized HTML for an item.  Pass the function the next item now

                        // Create the DIV into which the item will be rendered
                        $subContainer = document.createElement("div");
                        $subContainer.className = "win-template";

                        // Create the promise that will be fulfilled when the item's data is ready
                        var index = this._curItemIndex;
                        var itemDataPromise = new WinJS.Promise(function (c, e, p) {
                            c({
                                data: item.data, index: index
                            });
                        });

                        // Wait until the item ('s data) is ready, and then...
                        var that = this;
                        itemDataPromise.then(function (item) {

                            // Render the item's data using the itemTemplate function, and then...
                            return that.itemTemplate(itemDataPromise);

                        }).then(function (element) {

                            // TODO: What do I do with renderPromise?  Do I fulfill it?
                            if (element.element)
                                element = element.element;

                            // Append the rendered item to our container (which was added to the DOM earlier)
                            $subContainer.appendChild(element);
                        });
                    }

                    $itemContainer.append($subContainer);
                    this.$itemsContainer.append($itemContainer);

                    // Store a list of items (DOM elements) in the FlipView
                    this._items[i] = $itemContainer;
                }

                // Add the tree of DOM elements to our root element
                $surface.append(this.$itemsContainer);
                $container.append($surface);
                this.$rootElement.append($container);

                // Add previous/next button handlers
                var that = this;
                $(".win-navleft, .win-navtop", this.$rootElement).click(function () {
                    that.previous();
                });
                $(".win-navright, .win-navbottom", this.$rootElement).click(function () {
                    that.next();
                });

                // Make the current page visible
                // TODO: Do I still need these two lines?
                if (typeof this.currentPage === "undefined" || this.currentPage == -1)
                    this.currentPage = 0;
                this._makePageVisible(this._currentPage);
            },


            // ================================================================
            //
            // public property: WinJS.FlipView.orientation
            //
            //		TODO: MSDN
            //
            _orientation: "horizontal",
            orientation: {
                get: function () {
                    return this._orientation;
                },
                set: function (value) {
                    this._orientation = value;

                    // For simplicity, force a full relayout.
                    // TODO: Instead of regenerating everything, swap classes.  Can't (easily) do that at the moment
                    // since each button has content; I could do css content munging, but I need to revisit this anyways
                    // to use real symbols instead of [<,>,v,^].
                    this.render(true);
                }
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageCompleted
            //
            _notifyPageCompleted: function (pageElement, eventData) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pagecompleted", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyDataSourceCountChanged
            //
            _notifyDataSourceCountChanged: function (pageElement, eventData) {

                // TODO-CLEANUP: Merge all of these _notify*** functions into one function and just call it.
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("datasourcecountchanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageSelected
            //
            _notifyPageSelected: function (pageElement, eventData) {

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pageselected", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.FlipView._notifyPageVisibilityChanged
            //
            _notifyPageVisibilityChanged: function (pageElement, eventData) {

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("pagevisibilitychanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.ondatasourcecountchanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211705.aspx
            //
            ondatasourcecountchanged: {
                 
                get: function () {
                    // Return the tracked hander (if any)
                    return this._ondatasourcecountchanged;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._ondatasourcecountchanged)
                		this.removeEventListener("datasourcecountchanged", this._ondatasourcecountchanged);

                    // track the specified handler for this.get
                    this._ondatasourcecountchanged = callback;
                    this.addEventListener("datasourcecountchanged", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagecompleted
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh965332.aspx
            //
            onpagecompleted: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpagecompleted;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpagecompleted)
                		this.removeEventListener("pagecompleted", this._onpagecompleted);

                    // track the specified handler for this.get
                    this._onpagecompleted = callback;
                    this.addEventListener("pagecompleted", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpageselected
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211713.aspx
            //
            onpageselected: {
                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpageselected;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpageselected)
                		this.removeEventListener("pageselected", this._onpageselected);

                    // track the specified handler for this.get
                    this._onpageselected = callback;
                    this.addEventListener("pageselected", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.FlipView.onpagevisibilitychanged
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211714.aspx
            //
            onpagevisibilitychanged: {
                get: function () {
                    // Return the tracked hander (if any)
                    return this._onpagevisibilitychanged;
                },

                set: function (callback) {
                	// Remove previous on* handler if one was specified
                	if (this._onpagevisibilitychanged)
                		this.removeEventListener("pagevisibilitychanged", this._onpagevisibilitychanged);

                	// track the specified handler for this.get
                    this._onpagevisibilitychanged = callback;
                    this.addEventListener("pagevisibilitychanged", callback);
                }
            },



            // ================================================================
            //
            // public function: WinJS.UI.FlipView.count
            //
            //		MSDN: TODO
            //
            count: function () {
                if (!this._itemDataSource)
                    return 0;

                var that = this;
                return new WinJS.Promise(function (c) {
                    c(that._itemDataSource._list.length);
                });
            },


            // ================================================================
            //
            // public function: WinJS.UI.FlipView.next
            //
            //		MSDN: TODO
            //
            next: function () {

                if (this.currentPage == this._items.length - 1)
                    return false;

                // TODO (CLEANUP): Combine previous, next, and set (lots of shared functionality)
                var pageIndex = this.currentPage + 1;

                this._makePageVisible(pageIndex);

                // Fade out the current page
                $(this._items[this._currentPage]).fadeOut("fast");

                // Notify listeners that the new page is visible
                var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                var incomingPage = $(".win-template", this._items[pageIndex])[0];
                this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });

                this._currentPage = pageIndex;

                // Notify listeners that the previous page is no longer visible
                this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                // Notify listeners that the page has been selected
                this._notifyPageSelected(incomingPage, { source: this.element });

                // Render the page; when done, notify listeners that the page has completed
                var that = this, offset;
                if (this.orientation == "horizontal")
                    offset = { top: "0px", left: "40px" };
                else
                    offset = { top: "40px", left: "0px" };

                var that = this;
                return WinJS.UI.Animation.enterContent([this._items[this._currentPage]], [offset]).then(function () {
                    that._notifyPageCompleted(incomingPage, { source: that.element });
                });
                return true;
            },


            // ================================================================
            //
            // public function: WinJS.UI.FlipView.previous
            //
            //		MSDN: TODO
            //
            previous: function () {
                if (this.currentPage == 0)
                    return false;

                // TODO (CLEANUP): Combine previous, next, and set (lots of shared functionality)
                var pageIndex = this.currentPage - 1;

                this._makePageVisible(pageIndex);

                // Fade out the current page
                $(this._items[this._currentPage]).fadeOut("fast");

                // Notify listeners that the new page is visible
                var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                var incomingPage = $(".win-template", this._items[pageIndex])[0];
                this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });

                this._currentPage = pageIndex;

                // Notify listeners that the previous page is no longer visible
                this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                // Notify listeners that the page has been selected
                this._notifyPageSelected(incomingPage, { source: this.element });

                // Render the page; when done, notify listeners that the page has completed
                var that = this, offset;
                if (this.orientation == "horizontal")
                    offset = { top: "0px", left: "-40px" };
                else
                    offset = { top: "-40px", left: "0px" };

                var that = this;
                return WinJS.UI.Animation.enterContent([this._items[this._currentPage]], [offset]).then(function () {
                    that._notifyPageCompleted(incomingPage, { source: that.element });
                });
                return true;
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.currentPage
            //
            //		MSDN: TODO
            //
            _currentPage: -1,   // use -1 to say "no page has been set yet" - checked in _makePageVisible
            currentPage: {
                get: function () {
                    return this._currentPage;
                },
                set: function (pageIndex) {

                	pageIndex = Math.max(pageIndex, 0);

                    if (this._currentPage == pageIndex)
                        return;
                    if (!this._itemDataSource || pageIndex >= this._itemDataSource.getCount())
                        return;
                    var that = this;

                    this._makePageVisible(pageIndex);

                    var outgoingPage = $(".win-template", this._items[this._currentPage])[0];
                    var incomingPage = $(".win-template", this._items[pageIndex])[0];

                    // Fade out the current page
                    if (outgoingPage) {
                        $(this._items[this._currentPage]).fadeOut("fast");
                        this._notifyPageVisibilityChanged(outgoingPage, { source: this.element, visible: true });
                    }

                    if (!incomingPage)
                        return;

                    this._currentPage = pageIndex;

                    // Notify listeners that the previous page is no longer visible
                    this._notifyPageVisibilityChanged(incomingPage, { source: this.element, visible: false });

                    // Notify listeners that the page has been selected
                    this._notifyPageSelected(incomingPage, { source: this.element });

                    // Render the page; when done, notify listeners that the page has completed
                    return new WinJS.Promise(function (onComplete) {
                        $(that._items[that._currentPage]).fadeIn("fast", function () {
                            that._notifyPageCompleted(incomingPage, { source: that.element });
                            onComplete();
                        });
                    });
                }
            },


            // ================================================================
            //
            // private property: WinJS.UI.FlipView._makePageVisible
            //
            //		Helper function to bring the specified page to the front and hide/show the nav buttons appropriately
            //
            _makePageVisible: function (pageIndex) {

                // If we don't know which page to make visible (read: pageIndex == -1) then just return
                if (pageIndex == -1)
                    return;

                // move the animating-in page to the top of the flipview's pagestack so that it's the visible one
                if (this._items.length > pageIndex)
                    this._items[pageIndex].remove().appendTo(this.$itemsContainer).show();
                if (pageIndex > 0)
                    $(".win-navleft, .win-navtop", this.$rootElement).show();
                else
                    $(".win-navleft, .win-navtop", this.$rootElement).hide();
                if (pageIndex < this._items.length - 1)
                    $(".win-navright, .win-navbottom", this.$rootElement).show();
                else
                    $(".win-navright, .win-navbottom", this.$rootElement).hide();
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.itemDataSource
            //
            //		MSDN: TODO
            //
            _itemDataSource: null,
            itemDataSource: {
                // itemDataSource.getter: Returns a reference to our current data source
                get: function () {
                    return this._itemDataSource;
                },

                // itemDataSource.setter: Used to set a new item data source
                set: function (newDataSource) {

                    var that = this;

                    // This event handler is called when an event that does not change our datasource count has occurred
                    var renderMe = function () {
                        that.render(true);
                        that.currentPage = Math.min(that._currentPage, that._itemDataSource._list.length - 1);
                    };

                    // This event handler is called when an event that changes our datasource count has occurred
                    var renderMeWithCountChange = function () {
                        that.render(true);
                        that.currentPage = Math.min(that._currentPage, that._itemDataSource._list.length - 1);
                        that._notifyDataSourceCountChanged(that.element);
                    };

                    // Unbind from previous list (if any)
                    if (this._itemDataSource && this._itemDataSource._list) {
                        this._itemDataSource._list.removeEventListener("itemremoved", renderMeWithCountChange);
                        this._itemDataSource._list.removeEventListener("iteminserted", renderMeWithCountChange);
                        this._itemDataSource._list.removeEventListener("itemchanged", renderMe);
                    }

                    var previousDataSource = this._itemDataSource;

                    // Store a reference to the new data source in our owning ListView
                    this._itemDataSource = newDataSource;

                    // Listen to changes to the list.
                    // TODO: Encapsulate all of this in the datasource object as "bindOnAnyChange"
                    this._itemDataSource._list.addEventListener("itemremoved", renderMeWithCountChange);
                    this._itemDataSource._list.addEventListener("iteminserted", renderMeWithCountChange);
                    this._itemDataSource._list.addEventListener("itemchanged", renderMe);

                    // Refresh our in-page appearance to show the new datasource's items.
                    this.render();
                    this.currentPage = Math.max(0, Math.min(this._currentPage, this._itemDataSource._list.length - 1));

                    // Fire count change
                    // TODO: Does Win8 fire this on datasource change, or just on item changes?
                    if (previousDataSource && newDataSource._list.length != previousDataSource._list.length)
                        this._notifyDataSourceCountChanged();
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.FlipView.itemTemplate
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700622.aspx
            //
            _itemTemplate: null,
            itemTemplate: {
                get: function () {
                    return this._itemTemplate;
                },

                set: function (newTemplate) {

                    this._itemTemplate = newTemplate;
                    this.render();
                }
            },


            // ================================================================
            //
            // private field: _items
            //
            //		The visible items (DOM elements) shown in the flipview
            //
            _items: [],


            // ================================================================
            //
            // private field:$itemsContainer
            //
            //		The div that holds the items in the flipview.
            //
            $itemsContainer: null
        })
});

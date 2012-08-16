// ================================================================
//
// WinJS.UI.ListView
//
//		Implementation of the WinJS.UI.ListView object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.ListView
    //
    ListView: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.ListView constructor
		//
		//		MSDN: TODO
		//
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.ListView constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Create our selection manager
            this.selection = new WinJS.UI.ISelection(this);

            // Set default options
            this.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
            this.swipeBehavior = WinJS.UI.SwipeBehavior.select;
            this.selectionMode = WinJS.UI.SelectionMode.multi;
            // Generate our layout definition object.
            // tbd: what's the right win8 default?
            if (options && options.layout && options.layout.type == "WinJS.UI.ListLayout")
                this.layout = new WinJS.UI.ListLayout(options && options.layout);
            else
                this.layout = new WinJS.UI.GridLayout(options && options.layout);

            this.items = [];

            // Track last selected item for shift-click multiselect.
            this._lastSelectedItemIndex = 0;

            // Set any options that were specified.
            if (options) {
                if (options.selectionMode)
                    this.selectionMode = options.selectionMode;
                if (options.tapBehavior)
                    this.tapBehavior = options.tapBehavior;
                if (options.swipeBehavior)
                    this.swipeBehavior = options.swipeBehavior
                if (options.itemDataSource)
                    this.itemDataSource = eval(options.itemDataSource);
                if (options.itemTemplate)
                    this.itemTemplate = document.getElementById(options.itemTemplate) || eval(options.itemTemplate);
                if (options.groupDataSource)
                    this.groupDataSource = eval(options.groupDataSource);
                if (options.groupHeaderTemplate)
                    this.groupHeaderTemplate = document.getElementById(options.groupHeaderTemplate) || eval(options.groupHeaderTemplate);
            }
        },

		// ================================================================
		// WinJS.UI.ListView Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private Function: WinJS.UI.ListView._doRender
            //
            //		Called when the control should "render" itself to the page.  This is considered a private
            //		function because callers should have called our BaseControl's "render()" function, which
            //		manages batching render calls for us.
            //
            //		TODOS:
            //			* I'm rendering the list twice initially.
            //			* Do DOM element generation once, and then do subsequent renders by updating classes (etc) instead of rerendering the entire control.
            //			* Implement virtualized data; as of now, if user fills list with 10k items then we render 10k items...
            //			* Hook up window resize
            //
            _doRender: function () {

                // Ensure we're fully set up.
                if (!this.itemDataSource || !this.itemTemplate)
                    return;

                /*DEBUG*/

                if (this._itemDataSource.getCount == undefined) {
                    console.error("ListView.itemDataSource is not a databound object.", this, this._itemDataSource);
                    return;
                }
                /*ENDDEBUG*/

                var $body = $("body");

                // Start by clearing out our root element from previous renders
                this.$rootElement.empty();

                // Create two DOM elements; a parent Viewport which is static and does not move, and a child surface which is large enough to
                // contain all items in the list.  Show the currently scrolled-to part of the list (child surface) in the viewport.
                var orientation = this.layout.horizontal ? "win-horizontal" : "win-vertical"
                var $viewportDiv = $("<div class='win-viewport " + orientation + "' role='group'></div>");
                var $surfaceDiv = $("<div class='win-surface'></div>");

                // The surface div has to be sized in order for the group header to obtain a valid size (see calculation of topY below).  Size the
                // surface div to match the viewport; we'll increase its size after we render all items and know the final size
                $surfaceDiv.css("height", this.$rootElement.innerHeight());
                $surfaceDiv.css("width", this.$rootElement.innerWidth());

                // Add the ListView's scrolling surface to the ListView's static (nonscrolling) viewport, and then add the 
                // listView's static viewpoint to the DOM
                $viewportDiv.append($surfaceDiv);
                this.$rootElement.append($viewportDiv);

                // Set our root element's position to relative so that list items can be absolutely positioned relative to the list
                // Also add roles and classes to make the listbox look like a Win8 listbox
                this.$rootElement
                    .css("position", "relative")
                    .attr("role", "listbox")
                    .addClass("win-listview");

                // Tag the root element with the win-groups class if this is a Grouped ListView.
                if (this._groupDataSource)
                    this.$rootElement.addClass("win-groups");

                // Get the list of items that we'll render.
                this.items = [];
                for (var i = 0; i < this.itemDataSource._list.length; i++)
                    this.items.push(this.itemDataSource._list.getItem(i));

                var that = this;

                // Render each list item, and store a Promise for each item; that Promise will be fulfilled when the item has been rendered as is
                // ready to be inserted into the visible DOM.  We will wait until all of these Promises are fulfilled.
                var renderPromises = [];
                if (typeof this.itemTemplate !== "function") {

                    // itemTemplate is not a function
                    this.items.forEach(function (item) {
                        that._renderItemTemplate(item);
                    });

                    // TODO: Possible bug in our Promise.join - doesn't work on empty array of Promises.  For now, just add an empty Promise
                    renderPromises.push(WinJS.Promise.as());

                } else {

                    // itemTemplate is a function; create a collection of render promises which we'll wait on below.
                    // TODO (PERF-MINOR): An itemTemplate function could return synchronously, in which case we're unnecessarily waiting on it as a Promise.
                    for (var i = 0; i < this.items.length; i++) {
                        renderPromises.push(this._getItemFunctionRenderPromise(this.items[i], i));
                    }
                }

                // Wait until all of the items have been rendered
                WinJS.Promise.join(renderPromises).then(function () {

                    // Set current rendering position to upper left corner of the list's surface
                    var renderCurX = 0, renderCurY = 0;

                    // Get the height of the space into which this List must fit.  We'll wrap when an item would go beyond this height.
                    var renderMaxY = that.$rootElement.innerHeight();

                    // Keep track of the width of the scrolling surface
                    var surfaceWidth = 0;

                    // Get groupInfo (if specified)
                    var groupInfo = that.layout.groupInfo && that.layout.groupInfo();

                    var currentGroupKey = null;

                    // Get the spacing to add between groups (if grouped view)
                    var groupSpacing;

                    var topY;

                    // Keep track of current row for maxRows comparison
                    var curRow = -1;

                    // Get the margin sizes around items
                    var templateMargins = that._getItemMargins();

                    var groupHeaderOnLeft = that.layout && that.layout.groupHeaderPosition == "left";

                    var listWidth = that.$rootElement.innerWidth();

                    // Add the rendered DOM elements to the DOM at the correct positions
                    for (var i = 0; i < that.items.length; i++) {
                        var item = that.items[i];

                        // TODO (PERF-MINOR): Wrap $itemElement on item creation to avoid rewrapping every time we render.
                        var $itemElement = $(item.element);

                        // Create the item container div for the current item, add the item's element to it, and place the
                        // itemcontainer in the listview's scrolling surface
                        var $thisItemContainer = $("<div class='win-container'></div>");
                        $thisItemContainer.append($itemElement);
                        $surfaceDiv.append($thisItemContainer);

                        // Get the dimensions of the item (force to width of list if not horizontal)
                        var itemWidth = that.layout.horizontal ? $itemElement.innerWidth() : listWidth;
                        var itemHeight = $itemElement.innerHeight();

                        // If cellspanning/groupinfo specified, then apply it now
                        if (groupInfo && groupInfo.enableCellSpanning) {

                            // NOTE: Since we use item dimensions already, we don't need to do anything for enableCellSpanning.
                            // TODO: Technically this breaks some edge cases - e.g. app has incorrectly (or inconsistently) sized items
                            //		 and is relying on groupInfo to set the right granularity for them.  I'll need to see some failure
                            //		 cases to fully understand the right solution here.
                            // TODO: Create some test cases with these edge case scenarios and see how Win8 handles them.
                        }

                        // If this is a grouped list and the item is in a different group than the previous item, then output a group header
                        // and jump to the next column
                        if (that._groupDataSource && item.groupKey != currentGroupKey) {

                            // Track the current group key so that we know when we switch to a new group
                            currentGroupKey = item.groupKey;

                            // Output the new group's header
                            // Clone the group header template, make it visible, and place it.
                            var $groupHeaderTemplate = $(that.groupHeaderTemplate)
								.clone()
								.addClass("win-groupheader")
								.show();
                            
                            // Give the cloned element a unique identifier
                            // TODO (CLEANUP): can I do this in Binding.processAll?
                            blueskyUtils.setDOMElementUniqueId($groupHeaderTemplate[0]);

                            // Perform data binding on the group header template
                            // TODO: Should use groupDataSource.itemFromKey - but that returns a Promise and I need to refactor this
                            //		 code to allow that to return asychronously...
                            WinJS.Binding.processAll($groupHeaderTemplate[0], that._groupDataSource._list.getItemFromKey(item.groupKey).data);

                            // Remove the data-win-control attribute after we've processed it.
                            // TODO (CLEANUP): Am I doing this after every call to processAll?  If so, move this into there.
                            $groupHeaderTemplate.removeAttr("data-win-control");

                            // Add the fully realized HTML for the group header to the ListView's DOM element.
                            $surfaceDiv.append($groupHeaderTemplate);

                            // Create the group's header
                            // TODO (CLEANUP): I can collapse a few lines of the following if/else...
                            if (groupHeaderOnLeft) {

                                // If we haven't gotten the width of the group header yet, then do so now.
                                if (topY === undefined) {
                                    topY = 0;

                                    // Spacing between groups is (apparently) based on the margins of the group header.
                                    // TODO: What about padding? border?
                                    groupSpacing = parseInt($groupHeaderTemplate.css("marginLeft")) +
												   $groupHeaderTemplate.outerWidth() +
												   parseInt($groupHeaderTemplate.css("marginRight"));

                                    surfaceWidth = groupSpacing;
                                } else
                                    surfaceWidth += groupSpacing;

                            } else {

                                // If we haven't gotten the height of the group header yet, then do so now.
                                if (topY === undefined) {
                                    topY = $groupHeaderTemplate.outerHeight();

                                    // Spacing between groups is (apparently) based on the left margin of the group header.
                                    // TODO: What about padding? border?
                                    groupSpacing = parseInt($groupHeaderTemplate.css("marginLeft"));

                                    surfaceWidth = groupSpacing;
                                } else
                                    surfaceWidth += groupSpacing;
                            }

                            // Start rendering items just below the group header
                            renderCurY = topY;
                            renderCurX = surfaceWidth;

                            // Keep track of current row for maxRows check
                            curRow = 0;

                            // Set the header's final position
                            $groupHeaderTemplate.css({
                                "position": "absolute",
                                "top": "0px",
                                "left": (renderCurX - groupSpacing) + "px"  // step back groupSpacing pixels to account for margin
                            });

                        } else {

                            if (topY === undefined)
                                topY = 0;
                            if (that.layout.horizontal) {
                                // If placing this item would extend beyond the maximum Y, then wrap to the next column instead.
                                // So the same if maxRows is specified and we're about to exceed it
                                if (renderCurY + itemHeight >= renderMaxY ||
									that.layout.maxRows && curRow == that.layout.maxRows - 1) {
                                    renderCurY = topY;
                                    renderCurX = surfaceWidth;
                                    curRow = 0;
                                } else
                                    curRow++;
                            }
                        }

                        $thisItemContainer.css({
                            "top": renderCurY,
                            "left": renderCurX,
                            "width": itemWidth,
                            "height": itemHeight
                        });

                        // Keep track of the width of the scrolling surface
                        surfaceWidth = Math.max(surfaceWidth, renderCurX + itemWidth + templateMargins.horizontal);

                        // Go to the next place to put the next item
                        renderCurY += itemHeight + templateMargins.vertical;


                        // store a reference to the item in the itemcontainer
                        $(".win-item", $thisItemContainer).data("itemIndex", i);

                        // If the user clicks on the item, call our oniteminvoked function
                        $(".win-item", $thisItemContainer).click(function () {

                            // Get the index of the clicked item container's item
                            var itemIndex = $(this).data("itemIndex");

                            // Call invoke
                            if ((that.tapBehavior != "none") && that.oniteminvoked != null) {

                                // Create a Promise with the clicked item
                                var promise = new WinJS.Promise(function (c) { c(that.items[itemIndex]); });

                                // Call the callback
                                that._notifyItemInvoked(this.parentNode, {
                                    itemIndex: itemIndex,
                                    itemPromise: promise
                                });
                            }

                            // Handle selection
                            if ((that.tapBehavior == "directSelect" || that.tapBehavior == "toggleSelect" ||
								blueskyUtils.shiftPressed || blueskyUtils.controlPressed) && (that.selectionMode != "none")) {

                                var $containerNode = $(this.parentNode)

                                // Check to see if user shift-clicked a collection of items
                                if (that.selectionMode == "multi" && blueskyUtils.shiftPressed) {
                                    var startIndex = Math.min(itemIndex, that._lastSelectedItemIndex);
                                    var endIndex = Math.max(itemIndex, that._lastSelectedItemIndex);
                                    var itemIndicesToSelect = [];
                                    for (var i = startIndex; i <= endIndex; i++)
                                        itemIndicesToSelect.push(i);
                                    that.selection.set(itemIndicesToSelect);
                                } else {
                                    if (that.tapBehavior == "directSelect") {

                                        // TODO: Does Win8 re-fire selection for already selected item?
                                        if (that.selectionMode == "multi" && blueskyUtils.controlPressed)
                                            that.selection.add(itemIndex);
                                        else
                                            that.selection.set(itemIndex);
                                    } else {
                                        if ($containerNode.hasClass("win-selected"))
                                            that.selection.remove(itemIndex);// remove selection
                                        else
                                            if (that.selectionMode == "multi" && blueskyUtils.controlPressed)
                                                that.selection.add(itemIndex);
                                            else
                                                that.selection.set(itemIndex);
                                    }
                                }

                                that._lastSelectedItemIndex = itemIndex;
                                that._notifySelectionChanged(that.element);
                            }
                        });
                    }

                    // Set the final width of the ListView's scrolling surface, and make it visible
                    $surfaceDiv.css("width", surfaceWidth).show();

                    // use enterContent to slide the list's items into view.  This slides them as one contiguous block (as win8 does).
                    WinJS.UI.Animation.enterContent([$surfaceDiv[0]]);
                });
            },


            // ================================================================
            //
            // private Function: WinJS.UI.ListView._getItemMargins
            //
            _getItemMargins: function () {

                // Next, calculate the margin that should be added around each list item's win-container DIV.  This is obtained
                // from the following css selector:     .win-listview > .win-horizontal .win-container
                // To do this, create an element in the DOM that matches that selector, and grab it's marginTop/marginBottom values.
                // TODO: Find a cleaner way of calculating this?
                var orientation = this.layout.horizontal ? "win-horizontal" : "win-vertical"
                var $container = $("<div class='win-listview'><div class='" + orientation + "'><div id='_cont1' class='win-container'></div></div></div>")
					.hide()
					.appendTo($("body"));

                // Now that we have a matching element in the DOM, get it's margin values.  Since the css is returned as "#px", we need to strip the 'px'
                var itemMargins = {
                    vertical: parseInt($("#_cont1").css("marginTop")) +
							  parseInt($("#_cont1").css("marginBottom")),
                    horizontal: parseInt($("#_cont1").css("marginLeft")) +
							  parseInt($("#_cont1").css("marginRight"))
                };

                // Clean up after ourselves and remove the element from the DOM.
                $container.remove();

                return itemMargins;
            },


            // ================================================================
            //
            // private Function: WinJS.UI.ListView._renderItemTemplate
            //
            _renderItemTemplate: function (item) {

                // Get the templatized HTML that we'll populate.  Clone it so that we don't modify the original
                // template, add the 'win-item' class, remove the data-win-control attribute, and then show it
                item.element = $(this.itemTemplate)
					.clone()
					.addClass("win-item")
                    .removeAttr("data-win-control")
					.show()[0];

                // Give the cloned element a unique identifier
                blueskyUtils.setDOMElementUniqueId(item.element);

                // Let WinJS binding do all the heavy lifting for us.
                WinJS.Binding.processAll(item.element, item.data);
            },


            // ================================================================
            //
            // private Function: WinJS.UI.ListView._getItemFunctionRenderPromise
            //
            //		Return a promise that we will render the specified item.  The item's DOM element will be returned in item.element.
            //
            _getItemFunctionRenderPromise: function (item, curItemIndex) {

                var that = this;
                return new WinJS.Promise(function (onComplete) {

                    // Create the promise that will be fulfilled when the item's data is ready
                    var itemDataPromise = new WinJS.Promise(function (c, e, p) {
                        c({
                            data: item.data, index: curItemIndex
                        });
                    });

                    // Wait until the item's data is ready, and then...
                    return itemDataPromise.then(function (item) {
                        // Render the item's data using the itemTemplate function, and then...
                        return that.itemTemplate(itemDataPromise);

                    }).then(function (element) {

                        // TODO: Wait on renderPromise (if specified)
                        if (element.element)
                            element = element.element;

                        // Append the rendered item to our container (which was added to the DOM earlier)
                        item.element = element;

                        // Give the cloned element a unique identifier
                        if (!$(item.element).attr("id"))
                            blueskyUtils.setDOMElementUniqueId(item.element);

                        // Get the size of the item from the item's element.
                        // TODO (PERF): Avoid the jQuery wrapper here.
                        var $itemElement = $(item.element);
                        item.elementWidth = $itemElement.outerWidth();
                        item.elementHeight = $itemElement.outerHeight();

                        // Tag the item's element with win-item
                        $itemElement.addClass("win-item");

                        onComplete();
                    });
                });
            },


            // _itemDataSource: The private reference to the data bound source to which we're listening and rendering.  Accessed via this.itemDataSoucce.
            _itemDataSource: null,
            itemDataSource: {
                // itemDataSource.getter: Returns a reference to the current data source in our owning ListView
                get: function () {
                    return this._itemDataSource;
                },

                // itemDataSource.setter: Used to set a new item data source
                set: function (newDataSource) {

                    var that = this;

                    // This event handler is called when an event that does not change our datasource count has occurred
                    var renderMe = function () {
                        // TODO: leaving this wrapper in case I need to send events; if not, then just bind to render.
                        that.render(true);
                    };

                    // Unbind from previous list (if any)
                    if (this._itemDataSource && this._itemDataSource._list) {
                        this._itemDataSource._list.removeEventListener("itemremoved", renderMe);
                        this._itemDataSource._list.removeEventListener("iteminserted", renderMe);
                        this._itemDataSource._list.removeEventListener("itemchanged", renderMe);
                    }

                    // Store a reference to the new data source in our owning ListView
                    this._itemDataSource = newDataSource;

                    // Listen to changes to the list.
                    // TODO: Encapsulate all of this in the datasource object as "bindOnAnyChange"
                    this._itemDataSource._list.addEventListener("itemremoved", renderMe);
                    this._itemDataSource._list.addEventListener("iteminserted", renderMe);
                    this._itemDataSource._list.addEventListener("itemchanged", renderMe);

                    // Refresh our in-page appearance to show the new datasource's items.
                    this.render();
                }
            },


            // _groupDataSource: If this is non-null, then the ListView renders its items in a grouped UX, grouped by the groups defined in groupDataSource
            _groupDataSource: null,
            groupDataSource: {
                get: function () {
                    return this._groupDataSource;
                },

                // groupDataSource.setter: Used to set a new group data source
                set: function (newDataSource) {

                    var that = this;

                    // This event handler is called when an event that does not change our datasource count has occurred
                    var renderMe = function () {
                        // TODO: leaving this wrapper in case I need to send events; if not, then just bind to render.
                        that.render(true);
                    };

                    // Unbind from previous list (if any)
                    if (this._groupDataSource && this._groupDataSource._list) {
                        this._groupDataSource._list.removeEventListener("itemremoved", renderMe);
                        this._groupDataSource._list.removeEventListener("iteminserted", renderMe);
                        this._groupDataSource._list.removeEventListener("itemchanged", renderMe);
                    }

                    var previousGroupDataSource = this._groupDataSource;

                    // Store a reference to the new data source
                    this._groupDataSource = newDataSource;

                    if (this._groupDataSource && this._groupDataSource._list) {
                        // Listen to changes to the list.
                        this._groupDataSource._list.addEventListener("itemremoved", renderMe);
                        this._groupDataSource._list.addEventListener("iteminserted", renderMe);
                        this._groupDataSource._list.addEventListener("itemchanged", renderMe);
                    }

                    // Refresh our in-page appearance to show the new datasource's items.
                    this.render();
                }
            },


            // itemTemplate: A DOM element that contains the templatized HTML which we'll start with when rendering each
            // element in the list.  Note that this can also be a function which returns the fully realized HTML to use
            // for an element.
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

            _layout: null,
            layout: {
                get: function () {
                    return this._layout;
                },

                set: function (newLayout) {
                    if (newLayout instanceof WinJS.UI.ListLayout || newLayout instanceof WinJS.UI.GridLayout)
                        this._layout = newLayout;
                    else
                        this._layout = new WinJS.UI.GridLayout(newLayout);
                    this.render();
                }
            },


            // on Window resize, re-render ourselves
            // tbd-perf: consider batching these
            _windowResized: function (w, h) {
                // tbd: instead of re-rendering completely, should do a "movePosition"
                // tbd-perf: only relayout if size has changed at the listview items' size granularity
                //var anim = WinJS.UI.Animation.createRepositionAnimation(this._listItems);
                this.render();
                //anim.execute();
            },


            // ================================================================
            //
            // private function: WinJS.ListView._notifySelectionChanged
            //
            _notifySelectionChanged: function (pageElement) {

                // TODO: What to pass for data?
                var eventData = {};

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("selectionchanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.ListView._notifyItemInvoked
            //
            _notifyItemInvoked: function (pageElement, eventData) {

                // TODO: What to pass for data?
                var eventData = {};

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("iteminvoked", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // public event: WinJS.ListView.oniteminvoked
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211827.aspx
            //
            oniteminvoked: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._oniteminvoked;
                },

                set: function (callback) {
                    // track the specified handler for this.get
                    this._oniteminvoked = callback;
                    this.addEventListener("iteminvoked", callback);
                }
            },


            // ================================================================
            //
            // public event: WinJS.ListView.selectionchanged
            //
            //		MSDN: TODO
            //
            onselectionchanged: {

                get: function () {
                    // Return the tracked hander (if any)
                    return this._onselectionchanged;
                },

                set: function (callback) {
                    // track the specified handler for this.get
                    this._onselectionchanged = callback;
                    this.addEventListener("selectionchanged", callback);
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._selectionChanged
            //
            //		This is called by our selection manager when selection has been updated.  Update all
            //		of our items to display their current selected/unselected state.
            //
            _selectionChanged: function () {

                var that = this;
                this.items.forEach(function (item) {

                    var $containerNode = $(item.element.parentNode);
                    var itemWasSelected = $containerNode.hasClass("win-selected");
                    var itemIsNowSelected = that.selection._selectedItems.indexOf(item) >= 0;

                    if (itemWasSelected && !itemIsNowSelected) {

                        // remove selection
                        $containerNode.removeClass("win-selected");
                        $(".win-selectionbackground, .win-selectioncheckmarkbackground, .win-selectioncheckmark", $containerNode).remove();

                    } else if (!itemWasSelected && itemIsNowSelected) {

                            // add selection
                            // TODO (PERF-MINOR): Precreate and clone these DIVs
                        $containerNode.addClass("win-selected");
                        $(item.element).before($("<div class='win-selectionbackground'></div>"))
									   .after($("<div class='win-selectionbordercontainer'>" +
												"<div class='win-selectionborder win-selectionbordertop'></div>" +
												"<div class='win-selectionborder win-selectionborderright'></div>" +
												"<div class='win-selectionborder win-selectionborderbottom'></div>" +
												"<div class='win-selectionborder win-selectionborderleft'></div>" +
												"</div><div class='win-selectioncheckmarkbackground'></div><div class='win-selectioncheckmark'>X&nbsp;</div>"
										));
                    }
                });
            }

        })
});

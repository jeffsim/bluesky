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
                if (options.oniteminvoked)
                    this.oniteminvoked = eval(options.oniteminvoked);
            }

            this._disableAnimation = false;

            // We want to know when the browser is resized so that we can relayout our items.
            this._prevWidth = "";
            this._prevHeight = "";

            //window.addEventListener("resize", this._windowResized.bind(this));
            this.$rootElement.resize(this._windowResized.bind(this));

            // When we're removed from the DOM, unload ourselves
            this.$rootElement.bind("DOMNodeRemoved", this._unload);
        },

		// ================================================================
		// WinJS.UI.ListView Member functions
		// ================================================================

        {

            // ================================================================
            //
            // private function: WinJS.ListView._unload
            //
            _unload: function (event) {

                // This is called if the ListView OR an element in the ListView is removed; make sure it's the ListView
                if (event.target == this) {

                    // Remove our click listener from the appbar click eater
                    if (this.$rootElement) {
                        this.$rootElement.unbind("resize", this._windowResized);
                        this.$rootElement.unbind("DOMNodeRemoved", this._unload);
                    }
                }
            },


            // ================================================================
            //
            // private event: WinJS.ListView._windowResized
            //
            //		Called when the browser window is resized; resize ourselves
            //
            _windowResized: function (eventData) {

                // TODO (HACK):  I'm not unbinding listviews' resize callbacks, so we get here for elements that aren't in the DOM.  Need to figure out the 
                // right way to unbind callbacks when controls are removed.
                if (!this.$rootElement.closest("html").length)
                    return;

                // Resize only if vert changed
                // TODO: I *think* this is valid; no broken scenarios come to mind.
                var newHeight = this.$rootElement.innerHeight();
                if (this._prevHeight == newHeight)
                    return;

                this._prevHeight = newHeight;

                // TODO (PERF): only relayout if size has changed at the listview items' size granularity
                var elements = [];
                this.items.forEach(function (item) {
                    elements.push(item.element.parentNode);
                });

                // Animate groupheaders too (if any)
                if (this.$_groupHeaders) {
                    this.$_groupHeaders.forEach(function ($header) {
                        elements.push($header[0]);
                    });
                }

                var that = this;

                // If a resize animation is already running then cancel it and we'll animate from the current mid-animated position
                if (that._resizeAnim) {
                    that._resizeAnim._cancel();
                }
                that._resizeAnim = WinJS.UI.Animation.createRepositionAnimation(elements);
                that._disableAnimation = true;
                that._positionItems(true);
                that._disableAnimation = false;
                that._resizeAnim.execute().then(function () {
                    that._resizeAnim = null;
                });
            },


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
                this.$viewport = $("<div class='win-viewport " + orientation + "' role='group'></div>");
                this.$scrollSurface = $("<div class='win-surface'></div>");

                // The surface div has to be sized in order for the group header to obtain a valid size (see calculation of topY below).  Size the
                // surface div to match the viewport; we'll increase its size after we render all items and know the final size
                //             this.$scrollSurface.css("height", this.$rootElement.innerHeight());
                //           this.$scrollSurface.css("width", this.$rootElement.innerWidth());

                // Add the ListView's scrolling surface to the ListView's static (nonscrolling) viewport, and then add the 
                // listView's static viewpoint to the DOM
                this.$viewport.append(this.$scrollSurface);
                this.$rootElement.append(this.$viewport);

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

                } else {

                    // itemTemplate is a function; create a collection of render promises which we'll wait on below.
                    // TODO (PERF-MINOR): An itemTemplate function could return synchronously, in which case we're unnecessarily waiting on it as a Promise.
                    for (var i = 0; i < this.items.length; i++) {
                        renderPromises.push(this._getItemFunctionRenderPromise(this.items[i], i));
                    }
                }

                // Wait until all of the items have been rendered and then position them
                WinJS.Promise.join(renderPromises).then(function () {

                    // Generate the containers (DOM elements) for the items
                    that._generateItems();

                    // Place the list items in their correct positions
                    that._positionItems();

                    //that.$viewport.height(that.$scrollSurface.height());
                    // TODO (CLEANUP): Resize events come in in unexpected ways.  I'm setting width/height here because currently we get a resize
                    // event on first render *after* we render, which causes us to reposition items twice.  That's on FF; I believe IE9 comes in with
                    // a different order for firing resize events...  This is marked as a TODO because I'm not 100% sure this won't break apps that
                    // rely on a resize event getting fired; also, I should look into forcibly firing a resize event on FF to normalize across browsers...
                    that._prevWidth = that.$rootElement.outerWidth();
                    that._prevHeight = that.$rootElement.outerHeight();
                });
            },


            // ================================================================
            //
            // private event: WinJS.ListView._generateItems
            //
            _generateItems: function () {

                if (this.items.length == 0)
                    return;
                // This should only happen when itemDataSource or groupDataSource changes (including first set).
                var that = this;

                // Get groupInfo (if specified)
                var groupInfo = that.layout.groupInfo && that.layout.groupInfo();

                var currentGroupKey = null;
                this.$_groupHeaders = [];

                // Generate containers for the list's items
                for (var i = 0; i < that.items.length; i++) {

                    var item = that.items[i];

                    // Wrap so that we don't re-wrap every time we position
                    item.$element = $(item.element);

                    // Create the item container div for the current item, add the item's element to it, and place the
                    // itemcontainer in the listview's scrolling surface
                    var $thisItemContainer = $("<div class='win-container'></div>");
                    $thisItemContainer.append(item.$element);
                    this.$scrollSurface.append($thisItemContainer);

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
                            .css({
                                "position": "absolute",
                                "top": "0px"
                            })
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
                        this.$scrollSurface.append($groupHeaderTemplate);

                        this.$_groupHeaders.push($groupHeaderTemplate);
                    }

                    // store a reference to the item in the itemcontainer
                    $(".win-item", $thisItemContainer).data("itemIndex", i);

                    // Handle right-click selection
                    $(".win-item", $thisItemContainer).bind("contextmenu", function (event) {
                        event.preventDefault();
                        if (that.selectionMode != "none") {

                            event.stopPropagation();

                            // Get the index of the right-clicked item
                            var itemIndex = $(this).data("itemIndex");

                            //that.selection.add(itemIndex);
                            var $containerNode = $(this.parentNode)

                            if ($containerNode.hasClass("win-selected"))
                                that.selection.remove(itemIndex);// remove selection
                            else
                                if (that.selectionMode == "multi")
                                    that.selection.add(itemIndex);
                                else
                                    that.selection.set(itemIndex);

                            that._lastSelectedItemIndex = itemIndex;
                        }
                    });

                    // show pointerUp/pointerDown animation - but only if item is templated (if a function, then
                    // caller is responsible for handling)
                    // TODO (R3): mousedown on item and then move away from the item; item should return to full size while
                    //            button remains pressed.  setCapture() proved to be a bit of a challenge to get working on
                    //            FF, so ignoring for R1/R2.
                    if (typeof this.itemTemplate !== "function") {

                        $(".win-item", $thisItemContainer).mousedown(function (event) {
                            WinJS.UI.Animation.pointerDown(this);
                            this.setCapture(false);
                        });

                        $(".win-item", $thisItemContainer).mouseup(function (event) {
                            WinJS.UI.Animation.pointerUp(this);
                            document.releaseCapture();
                        });
                    }

                    // If the user clicks on the item, call our oniteminvoked function
                    $(".win-item", $thisItemContainer).click(function () {

                        // Get the index of the clicked item container's item
                        var itemIndex = $(this).data("itemIndex");

                        // Track last tapped item for the semanticzoom _getCurrentItem helper function, since we don't have focus yet
                        // TODO: Remove this when we have keyboard focus support
                        that._currentItem = itemIndex;

                        // Call invoke
                        if (that.tapBehavior != "none") {
                            // TODO: Clean this up
                            if (!(that.tapBehavior == "invokeOnly" && blueskyUtils.shiftPressed || blueskyUtils.controlPressed)) {

                                // Create a Promise with the clicked item
                                var promise = new WinJS.Promise(function (c) {
                                    var data = WinJS.Binding._ListBase.copyItem(that.items[itemIndex]);
                                    data.index = itemIndex;
                                    c(data);
                                });

                                // Call the callback
                                that._notifyItemInvoked(this.parentNode, {
                                    itemIndex: itemIndex,
                                    itemPromise: promise
                                });
                            }
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
                                        if (that.selectionMode == "multi")
                                            that.selection.add(itemIndex);
                                        else
                                            that.selection.set(itemIndex);
                                }
                            }

                            that._lastSelectedItemIndex = itemIndex;
                            that._notifySelectionChanged(that.element);
                        }

                        // Semantic Zoom support
                        if (that._triggerZoom && that._isZoomedOut)
                            that._triggerZoom();
                    });
                }
            },


            // ================================================================
            //
            // private event: WinJS.ListView._positionItems
            //
            _positionItems: function (repositionDueToResize) {

                if (this.items.length == 0)
                    return;

                if (repositionDueToResize) {
                    // TODO (PERF): Do nothing if the current listview size is sufficiently equal to the previous size such that
                    // no repositioning occurs.  I'm assuming there's some check (@ item granularity size)...
                }

                // Set current rendering position to upper left corner of the list's surface
                var renderCurX = 0, renderCurY = 0;

                // Get the height of the space into which this List must fit.  We'll wrap when an item would go beyond this height.
                var renderMaxY = this.$scrollSurface.innerHeight();

                // Keep track of the width of the scrolling surface
                var surfaceWidth = 0;

                // Get groupInfo (if specified)
                var groupInfo = this.layout.groupInfo && this.layout.groupInfo();

                var currentGroupKey = null;

                // Get the spacing to add between groups (if grouped view)
                var groupSpacing;

                var topY;

                // Keep track of current row for maxRows comparison
                var curRow = -1;

                // Get the margin sizes around items
                var templateMargins = this._getItemMargins($(this.items[0].element));

                var groupHeaderOnLeft = this.layout && this.layout.groupHeaderPosition == "left";
                var groupRenderStartX;

                var listWidth = this.$rootElement.innerWidth();

                // Add the rendered DOM elements to the DOM at the correct positions
                var groupIndex = 0;
                for (var i = 0; i < this.items.length; i++) {

                    var item = this.items[i];

                    // Get the dimensions of the item (force to width of list if not horizontal)
                    var itemWidth = this.layout.horizontal ? item.element.offsetWidth : listWidth;
                    var itemHeight = item.element.offsetHeight;
                    var itemContainer = item.element.parentNode;
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
                    if (this._groupDataSource && item.groupKey != currentGroupKey) {

                        // If there's a previous group header, then limit its width to the total width of the group of items that we just rendered
                        if ($groupHeaderTemplate && !groupHeaderOnLeft) {

                            // TODO (CLEANUP): FF is ellipsizing a pixel or two too soon... Not sure why since there's no border...
                            // TODO (BUG): One resize, need to recalc groupHeader size from original, since group could be wider now.
                            var pad = 2;
                            $groupHeaderTemplate.css("width", Math.min(parseInt($groupHeaderTemplate.css("width")) + pad,
                                                                       (surfaceWidth - groupRenderStartX - parseInt($groupHeaderTemplate.css("marginLeft")) + pad)) + "px");
                        }

                        // Track width of the current group for the above limit
                        groupRenderStartX = surfaceWidth;

                        // Track the current group key so that we know when we switch to a new group
                        currentGroupKey = item.groupKey;

                        var $groupHeaderTemplate = this.$_groupHeaders[groupIndex++];

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
                            "left": (renderCurX - groupSpacing) + "px"  // step back groupSpacing pixels to account for margin
                        });

                    } else {

                        if (topY === undefined)
                            topY = 0;
                        if (this.layout.horizontal) {
                            // If placing this item would extend beyond the maximum Y, then wrap to the next column instead.
                            // So the same if maxRows is specified and we're about to exceed it
                            if (renderCurY + itemHeight + templateMargins.containerVertical >= renderMaxY ||
                                this.layout.maxRows && curRow == this.layout.maxRows - 1) {
                                renderCurY = topY;
                                renderCurX = surfaceWidth;
                                curRow = 0;
                            } else
                                curRow++;
                        }
                    }
                    itemContainer.style.left = renderCurX + "px";
                    itemContainer.style.top = renderCurY + "px";
                    itemContainer.style.width = (itemWidth + templateMargins.itemHorizontal) + "px";
                    itemContainer.style.height = (itemHeight + templateMargins.itemVertical) + "px";

                    // Keep track of the width of the scrolling surface
                    surfaceWidth = Math.max(surfaceWidth, renderCurX + itemWidth + templateMargins.containerHorizontal);

                    // Go to the next place to put the next item
                    renderCurY += itemHeight + templateMargins.containerVertical;

                    // If item is selected, then add border
                    if (this.selection._containsItemByKey(item.key))
                        this._addSelectionBorderToElement(item.element);
                }

                // Set the final width of the ListView's scrolling surface, and make it visible
                this.$scrollSurface.css("width", surfaceWidth).show();

                // use enterContent to slide the list's items into view.  This slides them as one contiguous block (as win8 does).
                if (!this._disableAnimation && !this._disableEntranceAnimation)
                    WinJS.UI.Animation.enterContent([this.$scrollSurface[0]]);
            },


            // ================================================================
            //
            // private Function: WinJS.UI.ListView._getItemMargins
            //
            _getItemMargins: function ($item) {

                var $container = $("<div id='_cont1' class='win-container'></div>")
					.appendTo(this.$scrollSurface);

                // Now that we have a matching element in the DOM, get it's margin values.  Since the css is returned as "#px", we need to strip the 'px'
                // TODO: not 100% sure what the right solution is here; build a test in win8 and see what it does
                var itemMargins = {
                    containerVertical: parseInt($container.css("marginTop")) + parseInt($container.css("marginBottom")),
                    containerHorizontal: parseInt($container.css("marginLeft")) + parseInt($container.css("marginRight")),
                    itemVertical: parseInt($item.css("marginTop")) + parseInt($item.css("marginBottom")),
                    itemHorizontal: parseInt($item.css("marginLeft")) + parseInt($item.css("marginRight"))
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

                        // help the app along with win8 references
                        // TODO: Generalize this (it gets called in multiple places), and extend to support the other ms-appdata locations (e.g. localStorage).
                        element.innerHTML = element.innerHTML.replace(/ms-appx:\/\/\//g, "/");

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

                    // If our itemDataSource == newDataSource, then just return
                    if (this._itemDataSource && this._itemDataSource._id == newDataSource._id)
                        return;

                    var that = this;

                    // This event handler is called when an event that does not change our datasource count has occurred
                    var renderMe = function () {
                        // TODO: leaving this wrapper in case I need to send events; if not, then just bind to render.
                        that.render(false);
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

                    // If our groupDataSource == newDataSource, then just return
                    if (this._groupDataSource && this._groupDataSource._id == newDataSource._id)
                        return;

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

                    if (this._itemTemplate != newTemplate) {
                        this._itemTemplate = newTemplate;
                        this.render();
                    }
                }
            },


            // ================================================================
            //
            // public property: WinJS.ListView.layout
            //
            //      MSDN: TODO
            //
            _layout: null,
            layout: {
                get: function () {
                    return this._layout;
                },

                set: function (newLayout) {

                    if (!(newLayout instanceof WinJS.UI.ListLayout) && !(newLayout instanceof WinJS.UI.GridLayout))
                        newLayout = new WinJS.UI.GridLayout(newLayout);

                    // If the new layout is the same as the old layout, then do nothing
                    if (!_.isEqual(this._layout, newLayout)) {

                        this._layout = newLayout;
                        this.render();
                    }
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._notifySelectionChanged
            //
            _notifySelectionChanged: function (pageElement, eventData) {

                // TODO: What to pass for data?

                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("selectionchanged", true, false, eventData);
                pageElement.dispatchEvent(event);
            },


            // ================================================================
            //
            // private function: WinJS.ListView._notifyItemInvoked
            //
            _notifyItemInvoked: function (pageElement, eventData) {

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

                    // Remove previous on* handler if one was specified
                    if (this._oniteminvoked)
                        this.removeEventListener("iteminvoked", this._oniteminvoked);

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
                    // Remove previous on* handler if one was specified
                    if (this._onselectionchanged)
                        this.removeEventListener("selectionchanged", this._onselectionchanged);

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
                    var itemIsNowSelected = that.selection._containsItemByKey(item.key);

                    if (itemWasSelected && !itemIsNowSelected) {

                        // remove selection
                        $containerNode.removeClass("win-selected");
                        $(".win-selectionbackground, .win-selectioncheckmarkbackground, .win-selectioncheckmark", $containerNode).remove();

                    } else if (!itemWasSelected && itemIsNowSelected) {

                        // add selection border
                        that._addSelectionBorderToElement(item.element);
                    }
                });

                this._notifySelectionChanged(this.element);
            },


            // ================================================================
            //
            // private function: WinJS.ListView._addSelectionBorderToElement
            //
            _addSelectionBorderToElement: function (element) {

                // TODO (PERF-MINOR): Precreate and clone these DIVs
                var $containerNode = $(element.parentNode);
                $containerNode.addClass("win-selected");
                $(element).before($("<div class='win-selectionbackground'></div>"))
                               .after($("<div class='win-selectionbordercontainer'>" +
                                        "<div class='win-selectionborder win-selectionbordertop'></div>" +
                                        "<div class='win-selectionborder win-selectionborderright'></div>" +
                                        "<div class='win-selectionborder win-selectionborderbottom'></div>" +
                                        "<div class='win-selectionborder win-selectionborderleft'></div>" +
                                        "</div><div class='win-selectioncheckmarkbackground'></div><div class='win-selectioncheckmark'></div>"
                                ));
            },


            // ================================================================
            //
            // public property: WinJS.ListView.scrollPosition
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211847.aspx
            //
            scrollPosition: {
                get: function () {
                    if (this.layout.horizontal)
                        return this.$viewport.scrollLeft();
                    else
                        return this.$viewport.scrollTop();
                },
                set: function (value) {
                    if (this.layout.horizontal)
                        this.$viewport.scrollLeft(value);
                    else
                        this.$viewport.scrollTop(value);
                }
            },


            // ================================================================
            //
            // public property: WinJS.ListView.indexOfFirstVisible
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700691.aspx
            //
            indexOfFirstVisible: {

                get: function () {

                    if (!this.$viewport)
                        return 0;

                    var curScrollRect = {
                        left: this.$viewport.scrollLeft(),
                        top: this.$viewport.scrollTop(),
                        width: this.$viewport.innerWidth(),
                        height: this.$viewport.innerHeight()
                    };

                    // Items are sorted in order, so just find the first one that's in the current viewport
                    if (this.layout.horizontal) {
                        var viewLeftEdge = this.$viewport.scrollLeft();
                        for (var i = 0; i < this.items.length; i++) {
                            var itemRightEdge = parseInt(this.items[i].element.parentNode.style.left) +
                                                parseInt(this.items[i].element.parentNode.style.width);
                            if (itemRightEdge > viewLeftEdge)
                                return i;
                        }
                    } else {
                        var viewTopEdge = this.$viewport.scrollTop();
                        for (var i = 0; i < this.items.length; i++) {
                            var itemBottomEdge = parseInt(this.items[i].element.parentNode.style.right) +
                                                 parseInt(this.items[i].element.parentNode.style.height);
                            if (itemBottomEdge > viewTopEdge)
                                return i;
                        }
                    }
                    // No item is visible
                    return -1;  // TODO: What does win8 return here?
                },

                set: function (index) {

                    if (index >= this.items.length)
                        return;

                    // Get the position of the item at index 'index', and scroll to it
                    var item = this.items[index].element.parentNode;
                    if (this.layout.horizontal)
                        this.scrollPosition = item.offsetLeft -
                                              parseInt(this.items[0].element.parentNode.style.left) +
                                              parseInt($(this.items[0].element.parentNode).css("marginLeft"));
                    else
                        this.scrollPosition = item.offsetTop -
                                              parseInt(this.items[0].element.parentNode.style.top) +
                                              parseInt($(this.items[0].element.parentNode).css("marginTop"));
                }
            },

            // ================================================================
            //
            // public property: WinJS.ListView.indexOfLastVisible
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700698.aspx
            //
            indexOfLastVisible: {

                get: function () {
                    var curScrollRect = {
                        left: this.$viewport.scrollLeft(),
                        top: this.$viewport.scrollTop(),
                        width: this.$viewport.innerWidth(),
                        height: this.$viewport.innerHeight()
                    };

                    // Items are sorted in order, so just find the last one that's in the current viewport
                    if (this.layout.horizontal) {
                        var viewLeftEdge = this.$viewport.scrollLeft();
                        for (var i = this.items.length - 1; i >= 0; i--) {
                            var itemRightEdge = parseInt(this.items[i].element.parentNode.style.left) +
                                                parseInt(this.items[i].element.parentNode.style.width);
                            if (itemRightEdge > viewLeftEdge)
                                return i;
                        }
                    } else {
                        var viewTopEdge = this.$viewport.scrollTop();
                        for (var i = this.items.length - 1; i >= 0; i--) {
                            for (var i = 0; i < this.items.length; i++)
                                var itemBottomEdge = parseInt(this.items[i].element.parentNode.style.right) +
                                                     parseInt(this.items[i].element.parentNode.style.height);
                            if (itemBottomEdge > viewTopEdge)
                                return i;
                        }
                    }
                    // No item is visible
                    return -1;  // TODO: What does win8 return here?
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._beginZoom
            //
            //		SemanticZoom support function
            //
            _beginZoom: function () {

                // TODO (R3): For R1/R2, We fade between lists for Semantic zooming in/out - so we don't
                // need to worry about scrollbars and the like.  So we get off easy here until R3!
            },


            // ================================================================
            //
            // private function: WinJS.ListView._beginZoom
            //
            //		SemanticZoom support function
            //
            _endZoom: function (isCurrentView) {

                // TODO (R3): For R1/R2, We fade between lists for Semantic zooming in/out - so we don't
                // need to worry about scrollbars and the like.  So we get off easy here until R3!
            },


            // ================================================================
            //
            // private function: WinJS.ListView._getCurrentItem
            //
            //		SemanticZoom support function
            //
            _getCurrentItem: function () {
                var that = this;

                // TODO: Update this to use focus when that gets added in R3
                var index = that._currentItem || that.indexOfFirstVisible;

                // TODO: use datasource.getitem
                var item = that._itemDataSource._list.getItem(index);
                var container = item.element.parentNode;
                return WinJS.Promise.wrap({
                    item: item,
                    position: {
                        left: container.offsetLeft,
                        top: container.offsetTop,
                        width: container.offsetWidth,
                        height: container.offsetHeight
                    }
                });
            },


            // ================================================================
            //
            // private function: WinJS.ListView._configureForZoom
            //
            //		SemanticZoom support function
            //
            _configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {

                // Track if we're the zoomedout or zoomedin view.
                this._isZoomedOut = isZoomedOut;

                // Call this._triggerZoom when the user clicks on an item
                this._triggerZoom = triggerZoom;
            },


            // ================================================================
            //
            // private function: WinJS.ListView._positionItem
            //
            //		SemanticZoom support function
            //
            _positionItem: function (item, position) {

                if (!item) {
                    this.indexOfFirstVisible = 0;
                    return;
                }
                // Get the first item whose key matches "key"
                if (this._isZoomedOut) {
                    // TODO: Haven't tested this one.
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].key == item.groupKey) {
                            this.indexOfFirstVisible = i;
                            return;
                        }
                    }
                } else {
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].groupKey == item.key) {
                            this.indexOfFirstVisible = i;
                            return;
                        }
                    }
                }
            },


            // ================================================================
            //
            // private function: WinJS.ListView._setCurrentItem
            //
            //		SemanticZoom support function
            //
            _setCurrentItem: function (x, y) {

                //  Get the item at location x,y
                console.error("NYI: Get the item at location x,y");
                var item = null;

                this.indexOfFirstVisible = 0;/*

                    // todo: use datasource.getitem
                    var list = this._itemDataSource._list;
                    for (var i = 0; i < list.length; i++) {
                        var item = list.getItem(i);
                        if (item.groupKey == clickedGroup.key) {
                            // Bring the selected item/group (?) into view
                      //      that._zoomedInView.indexOfFirstVisible = i;

                            var pos = {
                                left: $focusedElement[0].offsetLeft,
                                top: $focusedElement[0].offsetTop,
                                width: $focusedElement[0].offsetWidth,
                                height: $focusedElement[0].offsetHeight
                            };


                            return WinJS.Promise.wrap({ item: groupItem, position: pos });

                            break;
                        }
                    }
                });*/
            },


            // ================================================================
            //
            // public function: WinJS.ListView.ensureVisible
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211820.aspx
            //
            ensureVisible: function (itemIndex) {

                if (itemIndex < this.indexOfFirstVisible || itemIndex > this.indexOfLastVisible)
                    this.indexOfFirstVisible = itemIndex;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.elementFromIndex
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh758351.aspx
            //
            elementFromIndex: function (itemIndex) {

                var item = this._itemDataSource._list.getItem(itemIndex);
                return item ? item.element : null;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.elementFromIndex
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700675.aspx
            //
            indexOfElement: function (element) {

                for (var i = 0; i < this.items.length; i++)
                    if (this.items[i].element == element)
                        return i;
                return -1;
            },


            // ================================================================
            //
            // public function: WinJS.ListView.currentItem
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440977.aspx
            //
            currentItem: {

                get: function () {
                    if (this._currentItem) {
                        var itemWithIndex = this._itemDataSource._list.getItemFromKey(this._currentItem.key);
                        return {
                            index: itemWithIndex.index,
                            key: this._currentItem.key,
                            hasFocus: true,             // TODO: Changes when we have focus
                            showFocus: true,            // TODO: Changes when we have focus
                        }
                    } else {
                        return {
                            index: -1,
                            key: null,
                            hasFocus: false,
                            showFocus: false
                        };
                    }
                },

                set: function (value) {

                    if (value.index) {

                        this._currentItem = this.items[value.index];
                        $(this._curentItem).focus();

                    } else if (value.key) {

                        this._currentItem = this._itemDataSource._list.getItemFromKey(value.key);
                        $(this._curentItem).focus();

                    } else {

                        // Clearing
                        if (this._currentItem) {
                            $(this._currentItem).blur();
                            this._currentItem = null;
                        }
                    }
                }
            },


            // ================================================================
            //
            // public function: WinJS.ListView.resetGroupHeader
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700726.aspx
            //
            _groupHeaderRecycleFunction: null,
            resetGroupHeader: {
                get: function () {
                    if (!this._warnedResetGroupHeader) {
                        this._warnedResetGroupHeader = true;
                        console.warn("bluesky: resetGroupHeader is NYI");
                    }
                    return _groupHeaderRecycleFunction;
                },
                set: function (value) {
                    if (!this._warnedResetGroupHeader) {
                        this._warnedResetGroupHeader = true;
                        console.warn("bluesky: resetGroupHeader is NYI");
                    }
                    _groupHeaderRecycleFunction = value;
                }
            },


            // ================================================================
            //
            // public function: WinJS.ListView.resetItem
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211846.aspx
            //
            _itemRecycleFunction: null,
            resetItem: {
                get: function () {
                    if (!this._warnedResetItem) {
                        this._warnedResetItem = true;
                        console.warn("bluesky: resetItem is NYI");
                    }
                    return _itemRecycleFunction;
                },
                set: function (value) {
                    if (!this._warnedResetItem) {
                        this._warnedResetItem = true;
                        console.warn("bluesky: resetItem is NYI");
                    }
                    _itemRecycleFunction = value;
                }
            }
        })
});

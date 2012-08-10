"use strict";

(function () {

    var Layout = {
        HorizontalList: 0,
        VerticalList: 1,
        Grid: 2
    };

    var ListLayout = function (layoutOptions) {

        // TBD: This is not fully implemented yet
        if (layoutOptions == "WinJS.UI.GridLayout")
            this.layout = Layout.Grid;
        else if (layoutOptions == "WinJS.UI.ListLayout") {
                // tbd: support vertical lists
            this.layout = Layout.HorizontalList;
        }
    };

    // ================================================================
    //
    // WinJS.UI.ListView implementation.
    //
    WinJS.Namespace.define("WinJS.UI", {
        ListView: WinJS.Class.define(

            // ListView constructor
            function (element, options) {

                // Keep a reference to our root element - that's where we'll render our items into the DOM
                this.rootElement = element;

                // Generate our layout definition object.
                // tbd: what's the right win8 default?
                this.layout = (options && options.layout) ? new ListLayout(options.layout)
                                                          : new ListLayout({ layout: 'WinJS.UI.GridLayout', horizontal: false });
            },

            // ListView Member functions
            {
                groupRenderingInfo: null,

                // ================================================================
                //
                // Function: WinJS.UI.ListView.render
                //
                // Called when the ListView should "render" itself to the page.  It does this
                // by first emptying and then populating its root element with elements for
                // each item in our datasource.
                render: function () {
                    
                    // Do some sanity error checking first for common errors
                    if (this._itemDataSource == null) {
                        //console.error("ListView.itemDataSource is null", this);
                        return;
                    }
                    
                    if (this.itemTemplate == null) {
                        return;
                    }
                    if (this._itemDataSource.bind == undefined) {
                        console.error("ListView.itemDataSource is not a databound object.  Wrap it with WinJS.Binding.as first.", this, this._itemDataSource);
                        return;
                    }

                    // If caller specified sizing info then grab it now
                    if (this.layout && this.layout.groupInfo) {
                        this.groupRenderingInfo = this.layout.groupInfo();
                        this._nonFunctionTemplateWidth = this.groupRenderingInfo.cellWidth;
                        this._nonFunctionTemplateHeight = this.groupRenderingInfo.cellHeight;
                    } else {
                        this.groupRenderingInfo = null;
                        this._nonFunctionTemplateWidth = -1;
                    }

                    // Start by clearing out our root element from previous renders
                    // tbd-perf: Consider storing this (and related elements e.g. this.groupHeaderTemplate in pre-jquery-wrapped form)
                    var $rootElement = $(this.rootElement);
                    $rootElement.empty();

                    var $viewportDiv = $("<div class='win-viewport win-horizontal' role='group' style='opacity: 1; -ms-scroll-boundary-left: 0px;'></div>");
                    var $surfaceDiv = $("<div class='win-surface'><div class='_win-proxy'></div></div>");
                    $rootElement.css("position", "relative");
                    $rootElement.attr("role", "listbox");
                    $rootElement.addClass("win-listview win-swipeable");

                    // If we're rendering a grouped list, then start rendering them items slightly lower to make room for the groupheaders
                    // tbd: get the size of the groupheadertemplate instead of using '40'.
                    this._startY = this._groupDataSource != null ? 40 : 0;

                    // Set starting X
                    // TBD: This is what Win8 uses.  hardcoded? Where do they get it from?
                    if (this._groupDataSource != null) {
                        this._startX = 70;
                    }
                    
                    this._renderMaxY = $rootElement.parent().outerHeight();
                    this._renderCurX = this._startX;
                    this._renderCurY = this._startY;
                    this._curItemIndex = 0;
                    // If we have a groupDataSource specified, then render our items in the groups defined in that data source.
                    if (this._groupDataSource != null) {
                        $rootElement.addClass("win-groups");
                        // Iterate over the set of groups in groupDataSource; for each group. render the items in itemDataSource that are in the group
                        for (var i in this._groupDataSource._list._groupKeys) {
                            var groupKey = this._groupDataSource._list._groupKeys[i];
                            var group = this._groupDataSource._list._groupItems[groupKey]; 
                            var $groupHeaderTemplate
                            var $groupHeaderTemplate;

                            // Render group header using groupHeaderTemplate (if specified)
                            if (this.groupHeaderTemplate != null) {
                                this._renderCurY = this._startY;
                                if (this._renderCurX > this._startX) this._renderCurX += 80; // inter-section spacing

                                // Clone the group header template
                                $groupHeaderTemplate = $(this.groupHeaderTemplate).clone().show();

                                $groupHeaderTemplate.css("position", "absolute");
                                $groupHeaderTemplate.css("top", "0px");
                                $groupHeaderTemplate.css("left", this._renderCurX + "px");

                                // Perform data binding on the group header template
                                WinJS.Binding.processAll($groupHeaderTemplate[0], group.data);
                                
                                // Add the fully realized HTML for the group header to the ListView's DOM element.
                                $surfaceDiv.append($groupHeaderTemplate);
                            }

                            // Render items in the current group to the ListView's DOM element.
                            // tbd: cache items (instead of just item keys?)
                            var items = [];
                            for (var j in group.itemKeys) {
                                // tbd-cleanup: can I do the same as single list render below?  if so, then just pass _list...
                                items.push(this._itemDataSource._list.getItemFromKey(group.itemKeys[j]));
                            }

                            // Keep track of where we started rendering so that we can can calculate the total width of the group's items.
                            var renderStartX = this._renderCurX;

                            // Render the group's items. Lay them out horizontally
                            this._renderItemsToElement($surfaceDiv, items, Layout.Grid);

                            // If we rendered a group header, then limit its width to the total width of the group of items that we just rendered
                            if (this.groupHeaderTemplate != null)
                                $groupHeaderTemplate.css("width", (this._renderCurX - renderStartX + 20) + "px");
                        }
                    } else {
                        // We don't have a groupDataSource specified, so render our items as a single list of items.
                        var items = [];
                        for (var i = 0; i < this.itemDataSource._list.length ; i++)
                            items.push(this.itemDataSource._list.getItem(i));

                        this._renderItemsToElement($surfaceDiv, items, Layout.HorizontalList);
                    }

                    // + 20 to account for built-in listview padding-left.  TBD: Generalize this.
                    $surfaceDiv.css("width", this._renderCurX + 20);
					$surfaceDiv.css("height", this._renderMaxY-80); // 80 = size of header (70) and padding (10)

                    $viewportDiv.append($surfaceDiv);
                    $rootElement.append($viewportDiv);
                },


                _renderItemsToElement: function (targetElement, itemsToRender, layoutType) {

                    // var $containerDiv = $("<div class='win-container win-selected' style='width:160px;height:160px'><div class='win-selectionbackground'></div></div>");
                    var $containerDiv = $("<div class='win-container'></div>");

                    for (var itemKey in itemsToRender) {
                        var item = itemsToRender[itemKey].data;
                        var $thisItemContainer = $containerDiv.clone();
                        $thisItemContainer.css("top", this._renderCurY + "px");
                        $thisItemContainer.css("left", this._renderCurX + "px");

                        var result = "";

                        var _itemWidth = 0, _itemHeight = 0;

                        // If the specified itemTemplate variable is a function, then call it to get the fully realized HTML; otherwise,
                        // we'll do the templatization ourseles through WinJS.Binding.processAll.
                        if (typeof this.itemTemplate !== "function") {
                            // tbd: wrap Items in class'ed divs (e.g. <div class='winjsListViewItem'>...</div>) to allow
                            //      better control over how groups and elements interact.  Better: reuse existing win8 class names
                            //      in order to get highlighting and other styles for free...

                            // Get the templatized HTML that we'll populate.  Clone it so that we don't modify the original template
                            var $template = $(this.itemTemplate).clone();
                            
                            // The templates themselves are hidden since the user shouldn't see them;  make our instanced template visible
                            $template.show();

                            // Let WinJS binding do all the heavy lifting for us.
                            // tbd: This should (but haven't verified) be a live projection, so changes to the item will be reflected
                            // in the UI automagically
                            WinJS.Binding.processAll($template[0], item);

                            // Cleanup - remove data winbinds. tbd: Does win8 do this?
                            $("data-win-bind", $template[0]).remove();

                            result = $template[0];

                            // Make the item template a "win-item" class type.
                            $(result).addClass("win-item");

                            // calculate the template (if not a function) width and height one time to optimize the # of calls to append/remove
                            if (this._nonFunctionTemplateWidth == -1) {
                                var $temp = $template.clone().hide();
                                $(this.rootElement).append($temp);
                                this._nonFunctionTemplateWidth = $temp.outerWidth();
                                this._nonFunctionTemplateHeight = $temp.outerHeight()

                                // tbd-perf: we could technically work on the item itself here, and leave it in its current spot
                                $temp.remove();
                            }

                            _itemWidth = this._nonFunctionTemplateWidth;
                            _itemHeight = this._nonFunctionTemplateHeight;
                        } else {

                            // The itemTemplate object that the user specified is a function; that function is responsible
                            // for generating the fully realized HTML for an item.  Pass the function the next item now
                            // Create the itemPromise which will be fulfilled when the data is ready
                            var promise = new ItemPromise({ data: item, groupKey: itemsToRender[itemKey].groupKey, index: this._curItemIndex });

                            // Call the function that will populate a template with the current data item
                            result = this.itemTemplate(promise);

                            // For perf, grab a jquery wrapper ref.
                            // tbd-perf: don't use jquery in this inner loop; avoid the wrap cost.  Leaving in for now to minimize compat issues.
                            var $result = $(result);

                            // Make the item template a "win-item" class type.
                            $result.addClass("win-item");

                            // Assign the listitem role to the item
                            $result.attr("role", "listitem");

                            // Get the height/width thru hack
                            var $temp = $result.clone();
                            $(this.rootElement).append($temp);
                            _itemWidth = $temp.outerWidth();
                            _itemHeight = $temp.outerHeight();
                            $temp.remove();
                        }

                        // Explicitly assign width and height styling to container to match Win8
                        if (this.groupRenderingInfo != null) {
                            // constrain size to specified granularity
                            var w = Math.floor(_itemWidth / this.groupRenderingInfo.cellWidth) * this.groupRenderingInfo.cellWidth;
                            var h = Math.floor(_itemHeight / this.groupRenderingInfo.cellWidth) * this.groupRenderingInfo.cellWidth;

                            $thisItemContainer.css("width", w);
                            $thisItemContainer.css("height", h);
                        } else {
                            $thisItemContainer.css("width", _itemWidth);
                            $thisItemContainer.css("height", _itemHeight);
                        }

                        // Append the fully realized HTML to the list.
                        $thisItemContainer.append(result);

                        // Put it in the right place
                        $(targetElement).append($thisItemContainer);


                        // $thisItemContainer.append('<div class="win-selectionborder"></div><div class="win-selectioncheckmarkbackground" aria-hidden="true"></div><div class="win-selectioncheckmark" aria-hidden="true"></div>');

                        // if oniteminvoked is specified, then bind item click now
                        if (this.oniteminvoked != null) {

                            var that = this;

                            // store a reference to the item in the itemcontainer
                            $(".win-item", $thisItemContainer).data("itemIndex", this._curItemIndex);
                            //$(".win-item", $thisItemContainer).data("itemKey", itemKey);
                            //$(".win-item", $thisItemContainer).data("item", item);

                            // If the user clicks on the item, call our oniteminvoked function
                            $(".win-item", $thisItemContainer).click(function () {

                                // Get the index of the clicked item container's item
                                var itemIndex = $(this).data("itemIndex");

                                // Call the callback
                                that.oniteminvoked({ detail: { itemIndex: itemIndex } });
                            });
                        }

                        if (this.onselectionchanged != null) {

                            var that = this;

                            // store a reference to the item in the itemcontainer
                            $(".win-item", $thisItemContainer).data("itemIndex", this._curItemIndex);
                            //$(".win-item", $thisItemContainer).data("itemKey", itemKey);
                            //$(".win-item", $thisItemContainer).data("item", item);

                            // If the user clicks on the item, call our oniteminvoked function
                            $(".win-item", $thisItemContainer).click(function () {

                                // Get the index of the clicked item container's item
                                var itemIndex = $(this).data("itemIndex");

                                // Call the callback
                                that.onselectionchanged({ detail: { itemIndex: itemIndex } });
                            });
                        }


                        // tbd: hack; need to get the 200 done right.  note: added 80 for padding/header
                        // tbd: hack; these two 10s feel hardcoded somehow (same with the 80 up above - maybe some const equivs?)

                        if (this._renderCurY == this._startY)
                            this._renderListEndX = this._renderCurX + _itemWidth; // where the list ends on the right side

                        if (layoutType == Layout.HorizontalList)
                            this._renderCurX += _itemWidth + 10;
                        else {
                            this._renderCurY += _itemHeight + 10; // 10 = per-item spacing

                            if (this._renderCurY >= this._renderMaxY - 280) {
                                this._renderCurY = this._startY;
                                this._renderCurX += _itemWidth + 10;
                            }
                        }
                        this._curItemIndex++;
                    }

                    // set _renderCurX to _renderListEndX which is the actual place where the right-most pixel in this list exists
                    this._renderCurX = this._renderListEndX;
                },
                
                
                // tbd: hack; not sure if this is the right way to do this, but setOptions is calling render twice and
                // this is the closest way I can think of to do this
                _delayedRender: false,

                // _itemDataSource: The private reference to the data bound source to which we're listening and rendering.  Accessed via this.itemDataSoucce.
                _itemDataSource: null,

                itemDataSource: {
                    // itemDataSource.getter: Returns a reference to the current data source in our owning ListView
                    get: function () {
                        return this._itemDataSource;
                    },

                    // itemDataSource.setter: Used to set a new item data source
                    set: function(newDataSource) {
                    
                        // Store a reference to the new data source in our owning ListView
                        this._itemDataSource = newDataSource;

                        // Listen to changes to the list and rerender ourselves.
                        // tbd: cache changes (so multiple inserts don't result in multiple render calls)
                        // tbd-cleanup: create a DataSource object and encapsulate the below into a single "bindOnAnyChange" call
                        // tbd-cleanup: Do I need to removeEventListener at some point?  Does this object have a dispose() equivalent?
                        this._itemDataSource._list.addEventListener("itemInserted", this.render.bind(this));
                        this._itemDataSource._list.addEventListener("itemRemoved", this.render.bind(this));
                        this._itemDataSource._list.addEventListener("itemChanged", this.render.bind(this));

                        // Refresh our in-page appearance to show the new datasource's items.
                        if (!this._delayedRender) this.render();
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

                        // Store a reference to the new data source in our owning ListView
                        this._groupDataSource = newDataSource;

                        // Refresh our in-page appearance to show the new datasource's items.
                        if (!this._delayedRender) this.render();
                    }
                },


                // rootElement: The DOM element into which this ListView's items are rendered
                rootElement: null,

                // itemTemplate: A DOM element that contains the templatized HTML which we'll start with when rendering each
                // element in the list.  Note that this can also be a function which returns the fully realized HTML to use
                // for an element (yes, it's poorly named - thank WinJS).
                _itemTemplate: null,
                itemTemplate: {
                    get: function () {
                        return this._itemTemplate;
                    },

                    set: function (newTemplate) {

                        this._itemTemplate = newTemplate;
                        if (!this._delayedRender) this.render();
                    }
                },

                _layout: null,
                layout: {
                    get: function () {
                        return this._layout;
                    },

                    set: function (newLayout) {

                        this._layout = newLayout;
                        if (!this._delayedRender) this.render();
                    }
                },

                // oniteminvoked: event to fire when the user clicks on an item in the list.
                oniteminvoked: null,

                // Variables used in rendering items in the ListView
                _startX: 0,
                _startY: 0,
                _renderCurX: 0,
                _renderListEndX: 0,
                _renderCurY: 0,
                _renderMaxY: 0,
                _nonFunctionTemplateWidth: 0,
                _nonFunctionTemplateHeight: 0,
                _curItemIndex: 0,


                $tempRoot: null
            })
    });
})();
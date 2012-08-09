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

        		// Generate our layout definition object.
        		// tbd: what's the right win8 default?
        		this.layout = new WinJS.UI.ListLayout(options.layout || {
        			layout: 'WinJS.UI.GridLayout',
        			horizontal: false
        		});
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
        	//			* Support List and Grid layouts
        	//			* Support horizontal lists
        	//			* Support cellspanning
        	//			* Hook up window resize
			//
        	_doRender: function () {

        		// Ensure we're fully set up.
        		if (!this.itemDataSource && !this.itemTemplate)
        			return;

        		/*DEBUG*/
        		if (this._itemDataSource.bind == undefined) {
        			console.error("ListView.itemDataSource is not a databound object.  Wrap it with WinJS.Binding.as first.", this, this._itemDataSource);
        			return;
        		}
        		/*ENDDEBUG*/

        		// Start by clearing out our root element from previous renders
        		this.$rootElement.empty();

        		// Create two DOM elements; a parent Viewport which is static and does not move, and a child surface which is large enough to
        		// contain all items in the list.  Show the currently scrolled-to part of the list (child surface) in the viewport.
        		var $viewportDiv = $("<div class='win-viewport win-horizontal' role='group'></div>");
        		var $surfaceDiv = $("<div class='win-surface'></div>");

        		// Set our root element's position to relative so that list items can be absolutely positioned relative to the list
        		// Also add roles and classes to make the listbox look like a Win8 listbox
        		this.$rootElement
                    .css("position", "relative")
                    .attr("role", "listbox")
                    .addClass("win-listview");

        		// Get the list of items that we'll render.
        		var items = [];
        		for (var i = 0; i < this.itemDataSource._list.length ; i++)
        			items.push(this.itemDataSource._list.getItem(i));

        		var that = this;

        		var templateSize = {};

        		this._getItemMargins(templateSize);

        		// Render each list item, and store a Promise for each item; that Promise will be fulfilled when the item has been rendered as is
        		// ready to be inserted into the visible DOM.  We will wait until all of these Promises are fulfilled.
        		var renderPromises = [];
        		if (typeof this.itemTemplate !== "function") {

        			// itemTemplate is not a function
        			items.forEach(function (item) {
        				that._renderItemTemplate(item);
        			});

        			// TODO: Possible bug in our Promise.join - doesn't work on empty array of Promises.  For now, just add an empty Promise
        			renderPromises.push(WinJS.Promise.as());

        		} else {

        			// itemTemplate is a function; create a collection of render promises which we'll wait on below.
        			// TODO (PERF-MINOR): the itemTemplate function could return synchronously, in which case we're unnecessarily waiting on it as a Promise.
        			for (var i = 0; i < items.length; i++) {
        				renderPromises.push(this._getItemFunctionRenderPromise(items[i], i));
        			}
        		}

        		// Wait until all of the items have been rendered
        		WinJS.Promise.join(renderPromises).then(function () {

        			// Set current rendering position to upper left corner of the list's surface
        			var renderCurX = 0, renderCurY = 0;

        			// Get the height of the space into which this List must fit.  We'll wrap when an item would go beyond this height.
        			// TODO: Does ListView have a horizontal-oriented view?  If so, then use renderMaxX/outerWidth here in that situation.
        			var renderMaxY = that.$rootElement.parent().outerHeight();

        			// Keep track of the width of the scrolling surface
        			var surfaceWidth = 0;

					// Get groupInfo (if specified)
        			var groupInfo = that.layout.groupInfo && that.layout.groupInfo();

        			// Add the rendered DOM elements to the DOM at the correct positions
        			items.forEach(function (item) {

        				// Get the dimensions of the item
        				// TODO: Yeah, this needs work.  I'm not sure where I'm supposed to get dimensions from; sometimes it's the element, sometimes
        				// it's the div in it... It's a 2x2 grid with axes template/function and groupinfo/no-groupinfo...
        				var itemWidth = $(item.element).outerWidth() || $("div", $(item.element)).outerWidth();
        				var itemHeight = $(item.element).outerHeight() || $("div", $(item.element)).outerHeight();

						// If cellspanning/groupinfo specified, then apply it now
        				if (groupInfo && groupInfo.enableCellSpanning) {

        					// NOTE: Since we use item dimensions already, we don't need to do anything for enableCellSpanning.
        					// TODO: Technically this breaks some edge cases - e.g. app has incorrectly (or inconsistently) sized items
        					//		 and is relying on groupInfo to set the right granularity for them.  I'll need to see some failure
        					//		 cases to fully understand the right solution here.
							// TODO: Create some test cases with these edge case scenarios and see how Win8 handles them.
						}

        				// If placing this item would extend beyond the maximum Y, then wrap to the next column instead.
        				if (renderCurY + itemHeight >= renderMaxY) {
        					renderCurY = 0;
        					renderCurX = surfaceWidth;
        				}

        				// Keep track of the width of the scrolling surface
        				surfaceWidth = Math.max(surfaceWidth, renderCurX + itemWidth + templateSize.margins.horizontal);

        				// Create the item container div for the current item and explicitly assign width, height and position
        				var $thisItemContainer = $("<div class='win-container' style='width: " + itemWidth + "px; height: " +
													itemHeight + "px; top: " + renderCurY + "px; left: " + renderCurX + "px'></div>");

        				// Add the item's fully realized HTML to the item container, and then put it in the right place in the DOM
        				$thisItemContainer.append(item.element);
        				$surfaceDiv.append($thisItemContainer);

        				// Go to the next place to put the next item
        				renderCurY += itemHeight + templateSize.margins.vertical;
        			});

        			// Set the final width of the ListView's scrolling surface
        			$surfaceDiv.css("width", surfaceWidth);

        			// Add the ListView's scrolling surface to the ListView's static (nonscrolling) viewport, and then add the 
        			// listView's static viewpoint to the DOM
        			$viewportDiv.append($surfaceDiv);
        			that.$rootElement.append($viewportDiv);

					// use enterContent to slide the list's items into view.  This slides them as one contiguous block (as win8 does).
        			WinJS.UI.Animation.enterContent([$surfaceDiv[0]]);
        		});
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._getItemMargins
        	//
        	_getItemMargins: function (templateSize) {

        		// Next, calculate the margin that should be added around each list item's win-container DIV.  This is obtained
        		// from the following css selector:     .win-listview > .win-horizontal .win-container
        		// To do this, create an element in the DOM that matches that selector, and grab it's marginTop/marginBottom values.
        		// TODO: Find a cleaner way of calculating this?
        		var $container = $("<div class='win-listview'><div class='win-horizontal'><div id='_cont1' class='win-container'></div></div></div>")
					.hide()
					.appendTo($("body"));

        		// Now that we have a matching element in the DOM, get it's margin values.  Since the css is returned as "#px", we need to strip the 'px'
        		templateSize.margins = {
        			vertical: parseInt($("#_cont1").css("marginTop")) +
							  parseInt($("#_cont1").css("marginBottom")),
        			horizontal: parseInt($("#_cont1").css("marginLeft")) +
							  parseInt($("#_cont1").css("marginRight"))
        		};
        		// Clean up after ourselves and remove the element from the DOM.
        		$container.remove();
        	},


        	// ================================================================
        	//
        	// private Function: WinJS.UI.ListView._renderItemTemplate
        	//
        	_renderItemTemplate: function (item) {

        		// Get the templatized HTML that we'll populate.  Clone it so that we don't modify the original
        		// template, add the 'win-item' class, and then show it
        		item.element = $(this.itemTemplate)
					.clone()
					.addClass("win-item")
					.show()[0];

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

        				// Get the size of the item from the item's element.
        				// TODO (PERF): Avoid the jQuery wrapper here.
        				item.elementWidth = $(item.element).outerWidth();
        				item.elementHeight = $(item.element).outerHeight();
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

        			var previousDataSource = this._itemDataSource;

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

        			// Store a reference to the new data source in our owning ListView
        			this._groupDataSource = newDataSource;

        			// TODO: Use the same model as with itemDataSource for binding.

        			// Refresh our in-page appearance to show the new groupdatasource's items.
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

        			this._layout = newLayout;
        			this.render();
        		}
        	},

        	// oniteminvoked: event to fire when the user clicks on an item in the list.
        	oniteminvoked: null,

        	// on Window resize, re-render ourselves
        	// tbd-perf: consider batching these
        	_windowResized: function (w, h) {
        		// tbd: instead of re-rendering completely, should do a "movePosition"
        		// tbd-perf: only relayout if size has changed at the listview items' size granularity
        		//var anim = WinJS.UI.Animation.createRepositionAnimation(this._listItems);
        		this.render();
        		//anim.execute();
        	}
        })
});
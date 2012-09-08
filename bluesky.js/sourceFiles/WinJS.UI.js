// ================================================================
//
// WinJS.UI
//
//		This is the root WinJS.UI namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229782.aspx
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Function: WinJS.UI.setOptions
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440978.aspx
    //
    setOptions: function (targetObject, members) {

        // If no options specified then exit now
        if (!members)
            return;

        /*DEBUG*/
        // Parameter validation
        if (!targetObject)
            console.error("WinJS.UI.setOptions: Undefined or null targetObject specified.");
        if (!members)
            console.error("WinJS.UI.setOptions: Undefined or null members specified.");
        /*ENDDEBUG*/

        for (var fieldKey in members) {

            var fieldValue = members[fieldKey];

            /*DEBUG*/
            if (!fieldKey)
                console.error("WinJS.UI.setOptions: Setting undefined or null field", targetObject, members);
            /*ENDDEBUG*/

            // If the member starts with "on" AND the targetObject is a function that supports addEventListener, then add the fieldValue as an event listener
            if (fieldKey.toLowerCase().indexOf("on") == 0 && targetObject.addEventListener) {

                // fieldKey is an event and the targetObject supports addEventListener, so add fieldValue as an event
                // if the fieldValue is a function that go ahead and add it; otherwise (e.g. if the options are declaratively defined)
                // we need to eval it.
                // TODO: Is there a non-eval way to do this?
                if (typeof fieldValue === "function")
                    targetObject.addEventListener(fieldKey.substr(2), fieldValue);
                else
                    targetObject.addEventListener(fieldKey.substr(2), eval(fieldValue));

            } else {

                // fieldKey is not an event
                // TODO: With declaratively specified options (e.g. when defining a Rating Control in HTML), numeric values 
                //		 will be returned here as strings instead of numbers.  While they still equate, they end up as different types.  What's
                //		 the right way to do that?  Are there other types that hit the same issue?
                targetObject[fieldKey] = members[fieldKey];
            }
        }
    },


    // ================================================================
    //
    // public Function: WinJS.UI.process
    //
    //		Applies declarative control binding to the specified element.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440976.aspx
    //
    process: function (element) {

        /*DEBUG*/
        // Parameter validation
        if (!element)
            console.error("WinJS.UI.process: Undefined or null element specified.");
        /*ENDDEBUG*/

        return new WinJS.Promise(function (onComplete) {

            // Process the element
            blueskyUtils.ensureDatasetReady(element);
            if (element.dataset && element.dataset.winControl)
                WinJS.UI._processElement(element);

            // Process any child elements
            $("[data-win-control]", element).each(function () {

                // IE9 doesn't automagically populate dataset for us; fault it in if necessary
                blueskyUtils.ensureDatasetReady(this);

                // Process the element
                if (this.dataset && this.dataset.winControl)
                    WinJS.UI._processElement(this);
            });

            // Yield so that any controls we generated during the process call get a chance to finalize rendering themselves
            // before we indicate that we're done
            msSetImmediate(function () {
                onComplete(element.winControl);
            });
        });
    },


    // ================================================================
    //
    // public Function: WinJS.UI.processAll
    //
    //		Applies declarative control binding to all elements, starting at the specified root element.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440975.aspx
    //
    processAll: function (rootElement) {

        // TODO (CLEANUP): This and .process() share an awful lot of similarity...

        return new WinJS.Promise(function (onComplete) {

            // If the caller didn't specify a root element, then process the entire document.
            if (!rootElement)
                rootElement = document;
            else {
                // Process the element
                blueskyUtils.ensureDatasetReady(rootElement);
                if (rootElement.dataset && rootElement.dataset.winControl)
                    WinJS.UI._processElement(rootElement);
            }

            // Add winControl objects to all elements tagged as data-win-control
            $("[data-win-control]", rootElement).each(function () {

                // IE9 doesn't automagically populate dataset for us; fault it in if necessary
                blueskyUtils.ensureDatasetReady(this);

                // Process the element
                WinJS.UI._processElement(this);
            });

            // Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
            setTimeout(function () { onComplete(); }, 0);
        });
    },


    // ================================================================
    //
    // private Function: WinJS.UI._processElement
    //
    //		Processes a single DOM element; called by WinJS.UI.process and WinJS.UI.processAll
    //
    _processElement: function (element) {

        /*DEBUG*/
        // Parameter validation
        if (!element)
            console.error("WinJS.UI._processElement: Undefined or null element specified.");
        /*ENDDEBUG*/

        // If we've already processed the element in a previous call to process[All], then don't re-process it now.
        if (element.winControl)
            return;

        // If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
        // into a valid JS object before passing to the constructor.
        var options = element.dataset.winOptions ? blueskyUtils.convertDeclarativeDataStringToJavascriptObject(element.dataset.winOptions) : null;

        // Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object

        // Note: I originally had an eval here (evil, sure, but short and sweet), but the minify borked on it.  Here's the original line:
        //		element.winControl = eval("new window." + element.dataset.winControl + "(element, options)");
        // Then I wanted to do this (less evil, prettier than the above):
        //		element.winControl = new window[element.dataset.winControl](element, options);
        // ... but that doesn't work if element.dataset.winControl (a string) contains multiple depth (e.g. Test.Foo.Bar), since
        // window["Test.Foo.Bar"] != window["Test"]["Foo"]["Bar"]
        //
        // So I ended up with the following pained but functional approach.
        //
        var parts = element.dataset.winControl.split(".");
        var controlConstructor = window;
        for (var i = 0; i < parts.length; i++) {

            /*DEBUG*/
            if (!controlConstructor)
                break;
            /*ENDDEBUG*/

            controlConstructor = controlConstructor[parts[i]];
        }

        /*DEBUG*/
        if (!controlConstructor) {
            console.error("bluesky: Unknown control specified in WinJS.UI._processElement: " + element.dataset.winControl);
            return;
        }
        /*ENDDEBUG*/

        // Now that we have a pointer to the actual control constructor, instantiate the wincontrol
        element.winControl = new controlConstructor(element, options);

        // Create a reference from the wincontrol back to its source element
        element.winControl.element = element;
    },


    // ================================================================
    //
    // public Function: WinJS.UI.enableAnimations
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/Hh779760.aspx
    // 
    enableAnimations: function () {

        WinJS.UI._animationEnabled = true;
    },


    // ================================================================
    //
    // public Function: WinJS.UI.disableAnimations
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779759.aspx
    // 
    disableAnimations: function () {

        WinJS.UI._animationEnabled = false;

        // Cancel any active animations
        WinJS.UI.Animation._cancelAllActiveAnimations();
    },


    // ================================================================
    //
    // public Function: WinJS.UI.executeAnimation
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779762.aspx
    // 
    _warnedExecuteAnimationNYI: false,
    executeAnimation: function (anim) {

        // TODO: Implement this.
        if (!_warnedExecuteAnimationNYI) {
            console.warn("Bluesky: WinJS.UI.Animation.executeAnimation is NYI");
            _warnedExecuteAnimationNYI = true;
        }
    },


    // ================================================================
    //
    // public function: WinJS.UI.setControl
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440977.aspx
    //
    //  TODO: HMM - trying to do this on Win8 gives a "function not known" exception.  Doc or code bug?
    //
    setControl: function (handler) {

        // Per todo above, not sure what to do here; drop a warning to the console
        /*DEBUG*/
        console.warn("WinJS.UI.setControl is not implemented, as it does not appear to exist on Win8!");
        /*ENDDEBUG*/
    },


    // ================================================================
    //
    // public function: WinJS.UI.eventHandler
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967816.aspx
    //
    eventHandler: function (handler) {

        WinJS.Utilities.markSupportedForProcessing(handler);
    },


    // ================================================================
    //
    // public function: WinJS.UI.scopedSelect
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/Hh921605.aspx
    //
    scopedSelect: function (selector) {

        return document.querySelector(selector);
    },


    // ================================================================
    //
    // public Function: WinJS.UI.isAnimationEnabled
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh779793.aspx
    // 
    _animationEnabled: true,
    isAnimationEnabled: function () {
        return _animationEnabled;
    },


    // ================================================================
    //
    // public enumeration: WinJS.UI.TapBehavior
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701303.aspx
    //
    TapBehavior: {
        directSelect: "directSelect",
        toggleSelect: "invoke",			// TODO: Why does Win8 have this discrepancy?
        invokeOnly: "invokeOnly",
        none: "none"
    },


    // ================================================================
    //
    // public enumeration: WinJS.UI.SelectionMode
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229687.aspx
    //
    SelectionMode: {
        none: "none",
        single: "single",
        multi: "multi"
    },


    // ================================================================
    //
    // public enumeration: WinJS.UI.SwipeBehavior
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701287.aspx
    //
    SwipeBehavior: {
        select: "select",
        none: "none"
    },

    // Unique identifier for each IListDataSource
    _uniqueListId: 1,

    // ================================================================
    //
    // public interface: WinJS.UI.IListDataSource
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211786.aspx
    //
    IListDataSource: WinJS.Class.define(function (sourceList, listItems) {

        this._list = sourceList;
        //this._items = WinJS.Binding.as(listItems);

        // Give this IListDataSource a unique Id to allow for quick equality comparisons
        this._id = WinJS.UI._uniqueListId++;
    },


		// ================================================================
		// WinJS.UI.IListDataSource members
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: WinJS.UI.IListDataSource.getCount
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700660.aspx
		    //
		    getCount: function () {

		        return WinJS.Promise.wrap(this._list.length);
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.IListDataSource.itemFromKey
		    //
		    //		MSDN: TODO
		    //
		    itemFromKey: function (itemKey) {
		        return WinJS.Promise.wrap(this._list.getItemFromKey(itemKey));
		    },



		    // ================================================================
		    //
		    // public function: WinJS.UI.IListDataSource.itemFromIndex
		    //
		    //		MSDN: TODO
		    //
		    itemFromIndex: function (itemIndex) {
		        return WinJS.Promise.wrap(this._list.getAt(itemIndex));
		    },


		    // ================================================================
		    //
		    // public property: WinJS.UI.IListDataSource.list
		    //
		    //		MSDN: TODO
		    //
		    list: {
		        get: function () {
		            return this._list;
		        }
		    },
		}),


    // ================================================================
    //
    // public interface: WinJS.UI.ISelection
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872204.aspx
    //
    ISelection: WinJS.Class.define(function (sourceList) {

        this._list = sourceList;
        this._selectedItems = [];
    },

		// ================================================================
		// WinJS.UI.ISelection members
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.add
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872198.aspx
		    //
		    add: function (items) {
		        var that = this;
		        return new WinJS.Promise(function (c) {
		            // If items is not an array, then convert it into one for simplicity
		            if (items.length === undefined)
		                items = [items];
		            else {
		                // Arrays must contain an object that implements ISelectionRange, which is NYI
		                for (var i = 0; i < items.length; i++) {
		                    if (typeof items[i] != "number") {
		                        console.error("Passing an array of objects to WinJS.UI.ISelection.add, but ISelectionRange is NYI");
		                        break;
		                    }
		                }
		            }

		            // We want to get values from our listview's actual databound list.
		            var curList = that._list.itemDataSource._list;

		            for (var i = 0; i < items.length; i++) {
		                var value = items[i];
		                var item;
		                if (typeof value === "number") {
		                    // value is an index
		                    item = curList.getItem(value);
		                } else {
		                    // value is an object that contains either index or key.  Use key if both are present
		                    if (value.key !== undefined) {
		                        item = curList.getItemFromKey(value);
		                    } else if (value.index !== undefined) {
		                        item = curList.getItem(value);
		                    }
		                        /*DEBUG*/
		                    else {
		                        console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
		                    }
		                    /*ENDDEBUG*/
		                }

		                if (!that._containsItemByKey(item.key)) {
		                    // The item we obtained above may have an index; if this selection's list is a filtered list, then that index may
		                    // be wrong (since it's for the full list).  So: copy the item and set its index here.
		                    item = WinJS.Binding._ListBase.copyItem(item);
		                    item.index = i;

		                    that._selectedItems.push(item);
		                }
		            }

		            // Notify our list
		            that._list._selectionChanged();

		            c(items);
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.remove
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872205.aspx
		    //
		    remove: function (items) {
		        var that = this;
		        return new WinJS.Promise(function (c) {

		            // If items is not an array, then convert it into one for simplicity
		            if (items.length === undefined)
		                items = [items];
		            else {
		                // Arrays must contain an object that implements ISelectionRange, which is NYI
		                console.error("Passing an array of objects to WinJS.UI.ISelection.remove, but ISelectionRange is NYI");
		            }

		            // We want to get values from our listview's actual databound list.
		            var curList = that._list.itemDataSource._list;

		            items.forEach(function (value) {
		                var item;
		                if (typeof value === "number") {
		                    // value is an index
		                    item = curList.getItem(value);
		                } else {
		                    // value is an object that contains either index or key.  Use key if both are present
		                    if (value.key !== undefined) {
		                        item = curList.getItemFromKey(value);
		                    } else if (value.index !== undefined) {
		                        item = curList.getItem(value);
		                    }
		                        /*DEBUG*/
		                    else {
		                        console.warn("Invalid value passed to WinJS.UI.ISelection.add; an object must have either key or index specified.");
		                    }
		                    /*ENDDEBUG*/
		                }

		                var indexOfItem = that._getIndexByKey(item.key);
		                if (indexOfItem != -1)
		                    that._selectedItems.splice(indexOfItem, 1);
		            });

		            // TODO: Notify our list
		            that._list._selectionChanged();

		            c(items);
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.remove
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872199.aspx
		    //
		    clear: function () {
		        var that = this;
		        return new WinJS.Promise(function (c) {
		            that._selectedItems = [];
		            // Notify our list
		            that._list._selectionChanged();
		            c();
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.count
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872200.aspx
		    //
		    count: function () {
		        return this._selectedItems.length;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.getIndices
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872197.aspx
		    //
		    getIndices: function () {
		        var indices = [];
		        var that = this;
		        this._selectedItems.forEach(function (item) {
		            // Our items' indices may have changed (e.g. due to list changing), so get updated index here.
		            // TODO: Should Iselection listen to changes on _list._itemDataSource?
		            var itemIndex = that._list._itemDataSource._list.indexOf(item.data);
		            indices.push(itemIndex);
		        });
		        return indices;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.isEverything
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872203.aspx
		    //
		    isEverything: function () {

		        return this.count == this._list.length;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.getItems
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872201.aspx
		    //
		    getItems: function () {
		        var that = this;
		        return new WinJS.Promise(function (c) {
		            c(that._selectedItems);
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.set
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872207.aspx
		    //
		    set: function (items) {
		        var that = this;
		        return new WinJS.Promise(function () {
		            that._selectedItems = [];
		            return that.add(items);
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.selectAll
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872206.aspx
		    //
		    selectAll: function () {
		        var that = this;
		        that._selectedItems = [];
		        that._list.itemDataSource.getCount().then(function (count) {
		            for (var i = 0; i < count; i++) {
		                that.add(i);
		            }
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.UI.ISelection.getRanges
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh872202.aspx
		    //
		    getRanges: function () {
		        return new WinJS.Promise(function (c) {
		            console.error("WinJS.UI.ISelection.getRanges is NYI");
		            c([]);
		        });
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.ISelection._containsItemByKey
		    //
		    //		Returns true if this selection contains an item with the specified key
		    //
		    _containsItemByKey: function (key) {

		        return this._getIndexByKey(key) != -1;
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.ISelection._getIndexByKey
		    //
		    //		Returns Index of the item in _selectedItems with the specified key, or -1 if not found
		    //
		    _getIndexByKey: function (key) {

		        for (var i = 0; i < this._selectedItems.length; i++)
		            if (this._selectedItems[i].key == key)
		                return i;

		        // Item with specified key not found
		        return -1;
		    }
		})
});

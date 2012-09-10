// ================================================================
//
// WinJS.Binding._ListBase
//
//		Implementation of the WinJS.Binding._ListBase object
//
WinJS.Namespace.define("WinJS.Binding", {

    // Unique identifier for each List
    _uniqueListId: 1,

    // ================================================================
    //
    // private Object: WinJS.Binding._ListBase
    //
    _ListBase: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.Binding._ListBase constructor
		//
        function () {

            // Give this list a unique Id to allow for quick equality comparisons
            this._id = WinJS.Binding._uniqueListId++;
        }, 

		// ================================================================
		// WinJS.Binding._ListBase Member functions
		// ================================================================

        {

            /*DEBUG*/
            // The functions in this debug block are abstract, so if we get into them it means a derived class didn't implement them
            getItem: function (index) {
                console.error("Unexpected call into abstract function _ListBase.getItem");
            },

            getItemFromKey: function (key) {
                console.error("Unexpected call into abstract function _ListBase.getItemFromKey");
            },
            indexOfKey: function (key) {
                console.error("Unexpected call into abstract function _ListBase.indexOfKey");
            },
            length: {
                get: function () {
                    console.error("Unexpected call into abstract function _ListBase.length.getter");
                },
                set: function () {
                    console.error("Unexpected call into abstract function _ListBase.length.setter");
                }
            },

            /*ENDDEBUG*/


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.getAt
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700749.aspx
            //
            getAt: function (index) {

                // Return the value at the specified index.  Note: this multiple level of abstraction is to support
                // Grouped and Filtered lists when they come online.
                return this.getItem(index).data;
            },


            // ================================================================
            //
            // private function: WinJS.Binding._ListBase._getValues
            //
            //		Returns an array that contains the values in this._items
            //
            _getValues: function () {

                // _items is a set (not an array) so we can't just return it but need to array'ize it.
                var values = [];
                for (var i = 0; i < this.length; i++) {
                    var item = this.getItem(i);
                    if (item)
                        values[i] = this.getItem(i).data;
                }

                return values;
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.concat
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700739.aspx
            //
            concat: function (items) {

                // NOTE: Win8 does not return a WinJS.Binding.List (as of release preview), so neither do we.
                // This applies to numerous other functions here as well.
                return this._getValues().concat(items);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.join
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700759.aspx
            //
            join: function (separator) {

                return this._getValues().join(separator || ",");
            },



            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.forEach
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700747.aspx
            //
            forEach: function (callback, thisArg) {

                this._getValues().forEach(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.map
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700766.aspx
            //
            map: function (callback, thisArg) {

                return this._getValues().map(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.some
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700804.aspx
            //
            some: function (callback, thisArg) {

                return this._getValues().some(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.every
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700744.aspx
            //
            every: function (callback, thisArg) {

                return this._getValues().every(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.reduce
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700784.aspx
            //
            reduce: function (callback, initialValue) {

                return this._getValues().reduce(callback, initialValue);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.reduceRight
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700782.aspx
            //
            reduceRight: function (callback, initialValue) {

                return this._getValues().reduceRight(callback, initialValue);
            },

            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.indexOf
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700757.aspx
            //
            indexOf: function (searchElement, fromIndex) {

                return this._getValues().indexOf(searchElement, fromIndex);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.lastIndexOf
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700760.aspx
            //
            lastIndexOf: function (searchElement, fromIndex) {

                var list = this._getValues();
                // Interesting; lastIndexOf doesn't like 'undefined' for fromIndex - at
                // least on FF13.  indexOf (above) doesn't have this problem.  If fromIndex
                // isn't specified then set it to last item in the list
                if (fromIndex === undefined)
                    fromIndex = list.length - 1;
                return list.lastIndexOf(searchElement, fromIndex);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.slice
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700802.aspx
            //
            slice: function (start, end) {

                return this._getValues().slice(start, end);
            },

            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.filter
            //
            //		MSDN:http://msdn.microsoft.com/en-us/library/windows/apps/hh700745.aspx
            //
            filter: function (callback, thisArg) {

                return this._getValues().filter(callback, thisArg);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createFiltered
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700741.aspx
            //
            createFiltered: function (inclusionFunction) {

                return new WinJS.Binding.FilteredListProjection(this, inclusionFunction);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createGrouped
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700742.aspx
            //
            createGrouped: function (groupKeySelector, groupDataSelector) {

                return new WinJS.Binding.GroupedSortedListProjection(this, groupKeySelector, groupDataSelector);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.createSorted
            //
            //		MSDN: TODO
            //
            //      NYI NYI NYI: Stub function that does not actually sort
            //
            createSorted: function (sorterFunction) {

                return new WinJS.Binding.FilteredListProjection(this, function (i) { return true; });
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.addEventListener
            //
            //		MSDN: TODO
            //
            addEventListener: function (eventName, listener) {

                // TODO: Can I leverage DOMEventMixin here now?

                // Create the list of event listeners for the specified event if it does not yet exist
                // TODO: Apply this version of addEventListener to other controls.
                if (!this._eventListeners[eventName])
                    this._eventListeners[eventName] = [];

                // Add the listener to the list of listeners for the specified eventName
                this._eventListeners[eventName].push(listener);

                // Add DOM element event handlers (e.g. click).
                // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
                //this.element.addEventListener(eventName, listener);
            },


            // ================================================================
            //
            // public function: WinJS.Binding._ListBase.removeEventListener
            //
            //		MSDN: TODO
            //
            removeEventListener: function (eventName, listener) {

                /*DEBUG*/
                // Parameter validation
                if (!this._eventListeners[eventName])
                    console.warn("WinJS.Binding.List.removeEventListener: Unknown event '" + eventName + "' specified.  Listener: ", listener);
                /*ENDDEBUG*/

                // TODO: Should removeEventListener work if the caller went through the on* API? If so, then this needs to change in all removeEventListener implementations

                // Remove the listener from the list of listeners for the specified eventName
                var listeners = this._eventListeners[eventName];
                for (var i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return;
                    }
                }

                // Remove DOM element event handlers (e.g. click).
                // TODO: Rationalize this alongside this._eventListeners - I probably don't need both...
                //	this.element.removeEventListener(eventName, listener);
            },

            // ================================================================
            //
            // private function: WinJS.Binding._ListBase._notifyItemChanged
            //
            //		Notify any listeners that an item in the list changed
            //
            _notifyItemChanged: function (eventData) {

                // TODO: These event listeners are all very similar; how best to generalize?
                var eventInfo = {
                    target: this,
                    type: "itemchanged",
                    detail: eventData
                };
                for (var i in this._eventListeners.itemchanged)
                    this._eventListeners.itemchanged[i](eventInfo);
            },


            // ================================================================
            //
            // private function: WinJS.Binding._ListBase._notifyItemRemoved
            //
            //		Notify any listeners that an item in the list was removed
            //
            _notifyItemRemoved: function (eventData) {

                var eventInfo = {
                    target: this,
                    type: "itemremoved",
                    detail: eventData
                };
                for (var i in this._eventListeners.itemremoved)
                    this._eventListeners.itemremoved[i](eventInfo);
            },


            // ================================================================
            //
            // private function: WinJS.Binding._ListBase._notifyItemInserted
            //
            //		Notify any listeners that an item in the list was inserted
            //
            _notifyItemInserted: function (eventData) {

                var eventInfo = {
                    target: this,
                    type: "iteminserted",
                    detail: eventData
                };
                for (var i in this._eventListeners.iteminserted)
                    this._eventListeners.iteminserted[i](eventInfo);
            },
            // Events
            oniteminserted: {
                get: function () { return this._eventListeners["iteminserted"]; },
                set: function (callback) { this.addEventListener("iteminserted", callback); }	// TODO: iteminserted or oniteminserted?
            },
            onitemchanged: {
                get: function () { return this._eventListeners["itemchanged"]; },
                set: function (callback) { this.addEventListener("itemchanged", callback); }
            },
            onitemremoved: {
                get: function () { return this._eventListeners["itemremoved"]; },
                set: function (callback) { this.addEventListener("itemremoved", callback); }
            },

            onitemmoved: {
                get: function () { return this._eventListeners["itemmoved"]; },
                set: function (callback) { this.addEventListener("itemmoved", callback); }
            },
            onreload: {
                get: function () { return this._eventListeners["reload"]; },
                set: function (callback) { this.addEventListener("reload", callback); }
            },
            onitemmutated: {
                get: function () { return this._eventListeners["itemmutated"]; },
                set: function (callback) { this.addEventListener("itemmutated", callback); }
            }
        }, {

            // ================================================================
            //
            // private function: WinJS.Binding._ListBase.copyItem
            //
            //		Creates a copy of a list item
            //
            copyItem: function (item) {
                return {
                    key: item.key,
                    data: item.data,
                    groupKey: item.groupKey,
                    groupSize: item.groupSize,
                };
            },

        }),
});



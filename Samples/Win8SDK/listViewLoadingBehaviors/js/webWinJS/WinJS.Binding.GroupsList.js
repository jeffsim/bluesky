
var GroupsListBase = WinJS.Class.derive(ListBase,
    function (sourceList) {

        this._list = sourceList;
        
        this._groupItems = [];
        this._groupKeys = [];
        this._eventListeners = {
            itemRemoved: [],
            itemInserted: [],
            itemChanged: [],
            itemMoved: []
        };

        sourceList.addEventListener("itemInserted", this._itemInserted.bind(this));
        //sourceList.addEventListener("itemRemoved", this._itemRemoved.bind(this));
        //sourceList.addEventListener("itemChanged", this._itemChanged.bind(this));

        // Initialize groupitems
        for (var i = 0; i < sourceList.length ; i++) {
            var item = sourceList.getItem(i);

            var groupKey = item.groupKey;
            // If the group doesn't exist yet, then add it now
            // tbd: build map instead of iterating.
            var found = false;
            for (var j in this._groupItems)
                if (this._groupItems[j].key == groupKey) {
                    this._groupItems[j].itemKeys.push(item.key);
                    found = true;
                    break;
                }

            if (!found) {
                var newData = { key: groupKey, data: sourceList._groupDataSelector(item.data), itemKeys: [] };
                newData.itemKeys.push(item.key);
                this._groupItems[groupKey] = newData;
                this._groupKeys.push(groupKey);
            }
        }

        this.dataSource = WinJS.Binding.as(this);
    },
    {
        // Event callback - this function is called when an item is added to the list to which we are attached.
        _itemInserted: function (eventData) {

            // NYI NYI NYI
            this._addItem(eventData.item);

            // Propagate the event.
    //        this._notifyItemInserted(eventData);
        },

        length: {
            get: function () {
                return this._groupKeys.length;
            }
        },

        getItem: function (index) {
            var key = this._groupKeys[index];
            return this.getItemFromKey(key);
        },

        getItemFromKey: function (key) {
            return this._groupItems[key];
        },

        _list: null,

        _groupItems: [],
        _groupKeys: [],
    });

// tbd-cleanup: remove this
WinJS.Namespace.define("WinJS.Binding", {
    List: function (v) { return new ListBase(v) },
    FilteredList: function (a, b) { return new FilteredListBase(a, b); },
    GroupedList: function (a, b, c) { return new GroupedListBase(a, b, c); },
    GroupsList: function (sourceList) { return new GroupsListBase(sourceList); }
});

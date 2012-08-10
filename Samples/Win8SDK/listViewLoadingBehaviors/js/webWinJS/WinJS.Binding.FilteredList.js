
var FilteredListBase = WinJS.Class.derive(ListBase,

    function (sourceList, inclusionCallback) {

        this._filteredKeys = [];
        // tbd-cleanup: per ListBase constructor 'tbd', why do I need to redeclare these?
        this._values = {};
        this._keys = [];
        this._eventListeners = {
            itemRemoved: [],
            itemInserted: [],
            itemChanged: [],
            itemMoved: []
        };

        this._list = sourceList;
        this._inclusionCallback = inclusionCallback;

        // Iterate over the items in this list; if the item is chosen for inclusion, then add it to the filtered list
        for (var i = 0; i < sourceList.length ; i++) {
            var item = sourceList.getItem(i);
            if (inclusionCallback(item.data))
                this._filteredKeys.push(item.key);
        }

        // Listen for changes on our source list
        sourceList.addEventListener("itemInserted", this._itemInserted.bind(this));
        sourceList.addEventListener("itemRemoved", this._itemRemoved.bind(this));
        sourceList.addEventListener("itemChanged", this._itemChanged.bind(this));

        this.dataSource = WinJS.Binding.as(this);
    }, {
        // Event callback - this function is called when an item is added to the list to which we are attached.
        _itemInserted: function (eventData) {
            if (this._inclusionCallback(eventData.value)) {
                this._filteredKeys.push(eventData.key);

                // Propagate the event.
                this._notifyItemInserted(eventData);
            }
        },

        indexOf: function (item) {
            return this._filteredKeys.indexOf(item.key);
        },

        length: {
            get: function () {
                return this._filteredKeys.length;
            }
        },
        getItem: function (index) {
            return this.getItemFromKey(this._filteredKeys[index]);
        },

        // tbd-perf: How to avoid the need to bubble all of the way up?  e.g. can I keep track of 'topmost' list?
        getItemFromKey: function (key) {
            return this._list.getItemFromKey(key);
        },

        _itemRemoved: function (eventData) {
            var key = eventData.key;
            var index = this._filteredKeys.indexOf(key);
            this._filteredKeys.splice(index, 1);

            // Propagate the event
            this._notifyItemRemoved(eventData);
        },

        _itemChanged: function (eventData) {
            // nothing to do - just propagate the changed event.
            this._notifyItemChanged(eventData.key);
        },

        _filteredKeys: [],

        _inclusionCallback: null,
    });

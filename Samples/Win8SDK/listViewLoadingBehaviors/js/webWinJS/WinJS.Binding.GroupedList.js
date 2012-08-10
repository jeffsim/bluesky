"use strict";

var GroupedListBase = WinJS.Class.derive(ListBase,

    function (sourceList, groupKeySelector, groupDataSelector) {

        //  this._filteredKeys = [];
        // tbd-cleanup: per ListBase constructor 'tbd', why do I need to redeclare these?
        this._values = {};
        this._keys = [];
        this._eventListeners = {
            itemRemoved: [],
            itemInserted: [],
            itemChanged: [],
            itemMoved: []
        };
        this._groupedItems = [];
        this._groupsProjection = null;
        this._sortedKeys = [];  // tbd: move into separate SortedListBase
        this._list = sourceList;
        this._groupKeySelector = groupKeySelector;
        this._groupDataSelector = groupDataSelector;
        sourceList.addEventListener("itemInserted", this._itemInserted.bind(this));
        //      sourceList.addEventListener("itemRemoved", this._itemRemoved.bind(this));
        //    sourceList.addEventListener("itemChanged", this._itemChanged.bind(this));

        // tbd: generalize this into ListBase.
        this.dataSource = WinJS.Binding.as(this);

        // initialize keys and sort
        this._sortedKeys = [];  // tbd: move into separate SortedListBase?
        for (var i = 0; i < sourceList.length ; i++) {
            var item = sourceList.getItem(i);
            this._sortedKeys.push(item.key);
        }
        this.sortKeys();

        // initialize grouped items
        for (var i = 0; i < sourceList.length ; i++) {
            var item = sourceList.getItem(i);
            this._addItem(item);
        }
    }, {
        _addItem: function (item) {

            // Get the group for the item
            var groupKey = this._groupKeySelector(item.data);
            var itemData = { data: item.data, groupKey: groupKey, key: item.key };
            this._groupedItems[item.key] = itemData;
        },

        indexOf: function (item) {
            return this._sortedKeys.indexOf(item.key);
        },

        sortKeys: function () {
            var that = this;
            this._sortedKeys.sort(function (left, right) {
                left = that._groupKeySelector(that._list.getItemFromKey(left).data);
                right = that._groupKeySelector(that._list.getItemFromKey(right).data);
                if (left < right) return -1;
                if (left == right) return 0;
                return 1;
            });
        },

        length: {
            get: function () {
                return this._sortedKeys.length;
            }
        },

        getItem: function (index) {
            var key = this._sortedKeys[index];
            return this.getItemFromKey(key);
        },

        getItemFromKey: function (key) {
            return this._groupedItems[key];
        },

        // Event callback - this function is called when an item is added to the list to which we are attached.
        _itemInserted: function (eventData) {

            this._addItem({ key: eventData.key, data: eventData.value });

            // tbd: how to cache this to minimize perf impact?
            this._sortedKeys.push(eventData.key);
            this.sortKeys();

            // Propagate the event.
            this._notifyItemInserted(eventData);
        },

        groups: {
            get: function () {
                if (this._groupsProjection == null)
                    this._groupsProjection = new WinJS.Binding.GroupsList(this);
                return this._groupsProjection;
            }
        },

        _curGroupKey: 0,

        _groupsProjection: null,

        _groupKeySelector: null,
        _groupDataSelector: null,

        _groupedItems: [],
        _sortedKeys: []
    });
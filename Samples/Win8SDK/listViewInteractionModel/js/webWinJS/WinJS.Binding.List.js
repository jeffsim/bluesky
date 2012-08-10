// ================================================================
//
// Class: WinJS.Binding.List
//
var ListBase = WinJS.Class.define(
    function (values) {
        // tbd-cleanup: figure out why I need to explicitly re-declare these.  If I don't do this here,
        // then they are treated as static (across all ListBases).  Likely something about
        // Object.defineProperties and setting enumerable or somesuch...
        this._values = {};
        this._keys = [];
        this._eventListeners = {
            itemRemoved: [],
            itemInserted: [],
            itemChanged: [],
            itemMoved: []
        };

        // If caller specified values with which to pre-populate this list, then do so now.  Note that
        // we do not trigger item inserted in the initialization scenario.
        if (values != undefined) {

            for (var i in values)
                this._addValue(values[i]);
        }
        // initialize our dataSource by creating a binding Source object around our list.  Other components (e.g. ListView)
        // can subscribe to this dataSource as their item list, and will get notified of updates to the list
        this.dataSource = WinJS.Binding.as(this);
    }, {
        push: function (value) {
            var valueKey = this._addValue(value);
            this._notifyItemInserted({ key: valueKey, value: value });
        },

        indexOf: function (item) {
            return this._keys.indexOf(item.key);
        },

        splice: function (index, amount) {
            while (amount > 0) {
                var key = this._keys[index];
                var removedValue = this._values[key].data;
                this._keys.splice(index, 1);
                delete this._values[key];
                this._notifyItemRemoved({ key: key, value: removedValue });
                amount--;
            }
        },

        setAt: function (index, value) {

            var key = this._keys[index];
            this._values[key].data = value;
            this._notifyItemChanged(key);
        },

        createFiltered: function (inclusionFunction) {
            return new WinJS.Binding.FilteredList(this, inclusionFunction);
        },

        createGrouped: function (groupKeySelector, groupDataSelector) {
            var g = new WinJS.Binding.GroupedList(this, groupKeySelector, groupDataSelector);
            return g;
        },

        addEventListener: function (eventName, listener) {

            this._eventListeners[eventName].push({ listener: listener });
        },

        length: {
            get: function () {
                return this._keys.length;
            }
        },

        getAt: function(index) {
            return this.getItem(index).data;
        },

        getItem: function (index) {
            return this.getItemFromKey(this._keys[index]);
        },

        getItemFromKey: function(key) {
            return this._values[key];
        },

        // internal functions
        _addValue: function (value) {
            var valueKey = this._currentKey;
            this._values[valueKey] = {
                key: valueKey,
                data: value,
                index: this._keys.length
            };
            this._keys.push(valueKey);
            this._currentKey++;
            return valueKey;
        },

        _notifyItemChanged: function (eventData) {
            for (var i in this._eventListeners.itemInserted)
                this._eventListeners.itemChanged[i].listener(eventData);
        },

        _notifyItemRemoved: function (eventData) {
            for (var i in this._eventListeners.itemInserted)
                this._eventListeners.itemRemoved[i].listener(eventData);
        },

        _notifyItemInserted: function (eventData) {
            for (var i in this._eventListeners.itemInserted)
                this._eventListeners.itemInserted[i].listener(eventData);
        },


        _eventListeners: {
            itemRemoved: [],
            itemInserted: [],
            itemChanged: [],
            itemMoved: []
        },

        _keys: [],
        _values: {},
        _currentKey: 0,
    }
);

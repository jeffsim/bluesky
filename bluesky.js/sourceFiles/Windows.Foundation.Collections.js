// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVectorView
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVectorView: WinJS.Class.define(function () {
        this._items = [];
    },
    {
        // TODO (CLEANUP): Derive this from Array.
        // TODO (CLEANUP): Function header comment blocks
        getAt: function (index) {
            if (index < this._items.length)
                return this._items[index];
            return null;
        },


        getMany: function (index, start) {
            console.error("IVector.getMany NYI");
        },

        indexOf: function (item) {
            return this._items.indexOf(item);
        },
        size: function () {
            return this._items.length;
        }
    })
});

// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVector
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVector: WinJS.Class.derive(Windows.Foundation.Collections.IVectorView, function () {
        this._items = [];
    },
    {
        // TODO (CLEANUP): Function header comment blocks

        // MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br206632.aspx
        append: function (value) {
            this._items.push(value);
        },


        clear: function () {
            this._items = [];
        },


        getAt: function (index) {
            if (index < this._items.length)
                return this._items[index];
            return null;
        },


        getMany: function (index, start) {
            console.error("IVector.getMany NYI");
        },

        getView: function () {
            console.error("IVector.getView NYI");
        },

        indexOf: function (item) {
            return this._items.indexOf(item);
        },
        insertAt: function (index, item) {
            return this._items.splice(index, 0, item);
        },
        removeAt: function (index) {
            this._items.splice(index, 1);
        },
        removeAtEnd: function () {
            return this._items.pop();
        },
        replaceAll: function (newItems) {
            this._items.clear();
            newItems.forEach(function (item) {
                this._items.append(item);
            });
        },
        setAt: function (index, item) {
            if (index < this._items.length)
                this._items[index] = item;
        },
        size: function () {
            return this._items.length;
        }
    })
});
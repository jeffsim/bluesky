// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVectorView
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVectorView: WinJS.Class.derive(Array, function () {
        // constructor
    }, {
        // members
        getAt: function (i) {
            return this[i];
        },
        getMany: function (startIndex) {
            return this.slice(startIndex);
        },
        indexOf: function (item) {
            return this.indexOf(item);
        },
        size: {
            get: function () { return this.length; }
        }
    })
});


// =========================================================
//
// Implementation of Windows.Foundation.Collections.IMapView
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IMapView: WinJS.Class.derive(Object, function () {
        // constructor
    }, {
        // members
        size: {
            get: function () { return this.length; }
        },

        hasKey: function (key) {
            return this[key] !== undefined;
        },

        lookup: function (key) {
            if (this[key] === undefined)
                return undefined;

            return this[key];

            /* TODO: Following code trips up when 'values' object in ApplicationData.  To repro, uncomment and run applicationdata sdk sample app, scenario 3
                     For now we just return the original object, which should work for majority of cases.

            // lookup appears to clone objects on win8 so... so do we.
            //     var clonedObject = jQuery.extend(true, {}, this[key]);
            // var clonedObject = JSON.parse(JSON.stringify(this[key]))
            // See following for why this approach: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
            // I didn't use Resig's approach because if this[key] is a string (which it often is), then it creates a new object for every character...
            //  I also didn't use the parse/stringify approach as outlined since it can hit cyclic errors
            var seen = [];
            var clonedObject = JSON.parse(JSON.stringify(this[key], function (key, val) {
                if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return undefined;
                    seen.push(val);
                }
                return val;
            }));

            return clonedObject;
            */
        },

        split: function (first, second) {
            console.warn("bluesky NYI: IMapView.split");
        }
    })
});


// =========================================================
//
// Implementation of Windows.Foundation.Collections.IVector
//
WinJS.Namespace.define("Windows.Foundation.Collections", {
    IVector: WinJS.Class.derive(Windows.Foundation.Collections.IVectorView, function () {
    },
    {
        // TODO (CLEANUP): Function header comment blocks

        // MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br206632.aspx
        append: function (value) {
            this.push(value);
        },


        clear: function () {
            this.length = 0;
        },


        getView: function () {
            console.error("IVector.getView NYI");
        },

        insertAt: function (index, item) {
            return this.splice(index, 0, item);
        },
        removeAt: function (index) {
            this.splice(index, 1);
        },
        removeAtEnd: function () {
            return this.pop();
        },
        replaceAll: function (newItems) {
            this.clear();
            newItems.forEach(function (item) {
                this.append(item);
            });
        },
        setAt: function (index, item) {
            if (index < this.length)
                this[index] = item;
        },
    })
});
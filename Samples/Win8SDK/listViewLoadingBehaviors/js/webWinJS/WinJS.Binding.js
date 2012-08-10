"use strict";

// ================================================================
//
// WinJS.Binding
//
// This is the root WinJS.Binding namespace/object
WinJS.Namespace.defineWithParent(WinJS, "Binding", {

    // ================================================================
    //
    // Function: WinJS.Binding.as
    //
    // Given an object, returns an observable object to which the caller can subsequently bind via this.bind().
    //  field; data: Type (object) -- The object to observe
    as: function (data) {

        // Create a wrapper around the data which can be bound to
        var result = new this._observableObjectWrapper(data);

        // Keep a reference to the source data list.
        // tbd: what's the refcount/memory story on Javascript?
        result._list = data;

        return result;
    },
    
    // ================================================================
    //
    // Internal function: observableObjectWrapper
    //
    // This internal object type is used to wrap a Javascript object and enable bind() to be called upon it.  It works by
    // adding a getter/setter to a field (specified in the bind call), which then calls a specified callback function whenever
    // that field's value changes.
    _observableObjectWrapper: function (data) {

        this.bind = function (fieldName, delegate) {
            // Add a getter and setter to out bound data for the specified field; when the field's value is set, we'll call the specified delegate
            // See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty for details and examples of how to
            // use Object.defineProperty.
            Object.defineProperty(this, fieldName, {
                get: function () {
                    return data[fieldName];
                },
                set: function (newValue) {
                    var oldValue = data[fieldName];
                    data[fieldName] = newValue;
                    delegate(oldValue, newValue);
                },
                configurable: true,
                enumerable: true
            });
        }
    },


    // ================================================================
    //
    // Function: WinJS.Binding.processAll
    //
    // Looks for the data-win-bind attribute at the specified element (and all decendeants of that element).  Performs
    // an in-place replacement of field/value.
    // TBD: The arg order is inconsistent in the win8 sdk docs.  http://msdn.microsoft.com/en-us/library/windows/apps/hh700358.aspx lists it
    //      as (element, object), while http://msdn.microsoft.com/en-us/library/windows/apps/br229846.aspx lists it as (object, element, skipRoot).
    //      I've adopted the former but this will need to be cleaned up.
    processAll: function (rootElement, dataContext) {

        // Iterate (recursively) over all elements within rootElement that have "data-win-bind" set
        $("[data-win-bind]", rootElement).each(function () {
            // ensure dataset in IE9-
            webWinJS.Utilities._ensureDatasetReady(this);

            // Convert Win8 data-win-bind string (which is quasi-valid js format) into a js object.
            var winBinds = webWinJS.Utilities._convertDeclarativeDataStringToJavascriptObject(this.dataset.winBind);

            // tbd-bug: multiple binds in one data-win-bind aren't working, but they should be.  They get enumerated properly
            // in the for loop; not yet sure where it's falling down.
            for (var targetField in winBinds) {

                // Get the field (e.g. firstName) which we're binding to the target (e.g. textContent).
                var sourceField = winBinds[targetField];

                // Update bound value immediately
                // tbd: I'm assuming (but am not 100% sure) that I should do this even if dataContext is a bindSource.
                WinJS.Binding._updateBoundValue(this, targetField, dataContext[sourceField]);

                // If the dataContext is observable (e.g. was generated by calling WinJS.Binding.as()), then establish a bind contract so that
                // we can update the UI when the bound object's values change.
                if (dataContext.bind != undefined) {

                    var thisElement = this;
                    dataContext.bind(sourceField, function (newValue, oldValue) {

                        // At this point, the source data to which this element's field is bound has changed; update our UI to reflect the new value
                        WinJS.Binding._updateBoundValue(thisElement, targetField, dataContext[sourceField]);
                    });
                }
            }
        });

        // tbd: Implement data-win-bindsource
    },


    // ================================================================
    //
    // Internal Function: WinJS.Binding._updateBoundValue
    //
    //  Immediately updates the specified bound element/field to the new value
    _updateBoundValue: function (targetElement, targetField, newValue) {

        // TBD: I fully expect there's a good JS'y way to deref from object["style.backgroundColor"] to object.style.backgroundColor, but I don't 
        // know what it is yet.  Once I figure that out, I can just use that.  For now though, hard-coding support for 1 and 2 '.'s
        if (targetField.indexOf(".") >= 0) {

            // Handle binding to "style.backgroundColor" and similar fields.  Per above, I'm hoping to collapse this into the 'else' code, and also
            // generically extend to support "foo.bar.xyz.abc"
            var fields = targetField.split('.');
            targetElement[fields[0]][fields[1]] = newValue;
        } else {

            // "innerText" isn't supported on FireFox, so convert it to the W3C-compliant textContent property.  I suspect there will be 
            // more of these one-offs as we support more browsers.  Good reference: http://www.quirksmode.org/dom/w3c_html.html#t07See
            if (targetField == "innerText")
                targetField = "textContent";

            // Set the target element's target field to the source data's corresponding field.  Oh, the joy of javascript...
            targetElement[targetField] = newValue;
        }
    }
});

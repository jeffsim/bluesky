// ================================================================
//
// WinJS.Binding namespace
//
//		MSDN Docs: http://msdn.microsoft.com/en-us/library/windows/apps/br229775.aspx
//
WinJS.Namespace.defineWithParent(WinJS, "Binding", {

    // ================================================================
    //
    // public function: WinJS.Binding.as
    //
    //		Given an object, returns an observable object to which the caller can subsequently bind via this.bind().
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229801.aspx
    //
    as: function (data) {

        // We only wrap objects
        if (typeof data === "object") {

            // If we've already wrapped it then return the existing observable wrapper
            if (data._observable)
                return data._observable;

            // Create an observable wrapper object around the data.
            var observableClass = WinJS.Binding.define(data);

            // Return the observable object.  Caller can bind to data via the wrapper's .bind() function.
            return new observableClass(data);

        } else {
            // We can only wrap objects; entities such as numbers and functions are not observable.
            return data;
        }
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.bind
    //
    //      MSDN: TODO
    //
    //      TODO: Not fully implemented or tested
    //
    bind: function (source, data) {

        // Ensure the source is observable
        var bindingSource = WinJS.Binding.as(source);

        // Iterate over all keys in the data, hooking up on-change callback functions and recursing in as needed
        Object.keys(data).forEach(function (dataKey) {

            // If the current data item is a callback function then bind it to changes on the specified key.
            // If instead the data item is an object then recurse into it.
            var bindingData = data[dataKey];
            if (typeof (bindingData) === "function") {

                // Bind changes to the 'dataKey' member on the surce object to the function 'bindingData'
                bindingSource.bind(dataKey, bindingData);
            }
            else {

                // The item is an object; recurse into it and bind its subobjects.  Also, when the object itself changes we'll rebind here.
                bindingSource.bind(dataKey, function (bindableObject) {
                    WinJS.Binding.bind(bindableObject, bindingData);
                });
            }
        });
        return bindingSource;
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.define
    //
    //      MSDN: TODO
    //
    define: function (data) {

        // Return a function that generates an observable class with the properties in the specified data object
        var newClass = WinJS.Class.define(function (initialState) {

            initialState = initialState || {};

            // Store a reference to the original source data
            this.backingData = initialState;

            // Initialize listeners
            this.listeners = {};

            // Mix in the initial data values
            var bindableData = WinJS.Binding.expandProperties(initialState);
            Object.defineProperties(this, bindableData);

            // Store references to and from the observer
            initialState._observable = this;
            this._observable = this;
        },

		// ================================================================
		// WinJS.Binding.BoundClass members
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: WinJS.Binding.bind
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211857.aspx
		    //
		    bind: function (name, action) {

		        // Create the list of listeners for 'name' if not yet created
		        this.listeners[name] = this.listeners[name] || [];

		        // If name has already been bound to action then there's nothing more to do
		        if (this.listeners[name].indexOf(action) >= 0)
		            return this;

		        this.listeners[name].push(action);

		        // Do a one-time upfront change notification on the value
		        action(this[name]);

		        return this;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.Binding.getProperty
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701588.aspx
		    //
		    getProperty: function (name) {

		        return WinJS.Binding.as(this.backingData[name]);
		    },


		    // ================================================================
		    //
		    // public function: WinJS.Binding.setProperty
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701610.aspx
		    //
		    setProperty: function (name, value) {

		        this.updateProperty(name, value);

		        // return this object
		        return this;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.Binding.updateProperty
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701633.aspx
		    //
		    updateProperty: function (name, value) {

		        var oldValue = this.backingData[name];
		        var newValue = WinJS.Binding.unwrap(value);

		        // If the value didn't change then we don't fire notifications, but we still need to return a promise
		        if (newValue == oldValue)
		            return WinJS.Promise.as();

		        // The value changed; update it in the source data
		        this.backingData[name] = newValue;

		        // Notify any listeners of the change
		        return this.notify(name, newValue, oldValue);
		    },


		    // ================================================================
		    //
		    // public function: WinJS.Binding.notify
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701592.aspx
		    //
		    notify: function (name, newValue, oldValue) {

		        // If nothing's listening to changes on the property 'name' then just return
		        if (!this.listeners[name])
		            return WinJS.Promise.as();

		        // Notifications must be asynchronous, so wrap them in a timeout
		        // TODO: What if a notification is already in the wings (e.g. value changes again before this promise completes)?
		        //		 Keep a list of pending notifications by name and remove pending ones.
		        var that = this;
		        return WinJS.Promise.timeout()
					.then(function () {

					    that.listeners[name].forEach(function (listener) {
					        listener(newValue, oldValue)
					    });
					})
					.then(function () {
					    return newValue;
					});
		    },
		});

        // Combine the list of properties from 'data' into the class prototype we created above.
        return WinJS.Class.mix(newClass, WinJS.Binding.expandProperties(data));
    },


    // ================================================================
    //
    // public function: WinJS.Binding.unwrap
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211870.aspx
    //
    unwrap: function (data) {

        if (data && data.backingData)
            return data.backingData;

        return data;
    },


    // ================================================================
    //
    // public function: WinJS.Binding.expandProperties
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229817.aspx
    //
    expandProperties: function (shape) {

        var properties = {};

        while (shape) {
            Object.keys(shape).forEach(function (propertyName) {

                properties[propertyName] = {

                    get: function () {
                        return this.getProperty(propertyName);
                    },

                    set: function (propertyValue) {
                        return this.setProperty(propertyName, propertyValue);
                    },

                    // allow the property to show up in for..in loops
                    enumerable: true,

                    // Allow the property's attributes to be modified
                    configurable: true
                }
            });
            shape = Object.getPrototypeOf(shape);
        }
        return properties;
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.processAll
    //
    //		Looks for the data-win-bind attribute at the specified element (and all descendants of that element).  Performs
    //		an in-place replacement of field/value.
    //
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229846.aspx
    //
    //		TODO: Add support for parameter 'skipRoot'
    //		TODO: Add support for parameter 'bindingCache'
    //		TODO: Add support for data-win-bindsource
    //
    processAll: function (rootElement, dataContext, skipRoot, bindingCache) {

        /*DEBUG*/
        // Check for NYI parameters or functionality
        if (skipRoot)
            console.warn("WinJS.Binding.processAll - support for skipRoot is not yet implemented");
        if (bindingCache)
            console.warn("WinJS.Binding.processAll - support for bindingCache is not yet implemented");
        if ($("[data-win-bindsource]", rootElement).length > 0)
            console.warn("WinJS.Binding.processAll - support for data-win-bindsource is not yet implemented");
        /*ENDDEBUG*/

        return new WinJS.Promise(function (onComplete) {
            // Iterate (recursively) over all elements within rootElement that have "data-win-bind" set
            $("[data-win-bind]", rootElement).each(function () {

                // IE9 doesn't automagically populate dataset for us; fault it in if necessary
                blueskyUtils.ensureDatasetReady(this);

                // Convert Win8 data-win-bind string (which is quasi-valid js format) into a js object.
                var winBinds = blueskyUtils.convertDeclarativeDataStringToJavascriptObject(this.dataset.winBind);

                // Iterate over all specified win-binds.
                for (var targetField in winBinds) {
                    var winBind = winBinds[targetField];

                    // If a converter was specified, then include it in the binding process.
                    var convIndex = winBind.indexOf(" ");
                    var converter = null;
                    if (convIndex > -1) {
                        // A converter was specified; grab the name of the converter (after the space) and set the name
                        // of the field to the contents before the space
                        var parts = winBind.split(" ");
                        converter = eval(parts[1]);
                        winBind = parts[0];
                    }

                    // Source and target fields can contain... interesting... contents, such as "background.color['green']".  Parse them out here.
                    var targetFields = WinJS.Binding._parseFields(targetField);
                    var sourceFields = WinJS.Binding._parseFields(winBind);

                    WinJS.Binding._bindField(this, targetFields, sourceFields, dataContext, converter);
                }
            });

            // Notify that we've fulfilled our promise to processAll
            onComplete();
        });
    },


    // ================================================================
    //
    // private Function: WinJS.Binding._parseFields
    //
    //      The usual format for source and target binding fields is e.g. "color" or "background.color"; however, they can 
    //      also contain values such as "color['green']".  This function parses these strings into arrays
    //
    _parseFields: function (fieldString) {

        // First, perform the 'usual' parse
        var fields = fieldString.split('.');
        var results = [];

        // Now iterate over all of the fields, parsing unusual formats as we go
        // TODO: This is incomplete and only parsing a few scenarios.  I need to understand the full breadth of what we need to support here, and implement
        //       that.  Also TODO: can we merge this into the win-option parsing code?
        fields.forEach(function (field) {

            // Handle special cases
            if (field.indexOf('[') > -1) {
                // special case: handle foo['bar']
                // TODO (CLEANUP): Use regex here.  Also: very special-cased right now.
                var firstField = field.substr(0, field.indexOf('['));
                var secondFieldStart = field.substr(firstField.length + 2);
                var secondField = secondFieldStart.substr(0, secondFieldStart.indexOf(']') - 1);
                results.push(firstField);
                results.push(secondField);

            } else {

                // default case
                results.push(field);
            }
        });

        return results;
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.converter
    //
    //      MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229809.aspx
    //
    converter: function (doConvert) {

        // Create and return a default initializer for the specified doConvert function
        return WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            return doConvert(source[sourceProperty]);
        });
    },


    // ================================================================
    //
    // public Function: WinJS.Binding.initializer
    //
    //      MSDN: TODO
    //
    initializer: function (converter) {
        return converter;
    },


    // ================================================================
    //
    // private Function: WinJS.Binding._bindField
    //
    //  listens for changes on the specified data field and updates the specified DOM element when the field changes
    //
    _bindField: function (targetElement, targetField, sourceField, dataContext, initializer) {

        // Get an observable wrapper around dataContext and bind to that
        var observer = WinJS.Binding.as(dataContext);
        if (observer._observable)
            observer = observer._observable;

        // If the dataContext is observable then establish a bind contract so that we can update the target when the bound object's values change.
        // Although the previous line set up an observable wrapper, if dataContext isn't observable (e.g. it's a number) then we couldn't wrap it.
        if (observer) {

            var lastProperty = targetField[targetField.length - 1];

            // Source field can be multiple levels deep (e.g. "style.background.color").  If there's only one then bind to it; if there's more than
            // one then we need to recurse in, binding as we go
            if (sourceField.length == 1) {

                // We're at the 'end' of the source field; bind _changes to that field_ (sourceField[0]) on _the observer_ to
                // set the _targetElement's targetProperty_ to the updated value.
                observer.bind(sourceField[0], function (newValue) {
                    if (initializer)
                        newValue = initializer(dataContext, sourceField, targetElement, targetField);
                    var t = targetElement;
                    for (var i = 0; i < targetField.length - 1; i++)
                        t = t[targetField[i]];
                    t[lastProperty] = newValue;
                });

            } else {

                // We are binding to a complex property.  
                var subData = {};
                var currentNode = subData;

                // Iterate over the elements of the source Field, generating an object tree structure that matches it and setting the 'bottom' node
                for (var i = 0; i < sourceField.length; i++) {
                    if (i == sourceField.length - 1)
                        currentNode[sourceField[i]] = function (newValue) {
                            targetElement[lastProperty] = newValue;
                        };
                    else
                        currentNode = currentNode[sourceField[i]] = {};
                }

                return WinJS.Binding.bind(observer, subData);
            }
        }
    }
});

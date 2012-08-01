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

		// If data is an object then wrap it; otherwise just return it as-is
		if (typeof data === "object") {

			// Create a bindable wrapper around the data.
			var BoundClass = WinJS.Binding.define(data);

			// Return the observable object.  Caller can bind to data via the wrapper's .bind() function.
			return new BoundClass(data);
		} else {
			return data;
		}
	},


	define: function (data) {

		// Return a function that generates an observable class with the properties in the specified data object
		var newClass = WinJS.Class.define(function (initialState) {

			// set initial data
			this.sourceData = initialState || {};
			for (var key in initialState) {

				try {
					// TODO: If the target is a function that only has a getter, then this borks.  What should we do in
					// that case - or for functions in general?  try/catching for now.
					this.sourceData[key] = initialState[key];

				} catch (e) {
				}
			}
		},

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

				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.getProperty
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701588.aspx
			//
			getProperty: function (name) {

				return WinJS.Binding.as(this.sourceData[name]);
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

				var oldValue = this.sourceData[name];
				var newValue = WinJS.Binding.unwrap(value);

				// If the value didn't change then we don't fire notifications, but we still need to return a promise
				if (newValue == oldValue)
					return WinJS.Promise.as();

				// The value changed; update it in the source data
				this.sourceData[name] = newValue;

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


			// Reference to the original source data
			sourceData: {},

			// Listeners
			listeners: {},
		});

		// Combine the list of properties from 'data' into the class prototype we created above.
		WinJS.Class.mix(newClass, WinJS.Binding.expandProperties(data));

		// return the class prototype that we created
		return newClass;
	},


	// ================================================================
	//
	// public function: WinJS.Binding.unwrap
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211870.aspx
	//
	unwrap: function (data) {

		if (data && data.sourceData)
			return data.sourceData;

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
				for (var targetField in winBinds)
					WinJS.Binding._bindField(this, targetField, winBinds[targetField], dataContext);
			});

			// Notify that we've fulfilled our promise to processAll
			onComplete();
		});
	},


	// ================================================================
	//
	// private Function: WinJS.Binding._bindField
	//
	//  listens for changes on the specified data field and updates the specified DOM element when the field changes
	//
	_bindField: function (rootElement, targetField, sourceField, dataContext) {

		// If the dataContext is observable (e.g. was generated by calling WinJS.Binding.as()), then establish a bind contract so that
		// we can update the UI when the bound object's values change.
		if (dataContext.bind != undefined) {
			var thisElement = rootElement;

			dataContext.bind(sourceField, function (newValue, oldValue) {
				// At this point, the source data to which this element's field is bound has changed; update our UI to reflect the new value
				WinJS.Binding._updateBoundValue(thisElement, targetField, dataContext[sourceField]);
			});
		}

		// Update bound value immediately (whether the dataContext is observable or not)
		WinJS.Binding._updateBoundValue(rootElement, targetField, dataContext[sourceField]);
	},


	// ================================================================
	//
	// private Function: WinJS.Binding._updateBoundValue
	//
	//  Immediately updates the specified bound element/field to the new value
	//
	_updateBoundValue: function (targetElement, targetField, newValue) {

		/*DEBUG*/
		// Check for NYI functionality
		if (targetField.split('.').length > 2)
			console.warn("WinJS.Binding._updateBoundValue: field '" + targetField + "' is binding too deeply; only up to 2 levels of depth (e.g. 'style' (1 level) or 'style.backgroundColor' (2 levels)) are currently supported in bound field names.");
		/*ENDDEBUG*/

		// TODO: I fully expect there's a good JS'y way to deref from object["style.backgroundColor"] to object.style.backgroundColor, but I don't 
		// know what it is yet (and am hoping it doesn't involve a for loop).  Once I figure that out, I can just use that.  For now though, I'm
		// hard-coding support for 1 and 2 '.'s
		if (targetField.indexOf(".") >= 0) {

			// Handle binding to "style.backgroundColor" and similar fields.  Per above, I'm hoping to collapse this into the 'else' code, and also
			// generically extend to support "foo.bar.xyz.abc"
			var fields = targetField.split('.');
			targetElement[fields[0]][fields[1]] = newValue;
		} else {

			// "innerText" isn't supported on FireFox, so convert it to the W3C-compliant textContent property.  I suspect there will be 
			// more of these one-offs as we support more browsers.  Good reference: http://www.quirksmode.org/dom/w3c_html.html#t07See
			// TODO: Move this to a DOMElement extension?  Or find other way to not add this cost to non-IE browsers...  is there an existing polyfill for it?
			if (targetField == "innerText")
				targetField = "textContent";

			// Set the target element's target field to the source data's corresponding field.  Oh, the joy of javascript...
			targetElement[targetField] = newValue;
		}
	}
});

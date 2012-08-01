// ================================================================
//
// WinJS.Utilities.QueryCollection
//
//		TODO: functions to add:
//			children method
//			control method
//			hasClass method
//			include method
//			query method
//			removeEventListener method
//			template method
//			toggleClass method
//
WinJS.Namespace.define("WinJS.Utilities", {

	// ================================================================
	//
	// public object: WinJS.Utilities.QueryCollection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211878.aspx
	//
	QueryCollection: WinJS.Class.derive(Array,

		// ================================================================
		//
		// public function: WinJS.Utilities.QueryCollection constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701094.aspx
		//
		function (elements) {

			if (elements) {
				if (elements.length !== undefined) {
					for (var i = 0; i < elements.length; i++) {
						this.push(elements[i]);
					}
				} else {
					this.push(elements);
				}
			}
		},

		// ================================================================
		// WinJS.Utilities.QueryCollection members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.Utilities.setAttribute
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211883.aspx
			//
			setAttribute: function (attr, value) {

				this.forEach(function (item) {
					item.setAttribute(attr, value);
				});
				return this;
			},

			// ================================================================
			//
			// public function: WinJS.Utilities.get
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211874.aspx
			//
			get: function (index) {

				if (index < this.length)
					return this[index];
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.forEach
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh967805.aspx
			//
			forEach: function (callbackFn, thisArg) {

				if (callbackFn) {

					// Use the Array forEach to avoid infinite recursion here.
					return Array.prototype.forEach.call(this, callbackFn, thisArg);
				}
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.addClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211871.aspx
			//
			//		TODO: Remove jQuery wrapping
			//
			addClass: function (newClass) {

				if (newClass) {
					this.forEach(function (item) {
						$(item).addClass(newClass);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.removeClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211881.aspx
			//
			//		TODO: Remove jQuery wrapping
			//
			removeClass: function (classToRemove) {

				if (classToRemove) {
					this.forEach(function (item) {
						$(item).removeClass(classToRemove);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.addClass
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211877.aspx
			//
			listen: function (event, listener, capture) {

				if (event && listener) {
					this.forEach(function (element) {
						element.addEventListener(event, listener, capture);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.setStyle
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211884.aspx
			//
			//		TODO: Remove jQuery wrapping
			//			
			setStyle: function (name, value) {

				if (name && value) {
					this.forEach(function (item) {
						$(item).css(name, value);
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.clearStyle
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211872.aspx
			//
			//		TODO: Remove jQuery wrapping
			//			
			clearStyle: function (name) {

				if (name) {
					this.forEach(function (item) {
						$(item).css(name, "");
					});
				}
				return this;
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.id
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701120.aspx
			//
			//		TODO: Remove jQuery wrapping
			//		
			id: function (name) {

				if (!name)
					return null;

				var element = $("#" + name)[0];
				if (!element)
					return null;

				return new WinJS.Utilities.QueryCollection(element);
			},


			// ================================================================
			//
			// public function: WinJS.Utilities.getAttribute
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211873.aspx
			//
			//		TODO: Remove jQuery wrapping
			//		
			getAttribute: function (name) {
				
				if (this.length == 0)
					return undefined;
				return $(this[0]).attr(name) || null;
			}
		}),
});

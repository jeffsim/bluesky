// ================================================================
//
// WinJS.Utilities
//
//		This is the root WinJS.Utilities namespace/object
//
//		TODO: functions to add:
//			Key enumeration
//			eventMixin object
//			strictProcessing property
//			children function
//			convertToPixels function
//			createEventProperties function
//			data function
//			eventWithinElement function
//			formatLog function
//			getContentHeight function
//			getContentWidth function
//			getMember function
//			getPosition function
//			getRelativeLeft function
//			getRelativeTop function
//			getTotalHeight function
//			getTotalWidth function
//			id function
//			insertAdjacentHTML function
//			insertAdjacentHTMLUnsafe function
//			markSupportedForProcessing function
//			requireSupportedForProcessing method
//			setInnerHTML function
//			setInnerHTMLUnsafe function
//			setOuterHTML function
//			setOuterHTMLUnsafe function
//			startLog function
//			stopLog function

WinJS.Namespace.define("WinJS.Utilities", {

	// ================================================================
	//
	// public function: WinJS.Utilities.ready
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br211903.aspx
	//
	ready: function (callback, async) {

		// TODO: Support async

		return new WinJS.Promise(function (promiseComplete) {
			$(document).ready(function () {
				callback();
				promiseComplete();
			});
		});
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.addClass
	//
	//		Adds the specified class to the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229798.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	addClass: function (element, newClass) {

		if (element)
			$(element).addClass(newClass);
		return element;
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.hasClass
	//
	//		Adds the specified class to the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229829.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	hasClass: function (element, newClass) {

		if (!element)
			return element;
		return $(element).hasClass(newClass);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.toggleClass
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229851.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	toggleClass: function (element, name) {

		if (!element)
			return element;
		return $(element).toggleClass(name);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.removeClass
	//
	//		Removes the specified class from the specified DOM element
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229848.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	removeClass: function (element, classToRemove) {

		if (element)
			$(element).removeClass(classToRemove);
		return element;
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.query
	//
	//		TODO: Remove jQuery wrapping
	//
	query: function (selector, rootElement) {

		// Get the raw DOM elements that match the selector/rootElement combination
		var elements = $(selector, rootElement || document).get();

		// Return a QueryCollection that wraps the DOM elements
		return new WinJS.Utilities.QueryCollection(elements);
	},


	// ================================================================
	//
	// public function: WinJS.Utilities.empty
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229816.aspx
	//
	//		TODO: Remove jQuery wrapping
	//
	empty: function (element) {

		if (element)
			$(element).empty();
		return element;
	}
});

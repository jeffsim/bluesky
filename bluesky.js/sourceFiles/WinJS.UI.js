"use strict";

// ================================================================
//
// WinJS.UI
//
//		This is the root WinJS.UI namespace/object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229782.aspx
//
WinJS.Namespace.define("WinJS.UI", {


	// ================================================================
	//
	// public Function: WinJS.UI.setOptions
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440978.aspx
	//
	setOptions: function (targetObject, members) {

		// If no options specified then exit now
		if (!members)
			return;

		/*DEBUG*/
		// Parameter validation
		if (!targetObject)
			console.error("WinJS.UI.setOptions: Undefined or null targetObject specified.");
		if (!members)
			console.error("WinJS.UI.setOptions: Undefined or null members specified.");
		/*ENDDEBUG*/

		for (var fieldKey in members) {

			var fieldValue = members[fieldKey];

			/*DEBUG*/
			if (!fieldKey)
				console.error("WinJS.UI.setOptions: Setting undefined or null field", targetObject, members);
			if (!fieldValue)
				console.error("WinJS.UI.setOptions: Setting undefined or null field value", targetObject, members, fieldKey);
			/*ENDDEBUG*/

			// If the member starts with "on" AND the targetObject is a function that supports addEventListener, then add the fieldValue as an event listener
			if (fieldKey.toLowerCase().indexOf("on") == 0 && targetObject.addEventListener) {

				// fieldKey is an event and the targetObject supports addEventListener, so add fieldValue as an event
				// if the fieldValue is a function that go ahead and add it; otherwise (e.g. if the options are declaratively defined)
				// we need to eval it.
				// TODO: Is there a non-eval way to do this?
				if (typeof fieldValue === "function")
					targetObject.addEventListener(fieldKey.substr(2), fieldValue);
				else
					targetObject.addEventListener(fieldKey.substr(2), eval(fieldValue));

			} else {

				// fieldKey is not an event
				// TODO: With declaratively specified options (e.g. when defining a Rating Control in HTML), numeric values 
				//		 will be returned here as strings instead of numbers.  While they still equate, they end up as different types.  What's
				//		 the right way to do that?  Are there other types that hit the same issue?
				targetObject[fieldKey] = members[fieldKey];
			}
		}
	},


	// ================================================================
	//
	// public Function: WinJS.UI.process
	//
	//		Applies declarative control binding to the specified element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440976.aspx
	//
	process: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI.process: Undefined or null element specified.");
		/*ENDDEBUG*/

		return new WinJS.Promise(function (onComplete) {

			// IE9 doesn't automagically populate dataset for us; fault it in if necessary
			blueskyUtils.ensureDatasetReady(element);

			// Process the element if a data-win-control was specified on it
			if (element.dataset && element.dataset.winControl) {

				WinJS.UI._processElement(element);

				// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
				setTimeout(function () { onComplete(element.winControl); }, 0);
			}
		});
	},


	// ================================================================
	//
	// public Function: WinJS.UI.processAll
	//
	//		Applies declarative control binding to all elements, starting at the specified root element.
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh440975.aspx
	//
	processAll: function (rootElement) {

		// TODO: multi-depth binding isn't working.  See the ListView test in the Ratings WinJS SDK sample for an example.

		return new WinJS.Promise(function (onComplete) {

			// If the caller didn't specify a root element, then process the entire document.
			if (!rootElement)
				rootElement = document;

			// Add winControl objects to all elements tagged as data-win-control
			$("[data-win-control]", rootElement).each(function () {

				// IE9 doesn't automagically populate dataset for us; fault it in if necessary
				blueskyUtils.ensureDatasetReady(this);

				// Process the element
				WinJS.UI._processElement(this);
			});
			
			// Yield so that any controls we generated during the process call get a chance to finalize rendering themselves before we indicate that we're done
			setTimeout(function () { onComplete(); }, 0);
		});
	},


	// ================================================================
	//
	// private Function: WinJS.UI._processElement
	//
	//		Processes a single DOM element; called by WinJS.UI.process and WinJS.UI.processAll
	//
	_processElement: function (element) {

		/*DEBUG*/
		// Parameter validation
		if (!element)
			console.error("WinJS.UI._processElement: Undefined or null element specified.");
		/*ENDDEBUG*/

		// If data-win-options is specified, then convert Win8's JS-ish data-win-options attribute string 
		// into a valid JS object before passing to the constructor.
		var options = element.dataset.winOptions ? blueskyUtils.convertDeclarativeDataStringToJavascriptObject(element.dataset.winOptions) : null;

		// Create the control specified in data-win-control and attach it to the element; pass data-win-options to the object

		// Note: I originally had an eval here (evil, sure, but short and sweet), but the minify borked on it.  Here's the original line:
		//		element.winControl = eval("new window." + element.dataset.winControl + "(element, options)");
		// Then I wanted to do this (less evil, prettier than the above):
		//		element.winControl = new window[element.dataset.winControl](element, options);
		// ... but that doesn't work if element.dataset.winControl (a string) contains multiple depth (e.g. Test.Foo.Bar), since
		// window["Test.Foo.Bar"] != window["Test"]["Foo"]["Bar"]
		//
		// So I ended up with the following pained but functional approach.
		//
		//		TODO: SURELY there's a better way to do this :P
		//
		var parts = element.dataset.winControl.split(".");
		var controlConstructor = window;
		for (var i = 0; i < parts.length; i++)
			controlConstructor = controlConstructor[parts[i]];

		// Now that we have a pointer to the actual control constructor, instantiate the wincontrol
		element.winControl = new controlConstructor(element, options);

		// Create a reference from the wincontrol back to its source element
		element.winControl.element = element;
	}
});

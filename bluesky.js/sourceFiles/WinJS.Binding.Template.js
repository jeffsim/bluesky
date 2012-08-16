// ================================================================
//
// WinJS.Binding.Template
//
//		Implementation of the WinJS.Binding.Template object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229723.aspx
//
WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.Template
	//
	Template: WinJS.Class.define(

		// ================================================================
		//
		// public function: WinJS.Binding.Template constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229725.aspx
		//
		function (element, options) {

			// If no element was specified then create an empty div
			if (!element)
				element = $("<div></div>")[0];	// TODO: Perf - remove all of these extraneous jQuery wrappings wherever possible

			// Remember our element
			this.element = element;

			// Hide the template
			$(this.element).hide();

			// Set options if specified
			if (options)
				WinJS.UI.setOptions(this, options);

			// TODO: Implement enableRecycling option; seems like a performance tweak, so I've deferred working on it.
			// TODO: What's up with "Template.render.value" in the Win8 docs?  I don't understand it.  Seems almost like doc error,
			//		 so I'm holding off trying to understand it until the next rev of the win8 sdk docs.
		},

		// WinJS.Binding.Template members
		{
			// ================================================================
			//
			// public function: WinJS.Binding.Template.render
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229724.aspx
			//
			render: function (dataContext, container) {

				/*DEBUG*/
				// Parameter validation
				if (!dataContext)
					console.error("WinJS.Binding.Template.render: Undefined or null element dataContext");
				/*ENDDEBUG*/

				// Return a promise that we'll do the binding.

				// TODO: I'm doing "that = this" all over the place because I don't know the js pattern to get "this" to
				// be "this Template" in the Promise below.  I suspect there's some bind (js bind, not winjs bind)-related 
				// solution.  Once known, scour the code and remove the "that = this"'s where possible.
				var that = this;

				var bindElementToData = function (templateElement, data) {

					// If the container doesn't exist then create a new div.  Wrap it in jQuery for simplicity as well
					var $container = $(container || "<div></div>");

					// Add the win-template class to the target
					$container.addClass("win-template");

					// Clone this template prior to populating it
					var $template = $(templateElement).clone();

				    // Give the cloned element a unique identifier
					blueskyUtils.setDOMElementUniqueId($template[0]);

					// Populate the data into the cloned template
					return WinJS.Binding.processAll($template, data).then(function () {

						// Add the now-populated cloned template to the target container
						$container.append($template.children());
						return ($container[0]);
					});
				}

				// Create the promise that will be fulfilled once the element is ready (incl. possibly loading from remote href)
				var elementReady = new WinJS.Promise(function (onComplete) {

					// If href is specified then we need to load it
					if (that.href) {

						// Use Ajax to get the page's contents
						// TODO: Use WinJS.xhr when that's implemented
						$.get(that.href, function (response) {
							onComplete('<div data-win-control="WinJS.Binding.Template">' + response + '</div>');
						});
					} else {
						// No href specified; render using our element
						onComplete(that.element);
					}
				});

				// Before processing, check if the caller specified a timeout.  Per the win8 docs, a value of 0 =
				// no delay, a negative value is an msSetImmediate, and positive is a timeout.  I'm assuming that
				// msSetImmediate just does a yield, in which case it's synonymous with timeout=0.  *technically* they're 
				// different in that timeout=0 doesn't require the yield; but I don't see harm in the extraneous yield.
				var timeoutAmount = Math.max(0, that.processTimeout || 0);
				var renderComplete = WinJS.Promise.timeout(timeoutAmount)

					// let the itemPromise fulfill before continuing
					.then(function () {
						return dataContext;
					})
					.then(function (data) {

						// Data is ready; wait until the element is ready
						// TODO: These nested then's and Promises are ugly as all get-out.  Refactor.
						return elementReady
							.then(function (element) {

								// Finally, do the render
								return bindElementToData(element, data).then(function (result) {
									return result;
								});
							})
					});

				// Return an object with the element and the renderComplete promise
				return {
					element: this.element,
					renderComplete: renderComplete
				};
			},


			// ================================================================
			//
			// public function: WinJS.Binding.Template.renderItem
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701308.aspx
			//
			//		Note: apparently the only usage of renderItem on the internet: http://blogs.msdn.com/b/eternalcoding/archive/2012/04/23/how-to-cook-a-complete-windows-8-application-with-html5-css3-and-javascript-in-a-week-day-2.aspx
			//
			renderItem: function (item, container) {

				/*DEBUG*/
				// Parameter validation
				if (!item)
					console.error("WinJS.Binding.Template.renderItem: Undefined or null element item");
				/*ENDDEBUG*/

				// Win8 expects item to be a Promise that returns {data} - A promise to return that data is passed to render.
				var data = item.then(function (i) {
					return i.data;
				});

				return this.render(data, container);
			}
		})
});

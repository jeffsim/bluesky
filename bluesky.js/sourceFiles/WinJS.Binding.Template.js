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
		{// ================================================================
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

		        // TODO: I'm doing "that = this" all over the place because I don't know the js pattern to get "this" to
		        // be "this Template" in the Promise below.  I suspect there's some bind (js bind, not winjs bind)-related 
		        // solution.  Once known, scour the code and remove the "that = this"'s where possible.
		        var that = this;

		        // We need to grab our place in the target (if defined) so that display order is gauranteed if multiple bindings are happening in parallel.
		        var $placeholder = $("<div class='win-template'></div>");
		        if (container)
		            $(container).append($placeholder);

		        var bindElementToData = function (templateElement, data) {

		            // Clone the template prior to populating it
		            var $template = $(templateElement).clone();

		            // Give the cloned element a unique identifier
		            blueskyUtils.setDOMElementUniqueId($template[0]);

		            // Bind the data into the cloned template
		            return WinJS.Binding.processAll($template[0], data).then(function () {

		                // Add the now-populated cloned template's contents to the target container
		                if (container) {

                            // Place the bound template's contents at the placeholder in the target
		                    var $result = $placeholder.after($template.contents());

                            // Remove the placeholder since we no longer need it
		                    $placeholder.remove();

                            // And return the bound template's contents
		                    return $result[0];
		                } else {

                            // No target element was specified so no placeholder to deal with - just return the bound template's contents
		                    return $template.contents();
		                }
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

		        var renderComplete = WinJS.Promise.as(dataContext).then(function (data) {
		            return elementReady.then(function (element) {
		                return bindElementToData(element, data);
		            });
		        });

		        // Before processing, check if the caller specified a timeout.  Per the win8 docs, a value of 0 =
		        // no delay, a negative value is an msSetImmediate, and positive is a timeout.
		        if (!that.processTimeout) {
		            return renderComplete;
		        } else {

		            // Because bluesky's msSetImmediate is just a timeout(0), we can do this
		            return WinJS.Promise.timeout(Math.max(0, that.processTimeout)).then(function () {

		                return renderComplete;
		            });
		        }
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

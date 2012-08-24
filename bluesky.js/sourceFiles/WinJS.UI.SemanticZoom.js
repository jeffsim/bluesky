// ================================================================
//
// WinJS.UI.SemanticZoom
//
//		Implementation of the WinJS.UI.SemanticZoom object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229690.aspx
//
WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public Object: WinJS.UI.SemanticZoom
	//
	SemanticZoom: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.SemanticZoom constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229692.aspx
		//	
        function (element, options) {

        	/*DEBUG*/
        	// Parameter validation
        	if (!element)
        		console.error("WinJS.UI.SemanticZoom constructor: Undefined or null element specified");
        	/*ENDDEBUG*/

        	// Call into our base class' constructor
        	WinJS.UI.BaseControl.call(this, element, options);

        	// Tag our rootelement with our class and role
        	this.$rootElement.addClass("win-semanticzoom").css("position", "relative");
        	this.$rootElement.attr("role", "ms-semanticzoomcontainer");

        	// Generate the DOM hierarchy for the SemanticZoom control
        	this._$zoomedInElement = $($(">div", this.$rootElement)[0]);
        	this._$zoomedOutElement = $($(">div", this.$rootElement)[1]);
        	this._$zoomContainer = $("<div style='position: absolute; left: 0px; top: 0px; overflow: hidden'></div>").appendTo(this.$rootElement);
        	this._$zoomedInContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomContainer);
        	this._$zoomedOutContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomContainer);
        	this._$zoomedInSubContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomedInContainer);
        	this._$zoomedOutSubContainer = $("<div style='position:absolute;top:0px;left:0px;overflow: hidden'></div>").appendTo(this._$zoomedOutContainer);
        	this._$zoomedInElement.appendTo(this._$zoomedInSubContainer);
        	this._$zoomedOutElement.appendTo(this._$zoomedOutSubContainer);

        	// Set dimensions
        	var dimensions = {
        		width: this.$rootElement.innerWidth(),
        		height: this.$rootElement.innerHeight()
        	};
        	this._$zoomContainer.css(dimensions);
        	this._$zoomedInContainer.css(dimensions);
        	this._$zoomedOutContainer.css(dimensions);
        	this._$zoomedInSubContainer.css(dimensions);
        	this._$zoomedOutSubContainer.css(dimensions);
        	this._$zoomedInElement.css(dimensions);
        	this._$zoomedOutElement.css(dimensions);

        	// Add the zoom button
        	this._addZoomButton();

        	WinJS.UI.processAll(this.element);

            // Start out with zoomedin visible, zoomedout hidden
            // TODO (CLEANUP): Should listview.configureForZoom handle this?
        	this._$zoomedInContainer.css("visibility", "visible");
        	this._$zoomedOutContainer.css("visibility", "hidden");

        	// When the user clicks on an item in the zoomedout control, zoom into it in the zoomedincontrol
        	this._zoomedInView = this._$zoomedInElement[0].winControl;
        	this._zoomedOutView = this._$zoomedOutElement[0].winControl;

            // If zoomedinview is a listview, then forward SemanticZoom calls to it's private functions
        	if (!this._zoomedInView.beginZoom) {
        	    this._zoomedInView.beginZoom = this._zoomedInView._beginZoom;
        	    this._zoomedInView.endZoom = this._zoomedInView._endZoom;
        	    this._zoomedInView.getCurrentItem = this._zoomedInView._getCurrentItem;
        	    this._zoomedInView.configureForZoom = this._zoomedInView._configureForZoom
        	    this._zoomedInView.positionItem = this._zoomedInView._positionItem;
        	}

            // If _zoomedOutView is a listview, then forward SemanticZoom calls to it's private functions
        	if (!this._zoomedOutView.beginZoom) {
        	    this._zoomedOutView.beginZoom = this._zoomedOutView._beginZoom;
        	    this._zoomedOutView.endZoom = this._zoomedOutView._endZoom;
        	    this._zoomedOutView.getCurrentItem = this._zoomedOutView._getCurrentItem;
        	    this._zoomedOutView.configureForZoom = this._zoomedOutView._configureForZoom;
        	    this._zoomedOutView.positionItem = this._zoomedOutView._positionItem;
        	}

            // Call configureForZoom
        	var that = this;
        	this._zoomedInView.configureForZoom(false, true, function () { that.zoomedOut = true; }, 1);
        	this._zoomedOutView.configureForZoom(true, false, function () { that.zoomedOut = false; }, 100);

        	// Initialize values
        	this._enableButton = true;
        	this._locked = false;
        	this._zoomedOut = false;
        	this._zoomFactor = 0.65;

        	// We want to know when the browser is resized so that we can relayout our items.
        	window.addEventListener("resize", this._windowResized.bind(this));

        	// TODO: We want to disconnect our listviews' resize events so that we can fire them *after* we resize things - but I can't quite get it to work.
        	//window.removeEventListener("resize", this._zoomedInView._windowResized);
        	//window.removeEventListener("resize", this._zoomedOutView._windowResized);
        },

		// ================================================================
		// WinJS.UI.SemanticZoom Member functions
		// ================================================================

        {

        	// ================================================================
        	//
        	// private event: WinJS.SemanticZoom._windowResized
        	//
        	//		Called when the browser window is resized; resize ourselves
        	//
        	_windowResized: function (eventData) {

        		// If size hasn't changed, then nothing to do.
        		var newWidth = this.$rootElement.innerWidth();
        		var newHeight = this.$rootElement.innerHeight();
        		if (parseInt(this._$zoomContainer.css("width")) == newWidth && parseInt(this._$zoomContainer.css("height")) == newHeight)
        			return;

        		// Set dimensions
        		var dimensions = { width: newWidth, height: newHeight };
        		this._$zoomContainer.css(dimensions);
        		this._$zoomedInContainer.css(dimensions);
        		this._$zoomedOutContainer.css(dimensions);
        		this._$zoomedInSubContainer.css(dimensions);
        		this._$zoomedOutSubContainer.css(dimensions);
        		this._$zoomedInElement.css(dimensions);
        		this._$zoomedOutElement.css(dimensions);
        	},


        	// ================================================================
        	//
        	// public event: WinJS.SemanticZoom.onzoomchanged
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh994989.aspx
        	//
        	onzoomchanged: {

        		get: function () {
        			// Return the tracked hander
        			return this._onzoomchanged;
        		},

        		set: function (callback) {

        			// Remove previous on* handler if one was specified
        			if (this._onzoomchanged)
        				this.removeEventListener("zoomchanged", this._onzoomchanged);

        			// track the specified handler for this.get
        			this._onzoomchanged = callback;
        			this.addEventListener("zoomchanged", callback);
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.SemanticZoom.enableButton
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/jj126159.aspx
        	//
        	_enableButton: true,
        	enableButton: {

        		get: function () {
        			return this._enableButton;
        		},
        		set: function (value) {
        			this._enableButton = value;
        			this._enableButton ? this._addZoomButton() : this._removeZoomButton();
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.SemanticZoom.locked
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229689.aspx
        	//
        	_locked: false,
        	locked: {

        		get: function () {
        			return this._locked;
        		},
        		set: function (value) {
        			this._locked = value;
        		}
        	},


        	// ================================================================
        	//
        	// public property: WinJS.SemanticZoom.zoomedOut
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229693.aspx
            //
        	_zoomedOut: false,
        	zoomedOut: {

        	    get: function () {
        	        return this._zoomedOut;
        	    },
        	    set: function (isZoomedOut) {
        	        // If the ZoomControl is locked, then ignore zoom set
        	        if (this._locked)
        	            return;

        	        // If same, then ignore
        	        if (this._zoomedOut == isZoomedOut)
        	            return;

        	        this._zoomedOut = isZoomedOut;

        	        // Trigger beginZoom on both the zoomedIn and zoomedOut Views
        	        this._zoomedInView.beginZoom();
        	        this._zoomedOutView.beginZoom();

        	        // TODO (R3): For R1/R2 we're just fading between views when zooming.  In R3 when we add the 'zoom' animation,
        	        //			  we'll need to set initial view scroll offsets here so that they smoothly animate
        	        var itemPromise = (isZoomedOut ? this._zoomedInView : this._zoomedOutView).getCurrentItem();
        	        var that = this;
        	        itemPromise.then(function (current) {

        	            // hide/show the appropriate zoomed in/out container.  _hideElement/_showElement return
        	            // Promises which are fulfilled when the animation has finished; we wait until both
        	            // animations are done before triggering onzoomchanged
        	            var promises = [];
        	            if (isZoomedOut) {

        	                // Set position of the zooming-to ZoomableView
        	                that._zoomedOutView.positionItem(current.item, current.position);

        	                // We're zooming out; hide the zoomedInContainer and show the zoomedOutContainer
        	                promises.push(that._hideElement(that._$zoomedInContainer));
        	                promises.push(that._showElement(that._$zoomedOutContainer));

        	                // Also hide the zoom button, which isn't visible when zoomed out
        	                that._$zoomButton.hide().css({ "visibility": "hidden" });

        	            } else {

        	                // Set position of the zooming-to ZoomableView
        	                that._zoomedInView.positionItem(current.item, current.position);

        	                // We're zooming in; show the zoomedInContainer and hide the zoomedOutContainer
        	                promises.push(that._showElement(that._$zoomedInContainer));
        	                promises.push(that._hideElement(that._$zoomedOutContainer));

        	                // Also show the zoom button, which is visible when zoomed out (if enableButton is true)
        	                if (that.enableButton)
        	                    that._$zoomButton.show().css({ "visibility": "visible" });
        	            }

        	            // Per above, wait until both animations have completed before triggering onzoomchanged.
        	            WinJS.Promise.join(promises).then(function () {

        	                // Trigger endZoom on both the zoomedIn and zoomedOut Views
        	                that._zoomedInView.endZoom();
        	                that._zoomedOutView.endZoom();

        	                // Notify listeners that zoom changed
        	                var event = document.createEvent("CustomEvent");
        	                event.initCustomEvent("zoomchanged", true, false, {});
        	                that.element.dispatchEvent(event);
        	            });
        	        });
        	    }
        	},


        	// ================================================================
        	//
        	// public property: WinJS.SemanticZoom.zoomFactor
        	//
        	//		TODO: NYI; not leveraging this yet.
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701189.aspx
        	//
        	_zoomFactor: 0.65,
        	zoomFactor: {

        		get: function () {
        			return this._zoomFactor;
        		}
        	},


        	// ================================================================
        	//
        	// private function: WinJS.SemanticZoom._showElement
        	//
        	_showElement: function ($element) {

        		// TODO: Animate zoom (in R2)
        		return new WinJS.Promise(function (onComplete) {
        		    $element.fadeIn("fast", function () {
        				$element.css({ "visibility": "visible" });
        				onComplete();
        			});
        		});
        	},


        	// ================================================================
        	//
        	// private function: WinJS.SemanticZoom._hideElement
        	//
        	_hideElement: function ($element) {

        		// TODO: Animate zoom (in R2)
        	    return new WinJS.Promise(function (onComplete) {
        	        if ($element.css("visibility") == "visible") {
        	            $element.fadeOut("fast", function () {
        	                $element.css({ "visibility": "hidden", "display": "block" });
        	                onComplete();
        	            });
        	        }
        		});
        	},


        	// ================================================================
        	//
        	// private function: WinJS.SemanticZoom._addZoomButton
        	//
        	_addZoomButton: function () {

        		this._$zoomButton = $("<button class='win-semanticzoom-button win-semanticzoom-button-location ltr'></button>");
        		this.$rootElement.append(this._$zoomButton);
        		var that = this;
        		this._$zoomButton.click(function () {
        			that.zoomedOut = true;
        		});
        	},


        	// ================================================================
        	//
        	// private function: WinJS.SemanticZoom._removeZoomButton
        	//
        	_removeZoomButton: function () {

        		this._$zoomButton.remove();
        	},


            /*
            // ================================================================
            //
            // private function: WinJS.SemanticZoom._zoomedOutListItemClicked
            //
            //		Called when the user clicks on an item in the zoomed out list view.  Transition to the zoomed-in listview,
            //		scrolled to the clicked-on group.
            //
            _zoomedOutListItemClicked: function (eventData) {

                // Set the item the zoomedin list
                console.error("NYI: eventData x,y", eventData);
                this._zoomedInView.setCurrentItem(eventData.x, eventData.y);

                // Zoom back in to the zoomedin list
                that.zoomedOut = false;
                return;

        		// Zoom out

        		// For now, Semantic Zoom works with grouped lists only, so we can find the first item
        		// in the invoked group, and scroll to it in the zoomed-in listview.
        		// TODO: Support other datasources than grouped lists
        		eventData.detail.itemPromise.then(function (clickedItem) {
        		    that._zoomed
        			// Find the first item in the zoomedinlistview that is in the clicked group
        			// TODO (CLEANUP): Should use IListDataSource for this.
        			var list = that._zoomedInView._itemDataSource._list;
        			for (var i = 0; i < list.length; i++) {
        				var item = list.getItem(i);
        				if (item.groupKey == clickedGroup.key) {
        					// Bring the selected item/group (?) into view
        					that._zoomedInView.indexOfFirstVisible = i;
        					break;
        				}
        			}
        		});
            }*/
        })
});
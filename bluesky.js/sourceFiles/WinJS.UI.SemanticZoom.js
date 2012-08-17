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
        	this._$zoomedInElement = $(">div::nth-child(1)", this.$rootElement);
        	this._$zoomedOutElement = $(">div::nth-child(2)", this.$rootElement);
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
        	this._showElement(this._$zoomedInContainer);
        	this._hideElement(this._$zoomedOutContainer);

        	// When the user clicks on an item in the zoomedout control, zoom into it in the zoomedincontrol
        	// TODO: This only works with ListViews for now.  Need to generalize through IZoomableView in R2/R3
        	this._zoomedInListView = this._$zoomedInElement[0].winControl;
        	this._zoomedOutListView = this._$zoomedOutElement[0].winControl;
        	/*DEBUG*/
        	
        	if (!this._zoomedOutListView)
        		console.error("SemanticZoom only works with ListView subcontrols for R1; IZoomableView will come in R2/R3");
        	if (this._zoomedInListView._groupDataSource != this._zoomedOutListView._itemDataSource)
        		console.error("SemanticZoom currently only works with a grouped listview as the zoomed-in view, and that listview's groupdatasource as the zoomed-out view.  Check the GroupedListview sample for a working example");

        	/*ENDDEBUG*/
        	this._zoomedOutListView.oniteminvoked = this._zoomedOutListItemClicked.bind(this);

        	// Initialize values
        	this._enableButton = true;
        	this._locked = false;
        	this._zoomedOut = false;
        	this._zoomFactor = 0.65;
        },

		// ================================================================
		// WinJS.UI.SemanticZoom Member functions
		// ================================================================

		{

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

					// hide/show the appropriate zoomed in/out container.  _hideElement/_showElement return
					// Promises which are fulfilled when the animation has finished; we wait until both
					// animations are done before triggering onzoomchanged
					var promises = [];
					if (isZoomedOut) {
						// We're zooming out; hide the zoomedInContainer and show the zoomedOutContainer
						promises.push(this._hideElement(this._$zoomedInContainer));
						promises.push(this._showElement(this._$zoomedOutContainer));

						// Also hide the zoom button, which isn't visible when zoomed out
						this._$zoomButton.hide().css({ "visibility": "hidden" });
					} else {

						// We're zooming in; show the zoomedInContainer and hide the zoomedOutContainer
						promises.push(this._showElement(this._$zoomedInContainer));
						promises.push(this._hideElement(this._$zoomedOutContainer));

						// Also show the zoom button, which is visible when zoomed out (if enableButton is true)
						if (this.enableButton)
							this._$zoomButton.show().css({ "visibility": "visible" });
					}

					// Per above, wait until both animations have completed before triggering onzoomchanged.
					var that = this;
					WinJS.Promise.join(promises).then(function () {
						// Notify listeners that zoom changed
						var event = document.createEvent("CustomEvent");
						event.initCustomEvent("zoomchanged", true, false, {});
						that.element.dispatchEvent(event);
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
				// TODO (CLEANUP): Use jQuery's promise functionality here?
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
				// TODO (CLEANUP): Use jQuery's promise functionality here?
				return new WinJS.Promise(function (onComplete) {
					$element.fadeOut("fast", function () {
						$element.css({ "visibility": "hidden" });
						onComplete();
					});
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


			// ================================================================
			//
			// private function: WinJS.SemanticZoom._zoomedOutListItemClicked
			//
			//		Called when the user clicks on an item in the zoomed out list view.  Transition to the zoomed-in listview,
			//		scrolled to the clicked-on group.
			//
			_zoomedOutListItemClicked: function (eventData) {

				// Zoom out
				this.zoomedOut = false;

				// Gor now, Semantic Zoom works with grouped lists only, so we can find the first item
				// in the invoked group, and scroll to it in the zoomed-in listview.
				// TODO: Support other datasources than grouped lists
				var that = this;
				eventData.detail.itemPromise.then(function (clickedGroup) {

					// Find the first item in the zoomedinlistview that is in the clicked group
					// TODO (CLEANUP): Should use IListDataSource for this.
					var list = that._zoomedInListView._itemDataSource._list;
					for (var i = 0; i < list.length; i++) {
						var item = list.getItem(i);
						if (item.groupKey == clickedGroup.key) {

							// Bring the selected item/group (?) into view
							that._zoomedInListView.indexOfFirstVisible = i;
							break;
						}
					}
				});
			}
		})
});
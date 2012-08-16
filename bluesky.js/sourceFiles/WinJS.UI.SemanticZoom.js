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

            // Initialize values
            this._enableButton = true;
            this._locked = false;
            this._zoomedOut = true;
            this._zoomFactor = 0.65;
        },

		// ================================================================
		// WinJS.UI.SemanticZoom Member functions
		// ================================================================

		{
		    // TODO: _doRender?

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
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.SemanticZoom.zoomedOut
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229693.aspx
		    //
		    _zoomedOut: true,
		    zoomedOut: {
		        get: function () {
		            return this._zoomedOut;
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.SemanticZoom.zoomFactor
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701189.aspx
		    //
		    _zoomFactor: 0.65,
		    zoomFactor: {
		        get: function () {
		            return this._zoomFactor;
		        }
		    }
		})
});

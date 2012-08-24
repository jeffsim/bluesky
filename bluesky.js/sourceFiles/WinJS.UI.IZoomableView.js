/*DEBUG*/

// ================================================================
//
// WinJS.UI.IZoomableView
//
//		This is the root WinJS.UI.IZoomableView interface
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229794.aspx
//
//		IZoomableView is an interface (abstract), so technically nothing
//		is needed here.  However, for debug builds we warn if the developer
//		neglected to implement any of the required functions
//

WinJS.Namespace.define("WinJS.UI", {

	// ================================================================
	//
	// public interface: WinJS.UI.IZoomableView
	//
	IZoomableView: WinJS.Class.define(null,

		// ================================================================
		//
		// WinJS.UI.IZoomableView Member functions
		//
		// ================================================================

        {
        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.getPanAxis
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229792.aspx
        	//
        	getPanAxis: function () {
        		if (!this._warnedGetPanAxis) {
        			console.warn("bluesky Warning: IZoomableView.getPanAxis has not been implemented on a derived class");
        			this._warnedGetPanAxis = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.configureForZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229789.aspx
        	//
        	_warnedConfigureForZoom: false,
        	configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {
        		if (!this._warnedConfigureForZoom) {
        			console.warn("bluesky Warning: IZoomableView.configureForZoom has not been implemented on a derived class");
        			this._warnedConfigureForZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.setCurrentItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229796.aspx
        	//
        	_warnedSetCurrentItem: false,
        	setCurrentItem: function (x, y) {
        		if (!this._warnedSetCurrentItem) {
        			console.warn("bluesky Warning: IZoomableView.setCurrentItem has not been implemented on a derived class");
        			this._warnedSetCurrentItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.getCurrentItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229791.aspx
        	//
        	_warnedGetCurrentItem: false,
        	getCurrentItem: function () {
        		if (!this._warnedGetCurrentItem) {
        			console.warn("bluesky Warning: IZoomableView.getCurrentItem has not been implemented on a derived class");
        			this._warnedGetCurrentItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.beginZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229788.aspx
        	//
        	_warnedBeginZoom: false,
        	beginZoom: function () {
        		if (!this._warnedBeginZoom) {
        			console.warn("bluesky Warning: IZoomableView.beginZoom has not been implemented on a derived class");
        			this._warnedBeginZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.positionItem
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229795.aspx
        	//
        	_warnedPositionItem: false,
        	positionItem: function (/*@override*/item, position) {
        		if (!this._warnedPositionItem) {
        			console.warn("bluesky Warning: IZoomableView.positionItem has not been implemented on a derived class");
        			this._warnedPositionItem = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.endZoom
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229790.aspx
        	//
        	_warnedEndZoom: false,
        	endZoom: function (isCurrentView) {
        		if (!this._warnedEndZoom) {
        			console.warn("bluesky Warning: IZoomableView.endZoom has not been implemented on a derived class");
        			this._warnedEndZoom = true;
        		}
        	},


        	// ================================================================
        	//
        	// Public function: WinJS.IZoomableView.handlePointer
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229793.aspx
        	//
        	_warnedHandlePointer: false,
        	handlePointer: function (pointerId) {
        		if (!this._warnedHandlePointer) {
        			console.warn("bluesky Warning: IZoomableView.handlePointer has not been implemented on a derived class");
        			this._warnedHandlePointer = true;
        		}
        	}
        })
});
/*ENDDEBUG*/
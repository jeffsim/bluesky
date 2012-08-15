// ================================================================
//
// Windows.UI.Popups.UICommand
//
//		Implementation of the Windows.UI.Popups.UICommand object
//
//		MSDN: http://msdn.microsoft.com/library/windows/apps/BR242166
//

WinJS.Namespace.define("Windows.UI.Popups", {

    // ================================================================
    //
    // public Object: Windows.UI.Popups.UICommand
    //
    UICommand: WinJS.Class.define(

		// ================================================================
		//
		// public function: Windows.UI.Popups.UICommand constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/br242179
		//	
        function (label, action, commandId) {

            this._label = label;
            this._invoked = action;
            this._id = commandId;
        },

		// ================================================================
		// Windows.UI.Popups.UICommand Member functions
		// ================================================================

		{
		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.id
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.id
		    //	
		    _id: 0,
		    id: {
		        get: function () {
		            return this._id;
		        },
		        set: function (value) {
		            this._id = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.invoked
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.invoked
		    //	
		    _invoked: 0,
		    invoked: {
		        get: function () {
		            return this._invoked;
		        },
		        set: function (value) {
		            this._invoked = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.UICommand.label
		    //
		    //		MSDN: http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.popups.uicommand.label
		    //	
		    _label: 0,
		    label: {
		        get: function () {
		            return this._label;
		        },
		        set: function (value) {
		            this._label = value;
		        }
		    }
		})
});

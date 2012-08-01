"use strict";

// ================================================================
//
// Windows
//
// This is the root Windows namespace/object
WinJS.Namespace.define("Windows", {

    // ================================================================
    //
    // Windows.UI
    //
    //		This is the root Windows.UI namespace/object
    //
    //		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    UI: {
        ViewManagement: {

        	ApplicationView: {
        		value: null,
        	},

            ApplicationViewState: {

            	view: {
					value: null,
            	}
            }
        }
    },


    // ================================================================
    //
    // Windows.ApplicationModel
    //
    //		This is the root Windows.ApplicationModel namespace/object
    //
	//		NYI NYI NYI; just enough to get Windows.Application app lifecycle management unblocked
    //
    ApplicationModel: {
        isWeb: true,
        Activation: {
            ActivationKind: {
                launch: 0
            },

            ApplicationExecutionState: {
                terminated: 0
            }
        }
    },


	// ================================================================
	//
	// Windows.Graphics
	//
	//		TODO: Stubbed out for test purposes
	//
	//		NYI NYI NYI
	//
    Graphics: {
    	Display: {
    		DisplayProperties: {
    		}
    	}
    },

});

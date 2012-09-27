3// ================================================================
//
// WinJS.UI.AppBarIcon
//
//		Implementation of the WinJS.UI.AppBarIcon object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    AppBarIcon: {}
});

// Populate WinJS.UI.AppBarIcon
// TODO (CLEANUP): Don't do this in global context.
var _bsTempIconMap = WinJS.UI.AppBarCommand._iconMap;
for (var i in _bsTempIconMap)
    WinJS.UI.AppBarIcon[_bsTempIconMap[i]] = _bsTempIconMap[i];


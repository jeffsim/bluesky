// =========================================================
//
// Minimalist implementation of Globalization to unblock stockSample
//
WinJS.Namespace.define("Windows.Globalization.DateTimeFormatting", {

    // =========================================================
	//
	//	WinJS.Globalization.DateTimeFormatting.DateTimeFormatter
	//
    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.globalization.datetimeformatting.datetimeformatter
    //
	DateTimeFormatter: WinJS.Class.define(function (formatTemplate) {

		this._formatTemplate = formatTemplate;
	},
    {
    	format: function (date) {
    		// TODO: Parse the format string.  For now, hardcoded to what stockSample needs
    		if (this._formatTemplate == "hour minute")
    			return date.toLocaleFormat();
    		else
    			return "";
    	}
    })
});
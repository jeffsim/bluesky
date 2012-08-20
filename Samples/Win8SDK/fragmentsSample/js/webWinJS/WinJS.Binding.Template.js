// ================================================================
//
// WinJS.Binding.Template implementation.
//
// tbd: integrate into WinJS.Binding namespace properly; can't quite figure out how.
//
WinJS.Binding.Template = WinJS.Binding.Template || constructorHack({
    constructor: function (element, options) {

        // Hide templates
        $(element).hide();
    }
});
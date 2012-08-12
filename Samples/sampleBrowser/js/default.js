// For an introduction to the Grid template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=232446
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    WinJS.strictProcessing();

    app.addEventListener("activated", function (args) {

        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                	
                        return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    // Hides mobile browser's address bar when page is done loading.
    window.addEventListener('load', function (e) {
        setTimeout(function () { window.scrollTo(0, 1); }, 1);
    }, false);

    // iScroll test; not functioning yet
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    app.start();
})();


/*!
 * jQuery TextChange Plugin
 * http://www.zurb.com/playground/jquery-text-change-custom-event
 *
 * Copyright 2010, ZURB
 * Released under the MIT License
 */
(function (a) {
	a.event.special.textchange = {
		setup: function () { a(this).data("lastValue", this.contentEditable === "true" ? a(this).html() : a(this).val()); a(this).bind("keyup.textchange", a.event.special.textchange.handler); a(this).bind("cut.textchange paste.textchange input.textchange", a.event.special.textchange.delayedHandler) }, teardown: function () { a(this).unbind(".textchange") }, handler: function () { a.event.special.textchange.triggerIfChanged(a(this)) }, delayedHandler: function () {
			var c = a(this); setTimeout(function () { a.event.special.textchange.triggerIfChanged(c) },
			25)
		}, triggerIfChanged: function (a) { var b = a[0].contentEditable === "true" ? a.html() : a.val(); b !== a.data("lastValue") && (a.trigger("textchange", [a.data("lastValue")]), a.data("lastValue", b)) }
	}; a.event.special.hastext = { setup: function () { a(this).bind("textchange", a.event.special.hastext.handler) }, teardown: function () { a(this).unbind("textchange", a.event.special.hastext.handler) }, handler: function (c, b) { b === "" && b !== a(this).val() && a(this).trigger("hastext") } }; a.event.special.notext = {
		setup: function () {
			a(this).bind("textchange",
			a.event.special.notext.handler)
		}, teardown: function () { a(this).unbind("textchange", a.event.special.notext.handler) }, handler: function (c, b) { a(this).val() === "" && a(this).val() !== b && a(this).trigger("notext") }
	}
})(jQuery);
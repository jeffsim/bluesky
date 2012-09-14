// ================================================================
//
// WinJS.UI.AppBar
//
//		Implementation of the WinJS.UI.AppBar object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.AppBar
    //
    AppBar: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.AppBar constructor
		//
		//		MSDN: TODO
		//
		function (element, options) {

		    /*DEBUG*/
		    // Parameter validation
		    if (!element)
		        console.error("WinJS.UI.AppBar constructor: Undefined or null element specified");
		    /*ENDDEBUG*/

		    options = options || {};

		    // Set default options
		    this._hidden = (!!options.hidden || options.hidden == "false") ? false : true;
		    this._disabled = (options.disabled == true || options.disabled == "true") ? true : false;
		    this._sticky = (options.sticky == true || options.sticky == "true") ? true : false; // TODO: CLEANUP
		    this._layout = options.layout || "commands";

		    // Track that this is an appbar
		    this._isBlueskyAppBar = true;

		    // Call into our base class' constructor
		    WinJS.UI.BaseControl.call(this, element, options);

		    // Create our DOM hierarchy
		    var $root = this.$rootElement;
		    $root.addClass("win-overlay");
		    $root.addClass("win-appbar");
		    $root.addClass("win-commandlayout");
		    $root.attr("role", "menubar");
		    $root.css("z-index", "1001");
		    $root.css("visibility", this._hidden ? "hidden" : "visible");
		    $root.css("display", this._hidden ? "none" : "block");
		    this.placement = options.placement || "bottom";

		    if (this._layout == "custom") {
		        WinJS.UI.processAll(this.element);
		    }

		    // Populate commands
		    this._commands = [];
		    var that = this;
		    $("button, hr", $root).each(function (i, button) {
		        WinJS.UI.processAll(button);
		        if (button.winControl) {
		            that._commands.push(button.winControl);
		            that.addEventListener("beforehide", button.winControl._appBarHiding.bind(button.winControl));
		        }
		    });

		    // Create click eater (once)
		    // TODO (PERF-MINOR): Check if WinJS.UI._$appBarClickEater exists instead of looking through the DOM.  Doing it this way for now
		    // since I'm not 100% sure how appbar persistence is expected to work across page navs, and want a 100% working solution...
		    if ($(".win-appbarclickeater", $("body")).length == 0) {
		        WinJS.UI._$appBarClickEater = $("<div class='win-appbarclickeater'></div>");
		        WinJS.UI._$appBarClickEater.appendTo($("body"));
		    }

		    // Handle clicks on the appbar click eater
		    WinJS.UI._$appBarClickEater.bind("click", this._clickEaterFunction.bind(this));

		    // When the AppBar loses focus, hide it
		    this.$rootElement.focusout(function (event) {

		        // TODO (CLEANUP): If a flyout is showing from an appbarcommand, then clicking on the flyout should not make the appbar disappear - but since the appbar
		        // disappears if it loses focus, that's exactly what happens.  So, we track the last mousedown that occurred, and in the appbar focusout handler we ignore
		        // the focusout event if it happened very recently.
		        if (WinJS.UI._flyoutClicked && Date.now() - WinJS.UI._flyoutClicked < 250)
		            return;

		        // TODO (CLEANUP): Similar hackiness to above
		        if (that._appBarCommandClickedTime && Date.now() - that._appBarCommandClickedTime < 250)
		            return;

		        if (!that._sticky) {
		            that._hiddenDueToFocusOut = Date.now();
		            that.hide();
		        } else
		            that._hiddenDueToFocusOut = null;

		    });

		    // Capture right-click
		    $("body").bind("contextmenu", { appBar: this }, this._rightClickHandler);

		    // When we're removed from the DOM, unload ourselves
		    this.$rootElement.bind("DOMNodeRemoved", this._unload);
		},

		// ================================================================
		// WinJS.UI.AppBar Member functions
		// ================================================================

		{

		    // ================================================================
		    //
		    // private function: WinJS.UI.AppBar.scopedSelect
		    //
		    //      Called when the app is navigating to a new page; hide appbar
		    //
		    //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
		    //
		    _hideClickEaters: function () {
		        $(".win-appbarclickeater").hide();
		    },

		    // ================================================================
		    //
		    // private function: WinJS.AppBar._rightClickHandler
		    //
		    _rightClickHandler: function (event) {

		        // Prevent default to keep browser's context menu from showing
		        // Don't StopPropagation though, so that other appbars get the event
		        event.preventDefault();

		        var appBar = event.data.appBar;

		        // If we were hidden externally (e.g. our css 'display' property was directly set) instead of through this.hide(), then
		        // change our state to hidden so that we show below)
		        // TODO (CLEANUP): All of the AppBar click-handling makes my skin crawl.
		        if (appBar.$rootElement.css("display") == "none") {
		            appBar._hidden = true;
		            appBar._hiddenDueToFocusOut = null;
		        }

		        // If the user right-clicked while the appbar is visible, then we get a focusout (above) to hide it, and we come here and re-show it, but we shouldn't!
		        // So, if this is happening very soon after a focusout, then don't show
		        if (appBar._hiddenDueToFocusOut && Date.now() - appBar._hiddenDueToFocusOut < 200) {
		            appBar._hiddenDueToFocusOut = null;
		            return;
		        }

		        if (appBar._hidden)
		            appBar.show();
		        else
		            appBar.hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.AppBar._clickEaterFunction
		    //
		    _clickEaterFunction: function () {

		        // If we're not sticky and the user clicked off of the appbar, then hide the appbar
		        if (!this._sticky)
		            this.hide();
		    },


		    // ================================================================
		    //
		    // private function: WinJS.AppBar._unload
		    //
		    _unload: function (event) {

		        // This is called if the appbar OR an element on the appbar (e.g. an appbarcommand) is removed; make sure it's the appbar
		        if (event.target == this) {
		            var appBar = this.winControl;

		            // Remove our click listener from the appbar click eater
		            WinJS.UI._$appBarClickEater.unbind("click", appBar._clickEaterFunction);

		            // TODO: What if there are other appbars visible?
		            WinJS.UI._$appBarClickEater.hide();

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("beforehide", true, true, {});
		            appBar.dispatchEvent(event);

		            // Unbind commands' appbarhiding listeners
		            for (var i = 0; i < appBar._commands.length; i++) {
		                appBar.removeEventListener("beforehide", appBar._commands[i]._appBarHiding);
		            }

		            // Remove our right-click listener from body
		            $("body").unbind("contextmenu", appBar._rightClickHandler);

		            // And remove our listener for when we're removed from the DOM
		            appBar.$rootElement.unbind("DOMNodeRemoved", appBar._unload);
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.layout
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700558.aspx
		    //
		    _layout: "commands",
		    layout: {
		        get: function () {
		            return this._layout;
		        },
		        set: function (value) {
		            this._layout = value;
		            // TODO: Anything to do here?
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.placement
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700567.aspx
		    //
		    _placement: "bottom",
		    placement: {
		        get: function () {
		            return this._placement;
		        },
		        set: function (value) {

		            this._placement = value;

		            // Oddly, the win-bottom/win-top classes don't define bottom/top values.  Do so explicitly here.
		            if (this._placement == "bottom") {
		                this.$rootElement.addClass("win-bottom");
		                this.$rootElement.css({ "top": "auto", "bottom": "0px" });
		            } else {
		                this.$rootElement.addClass("win-top");
		                this.$rootElement.css({ "top": "0px", "bottom": "auto" });
		            }
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.commands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700535.aspx
		    //
		    _commands: [],
		    commands: {
		        set: function (commands) {

		            if (this._layout == "custom")
		                return;

		            // Unbind previous commands' appbarhiding listeners
		            for (var i = 0; i < commands.length; i++) {
		                this.removeEventListener("beforehide", commands[i]._appBarHiding);
		            }

		            // TODO: Does Win8 animate?
		            this._commands = [];
		            this.$rootElement.empty();

		            if (!commands || (typeof commands.length !== "undefined" && commands.length == 0))
		                return;

		            // the 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		            commands = this._realizeCommands(commands);

		            for (var i = 0; i < commands.length; i++) {
		                this._commands.push(commands[i]);
		                this.$rootElement.append(commands[i].element);

		                // the command needs to listen to our hide events so that it can hide flyout (if it has one)
		                this.addEventListener("beforehide", commands[i]._appBarHiding.bind(commands[i]));
		            }
		        }
		    },



		    // ================================================================
		    //
		    // private function: WinJS.AppBar._realizeCommands
		    //
		    _realizeCommands: function (commands) {

		        // Caller can specify one item - if they did then convert it to an array
		        if (typeof commands === "string" || !commands.length)
		            commands = [commands];

		        var realizedCommands = [];

		        // TODO: The MSDN win8 docs say that these functions can take (1) a [array of] string[s], or (2) a [array of] commandbar[s].  However, the MSDN samples
		        //       ALSO pass DOMElements (sigh), so we handle all cases here.  Update this when win8 and MSDN stabilize.
		        // Also note: the docs are unclear on whether or not you can mix-and-match, so we handle them all.
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            if (typeof command === "string") {
		                command = this.getCommandById(command);
		            } else if (command instanceof Element) {
		                command = command.winControl;
		            }
		            realizedCommands.push(command);
		        }
		        return realizedCommands;
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.hideCommands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700551.aspx
		    //
		    hideCommands: function (commands) {

		        if (!commands)
		            return;

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

		        // TODO: Animate removal of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            command._hidden = true;
		            command.$rootElement.css("visibility", "hidden");
		        }
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.showCommands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700570.aspx
		    //
		    showCommands: function (commands) {

		        if (!commands)
		            return;

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

		        // TODO: Animate addition of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            command._hidden = false;
		            command.$rootElement.css("visibility", "visible");
		        }
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.showOnlyCommands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700574.aspx
		    //
		    showOnlyCommands: function (commands) {

		        if (!commands)
		            commands = [];

		        // The 'commands' parameter can be one of several things.  Convert it into an array of AppBarCommand objects
		        commands = this._realizeCommands(commands);

		        // TODO: Animate addition of commands?
		        // TODO (CLEANUP): Do this better.  Currently hiding everything and then showing only the ones specified.
		        for (var i = 0; i < this._commands.length; i++) {
		            this._commands[i]._hidden = true;
		            this._commands[i].$rootElement.css("visibility", "hidden");
		        }
		        this.showCommands(commands);
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.getCommandById
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700547.aspx
		    //
		    getCommandById: function (id) {
		        if (!this._commands)
		            return null;

		        for (var i = 0; i < this._commands.length; i++)
		            if (this._commands[i].id == id)
		                return this._commands[i];

		        return null;
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.disabled
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700540.aspx
		    //
		    _disabled: false,
		    disabled: {
		        get: function () {
		            return this._disabled;
		        },
		        set: function (value) {

		            this._disabled = value;

		            if (this._disabled && !this._hidden) {
		                // Don't call this.hide() since win8 doesn't fire events when hiding due to disabled = true
		                // TODO: Animate
		                this.$rootElement.css("visibility", "hidden");
		                this._hidden = true;
		            }
		        }
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.sticky
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700576.aspx
		    //
		    _sticky: false,
		    sticky: {
		        get: function () {
		            return this._sticky;
		        },
		        set: function (value) {

		            this._sticky = value;
		            if (this._sticky)
		                WinJS.UI._$appBarClickEater.hide();
		            else if (!this._hidden)
		                WinJS.UI._$appBarClickEater.show();
		        }
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.show
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229676.aspx
		    //
		    show: function () {
		        if (this._disabled)
		            return;
		        // TODO: Animate
		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforeshow", true, true, {});
		        this.element.dispatchEvent(event);

		        // Did any listener cancel the event?  If so then don't show
		        // NOTE: As near as I can tell, Win8 does not support cancelling this action (somewhat surprisingly)
		        //if (event.preventDefault)
		        //	return;
		        WinJS.UI._$appBarClickEater.show();

		        // Give the appbar focus
		        this.element.focus();

		        var that = this;
		        this.$rootElement.css("visibility", "visible").fadeIn("fast", function () {
		            that.$rootElement.css("display", "block")
		            that._hidden = false;
		            if (!that._sticky)
		                WinJS.UI._$appBarClickEater.show();
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, true, {});
		            that.element.dispatchEvent(event);
		        });
		    },


		    // ================================================================
		    //
		    // public function: WinJS.AppBar.hide
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229668.aspx
		    //
		    hide: function () {

		        // TODO: Animate
		        if (this._disabled)
		            return;

		        // TODO: Generalize this oft-repeated pattern.
		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforehide", true, true, {});
		        this.element.dispatchEvent(event);

		        // Did any listener cancel the event?  If so then don't hide
		        // NOTE: As near as I can tell, Win8 does not support cancelling this action (somewhat surprisingly)
		        //if (event.preventDefault)
		        //	return;

		        var that = this;
		        this.$rootElement.fadeOut("fast", function () {
		            that.$rootElement.css("visibility", "hidden").css("display", "none")

		            that._hidden = true;
		            WinJS.UI._$appBarClickEater.hide();

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("afterhide", true, true, {});
		            that.element.dispatchEvent(event);
		        });
		    },


		    // ================================================================
		    //
		    // public property: WinJS.AppBar.hidden
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229665.aspx
		    //
		    _hidden: true,
		    hidden: {
		        get:
        		function () {
        		    return this._hidden;
        		}
		    },


		    // ================================================================
		    //
		    // public event: WinJS.AppBar.onafterhide
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212515.aspx
		    //
		    onafterhide: {
		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onafterhide;
		        },

		        set: function (callback) {
		            // Remove previous on* handler if one was specified
		            if (this._onafterhide)
		                this.removeEventListener("afterhide", this._onafterhide);

		            // track the specified handler for this.get
		            this._onafterhide = callback;
		            this.addEventListener("afterhide", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.AppBar.onaftershow
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212516.aspx
		    //
		    onaftershow: {

		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onaftershow;
		        },

		        set: function (callback) {
		            // Remove previous on* handler if one was specified
		            if (this._onaftershow)
		                this.removeEventListener("aftershow", this._onaftershow);

		            // track the specified handler for this.get
		            this._onaftershow = callback;
		            this.addEventListener("aftershow", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.AppBar.onbeforehide
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212517.aspx
		    //
		    onbeforehide: {

		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onbeforehide;
		        },

		        set: function (callback) {
		            // Remove previous on* handler if one was specified
		            if (this._onbeforehide)
		                this.removeEventListener("beforehide", this._onbeforehide);

		            // track the specified handler for this.get
		            this._onbeforehide = callback;
		            this.addEventListener("beforehide", callback);
		        }
		    },


		    // ================================================================
		    //
		    // public event: WinJS.AppBar.onbeforeshow
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212518.aspx
		    //
		    onbeforeshow: {

		        get: function () {
		            // Return the tracked hander (if any)
		            return this._onbeforeshow;
		        },

		        set: function (callback) {
		            // Remove previous on* handler if one was specified
		            if (this._onbeforeshow)
		                this.removeEventListener("beforeshow", this._onbeforeshow);

		            // track the specified handler for this.get
		            this._onbeforeshow = callback;
		            this.addEventListener("beforeshow", callback);
		        }
		    }
		},

		// ================================================================
		// WinJS.UI.AppBar static Member functions
		// ================================================================

        {
            // ================================================================
            //
            // private function: WinJS.UI.AppBar._hideClickEater
            //
            //      Called when the app is navigating to a new page; hide appbar
            //
            //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
            //
            _hideClickEater: function () {
                $(".win-appbar").each(function (i, e) {
                    e.winControl.hide();
                });
            },
        })
});

// ================================================================
//
// Not my finest moment.
//
// So:  On IE, when you $.hide() something, it triggers a focusout.  This allows us to hook and hide
//      the appbar if the app calls $appbar.hide().  On *firefox* though (and possibly other browsers,
//      $.hide() does not trigger focusout.  The *only* way I can see around this is to hook into $.hide()
//      and, if the element in question is an appbar, then tell the actual appbar wincontrol to hide.
//
// TODO: What about other ways to hide, e.g. $appbar.css("display", "none")?  Can hook the same way, but
//       am worried about perf...
//
(function () {
    var orig = $.fn.hide;
    $.fn.hide = function () {
        var result = orig.apply(this, arguments);
        if (this[0] && this[0].winControl && (this[0].winControl._isBlueskyAppBar || this[0].winControl._isFlyout)) {
            this[0].winControl.hide();
        }
        return result;
    }
})();
﻿// ================================================================
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
		    this._hidden = options.hidden == "false" ? false : true;
		    this._disabled = options.disabled == "true" ? true : false;
		    this._sticky = options.sticky == "true" ? true : false;
		    this._layout = options.layout || "commands";
		    // TODO: layout

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
		    this.placement = options.placement || "bottom";

		    if (this._layout == "custom") {
		        WinJS.UI.processAll(this.element);
		    }

		    // Populate commands
		    this._commands = [];
		    var that = this;
		    $("button, hr", $root).each(function (i, button) {
		        WinJS.UI.processAll(button);
		        that._commands.push(button.winControl);
		        that.addEventListener("beforehide", button.winControl._appBarHiding.bind(button.winControl));
		    });

		    // Create click eater
		    this.$clickEater = $("<div class='win-appbarclickeater'></div>");
		    this.$clickEater.prependTo($("body"));
		    this.$clickEater.click(function () {
		        console.log("clickEater");
		        if (!that._sticky)
		            that.hide();
		    });

		    // When the AppBar loses focus, hide it
		    this.$rootElement.focusout(function (event) {

		        // TODO (CLEANUP): If a flyout is showing from an appbarcommand, then clicking on the flyout should not make the appbar disappear - but since the appbar
		        // disappears if it loses focus, that's exactly what happens.  So, we track the last mousedown that occurred, and in the appbar focusout handler we ignore
		        // the focusout event if it happened very recently.
		        if (WinJS.UI._flyoutClicked && Date.now() - WinJS.UI._flyoutClicked < 250)
		            return;
		        if (!that._sticky) {
		            that._hiddenDueToFocusOut = Date.now();
		            that.hide();
		        }
		    });

		    // Capture right-click
		    $("body").bind("contextmenu", function (event) {
		        console.log(22);
		        // Prevent default to keep browser's context menu from showing
		        // Don't StopPropagation though, so that other appbars get the event
		        event.preventDefault();

		        // If the user right-clicked while the appbar is visible, then we get a focusout (above) to hide it, and we come here and re-show it, but we shouldn't!
		        // So, if this is happening very soon after a focusout, then don't show
		        if (that._hiddenDueToFocusOut && Date.now() - that._hiddenDueToFocusOut < 200)
		            return;

		        if (that._hidden)
		            that.show();
		        else
		            that.hide();
		    });
		},

		// ================================================================
		// WinJS.UI.AppBar Member functions
		// ================================================================


		{
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
		        set: function (newCommands) {

		            if (this._layout == "custom")
		                return;

		            // TODO: Does Win8 animate?
		            this._commands = [];
		            this.$rootElement.empty();

		            if (!newCommands)
		                return;

		            // Caller can specify one item - if they did then convert it to an array
		            if (!(newCommands instanceof Array))
		                newCommands = [newCommands];

		            for (var i = 0; i < newCommands.length; i++) {
		                this._commands.push(newCommands[i]);
		                this.$rootElement.append(newCommands[i].element);
		                // the command needs to listen to our hide events so that it can hide flyout (if it has one)
		                this.addEventListener("beforehide", newCommands[i]._appBarHiding.bind(newCommands[i]));
		            }
		        }
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
		        if (!(commands instanceof Array))
		            commands = [commands];

		        // TODO: Animate removal of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            if (typeof command === "string") {
		                command = this.getCommandById(command);
		            }
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
		        if (!(commands instanceof Array))
		            commands = [commands];

		        // TODO: Animate addition of commands
		        for (var i = 0; i < commands.length; i++) {
		            var command = commands[i];
		            if (typeof command === "string")
		                command = this.getCommandById(command);
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
		        if (!(commands instanceof Array))
		            commands = [commands];

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

		        // Give the appbar focus
		        this.element.focus();

		        this.$rootElement.css("visibility", "visible").css("display", "block");
		        this._hidden = false;
		        this.$clickEater.show();
		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("aftershow", true, true, {});
		        this.element.dispatchEvent(event);
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

		        this.$rootElement.css("visibility", "hidden");

		        this._hidden = true;
		        this.$clickEater.hide();

		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("afterhide", true, true, {});
		        this.element.dispatchEvent(event);
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
		})
});
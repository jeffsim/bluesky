// ================================================================
//
// WinJS.UI.SettingsFlyout
//
//		Implementation of the WinJS.UI.SettingsFlyout object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.SettingsFlyout
    //
    //      NYI NYI NYI: Stub
    // 
    SettingsFlyout: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.SettingsFlyout constructor
		//
		//		MSDN: TODO
		//	
        function (element, options) {

            /*DEBUG*/
            // Parameter validation
            if (!element)
                console.error("WinJS.UI.SettingsFlyout constructor: Undefined or null element specified");
            /*ENDDEBUG*/

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            var width = (options && options.width) || "narrow";
            this.widthClass = width == "narrow" ? "win-narrow" : "win-wide";

            // Track that this is a flyout
            this._isFlyout = true;

            // Initialize values
            this._hidden = true;

            // Start out hidden
            this.$rootElement.hide();
        },

		// ================================================================
		// WinJS.UI.SettingsFlyout Member functions
		// ================================================================

		{
		    show: function () {

		        // TODO: Need to mock up a Win8-like 'root level' settings flyout with this.applicationCommands
		        //   ... but how to tell?

		        // If visible already then just return
		        if (!this.hidden)
		            return;

		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforeshow", true, false, {});
		        this.element.dispatchEvent(event);

		        // show
		        var $flyout = $(this.element)
                    .addClass("win-settingsflyout win-overlay " + this.widthClass)
                    .appendTo($("body"))
                    .css("visibility", "visible")
		            .show();

		        // NOTE: For some reason, settingsflyout uses the appbar click eater; I'd've thought it would use the same click eater as regular flyout...
		        $(".win-appbarclickeater").remove();
		        WinJS.UI._$appBarClickEater = $("<div class='win-appbarclickeater'></div>")
                                .appendTo($("body"))
                                .click(this.hide.bind(this))
                                .contextmenu(this.hide.bind(this))
		                        .show();

		        this.$rootElement.mousedown(function (event) {
		            WinJS.UI._flyoutClicked = Date.now();
		        });

		        this._hidden = false;
		        var that = this;
		        new WinJS.UI.Animation.showPopup(this.element, [{ left: "240px" }]).then(function () {

		            // Ensure the flyout is visible and that another flyout didn't close it during the show (e.g. clicking a button in a menu)
		            WinJS.UI._$appBarClickEater.show();

		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("aftershow", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		        this.$rootElement.bind("DOMNodeRemoved", this._unload);
		    },


		    // ================================================================
		    //
		    // private function: WinJS.UI.SettingsFlyout._unload
		    //
		    _unload: function (event) {

		        // This is called if the Flyout OR an element on the Flyout is removed; make sure it's the Flyout
		        if (event.target == this) {

		            // Remove our click listener from the Flyout click eater
		            WinJS.UI._$flyoutClickEater.unbind("click", this._clickEaterFunction);

		            // TODO: Same question as in appbar._unload: should we hide? what if there are multiple flyouts visible and only one is unloaded?
		            WinJS.UI._$flyoutClickEater.hide();

		            // And remove our listener for when we're removed from the DOM
		            if (this.$rootElement)
		                this.$rootElement.unbind("DOMNodeRemoved", this._unload);
		        }
		    },

		    // ================================================================
		    //
		    // public function: WinJS.UI.SettingsFlyout.hide
		    //
		    //		MSDN: TODO
		    //
		    hide: function (anchor, placement, alignment) {

		        // If hidden already then just return
		        if (this.hidden)
		            return;

		        // Remove the light dismiss handler (only needed if hide() is called - light dismiss works w/o it)
		        // TODO: Test - does this work even though we did a bind(this) above?
		        $('body').unbind('click', this._lightDismissHandler);

		        var event = document.createEvent("CustomEvent");
		        event.initCustomEvent("beforehide", true, false, {});
		        this.element.dispatchEvent(event);

		        // Animate the flyout out. 
		        this._hidden = true;
		        var that = this;
		        WinJS.UI._$appBarClickEater.hide();
		        new WinJS.UI.Animation.hidePopup(this.element).then(function () {
		            $(that.element).css("visibility", "hidden");
		            var event = document.createEvent("CustomEvent");
		            event.initCustomEvent("afterhide", true, false, {});
		            that.element.dispatchEvent(event);
		        });

		        // TODO: Does Win8 clear out anchor, placement, and alignment when hidden?
		        this._placement = null;
		        this._anchor = null;
		        this._alignment = null;
		    },


		    // ================================================================
		    //
		    // public event: WinJS.UI.SettingsFlyout.onafterhide
		    //
		    //		MSDN: TODO
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
		    // public event: WinJS.UI.SettingsFlyout.onaftershow
		    //
		    //		MSDN: TODO
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
		    // public event: WinJS.UI.SettingsFlyout.onbeforehide
		    //
		    //		MSDN: TODO
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
		    // public event: WinJS.UI.SettingsFlyout.onbeforeshow
		    //
		    //		MSDN: TODO
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
		    },


		    // ================================================================
		    //
		    // public property: WinJS.UI.SettingsFlyout.hidden
		    //
		    //		MSDN: TODO
		    //
		    _hidden: true,
		    hidden: {
		        get: function () {
		            return this._hidden;
		        }
		    },


		},

		// ================================================================
		// WinJS.UI.SettingsFlyout static Member functions
		// ================================================================

        {
            // ================================================================
            //
            // public function: WinJS.UI.SettingsFlyout.showSettings
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh701259.aspx
            //	
            populateSettings: function (e) {

                /*DEBUG*/
                if (!e.detail.applicationcommands)
                    console.warn("Empty e.detail.applicationcommands passed to SettingsFlyout.populateSettings.");
                /*ENDDEBUG*/

                this.applicationCommands = e.detail.applicationcommands;
            },


            // ================================================================
            //
            // public function: WinJS.UI.SettingsFlyout.showSettings
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh770581.aspx
            //	
            showSettings: function (id, path) {
                // If the specified settings control is already in the DOM, then just show it
                var $settingsControl = $("#" + id);
                if ($settingsControl.length)
                    $settingsControl[0].winControl.show();
                else {

                    // Not in the DOM yet; create a new SettingsFlyout control for the specified settings page
                    var $settingsDiv = $("<div></div>").appendTo($("body"));
                    WinJS.UI.Pages.render(path, $settingsDiv[0]).then(function () {

                        // Grab a pointer to the newly created settings control
                        $settingsControl = $("#" + id);
                        if (!$settingsControl.length) {
                            // Hmm; the id in the html referenced by 'path' doesn't match the specified ID
                            /*DEBUG*/
                            console.warn("SettingsFlyout error: specified Id '" + id + "' does not match the id of the SettingsFlyout control in page '" + path + "'.");
                            /*ENDDEBUG*/
                            $settingsDiv.remove();
                        } else {
                            // Show the newly created SettingsFlyout page
                            $settingsControl[0].winControl.show();
                        }
                    });
                }
            },


            // ================================================================
            //
            // private function: WinJS.UI.SettingsFlyout._hideClickEater
            //
            //      Called when the app is navigating to a new page; hide appbar
            //
            //      TODO: I'm not 100% sure this is the right place to be doing this; what if app doesn't use WinJS.Navigation?
            //
            _hideClickEater: function () {
                $(".win-flyout").each(function (i, e) {
                    e.winControl.hide();
                });
            },
        })
});
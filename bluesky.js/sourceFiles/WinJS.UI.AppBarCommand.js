// ================================================================
//
// WinJS.UI.AppBarCommand
//
//		Implementation of the WinJS.UI.AppBarCommand object
//
//		MSDN: TODO
//
WinJS.Namespace.define("WinJS.UI", {

    // ================================================================
    //
    // public Object: WinJS.UI.AppBarCommand
    //
    AppBarCommand: WinJS.Class.derive(WinJS.UI.BaseControl,

		// ================================================================
		//
		// public function: WinJS.UI.AppBarCommand constructor
		//
		//		MSDN: TODO
		//
        function (element, options) {

            options = options || {};

            // Set default options
            // TODO (CLEANUP): Clean up how options are defined across all wincontrols
            // TODO (CLEANUP): Sanity check: can boolean options come in as strings ("true" instead of true)?  If not, then clean up the below
            this._type = options.type || "button";
            this._section = options.section || "global";
            this._hidden = (options.hidden || options.hidden == "true") ? true : false;
            this._label = options.label || "";
            this._selected = (options.selected || options.selected == "true") ? true : false;

            // Create a base element if one was not provided
            if (!element) {
                // create button or hr based on options.type
                if (options.type == "separator")
                    element = $("<hr/>")[0];
                else
                    element = $("<button data-win-control='WinJS.UI.AppBarCommand'></button>")[0];
                // Give the element a unique id
                blueskyUtils.setDOMElementUniqueId(element);
            }

            // Call into our base class' constructor
            WinJS.UI.BaseControl.call(this, element, options);

            // Set id after we've created the element
            this.id = options.id;
            if (this.id)
                this.$rootElement.attr("id", this.id);
            if (options.extraClass)
                this.$rootElement.addClass(options.extraClass);
            this.tooltip = options.tooltip || this.label;

            this.disabled = (options.disabled || options.disabled == "true") ? true : false;

            this.onclick = options.onclick || null;

            // Create our DOM hierarchy
            var $root = this.$rootElement;
            $root.addClass("win-command");

            if (this.section == "global")
                $root.addClass("win-global");
            else
                $root.addClass("win-selection");
            if (this.type == "toggle")
                $root.attr("role", "menuitemcheckbox");
            else
                $root.attr("role", "menuitem");

            // Create the flyout to show when this button is clicked if type == flyout
            this.flyout = (this.type == "flyout" && options.flyout) || null;

            if (this.type != "separator") {

                if (this.element.children.length == 0) {

                    this.$commandImage = $("<span class='win-commandicon win-commandring'><span class='win-commandimage'></span></span>");
                    $root.append(this.$commandImage);
                    this.$label = $("<span class='win-label'>" + this.label + "</span>");
                    $root.append(this.$label);
                }
            }

            // Fix temporary bug in blueskyUtils.parseJson...
            if (options.icon.indexOf("(") != -1 && options.icon.indexOf(")") == -1)
                options.icon = options.icon + ")";

            this.icon = options.icon || "";

            // Bind click for flyout
            var that = this;
            $root.bind("click", function (event) {
                if (that._flyout) {
                    event.stopPropagation();
                    event.preventDefault();
                    that._flyout.show(that.element, that.placement == "top" ? "bottom" : "top");
                } else {
                    // TODO: See comment in appbar constructor on the purpose behind appBarCommandClickedTime
                    var appBarNode = that.element.parentNode;
                    if (appBarNode && appBarNode.winControl) {
                        appBarNode.winControl._appBarCommandClickedTime = Date.now();
                    }
                }
            });
        },

		// ================================================================
		// WinJS.UI.AppBarCommand Member functions
		// ================================================================

        {
            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.onclick
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700502.aspx
            //
            onclick: {
                get: function () {
                    return ths._prevOnClick;
                },

                set: function (func) {

                    if (!func) {
                        if (this._prevOnClick)
                            this.$rootElement.unbind("click", this._prevOnClick);
                    } else {
                        this.$rootElement.click(func);
                        this._prevOnClick = func;
                    }
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.icon
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700483.aspx
            //
            _icon: true,
            icon: {
                get: function () {
                    return this._icon;
                },
                set: function (value) {
                    this._icon = value;
                    var iconIndex = WinJS.UI.AppBarCommand._iconMap.indexOf(this._icon);
                    if (this.icon.indexOf("url(") == 0)
                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": this._icon,
                            "backgroundPosition": ""
                        });
                    else if (iconIndex >= 0) {
                        var iconStr = (-40 * (iconIndex % 5)) + "px " + (-40 * (Math.floor(iconIndex / 5))) + "px";

                        // TODO (PERF): The app could be using either ui-dark or ui-light, and we want to use different icon png based
                        // on which is loaded.  I'm not sure what the best way is to tell which (if either) is loaded.
                        var iconImage = "http://bluesky.io/images/icons-dark.png";
                        for (var i = 0; i < document.styleSheets.length; i++) {
                            if (document.styleSheets[i].href && document.styleSheets[i].href.toLowerCase().indexOf("ui-dark.css") >= 0) {
                                iconImage = "http://bluesky.io/images/icons.png";
                                break;
                            }
                        }

                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": "url('" + iconImage + "')",
                            "backgroundPosition": iconStr,
                        });
                    } else
                        $(".win-commandimage", this.$rootElement).css({
                            "backgroundImage": "",
                            "backgroundPosition": ""
                        });

                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.label
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700492.aspx
            //
            _label: true,
            label: {
                get: function () {
                    return this._label;
                },
                set: function (value) {
                    this._label = value;
                    this.$label.text(value);
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.disabled
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700457.aspx
            //
            _disabled: true,
            disabled: {
                get: function () {
                    return this._disabled;
                },
                set: function (value) {
                    this._disabled = value;
                    if (this._disabled)
                        this.$rootElement.attr("disabled", "disabled");
                    else
                        this.$rootElement.removeAttr("disabled");
                }
            },

            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.flyout
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700472.aspx
            //
            _flyout: true,
            flyout: {
                get: function () {
                    return this._flyout;
                },
                set: function (value) {
                    // string vs. object
                    if (typeof value === "string")
                        value = new WinJS.UI.Flyout($("#" + value)[0]);
                    this._flyout = value;
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.hidden
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700477.aspx
            //
            _hidden: true,
            hidden: {
                get: function () {
                    return this._hidden;
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.section
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700511.aspx
            //
            _section: true,
            section: {
                get: function () {
                    return this._section;
                },
                set: function (value) {
                    this._section = value;
                    if (this._section == "global")
                        this.$rootElement.removeClass("win-selection").addClass("win-global");
                    else
                        this.$rootElement.removeClass("win-global").addClass("win-selection");
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.type
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700529.aspx
            //
            _type: "button",
            type: {
                get: function () {
                    return this._type;
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.tooltip
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700522.aspx
            //
            _tooltip: "",
            tooltip: {
                get: function () {
                    return this._tooltip;
                },
                set: function (value) {
                    this._tooltip = value;

                    // TODO: Use WinJS.UI.Tooltip when that is implemented
                    this.$rootElement.attr("title", value);
                }
            },


            // ================================================================
            //
            // public property: WinJS.UI.AppBarCommand.selected
            //
            //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700513.aspx
            //
            _selected: "",
            selected: {
                get: function () {
                    return this._selected;
                },
                set: function (value) {
                    this._selected = value;
                    // Win8's styles use the aria-checked attribute to apply selected styling
                    this.$rootElement.attr("aria-checked", value ? "true" : "");
                }
            },


            // ================================================================
            //
            // private function: WinJS.UI.AppBarCommand._appBarHiding
            //
            //		Called by the appbar when it's hiding; this allows us to hide our flyout if we have one and it's showing
            //
            _appBarHiding: function () {

                // If we have a flyout, then hide it
                if (this._flyout)
                    this._flyout.hide();
            }
        }, {
            _iconMap: ['accept', 'back', 'caption', 'contactpresence', 'document',
					  'accounts', 'bold', 'cc', 'copy', 'download',
					  'add', 'bookmarks', 'characters', 'crop', 'edit',
					  'admin', 'browsephotos', 'clear', 'cut', 'emoji',
					  'aligncenter', 'bullets', 'clock', 'delete', 'emoji2',
					  'alignleft', 'calendar', 'closepane', 'disableupdates', 'favorite',
					  'alignright', 'calendarday', 'comment', 'dislike', 'filter',
					  'attach', 'calendarweek', 'contact', 'dockbottom', 'dinf',
					  'attachcamera', 'camera', 'contact2', 'dockleft', 'flag',
					  'audio', 'cancel', 'contactinfo', 'dockright', 'folder',
					  'font', 'home', 'link', 'movetofolder', 'page2',
					  'fontcolor', 'import', 'list', 'musicinfo', 'paste',
					  'forward', 'importall', 'mail', 'mute', 'pause',
					  'globe', 'important', 'mail2', 'next', 'people',
					  'go', 'italic', 'mailforward', 'openfile', 'permissions',
					  'gototoday', 'keyboard', 'mailreply', 'openlocal', 'phone',
					  'hangup', 'leavechat', 'mailreplyall', 'openpane', 'pictures',
					  'help', 'left', 'mappin', 'orientation', 'pin',
					  'hidebcc', 'like', 'message', 'otheruser', 'placeholder',
					  'highlight', 'likedislike', 'more', 'page', 'play',
					  'previewlink', 'repair', 'settings', 'sync', 'video',
					  'previous', 'right', 'shop', 'trim', 'videochat',
					  'priority', 'rotate', 'showbcc', 'twopage', 'view',
					  'protectedocument', 'rotatecamera', 'showresults', 'underline', 'viewall',
					  'read', 'save', 'shuffle', 'undo', 'volume',
					  'redo', 'savelocal', 'slideshow', 'unfavorite', 'webcam',
					  'refresh', 'selectall', 'sort', 'unpin', 'world',
					  'remote', 'send', 'stop', 'up', 'zoom',
					  'remove', 'setlockscreen', 'stopslideshow', 'upload', 'zoomin',
					  'rename', 'settile', 'switch', 'uploadskydrive', 'zoomout'
            ]
        })
});

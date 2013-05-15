// ================================================================
//
// Windows.UI.Popups.MessageDialog
//
//		Implementation of the Windows.UI.Popups.MessageDialog object
//
//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog
//

WinJS.Namespace.define("Windows.UI.Popups", {

    // ================================================================
    //
    // public Object: Windows.UI.Popups.MessageDialog
    //
    MessageDialog: WinJS.Class.define(

		// ================================================================
		//
		// public function: Windows.UI.Popups.MessageDialog constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.messagedialog.aspx
		//	
        function (content, title) {

            /*DEBUG*/
            // Parameter validation
            if (!content)
                console.error("Windows.UI.Popups.MessageDialog constructor: Undefined or null content specified");
            /*ENDDEBUG*/

            this._content = content;
            this._title = title;
            this._commands = new Windows.Foundation.Collections.IVector();
        },

		// ================================================================
		// Windows.UI.Popups.MessageDialog Member functions
		// ================================================================

		{
		    // ================================================================
		    //
		    // public function: Windows.UI.Popups.MessageDialog.showAsync
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.showasync.aspx
		    //	
		    showAsync: function () {
		        var that = this;
		        return new WinJS.Promise(function (onComplete) {

		            // Get the highest z-index item, and place the dialog one higher
		            var highestZ = blueskyUtils.getHighestZIndex();

		            // Create the translucent overlay that appears behind the dialog
		            var $overlay = $("<div style='width:100%;height:100%;background-color:#000;opacity:.5;z-index:" + (highestZ + 1) + "'></div>");
		            $overlay.fadeIn("fast").appendTo("body");

		            // Create the messagebox div
		            var messageTop = ($("html").outerHeight() - 200) / 2;
		            var $message = $("<div></div>")
                        .css({
                            "width": "100%",
                            "background-color": "#fff",
                            "z-index": highestZ + 2,
                            "left": 0,
                            "position": "absolute",
                            "top": messageTop,
                            "padding-bottom": "20px",
                            "right": 0
                        });
		            // TODO: Do the margin trick so that the messagebox stays vertically centered.

		            if (that.title) {
		                // TODO: Make sure < in title doesn't break!
		                var $titleText = $("<div>" + that.title + "</div>")
                            .css({
                                "color": "#000",
                                "font-size": "30pt",
                                "padding-top": "20px",
                                "padding-left": "400px"
                            })
		                    .appendTo($message);
		            }

		            // TODO: Make sure < in content doesn't break!
		            var $titleText = $("<div>" + that.content + "</div>")
                        .css({
                            "color": "#000",
                            "font-size": "16pt",
                            "padding-top": "20px",
                            "padding-left": "400px",
                            "padding-right": "20px"
                        })
                        .appendTo($message);

		            // Add commands.  If none specified then use 'Close'
		            if (that.commands.size == 0) {
		                var closeCommand = new Windows.UI.Popups.UICommand("Close");
		                that.commands.append(closeCommand);
		            }

		            var buttonStart = 1300 - that.commands.size * 200;
		            for (var i = 0; i < that.commands.size ; i++) {
		                var command = that.commands.getAt(i);
		                var backgroundColor = i == that.defaultCommandIndex ? "rgba(53,206,251,1)" : "#ccc";
		                var border = i == that.defaultCommandIndex ? "solid 3px #000" : "solid 3px #ccc";
		                var left = buttonStart + i * 200;
		                var $commandButton = $("<div>" + command.label + "</div>")
                        .css({
                            "color": "#000",
                            "background-color": backgroundColor,
                            "border": border,
                            "width": "150px",
                            "cursor": "pointer",
                            "padding": "8px 6px",
                            "font-size": "12pt",
                            "font-weight": "600",
                            "text-align": "center",
                            "float": "right",
                            "margin-right": "20px",
                            "margin-top": "20px"
                        })
		                .appendTo($message);
		                $commandButton.bind("click", { command: command }, function (event) {
		                    if (event.data.command.invoked)
		                        event.data.command.invoked(event.data.command);
		                    that._close(event.data.command);
		                });
		            }
		            // If we created a temporary 'close' command, then remove it now
		            if (closeCommand)
		                that.commands.clear();

		            $message.fadeIn("fast").appendTo("body");

		            that._$message = $message;
		            that._$overlay = $overlay;

		            // Complete the promise when the dialog closes...
		            that._onClosedPromise = onComplete;
		        });
		    },


		    // ================================================================
		    //
		    // private function: Windows.UI.Popups.MessageDialog._close
		    //
		    //		Called after a button has been pressed and the messagebox should go away.  When done, fulfill our closed promise.
		    //	
		    _close: function (command) {

		        var that = this;
		        this._$overlay.fadeOut("fast", function () {
		            that._$overlay.remove();
		        });
		        this._$message.fadeOut("fast", function () {
		            that._$message.remove();

		            // TODO (CLEANUP): technically the overlay may still be present when we fulfill the closed promise - should really 
                    // join the two fadeout promises together and wait for that before fulfilling our closed promise.
		            that._onClosedPromise(command);
		        });

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.defaultCommandIndex
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.defaultcommandindex.aspx
		    //	
		    _defaultCommandIndex: 0,
		    defaultCommandIndex: {
		        get: function () {
		            return this._defaultCommandIndex;
		        },
		        set: function (value) {
		            this._defaultCommandIndex = value;
		        }

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.cancelCommandIndex
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.cancelcommandindex.aspx
		    //	
		    _cancelCommandIndex: -1,
		    cancelCommandIndex: {
		        get: function () {
		            return this._cancelCommandIndex;
		        },
		        set: function (value) {
		            this._cancelCommandIndex = value;
		        }

		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.commands
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.commands.aspx
		    //	
		    _commands: null,
		    commands: {
		        get: function () {
		            return this._commands;
		        },
		        set: function (value) {
		            this._commands = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.content
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.content.aspx
		    //	
		    _content: "",
		    content: {
		        get: function () {
		            return this._content;
		        },
		        set: function (value) {
		            this._content = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.options
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.options.aspx
		    //	
		    _options: {},
		    options: {
		        get: function () {
		            return this._options;
		        },
		        set: function (value) {
		            this._options = value;
		        }
		    },


		    // ================================================================
		    //
		    // public property: Windows.UI.Popups.MessageDialog.title
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.popups.messagedialog.title.aspx
		    //	
		    _title: "",
		    title: {
		        get: function () {
		            return this._title;
		        },
		        set: function (value) {
		            this._title = value;
		        }
		    }
		})
});

"use strict";

// ================================================================
//
// WinJS.UI.AppBar implementation.
//
WinJS.UI.AppBar = function(element, options) {

    // Create the new AppBar which we'll return to the caller
    var newAppBar = {

        // ================================================================
        //
        // Function: WinJS.UI.AppBar initializer.
        //
        init: function (element, options) {

            // Keep a reference to our root element - that's where we'll render our items into the DOM
            this.$rootElement = $(element);

            // test rendering.  TBD: When should this get called? on appbar show/hide and on button add.
            // tbd: do buttons as a binding list?
            this.render();
        },

        hideCommands: function() {
        },
        showCommands: function() {
        },

        // ================================================================
        //
        // Function: WinJS.UI.AppBar.render
        //
        // Called when the AppBar should "render" itself to the page.
        render: function () {

            // Win8 inserts an "appbarclickeater" div before the appbar; not sure if we need it, but mimic'ing for consistency.
            $("<div class='win-appbarclickeater'></div>").insertBefore(this.$rootElement);

            // Win8 wraps the appbar in an ms-appbardiv div.
            this.$rootElement.wrapAll($("<div id='ms-appbardiv'></div>"));

            // Mimic the classes, role, and styles that Win8 applies to appbars.
            this.$rootElement.addClass("win-overlay win-commandlayout win-appbar win-bottom");
            this.$rootElement.attr("role", "menubar");
            this.$rootElement.attr("unselectable", "on");
            this.$rootElement.css("top"," auto;");
            this.$rootElement.css("bottom","0px;");
            this.$rootElement.css("visibility","visible;");
            this.$rootElement.css("opacity","1;");
        },


        // ================================================================
        //
        // Function: WinJS.UI.AppBar.show
        //
        // Called to show the AppBar
        show: function () {
            this.$rootElement.slideUp();
        },


        // ================================================================
        //
        // Function: WinJS.UI.AppBar.hide
        //
        // Called to hide the AppBar
        hide: function () {
            this.$rootElement.slideDown();
        },


        // $rootElement: The jQuery-wrapped DOM element into which this ListView's items are rendered
        $rootElement: null,
    };

    // Call the initializer on the AppBar that we just created
    newAppBar.init(element, options);

    // Retrun the new AppBar
    return newAppBar;
}

// ================================================================
//
// WinJS.UI.AppBarCommand implementation.
//
WinJS.UI.AppBarCommand = function(element, options) {

    // Create the new AppBarCommand which we'll return to the caller
    var newAppBarCommand = {

        // ================================================================
        //
        // Function: WinJS.UI.AppBarCommand initializer.
        //
        init: function (element, options) {

            // Keep a reference to our root element - that's where we'll render our items into the DOM
            this.$rootElement = $(element);
            this.icon = options.icon;

            // test rendering.  TBD: When should this get called? on appbar show/hide and on button add.
            // tbd: do buttons as a binding list?
            this.render(options);
        },


        // ================================================================
        //
        // Function: WinJS.UI.AppBarCommand.render
        //
        // Called when the AppBarCommand should "render" itself to the page.
        render: function (options) {

            // Mimic the classes, role, and styles that Win8 applies to appbars.
            this.$rootElement.addClass("win-command");
            this.$rootElement.attr("role", "menuitem");
            this.$rootElement.css("top", " auto;");
            this.$rootElement.css("bottom", "0px;");
            this.$rootElement.css("visibility", "visible;");
            this.$rootElement.css("opacity", "1;");
            this.$rootElement.css("display", "inline-block");
            (this.$rootElement)[0].removeAttribute("disabled");

            this.$rootElement.attr("id", options.id);
            this.$rootElement.addClass("win-" + options.section);
            //this.$rootElement.append($("<span class='win-commandicon win-commandring'><span class='win-commandimage'></span></span>"));
            if (this.icon) {
                var iconIndex = this.iconMap.indexOf(this.icon);
                if (this.icon.indexOf("url(") == 0)
                    this.$rootElement.append($("<span class='win-commandicon win-commandring'><span class='win-commandimage' style='background-image: " + this.icon + " !important'></span></span>"));
                else if (iconIndex >= 0) {
                    var iconStr = (-40 * (iconIndex % 5)) + "px " + (-40 * (Math.floor(iconIndex / 5))) + "px";
                    this.$rootElement.append($("<span class='win-commandicon win-commandring'><span class='win-commandimage' style='background-position:" + iconStr + " !important'></span></span>"));
                }
            }
            this.$rootElement.append($("<span class='win-label'>" + options.label + "</span>"));
        },

        iconMap: ['accept', 'back', 'caption', 'contactpresence', 'document',
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
                  'go','italic','mailforward','openfile','permissions',
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
                  'rename','settile','switch','uploadskydrive','zoomout'

        ],
            // $rootElement: The jQuery-wrapped DOM element into which this ListView's items are rendered
        $rootElement: null,

        icon: null,
    };

    // Call the initializer on the AppBarCommand that we just created
    newAppBarCommand.init(element, options);

    // Retrun the new AppBarCommand
    return newAppBarCommand;
}
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
        	this._type = options.type || "button";
        	this._section = options.section || "global";
        	this._hidden = options.hidden || false;
        	this._disabled = options.disabled || false;
        	this._icon = options.icon || "";
        	this._label = options.label || "";
        	this.onclick = options.onclick || null;
        	this._selected = options.selected || false;

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
        		this.$commandImage = $("<span class='win-commandicon win-commandring'><span class='win-commandimage'></span></span>");
        		$root.append(this.$commandImage);
        		this.$label = $("<span class='win-label'>" + this.label + "</span>");
        		$root.append(this.$label);
        	}

        	// Bind click for flyout
        	var that = this;
        	$root.bind("click", function (event) {

        		if (that._flyout) {
        			event.stopPropagation();
        			that._flyout.show(that.element, that.placement == "top" ? "bottom" : "top");
        		}
        	});
        },

		// ================================================================
		// WinJS.UI.AppBarCommand Member functions
		// ================================================================

        {
        	// ================================================================
        	//
        	// public property: WinJS.UI.AppBarCommand.icon
        	//
        	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700483.aspx
        	//
        	_icon: true,
        	icon: {
        		get: function () {
        			return _icon;
        		},
        		set: function (value) {
        			this._icon = value;
        			// TODO: Set in DOM
        			console.error("nyi - change icon in DOM");
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
        			this.$rootElement.attr("disabled", this._disabled ? "disabled" : undefined);
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
        })
});

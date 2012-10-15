// ================================================================
//
// blueskyUtils
//
var blueskyUtils = {

    // ================================================================
    //
    // public function: blueskyUtils.getHighestZIndex
    //
    //      Returns the highest z-index of all elements.  Useful to add DOM elements above all others (e.g. modal dialog box)
    //
    getHighestZIndex: function () {

        var highestIndex = 0;
        $("body > *").each(function (n, e) {
            if ($(e).css("position") != "static")
                highestIndex = Math.max(highestIndex, parseInt($(this).css("z-index")));
        });
        return highestIndex;
    },


    // ================================================================
    //
    // public function: blueskyUtils.removeBSIDFromUrl
    //
    //      Removes a bsid parameter from a URL.  bsid must be last parameter in the URL.
    //
    removeBSIDFromUrl: function (url) {

        // remove timestamp if present
        var href = url.toLowerCase();
        var timeStampIndex = href.indexOf("_bsid");
        if (timeStampIndex >= 0)
            href = href.substr(0, timeStampIndex - 1);
        return href;
    },


    // ================================================================
    //
    // public function: blueskyUtils.setDOMElementUniqueId
    //
    //      Appends a parameter to a querystring, using ? or & appropriately.
    //
    appendQueryStringParam: function (url, param) {
        var char = url.indexOf("?") > -1 ? "&" : "?";
        return url + char + param;
    },


    // ================================================================
    //
    // public function: blueskyUtils.setDOMElementUniqueId
    //
    //      Assigns a unique (to the current DOM) id to the specified element
    //
    _uniqueControlId: 1,
    setDOMElementUniqueId: function(element) {
        // TODO (PERF): Do this without wrapping in $
        $(element).attr("id", "_bs" + (this._uniqueControlId++));
    },


	// ================================================================
	//
	// public Function: blueskyUtils.convertDeclarativeDataStringToJavascriptObject
	//
	// Win8's declarative parameters adopt a quasi-Json format.  This function cleans up a string and returns a string 
	// that can be eval'ed into a Javascript object.
	//
	// Example input: innerText: firstName; style.backgroundColor: backColor
	// Example output: { 'innerText': 'firstName', 'style.backgroundColor': 'backColor' }
	//
	convertDeclarativeDataStringToJavascriptObject: function (dataBindString) {

        // TODO: Temp hack
	    dataBindString = dataBindString.replace("select('#", "").replace(")", "");

		// 1. Wrap keywords (keys and values) in single quotes
		// TODO-I'm wrapping number values in quotes; should I?
		// Note: the regex is trying to match a-z, a-Z, 0-9, -, ., and /      <-- Note that we need to match "." to support compounds like "style.backgroundColor"
		// TODO: Should the middle / be replaced with \/ or //?  I'm not sure what js's replace does here since "/" seems to delimit the regex, but it seems to be working...
		// TODO: This doesn't work with string arrays; e.g. "tooltipStrings:['Horrible','Poor','Fair','Good','Excellent','Delete']" borks.
		dataBindString = dataBindString.replace("\r", "").replace("\n", "").trim();

		// Trim trailing semicolons
		if (dataBindString[dataBindString.length - 1] == ";")
			dataBindString = dataBindString.substring(0, dataBindString.length - 1);

		var output = dataBindString.replace(/([a-zA-z\-0-9\./]+)/g, "'$1'");

		// 1B. The above regex will blindly add quotes to keyword that already have quotes.  Remove them here.
		// tbd-cleanup: merge this into the above regex.
		output = output.replace(/''/g, "'");

		// 1C. TODO - label:'view all' gets parsed into 'label':'view' 'all'.  The regex is officially past my ability to regexify, so
		// I'm hacking it out here.  Note that this won't necessarily work for non-literal strings with > 1 space, but that's okay for now.
		output = output.replace(/' '/g, " ");

		// 1D. TODO - icon:'url(/image.png)' gets parsed into 'icon':'url'('/image.png')'.  Per above, beyond my regfu, so hacking it away
		output = output.replace(/'\('/g, "(");
		output = output.replace(/'\)'/g, ")'");

		// 2. Wrap in curly braces if not already present
		// TODO: again, can probably merge into the regex above
		if (output.trim().indexOf("{") != 0)
			output = "{ " + output + " }";

		// 3. replace semicolon with comma
		output = output.replace(/;/g, ',');

		// 4. JSON prefers double quotes around keys/values
		output = output.replace(/\'/g, '"');

		// 5. convert the string into a javascript object
		try {
			var result = JSON.parse(output);
		} catch (ex) {
			// malformed JSON
			/*DEBUG*/
			console.warn("Malformed JSON passed to blueskyUtils.convertDeclarativeDataStringToJavascriptObject:  " + dataBindString);
			/*ENDDEBUG*/

			var result = "";
		}
		return result;
	},


	// ================================================================
	//
	// public Function: blueskyUtils.ensureDatasetReady
	//
	//		WinJS.Binding Code assumes existence of this.dataset which is HTML5 but not <=IE9.  This code adds this.dataset for IE
	//
	ensureDatasetReady: function (obj) {
		if (obj.dataset != undefined)
			return;

		obj.dataset = {};

		if (obj.attributes == undefined)
			return;

		// TODO: security - ensure it's data-\w+-\w+-..
		for (var ia = 0; ia < obj.attributes.length; ia++) {
			var aname = obj.attributes[ia].name;
			if (aname.substr(0, 5) == "data-") {
				var anbits = aname.split('-');
				var elemName = "";
				for (var ib = 1; ib < anbits.length; ib++) {
					var elemBit = anbits[ib];
					if (ib > 1)
						elemBit = elemBit.substr(0, 1).toUpperCase() + elemBit.substr(1);
					elemName += elemBit;
				}
				obj.dataset[elemName] = obj.attributes[ia].value;
			}
		}
	},


	// ================================================================
	//
	// private Function: blueskyUtils.removeDuplicateElements
	//
	//		Removes duplicate elements from the specfied root element.  Only the first is kept.
	//
	removeDuplicateElements: function (elementType, comparisonAttribute, $rootElement) {

		var seen = {};
		$(elementType, $rootElement).each(function () {
			var txt = $(this).attr(comparisonAttribute);
			if (seen[txt])
				$(this).remove();
			else
				seen[txt] = true;
		});
	},

	shiftPressed: false,
	controlPressed: false,

	// TODO: remove this after .done is implemented.
	_warnedDoneNYI: false,
}

// Determine if shift key is currently pressed
$(document).keydown(function (e) {

    // TODO: The collective intellect of the internet is wrong about how to test for shift/control pressed; the below
    // breaks when the user presses shift, selects and item in a listview, then clicks *out* while shift is still pressed;
    // shift stays 'on' since we never get the keyup.  Disabling multiselect for now

    // blueskyUtils.shiftPressed = e.shiftKey;
    // blueskyUtils.controlPressed = e.ctrlKey;
});
$(document).keyup(function (e) {

    // blueskyUtils.shiftPressed = e.shiftKey;
    // blueskyUtils.controlPressed = e.ctrlKey;
});

// Add easeOut easing
jQuery.extend(jQuery.easing,
{
    def: 'easeOut',
    easeOut: function (x, curTime, startValue, deltaValue, elapsedTime) {
        curTime = curTime / elapsedTime - 1;
        return startValue + deltaValue * curTime * curTime * curTime * curTime * curTime + 1;
    }
});

// Initialize storage now so that appdata.current is initialized (apps may rely on it now).
// TODO: Build one place where these inits happen
Windows.Storage._internalInit();
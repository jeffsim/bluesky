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
    // Example output: { "innerText": "firstName", "style.backgroundColor": "backColor" }
    //
    // more example inputs:
    //       {selectionMode : 'none', itemTemplate: select('#featuredTemplate'), oniteminvoked : Telerik.QSF.HTML.Home.exampleSelected}
    //       src: controlImage
    //       src: controlImage; alt: controlText
    //       {
    //-         startAngle:0,
    //-         endAngle:180,
    //-         min:0,
    //-         max:100,
    //-         majorUnit:25,
    //-         ranges:[{from:0,to:25,color:'red'},{from:25,to:100, color:'#595959'}],
    //-         rangeSize: 2,
    //-         rangeDistance:-1,
    //-         value:33.33
    //-      }
    convertDeclarativeDataStringToJavascriptObject: function (sourceString) {
        var dataBindString = sourceString.replace(/\n/g, "").replace(/\n/g, "");    // TODO (CLEANUP): Do this as one.
        var parseResult = blueskyUtils.recurseInto(dataBindString, 0);

        var result = "";
        try {
            var result = JSON.parse('{' + parseResult.json + '}');
        } catch (ex) {
            /*DEBUG*/
            console.warn("Malformed JSON passed to blueskyUtils.convertDeclarativeDataStringToJavascriptObject");
            console.log(dataBindString);
            console.log(parseResult);
            /*ENDDEBUG*/
        }
        return result;
    },

    recurseInto: function (dataBindString, startIndex) {

        var parserModes = { lookingForKey: 0, lookingForColon: 1, lookingForValue: 2 };
        // Parse the string. TODO: Convert to "real" parser
        var parseMode = parserModes.lookingForKey,
            curCharIndex = startIndex,
            curKey = null,
            lastCharIndex = dataBindString.length;

        var isValidKeyChar = function (ch) {
            // TODO (CLEANUP): e.g. search('[^a-zA-Z_$0-9]')
            return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '.' || ch == '[' || ch == ']';
        }

        var json = '';
        while (curCharIndex < lastCharIndex) {

            switch (parseMode) {

                case parserModes.lookingForKey:

                    switch (dataBindString[curCharIndex]) {

                        case '\t': case '\r': case ' ': case '\n':  // skip whitespace
                        case '\'': case '"':                        // Quotes appear to be optional around keys, so ignore them
                        case ',': case ';':                         // Skip separators because we know we're looking for a key
                        case '{': case '}':                         // hmm: It looks like you can optionally include { and } around the content.  Not sure if that impacts anything, but ignoring for now
                            curCharIndex++;
                            break;

                        default:
                            // Oy: Win8 allows keys like:     this[ 'aria-label' ]: text WinJS.Binding.setAttribute
                            // So we need to support quotes as valid key values and allow anything within those quotes.  We also need to support whitespace in keys :P
                            // So for now, just read until colon.  TODO (CLEANUP): check for invalid chars.  Also, trim whitespace from outside of quotes
                            var startOfKey = curCharIndex++;
                            while (dataBindString[curCharIndex] != ":")
                                curCharIndex++;
                            curKey = dataBindString.substr(startOfKey, curCharIndex - startOfKey);

                            // See above ('oy') example for how win8 can allow whitespace in key names.  Remove all whitespace here.
                            // TODO: Can this break scenarios?  e.g. is foo["hello world"]  a valid key, with whitespace between quotes?
                            curKey.replace(/ /g, "");

                            parseMode = parserModes.lookingForColon;
                            break;
                    }
                    break;

                case parserModes.lookingForColon:

                    switch (dataBindString[curCharIndex]) {
                        // skip whitespace
                        case '\t': case '\r': case ' ': case '\n':
                            curCharIndex++;
                            break;

                        case ':':
                            curCharIndex++;
                            parseMode = parserModes.lookingForValue;
                            break;
                        default:
                            console.warn("Unexpected character encountered in data string, ", dataBindString, " at index ", curCharIndex);
                            return;
                    }
                    break;

                case parserModes.lookingForValue:
                    // keyValue can be string (in quotes)
                    // keyValue can be value; eval'ed.  ex; controlImage.  ex; select('#featuredTemplate'), ex; Test.Foo.Bar.function
                    // keyValue can be object; eval'ed.  ex; { foo:1, bar:2 }
                    // keyValue can be array; eval'ed

                    switch (dataBindString[curCharIndex]) {
                        // skip whitespace
                        case '\t': case '\r': case ' ': case '\n':
                            curCharIndex++;
                            break;

                            // string value.  Read until end of string (pushing/popping quote stack)
                        case '"': case '\'':

                            var quoteType = dataBindString[curCharIndex];
                            // Read until end of string.  Note: Ignore quotes "inside" the string;  e.g. 'Hello \'World\''
                            var startOfValue = ++curCharIndex;
                            while (!(dataBindString[curCharIndex] == quoteType && dataBindString[curCharIndex - 1] != '\\'))
                                curCharIndex++;
                            var value = dataBindString.substr(startOfValue, curCharIndex - startOfValue);
                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":"' + value.trim() + '"';
                            parseMode = parserModes.lookingForKey;
                            break;

                            // object.  recurse into it since we need to convert it as well into valid JSON
                        case '{':
                            var parseResult = blueskyUtils.recurseInto(dataBindString, curCharIndex);
                            curCharIndex += parseResult.length;
                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":{' + parseResult.json + '}';
                            parseMode = parserModes.lookingForKey;
                            break;

                            // value.  Read until end of value definition
                        default:

                            // valid end-of-value chars are:   ,  ;  }   and end-of-string
                            // Read until end of value.  Note: Ignore end-values "inside" the value;  e.g. { foo: test('}') }
                            var startOfValue = curCharIndex,
                                depth = 0,
                                curQuoteType = null;
                            while (curCharIndex < lastCharIndex) {
                                var ch = dataBindString[curCharIndex];

                                // if cur char is start of a quote,  then read until the end of the string and then just keep going.  Note: Ignore quotes "inside" the string;  e.g. 'Hello \'World\''
                                // TODO (BUG): This will not work on more complex/wacky binding strings...  Need to have a real parser here.
                                if (ch == '\'' || ch == '"') {

                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == quoteType && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote
                                    curCharIndex++;

                                } else if (ch == '[') {

                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == ']' && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote

                                } else if (ch == '{') {
                                    debugger;
                                    var quoteType = ch;
                                    while (!(dataBindString[curCharIndex] == '}' && dataBindString[curCharIndex - 1] != '\\'))
                                        curCharIndex++;
                                    // Skip the end quote

                                } else if (ch == ',' || ch == ';' || ch == '}') {
                                    break;
                                }
                                else
                                    curCharIndex++;
                            }
                            var value = dataBindString.substr(startOfValue, curCharIndex - startOfValue);

                            if (json.length > 0) json += ", ";
                            json += '"' + curKey + '":"' + value.trim() + '"';
                            parseMode = parserModes.lookingForKey;
                            break;
                    }
                    break;
            }
        }
        return { json: json, length: curCharIndex - startIndex };
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

function select(e) {
    return $(e)[0];
}
// Initialize storage now so that appdata.current is initialized (apps may rely on it now).
// TODO: Build one place where these inits happen
Windows.Storage._internalInit();
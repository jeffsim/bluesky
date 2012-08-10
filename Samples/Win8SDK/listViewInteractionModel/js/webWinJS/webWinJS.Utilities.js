
// ===================================================================
//
// This file contains web-specified extensions to WinJS to allow cross-compile.
//
//
// ====> THIS FILE SHOULD NOT BE INCLUDED IN THE WIN8APP BUILD. <=====
//
//
// ===================================================================

var webWinJS = webWinJS || {
}

// ================================================================
//
// webWinJS.Utilities
//
// This is the root webWinJS.Utilities namespace/object
webWinJS.Utilities = webWinJS.Utilities || {

    // ================================================================
    //
    // Internal Function: webWinJS.Utilities._removeDuplicateElements
    //
    removeDuplicateElements: function(elementType, comparisonAttribute, $rootElement) {
        
        var seen = {};
        $(elementType, $rootElement).each(function() {
            var txt = $(this).attr(comparisonAttribute);
            if (seen[txt])
                $(this).remove();
            else
                seen[txt] = true;
        });
    },
    

    // ================================================================
    //
    // Internal Function: webWinJS.Utilities._convertDeclarativeDataStringToJavascriptObject
    //
    // Win8's declarative parameters adopt a quasi-Json format.  This function cleans up a string and returns a string 
    // that can be eval'ed into a Javascript object.
    //
    // Example input: innerText: firstName; style.backgroundColor: backColor
    // Example output: { 'innerText': 'firstName', 'style.backgroundColor': 'backColor' }
    //
    _convertDeclarativeDataStringToJavascriptObject: function (dataBindString) {
    
        // 1. Wrap keywords (keys and values) in single quotes
        // TBD-I'm wrapping number values in quotes; should I?
        // Note: the regex is trying to match a-z, a-Z, 0-9, ., and /      <-- Note that we need to match "." to support compounds like "style.backgroundColor"
        // TBD- should the middle / be replaced with \/ or //?  I'm not sure what js's replace does here since "/" seems to delimit the regex, but it seems to be working...
        dataBindString = dataBindString.replace("\r", "").replace("\n", "").trim();
        var output = dataBindString.replace(/([a-zA-z0-9\./]+)/g, "'$1'");
        
        // 1B. The above regex will blindly add quotes to keyword that already have quotes.  Remove them here.
        // tbd-cleanup: merge this into the above regex.
        output = output.replace(/''/g, "'");

        // 1C. TBD -   label:'view all'     gets parsed into 'label':'view' 'all'.  The regex is officially past my ability to regexify, so
        // I'm hacking it out here.  Note that this won't necessarily work for non-literal strings with > 1 space, but that's okay for now.
        output = output.replace (/' '/g, " ");

        // 1D. TBD -   icon:'url(/image.png)'   gets parsed into 'icon':'url'('/image.png')'.  Per above, beyond my regfu, so hacking it away
        output = output.replace (/'\('/g, "(");
        output = output.replace (/'\)'/g, ")'");

        // 2. Wrap in curly braces if not already present
        // tbd-cleanup: again, can probably merge into the regex above
        if (output.trim().indexOf("{") != 0)
            output = "{ " + output + " }";

        // 3. replace semicolon with comma
        output = output.replace(';', ',');
        
        // 4. convert the string into a javascript object
        // tbd-cleanup: better JS-ish way to do this? Object.create() or somesuch?
        var result;
        eval("result = " + output);
        return result;
    },


    // ================================================================
    //
    // Internal Function: webWinJS.Utilities._ensureDatasetReady
    //
    // Code assumes existence of this.dataset which is HTML5 but not <=IE9.  This code adds this.dataset for IE
    //
    _ensureDatasetReady : function(obj) {
        if (obj.dataset != undefined) return;

        obj.dataset = {};
        if (obj.attributes == undefined) return;

        // UNDONE: security - ensure it's data-\w+-\w+-..
        for (var ia = 0; ia < obj.attributes.length; ia++)
        {
            var aname = obj.attributes[ia].name;
            if (aname.substr(0,5) == "data-")
            {
                var anbits = aname.split('-');
                var elemName = "";
                for (var ib = 1; ib < anbits.length; ib++)
                {
                    var elemBit = anbits[ib];
                    if (ib > 1)
                        elemBit = elemBit.substr(0,1).toUpperCase() + elemBit.substr(1);
                    elemName += elemBit;
                }
                obj.dataset[elemName] = obj.attributes[ia].value;        
            }
        }        
    }
}

// ================================================================
//
// Temporary helper function for glocal/static namespace hackery.  
// Remove this when WinJS.Namespace and WinJS.Class are implemented.
//
// tbd: implement WinJS.Namespace and WinJS.Class
//
function constructorHack(details) {
    details.constructor.prototype = details;
    return details.constructor;
}


// ================================================================
//
// ItemPromise class.
//
// TBD: Hacking this in for now.  
var ItemPromise = ItemPromise || constructorHack({

    // ================================================================
    //
    // Function: ItemPromise constructor
    //
    // Stores a reference to the value which we'll pass to the 'then' callback
    constructor: function (value) {

        this._value = value;
    },
    
    // ================================================================
    //
    // Function: ItemPromise.then
    //
    // This is called when the data is ready.
    then: function(doneCallback) {

        return doneCallback(this._value);
    },

    _value: null
});


// ================================================================
//
// prototype.bind extension
//
// The Windows 8 templates use the recent "bind" addition to Javascript (short defn of bind: bind creates a new 
// function that, when called, itself calls this function in the context of the provided this value).  Browsers
// such as WP7 and iOS's browser do not support bind, so we add it here.  You can thank Firefox (see this
// page: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind).
// TBD: Attribution?
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP
                                     ? this
                                     : oThis || window,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
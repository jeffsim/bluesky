var url = require("url");
var querystring = require("querystring");
var request = require('request');
var jsdom = require('jsdom');

exports.proxy = function (parsedUrl, response) {

    var decodedUrl = decodeURIComponent(parsedUrl.query);
    var callback = querystring.parse(decodedUrl)["callback"] || 'jsonp';

    // Function to call when request is complete
    var reqDone = function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            var window = jsdom.jsdom(body).createWindow();

            response.writeHead(200, { "Content-Type": "application/json" });
            var format = 'json'; // TODO: Support other formats
            switch (format) {
                case 'text': case 'xml': case 'string':
                    response.write(callback + "(unescape('" + escape(window.document.innerHTML) + "'))");
                    break;
                default:
                    response.write(callback + '(' + window.document.innerHTML + ')');
                    break;
            }
            response.end();
        } else
            console.log("ERROR: " + error + ", status: " + response1.statusCode);
    }

    // was original request a post?
    if (decodedUrl.indexOf("__post") > -1) {

        // jQuery converted our POST to a GET (grr); undo that here by stripping the search string
        // off of the url and into the body so that it's a real POST again.
        // TODO: Possible to avoid all of this nastiness?  note that this is in part to handle invalid querystrings (e.g. starting with '&')
        var postData;
        var i = decodedUrl.indexOf("?");
        var i2 = decodedUrl.indexOf("&");
        if (i == -1 || (i2 > -1 && i2 < i)) i = i2;
        if (i > -1) {
            postData = decodedUrl.substr(i + 1);
            decodedUrl = decodedUrl.substr(0, i);
        }
        // strip trailing '/' if present. TODO (CLEANUP): Really? No better way to do this?
        if (decodedUrl[decodedUrl.length - 1] == '/')
            decodedUrl = decodedUrl.substr(0, decodedUrl.length - 1);

        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: decodedUrl,
            body: postData
        }, reqDone);
    }
    else
        request.get(decodedUrl, reqDone);
};
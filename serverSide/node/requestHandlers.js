var url = require("url");
var querystring = require("querystring");
var request = require('request');
var jsdom = require('jsdom');

exports.proxy = function (parsedUrl, response) {

    var decodedUrl = decodeURIComponent(parsedUrl.query);
    var callback = querystring.parse(decodedUrl)["callback"] || 'jsonp';

    // strip the callback info
    var callbackIndex = decodedUrl.indexOf("&callback");
    if (callbackIndex >= 0)
        decodedUrl = decodedUrl.substr(0, callbackIndex);

    // Function to call when request is complete
    var reqDone = function (error, response1, body) {
        // TODO: What about 302? Other codes?
        if (!error) {
            //     response.writeHead(response1.statusCode, { "Content-Type": response1.headers["content-type"]});//"application/json" });
            if (response1.statusCode == 200) {
                var window = jsdom.jsdom(body).createWindow();
                var format = response1.headers['content-type'];
                console.log(format);
                switch (format) {
                    case 'text/plain': case 'text/html':
                    case 'text/xml': case 'text/xml; charset=utf-8': case 'string':
                        console.log(1);
                        try {
                            var t = (window.document && window.document.innerHTML) || response1.body;
                            response.write(callback + "(unescape('" + escape(t) + "'))");
                        } catch (err) {
                            console.log("Exception caught 1:" + format + "." + err);
                            console.log(response1);
                        }
                        break;
                    default: // json
                        try {
                            var t = (window.document && window.document.innerHTML) || response1.body;
                            response.write(callback + '(' + t + ')');
                        } catch (err) {
                            console.log("Exception caught 2:" + err);
                        }
                        // binary test: response.write(callback + '(data=' + JSON.stringify(window.document.innerHTML) + ')');
                        break;
                }
                response.end();
                console.log("path: " + decodedUrl);
            }
            else {
                console.log("\r\n\r\nERROR: " + error + ", status: " + (response1 && response1.statusCode) +
             ", path: " + decodedUrl + "\r\n\r\n");
                response.end();
            }
        } else
            console.log("\r\n\r\nERROR: " + error + ", status: " + (response1 && response1.statusCode) +
             ", path: " + decodedUrl + "\r\n\r\n");
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
        // strip trailing '/' ifp resent. TODO (CLEANUP): Really? No better way to do this?
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
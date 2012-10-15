var http = require("http");
var url = require("url");

function start(route, handle) {

    function onRequest(request, response) {
        request.setEncoding("utf8");
        route(handle, url.parse(request.url), response);
    }

    http.createServer(onRequest).listen(8080);
}
exports.start = start;


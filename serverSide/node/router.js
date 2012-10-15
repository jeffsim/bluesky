function route(handle, parsedUrl, response) {
    var pathname = parsedUrl.pathname;
    if (handle[pathname])
        handle[pathname](parsedUrl, response);
    else {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("404 Not found " + pathname);
        response.end();
    }
}

exports.route = route
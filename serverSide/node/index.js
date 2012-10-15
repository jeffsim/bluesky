var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var express = require('express');


var handle = {
    "/_p": requestHandlers.proxy
};

// Enable CORS
express().configure(function () {
    express().use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    });
});

server.start(router.route, handle);
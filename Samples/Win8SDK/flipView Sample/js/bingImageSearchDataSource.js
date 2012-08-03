// Bing image search data source example
//
// This implements a datasource that will fetch images from Bing's image search feature
// As the bing service requires a developer key, and each app needs its own key, the key will
// need to be passed in. For more information on how to obtain a key and use the bing API, see
// http://bing.com/developers and http://msdn.microsoft.com/en-us/library/dd251056.aspx

(function () {


    //This should not be included/used in real apps, its there to illustrate differences between renderers
    function delayPromise(p, delay) {
        var t = new WinJS.Promise.timeout(delay);
        return WinJS.Promise.join([p, t]).then(function () { return p; });
    }

    // Definition of the data adapter
    var bingImageSearchDataAdapter = WinJS.Class.define(
        function (devkey, query, delay) {

            // Constructor
            // the request sizes are set artificially small to increase the request frequency
            this._minPageSize = 5;
            this._maxPageSize = 20;
            this._maxCount = 1000;   // limit on the bing API
            this._devkey = devkey;
            this._query = query;
            this._delay = delay;
        },

        // Data Adapter interface methods
        // These define the contract between the virtualized datasource and the data adapter.
        // These methods will be called by virtualized datasource to fetch items, count etc.
        {
            // This example only implements the itemsFromIndex and count methods

            // Called to get a count of the items
            // The value of the count can be updated later in the response to itemsFromIndex
            getCount: function () {
                var that = this;

                // Build up a URL to request 1 item so we can get the count
                var requestStr = "http://api.bing.net/json.aspx?";

                // Common request fields (required)
                requestStr += "AppId=" + that._devkey
                + "&Query=" + that._query
                + "&Sources=Image";

                // Common request fields (optional)
                requestStr += "&Version=2.0"
                + "&Market=en-us"
                + "&Adult=Strict"
                + "&Filters=Aspect:Wide";

                // Image-specific request fields (optional)
                requestStr += "&Image.Count=1"
                + "&Image.Offset=0"
                + "&JsonType=raw";

                //Return the promise from making an XMLHttpRequest to the server
                return delayPromise(WinJS.xhr({ url: requestStr }), that._delay).then(

                    //Callback for success
                    function (request) {
                        var data = JSON.parse(request.responseText);

                        //Bing may return a large count of items, but you can only fetch the first 1000, so we max the count at that.
                        try {
                            return Math.min(data.SearchResponse.Image.Total, that._maxCount);
                        } catch (err) {
                            return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
                        }
                    },
                    function (request) {
                        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
                    });
            },

            // Called by the virtualized datasource to fetch items
            // It will request a specific item and hints for a number of items either side of it
            // The implementation should return the specific item, and can choose how many either side
            // to also send back. It can be more or less than those requested.
            //
            // Must return back an object containing fields:
            //   items: The array of items of the form items=[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
            //   offset: The offset into the array for the requested item
            //   totalCount: (optional) update the value of the count
            itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                var that = this;
                if (requestIndex >= that._maxCount) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(UI.FetchError.doesNotExist));
                }

                // Bing can only return up to 50 items at once
                // We also want to request a minimum of 10 items to be efficient
                var requestSize = countBefore + 1 + countAfter;

                // Offset of the first desired item
                var fetchIndex = requestIndex - Math.min(countBefore, that._maxPageSize / 2);

                // Number of items to retrieve, bounded by limits
                var fetchSize = Math.max(Math.min(requestSize, that._maxPageSize), that._minPageSize);

                //Build up the URL for the request
                var requestStr = "http://api.bing.net/json.aspx?"
                + "AppId=" + that._devkey
                + "&Query=" + that._query
                + "&Sources=Image"
                + "&Version=2.0"
                + "&Market=en-us"
                + "&Adult=Strict"
                + "&Filters=Aspect:Wide"
                + "&Image.Count=" + fetchSize
                + "&Image.Offset=" + fetchIndex
                + "&JsonType=raw";

                //Return the promise from making an XMLHttpRequest to the server
                return delayPromise(WinJS.xhr({ url: requestStr }), that._delay).then(

                    //Callback for success
                    function (request) {
                        var results = [], count;

                        // Use the JSON parser on the results, safer than eval
                        var obj = JSON.parse(request.responseText);

                        // Verify if the service has returned images
                        if (obj.SearchResponse.Image !== undefined) {
                            var items = obj.SearchResponse.Image.Results;

                            // Data adapter results needs an array of items of the shape:
                            // items =[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
                            // Form the array of results objects
                            for (var i = 0, itemsLength = items.length; i < itemsLength; i++) {
                                var dataItem = items[i];
                                results.push({
                                    key: (fetchIndex + i).toString(),
                                    data: {
                                        title: dataItem.Title,
                                        thumbnail: dataItem.Thumbnail.Url,
                                        width: dataItem.Width,
                                        height: dataItem.Height,
                                        linkurl: dataItem.Url,
                                        url: dataItem.MediaUrl
                                    }
                                });
                            }
                            // Get the count from the json
                            count = obj.SearchResponse.Image.Total;

                            return {
                                items: results, // The array of items
                                offset: requestIndex - fetchIndex, // The offset into the array for the requested item
                                totalCount: Math.min(count, that._maxCount), // Total count of records, bing will only return 1000 so we cap the value
                            };
                        } else {
                            return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                        }
                    },

                    //Called on an error from the XHR Object
                    function (request) {
                        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
                    });
            }
        });

    WinJS.Namespace.define("bingImageSearchDataSource", {
        datasource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (devkey, query, delay) {
            this._baseDataSourceConstructor(new bingImageSearchDataAdapter(devkey, query, delay));
        })
    });

})();
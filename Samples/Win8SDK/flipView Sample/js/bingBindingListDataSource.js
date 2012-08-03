// BindingList datasource example
//
// This implements a datasource that will fetch images from Bing's image search feature and then
// cache them in a binding.list. It will fetch one batch, return, then fetch additional batches
// every 100ms
//
// As the bing service requires a developer key, and each app needs its own key, the key will
// need to be passed in. For more information on how to obtain a key and use the bing API, see
// http://bing.com/developers and http://msdn.microsoft.com/en-us/library/dd251056.aspx

(function () {

    var _devkey, _query;

    // Makes the http request for data and populates the specified array/list
    function getData(offset, store) {
        var requestStr = "http://api.bing.net/json.aspx?"
            + "AppId=" + _devkey
            + "&Query=" + _query
            + "&Sources=Image"
            + "&Version=2.0"
            + "&Market=en-us"
            + "&Adult=Strict"
            + "&Filters=Aspect:Wide"
            + "&Image.Count=" + 50
            + "&Image.Offset=" + offset
            + "&JsonType=raw";

        return WinJS.xhr({ url: requestStr }).then(function (request) {   
            var obj = JSON.parse(request.responseText);

            if (obj.SearchResponse.Image !== undefined) {
                var items = obj.SearchResponse.Image.Results;

                for (var i = 0, itemsLength = items.length; i < itemsLength; i++) {
                    var dataItem = items[i];
                    store.push({
                        title: dataItem.Title,
                        thumbnail: dataItem.Thumbnail.Url,
                        width: dataItem.Width,
                        height: dataItem.Height,
                        linkurl: dataItem.Url,
                        url: dataItem.MediaUrl
                    });
                }
                return (offset + items.length) < Math.min(obj.SearchResponse.Image.Total, 1000);
            } else {
                return false;
            };
        });
    }

    // Main entry point
    //
    // Will will request a batch of data and return a promise to the binding.list datasource that will
    // complete when the first batch is done. It will then fetch the remaining records over time.
    //
    function getDataSource(devkey, query) {
        _devkey = devkey;
        _query = query;
        var list = new WinJS.Binding.List();

        return getData(0, list).then(function (hasMoreData) {
            var next = function (offset) {
                setTimeout(function () {
                    getData(offset, list).then(function (more) {
                        if (more) {
                            next(list.length);
                        }
                    });
                }, 1000);
            };
            if (hasMoreData) { next(list.length); }
            return list.dataSource;
        });
    }

    WinJS.Namespace.define("bingBindingListDataSource", {
        getDataSource: getDataSource
    });

})();
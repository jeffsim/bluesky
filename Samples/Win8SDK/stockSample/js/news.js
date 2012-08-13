//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved
(function () {
    "use strict";

    var newsItems = [];

    function show(xml, stock) {
        newsItems = [];
        var markup = "";
        var results = xml.querySelectorAll("NewsResult");
        for (var i = 0, len = results.length; i < len; i++) {
            var title = results[i].querySelector("Title").textContent;
            var url = results[i].querySelector("Url").textContent;
            var source = results[i].querySelector("Source").textContent;
            var snippet = results[i].querySelector("Snippet").textContent;
            var date = results[i].querySelector("Date").textContent.split("T")[0];
            newsItems[i] = {
                title: Mock.modifyNewsResult(title, stock),
                url: Mock.modifyNewsResult(url, stock),
                source: source,
                snippet: Mock.modifyNewsResult(snippet, stock),
                date: date
            };
        }        

        marketNewsTitle.innerText = "Market news for " + stock;
        msSetImmediate(function () {
        	var lv = marketNewsList.winControl;
            lv.itemDataSource = new WinJS.Binding.List(newsItems).dataSource;
        });
        
    }
    
    function initialize() {
    	WinJS.UI.process(marketNews).then(function () {
    		var lv = marketNewsList.winControl;
            WinJS.UI.setOptions(lv, {
                itemTemplate: marketNewsItemTemplate,
                oniteminvoked: function itemInvoked(e) {
                	var item = newsItems[e.detail.itemIndex];
                    var uri = new Windows.Foundation.Uri(item.url);
                    console.log(uri);
                    Windows.System.Launcher.launchUriAsync(uri);
                }
            });
            lv.forceLayout();
        });
    }

    function requestNews(stock) {
    	Api.getNewsData(stock).then(function (response) {
            show(response.responseXML, stock);
        });
    }

    WinJS.Namespace.define("News", {
        initialize: initialize,
        requestNews: requestNews
    }); 
})();

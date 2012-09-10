// ================================================================
//
// Bluesky
//
var Bluesky = {

	Settings: {

		// ================================================================
		//
		// Setting value: ProxyCrossDomainXhrCalls
		//
		//      See the WinJS.xhr code for the what and the why behind this setting.  In short:
		//			* If true then WinJS.xhr proxies requests through YQL to enable Cross-domain 
		//			  requests (as the Win8 LocalContext allows).  
		//			* If false then WinJS.xhr uses standard XMLHttpRequest, which doesn't work cross-domain
		//			  but is better/faster if you don't need it.
		//
		//		We default to true (do proxy through YQL) to enable fast bring-up of Win8 apps in bluesky.
		//
	    ProxyCrossDomainXhrCalls: true,


	    // ================================================================
	    //
	    // Setting object: ProxyBypassUrls
	    //
	    //      Used to specify specific Urls that should not go through the YQL proxy.
	    //
	    //      TODO: I believe Win8 has a parallel object.  Move to that one.
        //
	    ProxyBypassUrls: {

	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.add
	        //
	        add: function(urls) {
	            if (!urls)
	                return;
	            if (typeof urls.length === undefined)
	                urls = [urls];
	            urls.forEach(function(url) {
	                Bluesky.Settings.ProxyBypassUrls.urls.push(url.toLowerCase);
	            });
	        },


	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.clear
	        //
	        clear: function () {
	            this.urls = [];
	        },


	        // ================================================================
	        //
	        // public function: Bluesky.Settings.ProxyBypassUrls.contains
	        //
	        contains: function (url) {

	            var result = false;
	            var sourceUrl = url.toLowerCase();
	            var urls = Bluesky.Settings.ProxyBypassUrls.urls;
	            for (var i = 0; i < urls.length; i++) {

	                if (sourceUrl.match(urls[i]))
	                    return true;
	            }

	            return false;
	        },


	        // ================================================================
	        //
	        // public member: Bluesky.Settings.ProxyBypassUrls.urls
	        //
	        urls: []
	    }
	}
};

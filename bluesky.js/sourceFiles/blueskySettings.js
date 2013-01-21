// ================================================================
//
// Bluesky
//
var Bluesky = {

    // ================================================================
    //
    // public funciton: Bluesky.initialize
    //
    initialize: function () {

        // Determine if this app is running locally.  This impacts how files are loaded
        this.IsLocalExecution = window.PhoneGap != null;
    },


    // ================================================================
    //
    // public object: Bluesky.Application
    //
    Application: {

        // ================================================================
        //
        // public funtion: Bluesky.Application.setAppInfo
        //
        //  bluesky Applications can use this to specify app information.  This will
        //  eventually be obtained from the manifest.
        //
        setAppInfo: function (appId, publisherId, version) {
            appId = appId.toUpperCase();
            // TODO: Not sure what this one is actually.  Unlikely to impact web
            var proc = "neutral_";

            Windows.ApplicationModel.Package.current.id.name = appId;
            Windows.ApplicationModel.Package.current.id.fullName = appId + "_" + publisherId;
            Windows.ApplicationModel.Package.current.id.familyName = appId + "_" + version + "_" + proc + "_" + publisherId;
        }
    },

	Settings: {

	    // ================================================================
	    //
	    // Setting value: cacheBustScriptsAndStyles
	    //
	    //      By default, we append "_bsid=<random#>" to the end of any scripts and styles.  This is to ensure that
	    //      a 'fresh' version of the file has been loaded; when browsers overly cache things (IE, I'm looking at you), it
	    //      makes development painful; and updating apps in production equally so, since you're not gauranteed that you'll
	    //      get the latest version of a file (and could even in theory get mismatched versions).
	    //
	    //      So, cache busting here is a good thing.  So why allow developers to disable it?  Because it can actually make debugging more 
	    //      painful.  You can't drop breakpoints in scripts and F5, because the ?bdid value makes it a 'different' script each
	    //      time.  Setting the following to false will stop that from happening, BUT IS VERY VERY DANGEROUS because if a developer
	    //      forgets about it and releases an update, then their users can be in an indeterminate state with who-knows-what version of each file.
	    //      
	    //      TODO: our deployment process should disallow (w/ exceptions granted as needed) publishing with this set to false.
	    //
	    cacheBustScriptsAndStyles: true,


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
	                Bluesky.Settings.ProxyBypassUrls.urls.push(url.toLowerCase());
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

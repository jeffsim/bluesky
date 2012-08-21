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
		ProxyCrossDomainXhrCalls: true
	}
};

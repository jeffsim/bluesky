(function () {
	"use strict";

	// Keep a reference to the homepage object for invoke handlers
	var homePage;

	// ================================================================
	//
	// homePage
	//
	WinJS.UI.Pages.define("/pages/homePage/homePage.html", {

		// ================================================================
		//
		// homePage.ready
		//
		ready: function (element, options) {

			// Keep a reference to the homepage object for invoke handlers
			homePage = this;

			// Define the listview's groups
			this.listGroups = [
				{ key: "1welcome", title: "Welcome" },
				{ key: "2vsTemplates", title: "VS2012" },
				{ key: "3sdkSamples", title: "Win8 SDK" }
			];

			// Populate the list of samples and templates
			var list = this.populateList();

			// Create a grouped projection for our listview.
			var groupedItems = list.createGrouped(
				function groupKeySelector(item) { return item.group.key; },
				function groupDataSelector(item) { return item.group; }
			);

			// Enable cell spanning for the larger "Welcome" list item
			function groupInfo() {
				return {
					enableCellSpanning: true,
					cellWidth: 200,
					cellHeight: 150
				};
			}

			// Initialize the listview
			var listView = element.querySelector(".homePagelist").winControl;
			listView.groupHeaderTemplate = element.querySelector(".headerTemplate");
			listView.layout = new WinJS.UI.GridLayout({ groupInfo: groupInfo, groupHeaderPosition: "top" });
			listView.itemTemplate = this.templateSelector;
			listView.oniteminvoked = this.itemInvoked.bind(this);
			listView.itemDataSource = groupedItems.dataSource;
			listView.groupDataSource = groupedItems.groups.dataSource;
		},


		// ================================================================
		//
		// homePage.itemInvoked
		//
		//		Called when the user clicks on an item in the listview
		//
		itemInvoked: function (args) {
			console.log(args);
			args.detail.itemPromise.then(function (item) {
				if (item.groupKey != "1welcome")
				document.location.href = item.data.url;
			});
		},


		// ================================================================
		//
		// homePage.templateSelector
		//
		//		This function allows the ListView to support heterogenous templates for each item without
		//		any extra work.  Just specify "itemTemplate" (referencing a template in the DOM) in the item's data.
		//		NOTE: To use this in another app, just remove the contextmenu block below, and this should work anywhere.
		//
		templateSelector: function (itemPromise) {

			return itemPromise.then(function (currentItem) {

				// Create a clone of the item's template
				var templateInstance = document.getElementsByClassName(currentItem.data.itemTemplate)[0].cloneNode(true);

				// Make the template instance visible (although it won’t be in the DOM yet)
				templateInstance.style.display = "block";

				// Have WinJS perform binding for us between the current item's data and the cloned template
				WinJS.Binding.processAll(templateInstance, currentItem.data);

				// add a right-click context menu for the item (but not for the welcome column)
				$(templateInstance).bind('contextmenu', function (e) {
					if (currentItem.data.groupKey != "1welcome")
						return homePage.showContextMenu(currentItem.data, e.pageX, e.pageY);
				});

				// And we're done!  Return the cloned template.
				return templateInstance;
			});
		},


		// ================================================================
		//
		// homePage.showContextMenu
		//
		//		Shows the right-click content menu on an item
		//
		//		Adapted from: http://www.webdeveloperjuice.com/2010/02/22/create-simple-jquery-right-click-cross-browser-vertical-menu/
		//
		showContextMenu: function (appData, left, top) {

			var $cmenu = $(".vmenu");

			$('<div class="overlay"></div>').css({
				left: '0px',
				top: '0px',
				position: 'absolute',
				width: '100%',
				height: '100%',
				zIndex: '100'
			}).click(function () {
				// click off of the menu closes the menu
				$(this).remove();
				$cmenu.hide();
			}).bind('contextmenu', function () {
				// right-click off of the menu closes the menu
				$(this).remove();
				$cmenu.hide();
				return false;
			}).appendTo(document.body);

			// hide msdn link if it's a visual studio template
			if (appData.group.key == "2vsTemplates")
				$(".msdnOnly", $cmenu).hide();
			else
				$(".msdnOnly", $cmenu).show();

			// Keep context menu on screen
			var maxLeft = $("body").outerWidth() - $cmenu.outerWidth() - 10;
			var maxTop = $("body").outerHeight() - $cmenu.outerHeight() - 10;
			left = Math.min(left, maxLeft);
			top = Math.min(top, maxTop);
			// set the content menu to the cursor's position, and show it
			$cmenu.css({
				left: left,
				top: top,
				zIndex: '100001'
			}).show();

			// remove previous click handlers
			$('.first_li', $cmenu).unbind('click');

			// tbd:disallow removing apps that arent in the appstore (e.g. the store app)

			// Catch clicks on the first level content menu items
			$('.first_li', $cmenu).bind('click', function () {
				if ($(this).children().size() == 1) {
					var itemText = $(this).children().text();
					switch (itemText) {
						case "Launch sample":
							document.location.href = appData.url;
							break;
						case "View source on github":    // tbd-clean: don't use text for comparison
							document.location.href = appData.githubUrl;
							break;
						case "View sample on MSDN":
							document.location.href = appData.msdnUrl;
					}
					$cmenu.hide();
					$('.overlay').hide();
				}
			});

			// Catch clicks on the second level content menu items
			$('.inner_li span', $cmenu).bind('click', function () {
				$cmenu.hide();
				$('.overlay').hide();
			});

			$(".first_li , .sec_li, .inner_li span", $cmenu).hover(function () {
				$(this).css({ backgroundColor: '#E0EDFE', cursor: 'pointer' });
				if ($(this).children().size() > 0)
					$(this).find('.inner_li').show();
				$(this).css({ cursor: 'default' });
			},
                function () {
                	$(this).css('background-color', '#fff');
                	$(this).find('.inner_li').hide();
                });
			return false;
		},


		// ================================================================
		//
		// homePage.populateList
		//
		//		Populates the list of templates and samples
		//
		populateList: function () {
			var list = new WinJS.Binding.List();

			// Add the welcome list item
			list.push({
				group: this.listGroups[0],
				itemTemplate: 'welcomeTemplate'
			});

			// Add the visual studio template items
			list.push({
				group: this.listGroups[1],
				backgroundImage: "http://bluesky.io/samples/previews/navtemplate.jpg",
				DisplayName: "Navigation App",
				itemTemplate: 'vsTemplate',
				url: "http://navsample.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/VSTemplates/navigationTemplate",
			});

			list.push({
				group: this.listGroups[1],
				backgroundImage: "http://bluesky.io/samples/previews/gridApp.jpg",
				DisplayName: "Grid App",
				itemTemplate: 'vsTemplate',
				url: "http://gridApp.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/VSTemplates/gridAppTemplate",
			});


			// Add the Win8 SDK sample items
			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/stockSample.jpg",
				DisplayName: "e2e Stock sample",
				itemTemplate: 'sdkTemplate',
				url: "http://stockSample.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/stockSample",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/StocksSample-d61665c0"
			});

			list.push({
			    group: this.listGroups[2],
			    backgroundImage: "http://bluesky.io/samples/previews/messageDialog.png",
			    DisplayName: "MessageDialog",
			    itemTemplate: 'sdkTemplate',
			    url: "http://messageDialog.bluesky.io",
			    githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/messageDialog",
			    msdnUrl: "http://code.msdn.microsoft.com/windowsapps/Message-dialog-sample-00c928f5"
			});
			list.push({
			    group: this.listGroups[2],
			    backgroundImage: "http://bluesky.io/samples/previews/flipview.jpg",
			    DisplayName: "FlipView",
			    itemTemplate: 'sdkTemplate',
			    url: "http://flipview.bluesky.io",
			    githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/flipView%20Sample",
			    msdnUrl: "http://code.msdn.microsoft.com/windowsapps/FlipView-control-sample-18e434b4"
			});

			list.push({
			    group: this.listGroups[2],
			    backgroundImage: "http://bluesky.io/samples/previews/flyoutSample.jpg",
			    DisplayName: "Flyout control",
			    itemTemplate: 'sdkTemplate',
			    url: "http://flyoutSample.bluesky.io",
			    githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/flyoutControl",
			    msdnUrl: "http://code.msdn.microsoft.com/windowsapps/Flyout-sample-258757b3"
			});

			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/listviewbasic.jpg",
				DisplayName: "ListView Basic",
				itemTemplate: 'sdkTemplate',
				url: "http://listviewbasic.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/listviewBasic",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/ListView-basic-usage-sample-fcc451db"
			});

			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/listviewtemplates.jpg",
				DisplayName: "ListView Templates",
				itemTemplate: 'sdkTemplate',
				url: "http://listviewtemplates.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/listViewInteractionModel",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/ListView-item-templates-7d74826f"
			});

			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/listviewgrouping.jpg",
				DisplayName: "ListView Grouping",
				itemTemplate: 'sdkTemplate',
				url: "http://listviewgrouping.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/listViewGrouping",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/ListView-grouping-and-6d032cc1"
			});

			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/listviewinteraction.jpg",
				DisplayName: "ListView Interaction",
				itemTemplate: 'sdkTemplate',
				url: "http://listviewinteraction.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/listViewInteractionModel",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/ListView-selection-detail-95e06ade"
			});

			list.push({
				group: this.listGroups[2],
				backgroundImage: "http://bluesky.io/samples/previews/fragmentsSample.jpg",
				DisplayName: "Fragments sample",
				itemTemplate: 'sdkTemplate',
				url: "http://fragmentsSample.bluesky.io",
				githubUrl: "https://github.com/jeffsim/bluesky/tree/master/Samples/Win8SDK/fragmentsSample",
				msdnUrl: "http://code.msdn.microsoft.com/windowsapps/Fragments-91f66b07"
			});

			return list;
		}
	});
})();

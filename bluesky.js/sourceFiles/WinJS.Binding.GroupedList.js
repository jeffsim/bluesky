WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.GroupedSortedListProjection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920302.aspx
	//
	GroupedSortedListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.GroupedSortedListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createGrouped
		//
		function (sourceList, groupKeySelector, groupDataSelector) {
			
			this._groupedItems = [];

			// Our projected list of groups; not actually created until requested
			this._groupsProjection = null;

			// The list of keys (from the source list) sorted 
			this._sortedKeys = [];  // TODO: move into separate SortedListProjection base class

			// Keep track of the list which we are projecting
			this._list = sourceList;

			// Initialize the set of event listeners
			this._eventListeners = [];

			this._groupKeySelector = groupKeySelector;
			this._groupDataSelector = groupDataSelector;

			// Listen for changes on our source list
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));
			this._list.addEventListener("itemchanged", this._itemChanged.bind(this));

			// initialize keys and sort
			this._sortedKeys = [];  // TODO: move into separate SortedListProjection base class
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);
				this._sortedKeys.push(item.key);
			}
			this._sortKeys();

			// initialize grouped items
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);
				item = this.copyItem(item);
				item.groupKey = groupKeySelector(item.data);
				this._addItem(item);
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list
			// TODO: Not sure what to bind to here.
			this.dataSource = new WinJS.UI.IListDataSource(this, this._groupedItems);
//			this.dataSource = WinJS.Binding.as(this._groupedItems);
	//		this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.GroupedSortedListProjection members
		// ================================================================

		{
			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.indexOf
			//
			indexOf: function (item) {
				return this._sortedKeys.indexOf(item.key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._sortKeys
			//
			_sortKeys: function () {

				var that = this;
				this._sortedKeys.sort(function (left, right) {
					left = that._groupKeySelector(that._list.getItemFromKey(left).data);
					right = that._groupKeySelector(that._list.getItemFromKey(right).data);
					if (left < right) return -1;
					if (left == right) return 0;
					return 1;
				});
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._addItem
			//
			_addItem: function (item) {

				// Get the group for the item
				var groupKey = this._groupKeySelector(item.data);
				var itemData = { data: item.data, groupKey: groupKey, key: item.key };
				this._groupedItems[item.key] = itemData;
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.length
			//
			length: {
				get: function () {
					return this._sortedKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.getItem
			//
			getItem: function (index) {

				var key = this._sortedKeys[index];
				return this.getItemFromKey(key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.getItemFromKey
			//
			getItemFromKey: function (key) {

				return this._groupedItems[key];
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupedSortedListProjection.indexOfKey
			//
			indexOfKey: function (key) {

				return this._sortedKeys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemInserted
			//
			_itemInserted: function (eventData) {

				this._addItem({ data: eventData.detail.value, key: eventData.detail.key });

				// TODO: The following code attempts to insert the new item before the first item with the same key,
				// which is what win8 appears to do.  However, it isn't quite working, so I've commented it out and
				// gone with the simpler push/sort approach below.  That doesn't quite match win8 in that the sort
				// could drop the new item anywhere in the group of same-group keys - which I believe is acceptable
				// behavior; just slightly different than win8 though...
				/*
				var newItemGroupKey = this._groupKeySelector(this._list.getItemFromKey(eventData.detail.key).data);
				debugger;
				for (var i = 0; i < this._sortedKeys.length; i++) {
					var itemToCheck = this._list.getItemFromKey(this._sortedKeys[i]);
					var itemToCheckGroupKey = this._groupKeySelector(itemToCheck);
					if (newItemGroupKey == itemToCheckGroupKey) {
						// found a matching groupkey; insert this item before it
						break;
					}
				}
				// If we didn't break above, then i equals the end of the list, which is where we want to add it.
				this._sortedKeys.splice(i, 0, eventData.detail.key);

				// set the index of hte item
				// TODO: Need to update indices of items after this one, too
				eventData.detail.index = i;
				*/

				// Add the key to an arbitrary place, and then sort the whole list of keys to get them into the right place.
				this._sortedKeys.push(eventData.detail.key);
				this._sortKeys();

				// Get newly sorted index of item
				eventData.detail.index = this.indexOfKey(eventData.detail.key);

				// Propagate the event.
				this._notifyItemInserted(eventData.detail);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemRemoved
			//
			_itemRemoved: function (eventData) {

				var key = eventData.detail.key;
				var value = eventData.detail.value;
				var item = eventData.detail.item;
				var groupeditem = this._groupedItems[key];
				var sortedIndex = this._sortedKeys.indexOf(key);

				// Remove the item (by key) from our list of grouped items
				delete this._groupedItems[key];

				// Remove the key from the list of sorted keys
				this._sortedKeys.splice(sortedIndex, 1);

				// notify any listeners of the removal
				this._notifyItemRemoved({ key: key, value: value, index: sortedIndex, item: groupeditem });
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupedSortedListProjection._itemChanged
			//
			_itemChanged: function (eventData) {

				var itemKey = eventData.detail.key;
				var newValue = eventData.detail.newValue;
				var prevGroupedItem = this._groupedItems[itemKey];

				// Create the new item, based off of the previous item
				var newGroupedItem = {
					key: prevGroupedItem.key,
					data: newValue,
					groupKey: this._groupKeySelector(newValue),
					groupSize: prevGroupedItem.groupSize,
				};
				
				// Store the new item in our list of grouped items
				this._groupedItems[itemKey] = newGroupedItem;

				// Is the new item still in the same group?
				if (prevGroupedItem.groupKey === newGroupedItem.groupKey) {

					// Item is still in the same group; we don't need to move anything, but do propagate the change
					this._notifyItemChanged({
						key: itemKey,
						index: this.indexOfKey(itemKey),
						oldValue: prevGroupedItem.data,
						newValue: newGroupedItem.data,
						oldItem: prevGroupedItem,
						newItem: newGroupedItem
					});

				} else {

					// Item is now in a new group; remove and reinsert it so that it appears in the new group

					// Remove the item and propagate the removal
					var itemIndex = this._sortedKeys.indexOf(itemKey);
					this._sortedKeys.splice(itemIndex, 1);
					this._notifyItemRemoved({
						key: itemKey,
						value: prevGroupedItem.data,
						index: itemIndex,
						item: prevGroupedItem
					});

					// Reinsert the item and propagate the insertion
					this._sortedKeys.push(itemKey);
					this._sortKeys();
					this._notifyItemInserted({
						key: itemKey,
						index: this.indexOfKey(itemKey),
						value: newValue
					});
				}
			},


			// ================================================================
			//
			// public property (getter): WinJS.Binding.GroupedSortedListProjection.groups
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh921584.aspx
			//
			groups: {
				get: function () {

					// Do a lazy-creation of our GroupsList
					if (this._groupsProjection == null)
						this._groupsProjection = new WinJS.Binding.GroupsListProjection(this);
					return this._groupsProjection;
				}
			}
		})
});
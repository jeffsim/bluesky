WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.GroupsListProjection
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920302.aspx
	//
	GroupsListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.GroupsListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createGrouped
		//
		function (sourceList) {

			// Set up our event listeners
			this._eventListeners = {
				itemremoved: [],
				iteminserted: [],
				itemmoved: [],
				reload: []
			};

			// Keep track of the list (which is a groupedprojection) that we are projecting
			this._list = sourceList;

			// The list of group items which we are projecting over the source list
			this._groupItems = [];
			this._groupKeys = [];

			// Listen for changes on our source list.  Note that we don't have to listen for changes to items in the base list,
			// as our source groupprojection list will automatically convert changes to insertions/removals.
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));

			// Initialize groupitems
			for (var i = 0; i < sourceList.length ; i++) {
				var item = sourceList.getItem(i);

				var groupKey = item.groupKey;
				// If the group doesn't exist yet, then add it now
				// TODO: build map instead of iterating?
				var found = false;
				for (var j in this._groupItems)
					if (this._groupItems[j].key == groupKey) {
						this._groupItems[j].groupSize++;
						found = true;
						break;
					}

				if (!found) {
					this._groupItems[groupKey] = {
						key: groupKey,
						groupSize: 1,
						data: sourceList._groupDataSelector(item.data) };
					this._groupKeys.push(groupKey);
				}
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list
			// TODO: Not sure what to bind to here.
			this.dataSource = WinJS.Binding.as(this._groupItems);
			this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.GroupsListProjection members
		// ================================================================

		{
			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._itemInserted
			//
			_itemInserted: function (eventData) {

				var groupKey = this._list.getItemFromKey(eventData.detail.key).groupKey;
				var groupItem = this._groupItems[groupKey];
				if (!groupItem) {

					// Add the new group
					this._groupKeys.push(groupKey);
					this._sortKeys();

					var newGroupItem = {
						key: groupKey,
						groupSize: 1,
						// TODO: Index etc
						data: this._list._groupDataSelector(eventData.value)
					};

					this._groupItems[groupKey] = newGroupItem;

					// Propagate the event.
					// TODO: Need to pass index of the group too
					this._notifyItemInserted({ key: newGroupItem.key, value: newGroupItem.data });

				} else {
					// Nothing to do here since the item insertion did not require a new group to be created.
					// TODO: Technically the group has changed, but I don't think it's in a way that caller can
					// see; that said, they may want to do something regardless, so I should fire a changed event
					// here...
					groupItem.groupSize++;
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._itemRemoved
			//
			_itemRemoved: function (event) {

				var groupKey = event.detail.item.groupKey;
				var groupItem = this._groupItems[groupKey];
				var groupIndex = this._groupKeys.indexOf(groupKey);

				// Is this the last item in the group?  If so, delete the group
				if (groupItem.groupSize == 1) {

					// Remove the group from the list of group keys and delete it
					this._groupKeys.splice(groupIndex, 1);
					delete this._groupItems[groupKey];

					// Notify any listeners that this group has been removed
					this._notifyItemRemoved(groupKey, groupIndex, groupItem.data, groupItem);

				} else {

					// One less item in the group.
					groupItem.groupSize--;

					// There are still more items in this group; notify any listeners that this group has changed but not been removed
					this._notifyItemChanged(groupKey, groupIndex, groupItem.data, groupItem.data, groupItem, groupItem);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.GroupsListProjection._sortKeys
			//
			_sortKeys: function () {
				var that = this;
				this._groupKeys.sort(function (left, right) {
					if (left < right) return -1;
					if (left == right) return 0;
					return 1;
				});
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.length
			//
			length: {
				get: function () {
					return this._groupKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.getItem
			//
			getItem: function (index) {
				var key = this._groupKeys[index];
				return this.getItemFromKey(key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.GroupsListProjection.getItemFromKey
			//
			getItemFromKey: function (key) {
				// TODO: wuff.  Need to store index or something instead.
				for (var i in this._groupItems)
					if (this._groupItems[i].key == key)
						return this._groupItems[i];

				// Key not found
				return null;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.GroupsListProjection.indexOfKey
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920305.aspx
			//
			indexOfKey: function (key) {

				return this._groupKeys.indexOf(key);
			}
		})
});

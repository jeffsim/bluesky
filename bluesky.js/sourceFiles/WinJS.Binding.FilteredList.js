WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.FilteredList
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh920299.aspx
	//
	FilteredListProjection: WinJS.Class.derive(WinJS.Binding._ListProjection,

		// ================================================================
		//
		// private function: WinJS.Binding.FilteredListProjection constructor
		//
		//		NOTE: Not called directly, but rather as a part of list.createFiltered
		//
		function (sourceList, inclusionCallback) {

			// Keep track of our filtered set of keys
			this._filteredKeys = [];

			this._list = sourceList;
			this._currentKey = 0;

			// Store the callback to determine inclusion
			this._inclusionCallback = inclusionCallback;

			// Iterate over the items in this list; if the item is chosen for inclusion, then add it to the filtered list of keys
			for (var i = 0; i < sourceList.length ; i++) {

				var item = sourceList.getItem(i);
				if (inclusionCallback(item.data))
					this._filteredKeys.push(item.key);
			}

			// Initialize the set of event listeners
			this._eventListeners = [];

			// Listen for changes on our source list
			this._list.addEventListener("iteminserted", this._itemInserted.bind(this));
			this._list.addEventListener("itemremoved", this._itemRemoved.bind(this));
			this._list.addEventListener("itemchanged", this._itemChanged.bind(this));
			//	NYI:	sourceList.addEventListener("itemmoved", this._itemMoved.bind(this));
			//	NYI:	sourceList.addEventListener("itemmutated", this._itemMutated.bind(this));
			//	NYI:	sourceList.addEventListener("reload", this._reload.bind(this));

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list

			// TODO: Not sure what to bind to here.
			this.dataSource = WinJS.Binding.as(this._filteredKeys);
			this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.FilteredList members
		// ================================================================

		{
			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.indexOf
			//
			indexOf: function (item) {
				return this._filteredKeys.indexOf(item.key);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.length
			//
			length: {
				get: function () {
					return this._filteredKeys.length;
				}
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.getItem
			//
			getItem: function (index) {
				return this.getItemFromKey(this._filteredKeys[index]);
			},


			// ================================================================
			//
			// public override function: WinJS.Binding.FilteredList.getItemFromKey
			//
			getItemFromKey: function (key) {
				return this._list.getItemFromKey(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._spliceAtKey
			//
			//		Performs a splice starting at the specified key
			//
			_spliceAtKey: function (key, howMany) {

				// Add in any new items.
				if (arguments.length > 2) {

					// Convert arguments to an Array (Thank you MDN! https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments)
					var args = Array.prototype.slice.call(arguments);

					// We're just inserting at this point, so set howMany to zero
					args[1] = 0;

					// Call splice on our source list, using apply to pass the args
					this._list._spliceAtKey.apply(this._list, args);
				}

				// Remove '#howMany' items. 
				var removedItems = [];
				if (howMany) {

					// Create the list of keys to remove
					var removedKeys = [];
					var filteredKeyIndex = this._filteredKeys.indexOf(key);
					var lastIndexToRemove = this._filteredKeys.length && (i - filteredKeyIndex) < howMany;
					for (var i = filteredKeyIndex; i < lastIndexToRemove; i++) {
						removedKeys.push(this._filteredKeys[i]);
					}

					// Now, remove the keys
					var thatList = this._list;
					removedKeys.forEach(function (key) {

						// Since this is a projection we need to iterate over the list rather than doing one big splice.
						// Also add the removed item to the list of items to return
						removedItems.push(thatList._spliceAtKey(key, 1)[0]);
					});
				}

				return removedItems;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.FilteredList.setAt
			//
			//		MSDN: TODO
			//
			setAt: function (index, value) {

				var keyIndex = this._list.indexOfKey(this._filteredKeys[index]);
				this._list.setAt(keyIndex, value);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.FilteredList.indexOfKey
			//
			//		MSDN: TODO
			//
			indexOfKey: function (key) {
				return this._filteredKeys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemInserted
			//
			//		Event callback - this function is called when an item is added to the list to which we are attached.
			//
			_itemInserted: function (eventData) {

				if (this._inclusionCallback(eventData.detail.value)) {

					// We want to insert the key at the right position; to do that, we look for the last index of the
					// previous item in the source list, and insert after that item.
					// TODO: This iteration is painful; possibly keep a map, but the management of is more painful than
					// I want to tackle right now (for a perf opt.).
					var previousKey;
					var index = eventData.detail.index;
					while ((--index) >= 0) {
						var item = this._list.getItem(index);
						if (item && this._inclusionCallback(item.data)) {
							previousKey = item.key;
							break;
						}
					}
					var targetIndex = previousKey !== undefined ? (this._filteredKeys.indexOf(previousKey) + 1) : 0;

					this._filteredKeys.splice(targetIndex, 0, eventData.detail.key);

					// Propagate the event.  Set the index to where we dropped the item
					var newEventDetail = {
						value: eventData.detail.value,
						key: eventData.detail.key,
						index: targetIndex
					};
					this._notifyItemInserted(newEventDetail);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemRemoved
			//
			//		Event callback - this function is called when an item is removed from the list to which we are attached.
			//
			_itemRemoved: function (eventData) {
				// Update the list of filtered keys
				var key = eventData.detail.key;
				var index = this._filteredKeys.indexOf(key);
				if (index >= 0) {
					this._filteredKeys.splice(index, 1);

					// Propagate the event
					this._notifyItemRemoved(eventData.detail);
				}
			},


			// ================================================================
			//
			// private function: WinJS.Binding.FilteredList._itemChanged
			//
			//		Event callback - this function is called when an item is changed in the list to which we are attached.
			//
			_itemChanged: function (eventData) {

				// nothing to do - just propagate the changed event to anyone listening to us.
				this._notifyItemChanged(eventData.detail);
			},
		})
});
WinJS.Namespace.define("WinJS.Binding", {

	// ================================================================
	//
	// public Object: WinJS.Binding.List
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700774.aspx
	//
	List: WinJS.Class.derive(WinJS.Binding._ModifiableListBase,

		// ================================================================
		//
		// public function: WinJS.Binding.List constructor
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700764.aspx
		//
		function (list, options) {

			// initialize the set of event listeners
			this._eventListeners = [];

			// Initialize our value set and key array
			this._items = {};
			this._keys = [];
			this._currentKey = 0;

			// If caller specified values with which to pre-populate this list, then do so now.  Note that
			// we do not trigger item insertion in the initialization scenario.
			if (list) {
				for (var i = 0; i < list.length; i++) {
					this._addValue(list[i]);
				}
			}


			if (options) {
				WinJS.UI.setOptions(options);
			}

			// initialize our dataSource by creating a binding Source object around our items.  Other components (e.g. ListView)
			// can subscribe to this dataSource as their item list, and will get notified of updates to the list

			// TODO: Apply same final solution to other List types
			this.dataSource = new WinJS.UI.IListDataSource(this, this._items);
			//WinJS.Binding.as(this._items);
			//this.dataSource._list = this;
		},

		// ================================================================
		// WinJS.Binding.List members
		// ================================================================

		{
			// ================================================================
			//
			// public function: WinJS.Binding.List.splice
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700810.aspx
			//
			splice: function (index, amount, item) {

				var removedItems = [];
				if (index < 0)
					index += this.length;

				// Remove 'amount' items starting at index 'index'
				while (amount > 0) {

					// Get the key and value at the current index
					var key = this._keys[index];
					/*DEBUG*/
					if (!this._items[key])
						console.warn(key + " key specified in List.splice");
					/*ENDDEBUG*/

					var removedItem = this._items[key];
					var removedValue = removedItem.data;

					// Do the removal from our list
					this._keys.splice(index, 1);

					// Track the removed items
					removedItems.push(removedValue);

					// Notify any listeners of the removal
					this._notifyItemRemoved({ key: key, value: removedValue, item: removedItem, index: index });

					// Delete the actual item
					delete this._items[key];

					// One less to remove...
					amount--;
				}

				// If caller specified items to insert in place of the spliced items, then insert them now
				if (arguments.length > 2) {

					for (var i = 2; i < arguments.length; i++) {

						// Get the item to add from the argumnet list
						var itemToAdd = arguments[i];

						// If user specified binding in options in the List constructor, then call as on all element values.
						if (this.binding)
							value = WinJS.Binding.as(value);

						// Determine the position at which to insert the item
						var pos = Math.min(index + i - 2, this.length);

						// Get a new unique key for the item we're adding
						var itemKey = this._getNewKey();

						// Generate the key/value pair that we'll store in our list and store it
						this._items[itemKey] = {
							key: itemKey,
							data: itemToAdd,
							index: pos
						};
						this._keys.splice(pos, 0, itemKey);

						// Notify any listeners of the addition
						this._notifyItemInserted({ key: itemKey, index: pos, value: itemToAdd });
					}
				}

				// Update the indices of items after the spliced items
				for (var i = index; i < this.length; i++) {
					this.getItem(i).index = i;
				}

				return removedItems;
			},


			// ================================================================
			//
			// private function: WinJS.Binding.List._spliceAtKey
			//
			//		Performs a splice starting at the specified key
			//
			_spliceAtKey: function (key, howMany) {

				var args = Array.prototype.slice.call(arguments);

				// Replace key with the index of key within this list
				args[0] = this._keys.indexOf(key);

				// Perform the splice
				return this.splice.apply(this, args);
			},


		    // ================================================================
		    //
		    // public function: WinJS.Binding.List.shift
		    //
		    //		MSDN: TODO
		    //
			shift: function () {

			    // TODO: Add test for List.shift
			    return this.splice(0, 1)[0];
			},


		    // ================================================================
		    //
		    // public function: WinJS.Binding.List.unshift
		    //
		    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700814.aspx
		    //
			unshift: function (value) {

			    // TODO: Add test for List.unshift
			    this.splice(0, 0, value);

			    return this.length;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.indexOfKey
			//
			//		MSDN: TODO
			//
			indexOfKey: function (key) {

				return this._keys.indexOf(key);
			},


			// ================================================================
			//
			// private function: WinJS.Binding.List._addValue
			//
			//		Adds a value to the list, storing a key/value pair
			//
			_addValue: function (value) {

				// Get a new unique key for the item we're adding
				var valueKey = this._getNewKey();

				// If user specified binding in options in the List constructor, then call as on all element values
				if (this.binding)
					value = WinJS.Binding.as(value);

				// Generate the key/value pair that we'll store in our list and store it
				this._items[valueKey] = {
					key: valueKey,
					data: value,
					index: this._keys.length
				};
				this._keys.push(valueKey);

				// Return the key/value pair
				return valueKey;
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.setAt
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700796.aspx
			//
			setAt: function (index, value) {

				if (index == this.length) {
					// Index is setting at the end - just do a push
					this.push(value);

				} else if (index < this.length) {

						// If user specified binding in options in the List constructor, then call as on all element values.
					if (this.binding)
						value = WinJS.Binding.as(value);

					var key = this._keys[index];
					var prevItem = this._items[key];
					var newItem = WinJS.Binding._ListBase.copyItem(prevItem);
					newItem.data = value;
					newItem.index = index;
					this._items[key] = newItem;
					/*
					{
						key: prevItem.key,
						data: value,
						index: index
					};*/

					// Notify any listeners of the change
					this._notifyItemChanged({
						key: key,
						index: index,
						oldValue: prevItem.data,
						newValue: value,
						oldItem: prevItem,
						newItem: newItem
					});
				}
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.length
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700762.aspx
			//
			length: {
				// Get the length of this list
				get: function () {
					return this._keys.length;
				},

				// Set the length of this list
				set: function (newLength) {
					if (newLength < this._keys.length)
						this.splice(newLength, this._keys.length - newLength);
					// TODO: what if > ?
				}
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.getItem
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700753.aspx
			//
			getItem: function (index) {

				/*DEBUG*/
				if (index === undefined || index > this.length)
					console.warn("WinJS.Binding.List.getItem: Invalid index (" + index + ") specified - Undefined or longer than list length (" + this.length + ")");
				/*ENDDEBUG*/

				// Get the key/value pair at the specified index
				return this.getItemFromKey(this._keys[index]);
			},


			// ================================================================
			//
			// public function: WinJS.Binding.List.getItemFromKey
			//
			//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700750.aspx
			//		
			getItemFromKey: function (key) {
				// Return the key/value pair for the item with the specified key
				return this._items[key];
			}
		})
});
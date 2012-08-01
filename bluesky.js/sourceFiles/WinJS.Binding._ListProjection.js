WinJS.Namespace.define("WinJS.Binding", {

	_ListProjection: WinJS.Class.derive(WinJS.Binding._ModifiableListBase, null, {

		// ================================================================
		//
		// public function: WinJS.Binding.List.getItemFromKey
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700750.aspx
		//		
		getItemFromKey: function (key) {
			// Return the key/value pair for the item with the specified key
			return this._list._items[key];
		},

		// ================================================================
		//
		// public function: WinJS.Binding.List.splice
		//
		//		MSDN: TODO
		//	
		splice: function (index, howMany, item) {

			// Convert arguments to an Array (Thank you MDN! https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments)
			var args = Array.prototype.slice.call(arguments);

			if (index == this.length || index == -1) {
				args[0] = this._list.length - 1;
				return this._list.splice.apply(this._list, args);
			} else {

				// We actually want to splice into our source list at the item which is at *our* index
				args[0] = this.getItem(index).key;

				// Call splice on our source list, using apply to pass the args
				return this._spliceAtKey.apply(this, args);
			}
		}
	})
});
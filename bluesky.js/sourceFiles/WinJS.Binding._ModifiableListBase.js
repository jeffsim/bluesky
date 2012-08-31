WinJS.Namespace.define("WinJS.Binding", {

	// shouldn't be constructed outside of bluesky.js
	_ModifiableListBase: WinJS.Class.derive(WinJS.Binding._ListBase, null, {

		// ================================================================
		//
		// public function: WinJS.Binding.List.push
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700779.aspx
		//
		push: function (value) {

			// Add the value to our list of values
			var valueKey = this._addValue(value);

			// Notify any listeners of the insertion
			this._notifyItemInserted({ key: valueKey, index: this.length, value: value });
		},


	    // ================================================================
	    //
	    // public function: WinJS.Binding.List.dispose
	    //
	    //		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh921598.aspx
	    //
		dispose: function () {
		    // TODO: Anything to do here?
		},


		// ================================================================
		//
		// public function: WinJS.Binding.List.splice
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/hh700776.aspx
		//
		pop: function () {

			// Return the last item in our list
			var poppedValues = this.splice(-1, 1);
			if (poppedValues && poppedValues.length >= 1)
				return poppedValues[0];
			return null;
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

		// TODO: Add unshift

		// ================================================================
		//
		// private function: WinJS.Binding.List._getNewKey
		//
		//		Returns a unique (for this list) key 
		//
		_getNewKey: function () {

			// Get a unique (for this list) key and ensure the next key gotten is unique
			return this._currentKey++;
		},


	}),
});
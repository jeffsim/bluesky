/*DEBUG*/
// verify app included jQuery
if (!jQuery) {
    console.error("Bluesky requires jQuery.  Please include it prior to referencing bluesky.js");
}

// Verify known version of jQuery is used.
if ($().jquery != "1.7.2") {
    console.warn("this version of Bluesky.js was tested against jQuery v1.7.2; this app uses v" + $().jquery + ".  Consider changing to 1.7.2 if you encounter unexpected issues.");
}
/*ENDDEBUG*/

// ================================================================
//
// WinJS
//
// Root WinJS namespace
//
var WinJS = {

	// ================================================================
	//
	// public Object: WinJS.Namespace
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212652.aspx
	//
	Namespace: {

		// ================================================================
		//
		// public Function: Namespace.define
		//
		//		Defines a new namespace with the specified name.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212667.aspx
		//
		define: function (name, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!name)
				console.error("WinJS.Namespace.define: null or undefined 'name' specified.");
			if (!members)
				console.error("WinJS.Namespace.define: null or undefined 'members' specified.");
			/*ENDDEBUG*/

			return this.defineWithParent(window, name, members);
		},


		// ================================================================
		//
		// public Function: Namespace.defineWithParent
		//
		//		Defines a new namespace with the specified name under the specified parent namespace
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br212665.aspx
		//
		defineWithParent: function (parent, name, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!parent)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'parent' specified.");
			if (!name)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'name' specified.");
			if (!members)
				console.error("WinJS.Namespace.defineWithParent: null or undefined 'members' specified.");
			/*ENDDEBUG*/

			var currentNamespace = parent;

			// Caller can specify multiple depth namespace as the parent; we verify that each part exists and create them if they don't
			var namespaceFragments = name.split(".");
			for (var i = 0, len = namespaceFragments.length; i < len; i++) {

				// Grab the ith level namespace fragment.
				var namespaceName = namespaceFragments[i];

				// Does the fragment existing in the current namespace?
				if (!currentNamespace[namespaceName]) {
					Object.defineProperty(currentNamespace, namespaceName, {

						// Initialize the namespace as empty
						value: {},

						// Do not allow the namespace name to be assigned
						writable: false,

						// Allow the namespace to be enumerated
						enumerable: true,

						// Allow the namespace to be removed and it's attributes (other than writable) to be changed.
						configurable: true
					});
				}

				// Step into the fragment's namespace to continue
				currentNamespace = currentNamespace[namespaceName];
			}

			// If the caller specified any members, then initialize them now in the new namespace
			if (members)
				WinJS._initializeMembers(currentNamespace, members);

			// Return the new namespace
			return currentNamespace;
		}
	},


	// ================================================================
	//
	// public Object: WinJS.Class
	//
	//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229776.aspx
	//
	Class: {

		// ================================================================
		//
		// public Function: Class.define
		//
		//		Defines a class using the given constructor and the specified instance members
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229813.aspx
		//
		define: function (constructor, instanceMembers, staticMembers) {

			// Allow empty constructors
			constructor = constructor || function () { };

			// Add per-instance members to the constructor's prototype.
			if (instanceMembers)
				WinJS._initializeMembers(constructor.prototype, instanceMembers);

			// Add static members to the constructor
			if (staticMembers)
				WinJS._initializeMembers(constructor, staticMembers);

			// Return the constructor
			return constructor;
		},


		// ================================================================
		//
		// public Function: Class.derive
		//
		//		Creates a sub-class based on the specified baseClass parameter, using prototype inheritance.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229815.aspx
		//
		derive: function (baseClass, constructor, instanceMembers, staticMembers) {
			/*DEBUG*/
			// Perform parameter validation
			if (!baseClass)
				console.error("WinJS.Class.derive: null or undefined 'baseClass' specified.");
			/*ENDDEBUG*/

			// Allow empty constructors
			constructor = constructor || function () { };

			// Create the new class (in JS, constructor) from the specified base class
			constructor.prototype = Object.create(baseClass.prototype);

			// Set the constructor function on the newly created prototype
			Object.defineProperty(constructor.prototype, "constructor", { value: constructor });

			// Add the specified per-instance and static members to the constructor
			WinJS.Class.define(constructor, instanceMembers, staticMembers);

			// Return the constructor
			return constructor;
		},


		// ================================================================
		//
		// public Function: Class.mix
		//
		//		Defines a class using the given constructor and the union of the set of instance
		//		members specified by all the mixin objects. The mixin parameter list is of variable length.
		//
		//		MSDN: http://msdn.microsoft.com/en-us/library/windows/apps/br229836.aspx
		//
		//		TODO: Win8 SDK docs look incorrect.  Revisit this function when they fix them.
		//
		mix: function (constructor, members) {
			/*DEBUG*/
			// Perform parameter validation
			if (!constructor)
				console.error("WinJS.Class.mix: null or undefined 'constructor' specified.");
			/*ENDDEBUG*/

			// Add per-instance members to the constructor's prototype.
			if (members)
				WinJS._initializeMembers(constructor.prototype, members);

			// Return the constructor
			return constructor;
		}
	},


	// ================================================================
	//
	// private function: WinJS._initializeMembers
	//
	//		Extends the target object to include the specified members
	//
	//		TODO: Consider pulling this (and all other private '_' functions) out of the namespaces and into the local file's namespace
	//
	_initializeMembers: function (target, members) {
		/*DEBUG*/
		// Perform parameter validation
		if (!target)
			console.error("WinJS._initializeMembers: null or undefined 'target' specified.");
		/*ENDDEBUG*/

		var properties = {};

		// Enumerate over the specified set of members
		for (var memberKey in members) {

			var member = members[memberKey];
			if (member == null)
				continue;

			// allow the member to show in for..in loops
			member.enumerable = true;

			// Getters and setters are managed as regular properties
			if (typeof member === "object" && (typeof member.get === "function" || typeof member.set === "function")) {

				// Add the member to the list of properties (which we'll set below)
				properties[memberKey] = member;
			} else {

				// Add the member directly to the target object
				target[memberKey] = member;
			}
		}

		// If any getters/setters were specified, then add them now
		if (properties != {})
			Object.defineProperties(target, properties);
	},


	// ================================================================
	//
	// WinJS.strictProcessing
	//
	//		TODO: Stubbed out for now
	//
	//		NYI NYI NYI
    //
    _strictProcessing: false,
	strictProcessing: function () {

        // NOTE: THIS FUNCTION HAS BEEN DEPRECATED.  Remove after Win8 RTM
	    this._strictProcessing = true;
	},

};
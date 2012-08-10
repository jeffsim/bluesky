// ================================================================
//
// WinJS
//
// Root WinJS namespace
WinJS = {

    // ================================================================
    //
    // WinJS.Namespace namespace
    //
    Namespace: {

        define: function (name, members) {

            return this.defineWithParent(window, name, members);
        },

        defineWithParent: function (parent, name, members) {
            var currentNamespace = parent;
            var namespaceFragments = name.split(".");

            for (var i = 0, len = namespaceFragments.length; i < len; i++) {
                var namespaceName = namespaceFragments[i];
                if (!currentNamespace[namespaceName]) {
                    //currentNamespace[namespaceName] = {};
                    Object.defineProperty(currentNamespace, namespaceName,
                        { value: {}, writable: false, enumerable: true, configurable: true }
                    );
                }
                currentNamespace = currentNamespace[namespaceName];
            }

            if (members) {
                WinJS._initializeMembers(currentNamespace, members);
            }

            return currentNamespace;
        }
    },

    // ================================================================
    //
    // WinJS.strictProcessing
    //
    // NYI NYI NYI
    //
    strictProcessing: function() {
    },

    // ================================================================
    //
    // WinJS.Class namespace
    //
    Class: {

        define: function (constructor, instanceMembers, staticMembers) {

            // Add per-instance members to the constructor's prototype.
            if (instanceMembers)
                WinJS._initializeMembers(constructor.prototype, instanceMembers);

            if (staticMembers)
                WinJS._initializeMembers(constructor, staticMembers);

            return constructor;
        },

        // tbd: refactor
        derive: function (baseClass, constructor, instanceMembers, staticMembers) {

            constructor.prototype = Object.create(baseClass.prototype);
            Object.defineProperty(constructor.prototype, "_super", { value: baseClass.prototype });
            Object.defineProperty(constructor.prototype, "constructor", { value: constructor });
            if (instanceMembers)
                WinJS._initializeMembers(constructor.prototype, instanceMembers);

            if (staticMembers)
                WinJS._initializeMembers(constructor, staticMembers);

            return constructor;
        }
    },


    // ================================================================
    //
    // Internal function: WinJS._initializeMembers
    //
    // Extends the target object to include the specified members
    _initializeMembers: function (target, members) {

        var properties = {};

        for (var memberKey in members) {
            var member = members[memberKey];

            // Getters and setters and managed as regular properties
            if (member != null && typeof member === "object" && (typeof member.get === "function" || typeof member.set === "function"))
                properties[memberKey] = member;
            else
                target[memberKey] = member;
        }

        // If any getters/setters were specified, then add them now
        if (properties)
            Object.defineProperties(target, properties);
    },


    // ================================================================
    //
    // WinJS.xhr
    //
    xhr: function (uri) {
        var p = new WinJS.Promise(function (pageLoadCompletedCallback, errorCallback, progressCallback) {

            $.get(uri.url, function (response, status, req) {
                //  console.log('xhr gotten', response, status, req);
                pageLoadCompletedCallback(p, req);
            });
        });
        return p;
    }
};

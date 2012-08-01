"use strict";

// ================================================================
//
// Test.WinJS.js
//		Tests for the top-level WinJS object
//
//	TESTS TO ADD:
//		Class.define with getters and setters
//		Validate member attributes (writable, configurable, enumerable) of defined and derived namespaces and classes

// Add our tests into the test harness's list of tests
testHarness.addTestFile("WinJS Tests", {

	// ==========================================================================
	// 
	// Test Namespace.define functionality
	//
	namespaceDefine: function (test) {

		test.start("Namespace.define functionality tests");

		var testNamespace = "TestNS";
		WinJS.Namespace.define(testNamespace, {
			member1: 100,
			member2: "Hello"
		});

		// Verify that the namespace and members exist
		test.assert(TestNS.member1 && TestNS.member1 == 100, "Failed to initialize TestNS.member1");
		test.assert(TestNS.member2 && TestNS.member2 == "Hello", "Failed to initialize TestNS.member2");

		// Next test multiple-depth namespace
		WinJS.Namespace.define("TestA.TestB.TestC.TestD", {
			member1: 100
		});

		// Verify that the namespace and members exist
		test.assert(TestA.TestB.TestC.TestD.member1 == 100, "Failed to initialize TestA.TestB.TestC.TestD.member1");
	},


	// ==========================================================================
	// 
	// Test Namespace.defineWithParent functionality
	//
	namespaceDefineWithParent: function (test) {

		test.start("Namespace.defineWithParent functionality tests");

		var testNamespace = "nsdwpTestNS1";
		WinJS.Namespace.define(testNamespace, {
			member1: 100,
			member2: "Hello"
		});

		var testNamespace2 = "nsdwpTestNS2";
		WinJS.Namespace.defineWithParent(nsdwpTestNS1, testNamespace2, {
			member3: 300,
			member4: "World"
		});

		// Verify that the namespace and members exist
		test.assert(nsdwpTestNS1.nsdwpTestNS2.member3 == 300, "Failed to initialize nsdwpTestNS1.nsdwpTestNS2.member3");
		test.assert(nsdwpTestNS1.nsdwpTestNS2.member4 == "World", "Failed to initialize nsdwpTestNS1.nsdwpTestNS2.member4");

		// Next test multiple-depth namespace
		var testNamespace2 = "TestA.TestB.TestC.TestD";
		WinJS.Namespace.defineWithParent(nsdwpTestNS1.nsdwpTestNS2, testNamespace2, {
			member3: 300,
			member4: "World"
		});

		// Verify that the namespace and members exist
		test.assert(nsdwpTestNS1.nsdwpTestNS2.TestA.TestB.TestC.TestD.member3 == 300, "Failed to initialize TestA.TestB.TestC.TestD.member1");
	},


	// ==========================================================================
	// 
	// Test Class.define functionality
	//
	classDefine: function (test) {

		test.start("Class.define functionality tests");

		// First test with instance members
		var TestClass1 = WinJS.Class.define(function () {
			// constructor
			this.testVal = 100;
		},
		// instance members
		{
			testVal: 50
		});

		var test1 = new TestClass1();

		// Verify that the class was created
		test.assert(test1.testVal == 100, "Failed to initialize test1.testVal");

		// now test with static members
		var TestClass2 = WinJS.Class.define(function () { }, { },
		// static members
		{
			testVal2: 25
		});

		// Verify that the static member exists on the test class
		test.assert(TestClass2.testVal2 == 25, "Failed to initialize static member variables properly");

		// Now test with getters and setters (which Class.define handles differently)
		var TestClass3 = WinJS.Class.define(function () {
		},
		{
			testVal: 25,
			getSetTest: {
				get: function () {
					return this.testVal;
				},
				set: function (newVal) {
					this.testVal = newVal;
				}
			}
		});

		var test3 = new TestClass3();
		test.assert(test3.getSetTest == 25, "Failed to initialize getter");

		test3.getSetTest = 40;
		test.assert(test3.getSetTest == 40, "Failed to initialize setter");
	},


	// ==========================================================================
	// 
	// Test Class.derive functionality
	//
	classDerive: function (test) {

		test.start("Class.derive functionality tests");

		var TestClass1 = WinJS.Class.define(function () { },
		// instance members
		{
			testVal: 50
		});

		var TestClass2 = WinJS.Class.derive(TestClass1, function () { },
		// instance members
		{
			testVal2: 60
		});

		var testObject = new TestClass2();

		// Verify that the class was created
		test.assert(testObject.testVal == 50 && testObject.testVal2 == 60, "Failed to initialize testObject");

		// Now test with static members
		var TestClass3 = WinJS.Class.define(function () { }, { },
		// static members
		{
			testVal2: 25
		});

		var TestClass4 = WinJS.Class.derive(TestClass3, function () { }, {},
		// static members
		{
			testVal4: 25
		});

		var testObject = new TestClass4();

		// Verify that the static member exists on the test class
		test.assert(TestClass4.testVal4 == 25, "Failed to initialize static member variables properly");

		// NOTE: Win8's WinJS.Class.derive does not bring static members from the baseClass into the derived class; I haven't thought 
		// through yet if that's expected or not, but for the time being our WinJS.Class.derive does the same thing.  If Win8 later
		// changes this, then uncomment the code below to test that static variables are inherited from baseClasses
		// test.assert(TestClass4.testVal2 == 25, "Failed to inherit static member from base class");
	},
	

	// ==========================================================================
	// 
	// Test Class.mix functionality
	//
	classMix: function (test) {

		test.start("Class.mix functionality tests");

		var TestClass1 = WinJS.Class.define(function () { },
		// instance members
		{
			testVal: 50
		});

		// mix in some more members into the test class
		WinJS.Class.mix(TestClass1, {
			testVal2: 75
		});

		var test1 = new TestClass1();

		// Verify that the mixed-in members are present
		test.assert(test1.testVal == 50 && test1.testVal2 == 75, "Failed to mix-in members into test1.testVal");
	}
});
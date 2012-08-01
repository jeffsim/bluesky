# bluesky Tests

This folder contains tests which verify that bluesky is working as expected.

At the time of this writing, 114/118 tests are passing on bluesky (tested on IE9, FF13, and Chrome).  The test project can also run on Win8 with WinJS (to verify that the tests themselves are working as expected) - 116/118 tests are currently passing there.

## About the Test project
BlueskyTests.sln contains one set of Test files and two projects which reference them; one project includes the bluesky scripts and tests bluesky (and runs on either Win7 or Win8); the other project includes the WinJS scripts and tests the Tests themselves (yo, dawg).  The latter  project only runs on Win8 as it is a regular Metro app.  

To run the tests, open up the BlueskyTests solution in Visual studio, select the project you wish to test as the 'startup project', and hit F5.  

## How to see the Tests in action without downloading anything
You can run the Tests by browsing to here: http://tests.bluesky.io/testharness/testharness.html.
